// node fuera9.mjs → fuera9.json (colocar)   (07-11-2026)
// Batch 9 of the records outside the tree: the «guru» field names a record in the tree, checked by hand
// (the names that only looked alike were left: Dayāla dāsa Bābājī ≠ Dayāla, Advaita Bābājī ≠ Advaita, …).
import fs from "node:fs";
const plan = [
  { id: 1065, name: "Padmanābha (father of Lokanātha)", parent: 15, kind: "diksa", why: "dīkṣā from Advaita Prabhu" },
  { id: 1580, name: "Vadu Gaṅgādāsa", parent: 325, kind: "diksa", why: "disciple of Gaurīdāsa Paṇḍita" },
  { id: 1986, name: "Jagadānanda (author of the Vaṁśī-līlāmṛta)", parent: 1623, kind: "diksa", why: "biography of his guru Vaṁśīvadana" },
  { id: 246, name: "Dvija Gopāla Dāsa Ṭhākura", parent: 980, kind: "diksa", why: "brahmacārī disciple of Narahari Ṭhākura of Śrīkhaṇḍa" },
  { id: 648, name: "Kamalākānta Dāsa (disciple of Jagadīśa Paṇḍita)", parent: 534, kind: "diksa", why: "disciple of Jagadīśa Paṇḍita (Caitanya-maṅgala 12.4)" },
  { id: 2001, name: "Viṣṇudāsa Ācārya (Nityānanda's branch)", parent: 1851, kind: "disciple", why: "Nityānanda's branch" },
  { id: 1803, name: "Bhakti Ratna Sādhu", parent: 810, kind: "sannyasa", why: "sannyāsa guru Bhakti Kumuda Santa" },
];
fs.writeFileSync(new URL("./fuera9.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length, "to place");
