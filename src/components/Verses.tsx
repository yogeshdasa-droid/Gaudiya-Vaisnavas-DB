import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Search, X } from "lucide-react";
import { api, DocListItem, searchIn, SectionText } from "../api";
import { T } from "../i18n";
import { renderMarkdown } from "../markdown";
import { foldName } from "./Sidebar";

/** «Versos» (Whisper, 21-11-2026: «un buscador de versos»): the verses of Śrīla Prabhupāda's books (collection
 *  «Versos», one section per verse — heading «SB 4.1.1», «BG 2.13», «CC Madhya 20.57» — loaded by
 *  scripts/datos/versos/cargar.mjs). Search by reference («sb 11.3.21», «Cc. M 20.57») or by words of the verse or its
 *  translation, with or without diacritics; each verse shown in its lines, centred. */
export const VERSES_DIR = "Versos";

const LILA: Record<string, string> = { a: "adi", adi: "adi", m: "madhya", madhya: "madhya", an: "antya", antya: "antya" };
/** a reference typed in any way → the key of a heading («sb 11.3.21», «cc madhya 20.57»), or null */
export function refKey(q: string): string | null {
  const s = foldName(q).replace(/[.,:;]+(?=\s|[a-z])/g, " ").replace(/\s+/g, " ").trim();
  let m = /^(?:sb|bhag|srimad bhagavatam|bhagavatam)\s*(\d+\.\d+\.\d+(?:-\d+)?)$/.exec(s);
  if (m) return `sb ${m[1]}`;
  m = /^(?:bg|gita|bhagavad gita)\s*(\d+\.\d+(?:-\d+)?)$/.exec(s);
  if (m) return `bg ${m[1]}`;
  m = /^(?:cc\s*)?(a|adi|m|madhya|an|antya)(?:\s*lila)?\s*(\d+\.\d+(?:-\d+)?)$/.exec(s);
  if (m) return `cc ${LILA[m[1]]} ${m[2]}`;
  m = /^(?:iso|isopanisad|sri isopanisad)\s*(\d+)$/.exec(s);
  if (m) return `iso ${m[1]}`;
  m = /^(?:noi|upadesamrta|sri upadesamrta|nectar of instruction)\s*(\d+)$/.exec(s);
  if (m) return `noi ${m[1]}`;
  return null;
}
/** the key of a section heading («CC Madhya 20.57» → «cc madhya 20.57») */
const headKey = (h: string) => foldName(h).replace(/\s+/g, " ").trim();

interface Found {
  docId: number;
  ordinal: number;
  heading: string;
  text: string;
}

export function Verses({ t, docs, onOpenDoc }: { t: T; docs: DocListItem[]; onOpenDoc: (docId: number, ordinal: number) => void }) {
  const [q, setQ] = useState("");
  const [found, setFound] = useState<Found[] | null>(null);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const books = useMemo(() => docs.filter((d) => d.dir.split("/")[0] === VERSES_DIR), [docs]);
  // every heading of the verse books → where it is (for the references)
  const [index, setIndex] = useState<Map<string, { docId: number; ordinal: number }> | null>(null);
  useEffect(() => {
    input.current?.focus();
    let alive = true;
    Promise.all(books.map((b) => api.getDoc(b.id).then((d) => d.toc.map((e) => [b.id, e] as const))))
      .then((all) => {
        if (!alive) return;
        const m = new Map<string, { docId: number; ordinal: number }>();
        for (const [docId, e] of all.flat()) if (e.heading) m.set(headKey(e.heading), { docId, ordinal: e.ordinal });
        setIndex(m);
      })
      .catch(() => setIndex(new Map()));
    return () => void (alive = false);
  }, [books]);

  useEffect(() => {
    const words = q.trim();
    if (words.length < 2) return setFound(null);
    let alive = true;
    const h = window.setTimeout(async () => {
      setBusy(true);
      try {
        const key = refKey(words);
        let places: { docId: number; ordinal: number }[] = [];
        if (key && index) {
          const exact = index.get(key);
          // «SB 1.2.3» may be inside «SB 1.2.3-4»
          const inRange = () => {
            const [, head, n] = /^(.*\.)(\d+)$/.exec(key) ?? [];
            if (!head) return null;
            for (const [k, v] of index) {
              const r = new RegExp(`^${head.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\d+)-(\\d+)$`).exec(k);
              if (r && +r[1] <= +n && +n <= +r[2]) return v;
            }
            return null;
          };
          const hit = exact ?? inRange();
          if (hit) places = [hit];
        }
        if (!places.length && !key) {
          const r = await searchIn(words, VERSES_DIR, 40);
          places = r.hits.map((x) => ({ docId: x.docId, ordinal: x.ordinal }));
        }
        const texts: Found[] = [];
        for (const p of places) {
          const [s]: SectionText[] = await api.getSections(p.docId, p.ordinal, p.ordinal);
          if (s) texts.push({ docId: p.docId, ordinal: p.ordinal, heading: s.heading ?? "", text: s.text });
        }
        if (alive) setFound(texts);
      } finally {
        if (alive) setBusy(false);
      }
    }, 300);
    return () => {
      alive = false;
      window.clearTimeout(h);
    };
  }, [q, index]);

  return (
    <div className="verses-page">
      <div className="katha-search">
        <Search size={18} />
        <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.versesPlaceholder} />
        {q && (
          <button className="icon-btn" onClick={() => setQ("")} title={t.clearSearch}>
            <X size={16} />
          </button>
        )}
      </div>
      {!books.length && <p className="muted">{t.versesNone}</p>}
      {books.length > 0 && !found && (
        <div className="verses-help">
          <p className="muted small">{t.versesHelp}</p>
          <p className="muted small">{t.versesBooks(books.length)}</p>
        </div>
      )}
      {found && !found.length && !busy && <p className="muted">{t.versesNothing}</p>}
      {found?.map((f) => (
        <article key={`${f.docId}:${f.ordinal}`} className="verse-card">
          <div className="reader-body serif" dangerouslySetInnerHTML={{ __html: renderMarkdown(f.text) }} />
          <button className="link-btn small" onClick={() => onOpenDoc(f.docId, f.ordinal)}>
            <BookOpen size={13} /> {t.versesOpen}
          </button>
        </article>
      ))}
    </div>
  );
}
