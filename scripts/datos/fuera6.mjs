// node fuera6.mjs → fuera6-poetas.json (poetas.mjs) and fuera6-separar.json (separar.mjs)   (07-11-2026)
// Batch 6 of the records outside the tree: the poets left without the label «Poetas» (those that compose padas
// or verse; not those Whisper left out on 06-11: 186, 187, 1335, 1303, 1726; nor kings, relatives, pointers),
// and the last five mixed records (several «## NAME» entries in one text).
import fs from "node:fs";
const D = "07-11-2026";
const RASIK = 1908, SYAMA = 1535, NARAHARI = 980, NITAI = 1851, GAURA = 164, GADADHARA = 274;
const poets = [3, 22, 400, 440, 538, 585, 781, 797, 851, 875, 983, 1015, 1018, 1020, 1021, 1054, 1337, 1985].map((id) => ({ id }));
const from = (name, id) => `Taken out of the record «${name}» #${id}, which mixed several persons (${D}).`;
const kept = (others) => `The record also held ${others}, now in records of their own (${D}).`;
const G = "## GIRIDHARA DĀSA\n\n", J = "## JAGANNĀTHA\n\n", M = "## MĀDHAVA\n\n";
const separar = [
  { id: 331, name: "Giridhara Dāsa", place: [NARAHARI, "diksa"],
    fields: { name: "Giridhara Dāsa (disciple of Narahari Sarakāra)", works: "Parakīya-rasa-sthāpana-siddhānta-saṅgraha",
      notes: `A disciple of Narahari Sarakāra Ṭhākura; he wrote the Parakīya-rasa-sthāpana-siddhānta-saṅgraha, kept in the library of Rākhālānanda Ṭhākura at Śrīkhaṇḍa.\n\n${kept("three Giridhara Dāsas translators (of the Smaraṇa-maṅgala, of the Manaḥ-śikṣā and of the Gīta-govinda)")}` },
    new: [
      { key: "a", name: "Giridhara Dāsa (translator of the Smaraṇa-maṅgala)", poet: true, fields: { notes: from("Giridhara Dāsa", 331) } },
      { key: "b", name: "Giridhara Dāsa (translator of the Manaḥ-śikṣā)", poet: true, fields: { notes: from("Giridhara Dāsa", 331) } },
      { key: "c", name: "Giridhara Dāsa (translator of the Gīta-govinda, 1733)", poet: true, fields: { notes: from("Giridhara Dāsa", 331) } },
    ],
    docs: [{ doc: 334, pieces: [
      { to: "a", title: "Giridhara Dāsa", start: G + "This Giridhara Dāsa was among", end: G + "He was one of the two translators" },
      { to: "b", title: "Giridhara Dāsa", start: G + "He was one of the two translators", end: G + "He translated Gītāgovinda" },
      { to: "c", title: "Giridhara Dāsa", start: G + "He translated Gītāgovinda", end: G + "A disciple of Narahari" },
    ] }] },
  { id: 570, name: "Jagannātha", place: [NITAI, "disciple"],
    fields: { name: "Jagannātha (uncle of Jāhnavā Mātā)",
      notes: `A brāhmaṇa of Nityānanda's branch, the second son of Kaṁsāri Miśra and an uncle of Jāhnavā Mātā, the wife of Nityānanda Prabhu (Caitanya-caritāmṛta Ādi 11.48).\n\n${kept("four other Jagannāthas: the son of Kānhāi Khuṇṭiyā, Tārakā, the disciple of Rasikānanda and the disciple of Śyāmānanda")}` },
    new: [
      { key: "a", name: "Jagannātha (son of Kānhāi Khuṇṭiyā)", fields: { place: "Purī", notes: from("Jagannātha", 570) } },
      { key: "b", name: "Jagannātha (Tārakā, Gaura-gaṇoddeśa-dīpikā 158)", fields: { notes: from("Jagannātha", 570) } },
      { key: "c", name: "Jagannātha (disciple of Rasikānanda)", place: [RASIK, "diksa"], fields: { guru: "Rasikānanda Prabhu", notes: from("Jagannātha", 570) } },
      { key: "d", name: "Jagannātha (disciple of Śyāmānanda)", place: [SYAMA, "diksa"], fields: { guru: "Śyāmānanda Prabhu", place: "Gopīballabhpur (Śrīpāṭa)", notes: from("Jagannātha", 570) } },
    ],
    docs: [{ doc: 575, pieces: [
      { to: "a", title: "Jagannātha", start: J + "A resident of Orissa", end: J + "He was Tārakā" },
      { to: "b", title: "Jagannātha", start: J + "He was Tārakā", end: J + "This Jagannātha was a disciple" },
      { to: "c", title: "Jagannātha", start: J + "This Jagannātha was a disciple", end: J + "He was a disciple of Śyāmānanda" },
      { to: "d", title: "Jagannātha", start: J + "He was a disciple of Śyāmānanda", end: J + "A brāhmaṇa belonging" },
    ] }] },
  { id: 600, name: "Jayagopala Dāsa",
    fields: { name: "Jayagopāla Dāsa (father of Balarāma dāsa)", place: "Kāṇḍaḍā (Burdwan)", works: "Kṛṣṇa-vilāsa, Jñāna-pradīpa",
      notes: `The father of Balarāma dāsa of the famous Maṅgala Ṭhākura family of Kāṇḍaḍā in Burdwan; he wrote the Kṛṣṇa-vilāsa and the Jñāna-pradīpa, and was a disciple of Sundarānanda.\n\n${kept("the Jayagopāla Dāsa guru of Ghanaśyāma dāsa, author of the Bhakti-bhāva-pradīpa")}` },
    new: [{ key: "a", name: "Jayagopāla Dāsa (author of the Bhakti-bhāva-pradīpa)",
      fields: { works: "Bhakti-bhāva-pradīpa; Bhakti-ratnākara (Sanskrit, 1629)", notes: from("Jayagopala Dāsa", 600) } }],
    docs: [{ doc: 605, pieces: [{ to: "a", title: "Jayagopāla Dāsa", start: "## JAYAGOPALA DĀSA\n\nHe was the guru of Ghanasyamadasa", end: "## JAYAGOPALA DĀSA\n\nHe was the father" }] }] },
  { id: 867, name: "Mādhava",
    fields: { name: "Mādhava (of Vṛndāvana, CC Madhya 13.51)",
      notes: `There were two devotees named Mādhava in Vṛndāvana, both from Bengal; nothing more is known of them (Caitanya-caritāmṛta Madhya 13.51).\n\n${kept("five other Mādhavas: Puṇḍarīka Vidyānidhi's friend, the one of Nityānanda's branch, the disciple of Rasikānanda, the poet, and the Oḍiyā disciple of Gadādhara")}` },
    new: [
      { key: "a", name: "Mādhava (friend of Puṇḍarīka Vidyānidhi)", fields: { place: "Cakraśālā (Chittagong)", notes: from("Mādhava", 867) } },
      { key: "b", name: "Mādhava (Nityānanda's branch, CC Ādi 11.48)", place: [NITAI, "disciple"], fields: { notes: from("Mādhava", 867) } },
      { key: "c", name: "Mādhava (disciple of Rasikānanda)", place: [RASIK, "diksa"], fields: { guru: "Rasikānanda Prabhu", notes: from("Mādhava", 867) } },
      { key: "d", name: "Mādhava (poet, 55 padas)", poet: true, fields: { works: "55 padas in the Padakalpataru", notes: from("Mādhava", 867) } },
      { key: "e", name: "Mādhava (Oḍiyā disciple of Gadādhara, Caitanya-vilāsa)", place: [GADADHARA, "diksa"], fields: { guru: "Gadādhara Paṇḍita", works: "Śrī Caitanya-vilāsa (Oḍiyā)", notes: from("Mādhava", 867) } },
    ],
    docs: [{ doc: 874, pieces: [
      { to: "a", title: "Mādhava", start: M + "He was the childhood friend", end: M + "He belonged to the sakhā" },
      { to: "b", title: "Mādhava", start: M + "He belonged to the sakhā", end: M + "He was a disciple of Rasikānanda" },
      { to: "c", title: "Mādhava", start: M + "He was a disciple of Rasikānanda", end: M + "He was a composer of padas" },
      { to: "d", title: "Mādhava", start: M + "He was a composer of padas", end: M + "He was an Odisi disciple" },
      { to: "e", title: "Mādhava", start: M + "He was an Odisi disciple" },
    ] }] },
  { id: 1366, name: "Śaṅkara", place: [NITAI, "disciple"],
    fields: { name: "Śaṅkara (Nityānanda's branch)", guru: "",
      notes: `He belonged to the branch of Lord Nityānanda (Caitanya-caritāmṛta Ādi 11.52).\n\n${kept("the Śaṅkara of Kulīna-grāma (Caitanya's branch) and the Śaṅkara disciple of Rasikānanda")}` },
    new: [
      { key: "a", name: "Śaṅkara (of Kulīna-grāma)", place: [GAURA, "associate"], fields: { place: "Kulīna-grāma", notes: `A resident of Kulīna-grāma of the branch of Lord Caitanya (Caitanya-caritāmṛta Ādi 10.80). ${from("Śaṅkara", 1366)}` } },
      { key: "b", name: "Śaṅkara (disciple of Rasikānanda)", place: [RASIK, "diksa"], fields: { guru: "Rasikānanda Prabhu", notes: `He was a disciple of Rasikānanda Prabhu (Rasikamaṅgala Paścima 14.159). ${from("Śaṅkara", 1366)}` } },
    ] },
];
fs.writeFileSync(new URL("./fuera6-poetas.json", import.meta.url), JSON.stringify(poets, null, 1));
fs.writeFileSync(new URL("./fuera6-separar.json", import.meta.url), JSON.stringify(separar, null, 1));
console.log(poets.length, "poets,", separar.length, "to split,", separar.reduce((n, g) => n + g.new.length, 0), "new");
