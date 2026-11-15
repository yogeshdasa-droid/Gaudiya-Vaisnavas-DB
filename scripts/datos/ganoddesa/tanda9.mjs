// node tanda9.mjs → tanda9.json (Gaṇoddeśa, tanda 9). The books of Info take precedence.
// Left out (like #558: no book of Info says it): #1204 Raghunātha Bipra («Varāṅganā», from Kṛṣṇadāsa Kavirāja's
// Caitanya-gaṇoddeśa-dīpikā manuscript; the GGD's Varāṅgadā is Raghunātha Dvija #260), #1289 Rāmānujācārya
// («Lakṣmaṇa / Ananta Śeṣa»).
// #1139 Puruṣottama dāsa: the GGD has two — Puruṣottama dāsa = Stoka-kṛṣṇa (130) and «Nāgara Puruṣottama, son of
// Sadāśiva, of a vaidya family» = Dāma (131); the record (son of Sadāśiva Kavirāja) fits 131: both shown.
import fs from "node:fs";
const GGD = "Gaura-gaṇoddeśa-dīpikā";
const RKGD = "Rādhā-Kṛṣṇa-gaṇoddeśa-dīpikā";
const LIST_194 = `In verses 194–207 the ${GGD} names twenty-seven maidservants of Śrī Rādhā — «Mālatī, Candralatikā, Mañjumedhā, Varāṅgadā, Ratnāvalī, Kamalā, Guṇacūḍā, Sukeśinī, Karpūra-mañjarī, Śyāma-mañjarī, Śveta-mañjarī, Vilāsa-mañjarī, Kāmalekhā, Mauna-mañjarī, Gandhonmadā, Rasonmadā, Candrikā, Kalabhāṣiṇī, Gopālī, Hariṇī, Kālī, Kalākṣī, Nitya-mañjarī, Kalakaṇṭhī, Kuraṅgākṣī, Candrikā and Candraśekharā» — who «assuming male forms appeared among Lord Caitanya's associates», and then the devotees they became, *kramaśaḥ*, in the same order.`;
const JAYANTEYA = `## In Kṛṣṇa-līlā

One of the nine **Jāyanteyas** (the nine Yogendras, sons of Ṛṣabha), who spoke the Bhāgavata teachings to King Janaka (Nimi) and appeared as nine sannyāsīs around Lord Caitanya.

## ${GGD} 98–101

> jāyanteyāḥ sthitā ūrdhva-retasaḥ sama-darśinaḥ
> nava bhāgavatāḥ pūrvaṁ śrī-bhāgavata-saṁhitām
> …
> garuḍākhyāvadhūtaś ca śrī-gopendrākhya āśramaḥ

«The nine Jāyanteyas, who were fixed in celibacy and equal vision, and who spoke the Śrī Bhāgavata-saṁhitā to Janaka Ṛṣi, appeared on this earth as nine sannyāsīs, and continually performed pastimes with Lord Caitanya. Their names were: Śrī Nṛsiṁhānanda Tīrtha, Śrī Satyānanda Bhāratī, Śrī Nṛsiṁha Tīrtha, Śrī Cidānanda Tīrtha, Śrī Jagannātha Tīrtha, Śrī Vāsudeva Tīrtha, Śrī Rāma Tīrtha, Śrī Puruṣottama Tīrtha, and Śrī Garuḍa Avadhūta, who was also known as Śrī Gopendra Āśrama.» The verse does not say which Jāyanteya each one was.

## Sources

${GGD} 98–101.
`;
const V37 = `## ${GGD} 37

> purā yaśodā-vraja-rāja-nandau vṛndāvane prema-rasākarau yau
> śacī-jagannātha-purandarābhidhau babhūvatus tau na ca saṁśayo 'tra

«Śrīmatī Yaśodā-devī and Vraja's king Nanda, who had been like two great oceans of the nectar of love for Kṛṣṇa during the Lord's pastimes in Vṛndāvana, appeared during Lord Caitanya's pastimes as Śrīmatī Śacī-devī and Śrīmān Jagannātha Purandara. Of this there is no doubt.»

## ${GGD} 38–39

> amū āviśatām eva devāv aditi-kaśyapau
> …
> anyathā rāma-mūrteḥ śrī-viśvarūpasya nodbhavaḥ

«Some devotees say that the two demigods Aditi and Kaśyapa, who incarnated as Kauśalyā and Daśaratha, Pṛśni and Sutapā, and also as Devakī and Vasudeva, the parents of Balarāma and Kṛṣṇa, also entered the bodies of Śacī-devī and Jagannātha. These devotees say that if this were not so, then it would not have been possible for Balarāma to take birth as their son Viśvarūpa.»`;
const plan = [
  {
    id: 1139,
    name: "Puruṣottama Dāsa",
    text: `## In Kṛṣṇa-līlā

**Stoka-kṛṣṇa**, a cowherd friend of Kṛṣṇa, «a small Kṛṣṇa» — or **Dāma**, another cowherd friend, if he is «Nāgara Puruṣottama, the son of Sadāśiva» (see below).

## ${GGD} 130

> stokakṛṣṇaḥ sakhā prāg yo dāsaḥ śrī-puruṣottamaḥ

«Lord Kṛṣṇa's cowherd friend Stokakṛṣṇa appeared in Lord Caitanya's pastimes as Śrī Puruṣottama dāsa.»

## ${GGD} 131

> sadāśiva-suto nāmnā nāgaraḥ puruṣottamaḥ
> vaidya-vaṁśodbhavo dāmā yo ballavaḥ sakhā vraje

«Dāma-gopa, who had been Lord Kṛṣṇa's cowherd friend in Vraja, appeared in Lord Caitanya's pastimes as Nāgara Puruṣottama. Nāgara Puruṣottama was born in a family of physicians, and his father's name was Sadāśiva.»

## Other opinions

- The ${GGD} counts two: Puruṣottama dāsa (Stoka-kṛṣṇa) and Nāgara Puruṣottama, son of Sadāśiva, of a vaidya family (Dāma). This record — son of Sadāśiva Kavirāja, of a vaidya family of Nāgaradeśa — fits the second; Śrīla Prabhupāda calls him Nāgara Puruṣottama. The Bhaktamāla (3) gives Stoka-kṛṣṇa.

## Stoka-kṛṣṇa and Dāma in the books

- **${RKGD}** (Laghu-bhāga 31–33): «Śrīdāmā, **Dāmā**, Sudāmā, Vasudāmā, Kiṅkiṇī, Bhadrasena, Aṁśumāna, **Stoka-kṛṣṇa**, Vilāsī, Puṇḍarīka, Viṭaṅkākṣa, Kalaviṅka and Priyaṅkara are Śrī Kṛṣṇa's priya-sakhās. These sakhās are of the same age as Śrī Kṛṣṇa.»

> stoka-kṛṣṇo yathārthākhyaḥ kṛṣṇasya pratyanantaraḥ

«Stoka-kṛṣṇa has a suitable name, for he is like a small (stoka) Kṛṣṇa, always following under the guidance of Śrī Kṛṣṇa.» (33)
- **${RKGD}** (Bṛhad-bhāga 108): his mother is the gopī Sucandrā.

## Sources

${GGD} 130–131; ${RKGD}, Laghu-bhāga 31–33, Bṛhad-bhāga 108; Bhaktamāla 3.
`,
    remove: ["In Kṛṣṇa-līlā: Stoka-kṛṣṇa (Gaura-gaṇoddeśa-dīpikā 130; Bhaktamāla 3)."],
  },
  { id: 1140, name: "Puruṣottama Tīrtha", text: JAYANTEYA },
  { id: 1234, name: "Rāma Tīrtha", text: JAYANTEYA },
  {
    id: 1186,
    name: "Rāghava Gosvāmī",
    text: `## In Kṛṣṇa-līlā

**Campakalatā**, the third of Śrī Rādhā's eight principal sakhīs, «who considered Śrī Rādhā as dear as her own life-breath».

## ${GGD} 162

> śrī-rādhā-prāṇa-rūpā yā śrī-campakalatā vraje
> sādya rāghava-gosvāmī govardhana-kṛta-sthitiḥ
> bhakti-ratna-prakāśākhyo grantho yena vinirmitaḥ

«Śrīmatī Campakalatā-gopī, who considered Śrīmatī Rādhārāṇī as dear as her own life-breath, appeared as Rāghava Gosvāmī, who lived at Govardhana Hill and wrote the book entitled Bhakti-ratna-prakāśa.»

## Campakalatā in the books

- **${RKGD}** (Bṛhad-bhāga 86–87):

> tṛtīyā campakalatā phulla-campaka-dīdhitiḥ
> ekenāhnā kaniṣṭheyaṁ cāṣa-pakṣa-nibhāmbarā

«The third of the variṣṭha sakhīs is Campakalatā. Her bodily lustre resembles that of a blooming campaka flower. She is one day younger than Śrī Rādhikā. Her clothes are like the colour of the blue jay bird (cāṣa). Campakalatā's father is Ārāma and her mother is Vāṭikā. Her husband's name is Caṇḍākṣa. She is almost like Viśākhā by her qualities.»

## Sources

${GGD} 162; ${RKGD}, Bṛhad-bhāga 86–87.
`,
    replace: [
      [" (past name Campaklata)", ""],
      ["He was Campaklata in his past incarnation (Gaura-gaṇoddeśa-dīpikā 162). ", ""],
    ],
  },
  {
    id: 1191,
    name: "Raghu Miśra",
    text: `## In Kṛṣṇa-līlā

**Karpūra-mañjarī**, one of Śrī Rādhā's maidservants.

## ${GGD} 194–207

> karpūra-mañjarī śyāma-mañjarī śveta-mañjarī
> …
> subuddhi-miśraḥ śrīharṣo raghu-miśro dvijottamaḥ

${LIST_194} So Karpūra-mañjarī, the ninth maidservant, is the ninth devotee: «Raghu Miśra, who was the best of the brāhmaṇas».

## Sources

${GGD} 194–207.
`,
    replace: [[" and was Karpūra-  mañjarī in Vrajalīlā (Gaura-gaṇoddeśa-dīpikā 195,201)", ""]],
  },
  {
    id: 1200,
    name: "Raghunandana Ṭhākura",
    text: `## In Kṛṣṇa-līlā

**Pradyumna** (Kandarpa), the third member of the Catur-vyūha, who in Vraja was a **priya-narma-sakhā** of Śrī Śrī Rādhā-Mādhava, helping in Their pastimes.

## ${GGD} 70

> vyūhas tṛtīyaḥ pradyumnaḥ priya-narma-sakho 'bhavat
> cakre līlā-sahāyaṁ yo rādhā-mādhavayor vraje
> śrī-caitanyādvaita-tanuḥ sa eva raghunandanaḥ

«Lord Pradyumna, the third member of the Catur-vyūha, had formerly appeared in Vrajabhūmi as a close (priya-narma-sakhā) friend of Śrī Śrī Rādhā-Mādhava, where he helped in Their transcendental pastimes. That same Lord Pradyumna appeared in Lord Caitanya's pastimes as Śrī Raghunandana Ṭhākura, who was non-different from both Lord Caitanya and Lord Advaita.»

## Other opinions

- The Gauḍīya Vaiṣṇava Abhidhāna names the priya-narma-sakhā: **Ujjvala** — in the ${RKGD} (Laghu-bhāga 41) one of the priya-narma-sakhās: «Subala, Arjuna, Gandharva, Vasanta, **Ujjvala**, Kokila, Sanandana, Vidagdha…».
- Some say **Kandarpa-mañjarī** (in the ${RKGD}, Bṛhad-bhāga 98, one of the eight *vara* sakhīs).

## Sources

${GGD} 70; ${RKGD}, Laghu-bhāga 41, Bṛhad-bhāga 98; Gauḍīya Vaiṣṇava Abhidhāna.
`,
    remove: ["In Kṛṣṇa-līlā: Pradyumna (Kandarpa, Kṛṣṇa's son in Dvārakā) and the priya-narma-sakhā Ujjvala (Gaura-gaṇoddeśa-dīpikā 70; Abhidhāna); some say Kandarpa-mañjarī."],
  },
  {
    id: 1215,
    name: "Raghunātha",
    text: `## In Kṛṣṇa-līlā

One of the **eight mystic perfections** (*siddhis*) of Vṛndāvana — as Raghunātha Purī.

## ${GGD} 96–97

> vṛndāvane yāḥ prāg āsann aṇimādy-aṣṭa-siddhayaḥ
> tā evāṣṭau bhakta-rūpā bhūtā gauḍe ca te yathā
> anantaś ca sukhānando govindo raghunāthakaḥ
> kṛṣṇānandaḥ keśavaś ca śrī-dāmodara-rāghavau
> pury-upādhi-kramāj jñeyā aṇimādy-aṣṭa-siddhayaḥ

«The eight mystic powers, beginning with aṇimā-siddhi, which had formerly appeared in Vṛndāvana, took birth in Bengal during Lord Caitanya's pastimes as the eight devotees Ananta, Sukhānanda, Govinda, Raghunātha, Kṛṣṇānanda, Keśava, Dāmodara and Rāghava. All these devotees bore the title Purī after their names.»

In that order (*kramāt*) Raghunātha Purī is the fourth perfection. The verse names only the first, aṇimā; the books list the others in different orders (the fourth is prāpti, «obtaining anything», in the Bhāgavata's list, and prākāmya, «fulfilling any wish», in another), so which one he was is not certain.

## Sources

${GGD} 96–97.
`,
  },
  {
    id: 1247,
    name: "Rāmacandra Purī",
    text: `## In Kṛṣṇa-līlā

**Vibhīṣaṇa**, of Rāma-līlā — but Lord Caitanya Himself said that **Jaṭilā**, Śrī Rādhā's mother-in-law, had entered him: so he restricted the Lord's eating.

## ${GGD} 92–93

> vibhīṣaṇo yaḥ prāg āsīd rāmacandra-purī smṛtaḥ
> uvācāto gaura-harir naitad rāmasya kāraṇam
> jaṭilā rādhikā-śvaśrūḥ kāryato 'viśad eva tam
> ato mahāprabhur bhikṣā-saṅkocādi tato 'karot

«The devotee named Rāmacandra Purī in Lord Caitanya's pastimes had previously been Vibhīṣaṇa.» «Lord Caitanya Himself did not accept that Rāmacandra Purī was the incarnation of Vibhīṣaṇa, but the Lord Himself said that Rāmacandra Purī was the empowered incarnation of Śrīmatī Rādhārāṇī's mother-in-law Jaṭilā. This Rāmacandra Purī restricted Lord Caitanya in His acceptance of alms.»

## Sources

${GGD} 92–93.
`,
    remove: ["In Kṛṣṇa-līlā: Vibhīṣaṇa; but Lord Caitanya said Jaṭilā, Rādhā's mother-in-law, entered him (Gaura-gaṇoddeśa-dīpikā 92-93)."],
  },
  {
    id: 1268,
    name: "Rāmāi (servant of the Lord in Purī)",
    text: `## In Kṛṣṇa-līlā

**Payoda**, a servant of Kṛṣṇa who brought Him water — as now he filled twenty-two pots of water every day; Nandāi was Vārida.

## ${GGD} 139

> payoda-vāridau prāg yau nīra-saṁskāra-kāriṇau
> tāv adya bhṛtyau rāmāir nandāiś ceti viśrutau

«The two cowherds Payoda and Vārida, who had formerly performed the nīra-saṁskāra ceremony for Lord Kṛṣṇa, later appeared as Rāmāi and Nandāi, two famous servants of Lord Caitanya.»

## Payoda in the books

- **${RKGD}** (Laghu-bhāga 77):

> payoda-vāridādyaś ca nīra-saṁskāra-kāriṇaḥ

«Payoda, Vārida and other servants bring vessels filled with water for Śrī Kṛṣṇa's use.»

## Sources

${GGD} 139; ${RKGD}, Laghu-bhāga 77.
`,
    replace: [[" He was Payoda in his past incarnation (Gaura- gaṇoddeśa- dīpikā 139).", ""]],
    remove: ["In Kṛṣṇa-līlā: Payoda, a servant of Kṛṣṇa (Gaura-gaṇoddeśa-dīpikā 139)."],
  },
  {
    id: 1279,
    name: "Rāmānanda Basu",
    text: `## In Kṛṣṇa-līlā

**Kalakaṇṭhī**, one of the two dancers and singers (*gandharvas*) of Vraja — Satyarāja Khān of Kulīna-grāma was the other, Sukaṇṭhī.

## ${GGD} 173

> kalakaṇṭhī-sukaṇṭhyau ye vraje gāndharva-nāṭike
> rāmānanda-vasu-satya-rājau cāpi yathā-yatham

«Kalakaṇṭhī-devī and Sukaṇṭhī-devī, the two Gandharva-dancers who appeared in Vrajabhūmi, also appeared as Rāmānanda Vasu and Satyarāja.»

## Kalakaṇṭhī in the books

- **${RKGD}** (Laghu-bhāga 191):

> kalāvatyo rasollāsā guṇatuṅgā smaroddhurāḥ
> gandharvās tu kalākaṇṭhī sukaṇṭhī pikakaṇṭhikā
> yā viśākhā-kṛta-gītīr gāyantyaḥ sukha-dā hareḥ

«Rasollāsā, Guṇatuṅgā, Smaroddhurā, Kalākaṇṭhī, Sukaṇṭhī and Pikakaṇṭhī are experts in singing, playing musical instruments and other similar arts. They are therefore Śrī Rādhā's gandharva-sakhīs — Her musicians», who sing the songs composed by Viśākhā.

## Other opinions

- The ${GGD} (194–207) also has a Kalakaṇṭhī among Śrī Rādhā's maidservants, who became **Kavidatta**.

## Sources

${GGD} 173; ${RKGD}, Laghu-bhāga 191.
`,
    replace: [[" In his past incarnation he was Kalakanthi of Vraja (Gaura-gaṇoddeśa-dīpikā  173).", ""]],
  },
  {
    id: 1311,
    name: "Ratnākar Paṇḍit",
    text: `## In Kṛṣṇa-līlā

One of the **nine treasures (*nidhis*) of Kuvera** — «Kharva-nidhi», according to the record.

## ${GGD} 102–103

> loke ye nidhayaḥ khyātāḥ padma-śaṅkhādayo nava
> …
> śrīmān ācāryaratnaś ca śrī-ratnākara-paṇḍitaḥ

«Kuvera's famous nine treasures, which include his conch and lotus, took birth during Lord Caitanya's pastimes as the nine sons of Nidhiratna-devī. They were all very dear to the Lord. Their names were Śrīnidhi, Śrīgarbha, Kaviratna, Sudhānidhi, Vidyānidhi, Guṇanidhi, the learned brāhmaṇa Ratnabāhu, Śrīmān Ācāryaratna, and Śrī Ratnākara Paṇḍita.» The verse does not say which treasure each one is.

## Sources

${GGD} 102–103.
`,
    replace: [[" In his past incarnation he was Kharvanidhi (Gaura-gaṇoddeśa-dīpikā,103)", ""]],
  },
  {
    id: 1313,
    name: "Ratnāvatī Devī (Navakumārī Devī)",
    text: `## In Kṛṣṇa-līlā

**Kīrtidā**, Śrī Rādhā's mother — as now she was the mother of Gadādhara Paṇḍita, who was Rādhā; her husband Mādhava Miśra was a manifestation of Vṛṣabhānu.

## ${GGD} 57

> tat-prakāśa-viśeṣo 'pi miśraḥ śrī-mādhavo mataḥ
> ratnāvatī tu tat-patnī kīrtidā kīrtitā budhaiḥ

«Mahārāja Vṛṣabhānu also appeared as Śrī Mādhava Miśra. Ratnāvatī-devī, his wife, is considered by the learned devotees to be the incarnation of Kīrtidā-devī, the wife of Mahārāja Vṛṣabhānu.»

## Kīrtidā in the books

- **${RKGD}** (Laghu-bhāga 168b–169a): «Śrī Rādhā's mother is Śrī Kīrttidā-sundarī. She is famous throughout the world as **Ratnagarbhā**.»
- **${RKGD}** (Bṛhad-bhāga 29): Kīrttidā is one of Yaśodā's dearest friends.

## Other opinions

- The English translation of verse 57 makes Ratnāvatī the wife of **Puṇḍarīka Vidyānidhi** (also Vṛṣabhānu, verse 54).

## Sources

${GGD} 54–57; ${RKGD}, Laghu-bhāga 168b–169a, Bṛhad-bhāga 29.
`,
    remove: ["In Kṛṣṇa-līlā: Kīrtidā, Rādhā's mother (as wife of Mādhava Miśra, a manifestation of Vṛṣabhānu) (Gaura-gaṇoddeśa-dīpikā 57)."],
  },
  {
    id: 1322,
    name: "Rudra Paṇḍit",
    text: `## In Kṛṣṇa-līlā

**Varūthapa**, a cowherd friend (*sakhā*) of Kṛṣṇa in Vraja.

## ${GGD} 135

> varūthapaḥ sakhā nāmnā kṛṣṇacandrasya yo vraje
> āsīt sa eva gaurāṅga-vallabho rudra-paṇḍitaḥ

«The cowherd boy Varūthapa, who was a close friend of Lord Kṛṣṇacandra in Vrajabhūmi, appeared as Rudra Paṇḍita, who was very dear to Lord Caitanya.»

## Varūthapa in the books

- **${RKGD}** (Laghu-bhāga 29–30): «Viśāla, Vṛṣabha, Ojasvī, Devaprastha, **Varūthapa**, Mandāra, Kusumāpīḍa, Maṇibandha, Karandhama, Mandara, Candana, Kunda, Kalinda, Kulika and other sakhās are younger than Śrī Kṛṣṇa. They are very enthusiastic in serving Him.»

## Sources

${GGD} 135; ${RKGD}, Laghu-bhāga 29–30.
`,
    remove: ["In Kṛṣṇa-līlā: Varūthapa (Gaura-gaṇoddeśa-dīpikā 135)."],
  },
  {
    id: 1336,
    name: "Śrī Śacī Devī",
    text: `## In Kṛṣṇa-līlā

**Yaśodā**, Kṛṣṇa's mother, the queen of Vraja. Some say that **Aditi** — who was also Kauśalyā and Pṛśni — and **Devakī** entered her too.

${V37}

## Yaśodā in the books

- **${RKGD}** (Bṛhad-bhāga 28–29):

> mātā gopa-yaśo-dātrī yaśodā śyāmala-dyutiḥ
> mūrttā vatsalatevāsau śakra-cāpa-nibhāmbarā

«Because she gives (dā) fame (yaśa) to the society of the cowherds, Śrī Kṛṣṇa's mother is called Yaśodā. Her bodily complexion is blackish blue (śyāmala). She is the very personification of parental love and her attire is colourful like the rainbow. Śrī Yaśodā's body is of medium size — neither plump nor thin. Her hair is quite long and black. Her best friends, who are as dear to her as her own life, are Aindavī and Kīrttidā.»

## Sources

${GGD} 37–39; ${RKGD}, Bṛhad-bhāga 28–29.
`,
    remove: ["In Kṛṣṇa-līlā: Yaśodā (Aditi, Kauśalyā, Pṛśni and Devakī are said to have entered her too) (Gaura-gaṇoddeśa-dīpikā 37-39)."],
  },
  {
    id: 1342,
    name: "Sadāśiva Kavirāja",
    text: `## In Kṛṣṇa-līlā

**Candrāvalī**, a gopī very dear to Kṛṣṇa — with Śrī Rādhā, the most prominent of His beloveds.

## ${GGD} 156

> purā candrāvalī yāsīd vraje kṛṣṇa-priyā parā
> adhunā gauḍa-deśe sā kavirājaḥ sadāśivaḥ

«Candrāvalī-gopī, who had been very dear to Lord Kṛṣṇa in Vrajabhūmi, appeared in Bengal as Sadāśiva Kavirāja.»

## Candrāvalī in the books

- **${RKGD}** (Laghu-bhāga 141–142):

> tatrāpi sarvathā śreṣṭhe rādhā-candrāvalīty ubhe
> yūthayos tu tayoḥ santi koṭi-saṅkhyā mṛgī-dṛśaḥ

«Out of all the gopīs in these groups, Rādhā, Candrāvalī, Bhadrā, Śyāmalā, Pālikā and others are Śrī Kṛṣṇa's pre-eminent beloveds due to their incomparably good qualities. Again among these gopīs, Śrī Rādhā and Śrī Candrāvalī are the two most prominent. Both of them have vast numbers of deer-eyed Vraja-damsels in their respective yūthas.»
- **${RKGD}** (Laghu-bhāga 190): «Candrāvalī is the famous leader of Śrī Rādhā's rival group.»

## Sources

${GGD} 156; ${RKGD}, Laghu-bhāga 141–142, 190.
`,
    remove: ["In Kṛṣṇa-līlā: Candrāvalī (Gaura-gaṇoddeśa-dīpikā 156)."],
  },
];
fs.writeFileSync(new URL("./tanda9.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length + " fichas");
