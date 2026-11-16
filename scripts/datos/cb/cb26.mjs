// node cb26.mjs → cb26.json   (16-11-2026) — tanda 26: Kāśīśvara (Whisper: «en #699»).
import fs from "node:fs";
import { SRC } from "./comun.mjs";

const T = {};
const add = (id, name, body, refs) => (T[id] = [name, body + `\n\n## Sources\n\n${SRC} ${refs}`]);

add(699, "Kāśīśvara Brahmacārī (disciple of Īśvara Purī)", `## In short

The *Caitanya-bhāgavata* names a Kāśīśvara among the Lord's closest servants — next to Govinda, Jagadānanda and Vakreśvara — and, in Purī, a «Kāśīśvara Paṇḍita». The *bhāṣya* identifies him as Īśvara Purī's disciple who, with Govinda, went to serve the Lord in Nīlācala. Whisper's choice (16-11-2026): the Kāśīśvara of the book is this record; Kāśīśvara Paṇḍita of Gaura-Govinda (#1832) is kept apart, as the Abhidhāna does (Śrīla Prabhupāda takes them as one).

## In the book

- The *bhāṣya* on Īśvara Purī: «The two brahmacārīs, Govinda and Kāśīśvara, were disciples of Śrī Īśvara Purīpāda. After his disappearance, these two brahmacārīs went to Nīlācala on his order to serve Mahāprabhu (Cc. Ādi 10.138–139 and Madhya 10.131–134)» (Ādi 9.170).
- «All glories to the heart and soul of Vakreśvara and Kāśīśvara!» (Madhya 1.6); «All glories to the life and wealth of Haridāsa and Kāśīśvara!» (Madhya 24.3).
- The *bhāṣya* on Madhya 8.22: «The devotees of the Lord see associates like Kāśīśvara and Govinda as situated on the platform of spontaneous *dāsya*.»
- In the lists of the nightly kīrtanas in Navadvīpa (Madhya 8.112–116) and of the devotees present after the deliverance of Jagāi and Mādhāi (Madhya 13.336–339).
- When the Lord left Navadvīpa to take sannyāsa: «Govinda, Govindānanda, Śrīgarbha, Śrīmān, Kāśīśvara, Śrī Jagadānanda, and Rāma also began to cry» (Madhya 23.451).
- In Purī, «Kāśīśvara Paṇḍita» goes with the Lord to greet the devotees from Bengal, with Sārvabhauma, Jagadānanda, Svarūpa Dāmodara, the doorkeeper Govinda and others (Antya 8.56–61).`, "Ādi 9.170 (bhāṣya); Madhya 1.6; 8.22 (bhāṣya); 8.112–116; 13.336–339; 23.451; 24.3; Antya 8.56–61.");

const plan = Object.entries(T).map(([id, [name, text]]) => ({ id: +id, name, text }));
fs.writeFileSync(new URL("./cb26.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length + " entradas");
