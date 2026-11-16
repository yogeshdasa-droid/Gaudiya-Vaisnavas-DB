// «Vaṁśa» (16-11-2026, Whisper: «otra sección… más de tener el árbol o diagramas; luego, con el Śrīmad-Bhāgavatam,
// sacar quién es quién»): the genealogies of the Purāṇas from the appendix «Genealogy» of the Puranic Encyclopaedia
// (pp. 901–922, Whisper's puranic_genealogy.json in src/data). They are names, not records: a name shows its line and the
// records called the same, so later each one with a story can get its record. Two tabs: a list that folds (like
// Whisper's explorer) and a drawing like «Linaje».
import { useEffect, useMemo, useRef, useState } from "react";
import dagre from "@dagrejs/dagre";
import { ArrowRight, ChevronDown, ChevronRight, ChevronsDownUp, ChevronsUpDown, Maximize, Search, Trees, UserRound, X, ZoomIn, ZoomOut } from "lucide-react";
import { api, type PersonListItem } from "../api";
import { Lang, T } from "../i18n";
import { foldName } from "./Sidebar";
import raw from "../data/vamsa.json";
// the verses of the Śrīmad-Bhāgavatam that name each one with a relative of the tree (scripts/datos/sb/match.mjs): only
// the references; the text is read from the cantos in «Libros», not kept in the code
import sbRefsRaw from "../data/vamsa-sb.json";
const sbRefs = sbRefsRaw as Record<string, string[]>;

/** The key of a name for vamsa-sb.json: «<chart>|<names from the root, «=» before a wife or husband>». */
const keyOf = (chart: string, v: VNode) => {
  const names: string[] = [];
  for (let p: VNode | undefined = v; p; p = p.parent) names.unshift((p.spouse ? "=" : "") + p.name);
  return chart + "|" + names.join(">");
};

// ---- the Bhāgavatam in «Libros»: each canto read once, its verses by «SB c.ch.v»
type Verse = { text: string; docId: number; ordinal: number };
let cantoDocs: Promise<Map<number, number>> | null = null;
const cantos = new Map<number, Promise<Map<string, Verse>>>();
const sbDocs = () =>
  (cantoDocs ??= api.listDocs().then((ds) => {
    const m = new Map<number, number>();
    for (const d of ds) {
      const x = d.title.match(/^Śrīmad-Bhāgavatam — Canto (\d+):/);
      if (x && d.dir === "Libros") m.set(+x[1], d.id);
    }
    return m;
  }));
async function verseOf(ref: string): Promise<Verse | null | undefined> {
  const c = parseInt(ref);
  const id = (await sbDocs()).get(c);
  if (id === undefined) return undefined;
  if (!cantos.has(c))
    cantos.set(
      c,
      api.getDoc(id).then((d) => api.getSections(id, 0, d.doc.sections)).then((secs) => {
        const m = new Map<string, Verse>();
        for (const s of secs)
          for (const part of s.text.split(/^### SB /m).slice(1)) {
            const nl = part.indexOf("\n");
            const body = part.slice(nl + 1).split(/^\*Purport\.\*|^## /m)[0].trim();
            m.set(part.slice(0, nl).trim(), { text: body, docId: id, ordinal: s.ordinal });
          }
        return m;
      }),
    );
  return (await cantos.get(c)!).get(ref) ?? null;
}

// ---- the data, made even: a marriage is a node («═ spouse») between a person and the children of that marriage
export interface VNode {
  key: string;
  name: string;
  note?: string;
  /** the chart this name goes on in (a «code» of the book: K, A6, E…) */
  ref?: string;
  spouse?: boolean;
  children: VNode[];
  parent?: VNode;
}
export interface Chart {
  key: string;
  title: string;
  page: string;
  root: VNode;
  count: number;
}

type RawNode = { name?: string; spouse?: string; note?: string; ref?: string; code?: string; children?: RawNode[]; daughters?: RawNode[]; marriages?: RawNode[] };
type RawChart = { id?: string; code?: string; name: string; page?: number; pages?: number[]; root?: RawNode; charts?: RawChart[]; [k: string]: unknown };

const cleanCode = (c?: string) => (c ? c.replace(/-/g, "") : undefined);

function build(): { charts: Chart[]; byRef: Map<string, string> } {
  const charts: Chart[] = [];
  const byRef = new Map<string, string>(); // a code of the book → the chart that draws it
  let n = 0;
  const node = (r: RawNode, parent: VNode | undefined, spouse = false): VNode => {
    const v: VNode = { key: `n${n++}`, name: (spouse ? r.spouse : r.name) ?? "?", note: r.note, ref: cleanCode(r.ref), spouse, children: [], parent };
    for (const c of [...(r.children ?? []), ...(r.daughters ?? [])]) v.children.push(node(c, v));
    for (const m of r.marriages ?? []) v.children.push(node(m, v, true));
    return v;
  };
  const count = (v: VNode): number => (v.spouse ? 0 : 1) + v.children.reduce((s, c) => s + count(c), 0);
  const page = (c: RawChart, up?: RawChart) => String(c.page ?? (c.pages ?? up?.pages ?? []).join("–") ?? "");
  const add = (c: RawChart, root: RawNode, key: string, title: string, up?: RawChart) => {
    const r = node(root, undefined);
    charts.push({ key, title, page: page(c, up), root: r, count: count(r) });
    const code = cleanCode(c.code);
    if (code && !byRef.has(code)) byRef.set(code, key);
    if (c.id && !byRef.has(c.id)) byRef.set(c.id, key);
  };
  for (const c of (raw as { charts: RawChart[] }).charts) {
    if (c.root) add(c, c.root, c.id ?? c.name, c.name);
    (c.charts ?? []).forEach((s, i) => {
      if (!s.root) return;
      const key = cleanCode(s.code) ?? `${c.id}-${i + 1}`;
      add(s, s.root, key, s.code || !c.code ? s.name : `(${c.code}) ${s.name}`, c);
      // a group («X», «A5») points to its first chart
      if (i === 0 && c.id && !byRef.has(c.id)) byRef.set(c.id, key);
    });
    // a second line printed beside the first (Kukūra, p. 915)
    for (const [k, v] of Object.entries(c))
      if (k.startsWith("parallel_line") && v && typeof v === "object") add(c, v as RawNode, `${c.id}-${k}`, `${c.name} — ${(v as RawNode).name} (${k.replace(/\D+/g, " p. ").trim()})`);
  }
  return { charts, byRef };
}

const W = 168;
const H = 34;
const ZOOM_MIN = 0.15;
const ZOOM_MAX = 2.5;
const get = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const put = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* no storage */
  }
};
// «Lord Kṛṣṇa», «Śrī Rādhā», «Vasudeva (father of…)» → the bare name, to find the records called the same
const TITLES = new Set(["lord", "sri", "srila", "srimati", "maharaja", "thakura", "prabhu"]);
const bare = (s: string) =>
  foldName(s.replace(/\([^)]*\)/g, " ").replace(/^\d+\.\s*/, ""))
    .split(" ")
    .filter((w) => w && !TITLES.has(w))
    .join(" ");

interface Props {
  t: T;
  lang: Lang;
  persons: PersonListItem[];
  onPerson: (id: number) => void;
  onOpenDoc: (docId: number, ordinal: number) => void;
}

export function Vamsa({ t, persons, onPerson, onOpenDoc }: Props) {
  const { charts, byRef } = useMemo(build, []);
  const [chartKey, setChartKeyState] = useState(() => {
    const k = get("bio.vamsaChart");
    return charts.some((c) => c.key === k) ? k! : charts[0].key;
  });
  const setChartKey = (k: string) => (setChartKeyState(k), put("bio.vamsaChart", k));
  const [tab, setTabState] = useState<"list" | "draw">(() => (get("bio.vamsaTab") === "draw" ? "draw" : "list"));
  const setTab = (v: "list" | "draw") => (setTabState(v), put("bio.vamsaTab", v));
  const chart = charts.find((c) => c.key === chartKey) ?? charts[0];
  const [sel, setSel] = useState<VNode | null>(null);
  const [query, setQuery] = useState("");

  // every name of every chart, for the search
  const all = useMemo(() => {
    const out: { v: VNode; chart: Chart; f: string }[] = [];
    const walk = (v: VNode, c: Chart) => {
      out.push({ v, chart: c, f: foldName(v.name) });
      v.children.forEach((x) => walk(x, c));
    };
    charts.forEach((c) => walk(c.root, c));
    return out;
  }, [charts]);
  const hits = useMemo(() => {
    const q = foldName(query.trim());
    if (q.length < 2) return [];
    return all.filter((a) => a.f.includes(q)).sort((a, b) => Number(!a.f.startsWith(q)) - Number(!b.f.startsWith(q)) || a.f.length - b.f.length).slice(0, 40);
  }, [query, all]);

  // the records called the same (name, name without titles or «(…)», or one of its other names)
  const recordIndex = useMemo(() => {
    const m = new Map<string, PersonListItem[]>();
    for (const p of persons) {
      const keys = new Set([bare(p.name), ...(p.aka ?? "").split(/[,;]/).map(bare)].filter((k) => k.length > 1));
      for (const k of keys) m.set(k, [...(m.get(k) ?? []), p]);
    }
    return m;
  }, [persons]);
  const recordsOf = (v: VNode) => recordIndex.get(bare(v.name)) ?? [];

  const [jump, setJump] = useState(0); // a name picked from the search or a link: show it
  const pick = (v: VNode, c: Chart) => {
    setChartKey(c.key);
    setSel(v);
    setJump((n) => n + 1);
  };
  const goRef = (ref: string) => {
    const k = byRef.get(ref);
    const c = charts.find((x) => x.key === k);
    if (c) pick(c.root, c);
  };
  const refLabel = (ref: string) => charts.find((c) => c.key === byRef.get(ref))?.title.replace(/^\([^)]*\)\s*/, "") ?? ref;
  const line = (v: VNode) => {
    const out: VNode[] = [];
    for (let p: VNode | undefined = v; p; p = p.parent) out.unshift(p);
    return out;
  };

  return (
    <div className="reader">
      <div className="reader-scroll">
        <div className="tree-view tree-page lineage vamsa">
          <header className="view-head">
            <h1>
              <Trees size={22} /> {t.vamsa}
            </h1>
            <p className="muted small">{t.vamsaHint}</p>
            <div className="lin-pp">
              <label>
                <span>{t.vamsaChart}</span>
                <select value={chart.key} onChange={(e) => (setChartKey(e.target.value), setSel(null))}>
                  {charts.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.title} · {t.vamsaPeople(c.count)}
                    </option>
                  ))}
                </select>
              </label>
              <div className="seg">
                <button className={tab === "list" ? "on" : ""} onClick={() => setTab("list")}>
                  {t.vamsaList}
                </button>
                <button className={tab === "draw" ? "on" : ""} onClick={() => setTab("draw")}>
                  {t.vamsaDraw}
                </button>
              </div>
              <span className="muted small">{t.vamsaPage(chart.page)}</span>
            </div>
            <div className="vamsa-search">
              <Search size={15} />
              <input value={query} placeholder={t.vamsaSearch} onChange={(e) => setQuery(e.target.value)} />
              {query && (
                <button className="icon-btn" onClick={() => setQuery("")}>
                  <X size={14} />
                </button>
              )}
              {query.trim().length >= 2 && (
                <div className="vamsa-hits">
                  {hits.length === 0 && <div className="muted small">{t.vamsaNoMatch}</div>}
                  {hits.map((h) => (
                    <button key={h.v.key} onClick={() => (pick(h.v, h.chart), setQuery(""))}>
                      <b>{h.v.spouse ? `═ ${h.v.name}` : h.v.name}</b>
                      <span className="muted small">
                        {h.v.parent ? `${h.v.parent.name} · ` : ""}
                        {h.chart.title}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </header>
          <div className="lin-body">
            {tab === "list" ? (
              <VList key={chart.key} t={t} root={chart.root} sel={sel} jump={jump} onSel={setSel} onRef={goRef} recordsOf={recordsOf} refLabel={refLabel} />
            ) : (
              <VDraw key={chart.key} t={t} root={chart.root} sel={sel} jump={jump} onSel={setSel} onRef={goRef} recordsOf={recordsOf} refLabel={refLabel} />
            )}
            <aside className="lin-margin">
              {!sel ? (
                <p className="muted small">{t.vamsaPick}</p>
              ) : (
                <>
                  <div className="lin-margin-title">{sel.spouse ? `═ ${sel.name}` : sel.name}</div>
                  {sel.spouse && <p className="muted small">{t.vamsaSpouse}</p>}
                  {sel.note && <p className="small">{sel.note}</p>}
                  {sel.ref && byRef.has(sel.ref) && (
                    <button className="btn ghost" onClick={() => goRef(sel.ref!)}>
                      <ArrowRight size={14} /> {t.vamsaGoTo(charts.find((c) => c.key === byRef.get(sel.ref!))?.title ?? sel.ref)}
                    </button>
                  )}
                  <div className="vamsa-sub">{t.vamsaLine}</div>
                  <ol className="vamsa-line small">
                    {line(sel).map((v) => (
                      <li key={v.key} className={v === sel ? "on" : ""}>
                        <button className="link-btn" onClick={() => setSel(v)}>
                          {v.spouse ? `═ ${v.name}` : v.name}
                        </button>
                      </li>
                    ))}
                  </ol>
                  {sel.children.length > 0 && <p className="muted small">{t.vamsaChildren(sel.children.filter((c) => !c.spouse).length + sel.children.filter((c) => c.spouse).reduce((s, m) => s + m.children.length, 0))}</p>}
                  <SbVerses key={sel.key} t={t} refs={sel.spouse ? sbRefs[keyOf(chart.key, sel)] ?? [] : sbRefs[keyOf(chart.key, sel)] ?? []} onOpenDoc={onOpenDoc} />
                  <div className="vamsa-sub">{t.vamsaRecords}</div>
                  {recordsOf(sel).length === 0 ? (
                    <p className="muted small">{t.vamsaNoRecords}</p>
                  ) : (
                    recordsOf(sel).map((p) => (
                      <button key={p.id} className="btn ghost vamsa-rec" onClick={() => onPerson(p.id)}>
                        <UserRound size={14} /> {p.name} <span className="muted small">#{p.id}</span>
                      </button>
                    ))
                  )}
                </>
              )}
              <p className="muted small vamsa-src">{t.vamsaSource}</p>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ViewProps {
  t: T;
  root: VNode;
  sel: VNode | null;
  jump: number;
  onSel: (v: VNode) => void;
  onRef: (ref: string) => void;
  recordsOf: (v: VNode) => PersonListItem[];
  refLabel: (ref: string) => string;
}

// ---- the list that folds
function VList({ t, root, sel, jump, onSel, onRef, recordsOf, refLabel }: ViewProps) {
  const [closed, setClosed] = useState<Set<string>>(new Set());
  const box = useRef<HTMLDivElement>(null);
  // a name picked elsewhere: open its line and show it
  useEffect(() => {
    if (!sel) return;
    setClosed((c) => {
      const n = new Set(c);
      for (let p = sel.parent; p; p = p.parent) n.delete(p.key);
      return n;
    });
    requestAnimationFrame(() => box.current?.querySelector(`[data-k="${sel.key}"]`)?.scrollIntoView({ block: "center" }));
  }, [jump]); // eslint-disable-line react-hooks/exhaustive-deps
  const keys = useMemo(() => {
    const out: string[] = [];
    const walk = (v: VNode) => (v.children.length && out.push(v.key), v.children.forEach(walk));
    walk(root);
    return out;
  }, [root]);
  const row = (v: VNode, depth: number): JSX.Element => {
    const open = !closed.has(v.key);
    const recs = v.spouse ? [] : recordsOf(v);
    return (
      <div key={v.key} className="vl-item">
        <div className={`vl-row${v.spouse ? " spouse" : ""}${sel === v ? " on" : ""}`} data-k={v.key} style={{ paddingLeft: depth * 18 }}>
          {v.children.length ? (
            <button
              className="icon-btn vl-fold"
              onClick={() =>
                setClosed((c) => {
                  const n = new Set(c);
                  if (n.has(v.key)) n.delete(v.key);
                  else n.add(v.key);
                  return n;
                })
              }
            >
              {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <span className="vl-fold" />
          )}
          <button className="vl-name" onClick={() => onSel(v)}>
            {v.spouse ? `═ ${v.name}` : v.name}
          </button>
          {v.note && <span className="muted small">— {v.note}</span>}
          {recs.length > 0 && (
            <span className="vl-rec" title={recs.map((p) => p.name).join("\n")}>
              <UserRound size={12} /> {recs.length}
            </span>
          )}
          {v.ref && (
            <button className="link-btn small" onClick={() => onRef(v.ref!)}>
              <ArrowRight size={12} /> {refLabel(v.ref)}
            </button>
          )}
        </div>
        {open && v.children.map((c) => row(c, depth + 1))}
      </div>
    );
  };
  return (
    <div className="tree-canvas vl" ref={box}>
      <div className="vl-bar">
        <button className="btn ghost" onClick={() => setClosed(new Set())}>
          <ChevronsUpDown size={14} /> {t.vamsaExpand}
        </button>
        <button className="btn ghost" onClick={() => setClosed(new Set(keys.filter((k) => k !== root.key)))}>
          <ChevronsDownUp size={14} /> {t.vamsaCollapse}
        </button>
      </div>
      {row(root, 0)}
    </div>
  );
}

// ---- the drawing, like «Linaje»
function VDraw({ t, root, sel, jump, onSel, onRef, refLabel }: ViewProps) {
  const graph = useMemo(() => {
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: "TB", nodesep: 14, ranksep: 46, marginx: 10, marginy: 10 });
    g.setDefaultEdgeLabel(() => ({}));
    const list: VNode[] = [];
    const walk = (v: VNode) => {
      list.push(v);
      g.setNode(v.key, { width: W, height: H });
      for (const c of v.children) {
        walk(c);
        g.setEdge(v.key, c.key, { weight: c.spouse ? 4 : 1 });
      }
    };
    walk(root);
    dagre.layout(g);
    const at = new Map(list.map((v) => [v.key, g.node(v.key) as { x: number; y: number }]));
    const nodes = list.map((v) => ({ v, x: at.get(v.key)!.x - W / 2, y: at.get(v.key)!.y - H / 2 }));
    const lines = list.flatMap((v) =>
      v.children.map((c) => {
        const a = at.get(v.key)!;
        const b = at.get(c.key)!;
        const [y1, y2] = [a.y + H / 2, b.y - H / 2];
        const bend = Math.max(18, (y2 - y1) / 2);
        return { key: c.key, spouse: !!c.spouse, d: `M${a.x},${y1} C${a.x},${y1 + bend} ${b.x},${y2 - bend} ${b.x},${y2}` };
      }),
    );
    const width = Math.max(...nodes.map((n) => n.x + W)) + 20;
    const height = Math.max(...nodes.map((n) => n.y + H)) + 20;
    return { nodes, lines, width, height };
  }, [root]);

  const canvas = useRef<HTMLDivElement>(null);
  const [zoom, setZoomState] = useState(() => {
    const v = Number(get("bio.vamsaZoom"));
    return Number.isFinite(v) && v > 0 ? Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, v)) : 1;
  });
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
    put("bio.vamsaZoom", String(next));
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
  // show the name picked (or the top of the tree)
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const n = graph.nodes.find((x) => x.v === sel) ?? graph.nodes[0];
    requestAnimationFrame(() => {
      el.scrollLeft = (n.x + W / 2 + 10) * zoomRef.current - el.clientWidth / 2;
      el.scrollTop = (n.y + H / 2 + 10) * zoomRef.current - (sel ? el.clientHeight / 2 : 30);
    });
  }, [jump, graph]); // eslint-disable-line react-hooks/exhaustive-deps
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
    const up = () => (el.classList.remove("panning"), window.removeEventListener("mousemove", move), window.removeEventListener("mouseup", up));
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };
  const short = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
  return (
    <div className="vamsa-draw">
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
          onClick={() => {
            const el = canvas.current;
            if (!el) return;
            setZoom(Math.min(1, (el.clientWidth - 20) / graph.width, (el.clientHeight - 20) / graph.height));
            requestAnimationFrame(() => el.scrollTo(0, 0));
          }}
        >
          <Maximize size={15} /> {t.treeFit}
        </button>
        <span className="muted small">{t.vamsaClickHint}</span>
      </div>
      <div className="tree-canvas" ref={canvas} onMouseDown={pan}>
        <svg width={graph.width * zoom} height={graph.height * zoom} viewBox={`-10 -10 ${graph.width} ${graph.height}`}>
          {graph.lines.map((l) => (
            <path key={l.key} className={`tree-link${l.spouse ? " vamsa-marriage" : ""}`} d={l.d} />
          ))}
          {graph.nodes.map(({ v, x, y }) => (
            <g
              key={v.key}
              className={`tree-node lin-node${v.spouse ? " vamsa-spouse" : ""}${v === sel ? " lit-self" : ""}${v.ref ? " vamsa-ref" : ""}`}
              transform={`translate(${x},${y})`}
              onClick={(e) => e.detail === 1 && onSel(v)}
              onDoubleClick={() => v.ref && onRef(v.ref)}
            >
              <title>{`${v.spouse ? "═ " : ""}${v.name}${v.note ? `\n${v.note}` : ""}${v.ref ? `\n→ ${refLabel(v.ref)}` : ""}`}</title>
              <rect width={W} height={H} rx={6} />
              <text x={10} y={21}>
                {short(`${v.spouse ? "═ " : ""}${v.name}`, 24)}
                {v.ref ? " →" : ""}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

// ---- the verses of the Bhāgavatam of one name
function SbVerses({ t, refs, onOpenDoc }: { t: T; refs: string[]; onOpenDoc: (docId: number, ordinal: number) => void }) {
  const [all, setAll] = useState(false);
  const shown = all ? refs : refs.slice(0, 6);
  const [verses, setVerses] = useState<Map<string, Verse | null | undefined>>(new Map());
  useEffect(() => {
    let live = true;
    (async () => {
      for (const r of shown) {
        if (verses.has(r)) continue;
        const v = await verseOf(r).catch(() => null);
        if (!live) return;
        setVerses((m) => new Map(m).set(r, v));
      }
    })();
    return () => {
      live = false;
    };
  }, [shown.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps
  const short = (s: string) => (s.length > 320 ? s.slice(0, 319) + "…" : s);
  return (
    <>
      <div className="vamsa-sub">{t.vamsaSb}</div>
      {refs.length === 0 ? (
        <p className="muted small">{t.vamsaSbNone}</p>
      ) : (
        <>
          <p className="muted small">{t.vamsaSbHint}</p>
          {shown.map((r) => {
            const v = verses.get(r);
            return (
              <div key={r} className="vamsa-verse small">
                <button className="link-btn" disabled={!v} onClick={() => v && onOpenDoc(v.docId, v.ordinal)}>
                  SB {r}
                </button>{" "}
                {v === undefined && !verses.has(r) ? <span className="muted">{t.vamsaSbLoading}</span> : v === undefined ? <span className="muted">{t.vamsaSbMissing}</span> : v === null ? "" : short(v.text)}
              </div>
            );
          })}
          {!all && refs.length > shown.length && (
            <button className="btn ghost small" onClick={() => setAll(true)}>
              {t.vamsaSbMore(refs.length)}
            </button>
          )}
        </>
      )}
    </>
  );
}
