// node mezcladas1.mjs → mezcladas1.json for separar.mjs (block 1 of the mixed records, 07-11-2026)
// Each «1. … 2. …» of the record is a different person with its own source: the record keeps one, the others
// get their own record, each under the guru its line names (if that guru is in the tree).
import fs from "node:fs";
const D = "07-11-2026";
const RASIK = 1908, SYAMA = 1535, NAROTTAMA = 1010, ADVAITA = 15, NITAI = 1851, GAURA = 164, RAMACANDRA = 1244, HEMALATA = 497;
const from = (name, id) => `Taken out of the record «${name}» #${id}, which mixed several persons (${D}).`;
const kept = (others) => `The record also held ${others}, now in a record of its own (${D}).`;
const plan = [
  {
    id: 25, name: "Akiñcana Dāsa",
    fields: { notes: `He was a devotee of Lord Gaurāṅga (Nāmāmṛta-samudra 159, ed. Haridāsa Dāsa).\n\n${kept("Akiñcana Dāsa the translator of the Jagannātha-vallabha-nāṭaka")}` },
    new: [{ key: "a", name: "Akiñcana Dāsa (translator of the Jagannātha-vallabha-nāṭaka)", poet: true,
      fields: { works: "Śrī Jagannātha-vallabha-nāṭaka in Bengali verse", notes: `He translated in verse the Śrī Jagannātha-vallabha-nāṭaka (Calcutta University manuscript no. 1512). ${from("Akiñcana Dāsa", 25)}` } }],
  },
  {
    id: 34, name: "Ānanda Dāsa",
    fields: { name: "Ānanda Dāsa (author of the Jagadīśa-caritra)", guru: "", works: "Śrī Jagadīśa-caritra (1718-1728)",
      notes: `Fifth generation of the line of Jagadīśa Paṇḍita. In a dream Bhāgavatānanda, a disciple of one of Jagadīśa Paṇḍita's disciples, told him to write the Śrī Jagadīśa-caritra, compiled in 1640-50 Śaka (1718-1728 A.D.).\n\n${kept("Ānanda Dāsa the disciple of Śyāmānandī Dāmodara")}` },
    new: [{ key: "a", name: "Ānanda Dāsa (disciple of Śyāmānandī Dāmodara)",
      fields: { guru: "Śyāmānandī Dāmodara", notes: `He was a disciple of Śyāmānandī Dāmodara (Rasikamaṅgala Paścima 15.18). ${from("Ānanda Dāsa", 34)}` } }],
  },
  {
    id: 45, name: "Ananta Dāsa", place: [ADVAITA, "disciple"],
    fields: { notes: `He was a descendant in the disciple line of Advaita Prabhu (Caitanya-caritāmṛta Ādi 12.61).\n\n${kept("Ananta Dāsa the poet")}` },
    new: [{ key: "a", name: "Ananta Dāsa (poet)", poet: true,
      fields: { works: "32 padas in the Padakalpataru", notes: `A Vaiṣṇava poet: the Padakalpataru has 32 padas with the bhaṇitā of Ananta dāsa (Baṅgīya Sāhitya Sevaka). ${from("Ananta Dāsa", 45)}` } }],
  },
  {
    id: 50, name: "Ananta", place: [ADVAITA, "diksa"],
    fields: { place: "Navadvīpa",
      notes: `A brāhmaṇa of Navadvīpa and a disciple of Advaita Prabhu; in Kṛṣṇa-līlā Sudevī. The Padakalpataru has one pada of «Ananta» (Vaiṣṇava-vandanā of Jīva Gosvāmī, Devakīnandana and Vṛndāvana dāsa; Bhakti Movement in Orissa p. 173). Which Ananta composed the padas is not known: Ananta Ācārya, Ananta dāsa or Ananta Paṇḍita.\n\nThe text on Ananta Ācārya (Caitanya-caritāmṛta Ādi 12.58) went to his record #44 (${D}).` },
    docs: [{ doc: 3377, pieces: [{ toId: 44, title: "Ananta Ācārya", start: "## Ananta Ācārya" }] }],
  },
  {
    id: 77, name: "Balarāma Dās (Mahānta)", place: [NITAI, "associate"],
    fields: { notes: `A devotee from Orissa and close companion of Nityānanda Prabhu (Vaiṣṇava-vandanā).\n\n${kept("the Balarāma Dāsa of Caitanya-bhāgavata 3.5.734 and Caitanya-caritāmṛta Ādi 11.34")}` },
    new: [{ key: "a", name: "Balarāma Dāsa (Nityānanda's branch, CC Ādi 11.34)", place: [NITAI, "disciple"],
      fields: { notes: `A devotee of Nityānanda's branch mentioned in Caitanya-bhāgavata 3.5.734 and Caitanya-caritāmṛta Ādi 11.34. ${from("Balarāma Dās (Mahānta)", 77)}` } }],
  },
  {
    id: 83, name: "Balarāma Kavipati", place: [SYAMA, "diksa"],
    fields: { place: "Budhuri (Śrīpāṭa)", guru: "Śyāmānanda Prabhu",
      notes: `He was a disciple of Śyāmānanda Prabhu; his Śrīpāṭa is at Budhuri (Prema-vilāsa 20).\n\n${kept("the Balarāma Kavipati disciple of Rāmacandra Kavirāja")}` },
    new: [{ key: "a", name: "Balarāma Kavipati (disciple of Rāmacandra Kavirāja)", place: [RAMACANDRA, "diksa"],
      fields: { guru: "Rāmacandra Kavirāja", notes: `He was a disciple of Rāmacandra Kavirāja (Karṇānanda 2). ${from("Balarāma Kavipati", 83)}` } }],
  },
  {
    id: 95, name: "Bhadravati",
    fields: { name: "Bhadravatī (mother of Jāhnavā)", notes: `She was the wife of Sūryadāsa Paṇḍita and the mother of Jāhnavā.\n\n${kept("Bhadravatī the mother of Uddhāraṇa Datta")}` },
    new: [{ key: "a", name: "Bhadravatī (mother of Uddhāraṇa Datta)",
      fields: { notes: `She was the mother of Uddhāraṇa Datta Ṭhākura and the wife of Śrīkara Datta (see «Uddhāraṇa Datta»). ${from("Bhadravati", 95)}` } }],
  },
  {
    id: 103, name: "Bhagavān",
    fields: { notes: `He was a disciple of Rasikānanda Prabhu (Rasikamaṅgala 14.107).\n\n${kept("three other Bhagavāns of the Rasikamaṅgala (14.119-129, 14.142, 14.148)")}` },
    new: [
      { key: "a", name: "Bhagavān (nephew of Rasikānanda)", place: [RASIK, "diksa"],
        fields: { guru: "Rasikānanda Prabhu", notes: `He was the nephew and disciple of Rasikānanda Prabhu (Rasikamaṅgala 14.119-129). ${from("Bhagavān", 103)}` } },
      { key: "b", name: "Bhagavān (of Rasikānanda's line, Rasikamaṅgala 14.142)", place: [RASIK, "disciple"],
        fields: { notes: `He was a disciple in Rasikānanda Prabhu's line (Rasikamaṅgala 14.142). ${from("Bhagavān", 103)}` } },
      { key: "c", name: "Bhagavān (of Rasikānanda's line, Rasikamaṅgala 14.148)", place: [RASIK, "disciple"],
        fields: { notes: `He was a disciple in Rasikānanda Prabhu's line (Rasikamaṅgala 14.148). ${from("Bhagavān", 103)}` } },
    ],
  },
  {
    id: 116, name: "Bhakta Dās", place: [NAROTTAMA, "diksa"],
    fields: { guru: "Narottama Ṭhākura", notes: `He was a disciple of Narottama Ṭhākura (Narottama-vilāsa 12).\n\n${kept("the Bhakta Dāsa disciple of Rasikānanda")}` },
    new: [{ key: "a", name: "Bhakta Dāsa (disciple of Rasikānanda)", place: [RASIK, "diksa"],
      fields: { guru: "Rasikānanda Prabhu", notes: `He was a disciple of Rasikānanda Prabhu (Rasikamaṅgala Paścima 14.150). ${from("Bhakta Dās", 116)}` } }],
  },
  {
    id: 149, name: "Bhudhara", place: [RASIK, "diksa"],
    fields: { guru: "Rasikānanda Prabhu", notes: `He was a disciple of Rasikānanda Prabhu (Rasikamaṅgala Paścima 14.114).\n\n${kept("another Bhūdhara, disciple of Rasikānanda (14.152)")}` },
    new: [{ key: "a", name: "Bhūdhara (disciple of Rasikānanda, Rasikamaṅgala 14.152)", place: [RASIK, "diksa"],
      fields: { guru: "Rasikānanda Prabhu", notes: `Another disciple of Rasikānanda Prabhu named Bhūdhara (Rasikamaṅgala Paścima 14.152). ${from("Bhudhara", 149)}` } }],
  },
  {
    id: 163, name: "Brahmananda",
    fields: { name: "Brahmānanda (brother of Nityānanda)", notes: `He was the younger brother of Nityānanda Prabhu (Prema-vilāsa 24).\n\n${kept("the Brahmānanda of Lord Gaurāṅga's kīrtana at Navadvīpa")}` },
    new: [{ key: "a", name: "Brahmānanda (of the kīrtana at Navadvīpa)", place: [GAURA, "associate"],
      fields: { place: "Navadvīpa", notes: `He took part in Lord Gaurāṅga's kīrtana at Navadvīpa (Caitanya-bhāgavata 2.8.116, 2.18.9, 102-107, 2.28.12, 104, 3.2.35). ${from("Brahmananda", 163)}` } }],
  },
  {
    id: 190, name: "Darpanarayana",
    fields: { name: "Darpanārāyaṇa", works: "Śrī Kṛṣṇa-cautiśā", notes: `He wrote the Śrī Kṛṣṇa-cautiśā (Baṅgīya Sāhitya Sevaka).\n\n${kept("the Darpanārāyaṇa disciple of Hemalatā Devī")}` },
    new: [{ key: "a", name: "Darpanārāyaṇa (disciple of Hemalatā Devī)", place: [HEMALATA, "diksa"],
      fields: { guru: "Hemalatā Devī (daughter of Śrīnivāsa Ācārya)", notes: `He was a disciple of Hemalatā Devī, the daughter of Śrīnivāsa Ācārya Prabhu (Karṇānanda 2). ${from("Darpanarayana", 190)}` } }],
  },
  {
    id: 220, name: "Dīna Kṛṣṇa Dāsa", poet: true,
    fields: { place: "Śāligrāma",
      notes: `A brāhmaṇa of Śāligrāma, the fifth son of Kaṁsāri Miśra; Gaurīdāsa Paṇḍita and Sūryadāsa Paṇḍita were his brothers. He composed many padas in praise of his elder brother Gaurīdāsa Paṇḍita, with the bhaṇitā «Dīna Kṛṣṇa Dāsa».\n\n${kept("the Oḍiyā poet Dīna Kṛṣṇa Dāsa, author of the Rasakallola")}` },
    new: [{ key: "a", name: "Dīna Kṛṣṇa Dāsa (Oḍiyā poet, Rasakallola)", poet: true,
      fields: { works: "Rasakallola", notes: `An Oḍiyā poet, author of the Rasakallola: thirty-four prosodic styles, on the musical rāgas and rāgiṇīs. ${from("Dīna Kṛṣṇa Dāsa", 220)}` } }],
  },
  {
    id: 248, name: "Dvija Gopimohana", place: [RASIK, "diksa"],
    fields: { name: "Dvija Gopīmohana", guru: "Rasikānanda Prabhu", notes: `He was a disciple of Rasikānanda Prabhu (Rasikamaṅgala Paścima 14.156).\n\n${kept("another Gopīmohana, disciple of Rasikānanda (14.127)")}` },
    new: [{ key: "a", name: "Gopīmohana (disciple of Rasikānanda, Rasikamaṅgala 14.127)", place: [RASIK, "diksa"],
      fields: { guru: "Rasikānanda Prabhu", notes: `Another disciple of Rasikānanda Prabhu named Gopīmohana (Rasikamaṅgala Paścima 14.127). ${from("Dvija Gopimohana", 248)}` } }],
  },
];
fs.writeFileSync(new URL("./mezcladas1.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length, "records,", plan.reduce((n, g) => n + (g.new?.length ?? 0), 0), "new");
