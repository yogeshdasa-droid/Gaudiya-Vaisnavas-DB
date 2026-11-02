import { memo, useEffect, useMemo, useRef, useState } from "react";
import { BookMarked, ChevronRight, FileText, Folder, FolderOpen, History, Library as LibIcon, Search, Star, Trash2, Upload, UserPlus, Users, X } from "lucide-react";
import { api, Bookmark, DocListItem, hueOf, isNamesake, Marks, PersonListItem, sortDisciples, TreePlace } from "../api";
import { foldWord } from "../fold";
import { possibleRepeats } from "./Review";
import { Lang, T } from "../i18n";

export type SideTab = "persons" | "library" | "bookmarks" | "history";

/** A text or record to show in its tree (`n` tells two requests apart). */
export type Reveal = { kind: "doc" | "person"; id: number; n: number };
// the last request handled: the lists are mounted again on each tab change
let revealed = 0;

/** Scrolls the sidebar to a row and makes it blink, once it is drawn. */
function scrollToRow(selector: string) {
  window.setTimeout(() => {
    const row = document.querySelector<HTMLElement>(`.sidebar ${selector}`);
    if (!row) return;
    row.scrollIntoView({ block: "center" });
    row.classList.remove("flash");
    void row.offsetWidth;
    row.classList.add("flash");
  }, 60);
}

export const foldName = (s: string) =>
  s
    .split(/[\s,.;:()\-–—]+/)
    .filter(Boolean)
    .map(foldWord)
    .join(" ");

/** Titles that do not tell namesakes apart ("Kṛṣṇadāsa Kavirāja" goes with the other Kṛṣṇadāsas). */
const NAMESAKE_TITLES = new Set(
  ["sri", "srila", "srimati", "gosvami", "goswami", "thakura", "thakur", "prabhu", "babaji", "maharaja", "pandita", "pandit", "acarya", "kaviraja", "mahasaya", "bhattacarya", "misra", "brahmacari", "adhikari", "devi", "mata", "swami", "svami"].map(foldWord),
);

/** Key that puts namesakes together: the first name without titles, with its
 *  "dāsa" ("Kṛṣṇa dāsa" = "Kṛṣṇadāsa"; all the Jagannāthas but the Jagannātha
 *  dāsas together), without "a"s. */
function namesakeKey(name: string): string {
  const words = foldName(name).split(" ").filter((w) => w && !NAMESAKE_TITLES.has(w));
  if (!words.length) return foldName(name);
  const key = /^dasa?$/.test(words[1] ?? "") ? words[0] + words[1] : words[0];
  return key.replace(/a/g, "");
}

/** The words of `namesakeKey` as they are written: "Kṛṣṇa dāsa", "Jagannātha". */
function namesakeLabel(name: string): string {
  const words = name.split(/[\s,.;:()\-–—]+/).filter((w) => w && !NAMESAKE_TITLES.has(foldWord(w)));
  if (!words.length) return name;
  return /^dasa?$/.test(foldWord(words[1] ?? "")) ? `${words[0]} ${words[1]}` : words[0];
}

// ---------------------------------------------------------------- library tree

interface Node {
  key: string;
  name: string;
  dir: string;
  folders: Node[];
  docs: DocListItem[];
  count: number;
}

function buildTree(docs: DocListItem[]): Node[] {
  const root: Node = { key: "", name: "", dir: "", folders: [], docs: [], count: 0 };
  const index = new Map<string, Node>([["", root]]);
  const get = (dir: string): Node => {
    let n = index.get(dir);
    if (n) return n;
    const cut = dir.lastIndexOf("/");
    const parent = get(cut < 0 ? "" : dir.slice(0, cut));
    n = { key: dir, name: dir.slice(cut + 1), dir, folders: [], docs: [], count: 0 };
    parent.folders.push(n);
    index.set(dir, n);
    return n;
  };
  for (const d of docs) get(d.dir).docs.push(d);
  const finish = (n: Node): number => {
    n.folders.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));
    n.count = n.docs.length + n.folders.reduce((s, c) => s + finish(c), 0);
    return n.count;
  };
  finish(root);
  return root.folders;
}

interface TreeProps {
  nodes: Node[];
  docs?: DocListItem[];
  depth: number;
  open: Set<string>;
  toggle: (k: string) => void;
  activeDir: string | null;
  activeDocId: number | null;
  onFolder: (dir: string) => void;
  onDoc: (id: number) => void;
  lang: Lang;
}

const Tree = memo(function Tree(p: TreeProps) {
  const { nodes, docs, depth, open, toggle, activeDir, activeDocId, onFolder, onDoc, lang } = p;
  return (
    <>
      {nodes.map((n) => {
        const isOpen = open.has(n.key);
        const hue = depth === 0 ? hueOf(n.name) : null;
        return (
          <div key={n.key}>
            <div
              data-ctx="folder"
              data-dir={n.dir}
              className={`tree-row ${depth === 0 ? "lib" : "folder"} ${activeDir === n.dir ? "active" : ""}`}
              style={{ paddingLeft: 6 + depth * 14, ...(hue !== null ? ({ "--h": hue } as React.CSSProperties) : {}) }}
              onClick={() => {
                toggle(n.key);
                onFolder(n.dir);
              }}
            >
              <ChevronRight size={14} className={`caret ${isOpen ? "open" : ""}`} />
              {depth === 0 ? <LibIcon size={16} /> : isOpen ? <FolderOpen size={16} /> : <Folder size={16} />}
              <span className="name">{n.name}</span>
              <span className="count">{n.count.toLocaleString(lang)}</span>
            </div>
            <div className={`tree-children ${isOpen ? "open" : ""}`}>
              {isOpen && <Tree {...p} nodes={n.folders} docs={n.docs} depth={depth + 1} />}
            </div>
          </div>
        );
      })}
      {docs?.map((d) => (
        <div
          key={d.id}
          data-ctx="doc"
          data-id={d.id}
          className={`tree-row doc ${activeDocId === d.id ? "active" : ""}`}
          style={{ paddingLeft: 6 + depth * 14 + 14 }}
          onClick={() => onDoc(d.id)}
          title={d.title}
        >
          <FileText size={14} />
          <span className="name">{d.title}</span>
        </div>
      ))}
    </>
  );
});

// ---------------------------------------------------------------- persons

type Drop = { kind: "inside" | "before" | "after"; target: number } | { kind: "root" } | { kind: "out" };

interface Drag {
  id: number;
  name: string;
  x: number;
  y: number;
  drop: Drop | null;
}

function useStoredSet<K>(key: string) {
  const [s, setS] = useState<Set<K>>(() => {
    try {
      return new Set<K>(JSON.parse(localStorage.getItem("bio." + key) ?? "[]"));
    } catch {
      return new Set<K>();
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("bio." + key, JSON.stringify([...s]));
    } catch {
      /* storage unavailable */
    }
  }, [key, s]);
  const toggle = (k: K, on?: boolean) =>
    setS((old) => {
      const n = new Set(old);
      if (on ?? !n.has(k)) n.add(k);
      else n.delete(k);
      return n;
    });
  return [s, toggle] as const;
}

function PersonList({
  t,
  lang,
  persons,
  activeId,
  onPerson,
  onMove,
  tag,
  onTag,
  docs,
  activeDocId,
  onDoc,
  reveal,
  marks,
  onMark,
}: {
  t: T;
  lang: Lang;
  persons: PersonListItem[];
  marks: Marks;
  onMark: (id: number) => void;
  activeId: number | null;
  onPerson: (id: number) => void;
  onMove: (id: number, place: TreePlace) => void;
  tag: string | null;
  onTag: (tag: string | null) => void;
  docs: DocListItem[];
  activeDocId: number | null;
  onDoc: (id: number) => void;
  reveal: Reveal | null;
}) {
  const [filter, setFilter] = useState("");
  const [fieldHits, setFieldHits] = useState<number[]>([]);
  const [closedGroups, toggleGroup] = useStoredSet<string>("personGroups");
  const [closed, toggleNode] = useStoredSet<number>("treeClosed");
  const [drag, setDrag] = useState<Drag | null>(null);
  const dragged = useRef(false);
  // records that may be repeated: their names in red, to merge them
  const [distinct, setDistinct] = useState<[number, number][]>([]);
  useEffect(() => void api.listDistinct().then(setDistinct, () => {}), [persons]);
  const repeats = useMemo(() => possibleRepeats(persons, distinct), [persons, distinct]);

  // Names are filtered here; the records' other fields by the database.
  useEffect(() => {
    if (filter.trim().length < 3) return setFieldHits([]);
    const h = window.setTimeout(() => api.searchPersons(filter).then(setFieldHits).catch(() => setFieldHits([])), 200);
    return () => window.clearTimeout(h);
  }, [filter]);

  const tagsOf = (p: PersonListItem) => p.tags.split(",").map((x) => x.trim()).filter(Boolean);
  const allTags = useMemo(() => {
    const count = new Map<string, number>();
    for (const p of persons) for (const tg of tagsOf(p)) count.set(tg, (count.get(tg) ?? 0) + 1);
    return [...count].sort((a, b) => a[0].localeCompare(b[0], undefined, { sensitivity: "base" }));
  }, [persons]);

  const shown = useMemo(() => {
    const words = foldName(filter).split(" ").filter(Boolean);
    const tagged = tag ? persons.filter((p) => tagsOf(p).includes(tag)) : persons;
    if (!words.length) return tagged;
    const extra = new Set(fieldHits);
    return tagged.filter((p) => words.every((w) => ` ${foldName(`${p.name} ${p.aka}`)}`.includes(` ${w}`)) || extra.has(p.id));
  }, [filter, tag, persons, fieldHits]);

  // collections that are not about people (Bhajans & Kirtans…): a group of
  // their own after the records, with their texts
  const topics = useMemo(() => {
    const by = new Map<string, DocListItem[]>();
    for (const d of docs) {
      const col = d.dir.split("/")[0];
      by.set(col, [...(by.get(col) ?? []), d]);
    }
    return [...by]
      .filter(([, ds]) => ds.every((d) => d.personId === null))
      .map(([name, ds]) => [name, [...ds].sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: "base" }))] as const)
      .sort((a, b) => a[0].localeCompare(b[0], undefined, { sensitivity: "base" }));
  }, [docs]);

  // the Guru Paramparā: the disciples of each record, in their order
  const { kids, parentOf, others } = useMemo(() => {
    const ids = new Set(persons.filter((p) => p.tree).map((p) => p.id));
    const kids = new Map<number | null, PersonListItem[]>();
    const parentOf = new Map<number, number | null>();
    for (const p of persons) {
      if (!p.tree) continue;
      const parent = p.tree.parent !== null && ids.has(p.tree.parent) ? p.tree.parent : null;
      parentOf.set(p.id, parent);
      kids.set(parent, [...(kids.get(parent) ?? []), p]);
    }
    sortDisciples(kids);
    return { kids, parentOf, others: persons.filter((p) => !p.tree && !isNamesake(p)) };
  }, [persons]);

  // the Namesakes (many Haridāsas, Govindas…): each name with its people,
  // under the name as written in them
  const namesakes = useMemo(() => {
    const by = new Map<string, PersonListItem[]>();
    for (const p of persons.filter(isNamesake)) {
      const k = namesakeKey(p.name);
      by.set(k, [...(by.get(k) ?? []), p]);
    }
    return [...by.values()]
      .map((g) => {
        const sorted = [...g].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
        return { label: namesakeLabel(sorted[0].name), people: sorted };
      })
      .sort((a, b) => foldName(a.label).localeCompare(foldName(b.label)));
  }, [persons]);

  const rows = useMemo(() => {
    // guides: for each guru above, whether more of his disciples come below (a line goes on down)
    const out: { p: PersonListItem; depth: number; hasKids: boolean; guides: boolean[]; last: boolean }[] = [];
    const walk = (parent: number | null, depth: number, guides: boolean[]) => {
      const list = kids.get(parent) ?? [];
      list.forEach((p, i) => {
        const hasKids = (kids.get(p.id)?.length ?? 0) > 0;
        const last = i === list.length - 1;
        out.push({ p, depth, hasKids, guides, last });
        if (hasKids && !closed.has(p.id)) walk(p.id, depth + 1, depth ? [...guides, !last] : guides);
      });
    };
    walk(null, 0, []);
    return out;
  }, [kids, closed]);

  // a deep tree in a narrow panel: the levels come closer so that the names
  // are always seen (from INDENT down to MIN_INDENT px a level)
  const treeBox = useRef<HTMLDivElement>(null);
  const [treeW, setTreeW] = useState(0);
  useEffect(() => {
    const el = treeBox.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setTreeW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, [closedGroups, filter, tag]);
  const deepest = rows.reduce((m, r) => Math.max(m, r.depth), 0);
  const indent = treeW && deepest ? Math.max(MIN_INDENT, Math.min(INDENT, Math.floor((treeW - NAME_ROOM) / deepest))) : INDENT;
  // and if even so it does not fit, the tree slides sideways to the row clicked
  const [pan, setPan] = useState(0);
  const shift = treeW && 4 + deepest * indent + NAME_ROOM > treeW ? pan : 0;
  const follow = (depth: number) => {
    const start = 4 + depth * indent;
    setPan(Math.max(0, start + NAME_ROOM - treeW, Math.min(shift, start - 2 * indent)));
  };

  // "show in the tree": no filter, its group and its gurus open
  useEffect(() => {
    if (!reveal || reveal.kind !== "person" || reveal.n === revealed) return;
    revealed = reveal.n;
    setFilter("");
    if (tag) onTag(null);
    if (parentOf.has(reveal.id)) {
      toggleGroup("tree", false);
      for (let x = parentOf.get(reveal.id); x != null; x = parentOf.get(x)) toggleNode(x, false);
    } else toggleGroup("other", false);
    scrollToRow(`[data-ctx="person"][data-id="${reveal.id}"]`);
  }, [reveal, parentOf]); // eslint-disable-line react-hooks/exhaustive-deps

  const isWithin = (id: number, ancestor: number) => {
    for (let x: number | null | undefined = id; x != null; x = parentOf.get(x)) if (x === ancestor) return true;
    return false;
  };

  // ---- drag and drop, done with the mouse: the window's own drag and drop
  // is taken by the import of files
  const dropAt = (x: number, y: number, id: number): Drop | null => {
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-drop]");
    if (!el) return null;
    const kind = el.dataset.drop;
    if (kind === "root") return { kind: "root" };
    if (kind === "out") return parentOf.has(id) ? { kind: "out" } : null;
    const target = Number(el.dataset.id);
    if (isWithin(target, id)) return null;
    const r = el.getBoundingClientRect();
    const f = (y - r.top) / r.height;
    return { kind: f < 0.28 ? "before" : f > 0.72 ? "after" : "inside", target };
  };

  const startDrag = (e: React.MouseEvent, p: PersonListItem) => {
    if (e.button !== 0 || filter) return;
    const x0 = e.clientX;
    const y0 = e.clientY;
    const scroller = (e.currentTarget as HTMLElement).closest(".side-scroll");
    let current: Drag | null = null;
    let last = { x: x0, y: y0 };
    // near the top or bottom edge the list scrolls by itself
    const scroll = window.setInterval(() => {
      if (!current || !scroller) return;
      const r = scroller.getBoundingClientRect();
      const dy = last.y < r.top + 36 ? -14 : last.y > r.bottom - 36 ? 14 : 0;
      if (dy) scroller.scrollBy(0, dy);
    }, 30);
    const move = (ev: MouseEvent) => {
      last = { x: ev.clientX, y: ev.clientY };
      if (!current && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 6) return;
      current = { id: p.id, name: p.name, x: ev.clientX, y: ev.clientY, drop: dropAt(ev.clientX, ev.clientY, p.id) };
      document.body.classList.add("dragging-person");
      setDrag(current);
    };
    const end = (ev: MouseEvent | KeyboardEvent) => {
      if (ev instanceof KeyboardEvent && ev.key !== "Escape") return;
      window.clearInterval(scroll);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", end);
      window.removeEventListener("keydown", end);
      document.body.classList.remove("dragging-person");
      setDrag(null);
      if (!current) return;
      dragged.current = true; // the click that ends a drag does not open the record
      window.setTimeout(() => (dragged.current = false), 0);
      const d = current.drop;
      if (ev instanceof KeyboardEvent || !d) return;
      if (d.kind === "out") return onMove(p.id, null);
      if (d.kind === "root") return onMove(p.id, { parent: null, before: null });
      if (d.kind === "inside") {
        toggleNode(d.target, false);
        return onMove(p.id, { parent: d.target, before: null });
      }
      const parent = parentOf.get(d.target) ?? null;
      const sibs = (kids.get(parent) ?? []).map((s) => s.id).filter((s) => s !== p.id);
      const at = sibs.indexOf(d.target) + (d.kind === "after" ? 1 : 0);
      onMove(p.id, { parent, before: sibs[at] ?? null });
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", end);
    window.addEventListener("keydown", end);
  };

  const dropLabel = (d: Drop) => {
    if (d.kind === "root") return t.dropRoot;
    if (d.kind === "out") return t.dropOut;
    const n = persons.find((x) => x.id === d.target)?.name ?? "";
    return d.kind === "inside" ? t.dropInside(n) : d.kind === "before" ? t.dropBefore(n) : t.dropAfter(n);
  };
  const dropClass = (id: number) => (drag?.drop && "target" in drag.drop && drag.drop.target === id ? ` drop-${drag.drop.kind}` : "");

  const personRow = (p: PersonListItem, inTree = false, caret?: React.ReactNode, depth = 0, lines?: React.ReactNode) => (
    <div
      data-ctx="person"
      data-id={p.id}
      data-drop={inTree ? "node" : "out"}
      data-like={repeats.get(p.id)?.map((x) => x.id).join(",")}
      className={`tree-row person${activeId === p.id ? " active" : ""}${drag?.id === p.id ? " dragged" : ""}${inTree ? dropClass(p.id) : ""}${marks[p.id] ? ` mark-${marks[p.id]}` : ""}${repeats.has(p.id) ? " repeated" : ""}`}
      style={inTree ? { paddingLeft: 4 + depth * indent, marginLeft: -shift } : undefined}
      onMouseDown={(e) => startDrag(e, p)}
      onClick={() => {
        if (dragged.current) return;
        if (inTree) follow(depth);
        onPerson(p.id);
      }}
      onDoubleClick={() => onMark(p.id)}
      title={(p.aka ? `${p.name} · ${p.aka}` : p.name) + (repeats.has(p.id) ? `\n${t.maybeRepeated(repeats.get(p.id)!.map((x) => x.name).join(", "))}` : "")}
    >
      {lines}
      {caret}
      <span className="name">{p.name}</span>
      {inTree && p.tree && p.tree.parent !== null && <span className={`tree-kind ${p.tree.kind}`}>{t.treeKindShort[p.tree.kind]}</span>}
      {inTree && p.links.length > 0 && (
        <span
          className="tree-kind siksa"
          title={t.moreGurusOf(p.links.map((l) => `${persons.find((x) => x.id === l.guru)?.name ?? "?"} (${t.treeKindShort[l.kind]})`).join(", "))}
        >
          + {[...new Set(p.links.map((l) => t.treeKindShort[l.kind]))].join(", ")}
        </span>
      )}
      {p.docs > 1 && <span className="count">{p.docs.toLocaleString(lang)}</span>}
    </div>
  );

  const groupHead = (key: string, label: string, n: number, drop?: "root" | "out", hint?: string, open = !closedGroups.has(key)) => (
    <div data-drop={drop} className={`group-head${drop && drag?.drop?.kind === drop ? " drop-hot" : ""}`} title={hint} onClick={() => toggleGroup(key)}>
      <ChevronRight size={14} className={`caret ${open ? "open" : ""}`} />
      <span className="name">{label}</span>
      <span className="count">{n.toLocaleString(lang)}</span>
    </div>
  );

  let letter = "";
  return (
    <div className="fade-in">
      <div className="person-filter">
        <Search size={14} />
        <input value={filter} placeholder={t.filterPersons} title={t.filterPersonsHint} spellCheck={false} onChange={(e) => setFilter(e.target.value)} />
        {filter && (
          <button className="icon-btn" onClick={() => setFilter("")}>
            <X size={13} />
          </button>
        )}
      </div>
      {allTags.length > 0 && (
        <div className="tag-filter">
          <select value={tag ?? ""} onChange={(e) => onTag(e.target.value || null)} title={t.tags}>
            <option value="">
              {t.tags}: {t.allTags}
            </option>
            {allTags.map(([tg, n]) => (
              <option key={tg} value={tg}>
                #{tg} ({n})
              </option>
            ))}
          </select>
        </div>
      )}
      {filter || tag ? (
        <>
          {shown.length === 0 && <div className="side-empty">{t.noPersons}</div>}
          {shown.map((p) => (
            <div key={p.id}>{personRow(p)}</div>
          ))}
        </>
      ) : (
        <>
          {groupHead("tree", t.parampara, parentOf.size, "root", t.paramparaHint)}
          {!closedGroups.has("tree") && (
            <div className="parampara" ref={treeBox}>
              {rows.map(({ p, depth, hasKids, guides, last }) => (
                <div key={p.id}>
                  {personRow(
                    p,
                    true,
                    hasKids ? (
                      <ChevronRight
                        size={13}
                        className={`caret ${closed.has(p.id) ? "" : "open"}`}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          follow(depth + (closed.has(p.id) ? 1 : 0));
                          toggleNode(p.id);
                        }}
                      />
                    ) : (
                      <span className="caret-space" />
                    ),
                    depth,
                    depth > 0 && treeLines(guides, last, p.tree?.kind ?? "diksa", indent),
                  )}
                </div>
              ))}
              {rows.length === 0 && (
                <div data-drop="root" className={`side-empty small${drag?.drop?.kind === "root" ? " drop-hot" : ""}`}>
                  {t.paramparaEmpty}
                </div>
              )}
            </div>
          )}
          {groupHead("namesakes", t.namesakes, namesakes.reduce((n, g) => n + g.people.length, 0), undefined, t.namesakesHint)}
          {!closedGroups.has("namesakes") &&
            (namesakes.length === 0 ? (
              <div className="side-empty small">{t.namesakesEmpty}</div>
            ) : (
              namesakes.map((g) => (
                <div key={g.label}>
                  <div className="letter namesake-head">{g.label}</div>
                  {g.people.map((p) => (
                    <div key={p.id}>{personRow(p)}</div>
                  ))}
                </div>
              ))
            ))}
          {groupHead("other", t.otherVaisnavas, others.length, "out")}
          {!closedGroups.has("other") && (
            <div data-drop="out" className={drag?.drop?.kind === "out" ? "drop-zone-hot" : ""}>
              {others.map((p) => {
                const first = foldWord(p.name.trim()[0] ?? "#").toUpperCase() || "#";
                const header = first !== letter ? (letter = first) : null;
                return (
                  <div key={p.id}>
                    {header && <div className="letter">{header}</div>}
                    {personRow(p)}
                  </div>
                );
              })}
            </div>
          )}
          {topics.map(([name, ds]) => (
            <div key={name}>
              {/* these start folded: the key is stored when opened */}
              {groupHead(`col:${name}`, name, ds.length, undefined, undefined, closedGroups.has(`col:${name}`))}
              {closedGroups.has(`col:${name}`) &&
                ds.map((d) => (
                  <div
                    key={d.id}
                    data-ctx="doc"
                    data-id={d.id}
                    className={`tree-row doc${activeDocId === d.id ? " active" : ""}`}
                    onClick={() => onDoc(d.id)}
                    title={d.title}
                  >
                    <FileText size={14} />
                    <span className="name">{d.title}</span>
                  </div>
                ))}
            </div>
          ))}
        </>
      )}
      {drag && (
        <div className="drag-ghost" style={{ left: drag.x + 14, top: drag.y + 10 }}>
          <div className="drag-name">{drag.name}</div>
          {drag.drop && <div className="drag-where">{dropLabel(drag.drop)}</div>}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- sidebar

interface Props {
  t: T;
  lang: Lang;
  tab: SideTab;
  onTab: (t: SideTab) => void;
  persons: PersonListItem[];
  activePersonId: number | null;
  onPerson: (id: number) => void;
  onNewPerson: () => void;
  onMovePerson: (id: number, place: TreePlace) => void;
  docs: DocListItem[];
  activeDir: string | null;
  activeDocId: number | null;
  onFolder: (dir: string) => void;
  onDoc: (id: number, ordinal?: number) => void;
  onImport: () => void;
  bookmarks: Bookmark[];
  onBookmarkNote: (id: number, note: string) => void;
  onBookmarkDelete: (id: number) => void;
  history: string[];
  onHistory: (q: string) => void;
  onClearHistory: () => void;
  tag: string | null;
  onTag: (tag: string | null) => void;
  reveal: Reveal | null;
  marks: Marks;
  onMark: (id: number) => void;
}

/** Indent of each level of the Guru Paramparā, in px. */
const INDENT = 16;
/** The least indent, when the tree is deep and the panel narrow. */
const MIN_INDENT = 6;
/** Room kept for the caret, the name and its relation at the deepest level, in px. */
const NAME_ROOM = 210;

/** The lines from a guru down to his disciples: │ for each guru above whose
 *  disciples go on below, and ├ or └ joining the row to its own guru. */
function treeLines(guides: boolean[], last: boolean, kind: string, indent: number) {
  // the middle of the caret of a guru at level i
  const x = (i: number) => 4 + i * indent + 6;
  return (
    <span className="tree-lines" aria-hidden>
      {guides.map((on, i) => (on ? <span key={i} className="tl-down" style={{ left: x(i) }} /> : null))}
      {/* up to this row: drawn as its relation (solid / dashed / dotted); on down: the next disciples */}
      <span className={`tl-down tl-half tl-${kind}`} style={{ left: x(guides.length) }} />
      {!last && <span className="tl-down tl-rest" style={{ left: x(guides.length) }} />}
      <span className={`tl-across tl-${kind}`} style={{ left: x(guides.length), width: Math.max(indent - 6, 4) }} />
    </span>
  );
}

export function Sidebar(p: Props) {
  const { t } = p;
  const tree = useMemo(() => buildTree(p.docs), [p.docs]);
  const [open, setOpen] = useState<Set<string>>(new Set());
  // find in the library tree: only the branches with matching folders or titles, all open
  const [libFilter, setLibFilter] = useState("");
  const found = useMemo(() => {
    const words = foldName(libFilter).split(" ").filter(Boolean);
    if (!words.length) return null;
    const docs = p.docs.filter((d) => {
      const hay = ` ${foldName(`${d.title} ${d.dir.split("/").join(" ")}`)}`;
      return words.every((w) => hay.includes(` ${w}`));
    });
    const nodes = buildTree(docs);
    const keys = new Set<string>();
    const all = (ns: Node[]) => ns.forEach((n) => (keys.add(n.key), all(n.folders)));
    all(nodes);
    return { nodes, keys };
  }, [libFilter, p.docs]);

  useEffect(() => {
    const r = p.reveal;
    if (!r || r.kind !== "doc" || r.n === revealed) return;
    const d = p.docs.find((x) => x.id === r.id);
    if (!d) return;
    revealed = r.n;
    setLibFilter("");
    setOpen((s) => {
      const n = new Set(s);
      const parts = d.dir.split("/");
      parts.forEach((_, i) => n.add(parts.slice(0, i + 1).join("/")));
      return n;
    });
    if (p.tab !== "library") p.onTab("library");
    scrollToRow(`[data-ctx="doc"][data-id="${d.id}"]`);
  }, [p.reveal]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (p.reveal?.kind === "person" && p.reveal.n !== revealed && p.tab !== "persons") p.onTab("persons");
  }, [p.reveal]); // eslint-disable-line react-hooks/exhaustive-deps
  const [editing, setEditing] = useState<number | null>(null);
  const toggle = (k: string) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });

  const tabs: [SideTab, typeof LibIcon, string][] = [
    ["persons", Users, t.persons],
    ["library", LibIcon, t.library],
    ["bookmarks", Star, t.bookmarks],
    ["history", History, t.history],
  ];

  return (
    <aside className="sidebar">
      <nav className="tabs four">
        {tabs.map(([k, I, label]) => (
          <button key={k} className={p.tab === k ? "active" : ""} onClick={() => p.onTab(k)} title={label}>
            <I size={15} />
            <span>{label}</span>
          </button>
        ))}      </nav>

      <div className="side-scroll" key={p.tab}>
        {p.tab === "persons" && (
          <PersonList
            t={t}
            lang={p.lang}
            persons={p.persons}
            activeId={p.activePersonId}
            onPerson={p.onPerson}
            onMove={p.onMovePerson}
            tag={p.tag}
            onTag={p.onTag}
            docs={p.docs}
            activeDocId={p.activeDocId}
            onDoc={(id) => p.onDoc(id)}
            reveal={p.reveal}
            marks={p.marks}
            onMark={p.onMark}
          />
        )}

        {p.tab === "library" && (
          <div className="fade-in">
            <div className="person-filter">
              <Search size={14} />
              <input value={libFilter} placeholder={t.filterLibrary} title={t.filterLibraryHint} spellCheck={false} onChange={(e) => setLibFilter(e.target.value)} />
              {libFilter && (
                <button className="icon-btn" onClick={() => setLibFilter("")}>
                  <X size={13} />
                </button>
              )}
            </div>
            {found && found.nodes.length === 0 && <div className="side-empty">{t.noLibMatches}</div>}
            <Tree
              nodes={found ? found.nodes : tree}
              depth={0}
              open={found ? found.keys : open}
              toggle={found ? () => {} : toggle}
              activeDir={p.activeDir}
              activeDocId={p.activeDocId}
              onFolder={p.onFolder}
              onDoc={(id) => p.onDoc(id)}
              lang={p.lang}
            />
          </div>
        )}

        {p.tab === "bookmarks" &&
          (p.bookmarks.length === 0 ? (
            <div className="side-empty">
              <BookMarked size={28} />
              <p>{t.noBookmarks}</p>
            </div>
          ) : (
            <div className="fade-in">
              {p.bookmarks.map((b) => (
                <div key={b.id} data-ctx="bookmark" data-id={b.id} className={`bookmark ${b.docId ? "" : "stale"}`}>
                  <div className="bm-head" onClick={() => b.docId && p.onDoc(b.docId, b.ordinal)}>
                    <div className="bm-title">{b.title}</div>
                    {b.heading && b.heading.toLowerCase() !== b.title.toLowerCase() && <div className="bm-sub">§ {b.heading}</div>}
                  </div>
                  {editing === b.id ? (
                    <textarea
                      autoFocus
                      defaultValue={b.note}
                      placeholder={t.notePlaceholder}
                      onBlur={(e) => {
                        setEditing(null);
                        if (e.target.value !== b.note) p.onBookmarkNote(b.id, e.target.value);
                      }}
                    />
                  ) : (
                    <div className={`bm-note ${b.note ? "" : "placeholder"}`} onClick={() => setEditing(b.id)}>
                      {b.note || t.notePlaceholder}
                    </div>
                  )}
                  <div className="bm-date">{b.created}</div>
                  <button className="icon-btn bm-del" title={t.delete} onClick={() => p.onBookmarkDelete(b.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          ))}

        {p.tab === "history" &&
          (p.history.length === 0 ? (
            <div className="side-empty">
              <History size={28} />
              <p>{t.noHistory}</p>
            </div>
          ) : (
            <div className="fade-in">
              {p.history.map((q) => (
                <div key={q} className="tree-row" onClick={() => p.onHistory(q)}>
                  <Search size={14} />
                  <span className="name">{q}</span>
                </div>
              ))}
              <button className="link-btn" onClick={p.onClearHistory}>
                {t.clearHistory}
              </button>
            </div>
          ))}
      </div>

      {(p.tab === "persons" || p.tab === "library") && (
        <div className="side-actions">
          <button onClick={p.onNewPerson}>
            <UserPlus size={15} /> {t.newPerson}
          </button>
          <button onClick={p.onImport} title={t.importHint}>
            <Upload size={15} /> {t.importFiles}
          </button>
        </div>
      )}
    </aside>
  );
}
