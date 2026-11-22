// node cargar.mjs [puerto] [--dry] [--solo=texto] [--limit=N]   (22-11-2026, Whisper: «todos esos libros en la app»)
// Los libros de «Biblioteca\Sri Srimad Bhaktivedanta Narayana\Books» (formato Calibre: PDF + cover.jpg + metadata.opf)
// como libros completos de la colección «Libros»: el texto lo saca `convert_pdf` de la app (pdftotext, Balaram → IAST),
// las líneas cortadas se juntan en párrafos, se quitan títulos corrientes y números de página, y cada ≈ 6 páginas son
// una sección («pp. 1–6») para el índice del lector. Título y portada, de metadata.opf y cover.jpg. El mismo libro
// (origen «narayana:<id de Calibre>») se reemplaza a sí mismo: una segunda pasada no duplica nada.
// Los PDF originales NO se guardan (1,4 GB): solo el texto y la portada.
import fs from "node:fs";
import path from "node:path";

const ROOT = "O:/Gaudiya Vaisnavas DB/Biblioteca/Sri Srimad Bhaktivedanta Narayana/Books";
const args = process.argv.slice(2);
const port = args.find((a) => /^\d{4,5}$/.test(a)) || "9334";
const dry = args.includes("--dry");
const solo = (args.find((a) => a.startsWith("--solo=")) || "").slice(7).toLowerCase();
const limit = Number((args.find((a) => a.startsWith("--limit=")) || "").slice(8)) || Infinity;
const PAGES_PER_SECTION = 6;
const DIR_EN = "Libros/Nārāyaṇa Mahārāja";
const DIR_ES = "Libros/Nārāyaṇa Mahārāja · español";

const decode = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
const tag = (xml, name) => {
  const m = xml.match(new RegExp(`<dc:${name}[^>]*>([\\s\\S]*?)</dc:${name}>`));
  return m ? decode(m[1]).replace(/\s+/g, " ").trim() : "";
};

// ---- the books
const folders = fs.readdirSync(ROOT, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
let books = [];
for (const f of folders) {
  const dir = path.join(ROOT, f).replace(/\\/g, "/");
  const files = fs.readdirSync(dir);
  const pdf = files.find((x) => /\.pdf$/i.test(x));
  const opfName = files.find((x) => /\.opf$/i.test(x));
  const opf = opfName ? fs.readFileSync(path.join(dir, opfName), "utf8") : "";
  const id = (f.match(/\((\d+)\)\s*$/) || [])[1] || f;
  books.push({
    folder: f, id,
    pdf: pdf ? `${dir}/${pdf}` : null,
    epub: files.find((x) => /\.(epub|original_epub)$/i.test(x)) ? `${dir}/${files.find((x) => /\.(epub|original_epub)$/i.test(x))}` : null,
    cover: files.includes("cover.jpg") ? `${dir}/cover.jpg` : null,
    title: tag(opf, "title") || f.replace(/\s*\(\d+\)\s*$/, ""),
    lang: tag(opf, "language"),
  });
}
// the same title twice (editions): tell them apart by the edition in the folder name
const seen = new Map();
for (const b of books) seen.set(b.title, (seen.get(b.title) || 0) + 1);
for (const b of books) {
  if (seen.get(b.title) > 1) {
    const ed = b.folder.match(/\b(\d+(?:st|nd|rd|th)(?: ed)?)\b/i);
    b.title += ` · ${ed ? ed[1] : b.id}`;
  }
}
books = books.filter((b) => !solo || (b.title + b.folder).toLowerCase().includes(solo)).slice(0, limit);

// ---- text → paragraphs → sections
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
  const paras = []; // { page, text }
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

// ---- run
console.log(`${books.length} libros${solo ? ` (filtro «${solo}»)` : ""}`);
if (dry) {
  for (const b of books) console.log(`${b.id.padEnd(5)} ${(b.lang || "?").padEnd(4)} ${b.pdf ? "pdf " : b.epub ? "EPUB" : "—   "} ${b.cover ? "cover" : "sin-cover"}  ${b.title}`);
  process.exit(0);
}
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

const LEGIT = /[áéíóúñüÁÉÍÓÚÑÜ¿¡°·«»©]|[Ā-őŔ-şŢ-ŷŹ-żḀ-ỿ]|[‐-―‘-„•…●]/u;
const MAX_BAD = 0.004;
const report = { ok: [], sinTexto: [], rotos: [], error: [] };
for (const b of books) {
  const t0 = Date.now();
  if (!b.pdf) { report.sinTexto.push(`${b.title} (${b.epub ? "solo EPUB" : "sin PDF"})`); console.log(`— ${b.title}: sin PDF`); continue; }
  const r = await inv("convert_pdf", { path: b.pdf, applyBalaram: true });
  if (!r || r.__err) { report.error.push(`${b.title}: ${r?.__err}`); console.log(`✗ ${b.title}: ${r?.__err}`); continue; }
  const letters = (r.text.match(/\p{L}/gu) || []).length;
  if (letters < 400 * Math.max(1, Math.min(r.pages, 5))) { report.sinTexto.push(`${b.title} (${r.pages} pp., ${letters} letras: escaneado)`); console.log(`— ${b.title}: sin texto (¿escaneado?)`); continue; }
  // letras con diacrítico mal leídas (tipografías sánscritas propias que la app aún no conoce): no se importa roto
  const bad = [...r.text].filter((c) => c.codePointAt(0) > 126 && !LEGIT.test(c));
  if (bad.length / letters > MAX_BAD) {
    const top = [...new Set(bad)].slice(0, 8).join("");
    report.rotos.push(`${b.title} (${(100 * bad.length / letters).toFixed(1)} % raros: ${top})`);
    console.log(`✗ ${b.title}: letras rotas ${(100 * bad.length / letters).toFixed(1)} % (${top}) — no se importa`);
    continue;
  }
  const sections = sectionsOf(r.text);
  const id = await inv("put_book", {
    collection: "Libros", dir: /espa[nñ]ol/i.test(b.folder + b.title) ? DIR_ES : DIR_EN, title: b.title, date: null,
    source: `narayana:${b.id}`, sections, cover: b.cover,
  });
  if (typeof id !== "number") { report.error.push(`${b.title}: put_book ${JSON.stringify(id)}`); console.log(`✗ ${b.title}: ${JSON.stringify(id)}`); continue; }
  report.ok.push(b.title);
  console.log(`✓ #${id} ${b.title} — ${r.pages} pp. → ${sections.length} secciones, ${(r.text.length / 1024).toFixed(0)} KB${r.is_balaram ? ", Balaram→IAST" : ""} (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
}
console.log(`\nHecho: ${report.ok.length} cargados, ${report.rotos.length} con letras rotas (sin importar), ${report.sinTexto.length} sin texto, ${report.error.length} con error`);
report.rotos.forEach((x) => console.log("  roto:", x));
report.sinTexto.forEach((x) => console.log("  sin texto:", x));
report.error.forEach((x) => console.log("  error:", x));
ws.close();
