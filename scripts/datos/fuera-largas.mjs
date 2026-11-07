// fichas fuera del árbol, sin «Texto principal», con > N letras en sus textos
import { DatabaseSync } from "node:sqlite";
const [, , file, min = "3000"] = process.argv;
const db = new DatabaseSync(file, { readOnly: true });
const rows = db.prepare(`
  select p.id, p.name, '' tags,
    (select sum(length(s.text)) from docs d join sections s on s.doc_id=d.id where d.person_id=p.id and d.deleted is null) n,
    (select count(*) from docs d where d.person_id=p.id and d.deleted is null) docs
  from persons p
  where not exists (select 1 from person_tree t where t.person_id=p.id)
    and not exists (select 1 from docs d where d.person_id=p.id and d.deleted is null and d.collection='Texto principal')
`).all().filter((r) => (r.n ?? 0) > +min).sort((a, b) => b.n - a.n);
console.log(rows.length, "records");
for (const r of rows) console.log(r.id, r.n, r.docs, r.tags || "", "|", r.name);

