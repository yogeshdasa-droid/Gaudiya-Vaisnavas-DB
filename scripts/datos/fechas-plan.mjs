// node fechas-plan.mjs <db> <out.json>   (07-11-2026)
// Records with an empty appearance / disappearance whose own notes or texts give the year: «born in 1473 AD»,
// «born … in Śaka 1586», «passed away / disappeared / left this world … 1896 AD». → [{ id, name, field, value,
// phrase }] for a hand check, then fechas2.mjs writes them (only into empty fields).
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
const [, , file, out] = process.argv;
const db = new DatabaseSync(file, { readOnly: true });
const people = db.prepare("select id, name, notes, appearance, disappearance from persons").all();
const text = (id) => db.prepare("select d.id from docs d where person_id=? and deleted is null order by (d.collection = 'Texto principal') desc").all(id)
  .map((d) => db.prepare("select text from sections where doc_id=? order by ordinal").all(d.id).map((r) => r.text).join(" ")).join(" ");
const YEAR = "(?:(?:in|of)\\s+)?(?:the\\s+)?(?:year\\s+)?(?:(Śaka|Saka|S')\\s*(1[2-9]\\d\\d)|(1[2-9]\\d\\d)\\s*(A\\.?\\s?D\\.?|CE|Śaka|Saka|S'|BS|B\\.S\\.)?)";
const BORN = new RegExp(`\\b(?:was born|born)\\b[^.;]{0,70}?${YEAR}`, "i");
const DIED = new RegExp(`\\b(?:passed away|disappeared|departed(?: this world)?|left (?:this|the) world|left his body|entered (?:into )?samādhi|entered nitya-līlā|died)\\b[^.;]{0,70}?${YEAR}`, "i");
const val = (m) => {
  const era = (m[1] || m[4] || "AD").replace(/A\.?\s?D\.?/i, "AD").replace(/^Saka$|^S'$/i, "Śaka").replace("B.S.", "BS");
  const y = m[2] || m[3];
  return era === "Śaka" ? `${y} Śaka` : era === "BS" ? `${y} BS` : `${y} AD`;
};
const plan = [];
for (const p of people) {
  const needA = !(p.appearance || "").trim(), needD = !(p.disappearance || "").trim();
  if (!needA && !needD) continue;
  const hay = ((p.notes || "") + " ¶ " + text(p.id)).replace(/\s+/g, " ");
  for (const [field, re, need] of [["appearance", BORN, needA], ["disappearance", DIED, needD]]) {
    if (!need) continue;
    const m = hay.match(re);
    if (!m || !(m[2] || m[3])) continue;
    // the year must be a plausible one for an era: AD 1200-1999, Śaka 1100-1899
    const y = Number(m[2] || m[3]);
    if (y < 1100 || y > 2030) continue;
    const i = hay.indexOf(m[0]);
    plan.push({ id: p.id, name: p.name, field, value: `${val(m)} (the record's text)`, phrase: hay.slice(Math.max(0, i - 60), i + m[0].length + 20) });
  }
}
fs.writeFileSync(out, JSON.stringify(plan, null, 1));
console.log(plan.length, "dates found");
