// «Linaje» (Whisper, 11-11-2026): the paramparā of one person as an interactive graph — up to 5 generations of
// gurus above and up to 10 of disciples below, with the doubtful lines (disputed: long dashes and «?») and the
// notes of each line numbered in a margin, as the hagiographies tell them. Click a box: the lineage of that person;
// double click: its ficha. Laid out by dagre (top to bottom), like the Paramparā Tree.
import { useEffect, useMemo, useRef, useState } from "react";
import dagre from "@dagrejs/dagre";
import { GitFork, Maximize, Network, Search, UserRound, X, ZoomIn, ZoomOut } from "lucide-react";
import { lineOfKind, PersonListItem } from "../api";
import { paramparaById, paramparaMembers, PARAMPARAS, RelKind } from "./paramparas";
import { Lang, T } from "../i18n";
import { foldName } from "./Sidebar";

const W = 196; // box width
const H = 40; // box height (name + relation)
const MAX_NODES = 450; // more than this is unreadable (and slow): the depths have to come down
const ZOOM_MIN = 0.15;
const ZOOM_MAX = 2.5;

export type LineageLine = "all" | "diksa" | "siksa";

/** One relation guru → disciple: its place in the tree, or one of its other gurus. */
interface Rel {
  from: number;
  to: number;
  kind: RelKind;
  note: string;
  disputed: boolean;
  /** a step of a paramparā list where the data has no line */
  list?: boolean;
}

function stored(key: string, def: number, min: number, max: number): number {
  try {
    const v = Number(localStorage.getItem(key));
    return localStorage.getItem(key) !== null && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : def;
  } catch {
    return def;
  }
}
function store(key: string, v: string) {
  try {
    localStorage.setItem(key, v);
  } catch {
    /* storage unavailable */
  }
}

/** All the guru → disciple relations of the data (place in the tree and other gurus), without family. */
function relations(persons: PersonListItem[]): Rel[] {
  const ids = new Set(persons.map((p) => p.id));
  const out: Rel[] = [];
  for (const p of persons) {
    if (p.tree && p.tree.parent !== null && ids.has(p.tree.parent))
      out.push({ from: p.tree.parent, to: p.id, kind: p.tree.kind, note: p.tree.note, disputed: p.tree.disputed });
    for (const l of p.links)
      if (ids.has(l.guru) && !(p.tree && p.tree.parent === l.guru)) out.push({ from: l.guru, to: p.id, kind: l.kind, note: l.note, disputed: l.disputed });
  }
  return out;
}

const keep = (r: Rel, line: LineageLine) => line === "all" || r.kind === "family" || lineOfKind(r.kind) === line;

export function Lineage({
  t,
  lang,
  persons,
  onPerson,
  focus,
  onTreePp,
}: {
  t: T;
  lang: Lang;
  persons: PersonListItem[];
  onPerson: (id: number) => void;
  /** «Resaltar en el árbol»: the Paramparā Tree with that paramparā lit */
  onTreePp: (id: string) => void;
  /** «Ver linaje» from a ficha: that person; n: a new request */
  focus?: { id: number; n: number };
}) {
  const byId = useMemo(() => new Map(persons.map((p) => [p.id, p])), [persons]);
  const [center, setCenterState] = useState<number | null>(() => {
    const v = stored("bio.lineageId", 0, 0, 1e9);
    return v > 0 ? v : null;
  });
  const setCenter = (id: number | null) => {
    setCenterState(id);
    store("bio.lineageId", String(id ?? 0));
  };
  // a whole paramparā (13-11-2026) instead of one person in the middle
  const [ppId, setPpIdState] = useState<string | null>(() => {
    try {
      return paramparaById(localStorage.getItem("bio.lineagePp"))?.id ?? null;
    } catch {
      return null;
    }
  });
  const pp = paramparaById(ppId);
  const setPp = (id: string | null) => {
    setPpIdState(id);
    store("bio.lineagePp", id ?? "");
    const p = paramparaById(id);
    if (p) setDown(p.down);
  };
  /** one person in the middle again (a click on a box, a search) */
  const toPerson = (id: number) => {
    if (ppId) setPp(null);
    setCenter(id);
  };
  const focusDone = useRef(0);
  useEffect(() => {
    if (focus && focusDone.current !== focus.n) {
      focusDone.current = focus.n;
      toPerson(focus.id);
    }
  }, [focus]); // eslint-disable-line react-hooks/exhaustive-deps
  const [up, setUpState] = useState(() => stored("bio.lineageUp", 3, 0, 5));
  const [down, setDownState] = useState(() => stored("bio.lineageDown", 3, 0, 10));
  const setUp = (n: number) => (setUpState(n), store("bio.lineageUp", String(n)));
  const setDown = (n: number) => (setDownState(n), store("bio.lineageDown", String(n)));
  const [line, setLineState] = useState<LineageLine>(() => {
    try {
      const v = localStorage.getItem("bio.lineageLine");
      return v === "diksa" || v === "siksa" ? v : "all";
    } catch {
      return "all";
    }
  });
  const setLine = (l: LineageLine) => (setLineState(l), store("bio.lineageLine", l));
  const [showNotes, setShowNotesState] = useState(() => stored("bio.lineageNotes", 1, 0, 1) === 1);
  const setShowNotes = (b: boolean) => (setShowNotesState(b), store("bio.lineageNotes", b ? "1" : "0"));

  // ---- the search box: the records whose name or other names have all the words typed
  const [query, setQuery] = useState("");
  const [listOpen, setListOpen] = useState(false);
  // how many gurus and disciples each record has: the best known first in the list
  const degree = useMemo(() => {
    const d = new Map<number, number>();
    for (const r of relations(persons)) {
      d.set(r.from, (d.get(r.from) ?? 0) + 1);
      d.set(r.to, (d.get(r.to) ?? 0) + 1);
    }
    return d;
  }, [persons]);
  const matches = useMemo(() => {
    const words = foldName(query).split(" ").filter(Boolean);
    if (!words.length) return [];
    const scored: { p: PersonListItem; s: number }[] = [];
    for (const p of persons) {
      const name = ` ${foldName(p.name)}`;
      const all = `${name} ${foldName(p.aka)}`;
      if (!words.every((w) => all.includes(` ${w}`))) continue;
      // in the name first, in the tree first, then the ones with most relations, shorter names first
      const rel = Math.min(degree.get(p.id) ?? 0, 99);
      scored.push({ p, s: (words.every((w) => name.includes(` ${w}`)) ? 0 : 4) + (p.tree ? 0 : 2) + (99 - rel) / 100 + p.name.length / 10000 });
    }
    return scored.sort((a, b) => a.s - b.s).slice(0, 14).map((x) => x.p);
  }, [query, persons]);
  const pick = (id: number) => {
    toPerson(id);
    setQuery("");
    setListOpen(false);
  };

  // ---- the graph: gurus up to `up` generations, disciples down to `down`
  const graph = useMemo(() => {
    const gurusOf = new Map<number, Rel[]>();
    const discOf = new Map<number, Rel[]>();
    let gen: Map<number, number>;
    let cut = false;
    let edges: Rel[];
    if (pp) {
      // a paramparā: its steps 1, 2, 3… and the disciples of the last one
      const m = paramparaMembers(pp, persons, down, (r) => keep(r, line), MAX_NODES);
      if (!m.steps) return null;
      gen = m.gen;
      cut = m.cut;
      edges = m.edges;
    } else {
    if (center === null || !byId.has(center)) return null;
    const rels = relations(persons).filter((r) => keep(r, line));
    for (const r of rels) {
      gurusOf.set(r.to, [...(gurusOf.get(r.to) ?? []), r]);
      discOf.set(r.from, [...(discOf.get(r.from) ?? []), r]);
    }
    gen = new Map<number, number>([[center, 0]]); // generation: −n gurus, +n disciples
    // up: the gurus of the gurus…
    let frontier = [center];
    for (let g = 1; g <= up && frontier.length; g++) {
      const next: number[] = [];
      for (const id of frontier)
        for (const r of gurusOf.get(id) ?? [])
          if (!gen.has(r.from)) {
            gen.set(r.from, -g);
            next.push(r.from);
          }
      frontier = next;
    }
    // down: the disciples of the disciples… (in the tree's order)
    frontier = [center];
    for (let g = 1; g <= down && frontier.length && !cut; g++) {
      const next: number[] = [];
      for (const id of frontier) {
        const ds = [...(discOf.get(id) ?? [])].sort((a, b) => (byId.get(a.to)?.tree?.pos ?? 0) - (byId.get(b.to)?.tree?.pos ?? 0));
        for (const r of ds) {
          if (gen.has(r.to)) continue;
          if (gen.size >= MAX_NODES) {
            cut = true;
            break;
          }
          gen.set(r.to, g);
          next.push(r.to);
        }
        if (cut) break;
      }
      frontier = next;
    }
    // the lines between the people drawn (also a second guru of someone, if he is drawn)
    edges = rels.filter((r) => gen.has(r.from) && gen.has(r.to) && r.from !== r.to);
    }
    // the notes and doubts, numbered for the margin
    const notes: { n: number; rel: Rel }[] = [];
    for (const r of edges) if (r.note || r.disputed) notes.push({ n: notes.length + 1, rel: r });
    const noteOf = new Map(notes.map((x) => [`${x.rel.from}-${x.rel.to}`, x.n]));

    const g = new dagre.graphlib.Graph({ multigraph: false });
    g.setGraph({ rankdir: "TB", nodesep: 16, ranksep: 64, edgesep: 10, marginx: 12, marginy: 12 });
    g.setDefaultEdgeLabel(() => ({}));
    const order = [...gen.keys()].sort((a, b) => gen.get(a)! - gen.get(b)!);
    for (const id of order) g.setNode(`P${id}`, { width: W, height: H });
    for (const r of edges) {
      // a line against the generations (a disciple drawn above his guru) would turn the drawing over
      const [ga, gb] = [gen.get(r.from)!, gen.get(r.to)!];
      if (ga < gb && !g.hasEdge(`P${r.from}`, `P${r.to}`)) g.setEdge(`P${r.from}`, `P${r.to}`, { minlen: gb - ga, weight: r.kind === "diksa" ? 3 : 1 });
    }
    dagre.layout(g);
    const nodes = order.map((id) => {
      const n = g.node(`P${id}`) as { x: number; y: number };
      return { id, p: byId.get(id)!, gen: gen.get(id)!, x: n.x - W / 2, y: n.y - H / 2 };
    });
    const minX = Math.min(...nodes.map((n) => n.x));
    const minY = Math.min(...nodes.map((n) => n.y));
    for (const n of nodes) {
      n.x -= minX - 70; // room on the left for the generation labels
      n.y -= minY - 10;
    }
    const at = new Map(nodes.map((n) => [n.id, n]));
    // the relation each person is drawn with (to a guru drawn above it)
    const relOf = new Map<number, Rel>();
    for (const r of edges) {
      const prev = relOf.get(r.to);
      const own = byId.get(r.to)?.tree?.parent === r.from;
      if (gen.get(r.from)! < gen.get(r.to)! && (!prev || own)) relOf.set(r.to, r);
    }
    const lines = edges.map((r) => {
      const a = at.get(r.from)!;
      const b = at.get(r.to)!;
      const x1 = a.x + W / 2;
      const x2 = b.x + W / 2;
      let d: string;
      let mx: number;
      let my: number;
      if (b.y > a.y + H + 4) {
        const y1 = a.y + H;
        const bend = Math.max(24, (b.y - y1) / 2);
        d = `M${x1},${y1} C${x1},${y1 + bend} ${x2},${b.y - bend} ${x2},${b.y}`;
        mx = (x1 + x2) / 2;
        my = (y1 + b.y) / 2;
      } else {
        // a guru on the same row or lower: an arc on the side
        const y1 = a.y + H / 2;
        const y2 = b.y + H / 2;
        const side = Math.max(a.x, b.x) + W + 40;
        d = `M${a.x + W},${y1} C${side},${y1} ${side},${y2} ${b.x + W},${y2}`;
        mx = side - 10;
        my = (y1 + y2) / 2;
      }
      return { key: `${r.from}-${r.to}`, rel: r, d, mx, my, n: noteOf.get(`${r.from}-${r.to}`) };
    });
    // the generation labels, on the left of each row
    const rows = new Map<number, number>();
    for (const n of nodes) rows.set(n.gen, Math.min(rows.get(n.gen) ?? Infinity, n.y));
    const width = Math.max(...nodes.map((n) => n.x + W)) + 60;
    const height = Math.max(...nodes.map((n) => n.y + H)) + 20;
    // how far the data goes (for the hint: «there are more generations above / below»)
    const moreUp = !pp && [...gen.entries()].some(([id, gg]) => gg === -up && (gurusOf.get(id) ?? []).some((r) => !gen.has(r.from)));
    const moreDown = !pp && [...gen.entries()].some(([id, gg]) => gg === down && (discOf.get(id) ?? []).some((r) => !gen.has(r.to)));
    return { nodes, lines, notes, rows: [...rows.entries()].sort((a, b) => a[0] - b[0]), width, height, cut, relOf, moreUp, moreDown };
  }, [center, persons, byId, up, down, line, pp]);

  // ---- zoom and moving around (as in the Paramparā Tree)
  const canvas = useRef<HTMLDivElement>(null);
  const [zoom, setZoomState] = useState(() => stored("bio.lineageZoom", 1, ZOOM_MIN, ZOOM_MAX));
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
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
    store("bio.lineageZoom", String(next));
    requestAnimationFrame(() => {
      el.scrollLeft = x * next - px;
      el.scrollTop = y * next - py;
    });
  };
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
  const pan = (e: React.MouseEvent) => {
    const el = canvas.current;
    if (!el || e.button !== 0 || (e.target as Element).closest(".tree-node, .lin-note")) return;
    e.preventDefault();
    const [sx, sy, l, t0] = [e.clientX, e.clientY, el.scrollLeft, el.scrollTop];
    el.classList.add("panning");
    const move = (m: MouseEvent) => {
      el.scrollLeft = l - (m.clientX - sx);
      el.scrollTop = t0 - (m.clientY - sy);
    };
    const stop = () => {
      el.classList.remove("panning");
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", stop);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop);
  };
  // a new person: the person in the middle of the view
  useEffect(() => {
    const el = canvas.current;
    const me = pp ? graph?.nodes.find((n) => n.gen === 1) : graph?.nodes.find((n) => n.gen === 0);
    if (!el || !me) return;
    requestAnimationFrame(() => {
      el.scrollLeft = (me.x + W / 2 + 10) * zoomRef.current - el.clientWidth / 2;
      el.scrollTop = (me.y + H / 2 + 10) * zoomRef.current - el.clientHeight / 2;
    });
  }, [center, ppId, graph === null]); // eslint-disable-line react-hooks/exhaustive-deps

  const [hot, setHot] = useState<number | null>(null); // a note lit from the margin
  const short = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
  const me = !pp && center !== null ? byId.get(center) : undefined;
  const ppSteps = pp ? pp.steps.filter((s) => byId.has(s.id)).length : 0;
  const genLabel = (g: number) =>
    pp ? (g <= ppSteps ? String(g) : t.lineageGenDown(g - ppSteps)) : g === 0 ? t.lineageGenSelf : g < 0 ? t.lineageGenUp(-g) : t.lineageGenDown(g);
  const kindName = (k: RelKind) => (k === "family" ? t.lineageFamily : t.treeKinds[k]);
  const kindShort = (k: RelKind) => (k === "family" ? t.lineageFamilyShort : t.treeKindShort[k]);
  const steps = (max: number, val: number, set: (n: number) => void, title: string) => (
    <label className="lin-steps" title={title}>
      <span>{title}</span>
      <select value={val} onChange={(e) => set(Number(e.target.value))}>
        {Array.from({ length: max + 1 }, (_, i) => (
          <option key={i} value={i}>
            {i}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="reader">
      <div className="reader-scroll">
        <div className="tree-view tree-page lineage">
          <header className="view-head">
            <h1>
              <GitFork size={22} /> {t.lineage}
            </h1>
            <p className="muted small">{t.lineageHint}</p>
            <div className="lin-pp">
              <label>
                <span>{t.lineagePp}</span>
                <select value={ppId ?? ""} onChange={(e) => setPp(e.target.value || null)}>
                  <option value="">{t.lineagePpNone}</option>
                  {(["gaudiya", "iskcon", "matha", "family"] as const).map((g) => (
                    <optgroup key={g} label={t.lineagePpGroup[g]}>
                      {PARAMPARAS.filter((p) => p.group === g).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title[lang]}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>
              {pp && (
                <button className="btn ghost" title={t.lineagePpTreeHint} onClick={() => onTreePp(pp.id)}>
                  <Network size={15} /> {t.lineagePpTree}
                </button>
              )}
            </div>
            {pp && (
              <p className="small lin-pp-about">
                {pp.about[lang]}
                {pp.source && <span className="muted"> — {pp.source}</span>}
              </p>
            )}
            <div className="lin-search">
              <Search size={15} />
              <input
                value={query}
                placeholder={t.lineageSearch}
                spellCheck={false}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setListOpen(true);
                }}
                onFocus={() => setListOpen(true)}
                onBlur={() => setTimeout(() => setListOpen(false), 150)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && matches[0]) pick(matches[0].id);
                  if (e.key === "Escape") setQuery("");
                }}
              />
              {query && (
                <button className="icon-btn" onClick={() => setQuery("")}>
                  <X size={13} />
                </button>
              )}
              {listOpen && query && (
                <div className="lin-matches">
                  {matches.length === 0 && <div className="muted small lin-none">{t.lineageNoMatch}</div>}
                  {matches.map((p) => (
                    <button key={p.id} onMouseDown={(e) => e.preventDefault()} onClick={() => pick(p.id)} title={p.aka || p.name}>
                      <span className="name">{p.name}</span>
                      <span className="muted small">
                        #{p.id}
                        {p.tree ? "" : ` · ${t.lineageNotInTree}`}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="tree-bar lin-bar">
              {!pp && steps(5, up, setUp, t.lineageUp)}
              {steps(10, down, setDown, pp ? t.lineagePpDown : t.lineageDown)}
              <div className="seg tree-line">
                {(["all", "diksa", "siksa"] as LineageLine[]).map((l) => (
                  <button key={l} className={line === l ? "on" : ""} title={t.lineageLineHint[l]} onClick={() => setLine(l)}>
                    {t.lineageLine[l]}
                  </button>
                ))}
              </div>
              <label className="lin-check" title={t.lineageNotesHint}>
                <input type="checkbox" checked={showNotes} onChange={(e) => setShowNotes(e.target.checked)} /> {t.lineageNotes}
              </label>
            </div>
            <div className="tree-zoom">
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
                disabled={!graph}
                onClick={() => {
                  const el = canvas.current;
                  if (!el || !graph) return;
                  setZoom(Math.min(1, (el.clientWidth - 20) / graph.width, (el.clientHeight - 20) / graph.height));
                  requestAnimationFrame(() => el.scrollTo(0, 0));
                }}
              >
                <Maximize size={15} /> {t.treeFit}
              </button>
              {me && (
                <button className="btn ghost" onClick={() => onPerson(me.id)} title={t.lineageOpenHint}>
                  <UserRound size={15} /> {t.lineageOpen(me.name)}
                </button>
              )}
              <span className="muted small">{t.lineageClickHint}</span>
            </div>
            <p className="muted small tree-legend">{t.lineageLegend}</p>
            {graph?.cut && <p className="small lin-warn">{t.lineageTooMany(graph.nodes.length)}</p>}
            {graph && (graph.moreUp || graph.moreDown) && (
              <p className="muted small">{[graph.moreUp && t.lineageMoreUp, graph.moreDown && t.lineageMoreDown].filter(Boolean).join(" · ")}</p>
            )}
          </header>
          {!graph ? (
            <p className="muted">{t.lineageEmpty}</p>
          ) : graph.nodes.length === 1 && !pp ? (
            <p className="muted">{t.lineageAlone(me?.name ?? "", line)}</p>
          ) : (
            <div className="lin-body">
              <div className="tree-canvas" ref={canvas} onMouseDown={pan}>
                <svg width={graph.width * zoom} height={graph.height * zoom} viewBox={`-10 -10 ${graph.width} ${graph.height}`}>
                  {/* the generations, on the left */}
                  {graph.rows.map(([g, y]) => (
                    <text key={`r${g}`} className={`lin-gen${g === 0 ? " self" : ""}`} x={0} y={y + H / 2 + 4}>
                      {genLabel(g)}
                    </text>
                  ))}
                  {graph.lines.map((l) => (
                    <path
                      key={l.key}
                      className={`tree-link ${l.rel.kind}${l.rel.disputed ? " disputed" : ""}${l.rel.list ? " pp-list" : ""}${hot !== null && hot === l.n ? " strong" : ""}`}
                      d={l.d}
                    >
                      <title>{`${byId.get(l.rel.from)?.name} → ${byId.get(l.rel.to)?.name} · ${l.rel.list ? t.lineagePpListLine : kindName(l.rel.kind)}${l.rel.disputed ? ` · ${t.treeDisputed}` : ""}${l.rel.note ? `\n${l.rel.note}` : ""}`}</title>
                    </path>
                  ))}
                  {/* the notes and doubts: their number (and, if wished, a short word) on the line */}
                  {graph.lines
                    .filter((l) => l.n)
                    .map((l) => (
                      <g key={`n${l.key}`} className={`lin-note${hot === l.n ? " hot" : ""}`} onMouseEnter={() => setHot(l.n!)} onMouseLeave={() => setHot(null)}>
                        <title>{(l.rel.disputed ? `${t.treeDisputed}. ` : "") + (l.rel.note || "")}</title>
                        <circle cx={l.mx} cy={l.my} r={8} className={l.rel.disputed ? "disputed" : ""} />
                        <text x={l.mx} y={l.my + 3.5} textAnchor="middle">
                          {l.n}
                        </text>
                        {showNotes && (l.rel.note || l.rel.disputed) && (
                          <text className={`tree-word ${l.rel.kind}${l.rel.disputed ? " disputed" : ""}`} x={l.mx + 12} y={l.my + 3.5}>
                            {l.rel.note ? short(l.rel.note, 34) : "?"}
                          </text>
                        )}
                      </g>
                    ))}
                  {graph.nodes.map((n) => {
                    const rel = graph.relOf.get(n.id);
                    return (
                      <g
                        key={n.id}
                        data-ctx="person"
                        data-id={n.id}
                        className={`tree-node lin-node${!pp && n.gen === 0 ? " lit-self" : ""}${pp && n.gen <= ppSteps ? " pp-step" : ""}${rel?.disputed ? " doubtful" : ""}`}
                        transform={`translate(${n.x},${n.y})`}
                        onClick={(e) => e.detail === 1 && (pp || n.id !== center) && toPerson(n.id)}
                        onDoubleClick={() => onPerson(n.id)}
                      >
                        <title>{`${n.p.name}${n.p.aka ? `\n${n.p.aka}` : ""}\n${t.lineageClickHint}`}</title>
                        <rect width={W} height={H} rx={6} />
                        <text x={10} y={17}>
                          {short(n.p.name, 26)}
                        </text>
                        <text className="lin-sub" x={10} y={32}>
                          {pp
                            ? rel
                              ? (rel.list ? t.lineagePpListShort : kindShort(rel.kind)) + (rel.disputed ? " · ?" : "")
                              : ""
                            : rel
                              ? kindShort(rel.kind) + (rel.disputed ? " · ?" : "") + (n.gen === 0 ? ` · ${genLabel(0)}` : "")
                              : n.gen === 0
                                ? genLabel(0)
                                : ""}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
              {/* the margin: the notes and doubts of the lines drawn, as the sources give them */}
              <aside className="lin-margin">
                <div className="lin-margin-title">{t.lineageMargin}</div>
                {graph.notes.length === 0 && <p className="muted small">{t.lineageNoNotes}</p>}
                {graph.notes.map(({ n, rel }) => (
                  <div key={n} className={`lin-margin-item${hot === n ? " hot" : ""}`} onMouseEnter={() => setHot(n)} onMouseLeave={() => setHot(null)}>
                    <span className={`lin-num${rel.disputed ? " disputed" : ""}`}>{n}</span>
                    <div>
                      <div className="small">
                        <button className="link-btn" onClick={() => toPerson(rel.from)}>
                          {byId.get(rel.from)?.name}
                        </button>{" "}
                        →{" "}
                        <button className="link-btn" onClick={() => toPerson(rel.to)}>
                          {byId.get(rel.to)?.name}
                        </button>
                      </div>
                      <div className="muted small">
                        {kindName(rel.kind)}
                        {rel.disputed && <b className="lin-doubt"> · {t.treeDisputed}</b>}
                      </div>
                      {rel.note && <div className="small">{rel.note}</div>}
                    </div>
                  </div>
                ))}
                <p className="muted small lin-count">{t.lineageCount(graph.nodes.length, lang)}</p>
              </aside>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
