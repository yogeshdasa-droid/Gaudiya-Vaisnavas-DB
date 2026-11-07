// node fuera8.mjs → fuera8-unir.json (unir.mjs) and fuera8.json (colocar.mjs)   (07-11-2026)
// Batch 8 (last) of the records outside the tree: the contemporaries the Caitanya-caritāmṛta (Madhya / Antya),
// the Caitanya-bhāgavata, the Gaura-gaṇoddeśa-dīpikā and the Vaiṣṇava-vandanā show as devotees, companions or
// associates of Lord Caitanya or Nityānanda, or as disciples (read by hand). Left in the Vaiṣṇava-maṇḍala: those
// the Lord only met or blessed (rulers, guards, the Bhil tribe, the fisherman…), relatives, bare mentions, later
// authors, and «Ācāryaratna» #8 (the Vaiṣṇava-vandanās say he is not Candraśekhara: the sources disagree).
import fs from "node:fs";
const D = "07-11-2026";
const GAURA = 164, NITAI = 1851, ADVAITA = 15, SRINIVASA = 1466, MADHAVENDRA = 868;
const unir = [
  { into: 1487, name: "Sukhī", from: [{ id: 229, name: "Duḥkhī  (Domestic attendant in the house of Śrīvāsa)" }],
    fields: { name: "Sukhī (Duḥkhī, servant in Śrīvāsa's house)", aka: "Duḥkhī, Sakhī",
      notes: `The domestic helper in the house of Śrīvāsa who served Lord Gaurāṅga with great care. Her name was Duḥkhī; pleased with her service Lord Caitanya named her Sukhī (Caitanya-bhāgavata Madhya 25.11-22).\n\nThe record «Duḥkhī» #229 was the same person and was joined to this one (${D}).` } },
  { into: 589, name: "Janārdana Miśra (Janārdana)", from: [{ id: 592, name: "Janārdana" }],
    fields: { notes: `A resident of Orissa, Janārdana was a great devotee and a permanent sevaka of Lord Jagannātha in Purī. Sārvabhauma Bhaṭṭācārya introduced him to Lord Caitanya when the Lord returned from His pilgrimage of South India (Caitanya-caritāmṛta Madhya 10.41).\n\nThe record «Janārdana» #592 (the same text) was joined to this one (${D}).` } },
];
const put = (parent, kind, why, list) => list.map(([id, name]) => ({ id, name, parent, kind, why }));
const plan = [
  ...put(GAURA, "associate", "companion / devotee of Lord Caitanya (CC, CBh, GGD, Vaiṣṇava-vandanā)", [
    [67, "Balabhadra Bhaṭṭācārya Bhṛtya"], [589, "Janārdana Miśra (Janārdana)"], [650, "Kamalākānta Dvija"], [951, "Murāri Māhiti"],
    [961, "Nakula Brahmacārī"], [1071, "Paramānanda Kirtaniya"], [1100, "Prahararaja Mahapatra"], [1546, "Tapana Miśra"],
    [1557, "Trimala Bhaṭṭa"], [203, "Devananda Paṇḍit"], [1487, "Sukhī (Duḥkhī, servant in Śrīvāsa's house)"], [1675, "Vidyāvācaspati"],
    [1977, "Raghava Purī"], [1362, "Śaṅkara Ghosh"], [1479, "Śuddha Sarasvatī"], [1584, "Vaidya Viṣṇudāsa"], [1653, "Vāsudeva Dvija"],
    [996, "Nārāyaṇa Gupta"], [1913, "Balarāma Oḍra"], [1946, "Puruṣottama Tīrtha (Puruṣottama Purī)"],
  ]),
  ...put(GAURA, "disciple", "converted and named by Mahāprabhu (CC Madhya 18.161-212)", [[1261, "Rāmadāsa Pathan"], [1085, "Pathan Vaiṣṇava Bijali Khan"]]),
  ...put(NITAI, "associate", "pārṣada / one of the twelve gopālas / host of Nityānanda", [[616, "Jīva (Jīva Paṇḍita)"], [1988, "Nāgara Puruṣottama"], [500, "Hiranaya Ṭhākura"]]),
  ...put(ADVAITA, "diksa", "disciple of Advaita Ācārya (GGD 107, 211)", [[1459, "Srinatha CakravartiAcarya"]]),
  ...put(SRINIVASA, "diksa", "disciple of Śrīnivāsa Ācārya (Anurāga-vallī 7)", [[1629, "Vanamālī Kavirāja"]]),
  ...put(MADHAVENDRA, "disciple", "one of the nine roots of the Caitanya tree (CC Ādi 9.14)", [[718, "Keśava Purī"]]),
];
fs.writeFileSync(new URL("./fuera8-unir.json", import.meta.url), JSON.stringify(unir, null, 1));
fs.writeFileSync(new URL("./fuera8.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(unir.length, "merges,", plan.length, "to place");
