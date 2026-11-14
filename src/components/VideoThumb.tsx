// A picture of each video of a library (14-11-2026, Whisper: «que los mp4 salgan como una imagen»): a frame taken
// from the video itself (about a tenth of the way in, so not the black of the start), made only when the card is
// seen, two at a time, and kept in the WebView's IndexedDB, so the next time it is there at once. A picture with the
// same name next to the video («charla.jpg» for «charla.mp4») is used instead, if there is one.
import { useEffect, useRef, useState } from "react";
import { Film } from "lucide-react";

const DB = "video-thumbs";
const STORE = "thumbs";
const W = 320;

function idb(): Promise<IDBDatabase | null> {
  return new Promise((ok) => {
    try {
      const r = indexedDB.open(DB, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(STORE);
      r.onsuccess = () => ok(r.result);
      r.onerror = () => ok(null);
    } catch {
      ok(null);
    }
  });
}
let dbP: Promise<IDBDatabase | null> | null = null;
const db = () => (dbP ??= idb());

async function getCached(key: string): Promise<string | null> {
  const d = await db();
  if (!d) return null;
  return new Promise((ok) => {
    try {
      const r = d.transaction(STORE).objectStore(STORE).get(key);
      r.onsuccess = () => ok(typeof r.result === "string" ? r.result : null);
      r.onerror = () => ok(null);
    } catch {
      ok(null);
    }
  });
}
async function putCached(key: string, v: string) {
  const d = await db();
  try {
    d?.transaction(STORE, "readwrite").objectStore(STORE).put(v, key);
  } catch {
    /* no room: it is made again next time */
  }
}

// two videos at a time: each one reads a few MB of a big file
let running = 0;
const queue: (() => void)[] = [];
function slot(): Promise<() => void> {
  return new Promise((ok) => {
    const go = () => {
      running++;
      ok(() => {
        running--;
        queue.shift()?.();
      });
    };
    if (running < 2) go();
    else queue.push(go);
  });
}

/** A frame of the video as a small JPEG (data: address), or null if it cannot be read (a format the window does not play). */
async function grab(url: string): Promise<string | null> {
  const done = await slot();
  const v = document.createElement("video");
  try {
    v.crossOrigin = "anonymous";
    v.muted = true;
    v.preload = "metadata";
    v.src = url;
    const wait = (ev: string) =>
      new Promise<boolean>((ok) => {
        const t = setTimeout(() => ok(false), 45000);
        v.addEventListener(ev, () => (clearTimeout(t), ok(true)), { once: true });
        v.addEventListener("error", () => (clearTimeout(t), ok(false)), { once: true });
      });
    if (!(await wait("loadedmetadata"))) return null;
    const d = isFinite(v.duration) ? v.duration : 0;
    v.currentTime = d > 0 ? Math.min(Math.max(d * 0.1, 3), 120, d / 2) : 1;
    if (!(await wait("seeked"))) return null;
    if (!v.videoWidth) return null;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = Math.round((W * v.videoHeight) / v.videoWidth);
    c.getContext("2d")!.drawImage(v, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.75);
  } catch {
    return null;
  } finally {
    v.removeAttribute("src");
    v.load();
    done();
  }
}

/** The picture of a video: `poster` (an image next to it) if there is one, otherwise a frame of the video. */
export function VideoThumb({ url, cacheKey, poster }: { url: string; cacheKey: string; poster?: string }) {
  const [src, setSrc] = useState<string | null>(poster ?? null);
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (poster) return setSrc(poster);
    let live = true;
    setSrc(null);
    setFailed(false);
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      async (es) => {
        if (!es.some((x) => x.isIntersecting)) return;
        io.disconnect();
        const c = await getCached(cacheKey);
        if (c) return live && setSrc(c);
        // a big file on a busy disc may be slow once: one more try
        const g = (await grab(url)) ?? (live ? await grab(url) : null);
        if (!live) return;
        if (g) {
          setSrc(g);
          void putCached(cacheKey, g);
        } else setFailed(true);
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => {
      live = false;
      io.disconnect();
    };
  }, [url, cacheKey, poster]);
  return (
    <span ref={ref} className={`lib-video-thumb${src ? "" : " empty"}`}>
      {src ? <img src={src} alt="" /> : <Film size={22} className={failed ? "" : "pulse"} />}
    </span>
  );
}
