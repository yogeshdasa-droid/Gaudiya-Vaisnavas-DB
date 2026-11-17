// node fichas5.mjs [puerto] [--dry]   (17-11-2026) — conferencias de SNM, tanda 5: Śrīla Rūpa Gosvāmī (#1325).
// Citas comprobadas con chk.mjs (fecha de la charla entre paréntesis).
import { aplicar, SRC } from "./aplicar.mjs";

const F = [
  {
    id: 1325,
    name: "Śrīla Rūpa Gosvāmī",
    notes:
      "From the lectures of Śrīla Nārāyaṇa Gosvāmī Mahārāja: he received all of Mahāprabhu's mercy at Prayāga, where Mahāprabhu asked Nityānanda, Svarūpa Dāmodara and others to give him their śakti as well; he was the first to define bhakti-rasa (Bhakti-rasāmṛta-sindhu, Ujjvala-nīlamaṇi) and established parakīya-rasa with the Bhāgavatam as evidence; he alone could describe Mahāprabhu's identity; in Kṛṣṇa-līlā he is Rūpa-mañjarī, whose permission even Lalitā and Viśākhā ask; he did bhajana at Ṭer Kadamba, where the leaves sprouted or dried as he wrote of meeting or separation, and where Śrīmatī Rādhikā brought milk and rice and cooked khīr for him and Sanātana; his samādhi and bhajana-sthalī are at the Rādhā-Dāmodara temple (see the text «In the lectures…»).",
    text: `## In short

For Śrīla Nārāyaṇa Gosvāmī Mahārāja, Śrīla Rūpa Gosvāmī is «the backbone of our sampradāya» and the one who fulfilled the mano-'bhīṣṭa, the heart's desire, of Śrī Caitanya Mahāprabhu. At Prayāga Mahāprabhu poured into him all the wealth He had brought from Goloka, and asked Nityānanda, Svarūpa Dāmodara and others to empower him too. Before him there was bhakti, but no one had shown that bhakti is rasa: in Bhakti-rasāmṛta-sindhu and Ujjvala-nīlamaṇi he defined every stage from śraddhā to mahābhāva, gave the definition of uttamā bhakti, and, with the Bhāgavatam as evidence, established parakīya-rasa so strongly that all the other sampradāyas had to accept it. Only he could describe Mahāprabhu's identity — «all others were checked, but Rupa Gosvami could not be checked». Within he is Rūpa-mañjarī, whose permission even Lalitā and Viśākhā ask before entering the kuñja. He lived as an akiñcana at Ṭer Kadamba, a forest of tigers and dacoits, where the leaves sprouted or dried as he wrote of meeting or separation, and where Rādhikā Herself brought milk and rice and cooked khīr for him and Sanātana. Following Narottama's song, «Śrī-rūpa-mañjarī-pada, sei mora sampada», Nārāyaṇa Mahārāja taught that to understand his books is our only bhajana.

## In the lectures

- **Prayāga** — «Rupa Goswami received all the mercy of Sri Caitanya Mahaprabhu when they met in Prayag. There, Caitanya Mahaprabhu inspired in his heart all the wealth that He brought from Goloka Vrndavana» (Rūpa-Sanātana Gauḍīya Maṭha, Vṛndāvana, 1995-08-08). Mahāprabhu «instilled sakti in him in Prayag. He askedeveryone, Nityananda, Svarupa Damodara, etc, to instill sakti in Srila Rupa Gosvami as well» (Rādhā-Dāmodara Mandira, 1999-08-23).
- **The backbone** — «Srila Rupa Gosvami is the backboneof our sampradaya» (1999-08-23). «Srila Rupa Gosvami is the life of the Gaudiya Vaisnavas. He is the crest-jewel of the rasika-bhaktas (devotees who taste transcendental mellows) and it is he alone who fulfills the mano-bhistham, the heartfelt desire, of Sri Caitanya Mahaprabhu» (at his samādhi, 2005-08-17).
- **Bhakti-rasa** — «if Rupa Gosvami had not appeared on this planet, there would not have been anyone to tell us that bhakti also means rasa. Bhakti-rasa was defined and explained only by Srila Rupa Gosvami» (1995-08-08). «There is great difference between bhakti and bhakti-rasa. So before Rupa Gosvami, it was bhakti, but not bhaktirasa» (Ṭer Kadamba, 1997-11-08). «Previously no one had given such a beautiful and complete definition of bhakti» (2000-08-19).
- **Parakīya-rasa** — «He especially used the Srimad-Bhagavatam as evidence to establish that parakiya-rasa is not only bona fide, but it is the highest devotion. He established this truth in such a strong way that all the other sampradayas had to bow their heads and accept it» (2005-08-17).
- **Mahāprabhu's identity** — «Only Rupa Gosvami could completely describe it. All others were checked, but Rupa Gosvami could not be checked. Mahaprabhu chose him to reveal Himself to this world» (2005-08-17). «All rupanugas are raganugas, but not all followers of the path of raganuga-bhakti are rupanugas» (2005-08-17).
- **Rūpa-mañjarī** — «He is so very beautiful; his own form is very beautiful because within he is Rupa Manjari and outwardly he is Rupa Goswami» (1995-08-08). «Rupa Manjari is even more special than Lalita and Vishaka» (1999-08-23). Kavi Karṇapūra's verse on his samādhi, «priya-svarupe dayita-svarupe», calls him the friend of Svarūpa Dāmodara: «Rupa Gosvami is therfore anu-svarupa damodara, he who has all the qualities of Lalita» (2000-08-19).
- **Ṭer Kadamba** — «At that time, it was full of serpents, tigers also, so many dangerous animals. But Rupa Gosvami used to live here» (1997-11-08). «while describing their meeting, fresh, new leaves used to come on this tree, and when he used to explain the separation mood of Radha and Krishna, at that time all the leaves used to dry up and come down» (1997-11-08).
- **The khīr of Rādhikā** — a girl came with milk and rice: «Baba, My mother has sent Me, you were talking and talking» (1997-11-08); Sanātana tasted it and wept: «This girl was not any common girl. She was surely Srimati Radhika» (1997-11-08); «Dont desire anything. Otherwise, to fulfil your desire, She must have come and served you» (1997-11-08).
- **Vallabhācārya** — «At the time that Srila Rupa gosvami was writing hisBhakti Rasamrta Sindhu, Srila Vallabhacarya came to visit him» (Sydney, 1998-01-02); «Srila Rupa gosvami had previously been introduced to Srila Vallabhacarya bySri Caitanya Mahaprabhu in a small village near Prayaga» (1998-01-02).
- **Raghunātha dāsa's separation** — at his departure Raghunātha dāsa wrote that «in the absence of Sri Rupa Gosvami, Vrajabhumi seems completely empty and void» (1999-08-23).
- **Our only treasure** — explaining Narottama's song: «The lotus feet of Srila Rupa Gosvami are our only treasure; not mundane wealth, power, etc.» (1995-08-08). «…for this reason that our most serious bhajana is to understand what Srila Rupa Goswami has written in his literatures» (1995-08-08).

## Sources

${SRC}: «The Disappearance Day of Srila Rupa Gosvami» (Rūpa-Sanātana Gauḍīya Maṭha, Vṛndāvana, 8 August 1995); «Sri Rupa Goswami's Bhajana-sthali at Ter Kadamba» (Vraja-maṇḍala parikramā, 8 November 1997); «How to Come Out of Maya» (Sydney, 2 January 1998); «The Disappearance Day of Srila Rupa Gosvami» (Rādhā-Dāmodara Mandira, Vṛndāvana, 23 August 1999); «Rupa Gosvami's Disappearance Day» (Rādhā-Dāmodara Mandira, 19 August 2000); «If Rupa Gosvami Had Not Come» (at his samādhi, Vṛndāvana, 17 August 2005).`,
  },
];

await aplicar(F);
