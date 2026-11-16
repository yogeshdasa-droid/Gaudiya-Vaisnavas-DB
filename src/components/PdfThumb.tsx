// The cover of a PDF of a library (16-11-2026, pending from the 15-11: «sacar la portada de la 1.ª página del PDF»):
// for a book with no «cover.jpg» in its folder, the first page drawn by pdf.js, made only when the card is seen, two at a
// time, and kept in the WebView's IndexedDB (like VideoThumb), so the next time it is there at once. pdf.js reads the
// file by parts (the bio:// server answers «Range»), so a big book is not read whole.
import { useEffect, useRef, useState } from "react";
import { BookOpen } from "lucide-react";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

const DB = "pdf-thumbs";
const STORE = "thumbs";
const W = 300;

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

// pdf.js is loaded the first time a cover is needed, not with the app
let lib: Promise<typeof import("pdfjs-dist")> | null = null;
const pdfjs = () =>
  (lib ??= import("pdfjs-dist").then((m) => {
    m.GlobalWorkerOptions.workerSrc = workerUrl;
    return m;
  }));

/** The first page of the PDF as a small JPEG (data: address), or null if it cannot be read. */
async function draw(url: string): Promise<string | null> {
  const done = await slot();
  let doc: import("pdfjs-dist").PDFDocumentProxy | null = null;
  try {
    const m = await pdfjs();
    doc = await m.getDocument({ url, disableAutoFetch: true, disableStream: true, rangeChunkSize: 262144 }).promise;
    const page = await doc.getPage(1);
    const v1 = page.getViewport({ scale: 1 });
    const vp = page.getViewport({ scale: W / v1.width });
    const c = document.createElement("canvas");
    c.width = Math.round(vp.width);
    c.height = Math.round(vp.height);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, c.width, c.height);
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
    return c.toDataURL("image/jpeg", 0.8);
  } catch {
    return null;
  } finally {
    void doc?.destroy();
    done();
  }
}

export function PdfThumb({ url, cacheKey }: { url: string; cacheKey: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
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
        const g = await draw(url);
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
  }, [url, cacheKey]);
  return (
    <span ref={ref} className={`lib-pdf-thumb${src ? "" : " empty"}`}>
      {src ? <img src={src} alt="" /> : <BookOpen size={26} className={failed ? "" : "pulse"} />}
    </span>
  );
}
