// node vocab.mjs <salida.json>   (22-11-2026)  SOLO LECTURA de la BD real.
// Vocabulario de trozos de palabra con diacríticos (partido por guiones, en minúsculas) de los textos bien leídos de la
// biblioteca → { trozo: veces }. Sirve para aprender el mapa de las tipografías rotas (decodifica.mjs).
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";

const IAST = /[āīūṛṝḷḹṅñṭḍṇśṣṁṃḥ]/;
const db = new DatabaseSync(process.env.APPDATA + "/com.whispers.biodata/biodata.db", { readOnly: true });
const rows = db
  .prepare("SELECT s.text FROM sections s JOIN docs d ON d.id = s.doc_id WHERE d.deleted IS NULL AND (d.dir LIKE 'Libros/%' OR d.dir LIKE 'Versos%' OR d.dir = 'Anthology' OR d.dir LIKE 'Lectures%')")
  .iterate();
const count = new Map();
let n = 0;
for (const r of rows) {
  n++;
  const text = r.text.normalize("NFC").toLowerCase();
  for (const m of text.matchAll(/[a-zāīūṛṝḷḹṅñṭḍṇśṣṁṃḥ]+/g)) {
    const w = m[0];
    if (w.length >= 2 && IAST.test(w)) count.set(w, (count.get(w) || 0) + 1);
  }
}
const vocab = {};
for (const [w, k] of count) if (k >= 2) vocab[w] = k;
fs.writeFileSync(process.argv[2], JSON.stringify(vocab));
console.log(n, "secciones;", count.size, "trozos distintos;", Object.keys(vocab).length, "con ≥ 2 apariciones");
