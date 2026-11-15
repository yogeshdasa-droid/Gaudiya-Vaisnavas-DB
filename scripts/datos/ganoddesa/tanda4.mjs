// node tanda4.mjs → tanda4.json (Gaṇoddeśa, tanda 4). The books of Info take precedence.
// Left out: #386 Gopīnātha Pūjārī and #440 Halā Satavahana (no identity in the notes); #422 Govindānanda Ṭhākura
// («Indurekhā»: the GGD 164 gives Indulekhā to Kṛṣṇadāsa Brahmacārī — ask).
import fs from "node:fs";
const GGD = "Gaura-gaṇoddeśa-dīpikā";
const RKGD = "Rādhā-Kṛṣṇa-gaṇoddeśa-dīpikā";
const LIST_194 = `In verses 194–207 the ${GGD} names twenty-seven maidservants of Śrī Rādhā who «assuming male forms appeared among Lord Caitanya's associates», and then the devotees they became, *kramaśaḥ*, in the same order.`;
const plan = [
  {
    id: 344,
    name: "Śrī Gopāla Guru Gosvāmī",
    text: `## In Kṛṣṇa-līlā

**Tuṅgavidyā**, the fifth of Śrī Rādhā's eight sakhīs — according to some (the ${GGD} does not name him).

## Tuṅgavidyā in the books

- **${RKGD}** (Bṛhad-bhāga 90–91):

> pañcamī tuṅgavidyā syāj jyāyasī pañcabhir dinaiḥ
> candra-candana-bhūyiṣṭhā kuṅkuma-dyuti-śālinī

«Tuṅgavidyā is the fifth of the variṣṭha sakhīs. She is five days older than Śrī Rādhikā. Her body emanates a fragrance of sandalwood mixed with camphor (candra-candana), and her complexion resembles kuṅkuma.» Her clothes are light yellow; her mother is Medhā, her father Puṣkara and her husband Bāliśa (91).

## Other opinions

- The ${GGD} (170) gives Tuṅgavidyā to **Vidyāvācaspati**: *vraje yāsīt sumadhurā tuṅgavidyā priyā purā / vidyāvācaspatir gaura-priyo vraja-jana-priyaḥ* — «The charming vraja-gopī named Tuṅgavidyā appeared as Vidyāvācaspati, who was dear to both Lord Caitanya and the residents of Vṛndāvana.»

## Sources

${RKGD}, Bṛhad-bhāga 90–91; ${GGD} 170.
`,
    remove: ["In Kṛṣṇa-līlā: according to some, Tuṅgavidyā."],
  },
  {
    id: 363,
    name: "Gopāla Ṭhākura",
    text: `## In Kṛṣṇa-līlā

**Kokila**, one of Kṛṣṇa's priya-narma-sakhās; one of the twelve upagopālas — according to the record (the ${GGD} does not name him).

## Kokila in the books

- **${RKGD}** (Laghu-bhāga 41): among the priya-narma-sakhās — «Subala, Arjuna, Gandharva, Vasanta, Ujjvala, Kokila, Sanandana, Vidagdha…».
- **${RKGD}** (Laghu-bhāga 57–58):

> śubhra-kāntiḥ sulāvaṇyaḥ kokilaḥ paramojjvalaḥ
> nīla-vastra-paridhāno nānā-ratna-vibhūṣitaḥ

«The extremely radiant and charming Kokila has a bright whitish bodily complexion. He wears blue clothes and is ornamented by various types of jewels.» He is eleven years and four months old; his father is Puṣkara and his mother Medhā (58).

## Sources

${RKGD}, Laghu-bhāga 41, 57–58.
`,
    replace: [[", known by the name Kokila in his past incarnation.", "."]],
  },
  {
    id: 368,
    name: "Gopendra Āśrama",
    text: `## In Kṛṣṇa-līlā

One of the nine **Jāyanteyas** (the nine Yogendras, sons of Ṛṣabha), who spoke the Bhāgavata teachings to King Janaka (Nimi) and appeared as nine sannyāsīs around Lord Caitanya.

## ${GGD} 98–101

> jāyanteyāḥ sthitā ūrdhva-retasaḥ sama-darśinaḥ
> nava bhāgavatāḥ pūrvaṁ śrī-bhāgavata-saṁhitām
> …
> garuḍākhyāvadhūtaś ca śrī-gopendrākhya āśramaḥ

«The nine Jāyanteyas, who were fixed in celibacy and equal vision, and who spoke the Śrī Bhāgavata-saṁhitā to Janaka Ṛṣi, appeared on this earth as nine sannyāsīs, and continually performed pastimes with Lord Caitanya. Their names were: Śrī Nṛsiṁhānanda Tīrtha, Śrī Satyānanda Bhāratī, Śrī Nṛsiṁha Tīrtha, Śrī Cidānanda Tīrtha, Śrī Jagannātha Tīrtha, Śrī Vāsudeva Tīrtha, Śrī Rāma Tīrtha, Śrī Puruṣottama Tīrtha, and Śrī Garuḍa Avadhūta, who was also known as Śrī Gopendra Āśrama.»

## Other opinions

- The English translation takes «Gopendra Āśrama» as another name of **Garuḍa Avadhūta** (#302); the verse can also be read as naming him apart («Garuḍa Avadhūta and Śrī Gopendra Āśrama»), as this record does.

## Sources

${GGD} 98–101.
`,
  },
  {
    id: 383,
    name: "Gopīnātha Ācārya",
    text: `## In Kṛṣṇa-līlā

**Lord Brahmā**, the master of the universe; and **Ratnāvalī**, a dear friend (*prāṇa-sakhī*) of Śrī Rādhā.

## ${GGD} 75

> gopīnāthācārya-nāmnā brahmā jñeyo jagat-patiḥ
> nava-vyūhe tu gaṇito yas tantre tantra-vedibhiḥ

«Lord Brahmā, the master of the universe, who is considered one of the members of the Nava-vyūha and who is the original teacher of the Vedas and Tantras, appeared in Lord Caitanya's pastimes as Śrī Gopīnātha Ācārya.»

## ${GGD} 178

> purā prāṇa-sakhī yāsīn nāmnā ratnāvalī vraje
> gopīnāthākhyakācāryo nirmalatvena viśrutaḥ

«Śrīmatī Rādhārāṇī's dear friend, the vraja-gopī named Ratnāvalī-devī, appeared as Gopīnātha Ācārya, who was famous for his purity.»

## Ratnāvalī in the books

- **${RKGD}** (Laghu-bhāga 179–180):

> madonmadā madhumatī vāsantī kalabhāṣiṇī
> ratnāvalī maṇimatī karpūralatikādayaḥ

«Lāsikā, Kelīkandalī, Kādambarī, Śaśimukhī, Candrarekhā, Priyaṁvadā, Madonmadā, Madhumatī, Vāsantī, Kalabhāṣiṇī, Ratnāvalī, Maṇimatī, Karpūralatikā and others are Śrī Rādhā's jīvita-sakhīs» — the friends who are Her very life (*prāṇa-sakhīs*).

## Sources

${GGD} 75, 178; ${RKGD}, Laghu-bhāga 179–180.
`,
    replace: [
      ["In Kṛṣṇa-līlā: Brahmā; also the sakhī Ratnāvalī (v. 178) (Gaura-gaṇoddeśa-dīpikā 75, 178).\n", ""],
      [" He was Brahmā in his past incarnation.", ""],
    ],
  },
  {
    id: 413,
    name: "Govinda Ghoṣa",
    text: `## In Kṛṣṇa-līlā

**Kalāvatī**, a gopī who sang the songs composed by Viśākhā; his brothers Mādhava and Vāsudeva were Rasollāsā and Guṇatuṅgā.

## ${GGD} 188

> kalāvatī rasollāsā guṇatuṅgā vraje sthitāḥ
> śrī-viśākhā-kṛtaṁ gītaṁ gāyanti smādya tā matāḥ
> govinda-mādhavānanda-vāsudevā yathā-kramam

«The vraja-gopīs Kalāvatī-devī, Rasollāsā-devī and Guṇatuṅgā-devī, who sang the songs composed by Viśākhā-devī, later appeared as Govinda, Mādhavānanda and Vāsudeva respectively.»

## Kalāvatī in the books

- **${RKGD}** (Bṛhad-bhāga 97–100): the first of the eight *vara* sakhīs, twelve years old:

> mātulo yo 'rkā mitrasya gopo nāmnā kalāṅkuraḥ
> kalāvatī sutā tasya sindhumatyām ajāyata

«Kalāvatī is the daughter of the gopa Kalāṅkura, who is the maternal uncle of Arkamitra (Vṛṣabhānu Mahārāja). Her mother's name is Sindhumatī. Her complexion resembles that of white sandalwood (hari-candana) and her attire is the colour of a parrot's (śuka) lustre. Her husband Kapota is Vāhika's younger brother [Vāhika is Viśākhā's husband].»
- **${RKGD}** (Bṛhad-bhāga 251): one of Śrī Rādhā's eight sakhīs in another enumeration.

## Sources

${GGD} 188; ${RKGD}, Bṛhad-bhāga 97–100, 251.
`,
    replace: [["In Kṛṣṇa-līlā: Kalāvatī, who sang Viśākhā's songs (Gaura-gaṇoddeśa-dīpikā 188).\n", ""]],
  },
  {
    id: 423,
    name: "Govindānanda",
    text: `## In Kṛṣṇa-līlā

**Sugrīva**, the monkey king, in Rāma-līlā.

## ${GGD} 91

> murāri-gupto hanumān aṅgadaḥ śrī-purandaraḥ
> yaḥ śrī-sugrīva-nāmāsīd govindānanda eva saḥ

«The devotee named Murāri Gupta in Lord Caitanya's pastimes had previously been Hanumān. In the same way Śrī Purandara had previously been Aṅgada, and Govindānanda had been Sugrīva.»

## Sources

${GGD} 91.
`,
    replace: [[" According to Gauragaṇoddeśadīpikā 11, in the tretā-yuga he was an incarnation of Sugriva.", ""]],
  },
  {
    id: 428,
    name: "Guṇanidhi",
    text: `## In Kṛṣṇa-līlā

One of the **nine treasures (*nidhis*) of Kuvera**.

## ${GGD} 102–103

> loke ye nidhayaḥ khyātāḥ padma-śaṅkhādayo nava
> …
> vidyānidhir guṇanidhī ratnabāhur dvijāgraṇīḥ

«Kuvera's famous nine treasures, which include his conch and lotus, took birth during Lord Caitanya's pastimes as the nine sons of Nidhiratna-devī. They were all very dear to the Lord. Their names were Śrīnidhi, Śrīgarbha, Kaviratna, Sudhānidhi, Vidyānidhi, Guṇanidhi, the learned brāhmaṇa Ratnabāhu, Śrīmān Ācāryaratna, and Śrī Ratnākara Paṇḍita.» The verse does not say which treasure each one is.

## Sources

${GGD} 102–103.
`,
  },
  {
    id: 439,
    name: "Hāḍāi Paṇḍita",
    text: `## In Kṛṣṇa-līlā

**Vasudeva**, the father of Balarāma and Kṛṣṇa (with Rohiṇī, now his wife Padmāvatī); **Daśaratha** of Rāma-līlā is also in him.

## ${GGD} 40

> rohiṇī-vasudevau yau pitarau rāma-kṛṣṇayoḥ
> padmāvatī-mukundau tau santau jātau dvijottamau
> śrī-sumitrā-daśarathau tāv apy āviśatām amū

«Rohiṇī and Vasudeva, the parents of Balarāma and Kṛṣṇa, appeared during Lord Caitanya's advent as the exalted brāhmaṇa couple Padmāvatī and Mukunda. Sumitrā and Daśaratha were also present in the bodies of Padmāvatī and Mukunda.» (Mukunda is Hāḍāi Ojhā.)

## Sources

${GGD} 40.
`,
    remove: ["In Kṛṣṇa-līlā: Vasudeva, Balarāma's father; in Rāma-līlā Daśaratha (Gaura-gaṇoddeśa-dīpikā 40)."],
  },
  {
    id: 442,
    name: "Halāyudha Ṭhākura",
    text: `## In Kṛṣṇa-līlā

**Prabala**, a cowherd boy, close friend of Lord Balarāma.

## ${GGD} 134

> balarāma-sakhā kaścit prabalo gopa-bālakaḥ
> āsīd vraje purā yo 'dya sa halāyudha-ṭhakkuraḥ

«The cowherd boy Prabala, who was a close friend of Lord Balarāma in Vrajabhūmi, appeared in Lord Caitanya's pastimes as Halāyudha Ṭhākura.»

## Other opinions

- Some books make him the second **Subala** (Gauḍīya Vaiṣṇava Abhidhāna).

## Sources

${GGD} 134; Gauḍīya Vaiṣṇava Abhidhāna.
`,
    remove: ["In Kṛṣṇa-līlā: the books differ — the second Subala, or Prabala gopāla; a sakhā of Balarāma (Gaura-gaṇoddeśa-dīpikā 134; Gauḍīya Vaiṣṇava Abhidhāna)."],
  },
  {
    id: 450,
    name: "Hari Ācārya",
    text: `## In Kṛṣṇa-līlā

**Kalākṣī**, one of Śrī Rādhā's maidservants.

## ${GGD} 194–207

> gopālī hariṇī kālī kalākṣī nitya-mañjarī
> …
> hary-ācāryo gaura-saṅgī miśraḥ śrī-nayanas tathā

${LIST_194} Read with «Hastigopāla, and Vallabha who lived at Raṅga» as two devotees, Hari Ācārya is the twenty-second, like Kalākṣī (the English translation joins those two names, and then he would be Kālī, the twenty-first).

## Sources

${GGD} 194–207; Śākhā-nirṇayāmṛta 22.
`,
    replace: [[" He was Kalaksi in his past incarnation. (Gaura-gaṇoddeśa-dīpikā 196,207, Caitanya Caritāmṛta 1.12.84, Sakhanirnayamrta 22", " (Caitanya Caritāmṛta 1.12.84, Sakhanirnayamrta 22"]],
  },
  {
    id: 475,
    name: "Śrī Haridāsa Ṭhākura",
    text: `## In Kṛṣṇa-līlā

**Brahmā Mahātapā**, the son of Ṛcīka Muni, together with **Prahlāda Mahārāja**.

## ${GGD} 93

> ṛcīkasya muneḥ putro nāmnā brahmā mahātapāḥ
> prahlādena samaṁ jāto haridāsākhyako 'pi san

«Ṛcīka Muni's son Brahmā Mahātapā and Prahlāda Mahārāja combined to appear as Haridāsa Ṭhākura in Lord Caitanya's pastimes.»

## ${GGD} 94–95

> murāri-gupta-caraṇaiś caitanya-caritāmṛte
> ukto muni-sutaḥ prātas tulasī-patram āharan
> adhautam abhiśaptas taṁ pitā yavanatāṁ gataḥ
> sa eva haridāsaḥ san jātaḥ parama-bhaktimān

«In the book Caitanya-carita, Murāri Gupta explains that one morning Mahātapā gave an unwashed tulasī leaf to his father, who became so angry at him for this that he cursed him. Because of this Mahātapā took birth in a yavana family as the great devotee Haridāsa Ṭhākura.»

## Sources

${GGD} 93–95; Murāri Gupta, Śrī-kṛṣṇa-caitanya-caritāmṛta.
`,
    remove: ["In Kṛṣṇa-līlā: Brahmā, with Prahlāda; also Brahmā Mahātapā, son of Ṛcīka Muni (Gaura-gaṇoddeśa-dīpikā 93-95)."],
  },
  {
    id: 495,
    name: "Hastigopāla",
    text: `## In Kṛṣṇa-līlā

**Hariṇī**, one of Śrī Rādhā's maidservants, of Viśākhā's group.

## ${GGD} 194–207

> gopālī hariṇī kālī kalākṣī nitya-mañjarī
> …
> hastigopāla-nāmā ca raṅga-vāsī ca vallabhaḥ

${LIST_194} So Hariṇī, the twentieth maidservant, is the twentieth devotee: Hastigopāla.

## Hariṇī in the books

- **${RKGD}** (Bṛhad-bhāga 243):

> mādhavī mālatī candrarekhikā kuñjarī tathā
> hariṇī capalā-nāmnī surabhiś ca śubhānanā

«Mādhavī, Mālatī, Candrarekhikā, Kuñjarī, Hariṇī, Capalā, Surabhi and Śubhānanā are the eight prominent sakhīs serving under the guidance of Śrī Viśākhā Sakhī.»

## Sources

${GGD} 194–207; ${RKGD}, Bṛhad-bhāga 243.
`,
    replace: [[" He was Harini in his past incarnation (Gaura-gaṇoddeśa-dīpikā 196, 206).", ""]],
  },
];
fs.writeFileSync(new URL("./tanda4.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length + " fichas");
