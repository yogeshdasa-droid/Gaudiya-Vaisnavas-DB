// node fichas5.mjs [puerto] [--dry]   (16-11-2026) — fase 4 del Bhāgavatam, tanda 5 (Canto 4): Dakṣa, Satī, Uttānapāda,
// Sunīti, Aṅga, Prācīnabarhi y los Pracetās (una ficha para los diez hermanos). Citas comprobadas con chk-citas.mjs.
// Satī y los Pracetās no están en «Vaṁśa» (el «Pracetas» hijo de Brahmā de allí es otro).
import { aplicar, SRC, SEE } from "./comun-sb.mjs";

const V = "V|Svāyambhuva Manu>=Śatarūpā>Uttānapāda";
const VENA = `${V}>=Sunīti>Dhruva>=Śambhū>Śiṣṭi>=Succhāyā>Ripu>=Bṛhatī>Cākṣuṣa>Puṣkariṇī (Vīraṇī)>Cākṣuṣa Manu>=Naḍvalā>Pūru>Kuru>=Ātreyī (Āgneyī)>Aṅga`;

const F = [
  [
    "Prajāpati Dakṣa",
    "Dakṣa; Prācetasa",
    "Kanakhala (Haridvāra); Aghamarṣaṇa (Vindhya)",
    `Son of Lord Brahmā, chief of the Prajāpatis, husband of Prasūti (daughter of Svāyambhuva Manu) and father of Satī. Offended because Lord Śiva did not stand for him, he cursed him and excluded him from his sacrifice; Satī gave up her body there, Vīrabhadra beheaded him, and by Śiva's mercy he lived again with a goat's head. Born again as the son of the Pracetās and Māriṣā, he offered the Haṁsa-guhya prayers, cursed Nārada, and had sixty daughters who peopled the worlds (SB 4.1–4.7, 4.30.48–49, 6.4–6.6). ${SEE("the trees of Brahmā and of Dakṣa")}`,
    `## In short

Prajāpati Dakṣa, son of Lord Brahmā, married Prasūti, daughter of Svāyambhuva Manu, and gave his daughter Satī to Lord Śiva. Puffed up as chief of the Prajāpatis, he was offended when Śiva did not rise to greet him in an assembly, insulted him and cursed him to have no share in sacrifices. At his great sacrifice Satī, uninvited, gave up her body in anger at his blasphemy; Vīrabhadra, born from Śiva's hair, beheaded him. Pacified by Brahmā, Lord Śiva let him live again with the head of the sacrificial goat; Dakṣa, cleansed of envy, prayed to Śiva, and Lord Viṣṇu appeared at the sacrifice. Because of that offence he was born again as the son of the ten Pracetās and Māriṣā; he worshipped the Lord at Aghamarṣaṇa with the Haṁsa-guhya prayers, lost his sons the Haryaśvas and Śabalāśvas to Nārada's teaching and cursed him, and then had sixty daughters, mothers of all living beings (SB 4.1–4.7, 4.30, 6.4–6.6).

## In the book

- **His marriage** — «Svayambhuva Manu handed over his daughter Prasuti to the son of Brahma named Daksa, who was also one of the progenitors of the living entities» (4.1.11).
- **The offence** — «Daksa was very much offended to see Lord Siva sitting and not showing him any respect. At that time, Daksa became greatly angry, and, his eyes glowing, he began to speak very strongly against Lord Siva» (4.2.8). «He has eyes like a monkeys, yet he has married my daughter, whose eyes are just like those of a deer cub» (4.2.12). «Daksa, in great anger, cursed Lord Siva and then left the assembly» (4.2.19). Nandīśvara answered: «within a short time he will have the face of a goat» (4.2.23).
- **The sacrifice** — «When Lord Brahma appointed Daksa the chief of all the Prajapatis… Daksa became very much puffed up» (4.3.2) and began the sacrifices vājapeya and bṛhaspati-sava (4.3.3). When Satī came, «her father neither talked with her nor welcomed her» (4.4.8), and she gave up her body (4.4.27). «It was astonishing that Daksa… was so disrespectful to his own daughter, Sati» (4.4.29).
- **Vīrabhadra** — «Virabhadra saw the wooden device in the sacrificial arena by which the animals were to have been killed. He took the opportunity of this facility to behead Daksa» (4.5.24), and threw the head into the fire (4.5.26).
- **The goat's head** — Lord Śiva: «Since the head of Daksa has already been burned to ashes, he will have the head of a goat» (4.7.3). «When Daksa saw Lord Siva… his heart, which was polluted by envy of Lord Siva, was immediately cleansed, just as the water in a lake is cleansed by autumn rains» (4.7.10). «As he remembered the ill fated death of his daughter Sati, his eyes filled with tears» (4.7.11). «I committed a great offense against you, but you are so kind that instead of withdrawing your mercy, you have done me a great favor by punishing me» (4.7.13).
- **Born again** — «From the womb of this girl, the son of Lord Brahma named Daksa took birth. Daksa had to take birth from the womb of Marisa due to his disobeying and disrespecting Lord Mahadeva [Siva]» (4.30.48). «He was called by the name Daksa, meaning "the very expert."» (4.30.39–40).
- **The Haṁsa-guhya prayers** — «Near that mountain was a very holy place named Aghamarsana. There Prajapati Daksa executed ritualistic ceremonies and satisfied the Supreme Personality of Godhead, Hari» (6.4.21); seeing the Lord, «he fell to the ground like a stick [dandavat] to offer his respects to the Lord» (6.4.40).
- **Nārada cursed** — «Prajapati Daksa begot ten thousand sons in the womb of Pancajani [Asikni]… these sons were called the Haryasvas» (6.5.1); instructed by Nārada, they and then the Śabalāśvas left the world (6.5.24, 6.5.35). «You may travel all over the universe, but I curse you to have no residence anywhere» (6.5.43). Nārada answered: «Yes, what you have said is good. I accept this curse» (6.5.44).
- **The sixty daughters** — «Prajapati Daksa, who is known as Pracetasa, begot sixty daughters in the womb of his wife Asikni» (6.6.1), given to Dharmarāja, Kaśyapa, the moon god and others (6.6.2).

## Sources

${SRC} Canto 4, chapters 1–7 and 30; Canto 6, chapters 4–6.`,
    ["ROOT|Mahāviṣṇu>Brahmā>Dakṣa", "O|Dakṣa"],
  ],
  [
    "Satī",
    "Dākṣāyaṇī; Umā; Pārvatī",
    "Kailāsa; Kanakhala",
    `Daughter of Prajāpati Dakṣa and Prasūti, wife of Lord Śiva. Against Śiva's warning she went uninvited to her father's sacrifice; seeing Śiva excluded and blasphemed, she gave up her body there by yoga, meditating on the feet of her husband. She was born again as the daughter of Menā in the Himālayas (Pārvatī) and again accepted Lord Śiva (SB 4.3–4.4, 4.7.58–59). ${SEE(null)}`,
    `## In short

Satī, the favourite daughter of Dakṣa, was the wife of Lord Śiva. Hearing the heavenly beings talk of her father's great sacrifice, she longed to see her sisters and relatives and asked Śiva to go; Śiva warned her that she would be insulted for being his wife. Torn between them, she went alone, followed by Śiva's servants. No one but her mother and sisters welcomed her, her father did not speak to her, and she saw no oblation for Śiva. Rebuking Dakṣa for his offence against Śiva, she said she would no longer keep a body received from him; sitting facing north, she meditated on the lotus feet of her husband and left her body in a fire of yoga. She was born again as the daughter of Menā in the Himālayas and again accepted Lord Śiva as her husband (SB 4.3–4.4, 4.7).

## In the book

- **The sacrifice** — «The chaste lady Sati, the daughter of Daksa, heard the heavenly denizens flying in the sky conversing about the great sacrifice being performed by her father» (4.3.5–7). «My dear Lord Siva, your father in law is now executing great sacrifices, and all the demigods, having been invited by him, are going there. If you desire, we may also go» (4.3.8). «You have accepted me as half of your body; therefore please show kindness towards me and accept my request» (4.3.14).
- **Śiva's warning** — «My dear white complexioned wife, it is clear that of the many daughters of Daksa you are the pet, yet you will not be honored at his house because of your being my wife» (4.3.20). «If in spite of this instruction you decide to go, neglecting my words, the future will not be good for you» (4.3.25).
- **She goes** — «Sati felt very sorry at being forbidden to go see her relatives at her fathers house, and due to affection for them, tears fell from her eyes» (4.4.2). «Thereafter Sati left her husband, Lord Siva, who had given her half his body due to affection» (4.4.3).
- **At her father's house** — «No one welcomed her but her mother and sisters» (4.4.7); «her father neither talked with her nor welcomed her by asking about her welfare» (4.4.8). «Sati saw that there were no oblations for her husband, Lord Siva» (4.4.9).
- **Her words** — «My dear father, you are committing the greatest offense by envying Lord Siva, whose very name, consisting of two syllables, si and va, purifies one of all sinful activities» (4.4.14). «Therefore I shall no longer bear this unworthy body, which has been received from you, who have blasphemed Lord Siva» (4.4.18). «When Lord Siva addresses me as Daksayani I at once become morose» (4.4.23).
- **Leaving her body** — «Sati sat down on the ground and faced north. Dressed in saffron garments, she sanctified herself with water and closed her eyes» (4.4.24). «Sati concentrated all her meditation on the holy lotus feet of her husband, Lord Siva, who is the supreme spiritual master of all the world. Thus she became completely cleansed of all taints of sin and quit her body in a blazing fire by meditation on the fiery elements» (4.4.27). «There was a tumultuous roar all over the universe» (4.4.28).
- **Born again** — «after giving up the body she had received from Daksa, Daksayani (his daughter) took her birth in the kingdom of the Himalayas. She was born as the daughter of Mena» (4.7.58). «Ambika [goddess Durga], who was known as Daksayini [Sati], again accepted Lord Siva as her husband» (4.7.59).

## Sources

${SRC} Canto 4, chapters 3, 4 and 7.`,
    [],
  ],
  [
    "Mahārāja Uttānapāda",
    "Uttānapāda",
    "",
    `Son of Svāyambhuva Manu and Śatarūpā, brother of Priyavrata; husband of Sunīti and Suruci, father of Dhruva and Uttama. Attached to Suruci, he did not take Dhruva on his lap; later repentant, he welcomed Dhruva home in a great procession, made him emperor and retired to the forest (SB 4.8–4.9). ${SEE("the tree of Svāyambhuva Manu")}`,
    `## In short

Mahārāja Uttānapāda, son of Svāyambhuva Manu, had two queens: Sunīti, mother of Dhruva, and his favourite Suruci, mother of Uttama. When he did not welcome Dhruva on his lap and kept silent at Suruci's harsh words, the boy went to the forest. Uttānapāda then repented bitterly, and Nārada consoled him, foretelling his son's glory. When Dhruva returned after seeing the Lord, the King went out to meet him with a great procession, embraced him with tears, and in time enthroned him as emperor and retired to the forest (SB 4.8–4.9).

## In the book

- **His family** — «The two great sons of Svayambhuva Manu Priyavrata and Uttanapada ruled the world, consisting of seven islands, just according to religious principles» (3.21.2). «King Uttanapada had two queens, named Suniti and Suruci. Suruci was much more dear to the King» (4.8.8).
- **Dhruva refused** — «King Uttanapada was patting the son of Suruci, Uttama, placing him on his lap. Dhruva Maharaja was also trying to get on the Kings lap, but the King did not very much welcome him» (4.8.9).
- **His regret** — to Nārada: «I am very much addicted to my wife, and I am so fallen that I have abandoned all merciful behavior, even to my son, who is only five years old» (4.8.65). «Alas, just see how I was conquered by my wife! Just imagine my cruelty!» (4.8.67). Nārada: «He is well protected by the Supreme Personality of Godhead» (4.8.68).
- **Dhruva's return** — «When King Uttanapada heard that his son Dhruva was coming back home, as if coming back to life after death, he could not put his faith in this message» (4.9.37). «Reunion with Dhruva Maharaja fulfilled King Uttanapadas long cherished desire, and for this reason he smelled Dhruvas head again and again and bathed him with torrents of very cold tears» (4.9.44).
- **Retirement** — «he enthroned Dhruva as emperor of this planet» (4.9.66). «After considering his advanced age and deliberating on the welfare of his spiritual self, King Uttanapada detached himself from worldly affairs and entered the forest» (4.9.67).

## Sources

${SRC} Canto 3, chapter 21; Canto 4, chapters 8–9.`,
    [V],
  ],
  [
    "Sunīti",
    "",
    "",
    `Queen of King Uttānapāda, neglected in favour of Suruci; mother of Dhruva Mahārāja. When Dhruva came to her weeping, she told him to take shelter of the Lord, the only one who could remove his distress. She went to the spiritual world before him, in another airplane (SB 4.8.15–23, 4.9.49–50, 4.12.32–33). ${SEE("the tree of Svāyambhuva Manu, as wife of Uttānapāda")}`,
    `## In short

Sunīti, the less favoured queen of Uttānapāda, was the mother of Dhruva. When he came to her trembling with anger at Suruci's words, she took him on her lap and, weeping, told him not to wish evil to others and to worship the lotus feet of the Lord, as Brahmā and Svāyambhuva Manu had done, for only the Lord could relieve him. When Dhruva returned victorious she embraced him with tears and milk flowing from her breasts. At the end, as Dhruva was leaving for the spiritual world and remembered her, he was shown that she was going ahead of him (SB 4.8–4.12).

## In the book

- **Her grief** — «When Dhruva Maharaja reached his mother, his lips were trembling in anger, and he was crying very grievously. Queen Suniti immediately lifted her son onto her lap» (4.8.15). «She began to burn as if in a forest fire, and in her grief she became just like a burnt leaf and so lamented» (4.8.16).
- **Her instruction** — «My dear son, dont wish for anything inauspicious for others. Anyone who inflicts pains upon others suffers himself from that pain» (4.8.17). «The King, your father, does not consider me his wife or even his maidservant» (4.8.18). «My dear boy, you also should take shelter of the Supreme Personality of Godhead, who is very kind to His devotees» (4.8.22). «I do not find anyone who can mitigate your distress but the Supreme Personality of Godhead, whose eyes are like lotus petals» (4.8.23).
- **Dhruva's return** — «Suniti, the real mother of Dhruva Maharaja, embraced the tender body of her son, who was dearer to her than her own life, and thus forgot all material grief» (4.9.49). «Suniti was the mother of a great hero. Her tears, together with the milk flowing from her breasts, wet the whole body of Dhruva Maharaja» (4.9.50).
- **The end** — Dhruva «remembered his poor mother, Suniti. He thought to himself, "How shall I go alone to the Vaikuntha planet and leave behind my poor mother?"» (4.12.32). «The great associates of Vaikunthaloka, Nanda and Sunanda… showed him that his mother, Suniti, was going forward in another plane» (4.12.33).

## Sources

${SRC} Canto 4, chapters 8, 9 and 12.`,
    [`${V}>=Sunīti`],
  ],
  [
    "King Aṅga",
    "Aṅga",
    "",
    `A saintly king of the line of Dhruva, son of Ulmuka; husband of Sunīthā and father of Vena. At his sacrifice the demigods did not come because he had no son; the priests worshipped Lord Viṣṇu and Vena was born. Unable to reform his cruel son, Aṅga left the kingdom secretly at night and went to the forest (SB 4.13). ${SEE("the tree of Svāyambhuva Manu")}`,
    `## In short

King Aṅga, of the dynasty of Dhruva Mahārāja, was gentle, saintly and a lover of brahminical culture. At his horse sacrifice the demigods did not accept the oblations, because he had no son; the priests offered oblations to Lord Viṣṇu, a person appeared from the fire with a pot of sweet rice, and his wife Sunīthā, eating it, bore Vena. The boy grew up cruel, killing innocent deer; Aṅga could not reform him, thought that a bad son at least makes one detached, and one night left his sleeping wife and his kingdom and went to the forest (SB 4.13).

## In the book

- **His family** — «Ulmuka begot six sons in his wife Puskarini… Anga, Sumana, Khyati, Kratu, Angira and Gaya» (4.13.17). «The wife of Anga, Sunitha, gave birth to a son named Vena, who was very crooked» (4.13.18). Vidura: «King Anga was very gentle. He had high character and was a saintly personality and lover of brahminical culture» (4.13.21).
- **The sacrifice** — «once the great King Anga arranged to perform the great sacrifice known as asvamedha… no demigods participated or appeared in that sacrifice» (4.13.25). «Thus for the sake of a son for King Anga, they decided to offer oblations to Lord Visnu» (4.13.35). «A person appeared from the fire altar wearing a golden garland and a white dress. He was carrying a golden pot filled with rice boiled in milk» (4.13.36); «he took the preparation in his joined palms, and after smelling it he offered a portion to his wife» (4.13.37).
- **Vena** — «King Anga punished him in different ways to reform him, but was unable to bring him to the path of gentleness. He thus became greatly aggrieved» (4.13.42). «A bad son is better than a good son because a good son creates an attachment for home, whereas a bad son does not» (4.13.46).
- **Leaving home** — «Once, therefore, in the dead of night, he got up from bed and left Venas mother [his wife], who was sleeping deeply. He gave up all attraction for his greatly opulent kingdom, and, unseen by anyone, he very silently gave up his home and opulence and proceeded towards the forest» (4.13.47). The citizens «began to search for him all over the world» (4.13.48).

## Sources

${SRC} Canto 4, chapter 13.`,
    [VENA],
  ],
  [
    "Mahārāja Prācīnabarhi",
    "Prācīnabarhiṣat; Barhiṣat",
    "Kapilāśrama",
    `Son of Havirdhāna, of the line of Pṛthu Mahārāja; called Prācīnabarhi because his sacrifices covered the earth with kuśa grass pointing east. Husband of Śatadruti, daughter of the ocean, and father of the ten Pracetās. Nārada Muni showed him the animals he had killed waiting for him and told him the allegory of King Purañjana; he then retired to Kapilāśrama and was liberated (SB 4.24–4.29). (In «Vaṁśa» his wife is Savarṇā.) ${SEE("the tree of Svāyambhuva Manu")}`,
    `## In short

Mahārāja Barhiṣat, son of Havirdhāna, was expert in fruitive sacrifices and mystic yoga; he performed sacrifices all over the world with the tips of the kuśa grass pointing east, and so was called Prācīnabarhi. By Brahmā's order he married Śatadruti, daughter of the ocean, and begot the ten Pracetās. While his sons performed austerities in the ocean, he went on with animal sacrifices; Nārada Muni, out of compassion, showed him the animals in the sky waiting to pierce him with iron horns, and told him the allegory of King Purañjana — the soul in the city of the body. The King left his sons to protect the citizens, went to Kapilāśrama, and engaged in the Lord's loving service (SB 4.24–4.29).

## In the book

- **His name** — «Havirdhanas very powerful son named Barhisat was very expert in performing various kinds of fruitive sacrifices, and he was also expert in the practice of mystic yoga» (4.24.9). «He scattered kusa grasses and kept the tops of the grasses pointed eastward» (4.24.10).
- **Marriage and sons** — «Maharaja Barhisat henceforward known as Pracinabarhi was ordered by the supreme demigod Lord Brahma to marry the daughter of the ocean named Satadruti» (4.24.11). «King Pracinabarhi begot ten children in the womb of Satadruti… all of them were known as the Pracetas» (4.24.13).
- **Nārada** — «the great saint Narada, master and teacher of all spiritual life, became very compassionate upon the King» (4.25.3). The King: «my intelligence is entangled in fruitive activities; therefore I do not know the ultimate goal of life» (4.25.5). Nārada: «please see in the sky those animals which you have sacrificed without compassion and without mercy in the sacrificial arena» (4.25.7); «After you die, they will angrily pierce your body with iron horns» (4.25.8).
- **Purañjana** — «once in the past lived a king named Puranjana, who was celebrated for his great activities. He had a friend named Avijnata ["the unknown one"]» (4.25.10). «If one can understand the purpose of this allegory, he will certainly be relieved from the bodily conception» (4.29.85).
- **Kapilāśrama** — «the saintly King Pracinabarhi left orders for his sons to protect the citizens. He then left home and went off to undergo austerities in a holy place known as Kapilasrama» (4.29.81). «King Pracinabarhi attained full liberation from all material designations. He constantly engaged in the transcendental loving service of the Lord» (4.29.82).

## Sources

${SRC} Canto 4, chapters 24–25 and 29.`,
    [`${VENA}>=Sunīthā>Vena>Pṛthu>Antardhāna>=Śikhaṇḍinī>Havirdhāna>=Dhiṣaṇā>Prācīnabarhis`],
  ],
  [
    "The Pracetās",
    "Pracetās; the ten sons of Prācīnabarhi",
    "the ocean; the western seashore (āśrama of Jājali)",
    `The ten sons of King Prācīnabarhi and Śatadruti. Instructed by Lord Śiva (the Rudra-gīta), they worshipped the Lord for ten thousand years in the ocean and saw Him; they burnt the trees that covered the earth, married Māriṣā, daughter of the trees, and begot Dakṣa (born again). Heard Nārada at the end and attained the Lord (SB 4.24, 4.30–4.31). ${SEE(null)}`,
    `## In short

The Pracetās, ten brothers equally religious, were ordered by their father Prācīnabarhi to beget children. On their way to perform austerities they met Lord Śiva, who instructed them; they then stood in the ocean for ten thousand years chanting his prayers and satisfied Lord Viṣṇu, who appeared before them. Coming out of the water, they found the earth covered by tall trees and burnt them with fire and air from their mouths, until Brahmā pacified them and the trees gave them their daughter Māriṣā, born of the sage Kaṇḍu and the Apsarā Pramlocā; from her was born Dakṣa. After thousands of years at home they left their wife with their son, went to the western sea near the sage Jājali, heard Nārada describe the glories of the Lord and attained the ultimate destination (SB 4.24, 4.30–4.31).

## In the book

- **Their birth** — «King Pracinabarhi begot ten children in the womb of Satadruti. All of them were equally endowed with religiosity, and all of them were known as the Pracetas» (4.24.13).
- **Lord Śiva** — «When all the sons of Pracinabarhi left home to execute austerities, they met Lord Siva, who, out of great mercy, instructed them about the Absolute Truth» (4.24.15). «Lord Siva became very pleased with the Pracetas because generally Lord Siva is the protector of pious persons and persons of gentle behavior» (4.24.26).
- **In the ocean** — «By chanting and repeating the mantras given by Lord Siva, they were able to satisfy Lord Visnu» (4.30.3). «At the end of ten thousand years of severe austerities performed by the Pracetas, the Supreme Personality of Godhead… appeared before them in His very pleasing form» (4.30.4). Their prayer: «when we have approached Your lotus feet and taken shelter of them, what further benediction may we ask of You?» (4.30.32).
- **The trees and Māriṣā** — «They then saw that all the trees on land had grown very tall… At this time the Pracetas became very angry» (4.30.44), and «emitted fire and air from their mouths» (4.30.45). «The remaining trees, being very much afraid of the Pracetas, immediately delivered their daughter at the advice of Lord Brahma» (4.30.47). «Following the order of Lord Brahma, all the Pracetas accepted the girl as their wife. From the womb of this girl, the son of Lord Brahma named Daksa took birth» (4.30.48).
- **The end** — «At last they remembered the blessings of the Supreme Personality of Godhead and left home» (4.31.1); «The Pracetas went to the seashore in the west where the great liberated sage Jajali was residing» (4.31.2). «Hearing from Naradas mouth the glories of the Lord… the Pracetas also became attached to the Supreme Personality of Godhead. Meditating on His lotus feet, they advanced to the ultimate destination» (4.31.24).

## Sources

${SRC} Canto 4, chapters 24, 30 and 31.`,
    [],
  ],
];

const DISTINCT = [["Prajāpati Dakṣa", 171, "Dakṣa"]];

await aplicar(F, DISTINCT);
