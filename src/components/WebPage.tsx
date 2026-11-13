// A web page inside the window (13-11-2026, Whisper: «que las webs se abran dentro de la app, como nuestros vídeos»):
// the record's web links open here, with a bar to go back and to open the page in the browser. Pages that refuse to be
// shown inside another program (YouTube's own pages, Google, Facebook…) say so, with the button to the browser;
// a YouTube video goes to YouTube's player for other sites (notesLinks.ts, embedUrl), which is allowed.
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ExternalLink, Globe, RotateCw } from "lucide-react";
import { api } from "../api";
import { T } from "../i18n";
import { embedUrl, isYoutubeChannel } from "../notesLinks";

export function WebPage({ t, url, title, onBack, onToast }: { t: T; url: string; title: string; onBack: () => void; onToast: (m: string) => void }) {
  const direct = useMemo(() => embedUrl(url), [url]);
  // a YouTube channel: the player of its uploads, looked up by the app
  const [channel, setChannel] = useState<string | null>(null);
  const src = channel ?? direct;
  const [state, setState] = useState<"check" | "ok" | "blocked">("check");
  const [n, setN] = useState(0);
  useEffect(() => {
    setState("check");
    setChannel(null);
    let live = true;
    if (isYoutubeChannel(url)) {
      api.youtubeChannelEmbed(url).then(
        (e) => live && (e ? (setChannel(e), setState("ok")) : setState("blocked")),
        () => live && setState("blocked"),
      );
    } else if (direct !== url) setState("ok");
    else
      api.webFrameCheck(direct).then(
        (v) => live && setState(v === "blocked" ? "blocked" : "ok"),
        () => live && setState("ok"),
      );
    return () => {
      live = false;
    };
  }, [direct, url]);
  const host = (() => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  })();
  const outside = () => api.openExternal(url).catch((e) => onToast(String(e)));
  return (
    <div className="reader">
      <div className="lib-viewer">
        <div className="lib-viewer-bar">
          <button className="btn ghost small" onClick={onBack}>
            <ArrowLeft size={15} /> {t.webBack}
          </button>
          <span className="lib-viewer-title" title={url}>
            <Globe size={15} /> {title || host}
            {title && <span className="muted small"> · {host}</span>}
          </span>
          {state === "ok" && (
            <button className="icon-btn" onClick={() => setN((x) => x + 1)} title={t.webReload}>
              <RotateCw size={15} />
            </button>
          )}
          <button className="btn ghost small" onClick={outside} title={url}>
            <ExternalLink size={15} /> {t.webOpenOutside}
          </button>
        </div>
        {state === "check" ? (
          <p className="muted web-note">{t.webLoading}</p>
        ) : state === "blocked" ? (
          <div className="lib-empty web-note">
            <p>{t.webBlocked(host)}</p>
            <button className="btn" onClick={outside}>
              <ExternalLink size={15} /> {t.webOpenOutside}
            </button>
          </div>
        ) : (
          <iframe
            key={src + n}
            className="lib-frame"
            src={src}
            title={title || host}
            // no «allow-top-navigation»: a page can never take the app's window away
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-downloads"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture; clipboard-write"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        )}
      </div>
    </div>
  );
}
