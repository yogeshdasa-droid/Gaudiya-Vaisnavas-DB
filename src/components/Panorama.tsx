import { useEffect, useMemo, useState } from "react";
import { BarChart3, ChevronRight } from "lucide-react";
import { api, OverviewPerson, PersonListItem, sortDisciples } from "../api";
import { Lang, T } from "../i18n";
import { foldName } from "./Sidebar";

const centuryOf = (p: { born: number | null; died: number | null }) => {
  const y = p.born ?? (p.died !== null ? p.died - 60 : null);
  return y === null ? null : Math.floor((y - 1) / 100) + 1;
};

/** Names as links to their records (the first `max`). */
function Names({ t, people, onPerson, max = 400 }: { t: T; people: { id: number; name: string }[]; onPerson: (id: number) => void; max?: number }) {
  return (
    <div className="pano-names">
      {people.slice(0, max).map((p) => (
        <button key={p.id} className="name-link" onClick={() => onPerson(p.id)}>
          {p.name}
        </button>
      ))}
      {people.length > max && <span className="muted small">{t.panoramaMore(people.length - max)}</span>}
    </div>
  );
}

/** One row of a bar chart: label, bar (share of `max`), value; a click opens what it counts. */
function BarRow({
  label,
  value,
  of,
  text,
  tip,
  open,
  onToggle,
  children,
}: {
  label: string;
  value: number;
  of: number;
  text: React.ReactNode;
  tip?: string;
  open: boolean;
  onToggle?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className={`pano-bar${open ? " open" : ""}`}>
      <button className="pano-bar-row" title={tip} onClick={onToggle} disabled={!onToggle}>
        <span className="pano-label">{label}</span>
        <span className="pano-track">
          <span className="pano-fill" style={{ width: `${of ? (value / of) * 100 : 0}%` }} />
        </span>
        <span className="pano-value">{text}</span>
        {onToggle && <ChevronRight size={14} className={`caret ${open ? "open" : ""}`} />}
      </button>
      {open && children}
    </div>
  );
}

export type PanoramaTab = "status" | "map" | "branches" | "year" | "works";
const TABS: PanoramaTab[] = ["status", "map", "branches", "year", "works"];
type Scope = "all" | "tree" | "mandala";

/** What a record has, by name: the fields counted in "Status". */
const FIELDS = ["year", "appearance", "disappearance", "lunar", "guru", "disciples", "place", "works", "notes", "text", "photo"] as const;
type Field = (typeof FIELDS)[number];
const has: Record<Field, (p: OverviewPerson) => boolean> = {
  year: (p) => p.born !== null || p.died !== null,
  appearance: (p) => p.hasAppearance,
  disappearance: (p) => p.hasDisappearance,
  lunar: (p) => p.appearanceDay !== null || p.disappearanceDay !== null,
  guru: (p) => p.hasGuru,
  disciples: (p) => p.hasDisciples,
  place: (p) => p.hasPlace,
  works: (p) => p.hasWorks,
  notes: (p) => p.hasNotes,
  text: (p) => p.docs > 0,
  photo: (p) => p.hasPhoto,
};

/** The Panorama: views over the whole database. "Status" tells what the
 *  records have and what they lack, to fill in the most useful first. */
export function Panorama({
  t,
  lang,
  reload,
  persons,
  onPerson,
}: {
  t: T;
  lang: Lang;
  reload: number;
  persons: PersonListItem[];
  onPerson: (id: number) => void;
}) {
  const [all, setAll] = useState<OverviewPerson[] | null>(null);
  const [scope, setScope] = useState<Scope>("tree");
  const [tab, setTabState] = useState<PanoramaTab>(() => {
    try {
      const v = localStorage.getItem("bio.panoramaTab") as PanoramaTab | null;
      return v && TABS.includes(v) ? v : "status";
    } catch {
      return "status";
    }
  });
  const setTab = (v: PanoramaTab) => {
    setTabState(v);
    try {
      localStorage.setItem("bio.panoramaTab", v);
    } catch {
      /* storage unavailable */
    }
  };
  useEffect(() => void api.overview().then(setAll, () => setAll([])), [reload]);
  const list = useMemo(() => (all ?? []).filter((p) => scope === "all" || (scope === "tree") === p.tree), [all, scope]);

  return (
    <div className="reader">
      <div className="reader-scroll">
        <div className="panorama">
          <header className="view-head">
            <h1>
              <BarChart3 size={22} /> {t.panorama}
            </h1>
            <p className="muted small">{t.panoramaHint}</p>
            <div className="pano-tabs">
              {TABS.map((k) => (
                <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>
                  {t.panoramaTab[k]}
                </button>
              ))}
            </div>
            {tab !== "branches" && (
              <div className="seg small" data-n={3} data-on={scope === "all" ? 0 : scope === "tree" ? 1 : 2}>
                <span className="seg-ink" />
                {(["all", "tree", "mandala"] as Scope[]).map((s) => (
                  <button key={s} className={scope === s ? "on" : ""} onClick={() => setScope(s)}>
                    {t.panoramaScope[s]}
                  </button>
                ))}
              </div>
            )}
          </header>
          {all === null ? (
            <span className="spinner" />
          ) : tab === "status" ? (
            <Status t={t} lang={lang} list={list} onPerson={onPerson} />
          ) : tab === "map" ? (
            <PlacesMap t={t} lang={lang} list={list} onPerson={onPerson} />
          ) : tab === "branches" ? (
            <Branches t={t} lang={lang} persons={persons} onPerson={onPerson} />
          ) : tab === "year" ? (
            <Year t={t} lang={lang} list={list} onPerson={onPerson} />
          ) : (
            <Works t={t} list={list} onPerson={onPerson} />
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- status

function Status({ t, lang, list, onPerson }: { t: T; lang: Lang; list: OverviewPerson[]; onPerson: (id: number) => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const n = (x: number) => x.toLocaleString(lang);
  const pct = (x: number) => (list.length ? Math.round((x / list.length) * 100) : 0);
  // a record is "complete" with a year, its guru, its place and some text or notes
  const complete = list.filter((p) => has.year(p) && has.guru(p) && has.place(p) && (has.text(p) || has.notes(p))).length;
  const centuries = useMemo(() => {
    const by = new Map<number, OverviewPerson[]>();
    for (const p of list) {
      const c = centuryOf(p);
      if (c !== null) by.set(c, [...(by.get(c) ?? []), p]);
    }
    return [...by].sort((a, b) => a[0] - b[0]);
  }, [list]);
  const most = Math.max(1, ...centuries.map(([, ps]) => ps.length));
  const toggle = (k: string) => () => setOpen(open === k ? null : k);

  return (
    <>
      <div className="pano-tiles">
        <div className="pano-tile">
          <strong>{n(list.length)}</strong>
          <span>{t.panoramaRecords}</span>
        </div>
        <div className="pano-tile">
          <strong>{pct(complete)}%</strong>
          <span>{t.panoramaComplete(n(complete))}</span>
        </div>
        <div className="pano-tile">
          <strong>{pct(list.filter(has.year).length)}%</strong>
          <span>{t.panoramaWithYear}</span>
        </div>
        <div className="pano-tile">
          <strong>{pct(list.filter(has.text).length)}%</strong>
          <span>{t.panoramaWithText}</span>
        </div>
      </div>

      <h2>{t.panoramaFieldsTitle}</h2>
      <p className="muted small">{t.panoramaFieldsHint}</p>
      <div className="pano-bars">
        {FIELDS.map((f) => {
          const yes = list.filter(has[f]).length;
          const missing = list.filter((p) => !has[f](p));
          return (
            <BarRow
              key={f}
              label={t.panoramaField[f]}
              value={yes}
              of={list.length}
              tip={t.panoramaBarTip(n(yes), n(list.length), n(missing.length))}
              text={
                <>
                  {pct(yes)}% <span className="muted">· {t.panoramaMissing(n(missing.length))}</span>
                </>
              }
              open={open === f}
              onToggle={missing.length ? toggle(f) : undefined}
            >
              <Names t={t} people={missing} onPerson={onPerson} />
            </BarRow>
          );
        })}
      </div>

      <h2>{t.panoramaCenturiesTitle}</h2>
      <p className="muted small">{t.panoramaCenturiesHint(n(list.length - centuries.reduce((s, [, ps]) => s + ps.length, 0)))}</p>
      <div className="pano-bars">
        {centuries.map(([c, ps]) => (
          <BarRow
            key={c}
            label={t.century(c)}
            value={ps.length}
            of={most}
            text={n(ps.length)}
            open={open === `c${c}`}
            onToggle={toggle(`c${c}`)}
          >
            <Names t={t} people={[...ps].sort((a, b) => (a.born ?? a.died ?? 0) - (b.born ?? b.died ?? 0))} onPerson={onPerson} />
          </BarRow>
        ))}
      </div>
    </>
  );
}

// ---------------------------------------------------------------- map

/** The holy places named in the records: [name, latitude, longitude, ways it is written (folded)]. */
const PLACES: [string, number, number, string[]][] = [
  ["Navadvīpa / Māyāpur", 23.42, 88.37, ["navadvip", "nabadwip", "mayapur", "nadia", "godrum", "kuliya"]],
  ["Śāntipura", 23.25, 88.43, ["santipur", "shantipur"]],
  ["Kālnā (Ambikā)", 23.22, 88.36, ["kalna", "ambika"]],
  ["Kāṭwā", 23.65, 88.13, ["katwa", "katoya", "kantaka"]],
  ["Śrīkhaṇḍa", 23.6, 88.05, ["srikhand"]],
  ["Kulīna-grāma", 23.18, 88.1, ["kulin"]],
  ["Ekacakrā", 24.18, 87.83, ["ekacakra", "birchandrapur"]],
  ["Pānihāṭi", 22.69, 88.37, ["panihat"]],
  ["Kumārahaṭṭa / Hālisahar", 22.95, 88.42, ["kumarahat", "halisahar", "kumarhat"]],
  ["Kalkatā", 22.57, 88.36, ["calcutta", "kolkata"]],
  ["Bīrnagara (Ulā)", 23.25, 88.55, ["birnagar", "ula "]],
  ["Vardhamāna", 23.23, 87.86, ["burdwan", "bardhaman", "vardhaman"]],
  ["Viṣṇupura", 23.07, 87.32, ["visnupur", "bishnupur", "bankura"]],
  ["Kheturī", 24.47, 88.55, ["kheturi", "khetur"]],
  ["Rājaśāhī / Gopālpur", 24.37, 88.6, ["rajshahi", "gopalpur"]],
  ["Rāmakeli (Gauḍa)", 24.88, 88.13, ["ramakeli", "malda"]],
  ["Śrīhaṭṭa (Sylhet)", 24.9, 91.87, ["srihat", "sylhet"]],
  ["Dhākā", 23.81, 90.41, ["dhaka", "dacca"]],
  ["Yaśohara", 23.17, 89.21, ["jessore", "yasohar", "jasohar"]],
  ["Medinīpura", 22.42, 87.32, ["medinipur", "midnapore", "midnapur"]],
  ["Gopīvallabhapura", 22.2, 86.9, ["gopiballav", "gopivallabh"]],
  ["Dhāreṇḍa / Rohiṇī", 22.35, 87.2, ["dharend", "rohini"]],
  ["Tamaluka", 22.3, 87.92, ["tamluk", "tamralipt"]],
  ["Jagannātha Purī", 19.81, 85.83, ["jagannatha puri", "jagannath puri", "nilacal", "puri"]],
  ["Kaṭaka", 20.46, 85.88, ["cuttack", "kataka"]],
  ["Jājapura", 20.85, 86.33, ["jajpur", "jajapur"]],
  ["Remuṇā", 21.53, 86.87, ["remuna"]],
  ["Vṛndāvana", 27.58, 77.7, ["vrndavan", "vrindavan", "brindavan", "vraja", "braj"]],
  ["Mathurā", 27.49, 77.67, ["mathura"]],
  ["Rādhā-kuṇḍa / Govardhana", 27.52, 77.47, ["radhakund", "radha-kund", "govardhan", "radha kund"]],
  ["Nandagrāma / Varṣāṇā", 27.68, 77.38, ["nandagram", "varsana", "barsana"]],
  ["Jaipur", 26.91, 75.79, ["jaipur"]],
  ["Vārāṇasī", 25.32, 83.0, ["varanasi", "benares", "kasi"]],
  ["Prayāga", 25.44, 81.85, ["prayag", "allahabad"]],
  ["Gayā", 24.79, 85.0, ["gaya"]],
  ["Haridvāra", 29.95, 78.16, ["hardwar", "haridvar"]],
  ["Paṇḍharapura", 17.68, 75.33, ["pandharpur"]],
  ["Śrī Raṅgam", 10.86, 78.69, ["srirang"]],
  ["Uḍupī", 13.34, 74.75, ["udupi"]],
];

function placesOf(text: string): number[] {
  const f = ` ${foldName(text)} `;
  const out: number[] = [];
  PLACES.forEach(([, , , keys], i) => {
    if (keys.some((k) => f.includes(foldName(k)))) out.push(i);
  });
  return out;
}

/** A piece of the map: [south, north, west, east] in degrees. */
type Box = [number, number, number, number];
/** North India, from Vraja to Bengal and Orissa; Bengal close up. */
const NORTH: Box = [18.6, 30.6, 74.6, 92.6];
const BENGAL: Box = [21.7, 25.3, 86.5, 90.2];
const inBox = (b: Box, la: number, lo: number) => la >= b[0] && la <= b[1] && lo >= b[2] && lo <= b[3];

function MapSvg({
  t,
  box,
  width,
  at,
  most,
  picked,
  onPick,
  labels,
  regions,
  frame,
}: {
  t: T;
  box: Box;
  width: number;
  at: Map<number, OverviewPerson[]>;
  most: number;
  picked: number | null;
  onPick: (i: number) => void;
  /** which places carry their name */
  labels: (i: number, n: number) => boolean;
  regions: [string, number, number][];
  /** a box drawn on this map (where the close-up is) */
  frame?: Box;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const [s, n, w, e] = box;
  const k = Math.cos((((s + n) / 2) * Math.PI) / 180);
  const H = Math.round((width * (n - s)) / ((e - w) * k));
  const x = (lon: number) => ((lon - w) / (e - w)) * width;
  const y = (lat: number) => ((n - lat) / (n - s)) * H;
  const r = (c: number) => 5 + 14 * Math.sqrt(c / most);
  const shown = [...at].filter(([i]) => inBox(box, PLACES[i][1], PLACES[i][2])).sort((a, b) => b[1].length - a[1].length);
  return (
    <svg viewBox={`0 0 ${width} ${H}`} role="img" aria-label={t.panoramaTab.map}>
      {regions.map(([name, la, lo]) => (
        <text key={name} className="map-region" x={x(lo)} y={y(la)} textAnchor="middle">
          {name}
        </text>
      ))}
      {frame && <rect className="map-frame" x={x(frame[2])} y={y(frame[1])} width={x(frame[3]) - x(frame[2])} height={y(frame[0]) - y(frame[1])} rx={6} />}
      {shown.map(([i, ps]) => {
        const [name, la, lo] = PLACES[i];
        return (
          <g
            key={i}
            className={`map-place${picked === i ? " on" : ""}`}
            onClick={() => onPick(i)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <circle cx={x(lo)} cy={y(la)} r={r(ps.length) + 6} className="map-hit" />
            <circle cx={x(lo)} cy={y(la)} r={r(ps.length)} className="map-dot" />
            {(labels(i, ps.length) || hover === i || picked === i) && (
              <text
                x={x(lo) > width * 0.78 ? x(lo) - r(ps.length) - 4 : x(lo) + r(ps.length) + 4}
                y={y(la) + 4}
                textAnchor={x(lo) > width * 0.78 ? "end" : "start"}
                className="map-label"
              >
                {name} · {ps.length}
              </text>
            )}
            <title>{`${name}: ${ps.length}`}</title>
          </g>
        );
      })}
    </svg>
  );
}

function PlacesMap({ t, lang, list, onPerson }: { t: T; lang: Lang; list: OverviewPerson[]; onPerson: (id: number) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const at = useMemo(() => {
    const by = new Map<number, OverviewPerson[]>();
    for (const p of list) for (const i of placesOf(p.place)) by.set(i, [...(by.get(i) ?? []), p]);
    return by;
  }, [list]);
  const withPlace = list.filter((p) => p.hasPlace).length;
  const located = new Set([...at.values()].flat().map((p) => p.id)).size;
  const most = Math.max(1, ...[...at.values()].map((ps) => ps.length));
  const sorted = [...at].sort((a, b) => b[1].length - a[1].length);
  const far = sorted.filter(([i]) => !inBox(NORTH, PLACES[i][1], PLACES[i][2]));
  const pick = (i: number) => setPicked(picked === i ? null : i);
  // away from Bengal the places are few but close together (Vraja): the biggest one of each
  // cluster of about a degree carries its name
  const bigOutside: number[] = [];
  for (const [i] of sorted) {
    const [, la, lo] = PLACES[i];
    if (inBox(BENGAL, la, lo)) continue;
    if (!bigOutside.some((j) => Math.abs(PLACES[j][1] - la) < 1 && Math.abs(PLACES[j][2] - lo) < 1.2)) bigOutside.push(i);
  }
  // in Bengal too, one name for each knot of places a few kilometres apart
  const bigBengal: number[] = [];
  for (const [i] of sorted) {
    const [, la, lo] = PLACES[i];
    if (!inBox(BENGAL, la, lo)) continue;
    if (!bigBengal.some((j) => Math.abs(PLACES[j][1] - la) < 0.2 && Math.abs(PLACES[j][2] - lo) < 0.45)) bigBengal.push(i);
  }
  const common = { t, at, most, picked, onPick: pick };

  return (
    <>
      <p className="muted small">{t.mapHint(withPlace.toLocaleString(lang), located.toLocaleString(lang))}</p>
      <div className="pano-maps">
        <div className="pano-map">
          <MapSvg
            {...common}
            box={NORTH}
            width={620}
            frame={BENGAL}
            labels={(i) => !inBox(BENGAL, PLACES[i][1], PLACES[i][2]) && bigOutside.includes(i)}
            regions={[
              [t.regionVraja, 29.6, 77.6],
              [t.regionOrissa, 20.4, 84.4],
            ]}
          />
        </div>
        <div className="pano-map">
          <div className="map-title">{t.mapBengal}</div>
          <MapSvg {...common} box={BENGAL} width={620} labels={(i) => bigBengal.includes(i)} regions={[[t.regionBengal, 25.05, 89.4]]} />
        </div>
      </div>
      {far.length > 0 && (
        <p className="muted small">
          {t.mapFar}:{" "}
          {far.map(([i, ps], n) => (
            <span key={i}>
              {n > 0 && " · "}
              <button className="name-link" onClick={() => pick(i)}>
                {PLACES[i][0]} ({ps.length})
              </button>
            </span>
          ))}
        </p>
      )}
      {picked !== null && at.get(picked) && (
        <section>
          <h2>
            {PLACES[picked][0]} <span className="count">{at.get(picked)!.length}</span>
          </h2>
          <Names t={t} people={at.get(picked)!} onPerson={onPerson} />
        </section>
      )}
      <h2>{t.mapListTitle}</h2>
      <div className="pano-bars">
        {sorted.map(([i, ps]) => (
          <BarRow
            key={i}
            label={PLACES[i][0]}
            value={ps.length}
            of={most}
            text={ps.length.toLocaleString(lang)}
            open={picked === i}
            onToggle={() => pick(i)}
          >
            <Names t={t} people={ps} onPerson={onPerson} />
          </BarRow>
        ))}
      </div>
    </>
  );
}

// ---------------------------------------------------------------- branches

function Branches({ t, lang, persons, onPerson }: { t: T; lang: Lang; persons: PersonListItem[]; onPerson: (id: number) => void }) {
  const [open, setOpen] = useState<number | null>(null);
  const rows = useMemo(() => {
    const kids = new Map<number | null, PersonListItem[]>();
    const ids = new Set(persons.filter((p) => p.tree).map((p) => p.id));
    for (const p of persons) {
      if (!p.tree) continue;
      const parent = p.tree.parent !== null && ids.has(p.tree.parent) ? p.tree.parent : null;
      kids.set(parent, [...(kids.get(parent) ?? []), p]);
    }
    sortDisciples(kids);
    // everyone below a record, and how many generations deep
    const size = new Map<number, { all: number; depth: number }>();
    const walk = (id: number, seen: Set<number>): { all: number; depth: number } => {
      if (size.has(id)) return size.get(id)!;
      let all = 0;
      let depth = 0;
      for (const k of kids.get(id) ?? []) {
        if (seen.has(k.id)) continue;
        seen.add(k.id);
        const s = walk(k.id, seen);
        all += 1 + s.all;
        depth = Math.max(depth, 1 + s.depth);
      }
      const v = { all, depth };
      size.set(id, v);
      return v;
    };
    return persons
      .filter((p) => p.tree)
      .map((p) => ({ p, direct: kids.get(p.id) ?? [], ...walk(p.id, new Set([p.id])) }))
      .filter((r) => r.direct.length >= 3)
      .sort((a, b) => b.direct.length - a.direct.length || b.all - a.all)
      .slice(0, 40);
  }, [persons]);
  const most = Math.max(1, ...rows.map((r) => r.direct.length));
  const n = (x: number) => x.toLocaleString(lang);

  return (
    <>
      <p className="muted small">{t.branchesHint}</p>
      <div className="pano-bars">
        {rows.map((r) => (
          <BarRow
            key={r.p.id}
            label={r.p.name}
            value={r.direct.length}
            of={most}
            tip={t.branchesTip(n(r.direct.length), n(r.all), n(r.depth))}
            text={
              <>
                {n(r.direct.length)} <span className="muted">· {t.branchesAll(n(r.all))} · {t.branchesDepth(r.depth)}</span>
              </>
            }
            open={open === r.p.id}
            onToggle={() => setOpen(open === r.p.id ? null : r.p.id)}
          >
            <div className="pano-names">
              <button className="name-link strong" onClick={() => onPerson(r.p.id)}>
                {r.p.name}
              </button>
              <span className="muted small">→</span>
              {r.direct.map((k) => (
                <button key={k.id} className="name-link" title={k.tree ? t.treeKinds[k.tree.kind] : undefined} onClick={() => onPerson(k.id)}>
                  {k.name}
                </button>
              ))}
            </div>
          </BarRow>
        ))}
      </div>
    </>
  );
}

// ---------------------------------------------------------------- the Vaiṣṇava year

/** As in calendar.rs: the Vaiṣṇava months from Viṣṇu (Caitra), and the tithis. */
const MONTHS = ["Viṣṇu", "Madhusūdana", "Trivikrama", "Vāmana", "Śrīdhara", "Hṛṣīkeśa", "Padmanābha", "Dāmodara", "Keśava", "Nārāyaṇa", "Mādhava", "Govinda", "Puruṣottama"];
const TITHIS = ["Pratipat", "Dvitīyā", "Tṛtīyā", "Caturthī", "Pañcamī", "Ṣaṣṭhī", "Saptamī", "Aṣṭamī", "Navamī", "Daśamī", "Ekādaśī", "Dvādaśī", "Trayodaśī", "Caturdaśī", "Pūrṇimā"];

function Year({ t, lang, list, onPerson }: { t: T; lang: Lang; list: OverviewPerson[]; onPerson: (id: number) => void }) {
  const [open, setOpen] = useState<string | null>(null);
  // the 12 months from Viṣṇu (Caitra) and Puruṣottama, with the tithi of each one
  const months = useMemo(() => {
    const out = Array.from({ length: 13 }, () => ({ app: [] as [OverviewPerson, number][], dis: [] as [OverviewPerson, number][] }));
    for (const p of list) {
      if (p.appearanceDay) out[p.appearanceDay[0]]?.app.push([p, p.appearanceDay[1]]);
      if (p.disappearanceDay) out[p.disappearanceDay[0]]?.dis.push([p, p.disappearanceDay[1]]);
    }
    return out;
  }, [list]);
  const most = Math.max(1, ...months.flatMap((m) => [m.app.length, m.dis.length]));
  const total = months.reduce((s, m) => s + m.app.length + m.dis.length, 0);
  const tithi = (d: number) => (d === 15 ? "Pūrṇimā" : d === 30 ? "Amāvasyā" : `${d < 15 ? "Gaura" : "Kṛṣṇa"} ${TITHIS[(d - 1) % 15]}`);
  const people = (ps: [OverviewPerson, number][]) => (
    <div className="pano-names">
      {[...ps]
        .sort((a, b) => a[1] - b[1])
        .map(([p, d]) => (
          <button key={p.id} className="name-link" onClick={() => onPerson(p.id)} title={tithi(d)}>
            {p.name} <span className="muted">· {tithi(d)}</span>
          </button>
        ))}
    </div>
  );
  const chart = (kind: "app" | "dis") => (
    <div className="pano-bars">
      {months.map((m, i) =>
        m[kind].length === 0 && i === 12 ? null : (
          <BarRow
            key={i}
            label={MONTHS[i]}
            value={m[kind].length}
            of={most}
            text={m[kind].length.toLocaleString(lang)}
            open={open === `${kind}${i}`}
            onToggle={m[kind].length ? () => setOpen(open === `${kind}${i}` ? null : `${kind}${i}`) : undefined}
          >
            {people(m[kind])}
          </BarRow>
        ),
      )}
    </div>
  );
  return (
    <>
      <p className="muted small">{t.yearHint(total.toLocaleString(lang))}</p>
      <div className="pano-two">
        <section>
          <h2>{t.yearAppearances}</h2>
          {chart("app")}
        </section>
        <section>
          <h2>{t.yearDisappearances}</h2>
          {chart("dis")}
        </section>
      </div>
    </>
  );
}

// ---------------------------------------------------------------- works

function Works({ t, list, onPerson }: { t: T; list: OverviewPerson[]; onPerson: (id: number) => void }) {
  const groups = useMemo(() => {
    const by = new Map<number, OverviewPerson[]>();
    for (const p of list.filter((p) => p.hasWorks)) {
      const c = centuryOf(p) ?? 0;
      by.set(c, [...(by.get(c) ?? []), p]);
    }
    return [...by].sort((a, b) => (a[0] || 99) - (b[0] || 99));
  }, [list]);
  return (
    <>
      <p className="muted small">{t.worksHint}</p>
      {groups.map(([c, ps]) => (
        <section key={c}>
          <h2>
            {c ? t.century(c) : t.worksNoCentury} <span className="count">{ps.length}</span>
          </h2>
          <div className="works-list">
            {[...ps]
              .sort((a, b) => (a.born ?? a.died ?? 0) - (b.born ?? b.died ?? 0))
              .map((p) => (
                <div key={p.id} className="works-row">
                  <button className="name-link works-name" onClick={() => onPerson(p.id)}>
                    {p.name}
                  </button>
                  <span className="works-text">{p.works}</span>
                </div>
              ))}
          </div>
        </section>
      ))}
    </>
  );
}
