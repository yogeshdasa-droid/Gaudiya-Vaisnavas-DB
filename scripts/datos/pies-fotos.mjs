// Pies de foto de las galerías de los tīrthas (place_images.name).
//   node pies-fotos.mjs <biodata.db> <plan.json> [--dry]
// 1. Arregla los nombres con los acentos estropeados («MathurÄ» → «Mathurā»: UTF-8 leído como Windows-1252).
// 2. Pone el pie del plan { "<id>": ["<nombre de archivo sin .jpg>", "<pie>"] } solo si la foto aún se llama así
//    (una 2.ª pasada no cambia nada).
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";

const [dbPath, planPath, dry] = process.argv.slice(2);
const plan = planPath ? JSON.parse(fs.readFileSync(planPath, "utf8")) : {};
const db = new DatabaseSync(dbPath);

// Windows-1252: carácter → byte
const back = new Map();
const dec = new TextDecoder("windows-1252");
for (let b = 0; b < 256; b++) back.set(dec.decode(new Uint8Array([b])), b);
function unmangle(s) {
  if (!/[ÃÄÅáâ][\u0080-ÿŒ-™]/.test(s)) return null;
  const bytes = [];
  for (const ch of s) {
    const b = back.get(ch);
    if (b === undefined) return null;
    bytes.push(b);
  }
  try {
    const out = new TextDecoder("utf-8", { fatal: true }).decode(new Uint8Array(bytes));
    return out !== s ? out : null;
  } catch {
    return null;
  }
}

const rows = db.prepare("SELECT id, name FROM place_images ORDER BY id").all();
const set = db.prepare("UPDATE place_images SET name = ? WHERE id = ?");
let fixed = 0, captioned = 0, skipped = 0;
db.exec("BEGIN");
for (const r of rows) {
  let name = r.name;
  const u = unmangle(name);
  if (u) (name = u), fixed++;
  const p = plan[r.id];
  if (p) {
    if (name.replace(/\.\w+$/, "") === p[0]) (name = p[1]), captioned++;
    else if (name !== p[1]) skipped++, console.log("salto", r.id, JSON.stringify(r.name));
  }
  if (name !== r.name && !dry) set.run(name, r.id);
}
// 3. El crédito de las fotos de Vraja en «source» de los lugares, también estropeado (fotos-mas.mjs, 12-11-2026)
const CREDIT =
  "Photos: Śrī Vraja-maṇḍala Parikramā (Gaudiya Vedanta Publications, 2007; photographs courtesy of Hemant Kumar, Kāliya-damana dāsa, Śāradā dāsī, Rūpa-Raghunātha dāsa Brahmacārī, Bhakta Charles and others), for private use.";
const BAD = dec.decode(new TextEncoder().encode(CREDIT));
let credits = 0;
const setSrc = db.prepare("UPDATE places SET source = ? WHERE id = ?");
for (const p of db.prepare("SELECT id, source FROM places WHERE instr(source, ?) > 0").all(BAD)) {
  let s = p.source.includes(CREDIT) ? p.source.split(BAD).join("") : p.source.split(BAD).join(CREDIT);
  s = s.replace(/[ \t]{2,}/g, " ").replace(/\s+$/, "");
  if (s !== p.source) (credits++, dry || setSrc.run(s, p.id));
}
db.exec(dry ? "ROLLBACK" : "COMMIT");
console.log({ fotos: rows.length, acentos: fixed, pies: captioned, saltadas: skipped, creditos: credits, dry: !!dry });
