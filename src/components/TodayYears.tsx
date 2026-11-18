// «Today, in other years» on Home (Whisper, 18-11-2026): what Śrīla Gurudeva said on this day of the month in other
// years — his recordings («Audios», by the date in their names) and his written lectures («Lectures Gurudeva» and the
// Anthology, by their date) — and, above, whose appearance or disappearance it is today by the calendar.
import { useEffect, useMemo, useState } from "react";
import { BookOpen, CalendarHeart, Headphones, Pause, Play, UserRound } from "lucide-react";
import { api, AUDIOS_LIB, CalEvent, DocListItem, fileUrl, libUrl } from "../api";
import { Lang, T } from "../i18n";
import { formatLecDate } from "./Anthology";
import { langShown, Rec, scanAudios, Written, writtenByDate } from "./Audios";
import { player, Track, usePlayer } from "../audioPlayer";
import { audioKey, useAudioData } from "../audioData";

interface Props {
  t: T;
  lang: Lang;
  docs: DocListItem[];
  reload: number;
  onPerson: (id: number) => void;
  onOpenDoc: (docId: number, ordinal?: number) => void;
  /** the page of a recording in «Audios» */
  onAudio: (rel: string) => void;
}

type Item = { kind: "audio"; r: Rec; rs: Rec[] } | { kind: "text"; w: Written };
/** a year shows this many, the rest behind «N more» */
const SHOWN = 4;

const mmdd = (d: Date) => `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function TodayYears({ t, lang, docs, reload, onPerson, onOpenDoc, onAudio }: Props) {
  const T2 = t.todayYears;
  const today = useMemo(() => new Date(), []);
  const md = mmdd(today);
  const [recs, setRecs] = useState<Rec[] | null>(null);
  const [written, setWritten] = useState<Written[] | null>(null);
  const [events, setEvents] = useState<CalEvent[]>([]);
  const links = useAudioData();
  const ps = usePlayer();

  useEffect(() => {
    let alive = true;
    scanAudios().then(
      (v) => alive && setRecs(v.recs),
      () => alive && setRecs([]),
    );
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    let alive = true;
    writtenByDate(docs).then(
      (w) => alive && setWritten(w.all),
      () => alive && setWritten([]),
    );
    return () => {
      alive = false;
    };
  }, [docs.length, reload]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    api.upcoming(today, 1).then(
      (ds) => setEvents((ds[0]?.events ?? []).filter((e) => e.personId !== null && (e.kind === "appearance" || e.kind === "disappearance"))),
      () => setEvents([]),
    );
  }, [reload, today]);

  // this day of the month, by year (the most recent first)
  const years = useMemo(() => {
    const by = new Map<string, Item[]>();
    const add = (date: string, it: Item) => {
      if (date.length !== 10 || date.slice(5) !== md) return;
      const y = date.slice(0, 4);
      if (!by.has(y)) by.set(y, []);
      by.get(y)!.push(it);
    };
    for (const r of recs ?? []) if (langShown(r.lang)) add(r.date, { kind: "audio", r, rs: [r] });
    for (const w of written ?? []) add(w.date, { kind: "text", w });
    for (const its of by.values())
      its.sort((a, b) => (a.kind === b.kind ? 0 : a.kind === "audio" ? -1 : 1) || (a.kind === "audio" && b.kind === "audio" ? (a.r.part || "").localeCompare(b.r.part || "") || a.r.name.localeCompare(b.r.name) : 0));
    // the parts or copies of one recording (same title, place and AM/PM) in one line
    for (const [y, its] of by) {
      const out: Item[] = [];
      for (const it of its) {
        const last = out[out.length - 1];
        if (it.kind === "audio" && last?.kind === "audio" && last.r.title === it.r.title && last.r.place === it.r.place && last.r.part === it.r.part) last.rs.push(it.r);
        else out.push(it);
      }
      by.set(y, out);
    }
    return [...by].sort((a, b) => b[0].localeCompare(a[0]));
  }, [recs, written, md]);

  const titleOf = (r: Rec) => links[audioKey(r.name)]?.title || r.title || r.name;
  const tracks: Track[] = useMemo(
    () =>
      years.flatMap(([, its]) =>
        its.flatMap((it) =>
          it.kind === "audio"
            ? it.rs.filter((r) => r.playable).map((r) => ({ rel: r.rel, url: libUrl(AUDIOS_LIB, r.rel), title: titleOf(r), sub: [formatLecDate(r.date, lang), r.place].filter(Boolean).join(" · ") }))
            : [],
        ),
      ),
    [years, links, lang], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const nAudio = tracks.length;
  const nText = years.reduce((n, [, its]) => n + its.filter((i) => i.kind === "text").length, 0);
  const cur = ps.list[ps.index]?.rel;
  const [open, setOpen] = useState<Set<string>>(new Set());

  if (recs === null || written === null) return null;
  if (!years.length && !events.length) return null;
  const thisYear = today.getFullYear();
  const dayLabel = today.toLocaleDateString(lang === "es" ? "es-ES" : "en-GB", { day: "numeric", month: "long" });

  return (
    <section className="today-years">
      <h2>
        <CalendarHeart size={14} /> {T2.title} <span className="muted small">· {dayLabel}</span>
        {years.length > 0 && <span className="ty-count muted small">{T2.count(nAudio, nText, years.length)}</span>}
      </h2>
      {events.length > 0 && (
        <div className="ty-people">
          {events.map((e, i) => (
            <button key={i} className="ty-person" data-ctx="person" data-id={e.personId!} onClick={() => onPerson(e.personId!)} title={e.note || undefined}>
              <span className="ty-photo">{e.hasPhoto ? <img src={fileUrl("photo", e.personId!)} alt="" loading="lazy" /> : <UserRound size={22} />}</span>
              <span className="ty-person-text">
                <em>{e.kind === "appearance" ? T2.appearance : T2.disappearance}</em>
                <strong>{e.name}</strong>
              </span>
            </button>
          ))}
        </div>
      )}
      {years.length > 0 && (
        <div className="ty-years">
          {years.map(([y, its]) => (
            <div key={y} className="ty-year">
              <div className="ty-year-label">
                <strong>{y}</strong>
                <span className="muted small">{T2.ago(thisYear - +y)}</span>
              </div>
              <div className="ty-items">
                {(open.has(y) ? its : its.slice(0, SHOWN)).map((it, i) =>
                  it.kind === "audio" ? (
                    <div key={i} className={`ty-item ${it.rs.some((r) => r.rel === cur) ? "on" : ""}`}>
                      {it.r.playable ? (
                        <button
                          className="ty-play"
                          title={T2.play}
                          onClick={() => player.play(tracks, Math.max(0, tracks.findIndex((x) => x.rel === (it.rs.some((r) => r.rel === cur) ? cur : it.r.rel))))}
                        >
                          {it.rs.some((r) => r.rel === cur) && ps.playing ? <Pause size={13} /> : <Play size={13} />}
                        </button>
                      ) : (
                        <span className="ty-play off">
                          <Headphones size={13} />
                        </span>
                      )}
                      <button className="ty-link" onClick={() => onAudio(it.r.rel)} title={T2.openAudio + "\n" + it.r.name}>
                        <span>{titleOf(it.r)}</span>
                        <em>{[it.rs.length > 1 ? T2.parts(it.rs.length) : "", it.r.part, it.r.place].filter(Boolean).join(" · ")}</em>
                      </button>
                    </div>
                  ) : (
                    <div key={i} className="ty-item">
                      <span className="ty-play off">
                        <BookOpen size={13} />
                      </span>
                      <button className="ty-link" onClick={() => onOpenDoc(it.w.doc, it.w.ord)} title={T2.openText}>
                        <span>{it.w.title}</span>
                        <em>{it.w.src === "anth" ? "Anthology" : "Lectures Gurudeva"}</em>
                      </button>
                    </div>
                  ),
                )}
                {its.length > SHOWN && (
                  <button className="link-btn small ty-more" onClick={() =>
                      setOpen((o) => {
                        const n = new Set(o);
                        if (n.has(y)) n.delete(y);
                        else n.add(y);
                        return n;
                      })
                    }
                  >
                    {open.has(y) ? T2.less : T2.more(its.length - SHOWN)}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
