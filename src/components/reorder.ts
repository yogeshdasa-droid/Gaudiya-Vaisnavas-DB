// Putting cards in another order by dragging them with the mouse (21-11-2026).
// Not the browser's drag and drop: on Windows Tauri keeps it for dropping files from the Explorer, so «drop»
// never reached the cards. Here: press, move a few pixels, let go over another card → it goes in its place.
import { useRef, useState } from "react";
import type React from "react";

export function useReorder(group: string, onMove: (from: number, onto: number) => void) {
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const dragged = useRef(false);
  const under = (ev: PointerEvent) => {
    const el = document.elementFromPoint(ev.clientX, ev.clientY)?.closest<HTMLElement>(`[data-reorder="${group}"]`);
    return el ? Number(el.dataset.reorderId) : null;
  };
  const start = (id: number) => (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const x0 = e.clientX, y0 = e.clientY;
    let on = false;
    dragged.current = false;
    const move = (ev: PointerEvent) => {
      if (!on && Math.hypot(ev.clientX - x0, ev.clientY - y0) > 6) {
        on = dragged.current = true;
        setDrag(id);
        document.body.classList.add("dragging-person");
      }
      if (on) setOver(under(ev));
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      if (!on) return;
      const onto = under(ev);
      if (onto !== null && onto !== id) onMove(id, onto);
      setDrag(null);
      setOver(null);
      document.body.classList.remove("dragging-person");
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  /** the props of each card */
  const item = (id: number) => ({
    "data-reorder": group,
    "data-reorder-id": id,
    onPointerDown: start(id),
    onDragStart: (e: React.DragEvent) => e.preventDefault(), // no dragging of the picture itself
  });
  /** the click that ends a drag does not open the card */
  const click = (fn: () => void) => () => {
    if (dragged.current) dragged.current = false;
    else fn();
  };
  const cls = (id: number) => (drag === id ? "dragging" : drag !== null && over === id ? "drop-here" : "");
  return { item, click, cls, active: drag !== null };
}

/** `ids` with `from` put in the place of `onto` */
export function moveId(ids: number[], from: number, onto: number) {
  const forward = ids.indexOf(from) < ids.indexOf(onto);
  const out = ids.filter((x) => x !== from);
  out.splice(out.indexOf(onto) + (forward ? 1 : 0), 0, from);
  return out;
}
