// node pieces.mjs <db> <plan.json>  → checks each piece of a separar.mjs plan against the copy (start once, end after it)
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
const [, , file, planFile] = process.argv;
const db = new DatabaseSync(file, { readOnly: true });
const plan = JSON.parse(fs.readFileSync(planFile, "utf8"));
for (const g of plan)
  for (const d of g.docs || []) {
    let t = db.prepare("select text from sections where doc_id=? order by ordinal").all(d.doc).map((r) => (r.text.endsWith("\n") ? r.text : r.text + "\n")).join("");
    for (const pc of d.pieces) {
      const a = t.indexOf(pc.start), a2 = a >= 0 ? t.indexOf(pc.start, a + 1) : -1;
      const b = pc.end ? t.indexOf(pc.end, a + pc.start.length) : t.length;
      console.log(g.id, d.doc, JSON.stringify(pc.start.slice(0, 40)), a < 0 ? "START NOT FOUND" : a2 >= 0 ? "START TWICE" : b < 0 ? "END NOT FOUND" : `ok ${b - a} ch → ${pc.to ?? pc.toId}`);
      if (a >= 0 && b >= 0) t = t.slice(0, a) + t.slice(b);
    }
  }
