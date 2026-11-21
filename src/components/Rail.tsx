import { useState } from "react";
import { Archive, BarChart3, BookCopy, CalendarDays, ChevronDown, Clock3, Film, Flower2, GitFork, Headphones, History, Home, MapPin, Mic, Network, Quote, Search, Settings as Gear, Star, Trees, Users } from "lucide-react";
import { T } from "../i18n";
import type { SideTab } from "./Sidebar";
import { APP_NAME, LogoMark } from "./Logo";

export type RailView = "home" | "calendar" | "tree" | "timeline" | "lineage" | "panorama" | "vamsa" | "anthology" | "katha" | "audios" | "videos" | "verses";

interface Props {
  t: T;
  /** only icons (narrow window) */
  compact: boolean;
  view: string;
  sideTab: SideTab;
  sideOpen: boolean;
  onView: (v: RailView) => void;
  /** the open panel again closes it */
  onSide: (tab: SideTab) => void;
  /** where each button goes (Ajustes › Barra de botones) */
  layout: RailLayout;
}

/** The bar in five zones, each with its title (Whisper, 21-11-2026 — «the app is a bit all over the place»): who
 *  (Vaiṣṇavas), where (Dhāma), when (Time), what they said (Hari-kathā) and the books (Library). No menus that open:
 *  every button in sight. A zone's title folds it. Each button can go to another zone or be hidden, and the order
 *  inside a zone changed (Ajustes › General › «Botones de la barra»). */
export const RAIL_ZONES = ["people", "dhama", "time", "katha", "library"] as const;
export type RailZone = (typeof RAIL_ZONES)[number];
export type RailPlace = RailZone | "hidden";
export type RailLayout = { order: string[]; place: Record<string, RailPlace> };
export const RAIL_DEFAULT: RailLayout = {
  // Linaje before the Paramparā Tree: it is the one used most (Whisper); the History is never used → hidden
  order: ["persons", "lineage", "tree", "vamsa", "places", "deities", "calendar", "timeline", "panorama", "katha", "lectures", "anthology", "audios", "videos", "library", "verses", "bookmarks", "history"],
  place: {
    persons: "people", lineage: "people", tree: "people", vamsa: "people",
    places: "dhama", deities: "dhama",
    calendar: "time", timeline: "time", panorama: "time",
    katha: "katha", lectures: "katha", anthology: "katha", audios: "katha", videos: "katha",
    library: "library", verses: "library", bookmarks: "library", history: "hidden",
  },
};
/** a saved layout with the buttons added later in their default place (and unknown ones dropped) */
export function railLayout(saved: Partial<RailLayout> | null | undefined): RailLayout {
  const known = new Set(RAIL_DEFAULT.order);
  const order = (saved?.order ?? []).filter((k, i, a) => known.has(k) && a.indexOf(k) === i);
  RAIL_DEFAULT.order.forEach((k, i) => {
    if (order.includes(k)) return;
    // after the default neighbour before it
    const prev = RAIL_DEFAULT.order.slice(0, i).reverse().find((p) => order.includes(p));
    order.splice(prev ? order.indexOf(prev) + 1 : 0, 0, k);
  });
  const ok = new Set<string>([...RAIL_ZONES, "hidden"]);
  const place: Record<string, RailPlace> = {};
  for (const k of order) {
    const p = saved?.place?.[k];
    place[k] = p && ok.has(p) ? p : RAIL_DEFAULT.place[k];
  }
  return { order, place };
}
type Entry = { icon: typeof Gear; label: string; view?: RailView; side?: SideTab };
/** every button of the bar: its icon, its name and what it opens */
export function railEntries(t: T): Record<string, Entry> {
  return {
    persons: { icon: Users, label: t.railRecords, side: "persons" },
    lineage: { icon: GitFork, label: t.lineage, view: "lineage" },
    tree: { icon: Network, label: t.paramparaTree, view: "tree" },
    vamsa: { icon: Trees, label: t.vamsa, view: "vamsa" },
    places: { icon: MapPin, label: t.tirthas, side: "places" },
    deities: { icon: Flower2, label: t.deities, side: "deities" },
    calendar: { icon: CalendarDays, label: t.calendarShort, view: "calendar" },
    timeline: { icon: Clock3, label: t.timeline, view: "timeline" },
    panorama: { icon: BarChart3, label: t.panorama, view: "panorama" },
    katha: { icon: Search, label: t.kathaSearchAll, view: "katha" },
    lectures: { icon: Mic, label: t.lecturesGurudeva, side: "lectures" },
    anthology: { icon: BookCopy, label: t.anthology, view: "anthology" },
    audios: { icon: Headphones, label: t.audios, view: "audios" },
    videos: { icon: Film, label: t.videos, view: "videos" },
    library: { icon: Archive, label: t.library, side: "library" },
    verses: { icon: Quote, label: t.verses, view: "verses" },
    bookmarks: { icon: Star, label: t.bookmarks, side: "bookmarks" },
    history: { icon: History, label: t.history, side: "history" },
  };
}
/** the title of each zone */
export const zoneName = (t: T, z: RailZone) => t.railZone[z];

const FOLD_KEY = "bio.railFolded";
const readFolded = (): RailZone[] => {
  try {
    return JSON.parse(localStorage.getItem(FOLD_KEY) ?? "[]");
  } catch {
    return [];
  }
};

/** The Windows 11 style's bar: big icons with their names, like K-Desktop (on the left, or in one row on top). */
export function Rail({ t, compact, view, sideTab, sideOpen, onView, onSide, layout }: Props) {
  const E = railEntries(t);
  const [folded, setFolded] = useState<RailZone[]>(readFolded);
  const fold = (z: RailZone) =>
    setFolded((f) => {
      const n = f.includes(z) ? f.filter((x) => x !== z) : [...f, z];
      try {
        localStorage.setItem(FOLD_KEY, JSON.stringify(n));
      } catch {
        /* not kept: it still folds now */
      }
      return n;
    });
  const button = (k: string) => {
    const e = E[k];
    const on = e.view ? view === e.view : sideOpen && sideTab === e.side;
    const click = () => (e.view ? onView(e.view) : onSide(e.side!));
    return (
      <button key={k} className={on ? "on" : ""} onClick={click} title={compact ? e.label : undefined}>
        <e.icon size={20} />
        <span>{e.label}</span>
      </button>
    );
  };
  const inZone = (z: RailZone) => layout.order.filter((k) => layout.place[k] === z);
  return (
    <nav className={`rail ${compact ? "compact" : ""}`}>
      <div className="rail-brand" role="button" tabIndex={0} onClick={() => onView("home")} onKeyDown={(e) => e.key === "Enter" && onView("home")} title={t.home}>
        <span className="logo mark">
          <LogoMark />
        </span>
        <span>{APP_NAME}</span>
      </div>
      <button className={view === "home" ? "on" : ""} onClick={() => onView("home")} title={compact ? t.home : undefined}>
        <Home size={20} />
        <span>{t.home}</span>
      </button>
      {RAIL_ZONES.map((z) => {
        const keys = inZone(z);
        if (!keys.length) return null;
        const shut = folded.includes(z);
        // a folded zone still shows the button in use
        const shown = shut ? keys.filter((k) => (E[k].view ? view === E[k].view : sideOpen && sideTab === E[k].side)) : keys;
        return (
          <div key={z} className={`rail-zone${shut ? " shut" : ""}`}>
            <div className="rail-zone-head" role="button" tabIndex={0} onClick={() => fold(z)} onKeyDown={(e) => e.key === "Enter" && fold(z)} title={shut ? t.railUnfold : t.railFold}>
              <span>{zoneName(t, z)}</span>
              <ChevronDown size={13} />
            </div>
            {shown.map(button)}
          </div>
        );
      })}
    </nav>
  );
}
