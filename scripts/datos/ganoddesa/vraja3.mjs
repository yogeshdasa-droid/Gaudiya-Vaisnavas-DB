// node vraja3.mjs → vraja3.json («Vraja-Nitya-līlā», tanda 3: Kṛṣṇa's cowherd friends, 15-11-2026).
// Gopāla-campū (Pūrva/Uttara) + Ujjvala-nīlamaṇi-kiraṇa (Āśraya-nirṇaya, text 15). Whisper: longer is better; when the
// books do not name the boy, what they say of Kṛṣṇa's friends in general.
// Not named in the books: Mahābala, Subāhu, Mahābāhu, Prabala, Lavaṅga, Kokila (general text only).
import fs from "node:fs";
const UNK = "Ujjvala-nīlamaṇi-kiraṇa";
const GC = "Gopāla-campū";

const FRIENDS = `## ${GC} — Kṛṣṇa's cowherd friends

- **One life with Him** (Uttara-campū 1, verse 15): «Kṛṣṇa in relation to his friends like Śrīdāma was like the chief life air in relation to the other bodily airs. Always acting as one, they performed all their actions for one purpose—pleasing him.» «Served by his friends, Kṛṣṇa was a likeness of the life air of these boys who had bodies similar to his, for they could not exist without him or without service to him and he had given himself to them» (verse 16).
- «He was the essence of the heart to the cowherds who served him such as Śrīdāma» (Uttara-campū 2, verse 4).
- **Their names** in the Bhāgavatam, quoted in the Gopāla-campū (Pūrva-campū 22.3): «O Stoka-kṛṣṇa and Aṃśu, O Śrīdāma, Subala and Arjuna, O Vṛṣabha, Ojasvī, Devaprastha and Varūthapa!» (SB 10.22.31).
- **The strongest** (Pūrva-campū 14.10): «Śrīdāma, Subala and Stoka-kṛṣṇa, who had strength similar to theirs, assembled with Kṛṣṇa and Balarāma. They all understood the hidden meaning of things and followed the principles of dharma. Therefore they were firm friends. It is said they had powers equal to that of Kṛṣṇa and Balarāma» — and they asked them for the fruits of the tāla forest guarded by Dhenuka.
- **Their games** (Pūrva-campū 16, verse 14): «Kṛṣṇa played the king, Stoka-kṛṣṇa played the minister, while Balarāma played another king and Subala played his minister. Śrīdāma and Bhadra were the commanders of the army.» «Arjuna, Subala and others began singing using their hands, horns, and split bamboo to keep rhythm. Kṛṣṇa began to dance» (16, verse 7).
- **What Kṛṣṇa is** (Uttara-campū 31, verse 46): «Holder of Govardhana! Your father and mother are Nanda and Yaśodā. Rādhikā is your beloved. **Śrīdāma and Subala are your friends.** Balarāma is your elder brother. The flute is your music.»
- **Their own weddings** (Uttara-campū 35.56): after Kṛṣṇa's wedding with the gopīs, «Śrīdāma and others who had previously remained at kaumāra age by their own will (and therefore did not get married while Kṛṣṇa was gone) then got married.»

## ${UNK} — the love of His friends

> vrajastha-priya-narma-sakhānāṁ ca anurāga-paryantā | vraja-sundarīṇaṁ tu samarthā ratiḥ mahābhāva-paryantā, subalādīnāṁ ca (Āśraya-nirṇaya, text 15)

«The prema of the priya-narma-sakhās (the most intimate cowherd friends of Kṛṣṇa) in Vraja reaches up to the point of anurāga. The highest point of samarthā-rati in the vraja-gopīs, as well as in Śrī Kṛṣṇa's friends like Subala, extends to the stage of mahābhāva» (p. 46).
`;
const SRC_F = `${GC}, Pūrva 14.10, 16.7, 16.14, 22.3; Uttara 1.15–16, 2.4, 31.46, 35.56; ${UNK}, Āśraya-nirṇaya 15 (pp. 45–46)`;

const FOUR = `- **Dāma, Sudāma, Vasudāma and Kiṅkiṇi** (Pūrva-campū 21.20): «The wise understand that Dāma, Sudāma, Vasudāma and Kiṅkini are the external manifestations of Kṛṣṇa's mind, intelligence, citta and ahaṅkāra. When they turned five years old they received a shower of prema from Kṛṣṇa every day and became joyful in association of others their same age.» Kṛṣṇa took these four boys with Him, secretly, to watch the young gopīs' Kātyāyanī vow at the Yamunā (21.19–20).
- **Guards of the rāsa night** (Pūrva-campū 23.22): «he met Dāma, Sudāma, Vasudāma and Kiṅkiṇi, being pleased with their precious affection. He secretly assigned them as guards at his door to prevent others entering while he was sleeping in his room. He then left them, holding his flute in his hands.» After the rāsa, «Previously they climbed a very high tree. Then, understanding that Kṛṣṇa was going home, silent, keeping their distance, they followed him» (27.30–31).
- After His meal Kṛṣṇa «returned home with Śrīdāma, Dāma, Sudāma, Vasudāma and others» (Pūrva-campū 2.116); in the forest He placed «O Subala! Stay behind him. O Dāma and Sudāma! You two should remain at his sides» (12, verse 6).`;
const SRC_FOUR = `Pūrva 2.116, 12.6, 21.19–20, 23.22, 27.30–31`;

const general = (who, what) => `## In the Vraja-nitya-līlā

**${who}**, ${what}

The Gopāla-campū and the Ujjvala-nīlamaṇi-kiraṇa do not name ${who}; here is what they say of Kṛṣṇa's cowherd friends.

${FRIENDS}
## Sources

${SRC_F}.
`;

const SUDAMA = `## In the Vraja-nitya-līlā

**Sudāmā** (Sudāma), one of Kṛṣṇa's cowherd friends — with Dāma, Vasudāma and Kiṅkiṇi, one of the four boys who are «the external manifestations of Kṛṣṇa's mind, intelligence, citta and ahaṅkāra».

## ${GC} — Sudāma

${FOUR}
- Sudāma walks with Balarāma and Śrīdāma in Kṛṣṇa's company: «Following Balarāma dressed in blue, Śrīdāma, Sudāma and other friends, famous for playing with Kṛṣṇa, arrived» (Pūrva-campū 2.26).
- In Mathurā Kṛṣṇa loved the garland-maker because «his name was Sudāma, like that of Kṛṣṇa's friend, the abode of happiness» (Uttara-campū 4.27).

${FRIENDS}
## Sources

${GC}, Pūrva 2.26, ${SRC_FOUR}; Uttara 4.27; ${SRC_F}.
`;

const DAMA = (extra = "") => `## In the Vraja-nitya-līlā

**Dāma**, one of Kṛṣṇa's cowherd friends — with Sudāma, Vasudāma and Kiṅkiṇi, one of the four boys who are «the external manifestations of Kṛṣṇa's mind, intelligence, citta and ahaṅkāra».${extra}

## ${GC} — Dāma

${FOUR}
- «Kṛṣṇa and his friends Balarāma, Dāma and others sat on white cushions» in Nanda's assembly (Pūrva-campū 3, verse 5); «When Kṛṣṇa departed with Śrīrāma, Dāma and others…» (2.64); «After joyfully taking lunch with friends like Rāma and Dāma…» (10.23).

${FRIENDS}
## Sources

${GC}, Pūrva 2.64, 3.5, 10.23, ${SRC_FOUR}; ${SRC_F}.
`;

const plan = [
  {
    id: 325,
    name: "Śrī Gaurīdāsa Paṇḍita",
    text: `## In the Vraja-nitya-līlā

**Subala**, Kṛṣṇa's intimate friend, endowed with Kṛṣṇa's own qualities, whose love reaches *mahābhāva* like the gopīs'; the messenger between Kṛṣṇa and the gopīs.

## ${UNK} — Subala's love

> vraja-sundarīṇaṁ tu samarthā ratiḥ mahābhāva-paryantā, subalādīnāṁ ca (Āśraya-nirṇaya, text 15)

«The highest point of samarthā-rati in the vraja-gopīs, as well as in Śrī Kṛṣṇa's friends like **Subala**, extends to the stage of mahābhāva» — while «the prema of the priya-narma-sakhās… reaches up to the point of anurāga» (p. 46).

## ${GC} — Subala

- **His intimate friend** (Pūrva-campū 15.1): before going to Rādhā's bower Kṛṣṇa «met with Subala, Madhumaṅgala and other intimate friends»; «Subala and other friends sat on the right side» (15.4). In the forest: «O Subala! Stay behind him» (12, verse 6).
- **Like Kṛṣṇa** (Uttara-campū 6.48–51): when Kṛṣṇa left Vraja He said, «Stoka-kṛṣṇa should wrap himself in my cloth laden with fragrance and play the flute. **Subala should dress in Balarāma's blue cloth and take his horn.** They should sit among the cows»; «he gave Stoka-kṛṣṇa and Subala, who were endowed with his own qualities, his clothing filled with the scent of his limbs, and decorated them properly with his ornaments.» When He came back He found that He had entrusted «the flute, and horn to Stoka-kṛṣṇa and Subala» (Uttara-campū 32.19).
- **The gopīs' messenger**: Kṛṣṇa «engaged Subala who came from Mathurā with attractive words for his beloved gopīs» (Uttara-campū 6, verse 9); «Subala brought Kṛṣṇa's message to the people of Vraja but did not deliver it to the gopīs since they were weak with the fire of separation» (7.14); Rādhā «went to Subala, the friend of Kṛṣṇa. Seeing Subala, they fainted» (7, verses 7–8); «They delivered it to Subala and Subala gave it to the gopīs. The gopīs then sent Subala to deliver a letter they personally wrote» (14.97–98); Kṛṣṇa's consolation to Rādhā came «within a letter meant for Subala» (19.96).
- **At the wedding** (Uttara-campū 32, verse 35): «O Śrīdāma! Do not tremble. O Subala! Stop your hairs from standing on end» — Madhumaṅgala teasing the friends at the gathering that planned Kṛṣṇa's wedding.
- At the end of the book «Kṛṣṇa's dear friends like Subala and Arjuna embraced the two reciters» (Uttara-campū 37, verse 135).

${FRIENDS}
## Sources

${GC}, Pūrva 12.6, 15.1–4; Uttara 6.9, 6.48–51, 7.7–8, 7.14, 14.97–98, 19.96, 32.19, 32.35, 37.135; ${SRC_F}.
`,
  },
  {
    id: 6,
    name: "Abhirāma Ṭhākura",
    text: `## In the Vraja-nitya-līlā

**Śrīdāmā** (Śrīdāma), the son of Vṛṣabhānu and so Śrī Rādhā's brother, the first of Kṛṣṇa's cowherd friends.

## ${GC} — Śrīdāma

- **Rādhā's brother** (Uttara-campū 35.39): at Rādhā's wedding, Vṛṣabhānu «satisfied Kṛṣṇa by proper treatment and again offered his daughter, and then even his son Śrīdāma».
- **The first friend**: «Kṛṣṇa in relation to his friends like Śrīdāma was like the chief life air» (Uttara-campū 1, verse 15); «Rādhikā is your beloved. Śrīdāma and Subala are your friends» (31, verse 46). Kṛṣṇa is called the «friend of Śrīdāma and others» (Pūrva-campū 18.23).
- **In Nanda's assembly** (Pūrva-campū 3.9): «Famous Śrīdāma, engaged by Kṛṣṇa and Balarāma, acting as their proxy, informed the king and went to the inner chambers.»
- **Equal in strength** (Pūrva-campū 14.10): «Śrīdāma, Subala and Stoka-kṛṣṇa, who had strength similar to theirs… had powers equal to that of Kṛṣṇa and Balarāma.» In their games «Śrīdāma and Bhadra were the commanders of the army» (16, verse 14); when Pralamba came, Kṛṣṇa said «Let Śrīdāma be on the same side as Balarāma, who has great competitive spirit», and «Kṛṣṇa carried Śrīdāma and Pralamba carried Balarāma» (16.21, verse 19).
- **Truthful** (Pūrva-campū 19.58–60): «When Śrīdāma and other truthful friends arrived», Śrīdāma told the elders what had happened, and all said «That is correct Śrīdāma. That is the truth.»
- **Kṛṣṇa's letter** (Uttara-campū 6.42–43): from Mathurā Kṛṣṇa «wrote a letter in his own hand and gave it to Śrīdāma». After Kaṃsa's death Kṛṣṇa told Śrīdāma to follow Nanda (5.72).
- In Sāndīpani's school Kṛṣṇa loved «Śrīdāma Śarma since he had the same name as his dear friend in Vraja» (Uttara-campū 8, verse 37).
- **At the wedding**: «O Śrīdāma! Do not tremble» (Uttara-campū 32, verse 35); «Balarāma and Śrīdāma were joyful along with Uddhava» in the wedding procession (35, verse 4); and «Śrīdāma and others who had previously remained at kaumāra age by their own will… then got married» (35.56).

${FRIENDS}
## Compared with the Gaṇoddeśa

The Gaṇoddeśa calls Śrīdāmā Śrī Rādhā's elder brother; the Gopāla-campū shows him as Vṛṣabhānu's son, given with Rādhā at her wedding: the books agree.

## Sources

${GC}, Pūrva 3.9, 14.10, 16.14, 16.19–21, 18.23, 19.58–60; Uttara 1.15, 5.72, 6.42–43, 8.37, 31.46, 32.35, 35.4, 35.39, 35.56; ${SRC_F}.
`,
  },
  { id: 1496, name: "Sundarānanda Ṭhākura", text: SUDAMA },
  { id: 12, name: "Acyutānanda dāsa (Pañcasakhā)", text: SUDAMA },
  {
    id: 1814,
    name: "Dhanañjaya Paṇḍita",
    text: `## In the Vraja-nitya-līlā

**Vasudāmā** (Vasudāma), one of Kṛṣṇa's cowherd friends — with Dāma, Sudāma and Kiṅkiṇi, one of the four boys who are «the external manifestations of Kṛṣṇa's mind, intelligence, citta and ahaṅkāra».

## ${GC} — Vasudāma

${FOUR}
- «One day, Kṛṣṇa, offering respects to Yaśodā, went to play with Balarāma, Śrīrāma, Sudāma and Vasudāma» (Pūrva-campū 7.29); «Śrīdāma, Sudāma, Vasudāma and others gathered in a group not too far away, in order to keep a watch on them» (16.2).

${FRIENDS}
## Sources

${GC}, Pūrva 7.29, 16.2, ${SRC_FOUR}; ${SRC_F}.
`,
  },
  { id: 1988, name: "Nāgara Puruṣottama", text: DAMA() },
  { id: 43, name: "Śiśu Ananta (Pañcasakhā)", text: DAMA() },
  {
    id: 1139,
    name: "Puruṣottama Dāsa",
    text: `## In the Vraja-nitya-līlā

The Gaura-gaṇoddeśa-dīpikā gives two Puruṣottamas: **Stoka-kṛṣṇa** (verse 130) and **Dāma** (Nāgara Puruṣottama, verse 131). Both are here.

## ${GC} — Stoka-kṛṣṇa

- **Equal to Kṛṣṇa** (Pūrva-campū 14.10): «Śrīdāma, Subala and Stoka-kṛṣṇa, who had strength similar to theirs… had powers equal to that of Kṛṣṇa and Balarāma.» In their games «Kṛṣṇa played the king, Stoka-kṛṣṇa played the minister» (16, verse 14).
- **Kṛṣṇa in Kṛṣṇa's place** (Uttara-campū 6.48–51): leaving Vraja Kṛṣṇa said, «Stoka-kṛṣṇa should wrap himself in my cloth laden with fragrance and play the flute… They should sit among the cows»; He gave «Stoka-kṛṣṇa and Subala, who were endowed with his own qualities, his clothing filled with the scent of his limbs». When He came back He found He had entrusted «the flute, and horn to Stoka-kṛṣṇa and Subala» (32.19).
- Among the Pāṇḍavas, «Nakula and Sahadeva praise the prema of Stoka-kṛṣṇa» (Uttara-campū 17, verse 17).

## ${GC} — Dāma

${FOUR}

${FRIENDS}
## Sources

${GC}, Pūrva 14.10, 16.14, ${SRC_FOUR}; Uttara 6.48–51, 17.17, 32.19; ${SRC_F}.
`,
  },
  {
    id: 1080,
    name: "Parameśvara Dāsa Ṭhākura",
    text: `## In the Vraja-nitya-līlā

**Arjuna**, one of Kṛṣṇa's dearest cowherd friends.

## ${GC} — the cowherd Arjuna

- In the games of Pralamba's day, «Subala, Arjuna, Kṛṣṇa and Balarāma came, danced about»; «Arjuna, Subala and others began singing using their hands, horns, and split bamboo to keep rhythm. Kṛṣṇa began to dance» (Pūrva-campū 16.2, verse 7).
- His name in the Bhāgavatam's list: «O Śrīdāma, Subala and Arjuna» (Pūrva-campū 22.3).
- Among the Pāṇḍavas, «Arjuna praises the cowherd Arjuna» (Uttara-campū 17, verse 17).
- At the end of the book, «Kṛṣṇa's dear friends like Subala and Arjuna embraced the two reciters» (Uttara-campū 37, verse 135).

${FRIENDS}
## Sources

${GC}, Pūrva 16.2–7, 22.3; Uttara 17.17, 37.135; ${SRC_F}.
`,
  },
  {
    id: 1283,
    name: "Rāmānanda Rāya",
    text: `## In the Vraja-nitya-līlā

**Arjuna**, one of Kṛṣṇa's dearest cowherd friends (*priya-narma-sakhā*) — and, by the Gaura-gaṇoddeśa-dīpikā, also the gopī **Arjunīyā**.

## ${GC} — the cowherd Arjuna

- In the games of Pralamba's day, «Subala, Arjuna, Kṛṣṇa and Balarāma came, danced about»; «Arjuna, Subala and others began singing using their hands, horns, and split bamboo to keep rhythm. Kṛṣṇa began to dance» (Pūrva-campū 16.2, verse 7).
- His name in the Bhāgavatam's list: «O Śrīdāma, Subala and Arjuna» (Pūrva-campū 22.3).
- The Pāṇḍava and the cowherd: «Arjuna praises the cowherd Arjuna» (Uttara-campū 17, verse 17); in Sāndīpani's school Kṛṣṇa loved Śrīdāma Śarma for his name, «just as he showed affection for Pāṇḍava Arjuna» (8, verse 37).
- «Kṛṣṇa's dear friends like Subala and Arjuna embraced the two reciters» (Uttara-campū 37, verse 135).

## ${UNK} — the priya-narma-sakhās

«The prema of the priya-narma-sakhās (the most intimate cowherd friends of Kṛṣṇa) in Vraja reaches up to the point of anurāga» (Āśraya-nirṇaya, text 15, p. 46). The book does not name Arjunīyā.

${FRIENDS}
## Sources

${GC}, Pūrva 16.2–7, 22.3; Uttara 8.37, 17.17, 37.135; ${SRC_F}.
`,
  },
  {
    id: 1322,
    name: "Rudra Paṇḍit",
    text: `## In the Vraja-nitya-līlā

**Varūthapa**, one of Kṛṣṇa's cowherd friends.

## ${GC} — Varūthapa

The Gopāla-campū names him once, in the Bhāgavatam's list of Kṛṣṇa's friends (Pūrva-campū 22.3): «O Stoka-kṛṣṇa and Aṃśu, O Śrīdāma, Subala and Arjuna, O Vṛṣabha, Ojasvī, Devaprastha and **Varūthapa**!» (SB 10.22.31) — Kṛṣṇa calling His friends under the trees on the day of the brāhmaṇas' wives.

${FRIENDS}
## Sources

${GC}, Pūrva 22.3; ${SRC_F}.
`,
  },
  {
    id: 1833,
    name: "Kholāvecā Śrīdhara",
    text: `## In the Vraja-nitya-līlā

**Kusumāsava** — **Madhumaṅgala**, the brāhmaṇa boy who is Kṛṣṇa's jester: «expert in all knowledge… who acted as a clown».

## ${GC} — Madhumaṅgala

- **Who he is** (Pūrva-campū 2.29): «Madhumaṅgala, expert in all knowledge, an accomplished brāhmaṇa, who was the same age as Kṛṣṇa, who had a great thirst for secret jokes, who was without fault, who was equal to Nārada, but who acted as a clown, delighted everyone with his words of comical blessings.»
- **With Paurṇamāsī** (Pūrva-campū 3.71–72): «an austere woman arrived with a brāhmaṇa boy who had graduated from school… She said with a smile, “I am named Paurṇamāsī… This boy is Madhumaṅgala, a brāhmaṇa boy. He has a nature equal to Nārada's. We remain eternally at the age that you see us because of our special knowledge.”»
- In Nanda's assembly «Madhumaṅgala then entered the area to provide joy by his clowning» (Pūrva-campū 3.10); one of Kṛṣṇa's «intimate friends», with Subala (15.1); Paurṇamāsī had him carry her messages (21.127–129).
- **Kṛṣṇa's trust** (Uttara-campū 6.50): leaving Vraja, «He spoke to Madhumaṅgala with affection: “Oh! You also go. As my representative, since I have unexpectedly left, serve Paurṇamāsī for my auspiciousness and produce full happiness as before.”»
- **At the wedding**: «Madhumaṅgala went and explained all the auspicious news to Kṛṣṇa» (Uttara-campū 31.59); «O Śrīdāma! Do not tremble. O Subala! Stop your hairs from standing on end… Speaking in this tricky way about Kṛṣṇa at the gathering for planning the wedding, Madhumaṅgala brāhmaṇa glanced at Kṛṣṇa who was downcast with shame, and laughed gently» (32, verse 35); with Vṛndā he supported Paurṇamāsī (31.40, 32.19).

${FRIENDS}
## Compared with the Gaṇoddeśa

The Gaura-gaṇoddeśa-dīpikā (133) calls him Kusumāsava; the Gopāla-campū does not use that name, only Madhumaṅgala.

## Sources

${GC}, Pūrva 2.29, 3.10, 3.71–72, 15.1, 21.127–129; Uttara 6.50, 31.40, 31.59, 32.19, 32.35; ${SRC_F}.
`,
  },
  {
    id: 931,
    name: "Mukunda Datta",
    text: `## In the Vraja-nitya-līlā

**Madhukaṇṭha**, the singer of Vraja — in the Gopāla-campū, one of the two twin reciters who tell Kṛṣṇa's pastimes in Nanda's assembly; the whole book is their telling.

## ${GC} — Madhukaṇṭha and Snigdhakaṇṭha

- **Their family** (Pūrva-campū 2.69–81): the panegyrist Ratnacūḍa presents them to Nanda: «These two boys are my sister's sons… They belong to Ratnavatī… This is my sister's husband. His name is Sumati», who lives «on the shore of the ocean». «Their names are Madhukaṇṭha and Snigdhakaṇṭha.» Kṛṣṇa said, «Their names appear to have the same meaning.» — «They are brothers, twins.»
- **Their teacher** (2.82–91): they learned the art of praising from Ratnacūḍa; «They know everything, and because of that they are protectors of the poetic art.» Asked where such powers came from, they said: «Mercy of guru is the only cause in all cases», and their guru is «Nārada, to be remembered every morning, our fortunate possession, who rains all bliss».
- **Like brothers of Kṛṣṇa** (2.122): «Kṛṣṇa, filled with all auspiciousness, called their two sons as if they were his own younger brothers. Out of affection, he made them sit» near Him.
- **The reciters** (Pūrva-campū 3.12): «The king then ordered in a sweet voice, “O Madhukaṇṭha and Snigdhakaṇṭha! We are very eager. Please describe something.”» From then on, every morning and evening, they tell Kṛṣṇa's pastimes to Nanda's assembly, Yaśodā listening behind the lattices — the whole Gopāla-campū.
- At the end (Uttara-campū 37, verse 135): «Kṛṣṇa's dear friends like Subala and Arjuna embraced the two reciters. Rādhā and her sakhīs offered them their joyful glances.»

## Compared with the Gaṇoddeśa

The Gaura-gaṇoddeśa-dīpikā (140) names Madhukaṇṭha and Madhuvrata as the two singers of Vraja (Mukunda Datta and Vāsudeva Datta); in the Gopāla-campū Madhukaṇṭha's twin brother is **Snigdhakaṇṭha**.

## Sources

${GC}, Pūrva 2.69–91, 2.122, 3.12; Uttara 37.135.
`,
  },
  { id: 96, name: "Bhagavān Ācārya", text: general("A cowherd boy", "one of Kṛṣṇa's cowherd friends in Vraja (the Gaura-gaṇoddeśa-dīpikā does not give his name).") },
  { id: 442, name: "Halāyudha Ṭhākura", text: general("Prabala", "a cowherd boy, close friend of Lord Balarāma.") },
  { id: 657, name: "Kamalākara Pippalāi", text: general("Mahābala", "one of the twelve gopālas, Kṛṣṇa's cowherd friends.") },
  { id: 1567, name: "Uddhāraṇa Datta Ṭhākura", text: general("Subāhu", "one of the twelve gopālas, Kṛṣṇa's cowherd friends.") },
  { id: 894, name: "Maheśa Paṇḍita", text: general("Mahābāhu", "one of the twelve gopālas, Kṛṣṇa's cowherd friends.") },
  { id: 639, name: "Kālīya Kṛṣṇa Dāsa Ṭhākura", text: general("Lavaṅga", "one of the twelve gopālas, Kṛṣṇa's cowherd friends.") },
  { id: 363, name: "Gopāla Ṭhākura", text: general("Kokila", "one of Kṛṣṇa's cowherd friends.") },
];
fs.writeFileSync(new URL("./vraja3.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length + " fichas");
