// node cb23.mjs → cb23.json   (16-11-2026) — tanda 23: Mahāprabhu, el autor y los últimos.
import fs from "node:fs";
import { SRC } from "./comun.mjs";

const T = {};
const add = (id, name, body, refs) => (T[id] = [name, body + `\n\n## Sources\n\n${SRC} ${refs}`]);

add(164, "Śrī Caitanya Mahāprabhu", `## In short

The whole *Caitanya-bhāgavata* is the Lord's life — «the Ādi-khaṇḍa describes the Lord's scholastic pastimes, the Madhya-khaṇḍa describes the Lord's kīrtana pastimes, and the Antya-khaṇḍa describes the Lord's» pastimes as a sannyāsī (*bhāṣya*, Ādi 1.90–91). Vṛndāvana dāsa wrote it «as the Vyāsa of Caitanya-līlā», and the chapters below are a guide to where each part of the Lord's life is told. The individual records of His associates have their own texts «In the Caitanya-bhāgavata».

## Ādi-khaṇḍa — the scholar (17 chapters)

1. Summary of Lord Gaura's pastimes · 2. His appearance (on the full moon of Phālguna, 1486, during a lunar eclipse — *bhāṣya* 1.95) · 3. Nīlāmbara Cakravartī calculates His horoscope · 4. The name-giving, childhood pastimes, and the thieves who kidnapped Him · 5. Eating the offerings of the mendicant brāhmaṇa · 6. He begins studying; the Ekādaśī offering of Jagadīśa and Hiraṇya · 7. Viśvarūpa takes sannyāsa · 8. The sacred thread, Gaṅgādāsa's school, and the disappearance of Jagannātha Miśra · 9. Nityānanda's childhood and pilgrimage · 10. Marriage with Lakṣmīpriyā · 11. Meeting Īśvara Purī · 12. Wandering through Navadvīpa (Śrīdhara, Mukunda Sañjaya's school) · 13. Defeating the Digvijayī · 14. Travel to East Bengal (Tapana Miśra) and Lakṣmīpriyā's departure · 15. Marriage with Viṣṇupriyā · 16. The glories of Haridāsa Ṭhākura · 17. Travel to Gayā and initiation from Īśvara Purī.

## Madhya-khaṇḍa — the kīrtana (28 chapters)

1. The beginning of His manifestation (at Śuklāmbara's house, Gaṅgādāsa's advice) · 2. Manifestation at Śrīvāsa's house and the beginning of saṅkīrtana · 3. The Varāha form at Murāri's house; meeting Nityānanda · 4. Revelation of Nityānanda's glories · 5. Nityānanda's Vyāsa-pūjā and the six-armed form · 6. Meeting Advaita · 7. Gadādhara and Puṇḍarīka Vidyānidhi · 8. The manifestation of opulences · 9. The twenty-one-hour ecstasy (*mahā-prakāśa*) and Śrīdhara · 10. Its conclusion (Murāri as Hanumān, Haridāsa, Mukunda) · 11–12. The characteristics and glories of Nityānanda · 13. The deliverance of Jagāi and Mādhāi · 14. Yamarāja's saṅkīrtana · 15. Mādhāi's realization · 16. Śuklāmbara's rice · 17. Wandering in Navadvīpa; hiding at Nandana's house · 18. Dancing as a gopī (the drama at Candraśekhara's house) · 19. At Advaita's house · 20. Murāri Gupta · 21. Chastising Devānanda · 22. Delivering Śacī from offense · 23. The Kazi's deliverance and Śrīdhara's water-pot · 24. The universal form shown to Advaita · 25. Śrīvāsa's dead son · 26. Śuklāmbara and Vijaya; the desire to take sannyāsa · 27. Pacifying the devotees' separation · 28. Sannyāsa from Keśava Bhāratī at Kaṭwā — the name **Śrī Kṛṣṇa Caitanya**.

## Antya-khaṇḍa — the sannyāsī (10 chapters)

1. Meeting again at Advaita's house (Śāntipura) · 2. Through Bhuvaneśvara to Jagannātha Purī (the broken *daṇḍa*; fainting before Jagannātha, carried to Sārvabhauma's house) · 3. Sārvabhauma's deliverance and the six-armed form; journey to Bengal (Paramānanda Purī, Svarūpa Dāmodara; Devānanda) · 4. Rāmakeli, Acyutānanda, and Mādhavendra Purī's festival · 5. The pastimes of Nityānanda (Kumārahaṭṭa, Pāṇihāṭi, Varāhanagara; Pratāparudra) · 6. The glories of Nityānanda · 7. In Gadādhara's garden · 8. Water sports in Narendra-sarovara (the devotees of Bengal come to Purī) · 9. The glories of Advaita (Rūpa and Sanātana) · 10. The glories of Puṇḍarīka Vidyānidhi.

## Who He is

«Lord Caitanya is the Supreme Personality of Godhead, and Lord Nityānanda is His personal manifestation» (*bhāṣya*, Ādi 1.1). In the Pañca-tattva «Śrī Gaurasundara is the form of a devotee, Śrī Nityānanda is the expansion of a devotee, Śrī Advaita is the incarnation of a devotee, Śrī Gadādhara is the energy of the Lord, and Śrīvāsa is the pure devotee» (*bhāṣya*, Ādi 2.2). To Tapana Miśra He gave the religion of the age: «In this age of quarrel and hypocrisy the only means of deliverance is chanting the holy name of the Lord» and the *mahā-mantra* (Ādi 14.143–146).`, "Ādi 1.1, 1.90–95, 2.2 (bhāṣya); 14.143–146; the chapter titles of the three khaṇḍas.");

add(1740, "Śrīla Vṛndāvana dāsa Ṭhākura", `## In short

The author of the *Caitanya-bhāgavata*, «the Vyāsa of Caitanya-līlā», son of Nārāyaṇī, who calls himself «the last of the servants» of Nityānanda.

## In his own book

- The title page of the edition calls him «Śrīla Vṛndāvana dāsa Ṭhākura, the *vyāsa-avatāra* of Caitanya-līlā».
- «The last of His servants is Vṛndāvana dāsa. He took birth from the womb of Nārāyaṇī, who was the recipient of the Lord's remnants. Even today the Vaiṣṇavas glorify Nārāyaṇī as the recipient of Lord Caitanya's remnants. Accepting Śrī Caitanya and Nityānanda Prabhu as my life and soul, I, Vṛndāvana dāsa, sing the glories of Their lotus feet» (Antya 5.757–759). The *bhāṣya*: he is not known by his father's line but by his relation with his mother, the devotee of Gaura who received the remnants of Śrī Caitanyadeva.
- He writes of Puṇḍarīka Vidyānidhi «according to what I heard from the mouth of Gadādhara Paṇḍita» (Antya 10.84); and of the brāhmaṇa of Vārāṇasī, the *bhāṣya* notes that «Ṭhākura Vṛndāvana understood» that the Lord secretly stayed with Candraśekhara (Madhya 19.105).
- Every chapter closes with his signature line: «Accepting Śrī Caitanya and Nityānanda Prabhu as my life and soul, I, Vṛndāvana dāsa, sing the glories of Their lotus feet.»`, "Title page; Madhya 19.105 (bhāṣya); Antya 5.757–759; 10.84; chapter endings.");

add(383, "Gopīnātha Ācārya", `## In short

Gopīnātha Ācārya of Navadvīpa, brother-in-law of Sārvabhauma Bhaṭṭācārya, in whose house Īśvara Purī stayed for some months.

## In the book

- Born before the Lord in Navadvīpa: «Śrī Candraśekhara, Jagadīśa, Gopīnātha…» (Ādi 2.98–99). The *bhāṣya*: «Śrī Gopīnātha Ācārya was a brāhmaṇa companion of the Lord at Navadvīpa. He was the brother-in-law (sister's husband) of Sārvabhauma Bhaṭṭācārya.» The *Gaura-gaṇoddeśa-dīpikā* (178) makes him the *prāṇa-sakhī* **Ratnāvalī**; according to others he was Brahmā (GGD 75).
- «Īśvara Purī stayed for a few months in Navadvīpa at the home of Śrī Gopīnātha Ācārya» (Ādi 11.96). The *bhāṣya*: he was «the son-in-law of Maheśvara Viśārada, who lived in Vidyānagara, and the brother-in-law of Sārvabhauma Bhaṭṭācārya and Madhusūdana Vācaspati».
- Picking flowers with Gadādhara, Rāmāi and Śrīvāsa at the *kunda* tree in Śrīvāsa's house when Śrīmān brought news of the Lord (Madhya 1.56).`, "Ādi 2.98–99, 11.96 (with bhāṣya); Madhya 1.56.");

add(1965, "Govinda (servant of Lord Caitanya)", `## In short

«Govinda the doorkeeper», the Lord's servant, whom the book salutes at the head of several chapters.

## In the book

- «All glories to the Lord of Govinda the doorkeeper. O Lord, please glance mercifully on the living entities» (Ādi 10.2; 13.2; Madhya 6.6). The *bhāṣya* (Ādi 10.2): «Śrī Govinda was the doorkeeper of Śrī Viśvambhara. Govinda guarded the doors of Viśvambhara's house», listing his appearances: Ādi 11.39–40, 13.2; Madhya 6.6, 8.114, 13.338, 23.152, 451; Antya 1.52, 2.35, 7.5, 8.58, 9.195–196.
- To «Govinda, who was His servant and doorkeeper» Nimāi explained why Mukunda ran away from Him (Ādi 11, chapter summary); the *bhāṣya* (11.39–40): «not the blacksmith Govinda; he was the Lord's associate, servant, and doorkeeper».
- With the Lord to Purī after His sannyāsa (Antya 2.35); in Purī «the Lord's pious doorkeeper Govinda» received the devotees of Bengal (Antya 8.56–61).

(The *Caitanya-bhāgavata* does not separate a Govinda of Navadvīpa from the Govinda of Purī; the *bhāṣya* lists all these places under one «Govinda the doorkeeper».)`, "Ādi 10.2 (with bhāṣya); 11 (chapter summary), 11.39–40; 13.2; Madhya 6.6; Antya 2.35; 8.56–61.");

add(1906, "Śrī Lakṣmīpati", `## In short

Lakṣmīpati Tīrtha of the Mādhva line, named by the *bhāṣya* as the sannyāsī from whom, «according to some», Nityānanda received the name «Svarūpa» and initiation.

## In the bhāṣya

- «The brahmacārī name “Svarūpa” is awarded by Tīrtha and Āśrama sannyāsīs… Some people say that Nityānanda was awarded the title “Svarūpa” by Lakṣmīpati Tīrtha» (Ādi 1.167).
- «Codes of devotional service were handed down through Lakṣmīpati Tīrtha of the Tattvavāda branch. The codes of pure devotional mellows, however, were inaugurated by Śrīpāda Mādhavendra Purī» (Ādi 9.160).
- «Some people say that… Śrī Nityānanda Prabhu was a disciple of Śrī Mādhavendra Purī, and some people say that He was a disciple of Śrī Lakṣmīpati Tīrtha» (Ādi 9.188), quoting a verse: «I worship Śrī Nityānanda Prabhu, who is very dear to Śrī Lakṣmīpati».
- «Jagad-guru Śrī Nityānanda Prabhu was a brahmacārī disciple of Parivrājakācārya Śrī Lakṣmīpati Tīrtha, who enacted the pastimes of subordination to the Śrī Mādhva *sampradāya*» (Madhya 5.10).`, "Ādi 1.167, 9.160, 9.188, 9.223–224; Madhya 5.10 (all bhāṣya).");

const plan = Object.entries(T).map(([id, [name, text]]) => ({ id: +id, name, text }));
fs.writeFileSync(new URL("./cb23.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length + " entradas");
