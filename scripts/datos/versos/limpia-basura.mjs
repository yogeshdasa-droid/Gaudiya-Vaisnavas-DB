// node limpia-basura.mjs <puerto> <biodata.db> [--dry]   (23-11-2026)
// En los versos bajados de vedabase.io, el bloque «Translation» arrastró el pie de la web (navegación «TEXT n»,
// «DonateThanks to …», «Privacy policy») y el JavaScript de Next.js (hasta 60 KB por verso). Este script quita ese
// pedazo —desde el primer «TEXT n…Donate» / «Donate Thanks to» hasta justo antes de «*Synonyms.*» o el final— y deja la
// traducción real.
// OJO: NO usar `set_section_text` sección a sección: cada llamada guarda una copia de TODO el documento en `history`
// y lo reescribe entero (probado: 1 GB de copias, horas). Aquí se reemplaza cada documento de una vez con `put_book`
// (mismo origen = se reemplaza a sí mismo). --dry: solo cuenta (sin app).
import { DatabaseSync } from "node:sqlite";

const args = process.argv.slice(2);
const port = args.find((a) => /^\d{4,5}$/.test(a)) || "9336";
const dbPath = args.find((a) => a.endsWith(".db"));
const dry = args.includes("--dry");
const db = new DatabaseSync(dbPath, { readOnly: true });

const START = /(?:TEXT\s*\d+[\s ]*)*Donate\s*Thanks to/;
const MARK = /DonateThanks|Donate\s*Thanks to|__next_f|textAlign|This page could not be found/;
const clean = (t) => {
  const m = START.exec(t);
  if (!m) return t;
  const from = m.index;
  const syn = t.slice(from).search(/\n\n\*Synonyms\.\*|\n\n\*Purport\.\*|\n\n\*Text\.\*/);
  return syn >= 0 ? t.slice(0, from).replace(/\s+$/, "") + t.slice(from + syn) : t.slice(0, from).replace(/\s+$/, "") + "\n";
};

const docs = db.prepare(`SELECT DISTINCT x.id, x.collection, x.dir, x.title, x.date, x.source FROM docs x JOIN sections s ON s.doc_id = x.id
  WHERE x.deleted IS NULL AND (s.text LIKE '%Donate%Thanks to%' OR s.text LIKE '%Donate Thanks to%') AND x.source LIKE 'versos:%'`).all();
const plan = [];
for (const d of docs) {
  const secs = db.prepare("SELECT heading, text FROM sections WHERE doc_id = ? ORDER BY ordinal").all(d.id);
  let changed = 0, before = 0, after = 0, left = 0;
  const sections = secs.map((s) => {
    before += s.text.length;
    const c = clean(s.text);
    if (c !== s.text) changed++;
    if (MARK.test(c)) left++;
    after += c.length;
    return { heading: s.heading, text: c };
  });
  plan.push({ d, sections, changed, before, after, left });
  console.log(`#${d.id} ${d.title.slice(0, 50)} (${d.source}): ${secs.length} secciones, ${changed} limpiadas, ${(before / 1048576).toFixed(1)} → ${(after / 1048576).toFixed(1)} MB, basura restante: ${left}`);
}
if (dry) process.exit(0);
if (plan.some((p) => p.left)) { console.error("Queda basura en alguna: no se aplica"); process.exit(1); }

const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.type === "page" && /tauri.localhost|localhost:1421/.test(p.url));
if (!page) { console.error("No hay app con CDP en el puerto " + port); process.exit(1); }
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let n = 0;
const pending = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
const inv = (cmd, a) =>
  new Promise((resolve) => {
    const id = ++n;
    pending.set(id, (d) => resolve(d.result?.result?.value));
    ws.send(JSON.stringify({ id, method: "Runtime.evaluate", params: { awaitPromise: true, returnByValue: true, expression: `(async()=>{try{return await window.__TAURI_INTERNALS__.invoke(${JSON.stringify(cmd)},${JSON.stringify(a)})}catch(e){return {__err:String(e)}}})()` } }));
  });
for (const p of plan) {
  if (!p.changed) continue;
  const id = await inv("put_book", { collection: p.d.collection, dir: p.d.dir, title: p.d.title, date: p.d.date, source: p.d.source, sections: p.sections, cover: null });
  console.log(typeof id === "number" ? `✓ #${id} ${p.d.title.slice(0, 50)}` : `✗ ${p.d.title}: ${JSON.stringify(id)}`);
}
ws.close();
