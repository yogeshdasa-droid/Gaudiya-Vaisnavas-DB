// node cb16.mjs → cb16.json   (16-11-2026) — tanda 16: las esposas del Señor y devotos de Purī.
import fs from "node:fs";
import { SRC } from "./comun.mjs";

const T = {};
const add = (id, name, body, refs) => (T[id] = [name, body + `\n\n## Sources\n\n${SRC} ${refs}`]);

add(1841, "Lakṣmīpriyā Mātā", `## In short

Śrī Lakṣmīpriyā, daughter of Vallabhācārya, the Lord's first wife — «a plenary portion of Lakṣmī» —, who served Śacī more than tulasī and left this world on the bank of the Gaṅgā, unable to bear separation, while the Lord was in East Bengal.

## The marriage (Ādi 10 — with the bhāṣya's summary)

«One day, by providence, Lakṣmī-devī, the personification of the goddess of fortune and daughter of Vallabhācārya, who hailed from a pure cultured brāhmaṇa family, met her Lord, Gaura-Nārāyaṇa, while taking bath in the Gaṅgā and offered obeisances to His lotus feet within her mind.» That same day Vanamālī Ācārya proposed the marriage (see Vanamālī Ācārya and Vallabhācārya). After the wedding, «Śacī-devī with some other brāhmaṇa ladies then jubilantly welcomed her daughter-in-law home» (10.117), and saw her house fill with opulence: «This girl is a plenary portion of Lakṣmī-devī… Otherwise where has everything come from since this daughter-in-law, Lakṣmī, entered my house?» (10.124–126). The *bhāṣya* (10.121): she is the direct personification of the Lord's internal potency known as Śrī-śakti.

## The householder's wife (Ādi 14.18–55)

She cooked for the Vaiṣṇava guests and sannyāsīs — «Lakṣmī-devī cooked alone, yet she felt supremely blissful» —, served in the temple room where the *śālagrāma* and Dvārakā-*śilā* were worshipped, and served tulasī; but «she gave more attention to the service of Śacī-devī, her mother-in-law and mother of her Lord, than to the service of tulasī», and the Lord was pleased (*bhāṣya* 14.38–45). Śacī sometimes saw flames under her son's feet and smelled lotus fragrance in the house.

## Her departure (Ādi 14 — chapter summary; 14.104, bhāṣya)

«While the Lord was residing in Bangladesh, Śrī Lakṣmī-devī, being unable to tolerate separation from the Lord, left this world from the bank of the Gaṅgā while meditating on the lotus feet of the Lord.» The *bhāṣya* rejects the materialists' idea that Mahā-Lakṣmī, the *svarūpa-śakti* of Gaura-Nārāyaṇa, died of a snake-bite (it quotes *Caitanya-caritāmṛta* Ādi 16.20–21). Returning, the Lord said: «Dear mother, I know everything. Perhaps your daughter-in-law has met with some misfortune?» (14.177); He showed grief for a short time like an ordinary man and taught His mother the temporary nature of this world.

(Ādi 1.110: «The Ādi-khaṇḍa describes the disappearance of Lakṣmīpriyā» — *vijaya*, «she returned to her own abode», says the *bhāṣya*.)`, "Ādi 1.110 (bhāṣya); 10 (with the bhāṣya's summary), 10.117–126; 14 (with the bhāṣya's summary), 14.18–55, 14.104, 14.177.");

add(1715, "Śrīmatī Viṣṇupriyā Devī", `## In short

Śrī Viṣṇupriyā, daughter of Sanātana Miśra, the Rāja-paṇḍita, the Lord's second wife — «like the personification of Lakṣmī» —, who from childhood bathed in the Gaṅgā two or three times a day and offered obeisances to Śacī-mātā at the ghāṭa.

## Before the marriage (Ādi 15.44–50)

«Sanātana Miśra's daughter had all auspicious characteristics. She was like the personification of Lakṣmī, the mother of the universe. As soon as mother Śacī saw her, she immediately thought that she was a suitable bride for her son. From her childhood, that girl took bath in the Gaṅgā two or three times a day. She had no engagement other than serving her father, mother, and Lord Viṣṇu. She regularly met and offered her humble obeisances to mother Śacī at the Gaṅgā bathing ghāṭa», and Śacī blessed her: «May Kṛṣṇa bless you with a suitable husband.» Kāśīnātha Paṇḍita told Sanātana Miśra: «Viṣṇupriyā and Nimāi Paṇḍita are as suitable a match as Kṛṣṇa and Rukmiṇī were» (15.59).

## The wedding (Ādi 15.120–202)

«Viṣṇupriyā, who was nicely decorated, was then carried on a seat to the marriage arena»; after circumambulating she offered obeisances to the Lord; «the universal mother, Viṣṇupriyā, then offered a flower garland to the Lord and surrendered herself at His lotus feet», and the Lord, smiling, garlanded her. In the playful contest of the two parties «one moment the associates of the Lord would win, and the next moment the associates of Viṣṇupriyā would win»; Sanātana Miśra seated her at the Lord's left for the fire sacrifice, and the Lord took her home in the palanquin.

## Later

Śacī once saw her daughter-in-law on the chest of her son, when He and Nityānanda appeared to her as two four-armed boys (Madhya 8.66; the *bhāṣya* explains it as Lakṣmī on Kṛṣṇa's chest). After the Lord's sannyāsa: «Mother Śacī, Viṣṇupriyā-devī, and the devotees were able to tolerate indescribable distress due to separation from Mahāprabhu only by His mercy» (Ādi 1.156, *bhāṣya*); the servant Īśāna served her and Śacī (Madhya 8.73–74, *bhāṣya*).`, "Ādi 1.110, 1.156 (bhāṣya); 15.44–66, 15.120–202; Madhya 8.66, 8.73–74 (bhāṣya).");

add(177, "Dāmodara Paṇḍit", `## In short

Dāmodara Paṇḍita, «very austere and impartial», who came to the Lord in Nīlācala, went to Navadvīpa to see Śacī-mātā and, asked by the Lord whether His mother had devotion, answered in anger that she is devotion itself.

## In the book

- Joining the Lord in Nīlācala: «Dāmodara Paṇḍita and Śrī Śaṅkara Paṇḍita also came there within a few days» (Antya 3.185). «After seeing Mother Śacī, Śrī Dāmodara Paṇḍita also returned to Nīlācala» (Antya 8.37).
- **«Does My mother have devotion?»** (Antya 9.91–109): the Lord took him to a secluded place: «You stayed with My mother. Now tell Me the truth, does she have devotion to Lord Viṣṇu?» «On hearing this question, Dāmodara Paṇḍita, who was very austere and impartial, became angry and replied:

> «O Lord, what did You say?… It is by Your mother's mercy that You have devotion for Viṣṇu. Whatever You have is by her potency… Transformations of love for Viṣṇu like crying, shivering, perspiring, fainting… are constantly visible on the body of Mother Śacī, and she is always chanting the holy name of Kṛṣṇa… It is Mother Śacī who is addressed as devotional service to Viṣṇu… If even someone who considers the word *āi* an ordinary word utters this word, by the influence of that sound, he is freed from all distress.» (9.95–102)

The Lord embraced him again and again: «O Dāmodara, today you have purchased Me, for you have confirmed what was in My heart. Whatever asset of devotion to Viṣṇu I have is by My mother's mercy.»`, "Antya 3.185; 8.37; 9.91–109.");

add(1365, "Śaṅkara Paṇḍit", `## In short

Śaṅkara Paṇḍita, who joined the Lord in Nīlācala.

## In the book

«Dāmodara Paṇḍita and Śrī Śaṅkara Paṇḍita also came there within a few days» (Antya 3.185); he was among those who received the devotees of Bengal in Purī (Antya 8.56–61).`, "Antya 3.185; 8.56–61.");

add(96, "Bhagavān Ācārya", `## In short

Bhagavān Ācārya, «the great personality who would never hear of material enjoyment», who joined the Lord in Nīlācala.

## In the book

«The great personality Bhagavān Ācārya, who would never hear of material enjoyment, also came there» (Antya 3.188); he was among those who received the devotees of Bengal in Purī (Antya 8.56–61).`, "Antya 3.188; 8.56–61.");

add(1060, "Nṛsiṁhānanda Brahmacārī (Bhāratī)", `## In short

In the *Caitanya-bhāgavata* he is **Pradyumna Brahmacārī**, «a servant of Lord Nṛsiṁhadeva» in whose body Nṛsiṁha manifested and with whom He spoke directly.

## In the book

- Joining the Lord in Nīlācala: «Śrī Pradyumna Brahmacārī was a servant of Lord Nṛsiṁhadeva. Lord Nṛsiṁha manifested in his body» (Antya 3.186).
- To Purī with the devotees of Bengal: «Pradyumna Brahmacārī also came. Lord Nṛsiṁhadeva used to talk with him directly» (Antya 8.12).`, "Antya 3.186; 8.12.");

add(1099, "Pradyumna Miśra", `## In short

Pradyumna Miśra of Orissa, «an ocean of ecstatic love for Kṛṣṇa», to whom the Lord gave shelter at His feet.

## In the book

- «All glories to He who is the life of Śrī Pradyumna Miśra» (Ādi 14.2).
- Among the Lord's associates born in Orissa who joined Him in Nīlācala: «Pradyumna Miśra, whose body was filled with love of God, as well as Paramānanda and Rāmānanda, two most sober personalities, all joined the Lord» (Antya 3.184).
- «Śrī Pradyumna Miśra was an ocean of ecstatic love for Kṛṣṇa. Śrī Gaurasundara personally gave him shelter at His lotus feet» (Antya 5.211).
- Among those who received the devotees of Bengal (Antya 8.56–61).`, "Ādi 14.2; Antya 3.184; 5.211; 8.56–61.");

const plan = Object.entries(T).map(([id, [name, text]]) => ({ id: +id, name, text }));
fs.writeFileSync(new URL("./cb16.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length + " entradas");
