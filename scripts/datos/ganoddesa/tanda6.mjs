// node tanda6.mjs → tanda6.json (Gaṇoddeśa, tanda 6). The books of Info take precedence.
// Left out: #759 Kṛṣṇadāsa Kavirāja («Ratnarekhā / Kastūrī-mañjarī»: no book of Info says it), #760 Kṛṣṇadāsa Miśra and
// #892 Mahānta (no identity), #874 Madhu Paṇḍita («Maṇḍalī», from Rāmāi Paṇḍita's and Balarāma dāsa's gaṇoddeśas, not
// in Info) — like #558, left as they are (Whisper, 15-11-2026).
import fs from "node:fs";
const GGD = "Gaura-gaṇoddeśa-dīpikā";
const RKGD = "Rādhā-Kṛṣṇa-gaṇoddeśa-dīpikā";
const LIST_194 = `In verses 194–207 the ${GGD} names twenty-seven maidservants of Śrī Rādhā — «Mālatī, Candralatikā, Mañjumedhā, Varāṅgadā, Ratnāvalī, Kamalā, Guṇacūḍā, Sukeśinī, Karpūra-mañjarī, Śyāma-mañjarī, Śveta-mañjarī, Vilāsa-mañjarī, Kāmalekhā, Mauna-mañjarī, Gandhonmadā, Rasonmadā, Candrikā, Kalabhāṣiṇī, Gopālī, Hariṇī, Kālī, Kalākṣī, Nitya-mañjarī, Kalakaṇṭhī, Kuraṅgākṣī, Candrikā and Candraśekharā» — who «assuming male forms appeared among Lord Caitanya's associates», and then the devotees they became, *kramaśaḥ*, in the same order.`;
const V188 = `## ${GGD} 188

> kalāvatī rasollāsā guṇatuṅgā vraje sthitāḥ
> śrī-viśākhā-kṛtaṁ gītaṁ gāyanti smādya tā matāḥ
> govinda-mādhavānanda-vāsudevā yathā-kramam

«The vraja-gopīs Kalāvatī-devī, Rasollāsā-devī and Guṇatuṅgā-devī, who sang the songs composed by Viśākhā-devī, later appeared as Govinda, Mādhavānanda and Vāsudeva respectively.»`;
const plan = [
  {
    id: 699,
    name: "Kāśīśvara Brahmacārī (disciple of Īśvara Purī)",
    text: `## In Kṛṣṇa-līlā

**Bhṛṅgāra**, one of Kṛṣṇa's servants (*ceṭas*) in Vṛndāvana — with Govinda, who was Bhaṅgura. Also **Śaśirekhā**, a gopī of Vraja.

## ${GGD} 137

> purā vṛndāvane ceṭau sthitau bhṛṅgāra-bhaṅgurau
> śrī-kāśīśvara-govindau tau jātau prabhu-sevakau

«Bhṛṅgāra and Bhaṅgura, who had been Lord Kṛṣṇa's servants in Vṛndāvana, later appeared as Śrī Kāśīśvara and Śrī Govinda, the servants of Lord Caitanya Mahāprabhu.»

## ${GGD} 166

> śrī-kāśīśvara-gosvāmī śaśirekhā purā vraje
> …

«The vraja-gopī Śaśirekhā-devī appeared as Śrī Kāśīśvara Gosvāmī.»

## Bhṛṅgāra in the books

- **${RKGD}** (Laghu-bhāga 73–74):

> ceṭā bhaṅgura-bhṛṅgāra-sāndhika-grahilādayaḥ

«Bhaṅgura, Bhṛṅgāra, Sāndhika, Grahila, Raktaka, Patraka… and others are ceṭas. They carry Śrī Kṛṣṇa's possessions such as His veṇu, horn, muralī, stick and the rope used when milking cows. They present red ochre and other minerals to Śrī Kṛṣṇa.»

## Other opinions

- The Gauḍīya Vaiṣṇava Abhidhāna keeps this Kāśīśvara apart from **Kāśīśvara Paṇḍita** (Gaura-Govinda, his own record); then the «Kāśīśvara Gosvāmī» of verse 166 (Śaśirekhā) could be that one. Śrīla Prabhupāda and others take them as one.

## Sources

${GGD} 137, 166; ${RKGD}, Laghu-bhāga 73–74.
`,
    remove: ["In Kṛṣṇa-līlā: Bhṛṅgāra, Kṛṣṇa's servant; also the sakhī Śaśirekhā (Gaura-gaṇoddeśa-dīpikā 137, 166)."],
  },
  {
    id: 706,
    name: "Śrī Kavi Karṇapūra",
    text: `## In Kṛṣṇa-līlā

**Guṇacūḍā**, a sakhī — according to the Vaiṣṇavācāra-darpaṇa. His own ${GGD} does not name him.

## Guṇacūḍā in the books

- **${RKGD}** (Bṛhad-bhāga 246): one of the eight prominent sakhīs under **Tuṅgavidyā** — «Mañjumedhā, Sumadhurā, Sumadhyā, Madhurekṣaṇā, Tanumadhyā, Madhuspandā, **Guṇacūḍā** and Varāṅgadā».

## Other opinions

- In the ${GGD} (194–207) Guṇacūḍā, the seventh of the twenty-seven maidservants of Śrī Rādhā, became the seventh devotee of the list: **Subuddhi Miśra**.

## Sources

Vaiṣṇavācāra-darpaṇa; ${RKGD}, Bṛhad-bhāga 246; ${GGD} 194–207.
`,
    remove: ["In Kṛṣṇa-līlā: the sakhī Guṇacūḍā (Vaiṣṇavācāra-darpaṇa)."],
  },
  {
    id: 708,
    name: "Kavidatta",
    text: `## In Kṛṣṇa-līlā

**Kalakaṇṭhī**, one of Śrī Rādhā's maidservants.

## ${GGD} 194–207

> kalakaṇṭhī kuraṅgākṣī candrikā candraśekharā
> …
> kavidatto rāmadāsaś cirañjīva-sulocanau

${LIST_194} So Kalakaṇṭhī, the twenty-fourth maidservant, is the twenty-fourth devotee: Kavidatta (read with Hastigopāla and Vallabha as two devotees; the English translation joins them, and then he would be the twenty-third, Nitya-mañjarī).

## Kalakaṇṭhī in the books

- **${RKGD}** (Bṛhad-bhāga 248): one of the eight prominent sakhīs under **Raṅgadevī** — «**Kalakaṇṭhī**, Śaśikalā, Kamalā, Madhurā, Indirā, Kandarpa-sundarī, Kāmalatikā and Prema Mañjarī».
- **${RKGD}** (Laghu-bhāga 191): a Kalākaṇṭhī is among Śrī Rādhā's musicians (*gandharva-sakhīs*), who sing the songs composed by Viśākhā.

## Sources

${GGD} 194–207; ${RKGD}, Bṛhad-bhāga 248, Laghu-bhāga 191.
`,
    replace: [[", and was Kalakanthi in his Vraja incarnation (Gaura- gaṇoddeśa-dīpikā 197,204).", "."]],
  },
  {
    id: 713,
    name: "Śrī Keśava Bhāratī",
    text: `## In Kṛṣṇa-līlā

**Sāndīpani Muni**, Kṛṣṇa's teacher, who gave Him the sacred thread in Mathurā — as now he gave the Lord sannyāsa. Some say **Akrūra**.

## ${GGD} 52

> mathurāyāṁ yajña-sūtraṁ purā kṛṣṇāya yo muniḥ
> dadau sāndīpaniḥ so 'bhūd adya keśava-bhāratī

«The same person who appeared as Sāndīpani Muni, the sage who gave Lord Kṛṣṇa the sacred thread in Mathurā, has appeared in Lord Caitanya's pastimes as Keśava Bhāratī.»

## Sāndīpani in the books

- **${RKGD}** (Laghu-bhāga 99–100): Sāndīpani Muni is the father of **Nāndīmukhī** (her mother is Sumukhī, her brother Madhumaṅgala, her grandmother Paurṇamāsī).

## Other opinions

- **${GGD} 117:**

> purā yo 'krūra-nāmāsīt sa gopīnātha-siṁhakaḥ
> iti kecit prabhāṣante 'krūraḥ keśava-bhāratī

«Gopīnātha Siṁha was the incarnation of Akrūra. Some say that Keśava Bhāratī was the incarnation of Akrūra.»

## Sources

${GGD} 52, 117; ${RKGD}, Laghu-bhāga 99–100.
`,
    remove: ["In Kṛṣṇa-līlā: Sāndīpani Muni, who gave Kṛṣṇa the sacred thread; some say Akrūra (Gaura-gaṇoddeśa-dīpikā 52, 117)."],
  },
  {
    id: 718,
    name: "Keśava Purī",
    text: `## In Kṛṣṇa-līlā

**Īśitva-siddhi**, one of the eight mystic perfections of Vṛndāvana: the power to rule over others.

## ${GGD} 96–97

> vṛndāvane yāḥ prāg āsann aṇimādy-aṣṭa-siddhayaḥ
> tā evāṣṭau bhakta-rūpā bhūtā gauḍe ca te yathā
> anantaś ca sukhānando govindo raghunāthakaḥ
> kṛṣṇānandaḥ keśavaś ca śrī-dāmodara-rāghavau
> pury-upādhi-kramāj jñeyā aṇimādy-aṣṭa-siddhayaḥ

«The eight mystic powers, beginning with aṇimā-siddhi, which had formerly appeared in Vṛndāvana, took birth in Bengal during Lord Caitanya's pastimes as the eight devotees Ananta, Sukhānanda, Govinda, Raghunātha, Kṛṣṇānanda, Keśava, Dāmodara and Rāghava. All these devotees bore the title Purī after their names.»

In that order (*kramāt*) Keśava Purī, the sixth, is the sixth perfection, īśitva.

## Sources

${GGD} 96–97.
`,
    replace: [["  In his past incarnation he was Isitvasiddhi (Gaura-gaṇoddeśa-dīpikā 96-97).", ""]],
  },
  {
    id: 755,
    name: "Kṛṣṇadāsa Brahmacārī",
    text: `## In Kṛṣṇa-līlā

**Indulekhā**, the sixth of Śrī Rādhā's eight principal sakhīs.

## ${GGD} 164

> indulekhā vraje yāsīc chrī-rādhāyāḥ sakhī purā
> kṛṣṇadāsa-brahmacārī kṛta-vṛndāvana-sthitiḥ

«Indulekhā-gopī, who was Śrīmatī Rādhārāṇī's close friend in Vrajabhūmi, appeared as Kṛṣṇadāsa Brahmacārī, who resided in Vṛndāvana-dhāma.»

## Indulekhā in the books

- **${RKGD}** (Bṛhad-bhāga 92–93):

> indulekhā bhavet ṣaṣṭhī haritālojjvala-dyutiḥ
> dāḍimba-puṣpa-vasanā kaniṣṭhā vāsarais tribhiḥ

«Indulekhā is the sixth of the variṣṭha sakhīs. Her complexion is bright yellow. Her attire is like the colour of the [bright red] flowers of the pomegranate tree. She is three days younger than Śrī Rādhikā.» Her mother is Belā and her father Sāgara; she has the qualities of a *vāmā* and *prakharā* nāyikā; her husband is Durvala (93).

## Sources

${GGD} 164; ${RKGD}, Bṛhad-bhāga 92–93; Śākhā-nirṇayāmṛta 46.
`,
    replace: [[" He  was Indulekha in his past incarnation. (Bhaktiratnākara 4.368, 13.317, Gauraganodessadipika 164, Sakhanirnayamrta 46)", " (Bhaktiratnākara 4.368, 13.317, Sakhanirnayamrta 46)"]],
  },
  {
    id: 819,
    name: "Kuvera Paṇḍita",
    text: `## In Kṛṣṇa-līlā

**Kuvera**, the king of the Guhyakas and friend of Lord Śiva, to whom Sadāśiva promised to be born as his son — so he became the father of Advaita Ācārya.

## ${GGD} 81

> mahādevasya mitraṁ yaḥ kuvero guhyakeśvaraḥ
> kuvera-paṇḍitaḥ so 'dya …

«Lord Śiva's friend Kuvera, the king of the Guhyakas, appeared in Lord Caitanya's pastimes as Kuvera Paṇḍita, the father of Lord Advaita.»

## ${GGD} 82–85

«Formerly, on Mount Kailāsa, where the Siddhas and Sādhyas reside, Kuvera, who is very dear to Lord Śiva, chanted the transcendental mantra containing the names of Lord Śiva. Merciful Lord Śiva then said to Kuvera: "Please ask for some benediction." Kuvera then asked: "O my Lord, please become my son." Lord Sadāśiva said: "During my next birth in the material world I shall accept the position of being your son."»

> iti prāpya varaṁ kaṣṭaṁ kiyantaṁ kālam āsthitaḥ
> kāryād īśa-vaśāt so 'dyādvaitasya janako 'bhavat

«In this way Kuvera attained a very difficult to attain benediction. When the appropriate time arrived, by Lord Sadāśiva's mercy, Kuvera became the father of Lord Advaita Ācārya.» (85)

## Sources

${GGD} 81–85.
`,
    remove: ["In Kṛṣṇa-līlā: Kuvera, king of the Guhyakas, to whom Sadāśiva promised to be born as his son (Gaura-gaṇoddeśa-dīpikā 81-85)."],
  },
  {
    id: 832,
    name: "Lakṣmīnātha Paṇḍita",
    text: `## In Kṛṣṇa-līlā

**Rasonmadā**, one of Śrī Rādhā's maidservants.

## ${GGD} 194–207

> gandhonmadā rasonmadā candrikā kalabhāṣiṇī
> …
> īśānācārya-kamalau lakṣmīnāthākhya-paṇḍitaḥ

${LIST_194} So Rasonmadā, the sixteenth maidservant, is the sixteenth devotee: Lakṣmīnātha Paṇḍita.

## Sources

${GGD} 194–207; Śākhā-nirṇayāmṛta 26.
`,
    replace: [["(Caitanya Caritāmṛta  1.12.85; Gauragaṇoddeśadīpikā 196,205; Sakhanirnayamrta 26)", "(Caitanya Caritāmṛta  1.12.85; Sakhanirnayamrta 26)"]],
  },
  {
    id: 844,
    name: "Śrī Lokanātha Gosvāmī",
    text: `## In Kṛṣṇa-līlā

**Līlā-mañjarī**, one of Śrī Rādhā's mañjarīs; and one of the four **Kumāras**.

## ${GGD} 187

> bhūgarbha-ṭhakkurasyāsīt pūrvākhyā prema-mañjarī
> lokanāthākhya-gosvāmī śrī-līlā-mañjarī purā

«Bhūgarbha Ṭhākura was the incarnation of Prema-mañjarī. Lokanātha Gosvāmī was the incarnation of Līlā-mañjarī.»

## ${GGD} 107

> kāśīnātho lokanāthaḥ śrīnātho rāmanāthakaḥ
> catvāro 'mī jñāni-bhaktāḥ sanakādyā na saṁśayaḥ

«The four learned devotees in Lord Caitanya's pastimes, named Kāśīnātha, Lokanātha, Śrīnātha, and Rāmanātha, were incarnations of the four Kumāras. Of this there is no doubt.» (Whether this Lokanātha is the Gosvāmī of Vṛndāvana, the verse does not say.)

## Līlā-mañjarī in the books

- **${RKGD}** (Laghu-bhāga 182–184): among Śrīmatī Rādhikā's mañjarīs — «Śrī Rūpa Mañjarī, Rāga Mañjarī, Rati Mañjarī, Lavaṅga Mañjarī, Guṇa Mañjarī, Rasa Mañjarī, Vilāsa Mañjarī, Prema Mañjarī… Śrī Padma Mañjarī, **Līlā Mañjarī**, Hema Mañjarī…».

## Other opinions

- The record also has the name **Mañjulālī** for her.

## Sources

${GGD} 107, 187; ${RKGD}, Laghu-bhāga 182–184.
`,
    replace: [[" In Kṛṣṇa-līlā: Līlā Mañjarī (also said Manjulali).", ""]],
    remove: ["In Kṛṣṇa-līlā: one of the four Kumāras; also Līlā-mañjarī (v. 187) (Gaura-gaṇoddeśa-dīpikā 107, 187)."],
  },
  {
    id: 857,
    name: "Mādhava Ācārya",
    text: `## In Kṛṣṇa-līlā

**King Śantanu**, the husband of Gaṅgā — as now he married Gaṅgā Devī, the daughter of Nityānanda, who was the Ganges herself.

## ${GGD} 69

> viṣṇu-pādodbhavā gaṅgā yāsīt sā nija-nāmataḥ
> nityānandātmajā jātā mādhavaḥ śantanur nṛpaḥ

«The Ganges River, who was born from the lotus feet of Lord Viṣṇu, appeared in Lord Caitanya's pastimes as Śrīmatī Gaṅgā-devī, the daughter of Lord Nityānanda. Her husband, Śrī Mādhava, had formerly been Mahārāja Śantanu.»

## Sources

${GGD} 69.
`,
    remove: ["In Kṛṣṇa-līlā: King Śantanu (Gaura-gaṇoddeśa-dīpikā 69)."],
  },
  {
    id: 861,
    name: "Mādhava Ghoṣa",
    text: `## In Kṛṣṇa-līlā

**Rasollāsā**, a gopī who sang the songs composed by Viśākhā; his brothers Govinda and Vāsudeva were Kalāvatī and Guṇatuṅgā.

${V188}

## Rasollāsā in the books

- **${RKGD}** (Laghu-bhāga 191):

> kalāvatyo rasollāsā guṇatuṅgā smaroddhurāḥ
> gandharvās tu kalākaṇṭhī sukaṇṭhī pikakaṇṭhikā
> yā viśākhā-kṛta-gītīr gāyantyaḥ sukha-dā hareḥ

«Rasollāsā, Guṇatuṅgā, Smaroddhurā, Kalākaṇṭhī, Sukaṇṭhī and Pikakaṇṭhī are experts in singing, playing musical instruments and other similar arts. They are therefore Śrī Rādhā's gandharva-sakhīs — Her musicians», who sing the songs composed by Viśākhā.

## Sources

${GGD} 188; ${RKGD}, Laghu-bhāga 191.
`,
    remove: ["In Kṛṣṇa-līlā: Rasollāsā, who sang Viśākhā's songs (Gaura-gaṇoddeśa-dīpikā 188)."],
  },
  {
    id: 864,
    name: "Mādhava Miśra (father of Gadādhara)",
    text: `## In Kṛṣṇa-līlā

A special manifestation (*prakāśa*) of **Vṛṣabhānu Mahārāja**, Śrī Rādhā's father — as now he was the father of Gadādhara Paṇḍita, who was Rādhā. His wife **Ratnāvatī** was **Kīrtidā**, Rādhā's mother.

## ${GGD} 56–57

> tat-prakāśa-viśeṣo 'pi miśraḥ śrī-mādhavo mataḥ
> ratnāvatī tu tat-patnī kīrtidā kīrtitā budhaiḥ

«Mahārāja Vṛṣabhānu also appeared as Śrī Mādhava Miśra. Ratnāvatī-devī … is considered by the learned devotees to be the incarnation of Kīrtidā-devī, the wife of Mahārāja Vṛṣabhānu.» (Vṛṣabhānu is also Puṇḍarīka Vidyānidhi, verses 54–55.)

## Other opinions

- The English translation makes Ratnāvatī «Puṇḍarīka Vidyānidhi's wife»; the verse says *tat-patnī*, «his wife», just after naming Mādhava Miśra — and Ratnāvatī was Mādhava Miśra's wife, Gadādhara's mother.

## Kīrtidā in the books

- **Mañjarī-svarūpa-nirūpaṇa**: Śrī Rādhā «is the grand-daughter of Mukharā, her mother's name is Kīrtidā… Her older brother is Śrīdāman and her younger sister Anaṅga Mañjarī and her home is in Jāvaṭ.»

## Sources

${GGD} 54–57; Mañjarī-svarūpa-nirūpaṇa.
`,
    remove: ["In Kṛṣṇa-līlā: a manifestation of Vṛṣabhānu; his wife Ratnāvatī was Kīrtidā (Gaura-gaṇoddeśa-dīpikā 57)."],
  },
  {
    id: 869,
    name: "Śrī Mādhavī Devī",
    text: `## In Kṛṣṇa-līlā

**Kalākelī**, one of Śrī Rādhā's maidservants; her brother Śikhi Māhiti was Rāgalekhā.

## ${GGD} 189

> rāgalekhā-kalākelyau rādhā-dāsyau purā sthite
> te jñeye śikhi-māhitis tat-svasā mādhavī kramāt

«Śrīmatī Rādhārāṇī's maidservants, Rāgalekhā-devī and Kalākelī-devī, appeared as Śikhi Māhiti and his sister, Mādhavī-devī, respectively.»

## Kalākelī in the books

- **${RKGD}** (Laghu-bhāga 188):

> kāmadā nāma dhātreyī sakhī-bhāva-viśeṣa-bhāk
> rāgalekhā-kalākelī-mañjulādyās tu dāsikāḥ

«Kāmadā, the daughter of a wet nurse, has a special friendship with Śrī Rādhā. Rāgalekhā, Kalākelī, Mañjulā and others are Śrī Rādhā's maidservants.»

## Sources

${GGD} 189; ${RKGD}, Laghu-bhāga 188.
`,
    remove: ["In Kṛṣṇa-līlā: Kalākeli, a maidservant of Śrī Rādhā (Gaura-gaṇoddeśa-dīpikā 189)."],
  },
];
fs.writeFileSync(new URL("./tanda6.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length + " fichas");
