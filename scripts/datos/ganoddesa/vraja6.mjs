// node vraja6.mjs → vraja6.json («Vraja-Nitya-līlā», tanda 6: the mañjarīs, 15-11-2026).
// The Ujjvala-nīlamaṇi-kiraṇa names Lavaṅga Mañjarī and Bhānumatī Mañjarī (paricārikās, Dūtī-bheda p. 22), Prema
// Mañjarī (priya-sakhī, p. 23) and Maṇi Mañjarī (nitya-sakhī); the Gopāla-campū names no mañjarī. The others get the
// general text (Whisper: «lo general, más info mejor»), saying clearly that the books do not name them.
// 574 Jāhnavā and 1660 Vasudhā also get Revatī / Vāruṇī (Gopāla-campū, Uttara 15: Revata Kakudmī and his daughter).
import fs from "node:fs";
const UNK = "Ujjvala-nīlamaṇi-kiraṇa";
const GC = "Gopāla-campū";

const KINDS = `## ${UNK} — the sakhīs who love Śrī Rādhā more

> atha sakhī pañca-vidhā | sakhī, nitya-sakhī, prāṇa-sakhī, priya-sakhī, parama-preṣṭhā-sakhī | āsāṁ madhye kācit sama-snehā kācid asama-snehā | … yā rādhikāyāṁ snehādhikā sā nitya-sakhī |
> nitya-sakhyas tu kastūrī manojñā maṇi-mañjarī
> sindūrā candanavatī kaumudī madirādayaḥ (Sakhī-bheda, text 5)

- «There are five different types of sakhīs: (1) sakhī, (2) nitya-sakhī, (3) prāṇa-sakhī, (4) priya-sakhī and (5) parama-preṣṭha-sakhī. Of these, some possess equal affection for both Śrī Rādhā and Śrī Kṛṣṇa (sama-sneha), while others are partial to either Śrī Rādhā or Śrī Kṛṣṇa (viṣama-sneha).»
- «**Those sakhīs with more affection for Śrīmatī Rādhikā are called nitya-sakhīs.** They include Kasturī, Manojñā, Maṇi Mañjarī, Sindūrā, Candanavatī, Kaumudī and Madirā.»
- «The most prominent nitya-sakhīs are known as prāṇa-sakhīs. Examples are Tulasī, Keli-kandalī, Kādambarī, Śaśimukhī, Candralekhā, Priyambadā, Madonmadā, Madhumatī, Vasantī, Kalabhāṣinī, Ratnāvalī, Mālatī and Karpūralatikā. All of these gopīs are equal in beauty to Vṛndāvaneśvarī Śrīmatī Rādhikā.»
- «Vraja damsels such as Mālatī, Candralatikā, Guṇachūḍā, Varāṅgadā, Mādhavī, Candrikā, Prema Mañjarī, Tanumadhyamā and Kandarpa-sundarī are ten million in number. They are all examples of priya-sakhīs» (pp. 23–25).

## ${UNK} — the maidservants

- **Paricārikās**: among the messengers who bring Śrī Rādhā and Śrī Kṛṣṇa together, «Sakhīs such as **Lavaṅga Mañjarī and Bhānumatī Mañjarī** are called paricārikā, servants, or assistants… According to the necessity of the time, all sakhīs act as messengers» (Dūtī-bheda, text 4, p. 22). «A nisṛṣṭārthā-dūtī performs all services upon receiving a command and personally shoulders the total responsibility of arranging the meeting between Śrī Rādhā and Śrī Kṛṣṇa» (p. 21).
- **A maidservant of Rādhā** (introduction, pp. xiii–xiv): when envious scholars waited in a grove to kill Viśvanātha Cakravartī, «he suddenly disappeared, and in his place, a beautiful young girl of Vraja appeared, picking flowers with her friends… she replied, “I am a maidservant of my mistress, Śrīmatī Rādhikā. She is presently at Her in-laws' house at Yāvaṭa. She has sent me here to pick flowers.”»
- **Their mistress**: «Śrīmatī Rādhikā is His constitutional pleasure potency (svarūpa-bhūtā-hlādinī-śakti)… The other gopīs are Śrīmatī Rādhikā's direct and non-different expansions (kāya-vyūha), manifestations (prakāśa) or partial manifestations (aṁśa-svarūpa)» (pp. 3–4). «Although mohana-mahābhāva is awakened within all the sakhīs in Śrīmatī Rādhikā's yūtha (group), it is most awakened in Śrīmatī Rādhikā» (p. 43).
- **Her group's love**: «Śrīmatī Rādhikā and the gopīs who follow Her possess mañjiṣṭhā-rāga, which is independent, having no basis other than itself. It eternally increases and becomes more and more splendid» (p. 41); «Adhirūḍha-mahābhāva is seen only in Śrīmatī Rādhikā's group» (p. 46).
`;
const SRC_K = `${UNK}, pp. xiii–xiv, 3–4, Dūtī-bheda 4 (pp. 20–22), Sakhī-bheda 5 (pp. 23–25), Rati-bheda (pp. 41–43), Āśraya-nirṇaya 15 (p. 46)`;

const notNamed = (who) => `The Ujjvala-nīlamaṇi-kiraṇa and the Gopāla-campū do not name ${who}. What the Ujjvala-nīlamaṇi says of the sakhīs who love Śrī Rādhā more and of Her maidservants:`;

const general = (who, what) => `## In the Vraja-nitya-līlā

**${who}**, ${what}

${notNamed(who)}

${KINDS}
## Sources

${SRC_K}.
`;

const REVATI = `## ${GC} — Revatī, Balarāma's wife

- **Her father** (Uttara-campū 15.19–20): the messengers tell Nanda how a huge man came to Kṛṣṇa and said, «I am Revata, also known as Kakudmi… With my youthful body I went past Svarga up to Brahmaloka… Seeing my daughter's extraordinary qualities and not seeing a suitable groom, I went to Brahmā to arrange a suitable person… Brahmā however was looking at a dance performance. Later… he said, ‘What is a short time here is a kalpa on earth… No one is suitable as a husband for your pure daughter with remarkable qualities and long life. But I realize this: Balarāma, Kṛṣṇa's elder brother, will make her happy.'»
- «I asked, ‘Her form should be similar to the present form of humans. She is very tall. How can she be his wife?' Brahmā said, ‘The older brother of Kṛṣṇa, who straightened out Kubjā, can do this'» (15.21–22, verse 6).
- **The wedding** (15.27–28): «he welcomed Revata in the city and after consulting with Vasudeva and others, he got Balarāma to agree to their decision. Balarāma then took his plough in the night and while she was sleeping, altered her limbs, making her happy. Kṛṣṇa then performed their marriage.» «Previously Balarāma, following Kṛṣṇa's example, was not inclined to get married. But fearing the fault of going against the Lord's desire and in deference to public opinion, he accepted marriage.»
`;

const plan = [
  {
    id: 1353,
    name: "Śrīla Sanātana Gosvāmī",
    text: `## In the Vraja-nitya-līlā

**Śrī Rati-mañjarī**, also called **Lavaṅga-mañjarī** — whom the Ujjvala-nīlamaṇi names among Śrī Rādhā's *paricārikās*, the maidservants who serve as messengers.

${KINDS}
## Sources

${SRC_K}.
`,
  },
  {
    id: 2178,
    name: "Śivānanda Cakravartī (Gadādhara's branch)",
    text: `## In the Vraja-nitya-līlā

A manifestation of **Lavaṅga-mañjarī** — whom the Ujjvala-nīlamaṇi names among Śrī Rādhā's *paricārikās*, the maidservants who serve as messengers.

${KINDS}
## Sources

${SRC_K}.
`,
  },
  {
    id: 1206,
    name: "Śrīla Raghunātha Dāsa Gosvāmī",
    text: `## In the Vraja-nitya-līlā

**Śrī Rasa-mañjarī** (some say Rati-mañjarī, others **Bhānumatī**) — the Ujjvala-nīlamaṇi names **Bhānumatī Mañjarī**, with Lavaṅga Mañjarī, among Śrī Rādhā's *paricārikās*, the maidservants who serve as messengers; it does not name Rasa-mañjarī.

${KINDS}
## Sources

${SRC_K}.
`,
  },
  {
    id: 150,
    name: "Bhūgarbha Gosvāmī",
    text: `## In the Vraja-nitya-līlā

**Śrī Prema-mañjarī** — whom the Ujjvala-nīlamaṇi names among Śrī Rādhā's **priya-sakhīs**, the dear friends «ten million in number».

${KINDS}
## Sources

${SRC_K}.
`,
  },
  { id: 1325, name: "Śrīla Rūpa Gosvāmī", text: general("Śrī Rūpa-mañjarī", "the foremost of Śrī Rādhā's mañjarīs.") },
  { id: 618, name: "Śrīla Jīva Gosvāmī", text: general("Śrī Vilāsa-mañjarī", "a maidservant of Śrīmatī Rādhārāṇī.") },
  { id: 343, name: "Śrī Gopāla Bhaṭṭa Gosvāmī", text: general("Śrī Anaṅga-mañjarī", "Śrī Rādhā's younger sister (some say Guṇa-mañjarī).") },
  { id: 844, name: "Śrī Lokanātha Gosvāmī", text: general("Śrī Līlā-mañjarī", "one of Śrī Rādhā's mañjarīs.") },
  { id: 1202, name: "Śrī Raghunātha Bhaṭṭa Gosvāmī", text: general("Śrī Rāga-mañjarī", "one of Śrī Rādhā's mañjarīs.") },
  { id: 615, name: "Jita Mitra", text: general("Śyāma-mañjarī", "one of Śrī Rādhā's maidservants.") },
  { id: 1028, name: "Nayanānanda Miśra (Gadādhara's nephew)", text: general("Nitya-mañjarī", "one of Śrī Rādhā's maidservants.") },
  { id: 1191, name: "Raghu Miśra", text: general("Karpūra-mañjarī", "one of Śrī Rādhā's maidservants.") },
  { id: 1791, name: "Bhāgavatācārya (Raghunātha Paṇḍita)", text: general("Śveta-mañjarī", "one of Śrī Rādhā's maidservants.") },
  {
    id: 574,
    name: "Śrīmatī Jāhnavā Mātā",
    text: `## In the Vraja-nitya-līlā

**Revatī**, Lord Balarāma's wife — and **Anaṅga-mañjarī**, Śrī Rādhā's younger sister.

${REVATI}
## Anaṅga-mañjarī

${notNamed("Anaṅga-mañjarī")}

${KINDS}
## Sources

${"Gopāla-campū"}, Uttara 15.19–28; ${SRC_K}.
`,
  },
  {
    id: 1660,
    name: "Vasudhā",
    text: `## In the Vraja-nitya-līlā

**Vāruṇī**, Lord Balarāma's wife (her sister Jāhnavā was Revatī) — and **Anaṅga-mañjarī**, Śrī Rādhā's younger sister.

The Gopāla-campū does not name Vāruṇī; it tells the marriage of Balarāma with Revatī, her sister:

${REVATI}
## Anaṅga-mañjarī

${notNamed("Anaṅga-mañjarī")}

${KINDS}
## Sources

${GC}, Uttara 15.19–28; ${SRC_K}.
`,
  },
];
fs.writeFileSync(new URL("./vraja6.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length + " fichas");
