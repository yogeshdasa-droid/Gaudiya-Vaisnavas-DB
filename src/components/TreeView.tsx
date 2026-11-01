import { useEffect, useMemo, useRef, useState } from "react";
import { Maximize, Network, ZoomIn, ZoomOut } from "lucide-react";
import { Marks, PersonListItem, sortDisciples, TreeKind } from "../api";
import { T } from "../i18n";

const W = 200; // box width
const H = 30; // box height
const DX = 250; // from one generation to the next
const DY = 40; // from one line to the next
const ZOOM_MIN = 0.15;
const ZOOM_MAX = 2.5;

function storedZoom(): number {
  try {
    const z = Number(localStorage.getItem("bio.treeZoom"));
    return z >= ZOOM_MIN && z <= ZOOM_MAX ? z : 1;
  } catch {
    return 1;
  }
}

interface Box {
  p: PersonListItem;
  x: number;
  y: number;
  parent: Box | null;
  /** relation with the guru it is drawn under */
  kind: TreeKind | null;
}

/** What the drawing shows: the whole tree, or only the dīkṣā or the śikṣā line. */
export type TreeLine = "all" | "diksa" | "siksa";

function storedLine(): TreeLine {
  try {
    const v = localStorage.getItem("bio.treeLine");
    return v === "diksa" || v === "siksa" ? v : "all";
  } catch {
    return "all";
  }
}

/** For each record drawn: the guru it goes under (null: it starts a branch)
 *  and how they are related; and the other lines to draw. */
function arrange(persons: PersonListItem[], line: TreeLine) {
  const inTree = persons.filter((p) => p.tree);
  const ids = new Set(inTree.map((p) => p.id));
  const treeParent = (p: PersonListItem) => (p.tree!.parent !== null && ids.has(p.tree!.parent) ? p.tree!.parent : null);
  // the guru of one kind: its place in the tree, or one of its other gurus
  const guruOf = (p: PersonListItem, kind: TreeKind) =>
    (p.tree!.kind === kind ? treeParent(p) : null) ?? p.links.find((l) => l.kind === kind && ids.has(l.guru))?.guru ?? null;
  const under = new Map<number, { parent: number | null; kind: TreeKind | null }>();
  if (line === "all") {
    for (const p of inTree) under.set(p.id, { parent: treeParent(p), kind: treeParent(p) !== null ? p.tree!.kind : null });
  } else {
    const kind: TreeKind = line;
    const gurus = new Set<number>();
    for (const p of inTree) {
      const g = guruOf(p, kind);
      if (g !== null) gurus.add(g);
    }
    for (const p of inTree) {
      const g = guruOf(p, kind);
      if (g !== null || gurus.has(p.id)) under.set(p.id, { parent: g, kind: g !== null ? kind : null });
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
  // other lines: the other gurus not used to place the record (in a line view, only of that kind)
  const extras: { from: number; to: number; kind: TreeKind }[] = [];
  for (const p of inTree) {
    if (!under.has(p.id)) continue;
    const placed = under.get(p.id)!.parent;
    const others = [...p.links.map((l) => ({ guru: l.guru, kind: l.kind })), ...(treeParent(p) !== null ? [{ guru: treeParent(p)!, kind: p.tree!.kind }] : [])];
    for (const o of others) {
      if (o.guru === placed || !under.has(o.guru) || (line !== "all" && o.kind !== line)) continue;
      if (!extras.some((x) => x.from === o.guru && x.to === p.id)) extras.push({ from: o.guru, to: p.id, kind: o.kind });
    }
  }
  return { under, extras };
}

/** A line from a guru to a disciple: its place in the tree, or one of its other gurus. */
interface Link {
  key: string;
  from: Box;
  to: Box;
  kind: TreeKind;
  extra: boolean;
}

/** The Guru Paramparā drawn left to right: guru → disciples. A slider fades
 *  the dīkṣā line and brings out the śikṣā (and associate) relations. */
export function TreeView({
  t,
  persons,
  onPerson,
  marks,
  onMark,
}: {
  t: T;
  persons: PersonListItem[];
  onPerson: (id: number) => void;
  marks: Marks;
  onMark: (id: number) => void;
}) {
  // 0 = only the dīkṣā Paramparā … 100 = the śikṣā relations stand out
  const [mix, setMix] = useState(0);
  const [line, setLineState] = useState<TreeLine>(storedLine);
  const setLine = (l: TreeLine) => {
    setLineState(l);
    try {
      localStorage.setItem("bio.treeLine", l);
    } catch {
      /* storage unavailable */
    }
  };
  const [zoom, setZoomState] = useState(storedZoom);
  const canvas = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
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
    try {
      localStorage.setItem("bio.treeZoom", String(next));
    } catch {
      /* storage unavailable */
    }
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
  const { boxes, links, width, height } = useMemo(() => {
    const { under, extras } = arrange(persons, line);
    const byPerson = new Map(persons.map((p) => [p.id, p]));
    const kids = new Map<number | null, PersonListItem[]>();
    for (const [id, u] of under) kids.set(u.parent, [...(kids.get(u.parent) ?? []), byPerson.get(id)!]);
    sortDisciples(kids);
    const boxes: Box[] = [];
    const seen = new Set<number>();
    let row = 0;
    // leaves take the next line; a guru sits in the middle of their disciples
    const place = (p: PersonListItem, depth: number, parent: Box | null): Box => {
      seen.add(p.id);
      const box: Box = { p, x: depth * DX, y: 0, parent, kind: parent ? under.get(p.id)!.kind : null };
      boxes.push(box);
      const children = (kids.get(p.id) ?? []).filter((c) => !seen.has(c.id)).map((c) => place(c, depth + 1, box));
      box.y = children.length ? (children[0].y + children[children.length - 1].y) / 2 : row++ * DY;
      return box;
    };
    for (const root of kids.get(null) ?? []) place(root, 0, null);
    // records caught in a loop of gurus (a mistake in the data) still show, on their own
    for (const id of under.keys()) if (!seen.has(id)) place(byPerson.get(id)!, 0, null);
    const byId = new Map(boxes.map((b) => [b.p.id, b]));
    const links: Link[] = [];
    for (const b of boxes) if (b.parent && b.kind) links.push({ key: `t${b.p.id}`, from: b.parent, to: b, kind: b.kind, extra: false });
    for (const x of extras) {
      const [from, to] = [byId.get(x.from), byId.get(x.to)];
      if (from && to) links.push({ key: `x${x.to}-${x.from}`, from, to, kind: x.kind, extra: true });
    }
    const width = Math.max(...boxes.map((b) => b.x), 0) + W + 20;
    const height = Math.max(row, 1) * DY + 20;
    return { boxes, links, width, height };
  }, [persons, line]);

  const short = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
  // the śikṣā side: śikṣā / associate lines, and the records they join
  const siksa = (l: Link) => l.kind !== "diksa";
  const inSiksa = useMemo(() => new Set(links.filter(siksa).flatMap((l) => [l.from.p.id, l.to.p.id])), [links]);
  const hasSiksa = inSiksa.size > 0;
  // the slider is for the whole tree; a line view draws its own lines plainly
  const m = line === "all" ? mix / 100 : line === "siksa" ? 1 : 0;
  const diksaOpacity = 1 - 0.8 * m;
  const siksaOpacity = hasSiksa ? Math.max(m, 0) : 0;
  const nodeOpacity = (id: number) => (line !== "all" || inSiksa.has(id) ? 1 : 1 - 0.7 * m);
  const path = (l: Link) => {
    const y1 = l.from.y + H / 2;
    const x2 = l.to.x;
    const y2 = l.to.y + H / 2;
    // a guru in the same column as the disciple, or further right: an arc on the left
    if (l.from.x >= l.to.x) {
      const x1 = l.from.x;
      const bend = 40 + Math.min(80, Math.abs(y2 - y1) / 4);
      return `M${x1},${y1} C${x1 - bend},${y1} ${x2 - bend},${y2} ${x2},${y2}`;
    }
    const x1 = l.from.x + W;
    const bend = Math.max(40, (x2 - x1) / 2);
    return `M${x1},${y1} C${x1 + bend},${y1} ${x2 - bend},${y2} ${x2},${y2}`;
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
            <div className="seg tree-line">
              {(["all", "diksa", "siksa"] as TreeLine[]).map((l) => (
                <button key={l} className={line === l ? "on" : ""} title={t.treeLineHint[l]} onClick={() => setLine(l)}>
                  {t.treeLine[l]}
                </button>
              ))}
            </div>
            <p className="muted small">{t.treeLineHint[line]}</p>
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
          </header>
          {boxes.length === 0 ? (
            <p className="muted">{t.paramparaEmpty}</p>
          ) : (
            <div className="tree-canvas" ref={canvas} onMouseDown={pan}>
              <svg width={width * zoom} height={height * zoom} viewBox={`-10 -10 ${width} ${height}`}>
                <g opacity={line === "all" ? diksaOpacity : 1}>
                  {links
                    .filter((l) => !siksa(l))
                    .map((l) => (
                      <path key={l.key} className="tree-link diksa" d={path(l)} />
                    ))}
                </g>
                {/* a record placed under a śikṣā guru keeps its line always */}
                {links
                  .filter((l) => !l.extra && l.kind !== "diksa")
                  .map((l) => (
                    <path key={l.key} className={`tree-link ${l.kind}`} d={path(l)} />
                  ))}
                {siksaOpacity > 0 && (
                  <g opacity={siksaOpacity}>
                    {links.filter(siksa).map((l) => (
                      <path key={l.key} className={`tree-link ${l.kind} strong`} d={path(l)} />
                    ))}
                  </g>
                )}
                {boxes.map((b) => (
                  <g
                    key={b.p.id}
                    className={`tree-node${marks[b.p.id] ? ` mark-${marks[b.p.id]}` : ""}`}
                    transform={`translate(${b.x},${b.y})`}
                    opacity={nodeOpacity(b.p.id)}
                    onClick={(e) => e.detail === 1 && onPerson(b.p.id)}
                    onDoubleClick={() => onMark(b.p.id)}
                  >
                    <title>{b.kind ? `${b.p.name} · ${t.treeKinds[b.kind]}` : b.p.name}</title>
                    <rect width={W} height={H} rx={5} />
                    <text x={10} y={H / 2 + 4}>
                      {short(b.p.name, b.kind ? 22 : 28)}
                    </text>
                    {/* how they are related to the guru on the left */}
                    {b.kind && (
                      <text className={`tree-kind ${b.kind}`} x={W - 8} y={H / 2 + 4} textAnchor="end">
                        {t.treeKindShort[b.kind]}
                      </text>
                    )}
                  </g>
                ))}
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
