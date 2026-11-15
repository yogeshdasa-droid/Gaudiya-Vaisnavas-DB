// node vraja10.mjs → vraja10.json («Vraja-Nitya-līlā», tanda 10: the flute, Nārada, Jaṭilā, Pradyumna, cowherds and
// maids in second place, Kulaka, Garuḍa; 15-11-2026).
import { UNK, GC, KINDS, SRC_K, FRIENDS, SRC_F, SERVANTS, SRC_S, notNamed, textOf, write } from "./comun.mjs";

const SATRAJIT = textOf("vraja9.json", 1354).replace(/^## In Kṛṣṇa's pastimes\n\n[^\n]*\n\n/, "");
const NOT_F = (who) => `The Gopāla-campū and the Ujjvala-nīlamaṇi-kiraṇa do not name ${who}; here is what they say of Kṛṣṇa's cowherd friends.`;
const SASI = `## Śaśirekhā

${notNamed("Śaśirekhā")}

${KINDS}`;

const plan = [
  {
    id: 1623,
    name: "Śrī Vaṁśīvadana Ṭhākura",
    text: `## In the Vraja-nitya-līlā

**Kṛṣṇa's flute** (*vaṁśī*) — one of His three famous messengers in Vraja, «the one who accomplishes everything».

## ${UNK} — Vaṁśī, the messenger

> vraje vīrā vṛndā vaṁśī ca kṛṣṇasya dūtī-trayam | pragalbha-vacanā vīrā vṛndā ca priya-vādinī, sarva-kārya-sādhikā vaṁśī (Dūtī-bheda, text 4)

«In Vraja, Śrī Kṛṣṇa has three famous messengers: Vīrā, Vṛndā and Vaṁśī. Vīrā is pragalbha-vacanā (a harsh speaker), Vṛndā is priya-vādinī (one who speaks sweetly), and **Vaṁśī, Śrī Kṛṣṇa's flute, is sarva-kārya-sādhikā (one who accomplishes everything)**» (p. 22). Among the pastimes of meeting is «stealing the flute (vaṁśī-caurya)» (p. 51).

## ${GC} — the flute

- **His messenger** (Pūrva-campū 23, verse 40): on the rāsa night, «Inviting them with his flute, his assigned messenger, calling them by means of its friends—streams of perfume, he lured them on a long path with devotion.»
- The brāhmaṇas' wives' «hearts had melted in affection by his attractive rāgas using the skillful, sweet notes of the flute» (Pūrva-campū 22, verse 12). Lalitā: «The mute and deaf flute becomes eloquent under his shelter» (30.60).
- **Who He is** (Uttara-campū 31, verse 46): «Rādhikā is your beloved. Śrīdāma and Subala are your friends. Balarāma is your elder brother. **The flute is your music.**»
- **Left in Vraja** (Uttara-campū 6.48, 32.19): leaving for Mathurā Kṛṣṇa said, «Stoka-kṛṣṇa should wrap himself in my cloth laden with fragrance and play the flute» — He had «entrusted to his representatives the flute, and horn to Stoka-kṛṣṇa and Subala».

## Sources

${UNK}, Dūtī-bheda 4 (pp. 20–22), p. 51; ${GC}, Pūrva 22.12, 23.40, 30.60; Uttara 6.48, 31.46, 32.19.
`,
  },
  {
    id: 1468,
    name: "Śrīla Śrīvāsa Paṇḍita",
    text: `## In Kṛṣṇa's pastimes

**Nārada Muni**, «with a body like Sarasvatī… with an eternal body», the guru of the two reciters of the Gopāla-campū.

## ${GC} — Nārada

- **The guru of Madhukaṇṭha and Snigdhakaṇṭha** (Pūrva-campū 2.89–91): asked where their powers came from, the twin reciters said, «Mercy of guru is the only cause in all cases… It is Nārada, to be remembered every morning, our fortunate possession, who rains all bliss.» Madhumaṅgala too is «equal to Nārada» (2.29) — Paurṇamāsī's boy «seems to be the youthful body of Nārada» (3.71).
- **Meeting Kṛṣṇa after Keśī** (Pūrva-campū 33.30–33): «When he was walking alone, Nārada in bliss met him. Kṛṣṇa saw Nārada approaching dressed in pure clothing.» «He recognized him as Nārada, with a body like Sarasvatī (made of akṣaras or syllables), with an eternal body. Like the Gaṅgā appearing from Viṣṇu's feet, he appeared from the sky… he had an auspicious body with the principal marks of a Vaiṣṇava such as tulasī beads. As a personification of Kṛṣṇa's glories, he filled the ears with various songs… As the full moon holds within itself the dark moon, so he held the form of Kṛṣṇa within his heart.» «Nārada described Kṛṣṇa and Kṛṣṇa described Nārada»; then Nārada told Kṛṣṇa what would come (33.35–55).
- In the Uttara-campū Nārada comes again with news (Uttara-campū 18, 25, 29–30).

## Sources

${GC}, Pūrva 2.29, 2.89–91, 3.71, 33.30–55; Uttara 18, 25, 29–30.
`,
  },
  {
    id: 1247,
    name: "Rāmacandra Purī",
    text: `## In the Vraja-nitya-līlā

**Jaṭilā**, Śrī Rādhā's mother-in-law, who entered him (Vibhīṣaṇa of Rāma-līlā is not in these books).

The Gopāla-campū does not name Jaṭilā; it names her son **Abhimanyu**, Rādhā's husband in the eyes of the world — a husband only of an illusion:

- Paurṇamāsī told Vṛndā, «They will not get married to other men. I will prevent this by using my magical powers» — «I have produced for all of them something like a bad dream in a waking state» (Pūrva-campū 15.47–69).
- At Rādhā's wedding with Kṛṣṇa, Vṛṣabhānu and Kīrtidā wept, and «people did not know of the grief caused when they had previously given her to Abhimanyu» (Uttara-campū 35, verse 60). Her parents said to her: «Knowing that Kṛṣṇa was your husband, you spit upon Abhimanyu who mistakenly thought he was your husband» (verse 62).
- «Since Abhimanyu and others had married your replicas, that was acceptable and you married Kṛṣṇa through Paurṇamāsī's arrangements» (Uttara-campū 37, the women bards' praise of Rādhā).
- The Ujjvala-nīlamaṇi: «The prauḍhā beloveds of Śrī Kṛṣṇa, such as Śrīmatī Rādhikā, are certainly parakīyā» — «These girls of Vraja, even though married to young cowherd men, still cherish a strong desire to unite intimately with Śrī Kṛṣṇa… called paroḍhā, or prauḍhā» (Nāyikā-vibhāga, pp. 8–9); Viśvanātha's maidservant-form said Rādhā «is presently at Her in-laws' house at Yāvaṭa» (p. xiv).

## Sources

${GC}, Pūrva 15.47–69; Uttara 35.60–62, 37; ${UNK}, pp. xiv, 8–9.
`,
  },
  {
    id: 1200,
    name: "Raghunandana Ṭhākura",
    text: `## In the Vraja-nitya-līlā

**Pradyumna** (Kandarpa), who in Vraja was a **priya-narma-sakhā** of Śrī Śrī Rādhā-Mādhava, helping in Their pastimes.

## ${UNK} — the priya-narma-sakhās

«The prema of the priya-narma-sakhās (the most intimate cowherd friends of Kṛṣṇa) in Vraja reaches up to the point of anurāga. The highest point of samarthā-rati in the vraja-gopīs, as well as in Śrī Kṛṣṇa's friends like Subala, extends to the stage of mahābhāva» (Āśraya-nirṇaya, text 15, p. 46). In the Ujjvala-nīlamaṇi, Kāmadeva is the example of the *dhīra-lalita* hero, «ever youthful, carefree and controlled by his beloveds' prema» (p. 3).

${NOT_F("this priya-narma-sakhā")}

${FRIENDS}## Sources

${UNK}, p. 3; ${SRC_F}.
`,
  },
  {
    id: 1740,
    name: "Śrīla Vṛndāvana dāsa Ṭhākura",
    text: `## In the Vraja-nitya-līlā

The cowherd **Kusumāpīḍa**, who entered him (Vedavyāsa, his main identity, is not in Vraja).

${NOT_F("Kusumāpīḍa")}

${FRIENDS}## Sources

${SRC_F}.
`,
  },
  {
    id: 15,
    name: "Śrī Advaita Ācārya Prabhu",
    text: `## In the Vraja-nitya-līlā

By Kṛṣṇa's mercy **Sadāśiva** took the form of a **cowherd boy** and danced with Kṛṣṇa in Vraja (the Gaura-gaṇoddeśa-dīpikā).

${NOT_F("this cowherd boy")}

${FRIENDS}## Sources

${SRC_F}.
`,
  },
  {
    id: 14,
    name: "Acyutānanda (son of Advaita)",
    text: `## In the Vraja-nitya-līlā

The gopī **Acyutā**, present in him (with Kārttikeya, who is not in Vraja).

${notNamed("Acyutā")}

${KINDS}## Sources

${SRC_K}.
`,
  },
  {
    id: 692,
    name: "Kāśīnātha Paṇḍita (of Navadvīpa)",
    text: `## In Kṛṣṇa's pastimes

**Kulaka**, the brāhmaṇa whom King Satrājit sent to Kṛṣṇa to arrange His marriage with Satyabhāmā. The Gopāla-campū does not name him; it tells how Satrājit gave Satyabhāmā to Kṛṣṇa:

${SATRAJIT}`,
  },
  {
    id: 699,
    name: "Kāśīśvara Brahmacārī (disciple of Īśvara Purī)",
    text: `## In the Vraja-nitya-līlā

**Bhṛṅgāra**, one of Kṛṣṇa's servants (*ceṭas*) in Vṛndāvana — with Govinda, who was Bhaṅgura; and **Śaśirekhā**, a gopī of Vraja.

The Gopāla-campū and the Ujjvala-nīlamaṇi-kiraṇa do not name Bhṛṅgāra. What the Gopāla-campū says of the servants of Kṛṣṇa's house:

${SERVANTS}
${SASI}## Sources

${SRC_S}; ${SRC_K}.
`,
  },
  {
    id: 1598,
    name: "Śrī Vakreśvara Paṇḍita",
    text: `## In the Vraja-nitya-līlā

The sakhī **Śaśirekhā**, who entered him (Aniruddha of the Catur-vyūha, his main identity, is not in Vraja).

${SASI}## Sources

${SRC_K}.
`,
  },
  {
    id: 303,
    name: "Garuḍa Paṇḍita",
    text: `## In Kṛṣṇa's pastimes

**Garuḍa**, the eagle who carries the Lord.

## ${GC} — Garuḍa

- In the fight for the pārijāta, Kṛṣṇa, «Mounting Garuḍa with Satyabhāmā… carrying Nandaka, the best of swords, went to Prāgjyotiṣa» (Uttara-campū 18.25); «Seeing that fort while on Garuḍa, Kṛṣṇa was amazed and he made Satyabhāmā's hairs stand on end for fun» (verse 12); «Keeping Satyabhāmā on the back of Garuḍa, Kṛṣṇa landed on earth» (18.52).

## Sources

${GC}, Uttara 18.25–52 (verse 12).
`,
  },
];
write("vraja10", plan);
