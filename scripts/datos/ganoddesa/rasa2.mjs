// node rasa2.mjs → rasa2.json   (16-11-2026) — Śrīdhara Svāmī en el Rāsa-pañcādhyāyī (texto nuevo, colección «Rāsa-pañcādhyāyī»).
// Aplicar: node ../cb/aplicar-cb.mjs rasa2.json [puerto] [--dry]
import fs from "node:fs";
const text = `## In short

Śrīdhara Svāmī's *Bhāvārtha-dīpikā* is the first of the three commentaries given verse by verse in the *Śrī Rāsa-pañcādhyāyī* (with Jīva Gosvāmī's *Vaiṣṇava-toṣaṇī* and Viśvanātha Cakravartī's *Sārārtha-darśinī*). He presents the rāsa-līlā as the conquest of Cupid and «the ultimate renunciation».

## «The ultimate renunciation»

«In rāsa-līlā no one has even a scent of desire for one's personal gratification. Therefore, Śrīdhara Svāmīpāda has called this *līlā* ‘the ultimate renunciation’ (*nivṛtti-parā*): “*Nivṛtti-pareyaṁ rāsa-pañcādhyāyī ’ti vyakti kariṣyāmaḥ* — I will be describing detachment as generated in *rāsa-pañcādhyāyī*.”» (introduction)

## The conqueror of Cupid

His invocation at the start of the rāsa (10.29.1): «All glories to Śrīpati (Śrī Kṛṣṇa), who looked so beautiful when surrounded by the gopīs in the *rāsa-maṇḍala* that He churned the heart of even Cupid, who captivates the hearts of all others.» The editor: «Śrīdhara Svāmīpāda has proclaimed the *Rāsa-pañcādhyāyī* as the vehicle for defeating lust» — he raised the doubt (*kandarpa-jetṛtva-pratīteḥ*) that to ordinary persons Kṛṣṇa, enjoying with others' wives, might seem conquered by Cupid, in order to establish that it was Kṛṣṇa who defeated Cupid.

## His other explanations

He explains why the gopīs went alone without seeing each other (10.29.4); that «all moving and non-moving living entities are liberated by the power of that Śrī Kṛṣṇa's glories» (10.29.16); and Kṛṣṇa's confession *na pāraye 'haṁ* (10.32.22): «Your contact with Me is completely spotless. Even if I receive a long lifespan like the demigods, I will not be able to repay you.» Jīva Gosvāmī follows and develops his words, and sometimes notes where «Śrīdhara Svāmīpāda has not specifically said this» (chapter 1).

## Source

*Śrī Rāsa-pañcādhyāyī* (Bhāgavatam 10.29–33 with the commentaries of Śrīdhara Svāmī, Jīva Gosvāmī and Viśvanātha Cakravartī; ed. Śrī Śrīmad Bhaktivedānta Nārāyaṇa Gosvāmī) — in «Libros».`;
const plan = [{ id: 1995, name: "Śrīdhara Svāmī", coll: "Rāsa-pañcādhyāyī", title: "In the Rāsa-pañcādhyāyī — Śrīdhara Svāmī", text }];
fs.writeFileSync(new URL("./rasa2.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length + " entradas");
