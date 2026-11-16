// node cb15.mjs → cb15.json   (16-11-2026) — tanda 15: Vijaya, Acyutānanda, Hussain Shah.
import fs from "node:fs";
import { SRC } from "./comun.mjs";

const T = {};
const add = (id, name, body, refs) => (T[id] = [name, body + `\n\n## Sources\n\n${SRC} ${refs}`]);

add(1681, "Vijaya Dāsa", `## In short

Vijaya dāsa, the Lord's student and professional writer (copyist), called «Ā̃khariyā Vijaya»: at Śuklāmbara's house the Lord placed His hand on him and showed him His opulence, and he remained practically inert for seven days.

## At Śuklāmbara's house (Madhya 26.37–59)

«There was a student of the Lord named Śrī Vijaya dāsa. That great soul had a divine vision. People called him *ā̃khariyā* Vijaya, but because they were devoid of devotion they did not know his glories.» After the meal at Śuklāmbara's house, while everyone lay down, «the Lord placed His hand on the body of Vijaya, who then saw something most wonderful»: an effulgence that spread up to the planet of Brahmā. When Vijaya was about to shout, the Lord put His hand over his mouth; then Vijaya jumped up roaring, and fell unconscious. The Lord asked, «What happened to Vijaya?… I think it is the influence of the Gaṅgā, for Vijaya is particularly devoted to the Gaṅgā» (or of Lord Viṣṇu, says the chapter summary), and touched him back to consciousness. «For seven days he wandered about Nadia in that state», without eating or sleeping. «By hearing about the mercy bestowed on Vijaya and the acceptance of Śuklāmbara's rice, one attains the wealth of devotional service.»

The *bhāṣya*'s chapter summary calls him «the professional writer Vijaya dāsa».`, "Madhya 26.37–59 (with the bhāṣya's summary).");

add(14, "Acyutānanda (son of Advaita)", `## In short

Acyutānanda, the son of Advaita who was firmly fixed at the feet of Lord Caitanya: as a naked five-year-old he corrected a sannyāsī — and his own father — who said that Keśava Bhāratī was Caitanya's guru.

## Under Gadādhara (Ādi 1.42, bhāṣya)

«Śrī Acyutānanda, the son of Śrī Advaita Prabhu, served Lord Hari under the guidance of Śrī Gadādhara Paṇḍita.» The *bhāṣya* contrasts him with Advaita's other sons who did not accept the Lord's guidance.

## «Who is Caitanya's guru?» (Antya 4 — chapter summary of the bhāṣya)

An exalted sannyāsī came to Advaita's house and asked how Keśava Bhāratī was related to Caitanya; following worldly etiquette Advaita answered that Keśava Bhāratī was Caitanya's spiritual master. «On hearing this reply, the five-year-old naked Acyutānanda smilingly yet in an angry mood asked his father what kind of conclusion was it that the Supreme Personality of Godhead Lord Caitanya, the spiritual master of all, has a spiritual master?» Advaita said that Acyuta was actually the father and He the son, appeared to teach the truth, and begged his forgiveness; Acyutānanda, embarrassed, bent his head; the sannyāsī left happily chanting the holy name. Vṛndāvana dāsa then describes the glories of Acyutānanda, fixed at the feet of Śrī Caitanya, and the position of Advaita's «other so-called sons». When the Lord arrived at Śāntipura He «bestowed special mercy on Acyutānanda».

## The science of the Absolute Truth (Antya 1)

When the Lord, newly a sannyāsī, came to Advaita's house at Śāntipura, He heard «about the science of the Absolute Truth from the mouth of Acyutānanda» (chapter summary).`, "Ādi 1.42 (bhāṣya); Antya 1 and 4 (chapter summaries of the bhāṣya).");

add(509, "Hussain Shah (Hussain Khān Saiyyad)", `## In short

Hussain Shah, the Muslim king of Bengal, who on hearing of the Lord at Rāmakeli concluded that He was the Supreme Lord.

## At Rāmakeli (Antya 4 — chapter summary of the bhāṣya)

On His way towards Mathurā the Lord stayed at Rāmakeli, on the Gaṅgā near Gauḍa. His roaring, kīrtana, weeping and appeal to everyone to chant the holy name «attracted the attention of even the infidels». «When the local constable related the topics of this wonderful sannyāsī to the King, even that infidel King Hussain Shah considered that Mahāprabhu was the Supreme Lord.» Fearing that the king's mind might be changed by wicked people, some devotees secretly asked the Lord to leave; the Lord revealed His omnipotence, promised to give the holy name to everyone except offenders of the Vaiṣṇavas, and predicted that His name would spread to every town and village. He then turned south and went to Advaita's house at Śāntipura.`, "Antya 4 (chapter summary of the bhāṣya).");

const plan = Object.entries(T).map(([id, [name, text]]) => ({ id: +id, name, text }));
fs.writeFileSync(new URL("./cb15.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length + " entradas");
