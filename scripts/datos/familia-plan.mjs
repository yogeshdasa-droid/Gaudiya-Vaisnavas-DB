// node familia-plan.mjs <db> <out.json>   (07-11-2026)
// Records outside the tree that say «son / daughter / wife / brother / grandson … of X» with X a record (the one
// named; tree records first when the name is shared): [{ id, name, rel, relative, relName, phrase }] for a hand check,
// then familia.mjs gives each its family line (set_family: relative = X, note = rel). Only the first relation said.
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
const [, , file, out] = process.argv;
const db = new DatabaseSync(file, { readOnly: true });
const f = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
const tree = new Set(db.prepare("select person_id from person_tree").all().map((r) => r.person_id));
const hasFamily = new Set(db.prepare("select person_id from person_links where kind = 'family'").all().map((r) => r.person_id));
const people = db.prepare("select id, name, aka, notes from persons").all();
const STOP = new Set(["sri", "srila", "srimati", "lord", "prabhu", "thakura", "thakur", "gosvami", "pandita", "pandit", "devi", "dasa", "das", "the", "of", "and", "his", "her", "famous"]);
const core = (s) => f(s).split(" ").filter((w) => w.length > 2 && !STOP.has(w));
const keys = [];
for (const p of people) for (const n of [p.name.replace(/\(.*?\)/g, ""), ...(p.aka || "").split(",")]) { const c = core(n); if (c.length) keys.push({ id: p.id, name: p.name, c }); }
const text = (id) => db.prepare("select id from docs where person_id=? and deleted is null").all(id)
  .map((d) => db.prepare("select text from sections where doc_id=? order by ordinal").all(d.id).map((r) => r.text).join(" ")).join(" ").slice(0, 1500);
const RE = /\b(?:was|is|the|a|an)?\s*(?:eldest |elder |younger |youngest |second |third |fourth |fifth |sixth |only |adopted )?(son|daughter|wife|brother|sister|grandson|granddaughter|nephew|niece|son-in-law|daughter-in-law|grandfather|father-in-law|mother-in-law|uncle|cousin) of (?:sri |srila |srimati |lord |the famous )?([a-z]+(?: [a-z]+){0,3})/;
const plan = [];
for (const p of people) {
  if (tree.has(p.id) || hasFamily.has(p.id)) continue;
  const hay = f((p.notes || "") + " " + text(p.id));
  const m = hay.match(RE);
  if (!m) continue;
  const c = core(m[2]);
  if (!c.length) continue;
  const hits = keys.filter((k) => k.id !== p.id && k.c.every((w) => c.includes(w)) && k.c.length >= Math.min(2, c.length));
  if (!hits.length) continue;
  hits.sort((a, b) => b.c.length - a.c.length || Number(tree.has(b.id)) - Number(tree.has(a.id)));
  const best = hits[0];
  const same = hits.filter((h) => h.c.length === best.c.length && h.id !== best.id);
  plan.push({ id: p.id, name: p.name, rel: m[1], relative: best.id, relName: best.name, inTree: tree.has(best.id), doubt: same.map((h) => h.id + " " + h.name).join(" | "), phrase: m[0].slice(0, 90) });
}
fs.writeFileSync(out, JSON.stringify(plan, null, 1));
console.log(plan.length, "records,", plan.filter((x) => x.doubt).length, "with another record of the same name");
