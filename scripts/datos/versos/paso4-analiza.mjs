// node paso4-analiza.mjs <biodata.db> [--muestras=N] [--json=salida.json]     (22-11-2026, paso 4 de los versos)
// SOLO LECTURA. En las charlas (Lectures Gurudeva, Anthology, Lectures of Śrīla Nārāyaṇa…) busca versos escritos SIN
// diacríticos que sean, completos, uno de los de la colección «Versos»: compara el texto plegado (sin acentos, solo a–z) y,
// si coincide el verso entero, propone cambiarlo por el bloque `::: verse REF … :::` con sus diacríticos y sus líneas.
// No toca líneas que ya llevan diacríticos, ni versos a medias (los cuenta aparte).
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";

export const fold = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]/g, "");
const IAST = /[āīūṛṝḷḹṅñṭḍṇśṣṁṃḥ]/i;
export const clean = (l) => l.trim().replace(/^(>\s*)+/, "").replace(/^[*_]+|[*_]+$/g, "").replace(/^\(?\d+[.)]\s+/, "").trim();

export function loadVerses(db) {
  const rows = db.prepare("SELECT s.text, s.heading, d.title FROM sections s JOIN docs d ON d.id = s.doc_id WHERE d.deleted IS NULL AND d.dir LIKE 'Versos/%'").all();
  const verses = [];
  for (const r of rows) {
    const m = r.text.match(/^::: verse ([^\n]+)\n([\s\S]*?)\n:::/);
    if (!m) continue;
    const lines = m[2].split("\n").map((x) => x.trim()).filter(Boolean);
    const f = fold(lines.join(" "));
    if (f.length >= 24 && lines.length >= 1) verses.push({ ref: m[1].trim(), lines, f, block: `::: verse ${m[1].trim()}\n${lines.join("\n")}\n:::` });
  }
  return verses;
}

export function buildIndex(verses) {
  const whole = new Map(); // folded whole verse → [verse]
  const start = new Map(); // first 14 letters of a verse → [verse]
  for (const v of verses) {
    (whole.get(v.f) || whole.set(v.f, []).get(v.f)).push(v);
    const k = v.f.slice(0, 14);
    (start.get(k) || start.set(k, []).get(k)).push(v);
  }
  return { whole, start };
}

/** matches in one section's text: [{from, to, ref, block, raw}] (line numbers, inclusive) */
export function findInText(text, idx) {
  const L = text.split("\n");
  const out = [];
  let partial = 0, withMarks = 0;
  for (let i = 0; i < L.length; i++) {
    const c0 = clean(L[i]);
    if (c0.split(/\s+/).length < 2 || fold(c0).length < 14) continue;
    const cands = idx.start.get(fold(c0).slice(0, 14));
    if (!cands) continue;
    // grow over the following non-empty lines until the folded text is a whole verse
    let acc = "", raw = [], found = null;
    for (let j = i; j < Math.min(L.length, i + 9); j++) {
      const cj = clean(L[j]);
      if (!cj) break;
      acc += fold(cj);
      raw.push(cj);
      const w = idx.whole.get(acc);
      if (w) { found = { j, v: w[0], ambiguous: w.length > 1 && new Set(w.map((x) => x.ref)).size > 1 }; break; }
      if (acc.length > 700) break;
    }
    if (!found) { partial++; continue; }
    if (IAST.test(raw.join(" "))) { withMarks++; i = found.j; continue; } // already written with diacritics
    out.push({ from: i, to: found.j, ref: found.v.ref, block: found.v.block, raw: raw.join(" / "), ambiguous: found.ambiguous });
    i = found.j;
  }
  return { out, partial, withMarks };
}

if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("paso4-analiza.mjs")) {
  const dbPath = process.argv[2];
  const nSamples = Number((process.argv.find((a) => a.startsWith("--muestras=")) || "").slice(11)) || 12;
  const jsonOut = (process.argv.find((a) => a.startsWith("--json=")) || "").slice(7);
  const db = new DatabaseSync(dbPath, { readOnly: true });
  const verses = loadVerses(db);
  const idx = buildIndex(verses);
  console.log(`versos en «Versos»: ${verses.length} (únicos por texto: ${idx.whole.size})`);
  const secs = db.prepare("SELECT s.doc_id, s.ordinal, s.text, d.title, d.dir FROM sections s JOIN docs d ON d.id = s.doc_id WHERE d.deleted IS NULL AND (d.dir LIKE 'Lectures Gurudeva%' OR d.dir = 'Anthology' OR d.dir LIKE 'Lectures of%')").all();
  let n = 0, partial = 0, withMarks = 0, ambiguous = 0, secsWith = 0;
  const byRef = new Map(), all = [], docs = new Set();
  for (const s of secs) {
    const r = findInText(s.text, idx);
    partial += r.partial; withMarks += r.withMarks;
    if (r.out.length) { secsWith++; docs.add(s.doc_id); }
    for (const m of r.out) { n++; if (m.ambiguous) ambiguous++; byRef.set(m.ref, (byRef.get(m.ref) || 0) + 1); all.push({ doc: s.doc_id, ordinal: s.ordinal, title: s.title, ...m }); }
  }
  console.log(`secciones revisadas: ${secs.length} | con algún verso para cambiar: ${secsWith} (en ${docs.size} textos)`);
  console.log(`versos completos y sin diacríticos para cambiar: ${n} (referencia dudosa: ${ambiguous}) | ya con diacríticos (no se tocan): ${withMarks} | solo empiezan igual, no completos: ${partial}`);
  console.log("más repetidos:", [...byRef.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `${k} ×${v}`).join(" | "));
  const step = Math.max(1, Math.floor(all.length / nSamples));
  for (let i = 0; i < all.length && i / step < nSamples; i += step) {
    const m = all[i];
    console.log(`\n[${m.title.slice(0, 50)} · sec ${m.ordinal} · líneas ${m.from + 1}-${m.to + 1}] → ${m.ref}\n  antes:   ${m.raw.slice(0, 170)}\n  después: ${m.block.split("\n").slice(1, -1).join(" / ").slice(0, 170)}`);
  }
  if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(all));
}
