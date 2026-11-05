// node colecciones.mjs <db> → per collection: texts, with a record, and texts that are REPEATED: ≥ 90 % of
// their paragraphs (> 80 letters) are also in another text of the SAME record (true duplicates). Read only.
import { DatabaseSync } from "node:sqlite";
const db = new DatabaseSync(process.argv[2], { readOnly: true });
const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");
const paras = (t) => t.split(/\n\s*\n|\n(?=#)/).map((p) => p.trim()).filter((p) => p.length > 80);
const docs = db.prepare("select id, collection, person_id, title from docs where deleted is null").all();
const text = new Map();
for (const d of docs) text.set(d.id, db.prepare("select text from sections where doc_id=? order by ordinal").all(d.id).map((r) => r.text).join("\n"));
const byPerson = new Map();
for (const d of docs) if (d.person_id) byPerson.set(d.person_id, [...(byPerson.get(d.person_id) ?? []), d]);
const stats = new Map();
const dupList = [];
for (const d of docs) {
  const s = stats.get(d.collection) ?? { n: 0, withRec: 0, dup: 0, dupLetters: 0, letters: 0 };
  s.n++;
  s.letters += text.get(d.id).length;
  if (d.person_id) {
    s.withRec++;
    const others = (byPerson.get(d.person_id) ?? []).filter((o) => o.id !== d.id).map((o) => norm(text.get(o.id))).join("|");
    const ps = paras(text.get(d.id));
    if (ps.length && others) {
      let found = 0;
      for (const p of ps) {
        const n = norm(p);
        const probe = n.length > 160 ? n.slice(Math.floor(n.length / 2) - 60, Math.floor(n.length / 2) + 60) : n;
        if (others.includes(probe)) found++;
      }
      if (found / ps.length >= 0.9) {
        s.dup++;
        s.dupLetters += text.get(d.id).length;
        dupList.push(`${d.collection}\t${d.id}\t${d.person_id}\t${d.title}`);
      }
    }
  }
  stats.set(d.collection, s);
}
console.log("collection\ttexts\twith record\trepeated in the same record\tletters (repeated)");
for (const [c, s] of [...stats].sort((a, b) => b[1].n - a[1].n)) console.log(`${c}\t${s.n}\t${s.withRec}\t${s.dup}\t${s.letters} (${s.dupLetters})`);
if (process.argv[3]) (await import("node:fs")).writeFileSync(process.argv[3], dupList.join("\n"), "utf8");
