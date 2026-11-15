// node tanda5b.mjs → tanda5b.json (Gaṇoddeśa, after tanda 5 — Whisper, 15-11-2026: «Jagāi (and Mādhāi) was Jaya (and
// Vijaya)»; «#562 and #548 are different»; #558 Jagannātha Mahati left as it is).
// GGD 115 names them «Śrī Jagannātha and Mādhava» (Jagāi's real name is Jagannātha). #1827's notes said GGD 145: it is 115.
import fs from "node:fs";
const GGD = "Gaura-gaṇoddeśa-dīpikā";
const V115 = `## ${GGD} 115

> vaikuṇṭhe dvāra-pālau yau jayādya-vijayāntakau
> tāv adya jātau svecchātaḥ śrī-jagannātha-mādhavau

«Jaya and Vijaya, the two doorkeepers of Vaikuṇṭhaloka, voluntarily appeared in Lord Caitanya's pastimes as the two devotees Śrī Jagannātha and Śrī Mādhava» — Jagāi (whose name was Jagannātha) and Mādhāi.`;
const plan = [
  {
    id: 541,
    name: "Jagāi",
    text: `## In Kṛṣṇa-līlā

**Jaya**, one of the two doorkeepers of Vaikuṇṭha (his cousin Mādhāi was Vijaya), who came by their own will.

${V115}

## Sources

${GGD} 115.
`,
    replace: [[" He was Jāya, a Vaikuṇṭha-pārṣada, in his past incarnation.", ""]],
  },
  {
    id: 1827,
    name: "Jagāi and Mādhāi",
    text: `## In Kṛṣṇa-līlā

**Jaya and Vijaya**, the two doorkeepers of Vaikuṇṭha: Jagāi was Jaya and Mādhāi Vijaya. They came by their own will.

${V115}

## Sources

${GGD} 115.
`,
    remove: ["In Kṛṣṇa-līlā: Jaya and Vijaya, the door-keepers of Vaikuṇṭha (Gaura-gaṇoddeśa-dīpikā 145)."],
  },
  {
    id: 562,
    name: "Jagannātha Paṇḍita",
    text: `## In Kṛṣṇa-līlā

**Durvāsā Muni** — according to Devakīnandana's Vaiṣṇava-vandanā (169); the ${GGD} does not name him.

## Other opinions

- The ${GGD} (111) gives Durvāsā to another devotee, **Jagannātha Ācārya, known as Gaṅgādāsa** (his own record): *ācāryaḥ śrī-jagannātho gaṅgādāsaḥ prabhu-priyaḥ / āsīn nidhuvane prāg yo durvāsā gopikā-priyaḥ* — «Śrī Jagannātha Ācārya, who was also known as Gaṅgādāsa Paṇḍita, was very dear to Lord Caitanya. In his previous life he had been Durvāsā Muni, who delighted the gopīs and was very dear to them.»

## Sources

Devakīnandana, Vaiṣṇava-vandanā 169; ${GGD} 111.
`,
    replace: [[" He was Durvāsā in his past incarnation. (Vaiṣṇava-vandanā by Daivakinanadana 169)", ""]],
  },
  {
    id: 548,
    name: "Jagannātha Ācārya",
    text: `## In Kṛṣṇa-līlā

**Durvāsā Muni**, who delighted the gopīs and was dear to them.

## ${GGD} 111

> ācāryaḥ śrī-jagannātho gaṅgādāsaḥ prabhu-priyaḥ
> āsīn nidhuvane prāg yo durvāsā gopikā-priyaḥ

«Śrī Jagannātha Ācārya, who was also known as Gaṅgādāsa Paṇḍita, was very dear to Lord Caitanya. In his previous life he had been Durvāsā Muni, who delighted the gopīs and was very dear to them.»

## Other opinions

- Devakīnandana's Vaiṣṇava-vandanā (169) gives Durvāsā to **Jagannātha Paṇḍita**, another devotee (his own record).

## Sources

${GGD} 111; Devakīnandana, Vaiṣṇava-vandanā 169.
`,
  },
];
fs.writeFileSync(new URL("./tanda5b.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length + " fichas");
