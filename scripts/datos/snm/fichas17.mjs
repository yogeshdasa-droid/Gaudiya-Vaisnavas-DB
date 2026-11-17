// node fichas17.mjs [puerto] [--dry]   (17-11-2026) — conferencias de SNM, tanda 17: Śrīla Bhaktivedānta Nārāyaṇa Gosvāmī
// Mahārāja (#1809), de sus propias palabras (sobre todo el esbozo autobiográfico de Olpe, 23-02-2003). «guru»: él dice
// tres veces que tomó sannyāsa en 1954 → primero eso, «1952» queda como «other sources». Citas comprobadas con chk.mjs.
import { aplicar, SRC } from "./aplicar.mjs";

const F = [
  {
    id: 1809,
    name: "Śrīla Bhaktivedānta Nārāyaṇa Gosvāmī Mahārāja",
    notes:
      "From his own lectures (autobiographical sketch, Olpe, Germany, 23 February 2003, and others): born in 1921 on the dark-moon night of Māgha; his parents, initiated in the Śrī-sampradāya, were expert in devotional music; the family guru named him Nārāyaṇa Tivārī, and because he never cried he was called Bholānātha; as a child he chanted «Rāma» and wept reading Tulasīdāsa's Rāmāyaṇa; first in his class and in races; he first saw nagara-saṅkīrtana at the Mahāvīrī Jhaṇḍā festival at Ahalyā's place on the Gaṅgā; a prize book on Nimbārka gave him taste for the name; after high school he joined the police at «Shahad Ganja», Dumka district; three years later a party of the Gauḍīya Vedānta Samiti (Narottamānanda Brahmacārī, Bhakti-kuśala Nṛsiṁha Mahārāja, Rādhānātha — later Trivikrama Mahārāja) spoke for seven days in his superintendent's house; he resigned and went straight to Navadvīpa, where Vāmana Mahārāja met him at midnight with a lantern; harināma and dīkṣā together soon after the parikramā; his family came to take him home, and his uncle, hearing him explain the philosophies, said «You have found a real guru»; his Guru wrote to him as «Tiwariji» before he joined; he took sannyāsa in 1954 (his own words); his Gurudeva, when he fell ill, ordered him to stop traveling, translate the Bengali books into Hindi and manage the magazine from Mathurā (see the text «In the lectures…»).",
    set: {
      guru: "Śrīla Bhakti Prajñāna Keśava Gosvāmī Mahārāja (harināma and dīkṣā on Gaura Pūrṇimā 1947; sannyāsa in 1954, in his own words — other sources: Gaura Pūrṇimā 1952)",
    },
    text: `## In short

In February 2003, in Olpe, Germany, Śrīla Bhaktivedānta Nārāyaṇa Gosvāmī Mahārāja told his own life to the disciple he had asked to write it. He was born in 1921 on the dark-moon night of Māgha, son of Paṇḍita Baleśvaranātha Tivārī and Lakṣmī-devī, initiated devotees of the Śrī-sampradāya; the family guru named him Nārāyaṇa Tivārī, and because the baby never cried he was called Bholānātha. As a boy he chanted «Rāma, Rāma» without knowing since when, wept for hours over Tulasīdāsa's Rāmāyaṇa and dreamed of Rāma, Lakṣmaṇa, Sītā and Hanumān; he was first in his class and in every race. He first saw nagara-saṅkīrtana at a festival on the Gaṅgā at Ahalyā's place, and a prize book on Nimbārka gave him a real taste for the name. After high school his sports won him a post in the police in the Dumka district. Three years later a party of the Gauḍīya Vedānta Samiti came to his superintendent's house, and Narottamānanda Brahmacārī spoke on Prahlāda for seven days, talking with him in English through the nights; he resigned, went straight to Navadvīpa — where Vāmana Mahārāja met him at midnight with a lantern — and received harināma and dīkṣā together. He swept the floors, cooked and washed for his Guru, lost his last lota in the Gaṅgā without regret, and when his family came to bring him home, his scholarly uncle, hearing him explain all the philosophies, embraced him: «You have found a real guru». He took sannyāsa in 1954, and later his Gurudeva settled him in Mathurā to translate the Bengali books into Hindi and run the magazine.

## In the lectures

- **Birth** — «I was born in 1921 on the amavasya (dark-moon) night in the month of Magha (January)» (autobiographical sketch, Olpe, 2003-02-23). «You did not cry, and you would remain seated wherever you were placed. For that reason everyone called you Bholanatha» (2003-02-23).
- **Childhood** — «Throughout my childhood I always chanted, "Rama, Rama, Rama, Rama, Rama, Rama," and I do not know since when I began» (2003-02-23). «No one dared enlist his name for a long race unless he planned to compete for second place, because everyone knew, "Narayana will be first» (2003-02-23).
- **The first kīrtana** — «It was at this festival that I heard and saw, for the first time in my life, a nagara-sankirtana in which thousands of people were dancing and singing» (2003-02-23). «As I read about the acaryas perfect Vaisnava demeanor, his deeds, his attachment for harinama, and his rigorous sadhana, I now began to acquire real taste for Krsna-nama» (2003-02-23).
- **The police** — «After high-school, because I was good at sports I was able to get a service in the police department without any effort» (2003-02-23). «Even before I joined, when I was a police officer and had never personally met Guru Maharaja, Guru Maharaja would write to me with great love and affection» (2002-11-07); he called him «Tiwariji» (2002-11-07).
- **Narottamānanda Brahmacārī** — «After listening to his hari-katha for those seven days and receiving his affection, I became completely renounced in my heart» (2003-02-23). «Understanding Guruji and the Vaisnavas to be my parents, I answered, "Yes, they do» (2003-02-23).
- **Navadvīpa** — «they had sent Pujyapada Vamana Gosvami Maharaja, with a lantern in his hand and accompanied by another brahmacari, to search for me» (2003-02-23). «Shortly after Navadvipa-dhama-parikrama was completed, I received both harinama and diksa initiations at the same time» (2003-02-23). «When I first met my Gurudeva, He took me from my worldly position; he took me by my sikha and dragged me» (2002-07-04).
- **Everything offered** — «I have given up all the love and affection I had for my wife, for my father and mother, and for my body. I forever offer everything unto your lotus feet. Hearing this, my Gurudeva began to weep» (2001-12-13).
- **The lota** — «This is good. Now the last material attachment has gone» (2003-02-23).
- **The family** — «But there is no sadhu-sanga here," I replied» (2003-02-23). His uncle: «You have found a real guru. You have attained sadhu-sanga» (2003-02-23).
- **Sannyāsa** — «I accepted sannyasa in 1954 and he accepted it in 1959, so with respect to the renounced order, I am senior to him» (2003-05-04).
- **Mathurā** — «my Gurudeva, Srila Bhakti Prajnana Kesava Gosvami Maharaja, therefore ordered me to stop traveling» (1992-00-02); «He told me that Ishould translate Bengali bhakti books into Hindi, and that I should manage the publishing of hismonthly magazine» (How to Be Kṛṣṇa Conscious While Sick, 1992-00-02).
- **His biography** — «You can write about me as I have written about my Guruji» (2003-02-23).

## Sources

${SRC}: «How to Be Krsna Conscious While Sick» (1992); «The Guru's Guru» (13 December 2001); «Attachment for Radha» (Badger, California, 2002-07-04); «The Disappearance of Srila Bhaktivedanta Vamana Gosvami Maharaja» (7 November 2002); «Srila Gurudeva's Auto-biographical Sketch» (Olpe, Germany, 23 February 2003, spoken in Hindi); «Sadhu-sanga — A Must» (2003-05-04).`,
  },
];

await aplicar(F);
