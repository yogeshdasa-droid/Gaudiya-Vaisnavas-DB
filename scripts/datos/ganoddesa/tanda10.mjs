// node tanda10.mjs → tanda10.json (Gaṇoddeśa, tanda 10). The books of Info take precedence.
// Left out: #1374 Santa Ṭhākura («Bhadrasena», no book of Info), #1425 Śivānanda Cakravartī (no identity);
// #1439 Śrīhari Ācārya — seems the same person as #450 Hari Ācārya (Gadādhara's branch, CC Ādi 12.84, Kalākṣī),
// which already has its text: ask Whisper to join them.
// Notes corrected: #1438 Śrīgarbha — the nine nidhis are GGD 102–103, not 120–123.
import fs from "node:fs";
const GGD = "Gaura-gaṇoddeśa-dīpikā";
const RKGD = "Rādhā-Kṛṣṇa-gaṇoddeśa-dīpikā";
const LIST_194 = `In verses 194–207 the ${GGD} names twenty-seven maidservants of Śrī Rādhā — «Mālatī, Candralatikā, Mañjumedhā, Varāṅgadā, Ratnāvalī, Kamalā, Guṇacūḍā, Sukeśinī, Karpūra-mañjarī, Śyāma-mañjarī, Śveta-mañjarī, Vilāsa-mañjarī, Kāmalekhā, Mauna-mañjarī, Gandhonmadā, Rasonmadā, Candrikā, Kalabhāṣiṇī, Gopālī, Hariṇī, Kālī, Kalākṣī, Nitya-mañjarī, Kalakaṇṭhī, Kuraṅgākṣī, Candrikā and Candraśekharā» — who «assuming male forms appeared among Lord Caitanya's associates», and then the devotees they became, *kramaśaḥ*, in the same order.`;
const plan = [
  {
    id: 1354,
    name: "Sanātana Miśra",
    text: `## In Kṛṣṇa-līlā

**King Satrājit**, the father of Satyabhāmā — as now his daughter Viṣṇupriyā married the Lord.

## ${GGD} 47

> śrī-sanātana-miśro 'yaṁ purā satrājin nṛpaḥ
> viṣṇupriyā jagan-mātā yat-kanyā bhū-svarūpiṇī

«The same person who formerly appeared as King Satrājit appeared in Lord Caitanya's pastimes as Sanātana Miśra. Sanātana Miśra's daughter was named Śrīmatī Viṣṇupriyā, and she was the incarnation of the Lord's Bhū-śakti, who is the mother of the entire universe.»

## Sources

${GGD} 47.
`,
    replace: [["In his past incarnation he was Satrajit (GGD. 47). ", ""]],
  },
  {
    id: 1362,
    name: "Śaṅkara Ghosh",
    text: `## In Kṛṣṇa-līlā

**Sudhākara**, a mṛdaṅga player of Vraja — as now he played the ḍamphā drum for the Lord.

## ${GGD} 142

> purāsīd yo vraje nāmnā mṛdaṅgī śrī-sudhākaraḥ
> sa śrī-śaṅkara-ghoṣo 'dya ḍamphā-vādya-viśāradaḥ

«Śrī Sudhākara, who had been an expert mṛdaṅga player in Vrajabhūmi during Lord Kṛṣṇa's pastimes, appeared in Lord Caitanya's pastimes as the expert drummer Śrī Śaṅkara Ghoṣa.»

## Sudhākara in the books

- **${RKGD}** (Laghu-bhāga 102): among Śrī Kṛṣṇa's servants — «**Sudhākara**, Sudhānāda, Sānanda and other servants play mṛdaṅga. They are all experts in singing, playing musical instruments and the other sixty-four arts.»

## Sources

${GGD} 142; ${RKGD}, Laghu-bhāga 102.
`,
    replace: [[" GGD 142 says that this Śaṅkara was Sudhakara in his past incarnation.", ""]],
  },
  {
    id: 1365,
    name: "Śaṅkara Paṇḍit",
    text: `## In Kṛṣṇa-līlā

**Śrībhadrā**, a gopī on whose chest Kṛṣṇa slept in Vṛndāvana — as now he was «the Lord's foot-pillow» (*prabhu-padopadhāna*).

## ${GGD} 157

> yasya vakṣasi suṣvāpa kṛṣṇo vṛndāvane purā
> …

«During Lord Kṛṣṇa's Vṛndāvana pastimes He would sometimes sleep peacefully on the chest of Śrībhadrā-gopī. This same Śrībhadrā-gopī later appeared as Śaṅkara Paṇḍita, who was very dear to Lord Caitanya Mahāprabhu.»

## Sources

${GGD} 157.
`,
    remove: ["In Kṛṣṇa-līlā: Śrībhadrā (Gaura-gaṇoddeśa-dīpikā 157)."],
  },
  {
    id: 1378,
    name: "Sāraṅga Ṭhākura",
    text: `## In Kṛṣṇa-līlā

**Nāndīmukhī**, the young brāhmaṇī of Vraja who arranges the meetings of Śrī Rādhā and Śrī Kṛṣṇa.

## ${GGD} 172

> vraje nāndīmukhī yāsīt sādya sāraṅga-ṭhakkuraḥ
> prahlādo manyate kaiścin mat-pitrā na sa manyate

«The vraja-brāhmaṇī Nāndīmukhī-devī appeared as Sāraṅga Ṭhākura. Some people think that Sāraṅga Ṭhākura was the incarnation of Prahlāda Mahārāja. My father (Śivānanda Sena) did not agree with them.»

## Nāndīmukhī in the books

- **${RKGD}** (Laghu-bhāga 99–100):

> nāndīmukhī gaura-varṇā paṭṭa-vastra-vidhāriṇī
> sāndīpaniḥ pitā tasyā mātā ca sumukhī satī

«Nāndīmukhī is fair-complexioned. She wears silk clothes. Her father is Sāndīpani Muni and her chaste mother's name is Sumukhī. Her brother's name is Madhumaṅgala and her paternal grandmother is Paurṇamāsī. Nāndīmukhī is decorated with various jewels and is in the prime of youth.»
- **${RKGD}** (Laghu-bhāga 87, 189): one of the messengers (*dūtīs*); with Bindumatī she removes the māna between Rādhā and Kṛṣṇa and arranges Their meeting.

## Other opinions

- Some held him to be **Prahlāda**; the author's father, Śivānanda Sena, did not agree (verse 172).

## Sources

${GGD} 172; ${RKGD}, Laghu-bhāga 87, 99–100, 189.
`,
    remove: ["In Kṛṣṇa-līlā: Nāndīmukhī (some say Prahlāda) (Gaura-gaṇoddeśa-dīpikā 172)."],
  },
  {
    id: 1381,
    name: "Sārvabhauma Bhaṭṭācārya",
    text: `## In Kṛṣṇa-līlā

**Bṛhaspati**, the teacher of the demigods and the foremost scholar of the heavenly planets.

## ${GGD} 119

> bhaṭṭācāryaḥ sārvabhaumaḥ purāsīd gīṣpatir divi

«Sārvabhauma Bhaṭṭācārya had formerly been Bṛhaspati, the foremost scholar in the heavenly planets.»

## Sources

${GGD} 119.
`,
    remove: ["In Kṛṣṇa-līlā: Bṛhaspati (Gaura-gaṇoddeśa-dīpikā 119)."],
  },
  {
    id: 1393,
    name: "Satyananda Bhāratī",
    text: `## In Kṛṣṇa-līlā

One of the nine **Jāyanteyas** (the nine Yogendras, sons of Ṛṣabha), who spoke the Bhāgavata teachings to King Janaka (Nimi) and appeared as nine sannyāsīs around Lord Caitanya.

## ${GGD} 98–101

> jāyanteyāḥ sthitā ūrdhva-retasaḥ sama-darśinaḥ
> nava bhāgavatāḥ pūrvaṁ śrī-bhāgavata-saṁhitām
> …
> garuḍākhyāvadhūtaś ca śrī-gopendrākhya āśramaḥ

«The nine Jāyanteyas, who were fixed in celibacy and equal vision, and who spoke the Śrī Bhāgavata-saṁhitā to Janaka Ṛṣi, appeared on this earth as nine sannyāsīs, and continually performed pastimes with Lord Caitanya. Their names were: Śrī Nṛsiṁhānanda Tīrtha, **Śrī Satyānanda Bhāratī**, Śrī Nṛsiṁha Tīrtha, Śrī Cidānanda Tīrtha, Śrī Jagannātha Tīrtha, Śrī Vāsudeva Tīrtha, Śrī Rāma Tīrtha, Śrī Puruṣottama Tīrtha, and Śrī Garuḍa Avadhūta, who was also known as Śrī Gopendra Āśrama.» The verse does not say which Jāyanteya each one was.

## Sources

${GGD} 98–101.
`,
    replace: [[" In his past incarnation he was Jayanteya, one of the nine Yogindras (GGD. 98-100).", ""]],
  },
  {
    id: 1398,
    name: "Satyarāja Khān",
    text: `## In Kṛṣṇa-līlā

**Sukaṇṭhī**, one of the two dancers and singers (*gandharvas*) of Vraja — his son Rāmānanda Vasu was the other, Kalakaṇṭhī.

## ${GGD} 173

> kalakaṇṭhī-sukaṇṭhyau ye vraje gāndharva-nāṭike
> rāmānanda-vasu-satya-rājau cāpi yathā-yatham

«Kalakaṇṭhī-devī and Sukaṇṭhī-devī, the two Gandharva-dancers who appeared in Vrajabhūmi, also appeared as Rāmānanda Vasu and Satyarāja.»

## Sukaṇṭhī in the books

- **${RKGD}** (Laghu-bhāga 191): «Rasollāsā, Guṇatuṅgā, Smaroddhurā, Kalākaṇṭhī, **Sukaṇṭhī** and Pikakaṇṭhī are experts in singing, playing musical instruments and other similar arts. They are therefore Śrī Rādhā's gandharva-sakhīs — Her musicians», who sing the songs composed by Viśākhā.

## Sources

${GGD} 173; ${RKGD}, Laghu-bhāga 191.
`,
    remove: ["In Kṛṣṇa-līlā: Sukaṇṭhī, a Gandharva dancer (Gaura-gaṇoddeśa-dīpikā 173)."],
  },
  {
    id: 1410,
    name: "Śikhi-Māhiti",
    text: `## In Kṛṣṇa-līlā

**Rāgalekhā**, one of Śrī Rādhā's maidservants; his sister Mādhavī was Kalākelī.

## ${GGD} 189

> rāgalekhā-kalākelyau rādhā-dāsyau purā sthite
> te jñeye śikhi-māhitis tat-svasā mādhavī kramāt

«Śrīmatī Rādhārāṇī's maidservants, Rāgalekhā-devī and Kalākelī-devī, appeared as Śikhi Māhiti and his sister, Mādhavī-devī, respectively.»

## Rāgalekhā in the books

- **${RKGD}** (Laghu-bhāga 188): «Kāmadā, the daughter of a wet nurse, has a special friendship with Śrī Rādhā. **Rāgalekhā**, Kalākelī, Mañjulā and others are Śrī Rādhā's maidservants.»

## Other opinions

- The Guru-bhakti-gītā of Acyutānanda calls him the gopī **Śaśikalā**.

## Sources

${GGD} 189; ${RKGD}, Laghu-bhāga 188; Acyutānanda, Guru-bhakti-gītā.
`,
    remove: ["In Kṛṣṇa-līlā: Rāgalekhā, Rādhā's maidservant (his sister Mādhavī was Kalākeli) (Gaura-gaṇoddeśa-dīpikā 189). The Guru-bhakti-gītā of Acyutānanda calls him the gopī Śaśikalā."],
  },
  {
    id: 1417,
    name: "Sītā Ṭhākurāṇī",
    text: `## In Kṛṣṇa-līlā

**Yogamāyā**, the Lord's internal potency — **Paurṇamāsī** of Vraja; her sister Śrī, Advaita's other wife, is her manifestation.

## ${GGD} 86

> yogamāyā bhagavatī gṛhiṇī tasya sāmpratam
> sītā-rūpeṇāvatīrṇā śrī-nāmnī tat-prakāśataḥ

«The Supreme Lord's yogamāyā potency appeared in Lord Caitanya's pastimes as Śrī Sītā-devī, the wife of Lord Advaita Ācārya» — and, as her manifestation (*tat-prakāśataḥ*), as Śrī.

## Paurṇamāsī in the books

- **${RKGD}** (Bṛhad-bhāga 69–71):

> paurṇamāsī bhagavatī sarva-siddhi-vidhāyinī
> kāṣāya-vasanā gaurī kāśakeśī darāyatā

«Bhagavatī Paurṇamāsī is Yogamāyā, who arranges all Śrī Kṛṣṇa's pastimes very skilfully. Her clothes are the colour of red ochre [the colour of ascetics]. Her complexion is golden, and her hair is white like the flower of kāśa grass. She is quite tall. Nanda and all the residents of Vraja worship Paurṇamāsī. She is Devarṣi Śrī Nārada's dear disciple»; she left her son Sāndīpani in Avantī and came to Gokula out of love for Kṛṣṇa.

## Sources

${GGD} 86; ${RKGD}, Bṛhad-bhāga 69–71.
`,
    remove: ["In Kṛṣṇa-līlā: Yogamāyā (Paurṇamāsī); her sister Śrī is Yogamāyā's manifestation (Gaura-gaṇoddeśa-dīpikā 86)."],
  },
  {
    id: 1427,
    name: "Śrī Śivānanda Sena",
    text: `## In Kṛṣṇa-līlā

The gopīs **Vīrā** and **Dūtī**, the messengers who brought the gopīs to Kṛṣṇa — as now he brought the devotees of Bengal to the Lord in Purī every year. His son Kavi Karṇapūra wrote this of him.

## ${GGD} 176

> purā vṛndāvane vīrā-dūtī sarvāś ca gopikāḥ
> nināya kṛṣṇa-nikaṭaṁ sedānīṁ janako mama
> vraje bindumatī yāsīd adya sā jananī mama

«The two gopīs Vīrā-devī and Dūtī-devī, who acted as messengers arranging the gopīs' meetings with Lord Kṛṣṇa, combined to appear as my father (Śivānanda Sena). The vraja-gopī Bindumatī appeared as my mother.»

## Vīrā in the books

- **${RKGD}** (Laghu-bhāga 87–95):

> vīrā nāma varā dūtī khyātānyā pūjitā vraje
> vīrā pragalbha-vacanā vṛndā cāṭūkti-peśalā

«Vīrā is another prominent female messenger. She is worshipful and famous in Vraja-maṇḍala. Vīrā is a fearless speaker (pragalbha-vacanā). Conversely, Vṛndā is most clever in using sweet and charming words. Vīrā's complexion is blackish blue (śyāmala) but seems bright because she wears white clothes… Vīrā's husband is Kavala. Her mother Mohinī is a virtuous wife. Vīrā's father is Viśāla and her sister's name is Kavalā.» She is very dear to Jaṭilā and lives at Jāvaṭa (95).

## Sources

${GGD} 176; ${RKGD}, Laghu-bhāga 87–95.
`,
    remove: ["In Kṛṣṇa-līlā: the gopīs Vīrā and Dūtī (Gaura-gaṇoddeśa-dīpikā 176)."],
  },
  {
    id: 1436,
    name: "Śrīdhara Brahmacārī",
    text: `## In Kṛṣṇa-līlā

**Candralatikā**, one of Śrī Rādhā's maidservants.

## ${GGD} 194–207

> mālatī candralatikā mañjumedhā varāṅgadā
> …
> śubhānando dvijo brahmacārī śrīdhara-nāmakaḥ

${LIST_194} So Candralatikā, the second maidservant, is the second devotee: «Śrīdhara Brahmacārī».

## Candralatikā in the books

- **${RKGD}** (Bṛhad-bhāga 244): one of the eight prominent sakhīs under **Campakalatā** — «Kuraṅgākṣī, Sucaritā, Maṇḍalī, Maṇikuṇḍalā, Candrikā, **Candralatikā**, Paṅkajākṣī and Sumandirā».

## Sources

${GGD} 194–207; ${RKGD}, Bṛhad-bhāga 244; Śākhā-nirṇayāmṛta 5.
`,
    replace: [[" In Kṛṣṇa-līlā: Candralatikā, Rādhā's maidservant (Gaura-gaṇoddeśa-dīpikā 194, 199; Śākhā-nirṇayāmṛta 5).", ""]],
  },
  {
    id: 1438,
    name: "Śrīgarbha",
    text: `## In Kṛṣṇa-līlā

One of the **nine treasures (*nidhis*) of Kuvera** — «Mahāpadma-nidhi», according to the record.

## ${GGD} 102–103

> loke ye nidhayaḥ khyātāḥ padma-śaṅkhādayo nava
> …
> śrī-śrīnidhiś ca śrī-garbhaḥ kaviratnaḥ sudhānidhiḥ

«Kuvera's famous nine treasures, which include his conch and lotus, took birth during Lord Caitanya's pastimes as the nine sons of Nidhiratna-devī. They were all very dear to the Lord. Their names were Śrīnidhi, **Śrīgarbha**, Kaviratna, Sudhānidhi, Vidyānidhi, Guṇanidhi, the learned brāhmaṇa Ratnabāhu, Śrīmān Ācāryaratna, and Śrī Ratnākara Paṇḍita.» The verse does not say which treasure each one is.

## Sources

${GGD} 102–103.
`,
    replace: [[" In his past incarnation he was Mahapadmanidhi (GGD. 120-  123, Vaiṣṇava Vandanā of Jīva 103, Devakīnandana 31, and Vṛndāvanadāsa 35).", " (Vaiṣṇava Vandanā of Jīva 103, Devakīnandana 31, and Vṛndāvanadāsa 35)."]],
  },
  {
    id: 1442,
    name: "Śrīharṣa",
    text: `## In Kṛṣṇa-līlā

**Sukeśinī**, one of Śrī Rādhā's maidservants.

## ${GGD} 194–207

> ratnāvalī ca kamalā guṇacūḍā sukeśinī
> …
> subuddhi-miśraḥ śrīharṣo raghu-miśro dvijottamaḥ

${LIST_194} So Sukeśinī, the eighth maidservant, is the eighth devotee: Śrīharṣa.

## Sukeśī in the books

- **${RKGD}** (Bṛhad-bhāga 249): a **Sukeśī** is one of the eight prominent sakhīs under **Sudevī** — «Kāverī, Cārukavarā, Sukeśī, Mañjukeśikā, Hārahīrā, Mahāhīrā, Hārakaṇṭhī and Manoharā».

## Sources

${GGD} 194–207; ${RKGD}, Bṛhad-bhāga 249.
`,
    replace: [[" In his past incarnation he was Sukesini (GGD. 194, 201, Namamrtasamudra 129, Sakhanirnayamrta 25).", " (Namamrtasamudra 129, Sakhanirnayamrta 25)."]],
  },
  {
    id: 1443,
    name: "Śrīkānta Sen",
    text: `## In Kṛṣṇa-līlā

**Kātyāyanī**, a gopī of Vraja — one of the older messengers (*dūtikās*) of Śrī Rādhā.

## ${GGD} 174

> vraje kātyāyanī yāsīd adya śrīkānta-senakaḥ

«The vraja-gopī Kātyāyanī-devī appeared as Śrīkānta Sena.»

## Kātyāyanī in the books

- **${RKGD}** (Laghu-bhāga 196):

> tathā kātyāyanītyādyā dūtikā vayasādhikāḥ

«Kātyāyanī and other female messengers are older than Śrī Rādhā.»

## Sources

${GGD} 174; ${RKGD}, Laghu-bhāga 196.
`,
    replace: [[" In his past incarnation he was Katyayani. (GGD. 174, CC. 3.2.37, 3.12.18,33,38)", " (CC. 3.2.37, 3.12.18,33,38)"]],
  },
  {
    id: 1458,
    name: "Śrīnātha Cakravartī",
    text: `## In Kṛṣṇa-līlā

One of the four **Kumāras** (Sanaka, Sanandana, Sanātana and Sanat-kumāra) — with Kāśīnātha, Lokanātha and Rāmanātha, «the four Nāthas».

## ${GGD} 107–108

> kāśīnātho lokanāthaḥ śrīnātho rāmanāthakaḥ
> catvāro 'mī jñāni-bhaktāḥ sanakādyā na saṁśayaḥ

«The four learned devotees in Lord Caitanya's pastimes, named Kāśīnātha, Lokanātha, Śrīnātha, and Rāmanātha, were incarnations of the four Kumāras. Of this there is no doubt.» (107) «The names of these four devotees each end with the word "nātha", just as the names of the four Kumāras each end with the word "kumāra". These four devotees became known as the "four Nāthas".» (108)

## Other opinions

- The verse says only «Śrīnātha»; there are other Śrīnāthas (Śrīnātha Paṇḍita, with their own records).

## Sources

${GGD} 107–108.
`,
    remove: ["In Kṛṣṇa-līlā: one of the four Kumāras (with Kāśīnātha, Lokanātha and Rāmanātha) (Gaura-gaṇoddeśa-dīpikā 107-108)."],
  },
];
fs.writeFileSync(new URL("./tanda10.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length + " fichas");
