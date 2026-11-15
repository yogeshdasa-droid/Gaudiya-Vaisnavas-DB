// node tanda13.mjs → tanda13.json (Gaṇoddeśa, tanda 13). The books of Info take precedence.
// Whisper (15-11-2026): #1597 ≠ #1215 (the siddhi stays on #1215; #1597 left as it is); #1605 = #1610 (joined:
// ../unir-vallabhacarya.json); Citrā (GGD 161) is #1627 Vanamālī dāsa (Kavirāja), not #1629.
// Left out: #1707 Viṣṇāi Hājrā («Kalaviṅka», no book of Info).
// Notes corrected: #1675 Vidyāvācaspati — «Sumadhura» is the adjective (*sumadhurā*, «charming») of Tuṅgavidyā (GGD 170).
import fs from "node:fs";
const GGD = "Gaura-gaṇoddeśa-dīpikā";
const RKGD = "Rādhā-Kṛṣṇa-gaṇoddeśa-dīpikā";
const LIST_194 = `In verses 194–207 the ${GGD} names twenty-seven maidservants of Śrī Rādhā — «Mālatī, Candralatikā, Mañjumedhā, Varāṅgadā, Ratnāvalī, Kamalā, Guṇacūḍā, Sukeśinī, Karpūra-mañjarī, Śyāma-mañjarī, Śveta-mañjarī, Vilāsa-mañjarī, Kāmalekhā, Mauna-mañjarī, Gandhonmadā, Rasonmadā, Candrikā, Kalabhāṣiṇī, Gopālī, Hariṇī, Kālī, Kalākṣī, Nitya-mañjarī, Kalakaṇṭhī, Kuraṅgākṣī, Candrikā and Candraśekharā» — who «assuming male forms appeared among Lord Caitanya's associates», and then the devotees they became, *kramaśaḥ*, in the same order.`;
const plan = [
  {
    id: 1610,
    name: "Vallabhācārya",
    text: `## In Kṛṣṇa-līlā

**King Janaka** of Mithilā, the father of Sītā — as now he was the father of Lakṣmīpriyā, who was Jānakī (Sītā) and Rukmiṇī. Some say **Bhīṣmaka**, the king of Vidarbha, Rukmiṇī's father.

## ${GGD} 44

> purāsīj janako rājā mithilādhipatir mahān
> adhunā vallabhācāryo bhīṣmako 'pi ca sammataḥ

«The same person who was Mahārāja Janaka, the king of Mithilā, appeared during Lord Caitanya's pastimes as Vallabhācārya. Some people differ from this view, and say that Vallabhācārya was an incarnation of Mahārāja Bhīṣmaka.»

## ${GGD} 45

> śrī-jānakī rukmiṇī ca lakṣmī-nāmnī ca tat-sutā

«The same person who formerly appeared as Jānakī-devī and Rukmiṇī-devī appeared during Lord Caitanya's pastimes as Śrīmatī Lakṣmīpriyā, the daughter of Vallabhācārya.»

## Sources

${GGD} 44–45.
`,
  },
  {
    id: 1627,
    name: "Vanamālī dāsa (Kavirāja)",
    text: `## In Kṛṣṇa-līlā

**Citrā** (Sucitrā), the fourth of Śrī Rādhā's eight principal sakhīs, who combed and decorated Rādhā's hair.

## ${GGD} 161

> keśa-vinyāsam akarod rādhāṁ citrā vraje purā
> sedānīṁ kavirājaḥ śrī-vanamālī prabhoḥ priyaḥ

«Citrā-devī, who had formerly combed and decorated Śrīmatī Rādhārāṇī's hair in Vrajabhūmi, appeared as Śrī Vanamālī, who was very dear to Lord Caitanya Mahāprabhu.» (The verse calls him *kavirājaḥ*.)

## Citrā in the books

- **${RKGD}** (Bṛhad-bhāga 88–89):

> citrā caturthī kāśmīra-gaurī kāca-nibhāmbarā
> ṣaḍviṁśatyā kaniṣṭhāhnāṁ mādhavāmoda-medurā

«Of the variṣṭha sakhīs Citrā is the fourth one. Her complexion is golden like saffron and her attire resembles the colour of crystal. She is twenty-six days younger than Śrī Rādhikā. She always rejoices in the happiness of Śrī Kṛṣṇa. The name of Citrā's father is Catura, who is the paternal uncle of Sūryamitra (Vṛṣabhānu Mahārāja). Citrā's mother is named Carcikā and her husband is Pīṭhara.»

## Other opinions

- Another Vanamālī Kavirāja, a disciple of Śrīnivāsa Ācārya, has his own record; the verse speaks of a devotee «dear to the Lord» — this one (Whisper, 15-11-2026).

## Sources

${GGD} 161; ${RKGD}, Bṛhad-bhāga 88–89.
`,
    replace: [[" In his past incarnation he was Citra (GGD. 131.", ""]],
  },
  {
    id: 1629,
    name: "Vanamālī Kavirāja",
    replace: [["In Kṛṣṇa-līlā: Citrā (Gaura-gaṇoddeśa-dīpikā 161).", "The Citrā of the Gaura-gaṇoddeśa-dīpikā (161), «Kavirāja Śrī Vanamālī, very dear to the Lord», is Vanamālī dāsa (Kavirāja) of Advaita's branch, who has his own record (Whisper, 15-11-2026)."]],
  },
  {
    id: 1635,
    name: "Vangavati Caitanyadāsa",
    text: `## In Kṛṣṇa-līlā

**Kālī**, one of Śrī Rādhā's maidservants.

## ${GGD} 194–207

> gopālī hariṇī kālī kalākṣī nitya-mañjarī
> …
> hastigopāla-nāmā ca raṅga-vāsī ca vallabhaḥ

${LIST_194} Read with «Hastigopāla» and «Raṅgavāsī Vallabha» as two devotees, Kālī, the twenty-first maidservant, is the twenty-first devotee: «Raṅgavāsī Vallabha» — which Haridāsa dāsa holds to be this name, «Vaṅgavāṭī Caitanyadāsa», copied wrongly.

## Sources

${GGD} 194–207; Śākhā-nirṇayāmṛta 27.
`,
    replace: [[" He was Kali in his past  incarnation. (GGD. 196, 206, CC. 1.12.85, Sakhanirnayamrta 27)", " (CC. 1.12.85, Sakhanirnayamrta 27)"]],
  },
  {
    id: 1638,
    name: "Vāṇīnātha Vipra (Dvija Vāṇīnātha) of Cāṁpāhāṭi",
    text: `## In Kṛṣṇa-līlā

**Kāmalekhā**, one of Śrī Rādhā's maidservants.

## ${GGD} 194–207

> vilāsa-mañjarī kāmalekhā ca mauna-mañjarī
> …
> vāṇīnātha-dvijaś campā-haṭṭa-vāsī prabhoḥ priyaḥ

${LIST_194} So Kāmalekhā, the thirteenth maidservant, is the thirteenth devotee: «Vāṇīnātha Dvija, who lived in the village of Campāhaṭṭa, and who was very dear to Lord Caitanya».

## Sources

${GGD} 194–207; Nāmāmṛta-samudra 98.
`,
    replace: [[" In Kṛṣṇa-līlā: Kamalekhā (Gaura-gaṇoddeśa-dīpikā 195, 204; Nāmāmṛta-samudra 98).", ""]],
  },
  {
    id: 1652,
    name: "Vāsudeva Datta",
    text: `## In Kṛṣṇa-līlā

**Madhuvrata**, a singer of Vraja; his brother Mukunda Datta was Madhukaṇṭha.

## ${GGD} 140

> vraje sthitau gāyakau yau madhukaṇṭha-madhuvratau
> mukunda-vāsudevau tau dattau gaurāṅga-gāyakau

«Madhukaṇṭha and Madhuvrata, who were singers in Vrajabhūmi, later appeared as Mukunda Datta and Vāsudeva Datta, two famous singers in Lord Caitanya's kīrtana party.»

## Madhuvrata in the books

- **${RKGD}** (Laghu-bhāga 73–74): Madhukaṇṭha and **Madhuvrata** are among Kṛṣṇa's *ceṭas* — «Bhaṅgura, Bhṛṅgāra, Sāndhika, Grahila, Raktaka, Patraka, Patrī, Madhukaṇṭha, **Madhuvrata**…», who carry His flute, horn and stick.

## Sources

${GGD} 140; ${RKGD}, Laghu-bhāga 73–74.
`,
    remove: ["In Kṛṣṇa-līlā: Madhuvrata, a singer of Vraja (Gaura-gaṇoddeśa-dīpikā 140)."],
  },
  {
    id: 1654,
    name: "Śrī Vāsudeva Ghoṣa",
    text: `## In Kṛṣṇa-līlā

**Guṇatuṅgā**, a gopī who sang the songs composed by Viśākhā; his brothers Govinda and Mādhava were Kalāvatī and Rasollāsā.

## ${GGD} 188

> kalāvatī rasollāsā guṇatuṅgā vraje sthitāḥ
> śrī-viśākhā-kṛtaṁ gītaṁ gāyanti smādya tā matāḥ
> govinda-mādhavānanda-vāsudevā yathā-kramam

«The vraja-gopīs Kalāvatī-devī, Rasollāsā-devī and Guṇatuṅgā-devī, who sang the songs composed by Viśākhā-devī, later appeared as Govinda, Mādhavānanda and Vāsudeva respectively.»

## Guṇatuṅgā in the books

- **${RKGD}** (Laghu-bhāga 191): «Rasollāsā, **Guṇatuṅgā**, Smaroddhurā, Kalākaṇṭhī, Sukaṇṭhī and Pikakaṇṭhī are experts in singing, playing musical instruments and other similar arts. They are therefore Śrī Rādhā's gandharva-sakhīs — Her musicians», who sing the songs composed by Viśākhā.

## Sources

${GGD} 188; ${RKGD}, Laghu-bhāga 191.
`,
    remove: ["In Kṛṣṇa-līlā: Guṇatuṅgā, who sang Viśākhā's songs (Gaura-gaṇoddeśa-dīpikā 188)."],
  },
  {
    id: 1659,
    name: "Vāsudeva Tīrtha",
    text: `## In Kṛṣṇa-līlā

One of the nine **Jāyanteyas** (the nine Yogendras, sons of Ṛṣabha), who spoke the Bhāgavata teachings to King Janaka (Nimi) and appeared as nine sannyāsīs around Lord Caitanya.

## ${GGD} 98–101

> jāyanteyāḥ sthitā ūrdhva-retasaḥ sama-darśinaḥ
> nava bhāgavatāḥ pūrvaṁ śrī-bhāgavata-saṁhitām
> …
> garuḍākhyāvadhūtaś ca śrī-gopendrākhya āśramaḥ

«The nine Jāyanteyas, who were fixed in celibacy and equal vision, and who spoke the Śrī Bhāgavata-saṁhitā to Janaka Ṛṣi, appeared on this earth as nine sannyāsīs, and continually performed pastimes with Lord Caitanya. Their names were: Śrī Nṛsiṁhānanda Tīrtha, Śrī Satyānanda Bhāratī, Śrī Nṛsiṁha Tīrtha, Śrī Cidānanda Tīrtha, Śrī Jagannātha Tīrtha, **Śrī Vāsudeva Tīrtha**, Śrī Rāma Tīrtha, Śrī Puruṣottama Tīrtha, and Śrī Garuḍa Avadhūta, who was also known as Śrī Gopendra Āśrama.» The verse does not say which Jāyanteya each one was.

## Sources

${GGD} 98–101.
`,
    replace: [[" In his past incarnation he was one of the nine Yogindras (GGD. 98-101, Namamrtasamudra 164,", " (Namamrtasamudra 164,"]],
  },
  {
    id: 1660,
    name: "Vasudhā",
    text: `## In Kṛṣṇa-līlā

**Vāruṇī**, Lord Balarāma's wife (her sister Jāhnavā was Revatī); and **Anaṅga-mañjarī**, Śrī Rādhā's younger sister.

## ${GGD} 65

> śrī-vāruṇī-revatī-vaṁśa-sambhave tasya priye dve vasudhā ca jāhnavī
> śrī-sūryadāsasya mahātmanaḥ sute kakudmi-rūpasya ca sūrya-tejasaḥ

«Lord Balarāma's two wives, Śrīmatī Vāruṇī-devī and Śrīmatī Revatī-devī, appeared during Lord Caitanya's pastimes as Śrīmatī Vasudhā-devī and Śrīmatī Jāhnavī-devī, the two dear wives of Lord Nityānanda, and the daughters of the great personality Śrī Sūryadāsa.»

## ${GGD} 66

> …
> anaṅga-mañjarīṁ kecij jāhnavīṁ ca pracakṣate
> ubhayaṁ tu samīcīnaṁ pūrva-nyāyāt satāṁ matam

«Some say that Śrīmatī Vasudhā-devī is the incarnation of Śrīmatī Anaṅga-mañjarī, and others say that Śrīmatī Jāhnavī-devī is the incarnation of Śrīmatī Anaṅga-mañjarī. In truth, both opinions are correct. They are both incarnations of Śrīmatī Anaṅga-mañjarī.»

## Anaṅga-mañjarī in the books

- **${RKGD}** (Bṛhad-bhāga 121–122): «Anaṅga Mañjarī, Śrī Rādhā's younger sister, has an enchanting complexion resembling a spring ketakī flower and she wears clothes resembling a blue lotus… Her husband is the proud and arrogant Durmada, the younger brother of Śrī Rādhā's husband. Anaṅga Mañjarī is extremely dear to Lalitā-devī and especially to Viśākhā.»

## Sources

${GGD} 65–66; ${RKGD}, Bṛhad-bhāga 121–122.
`,
    remove: ["In Kṛṣṇa-līlā: Vāruṇī, Balarāma's consort; some say Anaṅga-mañjarī (Gaura-gaṇoddeśa-dīpikā 65-66)."],
  },
  {
    id: 1675,
    name: "Vidyāvācaspati",
    text: `## In Kṛṣṇa-līlā

**Tuṅgavidyā**, the fifth of Śrī Rādhā's eight principal sakhīs.

## ${GGD} 170

> vraje yāsīt sumadhurā tuṅgavidyā priyā purā
> vidyāvācaspatir gaura-priyo vraja-jana-priyaḥ

«The charming (*sumadhurā*) vraja-gopī named Tuṅgavidyā appeared as Vidyāvācaspati, who was dear to both Lord Caitanya and the residents of Vṛndāvana.»

## Tuṅgavidyā in the books

- **${RKGD}** (Bṛhad-bhāga 90–91): «Tuṅgavidyā is the fifth of the variṣṭha sakhīs. She is five days older than Śrī Rādhikā. Her body emanates a fragrance of sandalwood mixed with camphor (candra-candana), and her complexion resembles kuṅkuma.» Her clothes are light yellow; her mother is Medhā, her father Puṣkara and her husband Bāliśa.

## Other opinions

- The record said «Sumadhura»: in the verse *sumadhurā*, «charming», describes Tuṅgavidyā.
- The ${GGD} (163) also gives Tuṅgavidyā to **Prabodhānanda Sarasvatī**.

## Sources

${GGD} 163, 170; ${RKGD}, Bṛhad-bhāga 90–91.
`,
    replace: [["; past incarnation as Sumadhura.", "."]],
  },
  {
    id: 1680,
    name: "Vijaya Dāsa Ākhariyā",
    text: `## In Kṛṣṇa-līlā

One of the **nine treasures (*nidhis*) of Kuvera** — the Lord called him **Ratnabāhu**, and the ${GGD} names «the learned brāhmaṇa Ratnabāhu» among them; «Kunda-nidhi», according to the record.

## ${GGD} 102–103

> loke ye nidhayaḥ khyātāḥ padma-śaṅkhādayo nava
> …
> vidyānidhir guṇanidhī ratnabāhur dvijāgraṇīḥ

«Kuvera's famous nine treasures, which include his conch and lotus, took birth during Lord Caitanya's pastimes as the nine sons of Nidhiratna-devī. They were all very dear to the Lord. Their names were Śrīnidhi, Śrīgarbha, Kaviratna, Sudhānidhi, Vidyānidhi, Guṇanidhi, the learned brāhmaṇa **Ratnabāhu**, Śrīmān Ācāryaratna, and Śrī Ratnākara Paṇḍita.» The verse does not say which treasure each one is.

## Sources

${GGD} 102–103.
`,
    replace: [[" In his past incarnation  Vijayadasa was Kundanidhi (GGD. 103).", ""]],
  },
  {
    id: 1715,
    name: "Śrīmatī Viṣṇupriyā Devī",
    text: `## In Kṛṣṇa-līlā

The Lord's **Bhū-śakti**, the earth goddess, «the mother of the entire universe» — the daughter of Sanātana Miśra, who had been King Satrājit (Satyabhāmā's father).

## ${GGD} 47

> śrī-sanātana-miśro 'yaṁ purā satrājin nṛpaḥ
> viṣṇupriyā jagan-mātā yat-kanyā bhū-svarūpiṇī

«The same person who formerly appeared as King Satrājit appeared in Lord Caitanya's pastimes as Sanātana Miśra. Sanātana Miśra's daughter was named Śrīmatī Viṣṇupriyā, and she was the incarnation of the Lord's Bhū-śakti, who is the mother of the entire universe.»

## ${GGD} 48

«That Śrīmatī Viṣṇupriyā is an incarnation of Bhū-devī is described in the Śrī Caitanya-candrodaya-nāṭaka, where Kali says: "Understanding that Śrīmatī Viṣṇupriyā was the incarnation of Bhū-devī, Lord Caitanya accepted her hand in marriage."»

## Other opinions

- The record said also **Satyabhāmā** (as Satrājit's daughter); the verse says Bhū-śakti. (The ${GGD}, 51, makes Jagadānanda Paṇḍita a manifestation of Satyabhāmā.)

## Sources

${GGD} 47–48, 51.
`,
    replace: [["Past life: Bhusakti, Satyabhāmā; ", ""]],
    remove: ["In Kṛṣṇa-līlā: the Lord's Bhū-śakti; Satrājit's daughter (Satyabhāmā) (Gaura-gaṇoddeśa-dīpikā 47-48)."],
  },
  {
    id: 1725,
    name: "Viśvarūpa",
    text: `## In Kṛṣṇa-līlā

**Lord Saṅkarṣaṇa** (Baladeva), the second member of the Catur-vyūha — as the Lord is Vāsudeva, the first.

## ${GGD} 58

> aṁśāṁśinor abhedena vyūha ādyaḥ śacī-sutaḥ
> baladevo viśvarūpo vyūhaḥ saṅkarṣaṇo mataḥ

«The original form of the Supreme Lord is considered not different from the Lord's direct expansions. For this reason it is considered that Lord Caitanya Mahāprabhu, the son of Śrīmatī Śacī-devī, is non-different from His expansion Lord Vāsudeva, the first member of the Catur-vyūha. In the same way Śrī Viśvarūpa is considered non-different from the incarnation Lord Saṅkarṣaṇa, the second member of the Catur-vyūha.»

## ${GGD} 59–60

«Lord Nityānanda Avadhūta is also said to be non-different from Lord Saṅkarṣaṇa. That Śrī Viśvarūpa is identical with Lord Saṅkarṣaṇa is described in the Śrī Caitanya-candrodaya-nāṭaka, where Kali says to Dharma:»

> asyāgrajas tv akṛta-dāra-parigrahaḥ san
> saṅkarṣaṇaḥ sa bhagavān bhuvi viśvarūpaḥ

«"Lord Caitanya's elder brother Viśvarūpa is identical with the Personality of Godhead Lord Saṅkarṣaṇa. Viśvarūpa never married, but accepted the order of parivrājakācārya-sannyāsa and left home. It was the transcendental glory of Śrī Viśvarūpa that caused Lord Caitanya to accept spiritual initiation from Īśvara Purī."» (60)

## Balarāma in the books

- **${RKGD}** (Laghu-bhāga 66):

> śubhraḥ sphaṭika-varṇāḍhyo balarāmo mahābalaḥ
> nīla-vastra-paridhāno vana-mālā-virājitaḥ

«Śrī Balarāma's complexion is whitish like that of crystal or camphor. His name is Balarāma because He is extremely strong [bala means strength]. He wears blue garments and is decorated with many kinds of garlands made of forest flowers.»

## Sources

${GGD} 58–60; ${RKGD}, Laghu-bhāga 66.
`,
    replace: [["; Baladeva / Saṅkarṣaṇa in Kṛṣṇa-līlā (GGD 58-60; VV. of Jīva", " (VV. of Jīva"]],
  },
  {
    id: 1728,
    name: "Viśveśvara Ācārya (Viśveśvarānanda Ācārya)",
    text: `## In Kṛṣṇa-līlā

**Divākara**, the sun-god — so the Lord Himself said.

## ${GGD} 113

> ataś caitanya-hariṇā kathito 'yaṁ niśāpatiḥ
> śrīmad-viśveśvarācāryo yaḥ prāg āsīd divākaraḥ

«Lord Caitanya personally affirmed that Candraśekhara Ācārya was an incarnation of the moon-god, and in the same way the Lord expressly said that Śrīmān Viśveśvara Ācārya was an incarnation of the sun-god.»

## Sources

${GGD} 113.
`,
    replace: [[" Divākara (the sun-god) in Kṛṣṇa-līlā (GGD 113).", ""]],
  },
  {
    id: 1740,
    name: "Śrīla Vṛndāvana dāsa Ṭhākura",
    text: `## In Kṛṣṇa-līlā

**Vedavyāsa**, the compiler of the Vedas and author of the Bhāgavatam — as now he wrote the Caitanya-bhāgavata; the cowherd **Kusumāpīḍa** also entered him.

## ${GGD} 109

> veda-vyāso ya evāsīd dāso vṛndāvano 'dhunā
> sakhā yaḥ kusumāpīḍaḥ kāryatas taṁ samāviśat

«Vedavyāsa appeared in Lord Caitanya's pastimes as Vṛndāvana dāsa Ṭhākura. Lord Kṛṣṇa's cowherd friend Kusumāpīḍa also entered the body of Vṛndāvana dāsa Ṭhākura.»

## Kusumāpīḍa in the books

- **${RKGD}** (Laghu-bhāga 29–30): «Viśāla, Vṛṣabha, Ojasvī, Devaprastha, Varūthapa, Mandāra, **Kusumāpīḍa**, Maṇibandha, Karandhama… and other sakhās are younger than Śrī Kṛṣṇa. They are very enthusiastic in serving Him.»

## Sources

${GGD} 109; ${RKGD}, Laghu-bhāga 29–30.
`,
    remove: ["In Kṛṣṇa-līlā: Vedavyāsa; the cowherd Kusumāpīḍa also entered him (Gaura-gaṇoddeśa-dīpikā 109)."],
  },
];
fs.writeFileSync(new URL("./tanda13.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length + " fichas");
