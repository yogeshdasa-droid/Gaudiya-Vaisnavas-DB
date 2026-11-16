// node cb20.mjs → cb20.json   (16-11-2026) — tanda 20: Haridāsa Ṭhākura.
import fs from "node:fs";
import { SRC } from "./comun.mjs";

const T = {};
const add = (id, name, body, refs) => (T[id] = [name, body + `\n\n## Sources\n\n${SRC} ${refs}`]);

add(475, "Śrī Haridāsa Ṭhākura", `## In short

Haridāsa Ṭhākura, born in a Muslim family in Buḍhana, who chanted three hundred thousand names a day: beaten in twenty-two marketplaces by the Kazi's order without feeling pain, he prayed for his tormentors; the Lord told him that He had come from Vaikuṇṭha with His disc to protect him, and «anyone who resides with you for even a day… will certainly achieve Me».

## The glories of Śrī Haridāsa Ṭhākura (Ādi 16 — the bhāṣya's chapter summary)

«Haridāsa appeared in the village of **Buḍhana**. By his mercy, the holy names of Kṛṣṇa were preached in that area.» He came to **Phuliyā** on the Gaṅgā and to Advaita's house at Śāntipura, intoxicated with the holy names; the brāhmaṇas of Phuliyā respected him. The Kazi complained to the Muslim king that, born a Muslim, he followed and preached the Hindus' God. In prison he taught the prisoners that their freedom from enjoyment was favourable for serving Hari. To the king he said that the Supreme Lord is one and belongs to everyone; threatened, he answered that even if his body were cut to pieces he would never give up chanting the holy names. Beaten in **twenty-two marketplaces**, he felt no pain — like Prahlāda — and prayed the Lord to forgive his tormentors. To save them from punishment he entered a trance and appeared dead; no one could move him, for Viśvambhara was in his body; thrown into the Gaṅgā, he floated ashore and came to Phuliyā chanting. The Muslims took him for a great prophet, and the king begged his forgiveness and let him chant freely anywhere.

He chanted **300,000 names a day** in a cave by the Gaṅgā at Phuliyā, where a poisonous snake lived; when the people asked him to leave, the snake left the cave that same evening. Hearing a snake-charmer sing of Kṛṣṇa's pastime at Kāliya-daha, he fell unconscious in ecstasy; a pseudo-brāhmaṇa who imitated him was beaten by the snake-charmer. To a brāhmaṇa of Harinadī who opposed loud chanting he proved its supremacy from the scriptures; the man swore to cut off his nose and ears, and soon lost his own to smallpox. Haridāsa then went to Navadvīpa to be with Advaita and the devotees.

## «Behold My form» (Madhya 10.35–112)

At the great manifestation «the Lord mercifully called Haridāsa and said, “O Haridāsa, behold My form!… Listen, Haridāsa. When the Yavanas beat you in the various villages, I saw your distress and descended from Vaikuṇṭha with the disc in My hand in order to cut everyone to pieces”» — but for Haridāsa's prayer for them. Haridāsa fell unconscious and rolled about the courtyard. The Lord's benediction:

> «Listen, My dear Haridāsa. Anyone who resides with you for even a day or speaks with you for even a moment will certainly achieve Me. There is no doubt about it.» (10.93–94)

«Someone said, “Haridāsa is like four-headed Brahmā.” Another person said, “He is the manifestation of Prahlāda”… As Prahlāda was born in a demon family and Hanumān was born in a monkey family, Haridāsa was born in a “low-class family.”» «Ganga awaits Haridāsa's bath in her waters» (10.106–111).

## With Nityānanda and in the drama

The Lord sent Nityānanda and Haridāsa from door to door to beg everyone to chant Kṛṣṇa's names, and they met Jagāi and Mādhāi (Madhya 13, chapter summary). The Lord hid at Nandana Ācārya's house, telling Nityānanda and Haridāsa to keep it secret (Madhya 17.44–47). In the drama «Haridāsa will be a guard who will keep everyone alert» (18.10) — «Wake up! Wake up!» (18.99). The *bhāṣya* on Madhya 9.240 names him with Uddhāraṇa Datta: born a Yavana, he never felt worldly distress.

## Later

He came to Purī with the devotees: «Haridāsa Ṭhākura joyfully came» (Antya 8.13).`, "Ādi 16 (with the bhāṣya's summary); Madhya 9.240 (bhāṣya); 10.35–112; 13 (chapter summary); 17.44–47; 18.10, 18.99–103; Antya 8.13, 8.125–126.");

const plan = Object.entries(T).map(([id, [name, text]]) => ({ id: +id, name, text }));
fs.writeFileSync(new URL("./cb20.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length + " entradas");
