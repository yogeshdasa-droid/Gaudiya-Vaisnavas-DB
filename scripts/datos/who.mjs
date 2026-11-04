// node who.mjs <db> term... → persons whose name/aka match (diacritic-insensitive)
import { DatabaseSync } from "node:sqlite";
const [, , file, ...terms] = process.argv;
const db = new DatabaseSync(file, { readOnly: true });
const f = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const rows = db.prepare("select id,name,aka,appearance,guru from persons").all();
for (const t of terms) {
  console.log("== " + t);
  for (const r of rows) if (f(r.name + " | " + r.aka).includes(f(t))) {
    const n = db.prepare("select count(*) n, coalesce(sum(length(s.text)),0) l from docs d join sections s on s.doc_id=d.id where d.person_id=? and d.deleted is null").get(r.id);
    console.log(`  ${r.id}\t${r.name}\t| aka: ${r.aka || ""}\t| guru: ${r.guru || ""}\t| secs ${n.n}, ${n.l} ch`);
  }
}
