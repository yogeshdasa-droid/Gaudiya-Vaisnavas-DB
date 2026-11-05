// node overlap.mjs <db> <docId>... → for each doc: how many of its paragraphs (> 80 letters) are also,
// word for word (without spaces/punctuation/case), in some OTHER text of the database. Read only.
import { DatabaseSync } from "node:sqlite";
const [, , file, ...ids] = process.argv;
const db = new DatabaseSync(file, { readOnly: true });
const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");
const paras = (t) => t.split(/\n\s*\n|\n(?=#)/).map((p) => p.trim()).filter((p) => p.length > 80);
const docText = (id) => db.prepare("select text from sections where doc_id=? order by ordinal").all(id).map((r) => r.text).join("\n");
const all = db.prepare("select id from docs where deleted is null").all().map((r) => r.id);
for (const id of ids.map(Number)) {
  // the other texts, as one big string per doc, normalized
  const others = all.filter((x) => x !== id && !ids.map(Number).includes(x)).map((x) => norm(docText(x))).join("|");
  const ps = paras(docText(id));
  let found = 0, foundLen = 0, totalLen = 0;
  const missing = [];
  for (const p of ps) {
    const n = norm(p);
    totalLen += p.length;
    // a paragraph counts as present if its middle 120 letters are somewhere else
    const probe = n.length > 160 ? n.slice(Math.floor(n.length / 2) - 60, Math.floor(n.length / 2) + 60) : n;
    if (others.includes(probe)) { found++; foundLen += p.length; } else missing.push(p.slice(0, 90).replace(/\s+/g, " "));
  }
  console.log(`doc ${id}: ${ps.length} paragraphs, ${found} found elsewhere (${Math.round((100 * foundLen) / Math.max(1, totalLen))}% of the letters)`);
  for (const m of missing.slice(0, 8)) console.log("   missing: " + m);
}
