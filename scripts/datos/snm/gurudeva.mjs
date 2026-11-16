// node gurudeva.mjs [puerto] [--dry]   (16-11-2026, Whisper: «"Lectures Gurudeva" como un apartado aparte, encima de
// Libros, y solo el título y/o la fecha de la clase») — cada charla de «Lectures SNM md» pasa a ser un texto propio en
// la carpeta «Lectures Gurudeva/<año>» (sin ficha), titulado «AAAA-MM-DD · título»; las «Daily Quotes» van a
// «Lectures Gurudeva». Después manda a la papelera los libros por año que había en «Libros» (los artículos de
// Bhaktisiddhānta Sarasvatī se quedan allí). Lo que ya existe no se repite: 2.ª pasada = nada.
import { lectures } from "./lib.mjs";
const args = process.argv.slice(2);
const dry = args.includes("--dry");
const port = args.find((a) => a !== "--dry") || "9334";

const ROOT = "Lectures Gurudeva";
const items = [];
for (let l of lectures()) {
  if (/Bhaktisiddhānta Sarasvatī Ṭhākura Prabhupāda — Articles/.test(l.book)) continue;
  // «AAAA-00» = sin mes en el nombre del archivo; «AAAA-00-NN» = «Part NN» sin fecha → solo el año (y «part NN»)
  const part = l.date.match(/^\d{4}-00-(\d\d)$/)?.[1];
  const date = /^\d{4}-00/.test(l.date) ? l.date.slice(0, 4) : l.date;
  if (part) l = { ...l, title: `${l.title} (part ${+part})` };
  let folder, title;
  if (/Daily Quotes/.test(l.book)) { folder = ROOT; title = "Source of Inspiration — Daily Quotes"; }
  else {
    const y = l.book.match(/1930–1977/) ? "1930–1977" : l.book.match(/2011–2020/) ? "2011–2020" : l.book.match(/— (\d{4})$/)?.[1] ?? "other";
    folder = `${ROOT}/${y}`;
    title = [date, l.title].filter(Boolean).join(" · ");
  }
  items.push({ folder, title, text: l.text });
}
console.log("charlas:", items.length);

const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket((list.find((p) => p.type === "page" && /tauri.localhost|localhost:1421/.test(p.url)) ?? list.find((p) => p.type === "page")).webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let n = 0;
const run = (expr) =>
  new Promise((resolve) => {
    const id = ++n;
    const h = (m) => { const d = JSON.parse(m.data); if (d.id !== id) return; ws.removeEventListener("message", h); resolve(d.result?.result?.value ?? d.result); };
    ws.addEventListener("message", h);
    ws.send(JSON.stringify({ id, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
  });

// lo que ya hay en «Lectures Gurudeva»
const have = new Set(await run(`(async () => (await window.__TAURI_INTERNALS__.invoke("list_docs")).filter((d) => d.dir === ${JSON.stringify(ROOT)} || d.dir.startsWith(${JSON.stringify(ROOT + "/")})).map((d) => d.dir + "|" + d.title))()`));
const todo = items.filter((it) => !have.has(it.folder + "|" + it.title));
console.log("ya están:", items.length - todo.length, " por crear:", todo.length);
if (!dry) {
  for (let i = 0; i < todo.length; i += 50) {
    const chunk = todo.slice(i, i + 50);
    const r = await run(`(async () => { try { const inv = window.__TAURI_INTERNALS__.invoke; const C = ${JSON.stringify(chunk)};
      for (const c of C) { const doc = await inv("create_doc", { personId: null, title: c.title, collection: c.folder }); await inv("save_section", { docId: doc, ordinal: 0, text: c.text }); }
      return C.length; } catch (e) { return "ERROR " + e; } })()`);
    console.log("  creadas", i + (typeof r === "number" ? r : 0), r === chunk.length ? "" : r);
    if (typeof r !== "number") break;
  }
}
// los libros por año de «Libros», a la papelera (solo si ya están todas las charlas)
const old = await run(`(async () => (await window.__TAURI_INTERNALS__.invoke("list_docs")).filter((d) => d.dir === "Libros" && /^(Lectures of Śrīla Bhaktivedānta Nārāyaṇa Gosvāmī Mahārāja — |Lectures and conversations 1930–1977|Source of Inspiration — Daily Quotes)/.test(d.title)).map((d) => d.id + " " + d.title))()`);
console.log("libros viejos en «Libros»:", old.length);
const now = await run(`(async () => (await window.__TAURI_INTERNALS__.invoke("list_docs")).filter((d) => d.dir === ${JSON.stringify(ROOT)} || d.dir.startsWith(${JSON.stringify(ROOT + "/")})).length)()`);
if (!dry && now >= items.length && old.length) {
  const r = await run(`(async () => { const inv = window.__TAURI_INTERNALS__.invoke; for (const s of ${JSON.stringify(old)}) await inv("trash_doc", { docId: +s.split(" ")[0] }); return "a la papelera: " + ${old.length}; })()`);
  console.log(r);
} else if (old.length) console.log(dry ? "(en seco: no se tocan)" : `no se tocan: en «${ROOT}» hay ${now} de ${items.length}`);
ws.close();
