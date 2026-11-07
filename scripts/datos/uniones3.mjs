// node uniones3.mjs <db> → uniones3-unir.json for unir.mjs   (07-11-2026)
// Records that were only another name of a person who has his own record («See X»): joined to it, the name kept
// in «aka» so the search still finds it. Only the clear ones (not «see also», not relatives).
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
const db = new DatabaseSync(process.argv[2], { readOnly: true });
const D = "07-11-2026";
const get = (id) => db.prepare("select name, aka, notes from persons where id=?").get(id);
const join = (into, from, alias, why) => {
  const p = get(into);
  const aka = [...new Set([...(p.aka || "").split(",").map((s) => s.trim()), alias].filter(Boolean))].join(", ");
  const notes = ((p.notes || "").trim() ? p.notes.trim() + "\n\n" : "") + `${why} The record «${get(from).name}» #${from} was joined to this one (${D}).`;
  return { into, name: p.name, from: [{ id: from, name: get(from).name }], fields: { aka, notes } };
};
const plan = [
  join(76, 86, "Balarāma Pūjārī", "As the servant of Narottama's Deity he was known as «Balarāma Pūjārī»."),
  join(2102, 1350, "Saṁvarāri", "«Saṁvarāri» (the genealogies' name of Kaṁsāri Sena, father of Sadāśiva Kavirāja; Candraprabhā, Gauḍīya Vaiṣṇava Abhidhāna)."),
  join(1353, 1380, "Sarkār Mallik", "«Sarkār Mallik»: Sanātana Gosvāmī's name before, in the Muslim government."),
  join(1391, 1544, "Tairthika Brāhmaṇa", "He is the «pilgrim brāhmaṇa» (tairthika) of the Nāmāmṛta-samudra (214)."),
  join(124, 1690, "Vimalāprasāda Datta", "«Vimalāprasāda Datta» was his name before sannyāsa."),
];
fs.writeFileSync(new URL("./uniones3-unir.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.map((p) => p.into + " ← " + p.from[0].id).join(", "));
