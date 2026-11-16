// node cb4.mjs → cb4.json   (16-11-2026) — tanda 4: los compañeros de Nityānanda (Antya 5, sobre todo la lista 5.719–757).
import fs from "node:fs";
import { SRC } from "./comun.mjs";

const LIST = `## In the list of Nityānanda's associates

Closing the chapter on Nityānanda's pastimes, Vṛndāvana dāsa names His servants «whom I know, for simply by remembering their names one is delivered from material existence» (Antya 5.719). «The devotees with whom Nityānanda enjoyed pastimes were all incarnations of the cowherd boy and cowherd girl associates of Nanda Mahārāja. Being prohibited by Nityānanda Svarūpa, I am not disclosing their previous names» (5.720–721). «Each of those servants had thousands of followers… By the mercy of Nityānanda, they were all qualified spiritual masters» (5.754–755).`;

const JOURNEY = `## The journey to Bengal (Antya 5.228–250)

When the Lord sent Nityānanda from Purī to Gauḍa — «Deliver the foolish, wretched, fallen, and distressed persons by giving them devotional service» —, «Nityānanda Svarūpa was accompanied by His intimate associates such as Rāmadāsa, Gadādhara dāsa Mahāśaya, Raghunātha Vaidya…, Kṛṣṇadāsa Paṇḍita, Parameśvarī dāsa, and the most jubilant Purandara Paṇḍita» (5.231–233). As they set out He gave them ecstatic love; they forgot themselves, lost their way again and again, «not even aware of their own bodies, so what to speak of the road» (5.243–249).`;

const T = {};
const add = (id, name, body, refs) => (T[id] = [name, body + `\n\n## Sources\n\n${SRC} ${refs}`]);

add(6, "Abhirāma Ṭhākura", `## In short

In the *Caitanya-bhāgavata* he is **Rāmadāsa**, «the principal associate» of Nityānanda, who always spoke in the mood of the Lord; Kṛṣṇa resided in his body for three months.

${JOURNEY}

«The topmost Vaiṣṇava Rāmadāsa was the first to manifest the mood of a cowherd boy. Somewhere on the way Rāmadāsa forgot the external world and stood for nine hours in a threefold bending form» (*tri-bhaṅga*, 5.236–237).

${LIST}

> «His principal associate was Rāmadāsa Mahāśaya, who always spoke in the mood of the Supreme Lord. No one could easily understand his words. Nityānanda always resided in his heart. Of all the devotees, Rāmadāsa had the most intense feelings of ecstatic love. Kṛṣṇa resided in his body for three months.» (5.722–724)

The *bhāṣya* (5.724): Rāmadāsa, the topmost associate of Nityānanda, always spoke in the mood of the *viṣaya-vigraha* (the object of worship), yet he was not a follower of Śaṅkara's Māyāvāda; people who did not understand him took him for an *ahaṅgrahopāsaka*, one who worships himself as God.`, "Antya 5.228–237, 5.719–724.");

add(948, "Murāri Caitanya Dāsa", `## In short

Murāri Caitanya dāsa, «a renowned associate who sported with large snakes and tigers», of Nityānanda's company.

## At Khaḍadaha (Antya 5.426–435)

When Nityānanda came to Purandara Paṇḍita's village: «The body of Śrī Caitanya dāsa displayed no sign of external consciousness. He would chase tigers through the forest. Sometimes he would jump on a tiger's back, yet by the mercy of Kṛṣṇa the tiger would not harm him. Sometimes Caitanya dāsa would fearlessly take a large python on his lap and play with it.» He could spend all twenty-four hours chanting or speaking of Caitanya and Nityānanda; «sometimes he would remain submerged in water for two or three days, but he would feel no bodily inconvenience» — almost like inert matter, yet sometimes with the enthusiasm of a lion. «Anyone who was touched by the air that came in contact with Murāri Caitanya dāsa would certainly be enlightened in Kṛṣṇa consciousness» (5.435).

The book then warns against a pretender of the time who «calls himself Caitanya dāsa, though he never chants the glories of Lord Caitanya even in his dreams» (5.436–442).

${LIST}

«Murāri Caitanya dāsa was a renowned associate who sported with large snakes and tigers» (5.725).`, "Antya 5.426–442, 5.725.");

add(1213, "Raghunātha Vaidya Upādhyāya", `## In short

Raghunātha Vaidya Upādhyāya, «most magnanimous»: by his glance attachment for Kṛṣṇa awoke in one's mind. On the journey to Bengal he took the mood of **Revatī**, Balarāma's wife.

## At Pāṇihāṭi with the Lord (Antya 5.97)

When Mahāprabhu stayed at Rāghava Paṇḍita's house, «Raghunātha Vaidya also came at that time. He was a great Vaiṣṇava with unlimited good qualities.»

${JOURNEY}

«The most magnanimous Raghunātha Vaidya Upādhyāya became fully absorbed in the mood of Revatī» (5.239). The *bhāṣya*: those who know Jīva Gosvāmī's *Durgama-saṅgamanī* understand that *sādhakas* and *siddhas* never consider themselves equal to the Lord; such moods are those of His eternal associates.

${LIST}

«Raghunātha Vaidya Upādhyāya was most magnanimous. By his glance attachment for Kṛṣṇa would awaken in one's mind» (5.726).`, "Antya 5.97, 5.228–239, 5.726.");

add(1815, "Gadādhara dāsa Ṭhākura", `## In short

Gadādhara dāsa, «extremely dear to the Lord», always absorbed in the mood of a gopī; Nityānanda stayed some days in his house and danced before his Deity of Bāla-gopāla.

## At Pāṇihāṭi with the Lord (Antya 5.92–94)

«As soon as Gadādhara dāsa heard that Śrī Gaurasundara was at Rāghava's house, he quickly came there. Gadādhara dāsa was extremely dear to the Lord. His body was filled with the happiness of devotional service. When the Lord saw the fortunate Gadādhara, He placed His lotus feet on his head.»

${JOURNEY}

> «dadhi ke kinibe?» bale aṭṭa aṭṭa hāse

«Gadādhara dāsa became absorbed in the mood of Rādhikā. He loudly laughed and said, “Who will buy yogurt?”» (5.238) The *bhāṣya* warns that fools who do not understand *bhāva* become *sakhī-bhekīs*, imitating the dress of a gopī.

## Nityānanda in his house (Antya 5.371–393)

«One day Nityānanda went to the house of Gadādhara dāsa to bestow mercy on him.» Absorbed as a gopī, Gadādhara dāsa carried a pot of Gaṅgā water on his head calling «Who wants to buy milk?» Seeing the enchanting Deity of **Bāla-gopāla** in his temple, Nityānanda embraced Him to His chest; Mādhava Ghoṣa sang of the *dāna-līlā* and Nityānanda danced «in a way that is beyond description». «Gadādhara dāsa had no external consciousness, for he was absorbed in the mood of a gopī and always considered himself to be a gopī.» The *bhāṣya* (5.381): he remained in his constitutional position and did not put on a sakhī's dress — he had the mood without the duplicity of the outward dress. Nityānanda stayed there some days.

${LIST}

«Gadādhara dāsa was filled with the transcendental mellows of ecstatic love. Simply by seeing him, all sinful reactions were destroyed» (5.727).`, "Antya 5.92–94, 5.228–238, 5.371–393, 5.727.");

add(1496, "Sundarānanda Ṭhākura", `## In short

Sundarānanda, «an ocean of the mellows of ecstatic love», the chief of Nityānanda's associates.

${LIST}

> «Sundarānanda was an ocean of the mellows of ecstatic love. He was the chief of Nityānanda Svarūpa's associates.» (5.728)`, "Antya 5.719–728.");

add(652, "Kamalākānta Paṇḍit", `## In short

Paṇḍita Kamalākānta, «most grave», to whom Nityānanda entrusted the village of Saptagrāma.

${LIST}

> «Paṇḍita Kamalākānta was most grave. Nityānanda entrusted the village of Saptagrāma to him.» (5.729)

(Ādi 8.38 names a «Śrī Kamalākānta» among the Lord's classmates under Gaṅgādāsa Paṇḍita, with Murāri Gupta and Kṛṣṇānanda; the book does not say that he is the same person.)`, "Ādi 8.38; Antya 5.719–729.");

add(325, "Śrī Gaurīdāsa Paṇḍita", `## In short

Gaurīdāsa Paṇḍita, «most fortunate», who accepted Nityānanda as his life and soul with body, mind and speech.

${LIST}

> «Gaurīdāsa Paṇḍita was most fortunate, for he accepted Nityānanda as his life and soul with his body, mind, and speech.» (5.730)`, "Antya 5.719–730.");

add(1124, "Purandara Miśra", `## In short

The *Caitanya-bhāgavata* calls him **Purandara Paṇḍita**, of the village of **Khaḍadaha**: «greatly peaceful and self-controlled», «extremely dear to Nityānanda», who in ecstasy climbed trees and roared, calling himself Aṅgada.

## At Pāṇihāṭi with the Lord (Antya 5.95)

«Purandara Paṇḍita and Parameśvarī dāsa… quickly came there. On seeing the Lord, they both cried in ecstasy.»

${JOURNEY}

> «muñi re aṅgada» bali' lampha diyā paḍe

«Purandara Paṇḍita would climb a tree and jump from it, declaring, “I am Aṅgada.”» (5.241)

## Nityānanda at Khaḍadaha (Antya 5.423–425)

«On the way, the Lord came to the house of Purandara Paṇḍita in the village of Khaḍadaha… Purandara Paṇḍita became so intoxicated with ecstatic love that he climbed a tree and roared like a lion.»

${LIST}

«Purandara Paṇḍita was greatly peaceful and self-controlled. He was extremely dear to Nityānanda Svarūpa» (5.731).

(This record, «Purandara Miśra» of Khardaha, had no notes; the *Caitanya-bhāgavata* names only «Purandara Paṇḍita» of Khaḍadaha.)`, "Antya 5.95, 5.228–241, 5.423–425, 5.731.");

add(1080, "Parameśvara Dāsa Ṭhākura", `## In short

Parameśvarī dāsa, in whose Deity Gauracandra manifested Himself; Nityānanda was his life and soul and «enjoyed pastimes in his body».

## At Pāṇihāṭi with the Lord (Antya 5.95)

«At that time Purandara Paṇḍita and Parameśvarī dāsa, in whose Deity Gauracandra manifest Himself, quickly came there. On seeing the Lord, they both cried in ecstasy.» The *bhāṣya*: Mahāprabhu manifested in the Gaurāṅga Deity worshipped by Parameśvarī dāsa, who lived in the village of **Tāḍā-āṭapura**; he began the worship of the Deity of Śrī Gaurasundara.

${JOURNEY}

«Kṛṣṇadāsa and Parameśvarī dāsa would always raise a loud uproar in the mood of cowherd boys» (5.240). The *bhāṣya*: both were servants of Nityānanda; their *gopāla-bhāva* is the mood of the twelve cowherd boys of Vraja — an internal mood, not an outward imitation.

${LIST}

«Nityānanda was the life and soul of Parameśvarī dāsa. Nityānanda enjoyed pastimes in his body» (5.732).`, "Antya 5.95, 5.228–240, 5.732.");

add(761, "Kṛṣṇadāsa Paṇḍit", `## In short

Kṛṣṇadāsa Paṇḍita went with Nityānanda from Purī to Bengal and, on the way, roared in the mood of a cowherd boy.

${JOURNEY}

«Kṛṣṇadāsa and Parameśvarī dāsa would always raise a loud uproar in the mood of cowherd boys» (5.240) — the *bhāṣya*: the mood of the twelve cowherd boys of Vraja.`, "Antya 5.228–240.");

add(1814, "Dhanañjaya Paṇḍita", `## In short

Dhanañjaya Paṇḍita, «an extraordinary devotee» in whose heart Nityānanda always resided.

${LIST}

> «Dhanañjaya Paṇḍita was an extraordinary devotee. Nityānanda always resided in his heart.» (5.733)`, "Antya 5.719–733.");

add(2039, "Balarāma Dāsa (Nityānanda's branch, CC Ādi 11.34)", `## In short

Balarāma dāsa, «intoxicated with the mellows of ecstatic love»; the breezes that touched his body destroyed all sins.

${LIST}

> «Balarāma dāsa was intoxicated with the mellows of ecstatic love. The breezes that touched his body destroyed all sins.» (5.734)`, "Antya 5.719–734.");

add(534, "Jagadīśa Paṇḍita", `## In short

Jagadīśa Paṇḍita, «the abode of great effulgence», whose life and soul were Nityānanda and His associates.

${LIST}

> «Jagadīśa Paṇḍita was the abode of great effulgence. Nityānanda and His associates were his life and soul.» (5.736)

(The *bhāṣya* on Ādi 2.98–99 quotes this verse for the Jagadīśa of Navadvīpa, the Lord's companion with Hiraṇya.)`, "Ādi 2.98–99 (bhāṣya); Antya 5.719–736.");

add(1136, "Puruṣottama Paṇḍita", `## In short

Paṇḍita Puruṣottama, born in Navadvīpa, a confidential servant of Nityānanda, who had stayed in his house.

${LIST}

> «Paṇḍita Puruṣottama took birth in Navadvīpa. He was a confidential servant of Nityānanda Svarūpa. Nityānanda had previously stayed in his house. By his mercy one's mind would be fixed on Nityānanda.» (5.737–738)`, "Antya 5.719–738.");

add(255, "Dvija Kṛṣṇadāsa", `## In short

Dvija Kṛṣṇadāsa, born in Rāḍha-deśa, who enjoyed the association of Nityānanda's associates.

${LIST}

> «Dvija Kṛṣṇadāsa Mahāśaya was born in Rāḍha-deśa. He enjoyed the association of Nityānanda's associates.» (5.739)`, "Antya 5.719–739.");

add(639, "Kālīya Kṛṣṇa Dāsa Ṭhākura", `## In short

Kāliyā Kṛṣṇadāsa, «famous throughout the three worlds»: by remembering him one attains Gauracandra.

${LIST}

> «Kāliyā Kṛṣṇadāsa was famous throughout the three worlds. By remembering him one can attain Gauracandra.» (5.740)`, "Antya 5.719–740.");

add(1342, "Sadāśiva Kavirāja", `## In short

Sadāśiva Kavirāja, «most fortunate», father of Puruṣottama dāsa.

${LIST}

> «Sadāśiva Kavirāja was most fortunate. He had a son named Puruṣottama dāsa. The body of Puruṣottama dāsa displayed no external consciousness, for Nityānanda Candra resided in his heart.» (5.741–742)`, "Antya 5.719–742.");

add(1139, "Puruṣottama Dāsa", `## In short

Puruṣottama dāsa, son of Sadāśiva Kavirāja: «his body displayed no external consciousness, for Nityānanda Candra resided in his heart».

${LIST}

> «Sadāśiva Kavirāja was most fortunate. He had a son named Puruṣottama dāsa. The body of Puruṣottama dāsa displayed no external consciousness, for Nityānanda Candra resided in his heart.» (5.741–742)`, "Antya 5.719–742.");

add(1567, "Uddhāraṇa Datta Ṭhākura", `## In short

Uddhāraṇa Datta of Saptagrāma, of the *suvarṇa-vaṇik* (gold-merchant) community, in whose house by the Triveṇī Nityānanda stayed: «birth after birth Nityānanda Svarūpa was his master, and birth after birth Uddhāraṇa Datta was His servant».

## Nityānanda at Saptagrāma (Antya 5.443–456)

After Khaḍadaha Nityānanda went to Saptagrāma, bathed at the Triveṇī-ghāṭa — where the seven sages had performed austerities and the Gaṅgā, Yamunā and Sarasvatī meet — and «stayed on the bank of the Triveṇī at the house of the fortunate Uddhāraṇa Datta». «Uddhāraṇa Datta sincerely worshiped the feet of Nityānanda with his body, mind, and speech… There is no doubt that the entire mercantile community was delivered by Uddhāraṇa Datta.» Nityānanda enjoyed kīrtana in the houses of all the merchants of Saptagrāma, who took shelter of Him.

The *bhāṣya* (5.451, 5.453): Nityānanda is Baladeva, whose service is rare even for Brahmā — and His dear servant Śrī Uddhāraṇa Ṭhākura received it; though born in a community socially considered low, he was the recipient of Nityānanda's mercy. (5.443: for Saptagrāma see the *Anubhāṣya* on *Caitanya-caritāmṛta* Ādi 11.41.)

The *bhāṣya* on Madhya 9.240 names him with Haridāsa Ṭhākura: born a Yavana and a *suvarṇa-vaṇik*, they never felt worldly distress, being constantly engaged in ecstatic service.

${LIST}

«Uddhāraṇa Datta was a great magnanimous Vaiṣṇava. He was qualified for the service of Nityānanda» (5.743).`, "Madhya 9.240 (bhāṣya); Antya 5.443–456, 5.743.");

add(894, "Maheśa Paṇḍita", `## In short

Maheśa Paṇḍita, «the most exalted devotee» among Nityānanda's associates.

${LIST}

> «Maheśa Paṇḍita was the most exalted devotee. Paramānanda Upādhyāya was an unalloyed Vaiṣṇava.» (5.744) The *bhāṣya* refers to *Caitanya-caritāmṛta* Ādi 11.32 and its *Anubhāṣya*.`, "Antya 5.719–744.");

add(2148, "Gaṅgādāsa (brother of Viṣṇudāsa and Nandana)", `## In short

Gaṅgādāsa, son of Caturbhuja Paṇḍita, in whose house Nityānanda had stayed.

${LIST}

> «Gaṅgādāsa was the son of Caturbhuja Paṇḍita. Nityānanda had previously stayed in his house.» (5.745)`, "Antya 5.719–745.");

add(1597, "Vaiṣṇavānanda Ācārya", `## In short

Ācārya Vaiṣṇavānanda, «most magnanimous», formerly known as Raghunātha Purī.

${LIST}

> «Ācārya Vaiṣṇavānanda was most magnanimous. He was formerly known as Raghunātha Purī.» (5.746)`, "Antya 5.719–746.");

add(1070, "Paramānanda Gupta", `## In short

Paramānanda Gupta, «well known», in whose house Nityānanda enjoyed pastimes.

${LIST}

> «Paramānanda Gupta Mahāśaya was well known. Nityānanda enjoyed pastimes in his house.» (5.747)`, "Antya 5.719–747.");

add(204, "Devānanda (Vaidya, of Nityānanda's line)", `## In short

Devānanda, «pure-hearted», one of the devotees dear to Nityānanda.

${LIST}

«Kṛṣṇadāsa and Devānanda were both pure-hearted» (5.749), and again: «The four devotees — Manohara, Nārāyaṇa, Kṛṣṇadāsa, and Devānanda — were dear to Nityānanda» (5.752; the *bhāṣya* refers to *Caitanya-caritāmṛta* Ādi 11.46 and its *Anubhāṣya*).`, "Antya 5.749, 5.752.");

add(7, "Ācārya Candrā", `## In short

Ācāryacandra, «the exalted devotee» who accepted Nityānanda as the goal of his life.

${LIST}

> «Kṛṣṇadāsa and Devānanda were both pure-hearted. The exalted devotee Ācāryacandra accepted Nityānanda as his goal of life.» (5.749)`, "Antya 5.719–749.");

add(861, "Mādhava Ghoṣa", `## In short

Mādhava (Mādhavānanda) Ghoṣa, the incomparable kīrtana singer — «the singer of Vṛndāvana» —, most dear to Nityānanda; with his brothers Vāsudeva and Govinda he sang while Nityānanda danced.

## The kīrtana at Pāṇihāṭi (Antya 5.256–262)

«The most pious Mādhava Ghoṣa was expert in performing kīrtana. There was no kīrtana leader like him in the entire world. He was known as the singer of Vṛndāvana, and he was most dear to Nityānanda Svarūpa. Mādhava, Vāsudeva, and Govinda were three brothers. When they began to sing, Lord Nityānanda would dance» — so that the earth swayed under His feet. The *bhāṣya*: the three Ghoṣas were not like ordinary mundane kīrtana singers; therefore they were called the singers of Vṛndāvana.

## The *dāna-līlā* (Antya 5.378–379)

In the house of Gadādhara dāsa, «Mādhavānanda Ghoṣa sang about the *dāna-līlā*, and the lionlike Avadhūta became greatly satisfied. The voice of the fortunate Mādhava was so sweet that the crest jewel of avadhūtas became absorbed in ecstasy.»

${LIST}

«Mādhavānanda Ghoṣa Mahāśaya was a singer. Vāsudeva Ghoṣa was filled with the mellows of ecstatic love» (5.750).`, "Antya 5.256–262, 5.378–379, 5.750.");

add(1654, "Śrī Vāsudeva Ghoṣa", `## In short

Vāsudeva Ghoṣa, «filled with the mellows of ecstatic love», one of the three Ghoṣa brothers, singers of kīrtana for Nityānanda.

## The kīrtana at Pāṇihāṭi (Antya 5.257–259)

«Mādhava, Vāsudeva, and Govinda were three brothers. When they began to sing, Lord Nityānanda would dance.» The *bhāṣya*: Śrī Mādhava, Vāsudeva and Govinda Ghoṣa were all expert in kīrtana, not like ordinary singers; therefore they were called the singers of Vṛndāvana.

${LIST}

> «Mādhavānanda Ghoṣa Mahāśaya was a singer. Vāsudeva Ghoṣa was filled with the mellows of ecstatic love.» (5.750)`, "Antya 5.257–259, 5.750.");

add(910, "Manohara", `## In short

Manohara, one of the four devotees «dear to Nityānanda».

${LIST}

> «The four devotees — Manohara, Nārāyaṇa, Kṛṣṇadāsa, and Devānanda — were dear to Nityānanda.» (5.752) The *bhāṣya* refers to *Caitanya-caritāmṛta* Ādi 11.46 and its *Anubhāṣya*.`, "Antya 5.752.");

add(2082, "Nārāyaṇa (Nityānanda's branch, brother of Devānanda)", `## In short

Nārāyaṇa, one of the four devotees «dear to Nityānanda».

${LIST}

> «The four devotees — Manohara, Nārāyaṇa, Kṛṣṇadāsa, and Devānanda — were dear to Nityānanda.» (5.752) The *bhāṣya* refers to *Caitanya-caritāmṛta* Ādi 11.46 and its *Anubhāṣya*.`, "Antya 5.752.");

const plan = Object.entries(T).map(([id, [name, text]]) => ({ id: +id, name, text }));
fs.writeFileSync(new URL("./cb4.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length + " entradas");
