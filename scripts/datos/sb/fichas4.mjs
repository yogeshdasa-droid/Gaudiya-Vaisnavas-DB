// node fichas4.mjs [puerto] [--dry]   (16-11-2026) — fase 4 del Bhāgavatam, tanda 4: Vidura, Dhṛtarāṣṭra, Gāndhārī
// (Canto 1 y 3), Svāyambhuva Manu, Kardama Muni, Devahūti (Canto 3). Citas comprobadas con chk-citas.mjs.
// Kardama: solo las claves ROOT y M (el «Kardama» hijo de Pulaha es otro).
import { aplicar, SRC, SEE } from "./comun-sb.mjs";

const KURU = "B4|Sārvabhauma>Jayatsena>Ravaya>Bhāvuka>Śakroddhata>Devātithi>Ṛkṣa>Bhīmasena>Pratīpa>Śantanu (Mahābhiṣak)>Vicitravīrya";

const F = [
  [
    "Mahātmā Vidura",
    "Vidura",
    "Hastināpura; Haridvāra; Prabhāsa",
    `Son of Vyāsadeva by the maidservant of Vicitravīrya, younger brother of Dhṛtarāṣṭra and Pāṇḍu; Yamarāja himself, playing the part of a śūdra by the curse of Māṇḍūka Muni. Insulted by Duryodhana he left Hastināpura on pilgrimage, met Uddhava on the Yamunā and heard the Bhāgavatam from Maitreya at Haridvāra (Canto 3–4); he led Dhṛtarāṣṭra out of home and left his body at Prabhāsa (SB 1.13, 1.15.49, 3.1–3.5). ${SEE("the tree of the Kurus")}`,
    `## In short

Mahātmā Vidura, son of Vyāsadeva by the maidservant of Vicitravīrya, was Yamarāja in the role of a śūdra. When Dhṛtarāṣṭra, blind with love for his sons, persecuted the Pāṇḍavas, Vidura advised him to give Yudhiṣṭhira his share and to give up Duryodhana, the enemy of Kṛṣṇa; insulted by Duryodhana, he left his bow at the door and went on pilgrimage alone, thinking only of Kṛṣṇa. On the Yamunā he met Uddhava and heard of the end of the Yadu dynasty; at Haridvāra he questioned the sage Maitreya, whose answers fill the Third and Fourth Cantos. Returning to Hastināpura, he did not tell the Pāṇḍavas the sad news, and he awakened his elder brother Dhṛtarāṣṭra, who left home with Gāndhārī. Vidura left his body at Prabhāsa and returned to his post (SB 1.13, 3.1–3.5).

## In the book

- **His birth** — Vyāsadeva «begot three sons, two by the womb of Ambika and Ambalika, the two wives of his brother Vicitravirya, and the third by Vicitraviryas maidservant. These sons were Dhrtarastra, Pandu and Vidura» (9.22.25). «As long as Vidura played the part of a sudra, being cursed by Manduka Muni, Aryama officiated at the post of Yamaraja to punish those who committed sinful acts» (1.13.15).
- **His advice** — «When Vidura was invited by his elder brother [Dhrtarastra] for consultation, he entered the house and gave instructions which were exactly to the point» (3.1.10): «You must now return the legitimate share to Yudhisthira» (3.1.11); «You are maintaining offense personified, Duryodhana, as your infallible son, but he is envious of Lord Krsna» (3.1.13).
- **Insulted** — Duryodhana: «Who asked him to come here, this son of a kept mistress?» (3.1.15). «Thus being pierced by arrows through his ears and afflicted to the core of his heart, Vidura placed his bow on the door and quit his brothers palace. He was not sorry, for he considered the acts of the external energy to be supreme» (3.1.16).
- **Pilgrimage** — «He began to travel alone, thinking only of Krsna, through various holy places like Ayodhya, Dvaraka and Mathura» (3.1.18). «At last he reached the bank of the Yamuna, where he happened to meet Uddhava, the great devotee of Lord Krsna» (3.1.24), and «embraced him… Vidura then asked him for news of the family of Lord Krsna» (3.1.25). Hearing of the end of his relatives, «the learned Vidura pacified his overwhelming bereavement by dint of his transcendental knowledge» (3.4.23).
- **Maitreya** — «Vidura, the best amongst the Kuru dynasty, who was perfect in devotional service to the Lord, thus reached the source of the celestial Ganges River [Hardwar], where Maitreya, the great, fathomless learned sage of the world, was seated» (3.5.1). «While traveling on a pilgrimage, Vidura received knowledge of the destination of the self from the great sage Maitreya and then returned to Hastinapura» (1.13.1).
- **Back in Hastināpura** — «Compassionate Mahatma Vidura could not stand to see the Pandavas distressed at any time. Therefore he did not disclose this unpalatable and unbearable incident» (1.13.13). To Dhṛtarāṣṭra: «My dear King, please get out of here immediately. Do not delay. Just see how fear has overtaken you» (1.13.18); «it is the Supreme Personality of Godhead as eternal time [kala] that has approached us all» (1.13.19); «Verily, you are living just like a household dog and are eating remnants of food given by Bhima» (1.13.23).
- **The end** — «Vidura, while on pilgrimage, left his body at Prabhasa. Because he was absorbed in thought of Lord Krsna, he was received by the denizens of Pitrloka planet, where he returned to his original post» (1.15.49).

## Sources

${SRC} Canto 1, chapters 13 and 15; Canto 3, chapters 1–5; Canto 9, chapter 22.`,
    [`${KURU}>Vidura`],
  ],
  [
    "Mahārāja Dhṛtarāṣṭra",
    "Dhṛtarāṣṭra",
    "Hastināpura; Saptasrota (Himālayas)",
    `Son of Vyāsadeva by Ambikā, wife of Vicitravīrya; the blind king of the Kurus, husband of Gāndhārī and father of Duryodhana and ninety-nine other sons. Out of love for his sons he persecuted the Pāṇḍavas (the lacquer house). After the war, awakened by his brother Vidura, he left home with Gāndhārī, practised yoga at Saptasrota in the Himālayas and gave up his body in the fire of mystic power (SB 1.13, 3.1, 9.22). ${SEE("the tree of the Kurus")}`,
    `## In short

Dhṛtarāṣṭra, the blind son of Vyāsadeva by Ambikā, became king of the Kurus. «Blind» also with affection for his dishonest sons, he set fire to the lacquer house to burn the Pāṇḍavas and did not heed Kṛṣṇa or Vidura. After the war he lived in Hastināpura on the food of Bhīma, until Vidura told him that time had come for him and that he should leave at once. He broke the bonds of family affection, left home with Gāndhārī, and at Saptasrota in the Himālayas he practised aṣṭāṅga-yoga; on the fifth day his body burnt in the fire of his mystic power (SB 1.13, 3.1, 9.22).

## In the book

- **His family** — «These sons were Dhrtarastra, Pandu and Vidura» (9.22.25). «Dhrtarastras wife, Gandhari, gave birth to one hundred sons and one daughter, O King. The oldest of the sons was Duryodhana, and the daughters name was Duhsala» (9.22.26).
- **Blind with affection** — «King Dhrtarastra became blind under the influence of impious desires to nourish his dishonest sons, and thus he set fire to the lacquer house to burn his fatherless nephews, the Pandavas» (3.1.6). Kṛṣṇa's words in the assembly were nectar for some, but «The King [Dhrtarastra or Duryodhana] did not take» them (3.1.9).
- **Vidura's warning** — «Just see how fear has overtaken you» (1.13.18); «Whoever is under the influence of supreme kala [eternal time] must surrender his most dear life, and what to speak of other things, such as wealth, honor, children, land and home» (1.13.20); «your miserly body will certainly dwindle and deteriorate like an old garment» (1.13.25).
- **Leaving home** — «Maharaja Dhrtarastra, the scion of the family of Ajamidha, firmly convinced by introspective knowledge [prajna], broke at once the strong network of familial affection by his resolute determination. Thus he immediately left home to set out on the path of liberation, as directed by his younger brother Vidura» (1.13.29).
- **Saptasrota** — Nārada told Yudhiṣṭhira: «your uncle Dhrtarastra, his brother Vidura and his wife Gandhari have gone to the southern side of the Himalaya Mountains, where there are shelters of the great sages» (1.13.51). «On the banks at Saptasrota, Dhrtarastra is now engaged in beginning astanga yoga by bathing three times daily… and by drinking only water» (1.13.53).
- **The end** — «O King, he will quit his body, most probably on the fifth day from today. And his body will turn to ashes» (1.13.57); his wife watched him «burn in the fire of mystic power along with his thatched cottage» (1.13.58).

## Sources

${SRC} Canto 1, chapter 13; Canto 3, chapter 1; Canto 9, chapter 22.`,
    [`${KURU}>Dhṛtarāṣṭra`],
  ],
  [
    "Gāndhārī",
    "",
    "Hastināpura; Saptasrota (Himālayas)",
    `Daughter of King Subala of Gāndhāra, wife of Dhṛtarāṣṭra and mother of a hundred sons (Duryodhana the eldest) and a daughter, Duḥśalā. After the war she followed her husband to the Himālayas and entered the fire in which he left his body (SB 1.13, 9.22.26). ${SEE("the tree of the Kurus, as wife of Dhṛtarāṣṭra")}`,
    `## In short

Gāndhārī, the chaste daughter of King Subala of Gāndhāra, wife of the blind King Dhṛtarāṣṭra and mother of his hundred sons, all killed at Kurukṣetra. When Dhṛtarāṣṭra, awakened by Vidura, left home for the Himālayas, she followed him; at Saptasrota, seeing her husband burn in the fire of his mystic power, she entered the fire too (SB 1.13).

## In the book

- **Her family** — «Dhrtarastras wife, Gandhari, gave birth to one hundred sons and one daughter, O King. The oldest of the sons was Duryodhana, and the daughters name was Duhsala» (9.22.26).
- **Her grief** — Yudhiṣṭhira: «Where is my well wisher, uncle Vidura, and mother Gandhari, who is very afflicted due to all her sons demise?» (1.13.33). After Bhīṣma's death Yudhiṣṭhira «consoled his uncle and aunt Gandhari, who was an ascetic» (1.9.48).
- **Following her husband** — «The gentle and chaste Gandhari, who was the daughter of King Subala of Kandahar [or Gandhara], followed her husband, seeing that he was going to the Himalaya Mountains» (1.13.30).
- **The end** — «While outside observing her husband, who will burn in the fire of mystic power along with his thatched cottage, his chaste wife will enter the fire with rapt attention» (1.13.58).

## Sources

${SRC} Canto 1, chapters 9 and 13; Canto 9, chapter 22.`,
    [`${KURU}>Dhṛtarāṣṭra>=Gāndhārī`],
  ],
  [
    "Svāyambhuva Manu",
    "Manu",
    "Barhiṣmatī (Brahmāvarta); the bank of the Sunandā",
    `The first Manu, born of Lord Brahmā together with his wife Śatarūpā; father of Priyavrata and Uttānapāda and of Ākūti (wife of Ruci), Devahūti (wife of Kardama) and Prasūti (wife of Dakṣa). He asked for the earth to be lifted (the Lord appeared as Varāha), ruled from Barhiṣmatī as a saintly king, stopped his grandson Dhruva from killing the Yakṣas, and retired to the forest, where the Lord as Yajña protected him (SB 3.12–3.13, 3.21–3.22, 4.11, 8.1). ${SEE("the trees of Svāyambhuva Manu and of Brahmā")}`,
    `## In short

Svāyambhuva Manu, the first Manu of this day of Brahmā, appeared from Lord Brahmā together with Śatarūpā. He asked Brahmā for a place for the living beings, and the earth, sunk in the waters, was lifted by the Lord as Varāha. With Śatarūpā he had two sons, Priyavrata and Uttānapāda, and three daughters, Ākūti, Devahūti and Prasūti, from whom the world was populated; he brought Devahūti to Kardama Muni at Bindu-sarovara. A great devotee, he ruled from Barhiṣmatī enjoying in Kṛṣṇa consciousness. He stopped his grandson Dhruva's anger against the Yakṣas. At last he went to the forest with his wife and performed austerities on the bank of the Sunandā; when demons tried to devour him, the Lord as Yajñapati killed them (SB 3.12–3.13, 3.21–3.22, 4.11, 8.1).

## In the book

- **His birth** — «the one who had the male form became known as the Manu named Svayambhuva, and the woman became known as Satarupa, the queen of the great soul Manu» (3.12.54).
- **His children** — «he [Manu] begot in Satarupa five children two sons, Priyavrata and Uttanapada, and three daughters, Akuti, Devahuti and Prasuti» (3.12.56). «The father, Manu, handed over his first daughter, Akuti, to the sage Ruci, the middle daughter, Devahuti, to the sage Kardama, and the youngest, Prasuti, to Daksa. From them, all the world filled with population» (3.12.57).
- **The earth** — «Sri Manu said: O all powerful lord, O killer of all sins, I shall abide by your order. Now please let me know my place and that of the living entities born of me» (3.13.14). «O master of the demigods, please attempt to lift the earth, which is merged in the great water» (3.13.15).
- **Devahūti and Kardama** — «Svayambhuva Manu, with his wife, mounted his chariot, which was decorated with golden ornaments. Placing his daughter on it with them, he began traveling all over the earth» (3.21.36). «The moment she heard from the sage Narada of your noble character… she fixed her mind upon you» (3.22.10). «the Emperor most gladly gave his daughter to the sage, whose host of virtues was equaled by hers» (3.22.22).
- **A saintly king** — «Thus Svayambhuva Manu was a saintly king. Although absorbed in material happiness, he was not dragged to the lowest grade of life, for he always enjoyed his material happiness in a Krsna conscious atmosphere» (3.22.34).
- **Dhruva** — to his grandson, attacking the Yakṣas: «My dear son, please stop. It is not good to become unnecessarily angry it is the path to hellish life» (4.11.7).
- **The forest** — «Svayambhuva Manu, the husband of Satarupa, was by nature not at all attached to enjoyment of the senses. Thus he gave up his kingdom of sense enjoyment and entered the forest with his wife to practice austerities» (8.1.7); «he stood on one leg on the bank of the River Sunanda» for a hundred years (8.1.8). When the Rākṣasas and asuras ran to devour him, the Lord, «appearing as Yajnapati… killed the demons and Raksasas» (8.1.17–18).

## Sources

${SRC} Canto 3, chapters 12–13 and 21–22; Canto 4, chapter 11; Canto 8, chapter 1.`,
    ["ROOT|Mahāviṣṇu>Brahmā>Svāyambhuva Manu", "V|Svāyambhuva Manu"],
  ],
  [
    "Kardama Muni",
    "Kardama",
    "Bindu-sarovara (on the Sarasvatī)",
    `Son of Lord Brahmā, one of the Prajāpatis. After ten thousand years of austerity on the Sarasvatī he saw the Lord, whose tears made Bindu-sarovara; he married Devahūti, daughter of Svāyambhuva Manu, had nine daughters (wives of the nine great sages) and a son, Lord Kapila, and then took sannyāsa and attained the Lord (SB 3.21–3.24). ${SEE("the trees of Brahmā and of Kardama")}`,
    `## In short

Kardama Muni, ordered by Lord Brahmā to beget children, performed austerities for ten thousand years on the bank of the Sarasvatī and saw the Lord on Garuḍa; the Lord's tears of compassion fell there and became Bindu-sarovara. The Lord promised him Devahūti, daughter of Svāyambhuva Manu, and that He Himself would be born as his son. Kardama accepted Devahūti on condition that he would afterwards take up the renounced life; by his yogic power he created an aerial mansion and travelled with her, and they had nine daughters, whom he gave to Marīci, Atri and the other sages. When Lord Kapila was born as his son, Kardama took sannyāsa, wandered in silence and attained the Lord (SB 3.21–3.24).

## In the book

- **The austerity** — «Commanded by Lord Brahma to beget children in the worlds, the worshipful Kardama Muni practiced penance on the bank of the River Sarasvati for a period of ten thousand years» (3.21.6). «Kardama Muni saw the Supreme Personality of Godhead, who is free from material contamination, in His eternal form, effulgent like the sun» (3.21.9). «O supreme worshipful Lord, my power of sight is now fulfilled» (3.21.13).
- **Bindu-sarovara** — «It was called Bindu sarovara because drops of tears had fallen there from the eyes of the Lord» (3.21.38–39). The Lord promised: «I shall manifest My own plenary portion through your wife, Devahuti, along with your nine daughters» (3.21.32).
- **The marriage** — «I shall accept this chaste girl as my wife, on the condition that after she bears semen from my body, I shall accept the life of devotional service accepted by the most perfect human beings» (3.22.19).
- **The aerial mansion** — «seeking to please his beloved wife, the sage Kardama exercised his yogic power and instantly produced an aerial mansion that could travel at his will» (3.23.12). «Though seemingly attached to his beloved consort while served by the Gandharva girls, the sage did not lose his glory, which was mastery over his self» (3.23.38).
- **His daughters** — «Kardama Muni handed over his daughter Kala to Marici, and another daughter, Anasuya, to Atri. He delivered Sraddha to Angira, and Havirbhu to Pulastya. He delivered Gati to Pulaha, the chaste Kriya to Kratu, Khyati to Bhrgu, and Arundhati to Vasistha» (3.24.22–23).
- **Lord Kapila** — «the Supreme Personality of Godhead, Madhusudana… having entered the semen of Kardama, appeared in Devahuti just as fire comes from wood in a sacrifice» (3.24.6). Kardama: «You, my dear Lord, who are always increasing the honor of Your devotees, have descended in my home just to fulfill Your word» (3.24.30).
- **Sannyāsa** — «he circumambulated Him, and with a good, pacified mind he at once left for the forest» (3.24.41). «The sage Kardama accepted silence as a vow in order to think of the Supreme Personality of Godhead and take shelter of Him exclusively» (3.24.42). «Freed from all hatred and desire, Kardama Muni, being equal to everyone because of discharging uncontaminated devotional service, ultimately attained the path back to Godhead» (3.24.47).

## Sources

${SRC} Canto 3, chapters 21–24.`,
    ["ROOT|Mahāviṣṇu>Brahmā>Kardama", "M|Kardama"],
  ],
  [
    "Devahūti",
    "",
    "Bindu-sarovara; Siddhapada",
    `Daughter of Svāyambhuva Manu and Śatarūpā, wife of Kardama Muni, mother of nine daughters and of Lord Kapila, who taught her the Sāṅkhya philosophy of devotion (SB 3.25–3.32). She attained perfection at the place called Siddhapada, and her body became a sacred river (SB 3.21–3.24, 3.33). ${SEE("the trees of Kardama and of Svāyambhuva Manu")}`,
    `## In short

Devahūti, daughter of Svāyambhuva Manu, fixed her mind on Kardama Muni when she heard of him from Nārada, and her parents brought her to his hermitage at Bindu-sarovara. She served her husband with great love until she became emaciated; Kardama, pleased, created an aerial mansion, restored her beauty in the lake and travelled with her for many years. After the birth of their nine daughters she lamented that she had not sought liberation in his company; Kardama told her that the Lord would be born as her son. Lord Kapila appeared, and when Kardama left for the forest, she questioned Kapila, who taught her devotional service. Practising His instructions in her home, she forgot her body, achieved the Lord, and the place became Siddhapada (SB 3.22–3.33).

## In the book

- **Her service** — «After the departure of her parents, the chaste woman Devahuti, who could understand the desires of her husband, served him constantly with great love, as Bhavani, the wife of Lord Siva, serves her husband» (3.23.1). «Having served him for a long time, she grew weak and emaciated due to her religious observances» (3.23.4–5).
- **Bindu-sarovara** — she dived into the lake (3.23.25), and «In a house inside the lake she saw one thousand girls, all in the prime of youth and fragrant like lotuses» (3.23.26). «Her body was completely freed from all dirt» (3.23.30).
- **Her lament** — «Devahuti gave birth to nine female children» (3.23.48). «My lord, you have fulfilled all the promises you gave me, yet because I am your surrendered soul, you should give me fearlessness too» (3.23.51). «Association for sense gratification is certainly the path of bondage. But the same type of association, performed with a saintly person, leads to the path of liberation, even if performed without knowledge» (3.23.55).
- **Lord Kapila** — Brahmā told her: «My dear daughter of Manu, the same Supreme Personality of Godhead who killed the demon Kaitabha is now within your womb» (3.24.18); «As the son of Devahuti, He will increase your fame» (3.24.19). «Lord Kapila stayed on the strand of the Bindu sarovara to please His mother, Devahuti» (3.25.5), and she asked: «I am very sick of the disturbance caused by my material senses» (3.25.7).
- **Her perfection** — «As instructed by her son, Devahuti also began to practice bhakti yoga in that very asrama» (3.33.13). «She was only sorry that her great son was separated from her» (3.33.20). «Situated in eternal trance… she forgot her material body, just as one forgets his different bodies in a dream» (3.33.27). «Devahuti soon became liberated from material bondage, and she achieved the Supreme Personality of Godhead, as Supersoul, without difficulty» (3.33.30).
- **Siddhapada** — «The place where Devahuti achieved her perfection, my dear Vidura, is understood to be a most sacred spot. It is known all over the three worlds as Siddhapada» (3.33.31). «The material elements of her body have melted into water and are now a flowing river, which is the most sacred of all rivers» (3.33.32).

## Sources

${SRC} Canto 3, chapters 12, 21–25 and 33.`,
    ["M|Kardama>=Devahūti", "V|Svāyambhuva Manu>=Śatarūpā>Devahūti"],
  ],
];

await aplicar(F, []);
