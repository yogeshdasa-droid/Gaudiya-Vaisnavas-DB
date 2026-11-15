// node decisiones.mjs → decisiones.json — Whisper's answers of 15-11-2026: #50 not Sudevī (that is Ananta Ācārya #44),
// #271 Gadādhara Bhaṭṭa = Raṅgadevī (GGD 165), #422 not «Indurekhā» (GGD 164: Indulekhā is Kṛṣṇadāsa Brahmacārī).
// (#217 Dhruvānanda = #216: merged with ../unir-dhruvananda.json.)
import fs from "node:fs";
const GGD = "Gaura-gaṇoddeśa-dīpikā";
const RKGD = "Rādhā-Kṛṣṇa-gaṇoddeśa-dīpikā";
const plan = [
  { id: 50, name: "Ananta", replace: [["; in Kṛṣṇa-līlā Sudevī.", "."]] },
  { id: 422, name: "Govindānanda Ṭhākura", remove: ["He was born as Indurekah in a past incarnation."] },
  {
    id: 271,
    name: "Gadādhara Bhaṭṭa",
    text: `## In Kṛṣṇa-līlā

**Raṅgadevī**, the seventh of Śrī Rādhā's eight principal sakhīs, twin sister of Sudevī.

## ${GGD} 165

> raṅgadevī purā yāsīd adya bhaṭṭo gadādharaḥ
> anantācārya-gosvāmī yā sudevī purā vraje

«The vraja-gopī Raṅgadevī appeared as Gadādhara Bhaṭṭa, and the vraja-gopī Sudevī appeared as Ananta Ācārya Gosvāmī.»

## Raṅgadevī in the books

- **${RKGD}** (Bṛhad-bhāga 94–95): her complexion resembles the colour of lotus-pollen and her clothes have the colour of the somewhat reddish javā flower; she is seven days younger than Śrī Rādhā and her qualities resemble Campakalatā's. «Śrī Raṅgadevī's father is Raṅgasāra and her mother is Karuṇā. Her husband, whose name is Vakrekṣaṇa, is the younger brother of Bhairava.» Her twin sister Sudevī is so like her that she is sometimes taken for her (96).

## Other opinions

- The Gauḍīya Vaiṣṇava Abhidhāna gives this identity to a Gadādhara Bhaṭṭa of Hanumānpur in Tailaṅga-deśa, and names the disciple of Raghunātha Bhaṭṭa in a second entry: perhaps two persons. Whisper (15-11-2026): this record is the Raṅgadevī of the ${GGD}.

## Sources

${GGD} 165; ${RKGD}, Bṛhad-bhāga 79, 94–96.
`,
  },
];
fs.writeFileSync(new URL("./decisiones.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length);
