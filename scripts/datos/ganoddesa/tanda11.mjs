// node tanda11.mjs → tanda11.json (Gaṇoddeśa, tanda 11). The books of Info take precedence.
// (#1439 Śrīhari Ācārya was joined to #450 Hari Ācārya: ../unir-hari-acarya.json, Whisper 15-11-2026.)
// Left out: #1499 Sundarī Ṭhākura («Khañjanī», no book of Info); #1484 Sudhānidhi Rāya — the record makes him one of
// the nine nidhis (GGD 102–103), but those are «the nine sons of Nidhiratna-devī», and he is Bhavānanda Rāya's son,
// Rāmānanda's brother: another Sudhānidhi (ask Whisper).
// #1486 Sukhānanda (disciple of Śrīnivāsa) had a few words on Sukhānanda Purī (the siddhi): they go to #1959.
// GGD 53 (the OCR calls it «Text. oo»): Vasiṣṭha = Gaṅgādāsa AND Sudarśana.
import fs from "node:fs";
const GGD = "Gaura-gaṇoddeśa-dīpikā";
const RKGD = "Rādhā-Kṛṣṇa-gaṇoddeśa-dīpikā";
const LIST_194 = `In verses 194–207 the ${GGD} names twenty-seven maidservants of Śrī Rādhā — «Mālatī, Candralatikā, Mañjumedhā, Varāṅgadā, Ratnāvalī, Kamalā, Guṇacūḍā, Sukeśinī, Karpūra-mañjarī, Śyāma-mañjarī, Śveta-mañjarī, Vilāsa-mañjarī, Kāmalekhā, Mauna-mañjarī, Gandhonmadā, Rasonmadā, Candrikā, Kalabhāṣiṇī, Gopālī, Hariṇī, Kālī, Kalākṣī, Nitya-mañjarī, Kalakaṇṭhī, Kuraṅgākṣī, Candrikā and Candraśekharā» — who «assuming male forms appeared among Lord Caitanya's associates», and then the devotees they became, *kramaśaḥ*, in the same order.`;
const NIDHI = (who) => `## In Kṛṣṇa-līlā

One of the **nine treasures (*nidhis*) of Kuvera**${who}.

## ${GGD} 102–103

> loke ye nidhayaḥ khyātāḥ padma-śaṅkhādayo nava
> …
> śrī-śrīnidhiś ca śrī-garbhaḥ kaviratnaḥ sudhānidhiḥ

«Kuvera's famous nine treasures, which include his conch and lotus, took birth during Lord Caitanya's pastimes as the nine sons of Nidhiratna-devī. They were all very dear to the Lord. Their names were Śrīnidhi, Śrīgarbha, Kaviratna, Sudhānidhi, Vidyānidhi, Guṇanidhi, the learned brāhmaṇa Ratnabāhu, Śrīmān Ācāryaratna, and Śrī Ratnākara Paṇḍita.» The verse does not say which treasure each one is.

## Sources

${GGD} 102–103.
`;
const plan = [
  {
    id: 1461,
    name: "Śrīnātha Miśra",
    text: `## In Kṛṣṇa-līlā

**Citrāṅgī**, a gopī of Vraja.

## ${GGD} 171

> balabhadrākhyako bhaṭṭācāryaḥ śrī-madhurekṣaṇā
> śrīnātha-miśraś citrāṅgī kavicandro manoharā

«Madhurekṣaṇā-gopī appeared as Balabhadra Bhaṭṭācārya, Citrāṅgī-gopī appeared as Śrīnātha Miśra, and Manoharā-gopī appeared as Kavicandra.»

## Sources

${GGD} 171.
`,
    remove: ["In Kṛṣṇa-līlā: Citrāṅgī (Gaura-gaṇoddeśa-dīpikā 171)."],
  },
  {
    id: 1464,
    name: "Śrīnidhi",
    text: NIDHI(" — «Padma-nidhi», according to the record (Gauḍīya Vaiṣṇava Abhidhāna)"),
    remove: ["In Kṛṣṇa-līlā: Padmanidhi (Gaura-gaṇoddeśa-dīpikā 102–103)."],
  },
  {
    id: 1472,
    name: "Subhananda Dvija",
    text: `## In Kṛṣṇa-līlā

**Mālatī**, one of Śrī Rādhā's maidservants.

## ${GGD} 194–207

> mālatī candralatikā mañjumedhā varāṅgadā
> …
> śubhānando dvijo brahmacārī śrīdhara-nāmakaḥ

${LIST_194} So Mālatī, the first maidservant, is the first devotee: «Śubhānanda Dvija».

## Mālatī in the books

- **${RKGD}** (Laghu-bhāga 176–178): among Śrī Rādhā's *priya-sakhīs* — «Kuraṅgākṣī, Maṇḍalī, Maṇikuṇḍalā, **Mālatī**, Candralatikā, Mādhavī, Madanālasā…».
- **${RKGD}** (Bṛhad-bhāga 243): a Mālatī is one of the eight prominent sakhīs under **Viśākhā**.

## Sources

${GGD} 194–207; ${RKGD}, Laghu-bhāga 176–178, Bṛhad-bhāga 243.
`,
    replace: [[" In his past incarnation he was Mālatī (GGD. 194, 199).", ""]],
  },
  {
    id: 1474,
    name: "Subuddhi Miśra",
    text: `## In Kṛṣṇa-līlā

**Guṇacūḍā**, one of Śrī Rādhā's maidservants.

## ${GGD} 194–207

> ratnāvalī ca kamalā guṇacūḍā sukeśinī
> …
> subuddhi-miśraḥ śrīharṣo raghu-miśro dvijottamaḥ

${LIST_194} So Guṇacūḍā, the seventh maidservant, is the seventh devotee: Subuddhi Miśra.

## Guṇacūḍā in the books

- **${RKGD}** (Bṛhad-bhāga 246): one of the eight prominent sakhīs under **Tuṅgavidyā** — «Mañjumedhā, Sumadhurā, Sumadhyā, Madhurekṣaṇā, Tanumadhyā, Madhuspandā, **Guṇacūḍā** and Varāṅgadā»; also among Śrī Rādhā's *priya-sakhīs* (Laghu-bhāga 177).

## Other opinions

- The Vaiṣṇavācāra-darpaṇa gives Guṇacūḍā to **Kavi Karṇapūra** (his own record).

## Sources

${GGD} 194–207; ${RKGD}, Bṛhad-bhāga 246, Laghu-bhāga 177.
`,
    remove: ["In Kṛṣṇa-līlā: Guṇacūḍā, Rādhā's maidservant (Gaura-gaṇoddeśa-dīpikā 194-207)."],
  },
  {
    id: 1477,
    name: "Sudarśana",
    text: `## In Kṛṣṇa-līlā

**Vasiṣṭha Muni**, the guru of Lord Rāmacandra — a special manifestation of him, as Gaṅgādāsa Paṇḍita is another; both were the Lord's teachers.

## ${GGD} 53

> purāsīd raghunāthasya yo vasiṣṭha-munir guruḥ
> sa prakāśa-viśeṣeṇa gaṅgādāsa-sudarśanau

«The same person who formerly appeared as Vasiṣṭha Muni, the spiritual master of Lord Rāmacandra, appeared in Lord Caitanya's pastimes as Gaṅgādāsa and Sudarśana.»

## Other opinions

- The Gauḍīya Vaiṣṇava Abhidhāna names only Gaṅgādāsa Paṇḍita; the verse names both.

## Sources

${GGD} 53.
`,
    remove: ["In Kṛṣṇa-līlā: the Gauḍīya Vaiṣṇava Abhidhāna places Vasiṣṭha Muni, Rāmacandra's guru, in Gaṅgādāsa Paṇḍita (Gaura-gaṇoddeśa-dīpikā 53); this record said before that Sudarśana was Vasiṣṭha."],
  },
  {
    id: 1486,
    name: "Sukhānanda",
    replace: [[" Sukhananda Purī He was one of the nine sannyāsīs who formed the tree of bhakti. In his past incarnation he was Laghimasiddhi (GGD. 96-97, CC. 1.9.14).", " (The record also held a few words on Sukhānanda Purī, one of the nine sannyāsī roots of the tree of bhakti: they are in his own record, with his Gaṇoddeśa, 15-11-2026.)"]],
  },
  {
    id: 1959,
    name: "Sukhānanda Purī",
    text: `## In Kṛṣṇa-līlā

One of the **eight mystic perfections** (*siddhis*) of Vṛndāvana — **Laghimā**, the power to become lighter than the lightest, according to his notes.

## ${GGD} 96–97

> vṛndāvane yāḥ prāg āsann aṇimādy-aṣṭa-siddhayaḥ
> tā evāṣṭau bhakta-rūpā bhūtā gauḍe ca te yathā
> anantaś ca sukhānando govindo raghunāthakaḥ
> kṛṣṇānandaḥ keśavaś ca śrī-dāmodara-rāghavau
> pury-upādhi-kramāj jñeyā aṇimādy-aṣṭa-siddhayaḥ

«The eight mystic powers, beginning with aṇimā-siddhi, which had formerly appeared in Vṛndāvana, took birth in Bengal during Lord Caitanya's pastimes as the eight devotees Ananta, Sukhānanda, Govinda, Raghunātha, Kṛṣṇānanda, Keśava, Dāmodara and Rāghava. All these devotees bore the title Purī after their names.»

In that order (*kramāt*) Sukhānanda Purī is the second perfection. The verse names only the first, aṇimā; the second is laghimā in one list of the siddhis and mahimā in the Bhāgavata's.

## Sources

${GGD} 96–97.
`,
  },
  {
    id: 1488,
    name: "Śuklāmbara Brahmacārī",
    text: `## In Kṛṣṇa-līlā

One of the **yajña-patnīs**, the wives of the brāhmaṇas who gave food to Kṛṣṇa and His friends — as now the Lord begged food from him and ate it. Some say one of their husbands, the **yājñika brāhmaṇas**.

## ${GGD} 191

> śuklāmbaro brahmacārī purāsīd yajña-patnikā
> prārthayitvā yad-annaṁ śrī-gaurāṅgo bhuktavān prabhuḥ
> kecid āhur brahmacārī yājñika-brāhmaṇaḥ purā

«Śuklāmbara Brahmacārī was the incarnation of one of the yajña-patnīs who gave food in charity to Kṛṣṇa and His friends. Lord Caitanya was accustomed to eating food He had begged from Śuklāmbara Brahmacārī. Some say that Śuklāmbara Brahmacārī was not one of the yajña-patnīs, but one of their husbands, the yājñika-brāhmaṇas.»

## Sources

${GGD} 191.
`,
    remove: ["In Kṛṣṇa-līlā: one of the yajña-patnīs (some say a yājñika brāhmaṇa) (Gaura-gaṇoddeśa-dīpikā 191)."],
  },
  {
    id: 1491,
    name: "Sulocana",
    text: `## In Kṛṣṇa-līlā

**Candraśekharā**, one of Śrī Rādhā's maidservants.

## ${GGD} 194–207

> kalakaṇṭhī kuraṅgākṣī candrikā candraśekharā
> …
> kavidatto rāmadāsaś cirañjīva-sulocanau

${LIST_194} So Candraśekharā, the twenty-seventh and last maidservant, is the last devotee: Sulocana (read with «Hastigopāla, and Vallabha who lived at Raṅga» as two devotees, so that the two lists have twenty-seven each).

## Sources

${GGD} 194–207.
`,
    replace: [
      [" In his past incarnation he  was Candrasekhar (GGD. 207).", ""],
      [" In Kṛṣṇa-līlā the gopī Candraśekharā, one of Śrī Rādhā's maidservants.", ""],
    ],
  },
  {
    id: 1496,
    name: "Sundarānanda Ṭhākura",
    text: `## In Kṛṣṇa-līlā

**Sudāmā**, one of Kṛṣṇa's cowherd friends (*priya-sakhās*), of the same age as Kṛṣṇa.

## ${GGD} 127

> purā sudāma-nāmāsīd adya ṭhakkura-sundaraḥ
> vasudāma-sakhā yaś ca paṇḍitaḥ śrī-dhanañjayaḥ

«Lord Kṛṣṇa's cowherd friend Sudāmā appeared in Lord Caitanya's pastimes as Sundara Ṭhākura. Lord Kṛṣṇa's cowherd friend Vasudāmā appeared in Lord Caitanya's pastimes as Śrī Dhanañjaya Paṇḍita.»

## Sudāmā in the books

- **${RKGD}** (Laghu-bhāga 39–40):

> īṣad-gauraḥ sudāmā ca deha-kāntir manoharā
> nīla-vastra-paridhāno ratnābharaṇa-bhūṣitaḥ

«Sudāmā has a supremely attractive bodily lustre, which is slightly fair. He wears blue garments and is decorated with jewelled ornaments. Sudāmā's father is Maṭuka and his mother is Rocanā. He is beautified by his handsome youth and attire, and he is a mine of various blissful sports.»
- **${RKGD}** (Laghu-bhāga 31–32): among the *priya-sakhās* — «Śrīdāmā, Dāmā, **Sudāmā**, Vasudāmā…».

## Sources

${GGD} 127; ${RKGD}, Laghu-bhāga 31–32, 39–40.
`,
    remove: ["In Kṛṣṇa-līlā: Sudāmā (Gaura-gaṇoddeśa-dīpikā 127)."],
  },
  {
    id: 1503,
    name: "Sūryadāsa Sarakhela",
    text: `## In Kṛṣṇa-līlā

**King Kakudmī**, the father of Revatī, whom he gave to Balarāma — as now he gave his daughters Vasudhā and Jāhnavā to Nityānanda.

## ${GGD} 65

> śrī-vāruṇī-revatī-vaṁśa-sambhave tasya priye dve vasudhā ca jāhnavī
> śrī-sūryadāsasya mahātmanaḥ sute kakudmi-rūpasya ca sūrya-tejasaḥ

«Lord Balarāma's two wives, Śrīmatī Vāruṇī-devī and Śrīmatī Revatī-devī, appeared during Lord Caitanya's pastimes as Śrīmatī Vasudhā-devī and Śrīmatī Jāhnavī-devī, the two dear wives of Lord Nityānanda, and the daughters of the great personality Śrī Sūryadāsa. Their father, Sūryadāsa, had previously been Mahārāja Kakudmī. His bodily luster made him as effulgent as the sun.»

## Sources

${GGD} 65.
`,
    remove: ["In Kṛṣṇa-līlā: King Kakudmī (Gaura-gaṇoddeśa-dīpikā 65)."],
  },
];
fs.writeFileSync(new URL("./tanda11.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length + " fichas");
