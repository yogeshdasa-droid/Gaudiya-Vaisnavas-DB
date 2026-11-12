import { useEffect, useMemo, useRef, useState } from "react";
import { BarChart3, ChevronRight, MapPin, Maximize, Minus, Plus } from "lucide-react";
import { api, OverviewPerson, PersonListItem, Place, sortDisciples, Status as LibraryStatus } from "../api";
import { StatTiles } from "./Home";
import { namesPlace, placeKeys, textKeys } from "../places";
import { Lang, T } from "../i18n";
import { foldName } from "./Sidebar";
import { BORDERS, LAKES, LAND, RIVERS, STATES } from "./mapData";
import { JOURNEYS } from "./journeys";

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
// the Guru Paramparā first: the focus of the library
const SCOPES: Scope[] = ["tree", "mandala", "all"];

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
  places,
  onPlace,
  focus,
  journey,
  status,
}: {
  t: T;
  lang: Lang;
  reload: number;
  persons: PersonListItem[];
  onPerson: (id: number) => void;
  places: Place[];
  onPlace: (id: number) => void;
  /** opened from a place: the map, with every record, at that place */
  focus?: { id: number; n: number };
  /** opened from a record's «See journeys»: the map, with that journey */
  journey?: { id: string; n: number };
  /** the size of the library, shown on «Status» */
  status: LibraryStatus | null;
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
  useEffect(() => {
    if (!focus) return;
    setTabState("map");
    setScope("all");
  }, [focus?.n]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (journey) setTabState("map");
  }, [journey?.n]);
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
              <div className="seg small" data-n={3} data-on={SCOPES.indexOf(scope)}>
                <span className="seg-ink" />
                {SCOPES.map((s) => (
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
            <>
              <StatTiles t={t} lang={lang} status={status} />
              <Status t={t} lang={lang} list={list} onPerson={onPerson} />
            </>
          ) : tab === "map" ? (
            <PlacesMap t={t} lang={lang} list={list} persons={persons} onPerson={onPerson} places={places} onPlace={onPlace} focus={focus} journeyFocus={journey} />
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

/** Districts and regions, for the records whose «Place» names only that (they are not tīrthas):
 *  [name, latitude, longitude, ways it is written (folded)]. A record goes here only when no
 *  holy place of the map recognises its «Place». */
const DISTRICTS: [string, number, number, string[]][] = [
  ["Faridpur", 23.61, 89.84, ["faridpur"]],
  ["Pabna", 24.0, 89.24, ["pabna"]],
  ["Barisal", 22.7, 90.37, ["barisal", "bakarganj", "banaripara", "banawaripara"]],
  ["Noakhali", 22.87, 91.1, ["noakhali", "pheni", "feni"]],
  ["Sandvīpa / Hatiyā", 22.45, 91.3, ["sandvip", "sandwip", "hatiya"]],
  ["Chittagong", 22.34, 91.83, ["chittagong", "cattagram", "catagram", "chatigram", "patiya"]],
  ["Mymensingh", 24.75, 90.4, ["mymensingh", "maimansingh", "kisoraganj", "kishoreganj", "egarasindur"]],
  ["Bogra", 24.85, 89.37, ["bogra", "bagura"]],
  ["Naogaon", 24.8, 88.93, ["naogaon"]],
  ["Rangpur", 25.75, 89.25, ["rangpur", "piarigan"]],
  ["Dinajpur", 25.62, 88.63, ["dinajpur"]],
  ["Khulna / Sātakṣīrā", 22.82, 89.55, ["khulna", "satkhira", "satksira"]],
  ["Madaripur", 23.17, 90.2, ["madaripur", "kotalipad"]],
  ["Murshidabad", 24.18, 88.27, ["murshidabad", "mursidavad", "mursidabad", "renapur", "patenda"]],
  ["Jangipur", 24.47, 88.07, ["jangipur", "jangipore"]],
  ["Birbhum", 23.9, 87.53, ["birbhum"]],
  ["Hugli", 22.9, 88.39, ["hugli", "hooghly", "siakhal", "seakhal", "seyakhal", "guptipar"]],
  ["Bardhamān (district)", 23.25, 87.86, ["bardavan", "barddhaman"]],
  ["Kaṭaka / Utkala", 20.6, 85.6, ["utkala", "orissa"]],
  ["Gwalpara", 26.17, 90.62, ["gwalpara", "goalpara"]],
  ["Mithilā / Tirhut", 26.12, 85.9, ["mithila", "trihut", "tirhut", "trihuta"]],
  ["Orchhā (Bundelkhand)", 25.35, 78.64, ["odacha", "orchha", "bundelkhand"]],
  ["Kānyakubja (Kanauj)", 27.05, 79.92, ["kanauj", "kannauj"]],
  ["Kanpur", 26.45, 80.33, ["kanpur"]],
  ["Lahore", 31.55, 74.34, ["lahore"]],
  ["Kashmir", 34.08, 74.8, ["kashmir"]],
  ["Ahmedabad", 23.03, 72.58, ["ahemadabad", "ahmedabad"]],
  ["Śrīperumbudūr", 12.97, 79.95, ["sriperumbudur"]],
  ["Kāladi", 10.17, 76.44, ["kaladi"]],
  ["Kāñcī", 12.83, 79.7, ["kanci ", "kanchi ", "kancipuram"]],
  ["Andhra", 16.5, 80.6, ["andhra"]],
];

/** A point of the map: one of PLACES, or a saved place (which takes the
 *  point of the one of PLACES it names, if any). */
interface MapPlace {
  name: string;
  lat: number;
  lon: number;
  /** PLACES' ways of writing it (folded, found anywhere in the text) */
  keys: string[];
  /** a saved place's keys (whole words: places.ts) */
  placeKeys: string[];
  placeId: number | null;
  /** the records the saved place lists */
  people: Set<number>;
  /** a district or region, not a holy place (drawn grey) */
  district?: boolean;
}

const inText = (keys: string[], text: string) => {
  const f = ` ${foldName(text)} `;
  return keys.some((k) => f.includes(foldName(k)));
};

function mapPlaces(places: Place[]): MapPlace[] {
  const out: MapPlace[] = PLACES.map(([name, lat, lon, keys]) => ({ name, lat, lon, keys, placeKeys: [], placeId: null, people: new Set() }));
  for (const pl of places) {
    if (pl.lat == null || pl.lon == null) continue;
    const mine = { name: pl.name, lat: pl.lat, lon: pl.lon, placeKeys: placeKeys(pl), placeId: pl.id, people: new Set(pl.people.map((x) => x.personId)) };
    // only by the point's main spelling: «Godrumadvīpa» must not take «Navadvīpa / Māyāpur»
    const same = out.find((m) => m.placeId === null && inText(m.keys.slice(0, 1), `${pl.name}, ${pl.aka}`));
    if (same) Object.assign(same, mine);
    else out.push({ ...mine, keys: [] });
  }
  for (const [name, lat, lon, keys] of DISTRICTS) out.push({ name, lat, lon, keys, placeKeys: [], placeId: null, people: new Set(), district: true });
  return out;
}

function placesOf(p: OverviewPerson, mp: MapPlace[]): number[] {
  const words = textKeys(p.place);
  const out: number[] = [];
  const named = (m: MapPlace) => m.people.has(p.id) || (p.place.trim() && (inText(m.keys, p.place) || namesPlace(words, m.placeKeys)));
  mp.forEach((m, i) => {
    if (!m.district && named(m)) out.push(i);
  });
  // only the district, when no holy place of the map recognised it
  if (!out.length) mp.forEach((m, i) => m.district && named(m) && out.push(i));
  return out;
}

/** A piece of the map: [south, north, west, east] in degrees. */
type Box = [number, number, number, number];
/** North India, from Vraja to Bengal and Orissa; Bengal close up. */
const NORTH: Box = [18.6, 30.6, 74.6, 92.6];
/** The whole drawing (mapData.ts, 12-11-2026): all India, for the journeys to the South. */
const INDIA: Box = [5.5, 33, 66.5, 97.5];
const BENGAL: Box = [21.7, 25.3, 86.5, 90.2];
/** Vraja close up: Vṛndāvana, Mathurā, Govardhana, Rādhā-kuṇḍa, Nandagrāma, Varṣāṇā. */
const VRAJA: Box = [27.42, 27.76, 77.32, 77.76];
const inBox = (b: Box, la: number, lo: number) => la >= b[0] && la <= b[1] && lo >= b[2] && lo <= b[3];

/** Rivers named on the map: [name, latitude, longitude, angle]. */
const RIVER_NAMES: [string, number, number, number][] = [
  ["Gaṅgā", 25.62, 84.6, 0],
  ["Gaṅgā", 27.35, 79.75, -38],
  ["Yamunā", 26.62, 79.0, -28],
  ["Brahmaputra", 26.32, 91.4, 0],
  ["Padmā", 23.9, 89.45, -18],
  ["Bhāgīrathī", 23.92, 88.12, -80],
  ["Mahānadī", 20.62, 84.9, -15],
];

/** The background lines, decoded once: [longitude, latitude] points. */
const decoded = new Map<string, [number, number][]>();
function points(line: string): [number, number][] {
  let pts = decoded.get(line);
  if (!pts) {
    let x = 0;
    let y = 0;
    pts = line.split(" ").map((p) => {
      const [dx, dy] = p.split(",");
      x += Number(dx);
      y += Number(dy);
      return [x / 100, y / 100];
    });
    decoded.set(line, pts);
  }
  return pts;
}

/** Close enough to tell apart villages a few km from each other (Kāṭwā, Jājigrāma, Śrīkhaṇḍa). */
const MAX_ZOOM = 400;
/** With the satellite pictures: down to a village and its temple (about 1 km across). */
const SAT_MAX_ZOOM = 400;

// ---- satellite pictures: Esri World Imagery tiles (Web Mercator), each one put
// by its four corners on this map (linear in latitude): inside a tile the
// difference is less than a dot at any zoom
// through the app (tiles.rs): kept on the disk once seen, from the internet only the first time
const SAT_URL = (z: number, x: number, y: number) =>
  navigator.userAgent.includes("Windows") ? `http://bio.localhost/tile/${z}/${x}/${y}` : `bio://localhost/tile/${z}/${x}/${y}`;
type Tile = ReturnType<typeof tilesFor>[number];
const tileX = (lon: number, z: number) => Math.floor(((lon + 180) / 360) * 2 ** z);
const tileY = (lat: number, z: number) => {
  const r = (lat * Math.PI) / 180;
  return Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z);
};
const tileLon = (x: number, z: number) => (x / 2 ** z) * 360 - 180;
const tileLat = (y: number, z: number) => (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / 2 ** z))) * 180) / Math.PI;

/** The tiles that cover [south, north, west, east] at a zoom level. */
function tilesFor(s: number, n: number, w: number, e: number, z: number) {
  const out: { key: string; url: string; s: number; n: number; w: number; e: number }[] = [];
  const [x0, x1, y0, y1] = [tileX(w, z), tileX(e, z), tileY(n, z), tileY(s, z)];
  for (let ty = y0; ty <= y1; ty++)
    for (let tx = x0; tx <= x1; tx++)
      out.push({ key: `${z}/${tx}/${ty}`, url: SAT_URL(z, tx, ty), w: tileLon(tx, z), e: tileLon(tx + 1, z), n: tileLat(ty, z), s: tileLat(ty + 1, z) });
  return out;
}

function MapSvg({
  t,
  mp,
  box,
  width,
  at,
  most,
  picked,
  onPick,
  labels,
  regions,
  frames = [],
  satellite = false,
  onTile,
  zoomReq,
  onShow,
  goto,
  onView,
  cluster = false,
  arcs = [],
  route,
}: {
  t: T;
  mp: MapPlace[];
  /** a journey: its stages numbered, the legs between them (dashed where not told), shown up to `upTo` */
  route?: { pts: { lat: number; lon: number; label: string }[]; legs: { a: number; b: number; dashed: boolean }[]; upTo: number; current: number | null; onStage: (k: number) => void };
  /** a line of the Paramparā over the map: guru's place → disciple's place (indices of `mp`); gen 0 = above */
  arcs?: { from: number; to: number; gen: number }[];
  /** go to that piece of the map (`n` tells two requests apart) */
  goto?: { box: Box; n: number };
  /** the piece in view, once the map stops moving: [south, north, west, east] */
  onView?: (b: Box) => void;
  /** places pressed together on the screen drawn as one dot with their total (12-11-2026) */
  cluster?: boolean;
  /** a place picked (on the map or with «See on the map»): if others are pressed against it,
   *  the map comes close enough to show them apart (`n` tells two requests apart) */
  zoomReq?: { i: number; n: number };
  /** a double click on a place: show its people below */
  onShow?: (i: number) => void;
  /** satellite pictures under the dots instead of the drawing */
  satellite?: boolean;
  /** a picture came (true) or failed (false): without internet the drawing comes back */
  onTile?: (ok: boolean) => void;
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
  frames?: Box[];
}) {
  const [hover, setHover] = useState<number | null>(null);
  const [s, n, w, e] = box;
  const k = Math.cos((((s + n) / 2) * Math.PI) / 180);
  const H = Math.round((width * (n - s)) / ((e - w) * k));
  const x = (lon: number) => ((lon - w) / (e - w)) * width;
  const y = (lat: number) => ((n - lat) / (n - s)) * H;

  // zoom: the piece of the map in view, [left, top, width] in map units
  const [view, setView] = useState<[number, number, number]>([0, 0, width]);
  const z = width / view[2];
  // the deepest zoom: about a kilometre across (temples a few hundred metres apart), whatever the map
  const maxZoom = Math.max(satellite ? SAT_MAX_ZOOM : MAX_ZOOM, (e - w) / 0.01);
  const svgRef = useRef<SVGSVGElement>(null);
  // back to the drawing: no deeper than its own zoom
  useEffect(() => {
    if (!satellite && z > MAX_ZOOM) setView(([vx, vy, vw]) => clampView([vx + vw / 2 - width / MAX_ZOOM / 2, vy + (vw * H) / width / 2 - (width / MAX_ZOOM) * (H / width) / 2, width / MAX_ZOOM]));
  }, [satellite]); // eslint-disable-line react-hooks/exhaustive-deps
  // its width on the screen, to ask for pictures as sharp as it is shown
  const [screenW, setScreenW] = useState(width);
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScreenW(el.getBoundingClientRect().width || width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);
  const zoomAt = (factor: number, px = view[0] + view[2] / 2, py = view[1] + (view[2] * H) / width / 2) =>
    setView(([vx, vy, vw]) => {
      const nw = Math.min(width, Math.max(width / maxZoom, vw / factor));
      const f = nw / vw;
      return clampView([px - (px - vx) * f, py - (py - vy) * f, nw]);
    });
  // the view stays over the drawn land: a little beyond the map's own box at most
  const [minX, minY, maxX, maxY] = [x(INDIA[2]), y(INDIA[1]), x(INDIA[3]), y(INDIA[0])];
  const clampView = ([vx, vy, vw]: [number, number, number]): [number, number, number] => {
    const vh = (vw * H) / width;
    if (vw >= width) return [0, 0, width];
    return [Math.min(Math.max(vx, minX), maxX - vw), Math.min(Math.max(vy, minY), maxY - vh), vw];
  };
  // a point of the screen in map units
  const toMap = (cx: number, cy: number) => {
    const r = svgRef.current!.getBoundingClientRect();
    return [view[0] + ((cx - r.left) / r.width) * view[2], view[1] + ((cy - r.top) / r.height) * ((view[2] * H) / width)] as const;
  };
  // the wheel zooms where the pointer is (a native listener: React's is passive)
  const wheel = useRef<(ev: WheelEvent) => void>(() => {});
  wheel.current = (ev) => {
    ev.preventDefault();
    const [px, py] = toMap(ev.clientX, ev.clientY);
    zoomAt(ev.deltaY < 0 ? 1.25 : 0.8, px, py);
  };
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const on = (ev: WheelEvent) => wheel.current(ev);
    el.addEventListener("wheel", on, { passive: false });
    return () => el.removeEventListener("wheel", on);
  }, []);
  // dragging moves the map; a press without moving is a click on a place
  const drag = useRef<{ x: number; y: number; view: [number, number, number]; moved: boolean } | null>(null);
  const onDown = (ev: React.PointerEvent) => {
    if (ev.button !== 0) return;
    drag.current = { x: ev.clientX, y: ev.clientY, view, moved: false };
  };
  const onMove = (ev: React.PointerEvent) => {
    const d = drag.current;
    if (!d || z <= 1) return;
    const dx = ev.clientX - d.x;
    const dy = ev.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 4) return;
    if (!d.moved) svgRef.current?.setPointerCapture(ev.pointerId);
    d.moved = true;
    const scale = d.view[2] / svgRef.current!.getBoundingClientRect().width;
    setView(clampView([d.view[0] - dx * scale, d.view[1] - dy * scale, d.view[2]]));
  };
  const onUp = () => {
    // the click that follows a drag is not a pick
    if (drag.current?.moved) window.setTimeout(() => (drag.current = null), 0);
    else drag.current = null;
  };
  const pick = (i: number) => {
    if (!drag.current?.moved) onPick(i);
  };

  const path = (line: string, close: boolean) =>
    points(line)
      .map(([lo, la], j) => `${j ? "L" : "M"}${x(lo).toFixed(1)} ${y(la).toFixed(1)}`)
      .join("") + (close ? "Z" : "");
  const background = useMemo(
    () => ({
      land: LAND.map((l) => path(l, true)).join(""),
      lakes: LAKES.map((l) => path(l, true)).join(""),
      states: STATES.map((l) => path(l, false)).join(""),
      borders: BORDERS.map((l) => path(l, false)).join(""),
      rivers: [0, 1, 2].map((c) =>
        RIVERS.filter(([wc]) => wc === c)
          .map(([, l]) => path(l, false))
          .join(""),
      ),
    }),
    [box, width], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // the dots grow a little up to ×2 and then keep their size on the screen:
  // zooming in moves close places apart instead of making them cover each other
  const r = (c: number) => ((5 + 14 * Math.sqrt(c / most)) * Math.sqrt(Math.min(z, 2))) / z;
  // big dots first, small ones over them; the one chosen last of all (on top)
  const shown = [...at]
    .filter(([i]) => inBox(box, mp[i].lat, mp[i].lon) || z > 1)
    .sort((a, b) => Number(a[0] === picked) - Number(b[0] === picked) || b[1].length - a[1].length);
  const vh = (view[2] * H) / width;
  const right = (lo: number) => x(lo) > view[0] + view[2] * 0.78;
  // places pressed together on the screen: one dot with the people of all of them, named after the
  // biggest («Navadvīpa-dhāma +12»); a click comes close enough to show them apart
  const unitPx = view[2] / (screenW || width); // map units in a pixel of the screen
  const groups = useMemo(() => {
    const out: { lead: number; members: number[]; people: Set<number> }[] = [];
    for (const [i, ps] of [...shown].sort((a, b) => Number(b[0] === picked) - Number(a[0] === picked) || b[1].length - a[1].length)) {
      const px = x(mp[i].lon);
      const py = y(mp[i].lat);
      const g = cluster && i !== picked ? out.find((o) => o.lead !== picked && Math.hypot(x(mp[o.lead].lon) - px, y(mp[o.lead].lat) - py) < 16 * unitPx) : undefined;
      if (g) {
        g.members.push(i);
        for (const p of ps) g.people.add(p.id);
      } else out.push({ lead: i, members: [i], people: new Set(ps.map((p) => p.id)) });
    }
    return out;
  }, [shown, cluster, unitPx, picked]); // eslint-disable-line react-hooks/exhaustive-deps
  const comeClose = (js: number[]) => {
    const xs = js.map((j) => x(mp[j].lon));
    const ys = js.map((j) => y(mp[j].lat));
    const bw = Math.max(Math.max(...xs) - Math.min(...xs), ((Math.max(...ys) - Math.min(...ys)) * width) / H);
    const vw = Math.min(view[2] / 2.5, Math.max(width / maxZoom, bw * 2.2));
    const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
    const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
    setView(clampView([cx - vw / 2, cy - (vw * H) / width / 2, vw]));
  };

  // a place picked among others close together (Vṛndāvana and its temples): the map
  // zooms in on the group; picked again, closer still
  useEffect(() => {
    if (!zoomReq) return;
    const p = mp[zoomReq.i];
    if (!p || !inBox(box, p.lat, p.lon)) return;
    const px = x(p.lon);
    const py = y(p.lat);
    const unit = view[2] / (screenW || width); // map units in a pixel of the screen
    const others = [...at.keys()].filter((j) => j !== zoomReq.i);
    const fit = (js: number[]) => {
      const xs = [px, ...js.map((j) => x(mp[j].lon))];
      const ys = [py, ...js.map((j) => y(mp[j].lat))];
      const bw = Math.max(...xs) - Math.min(...xs);
      const bh = Math.max(...ys) - Math.min(...ys);
      return { xs, ys, vw: Math.min(width, Math.max(width / maxZoom, Math.max(bw, (bh * width) / H) * 2.4)) };
    };
    // first the places around it, up to about 10 km (Navadvīpa and its islands, Vṛndāvana and its
    // temples), when the map shows much more than them; then those pressed against it
    const km = (j: number) => Math.hypot((mp[j].lat - p.lat) * 111, (mp[j].lon - p.lon) * 111 * Math.cos((p.lat * Math.PI) / 180));
    const around = others.filter((j) => km(j) < 10);
    let near = around.length && fit(around).vw < view[2] * 0.6 ? around : [];
    if (!near.length) near = others.filter((j) => Math.hypot(x(mp[j].lon) - px, y(mp[j].lat) - py) < 40 * unit);
    if (!near.length) return;
    const { xs, ys, vw } = fit(near);
    const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
    const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
    setView(clampView([cx - vw / 2, cy - (vw * H) / width / 2, vw]));
  }, [zoomReq?.n]); // eslint-disable-line react-hooks/exhaustive-deps

  // the satellite pictures of the piece in view: a coarse layer under the sharp one,
  // so that while these come there is already something
  // they follow the view once the wheel (or the drag) stops for a moment, not at
  // every step: each step asked for a new set and the map jerked
  const [tileView, setTileView] = useState(view);
  useEffect(() => {
    const id = window.setTimeout(() => setTileView(view), 140);
    return () => window.clearTimeout(id);
  }, [view]);
  // the piece in view, in degrees, for the list beside the map
  useEffect(() => {
    if (!onView) return;
    const [vx, vy, vw] = tileView;
    const vhh = (vw * H) / width;
    onView([n - ((vy + vhh) / H) * (n - s), n - (vy / H) * (n - s), w + (vx / width) * (e - w), w + ((vx + vw) / width) * (e - w)]);
  }, [tileView]); // eslint-disable-line react-hooks/exhaustive-deps
  // «Go to»: that piece fills the map
  useEffect(() => {
    if (!goto) return;
    const [gs, gn, gw, ge] = goto.box;
    const bw = Math.max(x(ge) - x(gw), ((y(gs) - y(gn)) * width) / H);
    const vw = Math.min(width, Math.max(width / maxZoom, bw));
    const cx = (x(gw) + x(ge)) / 2;
    const cy = (y(gn) + y(gs)) / 2;
    setView(clampView([cx - vw / 2, cy - (vw * H) / width / 2, vw]));
  }, [goto?.n]); // eslint-disable-line react-hooks/exhaustive-deps
  const tiles = useMemo(() => {
    if (!satellite) return [];
    const tv = tileView;
    const tvh = (tv[2] * H) / width;
    const lonL = w + (tv[0] / width) * (e - w);
    const lonR = w + ((tv[0] + tv[2]) / width) * (e - w);
    const latT = Math.min(84, n - (tv[1] / H) * (n - s));
    const latB = Math.max(-84, n - ((tv[1] + tvh) / H) * (n - s));
    const perDeg = (screenW * (window.devicePixelRatio || 1)) / (lonR - lonL);
    let level = Math.min(18, Math.max(3, Math.ceil(Math.log2((perDeg * 360) / 256))));
    while (level > 3 && tilesFor(latB, latT, lonL, lonR, level).length > 60) level--;
    const coarse = level - 2 >= 3 ? tilesFor(latB, latT, lonL, lonR, level - 2) : [];
    return [...coarse, ...tilesFor(latB, latT, lonL, lonR, level)];
  }, [satellite, tileView, screenW, box, width]); // eslint-disable-line react-hooks/exhaustive-deps
  // the pictures seen before stay under the new ones until these come: no holes
  // (and no flashing) while zooming
  const [layers, setLayers] = useState<{ under: Tile[]; over: Tile[] }>({ under: [], over: [] });
  useEffect(() => {
    setLayers((l) => {
      if (!tiles.length) return { under: [], over: [] };
      const now = new Set(tiles.map((t) => t.key));
      const under = [...l.under, ...l.over].filter((t, i, all) => !now.has(t.key) && all.findIndex((u) => u.key === t.key) === i);
      return { under: under.slice(-150), over: tiles };
    });
  }, [tiles]);
  return (
    <div className="map-frame-wrap">
      <svg
        ref={svgRef}
        viewBox={`${view[0]} ${view[1]} ${view[2]} ${vh}`}
        role="img"
        aria-label={t.panoramaTab.map}
        className={[z > 1 ? "zoomed" : "", satellite ? "satellite" : ""].join(" ").trim() || undefined}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onDoubleClick={(ev) => {
          const [px, py] = toMap(ev.clientX, ev.clientY);
          zoomAt(2, px, py);
        }}
      >
        <rect className="map-sea" x={minX} y={minY} width={maxX - minX} height={maxY - minY} />
        {satellite ? (
          [...layers.under, ...layers.over].map((tl) => (
            <image
              key={tl.key}
              href={tl.url}
              x={x(tl.w)}
              y={y(tl.n)}
              width={x(tl.e) - x(tl.w)}
              height={y(tl.s) - y(tl.n)}
              preserveAspectRatio="none"
              onLoad={() => onTile?.(true)}
              onError={() => onTile?.(false)}
            />
          ))
        ) : (
          <>
            <path className="map-land" d={background.land} />
            <path className="map-lake" d={background.lakes} />
          </>
        )}
        <path className="map-state" d={background.states} />
        <path className="map-border" d={background.borders} />
        {!satellite &&
          background.rivers.map((d, c) => (
          <path key={c} className={`map-river w${c}`} d={d} />
        ))}
        {!satellite && RIVER_NAMES.filter(([, la, lo]) => inBox(box, la, lo) || z > 1).map(([name, la, lo, a]) => (
          <text
            key={`${name}${la}`}
            className="map-river-name"
            x={x(lo)}
            y={y(la)}
            fontSize={12 / Math.sqrt(z)}
            textAnchor="middle"
            transform={`rotate(${a} ${x(lo)} ${y(la)})`}
          >
            {name}
          </text>
        ))}
        {regions.map(([name, la, lo]) => (
          <text key={name} className="map-region" x={x(lo)} y={y(la)} textAnchor="middle">
            {name}
          </text>
        ))}
        {arcs.length > 0 && (
          <g className="map-arcs">
            <defs>
              <marker id="map-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth={9 / z} markerHeight={9 / z} orient="auto" markerUnits="userSpaceOnUse">
                <path d="M0 0L10 5L0 10z" className="map-arrow" />
              </marker>
            </defs>
            {[...new Map(arcs.map((a) => [`${a.from}-${a.to}`, a])).values()].map((a) => {
              const [x1, y1, x2, y2] = [x(mp[a.from].lon), y(mp[a.from].lat), x(mp[a.to].lon), y(mp[a.to].lat)];
              // a curve bowed to one side, so that lines there and back do not cover each other
              const [mx, my] = [(x1 + x2) / 2 - (y2 - y1) * 0.18, (y1 + y2) / 2 + (x2 - x1) * 0.18];
              return (
                <path
                  key={`${a.from}-${a.to}`}
                  className={`map-arc g${Math.min(a.gen, 5)}`}
                  d={`M${x1} ${y1}Q${mx} ${my} ${x2} ${y2}`}
                  markerEnd="url(#map-arrow)"
                />
              );
            })}
          </g>
        )}
        {route && (
          <g className="map-route">
            <defs>
              <marker id="route-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth={10 / z} markerHeight={10 / z} orient="auto" markerUnits="userSpaceOnUse">
                <path d="M0 0L10 5L0 10z" className="route-arrow" />
              </marker>
            </defs>
            {route.legs
              .filter((l) => l.b <= route.upTo)
              .map((l) => {
                const [p, q] = [route.pts[l.a], route.pts[l.b]];
                // stop the arrow at the edge of the stage's dot
                const [x1, y1, x2, y2] = [x(p.lon), y(p.lat), x(q.lon), y(q.lat)];
                const len = Math.hypot(x2 - x1, y2 - y1) || 1;
                const back = Math.min(len / 2, 9 / z);
                return (
                  <line
                    key={`${l.a}-${l.b}`}
                    className={`route-leg${l.dashed ? " dashed" : ""}`}
                    x1={x1}
                    y1={y1}
                    x2={x2 - ((x2 - x1) / len) * back}
                    y2={y2 - ((y2 - y1) / len) * back}
                    markerEnd="url(#route-arrow)"
                  />
                );
              })}
            {route.pts.map((p, k) => {
              if (k > route.upTo) return null;
              // a place the journey comes back to (Navadvīpa in Gayā, Purī…): one point, «1·4»
              const same = route.pts.flatMap((q, j) => (j <= route.upTo && q.lat === p.lat && q.lon === p.lon ? [j] : []));
              const drawn = route.current !== null && same.includes(route.current) ? route.current : same[same.length - 1];
              if (k !== drawn) return null;
              const num = same.map((j) => j + 1).join("·");
              return (
                <g key={k} className={`route-stage${route.current === k ? " on" : ""}`} onClick={() => !drag.current?.moved && route.onStage(k)}>
                  <circle cx={x(p.lon)} cy={y(p.lat)} r={((route.current === k ? 10 : 8) + 2.6 * (num.length - 1)) / z} />
                  <text x={x(p.lon)} y={y(p.lat) + 3.5 / z} textAnchor="middle" fontSize={9 / z}>
                    {num}
                  </text>
                  {(route.current === k || z >= 2) && (
                    <text className="route-label" x={x(p.lon) + 12 / z} y={y(p.lat) + 4 / z} fontSize={13 / z} strokeWidth={4 / z}>
                      {p.label}
                    </text>
                  )}
                  <title>{`${num}. ${p.label}`}</title>
                </g>
              );
            })}
          </g>
        )}
        {frames.map((frame) => (
          <rect key={frame.join()} className="map-frame" x={x(frame[2])} y={y(frame[1])} width={x(frame[3]) - x(frame[2])} height={y(frame[0]) - y(frame[1])} rx={6} />
        ))}
        {groups.map(({ lead: i, members, people }) => {
          const { name, lat: la, lon: lo } = mp[i];
          if (members.length > 1) {
            const rr = r(people.size);
            return (
              <g
                key={`c${i}`}
                className="map-place cluster"
                onClick={() => !drag.current?.moved && comeClose(members)}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                <circle cx={x(lo)} cy={y(la)} r={rr + 6 / z} className="map-hit" />
                <circle cx={x(lo)} cy={y(la)} r={rr} className="map-dot" />
                <text x={x(lo)} y={y(la) + 4 / z} textAnchor="middle" className="map-count" fontSize={11 / z}>
                  {members.length}
                </text>
                {(labels(i, people.size) || z >= 2.5 || hover === i) && (
                  <text
                    x={right(lo) ? x(lo) - rr - 4 / z : x(lo) + rr + 4 / z}
                    y={y(la) + 4 / z}
                    textAnchor={right(lo) ? "end" : "start"}
                    className="map-label"
                    fontSize={13 / z}
                    strokeWidth={4 / z}
                  >
                    {name} +{members.length - 1} · {people.size}
                  </text>
                )}
                <title>{t.mapClusterHint(members.length)}</title>
              </g>
            );
          }
          const ps = at.get(i) ?? [];
          const rr = r(ps.length);
          return (
            <g
              key={i}
              className={`map-place${picked === i ? " on" : ""}${mp[i].district ? " district" : ""}`}
              onClick={() => pick(i)}
              onDoubleClick={(ev) => {
                ev.stopPropagation();
                onShow?.(i);
              }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <circle cx={x(lo)} cy={y(la)} r={rr + 6 / z} className="map-hit" />
              <circle cx={x(lo)} cy={y(la)} r={rr} className="map-dot" />
              {(labels(i, ps.length) || z >= 2.5 || hover === i || picked === i) && (
                <text
                  x={right(lo) ? x(lo) - rr - 4 / z : x(lo) + rr + 4 / z}
                  y={y(la) + 4 / z}
                  textAnchor={right(lo) ? "end" : "start"}
                  className="map-label"
                  fontSize={13 / z}
                  strokeWidth={4 / z}
                >
                  {name} · {ps.length}
                </text>
              )}
              <title>{`${name}: ${ps.length}`}</title>
            </g>
          );
        })}
      </svg>
      <div className="map-zoom">
        <button className="icon-btn" title={t.mapZoomIn} onClick={() => zoomAt(1.6)} disabled={z >= maxZoom}>
          <Plus size={15} />
        </button>
        <button className="icon-btn" title={t.mapZoomOut} onClick={() => zoomAt(1 / 1.6)} disabled={z <= 1}>
          <Minus size={15} />
        </button>
        <button className="icon-btn" title={t.mapZoomReset} onClick={() => setView([0, 0, width])} disabled={z <= 1}>
          <Maximize size={14} />
        </button>
      </div>
      {satellite && <div className="map-credit">{t.mapSatelliteCredit}</div>}
    </div>
  );
}

/** The ages of the map (12-11-2026, «the time over the map»): [first year, last year]. */
const ERAS: [number, number][] = [
  [-3000, 1479], // before Mahāprabhu
  [1480, 1540], // Mahāprabhu and His associates
  [1520, 1600], // the Gosvāmīs of Vraja
  [1580, 1660], // Narottama, Śrīnivāsa, Śyāmānanda
  [1650, 1800], // 17th–18th centuries
  [1800, 1900], // the bābājīs of the 19th century
  [1900, 2100], // 20th century
];

/** The years each record lived: its own dates, or else guessed from its gurus in the tree
 *  (about 25 years a generation): [from, to, guessed]. */
function lifeYears(list: OverviewPerson[], persons: PersonListItem[]) {
  const own = new Map<number, [number, number]>();
  for (const p of list) {
    if (p.born != null) own.set(p.id, [p.born, p.died ?? p.born + 70]);
    else if (p.died != null) own.set(p.id, [p.died - 70, p.died]);
  }
  // an associate is of the same generation as the one he is placed under; a disciple, about 25 years later
  const up = new Map(persons.map((p) => [p.id, p.tree ? { parent: p.tree.parent, step: p.tree.kind === "associate" ? 0 : 25 } : null]));
  const out = new Map<number, [number, number, boolean]>();
  for (const p of list) {
    const o = own.get(p.id);
    if (o) {
      out.set(p.id, [o[0], o[1], false]);
      continue;
    }
    let shift = 0;
    let cur = up.get(p.id);
    for (let k = 1; cur && cur.parent != null && k <= 6; k++) {
      shift += cur.step;
      const a = own.get(cur.parent);
      if (a) {
        out.set(p.id, [a[0] + shift, a[0] + shift + 60, true]);
        break;
      }
      cur = up.get(cur.parent);
    }
  }
  return out;
}

function PlacesMap({
  t,
  lang,
  list: all,
  persons,
  onPerson,
  places,
  onPlace,
  focus,
  journeyFocus,
}: {
  t: T;
  lang: Lang;
  list: OverviewPerson[];
  persons: PersonListItem[];
  onPerson: (id: number) => void;
  places: Place[];
  onPlace: (id: number) => void;
  focus?: { id: number; n: number };
  journeyFocus?: { id: string; n: number };
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const mp = useMemo(() => mapPlaces(places), [places]);
  // the time over the map: one age, or all of them; «play» goes through them one by one
  const [era, setEra] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setEra((e) => (e === null || e >= ERAS.length - 1 ? 0 : e + 1)), 2600);
    return () => window.clearInterval(id);
  }, [playing]);
  const years = useMemo(() => lifeYears(all, persons), [all, persons]);
  // «Follow a line» (12-11-2026): a guru's line over the map, from the guru's place to each disciple's
  const [lineRoot, setLineRoot] = useState<number | null>(null);
  const [gens, setGens] = useState(3);
  const [lineText, setLineText] = useState("");
  const byId = useMemo(() => new Map(all.map((p) => [p.id, p])), [all]);
  const kids = useMemo(() => {
    const m = new Map<number, number[]>();
    const add = (g: number, d: number) => m.set(g, [...(m.get(g) ?? []), d]);
    for (const p of persons) {
      if (p.tree?.parent != null) add(p.tree.parent, p.id);
      for (const l of p.links) add(l.guru, p.id);
    }
    return m;
  }, [persons]);
  const line = useMemo(() => {
    if (lineRoot === null) return null;
    const placeOf = (id: number) => {
      const p = byId.get(id);
      const ps = p ? placesOf(p, mp) : [];
      return ps.length ? ps[0] : null;
    };
    const arcs: { from: number; to: number; gen: number }[] = [];
    const rows: { id: number; gen: number; place: number | null }[] = [];
    const root = persons.find((p) => p.id === lineRoot);
    const rp = placeOf(lineRoot);
    // above: its gurus (its place in the tree and its other lines)
    const ups = [root?.tree?.parent, ...(root?.links ?? []).map((l) => l.guru)].filter((g): g is number => g != null);
    for (const g of new Set(ups)) {
      const gp = placeOf(g);
      rows.push({ id: g, gen: -1, place: gp });
      if (gp !== null && rp !== null && gp !== rp) arcs.push({ from: gp, to: rp, gen: 0 });
    }
    rows.push({ id: lineRoot, gen: 0, place: rp });
    // below, generation by generation; one without a place passes the line on from the last place
    let frontier = [{ id: lineRoot, src: rp }];
    const seen = new Set([lineRoot]);
    for (let g = 1; g <= gens; g++) {
      const next: { id: number; src: number | null }[] = [];
      for (const f of frontier)
        for (const d of kids.get(f.id) ?? []) {
          if (seen.has(d)) continue;
          seen.add(d);
          const dp = placeOf(d);
          rows.push({ id: d, gen: g, place: dp });
          if (dp !== null && f.src !== null && dp !== f.src) arcs.push({ from: f.src, to: dp, gen: g });
          next.push({ id: d, src: dp ?? f.src });
        }
      frontier = next;
    }
    return { arcs, rows, ids: new Set(rows.map((r) => r.id)) };
  }, [lineRoot, gens, byId, kids, persons, mp]);
  const treeNames = useMemo(() => persons.filter((p) => p.tree).map((p) => p.name).sort((a, b) => a.localeCompare(b)), [persons]);
  const followLine = (id: number | null) => {
    if (id !== null) setJourney(null);
    setLineRoot(id);
    setLineText(id === null ? "" : (persons.find((p) => p.id === id)?.name ?? ""));
    setPicked(null);
    setPlaying(false);
  };
  // the journeys (journeys.ts): one chosen, the stage in view, and «walk it» stage by stage
  const [journey, setJourney] = useState<string | null>(null);
  const [stage, setStage] = useState<number | null>(null);
  const [upTo, setUpTo] = useState(999);
  const [walking, setWalking] = useState(false);
  const J = JOURNEYS.find((j) => j.id === journey) ?? null;
  useEffect(() => {
    if (!walking || !J) return;
    const id = window.setTimeout(() => {
      if (upTo >= J.stages.length - 1) return setWalking(false);
      setUpTo(upTo + 1);
      setStage(upTo + 1);
    }, 1800);
    return () => window.clearTimeout(id);
  }, [walking, upTo, J]);
  const openJourney = (id: string | null) => {
    setJourney(id);
    setStage(null);
    setUpTo(999);
    setWalking(false);
    if (id) {
      followLine(null);
      setEra(null);
    }
  };
  useEffect(() => {
    if (journeyFocus) openJourney(journeyFocus.id);
  }, [journeyFocus?.n]); // eslint-disable-line react-hooks/exhaustive-deps
  const route = useMemo(
    () =>
      J && {
        pts: J.stages.map((s) => ({ lat: s.lat, lon: s.lon, label: s.name })),
        legs: J.stages.slice(1).map((s, k) => ({ a: s.from ?? k, b: k + 1, dashed: !!s.untold })),
      },
    [J],
  );
  const list = useMemo(() => {
    if (J) return [];
    if (line) return all.filter((p) => line.ids.has(p.id));
    if (era === null) return all;
    const [a, b] = ERAS[era];
    return all.filter((p) => {
      // the years of their work: from about twenty to the end of their life
      const y = years.get(p.id);
      return !!y && Math.min(y[0] + 20, y[1]) <= b && y[1] >= a;
    });
  }, [all, era, years, line, J]);
  const guessed = list.filter((p) => years.get(p.id)?.[2]).length;
  const undated = all.filter((p) => p.hasPlace && !years.has(p.id)).length;
  // drawing or satellite (remembered on this computer)
  const [style, setStyleState] = useState<"draw" | "sat">(() => {
    try {
      return localStorage.getItem("bio.mapStyle") === "sat" ? "sat" : "draw";
    } catch {
      return "draw";
    }
  });
  const setStyle = (v: "draw" | "sat") => {
    setStyleState(v);
    setTiles({ ok: 0, bad: 0 });
    try {
      localStorage.setItem("bio.mapStyle", v);
    } catch {
      /* storage unavailable */
    }
  };
  // without internet the pictures do not come: the drawing is shown again
  const [tiles, setTiles] = useState({ ok: 0, bad: 0 });
  const offline = style === "sat" && tiles.ok === 0 && tiles.bad >= 3;
  const onTile = (ok: boolean) => setTiles((c) => (ok ? { ...c, ok: c.ok + 1 } : { ...c, bad: c.bad + 1 }));
  const at = useMemo(() => {
    const by = new Map<number, OverviewPerson[]>();
    for (const p of list) for (const i of placesOf(p, mp)) by.set(i, [...(by.get(i) ?? []), p]);
    // a saved place is on the map even with nobody yet (not while a line or an age is shown)
    if (list === all) mp.forEach((m, i) => m.placeId !== null && !by.has(i) && by.set(i, []));
    return by;
  }, [list, mp, all]);
  // opened from a place: that one chosen
  useEffect(() => {
    if (!focus) return;
    const i = mp.findIndex((m) => m.placeId === focus.id);
    if (i >= 0) {
      setPicked(i);
      setZoomReq({ i, n: focus.n });
    }
  }, [focus?.n, mp]); // eslint-disable-line react-hooks/exhaustive-deps
  const withPlace = list.filter((p) => p.hasPlace).length;
  const located = new Set([...at.values()].flat().map((p) => p.id)).size;
  // the size of the dots is the same whatever the age: the ages can be compared
  const most = useMemo(() => {
    const c = new Map<number, number>();
    for (const p of all) for (const i of placesOf(p, mp)) c.set(i, (c.get(i) ?? 0) + 1);
    return Math.max(1, ...c.values());
  }, [all, mp]);
  const sorted = [...at].sort((a, b) => b[1].length - a[1].length);
  const far = sorted.filter(([i]) => !inBox(INDIA, mp[i].lat, mp[i].lon));
  const pick = (i: number) => setPicked(picked === i ? null : i);
  // a dot clicked on the map: the page goes down just enough to show its people
  const shownRef = useRef<HTMLElement>(null);
  const fromMap = useRef(false);
  const [zoomReq, setZoomReq] = useState<{ i: number; n: number } | undefined>();
  const pickOnMap = (i: number) => {
    // a click on the chosen one, among others close by, comes closer instead of letting it go
    setZoomReq({ i, n: Date.now() });
    setPicked(i);
  };
  const showOnMap = (i: number) => {
    fromMap.current = true;
    setPicked(i);
    window.setTimeout(() => shownRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 30);
  };
  useEffect(() => {
    if (!fromMap.current || picked === null) return;
    fromMap.current = false;
    window.setTimeout(() => shownRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 30);
  }, [picked]);
  // away from Bengal the places are few but close together (Vraja): the biggest one of each
  // cluster of about a degree carries its name
  const bigOutside: number[] = [];
  for (const [i] of sorted) {
    const { lat: la, lon: lo } = mp[i];
    if (inBox(BENGAL, la, lo)) continue;
    if (!bigOutside.some((j) => Math.abs(mp[j].lat - la) < 1 && Math.abs(mp[j].lon - lo) < 1.2)) bigOutside.push(i);
  }
  // in Bengal too, one name for each knot of places a few kilometres apart
  const bigBengal: number[] = [];
  for (const [i] of sorted) {
    const { lat: la, lon: lo } = mp[i];
    if (!inBox(BENGAL, la, lo)) continue;
    if (!bigBengal.some((j) => Math.abs(mp[j].lat - la) < 0.2 && Math.abs(mp[j].lon - lo) < 0.45)) bigBengal.push(i);
  }
  // in Vraja, one name for each knot of places a kilometre or two apart
  const bigVraja: number[] = [];
  for (const [i] of sorted) {
    const { lat: la, lon: lo } = mp[i];
    if (!inBox(VRAJA, la, lo)) continue;
    if (!bigVraja.some((j) => Math.abs(mp[j].lat - la) < 0.012 && Math.abs(mp[j].lon - lo) < 0.02)) bigVraja.push(i);
  }
  const common = { t, mp, at, most, picked, onPick: pickOnMap, satellite: style === "sat" && !offline, onTile, zoomReq, onShow: showOnMap };
  // one big map (12-11-2026, Whisper: the three small ones were cramped): the piece in view, and «Go to»
  const [inView, setInView] = useState<Box>(NORTH);
  const [goto, setGoto] = useState<{ box: Box; n: number } | undefined>({ box: NORTH, n: 0 });
  const jumps: [string, Box][] = [
    [t.mapGoIndia, INDIA],
    [t.mapGoNorth, NORTH],
    [t.mapGoBengal, BENGAL],
    [t.mapGoNavadvipa, [23.33, 23.52, 88.28, 88.46]],
    [t.mapGoVraja, VRAJA],
    [t.mapGoPuri, [19.77, 19.84, 85.79, 85.87]],
  ];
  const visible = sorted.filter(([i]) => inBox(inView, mp[i].lat, mp[i].lon));
  // a journey chosen: the map shows it all; a stage chosen: the map comes close to it
  useEffect(() => {
    if (!J) return;
    const la = J.stages.map((s) => s.lat);
    const lo = J.stages.map((s) => s.lon);
    setGoto({ box: [Math.min(...la) - 0.6, Math.max(...la) + 0.6, Math.min(...lo) - 0.6, Math.max(...lo) + 0.6], n: Date.now() });
  }, [J]); // eslint-disable-line react-hooks/exhaustive-deps
  const toStage = (k: number) => {
    if (!J) return;
    const s = J.stages[k];
    setStage(k);
    setUpTo((u) => Math.max(u, k));
    setGoto({ box: [s.lat - 1.2, s.lat + 1.2, s.lon - 1.6, s.lon + 1.6], n: Date.now() });
  };
  // a line chosen: the map shows all its places
  useEffect(() => {
    if (!line) return;
    const ps = line.rows.map((r) => r.place).filter((i): i is number => i !== null && inBox(INDIA, mp[i].lat, mp[i].lon));
    if (!ps.length) return;
    const la = ps.map((i) => mp[i].lat);
    const lo = ps.map((i) => mp[i].lon);
    const pad = 0.15;
    setGoto({ box: [Math.min(...la) - pad, Math.max(...la) + pad, Math.min(...lo) - pad, Math.max(...lo) + pad], n: Date.now() });
  }, [line]); // eslint-disable-line react-hooks/exhaustive-deps
  const listPick = (i: number) => {
    setPicked(i);
    setZoomReq({ i, n: Date.now() });
  };

  return (
    <>
      {!J && <p className="muted small">{t.mapHint(withPlace.toLocaleString(lang), located.toLocaleString(lang))}</p>}
      <div className="map-style">
        <div className="seg small" data-n={2} data-on={style === "sat" ? 1 : 0}>
          <span className="seg-ink" />
          <button className={style === "draw" ? "on" : ""} onClick={() => setStyle("draw")}>
            {t.mapDrawing}
          </button>
          <button className={style === "sat" ? "on" : ""} onClick={() => setStyle("sat")} title={t.mapSatelliteHint}>
            {t.mapSatellite}
          </button>
        </div>
        {offline && <span className="muted small">{t.mapOffline}</span>}
        <span className="map-go">
          <span className="muted small">{t.mapGo}</span>
          {jumps.map(([label, box]) => (
            <button key={label} className="btn ghost small" onClick={() => setGoto({ box, n: Date.now() })}>
              {label}
            </button>
          ))}
        </span>
      </div>
      <div className="map-eras">
        <span className="muted small">{t.mapEra}</span>
        <button className={`btn ghost small${era === null ? " on" : ""}`} onClick={() => (setPlaying(false), setEra(null), setJourney(null))}>
          {t.mapEraAll}
        </button>
        {t.mapEras.map((label, k) => (
          <button key={k} className={`btn ghost small${era === k ? " on" : ""}`} onClick={() => (setPlaying(false), setEra(k), setJourney(null))} title={`${ERAS[k][0] < 0 ? "…" : ERAS[k][0]}–${ERAS[k][1] > 2026 ? "" : ERAS[k][1]}`}>
            {label}
          </button>
        ))}
        <button className="btn small" onClick={() => (setJourney(null), setPlaying((v) => !v))}>
          {playing ? `■ ${t.mapStop}` : `▶ ${t.mapPlay}`}
        </button>
      </div>
      <div className="map-eras">
        <span className="muted small">{t.mapLine}</span>
        <input
          className="map-line-input"
          list="map-line-names"
          placeholder={t.mapLinePlaceholder}
          value={lineText}
          onChange={(ev) => {
            setLineText(ev.target.value);
            const p = persons.find((x) => x.tree && x.name === ev.target.value);
            if (p) followLine(p.id);
          }}
        />
        <datalist id="map-line-names">
          {treeNames.map((nm) => (
            <option key={nm} value={nm} />
          ))}
        </datalist>
        <select value={gens} onChange={(ev) => setGens(Number(ev.target.value))} title={t.mapLineGensHint}>
          {[1, 2, 3, 4, 5].map((g) => (
            <option key={g} value={g}>
              {t.mapLineGens(g)}
            </option>
          ))}
        </select>
        {lineRoot !== null && (
          <button className="btn ghost small" onClick={() => followLine(null)}>
            ✕ {t.mapLineClear}
          </button>
        )}
      </div>
      <div className="map-eras">
        <span className="muted small">{t.mapJourneys}</span>
        {/* a list grouped by person (14 journeys made a wall of buttons) */}
        <select className="journey-pick" value={journey ?? ""} onChange={(e) => openJourney(e.target.value || null)}>
          <option value="">{t.mapJourneyPick}</option>
          {[...new Set(JOURNEYS.map((j) => j.person))].map((pid) => (
            <optgroup key={pid} label={persons.find((p) => p.id === pid)?.name ?? `#${pid}`}>
              {JOURNEYS.filter((j) => j.person === pid).map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title[lang === "en" ? "en" : "es"]} · {j.when}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {J && (
          <>
            <button
              className="btn small"
              onClick={() => {
                if (walking) return setWalking(false);
                setUpTo(0);
                setStage(0);
                setWalking(true);
              }}
            >
              {walking ? `■ ${t.mapStop}` : `▶ ${t.mapWalk}`}
            </button>
            <button className="btn ghost small" onClick={() => openJourney(null)}>
              ✕ {t.mapJourneyClose}
            </button>
          </>
        )}
      </div>
      {line ? (
        <p className="muted small map-era-note">{t.mapLineNote(line.rows.length, line.rows.filter((r) => r.place !== null).length)}</p>
      ) : (
        era !== null && <p className="muted small map-era-note">{t.mapEraNote(list.length, guessed, undated)}</p>
      )}
      <div className="pano-onemap">
        <div className="pano-map big">
          <MapSvg
            {...common}
            box={INDIA}
            width={900}
            cluster={!line}
            arcs={line?.arcs}
            route={route ? { ...route, upTo, current: stage, onStage: toStage } : undefined}
            goto={goto}
            onView={setInView}
            labels={(i) => (inBox(BENGAL, mp[i].lat, mp[i].lon) ? bigBengal.includes(i) : inBox(VRAJA, mp[i].lat, mp[i].lon) ? bigVraja.includes(i) : bigOutside.includes(i))}
            regions={[
              [t.regionVraja, 29.6, 77.6],
              [t.regionOrissa, 20.4, 84.4],
              [t.regionBengal, 25.6, 89.6],
            ]}
          />
        </div>
        <aside className="map-side">
          {J ? (
            <section className="map-journey">
              <h3>{J.title[lang === "en" ? "en" : "es"]}</h3>
              <p className="muted small">
                {J.when} ·{" "}
                <button className="name-link" onClick={() => onPerson(J.person)}>
                  {persons.find((p) => p.id === J.person)?.name}
                </button>
              </p>
              <p className="muted small">{t.mapJourneyHint}</p>
              <ol className="map-stages">
                {J.stages.map((s, k) => (
                  <li key={k} className={stage === k ? "on" : k > upTo ? "later" : ""}>
                    <button className="link-like" onClick={() => toStage(k)}>
                      {s.name}
                    </button>
                    {s.untold && <span className="muted small"> · {t.mapJourneyUntold}</span>}
                    {s.note && <div className="small">{s.note}</div>}
                    <div className="muted small">{s.source}</div>
                  </li>
                ))}
              </ol>
            </section>
          ) : line && picked === null ? (
            <section className="map-line-list">
              <h3>{t.mapLineTitle(persons.find((p) => p.id === lineRoot)?.name ?? "")}</h3>
              {[-1, ...Array.from({ length: gens + 1 }, (_, k) => k)].map((g) => {
                const rows = line.rows.filter((r) => r.gen === g);
                if (!rows.length) return null;
                return (
                  <div key={g} className="map-line-gen">
                    <div className="muted small">{g === -1 ? t.mapLineAbove : g === 0 ? "" : t.mapLineGen(g)}</div>
                    {rows.map((r) => (
                      <div key={r.id} className={`map-line-row${r.place === null ? " noplace" : ""}`}>
                        <button className="name-link" onClick={() => onPerson(r.id)}>
                          {persons.find((p) => p.id === r.id)?.name ?? r.id}
                        </button>
                        {r.place !== null ? (
                          <button className="link-like muted small" onClick={() => listPick(r.place!)}>
                            {mp[r.place].name}
                          </button>
                        ) : (
                          <span className="muted small">{t.mapLineNoPlace}</span>
                        )}
                        {r.id !== lineRoot && (kids.get(r.id)?.length ?? 0) > 0 && (
                          <button className="icon-btn small" title={t.mapLineFollow} onClick={() => followLine(r.id)}>
                            ↳
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </section>
          ) : picked !== null && at.get(picked) ? (
            <section ref={shownRef} className="map-picked">
              <button className="btn ghost small" onClick={() => setPicked(null)}>
                ← {t.mapBack}
              </button>
              <h2>
                {mp[picked].name} <span className="count">{at.get(picked)!.length}</span>
              </h2>
              {mp[picked].placeId !== null && (
                <button className="btn ghost small map-open-place" onClick={() => onPlace(mp[picked].placeId!)}>
                  <MapPin size={13} /> {t.placeOpen}
                </button>
              )}
              <Names t={t} people={at.get(picked)!} onPerson={onPerson} />
            </section>
          ) : (
            <>
              <h3>{t.mapInView(visible.length.toLocaleString(lang))}</h3>
              <p className="muted small">{t.mapInViewHint}</p>
              <p className="muted small map-legend">
                <i className="legend-dot" /> {t.mapLegendPlace} · <i className="legend-dot district" /> {t.mapLegendDistrict}
              </p>
              <div className="map-side-list">
                {visible.map(([i, ps]) => (
                  <button key={i} className={`map-side-row${mp[i].district ? " district" : ""}`} onClick={() => listPick(i)}>
                    <span className="map-side-name">{mp[i].name}</span>
                    <span className="map-side-bar">
                      <i style={{ width: `${(100 * ps.length) / most}%` }} />
                    </span>
                    <span className="count">{ps.length.toLocaleString(lang)}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </aside>
      </div>
      {far.length > 0 && (
        <p className="muted small">
          {t.mapFar}:{" "}
          {far.map(([i, ps], n) => (
            <span key={i}>
              {n > 0 && " · "}
              <button className="name-link" onClick={() => pick(i)}>
                {mp[i].name} ({ps.length})
              </button>
            </span>
          ))}
        </p>
      )}
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
