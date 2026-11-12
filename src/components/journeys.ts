// The journeys drawn on Panorama › Mapa (12-11-2026, Whisper: «empezamos por tu propuesta»): stage by stage, each with
// its place (degrees), what happened there and where it is told. The stages come from the records' own texts
// (Mahāprabhu #164, Śrīnivāsa #1466) and, for the order and the places they leave out, from the Caitanya-caritāmṛta
// (Madhya 7–9 and 17–19) and the Bhakti-ratnākara 7. Where the texts give no stages, the line is dashed and no
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
  when: string;
  stages: Stage[];
}

const CC = "Caitanya-caritāmṛta";

export const JOURNEYS: Journey[] = [
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
      { name: "Mallikārjuna (Śrī-śaila)", lat: 16.07, lon: 78.87, note: "", source: `${CC}, Madhya 9` },
      { name: "Ahovala-nṛsiṁha", lat: 15.13, lon: 78.72, note: "", source: `${CC}, Madhya 9` },
      { name: "Tirupati (Veṅkaṭa-giri)", lat: 13.68, lon: 79.35, note: "", source: `${CC}, Madhya 9` },
      { name: "Kāñcī", lat: 12.83, lon: 79.7, note: "Śiva-kāñcī and Viṣṇu-kāñcī.", source: `${CC}, Madhya 9` },
      { name: "Vṛddhakāśī", lat: 11.52, lon: 79.32, note: "", source: `${CC}, Madhya 9` },
      { name: "Kumbhakarṇa-kapāla", lat: 10.96, lon: 79.38, note: "", source: `${CC}, Madhya 9` },
      { name: "Śrī Raṅgam", lat: 10.862, lon: 78.69, note: "He spends the four months of the rains in the house of Veṅkaṭa Bhaṭṭa; the boy Gopāla Bhaṭṭa serves Him.", source: `${CC}, Madhya 9; His record` },
      { name: "Ṛṣabha-parvata", lat: 10.07, lon: 78.21, note: "He meets Paramānanda Purī.", source: `${CC}, Madhya 9` },
      { name: "Setubandha Rāmeśvara", lat: 9.288, lon: 79.313, note: "He finds the Kūrma Purāṇa's story of the shadow-Sītā.", source: `${CC}, Madhya 9` },
      { name: "Kanyākumārī", lat: 8.078, lon: 77.55, note: "Cape Comorin, the southern end of the journey.", source: `${CC}, Madhya 9; His record` },
      { name: "Ādi-keśava", lat: 8.33, lon: 77.27, note: "He finds a chapter of the Brahma-saṁhitā and has it copied.", source: `${CC}, Madhya 9` },
      { name: "Ananta-padmanābha", lat: 8.483, lon: 76.946, note: "", source: `${CC}, Madhya 9` },
      { name: "Śṛṅgeri", lat: 13.418, lon: 75.252, note: "", source: `${CC}, Madhya 9` },
      { name: "Uḍupī", lat: 13.34, lon: 74.75, note: "He sees the Gopāla of Madhvācārya and speaks with the Tattvavādīs.", source: `${CC}, Madhya 9` },
      { name: "Gokarṇa", lat: 14.55, lon: 74.32, note: "", source: `${CC}, Madhya 9` },
      { name: "Kolhāpura", lat: 16.7, lon: 74.24, note: "", source: `${CC}, Madhya 9` },
      { name: "Paṇḍharapura", lat: 17.678, lon: 75.33, note: "He meets Śrī Raṅga Purī and hears that His brother Viśvarūpa had left this world here.", source: `${CC}, Madhya 9; His record` },
      { name: "Māhiṣmatī-pura (Narmadā)", lat: 22.18, lon: 75.59, note: "On the way, by the Kṛṣṇa-veṇvā, He finds the Kṛṣṇa-karṇāmṛta.", source: `${CC}, Madhya 9` },
      { name: "Pañcavaṭī, Nāsika", lat: 20.007, lon: 73.79, note: "Through the Daṇḍaka forest, where He touches the seven tāla trees (Saptatāla).", source: `${CC}, Madhya 9; His record` },
      { name: "Kuśāvarta (source of the Godāvarī)", lat: 19.93, lon: 73.53, note: "", source: `${CC}, Madhya 9` },
      { name: "Vidyānagara (Godāvarī)", lat: 17.0, lon: 81.8, note: "Back with Rāmānanda Rāya, who prepares to come to Purī.", source: `${CC}, Madhya 9` },
      { name: "Jagannātha Purī", lat: 19.805, lon: 85.818, note: "Back in Purī after two years.", source: `${CC}, Madhya 9; His record` },
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
    id: "books",
    title: { es: "Śrīnivāsa, Narottama y Śyāmānanda llevan los libros", en: "Śrīnivāsa, Narottama and Śyāmānanda carry the books" },
    person: 1466,
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
