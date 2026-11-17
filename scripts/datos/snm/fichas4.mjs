// node fichas4.mjs [puerto] [--dry]   (17-11-2026) — conferencias de SNM, tanda 4: Śrīla Bhaktivinoda Ṭhākura (#128).
// Citas comprobadas con chk.mjs (fecha de la charla entre paréntesis).
import { aplicar, SRC } from "./aplicar.mjs";

const F = [
  {
    id: 128,
    name: "Śrīla Bhaktivinoda Ṭhākura",
    notes:
      "From the lectures of Śrīla Nārāyaṇa Gosvāmī Mahārāja: his father died when he was very young and he was raised in his maternal uncle's house at Ulāgrāma; in Calcutta he was friendly with the Tagore family and opposed the Brāhma Samāja in Prema-pradīpa; he was a teacher at his grandfather's home in Orissa; as deputy magistrate of Purī and supervisor of the Jagannātha temple he refused a bribe of 300,000 rupees to put a statue of a dog on the temple, and arrested the yogī Bisakisena (Bhibikasena in the lecture) who claimed to be Kṛṣṇa; he did bhajana and wrote from midnight to 4 a.m.; at Rādhā-kuṇḍa he met Jagannātha dāsa Bābājī, then 144 years old; after retiring he lived at Surabhi-kuñja and then Svānanda-sukhada-kuñja in Godruma; he is a manifestation of Gadādhara Paṇḍita and, in Rādhā-Kṛṣṇa's pastimes, Kamala-mañjarī; he entered the midday pastimes of Rādhā-Kṛṣṇa in Calcutta on 23 June 1914 (see the text «In the lectures…»).",
    set: {
      disappearance: "Āṣāḍha Amāvasyā, the day of Gadādhara Paṇḍita (Gauḍīya calendar); 23 June 1914, at Calcutta",
    },
    text: `## In short

For Śrīla Nārāyaṇa Gosvāmī Mahārāja, Śrīla Saccidānanda Bhaktivinoda Ṭhākura is the «Seventh Gosvāmī», who brought the Ganges of pure bhakti back to a world where Gauḍīya Vaiṣṇavism had become a byword for sahajiyā malpractice, and who gave two great gifts: the birthplace of Śrī Caitanya Mahāprabhu and his son, Śrīla Bhaktisiddhānta Sarasvatī. Born in Ulāgrāma (Vīra-nagara) in Nadia, he lost his father young, grew up in his maternal uncle's house, studied in Calcutta, and wrote Prema-pradīpa against the Brāhma Samāja of his friends the Tagores. As deputy magistrate of Purī and supervisor of the Jagannātha temple he refused a huge bribe to put a dog on the temple, and arrested with his own hands the false yogī Bisakisena (Bhibikasena in the lecture), cutting off his flaming locks. He did bhajana and wrote poetry from midnight to four in the morning before writing his judgments. At Rādhā-kuṇḍa he met the 144-year-old Jagannātha dāsa Bābājī and told his disciples to obey their guru and grow vegetables for Ṭhākurjī rather than imitate the bābājīs. His Jaiva-dharma and Bhajana-rahasya give the true process for siddha-deha. He is a manifestation of Gadādhara Paṇḍita, Kamala-mañjarī in Rādhā-Kṛṣṇa's pastimes, and he departed on Gadādhara Paṇḍita's disappearance day.

## In the lectures

- **The Seventh Gosvāmī** — «He is considered to be the Saptama (seventh) Gosvami, and he has written more than one hundred very authorized books in many languages. He has especially given us two very important gifts. He discovered the birthplace of Sri Caitanya Mahaprabhu, and he gave us Srila Bhaktisiddhanta Sarasvati Prabhupada» (Vienna, 2002-09-19). «Just as King Bhagiratha brought the Ganges River to the Earth, to India, Srila Bhaktivinoda Thakura brought the bhakti-ganga (the flowing Ganges River of bhakti) to this world» (France, 1997-05-28).
- **Youth** — «His father passed away when he was very young, and he was raised in his maternal uncles house in Ulagrama and later on he was brought to Calcutta» (2002-09-19). «He was very friendly with the family of Rabindrinatha Tagore» (2002-09-19); «In his book Prema-pradipa, Srila Bhaktivinoda Thakura opposed the philosophical principles of the Brahma Samaja» (2002-09-19).
- **In Purī** — «After that he went to Jagannatha Puri and was appointed deputy magistrate for that district» (2002-09-19). «The members of one group offered him a bribe of 300,000 rupees and told him, "We want to put a statue of a dog on the top of the Jagannatha Temple» (2002-09-19). «Srila Bhaktivinoda Thakura refused to accept the enormous bribe and he forcefully rejected their request» (2002-09-19).
- **The false yogī** — the yogī Bisakisena (Bhibikasena in the lecture) declared «I am Sri Krsna, the Supreme Personality of Godhead» (2002-09-19). When the police ran away, «Srila Bhaktivinoda Thakura leapt forward, grabbed Bhibikasena by the hair, and forcibly cut off his matted locks with a pair of scissors» (2002-09-19). To his wife, afraid of the yogī's curse: «Oh, I will not die. The pain is here only for the moment. It will pass» (2002-09-19). The yogī «was sent to prison, where he died from a self-imposed fast» (2002-09-19).
- **His bhajana** — «The Thakura was accustomed to awakening in the night at about 12:00 am, performing bhajana, and writing transcendental poems until 4:00 am» (2002-09-19).
- **Jagannātha dāsa Bābājī** — «At Radha Kunda, he met Jagannatha dasa Babaji Maharaja, who was 144 years old at that time» (2002-09-19). To the Bābājī's disciples, who did not want to grow vegetables: «You should try to serve your Gurudeva and follow his orders» (2002-09-19).
- **Jaiva-dharma** — «Srila Bhaktivinoda Thakura clearly explained the entire process for achieving spiritual perfection in his final literary work, Jaiva-dharma» (1997-05-28).
- **His life, by Śrīla Keśava Gosvāmī** (introduction to Jaiva-dharma, read on his appearance day) — «There is not a single instruction in his books that he did not personally follow» (2009-09-02). «Srila Bhaktivinoda Thakura appeared on September 2, 1838» (2009-09-02); «He disappeared from this world on June 23, 1914, in the city of Calcutta, at which time he entered the midday pastimes of Sri Sri Gandharvika-Giridhari» (2009-09-02). «At that time, he established an asrama at Surabhi-kunja in Godrumadvipa» (2009-09-02); later «he accepted the life of an ascetic, and stayed at Svananda-sukhada-kunja» (2009-09-02).
- **Gadādhara Paṇḍita and Kamala-mañjarī** — «Srila Bhaktivinoda Thakura is a manifestation of Srila Gadadhara Pandita» (2002-07-11). «He is Kamala Manjari, serving the Divine Couple Sri Sri Radha-Krsna under the guidance of her beautiful friend Rupa Manjari» (2002-07-11).

## Sources

${SRC}: «The Glories of Srila Bhaktivinoda Thakura» (France, June 1997; listed under 1997-05-28); «Srila Gadadhara Pandita's and Srila Bhaktivinoda Thakura's Disappearance Day» (11 July 2002); «Appearance of Srila Bhaktivinoda Thakura» (Vienna, 19 September 2002); «Srila Bhaktivinoda Thakura's Appearance Day» (2 September 2009: the sketch of his life by Śrīla Bhakti Prajñāna Keśava Gosvāmī from his introduction to Jaiva-dharma).`,
  },
];

await aplicar(F);
