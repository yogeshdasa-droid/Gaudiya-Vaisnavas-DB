// node tanda3.mjs → tanda3.json (Gaṇoddeśa, tanda 3). The books of Info take precedence.
// Left out: #217 Dhruvānanda (only «Lalitā, according to some»: perhaps the same as #216 — ask), #222 Dīnahīna dāsa (no
// identity: he translated the GGD), #271 Gadādhara Bhaṭṭa (GGD 165 Raṅgadevī may be another Gadādhara Bhaṭṭa — ask).
import fs from "node:fs";
const GGD = "Gaura-gaṇoddeśa-dīpikā";
const RKGD = "Rādhā-Kṛṣṇa-gaṇoddeśa-dīpikā";
const LIST_194 = `In verses 194–207 the ${GGD} names twenty-seven maidservants of Śrī Rādhā — «Mālatī, Candralatikā, Mañjumedhā, Varāṅgadā, Ratnāvalī, Kamalā, Guṇacūḍā, Sukeśinī, Karpūra-mañjarī, Śyāma-mañjarī, Śveta-mañjarī, Vilāsa-mañjarī, Kāmalekhā, Mauna-mañjarī, Gandhonmadā, Rasonmadā, Candrikā, Kalabhāṣiṇī, Gopālī, Hariṇī, Kālī, Kalākṣī, Nitya-mañjarī, Kalakaṇṭhī, Kuraṅgākṣī, Candrikā and Candraśekharā» — who «assuming male forms appeared among Lord Caitanya's associates», and then the devotees they became, *kramaśaḥ*, in the same order.`;
const plan = [
  {
    id: 216,
    name: "Dhruvānanda Brahmacārī",
    text: `## In Kṛṣṇa-līlā

**Śrī Lalitā**, the foremost of Śrī Rādhā's eight sakhīs — who also appeared, by another manifestation of herself, as Gadādhara Paṇḍita.

## ${GGD} 152

> dhruvānando brahmacārī lalitety apare jaguḥ
> sva-prakāśa-vibhedena samīcīnaṁ mataṁ tu tat

«Some say that Dhruvānanda Brahmacārī is the incarnation of Lalitā-gopī. This opinion is also correct, for Lalitā-gopī appeared as both Gadādhara Paṇḍita and Dhruvānanda Brahmacārī.»

## Lalitā in the books

- **${RKGD}** (Bṛhad-bhāga 79–82):

> tatrādyā lalitā-devī syād aṣṭāsu varīyasī
> priya-sakhyā bhavej jyeṣṭhā saptaviṁśati-vāsaraiḥ

«Śrī Lalitā-devī is the foremost amongst these eight variṣṭha sakhīs. She is twenty-seven days older than her dear friend Śrī Rādhā.» She is renowned by the name **Anurādhā**; her nature is *vāmā* and *prakharā* (quick to anger, outspoken); her complexion is like bright yellow gorocanā and her dress the colour of a peacock's tail; her mother is Sāradī, her father Viśoka, and her husband Bhairava, a friend of Govardhana Gopa (81–82).

## Other opinions

- Śākhā-nirṇayāmṛta 4: Lalitā.

## Sources

${GGD} 152; ${RKGD}, Bṛhad-bhāga 79–82; Śākhā-nirṇayāmṛta 4.
`,
    replace: [[" In Kṛṣṇa-līlā: Lalitā (Gaura-gaṇoddeśa-dīpikā 152; Śākhā-nirṇayāmṛta 4).", ""]],
  },
  {
    id: 244,
    name: "Dvija Balarāma Dāsa Ṭhākura",
    text: `## In Kṛṣṇa-līlā

**Sumandirā**, a sakhī of Campakalatā's group — according to the record (citing Caitanya-caritāmṛta Ādi 11.34); the ${GGD} does not name him.

## Sumandirā in the books

- **${RKGD}** (Bṛhad-bhāga 244):

> kuraṅgākṣī sucaritā maṇḍalī maṇikuṇḍalā
> candrikā candralatikā paṅkajākṣī sumandirā

«Kuraṅgākṣī, Sucaritā, Maṇḍalī, Maṇikuṇḍalā, Candrikā, Candralatikā, Paṅkajākṣī and Sumandirā are the eight prominent sakhīs serving under Śrī Campakalatā Sakhī's guidance.»

## Sources

Caitanya-caritāmṛta Ādi 11.34 (as the record gives it); ${RKGD}, Bṛhad-bhāga 244.
`,
    replace: [[" In a past incarnation he was Sumandira Sakhī (Caitanya Caritāmṛta 1.11.34).", ""]],
  },
  {
    id: 260,
    name: "Dvija Raghunātha",
    text: `## In Kṛṣṇa-līlā

**Varāṅgadā**, one of Śrī Rādhā's maidservants, of Tuṅgavidyā's group.

## ${GGD} 194–207

> mālatī candralatikā mañjumedhā varāṅgadā
> …
> raghunātho dvijaḥ kaścid gaurāṅgānanya-sevakaḥ

${LIST_194} So Varāṅgadā, the fourth maidservant, is the fourth devotee: «Raghunātha Dvija, who was an unalloyed servant of Lord Caitanya».

## Varāṅgadā in the books

- **${RKGD}** (Bṛhad-bhāga 246):

> mañjumedhā sumadhurā sumadhyā madhurekṣaṇā
> tanumadhyā madhuspandā guṇacūḍā varāṅgadā

«Mañjumedhā, Sumadhurā, Sumadhyā, Madhurekṣaṇā, Tanumadhyā, Madhuspandā, Guṇacūḍā and Varāṅgadā are the eight prominent sakhīs serving under the guidance of Śrī Tuṅgavidyā Sakhī.»
- **${RKGD}** (Laghu-bhāga 177): named among Śrī Rādhā's *priya-sakhīs*.

## Sources

${GGD} 194–207; ${RKGD}, Bṛhad-bhāga 246, Laghu-bhāga 177.
`,
    replace: [[" In Vraja-līlā he was Varangada. (Gaura-gaṇoddeśa- dīpikā 194, 200)", ""]],
  },
  {
    id: 278,
    name: "Gajapati Pratāparudra Deva",
    text: `## In Kṛṣṇa-līlā

**Mahārāja Indradyumna**, the king who began the worship of Lord Jagannātha.

## ${GGD} 118

> purī śrī-paramānando ya āsīd uddhavaḥ purā
> indradyumno mahārājo jagannāthārcakaḥ purā
> jātaḥ pratāparudraḥ san sama indreṇa so 'dhunā

«Śrī Paramānanda Purī had formerly been Uddhava. Mahārāja Pratāparudra, who was as powerful as Lord Indra, had formerly been Mahārāja Indradyumna, who began the worship of Lord Jagannātha.»

## Sources

${GGD} 118.
`,
    remove: ["In Kṛṣṇa-līlā: King Indradyumna, who began the worship of Jagannātha (Gaura-gaṇoddeśa-dīpikā 118)."],
  },
  {
    id: 281,
    name: "Kumudānanda Paṇḍita (Gāndharva)",
    text: `## In Kṛṣṇa-līlā

**Gandharva**, a cowherd boy, one of Kṛṣṇa's priya-narma-sakhās.

## ${GGD} 136

> gandharvo yo vraje gopaḥ kumudānanda-paṇḍitaḥ

«The devotee who had been the cowherd boy Gandharva in Vrajabhūmi appeared in Lord Caitanya's pastimes as Kumudānanda Paṇḍita.»

## Gandharva in the books

- **${RKGD}** (Laghu-bhāga 41): «Subala, Arjuna, Gandharva, Vasanta, Ujjvala, Kokila, Sanandana, Vidagdha and other sakhās are famous as priya-narma-sakhās» — the most intimate friends, from whom no secret is hidden (42).
- **${RKGD}** (Laghu-bhāga 50–52):

> niśākara-prabhā-kāntir gandharvo rūpavān bhavet
> rakta-vastra-paridhāno nānābharaṇa-saṁyutaḥ

«The highly attractive Gandharva has a bodily lustre which resembles that of a moon. He wears red clothes and is decorated by innumerable types of ornaments.» He is twelve years old, decorated with flower garlands; his mother is Mitrā and his father Vināka; «Gandharva is most dear to Śrī Kṛṣṇa and is famous for his various amazing pastimes» (51–52).

## Sources

${GGD} 136; ${RKGD}, Laghu-bhāga 41–42, 50–52.
`,
    replace: [["; Gāndharva gopa in Kṛṣṇa-līlā (Gaura-gaṇoddeśa-dīpikā 136).", "."]],
  },
  {
    id: 289,
    name: "Gaṅgā Dāsa Paṇḍit",
    text: `## In Kṛṣṇa-līlā

**Vasiṣṭha Muni**, the guru of Lord Rāmacandra (in Rāma-līlā), who appeared by a special manifestation as both Gaṅgādāsa and Sudarśana.

## ${GGD} 53

> purāsīd raghunāthasya yo vasiṣṭha-munir guruḥ
> sa prakāśa-viśeṣeṇa gaṅgādāsa-sudarśanau

«The same person who formerly appeared as Vasiṣṭha Muni, the spiritual master of Lord Rāmacandra, appeared in Lord Caitanya's pastimes as Gaṅgādāsa and Sudarśana.»

## Other opinions

- The record said **Sāndīpani Muni**, Kṛṣṇa's teacher. The ${GGD} gives Sāndīpani to **Keśava Bhāratī**, who gave the Lord sannyāsa (52: *mathurāyāṁ yajña-sūtraṁ purā kṛṣṇāya yo muniḥ / dadau sāndīpaniḥ so 'bhūd adya keśava-bhāratī*, «the sage Sāndīpani, who gave Lord Kṛṣṇa the sacred thread in Mathurā, is now Keśava Bhāratī»).

## Sources

${GGD} 52–53.
`,
    remove: ["In Kṛṣṇa-līlā: Sāndīpani Muni; Vasiṣṭha, the guru of Rāmacandra, is also in him (Gaura-gaṇoddeśa-dīpikā 53)."],
    replace: [[" Vasiṣṭha Muni appeared by a special manifestation as both Gaṅgādāsa and Sudarśana (Gaura-gaṇoddeśa-dīpikā 53).", ""]],
  },
  {
    id: 292,
    name: "Gaṅgā Devī",
    text: `## In Kṛṣṇa-līlā

**Gaṅgā**, the sacred river born from the lotus feet of Lord Viṣṇu; her husband Mādhava was King Śantanu.

## ${GGD} 69

> viṣṇu-padodbhavā gaṅgā yāsīt sā nija-nāmataḥ
> nityānandātmajā jātā mādhavaḥ śantanur nṛpaḥ

«The Ganges River, who was born from the lotus feet of Lord Viṣṇu, appeared in Lord Caitanya's pastimes as Śrīmatī Gaṅgā-devī, the daughter of Lord Nityānanda. Her husband, Śrī Mādhava, had formerly been Mahārāja Śantanu.»

## Sources

${GGD} 69.
`,
    remove: ["In Kṛṣṇa-līlā: the river Gaṅgā; her husband was King Śantanu (Gaura-gaṇoddeśa-dīpikā 69)."],
  },
  {
    id: 297,
    name: "Gaṅgāmantrī",
    text: `## In Kṛṣṇa-līlā

**Candrikā**, one of Śrī Rādhā's maidservants.

## ${GGD} 194–207

> gandhonmadā rasonmadā candrikā kalabhāṣiṇī
> …
> gaṅgā-mantrī jagannātho māmūpādhir dvijottamaḥ

${LIST_194} So Candrikā, the seventeenth maidservant, is the seventeenth devotee: Gaṅgā-mantrī. (The list has a second Candrikā, the twenty-sixth.)

## Candrikā in the books

- **${RKGD}** (Bṛhad-bhāga 244): one of the eight prominent sakhīs serving under Śrī Campakalatā — «Kuraṅgākṣī, Sucaritā, Maṇḍalī, Maṇikuṇḍalā, Candrikā, Candralatikā, Paṅkajākṣī and Sumandirā».
- **${RKGD}** (Laghu-bhāga 178): named among Śrī Rādhā's *priya-sakhīs*.
- **${RKGD}** (Bṛhad-bhāga 250): according to the Sammohana-tantra, one of Śrī Rādhā's eight sakhīs.

## Sources

${GGD} 194–207; ${RKGD}, Bṛhad-bhāga 244, 250, Laghu-bhāga 178; Gauḍīya Vaiṣṇava Abhidhāna.
`,
    replace: [[" In Kṛṣṇa-līlā: Candrikā (Gaura-gaṇoddeśa-dīpikā 196, 205) (Gauḍīya Vaiṣṇava Abhidhāna).", ""]],
  },
  {
    id: 302,
    name: "Garuḍa Avadhūta",
    text: `## In Kṛṣṇa-līlā

One of the nine **Jāyanteyas** (the nine Yogendras, sons of Ṛṣabha), the celibate devotees who spoke the Bhāgavata teachings to King Janaka (Nimi), and appeared as nine sannyāsīs around Lord Caitanya.

## ${GGD} 98–101

> jāyanteyāḥ sthitā ūrdhva-retasaḥ sama-darśinaḥ
> nava bhāgavatāḥ pūrvaṁ śrī-bhāgavata-saṁhitām
> pratyūcur janakaṁ te 'dya bhūtvā sannyāsinaḥ sadā
> prabhuṇā gaura-hariṇā viharanti sma te yathā
> …
> garuḍākhyāvadhūtaś ca śrī-gopendrākhya āśramaḥ

«The nine Jāyanteyas, who were fixed in celibacy and equal vision, and who spoke the Śrī Bhāgavata-saṁhitā to Janaka Ṛṣi, appeared on this earth as nine sannyāsīs, and continually performed pastimes with Lord Caitanya. Their names were: Śrī Nṛsiṁhānanda Tīrtha, Śrī Satyānanda Bhāratī, Śrī Nṛsiṁha Tīrtha, Śrī Cidānanda Tīrtha, Śrī Jagannātha Tīrtha, Śrī Vāsudeva Tīrtha, Śrī Rāma Tīrtha, Śrī Puruṣottama Tīrtha, and Śrī Garuḍa Avadhūta, who was also known as Śrī Gopendra Āśrama.»

## Other opinions

- The record said «Kumudanidhi»: the ${GGD} (116) gives **Kumuda**, the associate of Vaikuṇṭha, to another Garuḍa, a devotee of Gauḍa (#304).

## Sources

${GGD} 98–101 (and 116).
`,
    remove: ["He was Kumudanidhi in a past incarnation."],
  },
  {
    id: 303,
    name: "Garuḍa Paṇḍita",
    text: `## In Kṛṣṇa-līlā

**Garuḍa**, the eagle carrier of Lord Viṣṇu — fittingly, he survived a snake's venom by chanting the holy name.

## ${GGD} 117

> garuḍaḥ paṇḍitaḥ so 'dya garuḍo yaḥ purā śrutaḥ

«Garuḍa Paṇḍita was the incarnation of Garuḍa.» (The rest of the verse: Gopīnātha Siṁha was Akrūra; some say Keśava Bhāratī was Akrūra.)

## Sources

${GGD} 117.
`,
    remove: ["In his past incarnation he was Garuda."],
  },
  {
    id: 304,
    name: "Garuḍa",
    text: `## In Kṛṣṇa-līlā

**Kumuda**, an associate of the Lord famous in Vaikuṇṭha.

## ${GGD} 116

> puṇḍarīkākṣa-kumudau khyātau vaikuṇṭha-maṇḍale
> govinda-garuḍākhyau tau jātau gauḍe prabhoḥ priyau

«The two liberated souls Puṇḍarīkākṣa and Kumuda, who are very famous in Vaikuṇṭhaloka, appeared in Bengal as the two devotees named Govinda and Garuḍa, who were both very dear to Lord Caitanya Mahāprabhu.»

## Sources

${GGD} 116.
`,
    remove: ["In a past incarnation he was Vaikuṇṭha-pārṣada Kumuda."],
  },
  {
    id: 325,
    name: "Śrī Gaurīdāsa Paṇḍita",
    text: `## In Kṛṣṇa-līlā

**Subala**, Kṛṣṇa's dearest friend, the priya-narma-sakhā who arranges the meetings of Śrī Rādhā and Śrī Kṛṣṇa; one of the twelve gopālas of Śrī Nityānanda.

## ${GGD} 128

> subalo yaḥ priya-śreṣṭhaḥ sa gaurī-dāsa-paṇḍitaḥ
> kamalākaraḥ pippalāi nāmnāsīd yo mahābalaḥ

«Lord Kṛṣṇa's dearest friend Subala appeared in Lord Caitanya's pastimes as Gaurīdāsa Paṇḍita. The cowherd boy Mahābala appeared in Lord Caitanya's pastimes as Kamalākara Pippalāi.»

## Subala in the books

- **${RKGD}** (Laghu-bhāga 41): first of the priya-narma-sakhās — «Subala, Arjuna, Gandharva, Vasanta, Ujjvala, Kokila, Sanandana, Vidagdha…».
- **${RKGD}** (Laghu-bhāga 44–46):

> subalasya gaura-kāntir nīla-vastra-manoharaḥ
> nānā-ratna-bhūṣitāṅgo nānā-puṣpa-vibhūṣitaḥ

«Subala is fair-complexioned. He is supremely enchanting with his blue attire and his body decorated with various jewels and flowers. He is in the blooming youth of twelve-and-a-half years. He is immersed in serving Śrī Kṛṣṇa in various ways as His friend. He is most expert in arranging meetings between Śrī Rādhā and Śrī Kṛṣṇa. He is absorbed in madhura-bhāva and is endowed by various good qualities, which bring joy to Śrī Kṛṣṇa. Subala is extremely dear to Śrī Kṛṣṇa due to all these reasons.»

## Sources

${GGD} 128; ${RKGD}, Laghu-bhāga 41, 44–46.
`,
    remove: ["In Kṛṣṇa-līlā: Subala (Gaura-gaṇoddeśa-dīpikā 128)."],
  },
];
fs.writeFileSync(new URL("./tanda3.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length + " fichas");
