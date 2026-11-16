// node cb12.mjs → cb12.json   (16-11-2026) — tanda 12: Puṇḍarīka Vidyānidhi.
import fs from "node:fs";
import { SRC } from "./comun.mjs";

const T = {};
const add = (id, name, body, refs) => (T[id] = [name, body + `\n\n## Sources\n\n${SRC} ${refs}`]);

add(1119, "Śrīla Puṇḍarīka Vidyānidhi", `## In short

Puṇḍarīka Vidyānidhi of Caṭṭagrāma — «actually “Bhakti Vidyānidhi”» —, a disciple of Mādhavendra Purī and the guru of Gadādhara Paṇḍita: he lived like a rich materialist, but fell unconscious in ecstasy at a single verse of the *Bhāgavatam*; in Purī, Jagannātha and Balarāma slapped him in a dream for criticising Their servants.

## Birth and family (Ādi 2.36–37, bhāṣya)

«Puṇḍarīka Vidyānidhi was the disciple of Śrī Mādhavendra Purīpāda and the spiritual master of Śrī Gadādhara Paṇḍita Gosvāmī. His wife's name was Ratnāvatī, his father's name was Bāṇeśvara (or, in others' opinion, Śuklāmbara) Brahmacārī, and his mother's name was Gaṅgā-devī. His ancestral house is situated in the village of **Mekhalā**», near Hāṭhazārī in Caṭṭagrāma.

## Gadādhara's doubt (Madhya 7 — with the bhāṣya's summary)

One day Mahāprabhu called out the name «Puṇḍarīka» and wept; He told the devotees who Vidyānidhi was and that he would soon come to Navadvīpa — where he then lived secretly, enacting the pastimes of a gross materialist. «None of the Vaiṣṇavas knew him except Mukunda… for they were both born in Caṭṭagrāma» (7.39–40). Mukunda took Gadādhara to see «a wonderful Vaiṣṇava»: Vidyānidhi sat on an opulent throne, chewing betel, and the renounced Gadādhara doubted. Mukunda then recited a verse of the *Bhāgavatam* on Kṛṣṇa's glories: Puṇḍarīka fell unconscious with all the transformations of love, kicking and scattering everything around him; «Vidyānidhi was completely merged in an ocean of bliss with no symptom of life manifest in his entire body» — for six hours. Repenting his disrespect, Gadādhara decided to take initiation from him; Puṇḍarīka gladly accepted such a disciple. The *bhāṣya* on this chapter: «Puṇḍarīka Vidyānidhi was actually “Bhakti Vidyānidhi.” Generally people simply called him “Vidyānidhi.”»

Late one night he came to the Lord, could not even offer obeisances, fell unconscious, then wept; the Lord wept calling his name, embraced him and introduced him to all the Vaiṣṇavas — «Vidyānidhi did not release the Lord from his chest. It appeared that the Lord had merged with his body.» With the Lord's approval Gadādhara took initiation from him.

## In Purī (Antya 10)

«There was not a single Vaiṣṇava who did not glorify him… There was not a speck of false ego in his person» (10.82–83). Vṛndāvana dāsa writes what he heard «from the lotus mouth of Gadādhara» (10.84). «The Lord kept Puṇḍarīka Vidyānidhi with Him in Jagannātha Purī and assigned him a residence at **Yameśvara**, on the shore of the ocean» (10.85). Gadādhara took initiation from him a second time (chapter summary).

On the day of **Oḍana-ṣaṣṭhī** he saw the servants dress Jagannātha and Balarāma in starched cloth and criticised them: «The Lord may do as He likes, but why do the servants imitate the activities of the Lord?» (10.109). That night «Vidyānidhi saw Lord Jagannātha catch hold of him and slap his face in an angry mood. The two brothers, Jagannātha and Balarāma, slapped him on his cheeks so hard that his swollen face bore impressions of Their fingers» (10.128–129); he placed his head at Their feet and wept — and in the morning told his friend everything.

## Other mentions

Among those who knew the Lord's pastimes (Madhya 13.239–240); at the nightly kīrtanas (8.112–116); «All glories to the wealth and life of Puṇḍarīka Vidyānidhi!» (Madhya 7.3).`, "Ādi 2.36–37 (with bhāṣya); Madhya 7 (with the bhāṣya's summary), 7.3, 7.39–121; 8.112–116; 13.239–240; Antya 10.82–130 and chapter summary.");

const plan = Object.entries(T).map(([id, [name, text]]) => ({ id: +id, name, text }));
fs.writeFileSync(new URL("./cb12.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length + " entradas");
