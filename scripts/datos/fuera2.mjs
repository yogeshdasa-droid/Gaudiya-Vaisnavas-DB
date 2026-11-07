// node fuera2.mjs → fuera2-unir.json (unir.mjs) and fuera2.json (colocar.mjs)   (07-11-2026)
// Batch 2 of the records outside the tree: those that Caitanya-caritāmṛta Ādi 10 / 11 / 12 names as a branch of
// Lord Caitanya, of Nityānanda, of Advaita or of Gadādhara (checked by hand), and two records repeated.
import fs from "node:fs";
const D = "07-11-2026";
const GAURA = 164, NITAI = 1851, ADVAITA = 15, GADADHARA = 274;
const unir = [
  { into: 534, name: "Jagadīśa Paṇḍita", from: [{ id: 1826, name: "Jagadīśa" }],
    fields: { notes: `In Kṛṣṇa-līlā: the dancer Candrahāsa; also one of the yajña-patnīs (v. 192) (Gaura-gaṇoddeśa-dīpikā 143, 192). Dates/place from B. V. Tīrtha, “Sri Chaitanya: His Associates”.\n\nParents: Śrī Kamalākṣa Bhaṭṭa (son of Bhaṭṭa Nārāyaṇa); wife Duḥkhinī Devī. He preached the Holy Name at Nīlācala, brought the Deity of the lotus-eyed Lord to Yaśorā near Cākdaha, and fed the baby Gaurahari on an Ekādaśī from his house. The fifteenth branch of Lord Nityānanda (Caitanya-caritāmṛta Ādi 11.30).\n\nThe record «Jagadīśa» #1826 was the same person and was joined to this one (${D}).` } },
  { into: 901, name: "Mamu GosvamiThakur", from: [{ id: 547, name: "Jagannātha (Jagannātha Dvija Cakravartī Mamu Ṭhākura" }],
    fields: { name: "Mamu Ṭhākura (Jagannātha Cakravartī)", aka: "Jagannātha Cakravartī, Mamu Gosvāmī, Jagannātha Dvija Cakravartī",
      place: "Magaḍobā (Faridpur); Purī (Ṭoṭā-Gopīnātha)",
      notes: `His original name was Jagannātha Cakravartī, the nephew of Śrī Nīlāmbara Cakravartī, of Magaḍobā in Faridpur. Of Gadādhara's branch (Caitanya-caritāmṛta Ādi 12.80); after Gadādhara's disappearance he served Ṭoṭā-Gopīnātha in Purī, and he guided Narottama to the places of Mahāprabhu's pastimes there. In Kṛṣṇa-līlā: Kalabhāṣiṇī (Gaura-gaṇoddeśa-dīpikā 196, 205).\n\nThe record «Jagannātha (Jagannātha Dvija Cakravartī Mamu Ṭhākura)» #547 was the same person and was joined to this one (${D}).` } },
];
const put = (parent, kind, why, list) => list.map(([id, name]) => ({ id, name, parent, kind, why }));
const plan = [
  ...put(GAURA, "associate", "Caitanya's branch (CC Ādi 10)", [
    [140, "Bhavananda Rāya Pattanayaka"], [166, "Chandraśekhara Acaryaratna"], [280, "Galima"], [640, "Kamabhatta"],
    [692, "Kāśīnātha Dvija"], [869, "Śrī Mādhavī Devī"], [1072, "Paramānanda Mahapatra"], [1099, "Pradyumna Miśra"],
    [1138, "Puruṣottama Sañjaya"], [1413, "Sinhesvara Odra"], [1464, "Śrīnidhi"], [1488, "Śuklāmbara Brahmacārī"],
    [1607, "Vallabha Sena"], [1652, "Vāsudeva Datta"], [1671, "Vidyananda"], [1866, "Sharanga Murāri Ṭhākura"],
    [1928, "Kamalānanda"], [1961, "Śrīrāma Paṇḍita"], [1962, "Śrīpati Paṇḍita"], [1983, "Haridāsa Ācārya (Dvija Haridāsa)"],
    [969, "Nandana (Nandana Ācārya)"],
  ]),
  ...put(NITAI, "disciple", "Nityānanda's branch (CC Ādi 11)", [[534, "Jagadīśa Paṇḍita"], [1648, "Vasanta"]]),
  ...put(ADVAITA, "disciple", "Advaita's branch (CC Ādi 12)", [[85, "Balarāma Miśra"]]),
  ...put(GADADHARA, "disciple", "Gadādhara's branch (CC Ādi 12)", [
    [901, "Mamu Ṭhākura (Jagannātha Cakravartī)"], [551, "Jagannātha Dāsa (Kasthakata)"], [615, "Jita Mitra"], [1191, "Raghu Miśra"],
    [1346, "Sadipuriya Gopāla"], [1439, "Srihari Ācārya"], [1442, "Sriharsa"], [1635, "Vangavati Caitanyadāsa"],
  ]),
];
fs.writeFileSync(new URL("./fuera2-unir.json", import.meta.url), JSON.stringify(unir, null, 1));
fs.writeFileSync(new URL("./fuera2.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(unir.length, "merges,", plan.length, "to place");
