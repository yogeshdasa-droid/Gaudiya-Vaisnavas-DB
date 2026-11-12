// The journeys drawn on Panorama › Mapa (12-11-2026, Whisper: «empezamos por tu propuesta»): stage by stage, each with
// its place (degrees), what happened there and where it is told. The stages come from the records' own texts
// (Mahāprabhu #164, Nityānanda #1851, Śrīnivāsa #1466) and, for the order and the places they leave out, from the
// Caitanya-caritāmṛta (Madhya 1, 7–9, 16–19), the Caitanya-bhāgavata (Ādi 9, Antya 3–6) and the Bhakti-ratnākara 7.
// In time order (12-11-2026: Nityānanda's two journeys and Mahāprabhu to Bengal added; the South checked). Where the texts give no stages, the line is dashed and no
// place is made up. Places in the South are modern identifications: some are approximate.

export interface Stage {
  name: string;
  lat: number;
  lon: number;
  /** what happened there (English, like the records' texts) */
  note: string;
  /** where it is told */
  source: string;
  /** the stage this one is reached from, when not the one before (a journey that splits) */
  from?: number;
  /** the way here is not told stage by stage (drawn dashed) */
  untold?: boolean;
}

export interface Journey {
  id: string;
  title: { es: string; en: string };
  /** the record it is about (opens from the panel) */
  person: number;
  /** other records who make the journey too (their «See journeys» button opens it) */
  others?: number[];
  when: string;
  stages: Stage[];
}

/** The journeys a record makes, in time order (the record's «See journeys» button). */
export function journeysOf(id: number): Journey[] {
  return JOURNEYS.filter((j) => j.person === id || j.others?.includes(id));
}

const CC = "Caitanya-caritāmṛta";

const CB = "Caitanya-bhāgavata";

export const JOURNEYS: Journey[] = [
  {
    // CB Ādi 9 names the places in its own order, not always the order of a road: the line follows it, but places it
    // names in passing (Matsya-tīrtha, Prabhāsa, Badarikāśrama…) are only told in the notes.
    id: "nitai-tirthas",
    title: { es: "Nityānanda por los tīrthas (12–20 años)", en: "Nityānanda's pilgrimage (age 12–20)" },
    person: 1851,
    when: "c. 1486–1494",
    stages: [
      { name: "Ekacakrā", lat: 24.17, lon: 87.8, note: "At twelve He leaves home with a sannyāsī and goes round the holy places until His twentieth year.", source: `${CB}, Ādi 9; His record` },
      { name: "Vakreśvara", lat: 23.88, lon: 87.37, note: "The first holy place He visits.", source: `${CB}, Ādi 9` },
      { name: "Vaidyanātha", lat: 24.48, lon: 86.7, note: "He goes on alone to the grove of Vaidyanātha.", source: `${CB}, Ādi 9` },
      { name: "Gayā", lat: 24.79, lon: 85.0, note: "", source: `${CB}, Ādi 9` },
      { name: "Kāśī", lat: 25.32, lon: 83.0, note: "He bathes in the Gaṅgā and drinks her waters with unsatiated thirst.", source: `${CB}, Ādi 9` },
      { name: "Prayāga", lat: 25.43, lon: 81.88, note: "His morning bath in the month of Māgha.", source: `${CB}, Ādi 9` },
      { name: "Mathurā", lat: 27.5058, lon: 77.6857, note: "The place of His previous birth; He sports in the Yamunā at Viśrāma-ghāṭa.", source: `${CB}, Ādi 9` },
      { name: "Vṛndāvana", lat: 27.58, lon: 77.7, note: "He walks through the twelve forests, round Govardhana, weeps at Nanda's house in Gokula and bows to Madana-gopāla.", source: `${CB}, Ādi 9` },
      { name: "Hastināpura", lat: 29.16, lon: 78.01, note: "The home of the Pāṇḍavas: \"May Balarāma, the holder of the plough, deliver us all.\"", source: `${CB}, Ādi 9` },
      { name: "Dvārakā", lat: 22.24, lon: 68.97, note: "He bathes in the sea in great joy.", source: `${CB}, Ādi 9` },
      { name: "Siddhapura", lat: 23.92, lon: 72.37, note: "The seat of Kapila. At Matsya-tīrtha He gives out cooked rice at a great festival; at Śiva-kāñcī and Viṣṇu-kāñcī He laughs at the quarrel of Vaiṣṇavas and Śaivas.", source: `${CB}, Ādi 9` },
      { name: "Kurukṣetra", lat: 29.97, lon: 76.85, note: "Then Bindu-sarovara, Prabhāsa, Sudarśana, Trita-kūpa, Brahma-tīrtha, Cakra-tīrtha and Pratisrota on the western Sarasvatī.", source: `${CB}, Ādi 9` },
      { name: "Naimiṣāraṇya", lat: 27.35, lon: 80.49, note: "", source: `${CB}, Ādi 9` },
      { name: "Ayodhyā", lat: 26.8, lon: 82.2, note: "In the land of Guhaka He lies three days in ecstasy. Then the Sarayū, the Kauśikī, the Gomatī, the Gaṇḍakī and the Śoṇa.", source: `${CB}, Ādi 9; His record` },
      { name: "Mahendra-parvata", lat: 18.97, lon: 84.37, note: "He climbs the mountain and bows to Paraśurāma.", source: `${CB}, Ādi 9` },
      { name: "Haridvāra", lat: 29.95, lon: 78.16, note: "Where the Gaṅgā comes down to the earth. Then Pampā, the Bhīmarathī and Sapta-godāvarī.", source: `${CB}, Ādi 9` },
      { name: "Śrī-śaila", lat: 16.07, lon: 78.87, note: "Śiva and Pārvatī, as a brāhmaṇa and his wife, recognise Him, and Pārvatī cooks for Him with her own hands.", source: `${CB}, Ādi 9; His record` },
      { name: "Veṅkaṭa (Tirupati)", lat: 13.68, lon: 79.35, note: "Then Kāmakoṣṭhī-purī.", source: `${CB}, Ādi 9` },
      { name: "Kāñcī", lat: 12.83, lon: 79.7, note: "Then the Kāverī.", source: `${CB}, Ādi 9` },
      { name: "Śrī Raṅgam", lat: 10.86, lon: 78.69, note: "He stays for some time. Then Hari-kṣetra and Ṛṣabha-parvata.", source: `${CB}, Ādi 9` },
      { name: "Dakṣiṇa-mathurā (Madurai)", lat: 9.925, lon: 78.12, note: "Then the Kṛtamālā, the Tāmraparṇī and Agastya's home on the Malaya mountain. The Caitanya-bhāgavata names Badarikāśrama here, where Vyāsa receives Him as Balarāma, and the seat of the Buddhists.", source: `${CB}, Ādi 9; His record` },
      { name: "Kanyākumārī", lat: 8.078, lon: 77.55, note: "He sees Durgā-devī and goes to the southern sea.", source: `${CB}, Ādi 9` },
      { name: "Ananta-padmanābha", lat: 8.483, lon: 76.946, note: "The town of Śrī Ananta; then the lake of the five apsarās.", source: `${CB}, Ādi 9` },
      { name: "Gokarṇa", lat: 14.55, lon: 74.32, note: "The Śiva temple; then from door to door through Kerala and Trigarta.", source: `${CB}, Ādi 9` },
      { name: "Māhiṣmatī-pura (Narmadā)", lat: 22.18, lon: 75.59, note: "After the Nirvindhyā, the Payoṣṇī and the Tāpī: the Revā, Māhiṣmatī and Mālā-tīrtha.", source: `${CB}, Ādi 9` },
      { name: "Sūrpāraka", lat: 19.42, lon: 72.82, note: "Turning west. About then — the text does not say where — He meets Mādhavendra Purī with Īśvara Purī and Brahmānanda Purī; both faint at the sight of each other and they travel together for days. Mādhavendra goes on to the Sarayū.", source: `${CB}, Ādi 9; His record` },
      { name: "Setubandha Rāmeśvara", lat: 9.29, lon: 79.31, untold: true, note: "He bathes at Dhanus-tīrtha and goes to Rāmeśvara.", source: `${CB}, Ādi 9` },
      { name: "Jiyaḍa-nṛsiṁha", lat: 17.77, lon: 83.25, untold: true, note: "On the way: Vijayanagara, Māyāpurī, Avanti and the Godāvarī.", source: `${CB}, Ādi 9` },
      { name: "Kūrma-kṣetra", lat: 18.27, lon: 84.0, note: "After Trimala, the shrine of Kūrmanātha.", source: `${CB}, Ādi 9` },
      { name: "Jagannātha Purī", lat: 19.805, lon: 85.818, note: "He sees Jagannātha, the moon of Nīlācala.", source: `${CB}, Ādi 9; His record` },
      { name: "Gaṅgā-sāgara", lat: 21.64, lon: 88.08, untold: true, note: "Where the Gaṅgā meets the sea.", source: `${CB}, Ādi 9; His record` },
      { name: "Vṛndāvana", lat: 27.58, lon: 77.7, untold: true, note: "He lives in Vṛndāvana, eating nothing but a little milk, waiting for Gauracandra to reveal Himself.", source: `${CB}, Ādi 9; His record` },
      { name: "Navadvīpa", lat: 23.42, lon: 88.39, untold: true, note: "At the house of Nandana Ācārya He meets the Lord.", source: `${CB}, Madhya 3–4; His record` },
    ],
  },
  {
    id: "gaya",
    title: { es: "Mahāprabhu a Gayā", en: "Mahāprabhu to Gayā" },
    person: 164,
    when: "c. 1508",
    stages: [
      { name: "Navadvīpa", lat: 23.42, lon: 88.39, note: "Nimāi Paṇḍita sets out with His students to offer piṇḍa to His father at Gayā.", source: `${CB}, Ādi 17; His record` },
      { name: "Mandāra", lat: 24.85, lon: 87.03, untold: true, note: "He sees Madhusūdana on the Mandāra hill. On the way He has a fever and cures it by drinking the water that has washed a brāhmaṇa's feet.", source: `${CB}, Ādi 17` },
      { name: "Gayā", lat: 24.79, lon: 85.0, note: "At the footprint of Viṣṇu He weeps; He meets Īśvara Purī and takes dīkṣā from him.", source: `${CB}, Ādi 17; His record` },
      { name: "Navadvīpa", lat: 23.42, lon: 88.39, untold: true, note: "He comes back a different person: at the name of Kṛṣṇa He weeps and faints, closes His school, and the saṅkīrtana begins.", source: `${CB}, Ādi 17 – Madhya 1; His record` },
    ],
  },
  {
    id: "sannyasa",
    title: { es: "Sannyāsa: de Navadvīpa a Purī", en: "Sannyāsa: from Navadvīpa to Purī" },
    person: 164,
    when: "1510",
    stages: [
      { name: "Navadvīpa", lat: 23.42, lon: 88.39, note: "At night, in the month of Māgha, He leaves home and swims across the Gaṅgā.", source: `${CC}, Ādi 17; ${CB}, Madhya 28` },
      { name: "Kāṭwā", lat: 23.65, lon: 88.13, note: "He takes sannyāsa from Keśava Bhāratī and receives the name Śrī Kṛṣṇa Caitanya.", source: `${CC}, Madhya 3; His record` },
      { name: "Rāḍha-deśa", lat: 23.45, lon: 87.85, untold: true, note: "For three days He wanders in ecstasy through Rāḍha, wanting to go to Vṛndāvana; Nityānanda leads Him back to the Gaṅgā, saying it is the Yamunā (place approximate).", source: `${CC}, Madhya 3` },
      { name: "Śāntipura", lat: 23.25, lon: 88.48, untold: true, note: "At Advaita's house, with all Navadvīpa and Śacī Mātā. His mother asks Him to live in Purī, so that she may have news of Him.", source: `${CC}, Madhya 3; His record` },
      { name: "Chatrabhoga", lat: 22.2, lon: 88.43, note: "Along the Gaṅgā to Chatrabhoga (place approximate); then by boat to Prayāga-ghāṭa in Midnapore.", source: `${CC}, Madhya 3; ${CB}, Antya 2; His record` },
      { name: "Remuṇā", lat: 21.53, lon: 86.87, untold: true, note: "Near Balasore. At the temple of Kṣīra-corā Gopīnātha He tells the story of Mādhavendra Purī.", source: `${CC}, Madhya 4; His record` },
      { name: "Yājapura", lat: 20.85, lon: 86.33, note: "", source: `${CC}, Madhya 5` },
      { name: "Kaṭaka", lat: 20.46, lon: 85.88, note: "Nityānanda tells the story of Sākṣi-gopāla.", source: `${CC}, Madhya 5; His record` },
      { name: "Bhuvaneśvara", lat: 20.25, lon: 85.83, note: "Then Kamalapura, where Nityānanda breaks His daṇḍa in three pieces.", source: `${CC}, Madhya 5; His record` },
      { name: "Jagannātha Purī", lat: 19.805, lon: 85.818, note: "At the sight of Jagannātha He faints; Sārvabhauma Bhaṭṭācārya takes Him to his house.", source: `${CC}, Madhya 6; His record` },
    ],
  },
  {
    id: "raghunatha",
    title: { es: "Raghunātha dāsa: de Saptagrāma a Rādhā-kuṇḍa", en: "Raghunātha dāsa: from Saptagrāma to Rādhā-kuṇḍa" },
    person: 1206,
    when: "1510–c. 1535",
    stages: [
      { name: "Kṛṣṇapura (Saptagrāma)", lat: 22.95, lon: 88.38, note: "Born in the family of the rich landowners Govardhana and Hiraṇya; as a boy he learns from Balarāma Ācārya and hears Haridāsa Ṭhākura.", source: "His record; Śrī Navadvīpa-dhāma, p. 249" },
      { name: "Śāntipura", lat: 23.25, lon: 88.48, note: "At fifteen (1510) he runs to Advaita's house and falls at the feet of the Lord, just after His sannyāsa; four years later he sees Him there again and is sent home: «Don't make a show of renunciation.»", source: `${CC}, Madhya 16; His record` },
      { name: "Pānihāṭi", lat: 22.69, lon: 88.37, note: "Nityānanda «punishes» him: a festival of chipped rice with yoghurt for all the devotees (the Daṇḍa-mahotsava); Mahāprabhu Himself appears there.", source: `${CC}, Antya 6; His record` },
      { name: "Kṛṣṇapura (Saptagrāma)", lat: 22.95, lon: 88.38, note: "One night, while the guards of Yadunandana Ācārya sleep, he flees, avoiding the road, through the jungle.", source: `${CC}, Antya 6; His record` },
      { name: "Jagannātha Purī", lat: 19.805, lon: 85.818, untold: true, note: "In twelve days, having eaten only three times; the Lord gives him to Svarūpa Dāmodara — «the Raghu of Svarūpa» — and he stays sixteen years.", source: `${CC}, Antya 6; His record` },
      { name: "Vṛndāvana", lat: 27.58, lon: 77.7, untold: true, note: "After the Lord and Svarūpa Dāmodara have left this world he comes to die at Govardhana; Rūpa and Sanātana keep him as their third brother.", source: `${CC}, Ādi 10; His record` },
      { name: "Rādhā-kuṇḍa", lat: 27.524, lon: 77.488, note: "His life of bhajana by the kuṇḍa; with a merchant's offering he restores Rādhā-kuṇḍa and Śyāma-kuṇḍa.", source: `${CC}, Ādi 10; His record` },
    ],
  },
  {
    id: "south",
    title: { es: "Mahāprabhu por el sur de la India", en: "Mahāprabhu in South India" },
    person: 164,
    when: "1510–1512",
    stages: [
      { name: "Jagannātha Purī", lat: 19.805, lon: 85.818, note: "He sets out for the South with the brāhmaṇa Kṛṣṇadāsa, after Sārvabhauma has become His follower.", source: `${CC}, Madhya 7; His record` },
      { name: "Ālālanātha", lat: 19.73, lon: 85.68, note: "The devotees of Purī see Him off here.", source: `${CC}, Madhya 7` },
      { name: "Kūrma-kṣetra", lat: 18.27, lon: 84.0, note: "He cures the leper Vāsudeva by embracing him.", source: `${CC}, Madhya 7; His record` },
      { name: "Jiyaḍa-nṛsiṁha", lat: 17.766, lon: 83.25, note: "He sees Lord Nṛsiṁha at Siṁhācala.", source: `${CC}, Madhya 8` },
      { name: "Vidyānagara (Godāvarī)", lat: 17.0, lon: 81.8, note: "On the bank of the Godāvarī He meets Rāmānanda Rāya, the governor, and they speak of prema-bhakti.", source: `${CC}, Madhya 8; His record` },
      { name: "Mallikārjuna (Śrī-śaila)", lat: 16.07, lon: 78.87, note: "After bathing in the Gautamī-gaṅgā He sees Śiva as Mallikārjuna, and Rāma as Dāsa-rāma-mahādeva.", source: `${CC}, Madhya 9` },
      { name: "Ahovala-nṛsiṁha", lat: 15.13, lon: 78.72, note: "He sees Lord Nṛsiṁha.", source: `${CC}, Madhya 9` },
      { name: "Siddhavaṭa", lat: 14.47, lon: 78.97, note: "A brāhmaṇa here chants only Rāma's name; after visiting Skanda-kṣetra and Trimaṭha, the Lord comes back and finds him chanting Kṛṣṇa's name.", source: `${CC}, Madhya 9` },
      { name: "Vṛddhakāśī", lat: 11.52, lon: 79.32, note: "He sees Śiva here. In a village nearby He defeats the Buddhist teachers; a great bird carries off the impure plate they had offered Him.", source: `${CC}, Madhya 9` },
      { name: "Tirupati (Veṅkaṭa-giri)", lat: 13.68, lon: 79.35, note: "Tirumala and Tirupati; then Pānā-nṛsiṁha.", source: `${CC}, Madhya 9` },
      { name: "Kāñcī", lat: 12.83, lon: 79.7, note: "Śiva-kāñcī and Viṣṇu-kāñcī; then Trikāla-hasti, Pakṣi-tīrtha and the Kāverī.", source: `${CC}, Madhya 9` },
      { name: "Kumbhakarṇa-kapāla", lat: 10.96, lon: 79.38, note: "A lake (at Kumbhakonam); then Pāpanāśana.", source: `${CC}, Madhya 9` },
      { name: "Śrī Raṅgam", lat: 10.862, lon: 78.69, note: "He spends the four months of the rains in the house of Veṅkaṭa Bhaṭṭa; the boy Gopāla Bhaṭṭa serves Him.", source: `${CC}, Madhya 9; His record` },
      { name: "Ṛṣabha-parvata", lat: 10.07, lon: 78.21, note: "He meets Paramānanda Purī.", source: `${CC}, Madhya 9` },
      { name: "Dakṣiṇa-mathurā (Madurai)", lat: 9.925, lon: 78.12, note: "He eats at the house of a brāhmaṇa devoted to Rāma, who is grieving because Rāvaṇa had touched Sītā.", source: `${CC}, Madhya 9` },
      { name: "Setubandha Rāmeśvara", lat: 9.288, lon: 79.313, note: "He finds the Kūrma Purāṇa's story of the shadow-Sītā, copies the page and brings it back to the brāhmaṇa of Madurai.", source: `${CC}, Madhya 9` },
      { name: "Kanyākumārī", lat: 8.078, lon: 77.55, note: "Cape Comorin, the southern end of the journey. On the way: the Tāmraparṇī, Naya-tripati, Śrī Vaikuṇṭha, Malaya-parvata.", source: `${CC}, Madhya 9; His record` },
      { name: "Ādi-keśava", lat: 8.33, lon: 77.27, note: "On the way, in Mallāra-deśa, He rescues His servant Kṛṣṇadāsa from the Bhaṭṭathāris. Here He finds a chapter of the Brahma-saṁhitā and has it copied.", source: `${CC}, Madhya 9` },
      { name: "Ananta-padmanābha", lat: 8.483, lon: 76.946, note: "Then Śrī Janārdana, and Śaṅkara-nārāyaṇa on the Payasvinī.", source: `${CC}, Madhya 9` },
      { name: "Śṛṅgeri", lat: 13.418, lon: 75.252, note: "The maṭha of Śaṅkarācārya; then Matsya-tīrtha and the Tuṅgabhadrā.", source: `${CC}, Madhya 9` },
      { name: "Uḍupī", lat: 13.34, lon: 74.75, note: "He sees the Gopāla of Madhvācārya and speaks with the Tattvavādīs.", source: `${CC}, Madhya 9` },
      { name: "Gokarṇa", lat: 14.55, lon: 74.32, note: "After Phalgu-tīrtha, Tritakūpa and Pañcāpsarā He sees Śiva at Gokarṇa; then Dvaipāyanī and Sūrpāraka.", source: `${CC}, Madhya 9` },
      { name: "Kolhāpura", lat: 16.7, lon: 74.24, note: "He sees Lakṣmī, Kṣīra-bhagavatī, Lāṅga-gaṇeśa and Cora-pārvatī.", source: `${CC}, Madhya 9` },
      { name: "Paṇḍharapura", lat: 17.678, lon: 75.33, note: "He meets Śrī Raṅga Purī and hears that His brother Viśvarūpa had left this world here.", source: `${CC}, Madhya 9; His record` },
      { name: "Māhiṣmatī-pura (Narmadā)", lat: 22.18, lon: 75.59, note: "On the way, by the Kṛṣṇa-veṇvā, He finds the Kṛṣṇa-karṇāmṛta; then the Tāpī. After the Narmadā: Dhanus-tīrtha, Nirvindhyā, Ṛṣyamūka.", source: `${CC}, Madhya 9` },
      { name: "Pañcavaṭī, Nāsika", lat: 20.007, lon: 73.79, note: "Through the Daṇḍaka forest, where He touches the seven tāla trees (Saptatāla).", source: `${CC}, Madhya 9; His record` },
      { name: "Kuśāvarta (source of the Godāvarī)", lat: 19.93, lon: 73.53, note: "At Brahmagiri, where the Godāvarī begins; then down along it by Saptagodāvarī.", source: `${CC}, Madhya 9` },
      { name: "Vidyānagara (Godāvarī)", lat: 17.0, lon: 81.8, note: "Back with Rāmānanda Rāya, who prepares to come to Purī.", source: `${CC}, Madhya 9` },
      { name: "Jagannātha Purī", lat: 19.805, lon: 85.818, note: "Back in Purī after two years.", source: `${CC}, Madhya 9; His record` },
    ],
  },
  {
    id: "nitai-bengal",
    title: { es: "Nityānanda predica en Bengala", en: "Nityānanda preaching in Bengal" },
    person: 1851,
    when: "c. 1516",
    stages: [
      { name: "Jagannātha Purī", lat: 19.805, lon: 85.818, note: "Back for good from Vṛndāvana, the Lord speaks with Him alone and sends Him to Gauḍa to give the holy name to everyone, with Rāmadāsa, Gadādhara dāsa and other companions.", source: `${CB}, Antya 5; His record` },
      { name: "Pānihāṭi", lat: 22.69, lon: 88.37, untold: true, note: "He dances in ecstasy, is bathed (abhiṣeka), wears a garland of kadamba flowers and rich ornaments, and plays the dāna-līlā. Years later Raghunātha dāsa holds his curd-and-flat-rice festival for Him here.", source: `${CB}, Antya 5; ${CC}, Antya 6; His record` },
      { name: "Saptagrāma", lat: 22.96, lon: 88.37, note: "He wanders through Saptagrāma, the town of the merchants.", source: `${CB}, Antya 5; His record` },
      { name: "Śāntipura", lat: 23.25, lon: 88.48, note: "", source: `${CB}, Antya 5; His record` },
      { name: "Navadvīpa", lat: 23.42, lon: 88.39, note: "He sees Śacī. On these travels thieves who come to rob His ornaments become His devotees.", source: `${CB}, Antya 5–6; His record` },
      { name: "Khaḍadaha", lat: 22.72, lon: 88.38, untold: true, note: "He marries Vasudhā and Jāhnavā and settles here; Vīracandra and Gaṅgā are born. Each year He still goes to Nīlācala for the Ratha-yātrā.", source: "Prema-vilāsa; His record" },
    ],
  },
  {
    id: "bengal",
    title: { es: "Mahāprabhu a Bengala (Rāmakeli)", en: "Mahāprabhu to Bengal (Rāmakeli)" },
    person: 164,
    when: "1514",
    stages: [
      { name: "Jagannātha Purī", lat: 19.805, lon: 85.818, note: "On Vijayā-daśamī He sets out for Vṛndāvana by way of Bengal, to see His mother and the Gaṅgā.", source: `${CC}, Madhya 16; His record` },
      { name: "Kaṭaka", lat: 20.46, lon: 85.88, note: "King Pratāparudra has the way made ready for Him; the queens watch Him cross the Citrotpalā.", source: `${CC}, Madhya 16` },
      { name: "Picchaldā", lat: 22.2, lon: 87.95, note: "At the border of Orissa a Muslim governor becomes His devotee and takes Him by boat to Picchaldā, on the Rūpa-nārāyaṇa (place approximate). Rāmānanda Rāya turns back at the border.", source: `${CC}, Madhya 16` },
      { name: "Pānihāṭi", lat: 22.69, lon: 88.37, note: "At the house of Rāghava Paṇḍita.", source: `${CC}, Madhya 16` },
      { name: "Kumārahaṭṭa", lat: 22.95, lon: 88.42, note: "At Śrīvāsa's house; then at Śivānanda Sena's and Vāsudeva Datta's.", source: `${CC}, Madhya 16` },
      { name: "Vidyānagara", lat: 23.37, lon: 88.32, note: "At the house of Vidyā-vācaspati, Sārvabhauma's brother. Such crowds come that He leaves at night for Kuliyā.", source: `${CC}, Madhya 1` },
      { name: "Kuliyā", lat: 23.4, lon: 88.36, note: "He forgives Devānanda Paṇḍita and Gopāla Cāpala.", source: `${CB}, Antya 3; ${CC}, Madhya 1` },
      { name: "Rāmakeli", lat: 24.88, lon: 88.13, note: "Near Gauḍa, the capital of Husain Shāh. The king's ministers Sākara Mallika and Dabira Khāsa — Sanātana and Rūpa — come to Him at night; Sanātana warns Him not to go to Vṛndāvana with such a crowd.", source: `${CC}, Madhya 1; His record` },
      { name: "Kānāi-nāṭaśālā", lat: 25.05, lon: 87.7, note: "Remembering Sanātana's words, He turns back here (place approximate, near Rājmahal).", source: `${CC}, Madhya 1, 16` },
      { name: "Śāntipura", lat: 23.25, lon: 88.48, untold: true, note: "At Advaita's house He sees His mother again. Raghunātha dāsa comes to Him and is told to go home and wait.", source: `${CC}, Madhya 16; His record` },
      { name: "Jagannātha Purī", lat: 19.805, lon: 85.818, untold: true, note: "Back in Purī; next He sets out for Vṛndāvana through the forest, with only Balabhadra.", source: `${CC}, Madhya 16; His record` },
    ],
  },
  {
    id: "vraja",
    title: { es: "Mahāprabhu a Vraja y de vuelta", en: "Mahāprabhu to Vraja and back" },
    person: 164,
    when: "1514–1516",
    stages: [
      { name: "Jagannātha Purī", lat: 19.805, lon: 85.818, note: "He sets out for Vṛndāvana with only Balabhadra Bhaṭṭācārya.", source: `${CC}, Madhya 17; His record` },
      { name: "Kaṭaka", lat: 20.46, lon: 85.88, note: "", source: `${CC}, Madhya 17` },
      { name: "Jhārikhaṇḍa (the forest)", lat: 23.2, lon: 84.6, note: "Through the forest tigers and elephants dance at the name of Kṛṣṇa.", source: `${CC}, Madhya 17; His record` },
      { name: "Vārāṇasī", lat: 25.31, lon: 83.01, note: "He stays with Candraśekhara and eats at Tapana Miśra's.", source: `${CC}, Madhya 17` },
      { name: "Prayāga", lat: 25.43, lon: 81.88, note: "", source: `${CC}, Madhya 17` },
      { name: "Mathurā", lat: 27.49, lon: 77.67, note: "He bathes at Viśrāma-ghāṭa.", source: `${CC}, Madhya 17` },
      { name: "Vṛndāvana", lat: 27.58, lon: 77.7, note: "He wanders through the twelve forests of Vraja.", source: `${CC}, Madhya 17–18; His record` },
      { name: "Rādhā-kuṇḍa", lat: 27.525, lon: 77.48, note: "At Āriṭ-grāma He finds Rādhā-kuṇḍa and Śyāma-kuṇḍa.", source: `${CC}, Madhya 18; His record` },
      { name: "Soro-kṣetra", lat: 27.88, lon: 78.75, note: "On the way back, by the Gaṅgā, the Pāṭhān soldiers of Bijalī Khān become His followers.", source: `${CC}, Madhya 18; His record` },
      { name: "Prayāga", lat: 25.43, lon: 81.88, note: "He teaches Rūpa (and Anupama) for ten days at the Daśāśvamedha-ghāṭa and meets Vallabhācārya.", source: `${CC}, Madhya 19; His record` },
      { name: "Vārāṇasī", lat: 25.31, lon: 83.01, note: "He teaches Sanātana for two months and wins over Prakāśānanda Sarasvatī.", source: `${CC}, Madhya 20–25; His record` },
      { name: "Jhārikhaṇḍa (the forest)", lat: 23.2, lon: 84.6, note: "Back through the forest with Balabhadra.", source: `${CC}, Madhya 25; His record` },
      { name: "Jagannātha Purī", lat: 19.805, lon: 85.818, note: "From then on He lives in Purī, in the house of Kāśī Miśra.", source: `${CC}, Madhya 25; His record` },
    ],
  },
  {
    id: "rupa",
    title: { es: "Rūpa (y Anupama): de Rāmakeli a Vṛndāvana", en: "Rūpa (and Anupama): from Rāmakeli to Vṛndāvana" },
    person: 1325,
    others: [56],
    when: "1514–c. 1517",
    stages: [
      { name: "Rāmakeli", lat: 24.88, lon: 88.13, note: "At night, in disguise, the ministers Dabira Khāsa and Sākara Mallika fall at the Lord's feet; He names them Rūpa and Sanātana.", source: `${CC}, Madhya 1; His record` },
      { name: "Bāklā-Candradvīpa", lat: 22.7, lon: 90.37, note: "He takes his wealth there in two boats and divides it among brāhmaṇas, Vaiṣṇavas and his family, leaving ten thousand coins with a grocer in Gauḍa for Sanātana (place approximate).", source: `${CC}, Madhya 19; His record` },
      { name: "Prayāga", lat: 25.43, lon: 81.88, untold: true, note: "With Anupama he finds the Lord; Vallabha Bhaṭṭa receives them at Āḍāila; for ten days at Daśāśvamedha-ghāṭa the Lord teaches him the science of rasa.", source: `${CC}, Madhya 19; His record` },
      { name: "Mathurā", lat: 27.5058, lon: 77.6857, note: "He meets Subuddhi Rāya at Dhruva-ghāṭa.", source: `${CC}, Madhya 25; His record` },
      { name: "Vṛndāvana", lat: 27.58, lon: 77.7, note: "He visits the twelve forests, sees Gopāla, and begins his drama.", source: `${CC}, Madhya 18, 25; His record` },
      { name: "Prayāga", lat: 25.43, lon: 81.88, note: "After a month, back along the Gaṅgā.", source: `${CC}, Madhya 25` },
      { name: "Kāśī", lat: 25.32, lon: 83.0, note: "Ten days with the devotees of Kāśī.", source: `${CC}, Madhya 25` },
      { name: "Gauḍa", lat: 24.88, lon: 88.13, untold: true, note: "Anupama leaves this world; Rūpa performs the rites and goes on towards Nīlācala; at Satyabhāmā-pura in Orissa Satyabhāmā asks him in a dream for a drama of her own.", source: `${CC}, Antya 1; His record` },
      { name: "Jagannātha Purī", lat: 19.805, lon: 85.818, untold: true, note: "With Haridāsa Ṭhākura; the verse «priyaḥ so 'yaṁ kṛṣṇaḥ» on the palm leaf; after the Dola-yātrā the Lord sends him to Vṛndāvana.", source: `${CC}, Antya 1; His record` },
      { name: "Vṛndāvana", lat: 27.58, lon: 77.7, untold: true, note: "Through Gauḍa, where he is delayed a year dividing his wealth.", source: `${CC}, Antya 1; His record` },
    ],
  },
  {
    id: "sanatana",
    title: { es: "Sanātana: de la prisión de Gauḍa a Vṛndāvana", en: "Sanātana: from the prison of Gauḍa to Vṛndāvana" },
    person: 1353,
    when: "1514–c. 1517",
    stages: [
      { name: "Rāmakeli (Gauḍa)", lat: 24.88, lon: 88.13, note: "After meeting the Lord he stops going to court and studies the Bhāgavatam; the Badshah imprisons him. With Rūpa's money he bribes the jailer, who takes him across the Gaṅgā at night.", source: `${CC}, Madhya 19–20; His record` },
      { name: "Pātaḍā hills", lat: 23.99, lon: 85.36, untold: true, note: "In the hills of Hazaribagh a robber-landlord who meant to kill him for eight gold coins takes the seven he is given and has him led across by night (place approximate).", source: `${CC}, Madhya 20; His record` },
      { name: "Hājipura", lat: 25.69, lon: 85.21, note: "His brother-in-law Śrīkānta begs him to rest; he accepts only help to cross the Gaṅgā and a woollen blanket.", source: `${CC}, Madhya 20; His record` },
      { name: "Vārāṇasī", lat: 25.32, lon: 83.0, note: "At Candraśekhara's door the Lord runs to embrace him; he gives the blanket away, and for two months the Lord teaches him.", source: `${CC}, Madhya 20–25; His record` },
      { name: "Mathurā", lat: 27.5058, lon: 77.6857, note: "From Subuddhi Rāya he hears that Rūpa has left by another road.", source: `${CC}, Madhya 25; His record` },
      { name: "Vṛndāvana", lat: 27.58, lon: 77.7, note: "He wanders through the forests, gathers the Mathurā-māhātmya books and begins to find the lost holy places.", source: `${CC}, Madhya 25; His record` },
      { name: "Jagannātha Purī", lat: 19.805, lon: 85.818, untold: true, note: "Alone through the Jhārikhaṇḍa forest, with sores on his body; the Lord forbids him to die under the Ratha cart and embraces him until the sores vanish.", source: `${CC}, Antya 4; His record` },
      { name: "Vṛndāvana", lat: 27.58, lon: 77.7, untold: true, note: "After a year, by the road the Lord had taken.", source: `${CC}, Antya 4; His record` },
    ],
  },
  {
    id: "srinivasa",
    title: { es: "Śrīnivāsa: de Cākundī a Vṛndāvana", en: "Śrīnivāsa: from Cākundī to Vṛndāvana" },
    person: 1466,
    when: "1519 →",
    stages: [
      { name: "Cākundī", lat: 23.56, lon: 88.22, note: "Born on the Vaiśākha pūrṇimā, 1519, son of Gaṅgādhara Bhaṭṭācārya («Caitanya dāsa») and Lakṣmīpriyā.", source: "His record; Bhakti-ratnākara" },
      { name: "Jājigrāma", lat: 23.62, lon: 88.09, note: "After his father's death he moves with his mother to his grandfather's house.", source: "His record" },
      { name: "Śrīkhaṇḍa", lat: 23.59, lon: 88.07, note: "He goes to Narahari Sarakāra.", source: "His record" },
      { name: "Jagannātha Purī", lat: 19.805, lon: 85.818, untold: true, note: "Gadādhara Paṇḍita embraces him; he meets Rāmānanda Rāya and Sārvabhauma. On the way back he hears that Gadādhara, Advaita and Nityānanda have left this world.", source: "His record; Bhakti-ratnākara 4" },
      { name: "Navadvīpa", lat: 23.42, lon: 88.39, untold: true, note: "Vaṁśīvadana brings him to Viṣṇupriyā-devī, who blesses him.", source: "His record" },
      { name: "Śāntipura", lat: 23.25, lon: 88.48, note: "He meets Sītā Ṭhākurāṇī.", source: "His record" },
      { name: "Khaḍadaha", lat: 22.72, lon: 88.38, note: "Jāhnavā Mātā puts her feet on his head and orders him to go to Vṛndāvana.", source: "His record" },
      { name: "Khānākula", lat: 22.72, lon: 87.87, note: "Abhirāma Ṭhākura strikes him three times with his whip Jaya-maṅgala, and he is flooded with prema.", source: "His record" },
      { name: "Gayā", lat: 24.79, lon: 85.0, untold: true, note: "", source: "His record" },
      { name: "Kāśī", lat: 25.32, lon: 83.0, note: "Candraśekhara and Tapana Miśra.", source: "His record" },
      { name: "Mathurā", lat: 27.5058, lon: 77.6857, note: "He hears that Raghunātha Bhaṭṭa and other great devotees have just left this world, and faints.", source: "His record" },
      { name: "Vṛndāvana", lat: 27.58, lon: 77.7, note: "Jīva Gosvāmī receives him; Gopāla Bhaṭṭa gives him dīkṣā at the Rādhā-ramaṇa temple; Jīva gives him the title «Ācārya». With Narottama and Rāghava Paṇḍita he wanders through the forests of Vraja.", source: "His record; Bhakti-ratnākara 5" },
      { name: "Rādhā-kuṇḍa", lat: 27.524, lon: 77.488, note: "Three days with Raghunātha dāsa and Kṛṣṇadāsa Kavirāja.", source: "His record" },
      { name: "Vana-viṣṇupura", lat: 23.07, lon: 87.32, untold: true, note: "With the Gosvāmīs' books (see «the books»): they are stolen, and he wins King Vīra Hāmvīra.", source: "Bhakti-ratnākara 7; His record" },
      { name: "Jājigrāma", lat: 23.62, lon: 88.09, untold: true, note: "He marries Draupadī (Īśvarī) and initiates Rāmacandra Kavirāja; from here he teaches the Gosvāmīs' books.", source: "His record" },
    ],
  },
  {
    id: "narottama",
    title: { es: "Narottama: Kheturī, Vraja y los lugares del Señor", en: "Narottama: Kheturī, Vraja and the places of the Lord" },
    person: 1010,
    when: "s. XVI",
    stages: [
      { name: "Kheturī", lat: 24.44, lon: 88.44, note: "The prince leaves home on the Kārtika pūrṇimā, tricking his mother and the guards.", source: "Prema-vilāsa; Bhakti-ratnākara; His record" },
      { name: "Vṛndāvana", lat: 27.58, lon: 77.7, untold: true, note: "Barefoot, with a boil on his foot, he is healed by milk from a brāhmaṇa. Jīva sends him to Lokanātha Gosvāmī, who after his secret service initiates him on the Śrāvaṇa pūrṇimā; Jīva calls him «Ṭhākura».", source: "Prema-vilāsa 11; Bhakti-ratnākara 1; His record" },
      { name: "Vana-viṣṇupura", lat: 23.07, lon: 87.32, untold: true, note: "With Śrīnivāsa and Śyāmānanda and the books; after the theft Śrīnivāsa sends him on.", source: "Bhakti-ratnākara 7.119; His record" },
      { name: "Navadvīpa", lat: 23.42, lon: 88.39, untold: true, note: "An old brāhmaṇa shows him the ghāṭa where Nimāi sat with His students and the house of Jagannātha Miśra, where Śuklāmbara and old Īśāna receive him.", source: "His record" },
      { name: "Śāntipura", lat: 23.25, lon: 88.48, note: "", source: "His record" },
      { name: "Ambikā-Kālnā", lat: 23.22, lon: 88.36, note: "Hṛdaya Caitanya.", source: "His record" },
      { name: "Saptagrāma", lat: 22.96, lon: 88.37, note: "", source: "His record" },
      { name: "Khaḍadaha", lat: 22.72, lon: 88.38, note: "Jāhnavā, Vasudhā, Vīrabhadra and Parameśvarī dāsa.", source: "His record" },
      { name: "Khānākula", lat: 22.72, lon: 87.87, note: "Abhirāma Ṭhākura.", source: "His record" },
      { name: "Jagannātha Purī", lat: 19.805, lon: 85.818, untold: true, note: "Gopīnātha Ācārya, Haridāsa's samādhi, Ṭoṭā-Gopīnātha, Gopāla Guru at Kāśī Miśra's house; he faints on hearing of the Lord's disappearance. Then Śyāmānanda at Nṛsiṁhapura, who would not let him go.", source: "His record" },
      { name: "Śrīkhaṇḍa", lat: 23.59, lon: 88.07, untold: true, note: "Narahari and Raghunandana.", source: "His record" },
      { name: "Kāṭwā", lat: 23.65, lon: 88.13, note: "Gadādhara dāsa at Kaṇṭaka-nagara.", source: "His record" },
      { name: "Ekacakrā", lat: 24.17, lon: 87.8, note: "Nityānanda's birthplace.", source: "His record" },
      { name: "Kheturī", lat: 24.44, lon: 88.44, untold: true, note: "King Santoṣa Datta takes dīkṣā from him and builds a temple; on the Phālguna pūrṇimā the great festival of Kheturī, where Mahāprabhu appears in the kīrtana.", source: "Bhakti-ratnākara 10; His record" },
    ],
  },
  {
    id: "syamananda",
    title: { es: "Śyāmānanda: de Orissa a Vraja y de vuelta", en: "Śyāmānanda: from Orissa to Vraja and back" },
    person: 1535,
    when: "1534–1630",
    stages: [
      { name: "Dhāreṇḍā", lat: 22.35, lon: 87.2, note: "Born on the Caitra pūrṇimā, 1534, and named Duḥkhī, because the children before him had died.", source: "Bhakti-ratnākara 1; His record" },
      { name: "Ambikā-Kālnā", lat: 23.22, lon: 88.36, note: "At twenty he falls at the door of Gaurīdāsa's Gaura-Nitāi; Hṛdaya Caitanya names him Kṛṣṇadāsa, initiates him and sends him to Jīva Gosvāmī.", source: "His record" },
      { name: "Navadvīpa", lat: 23.42, lon: 88.39, untold: true, note: "He sees old Īśāna.", source: "His record" },
      { name: "Gayā", lat: 24.79, lon: 85.0, note: "The Viṣṇu-pāda.", source: "His record" },
      { name: "Kāśī", lat: 25.32, lon: 83.0, note: "Tapana Miśra and Candraśekhara.", source: "His record" },
      { name: "Mathurā", lat: 27.5058, lon: 77.6857, note: "Ādi-keśava.", source: "His record" },
      { name: "Vṛndāvana", lat: 27.58, lon: 77.7, note: "Sweeping the groves he finds Śrī Rādhā's anklet; She names him Śyāmānanda and gives him the tilaka of the anklet.", source: "Bhakti-ratnākara 6; His record" },
      { name: "Vana-viṣṇupura", lat: 23.07, lon: 87.32, untold: true, note: "With the books (1582); after the theft he goes back to his guru.", source: "Bhakti-ratnākara 7; His record" },
      { name: "Ambikā-Kālnā", lat: 23.22, lon: 88.36, untold: true, note: "Hṛdaya Caitanya sends him to preach in Orissa.", source: "His record" },
      { name: "Dhāreṇḍā (Rohiṇī)", lat: 22.35, lon: 87.2, note: "He preaches at his birthplace and Daṇḍeśvara; at Rohiṇī he initiates Rasikānanda, and the yogī Dāmodara becomes a devotee.", source: "His record" },
      { name: "Gopīvallabhapura", lat: 22.2, lon: 86.9, note: "With Rasikānanda he builds a temple and installs Śrī Śrī Rādhā-Govinda (after Balarāmapura and Nṛsiṁhapura).", source: "Bhakti-ratnākara 15; His record" },
      { name: "Kheturī", lat: 24.44, lon: 88.44, untold: true, note: "The festival of Kheturī; on the way back Gadādhara dāsa, Śrīnivāsa and Raghunandana.", source: "His record" },
      { name: "Gopīvallabhapura", lat: 22.2, lon: 86.9, untold: true, note: "He leaves this world at Nṛsiṁhapura in 1630; his samādhi is here.", source: "His record" },
    ],
  },
  {
    id: "books",
    title: { es: "Śrīnivāsa, Narottama y Śyāmānanda llevan los libros", en: "Śrīnivāsa, Narottama and Śyāmānanda carry the books" },
    person: 1466,
    others: [1010, 1535],
    when: "Agrahāyaṇa",
    stages: [
      { name: "Vṛndāvana", lat: 27.58, lon: 77.7, note: "After bowing to Govinda, Gopīnātha and Madana-mohana, they leave with the Gosvāmīs' books in a chest on an ox-cart, sent by Jīva Gosvāmī.", source: "Bhakti-ratnākara 7; Śrīnivāsa's record" },
      { name: "Mathurā", lat: 27.49, lon: 77.67, note: "A merchant of Mathurā gives the cart, four bullocks and armed guards.", source: "Śrīnivāsa's record («Vaiṣṇava Saints»)" },
      { name: "Vana-viṣṇupura", lat: 23.07, lon: 87.32, untold: true, note: "Village by village towards Bengal. At night the men of the robber-king Vīra Hāmvīra steal the chest; Śrīnivāsa stays, wins the king over and gets the books back.", source: "Bhakti-ratnākara 7; Śrīnivāsa's record" },
      { name: "Kheturī", lat: 24.43, lon: 88.6, from: 2, note: "Narottama goes on to his home, Kheturī.", source: "Bhakti-ratnākara 7; Narottama's record" },
      { name: "Gopīvallabhapura (Orissa)", lat: 22.2, lon: 86.9, from: 2, note: "Śyāmānanda goes on to Orissa.", source: "Bhakti-ratnākara 7; Śyāmānanda's record" },
    ],
  },
];
