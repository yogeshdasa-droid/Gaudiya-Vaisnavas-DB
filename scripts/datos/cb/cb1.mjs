// node cb1.mjs → cb1.json   (16-11-2026) — prueba 1 del Caitanya-bhāgavata (con el Gauḍīya-bhāṣya de Bhaktisiddhānta).
// Texts «In the Caitanya-bhāgavata — <name>» for 5 records; verse numbers as in the Bhumipati dāsa edition (khaṇḍa ch.verse).
// Apply: node aplicar-cb.mjs cb1.json [puerto] [--dry]
import fs from "node:fs";
const SRC = "*Śrī Caitanya-bhāgavata* of Vṛndāvana dāsa Ṭhākura, with the *Gauḍīya-bhāṣya* of Śrīla Bhaktisiddhānta Sarasvatī (English ed. Bhūmipati dāsa / Puṇḍarīka Vidyānidhi dāsa, 2003).";

const malini = `## In short

Mālinī-devī, the wife of Śrīvāsa Paṇḍita, served Nityānanda Prabhu in their house at Māyāpura in the mood of a mother (*vātsalya*). Nityānanda called Śrīvāsa «father», would not eat with His own hands, and she fed Him as her own son. The book tells of the crow and the ghee bowl, her prayer to Nityānanda, and the death of her son.

## Feeding Nityānanda as her son

> putra-prāya kari' anna mālinī yogāya

«He would not eat rice with His own hands, so Mālinī fed Him as her own son.» (Madhya 8.7; the same line in Madhya 7.8 and 11.29)

«The chaste Mālinī knew well the glories of Nityānanda, therefore she served Him as a mother serves her son.» (Madhya 8.8; also 11.30)

The *bhāṣya*: just as mothers feed small children who cannot eat with their own hands, Mālinī, absorbed in *vātsalya*, fed Nityānanda with her own hands (Madhya 7.8).

## The milk

> niravadhi mālinīra kare stana-pāne

«He continually drank milk from Mālinī's breast. Although there was no milk in her breasts, by the touch of Nityānanda they were filled with milk.» (Madhya 11.6)

The *bhāṣya*: Nityānanda considered Himself a cowherd boy of Vraja and Śrīvāsa and Mālinī His father and mother; seeing Mālinī as an elderly *gopī*, He drank her milk, and she was struck with wonder. By the order of Mahāprabhu she told no one; she constantly saw His childhood pastimes (Madhya 11.6–10). «As soon as Mālinī would see Nityānanda, milk would automatically flow from her breasts» (Madhya 11.57).

This fits her identity in the *Gaura-gaṇoddeśa-dīpikā* (42): Ambikā, the nurse who fed infant Kṛṣṇa in Vraja (see her «Gaṇoddeśa»).

## The crow and the ghee bowl (Madhya 11.31–56)

One day a crow took the brass bowl used to offer ghee to Kṛṣṇa and flew off into the forest; it came back without it. Fearing the anger of Śrīvāsa — a great devotee, for whom losing an article of the Lord's service through his wife's carelessness would be grave (*bhāṣya*, 11.34) — Mālinī said nothing and simply wept.

Nityānanda came, smiling: «Why are you crying? Tell Me and I will take care of everything.» — «Listen, Gosāñi! A crow stole a ghee bowl and left it somewhere» (11.38). — «Dear mother, do not worry. I will give you the bowl. Please stop crying.» He ordered the crow to bring it back at once; the crow flew away and returned with the bowl in its beak, and set it down in front of Mālinī, «who knew perfectly well the influence of Nityānanda» (11.40–44).

Seeing this, she fainted in ecstasy; then she stood up and prayed (11.45–55):

> ye jana ānila mṛta gurura nandana
> ye jana pālana kare sakala bhuvana
> yamera ghara haite ye ānite pāre
> kāka-sthāne bāṭi āne, — ki mahattva tāre?

«For He who brought back the dead son of His spiritual master, who maintains all the universes, and who can bring a soul back from the abode of Yamarāja, it is not at all glorious to bring a bowl back from a crow.» (11.46–47)

She praised Him as the one who holds the universes on His head, as Lakṣmaṇa who guarded Sītā and saw only her feet, as the destroyer of Rāvaṇa's line, as the Lord to whom the Yamunā prayed — and ended: «Still Your activities are not insignificant. Whatever You do is eternal and confirmed by the Vedas» (11.55). Nityānanda smiled and, in the mood of a child, said: «I will eat» (11.56).

## Other moments

- **The Lord's drama** (Madhya 18.63–64): watching with Śacī-mātā and the other ladies, when Śrīvāsa came on as Nārada, Śacī asked Mālinī, «Is that Śrīvāsa Paṇḍita?» — «Yes, it certainly is.»
- **The death of her son** (Madhya 25.24–33): while the Lord danced in kīrtana in their courtyard, Śrīvāsa's son left his body inside the house; the ladies began to wail, and Śrīvāsa went in and quieted them, so that the Lord's dancing would not be disturbed. Later the Lord made the dead boy speak: «As a result of that fate I have taken birth from the womb of Mālinī as a son in the house of Śrīvāsa.»

## Sources

${SRC} Madhya 7.8; 8.6–8; 11.6–10, 11.29–57; 18.63–64; 25.24–33.`;

const makara = `## In short

Makaradhvaja Kara of Pāṇihāṭi: when Mahāprabhu stayed at the house of Rāghava Paṇḍita, He told him to serve Rāghava — «your love for Me will be shown by your love for Rāghava Paṇḍita.»

## With Mahāprabhu at Pāṇihāṭi (Antya 5.100–109)

After confiding to Rāghava Paṇḍita that Nityānanda is not different from Himself, the Lord turned to Makaradhvaja:

> makaradhvaja kara prati śrī-gaurāṅga-candra
> balilena, — «seviha tumi śrī-rāghavānanda»

«Śrī Gaurāṅga then said to Makaradhvaja Kara, “You should serve Śrī Rāghavānanda. Know for certain that your love for Me will be shown by your love for Rāghava Paṇḍita.”» (Antya 5.107–108)

The *bhāṣya* refers to *Caitanya-caritāmṛta* Ādi 10.24 and quotes the *Gaura-gaṇoddeśa-dīpikā* (141): *naṭaś candramukhaḥ prāg yaḥ sa karo makaradhvajaḥ* — «Candramukha, a famous dancer in Vṛndāvana, appeared in Lord Caitanya's pastimes as Makaradhvaja Kara.»

The Lord stayed some days and «made the village of Pāṇihāṭi glorious» (5.109), then went on to Varāha-nagara.

## With Nityānanda at Pāṇihāṭi (Antya 5.251–254)

When Nityānanda came to Pāṇihāṭi on the Gaṅgā with all His associates, He first went to Rāghava Paṇḍita's house: «Rāghava Paṇḍita, Śrī Makaradhvaja Kara, and their families became greatly pleased» (5.253).

## Pāṇihāṭi

The *bhāṣya* (Ādi 1.177): Pāṇihāṭi is a village on the bank of the Gaṅgā near Sodapur station; the houses of Śrī Rāghava Paṇḍita and Śrī Makaradhvaja are there.

## Sources

${SRC} Ādi 1.177 (bhāṣya); Antya 5.100–110, 5.251–254.`;

const garuda = `## In short

Garuḍa Paṇḍita («Garuḍāi») was a devotee of Navadvīpa, born before the Lord by His will; by the strength of the holy name a snake's poison could not touch him.

## Born in Navadvīpa before the Lord (Ādi 2.98–99)

> nigūḍhe aneka āra vaise nadīyāya
> pūrve sabe janmilena īśvara-ājñāya
> śrī-candraśekhara, jagadīśa, gopīnātha
> śrīmān, murāri, śrī-garuḍa, gaṅgādāsa

«Many other devotees lived incognito in Nadia. By the will of the Lord, Śrī Candraśekhara, Jagadīśa, Gopīnātha, Śrīmān Paṇḍita, Murāri Gupta, Śrī Garuḍa Paṇḍita, and Gaṅgādāsa all took birth before the Lord.»

The *bhāṣya*: «Śrī Garuḍa Paṇḍita was a resident of Navadvīpa and an associate of the Lord.» It quotes Antya 8.34, the *Gaura-gaṇoddeśa-dīpikā* (117: «He who previously appeared as Garuḍa has now appeared as Śrī Garuḍa Paṇḍita») and *Caitanya-caritāmṛta* Ādi 10.75 («Garuḍa Paṇḍita, the thirty-seventh branch of the tree, always engaged in chanting the auspicious name of the Lord. Because of the strength of this chanting, even the effects of poison could not touch him»).

## In the kīrtanas (Madhya 8.112–116, 13.336–339)

He is named — as «Garuḍāi» — among the associates present every night at the kīrtanas in the house of Śrīvāsa (and some nights of Candraśekhara), where «no one other than the Lord's associates was present» (8.117); and again with the devotees after the deliverance of Jagāi and Mādhāi (13.336–339).

## To Purī for the Ratha-yātrā (Antya 8.34)

> calilena śrī-garuḍa paṇḍita hariṣe
> nāma-bale yāṅre nā laṅghila sarpa-viṣe

«Śrī Garuḍa Paṇḍita also happily came. By the influence of the holy names he was not affected by the poison of a snake.»

## Sources

${SRC} Ādi 2.98–99; Madhya 8.112–117, 13.336–339; Antya 8.34.`;

const mukunda = `## In short

Mukunda Sañjaya, a rich and respected householder of Navadvīpa, father of Puruṣottama Sañjaya. Nimāi Paṇḍita opened His school in the Caṇḍī-maṇḍapa of his house and taught there every day.

## The Lord's school in his house

> mukunda sañjaya baḍa mahā-bhāgyavān
> yāṅhāra ālaye vidyā-vilāsera sthāna

«The Lord opened His school at the house of the most fortunate Mukunda Sañjaya.» (Ādi 10.38)

The *bhāṣya*: «Mukunda Sañjaya was a resident of Śrī Navadvīpa and the father of Puruṣottama Sañjaya. In the vast Caṇḍī-maṇḍapa of his house, Nimāi Paṇḍita taught grammar and similar subjects to him, his son, and various other students.»

> aneka janmera bhṛtya mukunda sañjaya
> puruṣottama dāsa haya yāṅhāra tanaya

«Mukunda Sañjaya was the Lord's servant for many lifetimes. His son was known as Puruṣottama dāsa.» (Ādi 15.5) Every day the Lord came first and sat in the Caṇḍī-maṇḍapa, and the students arrived after Him (15.6–7). The *bhāṣya*: «Just because there was a Caṇḍī-maṇḍapa in the courtyard of Mukunda Sañjaya, no one should consider him a worshiper of goddess Caṇḍī.»

«Although they could not understand the Lord's explanations, the fortunate Mukunda Sañjaya and his family all floated in waves of ecstasy» (Ādi 12.63–65; also 12.91, 15.30).

## With Buddhimanta Khān

He came with Buddhimanta Khān to the Lord's house (Ādi 12.72). The *bhāṣya*: «Both Buddhimanta Khān and Mukunda Sañjaya of Navadvīpa were respectable, rich, and prosperous in all regards» — rich men kept medicines and doctors in their houses, on whom the poor depended.

At the news of the Lord's marriage with Viṣṇupriyā, Buddhimanta Khān offered to bear the whole expense; Mukunda Sañjaya protested: «Listen, my dear friend. If you bear all expenses, then what will I do?» (Ādi 15.68–72)

## The Lord returns from Gayā (Madhya 1.125–130)

> āilena śrī-mukunda sañjayera ghare
> āsiyā vasilā caṇḍī-maṇḍapa bhitare

«The Lord then went to the house of Mukunda Sañjaya, where He sat down within the Caṇḍī-maṇḍapa.» Mukunda and his relatives felt unlimited happiness; the Lord embraced Puruṣottama Sañjaya and drenched him with tears; the ladies made auspicious sounds (1.126–130).

## Sources

${SRC} Ādi 10.38–39; 12.63–65, 12.72, 12.91; 15.5–7, 15.30, 15.68–72; Madhya 1.125–130.`;

const purusottama = `## In short

Puruṣottama Sañjaya (Puruṣottama dāsa), son of Mukunda Sañjaya of Navadvīpa, was the Lord's principal student when He taught in the Caṇḍī-maṇḍapa of their house. Madhya 1.128 and Antya 8.20 call him «Puruṣottama Sañjaya», one person.

## The Lord's student

> tāṅhāra putrere prabhu āpane paḍāya
> tāṅhāra o tāṅra prati bhakti sarvathāya

«His son, Puruṣottama Sañjaya, became the Lord's student. He also had great devotion for the Lord.» (Ādi 10.39)

«Mukunda Sañjaya was the Lord's servant for many lifetimes. His son was known as Puruṣottama dāsa» (Ādi 15.5). The *bhāṣya* (Ādi 10.38): in the Caṇḍī-maṇḍapa of his father's house Nimāi Paṇḍita taught grammar to Mukunda, to his son and to other students.

## The Lord embraces him (Madhya 1.128)

> puruṣottama sañjayere prabhu kaila kole
> siñcilena aṅga tāṅra nayanera jale

When the Lord came back from Gayā and went to the house of Mukunda Sañjaya, «The Lord embraced Puruṣottama Sañjaya and drenched his body with tears.»

## In the lists of associates

The lists of devotees born in Navadvīpa (Ādi 2.31), of the nightly kīrtanas in Śrīvāsa's house (Madhya 8.112–116, *puruṣottama, sañjayādi*) and of the kīrtana after the deliverance of Jagāi and Mādhāi (Madhya 13.336–339, *puruṣottama, mukunda, sañjaya*) read «Puruṣottama, Sañjaya»; the English translation gives them as two names — as the *Caitanya-caritāmṛta* (Ādi 10) counts two persons.

## To Purī for the Ratha-yātrā (Antya 8.20)

> puruṣottama sañjaya calilā harṣa-mane
> ye prabhura mukhya śiṣya pūrva-adhyayane

«Puruṣottama Sañjaya, who was the Lord's principal student when the Lord taught, also jubilantly came.»

## Sources

${SRC} Ādi 2.31; 10.38–39; 15.5; Madhya 1.126–130, 8.112–116, 13.336–339; Antya 8.20.`;

const plan = [
  { id: 900, name: "Mālinī Ṭhākurāṇī", text: malini },
  { id: 2165, name: "Makaradhvaja Kara", text: makara },
  { id: 303, name: "Garuḍa Paṇḍita", text: garuda },
  {
    create: true, name: "Mukunda Sañjaya", text: mukunda,
    fields: {
      place: "Navadvīpa",
      notes: "A rich and respected householder of Navadvīpa, father of Puruṣottama Sañjaya (#1138). Nimāi Paṇḍita taught in the Caṇḍī-maṇḍapa of his house (Caitanya-bhāgavata Ādi 10.38, 15.5–7). The old entry said: «He was a resident of Navadvīpa and a pupil of Mahāprabhu. Mukunda's title was Sañjaya.»\n\nTaken out of the record #937 «Mukunda Rāya» (16-11-2026), where the entry «Mukundasanjay» had been joined to another Mukunda.",
    },
  },
  {
    id: 937, name: "Mukunda Rāya",
    replace: [["He may belong to Nityānanda sakhā. Mukundasanjay He was a resident of Navadvīpa and a pupil of Mahāprabhu. Mukunda's title was Sañjaya.  He was the father of Puruṣottama, in whose house Mahāprabhu gave classes (Caitanya  Bhāgavata 1.7.73).",
      "He may belong to Nityānanda sakhā.\n\nThe entry «Mukundasanjay» (father of Puruṣottama, in whose house Mahāprabhu gave classes) that was here is now the record «Mukunda Sañjaya» (16-11-2026)."]],
  },
  { id: 1138, name: "Puruṣottama Sañjaya", text: purusottama },
];
fs.writeFileSync(new URL("./cb1.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length + " entradas");
