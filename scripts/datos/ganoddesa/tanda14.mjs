// node tanda14.mjs → tanda14.json (Gaṇoddeśa, tanda 14). The books of Info take precedence.
// Left out: #1827 (done in tanda5b); #1882 Viṣṇusvāmī, #1892 Madhvācārya, #1900 Vidyānidhi (no book of Info);
// #1925 Raghunātha (Gadādhara's branch) «Varāṅgadā» — the GGD's Varāṅgadā is «Raghunātha Dvija», already on #260 Dvija
// Raghunātha: ask Whisper whether #1925 = #260.
// #1832 Kāśīśvara Paṇḍita: the GGD 166 «śrī-kāśīśvara-gosvāmī» = Śaśirekhā; the Bhakti-ratnākara calls him «Kāśīśvara
// Gosvāmī» → Śaśirekhā here (also shown on #699, with the doubt).
import fs from "node:fs";
const GGD = "Gaura-gaṇoddeśa-dīpikā";
const RKGD = "Rādhā-Kṛṣṇa-gaṇoddeśa-dīpikā";
const LIST_194 = `In verses 194–207 the ${GGD} names twenty-seven maidservants of Śrī Rādhā — «Mālatī, Candralatikā, Mañjumedhā, Varāṅgadā, Ratnāvalī, Kamalā, Guṇacūḍā, Sukeśinī, Karpūra-mañjarī, Śyāma-mañjarī, Śveta-mañjarī, Vilāsa-mañjarī, Kāmalekhā, Mauna-mañjarī, Gandhonmadā, Rasonmadā, Candrikā, Kalabhāṣiṇī, Gopālī, Hariṇī, Kālī, Kalākṣī, Nitya-mañjarī, Kalakaṇṭhī, Kuraṅgākṣī, Candrikā and Candraśekharā» — who «assuming male forms appeared among Lord Caitanya's associates», and then the devotees they became, *kramaśaḥ*, in the same order.`;
const plan = [
  {
    id: 1791,
    name: "Bhāgavatācārya (Raghunātha Paṇḍita)",
    text: `## In Kṛṣṇa-līlā

**Śveta-mañjarī**, one of Śrī Rādhā's maidservants.

## ${GGD} 194–207

> karpūra-mañjarī śyāma-mañjarī śveta-mañjarī
> …
> nirmitā pustikā yena kṛṣṇa-prema-taraṅgiṇī
> śrīmad-bhāgavatācāryo gaurāṅgātyanta-vallabhaḥ

${LIST_194} So Śveta-mañjarī, the eleventh maidservant, is the eleventh devotee: «Śrīmān Bhāgavatācārya, who was very dear to Lord Caitanya, and who wrote the book Śrī Kṛṣṇa-prema-taraṅgiṇī».

## Sources

${GGD} 194–207.
`,
    remove: ["In Kṛṣṇa-līlā: Śvetamañjarī (Gaura-gaṇoddeśa-dīpikā 195, 203)."],
  },
  {
    id: 1814,
    name: "Dhanañjaya Paṇḍita",
    text: `## In Kṛṣṇa-līlā

**Vasudāmā**, one of Kṛṣṇa's cowherd friends (*priya-sakhās*), of the same age as Kṛṣṇa.

## ${GGD} 127

> purā sudāma-nāmāsīd adya ṭhakkura-sundaraḥ
> vasudāma-sakhā yaś ca paṇḍitaḥ śrī-dhanañjayaḥ

«Lord Kṛṣṇa's cowherd friend Sudāmā appeared in Lord Caitanya's pastimes as Sundara Ṭhākura. Lord Kṛṣṇa's cowherd friend Vasudāmā appeared in Lord Caitanya's pastimes as Śrī Dhanañjaya Paṇḍita.»

## Vasudāmā in the books

- **${RKGD}** (Laghu-bhāga 31–32): among the *priya-sakhās* — «Śrīdāmā, Dāmā, Sudāmā, **Vasudāmā**, Kiṅkiṇī, Bhadrasena…».
- **${RKGD}** (Laghu-bhāga 48): Vasudāmā is the elder brother of **Arjuna**, the priya-narma-sakhā; their father is Sudakṣiṇa and their mother Bhadrā. «Both of them are immersed in love for the Divine Couple.»

## Sources

${GGD} 127; ${RKGD}, Laghu-bhāga 31–32, 48.
`,
    remove: ["In Kṛṣṇa-līlā: Vasudāma (Gaura-gaṇoddeśa-dīpikā 127).", "In Kṛṣṇa-līlā: Vasudāmā (Gaura-gaṇoddeśa-dīpikā 127)."],
  },
  {
    id: 1815,
    name: "Gadādhara dāsa Ṭhākura",
    text: `## In Kṛṣṇa-līlā

**Candrakānti**, an expansion (*vibhūti*) of Śrī Rādhā; and **Pūrṇānandā**, Lord Balarāma's dearest girl-friend, who also entered him.

## ${GGD} 154

> rādhā-vibhūti-rūpā yā candrakāntiḥ purā sthitā
> sādya gaurāṅga-nikaṭe dāsa-vaṁśa-gadādharaḥ

«Śrīmatī Rādhārāṇī's expansion as Candrakānti-devī appeared as Gadādhara dāsa, a close associate of Lord Caitanya.»

## ${GGD} 155

> pūrṇānandā vraje yāsīd baladeva-priyāgraṇīḥ
> …

«Pūrṇānandā-gopī, the dearmost girl-friend of Lord Balarāma, also entered the body of Gadādhara dāsa. Therefore Gadādhara dāsa was the incarnation of both Candrakānti-devī and Pūrṇānandā-gopī.»

## Sources

${GGD} 154–155.
`,
    remove: ["In Kṛṣṇa-līlā: Candrakānti, Rādhā's expansion; Pūrṇānandā, Balarāma's dearest friend, also entered him (Gaura-gaṇoddeśa-dīpikā 154-155)."],
  },
  {
    id: 1832,
    name: "Kāśīśvara Paṇḍita (Gaura-Govinda)",
    text: `## In Kṛṣṇa-līlā

**Śaśirekhā**, a gopī of Vraja — the ${GGD} gives her to «Śrī Kāśīśvara Gosvāmī», as the Bhakti-ratnākara calls this Kāśīśvara.

## ${GGD} 166

> śrī-kāśīśvara-gosvāmī śaśirekhā purā vraje
> …

«The vraja-gopī Śaśirekhā-devī appeared as Śrī Kāśīśvara Gosvāmī.»

## Other opinions

- The Gauḍīya Vaiṣṇava Abhidhāna gives him **Keli-mañjarī**.
- **Kāśīśvara Brahmacārī**, Īśvara Purī's disciple who served the Lord in Purī, was **Bhṛṅgāra** (${GGD} 137; his own record). The Abhidhāna and Kavi Karṇapūra keep the two apart; Śrīla Prabhupāda and others take them as one — then Bhṛṅgāra and Śaśirekhā would be one person's.

## Sources

${GGD} 137, 166; Gauḍīya Vaiṣṇava Abhidhāna; Bhakti-ratnākara 4, 6.
`,
    remove: ["In Kṛṣṇa-līlā: Kelimañjarī (Gauḍīya Vaiṣṇava Abhidhāna)."],
  },
  {
    id: 1833,
    name: "Kholāvecā Śrīdhara",
    text: `## In Kṛṣṇa-līlā

**Kusumāsava**, the cowherd boy of Vraja who made Kṛṣṇa laugh — Madhumaṅgala, His jester (*vidūṣaka*).

## ${GGD} 133

> kholāvecatayā khyātaḥ paṇḍitaḥ śrīdharo dvijaḥ
> āsīd vraje hāsya-kārī yo nāmnā kusumāsavaḥ

«The cowherd boy named Kusumāsava, who joked with Kṛṣṇa in Vraja, appeared as the brāhmaṇa Śrīdhara Paṇḍita, famous as a seller of plantain-leaf cups (*khola*).»

## Madhumaṅgala in the books

- **${RKGD}** (Laghu-bhāga 64–65):

> īṣac-chyāmala-varṇo 'pi śrī-madhumaṅgalo bhavet
> vasanaṁ gaura-varṇāḍhyaṁ vana-mālā-virājitaḥ

«Madhumaṅgala's complexion is somewhat blackish blue (śyāma). His clothes are of a golden colour and he is decorated with garlands made of forest flowers. Madhumaṅgala's father is Śrī Sāndīpani Ṛṣi and his chaste mother's name is Sumukhī. Nāndīmukhī is his sister and his paternal grandmother is Paurṇamāsī.» He is Kṛṣṇa's friend and jester (*vidūṣaka*).

## Sources

${GGD} 133; ${RKGD}, Laghu-bhāga 64–65.
`,
    remove: ["In Kṛṣṇa-līlā: Kusumāsava (Madhumaṅgala), who made Kṛṣṇa laugh (Gaura-gaṇoddeśa-dīpikā 133)."],
  },
  {
    id: 1841,
    name: "Lakṣmīpriyā Mātā",
    text: `## In Kṛṣṇa-līlā

**Rukmiṇī**, Kṛṣṇa's queen in Dvārakā, and **Jānakī** (Sītā) of Rāma-līlā — an incarnation of **Lakṣmī-devī**, the goddess of fortune; her father Vallabhācārya was King Janaka.

## ${GGD} 45

> śrī-jānakī rukmiṇī ca lakṣmī-nāmnī ca tat-sutā

«The same person who formerly appeared as Jānakī-devī and Rukmiṇī-devī appeared during Lord Caitanya's pastimes as Śrīmatī Lakṣmīpriyā, the daughter of Vallabhācārya.»

## ${GGD} 46

> vallabhācārya-sutā calantī snātuṁ sakhībhiḥ sura-dīrghikāyām
> lakṣmīr anenaiva kṛtāvatārā prabhor yayau locana-vartma tatra

«Vallabhācārya's daughter, Śrīmatī Lakṣmīpriyā, was an incarnation of Śrīmatī Lakṣmī-devī, the goddess of fortune. One day, as she was walking with her friends towards the bank of the Ganges to bathe, she entered the path of Lord Caitanya's vision. In this way the Lord saw Lakṣmīpriyā for the first time.»

## Sources

${GGD} 44–46.
`,
    remove: ["In Kṛṣṇa-līlā: Jānakī (Sītā) and Rukmiṇī; an incarnation of Lakṣmī-devī (Gaura-gaṇoddeśa-dīpikā 45-46)."],
  },
  {
    id: 1856,
    name: "Śrī Rāghava Paṇḍita",
    text: `## In Kṛṣṇa-līlā

**Dhaniṣṭhā**, who fed Kṛṣṇa with limitless opulent foodstuffs — as now he and his sister Damayantī prepared the Lord's bags of food every year.

## ${GGD} 166

> …
> dhaniṣṭhā bhakṣya-sāmagrīṁ kṛṣṇāyādād vraje 'mitām
> saiva samprati gaurāṅga-priyo rāghava-paṇḍitaḥ

«The vraja-gopī Dhaniṣṭhā-devī, who had previously fed Lord Kṛṣṇa with limitless opulent foodstuffs, appeared as Rāghava Paṇḍita, who was very dear to Lord Caitanya.»

## Dhaniṣṭhā in the books

- **${RKGD}** (Laghu-bhāga 83): «**Dhaniṣṭhā**, Candanakalā, Guṇamālā, Ratiprabhā, Taruṇī, Induprabhā, Śobhā, Rambhā and others are Śrī Kṛṣṇa's maidservants. They are all specifically expert in decorating the house, cleaning, smearing cow dung and bringing milk.»
- **${RKGD}** (Laghu-bhāga 187): «Dhaniṣṭhā, Guṇamālā and other sakhīs live in the very palace of Goparāja Nanda Mahārāja.»

## Sources

${GGD} 166; ${RKGD}, Laghu-bhāga 83, 187.
`,
    remove: ["In Kṛṣṇa-līlā: Dhaniṣṭhā, who gave Kṛṣṇa abundant foodstuffs (Gaura-gaṇoddeśa-dīpikā 166)."],
  },
  {
    id: 1880,
    name: "Vīrabhadra Gosvāmī",
    text: `## In Kṛṣṇa-līlā

**Kṣīrodakaśāyī Viṣṇu** (Payo-viṣayī), the expansion of Lord Saṅkarṣaṇa — non-different from Lord Caitanya; Balarāma's sons **Niśaṭha and Ulmuka** also entered him.

## ${GGD} 67–68

> saṅkarṣaṇasya yo vyūhaḥ payo-viṣayi-nāmakaḥ
> sa eva vīracandro 'bhūc caitanyābhinna-vigrahaḥ
> amuṁ praviśatāṁ kāryāt sahajau niśaṭholmukau
> mīnaketana-rāmādi-vyūhaḥ saṅkarṣaṇo 'paraḥ

«The expansion of Lord Saṅkarṣaṇa known as Lord Kṣīrodakaśāyī Viṣṇu appeared in Lord Caitanya's pastimes as Vīracandra Prabhu. Lord Vīracandra was non-different from Lord Caitanya Himself.» (67) «Lord Vīracandra also entered the bodies of the two brothers Niśaṭha and Ulmuka, who in this way were incarnations of Lord Viṣṇu. Mīnaketana Rāmadāsa and others were also incarnations of Lord Saṅkarṣaṇa in this way.» (68, English translation)

## Other opinions

- In verse 68 *amuṁ praviśatām … niśaṭholmukau* reads «Niśaṭha and Ulmuka entered **him**» — Vīracandra, of the verse before; the English translation says that Vīracandra entered them.

## Sources

${GGD} 67–68.
`,
    remove: [
      "In Kṛṣṇa-līlā: Kṣīrodakaśāyī Viṣṇu, an expansion of Saṅkarṣaṇa (Gaura-gaṇoddeśa-dīpikā 67).",
      "In Kṛṣṇa-līlā: Kṣīrodakaśāyī (Payodhiśāyī) Viṣṇu, an expansion of Saṅkarṣaṇa; also Niśaṭha and Ulmuka (Gaura-gaṇoddeśa-dīpikā 67).",
    ],
  },
  {
    id: 1949,
    name: "Rāmadāsa (son of Śivānanda Sen)",
    text: `## In Kṛṣṇa-līlā

**Vicakṣaṇa**, one of Kṛṣṇa's two famous parrots in Vṛndāvana; his elder brother Caitanya dāsa was the other, Dakṣa. His younger brother Kavi Karṇapūra wrote this.

## ${GGD} 145

> vṛndāvane yau vikhyātau śukau dakṣa-vicakṣaṇau
> tāv adya jātau maj-jyeṣṭhau caitanya-rāma-dāsakau

«Dakṣa and Vicakṣaṇa, the two famous parrots of Vṛndāvana, took birth during Lord Caitanya's pastimes as Caitanya dāsa and Rāma dāsa, who are both my seniors.»

## Vicakṣaṇa in the books

- **${RKGD}** (Laghu-bhāga 111): «Śrī Kṛṣṇa also has two pet dogs, Vyāghra and Bhramaraka; a swan named Kalasvana; a peacock called Tāṇḍavika; and two male parrots named **Dakṣa** and **Vicakṣaṇa**.»

## Sources

${GGD} 145; ${RKGD}, Laghu-bhāga 111.
`,
    replace: [[" In his past incarnation he was Vicakṣaṇa Śuka. (Gaura-gaṇoddeśa-dīpikā 145)", ""]],
  },
  {
    id: 1950,
    name: "Rāmadāsa (Kuraṅgākṣī)",
    text: `## In Kṛṣṇa-līlā

**Kuraṅgākṣī**, one of Śrī Rādhā's maidservants.

## ${GGD} 194–207

> kalakaṇṭhī kuraṅgākṣī candrikā candraśekharā
> …
> kavidatto rāmadāsaś cirañjīva-sulocanau

${LIST_194} Read with «Hastigopāla» and «Raṅgavāsī Vallabha» as two devotees, Kuraṅgākṣī, the twenty-fifth maidservant, is the twenty-fifth devotee: Rāmadāsa.

## Kuraṅgākṣī in the books

- **${RKGD}** (Bṛhad-bhāga 244): the first of the eight prominent sakhīs under **Campakalatā** — «**Kuraṅgākṣī**, Sucaritā, Maṇḍalī, Maṇikuṇḍalā, Candrikā, Candralatikā, Paṅkajākṣī and Sumandirā»; also the first of Śrī Rādhā's *priya-sakhīs* (Laghu-bhāga 176).

## Sources

${GGD} 194–207; ${RKGD}, Bṛhad-bhāga 244, Laghu-bhāga 176.
`,
    replace: [["In Vraja-līlā he was Kuraṅgākṣī. (Gaura-gaṇoddeśa-dīpikā 197, 207)", ""]],
  },
];
fs.writeFileSync(new URL("./tanda14.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length + " fichas");
