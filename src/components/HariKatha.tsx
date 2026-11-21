import { useEffect, useMemo, useRef, useState } from "react";
import { BookCopy, Film, Headphones, MapPin, Mic, Search, X } from "lucide-react";
import { DocListItem, Hit, Place, searchIn } from "../api";
import { Lang, T } from "../i18n";
import { foldName } from "./Sidebar";
import { ANTHOLOGY, formatLecDate, parseLecture } from "./Anthology";
import { Rec, scanAudios } from "./Audios";

/** «Hari-kathā» (Whisper, 21-11-2026 — «the app is a bit all over the place»): Gurudeva's written lectures, the
 *  Anthology, the audios and the videos as one place. This page searches the four at once — the texts with the normal
 *  search (limited to the two collections), the recordings by their title, place and date — and the tabs on top
 *  (KathaTabs) go to each one. */
export const LECTURES = "Lectures Gurudeva";
export type KathaTab = "katha" | "lectures" | "anthology" | "audios" | "videos";

/** the row of tabs over the four parts of Hari-kathā */
export function KathaTabs({ t, on, onTab }: { t: T; on: KathaTab; onTab: (k: KathaTab) => void }) {
  const tabs: [KathaTab, typeof Search, string][] = [
    ["katha", Search, t.kathaSearchAll],
    ["lectures", Mic, t.lecturesGurudeva],
    ["anthology", BookCopy, t.anthology],
    ["audios", Headphones, t.audios],
    ["videos", Film, t.videos],
  ];
  return (
    <nav className="katha-tabs">
      <span className="katha-tabs-name">{t.railZone.katha}</span>
      {tabs.map(([k, I, label]) => (
        <button key={k} className={on === k ? "on" : ""} onClick={() => onTab(k)}>
          <I size={15} /> {label}
        </button>
      ))}
    </nav>
  );
}

interface Props {
  t: T;
  lang: Lang;
  docs: DocListItem[];
  onOpenDoc: (docId: number, ordinal?: number) => void;
  onAudio: (rel: string) => void;
  onVideo: (rel: string) => void;
  onTab: (k: KathaTab) => void;
  /** words to search at once (from «Also in Hari-kathā» of the main search) */
  start?: string;
}

const MAX = 40;

/** the recordings, read once and kept for the session (the folders are big) */
let recCache: { audio: Rec[]; video: Rec[] } | null = null;
async function allRecs(): Promise<{ audio: Rec[]; video: Rec[] }> {
  if (recCache) return recCache;
  const [a, v] = await Promise.all([scanAudios(false, "audio").catch(() => null), scanAudios(false, "video").catch(() => null)]);
  recCache = { audio: a?.recs ?? [], video: v?.recs ?? [] };
  return recCache;
}
/** every word in its title, place, date or file name */
function recMatch(list: Rec[], q: string): Rec[] {
  const words = foldName(q).split(/\s+/).filter(Boolean);
  if (!words.length || q.trim().length < 2) return [];
  return list.filter((r) => words.every((w) => r.hay.includes(w)));
}

/** Under the main search (21-11-2026): the Tīrthas with those words in their name, and how many recordings of
 *  Hari-kathā have them — one click to see them all together. */
export function AlsoIn({ t, query, places, onPlace, onKatha }: { t: T; query: string; places: Place[]; onPlace: (id: number) => void; onKatha: (q: string) => void }) {
  const [recs, setRecs] = useState<{ audio: Rec[]; video: Rec[] } | null>(recCache);
  useEffect(() => {
    if (!recs) allRecs().then(setRecs, () => {});
  }, [recs]);
  const q = query.trim();
  const fq = foldName(q);
  const pl = useMemo(() => (fq.length < 3 ? [] : places.filter((p) => foldName(p.name + " " + p.aka).includes(fq)).slice(0, 8)), [fq, places]);
  const a = useMemo(() => (recs ? recMatch(recs.audio, q).length : 0), [q, recs]);
  const v = useMemo(() => (recs ? recMatch(recs.video, q).length : 0), [q, recs]);
  if (q.length < 2 || (!pl.length && !a && !v)) return null;
  return (
    <div className="also-in">
      {pl.length > 0 && (
        <div className="also-row">
          <MapPin size={13} /> <span className="also-name">{t.tirthas}</span>
          {pl.map((p) => (
            <button key={p.id} className="also-chip" onClick={() => onPlace(p.id)}>
              {p.name}
            </button>
          ))}
        </div>
      )}
      {(a > 0 || v > 0) && (
        <button className="also-row also-katha" onClick={() => onKatha(q)}>
          <Headphones size={13} /> <span className="also-name">{t.railZone.katha}</span>
          <span>{t.alsoInKatha(a, v)}</span>
        </button>
      )}
    </div>
  );
}

export function HariKatha({ t, lang, docs, onOpenDoc, onAudio, onVideo, onTab, start }: Props) {
  const [q, setQ] = useState(start ?? "");
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [total, setTotal] = useState(0);
  const [audios, setAudios] = useState<Rec[]>([]);
  const [videos, setVideos] = useState<Rec[]>([]);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    input.current?.focus();
    allRecs().then((r) => (setAudios(r.audio), setVideos(r.video)), () => {});
  }, []);
  // the texts: the normal search, in the two collections (a little after the typing stops)
  useEffect(() => {
    const words = q.trim();
    if (words.length < 2) return setHits(null);
    const h = window.setTimeout(() => {
      // one search for each folder: each one gets its own share
      Promise.all([LECTURES, ANTHOLOGY].map((dir) => searchIn(words, dir, 120)))
        .then((rs) => (setHits(rs.flatMap((r) => r.hits)), setTotal(rs.reduce((n, r) => n + r.total, 0))))
        .catch(() => setHits([]));
    }, 300);
    return () => window.clearTimeout(h);
  }, [q]);
  // the recordings: every word in its title, place, date or file name
  const match = (list: Rec[]) => recMatch(list, q);
  const aHits = useMemo(() => match(audios), [q, audios]); // eslint-disable-line react-hooks/exhaustive-deps
  const vHits = useMemo(() => match(videos), [q, videos]); // eslint-disable-line react-hooks/exhaustive-deps
  const lecHits = (hits ?? []).filter((h) => h.dir.split("/")[0] === LECTURES);
  const anthHits = (hits ?? []).filter((h) => h.dir.split("/")[0] === ANTHOLOGY);
  const counts = {
    lectures: docs.filter((d) => d.dir.split("/")[0] === LECTURES).length,
    anthology: docs.filter((d) => d.dir.split("/")[0] === ANTHOLOGY).length,
  };
  const searching = q.trim().length >= 2;

  const textRow = (h: Hit) => {
    const lec = parseLecture(h.heading);
    return (
      <button key={h.sectionId} className="katha-hit" onClick={() => onOpenDoc(h.docId, h.ordinal)}>
        <span className="katha-hit-title">{lec ? lec.title : h.heading || h.title}</span>
        <span className="katha-hit-meta">{lec ? `${formatLecDate(lec.date, lang)} · ${lec.place}` : h.title}</span>
        {h.snippet && <span className="snippet" dangerouslySetInnerHTML={{ __html: h.snippet }} />}
      </button>
    );
  };
  const recRow = (r: Rec, open: (rel: string) => void) => (
    <button key={r.rel} className="katha-hit" onClick={() => open(r.rel)} title={r.name}>
      <span className="katha-hit-title">{r.title || r.name}</span>
      <span className="katha-hit-meta">{[r.date, r.part, r.place].filter(Boolean).join(" · ")}</span>
    </button>
  );
  const column = (k: KathaTab, I: typeof Search, name: string, n: number, rows: JSX.Element[]) => (
    <section className="katha-col">
      <h3>
        <I size={15} /> {name} <span className="muted small">{n}</span>
        <button className="link-btn small" onClick={() => onTab(k)}>
          {t.kathaOpen}
        </button>
      </h3>
      {rows.length ? rows.slice(0, MAX) : <p className="muted small">{t.kathaNone}</p>}
      {rows.length > MAX && <p className="muted small">{t.kathaMore(rows.length - MAX)}</p>}
    </section>
  );

  return (
    <div className="katha-page">
      <div className="katha-search">
        <Search size={18} />
        <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.kathaPlaceholder} />
        {q && (
          <button className="icon-btn" onClick={() => setQ("")} title={t.clearSearch}>
            <X size={16} />
          </button>
        )}
      </div>
      {!searching ? (
        <div className="katha-cards">
          {(
            [
              ["lectures", Mic, t.lecturesGurudeva, counts.lectures, t.kathaLecturesHint],
              ["anthology", BookCopy, t.anthology, counts.anthology, t.kathaAnthologyHint],
              ["audios", Headphones, t.audios, audios.length, t.kathaAudiosHint],
              ["videos", Film, t.videos, videos.length, t.kathaVideosHint],
            ] as [KathaTab, typeof Search, string, number, string][]
          ).map(([k, I, name, n, hint]) => (
            <button key={k} className="katha-card" onClick={() => onTab(k)}>
              <I size={26} />
              <span className="katha-card-name">{name}</span>
              <span className="katha-card-n">{n.toLocaleString(lang)}</span>
              <span className="muted small">{hint}</span>
            </button>
          ))}
          <p className="muted small katha-tip">{t.kathaTip}</p>
        </div>
      ) : (
        <div className="katha-results">
          {column("lectures", Mic, t.lecturesGurudeva, lecHits.length, lecHits.map(textRow))}
          {column("anthology", BookCopy, t.anthology, anthHits.length, anthHits.map(textRow))}
          {column("audios", Headphones, t.audios, aHits.length, aHits.map((r) => recRow(r, onAudio)))}
          {column("videos", Film, t.videos, vHits.length, vHits.map((r) => recRow(r, onVideo)))}
          {hits && total > hits.length && <p className="muted small katha-tip">{t.kathaTextsCut(hits.length, total)}</p>}
        </div>
      )}
    </div>
  );
}
