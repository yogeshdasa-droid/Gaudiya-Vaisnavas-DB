import { useEffect, useRef, useState } from "react";
import { BarChart3, BookOpen, CalendarDays, ChevronDown, Clock3, Flower2, GitFork, History, Library as LibIcon, MapPin, Mic, Network, Settings as Gear, Star, Trees, Users } from "lucide-react";
import { T } from "../i18n";
import type { SideTab } from "./Sidebar";
import { APP_NAME, LogoMark } from "./Logo";

export type RailView = "home" | "calendar" | "tree" | "timeline" | "lineage" | "panorama" | "vamsa";

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
}

type Item = { key: string; icon: typeof Gear; label: string; on: boolean; click: () => void };

/** A button that opens several (Whisper, 17-11-2026): it shows the one in use, or the first. On the left the
 *  others open just below; with the bar on top, as a menu. */
function Group({ items, compact }: { items: Item[]; compact: boolean }) {
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
  const I = shown.icon;
  return (
    <div className={`rail-group${open ? " open" : ""}`} ref={ref}>
      <button className={items.some((i) => i.on) ? "on" : ""} onClick={() => setOpen((o) => !o)} title={compact ? shown.label : undefined}>
        <I size={20} />
        <span>{shown.label}</span>
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
export function Rail({ t, compact, view, sideTab, sideOpen, onView, onSide }: Props) {
  const v = (k: RailView, icon: typeof Gear, label: string): Item => ({ key: k, icon, label, on: view === k, click: () => onView(k) });
  const s = (k: SideTab, icon: typeof Gear, label: string): Item => ({ key: k, icon, label, on: sideOpen && sideTab === k, click: () => onSide(k) });
  const one = (i: Item) => (
    <button key={i.key} className={i.on ? "on" : ""} onClick={i.click} title={compact ? i.label : undefined}>
      <i.icon size={20} />
      <span>{i.label}</span>
    </button>
  );
  return (
    <nav className={`rail ${compact ? "compact" : ""}`}>
      {/* the name takes to the Home page: no «Home» button (Whisper, 17-11-2026) */}
      <div className="rail-brand" role="button" tabIndex={0} onClick={() => onView("home")} onKeyDown={(e) => e.key === "Enter" && onView("home")} title={t.home}>
        <span className="logo mark">
          <LogoMark />
        </span>
        <span>{APP_NAME}</span>
      </div>
      {one(v("calendar", CalendarDays, t.calendarShort))}
      <Group
        compact={compact}
        items={[
          v("tree", Network, t.paramparaTree),
          v("timeline", Clock3, t.timeline),
          v("lineage", GitFork, t.lineage),
          v("vamsa", Trees, t.vamsa),
          v("panorama", BarChart3, t.panorama),
        ]}
      />
      <hr />
      {one(s("persons", Users, t.vaisnavas))}
      {one(s("places", MapPin, t.tirthas))}
      {one(s("deities", Flower2, t.deities))}
      <Group compact={compact} items={[s("library", LibIcon, t.library), s("books", BookOpen, t.books)]} />
      {one(s("bookmarks", Star, t.bookmarks))}
      {one(s("history", History, t.history))}
      <div className="rail-end">{one(s("lectures", Mic, t.lecturesGurudeva))}</div>
    </nav>
  );
}
