// node fichas10.mjs [puerto] [--dry]   (16-11-2026) — fase 4 del Bhāgavatam, tanda 10 (Canto 10, la familia de Kṛṣṇa):
// Vasudeva (#2192, ya existía: solo el texto), Devakī (nueva; ≠ #201 Devakī, hija de Rasikānanda), Nanda Mahārāja (#2197) y
// Yaśodā (#2202) (ya existían: solo el texto), Kaṁsa, Ugrasena. Citas comprobadas con chk-citas.mjs.
// aplicar() busca por el nombre EXACTO: los que ya existen reciben el texto y no cambian sus notas ni etiquetas.
import { aplicar, SRC, SEE } from "./comun-sb.mjs";

const H = "H|Yadu>Ripu>Mahāhaya>Veṇuhaya>Hehaya [Ekavīra]>Dharma>Kuṇi>Sadājit>Māhiṣmān>Bhadrasena>Durdama>Dhanaka>Kṛtavīra>Kārttavīryārjuna>Ūrjita>Vṛṣṇi>Sudhājit>Śini>Satyaka>Sātyaki (Yuyudhāna)>Jaya>Kuṇi>Anamitra>Pṛśni>Citraratha>Vidūratha>Śūra>Śini>Bhoja>Hṛdika>Śūra>=Māriṣā>Vasudeva";

const F = [
  [
    "Vasudeva (father of Balarāma and Kṛṣṇa)",
    "",
    "",
    "",
    `## In short

Vasudeva, son of King Śūra, married Devakī, the daughter of Devaka. On their wedding day a voice from the sky told Kaṁsa, Devakī's cousin, who was driving their chariot, that her eighth child would kill him; Kaṁsa seized her by the hair to kill her, and Vasudeva saved her by promising to hand over every son. Imprisoned by Kaṁsa, he saw the Lord appear in the prison with four arms; by the Lord's order, the doors opened, he carried the child across the Yamunā to Gokula, left Him on Yaśodā's bed and brought back her daughter, Yogamāyā. He and Devakī had been Sutapā and Pṛśni, and Kaśyapa and Aditi, and the Lord was their son three times. Freed by Kṛṣṇa after Kaṁsa's death, he lived in Dvārakā; at Kurukṣetra he asked the sages about his welfare and performed great sacrifices (SB 10.1–10.5, 10.44–10.45, 10.84–10.85).

## In the book

- **The marriage** — «Vasudeva, who belonged to the demigod family [or to the Sura dynasty], married Devaki. After the marriage, he mounted his chariot to return home with his newly married wife» (10.1.29). «How could such a qualified person as you kill a woman, your own sister, especially on the occasion of her marriage?» (10.1.37).
- **The promise** — «By delivering all my sons to Kamsa, who is death personified, I shall save the life of Devaki» (10.1.49–50). «Vasudeva was very much disturbed by fear of becoming a liar by breaking his promise. Thus with great pain he delivered his first born son, named Kirtiman, into the hands of Kamsa» (10.1.57).
- **The prison** — «Fearing his death, Kamsa arrested Vasudeva and Devaki and chained them with iron shackles» (10.1.65–66). «Vasudeva then saw the newborn child, who had very wonderful lotuslike eyes and who bore in His four hands the four weapons sankha, cakra, gada and padma» (10.3.9–10).
- **Their previous births** — «In the next millennium, I again appeared from the two of you, who appeared as My mother, Aditi, and My father, Kasyapa» (10.3.42). «I, the same personality, have now appeared of you both as your son for the third time» (10.3.43).
- **To Gokula** — «when Vasudeva appeared, the closed doors, which were strongly pinned with iron and locked with iron chains, opened automatically» (10.3.48–49). «The River Yamuna gave way to Vasudeva and allowed him to cross» (10.3.50). «He placed his own son on the bed of Yasoda, picked up her daughter, an expansion of Yogamaya, and then returned to his residence, the prison house of Kamsa» (10.3.51).
- **Nanda his friend** — «When Vasudeva heard that Nanda Maharaja, his very dear friend and brother, had come to Mathura… he went to Nanda Maharajas residence» (10.5.20).
- **Freed** — «Krsna and Balarama released Their mother and father from bondage and offered obeisances to them, touching their feet with Their heads» (10.44.50).
- **At Kurukṣetra** — «Kindly tell us how the reactions of ones work can be counteracted by further work» (10.84.29). The sages: «Both you and your wife must have perfectly worshiped Him with supreme devotion, since He has accepted the role of your son» (10.84.41). «Performing various kinds of Vedic sacrifice according to the proper regulations, Vasudeva worshiped the Lord of all sacrificial paraphernalia» (10.84.51).
- **His prayer** — «You are not our sons but the very Lords of both material nature and its creator [Maha Visnu]» (10.85.18). «Enough! Enough with hankering for sense enjoyment, which makes me identify with this mortal body and think of You, the Supreme, as my child» (10.85.19).

## Sources

${SRC} Canto 10, chapters 1–5, 44, 84–85.`,
    [H],
  ],
  [
    "Devakī (mother of Kṛṣṇa)",
    "Devakī",
    "Mathurā (Kaṁsa's prison); Dvārakā",
    `Daughter of King Devaka, cousin of Kaṁsa, wife of Vasudeva (#2192); mother of Lord Kṛṣṇa, of six sons killed by Kaṁsa and of Subhadrā. Imprisoned by Kaṁsa, she offered prayers when the Lord appeared; in a previous life she was Pṛśni, and Aditi. Later Kṛṣṇa and Balarāma brought her six dead sons back from Sutala (SB 10.1–10.4, 10.85). Not the same as #201 Devakī, daughter of Rasikānanda. ${SEE("the tree of Yadu, as wife of Vasudeva")}`,
    `## In short

Devakī, daughter of Devaka, was married to Vasudeva; as Kaṁsa drove their chariot a voice foretold that her eighth child would kill him, and he was ready to cut off her head until Vasudeva promised him her sons. In Kaṁsa's prison she bore son after son, whom Kaṁsa killed; when the Lord appeared in her womb she shone so brightly that Kaṁsa trembled. Seeing the four-armed Lord born, she prayed to Him and begged Him to hide His form from Kaṁsa. When Kaṁsa tried to kill the girl Yogamāyā, she begged for her in vain. Freed by Kṛṣṇa and Balarāma, she lived in Dvārakā; remembering her murdered sons, she asked her two sons to bring them back, and They brought the six from Sutala; seeing them come and go, she understood all as the Lord's illusion (SB 10.1–10.4, 10.44, 10.85).

## In the book

- **The wedding** — «Kamsa, the son of King Ugrasena, in order to please his sister Devaki on the occasion of her marriage, took charge of the reins of the horses» (10.1.30). «Kamsa… caught hold of his sisters hair with his left hand and took up his sword with his right hand» (10.1.35). «As your younger sister, this poor girl Devaki is like your own daughter and deserves to be affectionately maintained» (10.1.45).
- **Her children** — «Each year thereafter, in due course of time, Devaki, the mother of God and all the demigods, gave birth to a child. Thus she bore eight sons, one after another, and a daughter named Subhadra» (10.1.56).
- **The Lord in her womb** — «Because the Supreme Personality of Godhead was within her womb, Devaki illuminated the entire atmosphere in the place where she was confined» (10.2.20).
- **Her prayers** — «having seen that her child had all the symptoms of the Supreme Personality of Godhead, Devaki, who was very much afraid of Kamsa and unusually astonished, began to offer prayers to the Lord» (10.3.23). «O Madhusudana, because of Your appearance, I am becoming more and more anxious in fear of Kamsa» (10.3.29).
- **Pṛśni** — «O sinless mother Devaki, after the expiry of twelve thousand celestial years, in which you constantly contemplated Me within the core of your heart with great faith, devotion and austerity, I was very much satisfied with you» (10.3.37–38). «I appeared in this world as Prsnigarbha, or one who is celebrated as having taken birth from Prsni» (10.3.41).
- **Yogamāyā** — «Piteously embracing her daughter and crying, Devaki begged Kamsa for the child, but he was so cruel that he chastised her and forcibly snatched the child from her hands» (10.4.7). When Kaṁsa repented, «she was relieved of all anger» (10.4.25).
- **Her six sons** — «Now, thinking of her own sons who had been murdered by Kamsa, she felt great sorrow, and thus with tear filled eyes she beseeched Krsna» (10.85.27–28): «O Rama, Rama, immeasurable Supreme Soul! O Krsna, Lord of all masters of yoga!» (10.85.29). «Seeing her sons return from death and then depart again, saintly Devaki was struck with wonder, O King. She concluded that this was all simply an illusion created by Krsna» (10.85.57).

## Sources

${SRC} Canto 10, chapters 1–4, 44 and 85.`,
    [`${H}>=Devakī`],
  ],
  [
    "Nanda Mahārāja",
    "",
    "",
    "",
    `## In short

Nanda Mahārāja, king of the cowherds of Vraja, was overwhelmed with joy when Kṛṣṇa appeared as his son, and gave two million cows in charity. In his previous life he was Droṇa, the best of the Vasus, who with his wife Dharā asked Brahmā to be born on earth so that the Lord would appear and spread devotion; thus he and Yaśodā enjoyed the childhood pastimes that Vasudeva and Devakī could not. The Lord saved him from the servant of Varuṇa and from a serpent that was swallowing him; when Kṛṣṇa went to Mathurā, He sent Nanda back to Vraja with tears, and Nanda asked Uddhava whether Kṛṣṇa remembered them. At Kurukṣetra Nanda and Yaśodā embraced their sons again (SB 10.5, 10.8, 10.28, 10.34, 10.45–10.47, 10.82).

## In the book

- **The festival** — «Nanda Maharaja was naturally very magnanimous, and when Lord Sri Krsna appeared as his son, he was overwhelmed by jubilation» (10.5.1–2). «Nanda Maharaja gave two million cows, completely decorated with cloth and jewels, in charity to the brahmanas» (10.5.3).
- **Vasudeva** — «When Nanda Maharaja heard that Vasudeva had come, he was overwhelmed with love and affection, being as pleased as if his body had regained its life» (10.5.21).
- **Droṇa** — «Drona, the best of the Vasus, along with his wife, Dhara, spoke to Lord Brahma» (10.8.48). «the most fortune Drona, who was equal to Bhagavan, appeared in Vrajapura, Vrndavana, as the most famous Nanda Maharaja, and his wife, Dhara, appeared as mother Yasoda» (10.8.50). «Nanda Maharaja and Yasoda, however, enjoyed these pastimes fully, and therefore their position is always better» (10.8.47).
- **Varuṇa** — «Having worshiped Lord Janardana and fasted on the Ekadasi day, Nanda Maharaja entered the water of the Kalindi on the Dvadasi to take his bath» (10.28.1); «a demoniac servant of Varuna seized him and brought him to his master» (10.28.2). «Nanda Maharaja had been astonished to see for the first time the great opulence of Varuna… and also to see how Varuna and his servants had offered such humble respect to Krsna» (10.28.10).
- **The serpent** — «Krsna, Krsna, my dear boy! This huge serpent is swallowing me! Please save me, who am surrendered to You!» (10.34.6).
- **Sent back to Vraja** — «O Father, you and mother Yasoda have affectionately maintained Us and cared for Us so much!» (10.45.21). «Now you should all return to Vraja, dear Father» (10.45.23).
- **Uddhava** — «Does Krsna remember us? Does He remember His mother and His friends and well wishers?» (10.46.18). With the cowherds: «May our mental functions always take shelter of Krsnas lotus feet, may our words always chant His names, and may our bodies always bow down to Him and serve Him» (10.47.66).
- **Kurukṣetra** — «Raising their two sons onto their laps and holding Them in their arms, Nanda and saintly mother Yasoda forgot their sorrow» (10.82.35).

## Sources

${SRC} Canto 10, chapters 5, 8, 28, 34, 45–47 and 82.`,
    [],
  ],
  [
    "Yaśodā",
    "",
    "",
    "",
    `## In short

Mother Yaśodā, queen of Vraja and wife of Nanda Mahārāja, was Dharā, wife of the Vasu Droṇa, in her previous life. Exhausted by childbirth, she did not know what child had been born to her when Vasudeva exchanged Kṛṣṇa for her daughter. When Kṛṣṇa's friends said He had eaten earth, she looked into His mouth and saw the whole universe; she surrendered to the Lord, but by Yogamāyā returned at once to her maternal love. Churning yogurt and singing of His pastimes, she was left by Him when the milk boiled over; He broke the pot and stole butter, and she tried to bind Him, but every rope was two fingers short, until He saw her fatigue and let Himself be bound. Even Brahmā, Śiva and Lakṣmī cannot receive such mercy. When Uddhava spoke of her son, she wept and milk flowed from her breasts; at Kurukṣetra she embraced Him again (SB 10.3, 10.8–10.9, 10.46, 10.82).

## In the book

- **His birth** — «Exhausted by the labor of childbirth, Yasoda was overwhelmed with sleep and unable to understand what kind of child had been born to her» (10.3.53).
- **The universe in His mouth** — «"Mother," they submitted, "Krsna has eaten earth."» (10.8.32). «When Krsna opened His mouth wide by the order of mother Yasoda, she saw within His mouth all moving and nonmoving entities, outer space, and all directions» (10.8.37–39). «Is this a dream, or is it an illusory creation by the external energy?» (10.8.40). «Mother Yasoda, by the grace of the Lord, could understand the real truth. But then again, the supreme master, by the influence of the internal potency, yogamaya, inspired her to become absorbed in intense maternal affection for her son» (10.8.43).
- **Dharā** — «his wife, Dhara, appeared as mother Yasoda» (10.8.50). «When the Supreme Personality of Godhead became the son of Nanda Maharaja and Yasoda, they maintained continuous, unswerving devotional love in parental affection» (10.8.51).
- **Churning** — «One day when mother Yasoda saw that all the maidservants were engaged in other household affairs, she personally began to churn the yogurt. While churning, she remembered the childish activities of Krsna, and in her own way she composed songs and enjoyed singing to herself» (10.9.1–2).
- **Binding Kṛṣṇa** — «she saw that the binding rope was short by a distance the width of two fingers» (10.9.15). «When child Krsna saw His mother thus fatigued, He became merciful to her and agreed to be bound» (10.9.18). «Neither Lord Brahma, nor Lord Siva, nor even the goddess of fortune… can obtain from the Supreme Personality of Godhead… such mercy as received by mother Yasoda» (10.9.20).
- **Uddhava** — «As mother Yasoda heard the descriptions of her sons activities, she poured out her tears, and milk flowed from her breasts out of love» (10.46.28).
- **Kurukṣetra** — «Rohini and Devaki both embraced the Queen of Vraja, remembering the faithful friendship she had shown them» (10.82.36).

## Sources

${SRC} Canto 10, chapters 3, 8–9, 46 and 82.`,
    [],
  ],
  [
    "Kaṁsa",
    "",
    "Mathurā",
    `Son of King Ugrasena of the Bhoja dynasty, cousin of Devakī; in his previous life the demon Kālanemi. Told that Devakī's eighth child would kill him, he imprisoned Vasudeva and Devakī, killed their sons, imprisoned his own father and ruled Śūrasena under the protection of Jarāsandha, sending demons to kill Kṛṣṇa in Vraja. Always thinking of the Lord in fear, he was killed by Kṛṣṇa in the wrestling arena of Mathurā and attained a form like the Lord's (SB 10.1–10.4, 10.36, 10.44). ${SEE(null)}`,
    `## In short

Kaṁsa, son of Ugrasena and formerly the demon Kālanemi, drove the chariot at the wedding of his cousin Devakī; when a voice said her eighth child would kill him, he wanted to kill her, and spared her only for Vasudeva's promise of her sons. Warned by Nārada that the Lord would appear in the Yadu dynasty, he imprisoned Vasudeva and Devakī and killed their children, imprisoned his father Ugrasena, and with Jarāsandha's help persecuted the Yadus. When the girl Yogamāyā escaped his hands and told him his killer was born elsewhere, he briefly repented, then sent demons — Pūtanā, Keśī and many others — to kill the child. Day and night he saw only the Lord, his enemy. Finally he had Kṛṣṇa and Balarāma brought to Mathurā for a wrestling match; Kṛṣṇa jumped onto his dais, threw him down and killed him. Because he always thought of the Lord, he attained a form like His (SB 10.1–10.4, 10.36, 10.44).

## In the book

- **The voice** — «You foolish rascal, the eighth child of the woman you are carrying will kill you!» (10.1.34). «Kamsa was a condemned personality in the Bhoja dynasty because he was envious and sinful» (10.1.35).
- **Kālanemi** — «In his previous birth, Kamsa had been a great demon named Kalanemi and been killed by Visnu. Upon learning this information from Narada, Kamsa became envious of everyone connected with the Yadu dynasty» (10.1.68). «Kamsa, the most powerful son of Ugrasena, even imprisoned his own father» (10.1.69).
- **His allies** — «Under the protection of Magadharaja, Jarasandha, the powerful Kamsa began persecuting the kings of the Yadu dynasty» (10.2.1–2).
- **Yogamāyā** — he «grasped the newborn child by the legs and tried to dash her against the surface of a stone» (10.4.8). «O Kamsa, you fool, what will be the use of killing me? The Supreme Personality of Godhead… has already taken His birth somewhere else» (10.4.12). «Alas, my sister! Alas, my brother in law! I am indeed so sinful» (10.4.15).
- **Always thinking of Him** — «while situated anywhere, and while eating, sleeping or walking, Kamsa saw only his enemy, the Supreme Lord, Hrsikesa» (10.2.24). «King Kamsa summoned Kesi and ordered him, "Go kill Rama and Krsna."» (10.36.20).
- **His death** — «Kill that most evil fool Vasudeva! And also kill my father, Ugrasena» (10.44.33). «Grabbing Kamsa by the hair and knocking off his crown, the lotus naveled Lord threw him off the elevated dais onto the wrestling mat» (10.44.37). «The King had always seen the Lord before him with the disc weapon in His hand. Thus Kamsa achieved the rare boon of attaining a form like the Lords» (10.44.39).

## Sources

${SRC} Canto 10, chapters 1–4, 36 and 44.`,
    [],
  ],
  [
    "Mahārāja Ugrasena",
    "Ugrasena",
    "Mathurā; Dvārakā",
    `King of the Yadu, Bhoja and Andhaka dynasties, father of Kaṁsa, who imprisoned him; maternal grandfather of Lord Kṛṣṇa. After killing Kaṁsa, Kṛṣṇa installed him again as King of the Yadus, serving him as his attendant (SB 10.1.69, 10.45.12–14). ${SEE(null)}`,
    `## In short

Ugrasena, King of the Yadu, Bhoja and Andhaka dynasties, was imprisoned by his own son Kaṁsa, who took the kingdom of Śūrasena. When Kṛṣṇa had killed Kaṁsa — who in his last rage ordered Ugrasena killed too — the Lord installed His maternal grandfather Ugrasena as King of the Yadus, saying that by Yayāti's curse no Yadu could sit on the throne, and that He Himself would serve him, so that even the demigods would bring him tribute (SB 10.1, 10.44–10.45).

## In the book

- **Imprisoned** — «Kamsa, the most powerful son of Ugrasena, even imprisoned his own father, the King of the Yadu, Bhoja and Andhaka dynasties, and personally ruled the states known as Surasena» (10.1.69).
- **Kaṁsa's order** — «Kill that most evil fool Vasudeva! And also kill my father, Ugrasena, along with his followers, who have all sided with our enemies!» (10.44.33).
- **King again** — «the Supreme Personality of Godhead, appearing as the son of Devaki, installed His maternal grandfather, Ugrasena, as King of the Yadus» (10.45.12). «O mighty King, We are your subjects, so please command Us. Indeed, because of the curse of Yayati, no Yadu may sit on the royal throne» (10.45.13). «Since I am present in your entourage as your personal attendant, all the demigods and other exalted personalities will come with heads bowed to offer you tribute» (10.45.14).

## Sources

${SRC} Canto 10, chapters 1, 44 and 45.`,
    [],
  ],
];

await aplicar(F, [["Devakī (mother of Kṛṣṇa)", 201, "Devakī"]]);
