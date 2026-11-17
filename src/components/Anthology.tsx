import { useEffect, useMemo, useState } from "react";
import { BookCopy, CalendarDays, MapPin, Search, Tag, X } from "lucide-react";
import { api, DocListItem, fileUrl, Hit } from "../api";
import type { Term } from "../fold";
import { foldName } from "./Sidebar";
import { Lang, T } from "../i18n";

/** The Bhakta Bandhav Anthology (Whisper, 17-11-2026): the 77 volumes of Gurudeva's lectures, each a book whose chapters
 *  are its lectures. The section headings say «title · place · 6 May 1996»; this page reads them to search by date,
 *  place or subject, and the full text through the normal search, limited to the collection. */
export const ANTHOLOGY = "Anthology";

interface Lec {
  docId: number;
  ordinal: number;
  title: string;
  place: string;
  date: string;
}
interface Vol {
  id: number;
  title: string;
  vol: number;
  lectures: Lec[];
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
/** «title · place · 6 May 1996» → its parts, the date as 1996-05-06 (the introduction has none). */
export function parseLecture(heading: string | null): { title: string; place: string; date: string } | null {
  const m = heading?.match(/^(.*) · (.*) · (\d{1,2}) ([A-Z][a-z]+) (\d{4})$/);
  const mi = m ? MONTHS.indexOf(m[4]) : -1;
  return m && mi >= 0 ? { title: m[1], place: m[2], date: `${m[5]}-${String(mi + 1).padStart(2, "0")}-${m[3].padStart(2, "0")}` } : null;
}

export function formatLecDate(iso: string, lang: Lang): string {
  const d = new Date(iso + "T12:00:00");
  return isNaN(+d) ? iso : d.toLocaleDateString(lang, { day: "numeric", month: "long", year: "numeric" });
}

interface Props {
  t: T;
  lang: Lang;
  docs: DocListItem[];
  onOpenDoc: (docId: number, ordinal?: number, terms?: Term[]) => void;
}

// the index is read once per session (77 books)
let cache: { key: string; vols: Vol[] } | null = null;

export function Anthology({ t, lang, docs, onOpenDoc }: Props) {
  const books = useMemo(() => docs.filter((d) => d.dir.split("/")[0] === ANTHOLOGY), [docs]);
  const key = books.map((b) => b.id).join(",");
  const [vols, setVols] = useState<Vol[] | null>(cache?.key === key ? cache.vols : null);
  useEffect(() => {
    if (cache?.key === key) return;
    let alive = true;
    Promise.all(
      books.map(async (b) => {
        const { toc } = await api.getDoc(b.id);
        const lectures = toc.flatMap((e) => {
          const p = parseLecture(e.heading);
          return p ? [{ docId: b.id, ordinal: e.ordinal, ...p }] : [];
        });
        return { id: b.id, title: b.title, vol: +(b.title.match(/Vol-(\d+)/)?.[1] ?? 0), lectures };
      }),
    )
      .then((vs) => {
        vs.sort((a, b) => a.vol - b.vol);
        cache = { key, vols: vs };
        if (alive) setVols(vs);
      })
      .catch(() => alive && setVols([]));
    return () => {
      alive = false;
    };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  const [words, setWords] = useState("");
  const [year, setYear] = useState("");
  const [place, setPlace] = useState("");
  const [topic, setTopic] = useState("");
  const all = useMemo(() => (vols ?? []).flatMap((v) => v.lectures), [vols]);
  const years = useMemo(() => [...new Set(all.map((l) => l.date.slice(0, 4)))].sort(), [all]);
  const places = useMemo(() => {
    const n = new Map<string, number>();
    for (const l of all) n.set(l.place, (n.get(l.place) ?? 0) + 1);
    return [...n].sort((a, b) => a[0].localeCompare(b[0]));
  }, [all]);
  const volOf = useMemo(() => new Map((vols ?? []).map((v) => [v.id, v])), [vols]);
  const lecOf = useMemo(() => new Map(all.map((l) => [`${l.docId}:${l.ordinal}`, l])), [all]);

  // words: the normal search, only in the Anthology
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [terms, setTerms] = useState<Term[]>([]);
  useEffect(() => {
    const q = words.trim();
    if (!q) return setHits(null);
    let alive = true;
    const h = window.setTimeout(() => {
      api
        .search({ query: q, titlesOnly: false, prefix: true, sort: "relevance", collections: [ANTHOLOGY], dir: null, docId: null, personId: null, offset: 0, limit: 300 })
        .then((r) => {
          if (!alive) return;
          setHits(r.hits);
          setTerms(r.terms);
        })
        .catch(() => alive && setHits([]));
    }, 300);
    return () => {
      alive = false;
      window.clearTimeout(h);
    };
  }, [words]);

  const filtering = !!(words.trim() || year || place || topic.trim());
  const topicWords = foldName(topic).split(" ").filter(Boolean);
  const keep = (l: Lec | undefined) =>
    !!l &&
    (!year || l.date.startsWith(year)) &&
    (!place || l.place === place) &&
    (!topicWords.length || topicWords.every((w) => ` ${foldName(l.title)}`.includes(` ${w}`)));
  const rows: { lec: Lec; snippet?: string }[] = !filtering
    ? []
    : hits
      ? hits.flatMap((h) => {
          const l = lecOf.get(`${h.docId}:${h.ordinal}`);
          return keep(l) ? [{ lec: l!, snippet: h.snippet }] : [];
        })
      : words.trim()
        ? []
        : all.filter(keep).map((lec) => ({ lec }));
  // the same lecture once (a long one may have several matching sections)
  const seen = new Set<string>();
  const list = rows.filter((r) => {
    const k = `${r.lec.docId}:${r.lec.ordinal}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  return (
    <div className="anthology">
      <header className="anth-head">
        <BookCopy size={30} />
        <div>
          <h1>Bhakta Bandhav Anthology</h1>
          <p className="muted">{vols ? t.anthCount(vols.length, all.length) : t.anthLoading}</p>
        </div>
      </header>
      <div className="anth-filters">
        <label className="anth-search">
          <Search size={15} />
          <input value={words} placeholder={t.anthWords} spellCheck={false} onChange={(e) => setWords(e.target.value)} />
        </label>
        <label>
          <CalendarDays size={15} />
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">{t.anthAllYears}</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <label>
          <MapPin size={15} />
          <select value={place} onChange={(e) => setPlace(e.target.value)}>
            <option value="">{t.anthAllPlaces}</option>
            {places.map(([p, n]) => (
              <option key={p} value={p}>
                {p} ({n})
              </option>
            ))}
          </select>
        </label>
        <label className="anth-topic">
          <Tag size={15} />
          <input value={topic} placeholder={t.anthTopic} spellCheck={false} onChange={(e) => setTopic(e.target.value)} />
        </label>
        {filtering && (
          <button className="btn ghost" onClick={() => (setWords(""), setYear(""), setPlace(""), setTopic(""))}>
            <X size={14} /> {t.clearFilters}
          </button>
        )}
      </div>

      {!filtering && (
        <div className="anth-grid">
          {(vols ?? []).map((v) => (
            <button key={v.id} className="anth-book" onClick={() => onOpenDoc(v.id, 0)} title={v.title}>
              <img src={fileUrl("cover", v.id)} alt="" loading="lazy" />
              <span className="anth-vol">{t.anthVol(v.vol)}</span>
              <span className="anth-sub">{v.title.replace(/^Anthology Vol-\d+\s*·?\s*/, "")}</span>
            </button>
          ))}
        </div>
      )}

      {filtering && (
        <div className="anth-list">
          <div className="muted small">{words.trim() && !hits ? t.anthLoading : t.anthFound(list.length)}</div>
          {list.map(({ lec, snippet }) => {
            const v = volOf.get(lec.docId);
            return (
              <button key={`${lec.docId}:${lec.ordinal}`} className="anth-row" onClick={() => onOpenDoc(lec.docId, lec.ordinal, words.trim() ? terms : [])}>
                <img src={fileUrl("cover", lec.docId)} alt="" loading="lazy" />
                <span className="anth-row-main">
                  <span className="anth-row-title">{lec.title}</span>
                  <span className="anth-row-meta">
                    {formatLecDate(lec.date, lang)} · {lec.place} · {v ? t.anthVol(v.vol) : ""}
                  </span>
                  {snippet && <span className="anth-row-snip" dangerouslySetInnerHTML={{ __html: snippet }} />}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
