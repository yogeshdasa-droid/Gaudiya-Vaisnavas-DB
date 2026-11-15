// node tanda7.mjs → tanda7.json (Gaṇoddeśa, tanda 7). The books of Info take precedence.
// Left out: #936 Mukunda Ojhā — the same person as #439 Hāḍāi Paṇḍita (Nityānanda's father; «also known as Hāḍāi
// Paṇḍita»), which already has its Gaṇoddeśa text (GGD 40): ask Whisper to join them.
// Corrected: #897 Mālatī = Bindumatī (GGD 176), not «Indumatī»; #918 Mīnaketana: GGD 68 says Niśaṭha and Ulmuka
// entered «him» (amum) — Vīracandra, of the verse before; Mīnaketana is an expansion of Saṅkarṣaṇa.
import fs from "node:fs";
const GGD = "Gaura-gaṇoddeśa-dīpikā";
const RKGD = "Rādhā-Kṛṣṇa-gaṇoddeśa-dīpikā";
const LIST_194 = `In verses 194–207 the ${GGD} names twenty-seven maidservants of Śrī Rādhā — «Mālatī, Candralatikā, Mañjumedhā, Varāṅgadā, Ratnāvalī, Kamalā, Guṇacūḍā, Sukeśinī, Karpūra-mañjarī, Śyāma-mañjarī, Śveta-mañjarī, Vilāsa-mañjarī, Kāmalekhā, Mauna-mañjarī, Gandhonmadā, Rasonmadā, Candrikā, Kalabhāṣiṇī, Gopālī, Hariṇī, Kālī, Kalākṣī, Nitya-mañjarī, Kalakaṇṭhī, Kuraṅgākṣī, Candrikā and Candraśekharā» — who «assuming male forms appeared among Lord Caitanya's associates», and then the devotees they became, *kramaśaḥ*, in the same order.`;
const JIVITA = `- **${RKGD}** (Laghu-bhāga 179–180):

> uktā jīvita-sakhyas tu lāsikā kelīkandalī
> kādambarī śaśimukhī candrarekhā priyamvadā
> madonmadā madhumatī vāsantī kalabhāṣiṇī
> ratnāvalī maṇimatī karpūralatikādayaḥ

«Lāsikā, Kelīkandalī, Kādambarī, Śaśimukhī, Candrarekhā, Priyamvadā, Madonmadā, Madhumatī, Vāsantī, Kalabhāṣiṇī, Ratnāvalī, Maṇimatī, Karpūralatikā and others are Śrī Rādhā's jīvita-sakhīs» — the friends who are Her very life.`;
const plan = [
  {
    id: 894,
    name: "Maheśa Paṇḍita",
    text: `## In Kṛṣṇa-līlā

**Mahābāhu**, a cowherd friend (*sakhā*) of Kṛṣṇa in Vraja.

## ${GGD} 129

> subāhur yo vraje gopo datta uddhāraṇākhyakaḥ
> maheśa-paṇḍitaḥ śrīmān mahābāhur vraje sakhā

«The devotee who had been the cowherd boy Subāhu in Vrajabhūmi appeared in Lord Caitanya's pastimes as Uddhāraṇa Datta. Lord Kṛṣṇa's cowherd friend Mahābāhu appeared in Lord Caitanya's pastimes as Śrīmān Maheśa Paṇḍita.»

## Sources

${GGD} 129.
`,
    remove: ["In Kṛṣṇa-līlā: Mahābāhu (Gaura-gaṇoddeśa-dīpikā 129)."],
  },
  {
    id: 897,
    name: "Mālatī",
    text: `## In Kṛṣṇa-līlā

**Bindumatī**, a gopī of Vraja who arranges the meetings of Śrī Rādhā and Śrī Kṛṣṇa — the mother of Kavi Karṇapūra, the author of the ${GGD}.

## ${GGD} 176

> purā vṛndāvane vīrā-dūtī sarvāś ca gopikāḥ
> nināya kṛṣṇa-nikaṭaṁ sedānīṁ janako mama
> vraje bindumatī yāsīd adya sā jananī mama

«The two gopīs Vīrā-devī and Dūtī-devī, who acted as messengers arranging the gopīs' meetings with Lord Kṛṣṇa, combined to appear as my father (Śivānanda Sena). The vraja-gopī Bindumatī appeared as my mother.»

## Bindumatī in the books

- **${RKGD}** (Laghu-bhāga 189):

> nāndīmukhī bindumatītyādyāḥ sandhi-vidhāyikāḥ

«Nāndīmukhī, Bindumatī and other sakhīs remove the jealous anger (māna) between Śrī Rādhā and Śrī Kṛṣṇa and arrange Their meeting.»

## Other opinions

- The record said «Indumatī»: the verse says **Bindumatī**.

## Sources

${GGD} 176; ${RKGD}, Laghu-bhāga 189.
`,
    replace: [[" and was Indumati in Kṛṣṇalīlā (Gaura-gaṇoddeśa- dīpikā  176).", "."]],
  },
  {
    id: 900,
    name: "Mālinī Ṭhākurāṇī",
    text: `## In Kṛṣṇa-līlā

**Ambikā**, Kṛṣṇa's wet nurse in Vraja — as now she treated Nityānanda as her son.

## ${GGD} 42

> nāmnāmbikā vraje dhātrī stanya-dātrī sthitā purā
> saiveyaṁ mālinī-nāmnī śrīvāsa-gṛhiṇī matā

«Ambikā, the nurse who fed infant Kṛṣṇa with her own breast milk in Vraja, appeared during Lord Caitanya's pastimes as Mālinī-devī, the wife of Śrīvāsa Paṇḍita.»

## Ambikā in the books

- **${RKGD}** (Bṛhad-bhāga 64):

> ambikā ca kilimbā ca dhātṛke stanya-dāyike
> ambikeyaṁ tayor mukhyā vrajeśvaryāḥ priyā sakhī

«Ambikā and Kilimbā are Śrī Kṛṣṇa's wet nurses, and they breast-feed Him. Ambikā, who is a dear friend to Vrajeśvarī (Śrī Yaśodā), is senior to Kilimbā.»
- **${RKGD}** (Laghu-bhāga 26): her son **Vijayākṣa** is the leader of Kṛṣṇa's suhṛt-sakhās; she received him by worshipping the goddess Ambikā.

## Sources

${GGD} 42; ${RKGD}, Bṛhad-bhāga 64.
`,
    replace: [[" In Kṛṣṇa-līlā: Ambikā, Kṛṣṇa's nurse in Vraja (Gaura-gaṇoddeśa-dīpikā 42).", ""]],
  },
  {
    id: 901,
    name: "Mamu Ṭhākura (Jagannātha Cakravartī)",
    text: `## In Kṛṣṇa-līlā

**Kalabhāṣiṇī**, one of Śrī Rādhā's maidservants.

## ${GGD} 194–207

> gandhonmadā rasonmadā candrikā kalabhāṣiṇī
> …
> gaṅgā-mantrī jagannātho māmūpādhir dvijottamaḥ

${LIST_194} So Kalabhāṣiṇī, the eighteenth maidservant, is the eighteenth devotee: «Jagannātha Māmu, who was a very elevated brāhmaṇa».

## Kalabhāṣiṇī in the books

${JIVITA}

## Sources

${GGD} 194–207; ${RKGD}, Laghu-bhāga 179–180.
`,
    replace: [[" In Kṛṣṇa-līlā: Kalabhāṣiṇī (Gaura-gaṇoddeśa-dīpikā 196, 205).", ""]],
  },
  {
    id: 918,
    name: "Mīnaketana Ramdasa",
    text: `## In Kṛṣṇa-līlā

An expansion (*vyūha*) of **Lord Saṅkarṣaṇa** (Balarāma).

## ${GGD} 67–68

> saṅkarṣaṇasya yo vyūhaḥ payo-viṣayi-nāmakaḥ
> sa eva vīracandro 'bhūc caitanyābhinna-vigrahaḥ
> amuṁ praviśatāṁ kāryāt sahajau niśaṭholmukau
> mīnaketana-rāmādi-vyūhaḥ saṅkarṣaṇo 'paraḥ

«The expansion of Lord Saṅkarṣaṇa known as Lord Kṣīrodakaśāyī Viṣṇu appeared in Lord Caitanya's pastimes as Vīracandra Prabhu. Lord Vīracandra was non-different from Lord Caitanya Himself.» (67) «… Mīnaketana Rāmadāsa and others were also incarnations of Lord Saṅkarṣaṇa.» (68)

## Other opinions

- The record said he was also **Niśaṭha and Ulmuka** (Balarāma's sons). The verse says that the two brothers Niśaṭha and Ulmuka entered *amum*, «him» — Vīracandra, of the verse before; the English translation reads it otherwise.

## Sources

${GGD} 67–68.
`,
    replace: [[" He was Nisatha and Ulluka in Kṛṣṇa līlā (Gaura- gaṇoddeśa-dīpikā  68, Caitanya Caritāmṛta. 1.11.53, Caitanya Caritāmṛta. 1.5.170, 1.5.163-167).", " (Caitanya Caritāmṛta 1.11.53, 1.5.163-170)."]],
    remove: ["In Kṛṣṇa-līlā: an expansion of Saṅkarṣaṇa; Niśaṭha and Ulmuka entered him (Gaura-gaṇoddeśa-dīpikā 68)."],
  },
  {
    id: 931,
    name: "Mukunda Datta",
    text: `## In Kṛṣṇa-līlā

**Madhukaṇṭha**, a singer of Vraja; his brother Vāsudeva Datta was Madhuvrata.

## ${GGD} 140

> vraje sthitau gāyakau yau madhukaṇṭha-madhuvratau
> mukunda-vāsudevau tau dattau gaurāṅga-gāyakau

«Madhukaṇṭha and Madhuvrata, who were singers in Vrajabhūmi, later appeared as Mukunda Datta and Vāsudeva Datta, two famous singers in Lord Caitanya's kīrtana party.»

## Madhukaṇṭha in the books

- **${RKGD}** (Laghu-bhāga 73–74): Madhukaṇṭha and Madhuvrata are among Kṛṣṇa's *ceṭas* — «Bhaṅgura, Bhṛṅgāra, Sāndhika, Grahila, Raktaka, Patraka, Patrī, **Madhukaṇṭha**, Madhuvrata…», who carry His flute, horn and stick.

## Sources

${GGD} 140; ${RKGD}, Laghu-bhāga 73–74.
`,
    remove: ["In Kṛṣṇa-līlā: Madhukaṇṭha, a singer of Vraja (Gaura-gaṇoddeśa-dīpikā 140)."],
  },
  {
    id: 939,
    name: "Mukunda Sarakāra (Mukunda dāsa)",
    text: `## In Kṛṣṇa-līlā

**Vṛndā-devī**, the presiding goddess of Vraja, who arranges the meetings of Śrī Rādhā and Śrī Kṛṣṇa.

## ${GGD} 175

> vrajādhikāriṇī yāsīd vṛndā-devī tu nāmataḥ
> sā śrī-mukunda-dāso 'dya khaṇḍa-vāsaḥ prabhu-priyaḥ

«Śrīmatī Vṛndā-devī, the presiding deity of Vrajabhūmi, appeared as Śrī Mukunda dāsa, who lived in the village of Śrīkhaṇḍa and was very dear to the Lord.»

## Vṛndā in the books

- **${RKGD}** (Laghu-bhāga 96–98):

> tapta-kāñcana-varṇābhā vṛndā kāntir manoharā
> nīla-vastra-paridhānā muktā-puṣpa-virājitā

«Vṛndā's bodily complexion is attractive like molten gold. She wears blue garments and is decorated with pearls and flowers. Vṛndā's father is Candrabhānu and her mother's name is Phullarā. Her husband's name is Mahīpāla and her sister is Mañjarī. Vṛndā always resides in Vṛndāvana. She is eager to relish many kinds of ecstatic pastimes as well as to arrange meetings between Śrī Rādhā and Śrī Kṛṣṇa. She is always immersed in love for Them.»
- **${RKGD}** (Bṛhad-bhāga 217–218): Vṛndā is the foremost of the messengers (*dūtikās*).

## Sources

${GGD} 175; ${RKGD}, Laghu-bhāga 96–98, Bṛhad-bhāga 217–218.
`,
    remove: ["In Kṛṣṇa-līlā: Vṛndā-devī (Gaura-gaṇoddeśa-dīpikā 175)."],
  },
  {
    id: 950,
    name: "Murāri Gupta Ṭhākura",
    text: `## In Kṛṣṇa-līlā

**Hanumān**, the servant of Lord Rāmacandra, in Rāma-līlā.

## ${GGD} 91

> murāri-gupto hanumān aṅgadaḥ śrī-purandaraḥ
> yaḥ śrī-sugrīva-nāmāsīd govindānanda eva saḥ

«The devotee named Murāri Gupta in Lord Caitanya's pastimes had previously been Hanumān. In the same way Śrī Purandara had previously been Aṅgada, and Govindānanda had been Sugrīva.»

## Sources

${GGD} 91.
`,
    remove: ["In Kṛṣṇa-līlā: Hanumān (Gaura-gaṇoddeśa-dīpikā 91)."],
  },
  {
    id: 961,
    name: "Nakula Brahmacārī",
    text: `## In Kṛṣṇa-līlā

Not a person of Vraja: **Lord Gaura Himself** entered him — a manifestation (*āvirbhāva*) of the Lord.

## ${GGD} 73

> …
> āvirbhāvo gaura-harer nakula-brahmacāriṇi

«A particle of Lord Caitanya entered the body of Nakula Brahmacārī. In this way Nakula Brahmacārī became a śakty-āveśa incarnation of the Lord.» The first half of the verse (*śaśirekhā tam āviśat*) the English translation reads as «a particle of moonlight» entering Nakula; others read it as the sakhī Śaśirekhā entering Vakreśvara Paṇḍita, of the verses before.

## Sources

${GGD} 73.
`,
    remove: ["In Kṛṣṇa-līlā: Lord Gaura manifested in him (āvirbhāva) (Gaura-gaṇoddeśa-dīpikā 73)."],
  },
  {
    id: 967,
    name: "Nandāi",
    text: `## In Kṛṣṇa-līlā

**Vārida**, a servant of Kṛṣṇa who brought Him water; Rāmāi was Payoda.

## ${GGD} 139

> payoda-vāridau prāg yau nīra-saṁskāra-kāriṇau
> tāv adya bhṛtyau rāmāir nandāiś ceti viśrutau

«The two cowherds Payoda and Vārida, who had formerly performed the nīra-saṁskāra ceremony for Lord Kṛṣṇa, later appeared as Rāmāi and Nandāi, two famous servants of Lord Caitanya.»

## Vārida in the books

- **${RKGD}** (Laghu-bhāga 77):

> payoda-vāridādyaś ca nīra-saṁskāra-kāriṇaḥ

«Payoda, Vārida and other servants bring vessels filled with water for Śrī Kṛṣṇa's use.»

## Sources

${GGD} 139; ${RKGD}, Laghu-bhāga 77.
`,
    remove: ["In Kṛṣṇa-līlā: Vārida, a servant of Kṛṣṇa (Gaura-gaṇoddeśa-dīpikā 139)."],
  },
  {
    id: 970,
    name: "Nandana Ācārya",
    text: `## In Kṛṣṇa-līlā

**Hariṇī**, one of Śrī Rādhā's maidservants — according to the Gauḍīya Vaiṣṇava Abhidhāna. The ${GGD} does not name him.

## Other opinions

- In the ${GGD} (194–207) Hariṇī, the twentieth of the twenty-seven maidservants of Śrī Rādhā, became the twentieth devotee of the list: **Hastigopāla** (his own record).

## Sources

Gauḍīya Vaiṣṇava Abhidhāna; ${GGD} 194–207.
`,
    remove: ["In Kṛṣṇa-līlā: Hariṇī (Gauḍīya Vaiṣṇava Abhidhāna)."],
  },
  {
    id: 974,
    name: "Nandinī Dāsī",
    text: `## In Kṛṣṇa-līlā

**Jayā** (with Jaṅgalī, who was Vijayā).

## ${GGD} 89

> nandinī jaṅgalī jñeyā jayā ca vijayā kramāt

«The devotees Nandinī and Jaṅgalī who were associates of Lord Caitanya had previously been Jayā and Vijayā in Lord Kṛṣṇa's pastimes» (*kramāt*, respectively).

## Sources

${GGD} 89.
`,
    remove: ["In Kṛṣṇa-līlā: Jayā (Jaṅgalī was Vijayā) (Gaura-gaṇoddeśa-dīpikā 89)."],
  },
  {
    id: 980,
    name: "Śrī Narahari Sarakāra Ṭhākura",
    text: `## In Kṛṣṇa-līlā

**Madhumatī**, a dear friend (*prāṇa-sakhī*) of Śrī Rādhā — the sakhī who supplies honey, as he turned a pond into honey for the Lord.

## ${GGD} 177

> purā madhumatī prāṇa-sakhī vṛndāvane sthitā
> adhunā narahary-ākhyaḥ sarakāraḥ prabhoḥ priyaḥ

«Śrīmatī Rādhārāṇī's dear friend, the vraja-gopī named Madhumatī-devī, appeared as Narahari Sarakāra, who was very dear to Lord Caitanya.»

## Madhumatī in the books

${JIVITA}

## Sources

${GGD} 177; ${RKGD}, Laghu-bhāga 179–180.
`,
    remove: ["In Kṛṣṇa-līlā: Madhumatī, Rādhā's sakhī who supplies honey."],
  },
  {
    id: 1004,
    name: "Nārāyaṇa Vācaspati",
    text: `## In Kṛṣṇa-līlā

**Gaurasenī**, a gopī of Vraja.

## ${GGD} 168

> gaurasenī purā nārāyaṇa-vācaspatiḥ kṛtī
> pītāmbaras tu kāverī sukeśī makaradhvajaḥ

«Gaurasenī-gopī appeared as the saintly devotee Nārāyaṇa Vācaspati. Kāverī-gopī appeared as Pītāmbara, and Sukeśī-gopī appeared as Makaradhvaja.»

## Other opinions

- The record said «Saureseni»: the verse says **Gaurasenī**.

## Sources

${GGD} 168.
`,
    replace: [
      [" In Kṛṣṇalīlā he was Saureseni.", ""],
      ["(Gauragaṇoddeśadīpikā 168, Namamrtasamudra 146)", "(Namamrtasamudra 146)"],
    ],
    remove: ["In Kṛṣṇa-līlā: Gauraseni (Gaura-gaṇoddeśa-dīpikā 168)."],
  },
];
fs.writeFileSync(new URL("./tanda7.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length + " fichas");
