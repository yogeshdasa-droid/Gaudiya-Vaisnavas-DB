// node cb24.mjs → cb24.json   (16-11-2026) — tanda 24: ficha nueva del Kazi de Navadvīpa.
import fs from "node:fs";
import { SRC } from "./comun.mjs";

const kazi = `## In short

The Kazi, the Muslim magistrate of Navadvīpa — according to the *bhāṣya*, **Maulānā Sirājuddīn, known as Chand Kazi** —, who broke a *mṛdaṅga* and forbade the kīrtana; the Lord led the whole town with lamps in a great saṅkīrtana to his house, and «by the benediction of Lord Gaurāṅga, the Kazi attains devotional service».

## Who he was (Ādi 1.130–131, bhāṣya)

«During the Lord's manifest pastimes, a magistrate was appointed to maintain peace in the city of Navadvīpa. The name of that post was “Kazi.” At that time, Maulānā Sirājuddīn, who was known as Chand Kazi, was appointed as the magistrate… Since he was engaged in the task of administration, he forgot his eternal identification and proudly considered himself a government officer.» «In the Madhya-khaṇḍa the Lord breaks the Kazi's pride, while manifesting His potency in a tremendous kīrtana. By the benediction of Lord Gaurāṅga, the Kazi attains devotional service. Thus all the devotees are allowed to freely perform kīrtana in the streets of Navadvīpa.» The *bhāṣya*: «By the Lord's mercy, Kazi Mahāśaya became attached to the service of the supreme worshipable object.»

## The broken *mṛdaṅga* (Madhya 23.101–107)

«One day by providence the Kazi walked down that road and heard the sound of *mṛdaṅgas*, *karatālas*, and conchshells… The Kazi said, “Catch them! Catch them! I will take action today. Let us see what your teacher Nimāi does.”» «The Kazi beat whoever he caught. He broke the *mṛdaṅgas* and created havoc» — «The entire Nadia has been overrun by the Hindus. When I catch them, I'll punish them.»

## The procession (Madhya 23 — the bhāṣya's chapter summary)

When the townspeople told the Lord and spoke of leaving in distress, He roared in anger and ordered everyone to bring a lamp and come with Him to subdue the Kazi. Hundreds of thousands gathered with burning lamps; the Lord arranged kīrtana groups and they went along the Gaṅgā; women, children and elders fell at His feet. Hearing the cry «Kill the Kazi!», the Kazi and his men fled. At his house the crowd tore it apart and uprooted the mango and jackfruit trees; when the Lord ordered it burnt, the devotees with folded hands begged Him to restrain His anger, and He went on through the villages of the conch-shell merchants and weavers to Śrīdhara's house.

(The *bhāṣya* on Ādi 12.178 places Śrīdhara's house «one mile east of Chand Kazi's samādhi».)`;

const plan = [{
  create: true, name: "Chand Kazi (Maulānā Sirājuddīn)", text: kazi,
  fields: {
    aka: "Kazi of Navadvīpa, Cāṅd Kāzī",
    place: "Navadvīpa (his samādhi near Māyāpura)",
    notes: "The Muslim magistrate (Kazi) of Navadvīpa in the Lord's time; the Gauḍīya-bhāṣya of Bhaktisiddhānta Sarasvatī names him Maulānā Sirājuddīn, known as Chand Kazi (Caitanya-bhāgavata Ādi 1.130, bhāṣya). He broke a mṛdaṅga and forbade the kīrtana; the Lord led a great saṅkīrtana to his house (Madhya 23), and by the Lord's benediction he attained devotional service (Ādi 1.131). New record, 16-11-2026.",
  },
}];
fs.writeFileSync(new URL("./cb24.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length + " entradas");
