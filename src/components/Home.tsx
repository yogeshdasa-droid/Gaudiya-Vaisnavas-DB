import { useMemo } from "react";
import { BarChart3, Clock, Clock3, Database, MapPin, Network, FileText, HardDrive, Sparkles, Star, Upload, Users } from "lucide-react";
import { Bookmark, fileUrl, hueOf, isFavorite, PersonListItem, Place, SearchResult, Status } from "../api";
import { Lang, T } from "../i18n";
import { AnimatedNumber } from "./ui";
import { coverHidden, LotusDivider, NoPhoto } from "./Logo";
import { Calendar } from "./Calendar";

export interface RecentDoc {
  docId: number;
  title: string;
  collection: string;
}

interface Props {
  t: T;
  lang: Lang;
  status: Status | null;
  facets: SearchResult["facets"];
  persons: PersonListItem[];
  recent: RecentDoc[];
  bookmarks: Bookmark[];
  onCollection: (name: string) => void;
  onPerson: (id: number) => void;
  onRecent: (r: RecentDoc) => void;
  onBookmark: (b: Bookmark) => void;
  onImportDefaults: () => void;
  /** changes when the data changes (the calendar is read again) */
  reload: number;
  onTimeline: () => void;
  onTree: () => void;
  onPanorama: () => void;
  places: Place[];
  onPlace: (id: number) => void;
  onCalendar: () => void;
  /** «Recently opened» emptied */
  onClearRecent: () => void;
}

/** The size of the library: records, texts, original files, database (Panorama › Status). */
export function StatTiles({ t, lang, status }: { t: T; lang: Lang; status: Status | null }) {
  const stats = [
    { icon: Users, value: status?.persons ?? 0, label: t.statPersons },
    { icon: FileText, value: status?.docs ?? 0, label: t.statDocs },
    { icon: HardDrive, value: status?.filesMb ?? 0, label: t.statFiles, fmt: (n: number) => `${Math.round(n).toLocaleString(lang)} MB` },
    { icon: Database, value: (status?.dbSize ?? 0) / 1048576, label: t.statDb, fmt: (n: number) => `${Math.round(n).toLocaleString(lang)} MB` },
  ];
  return (
    <div className="stats">
      {stats.map((s, i) => (
        <div key={i} className="stat" style={{ animationDelay: `${i * 60}ms` }}>
          <s.icon size={18} />
          <strong>
            <AnimatedNumber value={s.value} format={s.fmt ?? ((n) => Math.round(n).toLocaleString(lang))} />
          </strong>
          <span>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

/** The same one all day, another one tomorrow. */
function ofTheDay<X>(list: X[]): X | null {
  if (!list.length) return null;
  const d = new Date();
  const day = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  return list[(day * 7919) % list.length];
}

export function Home({ t, lang, status, persons, recent, bookmarks, onPerson, onRecent, onBookmark, onImportDefaults, reload, onTimeline, onTree, onPanorama, places, onPlace, onCalendar, onClearRecent }: Props) {
  const empty = status !== null && status.docs === 0 && !status.busy;
  // something to discover each day: a record of the Guru Paramparā and a holy place
  const person = useMemo(() => ofTheDay([...persons].filter((p) => p.tree).sort((a, b) => a.id - b.id)), [persons]);
  const place = useMemo(() => ofTheDay([...places].filter((p) => p.about.trim()).sort((a, b) => a.id - b.id)), [places]);
  // the records marked with the star, to reach them at once
  const favorites = useMemo(() => persons.filter(isFavorite).sort((a, b) => a.name.localeCompare(b.name)), [persons]);
  const firstLine = (s: string) => {
    const one = s.split("\n")[0].trim();
    return one.length > 220 ? one.slice(0, 220).replace(/\s+\S*$/, "") + "…" : one;
  };
  return (
    <div className="home">
      <div className="home-inner">
        <header className="hero">
          <div className="hero-icon">
            <Users size={26} />
          </div>
          <div>
            <h1>{t.welcome}</h1>
            <p>{t.tagline}</p>
            {!empty && (
              <div className="hero-actions">
                <button className="btn ghost" onClick={onTree} title={t.treeViewHint}>
                  <Network size={15} /> {t.treeView}
                </button>
                <button className="btn ghost" onClick={onTimeline} title={t.timelineHint}>
                  <Clock3 size={15} /> {t.timeline}
                </button>
                <button className="btn ghost" onClick={onPanorama} title={t.panoramaHint}>
                  <BarChart3 size={15} /> {t.panorama}
                </button>
              </div>
            )}
          </div>
        </header>
        <LotusDivider />

        {empty && (
          <div className="empty-state">
            <Upload size={34} />
            <h2>{t.emptyTitle}</h2>
            <p>{t.emptyText}</p>
            <button className="btn" onClick={onImportDefaults}>
              <Upload size={15} /> {t.importDefaults}
            </button>
          </div>
        )}

        {favorites.length > 0 && (
          <section>
            <h2>
              <Star size={14} /> {t.favorites}
            </h2>
            <div className="fav-grid">
              {favorites.map((f) => (
                <button key={f.id} className="fav-card" data-ctx="person" data-id={f.id} onClick={() => onPerson(f.id)} title={f.aka ? `${f.name}\n${f.aka}` : f.name}>
                  <span className="fav-photo">
                    {f.hasPhoto ? (
                      <img src={fileUrl("photo", f.id)} alt="" loading="lazy" />
                    ) : f.coverDoc && !coverHidden.has(f.id) ? (
                      <img src={fileUrl("cover", f.coverDoc)} alt="" loading="lazy" />
                    ) : (
                      <NoPhoto name={f.name} />
                    )}
                  </span>
                  <span className="fav-name">{f.name}</span>
                </button>
              ))}
            </div>
          </section>
        )}


        {(person || place) && (
          <section>
            <h2>
              <Sparkles size={14} /> {t.ofTheDay}
            </h2>
            <div className="of-day">
              {person && (
                <button className="of-day-card" data-ctx="person" data-id={person.id} onClick={() => onPerson(person.id)}>
                  <span className="pc-cover">
                    {person.hasPhoto ? (
                      <img src={fileUrl("photo", person.id)} alt="" loading="lazy" />
                    ) : person.coverDoc && !coverHidden.has(person.id) ? (
                      <img src={fileUrl("cover", person.coverDoc)} alt="" loading="lazy" />
                    ) : (
                      <NoPhoto name={person.name} />
                    )}
                  </span>
                  <span className="of-day-text">
                    <em>{t.personOfDay}</em>
                    <strong>{person.name}</strong>
                    {person.aka && <span className="muted small">{person.aka}</span>}
                  </span>
                </button>
              )}
              {place && (
                <button className="of-day-card" onClick={() => onPlace(place.id)}>
                  <span className="pc-cover place">
                    {place.hasPhoto ? <img src={`${fileUrl("placephoto", place.id)}?v=${encodeURIComponent(place.modified)}`} alt="" loading="lazy" /> : <MapPin size={22} />}
                  </span>
                  <span className="of-day-text">
                    <em>{t.placeOfDay}</em>
                    <strong>{place.name}</strong>
                    {place.region && <span className="muted small">{place.region}</span>}
                    <span className="small">{firstLine(place.about)}</span>
                  </span>
                </button>
              )}
            </div>
          </section>
        )}


        <LotusDivider />
        {!empty && <Calendar t={t} lang={lang} reload={reload} onPerson={onPerson} onOpen={onCalendar} />}

        <LotusDivider />
        <div className="home-cols">
          {recent.length > 0 && (
            <section>
              <h2>
                <Clock size={14} /> {t.recent}
                <button className="link-btn small home-clear" onClick={onClearRecent} title={t.recentClearHint}>
                  {t.recentClear}
                </button>
              </h2>
              <div className="mini-list">
                {recent.slice(0, 5).map((r) => (
                  <button key={r.docId} onClick={() => onRecent(r)} style={{ "--h": hueOf(r.collection) } as React.CSSProperties}>
                    <i className="dot" />
                    <span>{r.title}</span>
                    <em>{r.collection}</em>
                  </button>
                ))}
              </div>
            </section>
          )}
          {bookmarks.length > 0 && (
            <section>
              <h2>
                <Star size={14} /> {t.recentBookmarks}
              </h2>
              <div className="mini-list">
                {bookmarks.slice(0, 8).map((b) => (
                  <button key={b.id} onClick={() => onBookmark(b)} disabled={!b.docId}>
                    <Star size={12} />
                    <span>{b.title}</span>
                    {b.note && <em>{b.note}</em>}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>



      </div>
    </div>
  );
}
