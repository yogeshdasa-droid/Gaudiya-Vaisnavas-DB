import { useEffect, useMemo, useRef, useState } from "react";
import { save } from "@tauri-apps/plugin-dialog";
import { ArrowDown, ArrowRight, Download, Maximize, Network, ZoomIn, ZoomOut } from "lucide-react";
import { api, lineOfKind, Marks, PersonListItem, sortDisciples, TreeKind } from "../api";
import { T } from "../i18n";
import { possibleRepeats } from "./Review";
import { layoutTB, TB_ROW } from "./treeLayoutTB";

const W = 200; // box width (left to right)
const H = 30; // box height
const DX = 250; // from one generation to the next
const DY = 40; // from one line to the next
const ZOOM_MIN = 0.1;
const ZOOM_MAX = 2.5;

function stored<T extends string>(key: string, ok: readonly T[], def: T): T {
  try {
    const v = localStorage.getItem(key) as T | null;
    return v && ok.includes(v) ? v : def;
  } catch {
    return def;
  }
}
function storedZoom(): number {
  try {
    const z = Number(localStorage.getItem("bio.treeZoom"));
    return z >= ZOOM_MIN && z <= ZOOM_MAX ? z : 1;
  } catch {
    return 1;
  }
}
function store(key: string, v: string) {
  try {
    localStorage.setItem(key, v);
  } catch {
    /* storage unavailable */
  }
}

/** What the drawing shows: the whole tree, or only the dīkṣā or the śikṣā line. */
export type TreeLine = "all" | "diksa" | "siksa";
/** How it is drawn: guru on the left (as before) or on top (as a printed chart). */
export type TreeDir = "lr" | "tb";

/** For each record drawn: the guru it goes under (null: it starts a branch)
 *  and how they are related; and the other lines to draw. */
export function arrange(persons: PersonListItem[], line: TreeLine) {
  const inTree = persons.filter((p) => p.tree);
  const ids = new Set(inTree.map((p) => p.id));
  const treeParent = (p: PersonListItem) => (p.tree!.parent !== null && ids.has(p.tree!.parent) ? p.tree!.parent : null);
  // the guru in one line: its place in the tree, or one of its other gurus
  const guruOf = (p: PersonListItem, line: "diksa" | "siksa"): { guru: number; kind: TreeKind } | null => {
    const up = treeParent(p);
    if (up !== null && lineOfKind(p.tree!.kind) === line) return { guru: up, kind: p.tree!.kind };
    return p.links.find((l) => lineOfKind(l.kind) === line && ids.has(l.guru)) ?? null;
  };
  const under = new Map<number, { parent: number | null; kind: TreeKind | null }>();
  if (line === "all") {
    for (const p of inTree) under.set(p.id, { parent: treeParent(p), kind: treeParent(p) !== null ? p.tree!.kind : null });
  } else {
    const gurus = new Set<number>();
    for (const p of inTree) {
      const g = guruOf(p, line);
      if (g !== null) gurus.add(g.guru);
    }
    for (const p of inTree) {
      const g = guruOf(p, line);
      if (g !== null || gurus.has(p.id)) under.set(p.id, { parent: g?.guru ?? null, kind: g?.kind ?? null });
    }
    // the śikṣā line goes on through the gurus above (dīkṣā or not), so that it does not break
    if (line === "siksa") {
      const byId = new Map(inTree.map((p) => [p.id, p]));
      for (const id of [...under.keys()]) {
        let cur = byId.get(id)!;
        while (under.get(cur.id)!.parent === null) {
          const up = treeParent(cur);
          if (up === null) break;
          under.set(cur.id, { parent: up, kind: cur.tree!.kind });
          if (under.has(up)) break;
          under.set(up, { parent: null, kind: null });
          cur = byId.get(up)!;
        }
      }
    }
  }
  // other lines: the other gurus not used to place the record (in a line view, only of that kind),
  // and in the whole tree its relatives (family)
  const extras: { from: number; to: number; kind: TreeKind | "family"; note: string; disputed: boolean }[] = [];
  for (const p of inTree) {
    if (!under.has(p.id)) continue;
    const placed = under.get(p.id)!.parent;
    const others = [
      ...p.links.map((l) => ({ guru: l.guru, kind: l.kind as TreeKind | "family", note: l.note, disputed: l.disputed })),
      ...(treeParent(p) !== null ? [{ guru: treeParent(p)!, kind: p.tree!.kind as TreeKind | "family", note: p.tree!.note, disputed: p.tree!.disputed }] : []),
      ...(line === "all" ? p.family.map((f) => ({ guru: f.relative, kind: "family" as const, note: f.note, disputed: f.disputed })) : []),
    ];
    for (const o of others) {
      if (o.guru === placed || !under.has(o.guru) || (line !== "all" && o.kind !== "family" && lineOfKind(o.kind) !== line)) continue;
      if (!extras.some((x) => x.from === o.guru && x.to === p.id)) extras.push({ from: o.guru, to: p.id, kind: o.kind, note: o.note, disputed: o.disputed });
    }
  }
  return { under, extras };
}

/** A box drawn: a person, or (top to bottom) a list of leaf disciples of one guru. */
interface Node {
  key: string;
  x: number;
  y: number;
  w: number;
  h: number;
  p?: PersonListItem;
  items?: { p: PersonListItem; kind: TreeKind | null }[];
  /** relation with the guru it is drawn under */
  kind: TreeKind | null;
}
/** A line from a guru (or relative) to a disciple. */
interface Line {
  key: string;
  from: number;
  to: number;
  kind: TreeKind | "family";
  /** not the line it is placed by */
  extra: boolean;
  note: string;
  disputed: boolean;
  d: string;
  mx: number;
  my: number;
}
interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A cubic curve from (x1,y1) to (x2,y2) with control points c1 c2, and its middle (for the word on it). */
function curve(x1: number, y1: number, c1x: number, c1y: number, c2x: number, c2y: number, x2: number, y2: number) {
  return { d: `M${x1},${y1} C${c1x},${c1y} ${c2x},${c2y} ${x2},${y2}`, mx: (x1 + 3 * c1x + 3 * c2x + x2) / 8, my: (y1 + 3 * c1y + 3 * c2y + y2) / 8 };
}
/** Left to right: from the right side of the guru to the left side of the disciple. */
function pathLR(a: Rect, b: Rect) {
  const y1 = a.y + a.h / 2;
  const y2 = b.y + b.h / 2;
  // a guru in the same column as the disciple, or further right: an arc on the left
  if (a.x >= b.x) {
    const bend = 40 + Math.min(80, Math.abs(y2 - y1) / 4);
    return curve(a.x, y1, a.x - bend, y1, b.x - bend, y2, b.x, y2);
  }
  const x1 = a.x + a.w;
  const bend = Math.max(40, (b.x - x1) / 2);
  return curve(x1, y1, x1 + bend, y1, b.x - bend, y2, b.x, y2);
}
/** Top to bottom: from under the guru to above the disciple. */
function pathTB(a: Rect, b: Rect) {
  const x1 = a.x + a.w / 2;
  const x2 = b.x + b.w / 2;
  const y1 = a.y + a.h;
  if (b.y > y1 + 8) {
    const bend = Math.max(24, (b.y - y1) / 2);
    return curve(x1, y1, x1, y1 + bend, x2, b.y - bend, x2, b.y);
  }
  // a disciple on the same row or higher up: round under both
  const yb = b.y + b.h;
  const low = Math.max(y1, yb) + 40 + Math.min(80, Math.abs(x2 - x1) / 6);
  return curve(x1, y1, x1, low, x2, low, x2, yb);
}

/** The Guru Paramparā drawn: guru → disciples, left to right or top to bottom.
 *  A slider fades the dīkṣā line and brings out the śikṣā (and associate) relations. */
export function TreeView({
  t,
  persons,
  onPerson,
  marks,
  onMark,
  focus,
}: {
  t: T;
  persons: PersonListItem[];
  onPerson: (id: number) => void;
  marks: Marks;
  onMark: (id: number) => void;
  /** a record to bring to the middle and light up (from its ficha); n: a new request */
  focus?: { id: number; n: number };
}) {
  // 0 = only the dīkṣā Paramparā … 100 = the śikṣā relations stand out
  const [mix, setMix] = useState(0);
  // records that may be repeated: their names in red, as in the panel
  const [distinct, setDistinct] = useState<[number, number][]>([]);
  useEffect(() => void api.listDistinct().then(setDistinct, () => {}), [persons]);
  const repeats = useMemo(() => possibleRepeats(persons, distinct), [persons, distinct]);
  const [line, setLineState] = useState<TreeLine>(() => stored("bio.treeLine", ["all", "diksa", "siksa"] as const, "all"));
  const setLine = (l: TreeLine) => {
    setLineState(l);
    store("bio.treeLine", l);
  };
  const [dir, setDirState] = useState<TreeDir>(() => stored("bio.treeDir", ["lr", "tb"] as const, "lr"));
  const setDir = (d: TreeDir) => {
    setDirState(d);
    store("bio.treeDir", d);
    requestAnimationFrame(() => canvas.current?.scrollTo(0, 0));
  };
  const [zoom, setZoomState] = useState(storedZoom);
  const canvas = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const [exported, setExported] = useState("");
  /** A new size, keeping the point (cx, cy) of the canvas (default: its middle) where it was. */
  const setZoom = (z: number, cx?: number, cy?: number) => {
    const el = canvas.current;
    const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));
    const old = zoomRef.current;
    if (!el || next === old) return;
    const px = cx ?? el.clientWidth / 2;
    const py = cy ?? el.clientHeight / 2;
    const [x, y] = [(el.scrollLeft + px) / old, (el.scrollTop + py) / old];
    zoomRef.current = next;
    setZoomState(next);
    store("bio.treeZoom", String(next));
    requestAnimationFrame(() => {
      el.scrollLeft = x * next - px;
      el.scrollTop = y * next - py;
    });
  };
  // Ctrl + wheel: bigger or smaller around the mouse (React's wheel cannot stop the page zoom)
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      const r = el.getBoundingClientRect();
      setZoom(zoomRef.current * (e.deltaY < 0 ? 1.15 : 1 / 1.15), e.clientX - r.left, e.clientY - r.top);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  });
  // dragging the background moves around the tree, like a map
  const pan = (e: React.MouseEvent) => {
    const el = canvas.current;
    if (!el || e.button !== 0 || (e.target as Element).closest(".tree-node")) return;
    e.preventDefault();
    const [sx, sy, l, t0] = [e.clientX, e.clientY, el.scrollLeft, el.scrollTop];
    el.classList.add("panning");
    const move = (m: MouseEvent) => {
      el.scrollLeft = l - (m.clientX - sx);
      el.scrollTop = t0 - (m.clientY - sy);
    };
    const up = () => {
      el.classList.remove("panning");
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const { nodes, lines, groups, width, height, at } = useMemo(() => {
    const { under, extras } = arrange(persons, line);
    const byPerson = new Map(persons.map((p) => [p.id, p]));
    const kids = new Map<number | null, PersonListItem[]>();
    for (const [id, u] of under) kids.set(u.parent, [...(kids.get(u.parent) ?? []), byPerson.get(id)!]);
    sortDisciples(kids);
    const nodes: Node[] = [];
    let groups: (Rect & { name: string })[] = [];
    let width = 0;
    let height = 0;
    // where each person is drawn: its box, or its row in a list box
    const at = new Map<number, Rect>();
    // the line each person is placed by
    const placeLine = (id: number) => {
      const u = under.get(id)!;
      const p = byPerson.get(id)!;
      const own = p.tree && p.tree.parent === u.parent;
      return { note: own ? p.tree!.note : p.links.find((l) => l.guru === u.parent)?.note ?? "", disputed: own ? p.tree!.disputed : p.links.find((l) => l.guru === u.parent)?.disputed ?? false };
    };
    if (dir === "lr") {
      const seen = new Set<number>();
      let row = 0;
      // leaves take the next line; a guru sits in the middle of their disciples
      const place = (p: PersonListItem, depth: number, parent: boolean): Node => {
        seen.add(p.id);
        const n: Node = { key: `P${p.id}`, p, x: depth * DX, y: 0, w: W, h: H, kind: parent ? under.get(p.id)!.kind : null };
        nodes.push(n);
        const children = (kids.get(p.id) ?? []).filter((c) => !seen.has(c.id)).map((c) => place(c, depth + 1, true));
        n.y = children.length ? (children[0].y + children[children.length - 1].y) / 2 : row++ * DY;
        return n;
      };
      for (const root of kids.get(null) ?? []) place(root, 0, false);
      // records caught in a loop of gurus (a mistake in the data) still show, on their own
      for (const id of under.keys()) if (!seen.has(id)) place(byPerson.get(id)!, 0, false);
      for (const n of nodes) at.set(n.p!.id, n);
      width = Math.max(...nodes.map((b) => b.x), 0) + W + 20;
      height = Math.max(row, 1) * DY + 20;
    } else {
      const busy = new Set<number>(extras.flatMap((x) => [x.from, x.to]));
      const tb = layoutTB(under, byPerson, kids, busy);
      nodes.push(...tb.nodes);
      groups = tb.groups;
      width = tb.width;
      height = tb.height;
      for (const n of nodes) {
        if (n.p) at.set(n.p.id, n);
        n.items?.forEach((it, i) => at.set(it.p.id, { x: n.x, y: n.y + 6 + i * TB_ROW, w: n.w, h: TB_ROW }));
      }
    }
    const path = dir === "lr" ? pathLR : pathTB;
    const lines: Line[] = [];
    const listDone = new Set<string>();
    for (const n of nodes) {
      // the line to the guru: one for a whole list box
      const first = n.p ?? n.items?.[0]?.p;
      if (!first) continue;
      const u = under.get(first.id);
      if (!u || u.parent === null || !at.has(u.parent) || !n.kind) continue;
      if (n.items) {
        if (listDone.has(n.key)) continue;
        listDone.add(n.key);
      }
      const info = n.items ? { note: "", disputed: false } : placeLine(first.id);
      lines.push({ key: `t${n.key}`, from: u.parent, to: first.id, kind: n.kind, extra: false, ...info, ...path(at.get(u.parent)!, n) });
    }
    for (const x of extras) {
      const [a, b] = [at.get(x.from), at.get(x.to)];
      if (a && b) lines.push({ key: `x${x.to}-${x.from}`, extra: true, ...x, ...path(a, b) });
    }
    return { nodes, lines, groups, width, height, at };
  }, [persons, line, dir]);

  // «Ver en el Paramparā Tree» from a ficha: that record in the middle, lit up for a while
  const [lit, setLit] = useState<number | null>(null);
  const [notHere, setNotHere] = useState(false);
  const focusDone = useRef(0);
  useEffect(() => {
    if (!focus || focusDone.current === focus.n) return;
    const r = at.get(focus.id);
    if (!r) {
      if (line !== "all") return setLine("all"); // not in this line view: the whole tree
      focusDone.current = focus.n;
      setNotHere(true);
      return;
    }
    focusDone.current = focus.n;
    setNotHere(false);
    const z = Math.max(zoomRef.current, 0.8);
    zoomRef.current = z;
    setZoomState(z);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const el = canvas.current;
        if (!el) return;
        el.scrollLeft = (r.x + 10 + r.w / 2) * z - el.clientWidth / 2;
        el.scrollTop = (r.y + 10 + r.h / 2) * z - el.clientHeight / 2;
        el.scrollIntoView({ block: "nearest" });
      }),
    );
    setLit(focus.id);
    const timer = setTimeout(() => setLit(null), 6000);
    return () => clearTimeout(timer);
  }, [focus, at, line]);

  const short = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
  // the śikṣā side: śikṣā / associate lines, and the records they join
  const siksa = (l: Line) => l.kind !== "diksa" && l.kind !== "family";
  const inSiksa = useMemo(() => new Set(lines.filter(siksa).flatMap((l) => [l.from, l.to])), [lines]);
  const hasSiksa = inSiksa.size > 0;
  // the slider is for the whole tree; a line view draws its own lines plainly
  const m = line === "all" ? mix / 100 : line === "siksa" ? 1 : 0;
  const diksaOpacity = 1 - 0.8 * m;
  // the other gurus' lines are always there, faint, and stand out with the slider (Whisper, 04-11)
  const siksaOpacity = hasSiksa ? 0.35 + 0.65 * Math.max(m, 0) : 0;
  const nodeOpacity = (id: number) => (line !== "all" || inSiksa.has(id) ? 1 : 1 - 0.7 * m);
  const cls = (l: Line, strong = false) => `tree-link ${l.kind}${l.disputed ? " disputed" : ""}${strong ? " strong" : ""}`;
  // the word on a line: its note («Gayā 1508», «son»), or «?» when the sources disagree
  const word = (l: Line) => (l.note ? short(l.note, 40) : l.disputed ? "?" : "");
  const label = (l: Line) =>
    word(l) && (
      <text key={`w${l.key}`} className={`tree-word ${l.kind}${l.disputed ? " disputed" : ""}`} x={l.mx} y={l.my - 3} textAnchor="middle">
        <title>{l.note || t.treeDisputed}</title>
        {word(l)}
      </text>
    );
  const personTitle = (p: PersonListItem, kind: TreeKind | null) =>
    (kind ? `${p.name} · ${t.treeKinds[kind]}` : p.name) + (repeats.has(p.id) ? `\n${t.maybeRepeated(repeats.get(p.id)!.map((x) => x.name).join(", "))}` : "");
  const nodeClass = (id: number) => `tree-node${marks[id] ? ` mark-${marks[id]}` : ""}${repeats.has(id) ? " repeated" : ""}${lit === id ? " lit" : ""}`;

  /** The drawing as an .svg file: the lines and boxes with their colours written in (no app needed to open it). */
  const exportSvg = async () => {
    const svg = svgRef.current;
    if (!svg) return;
    const copy = svg.cloneNode(true) as SVGSVGElement;
    const src = svg.querySelectorAll("*");
    const dst = copy.querySelectorAll("*");
    const props = ["fill", "stroke", "stroke-width", "stroke-dasharray", "stroke-opacity", "fill-opacity", "opacity", "font-size", "font-weight", "font-style", "font-family"];
    src.forEach((el, i) => {
      const cs = getComputedStyle(el);
      const style = props.map((p) => `${p}:${cs.getPropertyValue(p)}`).join(";");
      (dst[i] as SVGElement).setAttribute("style", style);
      dst[i].removeAttribute("class");
    });
    copy.setAttribute("width", String(width));
    copy.setAttribute("height", String(height));
    copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bg.setAttribute("x", "-10");
    bg.setAttribute("y", "-10");
    bg.setAttribute("width", String(width + 20));
    bg.setAttribute("height", String(height + 20));
    bg.setAttribute("fill", getComputedStyle(canvas.current ?? document.body).backgroundColor || "#ffffff");
    copy.insertBefore(bg, copy.firstChild);
    const text = `<?xml version="1.0" encoding="UTF-8"?>\n` + new XMLSerializer().serializeToString(copy);
    const day = new Date().toISOString().slice(0, 10);
    const path = await save({
      defaultPath: `Parampara Tree ${t.treeLine[line]} ${day}.svg`.replace(/[\\/:*?"<>|]/g, "-"),
      filters: [{ name: "SVG", extensions: ["svg"] }],
    });
    if (!path) return;
    await api.saveTreeSvg(path.toLowerCase().endsWith(".svg") ? path : path + ".svg", text);
    setExported(path);
  };

  return (
    <div className="reader">
      <div className="reader-scroll">
        <div className="tree-view tree-page">
          <header className="view-head">
            <h1>
              <Network size={22} /> {t.treeView}
            </h1>
            <p className="muted small">{t.treeViewHint}</p>
            <div className="tree-bar">
              <div className="seg tree-line">
                {(["all", "diksa", "siksa"] as TreeLine[]).map((l) => (
                  <button key={l} className={line === l ? "on" : ""} title={t.treeLineHint[l]} onClick={() => setLine(l)}>
                    {t.treeLine[l]}
                  </button>
                ))}
              </div>
              <div className="seg tree-dir">
                <button className={dir === "lr" ? "on" : ""} title={t.treeDirHint.lr} onClick={() => setDir("lr")}>
                  <ArrowRight size={14} /> {t.treeDir.lr}
                </button>
                <button className={dir === "tb" ? "on" : ""} title={t.treeDirHint.tb} onClick={() => setDir("tb")}>
                  <ArrowDown size={14} /> {t.treeDir.tb}
                </button>
              </div>
              <button className="btn ghost" title={t.treeExportHint} onClick={() => void exportSvg().catch((e) => setExported(`⚠ ${e}`))}>
                <Download size={15} /> {t.treeExport}
              </button>
            </div>
            <p className="muted small">
              {t.treeLineHint[line]} {dir === "tb" && t.treeDirHint.tb}
            </p>
            {exported && <p className="muted small">{exported.startsWith("⚠") ? exported : t.treeExported(exported)}</p>}
            {notHere && <p className="muted small">{t.showInTreeMissing}</p>}
            {line === "all" && (
              <div className="tree-mix" title={t.treeSliderHint}>
                <span className={mix < 50 ? "on" : ""}>{t.treeSliderDiksa}</span>
                <input type="range" min={0} max={100} value={mix} onChange={(e) => setMix(Number(e.target.value))} />
                <span className={mix >= 50 ? "on" : ""}>{t.treeSliderSiksa}</span>
                <span className="muted small">{hasSiksa ? t.treeSliderHint : t.treeNoLinks}</span>
              </div>
            )}
            <div className="tree-zoom" title={t.treeZoomHint}>
              <button className="icon-btn" title={t.treeZoomOut} onClick={() => setZoom(zoom / 1.25)}>
                <ZoomOut size={18} />
              </button>
              <button className="link-btn" title={t.treeZoomReset} onClick={() => setZoom(1)}>
                {Math.round(zoom * 100)} %
              </button>
              <button className="icon-btn" title={t.treeZoomIn} onClick={() => setZoom(zoom * 1.25)}>
                <ZoomIn size={18} />
              </button>
              <button
                className="btn ghost"
                onClick={() => {
                  const el = canvas.current;
                  if (!el) return;
                  setZoom(Math.min(1, (el.clientWidth - 20) / width, (el.clientHeight - 20) / height));
                  requestAnimationFrame(() => el.scrollTo(0, 0));
                }}
              >
                <Maximize size={15} /> {t.treeFit}
              </button>
              <span className="muted small">{t.treeZoomHint}</span>
            </div>
            <p className="muted small tree-legend">{t.treeLegend}</p>
          </header>
          {nodes.length === 0 ? (
            <p className="muted">{t.paramparaEmpty}</p>
          ) : (
            <div className="tree-canvas" ref={canvas} onMouseDown={pan}>
              <svg ref={svgRef} width={width * zoom} height={height * zoom} viewBox={`-10 -10 ${width} ${height}`}>
                {/* the groups: a box behind their members, with the name on top */}
                {groups.map((g) => (
                  <g key={`g${g.name}`} className="tree-group">
                    <rect x={g.x} y={g.y} width={g.w} height={g.h} rx={10} />
                    <text x={g.x + g.w / 2} y={g.y + 15} textAnchor="middle">
                      {g.name}
                    </text>
                  </g>
                ))}
                <g opacity={line === "all" ? diksaOpacity : 1}>
                  {lines
                    .filter((l) => l.kind === "diksa")
                    .map((l) => (
                      <path key={l.key} className={cls(l)} d={l.d} />
                    ))}
                </g>
                {/* a record placed under a śikṣā guru keeps its line always */}
                {lines
                  .filter((l) => !l.extra && siksa(l))
                  .map((l) => (
                    <path key={l.key} className={cls(l)} d={l.d} />
                  ))}
                {siksaOpacity > 0 && (
                  <g opacity={siksaOpacity}>
                    {lines.filter(siksa).map((l) => (
                      <path key={l.key} className={cls(l, true)} d={l.d} />
                    ))}
                  </g>
                )}
                {/* family: a green dotted line, always */}
                {lines
                  .filter((l) => l.kind === "family")
                  .map((l) => (
                    <path key={l.key} className={cls(l)} d={l.d} />
                  ))}
                {nodes.map((n) =>
                  n.p ? (
                    <g
                      key={n.key}
                      data-ctx="person"
                      data-id={n.p.id}
                      className={nodeClass(n.p.id)}
                      transform={`translate(${n.x},${n.y})`}
                      opacity={nodeOpacity(n.p.id)}
                      onClick={(e) => e.detail === 1 && onPerson(n.p!.id)}
                      onDoubleClick={() => onMark(n.p!.id)}
                    >
                      <title>{personTitle(n.p, n.kind)}</title>
                      <rect width={n.w} height={n.h} rx={5} />
                      <text x={10} y={n.h / 2 + 4}>
                        {short(n.p.name, dir === "lr" ? (n.kind ? 22 : 28) : n.kind ? 19 : 24)}
                      </text>
                      {/* how they are related to the guru above / on the left */}
                      {n.kind && (
                        <text className={`tree-kind ${n.kind}`} x={n.w - 8} y={n.h / 2 + 4} textAnchor="end">
                          {t.treeKindShort[n.kind]}
                        </text>
                      )}
                    </g>
                  ) : (
                    <g key={n.key} className="tree-list" transform={`translate(${n.x},${n.y})`}>
                      <rect width={n.w} height={n.h} rx={7} />
                      {n.items!.map((it, i) => (
                        <g
                          key={it.p.id}
                          data-ctx="person"
                          data-id={it.p.id}
                          className={nodeClass(it.p.id)}
                          opacity={nodeOpacity(it.p.id)}
                          onClick={(e) => e.detail === 1 && onPerson(it.p.id)}
                          onDoubleClick={() => onMark(it.p.id)}
                        >
                          <title>{personTitle(it.p, it.kind)}</title>
                          <rect className="tree-list-row" x={3} y={6 + i * TB_ROW} width={n.w - 6} height={TB_ROW} rx={3} />
                          <text x={10} y={6 + i * TB_ROW + 12.5}>
                            {short(it.p.name, it.kind && it.kind !== n.kind ? 19 : 25)}
                          </text>
                          {it.kind && it.kind !== n.kind && (
                            <text className={`tree-kind ${it.kind}`} x={n.w - 8} y={6 + i * TB_ROW + 12.5} textAnchor="end">
                              {t.treeKindShort[it.kind]}
                            </text>
                          )}
                        </g>
                      ))}
                    </g>
                  ),
                )}
                {/* the words on the lines, over everything */}
                {lines.map(label)}
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
