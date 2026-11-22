// node paso4-aplica.mjs <puerto> <biodata.db para LEER> [--dry] [--solo=texto-del-título] [--limit=N]   (22-11-2026)
// Paso 4B (sobre el índice de versos, 22-11-2026; la BD debe tener verse_index) — como paso4-aplica: en las charlas (Lectures Gurudeva, Anthology, Lectures of Śrīla Nārāyaṇa…), cada verso escrito sin
// diacríticos que sea COMPLETO uno de «Versos» pasa a su bloque `::: verse REF … :::` (con diacríticos y en sus líneas).
// Lee la BD en solo lectura y escribe por la app con `set_section_text` (v0.20.22: el texto de la sección tal cual, sin
// volver a partirlo por sus títulos —`save_section` sí lo hace y cambia el número de secciones—; queda la versión anterior).
// Antes: copia de seguridad (`node scripts/datos/backup.mjs "paso 4 versos"`) y probarlo en una copia de la BD.
// Repetirlo no cambia nada (los versos ya llevan diacríticos).
import { DatabaseSync } from "node:sqlite";
import { loadIndexVerses, buildIndexB, findInTextB } from "./paso4b-analiza.mjs";

const args = process.argv.slice(2);
const port = args.find((a) => /^\d{4,5}$/.test(a)) || "9334";
const dbPath = args.find((a) => /\.db$/i.test(a));
const dry = args.includes("--dry");
const solo = (args.find((a) => a.startsWith("--solo=")) || "").slice(7).toLowerCase();
const limit = Number((args.find((a) => a.startsWith("--limit=")) || "").slice(8)) || Infinity;
if (!dbPath) { console.error("falta la ruta de biodata.db (solo lectura)"); process.exit(1); }

const db = new DatabaseSync(dbPath, { readOnly: true });
const idx = buildIndexB(loadIndexVerses(db));
const secs = db
  .prepare("SELECT s.doc_id, s.ordinal, s.text, d.title FROM sections s JOIN docs d ON d.id = s.doc_id WHERE d.deleted IS NULL AND (d.dir LIKE 'Lectures Gurudeva%' OR d.dir = 'Anthology' OR d.dir LIKE 'Lectures of%') ORDER BY s.doc_id, s.ordinal")
  .all()
  .filter((s) => !solo || s.title.toLowerCase().includes(solo));

const jobs = [];
for (const s of secs) {
  const { out } = findInTextB(s.text, idx);
  if (!out.length) continue;
  const L = s.text.split("\n");
  for (const m of [...out].reverse()) {
    const block = m.block.split("\n");
    if (m.to + 1 < L.length && L[m.to + 1].trim() !== "") block.push("");
    if (m.from > 0 && L[m.from - 1].trim() !== "") block.unshift("");
    L.splice(m.from, m.to - m.from + 1, ...block);
  }
  jobs.push({ docId: s.doc_id, ordinal: s.ordinal, title: s.title, n: out.length, text: L.join("\n") });
  if (jobs.length >= limit) break;
}
const total = jobs.reduce((a, j) => a + j.n, 0);
console.log(`secciones a cambiar: ${jobs.length} | versos: ${total} | textos: ${new Set(jobs.map((j) => j.docId)).size}`);
if (dry) process.exit(0);

const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.type === "page" && /tauri.localhost|localhost:1421/.test(p.url));
if (!page) { console.error("No hay app con CDP en el puerto " + port); process.exit(1); }
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let n = 0;
const pending = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
const inv = (cmd, a) => new Promise((resolve) => {
  const id = ++n;
  pending.set(id, (d) => resolve(d.result?.result?.value));
  ws.send(JSON.stringify({ id, method: "Runtime.evaluate", params: { awaitPromise: true, returnByValue: true, expression: `(async()=>{try{return await window.__TAURI_INTERNALS__.invoke(${JSON.stringify(cmd)},${JSON.stringify(a)})}catch(e){return {__err:String(e)}}})()` } }));
});
let done = 0, fail = 0;
for (const j of jobs) {
  let r;
  for (let t = 0; t < 6; t++) {
    r = await inv("set_section_text", { docId: j.docId, ordinal: j.ordinal, text: j.text });
    if (!(r && r.__err && /locked|busy/i.test(r.__err))) break;
    await new Promise((x) => setTimeout(x, 800));
  }
  if (r && r.__err) { fail++; console.log(`✗ ${j.title} sec ${j.ordinal}: ${r.__err}`); } else done++;
  if (done % 100 === 0 && done) console.log(`  … ${done}/${jobs.length}`);
}
console.log(`Hecho: ${done} secciones cambiadas (${total} versos), ${fail} con problema`);
ws.close();
