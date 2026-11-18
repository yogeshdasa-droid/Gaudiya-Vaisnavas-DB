// «Audios» (Whisper, 18-11-2026): Śrīla Gurudeva's recordings — the folder «Srila Gurudeva mp3» sorted by language
// («Por escucha\Hindi - 1 seguro\…», «Ingles\…», «Bengali\…») — with a search over titles, places and dates (and,
// if wanted, inside the written lectures of the same day), lists by language, year and place, and a page for each
// recording with its player and its written lecture below («like the Prabhupāda transcriptions»): the one of the same
// day in «Lectures Gurudeva» or the Anthology, or any text linked by hand. The files stay in their folder (library 0).
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { ArrowLeft, BookOpen, Check, ExternalLink, FolderOpen, Headphones, Link2, Link2Off, MapPin, Pause, Pencil, Play, RotateCcw, RotateCw, Search, SkipBack, SkipForward, X } from "lucide-react";
import { api, AUDIOS_LIB, AudioTexts, DocListItem, LibEntry, libUrl, SectionText } from "../api";
import { Lang, T } from "../i18n";
import { anthologyVolumes, ANTHOLOGY, formatLecDate } from "./Anthology";
import { foldName } from "./Sidebar";
import { ReaderStyle, SectionView } from "./Reader";
import { clock, player, savedPosition, Track, usePlayer } from "../audioPlayer";
import { templeMandalaUrl } from "./TempleMandala";

/** what is behind the written lecture (Whisper, 18-11-2026): the lotus of a temple floor, the parchment, or nothing */
type Bg = "mandala" | "parchment" | "none";
const BG_KEY = "bio.audioBg";
function readBg(): Bg {
  try {
    const v = localStorage.getItem(BG_KEY);
    return v === "parchment" || v === "none" ? v : "mandala";
  } catch {
    return "mandala";
  }
}

const DEFAULT_FOLDERS = ["O:\\Gaudiya Vaisnavas DB\\Biblioteca\\Srila Gurudeva mp3"];
const LECTURES = "Lectures Gurudeva";
/** what the window can play (WMA and WMV only with the PC's program) */
const PLAYABLE = /\.(mp3|wav|m4a|ogg|opus|flac|aac|mp4|webm)$/i;
const MEDIA = /\.(mp3|wav|m4a|ogg|opus|flac|aac|wma|mp4|webm|wmv|avi|mpg|mpeg)$/i;

// ------------------------------------------------------------------ reading the names

export interface Rec {
  rel: string;
  name: string;
  /** the folder it is in, in «Por escucha»: «Hindi - 1 seguro»; «Ingles» / «Bengali»: by the name; «»: not classified */
  group: string;
  lang: "en" | "hi" | "bn" | "sa" | "mixEn" | "mixInd" | "doubt" | "other" | "none";
  /** 0 by the name, 1 sure, 2 fairly sure, 3 unsure; -1 does not apply */
  sure: number;
  /** the folder it came from («Year 2001», «Syamarani»…) */
  origin: string;
  /** 1996-05-06, 1996-11 or 1996 («» unknown) */
  date: string;
  year: string;
  part: "" | "AM" | "PM";
  place: string;
  title: string;
  playable: boolean;
  hay: string;
}

const LANG_ORDER = ["en", "hi", "bn", "sa", "mixEn", "mixInd", "doubt", "other", "none"] as const;

function groupInfo(g: string): { lang: Rec["lang"]; sure: number } {
  const m = g.match(/^(Ingles|Hindi|Bengali|Sanscrito) - (\d)/);
  const L: Record<string, Rec["lang"]> = { Ingles: "en", Hindi: "hi", Bengali: "bn", Sanscrito: "sa" };
  if (m) return { lang: L[m[1]], sure: +m[2] };
  if (g === "Ingles") return { lang: "en", sure: 0 };
  if (g === "Bengali") return { lang: "bn", sure: 0 };
  if (/^Mezcla - mas ingles/.test(g)) return { lang: "mixEn", sure: -1 };
  if (/^Mezcla/.test(g)) return { lang: "mixInd", sure: -1 };
  if (/^Dudosos/.test(g)) return { lang: "doubt", sure: -1 };
  if (/^Otros/.test(g)) return { lang: "other", sure: -1 };
  return { lang: "none", sure: -1 };
}

/** Places that appear in the names (how they are written → one name). */
const PLACES: [string, string][] = [
  ["Mathurā", "mathura[i]?"],
  ["Govardhana", "govardhana?|govardan|gov(?= class)"],
  ["Vṛndāvana", "vrindavana?|vrndavana?|vrindaban|brindavan|gopinath ?bh\\w*|gopbhavan|rupa? ?sanatana?|imlitala|(?:rsgm|vvgm) ?vrndavan\\w*"],
  ["Navadvīpa", "navadvipa?|navadwipa?|navadweep"],
  ["Māyāpura", "mayapura?"],
  ["Śyāmanagar", "syamanagar"],
  ["Vraja-maṇḍala", "vraja ?mandala"],
  ["Varṣāṇā", "varsana|barsana"],
  ["Jagannātha Purī", "puri(?= dham)|puri"],
  ["Delhi", "delhi|southdelhi|motikhan ?delhi"],
  ["Faridabad", "faridabad"],
  ["Jaipur", "jaipura?|jairpura|jaiprua"],
  ["Bombay", "bombay|mumbai"],
  ["Amritsar", "amritsar"],
  ["Jammu", "jammu|janmu"],
  ["Calcutta", "calcutta|kolkata"],
  ["Badger", "badger|bager"],
  ["Houston", "houston|houstan"],
  ["Alachua", "alachua"],
  ["Hawaii", "hawaii\\w*|hilo|maui|kona"],
  ["Los Angeles", "los ?angeles|la(?= )"],
  ["San Francisco", "san ?fran\\w*|sf"],
  ["Miami", "miami"],
  ["Washington", "washington|lake ?washing\\w*"],
  ["Eugene", "eugene"],
  ["Las Vegas", "las ?vegas"],
  ["Placentia", "placentia"],
  ["Oakland", "oakland"],
  ["New York", "new ?york|ny"],
  ["San Diego", "san ?diego"],
  ["Boise", "boise"],
  ["Bakersfield", "bakersfield"],
  ["Gita Nagari", "gita ?nagari|gitanagari"],
  ["Birmingham", "birmingham|englandbi"],
  ["Wales", "wales"],
  ["Radlett", "radlett|raddlet"],
  ["Watford", "watfo[rt]\\w*"],
  ["Leicester", "leicester"],
  ["London", "london"],
  ["Bath", "bath"],
  ["Tunbridge Wells", "tu?rn?bridge"],
  ["Brighton", "brighton"],
  ["Glastonbury", "glastonbury"],
  ["Holland", "holland"],
  ["France", "france"],
  ["Venice", "venice"],
  ["Italy", "italy"],
  ["Frielendorf", "frielendorf"],
  ["Paderborn", "paderborn"],
  ["Berlin", "berlin"],
  ["Olpe", "olpe"],
  ["Germany", "germany"],
  ["Spain", "spain"],
  ["Moscow", "moscow"],
  ["Odessa", "odessa"],
  ["Volgograd", "volgograd"],
  ["Russia", "russia"],
  ["Istanbul", "istanbul"],
  ["Penang", "penang"],
  ["Malaysia", "malaysia|malaisiya|kl"],
  ["Singapore", "singapore"],
  ["Hong Kong", "hong ?kong"],
  ["Taipei", "taipei"],
  ["Cebu", "cebu"],
  ["Bali", "bali"],
  ["Lautoka", "lautoka"],
  ["Fiji", "fiji"],
  ["Murwillumbah", "murwi\\w*"],
  ["Brisbane", "brisbane"],
  ["Perth", "perth"],
  ["Australia", "australia|aust?"],
  ["Auckland", "auckland"],
  ["Vancouver", "vanco?uver"],
  ["Toronto", "toronto"],
  ["Canada", "canada"],
  ["Mexico", "mexico"],
  ["Brasil", "bra[sz]il"],
  ["Costa Rica", "costa ?rica"],
  ["São Paulo", "sao ?paulo"],
];
const PLACE_RES = PLACES.map(([n, re]) => [n, new RegExp(`(?:^| )(?:${re})(?= |$)`)] as const);
// (names written together in capitals: «GOPINATHBHAVAN», «HAWAIIHILO» — the start of a word is enough for these)
const PLACE_PREFIX = PLACES.filter(([, re]) => re.includes("\\w*"));

const MONTHS: Record<string, number> = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
const LANG_WORDS = new Set(
  "am pm eng engl english hindi hin hind bangla beng bengali ben hindieng enghindi banglaeng bangeng engchin englishrussian hbe c1 tape".split(" "),
);
const p2 = (n: number) => String(n).padStart(2, "0");

/** «20010524USA_ALACHUA_PM_HARI_DAS_THAKUR.mp3» → 2001-05-24, PM, Alachua, «Hari Das Thakur» */
export function readName(name: string, origin: string): Pick<Rec, "date" | "year" | "part" | "place" | "title"> {
  const base = name.replace(/\.[^.]+$/, "");
  let date = "";
  let m = base.match(/(?:^|\D)((?:19[5-9]|20[0-2])\d)(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])(?!\d)/);
  if (m) date = `${m[1]}-${m[2]}-${m[3]}`;
  else if ((m = base.match(/^((?:19|20)\d\d)(0[1-9]|1[0-2])xx/i))) date = `${m[1]}-${m[2]}`;
  else if ((m = base.match(/(?:^|\D)(\d{1,2}) ?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* ?(\d{2}|\d{4})(?!\d)/i))) {
    const y = m[3].length === 2 ? (+m[3] > 30 ? 1900 : 2000) + +m[3] : +m[3];
    date = `${y}-${p2(MONTHS[m[2].toLowerCase()])}-${p2(+m[1])}`;
  } else if ((m = base.match(/^((?:19[5-9]|20[0-2])\d)/) ?? base.match(/(?:^|[^\dT])((?:19[5-9]|20[0-2])\d)(?!\d)/))) date = m[1];
  else if ((m = origin.match(/Year ((?:19|20)\d\d)(?!\d|-)/))) date = m[1];
  const year = date.slice(0, 4) || (origin.match(/Year (\d{4}-\d+)/)?.[1] ?? "");
  const words = base
    .replace(/([a-z])(\d)/gi, "$1 $2")
    .replace(/(\d)([a-z])/gi, "$1 $2")
    .replace(/[_,.()\-–&#+]+/g, " ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
  const part = /(?:^| )am(?= |$)/.test(words) ? "AM" : /(?:^| )pm(?= |$)/.test(words) ? "PM" : "";
  // the place said first in the name
  let place = "";
  let at = Infinity;
  for (const [n, re] of PLACE_RES) {
    const i = words.search(re);
    if (i >= 0 && i < at) [place, at] = [n, i];
  }
  if (!place)
    for (const [n, re] of PLACE_PREFIX) {
      const i = words.search(new RegExp(`(?:^| )(?:${re})`));
      if (i >= 0 && i < at) [place, at] = [n, i];
    }
  // the title: the name without its date, the language tags, the morning/evening mark and a place at its start
  let t = base
    .replace(/^\d{4,9}(?:xx)?(?:\s*(?:&|and|-)\s*\d{1,8})?/i, "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const tw = t.split(" ").filter((w) => !LANG_WORDS.has(w.toLowerCase().replace(/[^a-z0-9]/g, "")));
  if (place && tw.length > 1) {
    const src = PLACES.find(([n]) => n === place)![1];
    const whole = new RegExp(`^(?:usa |uk )?(?:${src})$`);
    for (let k = Math.min(3, tw.length - 1); k >= 1; k--) {
      const head = foldName(tw.slice(0, k).join(" ")).replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
      if (whole.test(head)) {
        tw.splice(0, k);
        break;
      }
    }
    if (/^(usa|uk)$/i.test(tw[0] ?? "") && tw.length > 1) tw.shift();
  }
  t = tw.join(" ").replace(/^[\s\-–,.:;]+|[\s\-–,:;]+$/g, "");
  if (t && !/[a-z]/.test(t)) t = t.toLowerCase().replace(/(^|[\s(“"])(\p{L})/gu, (_, a, b) => a + b.toUpperCase());
  return { date, year, part, place, title: t || base };
}

function toRec(e: LibEntry): Rec {
  const parts = e.rel.split("/");
  let group = "";
  let origin = parts.slice(0, -1).join("/");
  if (parts[0] === "Por escucha" && parts.length > 2) [group, origin] = [parts[1], parts.slice(2, -1).join("/")];
  else if ((parts[0] === "Ingles" || parts[0] === "Bengali") && parts.length > 1) [group, origin] = [parts[0], parts.slice(1, -1).join("/")];
  const gi = groupInfo(group);
  const r = readName(e.name, origin);
  return {
    rel: e.rel,
    name: e.name,
    group,
    ...gi,
    origin,
    ...r,
    playable: PLAYABLE.test(e.name),
    hay: ` ${foldName([r.title, r.place, e.name.replace(/[_.]/g, " "), origin, r.date, r.part].join(" "))}`,
  };
}

// ------------------------------------------------------------------ written lectures

interface Written {
  doc: number;
  ord?: number;
  title: string;
  date: string;
  src: "lec" | "anth" | "other";
}

/** «Lectures Gurudeva» texts («1996-05-06 · title») and the Anthology's lectures, by their date */
async function writtenByDate(docs: DocListItem[]): Promise<{ byDate: Map<string, Written[]>; all: Written[] }> {
  const all: Written[] = [];
  for (const d of docs) {
    if (d.dir.split("/")[0] !== LECTURES) continue;
    const m = d.title.match(/^(\d{4}-\d{2}-\d{2}) · (.*)$/);
    if (m) all.push({ doc: d.id, title: m[2], date: m[1], src: "lec" });
  }
  try {
    for (const v of await anthologyVolumes(docs))
      for (const l of v.lectures) all.push({ doc: l.docId, ord: l.ordinal, title: `${l.title} · ${l.place}`, date: l.date, src: "anth" });
  } catch {
    /* without the Anthology */
  }
  const byDate = new Map<string, Written[]>();
  for (const w of all) {
    const k = w.date;
    if (!byDate.has(k)) byDate.set(k, []);
    byDate.get(k)!.push(w);
  }
  return { byDate, all };
}

// ------------------------------------------------------------------ the page

interface Filters {
  words: string;
  inText: boolean;
  lang: string;
  group: string;
  year: string;
  place: string;
  withText: boolean;
}
const NO_FILTERS: Filters = { words: "", inText: false, lang: "", group: "", year: "", place: "", withText: false };
// what was shown last (coming back to the section finds it as it was)
let memo: { filters: Filters; sel: string | null; scroll: number } = { filters: NO_FILTERS, sel: null, scroll: 0 };
let scanCache: { folder: string; recs: Rec[] } | null = null;

interface Props {
  t: T;
  lang: Lang;
  docs: DocListItem[];
  readerStyle: ReaderStyle;
  fontSize: number;
  /** a recording to show (from the bar at the bottom) */
  focus?: { rel: string; n: number };
  onOpenDoc: (docId: number, ordinal?: number) => void;
  onToast: (msg: string) => void;
}

export function Audios({ t, lang, docs, readerStyle, fontSize, focus, onOpenDoc, onToast }: Props) {
  const A = t.au;
  const [folder, setFolder] = useState<string | null>(scanCache?.folder ?? null);
  const [recs, setRecs] = useState<Rec[] | null>(scanCache?.recs ?? null);
  const [missing, setMissing] = useState(false);
  const [noFolder, setNoFolder] = useState(false);
  const [f, setF] = useState<Filters>(memo.filters);
  const [sel, setSel] = useState<string | null>(focus?.rel ?? memo.sel);
  const [limit, setLimit] = useState(200);
  const [links, setLinks] = useState<AudioTexts>({});
  const [written, setWritten] = useState<{ byDate: Map<string, Written[]>; all: Written[] } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const load = async (fresh = false) => {
    if (!fresh && scanCache) return;
    setRecs(null);
    try {
      let v = await api.getLibrary(AUDIOS_LIB);
      if (!v.folder) {
        for (const d of DEFAULT_FOLDERS) {
          try {
            await api.setLibraryFolder(AUDIOS_LIB, d);
            v = await api.getLibrary(AUDIOS_LIB);
            break;
          } catch {
            /* the next one */
          }
        }
      }
      setFolder(v.folder);
      setNoFolder(!v.folder);
      setMissing(v.missing);
      const rs = v.entries.filter((e) => MEDIA.test(e.name)).map(toRec);
      if (v.folder) scanCache = { folder: v.folder, recs: rs };
      setRecs(rs);
    } catch (e) {
      onToast(String(e));
      setRecs([]);
    }
  };
  useEffect(() => {
    void load();
    api.audioTexts().then(setLinks, () => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const docsKey = docs.length;
  useEffect(() => {
    let alive = true;
    writtenByDate(docs).then((w) => alive && setWritten(w), () => {});
    return () => {
      alive = false;
    };
  }, [docsKey]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (focus) setSel(focus.rel);
  }, [focus?.n]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    memo = { ...memo, filters: f, sel };
  }, [f, sel]);

  const chooseFolder = async () => {
    const d = await open({ directory: true, title: A.chooseFolder });
    if (typeof d !== "string") return;
    try {
      await api.setLibraryFolder(AUDIOS_LIB, d);
      scanCache = null;
      void load(true);
    } catch (e) {
      onToast(String(e));
    }
  };

  const textOf = (r: Rec): Written | null => {
    const l = links[r.name.toLowerCase()];
    if (l?.doc !== undefined) return { doc: l.doc, ord: l.ord, title: "", date: r.date, src: "other" };
    return written?.byDate.get(r.date)?.[0] ?? null;
  };

  // words inside the written lectures: the days whose lecture says them
  const [textDays, setTextDays] = useState<Map<string, string> | null>(null);
  useEffect(() => {
    const q = f.words.trim();
    if (!q || !f.inText || !written) return setTextDays(null);
    let alive = true;
    const h = window.setTimeout(() => {
      api
        .search({ query: q, titlesOnly: false, prefix: true, sort: "relevance", collections: [LECTURES, ANTHOLOGY], dir: null, docId: null, personId: null, offset: 0, limit: 500 })
        .then((r) => {
          if (!alive) return;
          const dateOf = new Map<string, string>();
          for (const w of written.all) dateOf.set(w.ord === undefined ? `${w.doc}` : `${w.doc}:${w.ord}`, w.date);
          const days = new Map<string, string>();
          for (const hit of r.hits) {
            const d = dateOf.get(`${hit.docId}:${hit.ordinal}`) ?? dateOf.get(`${hit.docId}`);
            if (d && !days.has(d)) days.set(d, hit.snippet);
          }
          // and the texts linked by hand
          for (const [name, l] of Object.entries(links)) {
            if (l.doc !== undefined && r.hits.some((hit) => hit.docId === l.doc && (l.ord === undefined || hit.ordinal === l.ord))) days.set(`name:${name}`, "");
          }
          setTextDays(days);
        })
        .catch(() => alive && setTextDays(new Map()));
    }, 350);
    return () => {
      alive = false;
      window.clearTimeout(h);
    };
  }, [f.words, f.inText, written, links]);

  // the titles given by hand
  const all = useMemo(
    () =>
      (recs ?? []).map((r) => {
        const own = links[r.name.toLowerCase()]?.title;
        return own ? { ...r, title: own, hay: `${r.hay} ${foldName(own)}` } : r;
      }),
    [recs, links],
  );
  const words = foldName(f.words).split(" ").filter(Boolean);
  const keep = (r: Rec, skip?: keyof Filters) =>
    (skip === "lang" || !f.lang || r.lang === f.lang) &&
    (skip === "lang" || !f.group || r.group === f.group) &&
    (skip === "year" || !f.year || r.year === f.year) &&
    (skip === "place" || !f.place || r.place === f.place) &&
    (!f.withText || !!textOf(r));
  const matchWords = (r: Rec) =>
    !words.length || words.every((w) => r.hay.includes(` ${w}`)) || (!!textDays && (textDays.has(r.date) || textDays.has(`name:${r.name.toLowerCase()}`)));
  const list = useMemo(
    () =>
      all
        .filter((r) => keep(r) && matchWords(r))
        .sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999") || (a.part || "").localeCompare(b.part || "") || a.name.localeCompare(b.name)),
    [all, f, textDays, links, written], // eslint-disable-line react-hooks/exhaustive-deps
  );
  // the counts of each list, with the other filters on
  const counts = useMemo(() => {
    const by = (k: "lang" | "year" | "place", get: (r: Rec) => string) => {
      const n = new Map<string, number>();
      for (const r of all) if (keep(r, k) && matchWords(r)) n.set(get(r), (n.get(get(r)) ?? 0) + 1);
      return n;
    };
    return { group: by("lang", (r) => r.group), lang: by("lang", (r) => r.lang), year: by("year", (r) => r.year), place: by("place", (r) => r.place) };
  }, [all, f, textDays, links, written]); // eslint-disable-line react-hooks/exhaustive-deps
  const groupsOf = useMemo(() => {
    const g = new Map<string, Set<string>>();
    for (const r of all) {
      if (!g.has(r.lang)) g.set(r.lang, new Set());
      g.get(r.lang)!.add(r.group);
    }
    return g;
  }, [all]);

  const set = (p: Partial<Filters>) => {
    setF((o) => ({ ...o, ...p }));
    setLimit(200);
    setSel(null);
  };
  const groupLabel = (r: Pick<Rec, "lang" | "sure">) => A.langs[r.lang] + (r.sure >= 0 ? ` · ${A.sure[r.sure]}` : "");
  const tracks = (rs: Rec[]): Track[] =>
    rs.filter((r) => r.playable).map((r) => ({ rel: r.rel, url: libUrl(AUDIOS_LIB, r.rel), title: r.title, sub: [r.date && formatLecDate(r.date.length === 7 ? r.date.slice(0, 4) : r.date, lang), r.place].filter(Boolean).join(" · ") }));
  const play = (r: Rec, from: Rec[] = list) => {
    const ts = tracks(from.some((x) => x.rel === r.rel) ? from : [r]);
    player.play(ts, Math.max(0, ts.findIndex((x) => x.rel === r.rel)));
  };
  const saveLinks = (next: AudioTexts) => {
    setLinks(next);
    api.setAudioTexts(next).catch((e) => onToast(String(e)));
  };

  const pl = usePlayer();
  const filtering = !!(f.words.trim() || f.lang || f.group || f.year || f.place || f.withText);
  const rec = sel ? all.find((r) => r.rel === sel) ?? null : null;

  // back from a recording: where the list was
  useEffect(() => {
    if (!rec && listRef.current) listRef.current.scrollTop = memo.scroll;
  }, [rec]);

  const years = [...counts.year].sort((a, b) => (a[0] || "9999").localeCompare(b[0] || "9999"));
  const places = [...counts.place].filter(([p]) => p).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  return (
    <div className="audios" ref={listRef} onScroll={(e) => !rec && (memo.scroll = (e.target as HTMLElement).scrollTop)}>
      <header className="anth-head au-head">
        <Headphones size={30} />
        <div>
          <h1>{A.title}</h1>
          <p className="muted">
            {recs ? A.count(all.length) : A.loading}
            {folder && (
              <>
                {" · "}
                <span className="au-folder" title={folder}>
                  {folder}
                </span>
              </>
            )}
          </p>
        </div>
        <div className="au-head-btns">
          <button className="icon-btn" onClick={() => void load(true)} title={A.rescan}>
            <RotateCw size={16} />
          </button>
          <button className="icon-btn" onClick={chooseFolder} title={A.chooseFolder}>
            <FolderOpen size={16} />
          </button>
        </div>
      </header>

      {(noFolder || missing) && (
        <div className="au-empty">
          <p>{missing && folder ? A.missing(folder) : A.noFolder}</p>
          <button className="btn" onClick={chooseFolder}>
            <FolderOpen size={15} /> {A.chooseFolder}
          </button>
        </div>
      )}

      {rec ? (
        <AudioPage
          key={rec.rel}
          t={t}
          lang={lang}
          r={rec}
          groupLabel={groupLabel(rec)}
          link={links[rec.name.toLowerCase()]?.doc !== undefined ? (links[rec.name.toLowerCase()] as { doc: number; ord?: number }) : undefined}
          ownTitle={!!links[rec.name.toLowerCase()]?.title}
          onTitle={(title) => {
            const k = rec.name.toLowerCase();
            const next = { ...links, [k]: { ...links[k], title: title.trim() || undefined } };
            if (!next[k].title) delete next[k].title;
            if (next[k].doc === undefined && !next[k].title) delete next[k];
            saveLinks(next);
          }}
          written={written}
          docs={docs}
          sameDay={rec.date.length === 10 ? all.filter((x) => x.date === rec.date && x.rel !== rec.rel) : []}
          readerStyle={readerStyle}
          fontSize={fontSize}
          onBack={() => setSel(null)}
          onCrumb={(p) => set(p)}
          onPlay={() => play(rec)}
          onOther={(x) => setSel(x.rel)}
          onPlayOther={(x) => play(x, [rec, ...all.filter((y) => y.date === rec.date && y.rel !== rec.rel)])}
          onLink={(w) => {
            const k = rec.name.toLowerCase();
            const title = links[k]?.title;
            const next = { ...links };
            if (w) next[k] = { ...(w.ord === undefined ? { doc: w.doc } : { doc: w.doc, ord: w.ord }), ...(title ? { title } : {}) };
            else if (title) next[k] = { title };
            else delete next[k];
            saveLinks(next);
          }}
          onOpenDoc={onOpenDoc}
        />
      ) : (
        recs &&
        !noFolder && (
          <>
            <div className="anth-filters au-filters">
              <label className="anth-search">
                <Search size={15} />
                <input value={f.words} placeholder={A.search} spellCheck={false} onChange={(e) => set({ words: e.target.value })} autoFocus />
                {f.words && (
                  <button className="icon-btn" onClick={() => set({ words: "" })}>
                    <X size={13} />
                  </button>
                )}
              </label>
              <label className="au-check" title={A.inText}>
                <input type="checkbox" checked={f.inText} onChange={(e) => set({ inText: e.target.checked })} />
                <BookOpen size={14} /> {A.inText}
              </label>
              <label className="au-check">
                <input type="checkbox" checked={f.withText} onChange={(e) => set({ withText: e.target.checked })} />
                {A.withText}
              </label>
              {filtering && (
                <button className="btn ghost" onClick={() => set(NO_FILTERS)}>
                  <X size={14} /> {t.clearFilters}
                </button>
              )}
            </div>

            <div className="au-body">
              <aside className="au-facets">
                <section>
                  <h3>{A.byLang}</h3>
                  {LANG_ORDER.filter((l) => groupsOf.has(l)).map((l) => {
                    const gs = [...groupsOf.get(l)!].sort((a, b) => groupInfo(a).sure - groupInfo(b).sure);
                    const one = gs.length === 1;
                    return (
                      <div key={l} className="au-lang">
                        <button className={`au-facet${f.lang === l && !f.group ? " on" : ""}`} onClick={() => set(f.lang === l && !f.group ? { lang: "", group: "" } : { lang: l, group: "" })}>
                          <span>{A.langs[l]}</span>
                          <span className="n">{counts.lang.get(l) ?? 0}</span>
                        </button>
                        {!one &&
                          gs.map((g) => (
                            <button key={g} className={`au-facet sub${f.group === g ? " on" : ""}`} onClick={() => set(f.group === g ? { group: "", lang: "" } : { group: g, lang: l })}>
                              <span>{A.sure[groupInfo(g).sure] ?? g}</span>
                              <span className="n">{counts.group.get(g) ?? 0}</span>
                            </button>
                          ))}
                      </div>
                    );
                  })}
                </section>
                <section>
                  <h3>{A.byYear}</h3>
                  <div className="au-years">
                    {years.map(([y, n]) => (
                      <button key={y} className={`au-facet${f.year === y ? " on" : ""}`} onClick={() => set({ year: f.year === y ? "" : y })}>
                        <span>{y || A.noYear}</span>
                        <span className="n">{n}</span>
                      </button>
                    ))}
                  </div>
                </section>
                <section>
                  <h3>{A.byPlace}</h3>
                  {places.map(([p, n]) => (
                    <button key={p} className={`au-facet${f.place === p ? " on" : ""}`} onClick={() => set({ place: f.place === p ? "" : p })}>
                      <span>{p}</span>
                      <span className="n">{n}</span>
                    </button>
                  ))}
                </section>
              </aside>

              <div className="au-list">
                <div className="au-list-head">
                  <span className="muted small">{A.found(list.length)}</span>
                  {list.some((r) => r.playable) && (
                    <button className="btn ghost" onClick={() => play(list.find((r) => r.playable)!)}>
                      <Play size={14} /> {A.playAll}
                    </button>
                  )}
                </div>
                {list.slice(0, limit).map((r) => {
                  const on = pl.track?.rel === r.rel;
                  const tx = textOf(r);
                  const snip = textDays?.get(r.date);
                  return (
                    <div key={r.rel} className={`au-row${on ? " on" : ""}`}>
                      <button
                        className="au-play"
                        disabled={!r.playable}
                        onClick={() => (on ? player.toggle() : play(r))}
                        title={r.playable ? A.listen : A.cantPlay}
                      >
                        {on && pl.playing ? <Pause size={15} /> : <Play size={15} />}
                      </button>
                      <button className="au-row-main" onClick={() => setSel(r.rel)}>
                        <span className="au-row-title">
                          {r.title}
                          {tx && <BookOpen size={13} className="au-has-text" />}
                        </span>
                        <span className="au-row-meta">
                          {r.date ? formatLecDate(r.date.length === 7 ? r.date.slice(0, 4) : r.date, lang) : A.noYear}
                          {r.part && ` · ${r.part}`}
                          {r.place && ` · ${r.place}`} · <span className={`au-lang-chip l-${r.lang}`}>{groupLabel(r)}</span>
                        </span>
                        {snip && words.length > 0 && !words.every((w) => r.hay.includes(` ${w}`)) && (
                          <span className="anth-row-snip">
                            <b>{A.inWritten}:</b> <span dangerouslySetInnerHTML={{ __html: snip }} />
                          </span>
                        )}
                      </button>
                    </div>
                  );
                })}
                {list.length > limit && (
                  <button className="btn ghost au-more" onClick={() => setLimit((l) => l + 300)}>
                    {A.more(list.length - limit)}
                  </button>
                )}
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
}

// ------------------------------------------------------------------ one recording

function AudioPage(p: {
  t: T;
  lang: Lang;
  r: Rec;
  groupLabel: string;
  link?: { doc: number; ord?: number };
  /** the title was given by hand */
  ownTitle: boolean;
  onTitle: (title: string) => void;
  written: { byDate: Map<string, Written[]>; all: Written[] } | null;
  docs: DocListItem[];
  sameDay: Rec[];
  readerStyle: ReaderStyle;
  fontSize: number;
  onBack: () => void;
  onCrumb: (f: Partial<Filters>) => void;
  onPlay: () => void;
  onOther: (r: Rec) => void;
  onPlayOther: (r: Rec) => void;
  onLink: (w: { doc: number; ord?: number } | null) => void;
  onOpenDoc: (docId: number, ordinal?: number) => void;
}) {
  const { t, lang, r } = p;
  const A = t.au;
  // the lectures of that day, the one most like the recording's title first (several on one day: Whisper, 18-11-2026)
  const day = useMemo(() => {
    const ws = p.written?.byDate.get(r.date) ?? [];
    const mine = new Set(foldName(r.title).split(" ").filter((w) => w.length > 2));
    const score = (w: Written) => foldName(w.title).split(" ").filter((x) => x.length > 2 && [...mine].some((m) => x.startsWith(m) || m.startsWith(x))).length;
    return [...ws].sort((x, y) => score(y) - score(x));
  }, [p.written, r.date, r.title]);
  // the text shown: the one linked by hand, or else the first of that day
  const shown = p.link ?? (day[0] ? { doc: day[0].doc, ord: day[0].ord } : null);
  const [picking, setPicking] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [bg, setBgState] = useState<Bg>(readBg);
  const setBg = (b: Bg) => {
    setBgState(b);
    try {
      localStorage.setItem(BG_KEY, b);
    } catch {
      /* not remembered */
    }
  };
  const saveTitle = () => {
    if (editing !== null && editing.trim() !== r.title) p.onTitle(editing);
    setEditing(null);
  };
  const pl = usePlayer();
  const isThis = pl.track?.rel === r.rel;
  const docTitle = (w: { doc: number; ord?: number }) => {
    const x = p.written?.all.find((y) => y.doc === w.doc && y.ord === w.ord);
    if (x) return `${x.date} · ${x.title}`;
    return p.docs.find((d) => d.id === w.doc)?.title ?? `#${w.doc}`;
  };
  return (
    <article className="au-page">
      <button className="link-btn au-back" onClick={p.onBack}>
        <ArrowLeft size={15} /> {t.vamsaBack}
      </button>
      <nav className="au-crumbs">
        <button className="link-btn" onClick={() => p.onCrumb({ ...NO_FILTERS })}>
          {t.audios}
        </button>
        {" / "}
        <button className="link-btn" onClick={() => p.onCrumb({ ...NO_FILTERS, lang: r.lang, group: r.group })}>
          {p.groupLabel}
        </button>
        {r.year && (
          <>
            {" / "}
            <button className="link-btn" onClick={() => p.onCrumb({ ...NO_FILTERS, lang: r.lang, group: r.group, year: r.year })}>
              {r.year}
            </button>
          </>
        )}
      </nav>
      {editing === null ? (
        <h1 className="au-title">
          {r.title}
          <button className="icon-btn au-title-btn" onClick={() => setEditing(r.title)} title={A.editTitle}>
            <Pencil size={15} />
          </button>
          {p.ownTitle && (
            <button className="icon-btn au-title-btn" onClick={() => p.onTitle("")} title={A.resetTitle}>
              <RotateCcw size={15} />
            </button>
          )}
        </h1>
      ) : (
        <div className="au-title-edit">
          <input
            autoFocus
            value={editing}
            spellCheck={false}
            onChange={(e) => setEditing(e.target.value)}
            onKeyDown={(e) => (e.key === "Enter" ? saveTitle() : e.key === "Escape" && setEditing(null))}
          />
          <button className="btn" onClick={saveTitle}>
            <Check size={14} /> {A.save}
          </button>
          <button className="btn ghost" onClick={() => setEditing(null)}>
            {A.cancel}
          </button>
        </div>
      )}
      <div className="au-meta">
        {r.date && <span>{formatLecDate(r.date.length === 7 ? r.date.slice(0, 4) : r.date, lang)}</span>}
        {r.part && <span className="au-chip">{r.part}</span>}
        {r.place && (
          <button className="au-chip" onClick={() => p.onCrumb({ ...NO_FILTERS, place: r.place })}>
            <MapPin size={12} /> {r.place}
          </button>
        )}
        <button className={`au-chip au-lang-chip l-${r.lang}`} onClick={() => p.onCrumb({ ...NO_FILTERS, lang: r.lang, group: r.group })}>
          {p.groupLabel}
        </button>
        <code className="au-file" title={r.rel}>
          {r.name}
        </code>
      </div>

      <section className="au-card">
        <div className="au-card-head">
          <span className="au-card-label">{A.original}</span>
          <button className="link-btn" onClick={() => api.libraryOpen(AUDIOS_LIB, r.rel).catch(() => {})}>
            <ExternalLink size={13} /> {A.openPc}
          </button>
        </div>
        {!r.playable ? (
          <p className="muted">{A.cantPlay}</p>
        ) : isThis ? (
          <Transport t={t} big />
        ) : (
          <button className="btn au-listen" onClick={p.onPlay}>
            <Play size={16} /> {savedPosition(r.rel) ? A.resume(clock(savedPosition(r.rel))) : A.listen}
          </button>
        )}
        {isThis && pl.error && <p className="au-error">{A.playError}</p>}
      </section>

      {p.sameDay.length > 0 && (
        <section className="au-sameday">
          <h3>{A.sameDayAudios}</h3>
          {p.sameDay.map((x) => (
            <div key={x.rel} className="au-row small">
              <button className="au-play" disabled={!x.playable} onClick={() => p.onPlayOther(x)}>
                <Play size={13} />
              </button>
              <button className="au-row-main" onClick={() => p.onOther(x)}>
                <span className="au-row-title">{x.title}</span>
                <span className="au-row-meta">
                  {[x.part, x.place, A.langs[x.lang]].filter(Boolean).join(" · ")}
                </span>
              </button>
            </div>
          ))}
        </section>
      )}

      <section className="au-written">
        <div className="au-written-head">
          <h2>{A.written}</h2>
          {shown && (
            <>
              <span className="muted small">{docTitle(shown)}</span>
              <button className="link-btn" onClick={() => p.onOpenDoc(shown.doc, shown.ord ?? 0)}>
                <BookOpen size={13} /> {A.openReader}
              </button>
              {p.link && (
                <button className="link-btn" onClick={() => p.onLink(null)}>
                  <Link2Off size={13} /> {A.unlink}
                </button>
              )}
            </>
          )}
          <button className="link-btn" onClick={() => setPicking((x) => !x)}>
            <Link2 size={13} /> {shown ? A.change : A.addText}
          </button>
          {shown && (
            <span className="au-bg-pick" title={A.bg}>
              {(["mandala", "parchment", "none"] as Bg[]).map((b) => (
                <button key={b} className={bg === b ? "on" : ""} onClick={() => setBg(b)}>
                  {A.bgs[b]}
                </button>
              ))}
            </span>
          )}
        </div>
        {/* the other lectures of that day: choose which one goes with this recording */}
        {day.length > 1 && (
          <div className="au-day-texts">
            <span className="muted small">{A.sameDay}:</span>
            {day.map((w) => {
              const on = shown && shown.doc === w.doc && shown.ord === w.ord;
              return (
                <button key={`${w.doc}:${w.ord}`} className={`au-chip${on ? " on" : ""}`} onClick={() => p.onLink({ doc: w.doc, ord: w.ord })} title={A.link}>
                  {w.src === "anth" ? A.anth : A.lec}: {w.title}
                </button>
              );
            })}
          </div>
        )}
        {picking && (
          <TextPicker
            t={t}
            written={p.written?.all ?? []}
            docs={p.docs}
            date={r.date}
            onPick={(w) => {
              p.onLink(w);
              setPicking(false);
            }}
          />
        )}
        {shown ? <WrittenText key={`${shown.doc}:${shown.ord}`} doc={shown.doc} ord={shown.ord} bg={bg} readerStyle={p.readerStyle} fontSize={p.fontSize} /> : <p className="muted">{A.noText}</p>}
      </section>
    </article>
  );
}

/** choose any text of the database as a recording's written lecture */
function TextPicker({ t, written, docs, date, onPick }: { t: T; written: Written[]; docs: DocListItem[]; date: string; onPick: (w: { doc: number; ord?: number }) => void }) {
  const [q, setQ] = useState(date.length === 10 ? date : "");
  const words = foldName(q).split(" ").filter(Boolean);
  const opts = useMemo(() => {
    const ws: { key: string; label: string; w: { doc: number; ord?: number } }[] = [
      ...written.map((w) => ({ key: `${w.doc}:${w.ord}`, label: `${w.date} · ${w.title} (${w.src === "anth" ? t.au.anth : t.au.lec})`, w: { doc: w.doc, ord: w.ord } })),
      ...docs.filter((d) => d.dir.split("/")[0] !== LECTURES && d.dir.split("/")[0] !== ANTHOLOGY).map((d) => ({ key: `${d.id}`, label: `${d.title} (${d.dir})`, w: { doc: d.id } })),
    ];
    return ws;
  }, [written, docs]); // eslint-disable-line react-hooks/exhaustive-deps
  const shown = words.length ? opts.filter((o) => words.every((w) => foldName(o.label).includes(w))).slice(0, 40) : [];
  return (
    <div className="au-picker">
      <label className="anth-search">
        <Search size={14} />
        <input autoFocus value={q} placeholder={t.au.pickPh} spellCheck={false} onChange={(e) => setQ(e.target.value)} />
      </label>
      <div className="au-picker-list">
        {shown.map((o) => (
          <button key={o.key} onClick={() => onPick(o.w)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const NO_TERMS: never[] = [];
/** the written lecture under the player, as in the reader */
function WrittenText({ doc, ord, bg, readerStyle, fontSize }: { doc: number; ord?: number; bg: Bg; readerStyle: ReaderStyle; fontSize: number }) {
  const [secs, setSecs] = useState<SectionText[] | null>(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      if (ord !== undefined) return api.getSections(doc, ord, ord);
      const { doc: d } = await api.getDoc(doc);
      return api.getSections(doc, 0, Math.min(d.sections, 400) - 1);
    })().then((s) => alive && setSecs(s), () => alive && setSecs([]));
    return () => {
      alive = false;
    };
  }, [doc, ord]);
  if (!secs) return null;
  // with a background, always as a book (the markdown drawn, in the serif letter); without one, as the reader is set
  const plain = bg === "none";
  const source = plain && readerStyle === "editor";
  const cls = plain ? (source ? "src-view" : readerStyle) : bg === "parchment" ? "serif parchment" : "serif au-temple";
  const style = { fontSize, ...(bg === "mandala" ? { "--au-mandala": templeMandalaUrl(0.2), "--au-mandala-dark": templeMandalaUrl(0.13) } : {}) } as CSSProperties;
  return (
    <div className={`reader-body au-text ${cls}`} style={style}>
      {secs.map((s) => (
        <SectionView key={s.id} s={s} terms={NO_TERMS} multi={secs.length > 1} source={source} names={null} self={null} book />
      ))}
    </div>
  );
}

// ------------------------------------------------------------------ the controls

/** play / pause, 15 s back and forward, the bar to move along, the time and the speed */
export function Transport({ t, big }: { t: T; big?: boolean }) {
  const A = t.au;
  const s = usePlayer();
  const [drag, setDrag] = useState<number | null>(null);
  const time = drag ?? s.time;
  return (
    <div className={`au-transport${big ? " big" : ""}`}>
      <button className="icon-btn" onClick={() => player.prev()} title={A.prev} disabled={s.index === 0 && s.time < 5}>
        <SkipBack size={big ? 17 : 15} />
      </button>
      <button className="icon-btn au-15" onClick={() => player.skip(-15)} title={A.back15}>
        −15
      </button>
      <button className="au-pp" onClick={() => player.toggle()} title={s.playing ? "Pause" : A.listen}>
        {s.playing ? <Pause size={big ? 20 : 16} /> : <Play size={big ? 20 : 16} />}
      </button>
      <button className="icon-btn au-15" onClick={() => player.skip(15)} title={A.fwd15}>
        +15
      </button>
      <button className="icon-btn" onClick={() => player.next()} title={A.next} disabled={s.index + 1 >= s.list.length}>
        <SkipForward size={big ? 17 : 15} />
      </button>
      <span className="au-time">{clock(time)}</span>
      <input
        className="au-seek"
        type="range"
        min={0}
        max={s.duration || 0}
        step={1}
        value={Math.min(time, s.duration || 0)}
        onChange={(e) => setDrag(+e.target.value)}
        onPointerUp={() => drag !== null && (player.seek(drag), setDrag(null))}
        onKeyUp={() => drag !== null && (player.seek(drag), setDrag(null))}
      />
      <span className="au-time">{clock(s.duration)}</span>
      <select className="au-rate" value={s.rate} onChange={(e) => player.rate(+e.target.value)} title={A.speed}>
        {[0.75, 1, 1.1, 1.25, 1.5, 1.75, 2].map((r) => (
          <option key={r} value={r}>
            {r}×
          </option>
        ))}
      </select>
    </div>
  );
}

/** The bar at the bottom of the window while a recording plays (it goes on while moving around the app). */
export function AudiosBar({ t, onOpen }: { t: T; onOpen: (rel: string) => void }) {
  const s = usePlayer();
  if (!s.track) return null;
  return (
    <div className="audio-bar au-bar">
      <Headphones size={16} />
      <button className="link-btn audio-title" onClick={() => onOpen(s.track!.rel)} title={t.au.toPage}>
        {s.track.title}
        {s.track.sub && <span className="muted small"> · {s.track.sub}</span>}
        {s.list.length > 1 && (
          <span className="muted small">
            {" "}
            ({s.index + 1}/{s.list.length})
          </span>
        )}
      </button>
      <Transport t={t} />
      <button className="icon-btn" onClick={() => player.close()} title={t.au.close}>
        <X size={15} />
      </button>
    </div>
  );
}
