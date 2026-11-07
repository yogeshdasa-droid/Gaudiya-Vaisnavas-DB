// node fuera3.mjs → fuera3-unir.json, fuera3.json (colocar), fuera3-separar.json   (07-11-2026)
// Batch 3 of the records outside the tree: those the Rasikamaṅgala, the Karṇānanda and the Narottama-vilāsa
// call disciples of someone in the tree (checked by hand); family, teachers and people met are left as they are.
import fs from "node:fs";
const D = "07-11-2026";
const RASIK = 1908, SYAMA = 1535, SRINIVASA = 1466, SATYABHAMA = 1390, HEMALATA = 497, RAMAKRSNA = 1273, GANGANARAYANA = 301;
const unir = [
  { into: 1909, name: "Gopījana-vallabha Dāsa", from: [{ id: 371, name: "Gopijanavallabha Dāsa" }],
    fields: { name: "Gopījanavallabha Dāsa (author of the Rasikamaṅgala)", place: "Dhāreṇḍā (Midnapore)", works: "Rasikamaṅgala",
      notes: `A Gopa of Dhāreṇḍā in Midnapore, the eldest of the five sons of Rasamaya; his brothers were Haricaraṇa Dāsa, Mādhava, Rasikānanda and Kiśora Dāsa, his uncles Vaṁśī and Mathurā Dāsa. He and all his family took dīkṣā from Rasikānanda Prabhu. One of the «aṣṭa-śiśu» who dressed as gopīs in the Rāsa festival at Gopīballabhpur (Rasikamaṅgala Paścima 2.45). He wrote the Rasikamaṅgala, the life of his guru.\n\nThe record «Gopijanavallabha Dāsa» #371 was the same person and was joined to this one (${D}).` } },
  { into: 2096, name: "Haricandana Maṅgarāja (disciple of Rasikānanda)", from: [{ id: 904, name: "Mangaraja" }],
    fields: { aka: "Maṅgarāja", notes: `He was a disciple of Rasikānanda Prabhu; his surname was Maṅgarāja (Rasikamaṅgala Paścima 14.106). Taken out of the record «Haricandana» #462, which mixed several persons; the record «Mangaraja» #904 (the same verse) was joined to this one (${D}).` } },
];
const put = (parent, kind, why, list) => list.map(([id, name]) => ({ id, name, parent, kind, why }));
const plan = [
  ...put(RASIK, "diksa", "Rasikamaṅgala", [[1589, "Vaikuṇṭha Dāsa"], [146, "Bhima"]]),
  ...put(SATYABHAMA, "diksa", "Karṇānanda 2", [[731, "Kisori Cakravartī"], [1172, "Rādhāvallabha Cakravartī"]]),
  ...put(SRINIVASA, "diksa", "Karṇānanda 1", [[1249, "Ramacarana Cakravartī"]]),
  ...put(SRINIVASA, "disciple", "Karṇānanda 2 (his line)", [[1749, "Vṛndāvana Thakurni"]]),
  ...put(HEMALATA, "diksa", "Karṇānanda 2", [[1507, "Suvalacandra Ṭhākura"]]),
  ...put(RAMAKRSNA, "diksa", "Narottama-vilāsa 12 (wife and disciple)", [[667, "Kanakalatika Devī"]]),
  ...put(GANGANARAYANA, "diksa", "Narottama-vilāsa 11", [[1195, "Raghudeva Bhaṭṭācārya"]]),
];
const separar = [
  { id: 1569, name: "Uddhava", place: [SYAMA, "diksa"],
    fields: { name: "Uddhava (disciple of Śyāmānanda, Kasiāḍi)", guru: "Śyāmānanda Prabhu", place: "Kasiāḍi (Śrīpāṭa)",
      notes: `He was a disciple of Śyāmānanda Prabhu, of the Śrīpāṭa of Kasiāḍi (Prema-vilāsa 20).\n\nThe record also held the Uddhava disciple of Rasikānanda, now in a record of its own (${D}).` },
    new: [{ key: "a", name: "Uddhava (disciple of Rasikānanda)", place: [RASIK, "diksa"],
      fields: { guru: "Rasikānanda Prabhu", notes: `He was a disciple of Rasikānanda Prabhu (Rasikamaṅgala Paścima 14.137). Taken out of the record «Uddhava» #1569, which mixed several persons (${D}).` } }] },
];
fs.writeFileSync(new URL("./fuera3-unir.json", import.meta.url), JSON.stringify(unir, null, 1));
fs.writeFileSync(new URL("./fuera3.json", import.meta.url), JSON.stringify(plan, null, 1));
fs.writeFileSync(new URL("./fuera3-separar.json", import.meta.url), JSON.stringify(separar, null, 1));
console.log(unir.length, "merges,", plan.length, "to place,", separar.length, "to split");
