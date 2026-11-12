import { useEffect, useMemo, useRef, useState } from "react";
import { open, save } from "@tauri-apps/plugin-dialog";
import { ArrowUp, BookOpen, MapPin, ChevronDown, ChevronLeft, ChevronRight, Star, Combine, FileDown, FilePlus2, Printer, FileText, Folder, GitFork, GitMerge, Globe, History, ImagePlus, Images, ListTree, LocateFixed, MoreHorizontal, Network, Pencil, Route, Search, TextSearch, Trash2, Undo2, UserPlus, UserRound, Users, X } from "lucide-react";
import { api, fileUrl, isNamesake, LifeSpan, MAIN_TEXT, NAMESAKES, Place, Person, PersonListItem, SectionText, TocEntry, TREE_KINDS, TreeKind } from "../api";
import { formatSize, Lang, T } from "../i18n";
import { ask, CollectionChip } from "./ui";
import { ReaderStyle, SectionView } from "./Reader";
import type { NameIndex } from "../personLinks";
import type { Term } from "../fold";
import { foldName } from "./Sidebar";
import { placesOfPerson } from "../places";
import { journeysOf } from "./journeys";
import { linkKind, linkLabel, splitNotes } from "../notesLinks";

/** Titles that come and go after a name: "Rupa" = "Rupa Gosvami". */
const TITLES = new Set(
  ["sri", "srila", "srimati", "gosvami", "goswami", "thakura", "thakur", "dasa", "das", "prabhu", "babaji", "pandita", "pandit", "acarya", "acharya", "maharaja", "swami", "svami", "devi", "mata", "thakurani", "kaviraja", "mahasaya", "bhattacarya", "misra", "puri", "bharati"].map(foldName),
);

/** Name without titles and final "a"s: the core used to suggest merges. */
export function coreName(name: string): string {
  return foldName(name)
    .split(" ")
    .filter((w) => w && !TITLES.has(w))
    .map((w) => (w.length > 3 && w.endsWith("a") ? w.slice(0, -1) : w))
    .join(" ");
}

interface Props {
  id: number;
  reload: number;
  t: T;
  lang: Lang;
  persons: PersonListItem[];
  onPerson: (id: number) => void;
  onOpenDoc: (docId: number) => void;
  /** a bookmark at this part of a text (the star of the reader) */
  onBookmark: (docId: number, ordinal: number) => void;
  onEdit: (p: Person) => void;
  onMerge: (p: Person, suggested: number[]) => void;
  onDelete: (p: Person) => void;
  onVersions: (p: Person) => void;
  onTag: (tag: string) => void;
  onAddText: (p: Person) => void;
  onFindMentions: (p: Person) => void;
  onSearchIn: (p: Person) => void;
  onEditDoc: (docId: number, ordinal?: number) => void;
  /** «Crear ficha con esta entrada»: a new record with this piece in its notes, taken out of the text */
  onNewFromText: (docId: number, fragment: string, notes: string, source: string) => void;
  onGuru: (p: Person) => void;
  onReveal: (p: Person) => void;
  /** opens the drawn Paramparā Tree with this record in the middle, lit up */
  onShowInTree: (p: Person) => void;
  /** «Ver linaje»: its gurus and disciples in the Lineage view */
  onShowLineage: (p: Person) => void;
  /** open Panorama › Map with one of the record's journeys (journeys.ts) */
  onShowJourney: (id: string) => void;
  onPhotoChanged: () => void;
  onToast: (msg: string) => void;
  /** some records were called different people: the lists that mark repeated ones are read again */
  onDistinct: () => void;
  readerStyle: ReaderStyle;
  fontSize: number;
  names: NameIndex | null;
  places: Place[];
  onPlace: (id: number) => void;
}

const NO_TERMS: Term[] = [];

/** The first lines of a text that only repeat the record's name or the part's
 *  title ("ĪŚVARA PURĪ", "ŚRĪ ĪŚVARA PURĪ"): they are already in the bar above. */
function withoutRepeatedTitles(s: SectionText, names: string[]): SectionText {
  const cores = new Set(names.map(coreName).filter(Boolean));
  const lines = s.text.split("\n");
  let i = 0;
  for (; i < lines.length; i++) {
    const l = lines[i].replace(/^[\s#>*_]+|[\s*_:.]+$/g, "");
    if (l && (l.length > 80 || !cores.has(coreName(l)))) break;
  }
  const text = lines.slice(i).join("\n");
  return text.trim() ? { ...s, text } : s;
}

/** A list of names as written in a field: split at the commas that are not
 *  inside brackets ("X (harināma, dīkṣā), Y" is two names). */
function splitList(value: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of value) {
    if (ch === "(") depth++;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if ((ch === "," || ch === "\n") && depth === 0) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim().replace(/[,;.]+$/, "").trim()).filter(Boolean);
}

/** A name as compared inside one record's lists: without "Śrī", the final
 *  "a"s or what follows its first two words ("Kṛṣṇadāsa Kavirāj Gosvāmī" =
 *  "Śrī Kṛṣṇadāsa Kavirāja Gosvāmī"). */
const HONORIFICS = new Set(foldName("Śrī Śrīla Śrīmatī Śrīmad Sri Srila").split(" "));
function looseName(s: string): string {
  return foldName(s.replace(/\([^)]*\)/g, "").split(/[;:]/)[0])
    .split(" ")
    .filter((w) => w && !HONORIFICS.has(w))
    .map((w) => w.replace(/a$/, ""))
    .slice(0, 2)
    .join(" ");
}

const plainFold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
/** "(śikṣā)" and the like after a name: the kind of relation written in the record. */
const KIND_LABEL = /\s*\((dīkṣā|śikṣā|sannyāsa|vāṇī|veśa|bābājī veśa|pārṣada|asociado|associate|diksa|siksa|sannyasa|vani|vesa|disciple|discípulo)\)\s*/gi;
function kindOf(item: string): TreeKind | "" {
  const label = /\(([^)]*)\)/.exec(item)?.[1];
  if (!label) return "";
  const l = plainFold(label);
  if (/\bvani\b/.test(l)) return "vani";
  if (/\bsiksa\b/.test(l)) return "siksa";
  if (/\bsannyasa\b/.test(l)) return "sannyasa";
  if (/\bvesa\b/.test(l)) return "vesa";
  if (/\b(parsada|asociado|associate)\b/.test(l)) return "associate";
  if (/\bdiksa\b/.test(l)) return "diksa";
  if (/\b(disciple|discipulo)\b/.test(l)) return "disciple";
  return "";
}
/** The names grouped by kind of relation, in the order of TREE_KINDS (no kind last). */
function byKind<N extends { kind: TreeKind | "" }>(list: N[]): [TreeKind | "", N[]][] {
  return ([...TREE_KINDS, ""] as (TreeKind | "")[])
    .map((k) => [k, list.filter((n) => n.kind === k)] as [TreeKind | "", N[]])
    .filter(([, l]) => l.length > 0);
}

/** More joined parts than this: one part at a time, as before. */
const MAX_CARD_PARTS = 40;
/** The pages of a PDF ("p. 3") are not people. */
const PAGE_MARK = /^p(age|ág)?\.?\s*\d+$/i;
/** Letters of a card seen before "Read all"; a shorter one is seen whole. */
const CARD_PREVIEW = 250;

interface Card {
  key: string;
  title: string;
  /** the part it is in, to edit it */
  ord: number;
  section: SectionText;
  preview: string;
  short: boolean;
  /** number of an earlier card that says the same (the text is repeated) */
  same: number | null;
  /** its lines in the part as stored [from, to), to delete it alone */
  raw: SectionText;
  from: number;
  to: number;
}

/** The text without Markdown marks, for the start of a card. */
function plainText(md: string): string {
  return md
    .replace(/^\s*(#{1,6}|>|[-*+])\s+/gm, "")
    .replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (_, a, b) => b || a)
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * The entries of a text, one per person: each joined part, cut again where a
 * heading only repeats the record's name ("## BALARĀMA DĀS" five times).
 */
function entriesOf(sections: SectionText[], names: string[]): Card[] {
  const out: Card[] = [];
  for (const s of sections) {
    const own = new Set([...names, s.heading ?? ""].map(coreName).filter(Boolean));
    const lines = s.text.split("\n");
    let cur: { title: string; lines: string[]; from: number } = { title: s.heading ?? "", lines: [], from: 0 };
    const flush = (to: number) => {
      const text = cur.lines.join("\n").trim();
      if (!text) return;
      // "Śrīvāsa - v.1" begins with a line "Śrīvāsa": the name without the version too
      const bare = [cur.title, s.heading ?? ""].map((x) => x.replace(/\s*[-–—]\s*v\.\s*\d+.*$/i, ""));
      const section = withoutRepeatedTitles({ ...s, text }, [...names, cur.title, s.heading ?? "", ...bare]);
      const plain = plainText(section.text);
      const short = plain.length <= CARD_PREVIEW + 60;
      const cut = plain.slice(0, CARD_PREVIEW);
      const preview = short ? plain : cut.slice(0, Math.max(cut.lastIndexOf(" "), CARD_PREVIEW - 40)) + "…";
      // the same start (letters only) = the same entry written twice
      const start = (x: string) => foldName(x).replace(/\s/g, "").slice(0, 120);
      const earlier = out.findIndex((c) => start(c.preview) === start(preview));
      out.push({
        key: `${s.id}:${out.length}`,
        title: cur.title,
        ord: s.ordinal,
        section,
        preview,
        short,
        same: earlier >= 0 ? earlier + 1 : null,
        raw: s,
        from: cur.from,
        to,
      });
    };
    lines.forEach((line, i) => {
      const m = /^#{1,6}\s+(.+?)\s*$/.exec(line);
      if (m && own.has(coreName(m[1]))) {
        flush(i);
        cur = { title: m[1], lines: [], from: i };
      } else cur.lines.push(line);
    });
    flush(lines.length);
  }
  return out;
}

/** "BALARĀMA DĀS" as the record writes it; other titles as they are. */
function cardTitle(title: string, name: string): string {
  const t = title.trim().replace(/[.:]+$/, "");
  if (!t) return name;
  const bare = (x: string) => coreName(x).replace(/\s/g, "");
  return t === t.toUpperCase() && bare(t) === bare(name) ? name : t;
}

/** How much of a single text is shown inside the record (the rest in the reader). */
const INLINE_SECTIONS = 4;

/** Links in a text (notes of a record or a place):
 *  - [word](<target>) or [word](https://…) → the word, opening the target (made with «Link…» in the editor);
 *  - web addresses (https://…) → opened in the browser;
 *  - a line that is a path of a file of the PC (E:\…\book.pdf, \\server\…, file:///…) → opened with its program.
 *  Exported for the tests. */
export function noteLinks(text: string): ({ text: string } | { text: string; target: string })[] {
  const re =
    /\[([^\]\n]+)\]\(<([^>\n]+)>\)|\[([^\]\n]+)\]\(((?:https?:\/\/|mailto:|file:\/\/\/)[^\s)]+)\)|(https?:\/\/[^\s<>"«»]+[^\s<>"«».,;:!?)\]])|(?<=^|\n)[ \t]*["“«]?((?:[A-Za-z]:[\\/]|\\\\|file:\/\/\/)[^\n"”»]*[^\s"”»])["”»]?[ \t]*(?=\n|$)/g;
  const out: ({ text: string } | { text: string; target: string })[] = [];
  let at = 0;
  for (const m of text.matchAll(re)) {
    if (m.index! > at) out.push({ text: text.slice(at, m.index) });
    if (m[1]) out.push({ text: m[1], target: m[2].trim() });
    else if (m[3]) out.push({ text: m[3], target: m[4] });
    else if (m[5]) out.push({ text: m[5], target: m[5] });
    else out.push({ text: m[6], target: m[6] });
    at = m.index! + m[0].length;
  }
  if (at < text.length) out.push({ text: text.slice(at) });
  return out;
}

/** «file:///E:/x%20y.pdf» → «E:/x y.pdf» (the opener wants a path). */
const openTarget = (t: string) => (t.startsWith("file:///") ? decodeURI(t.slice(8)) : t);

export function WebLinks({ text, onError }: { text: string; onError: (msg: string) => void }) {
  return (
    <>
      {noteLinks(text).map((p, i) =>
        "target" in p ? (
          <a
            key={i}
            href={/^(https?:|mailto:)/.test(p.target) ? p.target : "#"}
            className={/^(https?:|mailto:)/.test(p.target) ? "web-link" : "web-link file-link"}
            title={p.target}
            onClick={(e) => {
              e.preventDefault();
              api.openExternal(openTarget(p.target)).catch((err) => onError(String(err)));
            }}
          >
            {p.text}
          </a>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </>
  );
}

export function PersonView(p: Props) {
  const { t, lang } = p;
  const [person, setPerson] = useState<Person | null>(null);
  const [menu, setMenu] = useState(false);
  const [zoom, setZoom] = useState<number | null>(null);
  // «See journeys» (12-11-2026, Whisper): in place of «Paramparā…», which went into the «…» menu
  const trips = useMemo(() => journeysOf(p.id), [p.id]);
  const [tripMenu, setTripMenu] = useState(false);
  useEffect(() => {
    if (!tripMenu) return;
    const close = () => setTripMenu(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [tripMenu]);

  useEffect(() => {
    let cancelled = false;
    api
      .getPerson(p.id)
      .then((r) => !cancelled && setPerson(r))
      .catch((e) => p.onToast(String(e)));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.id, p.reload]);

  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [menu]);

  // folded name → id, to turn names written in the fields into links; the
  // name without titles ("Rupa" = "Rupa Gosvami") when only one record has it
  const byName = useMemo(() => {
    const m = new Map<string, number>();
    const cores = new Map<string, number | null>();
    for (const x of p.persons) {
      for (const n of [x.name, ...x.aka.split(",")].map((s) => s.trim()).filter(Boolean)) {
        m.set(foldName(n), x.id);
        const c = coreName(n);
        if (c) cores.set(c, cores.has(c) && cores.get(c) !== x.id ? null : x.id);
      }
    }
    return (name: string) => m.get(foldName(name)) ?? cores.get(coreName(name)) ?? undefined;
  }, [p.persons]);

  // pairs already called different people are not offered again
  const [distinct, setDistinct] = useState<[number, number][]>([]);
  useEffect(() => void api.listDistinct().then(setDistinct, () => {}), [p.id, p.persons]);
  const similar = useMemo(() => {
    if (!person) return [];
    const core = coreName(person.name);
    if (!core) return [];
    const apart = new Set(distinct.flatMap(([a, b]) => (a === person.id ? [b] : b === person.id ? [a] : [])));
    return p.persons.filter((x) => x.id !== person.id && !apart.has(x.id) && !isNamesake(x) && coreName(x.name) === core).slice(0, 8);
  }, [person, p.persons, distinct]);
  // who lived at the same time (the Guru Paramparā, by their years); a life
  // with one year known is taken as 60 years long
  const [spans, setSpans] = useState<LifeSpan[]>([]);
  useEffect(() => void api.timeline().then(setSpans, () => setSpans([])), [p.reload]);
  const contemporaries = useMemo(() => {
    const life = (l: LifeSpan) => [l.born ?? (l.died !== null ? l.died - 60 : 0), l.died ?? (l.born !== null ? l.born + 60 : 0)];
    const me = spans.find((l) => l.id === p.id);
    if (!me) return [];
    const [a, b] = life(me);
    return spans
      .filter((l) => l.id !== p.id && l.parampara)
      .map((l) => {
        const [c, d] = life(l);
        return { l, overlap: Math.min(b, d) - Math.max(a, c) };
      })
      .filter((x) => x.overlap > 0)
      .sort((x, y) => (x.l.born ?? x.l.died ?? 0) - (y.l.born ?? y.l.died ?? 0));
  }, [spans, p.id]);
  const years = (l: LifeSpan) => `${l.born ?? "?"}–${l.died ?? "?"}`;
  // merges into this record that can be undone (the newest first)
  const [merges, setMerges] = useState<{ id: number; saved: string; names: string[] }[]>([]);
  useEffect(() => void api.listMerges(p.id).then(setMerges, () => setMerges([])), [p.id, p.persons]);
  const recentMerge = merges.find((m) => Date.now() - new Date(m.saved.replace(" ", "T")).getTime() < 60 * 60 * 1000);
  const undoMerge = async (m: { id: number; names: string[] }) => {
    if (!(await ask(t.undoMergeConfirm(m.names.join(", "))))) return;
    try {
      await api.undoMerge(m.id);
      p.onToast(t.undoMergeDone(m.names.length));
      setPerson(await api.getPerson(p.id));
      p.onDistinct();
    } catch (e) {
      p.onToast(String(e));
    }
  };
  /** other people with the same name: to the "Namesakes" group, not proposed again */
  const toNamesakes = async (ids: number[]) => {
    try {
      await api.setTag(ids, NAMESAKES, true);
      p.onDistinct();
    } catch (e) {
      p.onToast(String(e));
    }
  };
  const joinMe = async () => {
    if (person && (await ask(t.joinOneConfirm(person.name)))) api.joinTexts(person.id).catch((e) => p.onToast(String(e)));
  };
  const notSame = async (which: PersonListItem[] = similar) => {
    if (!person) return;
    try {
      // each pair apart: the others may still be one person between them
      for (const s of which) await api.markDistinct([person.id, s.id]);
      setDistinct(await api.listDistinct());
      p.onDistinct();
    } catch (e) {
      p.onToast(String(e));
    }
  };

  // A record with a single text shows it right here, no click needed.
  // …or its main text («Texto principal»: all the versions in one, written for the record),
  // with the other versions below it, closed
  const main = person && person.id === p.id ? person.docs.find((d) => d.collection === MAIN_TEXT) ?? null : null;
  const single = main ?? (person && person.id === p.id && person.docs.length === 1 ? person.docs[0] : null);
  const otherVersions = main && person ? person.docs.filter((d) => d.id !== main.id) : [];
  const isMain = !!main;
  // the text of the record starts folded (Whisper, 07-11-2026): opened when it is to be read
  const [textOpen, setTextOpen] = useState(false);
  useEffect(() => setTextOpen(false), [p.id]);
  // with several parts (texts joined into one): one part at a time, chosen
  // in a bar like the reader's
  const [inline, setInline] = useState<{ docId: number; sections: SectionText[]; total: number; toc: TocEntry[]; ord: number; all: boolean } | null>(null);
  const [textReload, setTextReload] = useState(0);
  useEffect(() => {
    setInline(null);
    if (!single) return;
    let cancelled = false;
    api
      .getDoc(single.id)
      .then(async ({ doc, toc }) => {
        // joined parts (not the pages of a PDF): all of them, to be seen as cards
        const joined = doc.sections > 1 && toc.length > 1;
        const all = joined && doc.sections <= MAX_CARD_PARTS && !toc.some((e) => PAGE_MARK.test(e.heading ?? ""));
        // a main text is one text: all its parts (a long text is stored in several), read in a row
        const n = isMain ? doc.sections : all ? doc.sections : joined ? 1 : Math.min(doc.sections, INLINE_SECTIONS);
        const sections = n ? await api.getSections(doc.id, 0, n - 1) : [];
        if (!cancelled) setInline({ docId: doc.id, sections, total: doc.sections, toc, ord: 0, all });
      })
      .catch((e) => p.onToast(String(e)));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [single?.id, p.reload, textReload]);
  // several people of the same name (or several joined parts): one card each,
  // all in sight, each opened where it is
  const cards = useMemo(() => {
    if (!inline || !person || isMain) return null;
    const list = entriesOf(inline.sections, [person.name, single?.title ?? ""]);
    return (inline.all && list.length > 1) || (inline.total === 1 && list.length > 1) ? list : null;
  }, [inline, person, single?.title, isMain]);
  /** the name of each entry in the book ("v.2"), or null when it only goes on
   *  with the one before ("v.3 · 2": a long text cut in parts) */
  const cardLabels = useMemo(() => {
    if (!cards || !person) return [];
    const label = (c: Card) => {
      const full = cardTitle(c.title, person.name);
      return /\s[-–—]\s*(v\.\s*\d+.*)$/i.exec(full)?.[1] ?? full;
    };
    const cont = /\s*·\s*\d+\s*$/;
    const list = cards.map((c, i) => {
      const l = label(c);
      return i > 0 && cont.test(l) && l.replace(cont, "") === label(cards[i - 1]).replace(cont, "") ? null : l;
    });
    // several people of the same name: "Isana 1", "Isana 2"… (the same name thrice tells nothing)
    const seen = new Map<string, number>();
    return list.map((l) => {
      if (l === null || list.filter((x) => x === l).length < 2) return l;
      const n = (seen.get(l) ?? 0) + 1;
      seen.set(l, n);
      return `${l} ${n}`;
    });
  }, [cards, person]);
  /** One entry out of the text (a repeated one…): the part keeps its earlier version. */
  const deleteCard = async (c: Card, n: number) => {
    if (!inline || !(await ask(t.cardDeleteConfirm(n)))) return;
    const lines = c.raw.text.split("\n");
    const rest = [...lines.slice(0, c.from), ...lines.slice(c.to)].join("\n").replace(/\n{3,}/g, "\n\n").trim();
    try {
      await api.saveSection(inline.docId, c.ord, rest);
      p.onToast(t.cardDeleted(n));
      setTextReload((x) => x + 1);
    } catch (e) {
      p.onToast(String(e));
    }
  };
  const parts = inline && !cards && !isMain && inline.total > 1 && inline.toc.length > 1 ? inline : null;
  const goPart = (ord: number) => {
    if (!parts || ord < 0 || ord >= parts.total) return;
    api.getSections(parts.docId, ord, ord).then(
      (sections) => {
        setInline((x) => x && { ...x, sections, ord });
        // the new part from its start, under the bar
        textRef.current?.scrollIntoView({ block: "start" });
      },
      (e) => p.onToast(String(e)),
    );
  };

  // a long text: its headings beside it, to jump without scrolling, and a
  // button back to the top
  const scrollRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [outline, setOutline] = useState<{ text: string; el: HTMLElement }[]>([]);
  useEffect(() => {
    // not the page marks of PDFs ("p. 3") nor the name repeated: only real headings
    const own = new Set([person?.name ?? "", single?.title ?? ""].map(coreName));
    const seen = new Set<string>();
    const heads = [...(bodyRef.current?.querySelectorAll<HTMLElement>("h1, h2, h3, h4, .ln.h") ?? [])]
      .map((el) => ({ text: (el.textContent ?? "").replace(/^#+\s*/, "").trim(), el }))
      .filter((h) => {
        const k = coreName(h.text);
        if (!h.text || h.text.length > 120 || /^p(age|ág)?\.?\s*\d+$/i.test(h.text) || own.has(k) || seen.has(k)) return false;
        seen.add(k);
        return true;
      });
    setOutline(heads.length >= 3 && !cards ? heads : []);
  }, [inline, cards, p.readerStyle, p.names, textOpen]); // eslint-disable-line react-hooks/exhaustive-deps
  const [far, setFar] = useState(false);

  const onInlineClick = async (e: React.MouseEvent) => {
    const a = (e.target as HTMLElement).closest("a");
    if (!a) return;
    e.preventDefault();
    const wl = a.getAttribute("data-wikilink");
    try {
      if (a.dataset.person) p.onPerson(Number(a.dataset.person));
      else if (wl) {
        const r = await api.resolveLink(wl);
        if (r.kind === "doc") p.onOpenDoc(r.id);
        else if (r.kind === "person") p.onPerson(r.id);
        else p.onToast(`? ${wl}`);
      } else {
        const href = a.getAttribute("href");
        if (href && /^(https?:|mailto:)/.test(href)) await api.openExternal(href);
      }
    } catch (err) {
      p.onToast(String(err));
    }
  };

  if (!person || person.id !== p.id) return <div className="reader" />;

  const cover = person.docs.find((d) => d.hasCover);
  const choosePhoto = async () => {
    try {
      const path = await open({
        multiple: false,
        filters: [{ name: t.imageFiles, extensions: ["jpg", "jpeg", "png", "webp", "gif", "bmp", "avif"] }],
      });
      if (typeof path !== "string") return;
      await api.setPersonPhoto(person.id, path);
      p.onPhotoChanged();
    } catch (e) {
      p.onToast(String(e));
    }
  };
  const removePhoto = async () => {
    if (!(await ask(t.removePhotoConfirm))) return;
    api.removePersonPhoto(person.id).then(p.onPhotoChanged, (e) => p.onToast(String(e)));
  };
  // guru and disciples: the Guru Paramparā (with how they are related) and
  // the names written in the record, once each, by kind of relation
  const me = p.persons.find((x) => x.id === person.id);
  type Name = { text: string; id?: number; tree?: boolean; kind: TreeKind | "" };
  // "Rupa Gosvami (diksa); studied under…" links to Rupa Gosvami
  const nameKey = (s: string) => s.replace(/\([^)]*\)/g, "").split(/[;:]/)[0].trim();
  const fromTree = (x: PersonListItem, kind: TreeKind): Name => ({ text: x.name, id: x.id, tree: true, kind });
  const treeGurus: Name[] = [
    ...p.persons.filter((x) => me?.tree?.parent != null && x.id === me.tree.parent).map((x) => fromTree(x, me!.tree!.kind)),
    ...(me?.links ?? []).flatMap((l) => p.persons.filter((x) => x.id === l.guru).map((x) => fromTree(x, l.kind))),
  ];
  const treeDisciples: Name[] = [
    ...p.persons
      .filter((x) => x.tree?.parent === person.id)
      .sort((a, b) => a.tree!.pos - b.tree!.pos)
      .map((x) => fromTree(x, x.tree!.kind)),
    ...p.persons.flatMap((x) => x.links.filter((l) => l.guru === person.id).map((l) => fromTree(x, l.kind))),
  ];
  const nameList = (value: string, tree: Name[]): Name[] => {
    const out: Name[] = [...tree];
    for (const item of splitList(value)) {
      const id = byName(nameKey(item));
      const kind = kindOf(item);
      const same = out.find((n) => (id && n.id === id) || looseName(n.text) === looseName(item));
      if (same) {
        // the tree says how they are related; the record may say it when the tree does not
        if (!same.kind && kind) same.kind = kind;
        continue;
      }
      out.push({ text: kind ? item.replace(KIND_LABEL, "").trim() : item, id, kind });
    }
    return out;
  };
  const names = (list: Name[]) =>
    list.map((n, i) =>
      n.id && n.id !== person.id ? (
        <button key={i} className={`name-link${n.tree ? " from-tree" : ""}`} title={n.tree ? t.fromParampara : undefined} onClick={() => p.onPerson(n.id!)}>
          {n.text}
        </button>
      ) : (
        <span key={i} className="name-plain">
          {n.text}
        </span>
      ),
    );
  const dated = (value: string, lunar: string | null) => (
    <>
      {value}
      {lunar && <span className="lunar">{lunar}</span>}
    </>
  );
  const myPlaces = placesOfPerson(person.id, person.place, p.places);
  const gurus = byKind(nameList(person.guru, treeGurus));
  const disciples = byKind(nameList(person.disciples, treeDisciples));

  // three columns: the gurus by kind, the dates, place and works; the
  // disciples below, wide, by kind
  const facts: [string, React.ReactNode, boolean][][] = [
    gurus.map(([kind, list]) => [kind ? t.guruOfKind[kind] : t.guru, names(list), true]),
    [
      [t.appearance, dated(person.appearance, person.appearanceDay), !!person.appearance.trim()],
      [t.disappearance, dated(person.disappearance, person.disappearanceDay), !!person.disappearance.trim()],
    ],
    [
      [t.place, person.place, !!person.place.trim()],
      [
        t.placesOfPerson,
        myPlaces.map(({ place, roles }) => (
          <button key={place.id} className="name-link" title={roles.map((r) => t.placeRoleHints[r]).join("\n\n") || undefined} onClick={() => p.onPlace(place.id)}>
            <MapPin size={12} /> {place.name}
            {roles.length > 0 && <span className="muted"> · {roles.map((r) => t.placeRoles[r]).join(", ")}</span>}
          </button>
        )),
        myPlaces.length > 0,
      ],
      [t.works, person.works, !!person.works.trim()],
    ],
  ];
  const notes = splitNotes(person.notes);
  const hasFacts = facts.flat().some(([, , show]) => show) || person.notes.trim() || disciples.length > 0;
  const tags = person.tags
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const addImages = async () => {
    try {
      const picked = await open({ multiple: true, filters: [{ name: t.imageFiles, extensions: ["jpg", "jpeg", "png", "webp", "gif", "bmp", "avif"] }] });
      const paths = Array.isArray(picked) ? picked : typeof picked === "string" ? [picked] : [];
      if (!paths.length) return;
      await api.addPersonImages(person.id, paths);
      p.onPhotoChanged();
    } catch (e) {
      p.onToast(String(e));
    }
  };
  const exportMe = async () => {
    try {
      const path = await save({ defaultPath: `${person.name.replace(/[\\/:*?"<>|]/g, "-")}.md`, filters: [{ name: "Markdown", extensions: ["md"] }] });
      if (!path) return;
      await api.exportPerson(person.id, path);
      p.onToast(t.exported);
    } catch (e) {
      p.onToast(String(e));
    }
  };
  const imageAction = (f: () => Promise<unknown>) => () => f().then(p.onPhotoChanged, (e) => p.onToast(String(e)));

  return (
    <div className="reader person-view">
      {far && (
        <button className="btn to-top" onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })}>
          <ArrowUp size={15} /> {t.toTop}
        </button>
      )}
      <div className="reader-scroll" ref={scrollRef} onScroll={(e) => setFar(e.currentTarget.scrollTop > 900)}>
        <div className="person-inner">
          <header className="person-head">
            <div className="person-cover-wrap">
              <button className="person-cover" title={t.choosePhoto} onClick={choosePhoto}>
                {person.hasPhoto ? (
                  <img src={`${fileUrl("photo", person.id)}?v=${encodeURIComponent(person.modified)}`} alt="" />
                ) : cover ? (
                  <img src={fileUrl("cover", cover.id)} alt="" />
                ) : (
                  <UserRound size={44} />
                )}
                <span className="cover-overlay">
                  <ImagePlus size={20} />
                  {person.hasPhoto ? t.changePhoto : t.choosePhoto}
                </span>
              </button>
              {person.hasPhoto && (
                <button className="icon-btn cover-remove" title={t.removePhoto} onClick={removePhoto}>
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="person-title">
              {me?.tree && (
                <button className="parampara-seal" title={t.revealInTree} onClick={() => p.onReveal(person)}>
                  <ListTree size={13} /> {t.parampara}
                </button>
              )}
              <h1>
                {person.name}{" "}
                <span className="record-number" title={t.recordNumberHint}>
                  #{person.id}
                </span>
              </h1>
              {person.aka && <div className="aka">{person.aka}</div>}
              {tags.length > 0 && (
                <div className="tags">
                  {tags.map((tg) => (
                    <button key={tg} className="tag clickable" title={t.byTag(tg)} onClick={() => p.onTag(tg)}>
                      #{tg}
                    </button>
                  ))}
                </div>
              )}
              <div className="person-actions">
                <button className="btn" onClick={() => p.onEdit(person)}>
                  <Pencil size={15} /> {t.editPerson}
                </button>
                <button className="btn ghost" onClick={() => p.onFindMentions(person)} title={t.findMentions}>
                  <Search size={15} /> {t.findMentions}
                </button>
                {me?.tree && (
                  <button className="btn ghost" onClick={() => p.onShowInTree(person)} title={t.showInTreeHint}>
                    <Network size={15} /> {t.showInTree}
                  </button>
                )}
                {me && (
                  <button className="btn ghost" onClick={() => p.onShowLineage(person)} title={t.showLineageHint}>
                    <GitFork size={15} /> {t.showLineage}
                  </button>
                )}
                {trips.length > 0 && (
                  <div className="menu-wrap">
                    <button
                      className="btn ghost"
                      title={t.seeJourneysHint}
                      onClick={(e) => {
                        if (trips.length === 1) return p.onShowJourney(trips[0].id);
                        e.stopPropagation();
                        setTripMenu((m) => !m);
                      }}
                    >
                      <Route size={15} /> {t.seeJourneys}
                      {trips.length > 1 && <ChevronDown size={14} />}
                    </button>
                    {tripMenu && (
                      <div className="menu trips-menu" onClick={(e) => e.stopPropagation()}>
                        {trips.map((j) => (
                          <button key={j.id} onClick={() => (setTripMenu(false), p.onShowJourney(j.id))}>
                            <Route size={15} /> {j.title[lang === "en" ? "en" : "es"]} <span className="muted small">{j.when}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <button className="icon-btn" onClick={() => p.onReveal(person)} title={t.revealInTree}>
                  <LocateFixed size={17} />
                </button>
                <div className="menu-wrap">
                  <button
                    className={`icon-btn ${menu ? "on" : ""}`}
                    title={t.more}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenu((m) => !m);
                    }}
                  >
                    <MoreHorizontal size={18} />
                  </button>
                  {menu && (
                    <div className="menu" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => (setMenu(false), p.onGuru(person))} title={t.guruTitle}>
                        <ListTree size={15} /> {t.guruButton}
                      </button>
                      <button onClick={() => (setMenu(false), p.onSearchIn(person))}>
                        <TextSearch size={15} /> {t.searchInPerson}
                      </button>
                      <button onClick={() => (setMenu(false), p.onAddText(person))}>
                        <FilePlus2 size={15} /> {t.addText}
                      </button>
                      {person.docs.length > 1 && (
                        <button
                          onClick={async () => {
                            setMenu(false);
                            joinMe();
                          }}
                        >
                          <Combine size={15} /> {t.joinOne}
                        </button>
                      )}
                      <button onClick={() => (setMenu(false), p.onMerge(person, similar.map((s) => s.id)))}>
                        <GitMerge size={15} /> {t.mergePersons}
                      </button>
                      <button onClick={() => (setMenu(false), p.onVersions(person))}>
                        <History size={15} /> {t.versions}
                      </button>
                      {merges.map((m) => (
                        <button key={m.id} onClick={() => (setMenu(false), undoMerge(m))} title={m.saved}>
                          <Undo2 size={15} /> {t.undoMerge(m.names.join(", "))}
                        </button>
                      ))}
                      <button onClick={() => (setMenu(false), exportMe())}>
                        <FileDown size={15} /> {t.exportPerson}
                      </button>
                      <button onClick={() => (setMenu(false), window.setTimeout(() => window.print(), 50))}>
                        <Printer size={15} /> {t.printPerson}
                      </button>
                      <hr />
                      <button className="danger" onClick={() => (setMenu(false), p.onDelete(person))}>
                        <Trash2 size={15} /> {t.deletePerson}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>
          {/* just merged: undo it at once if it was a mistake */}
          {recentMerge && (
            <div className="merge-notice">
              <Undo2 size={15} />
              <span>{t.mergedNotice(recentMerge.names.join(", "))}</span>
              <button className="link-btn" onClick={() => undoMerge(recentMerge)}>
                {t.undoMergeShort}
              </button>
            </div>
          )}

          {hasFacts ? (
            <dl className="facts">
              {/* the cards flow down and across as many columns as fit: no
                  empty space under a short card (gurus, dates, place, works) */}
              {facts.flat().some(([, , show]) => show) && (
                <div className="facts-flow">
                  {facts
                    .flat()
                    .filter(([, , show]) => show)
                    .map(([label, value]) => (
                      <div key={label} className="fact">
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                </div>
              )}
              {disciples.length > 0 && (
                <div className="fact wide">
                  <dt>
                    {t.disciples} <span className="count">{disciples.reduce((n, [, l]) => n + l.length, 0)}</span>
                  </dt>
                  <dd className="disciple-groups">
                    {disciples.map(([kind, list]) => (
                      <div key={kind} className="disciple-group">
                        <span className="disciple-kind">
                          {kind ? t.disciplesOfKind[kind] : t.disciplesNoKind} <span className="count">{list.length}</span>
                        </span>
                        <span className="disciple-names">{names(list)}</span>
                      </div>
                    ))}
                  </dd>
                </div>
              )}
              {contemporaries.length > 0 && (
                <details className="fact wide contemporaries">
                  <summary>
                    <dt>
                      {t.contemporaries} <span className="count">{contemporaries.length}</span>
                    </dt>
                  </summary>
                  <p className="muted small">{t.contemporariesHint(contemporaries.length)}</p>
                  <dd>
                    {contemporaries.map(({ l }) => (
                      <button key={l.id} className="name-link" title={years(l)} onClick={() => p.onPerson(l.id)}>
                        {l.name} <span className="muted">{years(l)}</span>
                      </button>
                    ))}
                  </dd>
                </details>
              )}
              {notes.body.trim() && (
                <div className="fact wide">
                  <dt>{t.notes}</dt>
                  <dd className="notes">
                    <WebLinks text={notes.body} onError={p.onToast} />
                  </dd>
                </div>
              )}
              {notes.links.length > 0 && (
                <div className="fact wide">
                  <dt>{t.linksSection}</dt>
                  <dd className="note-links">
                    {notes.links.map((l, i) => {
                      const kind = linkKind(l.target);
                      const Icon = kind === "web" ? Globe : kind === "folder" ? Folder : FileText;
                      return (
                        <a
                          key={i}
                          href={kind === "web" ? l.target : "#"}
                          className={`note-link ${kind}`}
                          title={l.target}
                          onClick={(e) => {
                            e.preventDefault();
                            api.openExternal(kind === "web" && !/^[a-z]+:/i.test(l.target) ? `https://${l.target}` : openTarget(l.target)).catch((err) => p.onToast(String(err)));
                          }}
                        >
                          <Icon size={14} />
                          <span>{linkLabel(l)}</span>
                        </a>
                      );
                    })}
                  </dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="muted small no-facts" onClick={() => p.onEdit(person)}>
              {t.noDetails}
            </p>
          )}

          {single ? (
            <section>
              <h2>
                <BookOpen size={14} /> {main ? t.mainText : t.texts} {!main && <span className="pill">1</span>}
              </h2>
              <div className={`inline-doc${textOpen ? "" : " folded"}`} ref={textRef}>
                {/* stays at the top while the text is read */}
                <div className="inline-sticky">
                <div className="inline-head" data-ctx="doc" data-id={single.id}>
                  <button className="icon-btn main-fold" title={textOpen ? t.mainTextClose : t.mainTextOpen} onClick={() => setTextOpen((o) => !o)}>
                    {textOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>
                  <span className="tc-title" role="button" style={{ cursor: "pointer" }} onClick={() => setTextOpen((o) => !o)}>
                    {single.title}
                  </span>
                  <CollectionChip name={single.collection} />
                  <span className="kind">{single.kind === "new" ? "" : single.kind.toUpperCase()}</span>
                  <span className="muted small">{formatSize(single.size, lang)}</span>
                  <span className="inline-actions">
                    <button className="btn ghost" onClick={() => p.onOpenDoc(single.id)}>
                      <BookOpen size={15} /> {t.openInReader}
                    </button>
                    {!textOpen && (
                      <button className="btn ghost" onClick={() => setTextOpen(true)}>
                        <ChevronDown size={15} /> {t.mainTextOpen}
                      </button>
                    )}
                    <button className="icon-btn" title={t.addBookmark} onClick={() => p.onBookmark(single.id, parts?.ord ?? 0)}>
                      <Star size={16} />
                    </button>
                    <button className="icon-btn" title={t.edit} onClick={() => p.onEditDoc(single.id, parts?.ord ?? 0)}>
                      <Pencil size={16} />
                    </button>
                  </span>
                </div>
                {textOpen && parts && (
                  <div className="toc-row">
                    <button className="icon-btn" disabled={parts.ord <= 0} title={t.previous} onClick={() => goPart(parts.ord - 1)}>
                      <ChevronLeft size={18} />
                    </button>
                    <select value={parts.ord} onChange={(e) => goPart(Number(e.target.value))} title={t.contents}>
                      {parts.toc.map((e) => (
                        <option key={e.ordinal} value={e.ordinal}>
                          {e.ordinal + 1}. {e.heading ?? single.title}
                        </option>
                      ))}
                    </select>
                    <button className="icon-btn" disabled={parts.ord >= parts.total - 1} title={t.next} onClick={() => goPart(parts.ord + 1)}>
                      <ChevronRight size={18} />
                    </button>
                    <span className="pill mono">
                      {parts.ord + 1} / {parts.total}
                    </span>
                  </div>
                )}
                </div>
                {/* the text read like a book, all of it in a row; its index on the left */}
                {textOpen && (
                <div className={`book-layout${cards || outline.length ? " with-nav" : ""}`}>
                {cards ? (
                  <nav className="book-nav">
                    <div className="outline-title">{t.inThisText}</div>
                    {cards.map((c, i) =>
                      cardLabels[i] === null ? null : (
                        <button
                          key={c.key}
                          title={cardTitle(c.title, person.name)}
                          onClick={() => document.getElementById(`entry-${c.key}`)?.scrollIntoView({ block: "start", behavior: "smooth" })}
                        >
                          {cardLabels[i]}
                        </button>
                      ),
                    )}
                  </nav>
                ) : (
                  outline.length > 0 && (
                    <nav className="book-nav">
                      <div className="outline-title">{t.inThisText}</div>
                      {outline.map((h, i) => (
                        <button key={i} title={h.text} onClick={() => h.el.scrollIntoView({ block: "start", behavior: "smooth" })}>
                          {h.text}
                        </button>
                      ))}
                    </nav>
                  )
                )}
                {cards ? (
                  <div className="reader-body book" lang="en" data-ctx="doc" data-id={single.id} onClick={onInlineClick}>
                    {cards.map((c, i) => (
                      <div key={c.key} id={`entry-${c.key}`} className="book-entry">
                        <div className={cardLabels[i] === null ? "book-orn cont" : "book-orn"}>
                          {cardLabels[i] !== null && (
                            <span className="orn-label" title={cardTitle(c.title, person.name)}>
                              ❦ <span>{cardLabels[i]}</span> ❦
                            </span>
                          )}
                          {c.same && <span className="pill">{t.cardSame(c.same)}</span>}
                          <span className="orn-tools">
                            <button
                              className="icon-btn"
                              title={t.newFromEntry}
                              onClick={() =>
                                p.onNewFromText(single.id, c.raw.text.split("\n").slice(c.from, c.to).join("\n"), c.section.text.trim(), person.name)
                              }
                            >
                              <UserPlus size={14} />
                            </button>
                            <button className="icon-btn" title={t.edit} onClick={() => p.onEditDoc(single.id, c.ord)}>
                              <Pencil size={14} />
                            </button>
                            <button className="icon-btn" title={t.cardDelete} onClick={() => deleteCard(c, i + 1)}>
                              <Trash2 size={14} />
                            </button>
                          </span>
                        </div>
                        <SectionView s={c.section} terms={NO_TERMS} multi={false} source={false} book names={p.names} self={person.id} />
                      </div>
                    ))}
                  </div>
                ) : (
                <div ref={bodyRef} className="reader-body book" lang="en" data-ctx="doc" data-id={single.id} onClick={onInlineClick}>
                  {inline === null ? (
                    <span className="spinner" />
                  ) : single.size < 50 ? (
                    <p className="muted">{single.kind === "pdf" ? t.noTextHint : t.noTexts}</p>
                  ) : (
                    inline.sections.map((s) => (
                      <SectionView
                        key={s.id}
                        s={isMain ? s : withoutRepeatedTitles(s, [person.name, single.title, s.heading ?? ""])}
                        terms={NO_TERMS}
                        multi={inline.total > 1 && !isMain}
                        source={false}
                        book
                        names={p.names}
                        self={person.id}
                      />
                    ))
                  )}
                  {inline && !parts && inline.total > inline.sections.length && (
                    <button className="link-btn" onClick={() => p.onOpenDoc(single.id)}>
                      {t.readMore}
                    </button>
                  )}
                </div>
                )}
                </div>
                )}
              </div>
              {otherVersions.length > 0 ? (
                // the texts it was written from: kept, found by the search, here closed
                <details className="other-versions">
                  <summary>
                    <History size={14} /> {t.otherVersions} <span className="pill">{otherVersions.length}</span>
                    <span className="muted small"> · {t.otherVersionsHint}</span>
                  </summary>
                  <div className="text-cards">
                    {otherVersions.map((d) => (
                      <button key={d.id} data-ctx="doc" data-id={d.id} className="text-card" onClick={() => p.onOpenDoc(d.id)}>
                        {d.hasCover ? <img src={fileUrl("cover", d.id)} alt="" loading="lazy" /> : <FileText size={22} />}
                        <span className="tc-title">{d.title}</span>
                        <span className="tc-meta">
                          <CollectionChip name={d.collection} />
                          <span className="kind">{d.kind === "new" ? "" : d.kind.toUpperCase()}</span>
                          <span>{formatSize(d.size, lang)}</span>
                        </span>
                      </button>
                    ))}
                    <button className="text-card add" onClick={() => p.onAddText(person)}>
                      <FilePlus2 size={22} />
                      <span className="tc-title">{t.addText}</span>
                    </button>
                  </div>
                </details>
              ) : (
                <button className="link-btn add-text-link" onClick={() => p.onAddText(person)}>
                  <FilePlus2 size={14} /> {t.addText}
                </button>
              )}
            </section>
          ) : (
          <section>
            <h2>
              <BookOpen size={14} /> {t.texts} <span className="pill">{person.docs.length}</span>
              {/* several texts of one person: one text with parts, read one after another */}
              {person.docs.length > 1 && (
                <button className="link-btn h2-action" title={t.joinOneHint} onClick={joinMe}>
                  <Combine size={14} /> {t.joinOne}
                </button>
              )}
            </h2>
            {person.docs.length === 0 && <p className="muted small">{t.noTexts}</p>}
            <div className="text-cards">
              {person.docs.map((d, i) => (
                <button
                  key={d.id}
                  data-ctx="doc"
                  data-id={d.id}
                  className="text-card"
                  style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                  onClick={() => p.onOpenDoc(d.id)}
                >
                  {d.hasCover ? <img src={fileUrl("cover", d.id)} alt="" loading="lazy" /> : <FileText size={22} />}
                  <span className="tc-title">{d.title}</span>
                  <span className="tc-meta">
                    <CollectionChip name={d.collection} />
                    <span className="kind">{d.kind === "new" ? "" : d.kind.toUpperCase()}</span>
                    <span>{formatSize(d.size, lang)}</span>
                  </span>
                </button>
              ))}
              <button className="text-card add" onClick={() => p.onAddText(person)}>
                <FilePlus2 size={22} />
                <span className="tc-title">{t.addText}</span>
              </button>
            </div>
          </section>
          )}

          <section>
            <h2>
              <Images size={14} /> {t.gallery} {person.images.length > 0 && <span className="pill">{person.images.length}</span>}
            </h2>
            <div className="gallery">
              {person.images.map((id) => (
                <figure key={id}>
                  <a href={fileUrl("image", id)} target="_blank" rel="noreferrer" onClick={(e) => (e.preventDefault(), setZoom(id))}>
                    <img src={fileUrl("image", id)} alt="" loading="lazy" />
                  </a>
                  <figcaption>
                    <button className="icon-btn" title={t.useAsMain} onClick={imageAction(() => api.imageAsPhoto(id))}>
                      <UserRound size={14} />
                    </button>
                    <button
                      className="icon-btn danger"
                      title={t.removeImage}
                      onClick={async () => (await ask(t.removeImageConfirm)) && imageAction(() => api.removePersonImage(id))()}
                    >
                      <Trash2 size={14} />
                    </button>
                  </figcaption>
                </figure>
              ))}
              <button className="gallery-add" onClick={addImages}>
                <ImagePlus size={22} />
                <span>{t.addImages}</span>
              </button>
            </div>
          </section>

          {similar.length > 0 && (
            <section>
              <h2>
                <GitMerge size={14} /> {t.similar}
              </h2>
              <p className="muted small">{t.similarHint}</p>
              <div className="similar">
                {similar.map((s) => (
                  <span key={s.id} className="chip-x">
                    <button className="chip clickable" onClick={() => p.onPerson(s.id)}>
                      <UserRound size={12} /> {s.name}
                      <span className="n">{s.docs}</span>
                    </button>
                    <button className="icon-btn namesake-btn" title={t.toNamesakesOne(s.name)} onClick={() => toNamesakes([s.id])}>
                      <Users size={12} />
                    </button>
                    <button className="icon-btn" title={t.notSameOne(s.name)} onClick={() => notSame([s])}>
                      <X size={13} />
                    </button>
                  </span>
                ))}
                <button className="link-btn" onClick={() => p.onMerge(person, similar.map((s) => s.id))}>
                  {t.mergePersons}
                </button>
                <button className="link-btn" title={t.notSameHint} onClick={() => notSame()}>
                  {t.notSame}
                </button>
                <button className="link-btn" title={t.allToNamesakesHint} onClick={() => toNamesakes([person.id, ...similar.map((s) => s.id)])}>
                  {t.allToNamesakes}
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
      {zoom !== null && (
        <div className="zoom" onClick={() => setZoom(null)}>
          <img src={fileUrl("image", zoom)} alt="" />
        </div>
      )}
    </div>
  );
}
