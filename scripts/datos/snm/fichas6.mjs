// node fichas6.mjs [puerto] [--dry]   (17-11-2026) — conferencias de SNM, tanda 6: Śrīla Jīva Gosvāmī (#618).
// Solo palabras de SNM (en Perth, 1998-12-22, hablan Nabin Kṛṣṇa y Prema-prayojana: no se citan). Citas con chk.mjs.
import { aplicar, SRC } from "./aplicar.mjs";

const F = [
  {
    id: 618,
    name: "Śrīla Jīva Gosvāmī",
    notes:
      "From the lectures of Śrīla Nārāyaṇa Gosvāmī Mahārāja: son of Anupama, the treasurer, the only son of the three brothers; as a child he was blessed by Mahāprabhu at Rāmakeli; at about fourteen he went to Navadvīpa, where Nityānanda Prabhu, come from Khaḍadaha only to meet him, showed him the places of Mahāprabhu's pastimes and sent him to Vṛndāvana; in Vārāṇasī he learned Vedānta from Madhusūdana Vācaspati, a disciple of Sārvabhauma Bhaṭṭācārya; at the Rādhā-Dāmodara temple he defeated Vallabhācārya's objection to Bhakti-rasāmṛta-sindhu, was sent away by Rūpa Gosvāmī, lived in a crocodile cave at Bhayagaon until Sanātana Gosvāmī brought him back; he copied by hand every book of Rūpa Gosvāmī; from Gopāla Bhaṭṭa's notebook he wrote the Ṣaṭ-sandarbha; he refused to initiate Narottama, Śrīnivāsa and Śyāmānanda, sending them to Lokanātha Gosvāmī, Gopāla Bhaṭṭa Gosvāmī and Hṛdaya Caitanya (see the text «In the lectures…»).",
    text: `## In short

Śrīla Nārāyaṇa Gosvāmī Mahārāja told Śrīla Jīva Gosvāmī's life on his appearance and disappearance days. The son of Anupama, treasurer of the Muslim ruler, he was the only son of the three brothers, and Rūpa Gosvāmī loved him as his own; as a child at Rāmakeli he was blessed by Mahāprabhu. He preferred making garlands for his Rādhā-Kṛṣṇa Deities to playing. At about fourteen he went to a deserted Navadvīpa, where Nityānanda Prabhu, who had come from Khaḍadaha only to meet him, showed him Mahāprabhu's pastime places and sent him to Vṛndāvana; on the way, in Vārāṇasī, he learned Vedānta from Madhusūdana Vācaspati. At the Rādhā-Dāmodara temple, fanning his guru, he heard Vallabhācārya offer to correct Bhakti-rasāmṛta-sindhu, and defeated him at the river; Rūpa Gosvāmī sent him away for his pride, and he lay weeping in a crocodile cave at Bhayagaon until Sanātana Gosvāmī brought him back and placed him in Rūpa's lap. He copied every book of Rūpa Gosvāmī by hand, «and if it were not for him, all of Srila Rupa Gosvamis books would have been lost»; from Gopāla Bhaṭṭa's notes he composed the Ṣaṭ-sandarbha. He had no formal disciples — he sent Narottama, Śrīnivāsa and Śyāmānanda to others for initiation — «but the whole world is his disciple».

## In the lectures

- **His family** — «Srila Jiva Gosvami's father, Anupama, was the brother of Srila Rupa Gosvami and Srila Sanatana Gosvami» (lecture of 1999, published 2009-09-01). «Srila Sanatana Gosvami as prime minister, Srila Rupa Gosvami as the private secretary, and Sri Anupama as treasurer» (2009-09-01). «As the only son of the three brothers, Jiva received abundant affection» (2009-09-01).
- **Childhood** — «When Jiva was still very young, Srila Rupa Gosvami took him to Mahaprabhu, who blessed him by placing His hand on his head» (2009-09-01). «Making garlands for Them and offering puja to Them, he would become immersed in meditation, preferring these activities to playing with other children» (2009-09-01).
- **Nityānanda Prabhu** — «When he was about fourteen years old, he went to Navadvipa» (2009-09-01). «Nityananda prabhu placed His feet on Jiva's head and said, "I came here just to meet with you, otherwise I would have stayed in Khardaha» (2009-09-01); he «showed Jiva all the places of Mahaprabhu's pastimes in Navadvipa» (2009-09-01).
- **Vārāṇasī** — «Jiva Gosvami went to his home and learned all bhakti-vedanta from him. He also learned Sankaracarya's commentary, because without learning it, he would have been unable to refute it» (2009-09-01).
- **Vallabhācārya** — «At that time Jiva Gosvami was fanning Rupa Gosvami with a leaf from the tala tree» (2009-09-01). «Eventually Jiva Gosvami established the point so convincingly that Vallabhacarya could neither refute it nor give any answer» (2009-09-01). Vallabhācārya to Rūpa: «No, he is a genius, and in the future he will be very famous» (2009-09-01).
- **Sent away** — «He went to the village of Bhayagaon to live in a cave infested with crocodiles» (2009-09-01). The villagers told Sanātana: «a young boy who is even more of a bhajananandi than you has come to our village» (2009-09-01). Sanātana to Rūpa: «The duty of Vaisnavas is to be compassionate to others» (2009-09-01). «When Sanatana Gosvami brought Jiva there and placed him in the lap of Rupa Gosvami, both guru and disciple wept» (2009-09-01).
- **Rūpa Gosvāmī's books** — «Jiva Gosvami wrote down, in his own handwriting, every copy of every book of Srila Rupa Gosvami» (Hawaii, 2002-01-16). «If it were not for him, all of Srila Rupa Gosvamis books would have been lost» (2002-01-16).
- **The Sandarbhas** — «Srila Jiva Gosvami learned all of this tattva from Gopala Bhatta Gosvami» (2009-09-01). «The word sandarbha means 'a chest of valuable jewels.'» (2009-09-01).
- **No disciples** — «Srila Jiva Gosvami did not have any formal disciples at all, but the whole world is his disciple» (2002-01-16). «They wanted to be initiated by him, but he refused. He told them, "There are so many elevated Vaisnavas more qualified than I» (2002-01-16).
- **Ācārya of the three maṇḍalas** — «After Rupa and Sanatana, Srila Jiva Gosvami was the acarya, ofentire Braja mandala, Ksetra mandala and Gaura mandala» (at his samādhi, Rādhā-Dāmodara, 1999-08-23). «HereJiva Gosvami did his bhajana, serving the lotus feet of Srila Rupa Gosvami, his Gurudeva» (1999-08-23).

## Sources

${SRC}: «The Disappearance Day of Srila Rupa Gosvami» (spoken at the samādhis of the Rādhā-Dāmodara temple, Vṛndāvana, 23 August 1999); «Srila Jiva Gosvami's Disappearance Day» (Oahu, Hawaii, 16 January 2002); «Jiva Gosvami's Appearance Day» (a lecture of 1999, published 1 September 2009).`,
  },
];

await aplicar(F);
