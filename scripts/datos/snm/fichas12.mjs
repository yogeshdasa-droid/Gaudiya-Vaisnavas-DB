// node fichas12.mjs [puerto] [--dry]   (17-11-2026) — conferencias de SNM, tanda 12: Śrīla Raghunātha Dāsa Gosvāmī (#1206)
// y Śrī Narottama dāsa Ṭhākura (#1010). Citas comprobadas con chk.mjs.
import { aplicar, SRC } from "./aplicar.mjs";

const F = [
  {
    id: 1206,
    name: "Śrīla Raghunātha Dāsa Gosvāmī",
    notes:
      "From the lectures of Śrīla Nārāyaṇa Gosvāmī Mahārāja: in his siddha-svarūpa he is Rati-mañjarī, called Tulasī-mañjarī (Gopāla-guru Gosvāmī's Paddhati); Mahāprabhu first sent him home («antare niṣṭhā kara, bāhye loka-vyavahāra»); after Nityānanda's mercy at Pānihāṭi he escaped with the help of his guru Yadunandana Ācārya; in Purī Mahāprabhu gave him to Svarūpa Dāmodara and later gave him His Govardhana-śilā and guñjā-mālā; after Mahāprabhu and Svarūpa Dāmodara left he gave up even fruits and milk and went to Vṛndāvana to leap from Govardhana, but Sanātana Gosvāmī stopped him: Kṛṣṇa is attained only by bhajana; at Rādhā-kuṇḍa his bhajana was so severe that no one can follow it; after Rūpa Gosvāmī's departure Rādhā-kuṇḍa seemed a tiger's mouth and Govardhana a python (see the text «In the lectures…»).",
    text: `## In short

Śrīla Nārāyaṇa Gosvāmī Mahārāja studied Vilāpa-kusumāñjali with his audiences and told the life of its author: Śrīla Raghunātha dāsa Gosvāmī, in his eternal form Rati-mañjarī, called Tulasī-mañjarī by the sakhīs. From boyhood he wanted to join Mahāprabhu, who sent him home: be mature first, love your parents outwardly and keep firm faith within. After receiving Nityānanda Prabhu's mercy at Pānihāṭi he slipped past his father's guards with his guru Yadunandana Ācārya and reached Purī, where Mahāprabhu placed him in the hands of Svarūpa Dāmodara and later gave him His own Govardhana-śilā and guñjā-mālā — giving him to Govardhana and to Rādhikā. When Mahāprabhu and Svarūpa Dāmodara left this world he gave up even fruits and milk and went to Vṛndāvana to leap from Govardhana; Sanātana Gosvāmī, telling him how Mahāprabhu had stopped his own suicide, turned him to bhajana instead. At Rādhā-kuṇḍa he ate practically nothing, wept, chanted and rolled on the bank, in a bhajana «so severe that no one can follow him»; when Rūpa Gosvāmī left, the kuṇḍa seemed a tiger's mouth and Govardhana a python. Nārāyaṇa Mahārāja held him up as the model for one who wants prema in one or two births.

## In the lectures

- **Rati-mañjarī** — «in his siddha-svarupa, his spiritual form in Goloka Våndavana, Srila Raghunatha dasa Gosvami is Sri Rati-manjari, and her nickname is Sri Tulasi-manjari» (lecture published 2012-10-26).
- **Sent home** — «First become mature in bhakti, and then you can leave your home» (2012-10-26). «God is not attained merely by abandoning one's home and family» (Prabandhāvalī, 2009-10-01). «Externally you should behave in an ordinary fashion with your family members, but internally you should have nistha (strong faith)» (2009-10-01).
- **Leaving home** — «After some time he met Sri Nityananda Prabhu at Panihati, and there he received the Lords mercy» (2012-10-26). «Many guards had been watching over him so that he would not leave home, but when they saw that he was with his guru, they did not disturb him» (2012-10-26).
- **The śilā and the guñjā-mālā** — «By doing this, Mahaprabhu has given me to Govardhana; I should serve Govardhana. And, by giving me this gunja-mala, He has offered me to the lotus feet of Srimati Radhika» (2012-10-26).
- **Govardhana** — «He soon proceeded to Våndavana and planned to give up his life by jumping from Govardhana Hill» (2012-10-26). Sanātana Gosvāmī: «Rather than die, it is better to perform bhajana at Radha-kunòa, Govardhana, Våndavana, and other places of Srimati Radharani and Krsnas pastimes» (2012-10-26).
- **His bhajana** — «His mode of worship was so severe that no one can follow him» (Mathurā, 1996-11-02). «He ate practically nothing and was always weeping, always chanting, always remembering, and sometimes he was rolling on the bank of Radha-kunda» (1996-11-02).
- **Separation from Rūpa Gosvāmī** — «I don't want to live at Radha-kunda, because it now seems like the gaping mouth of a tiger, and Giriraja Govardhana seems like a very large python» (1996-11-02).
- **The example** — «If a sadhaka sincerely desires to engage in bhajana to achieve the direct association of the Supreme Lord without delay – perhaps in only one or two births – then he should engage in bhajana just as Raghunatha dasa Gosvami did» (2009-10-01).

## Sources

${SRC}: «The Disappearance Day of Srila Narottama Dasa Thakura» (Keśavajī Gauḍīya Maṭha, Mathurā, 2 November 1996); «The Disappearance Day of Srila Raghunatha Dasa Gosvami» (from his Prabandhāvalī, published 1 October 2009); «The Life of Srila Raghunatha Dasa Gosvami» (introduction to his Vilāpa-kusumāñjali, published 26 October 2012).`,
  },
  {
    id: 1010,
    name: "Śrī Narottama dāsa Ṭhākura",
    notes:
      "From the lectures of Śrīla Nārāyaṇa Gosvāmī Mahārāja: a prince, the only son of the two royal brothers, a lifelong brahmacārī; on his way to Purī he heard that Mahāprabhu and His associates had left, and in Vṛndāvana that Rūpa and Sanātana had too; with Śrīnivāsa and Śyāmānanda he studied all the śāstras under Jīva Gosvāmī, who sent him to Lokanātha Gosvāmī for initiation; Lokanātha refused until he found Narottama secretly cleaning his place in the forest at night, then gave him the gopāla-mantra and kāma-gāyatrī and a hut next to his own; he once sent him home for leaving his chanting to give water to a thirsty farmer; in his mañjarī form he is Vilāsa-mañjarī; he preached in Bengal, Assam and Manipur (see the text «In the lectures…»).",
    text: `## In short

Śrīla Nārāyaṇa Gosvāmī Mahārāja called Narottama dāsa Ṭhākura «one of the solid and strong pillars» of Mahāprabhu's preaching. The only son of a great king's family in Bengal, pure from childhood and a lifelong brahmacārī, he set out to see Mahāprabhu in Purī and heard on the way that Mahāprabhu and His associates had left the world; turning to Vṛndāvana, he heard that Rūpa and Sanātana had left too. With Śrīnivāsa Ācārya and Śyāmānanda he came to Jīva Gosvāmī at the Rādhā-Dāmodara temple and learned from him the Sandarbhas, the Bhāgavatam and all the books of the Gosvāmīs. Jīva Gosvāmī, free from envy, sent him for initiation to Lokanātha Gosvāmī, who had vowed never to make disciples and refused him; so Narottama cleaned, night after night, the place in the forest where Lokanātha went to pass stool, until Lokanātha caught his hand in the dark and, moved, gave him the gopāla-mantra and the kāma-gāyatrī and a hut beside his own. When Narottama left his chanting to give water to a thirsty farmer, his guru sent him home: «You have no belief that Krsna can quench his thirst». With his two companions he carried the Gosvāmīs' books to Bengal and preached as far as Assam and Manipur. In his mañjarī form he is Vilāsa-mañjarī, and his song «Śrī-rūpa-mañjarī-pada» is the heart of the rūpānuga line.

## In the lectures

- **A pillar** — «It is the birthday of Srila Narottama dasa Thakura, who is one of the solid and strong pillars of Sri Caitanya Mahaprabhus preaching» (Bali, 1997-02-22). «Especially, Narottama Thakura preached in Eastern India, in such places as Assam and Manipura» (1997-02-22).
- **The prince** — «Srila Narottama dasa Thakura took birth in West Bengal as the son of a very great king, and he was a beautiful prince» (Mathurā, 1996-11-02). «he remained a life-long brahmacari, never marrying» (1996-11-02).
- **Too late for Mahāprabhu** — «when he was on his way to Puri he heard that Sriman Mahaprabhu and His associates, like Sri Svarupa Damodara, Sri Raya Ramananda and Sri Gadadhara Pandita, had all disappeared. This broke his heart» (1996-11-02).
- **Jīva Gosvāmī** — «Together with Syamananda and Srinivasa, he studied all the sastras from Jiva Gosvami» (1997-02-22). «Jiva Gosvami personally told him to take initiation from Lokanatha dasa Gosvami, and he told Srinivasa Acarya to take initiation from Gopala Bhatta Gosvami» (1997-02-22).
- **Lokanātha Gosvāmī** — «I am a worthless person. I don't know how to do bhajana» (1997-02-22). «He began to clean the place where Lokanatha dasa Gosvami was passing stool in the forest» (1997-02-22). «On seeing the boys devotion Lokanatha dasa Gosvami was at once moved and accepted him» (1997-02-22).
- **The thirsty farmer** — «You have no belief that Krsna can quench his thirst. Krsna can give anything, but you have no faith in Him» (1997-02-22).
- **Vilāsa-mañjarī** — «He was an associate of Srimati Radhika Herself, and in his manjari form he is Vilasa-manjari» (1997-02-22).
- **Śrī-rūpa-mañjarī-pada** — «Srila Narottama dasa Thakura is a rupanuga Vaisnava and one of the prominent acaryas in our line after Srila Rupa Gosvami and Sri Sanatana Gosvami» (1995-08-08).

## Sources

${SRC}: «The Disappearance Day of Srila Rupa Gosvami» (Vṛndāvana, 8 August 1995); «The Disappearance Day of Srila Narottama Dasa Thakura» (Keśavajī Gauḍīya Maṭha, Mathurā, 2 November 1996); «Appearance Day of Srila Narottama Dasa Thakura» (Bali, 22 February 1997).`,
  },
];

await aplicar(F);
