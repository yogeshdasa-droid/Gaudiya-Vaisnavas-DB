import { Component, ReactNode, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { hueOf } from "../api";

/** A view that fails shows this note instead of leaving the whole window blank (12-11-2026: the Paramparā Tree
 *  drawn from top to bottom took the window down and nothing could be clicked). Give it a `key` of the view, so that
 *  going to another view starts it again. */
export class ViewGuard extends Component<{ message: string; back: string; onBack: () => void; children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(e: unknown) {
    return { error: String(e) };
  }
  render() {
    if (this.state.error === null) return this.props.children;
    return (
      <section className="view-failed">
        <p>{this.props.message}</p>
        <p className="muted small">{this.state.error}</p>
        <button className="btn" onClick={this.props.onBack}>
          {this.props.back}
        </button>
      </section>
    );
  }
}

/** Asks yes / no and waits for the answer. The dialog plugin turns
 *  window.confirm into a promise: used directly, it always reads as "yes". */
export const ask = (message: string): Promise<boolean> => Promise.resolve(window.confirm(message) as boolean | Promise<boolean>);

export function Modal({
  title,
  icon,
  onClose,
  children,
  footer,
  wide,
  className,
}: {
  title: string;
  icon?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
  className?: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className={`modal ${wide ? "wide" : ""} ${className ?? ""}`} onMouseDown={(e) => e.stopPropagation()}>
        <header className="modal-head">
          {icon && <span className="modal-icon">{icon}</span>}
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-foot">{footer}</footer>}
      </div>
    </div>
  );
}

/** Colored pill for a collection name (same hue everywhere). */
export function CollectionChip({ name, onClick }: { name: string; onClick?: () => void }) {
  return (
    <span className={`chip ${onClick ? "clickable" : ""}`} style={{ "--h": hueOf(name) } as React.CSSProperties} onClick={onClick}>
      <i className="dot" />
      {name}
    </span>
  );
}

/** Counts up to `value` with an ease-out animation. */
export function AnimatedNumber({ value, format }: { value: number; format?: (n: number) => string }) {
  const [shown, setShown] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / 700);
      const v = a + (value - a) * (1 - Math.pow(1 - p, 3));
      setShown(v);
      if (p < 1) raf = requestAnimationFrame(step);
      else from.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{format ? format(shown) : Math.round(shown).toLocaleString()}</>;
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="kbd">{children}</kbd>;
}

/** Drag handle between two panes; reports the new width of the left pane. */
export function Splitter({ onDrag, onDoubleClick }: { onDrag: (dx: number) => void; onDoubleClick?: () => void }) {
  const last = useRef(0);
  const onDown = (e: React.PointerEvent) => {
    last.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    document.body.classList.add("resizing");
  };
  const onMove = (e: React.PointerEvent) => {
    if (!(e.target as HTMLElement).hasPointerCapture(e.pointerId)) return;
    onDrag(e.clientX - last.current);
    last.current = e.clientX;
  };
  const onUp = () => document.body.classList.remove("resizing");
  return (
    <div
      className="splitter"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onDoubleClick={onDoubleClick}
    />
  );
}
