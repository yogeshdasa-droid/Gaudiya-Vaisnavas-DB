// node vraja12.mjs → vraja12.json («Vraja-Nitya-līlā», tanda 12: Viśvanātha Cakravartī, from the introduction of the
// Ujjvala-nīlamaṇi-kiraṇa, pp. xiii–xvii; 15-11-2026). He has no Gaṇoddeśa text; the book does not name his mañjarī.
import { UNK, KINDS, write } from "./comun.mjs";
const plan = [
  {
    id: 1723,
    name: "Śrīla Viśvanātha Cakravartī Ṭhākura",
    text: `## In the Vraja-nitya-līlā

A **maidservant of Śrīmatī Rādhikā** — so he showed himself to those who came to kill him in Vṛndāvana. (The Ujjvala-nīlamaṇi-kiraṇa does not give her name.)

## ${UNK} — the maidservant of Rādhā (introduction, pp. xiii–xiv)

- **Why they hated him**: «To dispel misconceptions regarding svakīyāvāda, Śrīla Cakravartī Ṭhākura wrote Rāga-vartma-candrikā and Gopī-premāmṛta… in his Ānanda-candrikā commentary on the verse laghutvam atra yat proktam, of Ujjvala-nīlamaṇi (1.21), he showed that the theory of svakīyāvāda was fallacious, and established the conception of parakīya.»
- «Once, certain scholars opposed the conclusions of Śrīla Cakravartī Ṭhākura on worship in the mood of parakīya. When he defeated them… they resolved out of envy to kill him. They knew that Śrī Cakravartī Ṭhākura would circumambulate Śrī Vṛndāvana early each morning, so they hid in a dark, dense grove and waited for him to walk by. As his adversaries watched him approach, **he suddenly disappeared, and in his place, a beautiful young girl of Vraja appeared, picking flowers with her friends.**»
- «The scholars asked that girl, “O lālī (young girl), just a moment ago a great personality was coming this way. Where has he gone?” The girl replied, “I saw him, but I do not know where he has gone.” The sight of her astonishing beauty, sidelong glances, graceful manner and gentle smile captivated the assembly of scholars… They asked the girl who she was, and she replied, **“I am a maidservant of my mistress, Śrīmatī Rādhikā. She is presently at Her in-laws' house at Yāvaṭa. She has sent me here to pick flowers.”** Having spoken thus, the girl disappeared, and in her place the scholars saw Śrīla Viśvanātha Cakravartī Ṭhākura once again. The scholars fell at his feet and prayed for forgiveness, and Śrīla Cakravartī Ṭhākura forgave them all.»
- «Some say Śrīla Cakravartī Ṭhākura is an incarnation of Śrīla Rūpa Gosvāmī» (Kṛṣṇa dāsa, p. xvi). His own *Svapna-vilāsāmṛtāṣṭakam* — Śrī Rādhā's dream of Gaurāṅga — closes the book (pp. 53–62; see the record of Śrī Caitanya Mahāprabhu).

${KINDS}## Sources

${UNK}, pp. xiii–xvii, 53–62; Sakhī-bheda 5 (pp. 23–25), Dūtī-bheda 4 (p. 22).
`,
  },
];
write("vraja12", plan);
