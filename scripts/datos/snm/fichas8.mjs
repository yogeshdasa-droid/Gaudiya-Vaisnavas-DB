// node fichas8.mjs [puerto] [--dry]   (17-11-2026) — conferencias de SNM, tanda 8: Śrī Advaita Ācārya Prabhu (#15).
// Citas comprobadas con chk.mjs (fecha de la charla entre paréntesis).
import { aplicar, SRC } from "./aplicar.mjs";

const F = [
  {
    id: 15,
    name: "Śrī Advaita Ācārya Prabhu",
    notes:
      "From the lectures of Śrīla Nārāyaṇa Gosvāmī Mahārāja: Sadāśiva, born to Kuvera Paṇḍita after Śiva promised to come as his son, and named Kamalākṣa; as a boy of five or six, when he bowed to the Kālī of the king's palace, the deity broke into pieces; he taught a Sanskrit school in Navadvīpa where Viśvarūpa studied, so Śacī-mātā called him «Dvaita» and later had to beg his forgiveness; called Gaura-āna Ṭhākura and «Nāḍā» because he brought Mahāprabhu with tulasī and Gaṅgā water; to stop Mahāprabhu's obeisances he explained the Gītā as māyāvāda at Śāntipura and danced when Mahāprabhu beat him; his loving quarrels with Nityānanda; his riddle «bāulake kahiha» that only Svarūpa Dāmodara understood (see the text «In the lectures…»).",
    text: `## In short

On Advaita Saptamī Śrīla Nārāyaṇa Gosvāmī Mahārāja described Śrī Advaita Ācārya as Sadāśiva and Mahā-Viṣṇu — «Advaita» because He is non-different from Viṣṇu, «Ācārya» because He preached the holy name and prema-bhakti. His father Kuvera Paṇḍita, a servant of the king, asked Śiva for a son like him, and Śiva came Himself; the child Kamalākṣa made the king's Kālī burst into pieces simply by bowing to her. He taught a Sanskrit school in Navadvīpa where Viśvarūpa studied, and when Viśvarūpa took sannyāsa Śacī-mātā called Him «Dvaita»; Mahāprabhu refused her prema until she begged His pardon, and He fell at her feet instead. Seeing bhakti vanish, He called Kṛṣṇa with tulasī and Gaṅgā water, threatening to destroy the world with four arms — so He is «Gaura-āna Ṭhākura», who brought Gaura. Disciple of Mādhavendra Purī, He could not bear Mahāprabhu's obeisances, so He taught the Gītā as māyāvāda at Śāntipura until Mahāprabhu pulled His beard and beat Him — and He danced, for now the Master treated Him as servant. His loving quarrels with Nityānanda glorified them both, and His riddle «bāulake kahiha», telling Mahāprabhu that the shop could close, only Svarūpa Dāmodara understood.

## In the lectures

- **His names** — «He is non-different from Visnu-tattva, and therefore his name is 'Advaita' (non-different) He is also a prominent acarya (teacher and personal example) of preaching the glories of the holy name and giving prema-bhakti along with that chanting, and therefore his name is 'Acarya'» (Hawaii, 2007-01-24).
- **Birth** — Kuvera Paṇḍita asked Śiva, «I want a son like you» (2007-01-24); «Siva replied, "This is impossible, so I will personally come as your son» (2007-01-24). «At the time of his birth, Advaita Acarya was given the name Kamalaksa, which means 'one who has very beautiful lotus eyes'» (2007-01-24).
- **Kālī** — «Kamalaksa replied, "If I will do so, Kali will be destroyed. Saying this, he offered his obeisances. At once there was an explosion, and the deity of Kali broke into many pieces» (2007-01-24).
- **Viśvarūpa and Śacī-mātā** — «Sri Visvarupa Prabhu, the elder brother of Sri Caitanya Mahaprabhu, used to study at that Sanskrit school» (2007-01-24). Mahāprabhu: «I cannot give prema to her. She has committed an offense at the lotus feet of Advaita Acarya» (2007-01-24). «O Mother, you made no offense, and if there was an offense, I excuse you» (2007-01-24).
- **Bringing Mahāprabhu** — «But Advaita Acarya called Him with Tulasi leaves, which are also very powerful» (Perth, 2001-01-31). «It is for this reason that Advaita Acarya is called Gaura-ana Thakura, which means: "He who brought Caitanya Mahaprabhu. He is also called Nada, which means: "He who can shake the throne of Krsna» (2001-01-31).
- **Beaten by Mahāprabhu** — «This was because Sri Advaita Prabhu was a disciple of Madhavendra Puri, Sriman Mahaprabhu's grand-spiritual master» (Prabandhāvalī, 2007-01-25). «Advaita Acarya began to dance saying, "Oh, now I have received a boon: Mahaprabhu has beaten me» (2007-01-24). «The master can beat the servant; The servant cannot beat the master» (2007-01-24).
- **Nityānanda** — «Maha-prasadam never becomes impure, even if it is touched by the mouth of a dog» (2007-01-24). «Externally they quarrel with each other, but actually they are glorifying each other, revealing their respective tattvas, or positions» (2001-01-31).
- **The riddle** — «One madman is sending a message to another madman» (2007-01-25). «Only Sri Svarupa Damodara could understand a little of Sri Advaita Acarya's mood; no one else could understand» (2007-01-25).
- **The Gītā** — «Sri Advaita Acarya first of all gave the explanation of bhakti from these verses» (2007-01-25).

## Sources

${SRC}: «The Appearance Day of Sri Advaita Acarya» (Perth, 31 January 2001); «The Appearance Day of Sri Advaita Acarya» (North Shore, Hawaii, 24 January 2007); «Sri Advaita Acarya's Appearance Day» (an essay from his Prabandhāvalī, 25 January 2007).`,
  },
];

await aplicar(F);
