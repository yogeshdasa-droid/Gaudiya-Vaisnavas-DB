// node uniones4.mjs <db> → uniones4-unir.json (unir.mjs) and uniones4.json (colocar.mjs)   (07-11-2026)
// Repeated records seen when the names got their diacritics: Veṅkaṭa Bhaṭṭa (1758 → 1664), Hiraṇya Paṇḍita of
// Navadvīpa (500 → 502), Prabodhānanda Sarasvatī (1112 → 1095). Trimalla Bhaṭṭa #1557 is Veṅkaṭa's brother: apart.
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
const db = new DatabaseSync(process.argv[2], { readOnly: true });
const D = "07-11-2026";
const get = (id) => db.prepare("select name, aka, notes from persons where id=?").get(id);
const join = (into, from, aka, line, extra = {}) => {
  const p = get(into);
  const akas = [...new Set([...(p.aka || "").split(",").map((s) => s.trim()), ...aka].filter(Boolean))].join(", ");
  const notes = ((p.notes || "").trim() ? p.notes.trim() + "\n\n" : "") + line + ` The record «${get(from).name}» #${from} was joined to this one (${D}).`;
  return { into, name: p.name, from: [{ id: from, name: get(from).name }], fields: { aka: akas, notes, ...extra } };
};
const unir = [
  join(1664, 1758, ["Vyeṅkaṭa Bhaṭṭa", "Venkata Bhaṭṭa"],
    "Of the Śrī-sampradāya, at Śrīraṅgam; Lord Caitanya stayed four months in his house (Caitanya-caritāmṛta Madhya 9.82-86). First a worshipper of Lakṣmī-Nārāyaṇa, after the Lord's company he worshipped Rādhā-Kṛṣṇa (Madhya 9.158-159). Brother of Trimalla Bhaṭṭa and Prabodhānanda Sarasvatī; father of Gopāla Bhaṭṭa Gosvāmī.",
    { place: "Śrīraṅgam" }),
  join(502, 500, ["Hiraṇya Paṇḍita", "Hiraṇya Ṭhākura (of Navadvīpa)"],
    "A devout brāhmaṇa and renunciant of Navadvīpa: Nityānanda Prabhu and others lived in his temple, and the dacoits who came to rob Nityānanda's ornaments were delivered there (Caitanya-bhāgavata Antya 5.535-703); in his house the child Gaura ate the Ekādaśī offering (Caitanya-bhāgavata Ādi)."),
  join(1095, 1112, ["Prabodhānanda Sarasvatī"], "Born at Śrīraṅgam; once a Māyāvādī sannyāsī, by Lord Caitanya's mercy he became absorbed in the rāsa of Rādhā-Kṛṣṇa."),
];
const place = [{ id: 1664, name: get(1664).name, parent: 164, kind: "associate", why: "the Lord stayed in his house (CC Madhya 9)" }];
fs.writeFileSync(new URL("./uniones4-unir.json", import.meta.url), JSON.stringify(unir, null, 1));
fs.writeFileSync(new URL("./uniones4.json", import.meta.url), JSON.stringify(place, null, 1));
console.log(unir.map((u) => u.into + " ← " + u.from[0].id).join(", "));
