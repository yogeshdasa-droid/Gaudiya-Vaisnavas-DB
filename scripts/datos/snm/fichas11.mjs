// node fichas11.mjs [puerto] [--dry]   (17-11-2026) — conferencias de SNM, tanda 11: Śrī Rāmānujācārya (#1289).
// Citas comprobadas con chk.mjs. El sannyāsa «ante el cuerpo de Yāmunācārya» (2007) va solo al texto y a las notas.
import { aplicar, SRC } from "./aplicar.mjs";

const F = [
  {
    id: 1289,
    name: "Śrī Rāmānujācārya",
    notes:
      "From the lectures of Śrīla Nārāyaṇa Gosvāmī Mahārāja: an incarnation of Lakṣmaṇa, ācārya of the Śrī-sampradāya; Śrīla Bhaktisiddhānta Sarasvatī took about 108 of his teachings (duties of sannyāsīs and disciples, Vaiṣṇava etiquette); he wept when his teacher Yādavācārya compared the Lord's eyes to a monkey's rear and explained «kapyāsa» as the lotus; saved in the forest from his teacher's plot by Lakṣmī-Nārāyaṇa as a hunter and his wife; left his quarrelsome wife, who had insulted Kāñcīpūrṇa's wife, by a letter «from her father»; at Śrī Raṅgam Yāmunācārya's three closed fingers opened at his three vows (the Śrī-bhāṣya, preaching, Vaiṣṇava etiquette) — in this lecture he took tridaṇḍa-sannyāsa there, before Yāmunācārya's body; he served Yāmunācārya's disciples before accepting the seat of ācārya; Kureśa went to the Coḷa king in his place and was blinded (see the text «In the lectures…»).",
    text: `## In short

On his appearance and disappearance days Śrīla Nārāyaṇa Gosvāmī Mahārāja told the life of Śrī Rāmānujācārya, an incarnation of Lakṣmaṇa — Rāma-anuja, «the younger brother of Rāma» — and the ācārya of the Śrī-sampradāya, from whom Śrīla Bhaktisiddhānta Sarasvatī took about 108 teachings on the duties of sannyāsīs and disciples and on Vaiṣṇava etiquette. Born in a simple, learned brāhmaṇa family, he wept when his Māyāvādī teacher Yādavācārya compared the Lord's eyes to a monkey's rear, and explained «kapyāsa» as the lotus that blossoms under the sun; the teacher plotted to kill him in the forest, and Lakṣmī-Nārāyaṇa, as a hunter and his wife with a lantern, led him home. When his quarrelsome wife insulted the wife of Kāñcīpūrṇa, his low-born śikṣā-guru, and drove away a hungry brāhmaṇa, he sent her to her father's house with a letter of his own and left for Śrī Raṅgam — arriving as Yāmunācārya's body was being carried to samādhi. Three of the fingers were closed; at each of his three vows — the Śrī-bhāṣya, to preach, and to write Vaiṣṇava etiquette — one opened. Chosen as ācārya, he first served each of Yāmunācārya's disciples. When the Coḷa king wanted him killed, his disciple Kureśa went in his place, defeated the king's paṇḍitas and was blinded.

## In the lectures

- **Lakṣmaṇa** — «Sri Ramanujacarya was born in South India. He is an incarnation of Laksmana» (North Shore, Hawaii, 2007-01-26). «Srila Prabhupada utilized about 108 teachings of Sri Ramanuja» (Mathurā, 2000-04-09).
- **«Kapyāsa»** — «He concluded that Krsna's lotus eyes are like a monkey's rear-end. Hearing this, Ramanuja began to weep» (2007-01-26). «The lotus blossoms by the potency of the sun, and therefore the Lord's eyes are compared to the lotus, not the monkey» (2007-01-26).
- **Saved in the forest** — «Govinda, his cousin-brother, told him of their plan, and urged him to quickly flee from there» (2007-01-26). «He understood that it was certainly the Supreme Personality of Godhead, Narayana Himself, along with His eternal consort, Laksimi-devi, who had saved his life» (2007-01-26). «After some years, Ramanuja converted Yadavacarya to Vaisnava philosophy, whereupon his teacher became his disciple» (2007-01-26).
- **Kāñcīpūrṇa** — «He was from a very low-caste family, but he was a very high-class devotee» (2007-01-26). «Ramanuja accepted Kancipurna as a siksa-guru» (2007-01-26). «She is committing vaisnava-aparadha; she has such an offensive mentality» (2007-01-26).
- **The letter** — «O my dear daughter, I am arranging the marriage of my son, your brother» (2007-01-26).
- **Yāmunācārya's fingers** — «Ramanuja could see that three of Yamunacarya's fingers were folded» (2007-01-26). «He promised in front of all present, 'I will write the Sri-bhasya commentary on the Vedanta-sutra. One of the fingers immediately became straight» (2007-01-26). «Then and there, Sri Ramanujacarya formally accepted tridandi sannyasa from Sri Yamunacarya» (2007-01-26).
- **Serving his godbrothers** — «Give me time. Give me two years» (2007-01-26). «Only after hearing from them for two years did he accept the post of acarya» (2007-01-26).
- **Kureśa** — «Gurudeva, please do not go. I will go in your place. Please give me your danda and sannyasa cloth» (2007-01-26). «They forcibly detained him, and only released him after blinding him by plucking out both of his eyes» (2007-01-26).

## Sources

${SRC}: «Appearance Day of Ramanujacarya» (Mathurā, 9 April 2000); «The Glories of Ramanujacarya» (North Shore, Hawaii, 26 January 2007, his disappearance day, with passages of his lecture in Mathurā in 2000).`,
  },
];

await aplicar(F);
