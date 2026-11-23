// node hk.mjs <biodata.db> [--ids=6061,6158,…] [--vocab=<vocab.json>] [--aplicar=<puerto>]   (23-11-2026)
// Textos de la biblioteca escritos en transliteración ASCII con mayúsculas por vocales largas y letras puntuadas
// (Harvard-Kyoto y variantes: «gAndharvikA vihAra lIlA», «kRZNa», «SrImad bhAgavata») → IAST con diacríticos.
//   A I U → ā ī ū · R → ṛ (RR ṝ, lR ḷ) · M → ṁ · H → ḥ · T D N → ṭ ḍ ṇ · G → ṅ · J → ñ · Z → ṣ
//   esquema «hk»: z → ś, S → ṣ  |  esquema «sz»: S → ś, z → ṣ     (se elige POR TEXTO: el que más palabras
//   convertidas encuentra en el vocabulario de la BD)
// Solo se tocan las palabras que empiezan en minúscula y llevan una de esas mayúsculas por dentro (el inglés normal
// no las tiene). Sin --aplicar solo enseña ejemplos. Con --aplicar reemplaza cada documento entero con put_book.
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";

const args = process.argv.slice(2);
const dbPath = args.find((a) => a.endsWith(".db"));
const val = (k) => (args.find((a) => a.startsWith(`--${k}=`)) || "").slice(k.length + 3);
const ids = val("ids").split(",").filter(Boolean).map(Number);
const vocabPath = val("vocab");
const port = val("aplicar");
const fold = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const db = new DatabaseSync(dbPath, { readOnly: true });
let vocab = new Set();
if (vocabPath) vocab = new Set(Object.keys(JSON.parse(fs.readFileSync(vocabPath, "utf8"))));

const TOKEN = /(?<![A-Za-z])[a-z][a-zAIURMHTDNSGJZz]*[AIURMHTDNSGJZ][a-zAIURMHTDNSGJZz]*(?![A-Za-z])/g;
const TOKEN_UP = /(?<![A-Za-z])(?=[A-Za-z]*[a-z])[A-Z][a-zAIURMHTDNSGJZz]*[AIURMHTDNSGJZ][a-zAIURMHTDNSGJZz]*(?![A-Za-z])/g;
const NO = new Set(["PhD", "McDonald", "YouTube", "JavaScript", "WiFi", "iPhone", "iPad", "eBook", "iOS", "iTunes", "eMail", "pH"]);
const BASE = { A: "ā", I: "ī", U: "ū", R: "ṛ", M: "ṁ", H: "ḥ", T: "ṭ", D: "ḍ", N: "ṇ", G: "ṅ", J: "ñ", Z: "ṣ" };
export function convertToken(w, scheme) {
  return w
    .replace(/lR/g, "ḷ").replace(/RR/g, "ṝ")
    .replace(/[AIURMHTDNGJZSz]/g, (c) => (c === "S" ? (scheme === "hk" ? "ṣ" : "ś") : c === "z" ? (scheme === "hk" ? "ś" : "ṣ") : BASE[c]));
}
export function convertUp(w, scheme) {
  // capitalised word with HK marks inside: the first letter only changes when it is a long vowel (ISvaraH → Īśvaraḥ) or Ś
  const first = w[0], rest = convertToken(w.slice(1), scheme);
  const cap = { A: "Ā", I: "Ī", U: "Ū", Z: "Ṣ" }[first] ?? (first === "S" && scheme === "sz" ? "Ś" : first);
  return cap + rest;
}
export function convertText(text, scheme) {
  return text
    .replace(TOKEN, (w) => (NO.has(w) ? w : convertToken(w, scheme)))
    .replace(TOKEN_UP, (w) => {
      if (NO.has(w) || /^(Mc|Mac)/.test(w)) return w;
      const c = convertUp(w, scheme);
      return vocab.has(c.toLowerCase()) ? c : w; // only when the result is a known word (English words stuck together stay)
    });
}
function score(text, scheme) {
  const toks = [...new Set(text.match(TOKEN) || [])].filter((w) => !NO.has(w));
  if (!toks.length) return { n: 0, pct: 0 };
  const hit = toks.filter((w) => vocab.has(convertToken(w, scheme).toLowerCase())).length;
  return { n: toks.length, pct: Math.round((100 * hit) / toks.length) };
}

const plan = [];
for (const id of ids) {
  const d = db.prepare("SELECT id, collection, dir, title, date, source FROM docs WHERE id = ? AND deleted IS NULL").get(id);
  if (!d) { console.log(`#${id}: no existe`); continue; }
  const secs = db.prepare("SELECT heading, text FROM sections WHERE doc_id = ? ORDER BY ordinal").all(id);
  const all = secs.map((s) => s.text).join("\n\n");
  const a = score(all, "hk"), b = score(all, "sz");
  const scheme = b.pct > a.pct ? "sz" : "hk";
  const sections = secs.map((s) => ({ heading: s.heading, text: convertText(s.text, scheme) }));
  const changed = secs.filter((s, i) => s.text !== sections[i].text).length;
  console.log(`\n=== #${id} ${d.title.slice(0, 60)} | ${d.dir.slice(0, 40)}\n    palabras distintas ${a.n}; vocabulario: hk ${a.pct}% · sz ${b.pct}% → «${scheme}»; secciones cambiadas ${changed}/${secs.length}`);
  const toks = [...new Set(all.match(TOKEN) || [])].slice(0, 12);
  console.log("    " + toks.map((w) => `${w}→${convertToken(w, scheme)}`).join("  "));
  const para = all.split(/\n\s*\n/).find((p) => (p.match(TOKEN) || []).length >= 3 && p.length < 500);
  if (para) console.log("    antes:   " + para.replace(/\s+/g, " ").slice(0, 260) + "\n    después: " + convertText(para, scheme).replace(/\s+/g, " ").slice(0, 260));
  const ups = [...new Set(all.match(TOKEN_UP) || [])].filter((w) => !NO.has(w)).slice(0, 40);
  if (ups.length) console.log("    mayúscula inicial: " + ups.map((w) => `${w}→${convertText(w, scheme)}`).join("  "));
  plan.push({ d, sections, changed, scheme });
}
if (!port) process.exit(0);

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
console.log("");
for (const p of plan) {
  if (!p.changed) continue;
  const src = p.d.source || `hk:${p.d.id}`;
  const id = await inv("put_book", { collection: p.d.collection, dir: p.d.dir, title: p.d.title, date: p.d.date, source: src, sections: p.sections, cover: null });
  console.log(typeof id === "number" ? `✓ #${id} ${p.d.title.slice(0, 50)} (${p.scheme})` : `✗ ${p.d.title}: ${JSON.stringify(id)}`);
}
ws.close();
