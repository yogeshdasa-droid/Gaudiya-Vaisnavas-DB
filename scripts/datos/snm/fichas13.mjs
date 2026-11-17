// node fichas13.mjs [puerto] [--dry]   (17-11-2026) — conferencias de SNM, tanda 13: Śrī Baladeva Vidyābhūṣaṇa (#73).
// «place»: SNM dice nacido junto al lago Chilka, cerca de Purī, y estudios en Uḍupī → primero lo de SNM, lo anterior se queda
// como «other sources». Citas comprobadas con chk.mjs.
import { aplicar, SRC } from "./aplicar.mjs";

const F = [
  {
    id: 73,
    name: "Śrī Baladeva Vidyābhūṣaṇa",
    notes:
      "From the lectures of Śrīla Nārāyaṇa Gosvāmī Mahārāja: born in Orissa near Chilka Lake, near Purī; studied all the commentaries on Vedānta at Uḍupī; came to Purī to defeat its scholars, but surrendered to Rādhā-Dāmodara, in the line of Śyāmānanda and Rasikānanda, and took initiation from him; in Vṛndāvana his śikṣā-guru was Viśvanātha Cakravartī Ṭhākura, who sent him in his place to Jaipur (Galtā), where he defeated the Rāmānandīs on Rādhā's place beside Kṛṣṇa and the Gauḍīyas' sampradāya, showing it to be in the Madhva line; he wrote the Govinda-bhāṣya; Śrīla Keśava Gosvāmī named the Gauḍīya Vedānta Samiti and his «Bhaktivedānta» sannyāsīs after him; it is said he was Gopīnātha (Ācārya) of Mahāprabhu's pastimes (see the text «In the lectures…»).",
    set: {
      place:
        "Born in Orissa near Chilka Lake, near Purī (lectures of Śrīla Nārāyaṇa Gosvāmī Mahārāja; other sources: near Remuṇā, Balasore); studied the commentaries on Vedānta at Uḍupī (lectures; other sources: Mysore); the Tattvavādī maṭha in Purī; Vṛndāvana (Śrī Śyāmasundara); Galtā near Jaipur (Śrī Vijaya-gopāla)",
    },
    text: `## In short

On his disappearance day — also the appearance day of Gaṅgā-mātā and of the Gaṅgā — Śrīla Nārāyaṇa Gosvāmī Mahārāja told the story of Śrī Baladeva Vidyābhūṣaṇa, «one of the most elevated acaryas in our disciplic succession». Born in Orissa near Chilka Lake, he mastered grammar and the scriptures as a boy and, unsatisfied with Śaṅkara, went to Uḍupī and studied every commentary on Vedānta. He came to Purī to conquer its scholars, but before the simple, hidden scholar Rādhā-Dāmodara, of the line of Śyāmānanda and Rasikānanda, he felt «like a small baby», surrendered and was initiated; in Vṛndāvana Viśvanātha Cakravartī Ṭhākura became his śikṣā-guru and taught him the Sandarbhas. When the Rāmānandīs challenged the Gauḍīyas in Jaipur — Rādhā unmarried beside Kṛṣṇa, Rādhā not named in the Bhāgavatam, no sampradāya, no commentary on the Vedānta-sūtra — the old Viśvanātha, bound by his vow never to leave Vṛndāvana, sent him; he defeated them all, proved the Gauḍīyas to be in the Madhva line, and wrote the Govinda-bhāṣya. Śrīla Keśava Gosvāmī named the Gauḍīya Vedānta Samiti after him and gave his sannyāsīs the title «Bhaktivedānta».

## In the lectures

- **Youth** — «Baladeva Vidyabhusana was born in Orissa, near Puri, in a place called Chilka Lake» (1998-06-04). «Therefore, he went to South India, to a place called Udupi, where he studied all the commentaries on Vedanta» (1998-06-04).
- **Rādhā-Dāmodara** — «He was very learned, but he kept all his knowledge hidden» (1998-06-04). «I am very insignificant and I do not know anything in front of him. I am like a baby, a small baby» (1998-06-04). «After that he went to Vrndavana and took shelter of his siksa-guru, Srila Visvanatha Cakravarti Thakura, and he totally surrendered to him» (1998-06-04).
- **Jaipur** — «The King of Jaipura requested SrilaVisvanatha Cakravarti Thakura to come, but he denied their request. He ordered his disciple Baladeva Vidyabhusana Prabhu to go in his stead» (1998-06-04). «Baladeva Vidyabhusana then proved the GaudiyaV aisnavas are in the line of Sri Madhvacarya» (1998-06-04). «Srila Baladeva Vidyabhusana Prabhu, in Jaipur at Galta-pahad, hoisted the victory flag for the Gaudiya Vaisnava Sampradaya» (preface to Utkalikā-vallarī, 2019-06-11).
- **The Govinda-bhāṣya** — «When we talk about Sri Baladeva Vidyabhusana Prabhu, the first thing that comes to our mind is his commentary on Vedanta called Sri Govinda-bhasya» (Śrīla Keśava Gosvāmī, quoted 2019-06-11).
- **«Bhaktivedānta»** — Śrīla Keśava Gosvāmī honoured him «by using Prabhu's name in establishing the society 'Sri Gaudiya Vedanta Samiti' and also in awarding his sannyasa disciples the title 'Sri Bhaktivedanta.'» (2019-06-11).
- **Bhaktivinoda Ṭhākura's praise** — «Vidyabhusana Mahasaya is a special luminous star in the Gaudiya Sampradaya. After the Six Gosvamis, no one has done welfare for the sampradaya as he has» (2019-06-11).
- **Gopīnātha** — «It has also been told that Mahaprabhu's associate, Sri Gopinatha Misra, who along with Sarvabhauma had heard Mahaprabhu speak His commentary on Vedanta-sutra, later on appeared as Srila Baladeva Vidyabhusana» (2019-06-11).
- **Those who reject him** — «Srila Bhaktivinoda Thakura has therefore said very strongly that those who do not accept Srila Baladeva Vidyabhusana or Srila Madhvacarya have no relation to pure bhakti» (2005-10-13).

## Sources

${SRC}: «Disappearance Day of Sri Baladeva Vidyabhusana» (4 June 1998); «Srila Madhvacarya» (13 October 2005); «Disappearance of Sri Baladeva Vidyabhusana» (from his preface to Śrī Utkalikā-vallarī, published 11 June 2019).`,
  },
];

await aplicar(F);
