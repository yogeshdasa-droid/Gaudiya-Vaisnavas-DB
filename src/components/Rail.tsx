import { useEffect, useRef, useState } from "react";
import { Archive, BarChart3, BookCopy, CalendarDays, ChevronDown, Clock3, Flower2, GitFork, History, Landmark, ListTree, MapPin, Mic, Network, Settings as Gear, Star, Trees, Users } from "lucide-react";
import { T } from "../i18n";
import type { SideTab } from "./Sidebar";
import { APP_NAME, LogoMark } from "./Logo";

export type RailView = "home" | "calendar" | "tree" | "timeline" | "lineage" | "panorama" | "vamsa" | "anthology";

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
      {one(s("persons", Users, t.vaisnavas))}
      <Group
        compact={compact}
        label={t.groupTrees}
        icon={ListTree}
        items={[
          v("tree", Network, t.paramparaTree),
          v("timeline", Clock3, t.timeline),
          v("lineage", GitFork, t.lineage),
          v("vamsa", Trees, t.vamsa),
          v("panorama", BarChart3, t.panorama),
        ]}
      />
      <Group compact={compact} label={t.groupDhama} icon={Landmark} items={[s("places", MapPin, t.tirthas), s("deities", Flower2, t.deities)]} />
      <hr />
      {one(s("bookmarks", Star, t.bookmarks))}
      {one(s("history", History, t.history))}
      <div className="rail-end">
        {one(s("lectures", Mic, t.lecturesGurudeva))}
        {one(v("anthology", BookCopy, t.anthology))}
        {/* the Library: only a small icon at the end, out of the way (Whisper, 17-11-2026: «like a ZIP logo»); all the
            folders are in it — Books, Lectures Gurudeva, Anthology… */}
        <button className={`rail-icon${sideOpen && sideTab === "library" ? " on" : ""}`} onClick={() => onSide("library")} title={t.library} aria-label={t.library}>
          <Archive size={20} />
        </button>
      </div>
    </nav>
  );
}
