// node poetas-plan.mjs <db> <out.json> [placed.json]   (06-11-2026)
// The records outside the Guru Paramparā that are Vaiṣṇava poets (padakartās) with no clear guru:
// their notes or first lines say «poet», «padakartā», «padas», «bhaṇitā»… → [{id, name, why}] for the label «Poetas».
// Left out: records that join several persons («1. … 2. …») and those that say whose disciple they were
// (listed apart: they go under their guru, not to «Poetas»). placed.json: ids already placed (a plan of colocar.mjs).
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
const [, , file, out, placedf] = process.argv;
const db = new DatabaseSync(file, { readOnly: true });
const f = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ");
const tree = new Set(db.prepare("select person_id from person_tree").all().map((r) => r.person_id));
if (placedf) for (const x of JSON.parse(fs.readFileSync(placedf, "utf8"))) tree.add(x.id);
const P = db.prepare("select id,name,guru,notes from persons").all();
const firstText = (id) => {
  const d = db.prepare("select group_concat(id) ids from docs where person_id=? and deleted is null").get(id).ids;
  return d ? db.prepare(`select text from sections where doc_id in (${d}) order by doc_id, ordinal`).all().map((r) => r.text).join(" ").slice(0, 1500) : "";
};
const POET = /\bpoets?\b|\bpoetess\b|padakart|pada-kart|pada kart|\bpadas?\b (are|is|were|was) (included|found|collected)|\bbhanita\b|composed (\w+ )?(padas|songs|verses|kirtan)|wrote (\w+ )?(padas|songs)/;
const GURU = /disciple of|initiated by|took (diksa|initiation)|his guru|her guru|dīkṣā from|diksa from/;
const plan = [], withGuru = [];
let mixed = 0;
for (const p of P) {
  if (tree.has(p.id)) continue;
  if (/(^|,)\s*poetas\s*(,|$)/i.test(p.tags || "")) continue;
  const notes = f(p.notes);
  const hay = `${f(p.guru)} || ${notes} || ${f(firstText(p.id))}`;
  const m = hay.match(POET);
  if (!m) continue;
  if (/(^|\s)1\.\s.*\s2\.\s/.test(notes) || /^1\.\s/.test(notes)) { mixed++; continue; }
  const i = Math.max(0, m.index - 60);
  const why = hay.slice(i, m.index + 80).replace(/\|\|/g, "·");
  if (f(p.guru).trim() || GURU.test(hay)) withGuru.push({ id: p.id, name: p.name, guru: p.guru || "", why });
  else plan.push({ id: p.id, name: p.name, why });
}
fs.writeFileSync(out, JSON.stringify({ poets: plan, withGuru }, null, 1), "utf8");
console.log("poets:", plan.length, "| poets who name a guru (apart):", withGuru.length, "| several persons:", mixed);
