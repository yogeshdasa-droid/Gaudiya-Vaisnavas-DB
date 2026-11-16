// node cb25.mjs → cb25.json   (16-11-2026) — tanda 25: Kṛṣṇānanda (hijo de Ratnagarbha) y Sañjaya.
import fs from "node:fs";
import { SRC } from "./comun.mjs";

const T = {};
const add = (id, name, body, refs) => (T[id] = [name, body + `\n\n## Sources\n\n${SRC} ${refs}`]);

add(793, "Kṛṣṇānanda", `## In short

Kṛṣṇānanda, eldest son of Ratnagarbha Ācārya, one of Gaṅgādāsa Paṇḍita's main students and a classmate of the Lord, later an associate of Nityānanda.

## In the book

- «His three sons — Kṛṣṇānanda, Jīva, and Yadunātha Kavicandra — were like bees at the lotus feet of Kṛṣṇa» (Madhya 1.297). The *bhāṣya*: «Kṛṣṇānanda was one of Gaṅgādāsa Paṇḍita's main students (Ādi-khaṇḍa 8.38). He joined the Lord and His associates in sporting in the waters of the Gaṅgā after the deliverance of Jagāi and Mādhāi (Madhya-khaṇḍa 13.337), and he was an associate of Nityānanda Prabhu (*Caitanya-caritāmṛta* Ādi 11.50).»
- The *bhāṣya* on Ādi 8.38: «Śrī Murāri Gupta, Śrī Kamalākānta, and Śrī Kṛṣṇānanda were some of the Lord's prominent classmates.»
- Named among the devotees present after the deliverance of Jagāi and Mādhāi (Madhya 13.336–339).`, "Ādi 8.38 (bhāṣya); Madhya 1.297 (with bhāṣya); 13.336–339.");

add(1358, "Sañjaya", `## In short

In the *Caitanya-bhāgavata* «Sañjaya» appears in the lists of the Lord's associates next to «Puruṣottama» — and the Sañjaya the book describes is the family of Mukunda Sañjaya and his son Puruṣottama Sañjaya.

## In the book

- Lists: «Puruṣottama, Sañjaya» among those born in Navadvīpa (Ādi 2.31); *puruṣottama, sañjayādi* at the nightly kīrtanas (Madhya 8.112–116); *puruṣottama, mukunda, sañjaya* after the deliverance of Jagāi and Mādhāi (Madhya 13.336–339). The English translation gives them as separate names.
- Where the book describes a Sañjaya, it is **Mukunda Sañjaya**, in whose Caṇḍī-maṇḍapa the Lord taught (Ādi 10.38; 15.5–7), and his son **Puruṣottama Sañjaya**, «the Lord's principal student» (Ādi 10.39; Madhya 1.128; Antya 8.20). See records #2188 and #1138.`, "Ādi 2.31; 10.38–39; 15.5–7; Madhya 1.128, 8.112–116, 13.336–339; Antya 8.20.");

const plan = Object.entries(T).map(([id, [name, text]]) => ({ id: +id, name, text }));
fs.writeFileSync(new URL("./cb25.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length + " entradas");
