import { DatabaseSync } from "node:sqlite";
import { runs as raw } from "./indice-runs.mjs";
const fold = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]/g, "");
const IAST = /[āīūṛṝḷḹṅñṭḍṇśṣṁṃḥ]/i;
function refine(run) {
  if (/\.{4,}|…{2}/.test(run)) return null;
  if (/\S--\S/.test(run) || /\S\s[–—]\s\S+;/.test(run) || (run.match(/;/g) || []).length >= 3) return null; // word-by-word synonyms, lists
  if (/sakh[īi]s?\b.*\(\d\)/.test(run) || /\(\d\)\s.*\(\d\)\s.*\(\d\)/.test(run)) return null; // numbered lists
  let t = run.split(/\s+/);
  while (t.length && (/^[A-ZĀĪŪṚṂŚṢṆṬḌ]/.test(t[0]) || /^[\d(]/.test(t[0]))) t.shift();   // titles / numbers at the start
  while (t.length && /^[\d()\-–.,;:]+$|^[A-ZĀĪŪṚṂŚṢṆṬḌ]/.test(t[t.length - 1]) && !/[|।]/.test(t[t.length - 1])) t.pop();
  if (t.length < 8 || t.length > 90) return null;
  const upper = t.filter((w) => /^[A-ZĀĪŪṚṂŚṢṆṬḌ]/.test(w)).length;
  if (upper / t.length > 0.2) return null;
  if (t.filter((w) => IAST.test(w)).length / t.length < 0.4) return null;
  return t.join(" ");
}
const db = new DatabaseSync(process.env.APPDATA + "/com.whispers.biodata/biodata.db", { readOnly: true });
const rows = db.prepare("SELECT s.doc_id,s.ordinal,s.text,d.title,d.dir FROM sections s JOIN docs d ON d.id=s.doc_id WHERE d.deleted IS NULL AND d.dir NOT LIKE 'Versos%'").all();
const byF = new Map(); let total = 0;
for (const r of rows) for (const x of raw(r.text)) { const v = refine(x); if (!v) continue; total++; const f = fold(v); if (f.length < 30) continue;
  let e = byF.get(f); if (!e) byF.set(f, e = { best: v, n: 0, docs: new Set() });
  e.n++; e.docs.add(r.doc_id); if ((v.match(/[āīūṛṝḷḹṅñṭḍṇśṣṁṃḥ]/gi) || []).length > (e.best.match(/[āīūṛṝḷḹṅñṭḍṇśṣṁṃḥ]/gi) || []).length) e.best = v; }
console.log("secciones", rows.length, "versos hallados", total, "distintos", byF.size);
const top = [...byF.values()].sort((a, b) => b.docs.size - a.docs.size);
console.log("en ≥2 textos:", top.filter((e) => e.docs.size >= 2).length);
for (const e of top.slice(0, 12)) console.log(e.docs.size, "|", e.best.slice(0, 150));
console.log("--- al azar (1 texto)"); const one = top.filter((e) => e.docs.size === 1); for (let i = 0; i < 12; i++) console.log("·", one[Math.floor(Math.random() * one.length)].best.slice(0, 150));
// --- agrupar variantes de un mismo verso (22-11-2026): dos escrituras comparten ≥1 ventana de 28 letras plegadas
const items = [...byF.values()].filter((e) => !/ · /.test(e.best));
const fl = items.map((e) => fold(e.best));
const par = items.map((_, i) => i);
const find = (i) => { while (par[i] !== i) i = par[i] = par[par[i]]; return i; };
const win = new Map();
const W = 36;
const freq = new Map();
fl.forEach((f) => { const seen = new Set(); for (let p = 0; p + W <= f.length; p++) seen.add(f.slice(p, p + W)); for (const w of seen) freq.set(w, (freq.get(w) || 0) + 1); });
fl.forEach((f, i) => {
  for (let p = 0; p + W <= f.length; p++) {
    const w = f.slice(p, p + W);
    if (freq.get(w) > 40) continue; // refrain (hare krsna…, namaste…): joins different verses
    const j = win.get(w);
    if (j === undefined) win.set(w, i); else par[find(i)] = find(j);
  }
});
const groups = new Map();
items.forEach((e, i) => { const r = find(i); (groups.get(r) || groups.set(r, []).get(r)).push(e); });
const dia = (s) => (s.match(/[āīūṛṝḷḹṅñṭḍṇśṣṁṃḥ]/gi) || []).length;
const verses = [...groups.values()].map((m) => {
  const docs = new Set(); m.forEach((e) => e.docs.forEach((d) => docs.add(d)));
  const lens = m.map((e) => e.best.length).sort((a, b) => a - b), med = lens[lens.length >> 1];
  const ok = m.filter((e) => e.best.length >= med * 0.8 && e.best.length <= med * 1.25);
  const best = (ok.length ? ok : m).sort((a, b) => dia(b.best) / b.best.length - dia(a.best) / a.best.length)[0].best;
  return { best, variants: m.length, docs: docs.size };
}).sort((a, b) => b.docs - a.docs);
console.log("=== tras agrupar variantes:", verses.length, "versos; en ≥2 textos:", verses.filter((v) => v.docs >= 2).length, "; grupos con >30 variantes:", verses.filter((v) => v.variants > 30).length);
for (const v of verses.slice(0, 8)) console.log(v.docs, "textos,", v.variants, "variantes |", v.best.slice(0, 130));
const pf = process.argv[2] ? fold(process.argv[2]) : "bhaktyavihinaaparadha";
for (const v of verses) if (fold(v.best).includes(pf)) console.log("PRUEBA →", v.docs, "textos,", v.variants, "variantes |", v.best);
