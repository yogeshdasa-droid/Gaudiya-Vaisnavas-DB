// node treelist.mjs <db> → every record in the tree: id, name, guru in tree (kind), extra links
import { DatabaseSync } from "node:sqlite";
const db = new DatabaseSync(process.argv[2], { readOnly: true });
const name = new Map(db.prepare("select id,name from persons").all().map((r) => [r.id, r.name]));
const links = db.prepare("select person_id, guru_id, kind from person_links").all();
const rows = db.prepare("select person_id, parent_id, kind, pos from person_tree order by parent_id, pos").all();
console.log("in tree:", rows.length, " extra links:", links.length);
for (const r of rows) {
  const ex = links.filter((l) => l.person_id === r.person_id).map((l) => `+${l.guru_id} ${name.get(l.guru_id)} (${l.kind})`).join("; ");
  console.log(`${r.person_id}\t${name.get(r.person_id)}\t← ${r.parent_id ?? "-"} ${r.parent_id ? name.get(r.parent_id) : "(root)"} (${r.kind})${ex ? "\t" + ex : ""}`);
}
