// node fuera4.mjs → fuera4.json (colocar)   (07-11-2026)
// Batch 4 of the records outside the tree: those the Prema-vilāsa calls disciples (or of the branch) of someone
// in the tree, checked by hand. Left as they are: the families (parents, brothers, wives, sons), those the
// guru rejected (Āgala and Śaṅkara Pāgala), and those whose guru has no record in the tree (Sītā devī,
// Candraśekhara Vaidya, Śrīnivāsa's second wife, Pūjārī Ṭhākura).
import fs from "node:fs";
const ADVAITA = 15, NAROTTAMA = 1010, SRINIVASA = 1466, GOPALABHATTA = 343, HARIDASA = 475, KASISVARA = 1832, RAMACANDRA = 1244;
const put = (parent, kind, why, list) => list.map(([id, name]) => ({ id, name, parent, kind, why }));
const plan = [
  ...put(ADVAITA, "diksa", "Prema-vilāsa (disciple of Advaita)", [[226, "Divyasimha Rāja"]]),
  ...put(ADVAITA, "disciple", "Prema-vilāsa 19 (Advaita's gaṇa)", [[506, "Hridayananda Sena"]]),
  ...put(NAROTTAMA, "diksa", "Prema-vilāsa 19-20", [
    [634, "Kālidāsa Catta"], [1421, "Sivacarana Vidyavagisa"], [1626, "Vanamālī Catta"], [1662, "Vecarama Bhādra"], [1668, "Vidhu Cakravartī"],
  ]),
  ...put(SRINIVASA, "disciple", "Prema-vilāsa 20 (Śrīnivāsa's branch)", [[763, "Kṛṣṇadāsa Purohit"], [1207, "Raghunātha dāsa (of Śrīnivāsa Ācārya's line)"]]),
  ...put(GOPALABHATTA, "diksa", "Prema-vilāsa 18", [[1349, "Sambhuram"], [1504, "Suryadasa (son of Harivaṁśa)"], [1743, "Vṛndāvana Candrā"]]),
  ...put(HARIDASA, "diksa", "Prema-vilāsa 24", [[1258, "Rāmadāsa Dvija"]]),
  ...put(HARIDASA, "disciple", "Prema-vilāsa 24 (took refuge at his feet)", [[1775, "Yadunatha Digvijayi"]]),
  ...put(KASISVARA, "diksa", "Prema-vilāsa 18", [[118, "Bhakta Kāśī"]]),
  ...put(RAMACANDRA, "diksa", "Prema-vilāsa 20, Karṇānanda 2", [[1604, "Vallabha Majumdar"]]),
];
fs.writeFileSync(new URL("./fuera4.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length, "to place");
