// node uniones2.mjs <db> → uniones2-unir.json for unir.mjs   (07-11-2026, Whisper decided)
// 8 Ācāryaratna → 166 Candraśekhara Ācāryaratna (CC Ādi 13: the same person; the Vaiṣṇava-vandanās list the title
// and the name apart); 1296 Raṅgavāsī Vallabha → 1635 Vaṅgavāṭī Caitanyadāsa (copyist's error, Haridāsa dāsa);
// 341 Gokulānanda Sena → 1592 Vaiṣṇava Caraṇa Dāsa (his name before; the record already says so).
// The notes of the record kept stay as they are, with one line added.
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
const db = new DatabaseSync(process.argv[2], { readOnly: true });
const D = "07-11-2026";
const get = (id) => db.prepare("select name, aka, notes from persons where id=?").get(id);
const add = (id, line, aka) => {
  const p = get(id);
  const akas = [...new Set([...(p.aka || "").split(",").map((s) => s.trim()), ...aka].filter(Boolean))].join(", ");
  return { aka: akas, notes: ((p.notes || "").trim() ? p.notes.trim() + "\n\n" : "") + line };
};
const plan = [
  { into: 166, name: get(166).name, from: [{ id: 8, name: get(8).name }],
    fields: add(166, `«Ācāryaratna» is his title: the Caitanya-caritāmṛta (Ādi 13.102, 108) shows that Ācāryaratna and Candraśekhara are the same person; the Vaiṣṇava-vandanās of Jīva Gosvāmī, Devakīnandana and Vṛndāvana dāsa name the title and the name in different verses. The record «Ācārya Ratna» #8 was joined to this one (${D}, Whisper).`, ["Ācārya Ratna"]) },
  { into: 1635, name: get(1635).name, from: [{ id: 1296, name: get(1296).name }],
    fields: add(1635, `«Raṅgavāsī Vallabha» (Kali in his past incarnation, Gaura-gaṇoddeśa-dīpikā 196, 206) is this name copied wrongly: Haridāsa dāsa holds that «Vaṅgavāṭī Caitanyadāsa» became «Raṅgavāsī Vallabha» by a copyist's error (র / ব). The record «Rangavasi Vallabha» #1296 was joined to this one (${D}, Whisper).`, ["Raṅgavāsī Vallabha"]) },
  { into: 1592, name: get(1592).name, from: [{ id: 341, name: get(341).name }],
    fields: add(1592, `His name before was Gokulānanda Sena; «Vaiṣṇava dāsa» is the name he signed his works with. The record «Gokulananda Sena» #341 was joined to this one (${D}, Whisper).`, ["Gokulānanda Sena"]) },
];
fs.writeFileSync(new URL("./uniones2-unir.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.map((p) => p.into + " ← " + p.from[0].id).join(", "));
