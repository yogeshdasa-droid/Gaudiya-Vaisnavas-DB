// node fuera7.mjs → fuera7-unir.json (unir.mjs) and fuera7.json (colocar.mjs)   (07-11-2026)
// Batch 7 of the records outside the tree: the contemporaries that the Vaiṣṇava-vandanā, the Nāmāmṛta-samudra,
// the Caitanya-bhāgavata or the Gaura-gaṇoddeśa-dīpikā call devotees, associates or companions of Lord Caitanya
// (or of Nityānanda / Advaita), found by devotee-find.mjs and read by hand. Left as they are: later or modern
// persons (scholars, kings and bābājīs of the 18th-20th centuries), descendants and relatives of devotees,
// records already split or mixed, and pointers.
import fs from "node:fs";
const D = "07-11-2026";
const GAURA = 164, NITAI = 1851, ADVAITA = 15, ABHIRAMA = 6;
const unir = [
  { into: 660, name: "Kaṁsāri Ghoṣa", from: [{ id: 671, name: "Kansari Ghosh" }],
    fields: { notes: `A devotee of Lord Caitanya, a Kāyastha of north Rāḍha and the eldest brother of Vāsudeva Ghoṣa. He led a family life; his descendants belong to the royal family of Dinājpur (see «Vāsudeva Ghoṣa»).\n\nThe record also held Kaṁsāri Miśra (cousin of Lord Gaurāṅga) and Kaṁsāri Sena (of Nityānanda's branch), now in records of their own; the record «Kansari Ghosh» #671 was the same person and was joined to this one (${D}).` } },
];
const put = (parent, kind, why, list) => list.map(([id, name]) => ({ id, name, parent, kind, why }));
const plan = [
  ...put(GAURA, "associate", "devotee / associate of Lord Caitanya (Vaiṣṇava-vandanā, Nāmāmṛta-samudra, CBh, GGD)", [
    [25, "Akiñcana Dāsa"], [35, "Ānanda Purī"], [53, "Anubhavananda"], [81, "Balarāma Dās"], [84, "Balarāma Māhiti"],
    [133, "Bhaskara Ṭhākura"], [135, "Bhatua Gopāla"], [162, "Brahmananda Svarūpa"], [192, "Dāsa"], [194, "Dayāla Dāsī Ṭhākurāṇī"],
    [260, "Dvija Raghunātha"], [283, "Gandharvavara Khan"], [302, "Garuda Avadhūta"], [304, "Garuda"], [355, "Gopāla Hoda"],
    [367, "Gopālakṛṣṇa Pattanayaka"], [376, "Gopikanta Miśra"], [405, "Govinda Bhakata"], [423, "Govindānanda"],
    [561, "Jagannātha Padicha"], [567, "Jagannātha Sena"], [613, "Jhadu Ṭhākura"], [655, "Kamalakara (Kānta-Dvija Kamalakara Kānta)"],
    [660, "Kaṁsāri Ghoṣa"], [693, "Kāśīnātha Mahati (Or Māhiti)"], [738, "Kṛṣṇa Paṇḍit"], [770, "Kṛṣṇadāsa Vipra"],
    [822, "Laghu Keśava"], [826, "Laksmanacarya"], [934, "Mukunda Kavicandra"], [947, "Murāri Brāhmaṇa"], [971, "Nandana Maiti"],
    [1056, "Nṛsiṁha Purī"], [1123, "Purandara Khan"], [1169, "Rādhārāṇī Devī"], [1204, "Raghunātha Bipra"], [1209, "Raghunātha Miśra"],
    [1215, "Raghunātha"], [1225, "Rajiv Paṇḍit"], [1230, "Rāma Devī (wife of Yogeśvara Paṇḍita)"], [1234, "Rāma Tīrtha"],
    [1240, "Rāmacandra Dāsa"], [1241, "Rāmacandra Dvija"], [1281, "Rāmānanda Mangaraja"], [1311, "Ratnākar Paṇḍit"],
    [1323, "Rudrari Kavirāja"], [1410, "Śikhi-Māhiti"], [1426, "Śivānanda Paṇḍit"], [1438, "Srigarbha"], [1452, "Śrīman Ṭhākura"],
    [1477, "Sudarsana"], [1485, "Sugriva Miśra"], [1508, "Svapnesvara VipraDvija"], [1562, "Tulasī Miśra"], [1563, "Tulasī MisraPadicha"],
    [1572, "Udiya (Odiya) Vipradasa"], [1578, "Vadanananda"], [1581, "Vadu Jagannātha"], [1630, "Vanamālī VipraPandit"],
    [1631, "Vanamālī Visvas"], [1637, "Vanikrsnadasa"], [1649, "Vāsudeva Bhadara"], [1659, "Vāsudeva Tīrtha"],
    [1943, "Puruṣottama (of Navadvīpa, Vaiṣṇava-vandanā)"], [1966, "Govinda (Vaikuṇṭha-pārṣada Puṇḍarīkākṣa)"],
    [1973, "Govindānanda Purī"], [2128, "Mādhava (friend of Puṇḍarīka Vidyānidhi)"],
  ]),
  ...put(NITAI, "associate", "associate / devotee of Nityānanda Prabhu", [[7, "Ācārya Candrā"], [324, "Gaurī Dāsa Kirtaniya"]]),
  ...put(ADVAITA, "associate", "devotee of Advaita Prabhu (Prema-vilāsa 19)", [[1228, "Rāma Ācārya"]]),
  ...put(ABHIRAMA, "diksa", "disciple of Abhirāma Gosvāmī (Pāṭa-paryaṭana)", [[829, "Laksmikanta (Dvari Lakṣmīnārāyaṇa)"]]),
];
fs.writeFileSync(new URL("./fuera7-unir.json", import.meta.url), JSON.stringify(unir, null, 1));
fs.writeFileSync(new URL("./fuera7.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(unir.length, "merges,", plan.length, "to place");
