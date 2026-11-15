// node vraja1.mjs → vraja1.json («Vraja-Nitya-līlā», prueba 1: 5 fichas, 15-11-2026).
// Texts from the Ujjvala-nīlamaṇi-kiraṇa (Viśvanātha Cakravartī, trad. Bhaktivedānta Nārāyaṇa Gosvāmī, GVP 2013) and the
// Gopāla-campū of Jīva Gosvāmī (Pūrva = vol. 1, Uttara = vol. 2). Whisper: «esos dos mandan sobre todo».
// Places: herramientas/gc.mjs <1|2|u> <regex> (Pūrva/Uttara chapter + verse ‖N, Ujjvala page).
// Nothing in these five contradicts their Gaṇoddeśa text (checked).
import fs from "node:fs";
const UNK = "Ujjvala-nīlamaṇi-kiraṇa";
const GC = "Gopāla-campū";

const plan = [
  {
    id: 1513,
    name: "Śrī Svarūpa Dāmodara Gosvāmī",
    text: `## In the Vraja-nitya-līlā

**Śrī Viśākhā**, of Śrī Rādhā's own party (*sva-pakṣa*), one of Her eight dearest sakhīs (*parama-preṣṭha-sakhīs*), «equal to Śrīmatī Rādhikā in age, qualities and bodily features».

## ${UNK} — her nature

> śrī-rādhāyāḥ sva-pakṣāḥ lalitā-viśākhādiḥ …
> viśākhā vāmā madhyā tārāvali-vasanā … sarvā eva gaura-varṇāḥ (Nāyikā-svabhāva, text 3)

«In relation to Śrīmatī Rādhikā, Lalitā and Viśākhā are sva-pakṣa, meaning they are in Her group.» «Śrī Viśākhā-devī is vāmā and madhyā and wears a star-studded dress. She is equal to Śrīmatī Rādhikā in age, qualities and bodily features.» «All of these nāyikās possess golden complexions.»

- *Vāmā* (left-wing): «always eager to accept honour and angered when there is any laxity in this regard»; *madhyā*: «neither excessively harsh nor extremely soft» (pp. 18–19).
- The eight sakhīs: «Even though they are group leaders in their own right, when they are near Śrīmatī Rādhikā, they abandon this conception and serve the Divine Couple, Śrī Śrī Rādhā-Kṛṣṇa» (p. 20).

## ${UNK} — the dearest sakhīs

> lalitā ca viśākhā ca citrā campaka-vallikā
> raṅgadevī sudevī ca tuṅgavidyendu-rekhikā
> yady apy etāḥ sama-snehās tathāpi śrī-rādhāyāṁ pakṣa-pātaṁ kurvanti (Sakhī-bheda, text 5)

«Among all of these sakhīs, the most prominent are the parama-preṣṭha-sakhīs. They are Lalitā, Viśākhā, Citrā, Campakalatā, Raṅgadevī, Sudevī, Tuṅgavidyā and Indulekhā. Even though these gopīs are equally affectionate (sama-sneha) to both Śrī Rādhā and Śrī Kṛṣṇa, still, they are partial toward Śrīmatī Rādhikā.»

## ${UNK} — her love

> tatrāpi mohanaḥ śrī-rādhāyām eva; lalitā-viśākhayor api | mādanas tu rādhāyām eva (Āśraya-nirṇaya, text 15)

«Mohana-mahābhāva is present in Śrīmatī Rādhikā, Lalitā and Viśākhā, but mādana-mahābhāva is only ever present in Śrī Rādhā.»

## ${GC}

- **She becomes Rādhā's sakhī** (Pūrva-campū 15, verse 53): after Paurṇamāsī consoled the young gopīs and led them secretly towards Kṛṣṇa, «From that day, Viśākhā, Lalitā and others became the sakhīs of Rādhā. Padmā, Śaibya and others became the sakhīs of Candrāvalī.»
- **In the rāsa** (Pūrva-campū 25, verse 35): «When one gopī saw Kṛṣṇa, her mind became filled with shame. She stood like a doll, with unblinking eyes and hairs standing on end. … In separation she attained him within, and at the end of great separation, she met with him continually.» — «This is Viśākhā.»
- Paurṇamāsī to Rādhā (Uttara-campū 31, verse 45): «Your father is Vṛṣabhānu. Your mother is Kīrtidā. Yaśodā is your mother-in-law. **Your friends are Lalitā and Viśākhā.**»
- **Golden in Vraja, Kālindī in Dvārakā** (Uttara-campū 35, 59–61): «Viśākhā, who is by good fortune the daughter of a cowherd in Vraja, is present in another form (daughter of the sun, like Yamunā) in Dvārakā.» Asked why she is golden in Vraja but black as Kālindī, Snigdhakaṇṭha answers that «Viśākhā who dresses Rādhā and is devoted to her» takes on that form, «just as in every kalpa she becomes the star named Viśākhā». Also Uttara-campū 17, verse 53: «Candrāvalī was Rukmiṇī. Rādhā was Satyabhāmā. **Viśākhā was Kālindī.** Lalitā was Jāmbavatī…»

## Sources

${UNK}, Nāyikā-svabhāva 3 (pp. 17–20), Sakhī-bheda 5 (pp. 23–25), Āśraya-nirṇaya 15 (pp. 45–46); ${GC}, Pūrva 15.53, 25.35; Uttara 17.53, 31.45, 35.59–61.
`,
  },
  {
    id: 1342,
    name: "Sadāśiva Kavirāja",
    text: `## In the Vraja-nitya-līlā

**Śrī Candrāvalī**, an eternally perfect gopī (*nitya-siddha*) like Śrī Rādhā, the leader of the party opposed to Hers (*vipakṣa*), gentle and submissive, dressed in blue, with Padmā and Śaibyā as her chief sakhīs.

## ${UNK} — her nature

> … pratipakṣaś candrāvalī | …
> candrāvalī dakṣiṇā mṛdvī nīla-vastrā | asyāḥ sakhī padmā dakṣiṇā prakharā | śaibyā dakṣiṇā mṛdvī | sarvā eva rakta-vastrāḥ (Nāyikā-svabhāva, text 3)

«Candrāvalī is prati-pakṣa or viruddha-pakṣa [also known as vipakṣa], meaning she is opposed to the group of Śrīmatī Rādhikā.» «Candrāvalī is dakṣiṇā and mṛdvī and wears blue. Her two chief sakhīs are Padmā and Śaibyā. Padmā is dakṣiṇā and prakharā, while Śaibyā is dakṣiṇā and mṛdvī. Both of them dress in scarlet.»

- *Dakṣiṇā* (right-wing): «behave with the hero in a straightforward manner. They are not very resolute when exhibiting a sulky mood (māna)… and they become controlled by the hero's praises»; *mṛdvī*: «use very gentle language» (pp. 18–19).
- «Among these varieties of vraja-gopīs, some are eternally perfected associates (nitya-siddha) such as Rādhā and Candrāvalī» (Nāyikā-vibhāga, p. 15).
- She is *dhīrā-pragalbhā*: «The heroines who conceal their anger and display indifference to Kṛṣṇa's embraces are called dhīrā-pragalbhā. In Vraja, Candrāvalī, Pālikā and Bhadrā are examples» (p. 12).
- Her age: «gopīs such as Candrāvalī and Padmā are in full youth (pūrṇa-yauvana)», while Śrī Rādhikā and others are in ripening youth (Vayo-bheda, pp. 25–26).

## ${UNK} — her love

- **Ghṛta-sneha**: «The feeling that ‘I belong to Kṛṣṇa' is called tadīyatā-bhāva. Such sneha is known as ghṛta-sneha. The ghṛta-sneha in Candrāvalī and others… is imbued with a mood of respect and is lovely only when mixed with other moods, just as ghee is tasty when mixed with sugar» — Śrī Rādhikā's is *madhu-sneha*, «Śrī Kṛṣṇa is mine» (Rati-bheda, pp. 38–39).
- «Rarely do we see the rise of an unsubmissive mood (vāmya-bhāva) in heroines who possess ghṛta-sneha, due to their very soft and simple nature» (p. 40).
- **Nīlī-rāga**: «That rāga which is impossible to weaken, which does not shine excessively on the outside and which conceals other concomitant bhāvas is called nīlī-rāga. This nīlī-rāga is present in Candrāvalī and her followers» (p. 40).
- In Dvārakā: «rukmiṇī tu candrāvalī-bhāvānusāriṇī» — «Rukmiṇī and the other queens bear some resemblance to Candrāvalī in regard to form, qualities and nature» (Āśraya-nirṇaya, text 15, p. 46).

## ${GC}

- **Her sakhīs** (Pūrva-campū 15, verse 53): «From that day, Viśākhā, Lalitā and others became the sakhīs of Rādhā. Padmā, Śaibya and others became the sakhīs of Candrāvalī.» Also Pūrva-campū 17.42: «Candrāvalī's sakhīs like Śaibya and Padmā».
- **In the rāsa** (Pūrva-campū 25, verse 30): «One gopī held Kṛṣṇa's hand in her hands, just as fresh leaves surround an excellent lotus.» — «This was Candrāvalī.»
- Pūrva-campū 31, verse 32: the servants' disguised words «Kṛṣṇa spreads moonlight…» pointed to «Candrāvalī (moonlight)».
- **Rukmiṇī** (Uttara-campū 17, verse 53): «Candrāvalī was Rukmiṇī. Rādhā was Satyabhāmā…»

## Sources

${UNK}, Nāyikā-vibhāga (pp. 12, 15), Nāyikā-svabhāva 3 (pp. 17–21), Vayo-bheda (pp. 25–26), Rati-bheda (pp. 38–40), Āśraya-nirṇaya 15 (pp. 45–46); ${GC}, Pūrva 15.53, 17.42, 25.30, 31.32; Uttara 17.53.
`,
  },
  {
    id: 559,
    name: "Jagannātha Miśra (Purandara)",
    text: `## In the Vraja-nitya-līlā

**Śrī Nanda Mahārāja**, the king of Gokula, the middle of the five sons of Parjanya, husband of Yaśodā and father of Kṛṣṇa.

## ${GC} — his family

- **His father Parjanya** (Pūrva-campū 3.19): «Devamiḍha, who personified all the best qualities of the Yadu dynasty… lived in Mathurā. The best of kṣatriyas had two wives. One was of kṣatriya family and the other was of vaiśya family. They bore two children named Śūra and Parjanya. Śūra produced Vasudeva and others. Parjanya, because of his mixed parentage became a vaiśya and worked with cows. He lived in Mahāvana.» Parjanya's wife is **Varīyasī** (Pūrva-campū 33.350).
- **Five brothers** (Pūrva-campū 3, verse 15): «Giving the sons the names Upananda, Abhinanda, Nanda, Sannanda and Nandana, he brought bliss (ānanda = nanda) under control.» «Among them the middle son, Nanda, was the wealth… Not only was Nanda born as the middle son among such generous brothers but he was also the sole object of affection (middle object) for all people» (3.25–26).
- **His wife** (Pūrva-campū 3.30): «Then one of the chief cowherds named Sumukha gave his daughter to Nanda» — Yaśodā.
- **King of Gokula** (Pūrva-campū 3.31–33): when Parjanya retired to Vṛndāvana to worship Govinda, he gave the family to Upananda, the eldest; but Upananda, «in that assembly with great souls like Vasudeva… called his younger brother Nanda and embraced him with affection. By tilaka he gave Nanda sovereignty over Gokula.» Upananda then acted in Nanda's assembly as his advisor (3.44).

## ${GC} — father of Kṛṣṇa

- In Māgha, on the first night of the waning moon, Yaśodā «saw a child whose limbs were covered by a celestial maiden, being transferred from Nanda's heart to her heart. The boy entered into the lotus of her heart and the girl entered her womb. Nanda for a long time also experienced that the child had entered her heart» (Pūrva-campū 3.82–83). «The sages say that these two are the children of Nanda and Yaśodā» (3.84).
- «Kṛṣṇa appeared always in a two-armed form to Nanda and Yaśodā» (Pūrva-campū 3.102).
- In his assembly (Pūrva-campū 3, verse 4): «Nanda sat among his brothers on a high throne inlaid with precious gems… But his glance was constantly focused upon the face of Kṛṣṇa with great longing.»
- In Goloka (Pūrva-campū 1, verse 68): «Nanda and Yaśodā, like the sun and moon, followed by their affectionate associates, like the constellations, revolve in the zodiac of Kṛṣṇa's beauty, pulled by the strong rope of prema.» In the central palace «Nanda, the goal of all people, resides (in the east)» (1.71).

## Compared with the Gaṇoddeśa

The Rādhā-Kṛṣṇa-gaṇoddeśa-dīpikā calls him the younger brother of Upananda and a friend of Vasudeva; the Gopāla-campū agrees, and says why: Nanda's father Parjanya and Vasudeva's father Śūra were brothers, sons of Devamiḍha.

## Sources

${GC}, Pūrva 1.68–71, 3.4, 3.15–33, 3.44, 3.82–84, 3.102, 33.350.
`,
  },
  {
    id: 1336,
    name: "Śrī Śacī Devī",
    text: `## In the Vraja-nitya-līlā

**Śrī Yaśodā**, the queen of Vraja, daughter of the chief cowherd Sumukha, wife of Nanda and mother of Kṛṣṇa.

## ${GC}

- **Her father** (Pūrva-campū 3.30): «Then one of the chief cowherds named Sumukha gave his daughter to Nanda. That daughter controlled all relatives by her good qualities and bestowed abundant qualities to those who heard about her. Those who saw her increased their good qualities.»
- **Kṛṣṇa enters her heart** (Pūrva-campū 3.82–83): «Then on the night of the first day of the waning phase of Māgha month, which would bring all happiness, Yaśodā was serving Nanda. In a fatigued state, she saw some worshipable object as if in a dream. She saw a child whose limbs were covered by a celestial maiden, being transferred from Nanda's heart to her heart. The boy entered into the lotus of her heart and the girl entered her womb.»
- (verse 23) «Just as a lamp in a crystal case shines within and without the case, Kṛṣṇa shone within Yaśodā's womb and illuminated the whole universe.» (verse 24) «Though Yaśodā was very grave by nature, her self-control became disturbed by greed.»
- **Kṛṣṇa is her son** (Pūrva-campū 3.102): «at that time Kṛṣṇa had already appeared with two arms within Yaśodā along with Yogamāyā. That two-armed form came to Devakī and merged the four-armed form into itself.» Yogamāyā was then born from Yaśodā as a girl, and «Kṛṣṇa appeared always in a two-armed form to Nanda and Yaśodā».
- **With Rohiṇī** (Pūrva-campū 3.80): «Yaśodā and Rohiṇī, like the Yamunā and Gaṅgā Rivers, became overcome with bliss on meeting and showered bliss on each other and everyone else.»
- **With Rādhā** (Pūrva-campū 2, verse 5): «When Rādhā touched her feet, Yaśodā touched her head. When Rādhā fell on the ground, Yaśodā raised her up and smelled her head in affection… Both gazed at each other with tears in their eyes.» Paurṇamāsī tells Rādhā: «Yaśodā is your mother-in-law» (Uttara-campū 31, verse 45).
- In Goloka (Pūrva-campū 1.70–71): in Nanda's palace «Yaśodā lives» in the western group of houses, «most auspicious Yaśodā presides».

## Sources

${GC}, Pūrva 1.70–71, 2.5, 3.30, 3.80–85 (verses 22–25), 3.102–103; Uttara 31.45.
`,
  },
  {
    id: 1851,
    name: "Śrī Nityānanda Prabhu",
    text: `## In the Vraja-nitya-līlā

**Śrī Balarāma**, son of Rohiṇī, Kṛṣṇa's elder brother in Gokula, white as an autumn cloud.

## ${GC}

- **His birth** (Pūrva-campū 3.86): «Yogamāyā then destroyed the seven-month embryo in Rohiṇī's womb and transferred the seventh month embryo from Devakī's womb. After the fourteenth month of pregnancy, at a most auspicious time, before Śrāvaṇa month, during Śravaṇa constellation, Rohiṇī, in great joy gave birth to a most beautiful son endowed with all qualities. He was like the full moon endowed with shining whiteness.»
- (verse 26) «Rohiṇī gave birth to Balarāma, whose face was like the moon, whose eyes were like lightning, whose hair was like a rain cloud, whose complexion was like a white autumn cloud and whose effulgence was like the sun.»
- **What the astrologers said** (Pūrva-campū 3.87): «His body was white. He had a younger brother, and will be a killer of demons. He will be the protector of cows and the killer Dhenuka. He had long arms and will be the killer of Pralamba. He is called Rāma but will be the killer of Dvivida.» His birth and name ceremony were done secretly, on Vasudeva's advice (3.88).
- **Waiting for Kṛṣṇa** (Pūrva-campū 3.89): «After the birth of Balarāma, until the birth of his younger brother, there was dullness. There was one remedy however. When Balarāma sat on the lap of Yaśodā who held Kṛṣṇa in her heart, they saw that Balarāma became very happy.»
- **His dress**: Yaśodā calls him «O child wearing blue…» (Pūrva-campū 2.61).
- **In Goloka** (Pūrva-campū 1.71): in Nanda's palace «Balarāma, who engages in play at Rāmaghaṭṭa, resides (in the north)», and «To the north Rohiṇī lives» (1.70).
- **Return to Vraja** (Uttara-campū 20): «He did everything in Vraja and Dvārakā according to the advice of Kṛṣṇa. He did not act independently.»

## Sources

${GC}, Pūrva 1.70–71, 2.61, 3.86–89 (verse 26); Uttara 20.1–3.
`,
  },
];
fs.writeFileSync(new URL("./vraja1.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length + " fichas");
