// Builds src/components/mapData.ts from Natural Earth (public domain).
// node mapa-make.js <out mapData.ts> [folder with the ne_10m_*.geojson files]
// 12-11-2026: the whole of India (the South for Mahāprabhu's journey), not only the North and Bengal.
const fs = require("fs");
const path = require("path");
const dir = process.argv[3] || __dirname;
const out = process.argv[2];
const [W, E, S, N] = [66.5, 97.5, 5.5, 33];
const load = (f) => JSON.parse(fs.readFileSync(path.join(dir, f + ".geojson"), "utf8"));
const inb = ([x, y]) => x >= W && x <= E && y >= S && y <= N;

function dp(pts, tol) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const st = [[0, pts.length - 1]];
  while (st.length) {
    const [a, b] = st.pop();
    const [ax, ay] = pts[a], [bx, by] = pts[b];
    const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1e-12;
    let m = -1, md = 0;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs(dy * (pts[i][0] - ax) - dx * (pts[i][1] - ay)) / L;
      if (d > md) (md = d), (m = i);
    }
    if (md > tol) (keep[m] = 1), st.push([a, m], [m, b]);
  }
  return pts.filter((_, i) => keep[i]);
}

// Sutherland–Hodgman against the box
function clipRing(ring) {
  const edges = [
    (p) => p[0] >= W, (p) => p[0] <= E, (p) => p[1] >= S, (p) => p[1] <= N,
  ];
  const cut = [
    (a, b) => [W, a[1] + ((b[1] - a[1]) * (W - a[0])) / (b[0] - a[0])],
    (a, b) => [E, a[1] + ((b[1] - a[1]) * (E - a[0])) / (b[0] - a[0])],
    (a, b) => [a[0] + ((b[0] - a[0]) * (S - a[1])) / (b[1] - a[1]), S],
    (a, b) => [a[0] + ((b[0] - a[0]) * (N - a[1])) / (b[1] - a[1]), N],
  ];
  let r = ring;
  for (let k = 0; k < 4; k++) {
    const o = [];
    for (let i = 0; i < r.length; i++) {
      const a = r[i], b = r[(i + 1) % r.length];
      const ia = edges[k](a), ib = edges[k](b);
      if (ia) o.push(a);
      if (ia !== ib) o.push(cut[k](a, b));
    }
    r = o;
    if (!r.length) break;
  }
  return r;
}

// lines: the pieces inside the box (one point beyond each end, to reach the edge)
function clipLine(l) {
  const parts = [];
  let cur = [];
  l.forEach((p, i) => {
    const near = inb(p) || (l[i - 1] && inb(l[i - 1])) || (l[i + 1] && inb(l[i + 1]));
    if (near) cur.push(p);
    else if (cur.length) parts.push(cur), (cur = []);
  });
  if (cur.length) parts.push(cur);
  return parts.filter((x) => x.length > 1);
}

// "x,y x,y…" in hundredths of a degree, each point relative to the one before
function enc(pts) {
  let px = 0, py = 0;
  return pts
    .map(([x, y]) => {
      const X = Math.round(x * 100), Y = Math.round(y * 100);
      const s = `${X - px},${Y - py}`;
      (px = X), (py = Y);
      return s;
    })
    .join(" ");
}
const polys = (g) => (g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : []);
const lines = (g) => (g.type === "LineString" ? [g.coordinates] : g.type === "MultiLineString" ? g.coordinates : []);

const land = [];
for (const f of load("ne_10m_land").features)
  for (const poly of polys(f.geometry))
    for (const ring of poly) {
      const c = dp(clipRing(ring), 0.005);
      if (c.length > 3) land.push(enc(c));
    }

const lakes = [];
for (const f of load("ne_10m_lakes").features)
  for (const poly of polys(f.geometry)) {
    const c = dp(clipRing(poly[0]), 0.01);
    if (c.length > 3) lakes.push(enc(c));
  }

const borders = [];
for (const f of load("ne_10m_admin_0_boundary_lines_land").features)
  for (const l of lines(f.geometry)) for (const part of clipLine(l)) borders.push(enc(dp(part, 0.008)));

const states = [];
for (const f of load("ne_10m_admin_1_states_provinces_lines").features) {
  if (!["IND", "BGD"].includes(f.properties.ADM0_A3)) continue;
  for (const l of lines(f.geometry)) for (const part of clipLine(l)) states.push(enc(dp(part, 0.01)));
}

// rivers: [width class, line]; the big ones wider
const rivers = [];
for (const f of load("ne_10m_rivers_lake_centerlines").features) {
  const r = f.properties.scalerank;
  if (r > 8) continue;
  const w = r <= 3 ? 2 : r <= 6 ? 1 : 0;
  for (const l of lines(f.geometry)) for (const part of clipLine(l)) rivers.push([w, enc(dp(part, 0.004))]);
}

const ts = `// The map's background: land, lakes, borders and rivers of India (and around it),
// from Natural Earth (public domain), made by a script once. Each line is
// "x,y x,y…" in hundredths of a degree (longitude, latitude), each point relative
// to the one before.
/* eslint-disable */
export const LAND: string[] = ${JSON.stringify(land)};
export const LAKES: string[] = ${JSON.stringify(lakes)};
export const BORDERS: string[] = ${JSON.stringify(borders)};
export const STATES: string[] = ${JSON.stringify(states)};
/** [0 small · 1 middle · 2 big, line] */
export const RIVERS: [number, string][] = ${JSON.stringify(rivers)};
`;
fs.writeFileSync(out, ts);
console.log("bytes", ts.length, "land", land.length, "lakes", lakes.length, "borders", borders.length, "states", states.length, "rivers", rivers.length);
