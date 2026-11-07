// node fuera10.mjs <db> → fuera10-unir.json (unir.mjs) and fuera10.json (colocar.mjs)   (07-11-2026)
// Batch 10 of the records outside the tree: wider phrases about the guru («received dīkṣā from», «his guru was»…),
// read by hand; and three records repeated.
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
const db = new DatabaseSync(process.argv[2], { readOnly: true });
const D = "07-11-2026";
const get = (id) => db.prepare("select name, aka, notes from persons where id=?").get(id);
const add = (id, line, aka = []) => {
  const p = get(id);
  const akas = [...new Set([...(p.aka || "").split(",").map((s) => s.trim()), ...aka].filter(Boolean))].join(", ");
  return { aka: akas, notes: ((p.notes || "").trim() ? p.notes.trim() + "\n\n" : "") + line };
};
const unir = [
  { into: 762, name: get(762).name, from: [{ id: 1116, name: get(1116).name }],
    fields: add(762, `The record «Premī Kṛṣṇadāsa» #1116 (disciple of Bhūgarbha Gosvāmī, Nāmāmṛta-samudra 160) was the same person and was joined to this one (${D}).`) },
  { into: 677, name: get(677).name, from: [{ id: 1415, name: get(1415).name }],
    fields: add(677, `The record «Sisu Kṛṣṇa Dāsa» #1415 («a disciple of Nityānanda Prabhu, known as Kānu Ṭhākura») was joined to this one (${D}).`) },
  { into: 124, name: get(124).name, from: [{ id: 1405, name: get(1405).name }],
    fields: add(124, `The record «Siddantha Sarawati» #1405, which held only the list of his books, was joined to this one (${D}).`) },
];
const put = (parent, kind, why, list) => list.map(([id]) => ({ id, name: get(id).name, parent, kind, why }));
const plan = [
  ...put(6, "diksa", "disciple of Abhirāma Gosvāmī (Pāṭa-paryaṭana)", [[9], [432], [499], [924], [1067], [1219], [1220], [1397], [1495], [1776]]),
  ...put(753, "diksa", "disciple of Siddha Kṛṣṇadāsa of Govardhana", [[160]]),
  ...put(97, "diksa", "initiated by Bhagavān dāsa Bābājī", [[522]]),
  ...put(618, "diksa", "disciple of Jīva Gosvāmī (Bhakti-ratnākara 1.805)", [[752]]),
  ...put(1466, "diksa", "disciple of Śrīnivāsa Ācārya (Karṇānanda 1)", [[1201]]),
  ...put(980, "diksa", "disciple of Ṭhākura Narahari", [[1306]]),
  ...put(1832, "diksa", "disciple of Kāśīśvara Gosvāmī of Vṛndāvana", [[1762]]),
  ...put(497, "diksa", "disciple of Hemalatā, daughter of Śrīnivāsa Ācārya", [[1772]]),
];
fs.writeFileSync(new URL("./fuera10-unir.json", import.meta.url), JSON.stringify(unir, null, 1));
fs.writeFileSync(new URL("./fuera10.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(unir.length, "merges,", plan.length, "to place");
