import { DatabaseSync } from "node:sqlite";
const db = new DatabaseSync(process.argv[2], { readOnly: true });
for (const id of process.argv.slice(3).map(Number)) {
  const p = db.prepare("select * from persons where id=?").get(id);
  const f = ["aka","appearance","disappearance","place","guru","disciples","works","notes"].filter((k) => (p[k] ?? "").trim()).map((k) => `${k}: ${p[k].replace(/\s+/g, " ").trim()}`);
  const docs = db.prepare("select id,title from docs where person_id=? and deleted is null").all(id);
  console.log(`\n##### ${id} ${p.name}\n` + f.join("\n"));
  for (const d of docs) {
    const t = db.prepare("select text from sections where doc_id=? order by ordinal").all(d.id).map((r) => r.text).join(" ").replace(/\s+/g, " ").trim();
    console.log(`[doc ${d.id} «${d.title}»] ${t}`);
  }
}
