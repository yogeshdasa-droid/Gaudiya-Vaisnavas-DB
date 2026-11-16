// node cb13.mjs → cb13.json   (16-11-2026) — tanda 13: Purī (Sārvabhauma, Pratāparudra, Kāśī Miśra, Rāmānanda).
import fs from "node:fs";
import { SRC } from "./comun.mjs";

const T = {};
const add = (id, name, body, refs) => (T[id] = [name, body + `\n\n## Sources\n\n${SRC} ${refs}`]);

add(1381, "Sārvabhauma Bhaṭṭācārya", `## In short

Vāsudeva Sārvabhauma, the great scholar of Purī, son of Viśārada Maheśvara of Navadvīpa: he saved the Lord when He fainted before Jagannātha and took Him home; after their talks the Lord showed him His six-armed form, and Sārvabhauma composed a hundred verses in His glory.

## His family (Madhya 21.6; Ādi 1.159, bhāṣya)

In Navadvīpa the Lord once went «near the dam protecting the house of Viśārada Maheśvara, the father of Sārvabhauma Bhaṭṭācārya». The *bhāṣya* (Ādi 1.159): Vāsudeva Sārvabhauma was a godbrother of the Lord's grandfather Nīlāmbara Cakravartī; the Lord heard from him the *Śārīraka-bhāṣya* of the speculative *jñānīs*, and teased him «in the manner of a mischievous child».

## In the temple (Antya 2.426–498)

When the Lord, seeing Jagannātha, ran forward in ecstasy and the ignorant guards prepared to beat Him, «Sārvabhauma hurriedly threw himself on to the Lord's back» — «This person appears to be Śrī Kṛṣṇa Caitanya.» He guarded the unconscious Lord and had Him carried to his house; when the devotees came, he greeted them, took the dust of Nityānanda's feet and sent them to see Jagannātha. The Lord, waking, said: «Jagannātha is most merciful, for He brought Me to the house of Sārvabhauma… By providence Sārvabhauma was there at the time, so I was saved from a great calamity.» Sārvabhauma brought *mahā-prasāda* on a gold plate. «Sārvabhauma is an associate of the Lord birth after birth.»

## The talks and the six-armed form (Antya 3.9–141)

In a solitary place the Lord spoke of His sannyāsa to «delude» him; Sārvabhauma spoke of the duties of a sannyāsī, then explained a verse of the *Bhāgavatam* in many ways, concluding that «devotional service to the lotus feet of Kṛṣṇa is the original truth». The Lord explained it further, and Sārvabhauma wondered: «Is He the Supreme Lord?» Then «the Lord roared loudly and manifested His six-armed form» — «as effulgent as millions of suns»; Sārvabhauma lost consciousness. «In this way Sārvabhauma composed one hundred verses as he glorified Lord Caitanya while holding His lotus feet» (3.130), and the six-armed Lord smiled and spoke to him.

## Later

The devotees asked him to arrange King Pratāparudra's meeting with the Lord, but he would not, out of fear (Antya 5.142); the Lord told the king, «I came here because of you, Sārvabhauma, and Rāmānanda Rāya» (5.202).`, "Ādi 1.159 (with bhāṣya); Madhya 21.6; Antya 2.426–498; 3.9–141; 5.142, 5.202.");

add(278, "Gajapati Pratāparudra Deva", `## In short

Mahārāja Pratāparudra of Orissa, who saw the Lord dance in secret, felt a doubt on seeing His body covered with dust and saliva, and was corrected in a dream by Jagannātha — who then became Caitanya on the throne; he fell at the Lord's feet in a garden and received His mercy.

## Watching in secret (Antya 5.140–164)

When the Lord came to Nīlācala the king was not in Orissa (Antya 3.269); hearing the news he came from Cuttack, but the Lord would not see him, and Sārvabhauma and the others did not dare to arrange it. The devotees planned that he should watch the Lord's dancing in kīrtana unseen. He saw the tears, trembling and falls — «the Lord roared so loudly that King Pratāparudra had to cover his ears». But seeing His body covered with dust, saliva and water from His nose, a doubt arose in his mind, «which later became the cause of his achieving the Lord's mercy».

## The dream (Antya 5.165–185)

«That night the fortunate Pratāparudra saw Lord Jagannātha appear before him in a dream», covered with dust, tears flowing like the Gaṅgā. When he went to touch His feet: «O King, this is not proper. Your body is smeared with fragrant camphor, musk, sandalwood paste, and kuṅkuma. And see My body, it is covered with dust and saliva… When you went to see Me dancing today, you felt repugnant…» Then he saw Lord Caitanya sitting on Jagannātha's throne, covered with dust in the same way: «Earlier today you felt aversion to Me and went home, so why would you touch Me now?» He woke up crying: «Therefore, O Lord, please forgive my offenses… accepting me as Your servant» — and understood that Jagannātha and Caitanya are nondifferent.

## At the Lord's feet (Antya 5.186–208)

One day, as the Lord sat in a flower garden with His associates, «Pratāparudra went there alone and fell flat at the lotus feet of the Lord», crying and trembling, and lost consciousness. The Lord touched him — «Get up» — and the king held His feet: «Save me, O supremely independent ocean of mercy! Save me, Śrī Kṛṣṇa Caitanya, the friend of the poor!… Please bestow on me the mercy that You will never leave me.» Pleased, the Lord gave him His mercy, and the king left «with the Lord's order on his head». «One who hears the narration of Mahārāja Pratāparudra's meeting with the Lord attains the treasure of ecstatic love.»

(The *bhāṣya* on Ādi 1.170: Rāmānanda Rāya was governor of Kaliṅga under Mahārāja Pratāparudra, «the independent king of Orissa».)`, "Ādi 1.160, 1.170 (bhāṣya); Antya 3.269; 5.138–208.");

add(1952, "Kāśī Miśra", `## In short

Kāśī Miśra of Purī, «greatly overwhelmed in the mellows of love for Kṛṣṇa», in whose house the Lord lived in Nīlācala.

## In the book

- «In the Antya-khaṇḍa the Lord delivers Mahārāja Pratāparudra and resides in the house of Kāśī Miśra» (Ādi 1.160).
- «In this way Śrī Gaurasundara joyfully resided in Nīlācala at the house of Kāśī Miśra. Sometimes Mahāprabhu danced at the house of Kāśī Miśra, and sometimes He danced on the shore of the ocean» (Antya 5.130–133).
- «Kāśī Miśra was greatly overwhelmed in the mellows of love for Kṛṣṇa. The Lord personally stayed in his house» (Antya 5.213).
- When the devotees of Bengal came, he was among those who received them (Antya 8.56–61), and «Kāśī Miśra then brought Lord Jagannātha's garlands and decorated the devotees» (8.147).`, "Ādi 1.160; Antya 5.130–133, 5.213; 8.56–61, 8.147.");

add(1283, "Rāmānanda Rāya", `## In short

The *Caitanya-bhāgavata* says little of Rāmānanda Rāya — Vṛndāvana dāsa leaves his story to others; its *bhāṣya* gives who he was.

## In the book

- «In the Antya-khaṇḍa the Lord delivers Rāmānanda Rāya and performs various pastimes in Mathurā» (Ādi 1.170). The *bhāṣya*: «Rāmānanda Rāya was the governor of Kaliṅga under the rule of Mahārāja Pratāparudra, the independent king of Orissa. He was the eldest of Bhavānanda Paṭṭanāyaka's five sons. He wrote the drama *Jagannātha-vallabha-nāṭaka*, and he was a most intimate devotee» of the Lord.
- Among the Lord's associates born in Orissa who joined Him in Nīlācala: «Pradyumna Miśra, whose body was filled with love of God, as well as Paramānanda and Rāmānanda, two most sober personalities, all joined the Lord» (Antya 3.184).
- To King Pratāparudra the Lord said: «I came here because of you, Sārvabhauma, and Rāmānanda Rāya» (Antya 5.202).
- With the devotees who received those of Bengal (Antya 8.56–61).`, "Ādi 1.170 (with bhāṣya); Antya 3.184; 5.202; 8.56–61.");

const plan = Object.entries(T).map(([id, [name, text]]) => ({ id: +id, name, text }));
fs.writeFileSync(new URL("./cb13.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length + " entradas");
