import { ReactNode, useEffect, useState } from "react";
import { CalendarDays, ChevronRight, Clock, Moon, Sparkles, UserRound } from "lucide-react";
import { api, CalDay, CalEvent, fileUrl } from "../api";
import { Lang, T } from "../i18n";

/** Days looked at ahead (today included): on Home and on the calendar's own page. */
const AHEAD = 30;
const AHEAD_PAGE = 90;

function dayName(date: string, lang: Lang, t: T, i: number): string {
  if (i === 0) return t.today;
  if (i === 1) return t.tomorrow;
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(lang === "es" ? "es-ES" : "en-GB", { weekday: "short", day: "numeric", month: "short" });
}

/** Today's lunar day and the events of today and the coming days.
 *  As a page (`page`): more days and every event, not only people and Ekādaśīs. */
export function Calendar({
  t,
  lang,
  reload,
  onPerson,
  page,
  onOpen,
}: {
  t: T;
  lang: Lang;
  reload: number;
  onPerson: (id: number) => void;
  page?: boolean;
  /** Home: only today, in one line, with a button to the whole calendar */
  onOpen?: () => void;
}) {
  const [days, setDays] = useState<CalDay[] | null>(null);
  useEffect(() => {
    api.upcoming(new Date(), page ? AHEAD_PAGE : onOpen ? 1 : AHEAD).then(setDays, () => setDays([]));
  }, [reload, page, onOpen]);
  if (!days?.length) return page ? <CalendarPage t={t}>{days && <p className="muted">{t.nothingToday}</p>}</CalendarPage> : null;
  const [today, ...rest] = days;
  // the coming days on Home: people and Ekādaśīs (the rest only today, to keep it short)
  const worth = (e: CalEvent) => page || e.personId !== null || e.kind === "ekadasi";
  const coming = rest.map((d, i) => ({ d, i: i + 1 })).filter(({ d }) => d.events.some(worth));

  const chip = (e: CalEvent, k: number) => {
    const label =
      e.personId === null ? e.name : e.kind === "appearance" ? t.appearanceOf(e.name) : e.kind === "disappearance" ? t.disappearanceOf(e.name) : e.name;
    const icon =
      e.personId !== null ? (
        e.hasPhoto ? (
          <img src={fileUrl("photo", e.personId)} alt="" />
        ) : (
          <UserRound size={14} />
        )
      ) : e.kind === "parana" ? (
        <Clock size={13} />
      ) : (
        <Sparkles size={13} />
      );
    const title = [e.note, e.computed ? t.computedHint : ""].filter(Boolean).join("\n") || undefined;
    const cls = `cal-event ${e.kind}${e.computed ? " computed" : ""}${e.personId === null ? " plain" : ""}`;
    return e.personId !== null ? (
      <button key={k} className={cls} title={title} onClick={() => onPerson(e.personId!)}>
        {icon}
        <span>{label}</span>
      </button>
    ) : (
      <span key={k} className={cls} title={title}>
        {icon}
        <span>{label}</span>
      </span>
    );
  };

  if (onOpen)
    return (
      <section className="calendar compact">
        <div className="cal-today">
          <div className="cal-day">
            <strong>{t.today}</strong>
            {today.labels.map((l) => (
              <span key={l} className="lunar">
                <Moon size={12} /> {l}
              </span>
            ))}
          </div>
          <div className="cal-events">{today.events.length ? today.events.map(chip) : <span className="muted small">{t.nothingToday}</span>}</div>
          <button className="btn ghost cal-open" onClick={onOpen} title={t.calendarHint}>
            <CalendarDays size={15} /> {t.calendarShort} <ChevronRight size={14} />
          </button>
        </div>
      </section>
    );

  const body = (
    <section className="calendar">
      {!page && (
        <h2 title={t.calendarHint}>
          <CalendarDays size={14} /> {t.calendarTitle}
        </h2>
      )}
      <div className="cal-today">
        <div className="cal-day">
          <strong>{t.today}</strong>
          {today.labels.map((l) => (
            <span key={l} className="lunar">
              <Moon size={12} /> {l}
            </span>
          ))}
        </div>
        <div className="cal-events">{today.events.length ? today.events.map(chip) : <span className="muted small">{t.nothingToday}</span>}</div>
      </div>
      {coming.length > 0 && (
        <div className="cal-list">
          <h3>{t.nextDays}</h3>
          {coming.map(({ d, i }) => (
            <div key={d.date} className="cal-row">
              <div className="cal-day">
                <strong>{dayName(d.date, lang, t, i)}</strong>
                <span className="lunar">{d.labels[0]}</span>
              </div>
              <div className="cal-events">{d.events.filter(worth).map(chip)}</div>
            </div>
          ))}
        </div>
      )}
      {!page && <p className="muted small">{t.calendarHint}</p>}
    </section>
  );
  return page ? <CalendarPage t={t}>{body}</CalendarPage> : body;
}

/** The calendar as a view of its own (from the bar on the left). */
function CalendarPage({ t, children }: { t: T; children: ReactNode }) {
  return (
    <div className="reader">
      <div className="reader-scroll">
        <div className="timeline calendar-page">
          <header className="view-head">
            <h1>
              <CalendarDays size={22} /> {t.calendarTitle}
            </h1>
            <p className="muted small">{t.calendarHint}</p>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
