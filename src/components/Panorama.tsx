import { useEffect, useMemo, useRef, useState } from "react";
import { BarChart3, ChevronRight, MapPin, Maximize, Minus, Plus } from "lucide-react";
import { api, OverviewPerson, PersonListItem, Place, sortDisciples, Status as LibraryStatus } from "../api";
import { StatTiles } from "./Home";
import { namesPlace, placeKeys, textKeys } from "../places";
import { Lang, T } from "../i18n";
import { foldName } from "./Sidebar";
import { BORDERS, LAKES, LAND, RIVERS, STATES } from "./mapData";

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
            <PlacesMap t={t} lang={lang} list={list} onPerson={onPerson} places={places} onPlace={onPlace} focus={focus} />
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
const SAT_URL = (z: number, x: number, y: number) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
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
}: {
  t: T;
  mp: MapPlace[];
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
  const [minX, minY, maxX, maxY] = [x(72.5), y(32), x(95), y(16.5)];
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
  const tiles = useMemo(() => {
    if (!satellite) return [];
    const lonL = w + (view[0] / width) * (e - w);
    const lonR = w + ((view[0] + view[2]) / width) * (e - w);
    const latT = Math.min(84, n - (view[1] / H) * (n - s));
    const latB = Math.max(-84, n - ((view[1] + vh) / H) * (n - s));
    const perDeg = (screenW * (window.devicePixelRatio || 1)) / (lonR - lonL);
    let level = Math.min(18, Math.max(3, Math.ceil(Math.log2((perDeg * 360) / 256))));
    while (level > 3 && tilesFor(latB, latT, lonL, lonR, level).length > 60) level--;
    const coarse = level - 2 >= 3 ? tilesFor(latB, latT, lonL, lonR, level - 2) : [];
    return [...coarse, ...tilesFor(latB, latT, lonL, lonR, level)];
  }, [satellite, view, screenW, box, width]); // eslint-disable-line react-hooks/exhaustive-deps
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
          tiles.map((tl) => (
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
        {frames.map((frame) => (
          <rect key={frame.join()} className="map-frame" x={x(frame[2])} y={y(frame[1])} width={x(frame[3]) - x(frame[2])} height={y(frame[0]) - y(frame[1])} rx={6} />
        ))}
        {shown.map(([i, ps]) => {
          const { name, lat: la, lon: lo } = mp[i];
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

function PlacesMap({
  t,
  lang,
  list,
  onPerson,
  places,
  onPlace,
  focus,
}: {
  t: T;
  lang: Lang;
  list: OverviewPerson[];
  onPerson: (id: number) => void;
  places: Place[];
  onPlace: (id: number) => void;
  focus?: { id: number; n: number };
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const mp = useMemo(() => mapPlaces(places), [places]);
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
    // a saved place is on the map even with nobody yet
    mp.forEach((m, i) => m.placeId !== null && !by.has(i) && by.set(i, []));
    return by;
  }, [list, mp]);
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
  const most = Math.max(1, ...[...at.values()].map((ps) => ps.length));
  const sorted = [...at].sort((a, b) => b[1].length - a[1].length);
  const far = sorted.filter(([i]) => !inBox(NORTH, mp[i].lat, mp[i].lon));
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

  return (
    <>
      <p className="muted small">{t.mapHint(withPlace.toLocaleString(lang), located.toLocaleString(lang))}</p>
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
        <span className="muted small map-legend">
          <i className="legend-dot" /> {t.mapLegendPlace} <i className="legend-dot district" /> {t.mapLegendDistrict}
        </span>
      </div>
      <div className="pano-maps">
        <div className="pano-map">
          <MapSvg
            {...common}
            box={NORTH}
            width={620}
            frames={[BENGAL, VRAJA]}
            labels={(i) => !inBox(BENGAL, mp[i].lat, mp[i].lon) && bigOutside.includes(i)}
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
        <div className="pano-map">
          <div className="map-title">{t.mapVraja}</div>
          <MapSvg {...common} box={VRAJA} width={620} labels={(i) => bigVraja.includes(i)} regions={[[t.regionVraja, 27.74, 77.7]]} />
        </div>
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
      {picked !== null && at.get(picked) && (
        <section ref={shownRef} className="map-picked">
          <h2>
            {mp[picked].name} <span className="count">{at.get(picked)!.length}</span>
            {mp[picked].placeId !== null && (
              <button className="btn ghost small map-open-place" onClick={() => onPlace(mp[picked].placeId!)}>
                <MapPin size={13} /> {t.placeOpen}
              </button>
            )}
          </h2>
          <Names t={t} people={at.get(picked)!} onPerson={onPerson} />
        </section>
      )}
      <h2>{t.mapListTitle}</h2>
      <div className="pano-bars">
        {sorted.map(([i, ps]) => (
          <BarRow
            key={i}
            label={mp[i].name}
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
