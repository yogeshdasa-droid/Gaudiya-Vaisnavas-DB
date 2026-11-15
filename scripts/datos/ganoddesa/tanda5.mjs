// node tanda5.mjs → tanda5.json (Gaṇoddeśa, tanda 5). The books of Info take precedence.
// Left out (ask Whisper): #541 Jagāi («Jaya» — no book of Info says it; there is also #1827 «Jagāi and Mādhāi»);
// #558 Jagannātha Mahati (Vrajeśvarī, only from the Nāmāmṛta-samudra 171); #562 Jagannātha Paṇḍita («Durvāsā», from
// Devakīnandana's Vaiṣṇava-vandanā — but the GGD 111 gives Durvāsā to Jagannātha Ācārya «known as Gaṅgādāsa», #548).
// Notes corrected: #534 Jagadīśa = Candrahāsa is GGD 143, not 153.
import fs from "node:fs";
const GGD = "Gaura-gaṇoddeśa-dīpikā";
const RKGD = "Rādhā-Kṛṣṇa-gaṇoddeśa-dīpikā";
const LIST_194 = `In verses 194–207 the ${GGD} names twenty-seven maidservants of Śrī Rādhā — «Mālatī, Candralatikā, Mañjumedhā, Varāṅgadā, Ratnāvalī, Kamalā, Guṇacūḍā, Sukeśinī, Karpūra-mañjarī, Śyāma-mañjarī, Śveta-mañjarī, Vilāsa-mañjarī, Kāmalekhā, Mauna-mañjarī, Gandhonmadā, Rasonmadā, Candrikā, Kalabhāṣiṇī, Gopālī, Hariṇī, Kālī, Kalākṣī, Nitya-mañjarī, Kalakaṇṭhī, Kuraṅgākṣī, Candrikā and Candraśekharā» — who «assuming male forms appeared among Lord Caitanya's associates», and then the devotees they became, *kramaśaḥ*, in the same order.`;
const plan = [
  {
    id: 524,
    name: "Jagadānanda Paṇḍita (Jagadānanda-Caitanya-Sakhā)",
    text: `## In Kṛṣṇa-līlā

**Satyabhāmā**, the queen of Dvārakā — a manifestation (*prakāśa*) of her. (His love, shown as anger and sulking, is hers.)

## ${GGD} 51

> kenāvāntara-bhedena bhedaṁ kurvanti sāttvatāḥ
> satyabhāmā-prakāśo 'pi jagadānanda-paṇḍitaḥ

«The person who appeared in Lord Caitanya's pastimes as Jagadānanda Paṇḍita was actually an incarnation of Śrīmatī Satyabhāmā-devī. What devotee can say otherwise?»

## Sources

${GGD} 51.
`,
    remove: ["In Kṛṣṇa-līlā: a manifestation of Satyabhāmā (Gaura-gaṇoddeśa-dīpikā 51)."],
  },
  {
    id: 534,
    name: "Jagadīśa Paṇḍita",
    text: `## In Kṛṣṇa-līlā

**Candrahāsa**, a dancer of Vraja, expert in the rasas.

## ${GGD} 143

> āsīd vraje candrahāso nartako rasa-kovidaḥ
> so 'yaṁ nṛtya-vinodī śrī-jagadīśākhya-paṇḍitaḥ

«Candrahāsa, who in Vrajabhūmi had been a dancer expert in transcendental mellows, appeared in Lord Caitanya's pastimes as the dancer Jagadīśa Paṇḍita.»

## Candrahāsa in the books

- **${RKGD}** (Laghu-bhāga 103): among Śrī Kṛṣṇa's servants — «Vicitrarāva, Madhurarāva and other servants are Śrī Kṛṣṇa's panegyrists (vandis), and **Candrahāsa**, Induhāsa, Candramukha and others are dancers.»

## Other opinions

- The ${GGD} (192) makes another Jagadīśa, with Hiraṇya, a **yajña-patnī** (the wives of the brāhmaṇas who fed Kṛṣṇa): «Two other yajña-patnīs appeared as Jagadīśa and Hiraṇya. One Ekādaśī day Lord Caitanya ate grains he had begged from them.» The Gauḍīya Vaiṣṇava Abhidhāna takes him as Jagadīśa Paṇḍita of Navadvīpa (his own record); some texts of this record take the two as one.

## Sources

${GGD} 143, 192; ${RKGD}, Laghu-bhāga 103.
`,
    remove: ["In Kṛṣṇa-līlā: the dancer Candrahāsa (Gaura-gaṇoddeśa-dīpikā 153)."],
  },
  {
    id: 559,
    name: "Jagannātha Miśra (Purandara)",
    text: `## In Kṛṣṇa-līlā

**Nanda Mahārāja**, the king of Vraja, Kṛṣṇa's father (with Yaśodā, now Śacī-devī). Some say that **Kaśyapa** — who was also Daśaratha and Sutapā — and **Vasudeva** entered him too.

## ${GGD} 37

> purā yaśodā-vraja-rāja-nandau vṛndāvane prema-rasākarau yau
> śacī-jagannātha-purandarābhidhau babhūvatus tau na ca saṁśayo 'tra

«Śrīmatī Yaśodā-devī and Vraja's king Nanda, who had been like two great oceans of the nectar of love for Kṛṣṇa during the Lord's pastimes in Vṛndāvana, appeared during Lord Caitanya's pastimes as Śrīmatī Śacī-devī and Śrīmān Jagannātha Purandara. Of this there is no doubt.»

## ${GGD} 38–39

> amū āviśatām eva devāv aditi-kaśyapau
> …
> anyathā rāma-mūrteḥ śrī-viśvarūpasya nodbhavaḥ

«Some devotees say that the two demigods Aditi and Kaśyapa, who incarnated as Kauśalyā and Daśaratha, Pṛśni and Sutapā, and also as Devakī and Vasudeva, the parents of Balarāma and Kṛṣṇa, also entered the bodies of Śacī-devī and Jagannātha. These devotees say that if this were not so, then it would not have been possible for Balarāma to take birth as their son Viśvarūpa.»

## Nanda in the books

- **${RKGD}** (Bṛhad-bhāga 23b–25):

> pitā vraja-janānando nando bhuvana-vanditaḥ
> tundilaś candana-rucir bandhujīva-nibhāmbaraḥ

«Śrī Kṛṣṇa's father is Śrī Nanda Mahārāja. He is worshipped throughout the world and is the source of happiness to the residents of Vraja. He has a big belly, his bodily complexion is like sandalwood paste (candana), and his dress resembles the colour of the yellowish red bandhujīva flower. He is tall and his beard resembles the colour of sesame seeds mixed with rice.» He is the younger brother of Upananda and a close friend of Vasudeva (25).

## Sources

${GGD} 37–39; ${RKGD}, Bṛhad-bhāga 23b–25.
`,
    replace: [[" In Kṛṣṇa-līlā, he embodied the role of Śrī Nanda in Vrajalīlā.", ""]],
    remove: ["In Kṛṣṇa-līlā: Nanda Mahārāja (Kaśyapa, Daśaratha, Sutapā and Vasudeva are said to have entered him too) (Gaura-gaṇoddeśa-dīpikā 37-39)."],
  },
  {
    id: 567,
    name: "Jagannātha Sena",
    text: `## In Kṛṣṇa-līlā

**Kamalā**, one of Śrī Rādhā's maidservants.

## ${GGD} 194–207

> ratnāvalī ca kamalā guṇacūḍā sukeśinī
> …
> kaṁsāri-senaḥ senaḥ śrī-jagannātho mahāśayaḥ

${LIST_194} So Kamalā, the sixth maidservant, is the sixth devotee: «Śrī Jagannātha Sena Mahāśaya».

## Kamalā in the books

- **${RKGD}** (Bṛhad-bhāga 248): one of the eight prominent sakhīs under **Raṅgadevī** — «Kalakaṇṭhī, Śaśikalā, Kamalā, Madhurā, Indirā, Kandarpa-sundarī, Kāmalatikā and Prema Mañjarī».

## Sources

${GGD} 194–207; ${RKGD}, Bṛhad-bhāga 248.
`,
    replace: [[", Jagannātha was Kamalā-sakhī in his past incarnation (Gaura-gaṇoddeśa-dīpikā 194, 200).", "."]],
  },
  {
    id: 569,
    name: "Jagannātha Tīrtha",
    text: `## In Kṛṣṇa-līlā

One of the nine **Jāyanteyas** (the nine Yogendras, sons of Ṛṣabha), who spoke the Bhāgavata teachings to King Janaka (Nimi) and appeared as nine sannyāsīs around Lord Caitanya.

## ${GGD} 98–101

> jāyanteyāḥ sthitā ūrdhva-retasaḥ sama-darśinaḥ
> nava bhāgavatāḥ pūrvaṁ śrī-bhāgavata-saṁhitām
> …
> garuḍākhyāvadhūtaś ca śrī-gopendrākhya āśramaḥ

«The nine Jāyanteyas, who were fixed in celibacy and equal vision, and who spoke the Śrī Bhāgavata-saṁhitā to Janaka Ṛṣi, appeared on this earth as nine sannyāsīs, and continually performed pastimes with Lord Caitanya. Their names were: Śrī Nṛsiṁhānanda Tīrtha, Śrī Satyānanda Bhāratī, Śrī Nṛsiṁha Tīrtha, Śrī Cidānanda Tīrtha, **Śrī Jagannātha Tīrtha**, Śrī Vāsudeva Tīrtha, Śrī Rāma Tīrtha, Śrī Puruṣottama Tīrtha, and Śrī Garuḍa Avadhūta, who was also known as Śrī Gopendra Āśrama.» The verse does not say which Jāyanteya each one was.

## Sources

${GGD} 98–101.
`,
    replace: [[" He was Jayanteya, one of the nine Yogindras, in his past incarnation. (Gaurganoddesadipika 98-100)", ""]],
  },
  {
    id: 574,
    name: "Śrīmatī Jāhnavā Mātā",
    text: `## In Kṛṣṇa-līlā

**Revatī**, Lord Balarāma's wife (her sister Vasudhā was Vāruṇī); and **Anaṅga-mañjarī**, Śrī Rādhā's younger sister.

## ${GGD} 65

> śrī-vāruṇī-revatī-vaṁśa-sambhave tasya priye dve vasudhā ca jāhnavī
> śrī-sūryadāsasya mahātmanaḥ sute kakudmi-rūpasya ca sūrya-tejasaḥ

«Lord Balarāma's two wives, Śrīmatī Vāruṇī-devī and Śrīmatī Revatī-devī, appeared during Lord Caitanya's pastimes as Śrīmatī Vasudhā-devī and Śrīmatī Jāhnavī-devī, the two dear wives of Lord Nityānanda, and the daughters of the great personality Śrī Sūryadāsa. Their father, Sūryadāsa, had previously been Mahārāja Kakudmī. His bodily luster made him as effulgent as the sun.»

## ${GGD} 66

> …
> anaṅga-mañjarīṁ kecij jāhnavīṁ ca pracakṣate
> ubhayaṁ tu samīcīnaṁ pūrva-nyāyāt satāṁ matam

«Some say that Śrīmatī Vasudhā-devī is the incarnation of Śrīmatī Anaṅga-mañjarī, and others say that Śrīmatī Jāhnavī-devī is the incarnation of Śrīmatī Anaṅga-mañjarī. In truth, both opinions are correct. They are both incarnations of Śrīmatī Anaṅga-mañjarī.»

## Anaṅga-mañjarī in the books

- **${RKGD}** (Bṛhad-bhāga 121–122):

> vasanta-ketakī-kāntir mañjulānaṅga-mañjarī
> yathārthākṣara-nāmeyam indīvara-nibhāmbarā

«Anaṅga Mañjarī, Śrī Rādhā's younger sister, has an enchanting complexion resembling a spring ketakī flower and she wears clothes resembling a blue lotus. Even Cupid (Anaṅga) is attracted by her beauty and sweetness; thus her name Anaṅga Mañjarī is quite appropriate. Her husband is the proud and arrogant Durmada, the younger brother of Śrī Rādhā's husband. Anaṅga Mañjarī is extremely dear to Lalitā-devī and especially to Viśākhā.» She is the eighth of the *vara* sakhīs, twelve years old (97–98).

## Sources

${GGD} 65–66; ${RKGD}, Bṛhad-bhāga 97–98, 121–122.
`,
    remove: ["In Kṛṣṇa-līlā: Revatī; also Anaṅga-mañjarī (Gaura-gaṇoddeśa-dīpikā 65-66)."],
  },
  {
    id: 593,
    name: "Jaṅgalīpriyā Dāsī (Jaṅgalī)",
    text: `## In Kṛṣṇa-līlā

**Vijayā** (with Nandinī, who was Jayā).

## ${GGD} 89

> nandinī jaṅgalī jñeyā jayā ca vijayā kramāt

«The devotees Nandinī and Jaṅgalī who were associates of Lord Caitanya had previously been Jayā and Vijayā in Lord Kṛṣṇa's pastimes» (*kramāt*, respectively).

## Sources

${GGD} 89.
`,
    replace: [[" Vijayā-sakhī in Kṛṣṇa-līlā (Gaura-gaṇoddeśa-dīpikā 89).", ""]],
  },
  {
    id: 615,
    name: "Jita Mitra",
    text: `## In Kṛṣṇa-līlā

**Śyāma-mañjarī**, one of Śrī Rādhā's maidservants.

## ${GGD} 194–207

> karpūra-mañjarī śyāma-mañjarī śveta-mañjarī
> …
> ripavaḥ ṣaṭ kāma-mukhyā jitā yena vaśī-kṛtāḥ
> yathārtha-nāmā gaureṇa jitamitraḥ sa nirmitaḥ

${LIST_194} So Śyāma-mañjarī, the tenth maidservant, is the tenth devotee: «Jitamitra, whose appropriate name, meaning "conqueror of the enemies", was given by Lord Caitanya because Jitamitra had completely subdued lust and the other five enemies of the conditioned soul».

## Sources

${GGD} 194–207.
`,
    replace: [[" He was Śyāma-mañjarī in his past incarnation (Gaura-gaṇoddeśa-dīpikā 195, 200).", ""]],
  },
  {
    id: 616,
    name: "Jīva (Jīva Paṇḍita)",
    text: `## In Kṛṣṇa-līlā

**Indirā**, a gopī of Vraja.

## ${GGD} 169

> mādhavī mādhavācārya indirā jīva-paṇḍitaḥ

«Mādhavī-gopī appeared as Mādhavācārya, and Indirā-gopī appeared as Jīva Paṇḍita.»

## Indirā in the books

- **${RKGD}** (Bṛhad-bhāga 248): one of the eight prominent sakhīs under **Raṅgadevī** — «Kalakaṇṭhī, Śaśikalā, Kamalā, Madhurā, **Indirā**, Kandarpa-sundarī, Kāmalatikā and Prema Mañjarī».

## Other opinions

- The ${GGD} (194–207) has another «Jīva Paṇḍita», «the saintly son of Śrī Vallabha» — Vilāsa-mañjarī; that one is Śrīla Jīva Gosvāmī (his own record). This Jīva Paṇḍita is the son of Ratnagarbha Ācārya.

## Sources

${GGD} 169, 194–207; ${RKGD}, Bṛhad-bhāga 248.
`,
    replace: [[" He was upamahanta and gopī Indira in his past incarnation (Gaura- gaṇoddeśa-dīpikā 169).", " He was an upamahanta."]],
  },
  {
    id: 639,
    name: "Kālīya Kṛṣṇa Dāsa Ṭhākura",
    text: `## In Kṛṣṇa-līlā

**Lavaṅga**, a cowherd friend (*sakhā*) of Kṛṣṇa in Vraja.

## ${GGD} 132

> nāmnārjunaḥ sakhā prāg yo dāsaḥ śrī-parameśvaraḥ
> kālaḥ śrī-kṛṣṇadāsaḥ sa yo lavaṅgaḥ sakhā vraje

«Lord Kṛṣṇa's cowherd friend Arjuna appeared as Śrī Parameśvara dāsa in Lord Caitanya's pastimes. Lavaṅga, who had been Lord Kṛṣṇa's cowherd friend in Vrajabhūmi, appeared in Lord Caitanya's pastimes as Śrī Kāla Kṛṣṇadāsa.»

## Sources

${GGD} 132.
`,
    remove: ["In Kṛṣṇa-līlā: Lavaṅga (Gaura-gaṇoddeśa-dīpikā 132)."],
  },
  {
    id: 657,
    name: "Kamalākara Pippalāi",
    text: `## In Kṛṣṇa-līlā

**Mahābala**, a cowherd boy of Vraja.

## ${GGD} 128

> subalo yaḥ priya-śreṣṭhaḥ sa gaurīdāsa-paṇḍitaḥ
> kamalākaraḥ pippalāi nāmnāsīd yo mahābalaḥ

«Lord Kṛṣṇa's dearest friend Subala appeared in Lord Caitanya's pastimes as Gaurīdāsa Paṇḍita. The cowherd boy named Mahābala appeared in Lord Caitanya's pastimes as Kamalākara Pippalāi.»

## Sources

${GGD} 128.
`,
    remove: ["In Kṛṣṇa-līlā: Mahābala (Gaura-gaṇoddeśa-dīpikā 128)."],
  },
  {
    id: 659,
    name: "Kamalanayana (Kamalā)",
    text: `## In Kṛṣṇa-līlā

**Gandhonmadā**, one of Śrī Rādhā's maidservants.

## ${GGD} 194–207

> gandhonmadā rasonmadā candrikā kalabhāṣiṇī
> …
> īśānācārya-kamalau lakṣmīnāthākhya-paṇḍitaḥ

${LIST_194} So Gandhonmadā, the fifteenth maidservant, is the fifteenth devotee: «Kamala» — the list gives only this short name.

## Sources

${GGD} 194–207.
`,
    replace: [[" He was Gandhonmada in his past incarnation (Gaura-gaṇoddeśa-dīpikā 205, 196).", ""]],
  },
  {
    id: 673,
    name: "Kansari Sena",
    text: `## In Kṛṣṇa-līlā

**Ratnāvalī**, one of Śrī Rādhā's maidservants.

## ${GGD} 194–207

> ratnāvalī ca kamalā guṇacūḍā sukeśinī
> …
> kaṁsāri-senaḥ senaḥ śrī-jagannātho mahāśayaḥ

${LIST_194} So Ratnāvalī, the fifth maidservant, is the fifth devotee: Kaṁsāri Sena.

## Ratnāvalī in the books

- **${RKGD}** (Laghu-bhāga 179–180): among Śrī Rādhā's *jīvita-sakhīs*, the friends who are Her very life — «… Madonmadā, Madhumatī, Vāsantī, Kalabhāṣiṇī, **Ratnāvalī**, Maṇimatī, Karpūralatikā and others».

## Other opinions

- The ${GGD} (178) also has a Ratnāvalī, Śrī Rādhā's *prāṇa-sakhī*, who became **Gopīnātha Ācārya**.

## Sources

${GGD} 178, 194–207; ${RKGD}, Laghu-bhāga 179–180.
`,
    replace: [["belonging to the sakhā of Lord Nityānanda. In Vrajalīlā he was  Ratnavali (Gaura-gaṇoddeśa-dīpikā 194, 200, Caitanya Caritāmṛta  1.11.51).", "belonging to the sakhā of Lord Nityānanda (Caitanya Caritāmṛta 1.11.51)."]],
  },
  {
    id: 674,
    name: "Ananta Caṭṭarāja (Śrī Kaṇṭhābharaṇa)",
    text: `## In Kṛṣṇa-līlā

**Gopālī**, one of Śrī Rādhā's maidservants.

## ${GGD} 194–207

> gopālī hariṇī kālī kalākṣī nitya-mañjarī
> …
> śrī-kaṇṭhābharaṇopādhir anantaś caṭṭa-vaṁśajaḥ

${LIST_194} So Gopālī, the nineteenth maidservant, is the nineteenth devotee: «Śrī Kaṇṭhābharaṇa Ananta, who was born in the Caṭṭa dynasty».

## Gopālī in the books

- **${RKGD}** (Laghu-bhāga 136–139): a Gopālī is named among Śrī Kṛṣṇa's beloveds, the leaders of the gopīs' groups — «Candrāvalī, Padmā, Śyāmā, Śaibyā, Bhadrikā, Tārā, Vicitrā, **Gopālī**, Pālikā…».

## Sources

${GGD} 194–207; ${RKGD}, Laghu-bhāga 136–139.
`,
    replace: [[" In Kṛṣṇa-līlā: Gopālī (Gaura-gaṇoddeśa-dīpikā 196, 206).", ""]],
  },
  {
    id: 692,
    name: "Kāśīnātha Paṇḍita (of Navadvīpa)",
    text: `## In Kṛṣṇa-līlā

**Kulaka**, the brāhmaṇa whom King Satrājit sent to Kṛṣṇa (Mādhava) to arrange His marriage with Satyabhāmā — as now he arranged the Lord's marriage with Viṣṇupriyā.

## ${GGD} 50

> yaś ca satrājitā vipraḥ prahito mādhavaṁ prati
> satyodvāhāya kulakaḥ śrī-kāśīnātha eva saḥ

«The brāhmaṇa named Kulaka, whom Mahārāja Satrājit sent to Lord Mādhava to arrange the Lord's marriage with Satyabhāmā, appeared in Lord Caitanya's pastimes as Śrī Kāśīnātha.»

## Sources

${GGD} 50.
`,
    remove: ["In Kṛṣṇa-līlā: Kulaka, the brāhmaṇa sent by Satrājit to arrange Satyabhāmā's marriage (Gaura-gaṇoddeśa-dīpikā 50)."],
  },
];
fs.writeFileSync(new URL("./tanda5.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length + " fichas");
