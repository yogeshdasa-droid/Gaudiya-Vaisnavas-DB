// node mezcladas3.mjs → mezcladas3.json for separar.mjs (block 3 of the mixed records, 07-11-2026)
import fs from "node:fs";
const D = "07-11-2026";
const RASIK = 1908, SYAMA = 1535, NAROTTAMA = 1010, GAURA = 164, SRINIVASA = 1466, NITAI = 1851, GATIGOVINDA = 305;
const from = (name, id) => `Taken out of the record «${name}» #${id}, which mixed several persons (${D}).`;
const kept = (others) => `The record also held ${others}, now in a record of its own (${D}).`;
const plan = [
  {
    id: 668, name: "Kanakapriya Devī", place: [GATIGOVINDA, "diksa"],
    fields: { name: "Kanakapriyā Devī (daughter of Vyāsācārya)", place: "Viṣṇupura",
      notes: `The daughter of Śrī Vyāsācārya of Viṣṇupura and the sister of Kṛṣṇavallabha Ācārya. Gatigovinda, the son of Śrīnivāsa Ācārya, was her spiritual master (Karṇānanda 2).\n\n${kept("Kanakapriyā Devī the wife of King Candrāya")}` },
    new: [{ key: "a", name: "Kanakapriyā Devī (wife of King Candrāya)", place: [NAROTTAMA, "diksa"],
      fields: { guru: "Narottama Ṭhākura", notes: `She and her husband, King Candrāya, were disciples of Narottama Ṭhākura (Prema-vilāsa 20; see «Candrāya»). ${from("Kanakapriya Devī", 668)}` } }],
  },
  {
    id: 720, name: "Keśava", poet: true,
    fields: { name: "Keśava (nephew of Rāmacandra Gosvāmī)", guru: "", works: "Keśava-saṅgīta",
      notes: `The nephew of Rāmacandra Gosvāmī of Bāghnāpāḍā. He composed a padāvalī titled Keśava-saṅgīta (History of Brajabuli Literature p. 427).\n\n${kept("the Keśava disciple of Rasikānanda")}` },
    new: [{ key: "a", name: "Keśava (disciple of Rasikānanda)", place: [RASIK, "diksa"],
      fields: { guru: "Rasikānanda Prabhu", notes: `He was a disciple of Rasikānanda Prabhu (Rasikamaṅgala Paścima 14.119). ${from("Keśava", 720)}` } }],
  },
  {
    id: 729, name: "Kiśora", place: [SYAMA, "diksa"],
    fields: { name: "Kiśora (disciple of Śyāmānanda)", guru: "Śyāmānanda Prabhu", place: "Kasiāḍi (Midnapore)",
      notes: `He was a disciple of Śyāmānanda Prabhu and lived at Kasiāḍi in the district of Midnapore.\n\n${kept("the Kiśora disciple of Rasikānanda")}` },
    new: [{ key: "a", name: "Kiśora (disciple of Rasikānanda)", place: [RASIK, "diksa"],
      fields: { guru: "Rasikānanda Prabhu", notes: `He was a disciple of Rasikānanda Prabhu (Rasikamaṅgala Paścima 14.161). ${from("Kiśora", 729)}` } }],
  },
  {
    id: 735, name: "Kṛṣṇa Ācārya",
    fields: { notes: `He was a disciple of Rāmacandra Kavirāja (Karṇānanda 2).\n\n${kept("the Kṛṣṇa Ācārya of Gopālpur, disciple of Narottama Ṭhākura")}` },
    new: [{ key: "a", name: "Kṛṣṇa Ācārya (disciple of Narottama)", place: [NAROTTAMA, "diksa"],
      fields: { guru: "Narottama Ṭhākura", place: "Gopālpur (Śrīpāṭa)", notes: `A Vārendra brāhmaṇa and a disciple of Narottama Ṭhākura; his Śrīpāṭa was at Gopālpur (Prema-vilāsa 20, Narottama-vilāsa 12). ${from("Kṛṣṇa Ācārya", 735)}` } }],
  },
  {
    id: 777, name: "Krsnagati", place: [RASIK, "diksa"],
    fields: { name: "Kṛṣṇagati (son of Rasikānanda)", guru: "Rasikānanda Prabhu", place: "Śyāmasundarapur",
      notes: `The second son and a disciple of Rasikānanda Prabhu (Rasikamaṅgala Paścima 14.27). He went to Śyāmasundarapur, where he served Śrī Rādhā-Vṛndāvanacandra; he is also called a disciple (?) of Kiśoradeva, one of the mahāntas of the first twelve branches of Śyāmānanda Prabhu. An erudite scholar and an accomplished singer; his descendants still live at Śyāmasundarapur.\n\n${kept("Kṛṣṇagati the son of Śrīnivāsa Ācārya")}` },
    new: [{ key: "a", name: "Kṛṣṇagati (son of Śrīnivāsa Ācārya)",
      fields: { notes: `The son born of the youngest wife of Śrīnivāsa Ācārya Prabhu. ${from("Krsnagati", 777)}` } }],
  },
  {
    id: 855, name: "Madanamohana Ṭhākura", place: [SYAMA, "diksa"],
    fields: { name: "Madanamohana Ṭhākura (grandson of Raghunandana)", guru: "Śyāmānanda Prabhu",
      notes: `A vaidya; his father was Kānāi Ṭhākura, his grandfather the famous Raghunandana Ṭhākura and his great-grandfather Śrī Mukunda. He had one brother, Vaṁśī (Bhakti-ratnākara 13.189-194). He was a disciple of Śyāmānanda (Rasikamaṅgala Dakṣiṇa 10.3).\n\n${kept("the Madanamohana Ṭhākura of Śrīnivāsa's family, of Mālihāṭī")}` },
    new: [{ key: "a", name: "Madanamohana Ṭhākura (of Śrīnivāsa's family)",
      fields: { place: "Mālihāṭī (Śrīpāṭa)", notes: `He belonged to the family of Śrīnivāsa Ācārya. His Śrīpāṭa was at Mālihāṭī, where his descendants still live. ${from("Madanamohana Ṭhākura", 855)}` } }],
  },
  {
    id: 883, name: "Madhusūdana",
    fields: { name: "Madhusūdana (disciple of Śyāmānanda)", notes: `He was a disciple of Śrī Śyāmānanda (Prema-vilāsa 20).\n\n${kept("the Madhusūdana of Lord Caitanya's branch and the poet Madhusūdana")}` },
    new: [
      { key: "a", name: "Madhusūdana (Caitanya's branch)", place: [GAURA, "associate"],
        fields: { notes: `He belonged to Lord Caitanya's branch; his name is in the list of the branches (Caitanya-caritāmṛta Ādi 10.111). ${from("Madhusūdana", 883)}` } },
      { key: "b", name: "Madhusūdana (poet)", poet: true,
        fields: { works: "five padas in the Padakalpataru", notes: `A composer of padas; the Padakalpataru has five of his padas. ${from("Madhusūdana", 883)}` } },
    ],
  },
  {
    id: 888, name: "Mahāmāyā", place: [SRINIVASA, "diksa"],
    fields: { name: "Mahāmāyā (wife of Govinda Kavirāja)", guru: "Śrīnivāsa Ācārya",
      notes: `She was a disciple of Śrīnivāsa Ācārya, the wife of Śrī Govinda Kavirāja and the mother of King Divyasiṁha (see «Govinda Kavirāja»).\n\n${kept("Mahāmāyā the wife of Uddhāraṇa Datta")}` },
    new: [{ key: "a", name: "Mahāmāyā (wife of Uddhāraṇa Datta)",
      fields: { notes: `She was the wife of Uddhāraṇa Datta Ṭhākura. ${from("Mahāmāyā", 888)}` } }],
  },
  {
    id: 914, name: "Mathurā Dāsa",
    fields: { name: "Mathurā Dāsa (disciple of Śrīnivāsa)", notes: `He was a disciple of Śrīnivāsa Ācārya (Karṇānanda 1).\n\n${kept("three other Mathurā Dāsas: the brāhmaṇa of Mathurā, the poet, and the disciple of Narottama Ṭhākura")}` },
    new: [
      { key: "a", name: "Mathurā Dāsa (brāhmaṇa of Mathurā)", fields: { place: "Mathurā", notes: `A brāhmaṇa who lived in Mathurā. ${from("Mathurā Dāsa", 914)}` } },
      { key: "b", name: "Mathurā Dāsa (poet)", poet: true, fields: { works: "pada 789 of the Padakalpataru", notes: `A composer of padas (pada no. 789 in the Padakalpataru). ${from("Mathurā Dāsa", 914)}` } },
      { key: "c", name: "Mathurā Dāsa (disciple of Narottama)", place: [NAROTTAMA, "diksa"],
        fields: { guru: "Narottama Ṭhākura", notes: `He was a disciple of Narottama Ṭhākura (Prema-vilāsa 20, Narottama-vilāsa 12). ${from("Mathurā Dāsa", 914)}` } },
    ],
  },
  {
    id: 925, name: "Mohana", place: [SRINIVASA, "diksa"],
    fields: { name: "Mohana Dāsa (disciple of Śrīnivāsa)", aka: "Mohana Dāsa, Mukuṭarāma dāsa", guru: "Śrīnivāsa Ācārya (Ācārya Prabhu)",
      works: "35 padas in the Padakalpataru",
      notes: `A vaidya, a composer of padas and a friend of Śrī Govinda Kavirāja, a disciple of Ācārya Prabhu (Śrīnivāsa); he did bhajana in Vṛndāvana with Vrajānanda dāsa, Hariprasāda dāsa, Sukhānanda dāsa and Premī Harirāma dāsa (Karṇānanda 1). Thirty-five padas of «Mohana Dāsa» are in the Padakalpataru. The record calls him also Mukuṭarāma dāsa.\n\n${kept("three Mohanas disciples of Rasikānanda (Rasikamaṅgala Paścima 14.104, 14.148, 14.153)")}` },
    new: [
      { key: "a", name: "Mohana (disciple of Rasikānanda, Rasikamaṅgala 14.104)", place: [RASIK, "diksa"],
        fields: { guru: "Rasikānanda Prabhu", notes: `He was a disciple of Rasikānanda (Rasikamaṅgala Paścima 14.104). ${from("Mohana", 925)}` } },
      { key: "b", name: "Mohana (disciple of Rasikānanda, Rasikamaṅgala 14.148)", place: [RASIK, "diksa"],
        fields: { guru: "Rasikānanda Prabhu", notes: `He was a disciple of Rasikānanda (Rasikamaṅgala Paścima 14.148). ${from("Mohana", 925)}` } },
      { key: "c", name: "Mohana (disciple of Rasikānanda, Rasikamaṅgala 14.153)", place: [RASIK, "diksa"],
        fields: { guru: "Rasikānanda Prabhu", notes: `He was a disciple of Rasikānanda (Rasikamaṅgala Paścima 14.153). ${from("Mohana", 925)}` } },
    ],
  },
  {
    id: 949, name: "Murāri Dāsa",
    fields: { notes: `He was a disciple of Narottama Ṭhākura (Prema-vilāsa 20, Narottama-vilāsa 12).\n\n${kept("the Murāri Dāsa of the Bhaktamālā, whose foot-water Rasika Murāri drank")}` },
    new: [{ key: "a", name: "Murāri Dāsa (of the Bhaktamālā)",
      fields: { notes: `Born in a low-caste family, he was a great bhāgavata: when Rasika Murāri visited his house he drank the water that had washed Murāri's feet (Bhaktamālā 23.3). ${from("Murāri Dāsa", 949)}` } }],
  },
  {
    id: 968, name: "Nandakisor Dāsa",
    fields: { name: "Nandakiśora Dāsa (disciple of Abhirāma)", place: "Cunākhālī (Śrīpāṭa)",
      notes: `According to the Pāṭa-paryaṭana he was a disciple of Śrī Abhirāma Gosvāmī, and his Śrīpāṭa was at Cunākhālī.\n\n${kept("the Nandakiśora Dāsa of Nityānanda's branch, author of the Vṛndāvana-līlāmṛta")}` },
    new: [{ key: "a", name: "Nandakiśora Dāsa (author of the Vṛndāvana-līlāmṛta)", place: [NITAI, "disciple"],
      fields: { place: "Puruniā (Śrīpāṭa); Śṛṅgāravaṭa, Vṛndāvana", works: "Śrī Vṛndāvana-līlāmṛta, Śrī Rasa-kalikā",
        notes: `He belonged to the branch of Nityānanda Prabhu; his Śrīpāṭa was at Puruniā. By the order of the Bādshāh he installed the Deities of Śrī Śrī Nitāi-Gaura at Śṛṅgāravaṭa in Vṛndāvana. Commanded by Lord Kṛṣṇa and Balarāma he wrote the Śrī Vṛndāvana-līlāmṛta and the Śrī Rasa-kalikā. ${from("Nandakisor Dāsa", 968)}` } }],
  },
  {
    id: 1005, name: "Nārāyaṇa",
    fields: { name: "Nārāyaṇa (brother of Dāmodara Paṇḍita)", notes: `He was the brother of Dāmodara Paṇḍita (Vaiṣṇava-vandanā; see «Jagannātha»).\n\n${kept("the Nārāyaṇa of Nityānanda's branch, brother of Devānanda")}` },
    new: [{ key: "a", name: "Nārāyaṇa (Nityānanda's branch, brother of Devānanda)", place: [NITAI, "disciple"],
      fields: { place: "Navadvīpa", notes: `He belonged to the branch of Nityānanda Prabhu and was the brother of Devānanda; a brāhmaṇa from Navadvīpa (the Gauḍīya Vaiṣṇava Abhidhāna: a vaidya) (Caitanya-bhāgavata 2.8.209; Caitanya-caritāmṛta Madhya 11.75, Ādi 11.46). ${from("Nārāyaṇa", 1005)}` } }],
  },
  {
    id: 1024, name: "Nayana Bhaskara",
    fields: { name: "Nayana Bhāskara (disciple of Śyāmānanda)", notes: `He was a disciple of Śrī Śyāmānanda Prabhu (Prema-vilāsa 20).\n\n${kept("the sculptor Nayana Bhāskara of Hālisahara")}` },
    new: [{ key: "a", name: "Nayana Bhāskara (sculptor of Hālisahara)",
      fields: { place: "Hālisahara", notes: `A sculptor from Hālisahara. Śrīmatī Jāhnavā Devī ordered him to carve a Deity of Śrī Rādhā for Śrī Śrī Gopīnātha in Vṛndāvana (Bhakti-ratnākara 10.321, 11.244-245, 11.788). ${from("Nayana Bhaskara", 1024)}` } }],
  },
];
fs.writeFileSync(new URL("./mezcladas3.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length, "records,", plan.reduce((n, g) => n + (g.new?.length ?? 0), 0), "new");
