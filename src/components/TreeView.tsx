import { useEffect, useMemo, useRef, useState } from "react";
import { Maximize, Network, ZoomIn, ZoomOut } from "lucide-react";
import { PersonListItem, sortDisciples, TreeKind } from "../api";
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
export function TreeView({ t, persons, onPerson }: { t: T; persons: PersonListItem[]; onPerson: (id: number) => void }) {
  // 0 = only the dīkṣā Paramparā … 100 = the śikṣā relations stand out
  const [mix, setMix] = useState(0);
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
    const ids = new Set(persons.filter((p) => p.tree).map((p) => p.id));
    const kids = new Map<number | null, PersonListItem[]>();
    for (const p of persons) {
      if (!p.tree) continue;
      const parent = p.tree.parent !== null && ids.has(p.tree.parent) ? p.tree.parent : null;
      kids.set(parent, [...(kids.get(parent) ?? []), p]);
    }
    sortDisciples(kids);
    const boxes: Box[] = [];
    let line = 0;
    // leaves take the next line; a guru sits in the middle of their disciples
    const place = (p: PersonListItem, depth: number, parent: Box | null): Box => {
      const box: Box = { p, x: depth * DX, y: 0, parent };
      boxes.push(box);
      const children = (kids.get(p.id) ?? []).map((c) => place(c, depth + 1, box));
      box.y = children.length ? (children[0].y + children[children.length - 1].y) / 2 : line++ * DY;
      return box;
    };
    for (const root of kids.get(null) ?? []) place(root, 0, null);
    const byId = new Map(boxes.map((b) => [b.p.id, b]));
    const links: Link[] = [];
    for (const b of boxes) {
      if (b.parent) links.push({ key: `t${b.p.id}`, from: b.parent, to: b, kind: b.p.tree!.kind, extra: false });
      for (const l of b.p.links) {
        const g = byId.get(l.guru);
        if (g) links.push({ key: `x${b.p.id}-${l.guru}`, from: g, to: b, kind: l.kind, extra: true });
      }
    }
    const width = Math.max(...boxes.map((b) => b.x), 0) + W + 20;
    const height = Math.max(line, 1) * DY + 20;
    return { boxes, links, width, height };
  }, [persons]);

  const short = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
  // the śikṣā side: śikṣā / associate lines, and the records they join
  const siksa = (l: Link) => l.extra || l.kind !== "diksa";
  const inSiksa = useMemo(() => new Set(links.filter(siksa).flatMap((l) => [l.from.p.id, l.to.p.id])), [links]);
  const hasSiksa = inSiksa.size > 0;
  const m = mix / 100;
  const diksaOpacity = 1 - 0.8 * m;
  const siksaOpacity = hasSiksa ? Math.max(m, 0) : 0;
  const nodeOpacity = (id: number) => (inSiksa.has(id) ? 1 : 1 - 0.7 * m);
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
            <div className="tree-mix" title={t.treeSliderHint}>
              <span className={mix < 50 ? "on" : ""}>{t.treeSliderDiksa}</span>
              <input type="range" min={0} max={100} value={mix} onChange={(e) => setMix(Number(e.target.value))} />
              <span className={mix >= 50 ? "on" : ""}>{t.treeSliderSiksa}</span>
              <span className="muted small">{hasSiksa ? t.treeSliderHint : t.treeNoLinks}</span>
            </div>
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
                <g opacity={diksaOpacity}>
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
                    className="tree-node"
                    transform={`translate(${b.x},${b.y})`}
                    opacity={nodeOpacity(b.p.id)}
                    onClick={() => onPerson(b.p.id)}
                  >
                    <title>{b.parent ? `${b.p.name} · ${t.treeKinds[b.p.tree!.kind]}` : b.p.name}</title>
                    <rect width={W} height={H} rx={5} />
                    <text x={10} y={H / 2 + 4}>
                      {short(b.p.name, b.parent ? 22 : 28)}
                    </text>
                    {/* how they are related to the guru on the left */}
                    {b.parent && (
                      <text className={`tree-kind ${b.p.tree!.kind}`} x={W - 8} y={H / 2 + 4} textAnchor="end">
                        {t.treeKindShort[b.p.tree!.kind]}
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
