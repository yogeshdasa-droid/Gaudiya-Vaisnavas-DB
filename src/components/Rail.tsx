import { useEffect, useRef, useState } from "react";
import { Archive, BarChart3, BookCopy, CalendarDays, ChevronDown, Clock3, Flower2, GitFork, Headphones, History, Landmark, ListTree, MapPin, Mic, Minus, Network, Settings as Gear, Star, Trees, Users } from "lucide-react";
import { T } from "../i18n";
import type { SideTab } from "./Sidebar";
import { APP_NAME, LogoMark } from "./Logo";

export type RailView = "home" | "calendar" | "tree" | "timeline" | "lineage" | "panorama" | "vamsa" | "anthology" | "audios";

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

/** The bar's buttons can be moved (Whisper, 17-11-2026, Ajustes › General › «Botones de la barra»): each one on the bar,
 *  at its end, inside «Árboles» or «Dhāma», or hidden; the order inside each place too. The two groups and the line
 *  are entries as well (on the bar, at the end or hidden). The Library icon always stays at the very end. */
export type RailPlace = "bar" | "end" | "trees" | "dhama" | "hidden";
export type RailLayout = { order: string[]; place: Record<string, RailPlace> };
export const RAIL_GROUPS = ["g:trees", "g:dhama"] as const;
export const RAIL_DEFAULT: RailLayout = {
  order: ["calendar", "persons", "g:trees", "tree", "timeline", "lineage", "vamsa", "panorama", "g:dhama", "places", "deities", "sep", "bookmarks", "history", "lectures", "anthology", "audios"],
  place: {
    calendar: "bar", persons: "bar", "g:trees": "bar", tree: "trees", timeline: "trees", lineage: "trees", vamsa: "trees", panorama: "trees",
    "g:dhama": "bar", places: "dhama", deities: "dhama", sep: "bar", bookmarks: "bar", history: "bar", lectures: "end", anthology: "end", audios: "end",
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
  const place: Record<string, RailPlace> = {};
  const isGroup = (k: string) => k.startsWith("g:") || k === "sep";
  for (const k of order) {
    const p = saved?.place?.[k];
    // a group (or the line) cannot go inside a group
    place[k] = p && (!isGroup(k) || p === "bar" || p === "end" || p === "hidden") ? p : RAIL_DEFAULT.place[k];
  }
  return { order, place };
}
type Entry = { icon: typeof Gear; label: string; view?: RailView; side?: SideTab };
/** every button of the bar: its icon, its name and what it opens */
export function railEntries(t: T): Record<string, Entry> {
  return {
    calendar: { icon: CalendarDays, label: t.calendarShort, view: "calendar" },
    persons: { icon: Users, label: t.vaisnavas, side: "persons" },
    "g:trees": { icon: ListTree, label: t.groupTrees },
    tree: { icon: Network, label: t.paramparaTree, view: "tree" },
    timeline: { icon: Clock3, label: t.timeline, view: "timeline" },
    lineage: { icon: GitFork, label: t.lineage, view: "lineage" },
    vamsa: { icon: Trees, label: t.vamsa, view: "vamsa" },
    panorama: { icon: BarChart3, label: t.panorama, view: "panorama" },
    "g:dhama": { icon: Landmark, label: t.groupDhama },
    places: { icon: MapPin, label: t.tirthas, side: "places" },
    deities: { icon: Flower2, label: t.deities, side: "deities" },
    sep: { icon: Minus, label: t.railSep },
    bookmarks: { icon: Star, label: t.bookmarks, side: "bookmarks" },
    history: { icon: History, label: t.history, side: "history" },
    lectures: { icon: Mic, label: t.lecturesGurudeva, side: "lectures" },
    anthology: { icon: BookCopy, label: t.anthology, view: "anthology" },
    audios: { icon: Headphones, label: t.audios, view: "audios" },
  };
}

type Item = { key: string; icon: typeof Gear; label: string; on: boolean; click: () => void };

/** A button that opens several (Whisper, 17-11-2026): with its own name and icon (Whisper: «Árboles», «Dhāma» — a
 *  name different from what is inside), or else the one in use. On the left the others open just below; with the
 *  bar on top, as a menu. */
function Group({ items, compact, label, icon }: { items: Item[]; compact: boolean; label?: string; icon?: typeof Gear }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [open]);
  const shown = items.find((i) => i.on) ?? items[0];
  const I = icon ?? shown.icon;
  const name = label ?? shown.label;
  return (
    <div className={`rail-group${open ? " open" : ""}`} ref={ref}>
      <button className={items.some((i) => i.on) ? "on" : ""} onClick={() => setOpen((o) => !o)} title={compact ? name : undefined}>
        <I size={20} />
        <span>{name}</span>
        <ChevronDown size={14} className="rail-caret" />
      </button>
      {open && (
        <div className="rail-menu">
          {items.map((i) => (
            <button key={i.key} className={i.on ? "on" : ""} onClick={() => (setOpen(false), i.click())} title={compact ? i.label : undefined}>
              <i.icon size={20} />
              <span>{i.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


/** The Windows 11 style's bar: big icons with their names, like K-Desktop (on the left, or in one row on top). */
export function Rail({ t, compact, view, sideTab, sideOpen, onView, onSide, layout }: Props) {
  const E = railEntries(t);
  const item = (k: string): Item => {
    const e = E[k];
    if (e.view) { const v = e.view; return { key: k, icon: e.icon, label: e.label, on: view === v, click: () => onView(v) }; }
    const sd = e.side!;
    return { key: k, icon: e.icon, label: e.label, on: sideOpen && sideTab === sd, click: () => onSide(sd) };
  };
  const one = (i: Item) => (
    <button key={i.key} className={i.on ? "on" : ""} onClick={i.click} title={compact ? i.label : undefined}>
      <i.icon size={20} />
      <span>{i.label}</span>
    </button>
  );
  const inside = (g: RailPlace) => layout.order.filter((k) => layout.place[k] === g).map(item);
  const render = (k: string) => {
    if (k === "sep") return <hr key={k} />;
    if (k === "g:trees" || k === "g:dhama") {
      const items = inside(k === "g:trees" ? "trees" : "dhama");
      if (!items.length) return null;
      return <Group key={k} compact={compact} label={E[k].label} icon={E[k].icon} items={items} />;
    }
    return one(item(k));
  };
  const zone = (z: RailPlace) => layout.order.filter((k) => layout.place[k] === z).map(render);
  return (
    <nav className={`rail ${compact ? "compact" : ""}`}>
      {/* the name takes to the Home page: no «Home» button (Whisper, 17-11-2026) */}
      <div className="rail-brand" role="button" tabIndex={0} onClick={() => onView("home")} onKeyDown={(e) => e.key === "Enter" && onView("home")} title={t.home}>
        <span className="logo mark">
          <LogoMark />
        </span>
        <span>{APP_NAME}</span>
      </div>
      {zone("bar")}
      <div className="rail-end">
        {zone("end")}
        {/* the Library: only a small icon at the end, out of the way (Whisper, 17-11-2026: «like a ZIP logo»); all the
            folders are in it — Books, Lectures Gurudeva, Anthology… */}
        <button className={`rail-icon${sideOpen && sideTab === "library" ? " on" : ""}`} onClick={() => onSide("library")} title={t.library} aria-label={t.library}>
          <Archive size={20} />
        </button>
      </div>
    </nav>
  );
}
