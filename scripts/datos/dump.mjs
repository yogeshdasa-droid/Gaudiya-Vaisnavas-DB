// node dump.mjs <db> <outdir> ids... → one file per person with fields + all texts in full
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
const [, , file, outdir, ...ids] = process.argv;
fs.mkdirSync(outdir, { recursive: true });
const db = new DatabaseSync(file, { readOnly: true });
for (const id of ids.map(Number)) {
  const p = db.prepare("select * from persons where id=?").get(id);
  let o = `# ${id} ${p.name}\n`;
  for (const k of ["aka", "appearance", "disappearance", "place", "guru", "disciples", "works", "tags"]) o += `${k}: ${p[k] ?? ""}\n`;
  o += `notes: ${p.notes ?? ""}\n`;
  const tr = db.prepare("select t.parent_id,q.name,t.kind from person_tree t left join persons q on q.id=t.parent_id where t.person_id=?").all(id);
  o += `tree: ${tr.map((t) => t.name + "/" + t.kind).join("; ")}\n`;
  for (const d of db.prepare("select id,title,collection from docs where person_id=? and deleted is null").all(id)) {
    const t = db.prepare("select text from sections where doc_id=? order by ordinal").all(d.id).map((r) => r.text).join("\n");
    o += `\n\n======== DOC ${d.id} «${d.title}» [${d.collection ?? ""}] (${t.length} ch)\n${t}\n`;
  }
  fs.writeFileSync(`${outdir}/${id}.txt`, o, "utf8");
  console.log(id, p.name, o.length);
}
