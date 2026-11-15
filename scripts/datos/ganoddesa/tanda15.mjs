// node tanda15.mjs → tanda15.json (Gaṇoddeśa, tanda 15 — the last of pendientes.json). The books of Info take precedence.
// (#1925 was joined to #260 Dvija Raghunātha: ../unir-raghunatha-dvija.json, Whisper 15-11-2026.)
// Left out: #1972 Govinda Ācārya (no identity), #2148 Gaṅgādāsa («Durvāsā», no source; the GGD 111 gives Durvāsā to
// «Jagannātha Ācārya, Gaṅgādāsa» #548), #2158 Mahattama Vaiṣṇava (no identity).
// «Gaṇoddeśa manda»: #2164 Makaradhvaja Datta and #2166 Makaradhvaja Sena (Vaiṣṇavācāra-darpaṇa: Kuraṅgākṣī, Mañjumedhā)
// get their text with the GGD's other devotee for that gopī.
import fs from "node:fs";
const GGD = "Gaura-gaṇoddeśa-dīpikā";
const RKGD = "Rādhā-Kṛṣṇa-gaṇoddeśa-dīpikā";
const SIDDHI = (who, n, note) => `## In Kṛṣṇa-līlā

One of the **eight mystic perfections** (*siddhis*) of Vṛndāvana${note}.

## ${GGD} 96–97

> vṛndāvane yāḥ prāg āsann aṇimādy-aṣṭa-siddhayaḥ
> tā evāṣṭau bhakta-rūpā bhūtā gauḍe ca te yathā
> anantaś ca sukhānando govindo raghunāthakaḥ
> kṛṣṇānandaḥ keśavaś ca śrī-dāmodara-rāghavau
> pury-upādhi-kramāj jñeyā aṇimādy-aṣṭa-siddhayaḥ

«The eight mystic powers, beginning with aṇimā-siddhi, which had formerly appeared in Vṛndāvana, took birth in Bengal during Lord Caitanya's pastimes as the eight devotees Ananta, Sukhānanda, Govinda, Raghunātha, Kṛṣṇānanda, Keśava, Dāmodara and Rāghava. All these devotees bore the title Purī after their names.»

In that order (*kramāt*) ${who} is the ${n} perfection. The verse names only the first, aṇimā; the books list the others in different orders.

## Sources

${GGD} 96–97.
`;
const OTHER_DARPANA = (gopi, n, devotee, line1, line2) => `## In Kṛṣṇa-līlā

**${gopi}**, one of Śrī Rādhā's maidservants — according to the Vaiṣṇavācāra-darpaṇa. The ${GGD} does not name him.

## Other opinions

- In the ${GGD} (194–207) ${gopi}, the ${n} of the twenty-seven maidservants of Śrī Rādhā, became the ${n} devotee of the list: **${devotee}** (his own record).

> ${line1}
> …
> ${line2}

## Sources

Vaiṣṇavācāra-darpaṇa; ${GGD} 194–207.
`;
const plan = [
  {
    id: 1952,
    name: "Kāśī Miśra",
    text: `## In Kṛṣṇa-līlā

**Kubjā** (Sairandhrī) of Mathurā, very dear to Kṛṣṇa — as now the Lord lived in his house.

## ${GGD} 193

> mathurāyāṁ purā yāsīt sairandhrī kṛṣṇa-vallabhā
> sādya nīlācala-vāsaḥ kāśī-miśraḥ prabhoḥ priyaḥ

«Kubjā, who had been very dear to Lord Kṛṣṇa in Mathurā, later appeared in Jagannātha Purī as Kāśī Miśra, who was very dear to Lord Caitanya.»

## Sources

${GGD} 193.
`,
    remove: ["In Kṛṣṇa-līlā: Kubjā (Sairandhrī) of Mathurā (Gaura-gaṇoddeśa-dīpikā 193)."],
  },
  {
    id: 1961,
    name: "Śrīrāma Paṇḍita",
    text: `## In Kṛṣṇa-līlā

**Parvata Muni**, the dear friend of Nārada Muni — as his elder brother Śrīvāsa was Nārada.

## ${GGD} 90

> śrīvāsa-paṇḍito dhīmān yaḥ purā nārado muniḥ
> parvatākhyo muni-varo ya āsīn nārada-priyaḥ
> sa rāma-paṇḍitaḥ śrīmāṁs tat-kaniṣṭha-sahodaraḥ

«Intelligent Śrīvāsa Paṇḍita had previously been Nārada Muni, the best of the sages. Śrīvāsa's younger brother, Śrīmān Rāma Paṇḍita, had previously been Nārada's close friend Parvata Muni.»

## Sources

${GGD} 90.
`,
    remove: ["In Kṛṣṇa-līlā: Parvata Muni, the dear friend of Nārada (Gaura-gaṇoddeśa-dīpikā 90)."],
    replace: [[" In his past incarnation he was Parvat Muni, a favorite friend of Nārada Muni (Gaura- gaṇoddeśa- dīpikā 90).", ""]],
  },
  {
    id: 1966,
    name: "Govinda (Vaikuṇṭha-pārṣada Puṇḍarīkākṣa)",
    text: `## In Kṛṣṇa-līlā

Not a person of Vraja: **Puṇḍarīkākṣa**, a famous liberated associate of Vaikuṇṭha; Garuḍa Paṇḍita was Kumuda.

## ${GGD} 116

> puṇḍarīkākṣa-kumudau khyātau vaikuṇṭha-maṇḍale
> govinda-garuḍākhyau tau jātau gauḍe prabhoḥ priyau

«The two liberated souls Puṇḍarīkākṣa and Kumuda, who are very famous in Vaikuṇṭhaloka, appeared in Bengal as the two devotees named Govinda and Garuḍa, who were both very dear to Lord Caitanya Mahāprabhu.»

## Sources

${GGD} 116.
`,
    replace: [[" In his past incarnation the Vaikuṇṭha-pārṣada Puṇḍarīkākṣa (Gaura-gaṇoddeśa-dīpikā 116).", ""]],
  },
  {
    id: 1973,
    name: "Govindānanda Purī",
    text: SIDDHI("Govinda Purī", "third", " — **Prāpti**, the power to obtain anything, according to the record"),
    replace: [[", Prāpti-siddhi among the eight siddhis (Gaura-gaṇoddeśa-dīpikā 96-97).", ", one of the eight Purīs who were the eight siddhis."]],
  },
  {
    id: 1977,
    name: "Rāghava Purī",
    text: SIDDHI("Rāghava Purī", "eighth and last", ""),
    replace: [[" He was Siddhi in his past incarnation (Gaura-gaṇoddeśa-dīpikā 96-97).", ""]],
  },
  {
    id: 1978,
    name: "Choṭa Haridāsa",
    text: `## In Kṛṣṇa-līlā

**Patraka**, a servant of Kṛṣṇa in Vṛndāvana; Baḍa Haridāsa was Raktaka.

## ${GGD} 138

> vṛndāvane sthitau prāg yau bhṛtyau raktaka-patrakau
> gaurāṅga-sevakāv adya haridāsa-bṛhacchiśū

«Raktaka and Patraka, who had been Lord Kṛṣṇa's servants in Vṛndāvana, later appeared as Haridāsa and Bṛhacchiśu, two servants of Lord Caitanya.»

## Other opinions

- The verse names «Haridāsa and Bṛhacchiśu»; the Gauḍīya Vaiṣṇava Abhidhāna («Haridāsa» 6) takes them as Baḍa Haridāsa (Raktaka) and Choṭa Haridāsa (Patraka).

## Patraka in the books

- **${RKGD}** (Laghu-bhāga 73–74): among Kṛṣṇa's *ceṭas* — «Bhaṅgura, Bhṛṅgāra, Sāndhika, Grahila, Raktaka, **Patraka**, Patrī, Madhukaṇṭha, Madhuvrata…», who carry His flute, horn, stick and the rope for milking.

## Sources

${GGD} 138; ${RKGD}, Laghu-bhāga 73–74; Gauḍīya Vaiṣṇava Abhidhāna.
`,
    remove: ["In Kṛṣṇa-līlā: Patraka, a servant of Kṛṣṇa in Vraja (Gaura-gaṇoddeśa-dīpikā 138; Gauḍīya Vaiṣṇava Abhidhāna, «Haridāsa» 6)."],
  },
  {
    id: 1988,
    name: "Nāgara Puruṣottama",
    text: `## In Kṛṣṇa-līlā

**Dāma**, one of Kṛṣṇa's cowherd friends (*priya-sakhās*).

## ${GGD} 131

> sadāśiva-suto nāmnā nāgaraḥ puruṣottamaḥ
> vaidya-vaṁśodbhavo dāmā yo ballavaḥ sakhā vraje

«Dāma-gopa, who had been Lord Kṛṣṇa's cowherd friend in Vraja, appeared in Lord Caitanya's pastimes as Nāgara Puruṣottama. Nāgara Puruṣottama was born in a family of physicians, and his father's name was Sadāśiva.»

## Dāma in the books

- **${RKGD}** (Laghu-bhāga 31–32): «Śrīdāmā, **Dāmā**, Sudāmā, Vasudāmā, Kiṅkiṇī, Bhadrasena, Aṁśumāna, Stoka-kṛṣṇa… are Śrī Kṛṣṇa's priya-sakhās. These sakhās are of the same age as Śrī Kṛṣṇa.»

## Other opinions

- The verse says he was the son of Sadāśiva, of a vaidya family — as the record «Puruṣottama dāsa», son of Sadāśiva Kavirāja; Śrīla Prabhupāda takes the two as one. The ${GGD} (130) gives Stoka-kṛṣṇa to «Puruṣottama dāsa».

## Sources

${GGD} 130–131; ${RKGD}, Laghu-bhāga 31–32.
`,
    remove: ["In Kṛṣṇa-līlā: Dāma gopāla."],
  },
  {
    id: 1990,
    name: "Mādhava Ācārya (Gadādhara's branch)",
    text: `## In Kṛṣṇa-līlā

**Mādhavī**, a gopī of Vraja.

## ${GGD} 169

> mādhavī mādhavācārya indirā jīva-paṇḍitaḥ

«Mādhavī-gopī appeared as Mādhavācārya, and Indirā-gopī appeared as Jīva Paṇḍita.»

## Mādhavī in the books

- **${RKGD}** (Bṛhad-bhāga 243): a **Mādhavī** is the first of the eight prominent sakhīs under **Viśākhā** — «Mādhavī, Mālatī, Candrarekhikā, Kuñjarī, Hariṇī, Capalā, Surabhi and Śubhānanā»; also among Śrī Rādhā's *priya-sakhīs* (Laghu-bhāga 176).

## Other opinions

- The verse says only «Mādhavācārya»; the other Mādhava Ācāryas (the husband of Nityānanda's daughter Gaṅgā, who was King Śantanu) have their own records.

## Sources

${GGD} 169; ${RKGD}, Bṛhad-bhāga 243, Laghu-bhāga 176.
`,
  },
  {
    id: 2000,
    name: "Śrī Devī (wife of Advaita)",
    text: `## In Kṛṣṇa-līlā

A manifestation (*prakāśa*) of **Yogamāyā** — her sister Sītā is Yogamāyā herself.

## ${GGD} 86

> yogamāyā bhagavatī gṛhiṇī tasya sāmpratam
> sītā-rūpeṇāvatīrṇā śrī-nāmnī tat-prakāśataḥ

«The Supreme Lord's yogamāyā potency appeared in Lord Caitanya's pastimes as Śrī Sītā-devī, the wife of Lord Advaita Ācārya» — and, as her manifestation (*tat-prakāśataḥ*), as the one named Śrī.

## Sources

${GGD} 86.
`,
    remove: ["In Kṛṣṇa-līlā: a manifestation (prakāśa) of Yogamāyā (Gaura-gaṇoddeśa-dīpikā 86)."],
  },
  {
    id: 2138,
    name: "Jagadīśa Paṇḍita (of Navadvīpa)",
    text: `## In Kṛṣṇa-līlā

One of the **yajña-patnīs**, the wives of the brāhmaṇas who gave food to Kṛṣṇa and His friends — as now, with his brother Hiraṇya, he gave the child Gaura the Ekādaśī offering.

## ${GGD} 192

> apare yajña-patnyau śrī-jagadīśa-hiraṇyakau
> ekādaśyāṁ yayor annaṁ prārthayitvāghasat prabhuḥ

«Two other yajña-patnīs appeared as Jagadīśa and Hiraṇya. One Ekādaśī day Lord Caitanya ate grains he had begged from them.»

## Sources

${GGD} 191–192.
`,
    remove: ["In Kṛṣṇa-līlā: a yajña-patnī (Gaura-gaṇoddeśa-dīpikā 192)."],
  },
  {
    id: 2163,
    name: "Makaradhvaja (Sukeśī in Vraja)",
    text: `## In Kṛṣṇa-līlā

**Sukeśī**, a gopī of Vraja.

## ${GGD} 168

> gaurasenī purā nārāyaṇa-vācaspatiḥ kṛtī
> pītāmbaras tu kāverī sukeśī makaradhvajaḥ

«Gaurasenī-gopī appeared as the saintly devotee Nārāyaṇa Vācaspati. Kāverī-gopī appeared as Pītāmbara, and Sukeśī-gopī appeared as Makaradhvaja.»

## Sukeśī in the books

- **${RKGD}** (Bṛhad-bhāga 249): a **Sukeśī** is one of the eight prominent sakhīs under **Sudevī** — «Kāverī, Cārukavarā, Sukeśī, Mañjukeśikā, Hārahīrā, Mahāhīrā, Hārakaṇṭhī and Manoharā».

## Other opinions

- The verse says only «Makaradhvaja»; the ${GGD} names other Makaradhvajas apart (Makaradhvaja Kara, Candramukha, 141).

## Sources

${GGD} 168; ${RKGD}, Bṛhad-bhāga 249.
`,
    replace: [["He was Sukeśī in Vraja (Gaura-gaṇoddeśa-dīpikā 168, as quoted in «Vaiṣṇava Biographies A-Z»). ", ""]],
  },
  {
    id: 2164,
    name: "Makaradhvaja Datta",
    text: OTHER_DARPANA("Kuraṅgākṣī", "twenty-fifth", "Rāmadāsa", "kalakaṇṭhī kuraṅgākṣī candrikā candraśekharā", "kavidatto rāmadāsaś cirañjīva-sulocanau"),
    replace: [["He was Kuraṅgākṣī in Kṛṣṇa-līlā (Vaiṣṇavācāra-darpaṇa, as quoted in «Vaiṣṇava Biographies A-Z»). ", ""]],
  },
  {
    id: 2165,
    name: "Makaradhvaja Kara",
    text: `## In Kṛṣṇa-līlā

**Candramukha**, a famous dancer of Vṛndāvana, one of Kṛṣṇa's servants.

## ${GGD} 141

> naṭaś candramukhaḥ prāg yaḥ sa karo makaradhvajaḥ

«Candramukha, the famous dancer in Vṛndāvana, appeared in Lord Caitanya's pastimes as Makaradhvaja Kara.»

## Candramukha in the books

- **${RKGD}** (Laghu-bhāga 103): «Vicitrarāva, Madhurarāva and other servants are Śrī Kṛṣṇa's panegyrists (vandis), and Candrahāsa, Induhāsa, **Candramukha** and others are dancers.»

## Sources

${GGD} 141; ${RKGD}, Laghu-bhāga 103.
`,
    replace: [["; in Vraja the actor Candramukha (Gaura-gaṇoddeśa-dīpikā 141).", "."]],
  },
  {
    id: 2166,
    name: "Makaradhvaja Sena",
    text: OTHER_DARPANA("Mañjumedhā", "third", "Paramānanda Gupta", "mālatī candralatikā mañjumedhā varāṅgadā", "paramānanda-gupto yat-kṛtā kṛṣṇa-stavāvalī"),
    replace: [["He was Mañjumedhā sakhī in Kṛṣṇa-līlā (Vaiṣṇavācāra-darpaṇa, as quoted in «Vaiṣṇava Biographies A-Z»). ", ""]],
  },
  {
    id: 2178,
    name: "Śivānanda Cakravartī (Gadādhara's branch)",
    text: `## In Kṛṣṇa-līlā

A manifestation (*prakāśa*) of **Lavaṅga-mañjarī**, one of Śrī Rādhā's mañjarīs.

## ${GGD} 183

> śrīmal-lavaṅga-mañjaryāḥ prakāśatvena viśrutaḥ
> śivānandaś cakravartī kṛta-vṛndāvana-sthitiḥ

«Śivānanda Cakravartī, who lived in Vṛndāvana, is also considered to be an incarnation of Śrīmatī Lavaṅga-mañjarī.»

## Lavaṅga-mañjarī in the books

- **${RKGD}** (Laghu-bhāga 182–184): among Śrīmatī Rādhikā's mañjarīs — «Śrī Rūpa Mañjarī, Rāga Mañjarī, Rati Mañjarī, **Lavaṅga Mañjarī**, Guṇa Mañjarī, Rasa Mañjarī…».

## Sources

${GGD} 183; ${RKGD}, Laghu-bhāga 182–184; Śākhā-nirṇayāmṛta 20.
`,
    remove: ["In Kṛṣṇa-līlā: a manifestation of Lavaṅga-mañjarī (Gaura-gaṇoddeśa-dīpikā 183, Sakhānirṇayāmṛta 20)."],
  },
];
fs.writeFileSync(new URL("./tanda15.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length + " fichas");
