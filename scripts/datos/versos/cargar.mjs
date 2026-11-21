// node cargar.mjs [puerto] [--dry] [--solo=sb4,bg]   (21-11-2026, Whisper: «un buscador de versos»)
// The verses into the app's library, collection «Versos»: one book per canto / līlā / the Gītā, one section per verse —
// heading «SB 4.1.1» / «BG 2.13» / «CC Madhya 20.57», text = the verse block «::: verse REF … :::» (its lines, IAST),
// then the translation and the synonyms. The normal search finds them without diacritics, the «Versos» page reads them
// and the lectures' verses without marks are matched against them.
// Sources (O:\Whispers\versos): libros/sb-rtf.json + libros/sb-doc.json (SB 1–9 from Śrīla Prabhupāda's RTF/DOC in
// «Biblioteca\Srila Prabhupada»), vedabase/datos/{bg,cc,sb}/*.json (vedabase.io: Gītā, Caitanya-caritāmṛta, SB 10–12).
// The same book again replaces itself (put_book by its source): a second run changes nothing.
import fs from "node:fs";
import path from "node:path";
const ROOT = "O:/Whispers/versos";
const args = process.argv.slice(2);
const port = args.find((a) => /^\d+$/.test(a)) || "9334";
const dry = args.includes("--dry");
const only = (args.find((a) => a.startsWith("--solo=")) || "").slice(7).split(",").filter(Boolean);

const LILA = { adi: "Ādi", madhya: "Madhya", antya: "Antya" };
const ORD = ["", "First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth", "Tenth", "Eleventh", "Twelfth"];
const books = new Map(); // key → { title, dir, source, sections: [] }
const add = (key, title, dir, ref, v) => {
  if (!books.has(key)) books.set(key, { title, dir, source: `versos:${key}`, sections: [] });
  const tr = (v.translation || "").trim();
  const syn = (v.synonyms || "").trim();
  books.get(key).sections.push({
    heading: ref,
    text: `::: verse ${ref}\n${v.lines.join("\n")}\n:::\n\n${tr ? `**Translation.** ${tr}\n\n` : ""}${syn ? `*Synonyms.* ${syn}\n` : ""}`,
  });
};

// Śrīmad-Bhāgavatam 1–9 (the RTF/DOC of the library)
for (const f of ["sb-rtf.json", "sb-doc.json"]) {
  const p = path.join(ROOT, "libros", f);
  if (!fs.existsSync(p)) continue;
  for (const v of JSON.parse(fs.readFileSync(p, "utf8"))) {
    const canto = v.ref.split(".")[0];
    add(`sb${canto}`, `Śrīmad-Bhāgavatam · ${ORD[canto]} Canto (verses)`, "Versos/Śrīmad-Bhāgavatam", `SB ${v.ref}`, v);
  }
}
// vedabase.io: Gītā, Caitanya-caritāmṛta, Bhāgavatam 10–12 (only whole chapters)
const VB = path.join(ROOT, "vedabase", "datos");
for (const book of ["bg", "cc", "sb"]) {
  const d = path.join(VB, book);
  if (!fs.existsSync(d)) continue;
  const files = fs.readdirSync(d).filter((f) => /^[a-z0-9]+(-\d+)?\.json$/.test(f));
  files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  for (const f of files) {
    const c = JSON.parse(fs.readFileSync(path.join(d, f), "utf8"));
    for (const v of c.verses) {
      if (!v.lines?.length) continue;
      if (book === "bg") add("bg", "Bhagavad-gītā As It Is (verses)", "Versos/Bhagavad-gītā", `BG ${c.part}.${v.ref}`, v);
      else if (book === "cc") add(`cc-${c.part}`, `Śrī Caitanya-caritāmṛta · ${LILA[c.part]}-līlā (verses)`, "Versos/Śrī Caitanya-caritāmṛta", `CC ${LILA[c.part]} ${c.chapter}.${v.ref}`, v);
      else add(`sb${c.part}`, `Śrīmad-Bhāgavatam · ${ORD[c.part]} Canto (verses)`, "Versos/Śrīmad-Bhāgavatam", `SB ${c.part}.${c.chapter}.${v.ref}`, v);
    }
  }
}
// each book's verses in order (chapter, then verse)
const num = (h) => h.match(/\d+/g).map(Number);
for (const b of books.values()) b.sections.sort((x, y) => { const a = num(x.heading), c = num(y.heading); for (let i = 0; i < Math.max(a.length, c.length); i++) if ((a[i] ?? 0) !== (c[i] ?? 0)) return (a[i] ?? 0) - (c[i] ?? 0); return 0; });

const keys = [...books.keys()].filter((k) => !only.length || only.includes(k));
let total = 0;
for (const k of keys) total += books.get(k).sections.length;
console.log(`${keys.length} libros, ${total} versos`);
if (dry) {
  for (const k of keys) console.log(`  ${k}: ${books.get(k).title} — ${books.get(k).sections.length}`);
  process.exit(0);
}
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.type === "page" && /tauri.localhost|localhost:1421/.test(p.url));
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let n = 0;
const call = (expr) =>
  new Promise((resolve) => {
    const id = ++n;
    const h = (m) => {
      const d = JSON.parse(m.data);
      if (d.id !== id) return;
      ws.removeEventListener("message", h);
      resolve(d.result?.result?.value ?? d.result);
    };
    ws.addEventListener("message", h);
    ws.send(JSON.stringify({ id, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
  });
for (const k of keys) {
  const b = books.get(k);
  const arg = { collection: "Versos", dir: b.dir, title: b.title, date: null, source: b.source, sections: b.sections, cover: null };
  const r = await call(`(async () => { try { return await window.__TAURI_INTERNALS__.invoke("put_book", ${JSON.stringify(arg)}); } catch (e) { return "ERROR " + e; } })()`);
  console.log(`${k}: ${b.title} — ${b.sections.length} versos → ${typeof r === "number" ? "#" + r : JSON.stringify(r)}`);
}
ws.close();
