// node mezcladas4.mjs → mezcladas4.json for separar.mjs (block 4 of the mixed records, 07-11-2026)
import fs from "node:fs";
const D = "07-11-2026";
const SYAMA = 1535, NAROTTAMA = 1010, SATYABHAMA = 1390, ISVARI = 519, RAGHUNANDANA = 1200, NARAHARI = 980;
const from = (name, id) => `Taken out of the record «${name}» #${id}, which mixed several persons (${D}).`;
const kept = (others) => `The record also held ${others}, now in a record of its own (${D}).`;
const plan = [
  {
    id: 1036, name: "Nimananda Dāsa", poet: true,
    fields: { name: "Nimānanda Dāsa (compiler of the Padarasasāra)", works: "Padarasasāra (2,700 padas, 246 his own)",
      notes: `A composer and compiler of padas: he gathered 2,700 padas in the Padarasasāra, 246 of them his own.\n\n${kept("the Nimānanda Dāsa who put the Gaurāṅga-stava-kalpataru into Bengali verse")}` },
    new: [{ key: "a", name: "Nimānanda Dāsa (translator of the Gaurāṅga-stava-kalpataru)", poet: true,
      fields: { works: "Śrī Gaurāṅga-stava-kalpataru in Bengali verse", notes: `He translated the Śrī Gaurāṅga-stava-kalpataru of Śrī Dāsa Gosvāmī into Bengali verse (Barānagar Pāṭhbāḍī ms. no. Anu 12 kha). ${from("Nimananda Dāsa", 1036)}` } }],
  },
  {
    id: 1110, name: "Prasāda Dāsa",
    fields: { notes: `Disciple of Bhakti Prapanna Dāmodara Gosvāmī Mahārāja (his place in the Guru Paramparā).\n\nThe record also held the Prasāda Dāsa disciple of Śyāmānanda (now a record of its own) and a «see Guruprasāda Sengupta» (the compiler of the Pada-cintāmaṇi-mālā, #436, also called Prasāda Dāsa) (${D}).` },
    new: [{ key: "a", name: "Prasāda Dāsa (disciple of Śyāmānanda)", place: [SYAMA, "diksa"],
      fields: { guru: "Śyāmānanda Prabhu", notes: `He was a disciple of Śyāmānanda Prabhu; his name is in the Rasikamaṅgala. ${from("Prasāda Dāsa", 1110)}` } }],
  },
  {
    id: 1127, name: "Puruṣottama Brahmacārī",
    fields: { notes: `He belonged to the line of Advaita Ācārya (Caitanya-caritāmṛta Ādi 12.62; Nāmāmṛta-samudra 244).\n\n${kept("the Puruṣottama Brahmacārī of Kāñcīsālī")}` },
    new: [{ key: "a", name: "Puruṣottama Brahmacārī (of Kāñcīsālī)",
      fields: { place: "Kāñcīsālī", notes: `A resident of Kāñcīsālī (Vaiṣṇava-vandanā of Śrī Jīva Gosvāmī 240, of Devakīnandana 116, of Vṛndāvana dāsa 109); perhaps the same as the Puruṣottama Brahmacārī of Advaita's line. ${from("Puruṣottama Brahmacārī", 1127)}` } }],
  },
  {
    id: 1181, name: "Rādhāvinoda Cakravartī", place: [SATYABHAMA, "diksa"],
    fields: { notes: `He was a disciple of Satyabhāmā Devī, the daughter-in-law of Śrīnivāsa Ācārya (Karṇānanda 2).\n\n${kept("the Rādhāvinoda Cakravartī disciple of Īśvarī Devī, son of Govinda Cakravartī")}` },
    new: [{ key: "a", name: "Rādhāvinoda Cakravartī (son of Govinda Cakravartī)", place: [ISVARI, "diksa"],
      fields: { guru: "Īśvarī Devī (wife of Śrīnivāsa Ācārya)", place: "Borākulī (Śrīpāṭa)",
        notes: `He was a disciple of Īśvarī Devī, the wife of Śrīnivāsa Ācārya; the second son of Govinda Cakravartī, of the Śrīpāṭa at Borākulī. His brothers were Rājavallabha and Kiśorī (Karṇānanda 1). ${from("Rādhāvinoda Cakravartī", 1181)}` } }],
  },
  {
    id: 1205, name: "Raghunātha Cakravartī",
    fields: { notes: `The disciple and father-in-law of Śrīnivāsa Ācārya, also known as «Rāghava»; the father of Gaurāṅgapriyā Devī, of the Śrīpāṭa of Gopālpur; Mādhavī Devī was his wife (Prema-vilāsa 17, Karṇānanda 1, Bhakti-ratnākara 3.204-205).\n\n${kept("the Raghunātha Cakravartī elder brother of Viśvanātha Cakravartī")}` },
    new: [{ key: "a", name: "Raghunātha Cakravartī (brother of Viśvanātha Cakravartī)",
      fields: { notes: `The elder brother of Viśvanātha Cakravartī, a great scholar (Narottama-vilāsa ms.; see «Viśvanātha Cakravartī»). ${from("Raghunātha Cakravartī", 1205)}` } }],
  },
  {
    id: 1230, name: "Rāma Devī",
    fields: { name: "Rāma Devī (wife of Yogeśvara Paṇḍita)",
      notes: `The daughter of Nidhipati, the younger brother of Kamalākara Pippalāi. The authorities at Śrīpāṭa Māheś say she was married to Yogeśvara Paṇḍita, a well-known Vaiṣṇava of Khaḍadaha; both were devotees of Lord Gaurāṅga.\n\n${kept("the Rāma Devī who was the paternal grandmother of Rūpa and Sanātana")}` },
    new: [{ key: "a", name: "Rāma Devī (grandmother of Rūpa and Sanātana)",
      fields: { notes: `The paternal grandmother of Rūpa and Sanātana Gosvāmī, the daughter of Yadujīvana Tarkālaṅkāra, the court scholar of King Mahendrasiṁha of Burdwan. ${from("Rāma Devī", 1230)}` } }],
  },
  {
    id: 1248, name: "Rāmacandra",
    fields: { name: "Rāmacandra (disciple of Rasikānanda)", notes: `He was a disciple of Rasikānanda Prabhu (Rasikamaṅgala Paścima 14.136).\n\n${kept("three other Rāmacandras: the youngest son of Vīracandra, the one of Raghunandana's branch, and a poet")}` },
    new: [
      { key: "a", name: "Rāmacandra (son of Vīracandra)", fields: { notes: `The youngest son of Vīracandra Prabhu (Prema-vilāsa 24). ${from("Rāmacandra", 1248)}` } },
      { key: "b", name: "Rāmacandra (of Raghunandana's branch)", place: [RAGHUNANDANA, "disciple"],
        fields: { place: "Śrīkhaṇḍa", notes: `A resident of Śrīkhaṇḍa of the branch of Raghunandana Ṭhākura. ${from("Rāmacandra", 1248)}` } },
      { key: "c", name: "Rāmacandra (poet)", poet: true, fields: { notes: `A Vaiṣṇava poet. ${from("Rāmacandra", 1248)}` } },
    ],
  },
  {
    id: 1272, name: "Ramakanta",
    fields: { name: "Ramākānta (brother of Rudra Paṇḍita)",
      notes: `The brother of Rudra Paṇḍita of Śrīpāṭa Ballabhapur and the nephew (sister's son) of Kāśīśvara Paṇḍita of Śrīpāṭa Cātarā (see «Kāśīnātha Paṇḍita» and «Kāśīśvara Paṇḍita»).\n\n${kept("the poet Ramākānta")}` },
    new: [{ key: "a", name: "Ramākānta (poet)", poet: true,
      fields: { works: "pada 1572 of the Padakalpataru", notes: `A Vaiṣṇava poet whose life is not known (pada no. 1572 of the Padakalpataru). ${from("Ramakanta", 1272)}` } }],
  },
  {
    id: 1288, name: "Ramanatha",
    fields: { name: "Rāmanātha (disciple of Narottama)",
      notes: `A disciple of Narottama Ṭhākura. His father was Vipradāsa and his mother Bhagavatī; his brother was Yadunātha. From Vipradāsa's granary came the Deity of Lord Gaurāṅga that Narottama Ṭhākura installed (Prema-vilāsa 20; see «Vipradāsa»).\n\n${kept("the Rāmanātha that B. B. Majumdar counts among the Catuḥsana")}` },
    new: [{ key: "a", name: "Rāmanātha (of the Catuḥsana)",
      fields: { notes: `According to B. B. Majumdar (Caitanya-cariter Upādān p. 681) he was one of the Catuḥsana. ${from("Ramanatha", 1288)}` } }],
  },
  {
    id: 1760, name: "Yādava Kavirāja", place: [NARAHARI, "disciple"],
    fields: { place: "Kuliā, near Śrīkhaṇḍa", notes: `A resident of Kuliā near Śrīkhaṇḍa, of the disciple line of Narahari Sarakāra.\n\n${kept("the Yādava Kavirāja disciple of Narottama Ṭhākura")}` },
    new: [{ key: "a", name: "Yādava Kavirāja (disciple of Narottama)", place: [NAROTTAMA, "diksa"],
      fields: { guru: "Narottama Ṭhākura", notes: `He was a disciple of Narottama Ṭhākura (Prema-vilāsa 20). ${from("Yādava Kavirāja", 1760)}` } }],
  },
];
fs.writeFileSync(new URL("./mezcladas4.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length, "records,", plan.reduce((n, g) => n + (g.new?.length ?? 0), 0), "new");
