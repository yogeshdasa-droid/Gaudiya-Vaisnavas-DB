// node paso4b-analiza.mjs <biodata.db con el índice de versos> [--muestras=N] [--json=salida.json]   (22-11-2026)
// Paso 4 SOBRE EL ÍNDICE (verse_index, lo construye la app: «Versos» › primera vez / «Volver a hacerlo»). SOLO LECTURA.
// En las charlas (Lectures Gurudeva, Anthology, Lectures of Śrīla Nārāyaṇa…), un verso escrito SIN diacríticos que sea,
// completo, una de las escrituras (o la mejor) de una entrada del índice pasa a bloque `::: verse [REF] … :::` con la
// mejor escritura. Se conservan los saltos de línea de la charla cuando las palabras coinciden una a una; si no, la mejor
// escritura va en una línea (o en las líneas de Vedabase si tiene referencia).
// Exporta loadIndexVerses / buildIndexB / findInTextB para paso4b-aplica.mjs.
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { fold, clean } from "./paso4-analiza.mjs";

const IAST = /[āīūṛṝḷḹṅñṭḍṇśṣṁṃḥ]/i;

export function loadIndexVerses(db) {
  const rows = db.prepare("SELECT id, best, reference, keys FROM verse_index").all();
  return rows.map((r) => {
    const lines = r.best.split("\n").map((x) => x.trim()).filter(Boolean);
    const forms = new Set(r.keys.split("|").filter((k) => k.length >= 30));
    const fb = fold(lines.join(" "));
    if (fb.length >= 30) forms.add(fb);
    return { id: r.id, ref: r.reference || "", lines, fb, forms: [...forms], hasMarks: IAST.test(r.best) };
  }).filter((v) => v.hasMarks && v.forms.length && !/[\]\[?]|["”]\s*$/.test(v.lines.join(" "))); // junk left in the best writing (?, "], closing quote) → leave the lecture alone
}

export function buildIndexB(verses) {
  const whole = new Map(), start = new Map();
  for (const v of verses) for (const f of v.forms) {
    (whole.get(f) || whole.set(f, []).get(f)).push(v);
    const k = f.slice(0, 14);
    (start.get(k) || start.set(k, new Set()).get(k)).add(v);
  }
  return { whole, start };
}

/** the verse written with the lines of the lecture when its words match the best one by one */
function rewrite(v, rawLines) {
  const bestWords = v.lines.join(" ").split(/\s+/).filter(Boolean);
  const rawWords = rawLines.map((l) => l.split(/\s+/).filter(Boolean));
  const flat = rawWords.flat();
  const same = flat.length === bestWords.length && flat.every((w, i) => fold(w) === fold(bestWords[i]));
  let lines;
  if (same) {
    let k = 0;
    lines = rawWords.map((ws) => ws.map(() => bestWords[k++]).join(" "));
  } else lines = v.lines;
  return `::: verse${v.ref ? " " + v.ref : ""}\n${lines.join("\n")}\n:::`;
}

export function findInTextB(text, idx) {
  const L = text.split("\n");
  const out = [];
  let partial = 0, withMarks = 0;
  for (let i = 0; i < L.length; i++) {
    const c0 = clean(L[i]);
    if (c0.split(/\s+/).length < 2 || fold(c0).length < 14) continue;
    if (!idx.start.has(fold(c0).slice(0, 14))) continue;
    let acc = "", raw = [], found = null;
    for (let j = i; j < Math.min(L.length, i + 9); j++) {
      const cj = clean(L[j]);
      if (!cj) break;
      acc += fold(cj);
      raw.push(cj);
      const w = idx.whole.get(acc);
      // only when what the lecture has is the WHOLE best writing (a half quote is left alone: it would gain lines)
      const whole = w && w.filter((x) => x.fb === acc);
      if (whole && whole.length) { found = { j, v: whole[0], ambiguous: new Set(whole.map((x) => x.id)).size > 1 }; break; }
      if (acc.length > 900) break;
    }
    if (!found) { partial++; continue; }
    if (IAST.test(raw.join(" "))) { withMarks++; i = found.j; continue; }
    out.push({ from: i, to: found.j, id: found.v.id, ref: found.v.ref, block: rewrite(found.v, raw), raw: raw.join(" / "), ambiguous: found.ambiguous });
    i = found.j;
  }
  return { out, partial, withMarks };
}

if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("paso4b-analiza.mjs")) {
  const dbPath = process.argv[2];
  const nSamples = Number((process.argv.find((a) => a.startsWith("--muestras=")) || "").slice(11)) || 14;
  const jsonOut = (process.argv.find((a) => a.startsWith("--json=")) || "").slice(7);
  const db = new DatabaseSync(dbPath, { readOnly: true });
  const verses = loadIndexVerses(db);
  const idx = buildIndexB(verses);
  console.log(`entradas del índice con diacríticos: ${verses.length} (escrituras distintas: ${idx.whole.size})`);
  const secs = db.prepare("SELECT s.doc_id, s.ordinal, s.text, d.title FROM sections s JOIN docs d ON d.id = s.doc_id WHERE d.deleted IS NULL AND (d.dir LIKE 'Lectures Gurudeva%' OR d.dir = 'Anthology' OR d.dir LIKE 'Lectures of%')").all();
  let n = 0, partial = 0, withMarks = 0, ambiguous = 0, secsWith = 0, noRef = 0;
  const all = [], byId = new Map();
  for (const s of secs) {
    const r = findInTextB(s.text, idx);
    partial += r.partial; withMarks += r.withMarks;
    if (r.out.length) secsWith++;
    for (const m of r.out) { n++; if (m.ambiguous) ambiguous++; if (!m.ref) noRef++; byId.set(m.id, (byId.get(m.id) || 0) + 1); all.push({ doc: s.doc_id, ordinal: s.ordinal, title: s.title, ...m }); }
  }
  console.log(`secciones revisadas: ${secs.length} | con algún verso para cambiar: ${secsWith}`);
  console.log(`versos completos sin diacríticos: ${n} (con referencia de Vedabase: ${n - noRef}, de otros libros: ${noRef}; dudosos: ${ambiguous}) | ya con diacríticos: ${withMarks} | a medias: ${partial}`);
  const step = Math.max(1, Math.floor(all.length / nSamples));
  for (let i = 0; i < all.length && i / step < nSamples; i += step) {
    const m = all[i];
    console.log(`\n[${m.title.slice(0, 50)} · sec ${m.ordinal}] ${m.ref || "(sin ref)"}\n  antes:   ${m.raw.slice(0, 170)}\n  después: ${m.block.split("\n").slice(1, -1).join(" / ").slice(0, 170)}`);
  }
  if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(all));
}
