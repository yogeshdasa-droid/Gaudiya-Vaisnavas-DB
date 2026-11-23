// node cargar.mjs --db=<biodata.db> [puerto] [--dry] [--solo=texto] [--autor=texto] [--limit=N]   (23-11-2026)
// La biblioteca de Calibre de Whisper (E:\Gaudiya\Data Bases\Calibre\Whisper Library) como libros de «Libros/<Autor>».
//  - Autor → ficha existente (autores.json: número) | ficha NUEVA (se crea con new_person) | carpeta temática.
//  - Solo se importan los que NO están ya en la app (mismo título plegado); el mismo libro (origen «calibre:<id>»)
//    se reemplaza a sí mismo: una segunda pasada no duplica.
//  - Texto con `convert_pdf` de la app (Balaram → IAST), párrafos y secciones de ≈ 6 páginas (como los de Nārāyaṇa).
//    Los PDF NO se guardan, solo texto y portada.
//  - --dry: solo muestra el plan (sin app). Sin --dry hace falta la app con CDP en [puerto] (por defecto 9334).
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const CAL = "E:/Gaudiya/Data Bases/Calibre/Whisper Library";
const args = process.argv.slice(2);
const val = (k) => (args.find((a) => a.startsWith(`--${k}=`)) || "").slice(k.length + 3);
const dbPath = val("db") || process.env.APPDATA + "/com.whispers.biodata/biodata.db";
const port = args.find((a) => /^\d{4,5}$/.test(a)) || "9334";
const dry = args.includes("--dry");
const solo = val("solo").toLowerCase(), autorFiltro = val("autor").toLowerCase();
const limit = Number(val("limit")) || Infinity;
const PAGES_PER_SECTION = 6;

const fold = (s) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ").replace(/\b(the|a|an|of|and|sri|srila|srimad|by)\b/g, " ").replace(/\s+/g, " ").trim();

// ---- autores: Calibre → ficha / nueva / carpeta
const MAPA = JSON.parse(fs.readFileSync(path.join(AQUI, "autores.json"), "utf8"));
delete MAPA._nota;
// ficha nueva: nombre con diacríticos, otros nombres
const NUEVAS = {
  "Ananta Das Babaji": ["Ananta Dāsa Bābājī", "Ananta Das Babaji"],
  "BV Tripurari Maharaja": ["Tripurāri Mahārāja", "B. V. Tripurari Maharaja"],
  "BV Tridandi Swami": ["Tridaṇḍi Svāmī", "B. V. Tridandi Swami"],
  "HH Bhanu Swami": ["Bhānu Svāmī", "HH Bhanu Swami"],
  "Mahanidhi Swami": ["Mahānidhi Svāmī", "Mahanidhi Swami"],
  "BV Pramode Puri": ["Pramode Purī Mahārāja", "B. V. Pramode Puri"],
  "BV Hridaya Bon Maharaj": ["Hṛdaya Bon Mahārāja", "B. V. Hridaya Bon Maharaj"],
  "BV Madhava Goswami Maharaja": ["Mādhava Gosvāmī Mahārāja", "B. V. Madhava Goswami Maharaja"],
  "Satya Narayana Dasa": ["Satya Nārāyaṇa Dāsa", "Satya Narayana Dasa"],
  "Prem Prayojan Prabhu": ["Prema Prayojana Prabhu", "Prem Prayojan Prabhu"],
  "Syamarani dasi": ["Śyāmarāṇī Dāsī", "Syamarani dasi, Jadurani Dasi"],
  "Jadurani Dasi (syamarani Dasi)": ["Śyāmarāṇī Dāsī", "Syamarani dasi, Jadurani Dasi"],
  "Dauji Dau Dayal Das": ["Dauji Dayāl Dās", "Dauji Dau Dayal Das"],
  "Bhakti Vijay Babaji": ["Bhakti Vijaya Bābājī", "Bhakti Vijay Babaji"],
  "Yogesh Dasa": ["Yogesh Dāsa", "Yogesh Dasa"],
  "Valmiki": ["Vālmīki", "Valmiki"],
  "Sri ramacandra Goswami": ["Rāmacandra Gosvāmī", "Sri Ramacandra Goswami"],
  "Bhakta Bandhav": ["Bhakta Bandhav", "Bhakta Bandhav Lectures"],
  "Bhakta Bandhav Lectures": ["Bhakta Bandhav", "Bhakta Bandhav Lectures"],
};
// carpetas temáticas (autores de Calibre que no son una persona)
const TEMAS = {
  Puranas: "Purāṇas", Upanisad: "Upaniṣads", Various: "Varios autores", "Cook Books": "Cocina (Cook Books)",
  "Vaisnava Song Book": "Vaiṣṇava Song Book", "Vaisnava's Biographies": "Biografías vaiṣṇavas",
  "ISKCON MEDIA VEDIC LIBRARY": "ISKCON Media Vedic Library", "Rays of The Harmonist Team": "Rays of The Harmonist",
  "Sri Caitanya Saraswat Math": "Śrī Caitanya Sārasvata Maṭha", Radharanikijay: "Radharanikijay", Estudies: "Estudios",
  Diccionary: "Diccionarios", "Sajjana-Tosani": "Sajjana-toṣaṇī", Narayana: "Varios autores",
  Siva: "Otras tradiciones", "Swami Sivananda": "Otras tradiciones", "Swami Krishnananda": "Otras tradiciones",
  "Swami Vijnanananda": "Otras tradiciones", "Dr. John (Ellsworth) Hutchison-Hall": "Otras tradiciones",
};

// ---- lo que ya hay en la app
const app = new DatabaseSync(dbPath, { readOnly: true });
const docsApp = new Map();
for (const d of app.prepare("select id,title from docs where deleted is null").all()) {
  const k = fold(d.title); if (k) (docsApp.get(k) || docsApp.set(k, []).get(k)).push(d.id);
}
const sourcesApp = new Set(app.prepare("select source from docs where source like 'calibre:%' and deleted is null").all().map((r) => r.source));
const personsApp = app.prepare("select id,name from persons").all();
const personName = new Map(personsApp.map((p) => [p.id, p.name]));
const personByName = new Map(personsApp.map((p) => [fold(p.name), p.id]));

// ---- libros de Calibre
const cal = new DatabaseSync(CAL + "/metadata.db", { readOnly: true });
const rows = cal.prepare(`
  select b.id, b.title, b.path,
    (select a.name from authors a join books_authors_link l on l.author=a.id where l.book=b.id order by l.id limit 1) as autor,
    (select group_concat(s.name) from series s join books_series_link l on l.series=s.id where l.book=b.id) as serie,
    (select name from data where book=b.id and format='PDF') as pdfname
  from books b order by b.id`).all();
const langOf = cal.prepare("select l.lang_code from languages l join books_languages_link k on k.lang_code=l.id where k.book=?");

function destino(autor) {
  const m = MAPA[autor];
  if (m === undefined) return { error: "autor sin asignar" };
  if (typeof m === "number") {
    // los de Nārāyaṇa Mahārāja siguen en su carpeta de siempre
    return { dir: m === 1809 ? "Libros/Nārāyaṇa Mahārāja" : "Libros/" + personName.get(m), ficha: m };
  }
  if (m === "nueva") { const [nombre] = NUEVAS[autor] || [autor]; return { dir: "Libros/" + nombre, nueva: autor }; }
  return { dir: "Libros/" + (TEMAS[autor] || autor) };
}

let libros = [];
const titulos = new Map();
for (const r of rows) titulos.set(fold(r.title), (titulos.get(fold(r.title)) || 0) + 1);
for (const r of rows) {
  const dir = path.join(CAL, r.path);
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir);
  const pdf = files.find((x) => /\.pdf$/i.test(x));
  const lang = (langOf.all(r.id)[0] || {}).lang_code || "";
  const dest = destino(r.autor || "");
  let title = r.title.trim();
  if (titulos.get(fold(r.title)) > 1) title += ` · ${r.id}`;
  const yaEsta = docsApp.has(fold(r.title)) && !sourcesApp.has("calibre:" + r.id);
  let dirFinal = dest.dir;
  if (dirFinal && (lang === "es" || lang === "spa") && dest.ficha === 1809) dirFinal += " · español";
  libros.push({ id: r.id, title, autor: r.autor, serie: r.serie, lang, pdf: pdf ? path.join(dir, pdf).replace(/\\/g, "/") : null,
    cover: files.includes("cover.jpg") ? path.join(dir, "cover.jpg").replace(/\\/g, "/") : null, ...dest, dir: dirFinal, yaEsta });
}
libros = libros.filter((b) => !solo || b.title.toLowerCase().includes(solo)).filter((b) => !autorFiltro || (b.autor || "").toLowerCase().includes(autorFiltro));
const nuevos = libros.filter((b) => !b.yaEsta);
console.log(`${libros.length} libros en Calibre; ${libros.length - nuevos.length} ya están en la app; a importar: ${nuevos.length}`);
const sinAutor = nuevos.filter((b) => b.error);
if (sinAutor.length) console.log("SIN AUTOR ASIGNADO:", [...new Set(sinAutor.map((b) => b.autor))].join(" | "));
const fichasNuevas = new Map();
for (const b of nuevos) if (b.nueva) { const [n, aka] = NUEVAS[b.nueva]; if (!fichasNuevas.has(n)) fichasNuevas.set(n, aka); }
console.log(`Fichas nuevas (${fichasNuevas.size}):`, [...fichasNuevas.keys()].map((n) => n + (personByName.has(fold(n)) ? " (ya existe)" : "")).join(" ; "));
const porDir = new Map();
for (const b of nuevos) porDir.set(b.dir, (porDir.get(b.dir) || 0) + 1);
for (const [d, n] of [...porDir].sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(3)}  ${d}`);
const sinPdf = nuevos.filter((b) => !b.pdf);
if (sinPdf.length) console.log(`Sin PDF (se saltan): ${sinPdf.length}`);
if (dry) process.exit(0);

// ---- CDP
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

// fichas nuevas
for (const [nombre, aka] of fichasNuevas) {
  if (personByName.has(fold(nombre))) continue;
  const id = await inv("new_person", { fields: {
    name: nombre, aka, appearance: "", disappearance: "", place: "", guru: "", disciples: "", works: "",
    notes: "Ficha creada al importar la biblioteca de Calibre (23-11-2026). Por completar.", tags: "Calibre, por completar",
  } });
  console.log(typeof id === "number" ? `+ ficha #${id} ${nombre}` : `✗ ficha ${nombre}: ${JSON.stringify(id)}`);
}

// texto → párrafos → secciones (igual que narayana/cargar.mjs)
function sectionsOf(text) {
  const pages = text.split("\x0c").map((p) => p.replace(/\r/g, "").split("\n").map((l) => l.trim()));
  while (pages.length && pages[pages.length - 1].every((l) => !l)) pages.pop();
  const norm = (l) => l.replace(/\d+/g, "#").toLowerCase();
  const count = new Map();
  if (pages.length >= 8)
    for (const ls of pages) {
      const once = new Set();
      for (const l of ls) if (l && l.length < 90 && !once.has(norm(l))) (once.add(norm(l)), count.set(norm(l), (count.get(norm(l)) || 0) + 1));
    }
  const isRunning = (l) => pages.length >= 8 && l.length < 90 && (count.get(norm(l)) || 0) >= Math.max(4, pages.length * 0.25);
  const paras = [];
  let cur = "", curPage = 0, prevLen = 0;
  const flush = () => (cur && paras.push({ page: curPage, text: cur }), (cur = ""));
  pages.forEach((ls, pi) => {
    const lens = ls.filter(Boolean).map((l) => l.length).sort((a, b) => a - b);
    const maxLen = lens.length ? lens[Math.floor(lens.length * 0.9)] : 0;
    for (const l of ls) {
      if (!l) { flush(); continue; }
      if (isRunning(l)) continue;
      if (!cur) { cur = l; curPage = pi; prevLen = l.length; continue; }
      if (/[.!?:”"’)\]]$/.test(cur) && prevLen < maxLen * 0.7) { flush(); cur = l; curPage = pi; }
      else if (/[^\s]-$/.test(cur) && /^[a-zāīūṛṭḍṇśṣṁḥñáéíóúü]/.test(l)) cur = cur.slice(0, -1) + l;
      else cur += " " + l;
      prevLen = l.length;
    }
  });
  flush();
  const out = [];
  for (let g = 0; g * PAGES_PER_SECTION < pages.length; g++) {
    const from = g * PAGES_PER_SECTION, to = Math.min(pages.length, from + PAGES_PER_SECTION) - 1;
    const body = paras.filter((p) => p.page >= from && p.page <= to).map((p) => p.text).join("\n\n");
    if (body.trim().length > 20) out.push({ heading: `pp. ${from + 1}–${to + 1}`, text: body });
  }
  return out;
}

const LEGIT = /[áéíóúñüÁÉÍÓÚÑÜ¿¡°·«»©]|[Ā-őŔ-şŢ-ŷŹ-żḀ-ỿ]|[‐-―‘-„•…●]/u;
const MAX_BAD = 0.004;
const report = { ok: 0, sinTexto: [], rotos: [], error: [] };
let k = 0;
for (const b of nuevos.slice(0, limit)) {
  k++;
  const t0 = Date.now();
  if (b.error || !b.pdf) { report.sinTexto.push(`${b.title} (${b.error || "sin PDF"})`); continue; }
  const r = await inv("convert_pdf", { path: b.pdf, applyBalaram: true });
  if (!r || r.__err) { report.error.push(`${b.title}: ${r?.__err}`); console.log(`✗ ${b.title}: ${r?.__err}`); continue; }
  const letters = (r.text.match(/\p{L}/gu) || []).length;
  if (letters < 400 * Math.max(1, Math.min(r.pages, 5))) { report.sinTexto.push(`${b.title} (${r.pages} pp., ${letters} letras: escaneado)`); console.log(`— ${b.title}: sin texto`); continue; }
  const bad = [...r.text].filter((c) => c.codePointAt(0) > 126 && !LEGIT.test(c));
  if (bad.length / letters > MAX_BAD) {
    const top = [...new Set(bad)].slice(0, 8).join("");
    report.rotos.push(`${b.title} [${b.id}] (${(100 * bad.length / letters).toFixed(1)} % raros: ${top})`);
    console.log(`✗ ${b.title}: letras rotas ${(100 * bad.length / letters).toFixed(1)} % (${top}) — no se importa`);
    continue;
  }
  const sections = sectionsOf(r.text);
  const id = await inv("put_book", { collection: "Libros", dir: b.dir, title: b.title, date: null, source: `calibre:${b.id}`, sections, cover: b.cover });
  if (typeof id !== "number") { report.error.push(`${b.title}: put_book ${JSON.stringify(id)}`); console.log(`✗ ${b.title}: ${JSON.stringify(id)}`); continue; }
  report.ok++;
  console.log(`✓ ${k}/${nuevos.length} #${id} ${b.dir} › ${b.title} — ${r.pages} pp., ${(r.text.length / 1024).toFixed(0)} KB${r.is_balaram ? ", Balaram→IAST" : ""} (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
}
console.log(`\nHecho: ${report.ok} cargados, ${report.rotos.length} con letras rotas, ${report.sinTexto.length} sin texto, ${report.error.length} con error`);
fs.writeFileSync(path.join(AQUI, "ultimo-informe.json"), JSON.stringify(report, null, 1));
ws.close();
