// «The colours of the lectures» (Whisper, 18-11-2026): a grid of years × months in «Audios», darker where Śrīla
// Gurudeva spoke more (his recordings and his written lectures: «Lectures Gurudeva» and the Anthology). A month
// clicked shows its recordings in the list below and its written lectures under the grid.
import { CSSProperties, useMemo } from "react";
import { BookOpen, X } from "lucide-react";
import { Lang, T } from "../i18n";
import type { Rec, Written } from "./Audios";

interface Props {
  t: T;
  lang: Lang;
  /** the recordings that count (the eyes and the other filters already applied) */
  recs: Rec[];
  written: Written[];
  /** «1996-05» or «» */
  month: string;
  year: string;
  onMonth: (m: string) => void;
  onYear: (y: string) => void;
  onOpenDoc: (docId: number, ordinal?: number) => void;
}

export function LectureGrid({ t, lang, recs, written, month, year, onMonth, onYear, onOpenDoc }: Props) {
  const G = t.au.grid;
  const loc = lang === "es" ? "es-ES" : "en-GB";
  const monthNames = useMemo(() => Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1).toLocaleDateString(loc, { month: "long" })), [loc]);
  const short = useMemo(() => Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1).toLocaleDateString(loc, { month: "short" }).replace(".", "")), [loc]);

  const { years, cells, max } = useMemo(() => {
    const cells = new Map<string, { a: number; w: number }>();
    const ys = new Set<string>();
    const add = (date: string, k: "a" | "w") => {
      if (!/^\d{4}-\d{2}/.test(date)) return;
      const ym = date.slice(0, 7);
      ys.add(date.slice(0, 4));
      const c = cells.get(ym) ?? { a: 0, w: 0 };
      c[k]++;
      cells.set(ym, c);
    };
    for (const r of recs) add(r.date, "a");
    for (const w of written) add(w.date, "w");
    let max = 0;
    for (const c of cells.values()) max = Math.max(max, c.a + c.w);
    // only the years with something (a stray «1930» would bring forty empty rows)
    const years = [...ys].sort();
    return { years, cells, max };
  }, [recs, written]);

  const monthTexts = useMemo(
    () => (month ? written.filter((w) => w.date.startsWith(month)).sort((a, b) => a.date.localeCompare(b.date)) : []),
    [written, month],
  );

  if (!years.length) return <p className="muted small">{G.none}</p>;
  return (
    <div className="lg">
      <div className="lg-grid" role="grid">
        <span />
        {short.map((m, i) => (
          <span key={i} className="lg-mhead">
            {m}
          </span>
        ))}
        <span className="lg-mhead">{G.total}</span>
        {years.map((y) => {
          let total = 0;
          return [
            <button key={y} className={`lg-year${year === y ? " on" : ""}`} onClick={() => onYear(year === y ? "" : y)} title={G.yearHint(y)}>
              {y}
            </button>,
            ...Array.from({ length: 12 }, (_, i) => {
              const ym = `${y}-${String(i + 1).padStart(2, "0")}`;
              const c = cells.get(ym);
              const n = c ? c.a + c.w : 0;
              total += n;
              const level = n ? 0.18 + 0.82 * Math.sqrt(n / max) : 0;
              return (
                <button
                  key={ym}
                  className={`lg-cell${n ? "" : " empty"}${month === ym ? " on" : ""}`}
                  style={{ "--lv": level } as CSSProperties}
                  disabled={!n}
                  onClick={() => onMonth(month === ym ? "" : ym)}
                  title={n ? `${monthNames[i]} ${y}\n${G.cell(c!.a, c!.w)}` : `${monthNames[i]} ${y}`}
                >
                  {n > 0 && <span>{n}</span>}
                </button>
              );
            }),
            <span key={`${y}-t`} className="lg-total">
              {total || ""}
            </span>,
          ];
        })}
      </div>
      <div className="lg-legend muted small">
        {G.less}
        {[0.18, 0.4, 0.6, 0.8, 1].map((l) => (
          <i key={l} className="lg-cell" style={{ "--lv": l } as CSSProperties} />
        ))}
        {G.more} · {G.hint}
      </div>
      {month && (
        <div className="lg-month">
          <h4>
            {monthNames[+month.slice(5) - 1]} {month.slice(0, 4)}
            <span className="muted small"> · {G.monthTexts(monthTexts.length)}</span>
            <button className="icon-btn" onClick={() => onMonth("")} title={G.clear}>
              <X size={13} />
            </button>
          </h4>
          {monthTexts.map((w, i) => (
            <button key={i} className="lg-text" onClick={() => onOpenDoc(w.doc, w.ord)}>
              <BookOpen size={13} />
              <em>{w.date.length === 10 ? +w.date.slice(8) : ""}</em>
              <span>{w.title}</span>
              <small className="muted">{w.src === "anth" ? "Anthology" : "Lectures Gurudeva"}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
