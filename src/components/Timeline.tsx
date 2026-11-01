import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Clock3, ListTree, ScrollText, UserRound } from "lucide-react";
import { api, ChronicleEntry, fileUrl, LifeSpan, PersonListItem } from "../api";
import { Lang, T } from "../i18n";
import { buildNameIndex, linkNames, NameIndex } from "../personLinks";

/** The text of an event, with the names of records as links (drawn outside React). */
function EventText({ text, names }: { text: string; names: NameIndex }) {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    ref.current.textContent = text;
    linkNames(ref.current, names, null);
  }, [text, names]);
  return <span className="ev-text" ref={ref} />;
}

/** The records in order of time, grouped by century, each with a bar for its
 *  life, and the dated events of the chronologies of the library (Digdarśanī). */
export function Timeline({
  t,
  lang,
  reload,
  persons,
  onPerson,
  onOpenDoc,
}: {
  t: T;
  lang: Lang;
  reload: number;
  persons: PersonListItem[];
  onPerson: (id: number) => void;
  onOpenDoc: (docId: number, ordinal: number) => void;
}) {
  const [list, setList] = useState<LifeSpan[] | null>(null);
  const [events, setEvents] = useState<ChronicleEntry[]>([]);
  const [onlyTree, setOnlyTree] = useState(false);
  const [showEvents, setShowEvents] = useState(true);
  useEffect(() => {
    api.timeline().then(setList, () => setList([]));
    api.chronicle().then(setEvents, () => setEvents([]));
  }, [reload]);

  const shown = useMemo(() => (list ?? []).filter((l) => !onlyTree || l.parampara), [list, onlyTree]);
  const shownEvents = useMemo(() => {
    if (!showEvents) return [];
    const tree = new Set(persons.filter((p) => p.tree).map((p) => p.id));
    return events.filter((e) => !onlyTree || (e.personId !== null && tree.has(e.personId)));
  }, [events, showEvents, onlyTree, persons]);
  // the scale: from the first year to the last, in whole centuries
  const years = shown.flatMap((l) => [l.born, l.died].filter((y): y is number => y !== null));
  const min = Math.floor(Math.min(...years, 2000) / 100) * 100;
  const max = Math.ceil(Math.max(...years, 1500) / 100) * 100;
  const pos = (y: number) => ((y - min) / (max - min)) * 100;
  const century = (y: number) => Math.floor((y - 1) / 100) + 1;
  const groups = useMemo(() => {
    const g = new Map<number, { people: LifeSpan[]; events: ChronicleEntry[] }>();
    const at = (c: number) => g.get(c) ?? g.set(c, { people: [], events: [] }).get(c)!;
    for (const l of shown) at(century(l.born ?? (l.died ?? 0) - 60)).people.push(l);
    for (const e of shownEvents) at(century(e.year)).events.push(e);
    return [...g].sort((a, b) => a[0] - b[0]);
  }, [shown, shownEvents]);

  // names of records in the events become links (as in the reader)
  const names = useMemo(() => buildNameIndex(persons), [persons]);
  const clickLink = (e: React.MouseEvent) => {
    const a = (e.target as HTMLElement).closest<HTMLElement>("a[data-person]");
    if (a) onPerson(Number(a.dataset.person));
  };

  return (
    <div className="reader">
      <div className="reader-scroll">
        <div className="timeline" onClick={clickLink}>
          <header className="view-head">
            <h1>
              <Clock3 size={22} /> {t.timeline}
            </h1>
            <p className="muted small">{t.timelineHint}</p>
            <div className="btn-row">
              <label className={`toggle ${onlyTree ? "on" : ""}`}>
                <input type="checkbox" checked={onlyTree} onChange={(e) => setOnlyTree(e.target.checked)} />
                <span className="switch" />
                <ListTree size={14} /> {t.onlyParampara}
              </label>
              {events.length > 0 && (
                <label className={`toggle ${showEvents ? "on" : ""}`} title={t.chronicleHint}>
                  <input type="checkbox" checked={showEvents} onChange={(e) => setShowEvents(e.target.checked)} />
                  <span className="switch" />
                  <ScrollText size={14} /> {t.chronicleShow(events.length)}
                </label>
              )}
            </div>
          </header>
          {list === null && <span className="spinner" />}
          {list !== null && shown.length === 0 && shownEvents.length === 0 && <p className="muted">{t.timelineEmpty}</p>}
          {groups.map(([c, { people, events: evs }]) => (
            <section key={c}>
              <h2>{t.century(c)}</h2>
              {people.map((l) => {
                const from = l.born ?? l.died!;
                const to = l.died ?? l.born!;
                return (
                  <button key={l.id} className={`tl-row${l.parampara ? " tree" : ""}`} onClick={() => onPerson(l.id)}>
                    <span className="tl-name">
                      {l.hasPhoto ? <img src={fileUrl("photo", l.id)} alt="" /> : <UserRound size={14} />}
                      {l.name}
                    </span>
                    <span className="tl-years">
                      {l.born ?? "?"}–{l.died ?? "?"}
                    </span>
                    <span className="tl-track">
                      <span
                        className={`tl-bar${l.born === null || l.died === null ? " partial" : ""}`}
                        style={{ left: `${pos(from)}%`, width: `${Math.max(0.6, pos(to) - pos(from))}%` }}
                      />
                    </span>
                  </button>
                );
              })}
              {evs.length > 0 && (
                <div className="ev-list">
                  {evs.map((e, i) => (
                    <div key={`${e.year}-${i}`} className={`ev-row ev-${e.kind}`}>
                      <span className="ev-year">{e.year}</span>
                      <span className="ev-body">
                        {e.lunar && <span className="ev-lunar">{e.lunar} · </span>}
                        <EventText text={e.text} names={names} />
                        {e.personId !== null && (
                          <button className="chip clickable ev-person" onClick={() => onPerson(e.personId!)}>
                            <UserRound size={12} /> {e.person}
                          </button>
                        )}
                      </span>
                      <button className="icon-btn" title={t.chronicleOpen} onClick={() => onOpenDoc(e.docId, e.ordinal)}>
                        <BookOpen size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
          {list !== null && (
            <div className="tl-scale">
              {Array.from({ length: (max - min) / 100 + 1 }, (_, i) => min + i * 100).map((y) => (
                <span key={y} style={{ left: `${pos(y)}%` }}>
                  {y.toLocaleString(lang, { useGrouping: false })}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
