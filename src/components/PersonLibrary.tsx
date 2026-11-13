// A record's own library (13-11-2026, Whisper: «desde su ficha… his books, his lectures mp3, videos mp4, images»):
// the files of a folder on the PC linked to the record, by kind and sub-folder, opened inside the window — books and
// written lectures in a viewer, videos with their player (and subtitles), audio in the bar at the bottom of the
// window (App.tsx) — and a search only in this library's books, lectures and subtitles.
import { useEffect, useMemo, useRef, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { ArrowLeft, BookOpen, FileText, Film, Folder, FolderOpen, Globe, Image as ImageIcon, Library, Link2Off, Music, Pause, Play, Plus, RotateCw, Search, X } from "lucide-react";
import { api, EMPTY_PERSON, fileUrl, LibEntry, LibHit, libUrl, LibraryView, PersonFields } from "../api";
import { T } from "../i18n";
import { joinNotes, linkKind, linkLabel, linkOpenTarget, NoteLink, splitNotes } from "../notesLinks";
import { ask } from "./ui";
import { ReaderStyle, SectionView } from "./Reader";

const NO_TERMS: never[] = [];

/** A Markdown or text file of the library (written lectures, 13-11-2026: «los .md salen en blanco» in a frame), read
 *  in the app's own reader look. */
function TextFile({ id, rel, url, readerStyle, fontSize }: { id: number; rel: string; url: string; readerStyle: ReaderStyle; fontSize: number }) {
  const [text, setText] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const box = useRef<HTMLDivElement>(null);
  // (the same objects on every render: SectionView writes its text again when they change, and the pictures with it)
  const section = useMemo(() => (text === null ? null : { id: 0, ordinal: 0, heading: null, text }), [text]);
  // its pictures («![[photo.jpg]]», Obsidian) and its recordings («![[talk.mp3]]»: a player), found in the library
  // (next to it, in «_resources»…: library.rs). The text may be written again by SectionView after this: an observer
  // puts them back.
  useEffect(() => {
    const root = box.current;
    if (!root || text === null) return;
    let live = true;
    const IMG = /\.(?:png|jpe?g|gif|bmp|webp|avif)$/i;
    const AUDIO = /\.(?:mp3|m4a|ogg|opus|wav|flac|aac)$/i;
    const found = new Map<string, string | null>(); // name → path in the library (null: not there)
    const asking = new Set<string>();
    const show = (el: HTMLImageElement | HTMLAudioElement) => {
      const p = found.get(el.dataset.attach!);
      if (p === undefined) return;
      if (p) {
        if (el.getAttribute("src") !== libUrl(id, p)) el.src = libUrl(id, p);
        el.classList.remove("missing");
      } else el.classList.add("missing");
    };
    const make = (name: string, width?: string) => {
      if (AUDIO.test(name)) {
        const au = document.createElement("audio");
        au.controls = true;
        au.preload = "none";
        au.dataset.attach = name;
        au.className = "ln-audio";
        return au;
      }
      const img = document.createElement("img");
      img.dataset.attach = name;
      if (width) img.width = parseInt(width, 10);
      img.className = "ln-img";
      img.loading = "lazy";
      return img;
    };
    const apply = () => {
      // the editor look shows the line as written: the picture or the player goes under it
      root.querySelectorAll<HTMLElement>(".ln").forEach((ln) => {
        if (ln.querySelector("[data-attach]")) return;
        // («Audio Link: ![[talk.mp3]]»: also in the middle of a line)
        for (const m of (ln.textContent ?? "").matchAll(/!\[\[([^\]|#]+)(?:\|\s*(\d+))?[^\]]*\]\]/g)) {
          const n = m[1].trim();
          if (IMG.test(n) || AUDIO.test(n)) ln.appendChild(make(n, m[2]));
        }
      });
      // the book look: an embedded recording is a link «📎 talk.mp3» — the player after it
      root.querySelectorAll<HTMLElement>("a.embed[data-wikilink]").forEach((a) => {
        const n = a.dataset.wikilink!.trim();
        if (!AUDIO.test(n) || (a.nextElementSibling as HTMLElement | null)?.dataset?.attach) return;
        a.after(make(n));
      });
      const media = Array.from(root.querySelectorAll<HTMLImageElement | HTMLAudioElement>("img[data-attach], audio[data-attach]"));
      media.forEach(show);
      const want = [...new Set(media.map((i) => i.dataset.attach!))].filter((n) => !found.has(n) && !asking.has(n));
      if (!want.length) return;
      want.forEach((n) => asking.add(n));
      api.libraryAttachments(id, rel, want).then((paths) => {
        if (!live) return;
        want.forEach((n, i) => found.set(n, paths[i]));
        root.querySelectorAll<HTMLImageElement | HTMLAudioElement>("img[data-attach], audio[data-attach]").forEach(show);
      }, () => {});
    };
    apply();
    const watch = new MutationObserver(() => apply());
    watch.observe(root, { childList: true, subtree: true });
    return () => {
      live = false;
      watch.disconnect();
    };
  }, [text, readerStyle, id, rel]);
  useEffect(() => {
    let live = true;
    fetch(url)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`${r.status}`))))
      .then((x) => live && setText(x), (e) => live && setErr(String(e)));
    return () => {
      live = false;
    };
  }, [url]);
  if (err) return <p className="muted web-note">{err}</p>;
  if (text === null) return <p className="muted web-note">…</p>;
  return (
    <div className="reader-scroll lib-text">
      <div ref={box} className={`reader-body ${readerStyle === "editor" ? "src-view" : readerStyle}`} style={{ fontSize }}>
        <SectionView s={section!} terms={NO_TERMS} multi={false} source={readerStyle === "editor"} names={null} self={null} />
      </div>
    </div>
  );
}

/** The record's links at the top of its library (14-11-2026, Whisper: «arriba una opción para añadir links… especialmente
 *  online links», better there than at the bottom of the record). The same links as the record's «Enlaces» (kept at the
 *  end of its notes: notesLinks.ts): what is added here shows there too. */
function LibLinks({ t, id, onToast, onOpenWeb }: { t: T; id: number; onToast: (m: string) => void; onOpenWeb: (url: string, title: string) => void }) {
  const [links, setLinks] = useState<NoteLink[] | null>(null);
  const [draft, setDraft] = useState<NoteLink | null>(null);
  const load = () => api.getPerson(id).then((p) => setLinks(splitNotes(p.notes).links), (e) => onToast(String(e)));
  useEffect(() => {
    setLinks(null);
    setDraft(null);
    void load();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  // write the links into the record's notes (read again just now, so nothing else in the record is lost)
  const save = async (next: NoteLink[]) => {
    try {
      const p = await api.getPerson(id);
      const fields = Object.fromEntries((Object.keys(EMPTY_PERSON) as (keyof PersonFields)[]).map((k) => [k, (p as unknown as PersonFields)[k] ?? ""])) as unknown as PersonFields;
      await api.updatePerson(id, { ...fields, notes: joinNotes(splitNotes(p.notes).body, next) });
      setLinks(next);
      return true;
    } catch (e) {
      onToast(String(e));
      return false;
    }
  };
  const pick = async (directory: boolean) => {
    const p = await open({ multiple: false, directory });
    if (typeof p === "string" && draft) setDraft({ target: p, label: draft.label || p.replace(/[\\/]+$/, "").split(/[\\/]/).pop() || "" });
  };
  if (!links) return null;
  return (
    <div className="lib-links">
      <span className="lib-links-head">{t.linksSection}</span>
      {links.map((l, i) => {
        const kind = linkKind(l.target);
        const Icon = kind === "web" ? Globe : kind === "folder" ? Folder : FileText;
        return (
          <span key={i} className={`lib-link ${kind}`}>
            <a
              href={kind === "web" ? linkOpenTarget(l.target) : "#"}
              title={l.target}
              onClick={(e) => {
                e.preventDefault();
                // web pages inside the window (WebPage.tsx); files and folders with Windows
                if (kind === "web" && /^(https?:|www\.)/i.test(l.target)) return onOpenWeb(linkOpenTarget(l.target), linkLabel(l));
                api.openExternal(linkOpenTarget(l.target)).catch((err) => onToast(String(err)));
              }}
            >
              <Icon size={13} />
              <span>{linkLabel(l)}</span>
            </a>
            <button
              className="lib-link-x"
              title={t.linksRemove}
              onClick={async () => {
                if (await ask(`${t.linksRemove}: «${linkLabel(l)}»?`)) void save(links.filter((_, k) => k !== i));
              }}
            >
              <X size={11} />
            </button>
          </span>
        );
      })}
      {!draft ? (
        <button className="btn ghost small" onClick={() => setDraft({ label: "", target: "" })} title={t.linksAddHint}>
          <Plus size={13} /> {t.linksAdd}
        </button>
      ) : (
        <form
          className="lib-link-form"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!draft.target.trim()) return;
            if (await save([...links, { label: draft.label.trim(), target: draft.target.trim() }])) setDraft(null);
          }}
        >
          <input autoFocus value={draft.target} placeholder={t.linksTarget} onChange={(e) => setDraft({ ...draft, target: e.target.value })} className="target" />
          <input value={draft.label} placeholder={t.linksLabel} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
          <button type="button" className="icon-btn" title={t.linksPickFile} onClick={() => pick(false)}>
            <FileText size={14} />
          </button>
          <button type="button" className="icon-btn" title={t.linksPickFolder} onClick={() => pick(true)}>
            <Folder size={14} />
          </button>
          <button type="submit" className="btn small" disabled={!draft.target.trim()}>
            {t.save}
          </button>
          <button type="button" className="btn ghost small" onClick={() => setDraft(null)}>
            {t.cancel}
          </button>
        </form>
      )}
    </div>
  );
}

type Section = LibEntry["kind"];
const SECTIONS: Section[] = ["book", "page", "audio", "video", "image", "other"];

/** What is open in the viewer. */
type Shown = { e: LibEntry; at?: number } | null;

const ABBR: Record<string, string> = {
  cc: "Caitanya-caritāmṛta",
  sb: "Śrīmad-Bhāgavatam",
  bg: "Bhagavad-gītā",
  seminar: "Seminars",
  various: "Various",
  kirtans: "Kīrtanas",
  mix: "Mix",
};

/** «GGM_SB_-_Krishna_The_Supreme_Thief.mp3» → «Krishna The Supreme Thief» (and its date apart, if it has one). */
export function prettyTitle(name: string, prefix: string | null): { title: string; date: string } {
  let s = name.replace(/\.[^.]+$/, "").replace(/_/g, " ").replace(/\s+/g, " ").trim();
  if (prefix && s.toLowerCase().startsWith(prefix.toLowerCase() + " ")) s = s.slice(prefix.length + 1);
  // «SB - …», «Seminar - …»: the sub-folder already says it
  s = s.replace(/^(cc|sb|bg|seminar|various|mix)\s+-\s+/i, "");
  let date = "";
  // where it was given, at the end («… bhub», «… uk»): next to the date
  const PLACES: Record<string, string> = { bhub: "Bhubaneswar", bbsr: "Bhubaneswar", uk: "UK", usa: "USA" };
  let where = "";
  s = s.replace(/([a-z])\.(?=[a-z])/gi, "$1 "); // «crying.to.get.the.mercy»
  const pm = s.match(/(?:\s|\d)(bhub|bbsr|uk|usa)\.?$/i);
  if (pm) {
    where = PLACES[pm[1].toLowerCase()];
    s = s.slice(0, s.length - pm[0].length + (/\d/.test(pm[0][0]) ? 1 : 0)).trim();
  }
  // the last real date in the name, with dots («sb9.11.27 … 7.04.94»: the verse comes first; «13.87.92» is no date)
  const d = [...s.matchAll(/(?<!\d)(\d{1,2})\.(\d{1,2})\.(\d{2}|\d{4})(?!\d)/g)].filter((m) => Number(m[1]) <= 31 && Number(m[2]) <= 12 && Number(m[1]) > 0).pop();
  // «17.mar.94»
  const MON = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const dm = d ? null : s.match(/(?<!\d)(\d{1,2})[. ]([a-z]{3})[. ](\d{2})(?!\d)/i);
  if (dm && MON.includes(dm[2].toLowerCase())) {
    date = `${dm[1].padStart(2, "0")}-${String(MON.indexOf(dm[2].toLowerCase()) + 1).padStart(2, "0")}-${(Number(dm[3]) > 30 ? "19" : "20") + dm[3]}`;
    s = s.replace(dm[0], "").replace(/\s+/g, " ").trim();
  }
  if (d) {
    const y = d[3].length === 2 ? (Number(d[3]) > 30 ? "19" : "20") + d[3] : d[3];
    date = `${d[1].padStart(2, "0")}-${d[2].padStart(2, "0")}-${y}`;
    s = s.replace(d[0], "").replace(/\s+/g, " ").trim();
  }
  // «SB 01-02-07 - What is Bhakti» is a verse: «ŚB 1.2.7 — What is Bhakti» («00»: the chapter); also «CC Adi 01-17-45»
  const BOOK: Record<string, string> = { sb: "ŚB", cc: "CC", bg: "BG" };
  const vm = s.match(/^(sb|cc|bg)[\s-]+(?:(adi|madhya|antya)[\s-]+)?(\d{1,2})[-.](\d{1,3})(?:[-.](\d{1,3}(?:-\d{1,3})?))?(?=\s|$)\s*(?:-\s*)?/i);
  // the CC has three līlās and the ŚB twelve cantos: more than that is a date («CC 06-08-94»)
  const maxPart: Record<string, number> = { sb: 12, cc: 3, bg: 18 };
  if (vm && !vm[2] && Number(vm[3]) > maxPart[vm[1].toLowerCase()] && Number(vm[4]) <= 12 && vm[5] && /^\d{2}$/.test(vm[5])) {
    const y = (Number(vm[5]) > 30 ? "19" : "20") + vm[5];
    date = date || `${vm[3].padStart(2, "0")}-${vm[4].padStart(2, "0")}-${y}`;
    const rest = s.slice(vm[0].length).trim();
    s = rest ? `${BOOK[vm[1].toLowerCase()]} — ${rest}` : BOOK[vm[1].toLowerCase()];
  } else if (vm) {
    const n = (x: string) => x.split("-").map((k) => String(Number(k))).join("-");
    const parts = [n(vm[3]), n(vm[4]), vm[5] ? n(vm[5]) : ""].filter((x) => x && x !== "0");
    const ref = `${BOOK[vm[1].toLowerCase()]} ${parts.join(".")}`;
    const rest = s.slice(vm[0].length).trim();
    s = rest ? `${ref} — ${rest}` : ref;
  }
  if (where) date = date ? `${date} · ${where}` : where;
  if (/^\d{1,3}_/.test(name)) s = s.replace(/^\d{1,3}\s+(?=\D)/, ""); // a running number in front («12_radha…»), not «108 Jewels»
  s = s.replace(/\s+-\s*$/, "").replace(/^-\s*/, "");
  if (s && s === s.toLowerCase()) s = s[0].toUpperCase() + s.slice(1);
  return { title: s || name, date };
}

/** The word most files of a folder start with («GGM»), to leave it out of their titles. */
function commonPrefix(entries: LibEntry[]): string | null {
  const counts = new Map<string, number>();
  for (const e of entries) {
    const w = e.name.split(/[_\s]/)[0];
    if (w && w.length <= 6 && /^[A-Za-z]+$/.test(w)) counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return best && best[1] >= Math.max(3, entries.length / 3) ? best[0] : null;
}

/** «Srila Gour Govinda mp3/CC» → «mp3 › Caitanya-caritāmṛta» (the folder's own name left out). */
function prettyDir(dir: string, base: string): string {
  if (!dir) return "";
  const words = base.toLowerCase().split(/\s+/);
  return dir
    .split("/")
    .map((part) => {
      let w = part.split(/\s+/);
      while (w.length > 1 && words.includes(w[0].toLowerCase())) w = w.slice(1);
      const s = w.join(" ");
      return ABBR[s.toLowerCase()] ?? (s === s.toUpperCase() && s.length > 3 ? s[0] + s.slice(1).toLowerCase() : s);
    })
    .join(" › ");
}

const size = (n: number) => (n > 1e9 ? `${(n / 1e9).toFixed(1)} GB` : n > 1e6 ? `${Math.round(n / 1e6)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`);
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function PersonLibrary({
  t,
  id,
  name,
  hasPhoto,
  onBack,
  onPlay,
  playing,
  onToast,
  onChanged,
  onOpenWeb,
  readerStyle,
  fontSize,
}: {
  t: T;
  /** how the app's texts are read (Settings): the written lectures in .md are read the same way */
  readerStyle: ReaderStyle;
  fontSize: number;
  /** a web link of the record, opened inside the window */
  onOpenWeb: (url: string, title: string) => void;
  id: number;
  name: string;
  hasPhoto: boolean;
  onBack: () => void;
  /** play an audio file in the bar at the bottom (with the rest of its sub-folder after it) */
  onPlay: (list: LibEntry[], index: number) => void;
  /** the audio file playing now (rel), if it is of this library */
  playing: string | null;
  onToast: (m: string) => void;
  /** a folder was linked or unlinked */
  onChanged: () => void;
}) {
  const [view, setView] = useState<LibraryView | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    setView(null);
    api.getLibrary(id).then(setView, (e) => onToast(String(e)));
  }, [id, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const [section, setSection] = useState<Section | "all">("all");
  const [shown, setShown] = useState<Shown>(null);
  useEffect(() => setShown(null), [id]);

  const base = view?.folder?.split(/[\\/]/).pop() ?? "";
  const entries = useMemo(() => (view?.entries ?? []).filter((e) => e.kind !== "subtitle"), [view]);
  const byRel = useMemo(() => new Map(entries.map((e) => [e.rel, e])), [entries]);
  const prefix = useMemo(() => commonPrefix(entries), [entries]);
  const counts = useMemo(() => {
    const c = new Map<Section, number>();
    for (const e of entries) c.set(e.kind, (c.get(e.kind) ?? 0) + 1);
    return c;
  }, [entries]);
  // a Calibre book has its real title (folder / metadata.opf); the rest, from the file name
  const title = (e: LibEntry) => (e.title ? { title: e.title.replace(/_/g, " ").replace(/\s+/g, " ").trim(), date: "" } : prettyTitle(e.name, prefix));

  const link = async () => {
    const picked = await open({ directory: true, title: t.lib.pickFolder(name) });
    if (typeof picked !== "string") return;
    try {
      await api.setLibraryFolder(id, picked);
      setTick((n) => n + 1);
      onChanged();
    } catch (e) {
      onToast(String(e));
    }
  };
  // the folder read again (books or lectures added or taken away by hand); the search index follows at the next search
  const refresh = async () => {
    try {
      const v = await api.getLibrary(id);
      setView(v);
      setHits(null);
      onToast(t.lib.refreshed(v.entries.filter((e) => e.kind !== "subtitle").length));
    } catch (e) {
      onToast(String(e));
    }
  };
  const unlink = async () => {
    if (!(await ask(t.lib.unlinkConfirm))) return;
    await api.setLibraryFolder(id, null).catch((e) => onToast(String(e)));
    setTick((n) => n + 1);
    onChanged();
  };

  // ---- search only in this library
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<LibHit[] | null>(null);
  const [busy, setBusy] = useState("");
  const search = async () => {
    if (!q.trim()) return setHits(null);
    try {
      setBusy(view && view.indexed > 0 ? t.lib.searching : t.lib.indexing);
      await api.libraryIndex(id);
      setHits(await api.librarySearch(id, q));
      setTick((n) => n + 1);
    } catch (e) {
      onToast(String(e));
    } finally {
      setBusy("");
    }
  };

  // ---- the files, by sub-folder
  // big libraries (1.000 books, 1.000 lectures): «All» shows the first few of each folder, «See all» the rest; and a
  // filter by title
  const [flt, setFlt] = useState("");
  const [opened, setOpened] = useState<Set<string>>(new Set());
  useEffect(() => (setFlt(""), setOpened(new Set())), [id]);
  const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const groups = useMemo(() => {
    const out: { dir: string; items: LibEntry[] }[] = [];
    const words = fold(flt).split(/\s+/).filter(Boolean);
    const match = (e: LibEntry) => !words.length || words.every((w) => fold(`${title(e).title} ${e.name} ${e.dir}`).includes(w));
    for (const e of entries.filter((x) => (section === "all" || x.kind === section) && match(x))) {
      const last = out[out.length - 1];
      if (last && last.dir === e.dir) last.items.push(e);
      else out.push({ dir: e.dir, items: [e] });
    }
    return out;
  }, [entries, section, flt]); // eslint-disable-line react-hooks/exhaustive-deps

  const openEntry = (e: LibEntry, at?: number) => {
    if (e.kind === "audio") {
      const list = entries.filter((x) => x.kind === "audio" && x.dir === e.dir);
      return onPlay(list, list.indexOf(e));
    }
    // what the window cannot show (EPUB, Word…) opens with its program
    if (e.kind === "other" || (e.kind === "book" && !/\.(pdf|txt|md)$/i.test(e.name)))
      return void api.libraryOpen(id, e.rel).catch((err) => onToast(String(err)));
    setShown({ e, at });
  };

  const icon = (k: Section) =>
    k === "book" ? <BookOpen size={15} /> : k === "page" ? <FileText size={15} /> : k === "audio" ? <Music size={15} /> : k === "video" ? <Film size={15} /> : k === "image" ? <ImageIcon size={15} /> : <FolderOpen size={15} />;

  // ---- the viewer: a book, a written lecture, a video or a picture inside the window
  if (shown) {
    const e = shown.e;
    const url = libUrl(id, e.rel);
    const tt = title(e);
    return (
      <div className="reader">
        <div className="lib-viewer">
          <div className="lib-viewer-bar">
            <button className="btn ghost small" onClick={() => setShown(null)}>
              <ArrowLeft size={15} /> {t.lib.back}
            </button>
            <span className="lib-viewer-title" title={e.rel}>
              {icon(e.kind)} {tt.title}
              {tt.date && <span className="muted small"> · {tt.date}</span>}
            </span>
            <button className="btn ghost small" onClick={() => api.libraryOpen(id, e.rel).catch((err) => onToast(String(err)))} title={t.lib.openOutsideHint}>
              <FolderOpen size={15} /> {t.lib.openOutside}
            </button>
          </div>
          {e.kind === "video" ? (
            <div className="lib-video">
              <video
                key={e.rel}
                src={url + (shown.at ? `#t=${shown.at}` : "")}
                controls
                autoPlay
                preload="metadata"
                crossOrigin="anonymous"
              >
                {e.subs && <track kind="subtitles" src={libUrl(id, e.subs)} srcLang="en" label="English" default />}
              </video>
            </div>
          ) : e.kind === "image" ? (
            <div className="lib-image">
              <img src={url} alt={tt.title} />
            </div>
          ) : (
            /\.(md|txt)$/i.test(e.name) ? (
              // a written lecture in Markdown (Obsidian): read like the app's texts, in the reading style chosen
              <TextFile key={e.rel} id={id} rel={e.rel} url={url} readerStyle={readerStyle} fontSize={fontSize} />
            ) : (
              <iframe key={e.rel + (shown.at ?? "")} className="lib-frame" src={e.kind === "book" && shown.at ? `${url}#page=${shown.at}` : url} title={tt.title} />
            )
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="reader">
      <div className="reader-scroll">
        <div className="lib-page">
          <header className="lib-head">
            {hasPhoto && <img className="lib-photo" src={fileUrl("photo", id)} alt="" />}
            <div className="grow">
              <button className="link-btn small" onClick={onBack}>
                <ArrowLeft size={13} /> {t.lib.toRecord}
              </button>
              <h1>
                <Library size={22} /> {t.lib.title(name)}
              </h1>
              {view?.folder && (
                <p className="muted small lib-folder">
                  {view.folder}
                  {" · "}
                  <button className="link-btn" onClick={() => api.libraryOpen(id, "").catch((e) => onToast(String(e)))}>
                    {t.lib.openFolder}
                  </button>
                  {" · "}
                  <button className="link-btn" onClick={refresh} title={t.lib.refreshHint}>
                    <RotateCw size={12} /> {t.lib.refresh}
                  </button>
                  {" · "}
                  <button className="link-btn" onClick={link}>
                    {t.lib.changeFolder}
                  </button>
                  {" · "}
                  <button className="link-btn" onClick={unlink}>
                    <Link2Off size={12} /> {t.lib.unlink}
                  </button>
                </p>
              )}
              <LibLinks t={t} id={id} onToast={onToast} onOpenWeb={onOpenWeb} />
            </div>
          </header>

          {!view ? (
            <p className="muted">{t.lib.reading}</p>
          ) : !view.folder ? (
            <div className="lib-empty">
              <p>{t.lib.none(name)}</p>
              <p className="muted small">{t.lib.noneHint}</p>
              <button className="btn" onClick={link}>
                <FolderOpen size={15} /> {t.lib.link}
              </button>
            </div>
          ) : view.missing ? (
            <div className="lib-empty">
              <p>{t.lib.missing}</p>
              <button className="btn" onClick={link}>
                <FolderOpen size={15} /> {t.lib.changeFolder}
              </button>
            </div>
          ) : (
            <>
              <div className="lib-search">
                <Search size={15} />
                <input
                  value={q}
                  placeholder={t.lib.searchHint(name)}
                  spellCheck={false}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void search();
                    if (e.key === "Escape") (setQ(""), setHits(null));
                  }}
                />
                {(q || hits) && (
                  <button className="icon-btn" onClick={() => (setQ(""), setHits(null))}>
                    <X size={13} />
                  </button>
                )}
                <button className="btn small" disabled={!!busy || !q.trim()} onClick={() => void search()}>
                  {t.lib.searchButton}
                </button>
              </div>
              {busy && <p className="muted small">{busy}</p>}
              {hits && (
                <div className="lib-hits">
                  <p className="muted small">{t.lib.hits(hits.length)}</p>
                  {hits.map((h, i) => {
                    const e = byRel.get(h.rel) ?? entries.find((x) => x.subs === h.rel);
                    if (!e) return null;
                    const where = e.kind === "video" ? `${t.lib.minute} ${clock(h.at)}` : e.kind === "book" ? `p. ${h.at}` : "";
                    return (
                      <button key={i} className="lib-hit" onClick={() => openEntry(e, e.kind === "page" ? undefined : h.at)}>
                        <span className="lib-hit-title">
                          {icon(e.kind)} {title(e).title}
                          {where && <span className="muted small"> · {where}</span>}
                        </span>
                        <span className="small lib-snippet">
                          {h.snippet.split(/(«[^»]*»)/).map((s, j) => (s.startsWith("«") ? <mark key={j}>{s.slice(1, -1)}</mark> : s))}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="lib-tabs seg">
                <button className={section === "all" ? "on" : ""} onClick={() => setSection("all")}>
                  {t.lib.all} <span className="pill">{entries.length}</span>
                </button>
                {SECTIONS.filter((s) => counts.get(s)).map((s) => (
                  <button key={s} className={section === s ? "on" : ""} onClick={() => setSection(s)}>
                    {icon(s)} {t.lib.sections[s]} <span className="pill">{counts.get(s)}</span>
                  </button>
                ))}
                <span className="lib-filter">
                  <Search size={13} />
                  <input value={flt} placeholder={t.lib.filter} spellCheck={false} onChange={(e) => setFlt(e.target.value)} onKeyDown={(e) => e.key === "Escape" && setFlt("")} />
                  {flt && (
                    <button className="icon-btn" onClick={() => setFlt("")}>
                      <X size={12} />
                    </button>
                  )}
                </span>
              </div>
              {flt && !groups.length && <p className="muted">{t.lib.filterNone}</p>}

              {groups.map((g) => {
                const key = g.dir + g.items[0].rel;
                const covers = g.items.filter((e) => e.cover).length * 2 >= g.items.length;
                // «All» without a filter: the first few of each folder, so that the next folders are seen at once
                const max = 12;
                const cut = section === "all" && !flt && !opened.has(key) && g.items.length > max + 3;
                const items = cut ? g.items.slice(0, max) : g.items;
                return (
                <section key={key} className="lib-group">
                  {(g.dir || cut) && (
                    <h2 className="lib-dir">
                      {g.dir ? prettyDir(g.dir, base) : t.lib.all} <span className="muted small">({g.items.length})</span>
                    </h2>
                  )}
                  <div className={`lib-items ${g.items.every((e) => e.kind === "image") ? "images" : covers ? "covers" : ""}`}>
                    {items.map((e) => {
                      const tt = title(e);
                      // a book with its cover (Calibre folders): a card with the cover
                      if (e.cover)
                        return (
                          <button key={e.rel} className="lib-book" onClick={() => openEntry(e)} title={`${tt.title}\n${e.name}`}>
                            <span className="lib-book-cover">
                              <img src={libUrl(id, e.cover)} alt="" loading="lazy" />
                            </span>
                            <span className="lib-book-title">{tt.title}</span>
                            <span className="muted small">{size(e.size)}</span>
                          </button>
                        );
                      if (e.kind === "image")
                        return (
                          <button key={e.rel} className="lib-thumb" onClick={() => openEntry(e)} title={tt.title}>
                            <img src={libUrl(id, e.rel)} alt="" loading="lazy" />
                          </button>
                        );
                      const on = e.kind === "audio" && playing === e.rel;
                      return (
                        <button key={e.rel} className={`lib-item ${e.kind}${on ? " on" : ""}`} onClick={() => openEntry(e)} title={e.name}>
                          <span className="lib-ico">{e.kind === "audio" ? on ? <Pause size={14} /> : <Play size={14} /> : icon(e.kind)}</span>
                          <span className="lib-name">{tt.title}</span>
                          {e.subs && <span className="lib-tag">CC</span>}
                          {tt.date && <span className="muted small">{tt.date}</span>}
                          <span className="muted small lib-size">{size(e.size)}</span>
                        </button>
                      );
                    })}
                  </div>
                  {cut && (
                    <button className="btn ghost small lib-more" onClick={() => setOpened((o) => new Set(o).add(key))}>
                      {t.lib.seeAll(g.items.length)}
                    </button>
                  )}
                  {section === "all" && !flt && opened.has(key) && (
                    <button className="btn ghost small lib-more" onClick={() => setOpened((o) => { const n = new Set(o); n.delete(key); return n; })}>
                      {t.lib.seeFewer}
                    </button>
                  )}
                </section>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** The bar at the bottom of the window that plays a library's audio (it goes on while moving around the app). */
export function AudioBar({
  t,
  id,
  list,
  index,
  onIndex,
  onClose,
  onLibrary,
}: {
  t: T;
  id: number;
  list: LibEntry[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
  onLibrary: () => void;
}) {
  const e = list[index];
  const prefix = useMemo(() => commonPrefix(list), [list]);
  if (!e) return null;
  const tt = prettyTitle(e.name, prefix);
  return (
    <div className="audio-bar">
      <Music size={16} />
      <button className="link-btn audio-title" onClick={onLibrary} title={t.lib.toLibrary}>
        {tt.title}
        {tt.date && <span className="muted small"> · {tt.date}</span>}
        <span className="muted small">
          {" "}
          ({index + 1}/{list.length})
        </span>
      </button>
      <button className="icon-btn" disabled={index === 0} onClick={() => onIndex(index - 1)} title={t.lib.prev}>
        ⏮
      </button>
      <audio key={e.rel} src={libUrl(id, e.rel)} controls autoPlay onEnded={() => index + 1 < list.length && onIndex(index + 1)} />
      <button className="icon-btn" disabled={index + 1 >= list.length} onClick={() => onIndex(index + 1)} title={t.lib.next}>
        ⏭
      </button>
      <button className="icon-btn" onClick={onClose} title={t.lib.closePlayer}>
        <X size={15} />
      </button>
    </div>
  );
}
