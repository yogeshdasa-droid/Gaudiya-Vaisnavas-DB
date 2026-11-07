import { memo, useEffect, useMemo, useRef, useState } from "react";
import { BookMarked, ChevronRight, ChevronsDownUp, ChevronsUpDown,MapPin, Plus, FileText, Folder, FolderOpen, History, Library as LibIcon, Search, Star, Trash2, Upload, UserPlus, Users, X } from "lucide-react";
import { api, Bookmark, DocListItem, hueOf, isPoet, Marks, PersonListItem, Place, sortDisciples, TreeKind, TreePlace } from "../api";
import { foldWord } from "../fold";
import { arrange, TreeLine } from "./TreeView";
import { possibleRepeats } from "./Review";
import { Lang, T } from "../i18n";

export type SideTab = "persons" | "places" | "library" | "bookmarks" | "history";

/** A text or record to show in its tree (`n` tells two requests apart). */
export type Reveal = { kind: "doc" | "person"; id: number; n: number };
// the last request handled: the lists are mounted again on each tab change
let revealed = 0;
// "Other Vaiṣṇavas" starts folded each time the app opens: the Guru Paramparā is the focus
let otherFolded = false;

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

type Drop = { kind: "inside" | "before" | "after"; target: number } | { kind: "folder"; target: number; fk: FolderKind } | { kind: "root" } | { kind: "out" };

/** Under each guru of the tree, the pārṣadas and the śikṣā disciples go in a
 *  folder of their own, closed at first (Whisper, 05-11-2026). Only a way of
 *  showing the list: nothing is stored but which folders are open. */
type FolderKind = "siksa" | "associate" | "disciples" | "diksa";
const FOLDERS: FolderKind[] = ["associate", "siksa"];
/** A guru with more disciples than this: those without disciples of their own
 *  go in a folder «Disciples»; those with disciples stay under him (Whisper, 06-11-2026). */
const MANY_DISCIPLES = 4;
const LINES: TreeLine[] = ["all", "diksa", "siksa"];
const folderOf = (k: TreeKind | undefined): FolderKind | null => (k === "associate" ? "associate" : k === "siksa" || k === "vani" ? "siksa" : null);
const folderKey = (parent: number, fk: FolderKind) => `${parent}:${fk}`;

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
  return [s, toggle, setS] as const;
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
  onMove: (id: number, place: TreePlace, kind?: TreeKind) => void;
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
  const [closed, toggleNode, setClosed] = useStoredSet<number>("treeClosed");
  // the folders of pārṣadas / śikṣā that are open (they start closed)
  const [openFolders, toggleFolder, setOpenFolders] = useStoredSet<string>("treeFoldersOpen");
  // the whole tree, or only the dīkṣā or the śikṣā line (as in the drawn tree)
  const [line, setLineState] = useState<TreeLine>(() => {
    try {
      const v = localStorage.getItem("bio.sideTreeLine") as TreeLine | null;
      return v && LINES.includes(v) ? v : "all";
    } catch {
      return "all";
    }
  });
  const setLine = (l: TreeLine) => {
    setLineState(l);
    try {
      localStorage.setItem("bio.sideTreeLine", l);
    } catch {
      /* storage unavailable */
    }
  };
  // «collapse back» (Whisper, 06-11-2026): the gurus between the first of the
  // line and this one in one row, so that he and his disciples are seen at once
  const [back, setBackState] = useState<number | null>(() => {
    try {
      return Number(localStorage.getItem("bio.sideTreeBack")) || null;
    } catch {
      return null;
    }
  });
  const setBack = (id: number | null) => {
    setBackState(id);
    try {
      if (id) localStorage.setItem("bio.sideTreeBack", String(id));
      else localStorage.removeItem("bio.sideTreeBack");
    } catch {
      /* storage unavailable */
    }
  };
  useEffect(() => {
    if (otherFolded) return;
    otherFolded = true;
    toggleGroup("other", true);
    toggleGroup("poets", true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
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

  // typing in the filter: the list from its top, where the names found are
  const listRoot = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let el = listRoot.current?.parentElement ?? null;
    while (el && !/(auto|scroll)/.test(getComputedStyle(el).overflowY)) el = el.parentElement;
    el?.scrollTo({ top: 0 });
  }, [filter]);

  // the records with that name first; below, those that only name it in their
  // fields or notes (else the one looked for is lost among them)
  const { shown, mentions } = useMemo(() => {
    // a record's number («1139» or «#1139»): that record, whatever its tags
    const num = /^\s*#?\s*(\d+)\s*$/.exec(filter);
    if (num) return { shown: persons.filter((p) => p.id === Number(num[1])), mentions: [] };
    const words = foldName(filter).split(" ").filter(Boolean);
    const tagged = tag ? persons.filter((p) => tagsOf(p).includes(tag)) : persons;
    if (!words.length) return { shown: tagged, mentions: [] };
    // and in each, those of the Guru Paramparā first
    const treeFirst = (ps: PersonListItem[]) => [...ps].sort((a, b) => Number(!a.tree) - Number(!b.tree));
    const named = tagged.filter((p) => words.every((w) => ` ${foldName(`${p.name} ${p.aka}`)}`.includes(` ${w}`)));
    const ids = new Set(named.map((p) => p.id));
    const extra = new Set(fieldHits);
    return { shown: treeFirst(named), mentions: treeFirst(tagged.filter((p) => extra.has(p.id) && !ids.has(p.id))) };
  }, [filter, tag, persons, fieldHits]);

  // the places whose name, spellings, district or text have all the words
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
  // (in a line view each one goes under its guru of that line, as in the drawn tree)
  const { kids, parentOf, kindOf, others, poets } = useMemo(() => {
    const ids = new Set(persons.filter((p) => p.tree).map((p) => p.id));
    const kids = new Map<number | null, PersonListItem[]>();
    const parentOf = new Map<number, number | null>();
    const kindOf = new Map<number, TreeKind | null>();
    const under = line === "all" ? null : arrange(persons, line).under;
    for (const p of persons) {
      if (!p.tree) continue;
      let parent: number | null;
      if (under) {
        const u = under.get(p.id);
        if (!u) continue;
        parent = u.parent;
        kindOf.set(p.id, u.kind);
      } else {
        parent = p.tree.parent !== null && ids.has(p.tree.parent) ? p.tree.parent : null;
        kindOf.set(p.id, parent !== null ? p.tree.kind : null);
      }
      parentOf.set(p.id, parent);
      kids.set(parent, [...(kids.get(parent) ?? []), p]);
    }
    sortDisciples(kids);
    const out = persons.filter((p) => !p.tree);
    // the poets with no clear guru have a group of their own, out of the Vaiṣṇava-maṇḍala
    const poets = out.filter(isPoet).sort((a, b) => foldName(a.name).localeCompare(foldName(b.name)));
    return { kids, parentOf, kindOf, others: out.filter((p) => !isPoet(p)), poets };
  }, [persons, line]);

  // the Vaiṣṇava-maṇḍala (everyone outside the tree) by name: the many
  // Haridāsas, Govindas… together, under the name as written in them
  const mandala = useMemo(() => {
    const by = new Map<string, PersonListItem[]>();
    for (const p of others) {
      const k = namesakeKey(p.name);
      by.set(k, [...(by.get(k) ?? []), p]);
    }
    return [...by.values()]
      .map((g) => {
        const sorted = [...g].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
        return { label: namesakeLabel(sorted[0].name), people: sorted };
      })
      .sort((a, b) => foldName(a.label).localeCompare(foldName(b.label)));
  }, [others]);

  const rows = useMemo(() => {
    // guides: for each guru above, whether more of his disciples come below (a line goes on down)
    type Row =
      | { type: "person"; p: PersonListItem; depth: number; hasKids: boolean; guides: boolean[]; last: boolean }
      | { type: "folder"; parent: number; fk: FolderKind; n: number; depth: number; guides: boolean[]; last: boolean; open: boolean }
      | { type: "skip"; n: number; names: string; depth: number };
    const out: Row[] = [];
    const person = (p: PersonListItem, depth: number, guides: boolean[], last: boolean) => {
      const hasKids = (kids.get(p.id)?.length ?? 0) > 0;
      out.push({ type: "person", p, depth, hasKids, guides, last });
      if (hasKids && !closed.has(p.id)) walk(p.id, depth + 1, depth ? [...guides, !last] : guides);
    };
    const walk = (parent: number | null, depth: number, guides: boolean[]) => {
      const list = kids.get(parent) ?? [];
      // the first level has no guru: no folders there; and one with disciples of his own
      // stays in sight (Mahāprabhu is Kṛṣṇa's śikṣā disciple: the whole tree would be hidden)
      // (only in the whole tree: a line view is already one kind)
      const fold = (p: PersonListItem) => (line !== "all" || parent === null || kids.has(p.id) ? null : folderOf(kindOf.get(p.id) ?? undefined));
      let main = list.filter((p) => !fold(p));
      const folders: (readonly [FolderKind, PersonListItem[]])[] = FOLDERS.map((fk) => [fk, list.filter((p) => fold(p) === fk)] as const).filter(([, ps]) => ps.length);
      // many disciples: those without disciples in a folder of their own, the others in sight
      if (parent !== null && main.length > MANY_DISCIPLES) {
        const leaves = main.filter((p) => !kids.has(p.id));
        if (leaves.length > 1) {
          main = main.filter((p) => kids.has(p.id));
          folders.push(["disciples", leaves]);
        }
        // and many dīkṣā disciples who have disciples of their own: in a folder «Dīkṣā»
        // (Bhaktisiddhānta Sarasvatī: Prabhupāda, Keśava, Bon…; Whisper, 07-11-2026)
        const lines = main.filter((p) => kids.has(p.id) && (kindOf.get(p.id) ?? "diksa") === "diksa");
        if (lines.length > MANY_DISCIPLES) {
          main = main.filter((p) => !lines.includes(p));
          folders.push(["diksa", lines]);
        }
      }
      // the folders first, just under their guru (at the end it is not clear whose they are)
      const count = main.length + folders.length;
      folders.forEach(([fk, ps], j) => {
        const last = j === count - 1;
        const open = openFolders.has(folderKey(parent!, fk));
        out.push({ type: "folder", parent: parent!, fk, n: ps.length, depth, guides, last, open });
        const inner = depth ? [...guides, !last] : guides;
        if (open) ps.forEach((p, i) => person(p, depth + 1, inner, i === ps.length - 1));
      });
      main.forEach((p, i) => person(p, depth, guides, folders.length + i === count - 1));
    };
    // collapsed back: the first of his line, «⋯ n more above ⋯», and he with his disciples
    const up: number[] = [];
    if (back !== null && parentOf.has(back)) for (let x: number | null | undefined = back; x != null; x = parentOf.get(x)) up.push(x);
    const byId = (id: number) => persons.find((p) => p.id === id);
    const top = up.length > 2 ? byId(up[up.length - 1]) : undefined;
    const focus = up.length > 2 ? byId(back!) : undefined;
    if (top && focus) {
      out.push({ type: "person", p: top, depth: 0, hasKids: true, guides: [], last: true });
      const hidden = up.slice(1, -1).reverse();
      out.push({ type: "skip", n: hidden.length, names: hidden.map((id) => byId(id)?.name ?? "?").join(" → "), depth: 1 });
      person(focus, 1, [], true);
    } else walk(null, 0, []);
    return out;
  }, [kids, kindOf, closed, openFolders, line, back, parentOf, persons]);
  const backOn = rows[1]?.type === "skip";

  // the menu's «collapse back» (App.tsx) comes as an event: the row is ours
  useEffect(() => {
    const on = (e: Event) => {
      const id = (e as CustomEvent<number>).detail;
      toggleNode(id, false);
      setBack(id);
      setPan(0);
      scrollToRow(`[data-ctx="person"][data-id="${id}"]`);
    };
    window.addEventListener("bio:tree-back", on);
    return () => window.removeEventListener("bio:tree-back", on);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // and back to the whole line, with him in sight
  const unBack = () => {
    const id = back;
    setBack(null);
    if (id === null) return;
    for (let x = parentOf.get(id); x != null; x = parentOf.get(x)) toggleNode(x, false);
    scrollToRow(`[data-ctx="person"][data-id="${id}"]`);
  };

  // open or close the whole tree at once (Whisper: «Dīkṣā» and then everything open, to see it well)
  const expandAll = () => {
    setBack(null);
    setClosed(new Set());
    const keys = new Set<string>();
    for (const [parent, list] of kids)
      if (parent !== null) {
        keys.add(folderKey(parent, "disciples"));
        keys.add(folderKey(parent, "diksa"));
        if (line === "all")
          for (const p of list) {
            const fk = kids.has(p.id) ? null : folderOf(kindOf.get(p.id) ?? undefined);
            if (fk) keys.add(folderKey(parent, fk));
          }
      }
    setOpenFolders(keys);
  };
  const collapseAll = () => {
    setBack(null);
    setClosed(new Set([...kids.keys()].filter((k): k is number => k !== null)));
    setOpenFolders(new Set());
  };

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
    // not in this line view: the whole tree (it comes back here with the new list)
    if (line !== "all" && !parentOf.has(reveal.id) && persons.find((q) => q.id === reveal.id)?.tree) {
      revealed = -1;
      return setLine("all");
    }
    if (parentOf.has(reveal.id)) {
      // collapsed back and he is not under that one: the whole line again
      if (back !== null && !isWithin(reveal.id, back)) setBack(null);
      toggleGroup("tree", false);
      for (let x = parentOf.get(reveal.id); x != null; x = parentOf.get(x)) toggleNode(x, false);
      // and the folders on the way (pārṣadas / śikṣā)
      for (let x: number | null | undefined = reveal.id; x != null; x = parentOf.get(x)) {
        const up = parentOf.get(x);
        const fk = folderOf(persons.find((q) => q.id === x)?.tree?.kind);
        if (up != null && fk) toggleFolder(folderKey(up, fk), true);
        // (one without disciples may be in the folder «Disciples» of his guru)
        if (up != null && !kids.has(x)) toggleFolder(folderKey(up, "disciples"), true);
      }
    } else {
      const q = persons.find((x) => x.id === reveal.id);
      toggleGroup(q && isPoet(q) ? "poets" : "other", false);
    }
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
    if (kind === "folder") return { kind: "folder", target, fk: el.dataset.fk as FolderKind };
    const r = el.getBoundingClientRect();
    const f = (y - r.top) / r.height;
    return { kind: f < 0.28 ? "before" : f > 0.72 ? "after" : "inside", target };
  };

  const startDrag = (e: React.MouseEvent, p: PersonListItem) => {
    // (in a line view the places are not the real ones: no dragging there)
    if (e.button !== 0 || filter || line !== "all") return;
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
      // into a folder: that relation (a vāṇī disciple stays vāṇī in the śikṣā one)
      // (into «Disciples»: as it was, or dīkṣā if it was a pārṣada / śikṣā)
      const asFolder = (fk: FolderKind): TreeKind | undefined =>
        fk === "diksa"
          ? p.tree?.kind === "diksa" ? undefined : "diksa"
          : fk === "disciples"
          ? folderOf(p.tree?.kind) ? "diksa" : undefined
          : folderOf(p.tree?.kind) === fk ? undefined : fk === "associate" ? "associate" : "siksa";
      if (d.kind === "folder") {
        toggleNode(d.target, false);
        toggleFolder(folderKey(d.target, d.fk), true);
        return onMove(p.id, { parent: d.target, before: null }, asFolder(d.fk));
      }
      const parent = parentOf.get(d.target) ?? null;
      const sibs = (kids.get(parent) ?? []).map((s) => s.id).filter((s) => s !== p.id);
      const at = sibs.indexOf(d.target) + (d.kind === "after" ? 1 : 0);
      // next to one in a folder: into that folder; next to one outside the folders: out of them
      const targetKind = persons.find((x) => x.id === d.target)?.tree?.kind;
      // (only those without disciples of their own are in the folders)
      const tf = parent === null || kids.has(d.target) ? null : folderOf(targetKind);
      const inFolder = !kids.has(p.id) && folderOf(p.tree?.kind);
      const kind = tf ? asFolder(tf) : parent !== null && inFolder ? targetKind : undefined;
      onMove(p.id, { parent, before: sibs[at] ?? null }, kind);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", end);
    window.addEventListener("keydown", end);
  };

  const dropLabel = (d: Drop) => {
    if (d.kind === "root") return t.dropRoot;
    if (d.kind === "out") return t.dropOut;
    const n = persons.find((x) => x.id === d.target)?.name ?? "";
    if (d.kind === "folder") return t.dropFolder(t.treeFolder[d.fk], n);
    return d.kind === "inside" ? t.dropInside(n) : d.kind === "before" ? t.dropBefore(n) : t.dropAfter(n);
  };
  const dropClass = (id: number) =>
    drag?.drop && "target" in drag.drop && drag.drop.kind !== "folder" && drag.drop.target === id ? ` drop-${drag.drop.kind}` : "";
  const folderHot = (parent: number, fk: FolderKind) => drag?.drop?.kind === "folder" && drag.drop.target === parent && drag.drop.fk === fk;

  const personRow = (p: PersonListItem, inTree = false, caret?: React.ReactNode, depth = 0, lines?: React.ReactNode) => (
    <div
      data-ctx="person"
      data-id={p.id}
      data-drop={inTree ? "node" : "out"}
      data-like={repeats.get(p.id)?.map((x) => x.id).join(",")}
      data-back={inTree && back !== p.id && parentOf.get(parentOf.get(p.id) ?? -1) != null ? "1" : undefined}
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
      {inTree && kindOf.get(p.id) && <span className={`tree-kind ${kindOf.get(p.id)}`}>{t.treeKindShort[kindOf.get(p.id)!]}</span>}
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
    <div className="fade-in" ref={listRoot}>
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
          {shown.length === 0 && mentions.length === 0 && <div className="side-empty">{t.noPersons}</div>}
          {shown.map((p) => (
            <div key={p.id}>{personRow(p)}</div>
          ))}
          {mentions.length > 0 && (
            <>
              <div className="letter mentions-head" title={t.filterMentionsHint}>
                {t.filterMentions} <span className="count">{mentions.length}</span>
              </div>
              {mentions.map((p) => (
                <div key={p.id}>{personRow(p)}</div>
              ))}
            </>
          )}

        </>
      ) : (
        <>
          {groupHead("tree", t.parampara, parentOf.size, "root", t.paramparaHint)}
          {!closedGroups.has("tree") && (
            <div className="seg side-tree-line">
              {LINES.map((l) => (
                <button key={l} className={line === l ? "on" : ""} title={t.treeLineHint[l]} onClick={() => setLine(l)}>
                  {t.sideTreeLine[l]}
                </button>
              ))}
            </div>
          )}
          {!closedGroups.has("tree") && (
            <div className="side-tree-fold">
              <button className="btn ghost small" title={t.expandAllHint} onClick={expandAll}>
                <ChevronsUpDown size={13} /> {t.expandAll}
              </button>
              <button className="btn ghost small" title={t.collapseAllHint} onClick={collapseAll}>
                <ChevronsDownUp size={13} /> {t.collapseAll}
              </button>
            </div>
          )}
          {!closedGroups.has("tree") && (
            <div className="parampara" ref={treeBox}>
              {rows.map((r) => {
                if (r.type === "folder") {
                  const { parent, fk, n, depth, guides, last, open } = r;
                  return (
                    <div key={`f${parent}:${fk}`}>
                      <div
                        data-drop="folder"
                        data-id={parent}
                        data-fk={fk}
                        className={`tree-row tree-folder ${fk}${folderHot(parent, fk) ? " drop-inside" : ""}`}
                        style={{ paddingLeft: 4 + depth * indent, marginLeft: -shift }}
                        title={t.treeFolderHint[fk]}
                        onClick={() => {
                          follow(depth + (open ? 0 : 1));
                          toggleFolder(folderKey(parent, fk));
                        }}
                      >
                        {depth > 0 && treeLines(guides, last, fk, indent)}
                        <ChevronRight size={13} className={`caret ${open ? "open" : ""}`} />
                        {open ? <FolderOpen size={14} className="folder-icon" /> : <Folder size={14} className="folder-icon" />}
                        <span className="name">{t.treeFolder[fk]}</span>
                        <span className="count">{n.toLocaleString(lang)}</span>
                      </div>
                    </div>
                  );
                }
                if (r.type === "skip") {
                  return (
                    <div key="skip">
                      <div
                        className="tree-row tree-skip"
                        style={{ paddingLeft: 4 + r.depth * indent, marginLeft: -shift }}
                        title={t.treeSkippedHint(r.names)}
                        onClick={unBack}
                      >
                        {treeLines([], false, "diksa", indent)}
                        <span className="caret-space" />
                        <span className="name">{t.treeSkipped(r.n)}</span>
                      </div>
                    </div>
                  );
                }
                const { p, depth, hasKids, guides, last } = r;
                // collapsed back, the first of the line is open: its caret shows the whole line again
                const backTop = backOn && depth === 0;
                const isClosed = !backTop && closed.has(p.id);
                return (
                <div key={p.id}>
                  {personRow(
                    p,
                    true,
                    hasKids ? (
                      <ChevronRight
                        size={13}
                        className={`caret ${isClosed ? "" : "open"}`}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (backTop) return unBack();
                          follow(depth + (isClosed ? 1 : 0));
                          toggleNode(p.id);
                        }}
                      />
                    ) : (
                      <span className="caret-space" />
                    ),
                    depth,
                    depth > 0 && treeLines(guides, last, kindOf.get(p.id) ?? "diksa", indent),
                  )}
                </div>
                );
              })}
              {rows.length === 0 && (
                <div data-drop="root" className={`side-empty small${drag?.drop?.kind === "root" ? " drop-hot" : ""}`}>
                  {t.paramparaEmpty}
                </div>
              )}
            </div>
          )}
          {groupHead("other", t.otherVaisnavas, others.length, "out", t.otherVaisnavasHint)}
          {!closedGroups.has("other") && (
            <div data-drop="out" className={drag?.drop?.kind === "out" ? "drop-zone-hot" : ""}>
              {mandala.map((g) => {
                const first = foldWord(g.label.trim()[0] ?? "#").toUpperCase() || "#";
                const header = first !== letter ? (letter = first) : null;
                return (
                  <div key={g.label + g.people[0].id}>
                    {header && <div className="letter">{header}</div>}
                    {g.people.length > 1 ? (
                      <div className="namesake-group">
                        <div className="namesake-head">
                          {g.label} <span className="count">{g.people.length}</span>
                        </div>
                        {g.people.map((p) => (
                          <div key={p.id}>{personRow(p)}</div>
                        ))}
                      </div>
                    ) : (
                      personRow(g.people[0])
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {poets.length > 0 && groupHead("poets", t.poets, poets.length, undefined, t.poetsHint)}
          {poets.length > 0 && !closedGroups.has("poets") && (
            <div>
              {poets.map((p) => (
                <div key={p.id}>{personRow(p)}</div>
              ))}
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

// ---------------------------------------------------------------- tīrthas

/** The holy places, by name as in a dictionary (Āṭapura with the A's), with a filter
 *  that also looks in their spellings, district and text. */
function PlaceList({ t, lang, places, activeId, onPlace }: { t: T; lang: Lang; places: Place[]; activeId: number | null; onPlace: (id: number) => void }) {
  const [filter, setFilter] = useState("");
  const sorted = useMemo(() => [...places].sort((a, b) => foldName(a.name).localeCompare(foldName(b.name))), [places]);
  const shown = useMemo(() => {
    const words = foldName(filter).split(" ").filter(Boolean);
    if (!words.length) return sorted;
    return sorted.filter((pl) => {
      const f = ` ${foldName(`${pl.name} ${pl.aka} ${pl.region} ${pl.location} ${pl.about}`)}`;
      return words.every((w) => f.includes(` ${w}`));
    });
  }, [filter, sorted]);
  let letter = "";
  return (
    <div className="fade-in">
      <div className="person-filter">
        <Search size={14} />
        <input value={filter} placeholder={t.filterPlaces} title={t.placesHint} spellCheck={false} onChange={(e) => setFilter(e.target.value)} />
        {filter && (
          <button className="icon-btn" onClick={() => setFilter("")}>
            <X size={13} />
          </button>
        )}
      </div>
      {places.length === 0 && <div className="side-empty">{t.placesEmpty}</div>}
      {places.length > 0 && shown.length === 0 && <div className="side-empty">{t.noPlaces}</div>}
      {shown.length > 0 && (
        <div className="letter mentions-head">
          {t.tirthas} <span className="count">{shown.length.toLocaleString(lang)}</span>
        </div>
      )}
      {shown.map((pl) => {
        const first = foldWord(pl.name.trim()[0] ?? "#").toUpperCase() || "#";
        const header = !filter && first !== letter ? (letter = first) : null;
        return (
          <div key={pl.id}>
            {header && <div className="letter">{header}</div>}
            <div
              data-ctx="place"
              data-id={pl.id}
              className={`tree-row person place${activeId === pl.id ? " active" : ""}`}
              onClick={() => onPlace(pl.id)}
              title={[pl.name, pl.aka, pl.region].filter(Boolean).join(" · ")}
            >
              <MapPin size={13} className="place-icon" />
              <span className="name">{pl.name}</span>
              {pl.region && <span className="place-region">{pl.region.split(",")[0]}</span>}
            </div>
          </div>
        );
      })}
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
  onMovePerson: (id: number, place: TreePlace, kind?: TreeKind) => void;
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
  places: Place[];
  activePlaceId: number | null;
  onPlace: (id: number) => void;
  onNewPlace: () => void;
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
    ["persons", Users, t.vaisnavas],
    ["places", MapPin, t.tirthas],
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

        {p.tab === "places" && <PlaceList t={t} lang={p.lang} places={p.places} activeId={p.activePlaceId} onPlace={p.onPlace} />}

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

      {p.tab === "places" && (
        <div className="side-actions">
          <button onClick={p.onNewPlace}>
            <Plus size={15} /> {t.newPlace}
          </button>
        </div>
      )}
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
