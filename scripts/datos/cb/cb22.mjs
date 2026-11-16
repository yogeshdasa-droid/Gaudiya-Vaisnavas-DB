// node cb22.mjs → cb22.json   (16-11-2026) — tanda 22: Nityānanda y sus padres.
import fs from "node:fs";
import { SRC } from "./comun.mjs";

const T = {};
const add = (id, name, body, refs) => (T[id] = [name, body + `\n\n## Sources\n\n${SRC} ${refs}`]);

const LEAVING = `## The sannyāsī who asked for the boy (Madhya 3.63–100)

«In this village lived a brāhmaṇa named Hāḍāi Paṇḍita, who was greatly renounced and full of compassion. His chaste wife's name was Padmāvatī. She was a great Vaiṣṇavī and the mother of the universe… Lord Nityānanda was the eldest of their sons.» His parents could not bear to be without Him for a moment; Hāḍāi took Him everywhere — to the fields, to his disciples' houses, to the market. One day an attractive sannyāsī stayed the night, speaking of Kṛṣṇa with Hāḍāi, and in the morning begged: «Please give me this eldest son of yours to accompany me for some days… He will be able to see all the holy places.» Hāḍāi thought of Viśvāmitra begging Daśaratha for Rāma; he told his wife, who said: «Dear Prabhu, I agree with whatever you decide.» «The father of Nityānanda then came before the sannyāsī with his head down and handed over his son.» «As soon as Nityānanda left home, the brāhmaṇa Hāḍāi Paṇḍita fell unconscious to the ground… People said, “Hāḍo Ojhā has become mad.” Indeed, he did not eat anything for three months; he survived only by the mercy of Śrī Caitanya.»`;

add(439, "Hāḍāi Paṇḍita", `## In short

Hāḍāi Paṇḍita («Hāḍo Ojhā») of Ekacakrā, «the king of the brāhmaṇas», father of Nityānanda, who gave his son to a travelling sannyāsī and fell unconscious with grief.

## In the book

- «The exalted Hāḍāi Paṇḍita was the king of the brāhmaṇas. He was accepted as the father of Lord Nityānanda, who is the original father of all» (Ādi 2.39).
- «His father's name was Hāḍāi Ojhā, and His mother was Padmāvatī. Śrī Nityānanda Prabhu appeared in the village of Ekacakrā» (Ādi 9.5); when the boy Nityānanda, playing Lakṣmaṇa, fell unconscious and was revived, «Hāḍāi Paṇḍita embraced his son» (Ādi 9.91).

${LEAVING}`, "Ādi 2.39; 9.5, 9.85–92; Madhya 3.63–100.");

add(1066, "Padmāvatī Devī", `## In short

Padmāvatī, the mother of Nityānanda — «a great Vaiṣṇavī and the mother of the universe».

## In the book

- «His father's name was Hāḍāi Ojhā, and His mother was Padmāvatī. Śrī Nityānanda Prabhu appeared in the village of Ekacakrā» (Ādi 9.5). The *bhāṣya*'s summary of Ādi 9: Anantadeva appeared in Ekacakrā, in Rāḍha-deśa, «from the womb of Padmāvatī, the wife of Hāḍo Ojhā».
- Nityānanda is glorified as «the son of Padmāvatī» (Madhya 11.78; 15.60: «All glories to the son of Padmāvatī!»).

${LEAVING}`, "Ādi 9.5 and chapter summary; Madhya 3.63–100; 11.78; 15.60.");

add(1851, "Śrī Nityānanda Prabhu", `## In short

In the *Caitanya-bhāgavata* — written by «the last of His servants» — Nityānanda is Balarāma, Anantadeva, «the origin of Lord Ananta», nondifferent from Gaura: «one can know Gauracandra only through Nityānanda». The book tells His childhood dramas at Ekacakrā, His travels, His meeting with the Lord, the Vyāsa-pūjā, His life as a child in Śrīvāsa's house, the deliverance of Jagāi and Mādhāi, and His preaching in Bengal.

## Ekacakrā and the pilgrimage (Ādi 9 — chapter summary)

«On the order of Śrī Gaura-Kṛṣṇa, Śrī Anantadeva personally appeared in the village of Ekacakrā, in the district of Rāḍha-deśa, from the womb of Padmāvatī, the wife of Hāḍo Ojhā.» Up to His twelfth year He played with His friends the pastimes of Kṛṣṇa, Rāma and Vāmana — the assembly of the demigods praying to Kṣīrodakaśāyī, Kṛṣṇa's birth, Pūtanā, Govardhana, the bridge to Laṅkā, Lakṣmaṇa struck by Indrajit's arrow and revived by Hanumān's herb. Given by His father to a travelling sannyāsī (Madhya 3.77–96), He visited the holy places of the north and south until twenty, met Mādhavendra Purī — both fell unconscious on seeing each other —, Īśvara Purī and Brahmānanda Purī, saw Jagannātha in Nīlācala, and came to Navadvīpa.

## Meeting the Lord (Madhya 3–5)

He stayed at the house of Nandana Ācārya, who saw His effulgence «equal to the sun» (3.123–135). The Lord, after a dream, came with the devotees and met Him, and used various devices to reveal His glories; when Śrīvāsa recited a *Bhāgavatam* verse, Nityānanda fell unconscious with all the transformations of love; Gaura and Nitāi spoke in signs (Madhya 4). At the *adhivāsa* of the **Vyāsa-pūjā** in Śrīvāsa's house Nityānanda broke His own sannyāsa *daṇḍa* and water-pot; the Lord showed Him His **six-armed form** and He fell unconscious (Madhya 5).

## A child in Śrīvāsa's house (Madhya 8; 11; 12)

He lived with Śrīvāsa as his son, would not eat with His own hands, drank from Mālinī's breast; the crow returned the ghee bowl at His order (Madhya 11). Śrīvāsa told the Lord that even if Nityānanda drank wine his faith would not change (8.6–23). At Śacī's lunch she saw Gaura and Nitāi as two four-armed boys (8.62–72). Swimming in the Gaṅgā, He came naked before the Lord, who dressed Him, begged His *kaupīna* and gave a piece of it to each devotee; the devotees drank the water that washed His feet (Madhya 12).

## Jagāi and Mādhāi (Madhya 13)

Sent with Haridāsa from door to door to beg everyone to chant Kṛṣṇa's names, He met the two drunkards; Mādhāi struck Him on the head, and He begged the Lord to spare them, offering all His piety for Mādhāi, and embraced him. Mādhāi later fell at His feet and, by His instruction, built Mādhāi's ghāṭa (Madhya 15).

## With the Lord in Navadvīpa

He hid the Lord's secret at Nandana's house (Madhya 17); went with Him to the *vāmācārī* sannyāsī and to Advaita's house, where He scattered rice and Advaita «glorified Him on the pretext of criticizing Him» (Madhya 19); Murāri saw Him in a dream as Haladhara with Viśvambhara fanning Him (Madhya 20); He saw the universal form shown to Advaita (Madhya 24). The Lord told Him first of His sannyāsa; He was grieved thinking of Śacī, and was one of the five to know (Madhya 26; 28).

## After the sannyāsa

On the way to Purī He **broke the Lord's *daṇḍa*** in three — «He who held it broke it» (Antya 2.193–225). The Lord sent Him to Bengal: «Deliver the foolish, wretched, fallen, and distressed persons by giving them devotional service» (Antya 5.228–229). With Rāmadāsa, Gadādhara dāsa, Raghunātha Vaidya and others absorbed in the moods of Vraja, He came to Pāṇihāṭi, where He was bathed in *abhiṣeka* at Rāghava Paṇḍita's house and asked for a garland of *kadamba* flowers that bloomed on a lime tree; danced before Bāla-gopāla at Gadādhara dāsa's house; went to Khaḍadaha and to Saptagrāma, where He stayed with Uddhāraṇa Datta and delivered the merchants; in Navadvīpa He stayed with the poor Hiraṇya Paṇḍita, where dacoits came for His ornaments and were delivered (Antya 5). A brāhmaṇa who doubted His dress and ornaments was answered by the Lord from the scriptures (Antya 6); in Nīlācala the Lord said His ornaments are the nine kinds of devotion, and Gaura, Nitāi and Gadādhara ate Gopīnātha's *prasāda* together in Gadādhara's garden (Antya 7).

## «The last of His servants»

The *Caitanya-bhāgavata* names His associates — all cowherd boys and girls of Vraja, whose former names He forbade the author to reveal (Antya 5.719–757) — and ends that list: «The last of His servants is Vṛndāvana dāsa.»`, "Ādi 9 (with the bhāṣya's summary); Madhya 3–5, 8, 11–13, 15, 17, 19, 20, 24, 26, 28 (chapter summaries and verses); Antya 2.193–225; 5 (whole chapter); 6; 7.");

const plan = Object.entries(T).map(([id, [name, text]]) => ({ id: +id, name, text }));
fs.writeFileSync(new URL("./cb22.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length + " entradas");
