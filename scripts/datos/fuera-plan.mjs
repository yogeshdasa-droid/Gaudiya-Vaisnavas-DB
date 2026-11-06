// node fuera-plan.mjs <db> <out.json>   (06-11-2026)
// The records outside the Guru Paramparā whose own guru field, notes or first lines say plainly whose disciple
// they were or whose branch they belonged to («disciple of Śrīnivāsa», «belonged to the lineage of Lord Caitanya»…)
// → plan [{id, name, parent, kind, why}] for colocar.mjs. Left out: records that join several persons («1. … 2. …»),
// records whose guru field names someone else, records named in two rules, and the ones in SKIP (checked by hand).
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
const [, , file, out] = process.argv;
const db = new DatabaseSync(file, { readOnly: true });
const f = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ");
const tree = new Set(db.prepare("select person_id from person_tree").all().map((r) => r.person_id));
const P = db.prepare("select id,name,aka,guru,notes from persons").all();
const firstText = (id) => {
  const d = db.prepare("select group_concat(id) ids from docs where person_id=? and deleted is null").get(id).ids;
  return d ? db.prepare(`select text from sections where doc_id in (${d}) order by doc_id, ordinal`).all().map((r) => r.text).join(" ").slice(0, 700) : "";
};
const LINE = "(belonged to|belonging to|was of|of|in|from|descended from|descending from|a descendant in) the (lineage|disciple-line|disciple line|disciplic line|devotee-line|descending line|descending-line|sakha|shakha|branch|spiritual lineage|line of disciples)";
const rules = [
  [new RegExp(`${LINE} of (lord |sri |sriman )?(caitanya|gauranga|mahaprabhu)|(lord )?caitanya[- ]sakha|caitanya's (branch|lineage)`), 164, "associate", "Caitanya's branch"],
  [new RegExp(`${LINE} of (lord |sri )?nityananda|nityananda[- ]sakha|nityananda's (branch|lineage)`), 1851, "disciple", "Nityānanda's branch"],
  [new RegExp(`${LINE} of (sri )?advaita|advaita[- ]sakha|advaita's (branch|lineage)`), 15, "disciple", "Advaita's branch"],
  [/disciple of (sri |srila )?(srinivasa|acarya prabhu)|srinivasa acarya's disciple/, 1466, "diksa", "Śrīnivāsa"],
  [/disciple of (sri |srila )?narottama/, 1010, "diksa", "Narottama"],
  [/disciple of (sri )?syamananda|sakha of syamananda/, 1535, "diksa", "Śyāmānanda"],
  [/disciple (and \w+ )?of (sri )?rasikananda/, 1908, "diksa", "Rasikānanda"],
  [/disciple of (sri )?hemalata/, 497, "diksa", "Hemalatā"],
  [/disciple of (sri )?gati ?govinda/, 305, "diksa", "Gatigovinda"],
  [/disciple of (sri )?isvari/, 519, "diksa", "Īśvarī"],
];
// the guru each rule is about, to see that a filled guru field does not name another
const NAMES = { 164: /caitanya|gauranga|mahaprabhu/, 1851: /nityananda/, 15: /advaita/, 1466: /srinivasa|acarya prabhu/, 1010: /narottama/, 1535: /syamananda/, 1908: /rasikananda/, 497: /hemalata/, 305: /gati ?govinda/, 519: /isvari/ };
// checked by hand: records that join several persons, family or later descendants, sub-gurus not in the rules
const SKIP = new Set([55, 509, 598, 307, 321, 331, 81, 330, 460,
  87, 462, 556, 660, 707, 966, 1135, 1235, 1291, 1299, 1647, 1760, 1888]);
// read by hand: the right guru is another one in the tree
const FIXED = { 877: [301, "diksa", "Gaṅgānārāyaṇa"], 1716: [301, "diksa", "Gaṅgānārāyaṇa"] };
const plan = [], count = {};
for (const [id, [parent, kind, why]] of Object.entries(FIXED)) {
  const p = P.find((x) => x.id === +id);
  if (p && !tree.has(p.id)) { plan.push({ id: p.id, name: p.name, parent, kind, why }); count[why] = (count[why] || 0) + 1; SKIP.add(p.id); }
}
let several = 0, mixed = 0, other = 0, rest = 0;
for (const p of P) {
  if (tree.has(p.id) || SKIP.has(p.id)) continue;
  const notes = f(p.notes), guru = f(p.guru);
  if (/(^|\s)1\.\s.*\s2\.\s/.test(notes) || /^1\.\s/.test(notes)) { mixed++; continue; }
  const hay = `${guru} || ${notes} || ${f(firstText(p.id))}`;
  const hits = rules.filter(([re]) => re.test(hay));
  if (!hits.length) { rest++; continue; }
  if (hits.length > 1) {
    // a sub-guru (Hemalatā, Gatigovinda, Īśvarī) wins over Śrīnivāsa
    const sub = hits.filter(([, par]) => [497, 305, 519].includes(par));
    if (!(sub.length === 1 && hits.every(([, par]) => [497, 305, 519, 1466].includes(par)))) { several++; continue; }
    hits.splice(0, hits.length, sub[0]);
  }
  const [, parent, kind, why] = hits[0];
  if (guru.trim() && !NAMES[parent].test(guru)) { other++; continue; }
  plan.push({ id: p.id, name: p.name, parent, kind, why });
  count[why] = (count[why] || 0) + 1;
}
fs.writeFileSync(out, JSON.stringify(plan, null, 1), "utf8");
console.log("outside the tree:", P.filter((p) => !tree.has(p.id)).length);
for (const [k, n] of Object.entries(count)) console.log(n, k);
console.log(several, "(two rules)", mixed, "(several persons)", other, "(guru field names another)", rest, "(nothing found)");
