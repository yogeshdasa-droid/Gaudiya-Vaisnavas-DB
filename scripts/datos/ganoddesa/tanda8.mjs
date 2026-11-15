// node tanda8.mjs → tanda8.json (Gaṇoddeśa, tanda 8). The books of Info take precedence.
// Left out (like #558: no book of Info says it): #1006 Nārāyaṇī Dāsī («Kilimbikā», Jayānanda — the GGD 43 gives
// Kilimbikā to Nārāyaṇī Devī #1007), #1010 Narottama dāsa Ṭhākura («Campaka-mañjarī»); no identity: #1030.
// (#936 Mukunda Ojhā was joined to #439 Hāḍāi Paṇḍita: ../unir-mukunda-ojha.json, Whisper 15-11-2026.)
import fs from "node:fs";
const GGD = "Gaura-gaṇoddeśa-dīpikā";
const RKGD = "Rādhā-Kṛṣṇa-gaṇoddeśa-dīpikā";
const LIST_194 = `In verses 194–207 the ${GGD} names twenty-seven maidservants of Śrī Rādhā — «Mālatī, Candralatikā, Mañjumedhā, Varāṅgadā, Ratnāvalī, Kamalā, Guṇacūḍā, Sukeśinī, Karpūra-mañjarī, Śyāma-mañjarī, Śveta-mañjarī, Vilāsa-mañjarī, Kāmalekhā, Mauna-mañjarī, Gandhonmadā, Rasonmadā, Candrikā, Kalabhāṣiṇī, Gopālī, Hariṇī, Kālī, Kalākṣī, Nitya-mañjarī, Kalakaṇṭhī, Kuraṅgākṣī, Candrikā and Candraśekharā» — who «assuming male forms appeared among Lord Caitanya's associates», and then the devotees they became, *kramaśaḥ*, in the same order.`;
const JAYANTEYA = (who) => `## In Kṛṣṇa-līlā

One of the nine **Jāyanteyas** (the nine Yogendras, sons of Ṛṣabha), who spoke the Bhāgavata teachings to King Janaka (Nimi) and appeared as nine sannyāsīs around Lord Caitanya.

## ${GGD} 98–101

> jāyanteyāḥ sthitā ūrdhva-retasaḥ sama-darśinaḥ
> nava bhāgavatāḥ pūrvaṁ śrī-bhāgavata-saṁhitām
> …
> garuḍākhyāvadhūtaś ca śrī-gopendrākhya āśramaḥ

«The nine Jāyanteyas, who were fixed in celibacy and equal vision, and who spoke the Śrī Bhāgavata-saṁhitā to Janaka Ṛṣi, appeared on this earth as nine sannyāsīs, and continually performed pastimes with Lord Caitanya. Their names were: Śrī Nṛsiṁhānanda Tīrtha, Śrī Satyānanda Bhāratī, Śrī Nṛsiṁha Tīrtha, Śrī Cidānanda Tīrtha, Śrī Jagannātha Tīrtha, Śrī Vāsudeva Tīrtha, Śrī Rāma Tīrtha, Śrī Puruṣottama Tīrtha, and Śrī Garuḍa Avadhūta, who was also known as Śrī Gopendra Āśrama.» ${who} The verse does not say which Jāyanteya each one was.`;
const V54 = `## ${GGD} 54–57

> vṛṣabhānutayā khyātaḥ purā yo vraja-maṇḍale
> adhunā puṇḍarīkākṣa-vidyānidhi-mahāśayaḥ

«The same person who was formerly known as Mahārāja Vṛṣabhānu in the district of Vraja, appeared in Lord Caitanya's pastimes as the great personality Puṇḍarīka Vidyānidhi.» (54) «When He was afflicted by the feelings of Śrīmatī Rādhārāṇī's intense love in separation from Lord Kṛṣṇa, Lord Caitanya would address Puṇḍarīka Vidyānidhi using the word "father".» (55) «Lord Caitanya was very pleased with Puṇḍarīka Vidyānidhi, and the Lord would address him by the name Premanidhi. Because Puṇḍarīka Vidyānidhi was a direct disciple of Mādhavendra Purī, the Lord would treat him with great respect, as if he were the Lord's own spiritual master.» (56)

> tat-prakāśa-viśeṣo 'pi miśraḥ śrī-mādhavo mataḥ
> ratnāvatī tu tat-patnī kīrtidā kīrtitā budhaiḥ

«Mahārāja Vṛṣabhānu also appeared as Śrī Mādhava Miśra. Ratnāvatī-devī … is considered by the learned devotees to be the incarnation of Kīrtidā-devī, the wife of Mahārāja Vṛṣabhānu.» (57)`;
const plan = [
  {
    id: 1007,
    name: "Nārāyaṇī Devī",
    text: `## In Kṛṣṇa-līlā

**Kilimbikā**, the sister of Ambikā and one of Kṛṣṇa's wet nurses, who ate Kṛṣṇa's remnants — as now she ate the Lord's.

## ${GGD} 43

> ambikāyāḥ svasā yāsīn nāmnā śrīla-kilimbikā
> kṛṣṇocchiṣṭaṁ prabhuñjānā seyaṁ nārāyaṇī matā

«Kilimbikā-devī, who had been Ambikā's sister in Vraja, and who had been accustomed to eating the remnants of foodstuff eaten by Lord Kṛṣṇa, appeared during Lord Caitanya's pastimes as Nārāyaṇī-devī.» (Ambikā is Mālinī, Śrīvāsa's wife, verse 42.)

## Kilimbā in the books

- **${RKGD}** (Bṛhad-bhāga 64):

> ambikā ca kilimbā ca dhātṛke stanya-dāyike
> ambikeyaṁ tayor mukhyā vrajeśvaryāḥ priyā sakhī

«Ambikā and Kilimbā are Śrī Kṛṣṇa's wet nurses, and they breast-feed Him. Ambikā, who is a dear friend to Vrajeśvarī (Śrī Yaśodā), is senior to Kilimbā.»

## Other opinions

- Jayānanda's Caitanya-maṅgala gives Kilimbikā to **Nārāyaṇī Dāsī**, the Lord's nurse (her own record).

## Sources

${GGD} 42–43; ${RKGD}, Bṛhad-bhāga 64; Gauḍīya Vaiṣṇava Abhidhāna.
`,
    remove: ["In Kṛṣṇa-līlā: Kilimbikā, Ambikā's sister, who ate Kṛṣṇa's remnants (Gaura-gaṇoddeśa-dīpikā 43; Gauḍīya Vaiṣṇava Abhidhāna)."],
  },
  {
    id: 1028,
    name: "Nayanānanda Miśra (Gadādhara's nephew)",
    text: `## In Kṛṣṇa-līlā

**Nitya-mañjarī**, one of Śrī Rādhā's maidservants.

## ${GGD} 194–207

> gopālī hariṇī kālī kalākṣī nitya-mañjarī
> …
> hary-ācāryo gaura-saṅgī miśraḥ śrī-nayanas tathā

${LIST_194} Read with «Hastigopāla, and Vallabha who lived at Raṅga» as two devotees, Śrīnayana Miśra, «a close associate of Lord Caitanya», is the twenty-third, like Nitya-mañjarī (the English translation joins those two names, and then he would be Kalākṣī, the twenty-second).

## Sources

${GGD} 194–207; Śākhā-nirṇayāmṛta 10.
`,
    replace: [["\n\nIn Kṛṣṇa-līlā: Nitya-mañjarī (Gaura-gaṇoddeśa-dīpikā 196, 207; Śākhā-nirṇayāmṛta 10).", ""]],
  },
  {
    id: 1032,
    name: "Nīlāmbara Cakravartī",
    text: `## In Kṛṣṇa-līlā

**Garga Muni**, the astrologer of the Yadus, who named Kṛṣṇa — as now he cast the Lord's horoscope; and **Sumukha**, the cowherd, father of Yaśodā and Kṛṣṇa's grandfather, as now he was the father of Śacī.

## ${GGD} 104

> nīlāmbaraś cakravartī gaurasya bhāvi-janma yat
> sabhāyāṁ kathayām āsa tenāsau garga ucyate

«Before the assembled relatives and friends, Nīlāmbara Cakravartī spoke the astrological prediction of Lord Caitanya's future life. For this reason it is said that Nīlāmbara Cakravartī is the incarnation of Garga Muni.»

## ${GGD} 105

> śrī-śacyā janakatvena sumukho ballavo mataḥ
> …

«Śrīmatī Śacī-devī's father had formerly been the cowherd Sumukha, who was Yaśodā-devī's father. Śacī-devī's mother had formerly been Pāṭalā-devī, the wife of Sumukha in Vrajabhūmi.»

## Sumukha in the books

- **${RKGD}** (Bṛhad-bhāga 42–43):

> mātāmaho mahotsāhaḥ syād asya sumukhābhidhaḥ
> lamba-kambu samaśmaśruḥ pakva-jambū-phalacchaviḥ

«Śrī Kṛṣṇa's maternal grandfather is called Sumukha. He is energetic and enthusiastic by nature. His long beard is white like a conch shell and his bodily complexion resembles [the purple colour of] a ripe jāmun fruit.» His wife Pāṭalā is «well-known as the Queen of Vraja» (43).

## Sources

${GGD} 104–105; ${RKGD}, Bṛhad-bhāga 42–43.
`,
    remove: ["In Kṛṣṇa-līlā: Garga Muni and Sumukha Gopa (Gaura-gaṇoddeśa-dīpikā 104–105)."],
  },
  {
    id: 1052,
    name: "Nṛsiṁha Cidānanda Tīrtha",
    text: `${JAYANTEYA("The verse names **Śrī Nṛsiṁha Tīrtha** and **Śrī Cidānanda Tīrtha** («śrī-nṛsiṁha-cidānanda-…»); this record joins the two names — Nṛsiṁha Tīrtha has his own record.")}

## Sources

${GGD} 98–101.
`,
    replace: [["He was Jayanteya in his past incarnation.", ""]],
  },
  {
    id: 1057,
    name: "Nṛsiṁha Tīrtha",
    text: `${JAYANTEYA("")}

## Sources

${GGD} 98–101; Gauḍīya Vaiṣṇava Abhidhāna.
`,
    replace: [[" In Kṛṣṇa-līlā: one of the nine yogīndras, Jayanteya (Gaura-gaṇoddeśa-dīpikā 98-100; Gauḍīya Vaiṣṇava Abhidhāna).", ""]],
  },
  {
    id: 1066,
    name: "Padmāvatī Devī",
    text: `## In Kṛṣṇa-līlā

**Rohiṇī**, the mother of Balarāma — as now she was the mother of Nityānanda; **Sumitrā** of Rāma-līlā is also in her.

## ${GGD} 40

> rohiṇī-vasudevau yau pitarau rāma-kṛṣṇayoḥ
> padmāvatī-mukundau tau santau jātau dvijottamau
> śrī-sumitrā-daśarathau tāv apy āviśatām amū

«Rohiṇī and Vasudeva, the parents of Balarāma and Kṛṣṇa, appeared during Lord Caitanya's advent as the exalted brāhmaṇa couple Padmāvatī and Mukunda. Sumitrā and Daśaratha were also present in the bodies of Padmāvatī and Mukunda.» (Mukunda is Hāḍāi Ojhā.)

## Rohiṇī in the books

- **${RKGD}** (Bṛhad-bhāga 32):

> rohiṇī bṛhad-ambāsya praharṣārohiṇī sadā
> snehaṁ yā kurute rāma-snehāt koṭi-guṇaṁ harau

«Śrī Rohiṇī-devī is known as the elder mother of Śrī Kṛṣṇa. She is an embodiment of ever-increasing joy. She even feels millions of times greater affection for Śrī Kṛṣṇa than for Śrī Balarāma.»

## Sources

${GGD} 40; ${RKGD}, Bṛhad-bhāga 32.
`,
    remove: ["In Kṛṣṇa-līlā: Rohiṇī, Balarāma's mother; in Rāma-līlā Sumitrā (Gaura-gaṇoddeśa-dīpikā 40)."],
  },
  {
    id: 1070,
    name: "Paramānanda Gupta",
    text: `## In Kṛṣṇa-līlā

**Mañjumedhā**, one of Śrī Rādhā's maidservants.

## ${GGD} 194–207

> mālatī candralatikā mañjumedhā varāṅgadā
> …
> paramānanda-gupto yat-kṛtā kṛṣṇa-stavāvalī

${LIST_194} So Mañjumedhā, the third maidservant, is the third devotee: «Paramānanda Gupta, who wrote the book Śrī Kṛṣṇa-stavāvalī».

## Mañjumedhā in the books

- **${RKGD}** (Bṛhad-bhāga 246): the first of the eight prominent sakhīs under **Tuṅgavidyā** — «**Mañjumedhā**, Sumadhurā, Sumadhyā, Madhurekṣaṇā, Tanumadhyā, Madhuspandā, Guṇacūḍā and Varāṅgadā».

## Sources

${GGD} 194–207; ${RKGD}, Bṛhad-bhāga 246.
`,
    replace: [[" and was Manjumedha in Kṛṣṇa līlā  (Gaura-gaṇoddeśa-dīpikā 193, 199).", "."]],
  },
  {
    id: 1075,
    name: "Paramānanda Purī",
    text: `## In Kṛṣṇa-līlā

**Uddhava**, Kṛṣṇa's friend and counsellor, whom He sent to the gopīs of Vraja.

## ${GGD} 118

> purī śrī-paramānando ya āsīd uddhavaḥ purā
> …

«Śrī Paramānanda Purī had formerly been Uddhava.» (The same verse: «Mahārāja Pratāparudra, who was as powerful as Lord Indra, had formerly been Mahārāja Indradyumna, who began the worship of Lord Jagannātha.»)

## Sources

${GGD} 118.
`,
    remove: ["In Kṛṣṇa-līlā: Uddhava (Gaura-gaṇoddeśa-dīpikā 118)."],
  },
  {
    id: 1080,
    name: "Parameśvara Dāsa Ṭhākura",
    text: `## In Kṛṣṇa-līlā

**Arjuna**, one of Kṛṣṇa's cowherd friends — a *priya-narma-sakhā*, the most intimate kind.

## ${GGD} 132

> nāmnārjunaḥ sakhā prāg yo dāsaḥ śrī-parameśvaraḥ
> kālaḥ śrī-kṛṣṇadāsaḥ sa yo lavaṅgaḥ sakhā vraje

«Lord Kṛṣṇa's cowherd friend Arjuna appeared as Śrī Parameśvara dāsa in Lord Caitanya's pastimes. Lavaṅga, who had been Lord Kṛṣṇa's cowherd friend in Vrajabhūmi, appeared in Lord Caitanya's pastimes as Śrī Kāla Kṛṣṇadāsa.»

## Arjuna in the books

- **${RKGD}** (Laghu-bhāga 41):

> subalārjuna-gandharva-vasantojjvala-kokilāḥ
> sanandana-vidagdhādyāḥ priya-narma-sakhā matāḥ

«Subala, Arjuna, Gandharva, Vasanta, Ujjvala, Kokila, Sanandana, Vidagdha and other sakhās are famous as priya-narma-sakhās.»

## Sources

${GGD} 132; ${RKGD}, Laghu-bhāga 41.
`,
    remove: ["In Kṛṣṇa-līlā: Arjuna, Kṛṣṇa's cowherd friend (Gaura-gaṇoddeśa-dīpikā 132)."],
  },
  {
    id: 1090,
    name: "Pītāmbara",
    text: `## In Kṛṣṇa-līlā

**Kāverī**, a gopī of Vraja.

## ${GGD} 168

> gaurasenī purā nārāyaṇa-vācaspatiḥ kṛtī
> pītāmbaras tu kāverī sukeśī makaradhvajaḥ

«Gaurasenī-gopī appeared as the saintly devotee Nārāyaṇa Vācaspati. Kāverī-gopī appeared as Pītāmbara, and Sukeśī-gopī appeared as Makaradhvaja.»

## Kāverī in the books

- **${RKGD}** (Bṛhad-bhāga 202): **Kāverīmukhā** and other sakhīs serve under **Sudevī**, who teaches them to make spittoons of leaves and pillows and cushions of flowers.

## Sources

${GGD} 168; ${RKGD}, Bṛhad-bhāga 202.
`,
    replace: [[" In his past incarnation he was Kaveri.(Gaura-gaṇoddeśa-dīpikā. 168, Caitanya Caritāmṛta 1.11.52)", " (Caitanya Caritāmṛta 1.11.52)"]],
  },
  {
    id: 1095,
    name: "Śrīpad Prabodhānanda Sarasvatī",
    text: `## In Kṛṣṇa-līlā

**Tuṅgavidyā**, the fifth of Śrī Rādhā's eight principal sakhīs, learned in all the scriptures.

## ${GGD} 163

> tuṅgavidyā vraje yāsīt sarva-śāstra-viśāradā
> sā prabodhānanda-yatir gaurodgāna-sarasvatī

«Tuṅgavidyā-gopī, who lived in Vrajabhūmi and was learned in all the scriptures, appeared later as Prabodhānanda Sarasvatī, the poet who eloquently glorified the transcendental qualities of Lord Caitanya.»

## Tuṅgavidyā in the books

- **${RKGD}** (Bṛhad-bhāga 90–91):

> pañcamī tuṅgavidyā syāj jyāyasī pañcabhir dinaiḥ
> candra-candana-bhūyiṣṭhā kuṅkuma-dyuti-śālinī

«Tuṅgavidyā is the fifth of the variṣṭha sakhīs. She is five days older than Śrī Rādhikā. Her body emanates a fragrance of sandalwood mixed with camphor (candra-candana), and her complexion resembles kuṅkuma.» Her clothes are light yellow; her mother is Medhā, her father Puṣkara and her husband Bāliśa (91).

## Other opinions

- The ${GGD} (170) also gives Tuṅgavidyā to **Vidyāvācaspati**; some give her to Gopāla Guru Gosvāmī.

## Sources

${GGD} 163, 170; ${RKGD}, Bṛhad-bhāga 90–91.
`,
    remove: ["In Kṛṣṇa-līlā: Tuṅgavidyā (Gaura-gaṇoddeśa-dīpikā 163)."],
  },
  {
    id: 1099,
    name: "Pradyumna Miśra",
    text: `## In Kṛṣṇa-līlā

Not a person of Vraja: **Lord Gaura** entered him (*āveśa*).

## ${GGD} 74

> āveśaś ca tathā jñeyo miśre pradyumna-saṁjñake
> …

«In the same way, a particle of Lord Caitanya also entered the body of Pradyumna Miśra.» (The same verse: «Bhagavān Ācārya Khañja is said to be a partial manifestation of Lord Gaura.»)

## Other opinions

- The verse says only «Pradyumna Miśra»: the Lord's cousin of the same name has his own record.

## Sources

${GGD} 74.
`,
    remove: ["In Kṛṣṇa-līlā: Lord Gaura entered him (āveśa) (Gaura-gaṇoddeśa-dīpikā 74)."],
  },
  {
    id: 1119,
    name: "Śrīla Puṇḍarīka Vidyānidhi",
    text: `## In Kṛṣṇa-līlā

**Vṛṣabhānu Mahārāja**, Śrī Rādhā's father — so the Lord, feeling as Rādhā, called him «father»; his wife Ratnāvatī was **Kīrtidā**, Rādhā's mother.

${V54}

## Vṛṣabhānu in the books

- **${RKGD}** (Laghu-bhāga 168b–170):

> vṛṣabhānuḥ pitā tasyā vṛṣabhānur ivojjvalaḥ
> ratnagarbhā kṣitau khyātā kīrttidā jananī bhavet

«Śrī Rādhā's father, Vṛṣabhānu Mahārāja, is the bhānu (sun) situated in the sign of vṛṣa (Taurus); which means that he is as radiant as the sun in one of the summer months. Śrī Rādhā's mother is Śrī Kīrttidā-sundarī. She is famous throughout the world as Ratnagarbhā.» Rādhā's paternal grandfather is Mahībhānu, her maternal grandfather Indu; Ratnabhānu, Subhānu and Bhānu are Vṛṣabhānu's brothers (169b–170).

## Other opinions

- Of «Ratnāvatī … his wife» (57) the English translation says Puṇḍarīka's wife; the verse can also be read as the wife of **Mādhava Miśra**, named just before — Gadādhara's mother, also Ratnāvatī.

## Sources

${GGD} 54–57; ${RKGD}, Laghu-bhāga 168b–170.
`,
    remove: ["In Kṛṣṇa-līlā: Vṛṣabhānu, Rādhā's father (Gaura-gaṇoddeśa-dīpikā 54-57)."],
  },
  {
    id: 1121,
    name: "Purandara Ācārya",
    text: `## In Kṛṣṇa-līlā

**Aṅgada**, the monkey prince, son of Vāli, in Rāma-līlā.

## ${GGD} 91

> murāri-gupto hanumān aṅgadaḥ śrī-purandaraḥ
> yaḥ śrī-sugrīva-nāmāsīd govindānanda eva saḥ

«The devotee named Murāri Gupta in Lord Caitanya's pastimes had previously been Hanumān. In the same way Śrī Purandara had previously been Aṅgada, and Govindānanda had been Sugrīva.»

## Sources

${GGD} 91.
`,
    remove: ["In Kṛṣṇa-līlā: Aṅgada (Gaura-gaṇoddeśa-dīpikā 91)."],
  },
];
fs.writeFileSync(new URL("./tanda8.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length + " fichas");
