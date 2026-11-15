// node vraja11.mjs → vraja11.json («Vraja-Nitya-līlā», tanda 11: Bhāguri, 15-11-2026).
import { GC, write } from "./comun.mjs";
const plan = [
  {
    id: 203,
    name: "Devānanda Paṇḍita",
    text: `## In the Vraja-nitya-līlā

**Bhāguri Muni**, the chief paṇḍita in the court of Nanda Mahārāja.

The Gopāla-campū does not name Bhāguri. It describes the brāhmaṇas of Nanda's assembly, where its whole story is told:

## ${GC} — the brāhmaṇas of Nanda's assembly

- «Nanda was sitting in the northern area facing south. On his left side facing west was a line with Kṛṣṇa, giving bliss to the assembly. **On his right, facing east was a line giving happiness composed of brāhmaṇas who gave the highest benefit.** Many cowherds were sitting in the southern area» (Pūrva-campū 3.5).
- «Nanda sat among his brothers on a high throne inlaid with precious gems and was welcomed by men wearing auspicious items. But his glance was constantly focused upon the face of Kṛṣṇa with great longing» (3, verse 4).
- Balarāma's birth and name ceremony «were performed secretly on the advice of Vasudeva by expert brāhmaṇas whose name ended in Śarma» (Pūrva-campū 3.88); and Garga, «the most knowledgeable guru, the best of all sages», named the two boys (6.26–32).

## Sources

${GC}, Pūrva 3.4–5, 3.88, 6.26–32.
`,
  },
];
write("vraja11", plan);
