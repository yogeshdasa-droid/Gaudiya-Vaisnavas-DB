// node cb19.mjs → cb19.json   (16-11-2026) — tanda 19: Gadādhara Paṇḍita.
import fs from "node:fs";
import { SRC } from "./comun.mjs";

const T = {};
const add = (id, name, body, refs) => (T[id] = [name, body + `\n\n## Sources\n\n${SRC} ${refs}`]);

add(274, "Śrī Gadādhara Paṇḍita Gosvāmī", `## In short

Gadādhara Paṇḍita, «the foremost amongst Mahāprabhu's intimate devotees» and «the energy of the Lord» in the Pañca-tattva: renounced from childhood, he studied Īśvara Purī's book, hid to hear the Lord's first words of Kṛṣṇa after Gayā, took initiation from Puṇḍarīka Vidyānidhi after doubting him, played the gopī in the Lord's drama, was given the Lord's Deity worship, and lived in Nīlācala in his garden with Ṭoṭā-Gopīnātha.

## Who he is (Ādi 2.2, bhāṣya)

«Śrī Gadādhara Paṇḍita Gosvāmī was the foremost amongst Mahāprabhu's intimate devotees. As he is the origin of the *śakti-tattva*, he was present in the Lord's pastimes at both Navadvīpa and Nīlācala. He lived first in Navadvīpa, and later he lived as a *kṣetra-sannyāsī* in a subforest near the ocean at Nīlācala. The pure devotees who worship the sweet feature of Śrī Śrī Rādhā-Govinda take shelter of Gadādhara.» In the Pañca-tattva: «Śrī Gadādhara is the energy of the Lord.»

## Navadvīpa

- **Īśvara Purī's book** (Ādi 11, chapter summary): seeing the devotion of Gadādhara, «renounced from his childhood», Īśvara Purī affectionately taught him his *Śrī Kṛṣṇa-līlāmṛta*.
- **After Gayā** (Madhya 1.79–96): hearing that the Lord would speak at Śuklāmbara's house, «Gadādhara hid inside Śuklāmbara's house» — «Who is inside the room?» — «Your Gadādhara is inside.»
- **«Kṛṣṇa is in Your heart»** (Madhya 2, chapter summary): he went with the Lord to Advaita's house and wondered when Advaita worshipped Him; «on hearing from Gadādhara that Kṛṣṇa dwelt in His heart, the Lord attempted to tear open His heart».
- **Puṇḍarīka Vidyānidhi** (Madhya 7): Mukunda's constant companion, he went to see Vidyānidhi, doubted on seeing his opulence, saw his ecstasy at a verse of the *Bhāgavatam*, repented — «Mukunda, you have done the work of a friend» — and took initiation from him with the Lord's approval (see Puṇḍarīka Vidyānidhi). The *bhāṣya*: «Puṇḍarīka and Gadādhara were the ideal spiritual master and disciple.»
- **The drama** (Madhya 18.100–108): «after three hours… Gadādhara came on stage» as a gopī, with Brahmānanda as his old companion Suprabhā — «We are going to Mathurā.»
- **With Murāri** (Madhya 20.27): «the Lord's beloved associate Gadādhara offered the Lord betel nuts from His left».
- **The Deity worship** (Madhya 25, chapter summary): intoxicated with love and unable to perform His *pāñcarātrika* worship of Viṣṇu, the Lord «gave the responsibility of worshiping the Deity to Śrī Gadādhara Paṇḍita».
- **The sannyāsa** (Madhya 26, 28): when the Lord disclosed His intention, «Gadādhara felt like he had been struck by a thunderbolt» and tried authoritatively to stop Him; he was one of the five the Lord allowed to know, and came to Kaṭwā (28.11–12, 28.103–104).

## Nīlācala

He went with the Lord to Purī (Antya 2.35). There, «when Gadādhara recited Śrīmad-Bhāgavatam before the Lord, the Lord would become intoxicated by the mellows of ecstatic love»; he took initiation from Vidyānidhi a second time (Antya 10, chapter summary).

**In his garden** (Antya 7 — chapter summary): in Gadādhara's house in a garden was the Deity of **Gopīnātha**, «so attractive that even the hearts of atheists become melted»; the Lord personally embraced Him. When Nityānanda came, Gadādhara left his *Bhāgavatam* recitation to receive Him; they glorified each other, and «Gadādhara resolved that he would never see the face of a person who blasphemes Nityānanda». Nityānanda brought fine rice from Bengal and a coloured cloth for Gopīnātha; Gadādhara cooked it with spinach from the temple courtyard; the Lord arrived — «entitled to a portion of Nityānanda's goods, Gadādhara's cooking, and Gopīnātha's remnants» — and the three ate together laughing, and the devotees plundered their remnants.

## Invocations

«All glories to the life and soul of Nityānanda and Gadādhara!» (Ādi 2.2); «the life and soul of Gadādhara and the Lord of Murāri» (Madhya 13.258); «the life and soul of Gadādhara and Śrī Jagadānanda» (Antya 7.2).`, "Ādi 2.2 (with bhāṣya); 11 (chapter summary); Madhya 1.79–108; 2, 7, 25, 26, 28 (chapter summaries); 7.44–121; 13.258; 18.100–108; 20.27; 28.11–12, 28.103–104; Antya 2.35; 7 (chapter summary), 7.2; 10 (chapter summary).");

const plan = Object.entries(T).map(([id, [name, text]]) => ({ id: +id, name, text }));
fs.writeFileSync(new URL("./cb19.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length + " entradas");
