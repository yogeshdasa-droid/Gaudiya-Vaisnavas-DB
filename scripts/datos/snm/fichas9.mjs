// node fichas9.mjs [puerto] [--dry]   (17-11-2026) — conferencias de SNM, tanda 9: Śrī Gadādhara Paṇḍita (#274) y
// Śrīvāsa Paṇḍita (#1468). Citas comprobadas con chk.mjs (fecha de la charla entre paréntesis).
import { aplicar, SRC } from "./aplicar.mjs";

const F = [
  {
    id: 274,
    name: "Śrī Gadādhara Paṇḍita Gosvāmī",
    notes:
      "From the lectures of Śrīla Nārāyaṇa Gosvāmī Mahārāja: Śrīmatī Rādhikā Herself, watching and correcting Mahāprabhu as He plays Her part, His madanākhya-mahābhāva covered so as to serve Him; classmate of Nimāi under Gaṅgādāsa Paṇḍita, he used to cross the street to avoid His logic; doubting Puṇḍarīka Vidyānidhi's luxury, he was shown his ecstasy when Mukunda recited the Pūtanā verse, and by Mahāprabhu's order took the Gopāla-mantra from him; one of the five told of Mahāprabhu's sannyāsa, he wept at Katwa when the barber shaved Him; in Purī Mahāprabhu found Gopīnātha in the sand, placed Him in Gadādhara's lap and told him never to leave Him; Mahāprabhu came daily to Ṭoṭā-gopīnātha to hear the Bhāgavatam from him; he was ready to give up his kṣetra-sannyāsa to follow Mahāprabhu to Vṛndāvana (see the text «In the lectures…»).",
    text: `## In short

For Śrīla Nārāyaṇa Gosvāmī Mahārāja, Śrī Gadādhara Paṇḍita is Śrīmatī Rādhikā Herself, present in Gaura-līlā to watch Kṛṣṇa play Her part: «if there is something wrong in Krsna (as Mahaprabhu), She corrects it». Her madanākhya-mahābhāva is covered in him so that he can serve Mahāprabhu as a servant. A childhood friend and classmate of Nimāi under Gaṅgādāsa Paṇḍita, he would cross the street to escape His logic. When he doubted the kingly Puṇḍarīka Vidyānidhi, Mahāprabhu sent him back with Mukunda, who recited the Pūtanā verse; seeing Vidyānidhi roll senseless in prema, Gadādhara begged pardon and by Mahāprabhu's order took the Gopāla-mantra from him. He sang «barhāpīḍaṁ» when Mahāprabhu and Nityānanda met, was one of the five told of the sannyāsa, and wept at Katwa when the barber came. In Purī Mahāprabhu found Gopīnātha in the sand at Ṭoṭā, placed Him in Gadādhara's lap — «You should never leave Him» — and came daily to hear the Bhāgavatam from him, whose explanations of the gopīs' moods surpass even those of Vyāsa and Śuka. When Mahāprabhu left for Vṛndāvana, Gadādhara was ready to break his kṣetra-sannyāsa to follow Him.

## In the lectures

- **Who he is** — «Who is Gadadhara Pandita? He is Srimati Radha Thakurani. Why did he come? To help Mahaprabhu enjoy Radhikas three moods» (Alachua, 2008-05-06). «when Lord Sri Krsna 'took' the bhava of Srimati Radhika and became Sri Caitanya Mahaprabhu, She was also present, watching, as Sri Gadadhara Pandita» (Ṭoṭā-gopīnātha, Purī, 2001-10-07). «In the form of Sri Gadadhara Pandita, Srimati Radhika is looking and examining, and if there is something wrong in Krsna (as Mahaprabhu), She corrects it» (2001-10-07).
- **School days** — «Gadadhara Pandita, Murari Gupta, and so many others like Jagadananda were classmates» (2008-05-06); «Gadadhara Pandita would think, "Oh, Nimai Pandita is coming", and he would go to the other side of the street to avoid Him» (2008-05-06).
- **Puṇḍarīka Vidyānidhi** — «He saw Pundarika Vidyanidhis luxurious life, like that of a king, and he lost his faith» (2008-05-06). «Hearing this sloka, Pundarika Vidyanidhi fell down from the bed» (2008-05-06). «Gadadhara Pandita went there and took diksa -the gopala-mantra -from Pundarika Vidyanidhi» (2008-05-06).
- **Sannyāsa** — Mahāprabhu told only five persons, and «In that ceremony, when the barber wanted to shave Mahaprabhus head, Gadadhara Pandita began to weep» (2008-05-06).
- **Ṭoṭā-gopīnātha** — «He then placed Gopinatha in the lap of Gadadhara Pandita and said, "You should never leave Him» (1993-09-03). «He came to Tota-Gopinatha Temple to hear Srimad-Bhagavatam from Sri Gadadhara Pandita – Srimati Radhika – to learn how to play Her part» (2001-10-07). «His explanations will be greater than those of Vyasa, Sukadeva, and Krsna Himself» (2001-10-07).
- **His kṣetra-sannyāsa** — «What is the use of my ksetra-sannyasa? The purpose of my taking sannyasa was to be with you» (2000-04-21).
- **Not with Mahāprabhu in Vṛndāvana** — «The answer is that if Gadadhara Pandita would remain with Him, then His mood of being Krsna would arise» (2002-07-11).
- **Serving Gaura** — «Everyone has to serve Him in dasya-bhava, as a servant» (2001-10-07).

## Sources

${SRC}: «Sri Gadadhara Pandita and Tota Gopinatha» (1993-09-03); «Counter-Clockwise Love» (2000-04-21); «The Glories of Sri Gadadhara Pandita» (Ṭoṭā-gopīnātha Mandira, Jagannātha Purī, 7 October 2001); «Srila Gadadhara Pandita's and Srila Bhaktivinoda Thakura's Disappearance Day» (11 July 2002); «The Appearance Day of Gadadhara Pandit» (Alachua, Florida, 6 May 2008).`,
  },
  {
    id: 1468,
    name: "Śrīla Śrīvāsa Paṇḍita",
    notes:
      "From the lectures of Śrīla Nārāyaṇa Gosvāmī Mahārāja: Śrīvāsa is Nārada Ṛṣi serving Mahāprabhu; his wife Mālinī-devī nursed Nityānanda as a baby, and a crow returned her silver ghee cup at Nityānanda's call; though poor, he had everything for the Vyāsa-pūjā Mahāprabhu ordered in his courtyard, where Nityānanda worshipped Mahāprabhu; when his only son died during the kīrtana in his courtyard he forbade anyone to weep so as not to disturb Mahāprabhu (see the text «In the lectures…»).",
    text: `## In short

Śrīla Nārāyaṇa Gosvāmī Mahārāja spoke of Śrīvāsa Paṇḍita as Nārada Ṛṣi serving Śrī Caitanya Mahāprabhu: «Srivasa Pandit is the same as Narada». His wife Mālinī-devī loved Nityānanda Prabhu as her baby, and when a crow stole her silver cup of ghee Nityānanda called it back. Poor as he was, when Mahāprabhu announced the Vyāsa-pūjā for the next day in his courtyard, Śrīvāsa had every item ready, and there Nityānanda garlanded and worshipped Mahāprabhu as Kṛṣṇa Himself. Nārāyaṇa Mahārāja held him up as the model of firm faith: when his only son died while Mahāprabhu was dancing in the kīrtana at Śrīvāsa-aṅgana, he would not let anyone weep and disturb it. With his four brothers he chanted the whole night, without worrying about maintenance.

## In the lectures

- **Nārada** — «Srivasa Pandit is the same as Narada. As Srivasa Pandita, Narada Rsi serves Sri Caitanya Mahaprabhu» (Tunbridge, England, 1999-07-08).
- **Mālinī-devī** — «Srivasa Panditas wife is Malini-devi, who used to serve Nityananda Prabhu like a very little baby» (1999-07-08). «A crow came and took it, and flew away» (1999-07-08); «After a short time, that crow returned the cup» (1999-07-08).
- **The Vyāsa-pūjā** — «I know you are poor, but Vyasa-puja will be at your home, so try to make all the arrangements for Vyasa-puja» (1999-07-08). «Oh, yes. I have sacred thread, betel nut, rice and all other required ingredients and paraphernalia» (Hilo, Hawaii, 2004-01-21). «Nityananda Prabhu then took a very beautiful, fragrant garland and placed it around the neck of Sri Caitanya Mahaprabhu, saying, "You are the same as Lord Krsna» (2004-01-21).
- **His son's death** — «Do you know how strong a devotee Srivasa Pandita is?» (1999-07-08). «While Mahaprabhu was dancing and singing with His associates, Srivasa Panditas only son died» (1999-07-08).
- **Chanting without worry** — «Remember Srivasa Pandita and his four brothers. They chanted throughout the night» (New Braja, 2002, in 2004-01-21).

## Sources

${SRC}: «Srivasa Pandita's Appearance Day» (Tunbridge, England, 8 July 1999 — spoken on his disappearance day); «The Appearance Day of Srivasa Pandita» (excerpts: Hilo, Hawaii, 21 January 2004, and New Braja, Badger, 1 June 2002).`,
  },
];

await aplicar(F);
