// node mezcladas2.mjs → mezcladas2.json for separar.mjs (block 2 of the mixed records, 07-11-2026)
import fs from "node:fs";
const D = "07-11-2026";
const RASIK = 1908, SYAMA = 1535, NAROTTAMA = 1010, GAURA = 164, SRINIVASA = 1466, VRNDAVANADASA = 1740;
const from = (name, id) => `Taken out of the record «${name}» #${id}, which mixed several persons (${D}).`;
const kept = (others) => `The record also held ${others}, now in a record of its own (${D}).`;
const plan = [
  {
    id: 275, name: "Gadādhara", place: [SYAMA, "diksa"],
    fields: { name: "Gadādhara (disciple of Śyāmānanda)", guru: "Śyāmānanda Prabhu", place: "Gopīballabhpur (Śrīpāṭa)",
      notes: `He was a disciple of Śyāmānanda Prabhu, of the Śrīpāṭa of Gopīballabhpur (Prema-vilāsa 20).\n\n${kept("the Gadādhara of Barahanpura who installed Lālavihārī")}` },
    new: [{ key: "a", name: "Gadādhara (of Barahanpura)",
      fields: { place: "Barahanpura", notes: `A devotee from Barahanpura who installed the Deity of Lālavihārī (Bhaktamālā 25.3). ${from("Gadādhara", 275)}` } }],
  },
  {
    id: 345, name: "Gopāla Ācārya", place: [RASIK, "diksa"],
    fields: { guru: "Rasikānanda Prabhu", notes: `He was a disciple of Rasikānanda Prabhu (Rasikamaṅgala Paścima 14.133).\n\n${kept("the Gopāla Ācārya of the Narottama-vilāsa and the Gopāla Ācārya of Lord Caitanya's branch")}` },
    new: [
      { key: "a", name: "Gopāla Ācārya (Narottama-vilāsa)", fields: { notes: `His name is recorded in the Narottama-vilāsa. ${from("Gopāla Ācārya", 345)}` } },
      { key: "b", name: "Gopāla Ācārya (Caitanya's branch)", place: [GAURA, "associate"],
        fields: { notes: `He belonged to the branch of Lord Caitanya (Caitanya-caritāmṛta Ādi 10.114; Nāmāmṛta-samudra 135). ${from("Gopāla Ācārya", 345)}` } },
    ],
  },
  {
    id: 362, name: "Gopāla Siṁha", poet: true,
    fields: { place: "Viṣṇupura", works: "a kāvya on Rādhā-Kṛṣṇa-līlā",
      notes: `The sixth descendant in the family of Rāja Vīra Hāmvīra of Viṣṇupura; he ruled the state from 1712 to 1748 A.D. and composed a kāvya on Rādhā-Kṛṣṇa-līlā.\n\n${kept("Gopīnātha Siṁha of Lord Caitanya's branch («Akrūra»)")}` },
    new: [{ key: "a", name: "Gopīnātha Siṁha", place: [GAURA, "associate"],
      fields: { notes: `He belonged to the branch of Lord Caitanya, who called him «Akrūra» (Caitanya-caritāmṛta Ādi 10.76). ${from("Gopāla Siṁha", 362)}` } }],
  },
  {
    id: 372, name: "Gopijanavallabha", place: [SRINIVASA, "diksa"],
    fields: { name: "Gopījanavallabha (son-in-law of Śrīnivāsa)", guru: "Śrīnivāsa Ācārya", place: "Budhuipāḍā (Murshidabad)",
      notes: `The son-in-law and disciple of Śrīnivāsa Ācārya. His father was Rāmakṛṣṇa Caṭṭarāja and his Śrīpāṭa was at Budhuipāḍā in Murshidabad; he married Hemalatā Devī, Śrīnivāsa Ācārya's eldest daughter (Karṇānanda 1).\n\n${kept("Gopījanavallabha the eldest son of Vīracandra")}` },
    new: [{ key: "a", name: "Gopījanavallabha (son of Vīracandra)",
      fields: { notes: `The eldest son of Vīracandra Prabhu (Prema-vilāsa 24). ${from("Gopijanavallabha", 372)}` } }],
  },
  {
    id: 378, name: "GOPĪKṚṢṆA Dāsa",
    fields: { name: "Gopīkṛṣṇa Dāsa (disciple of Śyāmānandī Dāmodara)", guru: "Śyāmānandī Dāmodara",
      notes: `He was a disciple of Śyāmānandī Dāmodara.\n\n${kept("Gopīkṛṣṇa Dāsa the author of the Harināma-kavaca")}` },
    new: [{ key: "a", name: "Gopīkṛṣṇa Dāsa (author of the Harināma-kavaca)",
      fields: { works: "Harināma-kavaca", notes: `He was the author of the book Harināma-kavaca. ${from("GOPĪKṚṢṆA Dāsa", 378)}` } }],
  },
  {
    id: 389, name: "Gopīnātha", place: [VRNDAVANADASA, "associate"],
    fields: { name: "Gopīnātha Brahmacārī (associate of Vṛndāvana dāsa)", guru: "", place: "Denuḍa (Burdwan)",
      notes: `An intimate associate of Vṛndāvana dāsa, the author of the Caitanya-bhāgavata. He was the son of Gopāla, the youngest son of Balabhadra, and the first of the brahmacārī clan of Denuḍa village in Burdwan.\n\n${kept("the Gopīnātha disciple of Rasikānanda and the Gopīnātha disciple of Śyāmānanda")}` },
    new: [
      { key: "a", name: "Gopīnātha (disciple of Rasikānanda)", place: [RASIK, "diksa"],
        fields: { guru: "Rasikānanda Prabhu", notes: `He was a disciple of Rasikānanda Prabhu (Rasikamaṅgala Dakṣiṇa 4.19). ${from("Gopīnātha", 389)}` } },
      { key: "b", name: "Gopīnātha (disciple of Śyāmānanda)", place: [SYAMA, "diksa"],
        fields: { guru: "Śyāmānanda Prabhu", notes: `He was a disciple of Śyāmānanda Prabhu (Rasikamaṅgala Pūrva 1.32). ${from("Gopīnātha", 389)}` } },
    ],
  },
  {
    id: 419, name: "Govinda Rāya", place: [NAROTTAMA, "diksa"],
    fields: { guru: "Narottama Ṭhākura", notes: `He was a disciple of Narottama Ṭhākura (Prema-vilāsa 20, Narottama-vilāsa 12).\n\n${kept("the Govinda Rāya of Śrīnivāsa Ācārya's family")}` },
    new: [{ key: "a", name: "Govinda Rāya (of Śrīnivāsa's family)",
      fields: { notes: `He descended from the family of Śrīnivāsa Ācārya (Anurāga-vallī 7). ${from("Govinda Rāya", 419)}` } }],
  },
  {
    id: 436, name: "Guruprasada Sengupta (Prasāda Dāsa)", poet: true,
    fields: { works: "Pada-cintāmaṇi-mālā (1876)",
      notes: `The father of the well-known Bengali poet Rajanikanta Sen. Guruprasāda compiled a padāvalī collection, the Pada-cintāmaṇi-mālā, most of its padas in Vrajabuli; first published in 1283 (1876 A.D.), with his introduction on the sounds and grammar of Vrajabuli.` },
  },
  {
    id: 460, name: "Hari", place: [RASIK, "diksa"],
    fields: { name: "Hari (disciple of Rasikānanda)", guru: "Rasikānanda Prabhu", notes: `He was a disciple of Rasikānanda Prabhu (Rasikamaṅgala Paścima 14.111).\n\n${kept("the Sanskrit poet Hari of the Padyāvalī")}` },
    new: [{ key: "a", name: "Hari (Sanskrit poet of the Padyāvalī)", poet: true,
      fields: { notes: `A Sanskrit poet whose name is in the Padyāvalī (Viśvakoṣa vol. 22, p. 479). ${from("Hari", 460)}` } }],
  },
  {
    id: 560, name: "Jagannātha Miśra (teacher of Rasikānanda)",
    fields: { notes: `He was the teacher of Rasikānanda Prabhu (Rasikamaṅgala Pūrva 9.49).\n\nThe record also said «the son of Mādhava Miśra, also named Vāṇīnātha» (Prema-vilāsa 20): that is Vāṇīnātha Paṇḍita, Gadādhara's brother (#1641), not this Jagannātha; nor Lord Caitanya's father, «Jagannātha Miśra (Purandara)».` },
  },
  {
    id: 607, name: "Jayarama Cakravartī",
    fields: { name: "Jayarāma Cakravartī", notes: `A disciple of Śrīnivāsa Ācārya; his Śrīpāṭa was at Kausona in Gauḍa (Anurāga-vallī 7). Śyāma Bhaṭṭa, Kṛṣṇa Purohita and Jayarāma lived in the same village (Karṇānanda 1).\n\n${kept("the Jayarāma of Navadvīpa, maternal grandfather of Svarūpa Dāmodara")}` },
    new: [{ key: "a", name: "Jayarāma (grandfather of Svarūpa Dāmodara)",
      fields: { place: "Navadvīpa", notes: `A resident of Navadvīpa, the maternal grandfather of Svarūpa Dāmodara; Padmagarbhācārya married his daughter (Prema-vilāsa 24). ${from("Jayarama Cakravartī", 607)}` } }],
  },
  {
    id: 612, name: "Jayarama",
    fields: { name: "Jayarāma (commentator of the Padyāmṛta-taraṅgiṇī)", works: "Sapanaracana (ṭīkā of the Padyāmṛta-taraṅgiṇī)",
      notes: `He wrote a ṭīkā of the Padyāmṛta-taraṅgiṇī entitled Sapanaracana (Viśvakoṣa vol. VI, p. 682).\n\n${kept("the Vedāntist Jayarāmācārya, author of the Pāṣaṇḍa-capeṭikā")}` },
    new: [{ key: "a", name: "Jayarāmācārya (Vijayarāmācārya)",
      fields: { aka: "Jayarāma, Vijayarāmācārya", works: "Pāṣaṇḍa-capeṭikā",
        notes: `A Vedāntist, also known as Jayarāmācārya and Vijayarāmācārya. He wrote in Sanskrit the Pāṣaṇḍa-capeṭikā, with arguments against the philosophy of the Madhva-sampradāya (Viśvakoṣa vol. VI, p. 682). ${from("Jayarama", 612)}` } }],
  },
  {
    id: 648, name: "Kamalākānta Dāsa",
    fields: { name: "Kamalākānta Dāsa (disciple of Jagadīśa Paṇḍita)", guru: "Jagadīśa Paṇḍita", place: "Durgāpur",
      notes: `A resident of Durgāpur and a disciple of Jagadīśa Paṇḍita (Caitanya-maṅgala of Jayānanda 12.4).\n\n${kept("Kamalākānta Dāsa the Vrajabuli poet of the Padaratnākara")}` },
    new: [{ key: "a", name: "Kamalākānta Dāsa (Vrajabuli poet)", poet: true,
      fields: { works: "Padaratnākara (1806)", notes: `Famous for his verses in Vrajabuli; twelve or thirteen of his padas are in the Padaratnākara, which he published in 1806. ${from("Kamalākānta Dāsa", 648)}` } }],
  },
  {
    id: 656, name: "Kamalakara Dāsa",
    fields: { name: "Kamalākara Dāsa Ṭhākura", notes: `His title was Ṭhākura, and he was probably a brāhmaṇa. In the Vaiṣṇava-vandanā his name comes next to Kamalākara Pippalāi. According to the Pāṭa-paryaṭana he was a disciple of Abhirāma Gosvāmī.\n\n${kept("Kamalākara Dāsa the father of Locana dāsa")}` },
    new: [{ key: "a", name: "Kamalākara Dāsa (father of Locana dāsa)",
      fields: { notes: `A vaidya, the father of Locana dāsa, the author of the Caitanya-maṅgala (see «Locana dāsa»). ${from("Kamalakara Dāsa", 656)}` } }],
  },
];
fs.writeFileSync(new URL("./mezcladas2.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length, "records,", plan.reduce((n, g) => n + (g.new?.length ?? 0), 0), "new");
