// node fichas16.mjs [puerto] [--dry]   (17-11-2026) — conferencias de SNM, tanda 16: Śrī Svarūpa Dāmodara Gosvāmī (#1513) y
// Śrīla Bhakti Hṛdaya Bon Mahārāja (#1795). Citas comprobadas con chk.mjs.
import { aplicar, SRC } from "./aplicar.mjs";

const F = [
  {
    id: 1513,
    name: "Śrī Svarūpa Dāmodara Gosvāmī",
    notes:
      "From the lectures of Śrīla Nārāyaṇa Gosvāmī Mahārāja: Svarūpa Dāmodara is Lalitā-devī; he grew up with Nimāi in Navadvīpa with Gadādhara and Murāri; after Mahāprabhu's sannyāsa he went to Vārāṇasī as a brahmacārī of the Māyāvāda line, «initiated by a māyāvādī», and is in our line by bhāgavata-paramparā; one of the three and a half associates with Mahāprabhu's own mood; Mahāprabhu placed Raghunātha dāsa in his hands («Svarūpera Raghu»); in the Gambhīrā he and Rāya Rāmānanda held Mahāprabhu's hands and tasted the Śikṣāṣṭaka with Him; he and Rāya Rāmānanda are not rūpānuga, being Lalitā and Viśākhā themselves (see the text «In the lectures…»).",
    text: `## In short

For Śrīla Nārāyaṇa Gosvāmī Mahārāja, Śrī Svarūpa Dāmodara is Lalitā-devī, Rādhikā's dearest friend, present in Mahāprabhu's pastimes. He grew up with Nimāi in Navadvīpa, with Gadādhara and Murāri, and after Mahāprabhu took sannyāsa he went to Vārāṇasī and became a brahmacārī of the Māyāvāda line — an example, for Nārāyaṇa Mahārāja, of bhāgavata-paramparā, since he came into our line not by his dīkṣā but by his relationship with Mahāprabhu. He is one of the three and a half who share Mahāprabhu's inner mood, with Rāya Rāmānanda, Śikhi Māhiti and his sister Mādhavī. Mahāprabhu chose him, Lalitā, to receive Raghunātha dāsa, and in the Gambhīrā, when Mahāprabhu tried to tear open His chest to find Kṛṣṇa, he and Rāya Rāmānanda held His hands and tasted with Him the Śikṣāṣṭaka. Rūpa Gosvāmī was his dear friend, «anu-svarūpa-dāmodara». He and Rāya Rāmānanda are not rūpānuga — they are Lalitā and Viśākhā themselves, whose service cannot be given; for that, Raghunātha dāsa prayed to Rūpa Gosvāmī.

## In the lectures

- **Lalitā** — «Sri Svarupa Damodara (Sri Lalitaji), Sri Raya Ramananda (Sri Visakha)» (article on the Ratha-yātrā in Navadvīpa, 1969-12-26). «Svarupa Damodara is Lalita-devi, and is therefore more qualified than Rupa Gosvami, who is Rupa Manjari» (Mathurā, 1991-11-01).
- **Childhood friend** — «Both Svarupa Damodara and Gadadhara Pandita, and also Murari Pandita, were with Him. They all grew up together» (1993-09-03).
- **Vārāṇasī** — «he went to Varanasi, after CaitanyaMahaprabhu took sannyasa, and he was a he was a brahmacari of Mayavada cult» (Maui, 1999-05-27). «Sri Svarupa Damodara Gosvami was initiated by a mayavadi» (Varṣāṇā, 1996-11-11).
- **Three and a half** — «In Caitanya-caritamrta it is told that among all of His associates only three and half were of thismood» (1996-07-03).
- **Raghunātha dāsa** — «For Srila Raghunatha dasa Gosvami, Sri Caitanya Mahaprabhu selected Radhikas most intimate friend Lalita (in the form of Sri Svarupa Damodara Gosvami), and He placed Raghunatha dasa Gosvamis hands in her (his) hands» (1993-05-29).
- **The Gambhīrā** — «At once Svarupa Damodara and Raya Ramananda checked,caught His hands» (1996-11-15).
- **Not rūpānuga** — «Sri Svarupa Damodara and Sri Raya Ramananda were not rupanuga, although they were in the intimate association of Srila Rupa Gosvami. They are Lalita devi and Visakha devi themselves» (1996-10-12).
- **Rūpa's friend** — «Svarupa Damodara is Lalita Devi, and Svarupa Damodaras dear friend is Rupa Gosvami» (1994-08-18).

## Sources

${SRC}: «Sri Rathayatra in Sri Dhama Navadvip» (article, 1969-12-26); «Discussions on Raga-vartma-candrika» (Mathurā, 1991); «The GBC Inquires, Part 2» (29 May 1993); «Sri Gadadhara Pandita and Tota Gopinatha» (1993-09-03); «The Divine Disappearance Day of Srila Rupa Gosvami» (1994-08-18); «Ramananda Samvada» (1996-07-03); «Rupanuga and Raganuga» (1996-10-12); «Guru Tattva and the Real Disciple» (Varṣāṇā, 11 November 1996); «Siksastakam» (1996-11-15); «Krishna Bhakti Is So Rare» (Maui, 27 May 1999).`,
  },
  {
    id: 1795,
    name: "Śrīla Bhakti Hṛdaya Bon Mahārāja",
    notes:
      "From the lectures of Śrīla Nārāyaṇa Gosvāmī Mahārāja, who knew him from 1946 and called him his śikṣā-guru: at his initiation he was named Nandasuno Brahmacārī; with his godbrother Hayagrīva dāsa Brahmacārī, at twenty-three or twenty-four, he silenced in Kāśī the Bengali principal of a Sanskrit university who mocked Śrīla Prabhupāda for giving the sacred thread to śūdras, quoting the Bhāgavatam (7.11.35); he founded a university in Vṛndāvana and preached Indian culture in the West; he treated Nārāyaṇa Mahārāja «like a father» and invited him to every festival; one of the three disciples Śrīla Bhaktisiddhānta Sarasvatī sent to England (see the text «In the lectures…»).",
    text: `## In short

At the centenary of his appearance, in 2001, Śrīla Nārāyaṇa Gosvāmī Mahārāja spoke at the bhajana-kuṭīra of Śrīla Bhakti Hṛdaya Bon Mahārāja in Vṛndāvana: «He was my siksa-guru», a prominent disciple of Śrīla Bhaktisiddhānta Sarasvatī whom he had known since 1946. Initiated as Nandasuno Brahmacārī, he went to Kāśī as a young man with his godbrother Hayagrīva dāsa, and when the Bengali principal of a Sanskrit university mocked their guru for «freely giving brahminical thread» to śūdras, the two boys quoted the Bhāgavatam — varṇa by qualities, not birth — and asked how Nārada, Vyāsa, Rāma and Kṛṣṇa, none of them sons of brāhmaṇas, could be worshipped by brāhmaṇas; the principal could not answer, and his wife begged their pardon. He was one of the three disciples Śrīla Bhaktisiddhānta Sarasvatī sent to England, founded a university in Vṛndāvana, and always invited Nārāyaṇa Mahārāja to his festivals, giving him a father's affection. To understand him, Nārāyaṇa Mahārāja said, one must see him in the succession of Rūpa Gosvāmī.

## In the lectures

- **Śikṣā-guru** — «I knew him since 1946. He was my siksa-guru, and he was one of the prominent disciples of Srila BhaktisiddhantaSarasvati Gosvami Prabhupada» (Vṛndāvana, 2001-07-07).
- **Nandasuno Brahmacārī** — «He left home to surrender to the lotus feet of hisGurudeva by accepting diksa from him, and at that time he was given the name Nandasuno Brahmacari» (2001-07-07).
- **In Kāśī** — «Are you coming from that person who is freely giving brahminical thread and diksa mantras to those who aren't qualified at all» (2001-07-07). «Yes, we are coming from Mayapura. Our Gurudeva is Srila Bhaktisiddhanta Sarasvati Thakura» (2001-07-07). «The principal was not able to answer, and at last his wife pacified the boys and begged forgiveness from them» (2001-07-07).
- **His mission** — «What was his purpose in establishing a university in Vrndavana? Why did he preach Indian culture in the Westerncountries?» (2001-07-07).
- **To England** — Śrīla Bhaktisiddhānta Sarasvatī «ordered his three disciples, Sripad Bhaktihrdaya Van Maharaja, Bhaktisaranga Gosvami Maharaja, and Bhaktipradipa Tirtha Maharaja, to go to England» (Singapore, 2001-01-13).
- **His affection** — «he would mercifully give me unlimited affection like a father» (2001-07-07).
- **In the line of Rūpa** — «You should consider Srila Bon Maharaja in the succession from Srila Rupa Gosvami, and only then will you be able tounderstand his dharma and activities» (2001-07-07).

## Sources

${SRC}: «Appearance Day of Srila Bhaktisiddhanta Sarasvati Gosvami Thakura» (Singapore, 13 February 2001; listed under 2001-01-13); «The Centennial Appearance Day Celebration of Srila Bhakti Hrdoy Bon Maharaja» (his bhajana-kuṭīra, Madana-mohana Ghera, Vṛndāvana, 7 July 2001).`,
  },
];

await aplicar(F);
