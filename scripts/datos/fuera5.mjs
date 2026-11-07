// node fuera5.mjs → fuera5.json (colocar) and fuera5-separar.json   (07-11-2026)
// Batch 5 of the records outside the tree: those whose text says «disciple of X» / «of the branch of X» with X
// in the tree (found by guru-find.mjs, each read by hand). Left as they are: rejected disciples (Harivaṁśa),
// sons or descendants of a disciple, «some hold», mixed records, and gurus with no record in the tree.
import fs from "node:fs";
const D = "07-11-2026";
const GOPALABHATTA = 343, NARAHARI = 980, SANATANA = 1353, KAMYAVANA = 606, BHAGAVAN = 97, NITYANANDABABAJI = 1045,
  NITAI = 1851, ABHIRAMA = 6, TIRTHA = 1811, PRAMODA = 1799, SATYABHAMA = 1390, KRSNADEVA = 776;
const put = (parent, kind, why, list) => list.map(([id, name]) => ({ id, name, parent, kind, why }));
const plan = [
  ...put(GOPALABHATTA, "diksa", "disciple of Gopāla Bhaṭṭa", [[115, "Bhakta Dās Pūjārī"], [1624, "Vanacandra"]]),
  ...put(NARAHARI, "diksa", "disciple of Narahari Sarakāra", [[167, "Daityari Ghos"], [252, "Dvija Hari Dāsa"], [839, "Lokananda Ācārya"]]),
  ...put(NARAHARI, "disciple", "of Narahari Sarakāra's branch", [
    [316, "Gaurāṅga Dāsa Ghosala"], [783, "Krsnakinkar Dāsa"], [830, "Laksmikanta Dvija"], [879, "Madhusūdana Dāsa"],
    [1042, "Nityānanda Caudhuri"], [1259, "Rāmadāsa Ghosal"],
  ]),
  ...put(SANATANA, "diksa", "disciple of Sanātana Gosvāmī", [[309, "Gaura Gaṇ Dāsa"]]),
  ...put(KAMYAVANA, "disciple", "grand-disciple of the Siddha Bābā of Kāmyavana", [[211, "Dharma Dāsa Bābājī (Kamyavana)"]]),
  ...put(BHAGAVAN, "diksa", "dīkṣā from Siddha Bhagavān dāsa Bābājī", [[531, "Jagadīśa Dāsa Bābājī Mahāśaya"]]),
  ...put(NITYANANDABABAJI, "diksa", "disciple of Siddha Nityānanda dāsa Bābājī", [[1053, "Nṛsiṁha Dāsa Baba"], [1733, "Vrajakisore Dāsa Bābājī"]]),
  ...put(NITAI, "associate", "associate of Nityānanda Prabhu", [[652, "Kamalākānta Paṇḍit"]]),
  ...put(ABHIRAMA, "diksa", "disciple of Abhirāma Gosvāmī", [[1551, "TILAKARĀMA Dāsa"]]),
  ...put(TIRTHA, "diksa", "first disciple of Bhakti Vilāsa Tīrtha", [[1801, "Bhakti Prasun Purī"]]),
  ...put(PRAMODA, "diksa", "succeeded his guru Bhakti Pramoda Purī", [[155, "Bibudha bodhayan"]]),
];
const separar = [
  { id: 1742, name: "Vṛndāvana Cakravartī", place: [SATYABHAMA, "diksa"],
    fields: { name: "Vṛndāvana Cakravartī (disciple of Satyabhāmā)",
      notes: `He was the disciple of Satyabhāmā Devī, the daughter-in-law of Śrīnivāsa Ācārya.\n\nThe record also held the Vṛndāvana Cakravartī disciple of Kṛṣṇadeva Sārvabhauma, commentator of the Govinda-līlāmṛta, now in a record of its own (${D}).` },
    new: [{ key: "a", name: "Vṛndāvana Cakravartī (commentator of the Govinda-līlāmṛta)", place: [KRSNADEVA, "diksa"],
      fields: { guru: "Kṛṣṇadeva Sārvabhauma", works: "Sadānanda-vidhāyinī (ṭīkā on the Govinda-līlāmṛta, 1701 Śaka)",
        notes: `Taken out of the record «Vṛndāvana Cakravartī» #1742, which mixed several persons (${D}).` } }],
    docs: [{ doc: 1760, pieces: [{ to: "a", cut: true, title: "Vṛndāvana Cakravartī", start: "Vṛndāvana Cakravartī He was the disciple of Krsnadeva" }] }] },
];
fs.writeFileSync(new URL("./fuera5.json", import.meta.url), JSON.stringify(plan, null, 1));
fs.writeFileSync(new URL("./fuera5-separar.json", import.meta.url), JSON.stringify(separar, null, 1));
console.log(plan.length, "to place,", separar.length, "to split");
