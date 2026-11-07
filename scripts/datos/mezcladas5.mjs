// node mezcladas5.mjs → mezcladas5.json for separar.mjs (block 5 of the mixed records, 07-11-2026):
// the records whose text holds several «## NAME» entries (or «41A. 41B. 41C.»): each piece goes to its person.
import fs from "node:fs";
const D = "07-11-2026";
const RASIK = 1908, SYAMA = 1535, NAROTTAMA = 1010, GAURA = 164, NITAI = 1851, ADVAITA = 15;
const from = (name, id) => `Taken out of the record «${name}» #${id}, which mixed several persons (${D}).`;
const kept = (others) => `The record also held ${others}, now in records of their own (${D}).`;
const K = "## KṚṢṆADĀSA\n\n";
const plan = [
  {
    id: 462, name: "Haricandana", guru: "",
    fields: { guru: "", place: "Orissa (Purī)", notes: `A resident of Orissa and an employee of Mahārāja Pratāparudra; he served Lord Jagannātha. On his quarrel with Śrīvāsa Ṭhākura before Lord Jagannātha's chariot see Caitanya-caritāmṛta Madhya 13.91-93, 97.\n\n${kept("three Haricandanas disciples of Rasikānanda (Rasikamaṅgala Paścima 14.106, 14.132, 14.145)")}` },
    new: [
      { key: "a", name: "Haricandana Maṅgarāja (disciple of Rasikānanda)", place: [RASIK, "diksa"], fields: { guru: "Rasikānanda Prabhu", notes: from("Haricandana", 462) } },
      { key: "b", name: "Haricandana (disciple of Rasikānanda, Rasikamaṅgala 14.132)", place: [RASIK, "diksa"], fields: { guru: "Rasikānanda Prabhu", notes: from("Haricandana", 462) } },
      { key: "c", name: "Haricandana (disciple of Rasikānanda, Rasikamaṅgala 14.145)", place: [RASIK, "diksa"], fields: { guru: "Rasikānanda Prabhu", notes: from("Haricandana", 462) } },
    ],
    docs: [{ doc: 466, pieces: [
      { to: "a", title: "Haricandana", start: "## HARICANDANA\n\nHe was a disciple of Rasikānanda Prabhu. His surname", end: "## HARICANDANA\n\nHe was a disciple of Rasikānanda Prabhu. (Rasikamaṅgala Pascima 14.132" },
      { to: "b", title: "Haricandana", start: "## HARICANDANA\n\nHe was a disciple of Rasikānanda Prabhu. (Rasikamaṅgala Pascima 14.132", end: "## HARICANDANA\n\nHe was a disciple of Rasikānanda Prabhu. (Rasikamaṅgala Pascima 14.145" },
      { to: "c", title: "Haricandana", start: "## HARICANDANA\n\nHe was a disciple of Rasikānanda Prabhu. (Rasikamaṅgala Pascima 14.145" },
    ] }],
  },
  {
    id: 556, name: "Jagannātha Dāsa", poet: true,
    fields: { name: "Jagannātha Dāsa (author of the Bhakta-caritāmṛta)", place: "Gilābāḍī (Maldah)", works: "Bhakta-caritāmṛta (4 volumes)",
      notes: `A poet of Gilābāḍī in Maldah, author of the Bhakta-caritāmṛta in four volumes, from the Bhaktamālā.\n\n${kept("the padakartā Jagannātha Dāsa and the Jagannātha Dāsa (Pāthara Hājaṅga) of Nityānanda's branch")}` },
    new: [
      { key: "a", name: "Jagannātha Dāsa (padakartā and musician)", poet: true, fields: { notes: from("Jagannātha Dāsa", 556) } },
      { key: "b", name: "Jagannātha Dāsa (Pāthara Hājaṅga)", place: [NITAI, "disciple"], fields: { aka: "Pāthara Hājaṅga", notes: from("Jagannātha Dāsa", 556) } },
    ],
    docs: [{ doc: 561, pieces: [
      { to: "a", title: "Jagannātha Dāsa", start: "## JAGANNĀTHA DĀSA\n\nHe was a padakarta.", end: "## JAGANNĀTHA DĀSA\n\nHe belonged to Nityānanda-sakhā." },
      { to: "b", title: "Jagannātha Dāsa", start: "## JAGANNĀTHA DĀSA\n\nHe belonged to Nityānanda-sakhā." },
    ] }],
  },
  {
    id: 660, name: "Kamsari Ghoṣa",
    fields: { name: "Kaṁsāri Ghoṣa", notes: `A devotee of Lord Caitanya, a Kāyastha of north Rāḍha and the eldest brother of Vāsudeva Ghoṣa. He led a family life; his descendants belong to the royal family of Dinājpur.\n\n${kept("Kaṁsāri Miśra (cousin of Lord Gaurāṅga) and Kaṁsāri Sena (of Nityānanda's branch)")}` },
    new: [
      { key: "a", name: "Kaṁsāri Miśra (cousin of Lord Gaurāṅga)", fields: { place: "Ḍhākā-dakṣiṇa (Śrīhaṭṭa)", notes: from("Kamsari Ghoṣa", 660) } },
      { key: "b", name: "Kaṁsāri Sena (father of Sadāśiva Kavirāja)", place: [NITAI, "disciple"], fields: { aka: "Saṁvarāri", notes: from("Kamsari Ghoṣa", 660) } },
    ],
    docs: [{ doc: 666, pieces: [
      { to: "a", cut: true, title: "Kaṁsāri Miśra", start: "41B. Kamsari Miśra", end: "41C. Kamsari Sena" },
      { to: "b", cut: true, title: "Kaṁsāri Sena", start: "41C. Kamsari Sena" },
    ] }],
  },
  {
    id: 707, name: "Kavicandra", poet: true,
    fields: { name: "Kavicandra (son of Kavikarṇapūra)", place: "Khaṇḍaghoṣa", works: "Gīta-govinda in Bengali verse",
      notes: `The son of Kavikarṇapūra, a resident of Khaṇḍaghoṣa; he translated the Gīta-govinda into Bengali verse.\n\n${kept("the Kavicandra of Lord Caitanya's branch and the Kavicandra who taught Rasikānanda as a child")}` },
    new: [
      { key: "a", name: "Kavicandra (Caitanya's branch)", place: [GAURA, "associate"], fields: { notes: from("Kavicandra", 707) } },
      { key: "b", name: "Kavicandra (teacher of Rasikānanda)", fields: { notes: from("Kavicandra", 707) } },
    ],
    docs: [{ doc: 713, pieces: [
      { to: "a", title: "Kavicandra", start: "## KAVICANDRA\n\nHe belonged to Caitanya sakhā", end: "## KAVICANDRA\n\nIn Rasikānanda prabhu's childhood" },
      { to: "b", title: "Kavicandra", start: "## KAVICANDRA\n\nIn Rasikānanda prabhu's childhood", end: "## KAVICANDRA\n\nHe was the son of Kavikarṇapūra" },
    ] }],
  },
  {
    id: 1235, name: "Rāma",
    fields: { name: "Rāma (brāhmaṇa from South India)", notes: `A poor brāhmaṇa from South India who, through Vibhīṣaṇa, came before Lord Caitanya (Caitanya-maṅgala Śeṣa 4.4.91).\n\n${kept("the Rāma of Lord Caitanya's branch")}` },
    new: [{ key: "a", name: "Rāma (Caitanya's branch)", place: [GAURA, "associate"], fields: { notes: from("Rāma", 1235) } }],
    docs: [{ doc: 1246, pieces: [{ to: "a", title: "Rāma", start: "## RĀMA\n\nHe belonged to the sakhā of Lord Caitanya." }] }],
  },
  {
    id: 1299, name: "Rasamaya Dāsa", place: [RASIK, "associate"],
    fields: { name: "Rasamaya Dāsa (attendant of Rasikānanda)",
      notes: `The domestic attendant of Rasikānanda Prabhu and the father of Gopījanavallabha, the author of the Rasikamaṅgala (Rasikamaṅgala 4.34); the son of the daughter of Bhīma, the zamindar of Dhāreṇḍā. Three poems of «Rasamaya Dāsa» are in the Padakalpataru (which Rasamaya is not known).\n\n${kept("the Rasamaya Dāsa who translated the Gīta-govinda, the author of the Kṛṣṇa-bhakti-vallī, and Viṣṇudāsa the disciple of Śyāmānanda, called Rasamaya")}` },
    new: [
      { key: "a", name: "Rasamaya Dāsa (translator of the Gīta-govinda)", poet: true, fields: { notes: from("Rasamaya Dāsa", 1299) } },
      { key: "b", name: "Rasamaya Dāsa (author of the Kṛṣṇa-bhakti-vallī)", fields: { works: "Śrī Kṛṣṇa-bhakti-vallī (ms. 1765)", notes: from("Rasamaya Dāsa", 1299) } },
      { key: "c", name: "Rasamaya Dāsa (Viṣṇudāsa, disciple of Śyāmānanda)", place: [SYAMA, "diksa"], fields: { aka: "Viṣṇudāsa", guru: "Śyāmānanda Prabhu", notes: from("Rasamaya Dāsa", 1299) } },
    ],
    docs: [{ doc: 1311, pieces: [
      { to: "a", title: "Rasamaya Dāsa", start: "## RASAMAYA DĀSA\n\nNo information", end: "## RASAMAYA DĀSA\n\nHe was the author" },
      { to: "b", title: "Rasamaya Dāsa", start: "## RASAMAYA DĀSA\n\nHe was the author", end: "## RASAMAYA DĀSA\n\nThis is the Vaiṣṇava name" },
      { to: "c", title: "Rasamaya Dāsa", start: "## RASAMAYA DĀSA\n\nThis is the Vaiṣṇava name", end: "## RASAMAYA DĀSA\n\nHe was the domestic attendant" },
    ] }],
  },
  {
    id: 1647, name: "Vasanta Rāya",
    fields: { name: "Vasanta Rāya (of Jessore)", disciples: "", works: "",
      notes: `A Kāyastha, the son of Guṇānanda Guhā and the cousin of Pratāpāditya, the king of Bengal; with his cousin Vikramāditya he founded the kingdom of Jessore. Around 1570, with his help, Guṇānanda built a new temple south of the old temple of Madanamohana in Vṛndāvana (see «Guṇānanda Guhā»).\n\n${kept("the Vasanta Rāya disciple of Narottama Ṭhākura, the poet")}` },
    new: [{ key: "a", name: "Vasanta Rāya (disciple of Narottama)", place: [NAROTTAMA, "diksa"],
      fields: { guru: "Narottama Ṭhākura", works: "fifty-one poems in Vrajabuli (Padakalpataru)", notes: from("Vasanta Rāya", 1647) } }],
    docs: [{ doc: 1665, pieces: [{ to: "a", cut: true, title: "Vasanta Rāya", start: "He was a brāhmaṇa by caste and a disciple", end: "Vasanta Rāya He was a scion" }] }],
  },
  {
    // fourteen Kṛṣṇadāsas in one text: the first stays here, those that have a record go to it
    id: 1888, name: "Kṛṣṇa-dāsa Others", place: [RASIK, "diksa"],
    fields: { name: "Kṛṣṇadāsa (disciple of Rasikānanda, Rasikamaṅgala 14.159)", guru: "Rasikānanda Prabhu",
      notes: `He was a disciple of Rasikānanda Prabhu (Rasikamaṅgala Paścima 14.159).\n\nThis record («Kṛṣṇa-dāsa Others») held fourteen Kṛṣṇadāsas; on ${D} each went to its own record: Kālīya Kṛṣṇadāsa (#639, two entries), Sukṛti Kṛṣṇadāsa of Bāḍagāchi (#1489), Śiśu Kṛṣṇadāsa = Kānu Ṭhākura (#677), Kṛṣṇadāsa Miśra son of Advaita (#760), and new records for the others.` },
    new: [
      { key: "vilasa", name: "Kṛṣṇadāsa (author of the Śrī Kṛṣṇa-vilāsa)", poet: true, fields: { aka: "Kṛṣṇa Kiṅkara", guru: "Gopāla dāsa", works: "Śrī Kṛṣṇa-vilāsa", notes: from("Kṛṣṇa-dāsa Others", 1888) } },
      { key: "r160", name: "Kṛṣṇadāsa (disciple of Rasikānanda, Rasikamaṅgala 14.160)", place: [RASIK, "diksa"], fields: { guru: "Rasikānanda Prabhu", notes: from("Kṛṣṇa-dāsa Others", 1888) } },
      { key: "pujari", name: "Kṛṣṇadāsa (disciple of Pūjārī Ṭhākura)", fields: { guru: "Pūjārī Ṭhākura", notes: from("Kṛṣṇa-dāsa Others", 1888) } },
      { key: "hari", name: "Kṛṣṇadāsa (son of Hita Harivaṁśa)", fields: { notes: from("Kṛṣṇa-dāsa Others", 1888) } },
      { key: "cane", name: "Kṛṣṇadāsa (gold-cane sevaka of Lord Jagannātha)", place: [GAURA, "associate"], fields: { place: "Purī", notes: from("Kṛṣṇa-dāsa Others", 1888) } },
      { key: "govinda", name: "Kṛṣṇadāsa (author of the Govinda-maṅgala)", poet: true, fields: { works: "Govinda-maṅgala", notes: from("Kṛṣṇa-dāsa Others", 1888) } },
      { key: "south", name: "Kṛṣṇadāsa (who went south with Lord Caitanya)", place: [GAURA, "associate"], fields: { notes: from("Kṛṣṇa-dāsa Others", 1888) } },
      { key: "adv", name: "Kṛṣṇadāsa (Advaita's branch, CC Ādi 12.60)", place: [ADVAITA, "disciple"], fields: { notes: from("Kṛṣṇa-dāsa Others", 1888) } },
    ],
    docs: [{ doc: 778, pieces: [
      { to: "vilasa", title: "Kṛṣṇadāsa", start: "## KṚṢṆADĀSA DĀSA\n\nHe composed", end: K + "He was a disciple of Rasikānanda prabhu (Rasikamaṅgala Pascima 14.160)" },
      { to: "r160", title: "Kṛṣṇadāsa", start: K + "He was a disciple of Rasikānanda prabhu (Rasikamaṅgala Pascima 14.160)", end: K + "He was a disciple of Pūjārī" },
      { to: "pujari", title: "Kṛṣṇadāsa", start: K + "He was a disciple of Pūjārī", end: K + "He was the eldest son of Harivaṁśa" },
      { to: "hari", title: "Kṛṣṇadāsa", start: K + "He was the eldest son of Harivaṁśa", end: K + "He was a resident of Orissa" },
      { to: "cane", title: "Kṛṣṇadāsa", start: K + "He was a resident of Orissa", end: K + "He wrote the Bengali poem" },
      { to: "govinda", title: "Kṛṣṇadāsa", start: K + "He wrote the Bengali poem", end: K + "A brāhmaṇa resident of Akaihat" },
      { toId: 639, title: "Kṛṣṇadāsa of Ākāihāṭ", start: K + "A brāhmaṇa resident of Akaihat", end: K + "He belonged to Nityānanda sakhā (Caitanya Caritāmṛta 1.11.12)" },
      { toId: 639, title: "Kṛṣṇadāsa (Padakalpataru 2358)", start: K + "He belonged to Nityānanda sakhā (Caitanya Caritāmṛta 1.11.12)", end: K + "He was a brāhmaṇa resident of Badagachi" },
      { toId: 1489, title: "Kṛṣṇadāsa of Bāḍagāchi", start: K + "He was a brāhmaṇa resident of Badagachi", end: K + "Sisu Kṛṣṇadāsa" },
      { toId: 677, title: "Śiśu Kṛṣṇadāsa", start: K + "Sisu Kṛṣṇadāsa", end: K + "According to Karṇapūra" },
      { to: "south", title: "Kṛṣṇadāsa", start: K + "According to Karṇapūra", end: K + "This second son of Advaita" },
      { toId: 760, title: "Kṛṣṇadāsa, son of Advaita", start: K + "This second son of Advaita", end: K + "His name mentioned in" },
      { to: "adv", title: "Kṛṣṇadāsa", start: K + "His name mentioned in" },
    ] }],
  },
];
for (const g of plan) delete g.guru;
fs.writeFileSync(new URL("./mezcladas5.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length, "records,", plan.reduce((n, g) => n + (g.new?.length ?? 0), 0), "new");
