// node primer-nivel.mjs <copia.db>   (07-11-2026) → the records in the first level of the tree (only Lord Kṛṣṇa should be)
import { DatabaseSync } from "node:sqlite";
const db = new DatabaseSync(process.argv[2], { readOnly: true });
console.log(db.prepare("select t.person_id id, p.name from person_tree t join persons p on p.id=t.person_id where t.parent_id is null").all().map((r) => r.id + " " + r.name).join("\n"));
