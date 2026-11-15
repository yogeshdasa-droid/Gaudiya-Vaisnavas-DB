// node tanda12.mjs → tanda12.json (Gaṇoddeśa, tanda 12). The books of Info take precedence (Whisper: «Gaṇoddeśa manda»).
// #1484 Sudhānidhi Rāya: the GGD names a «Sudhānidhi» among Kuvera's nine treasures → his text, with the doubt.
// Left out — ask Whisper: #1597 Vaiṣṇavānanda Ācārya (= Raghunātha Purī) and #1215 «Raghunātha» (one of the eight siddhis)
// seem one person; #1605 Vallabha Miśra and #1610 Vallabhācārya (both «father of Lakṣmīpriyā», GGD 44) seem one person;
// #1627 Vanamālī dāsa (Kavirāja, Advaita's branch) and #1629 Vanamālī Kavirāja (disciple of Śrīnivāsa) both say Citrā
// (GGD 161: «kavirājaḥ śrī-vanamālī, prabhoḥ priyaḥ» — dear to the Lord, so more likely #1627).
// #1630 Vanamālī Vipra: Sudāmā Vipra is GGD 114 («bhikṣako vanamālī»), not 144 (144: Vanamālā Paṇḍita = Mālādhara).
// #1575 Upendra Miśra: the GGD does not name Parjanya; it names his wife (Kamalāvatī, #633 Kalāvatī) as Varīyasī (36).
import fs from "node:fs";
const GGD = "Gaura-gaṇoddeśa-dīpikā";
const RKGD = "Rādhā-Kṛṣṇa-gaṇoddeśa-dīpikā";
const V36 = `## ${GGD} 36

> mahāmānyābhidhā gopī vraje yāsīd varīyasī
> kṛṣṇa-pitāmahī saiva nāmnātra kamalāvatī

«The gopī named Varīyasī-devī, who was Lord Kṛṣṇa's paternal grandmother in Vraja, appeared as Kamalāvatī-devī during Lord Caitanya's advent.»`;
const plan = [
  {
    id: 1484,
    name: "Sudhānidhi Rāya",
    text: `## In Kṛṣṇa-līlā

One of the **nine treasures (*nidhis*) of Kuvera** — the ${GGD} names a **Sudhānidhi** among them.

## ${GGD} 102–103

> loke ye nidhayaḥ khyātāḥ padma-śaṅkhādayo nava
> …
> śrī-śrīnidhiś ca śrī-garbhaḥ kaviratnaḥ sudhānidhiḥ

«Kuvera's famous nine treasures, which include his conch and lotus, took birth during Lord Caitanya's pastimes as the nine sons of Nidhiratna-devī. They were all very dear to the Lord. Their names were Śrīnidhi, Śrīgarbha, Kaviratna, **Sudhānidhi**, Vidyānidhi, Guṇanidhi, the learned brāhmaṇa Ratnabāhu, Śrīmān Ācāryaratna, and Śrī Ratnākara Paṇḍita.» The verse does not say which treasure each one is.

## Other opinions

- The English translation makes the nine «sons of Nidhiratna-devī», while this Sudhānidhi was the son of Bhavānanda Rāya: so the verse's Sudhānidhi may be another devotee of the name.
- Acyutānanda dāsa (Guru-bhakti-gītā, vol. 3, p. 176) calls him **Sudhākara**, the gopī **Manoharī**.

## Sources

${GGD} 102–103; Acyutānanda, Guru-bhakti-gītā.
`,
    remove: ["In Kṛṣṇa-līlā: one of the nine nidhis (Gaura-gaṇoddeśa-dīpikā 102-103); Acyutānanda dāsa (Gurubhakti-gītā, vol. 3, p. 176) calls him Sudhākara, the gopī Manoharī."],
  },
  {
    id: 1567,
    name: "Uddhāraṇa Datta Ṭhākura",
    text: `## In Kṛṣṇa-līlā

**Subāhu**, a cowherd boy of Vraja.

## ${GGD} 129

> subāhur yo vraje gopo datta uddhāraṇākhyakaḥ
> maheśa-paṇḍitaḥ śrīmān mahābāhur vraje sakhā

«The devotee who had been the cowherd boy Subāhu in Vrajabhūmi appeared in Lord Caitanya's pastimes as Uddhāraṇa Datta. Lord Kṛṣṇa's cowherd friend Mahābāhu appeared in Lord Caitanya's pastimes as Śrīmān Maheśa Paṇḍita.»

## Sources

${GGD} 129.
`,
    remove: ["In Kṛṣṇa-līlā: Subāhu (Gaura-gaṇoddeśa-dīpikā)."],
  },
  {
    id: 1568,
    name: "Uddhava dāsa (of Gadādhara's branch)",
    text: `## In Kṛṣṇa-līlā

Not a person of Vraja: **Candra**, the moon-god, entered him (*āveśa*) — as Candraśekhara Ācārya was the moon-god himself.

## ${GGD} 112

> candraśekharācāryaś candro jñeyo vicakṣaṇaiḥ
> śrīmān uddhava-dāso 'pi candrāveśāvatārakaḥ

«The learned devotees know that Candraśekhara Ācārya was an incarnation of the moon-god and Śrīmān Uddhava dāsa was an empowered incarnation of the moon-god.»

## Sources

${GGD} 112.
`,
    remove: ["In Kṛṣṇa-līlā: āveśa of Candrā (Gaura-gaṇoddeśa-dīpikā 112)."],
  },
  {
    id: 1575,
    name: "Upendra Miśra",
    text: `## In Kṛṣṇa-līlā

**Parjanya**, Kṛṣṇa's paternal grandfather — according to the record. The ${GGD} does not name him; it names his wife, Kamalāvatī (Kalāvatī), as Kṛṣṇa's paternal grandmother.

${V36}

## Parjanya in the books

- **${RKGD}** (Bṛhad-bhāga 15–16):

> maṅgalāmṛta-parjanyaḥ parjanyo nāma ballavaḥ
> variṣṭho vraja-goṣṭhīnāṁ sa kṛṣṇasya pitāmahaḥ

«The name of Śrī Kṛṣṇa's paternal grandfather is Parjanya (cloud) because he showers torrents of auspicious nectar. His bodily complexion resembles molten gold and both his hair and clothing are of white colour. Grandfather Śrī Parjanya is the object of veneration to all in Vraja.»

## Sources

${GGD} 36; ${RKGD}, Bṛhad-bhāga 15–16.
`,
    replace: [["; Parjanya Gopa in Vraja (GGD 35)", ""]],
  },
  {
    id: 633,
    name: "Kalāvatī",
    text: `## In Kṛṣṇa-līlā

**Varīyasī**, Kṛṣṇa's paternal grandmother in Vraja — as now she was the Lord's grandmother.

${V36}

(The verse calls her Kamalāvatī.)

## Sources

${GGD} 36.
`,
  },
  {
    id: 1577,
    name: "Baḍa Haridāsa",
    text: `## In Kṛṣṇa-līlā

**Raktaka**, a servant of Kṛṣṇa in Vṛndāvana; Choṭa Haridāsa was Patraka.

## ${GGD} 138

> vṛndāvane sthitau prāg yau bhṛtyau raktaka-patrakau
> gaurāṅga-sevakāv adya haridāsa-bṛhacchiśū

«Raktaka and Patraka, who had been Lord Kṛṣṇa's servants in Vṛndāvana, later appeared as Haridāsa and Bṛhacchiśu, two servants of Lord Caitanya.»

## Other opinions

- The verse names «Haridāsa and Bṛhacchiśu»; the Gauḍīya Vaiṣṇava Abhidhāna («Haridāsa» 5) takes them as Baḍa Haridāsa (Raktaka) and Choṭa Haridāsa (Patraka).

## Raktaka in the books

- **${RKGD}** (Laghu-bhāga 73–74): among Kṛṣṇa's *ceṭas* — «Bhaṅgura, Bhṛṅgāra, Sāndhika, Grahila, **Raktaka**, Patraka, Patrī, Madhukaṇṭha, Madhuvrata…», who carry His flute, horn, stick and the rope for milking.

## Sources

${GGD} 138; ${RKGD}, Laghu-bhāga 73–74; Gauḍīya Vaiṣṇava Abhidhāna.
`,
    remove: ["In Kṛṣṇa-līlā: Raktaka, a servant of Kṛṣṇa in Vraja (Gaura-gaṇoddeśa-dīpikā 138; Gauḍīya Vaiṣṇava Abhidhāna, «Haridāsa» 5). (Choṭa Haridāsa was Patraka.)"],
  },
  {
    id: 1598,
    name: "Śrī Vakreśvara Paṇḍita",
    text: `## In Kṛṣṇa-līlā

**Aniruddha**, the fourth member of the Catur-vyūha — Kṛṣṇa Himself entered him and made him dance; and the sakhī **Śaśirekhā** entered him.

## ${GGD} 71–72

> vyūhas turyo 'niruddho yaḥ sa vakreśvara-paṇḍitaḥ
> kṛṣṇa-veśaja-nṛtyena prabhoḥ sukham ajījanat

«Lord Aniruddha, the fourth member of the Catur-vyūha, appeared in Lord Caitanya's pastimes as Vakreśvara Paṇḍita. Lord Kṛṣṇa personally entered Vakreśvara's body and caused him to dance in ecstasy. This ecstatic dancing of Vakreśvara Paṇḍita delighted Lord Caitanya Mahāprabhu.» (71) «One day Vakreśvara Paṇḍita sweetly said to Lord Caitanya: "O merciful Lord, please give me a thousand Gandharva singers to sing as I dance."» (72)

## ${GGD} 73

> sva-prakāśāvibhedena śaśirekhā tam āviśat
> …

«Śaśirekhā entered him, as non-different from her own manifestation» — read as about Vakreśvara, of the verses before (the record, the Gauḍīya Vaiṣṇava Abhidhāna); the English translation takes *śaśi-rekhā* as «a particle of moonlight» entering Nakula Brahmacārī, of the second half of the verse.

## Other opinions

- Dhyānacandra makes him **Tuṅgavidyā**.

## Sources

${GGD} 71–73; Dhyānacandra.
`,
    remove: ["In Kṛṣṇa-līlā: Aniruddha; the sakhī Śaśirekhā also entered him (Gaura-gaṇoddeśa-dīpikā 71-73); Tuṅgavidyā according to Dhyānacandra."],
  },
  {
    id: 1599,
    name: "Vallabha Bhaṭṭa (Vallabhācārya)",
    text: `## In Kṛṣṇa-līlā

**Śukadeva Gosvāmī**, the son of Vyāsadeva, who spoke the Bhāgavatam — as now he wrote on it.

## ${GGD} 110

> bhaṭṭo vallabha-nāmābhūc chuko dvaipāyanātmajaḥ

«Śukadeva Gosvāmī, the son of Śrīla Vyāsadeva, appeared during Lord Caitanya's pastimes as the devotee named Vallabha Bhaṭṭa.»

## Sources

${GGD} 110.
`,
    remove: ["In Kṛṣṇa-līlā: Śukadeva Gosvāmī (Gaura-gaṇoddeśa-dīpikā 110)."],
  },
  {
    id: 1623,
    name: "Śrī Vaṁśīvadana Ṭhākura",
    text: `## In Kṛṣṇa-līlā

**Kṛṣṇa's flute** (*vaṁśī*), His favourite.

## ${GGD} 179

> vaṁśī kṛṣṇa-priyā yāsīt sā vaṁśī-dāsa-ṭhakkuraḥ

«Lord Kṛṣṇa's favourite flute appeared as Vaṁśīdāsa Ṭhākura.»

## Sources

${GGD} 179.
`,
    remove: ["In Kṛṣṇa-līlā: Kṛṣṇa's flute (vaṁśī) (Gaura-gaṇoddeśa-dīpikā 179)."],
  },
  {
    id: 1625,
    name: "Vanamālī Ācārya",
    text: `## In Kṛṣṇa-līlā

**Viśvāmitra Muni**, who arranged Lord Rāmacandra's marriage; and the **brāhmaṇa messenger** whom Rukmiṇī sent to Kṛṣṇa — as now he arranged the Lord's first marriage, with Lakṣmīpriyā.

## ${GGD} 49

> viśvāmitro 'pi ghaṭakaḥ śrī-rāmodvāha-karmaṇi
> rukmiṇyā preṣito vipro yaś ca śrī-keśavaṁ prati
> tāvaraṁ vanamālī yat-karmaṇācāryatāṁ gataḥ

«The same person who appeared as Viśvāmitra Muni, who arranged the marriage of Lord Rāmacandra, and who also appeared as the brāhmaṇa messenger sent by Śrīmatī Rukmiṇī-devī to Lord Keśava, also appeared in Lord Caitanya's pastimes as Vanamālī Ācārya, who was famous as a learned astrologer.»

## Sources

${GGD} 49.
`,
    replace: [["He was Visvamitra in Kṛṣṇa līlā. (GGD. 49, ", "(", ]],
  },
  {
    id: 1630,
    name: "Vanamālī Vipra (Paṇḍita)",
    text: `## In Kṛṣṇa-līlā

**Sudāmā Vipra**, Kṛṣṇa's poor brāhmaṇa friend, who received great wealth from the Lord — as now he came poor to Navadvīpa and received Kṛṣṇa-prema.

## ${GGD} 114

> bhikṣako vanamālī yaḥ sudāmāsīd dvijaḥ purā
> dhanaṁ prāpya prabhoḥ saṅge duḥkhaṁ matvābhramad yataḥ

«Vanamālī Ṭhākura was an incarnation of Sudāmā Brāhmaṇa, who was afflicted by great poverty and obtained great wealth from the Lord.»

## Other opinions

- The ${GGD} (144) names another, **Vanamālā Paṇḍita**, «very dear to Lord Caitanya», who was **Mālādhara**, the servant who carried Kṛṣṇa's veṇu and muralī flutes: *veṇuṁ ca muralīṁ yo 'dhān nāmnā mālādharo vraje / so 'dhunā vanamālākhyaḥ paṇḍito gaura-vallabhaḥ*. The record cited this verse for Sudāmā; Sudāmā is verse 114. (Mālādhara is among Kṛṣṇa's *ceṭas* in the ${RKGD}, Laghu-bhāga 73–74.)

## Sources

${GGD} 114, 144; ${RKGD}, Laghu-bhāga 73–74.
`,
    replace: [
      [" In his past incarnation he was born as Sudāmā. (GGD. 144, ", " ("],
      [" Sudāmā, Kṛṣṇa's poor brāhmaṇa friend (Gaura-gaṇoddeśa-dīpikā 114).", ""],
    ],
  },
];
fs.writeFileSync(new URL("./tanda12.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length + " fichas");
