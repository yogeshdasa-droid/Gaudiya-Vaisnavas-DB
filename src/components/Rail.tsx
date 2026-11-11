import { BarChart3, CalendarDays, Clock3, Flower2, GitFork, HelpCircle, History, Home as HomeIcon, Library as LibIcon, MapPin, Network, Settings as Gear, Star, Users } from "lucide-react";
import { T } from "../i18n";
import type { SideTab } from "./Sidebar";

export type RailView = "home" | "calendar" | "tree" | "timeline" | "lineage" | "panorama";

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
  onSettings: () => void;
  onHelp: () => void;
}

/** The Windows 11 style's left bar: big icons with their names, like K-Desktop. */
export function Rail({ t, compact, view, sideTab, sideOpen, onView, onSide, onSettings, onHelp }: Props) {
  const views: [RailView, typeof Gear, string][] = [
    ["home", HomeIcon, t.home],
    ["calendar", CalendarDays, t.calendarShort],
    ["tree", Network, t.paramparaTree],
    ["timeline", Clock3, t.timeline],
    ["lineage", GitFork, t.lineage],
    ["panorama", BarChart3, t.panorama],
  ];
  const panels: [SideTab, typeof Gear, string][] = [
    ["persons", Users, t.vaisnavas],
    ["places", MapPin, t.tirthas],
    ["deities", Flower2, t.deities],
    ["library", LibIcon, t.library],
    ["bookmarks", Star, t.bookmarks],
    ["history", History, t.history],
  ];
  const item = (key: string, I: typeof Gear, label: string, on: boolean, click: () => void) => (
    <button key={key} className={on ? "on" : ""} onClick={click} title={compact ? label : undefined}>
      <I size={20} />
      <span>{label}</span>
    </button>
  );
  return (
    <nav className={`rail ${compact ? "compact" : ""}`}>
      <div className="rail-brand">
        <span className="logo">G</span>
        <span>Gaudiya Vaisnavas DB</span>
      </div>
      {views.map(([k, I, label]) => item(k, I, label, view === k, () => onView(k)))}
      <hr />
      {panels.map(([k, I, label]) => item(k, I, label, sideOpen && sideTab === k, () => onSide(k)))}
      <div className="rail-end">
        {item("settings", Gear, t.settings, false, onSettings)}
        {item("help", HelpCircle, t.help, false, onHelp)}
      </div>
    </nav>
  );
}
