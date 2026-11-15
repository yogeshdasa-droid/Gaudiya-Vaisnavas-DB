// node tanda2.mjs → tanda2.json (Gaṇoddeśa, tanda 2: 14 fichas). The books of Info take precedence.
import fs from "node:fs";
const GGD = "Gaura-gaṇoddeśa-dīpikā";
const RKGD = "Rādhā-Kṛṣṇa-gaṇoddeśa-dīpikā";
const plan = [
  {
    id: 6,
    name: "Abhirāma Ṭhākura",
    text: `## In Kṛṣṇa-līlā

**Śrīdāmā**, Kṛṣṇa's priya-sakhā and Śrī Rādhā's elder brother; one of the twelve gopālas of Śrī Nityānanda.

## ${GGD} 126

> purā śrīdāma-nāmāsīd abhirāmo 'dhunā mahān
> dvātriṁśatā janair eva vāhyaṁ kāṣṭham uvāha yaḥ

«The cowherd boy named Śrīdāmā appeared in Lord Caitanya's pastimes as Rāmadāsa Abhirāma dāsa, who carried a flute made of a bamboo stick with sixteen knots.» (The verse says he carried a log that only thirty-two men could lift.)

## Śrīdāmā in the books

- **${RKGD}** (Laghu-bhāga 31–32): first among Kṛṣṇa's priya-sakhās, the friends of His own age — Śrīdāmā, Dāmā, Sudāmā, Vasudāmā, Kiṅkiṇī, Bhadrasena, Aṁśu, Stoka-kṛṣṇa, Vilāsī and others; Śrīdāmā is the *pīṭha-marda*, the leading one.
- **${RKGD}** (Laghu-bhāga 36–38):

> śrīdāmā śyāmala-rucir aṅga-kāntir manoharā
> pīta-vastra-paridhāno ratnamālā-vibhūṣitaḥ

«Śrīdāmā has an attractive blackish blue (śyāma) bodily complexion. He wears yellow clothes and is decorated with jewelled necklaces. He is in his illustrious youth of sixteen years. He is very dear to Śrī Kṛṣṇa and is an embodiment of innumerable varieties of blissful pastimes.» His father is Vṛṣabhānu Mahārāja and his mother Kīrtidā; Śrī Rādhā and Anaṅga-mañjarī are his younger sisters (38; Laghu-bhāga 173a).

## Other opinions

- In Rāma-līlā: Bharata (Gauḍīya Vaiṣṇava Abhidhāna).

## Sources

${GGD} 126; ${RKGD}, Laghu-bhāga 31–32, 36–38, 173a; Gauḍīya Vaiṣṇava Abhidhāna.
`,
    replace: [["In Kṛṣṇa-līlā: Śrīdāmā (Gaura-gaṇoddeśa-dīpikā 126); in Rāma-līlā: Bharata (Gauḍīya Vaiṣṇava Abhidhāna). ", ""]],
    remove: ["Previously known as Śrīdāmā; one of the twelve boy cowherds of Kṛṣṇa in Gopīlīla."],
  },
  {
    id: 12,
    name: "Acyutānanda dāsa (Pañcasakhā)",
    text: `## In Kṛṣṇa-līlā

**Sudāmā**, one of Kṛṣṇa's priya-sakhās — according to the Śūnya-saṁhitā (the ${GGD} does not name him).

## Sudāmā in the books

- **${RKGD}** (Laghu-bhāga 31–32): among Kṛṣṇa's priya-sakhās, the friends of His own age (Śrīdāmā, Dāmā, Sudāmā, Vasudāmā…).
- **${RKGD}** (Laghu-bhāga 39–40):

> īṣad-gauraḥ sudāmā ca deha-kāntir manoharā
> nīla-vastra-paridhāno ratnābharaṇa-bhūṣitaḥ

«Sudāmā has a supremely attractive bodily lustre, which is slightly fair. He wears blue garments and is decorated with jewelled ornaments.» His father is Maṭuka and his mother Rocanā; «he is beautified by his handsome youth and attire, and he is a mine of various blissful sports» (40).

## Sources

Śūnya-saṁhitā (Acyutānanda dāsa); ${RKGD}, Laghu-bhāga 31–32, 39–40.
`,
    remove: ["In the Śūnya-saṁhitā: Sudāmā in Kṛṣṇa-līlā."],
  },
  {
    id: 14,
    name: "Acyutānanda (son of Advaita)",
    text: `## In Kṛṣṇa-līlā

**Kārttikeya** and the gopī **Acyutā**, both present in him.

## ${GGD} 87–88

> tasya putro 'cyutānandaḥ kṛṣṇa-caitanya-vallabhaḥ
> śrīmat-paṇḍita-gosvāmi-śiṣyaḥ priya iti śrutam

«Lord Advaita's son was Acyutānanda, who was very dear to Lord Caitanya. Acyutānanda was the dear disciple of Śrīmān Paṇḍita Gosvāmī [Gadādhara]. This I have heard from the devotees.»

> yaḥ kārttikeyaḥ prāg āsīd iti jalpanti kecana
> kecid āhū rasa-vido 'cyuta-nāmnī tu gopikā
> ubhayaṁ tu samīcīnaṁ dvayor ekatra saṅgatāt
> kārttikeyaḥ kṛṣṇa-miśras tat-sāmyād iti kecana

«Some say that Acyutānanda was the incarnation of Kārttikeya, and others learned in transcendental mellows say that he is the incarnation of Acyuta-gopī. Both views are correct, for both Kārttikeya and Acyuta-gopī were present in the body of Acyutānanda. Aside from this, some devotees say that Śrī Kṛṣṇa Miśra was also the incarnation of Kārttikeya.»

## Sources

${GGD} 87–88.
`,
    remove: ["In Kṛṣṇa-līlā: Kārttikeya and the gopī Acyutā (Gaura-gaṇoddeśa-dīpikā 87-88)."],
  },
  {
    id: 43,
    name: "Śiśu Ananta (Pañcasakhā)",
    text: `## In Kṛṣṇa-līlā

**Dāma** (Dāmā), one of Kṛṣṇa's priya-sakhās — according to Īśvara dāsa (the ${GGD} does not name him).

## Dāma in the books

- **${RKGD}** (Laghu-bhāga 31–32): among Kṛṣṇa's priya-sakhās, the friends of His own age:

> śrīdāmā dāmā sudāmā vasudāmā tathaiva ca
> kiṅkiṇi-bhadrasenāṁśu-stoka-kṛṣṇa vilāsinaḥ

«Śrīdāmā, Dāmā, Sudāmā, Vasudāmā, Kiṅkiṇī, Bhadrasena, Aṁśumāna, Stoka-kṛṣṇa, Vilāsī, Puṇḍarīka, Viṭaṅkākṣa, Kalaviṅka and Priyaṅkara are Śrī Kṛṣṇa's priya-sakhās. These sakhās are of the same age as Śrī Kṛṣṇa.»

## Other opinions

- The ${GGD} (126–132) gives Dāma as Puruṣottama dāsa, one of the twelve gopālas of Śrī Nityānanda.

## Sources

Īśvara dāsa, Caitanya-bhāgavata (Oṛiyā); ${RKGD}, Laghu-bhāga 31–32; ${GGD} 126–132.
`,
    replace: [[" Dāma in Kṛṣṇa-līlā (Īśvara dāsa).", ""]],
  },
  {
    id: 44,
    name: "Ananta Ācārya",
    text: `## In Kṛṣṇa-līlā

**Sudevī**, the eighth of Śrī Rādhā's eight principal sakhīs, twin sister of Raṅgadevī.

## ${GGD} 165

> raṅgadevī purā yāsīd adya bhaṭṭo gadādharaḥ
> anantācārya-gosvāmī yā sudevī purā vraje

«The vraja-gopī Raṅgadevī appeared as Gadādhara Bhaṭṭa, and the vraja-gopī Sudevī appeared as Ananta Ācārya Gosvāmī.»

## Sudevī in the books

- **${RKGD}** (Bṛhad-bhāga 96):

> sudevī raṅgadevyās tu yamajā mṛdur aṣṭamī
> rūpādibhiḥ svasuḥ sāmyāt tad-bhrānti-bhara-kāriṇī
> bhrātrā vakrekṣaṇasyeyaṁ pariṇītā kanīyasā

«Sudevī is the eighth of the variṣṭha sakhīs. She is the twin sister of Raṅgadevī and is of a gentle (*mṛdu*) nature. She resembles her sister by beauty, good qualities, nature and so forth, and is therefore sometimes mistaken to be Raṅgadevī. Sudevī is married to the younger brother of Vakrekṣaṇa, the husband of Raṅgadevī.» Her parents are Raṅgasāra and Karuṇā (95b).
- **Her services** (Bṛhad-bhāga 199–204): she always stays close to Śrī Rādhā, dresses Her hair, applies añjana to Her eyes and massages Her; she teaches the parrots to sing the Divine Couple's glories, is expert in boat pastimes, cock-fights, omens (*śakuna-śāstra*), the languages of animals and birds, flowers that bloom in moonlight, fire and fireworks. She supervises the sakhīs who prepare the thrones of the Divine Couple, those who go in disguise to learn the moods of the opposing party, and those who look after the forest birds.
- **Her sakhīs** (Bṛhad-bhāga 249): Kāverī, Cārukavarā, Sukeśī, Mañjukeśikā, Hārahīrā, Hārakaṇṭhī, Mahāhīrā, Manoharā and others serve under her guidance.

## Sources

${GGD} 165; ${RKGD}, Bṛhad-bhāga 79, 95b–96, 199–204, 249.
`,
    remove: ["In Kṛṣṇa-līlā: Sudevī (Gaura-gaṇoddeśa-dīpikā 165)."],
  },
  {
    id: 47,
    name: "Ananta Purī",
    text: `## In Kṛṣṇa-līlā

**Aṇimā-siddhi**, the first of the eight mystic perfections, who were present in Vṛndāvana.

## ${GGD} 96–97

> vṛndāvane yāḥ prāg āsann aṇimādy-aṣṭa-siddhayaḥ
> tā evāṣṭau bhakta-rūpā bhūtā gauḍe ca te yathā
> anantaś ca sukhānando govindo raghunāthakaḥ
> kṛṣṇānandaḥ keśavaś ca śrī-dāmodara-rāghavau
> pury-upādhi-kramāj jñeyā aṇimādy-aṣṭa-siddhayaḥ

«The eight mystic powers, beginning with aṇimā-siddhi, which had formerly appeared in Vṛndāvana, took birth in Bengal during Lord Caitanya's pastimes as the eight devotees Ananta, Sukhānanda, Govinda, Raghunātha, Kṛṣṇānanda, Keśava, Dāmodara and Rāghava. All these devotees bore the title Purī after their names.»

In that order Ananta Purī, the first, is aṇimā (the power to become smaller than the smallest).

## Sources

${GGD} 96–97.
`,
    replace: [[" Aṇimā-siddhi (Gaura-gaṇoddeśa-dīpikā 96-97).", ""]],
  },
  {
    id: 96,
    name: "Bhagavān Ācārya",
    text: `## In Kṛṣṇa-līlā

**A cowherd boy** of Vraja, in the mood of friendship (*sakhya*); and a partial manifestation (*kalā*) of Lord Gaura.

## ${GGD} 74

> āveśaś ca tathā jñeyo miśre pradyumna-saṁjñake
> ācāryo bhagavān khañjaḥ kalā gaurasya kathyate

«In the same way, a particle of Lord Caitanya also entered the body of Pradyumna Miśra. Bhagavān Ācārya Khañja [the lame] is said to be a partial manifestation of Lord Gaura.»

## Other opinions

- Caitanya-caritāmṛta Antya 2.85: his heart was full of the mood of friendship; he was an incarnation of a cowherd boy (*gopa-avatāra*).

## Sources

${GGD} 74; Caitanya-caritāmṛta Antya 2.85.
`,
    replace: [
      [" He constituted a Kāla (usually applied to 1/16th part of the moon) of Lord Gaurāṅga (Gaura-gaṇoddeśa-dīpikā 74).", ""],
      [" An incarnation of a cowherd boy (Caitanya-caritāmṛta Antya 2.85).", ""],
    ],
  },
  {
    id: 133,
    name: "Bhāskara Ṭhākura",
    text: `## In Kṛṣṇa-līlā

**Viśvakarmā**, the architect of the demigods.

## ${GGD} 114

> viśvakarmā purā yo 'bhūd adya bhāskara-ṭhakkuraḥ

«Bhāskara Ṭhākura was an incarnation of the demigod Viśvakarmā.» (The second half of the verse is about Vanamālī Ṭhākura, formerly Sudāmā Brāhmaṇa.)

## Sources

${GGD} 114.
`,
    replace: [[" Gaura-gaṇoddeśa-dīpikā 114 notes that he was Visvakarma in an earlier incarnation.", ""]],
  },
  {
    id: 140,
    name: "Bhavānanda Rāya Paṭṭanāyaka",
    text: `## In Kṛṣṇa-līlā

**Mahārāja Pāṇḍu**, the husband of Kuntī and father of the Pāṇḍavas — so said Lord Caitanya Himself.

## ${GGD} 122

> lalitety āhur eke yat tad ekenānumanyate
> bhavānandaṁ prati prāha gauro yat tvaṁ pṛthā-patiḥ

«Some say that Rāmānanda Rāya is the incarnation of Lalitā-gopī, and others say that because Lord Caitanya directly told Rāmānanda Rāya's father, Bhavānanda Rāya, that he was the incarnation of Mahārāja Pāṇḍu, Arjuna's father, therefore Rāmānanda Rāya must be the incarnation of Pāṇḍava Arjuna.»

## Other opinions

- Caitanya-caritāmṛta Madhya 10.49–50: the Lord tells him that he was Pāṇḍu, his wife Kuntī, and his five sons the five Pāṇḍavas.
- Acyutānanda dāsa (Oṛiyā) calls him a gopī.

## Sources

${GGD} 122; Caitanya-caritāmṛta Madhya 10.49–50.
`,
    remove: ["In Kṛṣṇa-līlā: King Pāṇḍu (Gaura-gaṇoddeśa-dīpikā 122); his wife was Kuntī."],
  },
  {
    id: 150,
    name: "Bhūgarbha Gosvāmī",
    text: `## In Kṛṣṇa-līlā

**Śrī Prema-mañjarī**, one of Śrī Rādhā's mañjarīs; his inseparable friend Lokanātha Gosvāmī is Līlā-mañjarī.

## ${GGD} 187

> bhūgarbha-ṭhakkurasyāsīt pūrvākhyā prema-mañjarī
> lokanāthākhya-gosvāmī śrī-līlā-mañjarī purā

«Bhūgarbha Ṭhākura was the incarnation of Prema-mañjarī. Lokanātha Gosvāmī was the incarnation of Līlā-mañjarī.»

## Prema-mañjarī in the books

- **${RKGD}** (Laghu-bhāga 182–184): among Śrī Rādhā's mañjarīs (Rūpa, Rati, Lavaṅga, Guṇa, Rasa, Vilāsa, Prema…); «Prema Mañjarī [Supremā in verse 184] and Rati Mañjarī are both also known by the name Bhānumatī».
- **${RKGD}** (Laghu-bhāga 178): named among Śrī Rādhā's *priya-sakhīs*.
- **${RKGD}** (Bṛhad-bhāga 248): a Prema-mañjarī is one of the eight sakhīs serving under Raṅgadevī.

## Sources

${GGD} 187; ${RKGD}, Laghu-bhāga 178, 182–184; Bṛhad-bhāga 248.
`,
    replace: [
      ["; identity in Kṛṣṇalīlā as Prema Mañjarī (gopī); ", "; "],
      [" In Kṛṣṇa-līlā: Prema-mañjarī (Gaura-gaṇoddeśa-dīpikā 187).", ""],
    ],
    remove: ["In the Gauragaṇoddeśadīpikā, Śrī Bhūgarbha Gosvāmī's identity as Premamañjarī in Kṛṣṇa līlā, has been revealed."],
  },
  {
    id: 166,
    name: "Chandraśekhara Ācāryaratna",
    text: `## In Kṛṣṇa-līlā

**Candra**, the moon-god — as Lord Caitanya Himself said.

## ${GGD} 112–113

> candraśekharācāryaś candro jñeyo vicakṣaṇaiḥ
> śrīmān uddhava-dāso 'pi candrāveśāvatārakaḥ

«The learned devotees know that Candraśekhara Ācārya was an incarnation of the moon-god and Śrīmān Uddhava dāsa was an empowered incarnation of the moon-god.»

> ataś caitanya-hariṇā kathito 'yaṁ niśāpatiḥ
> śrīmad-viśveśvarācāryo yaḥ prāg āsīd divākaraḥ

«Lord Caitanya personally affirmed that Candraśekhara Ācārya was an incarnation of the moon-god, and in the same way the Lord expressly said that Śrīmān Viśveśvara Ācārya was an incarnation of the sun-god.»

## Other opinions

- ${GGD} 102: Kuvera's nine treasures (*nidhis*), «which include his conch and lotus», appeared as nine dear associates of the Lord — Śrīnidhi, Śrīgarbha, Kaviratna, Sudhānidhi, Vidyānidhi, Guṇanidhi, Ratnabāhu, **Śrīmān Ācāryaratna** and Ratnākara Paṇḍita. The record's notes took this Ācāryaratna for Candraśekhara and called him Śaṅkha-nidhi; the verse does not say which treasure each one is (nor, for sure, that this Ācāryaratna is Candraśekhara).

## Sources

${GGD} 102, 112–113.
`,
    remove: ["In Kṛṣṇa-līlā: Śaṅkhanidhi, one of the nine nidhis (Gaura-gaṇoddeśa-dīpikā 102); the presence of Candra (Gaura-gaṇoddeśa-dīpikā 112)."],
  },
  {
    id: 172,
    name: "Damayantī Devī",
    text: `## In Kṛṣṇa-līlā

**Guṇamālā**, a maidservant of Śrī Kṛṣṇa who lives in Nanda Mahārāja's palace.

## ${GGD} 167

> guṇamālā vraje yāsīd damayantī tu tat-svasā

«The vraja-gopī Guṇamālā-devī appeared as Rāghava Paṇḍita's sister Damayantī-devī.»

## Guṇamālā in the books

- **${RKGD}** (Laghu-bhāga 83): «Dhaniṣṭhā, Candanakalā, Guṇamālā, Ratiprabhā, Taruṇī, Induprabhā, Śobhā, Rambhā and others are Śrī Kṛṣṇa's maidservants. They are all specifically expert in decorating…»
- **${RKGD}** (Laghu-bhāga 187): «Dhaniṣṭhā, Guṇamālā and other sakhīs live in the very palace of Goparāja Nanda Mahārāja.»

As in Vraja she served in Nanda's house, so in Pāṇihāṭi she cooked the year round the foodstuffs that went to Lord Caitanya in Purī in «Rāghava's bags».

## Sources

${GGD} 167; ${RKGD}, Laghu-bhāga 83, 187.
`,
    replace: [[" According to Gaura-gaṇoddeśa-dīpikā 167, she was Guṇamālā sakhī in an earlier līlā (Caitanya-caritāmṛta 1.10.24-25).", " (Caitanya-caritāmṛta 1.10.24-25.)"]],
  },
  {
    id: 177,
    name: "Dāmodara Paṇḍit",
    text: `## In Kṛṣṇa-līlā

The gopī **Śaibyā**, «hot-tempered»; the goddess **Sarasvatī** also entered him.

## ${GGD} 159

> śaibyā yāsīd vraje caṇḍī sā dāmodara-paṇḍitaḥ
> kutaścit kāryato devī prāviśat taṁ sarasvatī

«Hot-tempered Śaibyā-gopī, who previously appeared in Vraja, appeared as Dāmodara Paṇḍita during Lord Caitanya's pastimes. The goddess Sarasvatī also entered the body of Dāmodara Paṇḍita, who is thus the combined incarnation of them both.»

## Śaibyā in the books

- **${RKGD}** (Laghu-bhāga 136–139): among Śrī Kṛṣṇa's beloved gopīs — «Candrāvalī, Padmā, Śyāmā, Śaibyā, Bhadrikā, Tārā, Vicitrā, Gopālī, Pālikā…».

## Other opinions

- The record also says he was **Vaśitva-siddhi** (${GGD} 96–97): that verse is about **Dāmodara Purī**, the seventh of the eight Purīs who were the eight mystic perfections — another person (the record has «Dāmodara Purī» as another name).

## Sources

${GGD} 159 (and 96–97); ${RKGD}, Laghu-bhāga 136.
`,
    remove: ["In Kṛṣṇa-līlā: the gopī Śaibyā; the goddess Sarasvatī also entered him (Gaura-gaṇoddeśa-dīpikā 159)."],
  },
  {
    id: 203,
    name: "Devānanda Paṇḍita",
    text: `## In Kṛṣṇa-līlā

**Bhāguri Muni**, the chief paṇḍita in the court of Nanda Mahārāja.

## ${GGD} 106

> purāṇānām artha-vettā śrī-devānanda-paṇḍitaḥ
> purāsīn nanda-pariṣat-paṇḍito bhāgurir muniḥ

«Lord Caitanya's associate Śrī Devānanda Paṇḍita, who was very learned in the Purāṇas, had previously been Bhāguri Muni, the chief paṇḍita in the court of Mahārāja Nanda.»

## Bhāguri in the books

- **${RKGD}** (Bṛhad-bhāga 67): «Vedagarbha, Mahāyajvā, Bhāguri and others are priests (*purohitas*)» of the cowherds of Vraja; Gautamī, Śārvī, Gārgī and others are their wives.
- **${RKGD}** (Bṛhad-bhāga 104): Mahāvasu Gopa, wishing for a brave son and a beautiful daughter, began a sacrifice «with the help of the self-controlled priest Bhāguri».

## Sources

${GGD} 106; ${RKGD}, Bṛhad-bhāga 67, 104.
`,
    remove: ["In Kṛṣṇa-līlā: Bhāguri Muni (Gaura-gaṇoddeśa-dīpikā 104)."],
    replace: [[" As Bhāguri Muni he was the chief paṇḍita in Nanda Mahārāja's court.", ""]],
  },
];
fs.writeFileSync(new URL("./tanda2.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length + " fichas");
