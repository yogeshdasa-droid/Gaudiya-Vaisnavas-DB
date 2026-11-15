// node vraja7.mjs → vraja7.json («Vraja-Nitya-līlā», tanda 7: the sakhīs the Ujjvala-nīlamaṇi names, Śaibyā, Vīrā;
// 15-11-2026). Differences with the Gaṇoddeśa: Śaibyā «hot-tempered» there, «dakṣiṇā and mṛdvī» in the Ujjvala.
import { UNK, GC, KINDS, SRC_K, DUTI, SRC_DUTI, write } from "./comun.mjs";

const named = (who, what, cls) => `## In the Vraja-nitya-līlā

**${who}**, ${what} — the Ujjvala-nīlamaṇi names her among Śrī Rādhā's **${cls}**.

${KINDS}## Sources

${SRC_K}.
`;
const PRANA = "prāṇa-sakhīs, «equal in beauty to Vṛndāvaneśvarī Śrīmatī Rādhikā»";
const PRIYA = "priya-sakhīs, the dear friends «ten million in number»";

const plan = [
  { id: 1472, name: "Subhananda Dvija", text: named("Mālatī", "one of Śrī Rādhā's maidservants", "prāṇa-sakhīs (and again among the priya-sakhīs)") },
  { id: 1436, name: "Śrīdhara Brahmacārī", text: named("Candralatikā", "one of Śrī Rādhā's maidservants", PRIYA) },
  { id: 1474, name: "Subuddhi Miśra", text: named("Guṇacūḍā", "one of Śrī Rādhā's maidservants", PRIYA) },
  { id: 706, name: "Śrī Kavi Karṇapūra", text: named("Guṇacūḍā", "one of Śrī Rādhā's maidservants", PRIYA) },
  { id: 260, name: "Dvija Raghunātha", text: named("Varāṅgadā", "one of Śrī Rādhā's maidservants, of Tuṅgavidyā's group", PRIYA) },
  { id: 297, name: "Gaṅgāmantrī", text: named("Candrikā", "one of Śrī Rādhā's maidservants", PRIYA) },
  { id: 1990, name: "Mādhava Ācārya (Gadādhara's branch)", text: named("Mādhavī", "one of Śrī Rādhā's maidservants", PRIYA) },
  { id: 980, name: "Śrī Narahari Sarakāra Ṭhākura", text: named("Madhumatī", "a dear friend (prāṇa-sakhī) of Śrī Rādhā", PRANA) },
  { id: 901, name: "Mamu Ṭhākura (Jagannātha Cakravartī)", text: named("Kalabhāṣiṇī", "one of Śrī Rādhā's maidservants", PRANA) },
  { id: 673, name: "Kansari Sena", text: named("Ratnāvalī", "one of Śrī Rādhā's maidservants", PRANA) },
  { id: 383, name: "Gopīnātha Ācārya", text: named("Ratnāvalī", "a dear friend (prāṇa-sakhī) of Śrī Rādhā (and Lord Brahmā)", PRANA) },
  {
    id: 413,
    name: "Govinda Ghoṣa",
    text: `## In the Vraja-nitya-līlā

**Kalāvatī**, a gopī who sang the songs composed by Viśākhā.

## ${UNK} — Kalāvatī

The Ujjvala-nīlamaṇi names a **Kalāvatī** among the youngest gopīs (Vayo-bheda, p. 25–26): «The Vraja gopīs fall into four age groups: (1) vayaḥ-sandhi – the cusp of childhood and youth, (2) navya-yauvana – newly blossomed youth, (3) vyakta-yauvana – ripening youth and (4) pūrṇa-yauvana – fully blossomed youth. The juncture between paugaṇḍa (childhood) and yauvana (youth) is the stage known as vayaḥ-sandhi. It is also known as prathama-kaiśora, the first stage of adolescence. **Nāyikās such as Kalāvatī are situated in this stage of vayaḥ-sandhi.**» (It does not say if she is the Kalāvatī who sang Viśākhā's songs.)

${KINDS}## Sources

${UNK}, Vayo-bheda (pp. 25–26); ${SRC_K}.
`,
  },
  {
    id: 177,
    name: "Dāmodara Paṇḍit",
    text: `## In the Vraja-nitya-līlā

**Śaibyā**, one of the eight principal heroines of Vraja, the chief sakhī of Candrāvalī with Padmā: right-wing and soft-spoken, dressed in scarlet. (The books do not say whether she is the Gaura-gaṇoddeśa-dīpikā's Śaibyā; the name is the same.)

## ${UNK} — Śaibyā

> candrāvalī dakṣiṇā mṛdvī nīla-vastrā | asyāḥ sakhī padmā dakṣiṇā prakharā | śaibyā dakṣiṇā mṛdvī | sarvā eva rakta-vastrāḥ (Nāyikā-svabhāva, text 3)

«Candrāvalī is dakṣiṇā and mṛdvī and wears blue. Her two chief sakhīs are Padmā and Śaibyā. Padmā is dakṣiṇā and prakharā, while **Śaibyā is dakṣiṇā and mṛdvī. Both of them dress in scarlet**» (p. 21). *Dakṣiṇā*: «behave with the hero in a straightforward manner… they become controlled by the hero's praises»; *mṛdvī*: «use very gentle language» (pp. 18–19).

## ${GC} — Śaibyā

- **Candrāvalī's sakhī** (Pūrva-campū 15, verse 53): «From that day, Viśākhā, Lalitā and others became the sakhīs of Rādhā. Padmā, Śaibya and others became the sakhīs of Candrāvalī»; «Candrāvalī's sakhīs like Śaibya and Padmā» (17.42).
- **In the rāsa** (Pūrva-campū 25, verse 32): «One slender gopī took his chewed betel nut in her palms, which appeared like the vessel holding attraction for him.» — «Her name was Śaibyā. She was situated to his right.»
- Kṛṣṇa's letter from Mathurā (Uttara-campū 6, verse 13): «O Padmā! O Bhadrā! O Śaibyā! When your three forms, with distressed hearts, rolled about near the tamāla tree out of separation from me, I was there.»
- **One of the eight heroines** (Uttara-campū 31.51): «O Rādhā, Candrāvalī, Lalitā, Viśākhā, Bhadrā, Śyāmā, Padmā, Śaibya!» In separation, «Śaibyā is weeping» (36, verse 8).
- **In Dvārakā** (Uttara-campū 17, verse 53): «Śaibyā was Mitravindā.»

## Compared with the Gaṇoddeśa

The Gaṇoddeśa text of this record calls Śaibyā «hot-tempered»; the Ujjvala-nīlamaṇi-kiraṇa makes Śaibyā **mṛdvī**, soft-spoken (it is Padmā who is *prakharā*). Whisper's rule: the Ujjvala-nīlamaṇi-kiraṇa and the Gopāla-campū take precedence.

## Sources

${UNK}, Nāyikā-svabhāva 3 (pp. 17–21); ${GC}, Pūrva 15.53, 17.42, 25.32; Uttara 6.13, 17.53, 31.51, 36.8.
`,
  },
  {
    id: 1427,
    name: "Śrī Śivānanda Sena",
    text: `## In the Vraja-nitya-līlā

The gopīs **Vīrā** and **Dūtī**, the messengers who brought the gopīs to Kṛṣṇa. The Ujjvala-nīlamaṇi names **Vīrā** among Kṛṣṇa's three famous messengers in Vraja: «Vīrā is pragalbha-vacanā (a harsh speaker)».

${DUTI}## Sources

${SRC_DUTI}.
`,
  },
];
write("vraja7", plan);
