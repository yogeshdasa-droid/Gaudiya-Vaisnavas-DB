// A web page inside the window (13-11-2026, Whisper: «que las webs se abran como nuestros vídeos»; then: «no puedo hacer
// clic en los enlaces… en YouTube solo 1 vídeo, sería como ir al canal y elegir»). The page is shown by a browser view
// of its own (web.rs: a child webview of the window) laid over the box this component keeps for it, so every site
// works whole — YouTube channels, links «in a new tab» (they open in the same view), sites that refuse frames. The bar:
// back to the app · ◀ ▶ inside the page · reload · open in the browser.
import { useEffect, useRef, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, Globe, RotateCw } from "lucide-react";
import { api } from "../api";
import { T } from "../i18n";

const hostOf = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
};

export function WebPage({ t, url, title, hidden, onBack, onToast }: { t: T; url: string; title: string; hidden: boolean; onBack: () => void; onToast: (m: string) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(url); // where the view is now
  const [ready, setReady] = useState(false);
  // where the box is, in the window
  const rect = () => {
    const r = box.current!.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  };
  useEffect(() => {
    let live = true;
    setAt(url);
    setReady(false);
    api.webOpen(url, rect()).then(
      () => live && setReady(true),
      (e) => onToast(String(e)),
    );
    const un = listen<string>("web-page", (e) => live && e.payload && setAt(e.payload));
    return () => {
      live = false;
      un.then((f) => f());
      void api.webHide();
    };
  }, [url]); // eslint-disable-line react-hooks/exhaustive-deps
  // the box moves or changes size (window, side panel): the view follows
  useEffect(() => {
    if (!ready || !box.current) return;
    const follow = () => void api.webBounds(rect());
    const ro = new ResizeObserver(follow);
    ro.observe(box.current);
    window.addEventListener("resize", follow);
    const tick = window.setInterval(follow, 1200); // (a move without a change of size)
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", follow);
      window.clearInterval(tick);
    };
  }, [ready]);
  // a dialog over the page: the view would cover it
  useEffect(() => {
    if (!ready) return;
    void (hidden ? api.webHide() : api.webShow());
  }, [hidden, ready]);
  const outside = () =>
    api
      .webCurrent()
      .then((u) => api.openExternal(u || at))
      .catch((e) => onToast(String(e)));
  return (
    <div className="reader">
      <div className="lib-viewer">
        <div className="lib-viewer-bar">
          <button className="btn ghost small" onClick={onBack}>
            <ArrowLeft size={15} /> {t.webBack}
          </button>
          <button className="icon-btn" onClick={() => void api.webGo("back")} title={t.webPrev}>
            <ChevronLeft size={17} />
          </button>
          <button className="icon-btn" onClick={() => void api.webGo("fwd")} title={t.webNext}>
            <ChevronRight size={17} />
          </button>
          <button className="icon-btn" onClick={() => void api.webGo("reload")} title={t.webReload}>
            <RotateCw size={15} />
          </button>
          <span className="lib-viewer-title" title={at}>
            <Globe size={15} /> {title || hostOf(url)}
            <span className="muted small"> · {hostOf(at)}</span>
          </span>
          <button className="btn ghost small" onClick={outside} title={at}>
            <ExternalLink size={15} /> {t.webOpenOutside}
          </button>
        </div>
        <div ref={box} className="web-box">
          {!ready && <p className="muted web-note">{t.webLoading}</p>}
        </div>
      </div>
    </div>
  );
}
