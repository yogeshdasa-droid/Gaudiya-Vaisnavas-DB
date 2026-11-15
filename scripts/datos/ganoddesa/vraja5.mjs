// node vraja5.mjs → vraja5.json («Vraja-Nitya-līlā», tanda 5: Śrī Rādhā and Śrī Kṛṣṇa, 15-11-2026).
// 274 Gadādhara Paṇḍita (Rādhā; Lalitā also entered him) and 164 Mahāprabhu (Kṛṣṇa, with the Svapna-vilāsāmṛtāṣṭaka
// printed at the end of the Ujjvala-nīlamaṇi-kiraṇa, pp. 53–62).
// Not given a text: 961 Nakula Brahmacārī and 1099 Pradyumna Miśra («Lord Gaura Himself», an āveśa — no Vraja form).
import fs from "node:fs";
const UNK = "Ujjvala-nīlamaṇi-kiraṇa";
const GC = "Gopāla-campū";

const plan = [
  {
    id: 274,
    name: "Śrī Gadādhara Paṇḍita Gosvāmī",
    text: `## In the Vraja-nitya-līlā

**Śrī Rādhā**, the daughter of Vṛṣabhānu and Kīrtidā, «the most beloved of all Śrī Kṛṣṇa's gopīs, the most exalted of all śaktis (potencies), the embodiment of the most exalted state of mahābhāva and non-different from Śrī Kṛṣṇa's own life». (The Gaura-gaṇoddeśa-dīpikā says that **Lalitā** also entered Gadādhara: see her below.)

## ${UNK} — Her nature

> śrīmatī rādhikā vāmā madhyā nīla-vastrā rakta-vastrā ca (Nāyikā-svabhāva, text 3)

«Śrīmatī Rādhikā is vāmā (left wing) and madhyā (moderate). Sometimes She wears a blue skirt and sometimes a red one; at times a blue veil and at other times a red one. She is the most beloved of all Śrī Kṛṣṇa's gopīs, the most exalted of all śaktis (potencies), the embodiment of the most exalted state of mahābhāva and non-different from Śrī Kṛṣṇa's own life» (p. 20).

- **Dhīrādhīrā-madhyā** (Nāyikā-vibhāga, text 2: «miśrita-vākyā yā sā dhīrādhīra-madhyā śrī-rādhā»): «The heroine who chastises the hero with a combination of soft and harsh language is dhīrādhīrā-madhyā. Śrīmatī Rādhikā's nature is in the category of dhīrādhīrā-madhyā. She is superior to all others in this category» (p. 12).
- **Parakīyā**: «The prauḍhā beloveds of Śrī Kṛṣṇa, such as Śrīmatī Rādhikā, are certainly parakīyā» (p. 8); she is *nitya-siddha*, eternally perfect, like Candrāvalī (p. 15).
- **Her pleasure potency**: «Śrīmatī Rādhikā is His constitutional pleasure potency (svarūpa-bhūtā-hlādinī-śakti), or transcendental potency (parā-śakti). The other gopīs are Śrīmatī Rādhikā's direct and non-different expansions (kāya-vyūha), manifestations (prakāśa) or partial manifestations (aṁśa-svarūpa)» (pp. 3–4).
- **Her group**: Lalitā and Viśākhā are of Her own party (*sva-pakṣa*); Śyāmalā's group is friendly to Her (*suhṛt-pakṣa*); Bhadrā is neutral (*taṭasthā*); Candrāvalī is the rival (*vipakṣa*) (p. 19). Her eight dearest sakhīs, though «equally affectionate to both Śrī Rādhā and Śrī Kṛṣṇa… are partial toward Śrīmatī Rādhikā» (p. 25); the prāṇa-sakhīs «are equal in beauty to Vṛndāvaneśvarī Śrīmatī Rādhikā» (p. 24). Her age: «ripening youth (vyakta-yauvana)» (p. 26).

## ${UNK} — Her love

- **Madhu-sneha**: «Śrīmatī Rādhikā and Her sva-pakṣa sakhīs possess madhu-sneha, which is permeated with madīyatā-bhāva, the feeling that ‘Śrī Kṛṣṇa is mine'. The sneha of Śrīmatī Rādhikā does not depend on any other bhāva. It is supremely palatable on its own, just as honey is relishable even without the addition of any other substance» (Rati-bheda, p. 39). «Both types of lalita-māna are seen in Śrīmatī Rādhikā and Her sakhīs» (p. 40).
- **Mañjiṣṭhā-rāga**: «Śrīmatī Rādhikā and the gopīs who follow Her possess mañjiṣṭhā-rāga, which is independent, having no basis other than itself. It eternally increases and becomes more and more splendid» (p. 41).
- **The abode of love**: «Śrīmatī Rādhikā is the shelter (āśraya) of anurāga, and Śrī Kṛṣṇa is its object (viṣaya). The son of Nanda… is the ultimate limit of viṣaya-tattva, and Śrīmatī Rādhikā is the ultimate limit of āśraya-tattva» (pp. 41–42).
- **Modana and mohana**: «This modana is present only in Śrīmatī Rādhikā's group, not in others.» «When this mohana-bhāva rises in Śrīmatī Rādhikā's heart in Her agony of separation, Śrī Kṛṣṇa, even if in the embrace of Satyabhāmā or another Dvārakā queen, falls unconscious… which makes even lower life forms such as birds and beasts cry» (p. 43). Its *divyonmāda*: Her decorating Herself in an arbour for Kṛṣṇa after He left for Mathurā, Her chastising the dark rain clouds; the ten kinds of *citra-jalpa* of the Bhramara-gītā (p. 44).
- **Mādana** (*eṣa eva mādanaḥ sarva śreṣṭhaḥ śrī-rādhāyām eva nānyatra*, text 14): «Mādana-mahābhāva… is the immutable essence of the great potency called hlādinī… and it remains forever present only in Śrīmatī Rādhikā… envying even a flower garland, a desire to take birth as an untouchable Pulinda girl, and great admiration for a simple mālatī vine that touches a tamāla tree… it does not manifest even in Her dearest parama-preṣṭha-sakhīs, such as Śrī Lalitā» (p. 45).
- In Dvārakā, «Satyabhāmā and Lakṣmaṇā bear some resemblance to Śrīmatī Rādhikā from the perspective of form, qualities and moods of contrariness» (Āśraya-nirṇaya, text 15, p. 46).

## ${GC} — Śrī Rādhā

- **Her birth** (Pūrva-campū 15.13–21): «As the full moon is chief among the constellations, Rādhā is chief among the Lakṣmīs» (verse 5). «Rādhā accepted birth in the ocean of a great cowherd named Vṛṣabhānu of good family and great wealth.» «She took birth when the moon was in Anurādhā constellation, bringing joy to all, one year after the birth of Kṛṣṇa.» «Rādhā grew just as Kṛṣṇa grew» (verse 9); as a little girl, «She has a pink cloth over her lower limbs. There is delicate thread in her newly pierced ears. With wandering eyes she plays with her friends in the dust» (verse 10).
- **With Yaśodā** (Pūrva-campū 2.10–13, verse 5): Yaśodā asked, «All the young girls have come, but Rādhā, my very life, has not come?» «When Rādhā touched her feet, Yaśodā touched her head… Both gazed at each other with tears in their eyes.» Rohiṇī: «Lalitā and others are her expansions» (2.15).
- **In the rāsa** (Pūrva-campū 25, verse 36): «How can one describe the prema of the gopī whose prema spread anger, though uselessly, and whose eyes became weapons which, though motionless, shot arrows… and gave pain to Kṛṣṇa though not injuring him? This gopī was Rādhā situated in front of him.» «Lalitā and others are situated on the petals of the lotus of the rāsa arena and Rādhā is in the center» (Uttara-campū 37, verse 130).
- **Paurṇamāsī's letter** (Uttara-campū 31, verse 45): «O Rādhā! You are named Rādhā. Your father is Vṛṣabhānu. Your mother is Kīrtidā. Yaśodā is your mother-in-law. Your friends are Lalitā and Viśākhā. The forests where Kṛṣṇa plays are your dwelling place. Kṛṣṇa is your husband at all times.»
- **Her wedding** (Uttara-campū 35, verse 36): «Vṛṣabhānu, with tears in his eyes, with his trembling, damp hand took Rādhā's trembling hand and offered it to Kṛṣṇa's trembling hand.» Vṛṣabhānu to Kṛṣṇa: «From her childhood my Rādhā has acted lifeless. Do not become angry at my fault» (35.37). Then (Uttara-campū 36) Rādhā asks Kṛṣṇa to «satisfy Lalitā and Viśākhā and many others of my group who endeavor for my happiness and never care for their own happiness» (verse 59), and dresses Him in her clothing to tease them (36.89).
- «Filled with extreme desire because of joy, Rādhā appears in Kṛṣṇa's heart and also appears outside» (Uttara-campū 37, verse 130). The final praise: «O Rādhā! O Rādhā! Daughter of Vṛṣabhānu! Lakṣmī serves you. You are the best among all the men and women of Vraja» (37.92).
- **In Dvārakā** (Uttara-campū 17, verse 53): «Rādhā was Satyabhāmā.»

## Lalitā, who also entered him

The Ujjvala-nīlamaṇi-kiraṇa makes Śrī Lalitā «prakharā (harsh)… the most prominent of Śrīmatī Rādhikā's sakhīs», dressed like a peacock's tail, one of the three in whom mohana-mahābhāva is present (pp. 20, 46); the Gopāla-campū calls her also **Anurādhā** (Pūrva-campū 17.42) and gives her mood: «We think happiness is seeing Rādhā worship Kṛṣṇa who worships the gopīs' sweetness» (Uttara-campū 36, verse 24). (More in the record of Dhruvānanda Brahmacārī.)

## Sources

${UNK}, pp. 3–4, Nāyikā-vibhāga 2 (pp. 6–15), Nāyikā-svabhāva 3 (pp. 17–21), Sakhī-bheda 5 (pp. 23–25), Vayo-bheda (p. 26), Rati-bheda 12–14 (pp. 36–45), Āśraya-nirṇaya 15 (pp. 45–46); ${GC}, Pūrva 2.10–15, 15.13–21, 17.42, 25.36; Uttara 17.53, 31.45, 35.36–37, 36.24, 36.59, 36.89, 37.92, 37.130.
`,
  },
  {
    id: 164,
    name: "Śrī Caitanya Mahāprabhu",
    text: `## In the Vraja-nitya-līlā

**Śrī Kṛṣṇa**, the son of Nanda and Yaśodā, «the crest jewel of all heroes», who is «the most complete hero» in Gokula — and Śrī Rādhā saw Him in a dream as a golden brāhmaṇa youth weeping for Her, Śrī Gaurāṅga.

## ${UNK} — Śrī Kṛṣṇa, the hero

- «In ujjvala-bhakti-rasa… Śrī Kṛṣṇa alone is the crest jewel of all heroes, or nāyakas. The crest jewel of all heroes (nāyaka-cūḍāmaṇi) Śrī Kṛṣṇa is present in Gokula, Mathurā and Dvārakā. In Dvārakā, Śrī Kṛṣṇa is the complete hero (pūrṇa nāyaka), in Mathurā, He is the more complete hero (pūrṇatara nāyaka), and **in Gokula, He is the most complete hero (pūrṇatama nāyaka)**» (p. 2).
- «Śrī Kṛṣṇa is nava-kiśora-naṭavara, an ever-fresh youth and an expert dancer. He is endowed with all kinds of the above-mentioned qualities [of the nāyakas] in full, and He is the object (viṣaya-ālambana) of this ujjvala-rasa» (p. 5). «The son of Nanda, Śrī Kṛṣṇa, the embodiment of the amorous mellow (śṛṅgāra), is the ultimate limit of viṣaya-tattva, and Śrīmatī Rādhikā is the ultimate limit of āśraya-tattva» (p. 42).
- As *upapati* of the gopīs: «it is not applicable to Śrī Kṛṣṇa, because Śrī Kṛṣṇa Himself is the controller, or regulator, of all religion and irreligion and the original fountainhead of all incarnations of Bhagavān. Śrīmatī Rādhikā is His constitutional pleasure potency» (pp. 3–4).

## The dream of Śrī Rādhā (Svapna-vilāsāmṛtāṣṭakam)

At the end of the Ujjvala-nīlamaṇi-kiraṇa is Śrīla Viśvanātha Cakravartī Ṭhākura's *Svapna-vilāsāmṛtāṣṭakam*, «Eight Verses Describing Nectarean Pastimes within a Dream». It begins with Svarūpa Dāmodara's verse:

> rādhā kṛṣṇa-praṇaya-vikṛtir hlādinī śaktir asmād
> ekātmānāv api bhuvi purā deha-bhedaṁ gatau tau
> caitanyākhyaṁ prakaṭam adhunā tad-dvayaṁ caikyam āptaṁ
> rādhā-bhāva-dyuti-suvalitaṁ naumi kṛṣṇa-svarūpam

«Śrīmatī Rādhikā is the very embodiment of the divine pleasure potency (hlādinī-śakti) and is a transformation of Śrī Kṛṣṇa's love… Śrī Kṛṣṇa and Śrī Rādhā are essentially one soul… Now the same Śrī Rādhā and Śrī Kṛṣṇa have become one and have appeared in the form of Śrī Caitanya Mahāprabhu» (pp. 53–54).

> priya! svapne dṛṣṭā saridina-suvevābra pulinaṁ
> yathā vṛndāraṇye naṭana-paṭavas tatra bahavaḥ
> mṛdaṅgādyaṁ vādhyaṁ vividham iha kaścid dvija-maṇiḥ
> sa vidyud-gaurāṅgaḥ kṣipati jagatīṁ prema-jaladau (1)

- (1) «Once at the very end of night (niśānta), Śrīmatī Rādhikā said to Śrī Kṛṣṇa, “O My beloved, tonight I had a dream. In that dream, I saw a place with a river that looked just like the river Yamunā… Most of the people there were expert in dancing and playing mṛdaṅgas… I saw an incomparably beautiful youth (kiśora), the crest jewel of the twice born. His fair complexion was like a blaze of lightning. This golden-limbed youth, the best of the brāhmaṇas, was drowning the whole universe in an ocean of prema.”» — «It proves that even before Śrī Caitanya Mahāprabhu's advent, He is present during Śrī Śrī Rādhā-Kṛṣṇa's pastimes.»
- (2) «Gaurāṅga-sundara… was sometimes weeping and loudly calling out, “Hā Kṛṣṇa! Hā Kṛṣṇa!”… He sighed, “O Rādhe! Where are You?” Sometimes He fell upon the earth… Sometimes He danced in bliss… His behaviour caused all the residents in the entire universe – from lowly blades of grass to the residents of Brahmaloka – to weep bitterly.»
- (3) «Is this golden-limbed youth none other than the most beloved Lord of My life, Śrī Kṛṣṇa? If this is so, then where am I?… I again thought this brāhmaṇa to be none other than Myself. But if I am this brāhmaṇa, where is the Lord of My life, Śrī Mādhava?»
- (4) Kṛṣṇa: «I have shown You My unlimited forms such as Anantaśāyī Nārāyaṇa, but You never once became astonished like now… Who is this golden limbed brāhmaṇa?» (Once Rādhā had told Him that men cannot know women's hearts; He answered, «In another form, I realize Your feelings», and showed Her Gaurāṅga in the dream.)
- (5–6) Kṛṣṇa smiled and twirled His Kaustubha jewel, which showed the same vision; Rādhā said: «You, personally, are none other than that best of golden-complexioned brāhmaṇas I saw in My dream; Your mild smile is declaring that You are He… I feel that You and I have combined in the form of Gaurāṅga.»
- (7) «It seems that You will appear along with Your own potencies (śaktis) and reveal Yourself and all Your pastimes to every living entity, and You will again drown this universe… in the ocean of prema.»
- (8) «Gargācārya, informed Your father, Śrī Nanda… ‘later, in another yuga, He will appear with a golden complexion.’ His statements have not proved false, so My dream is indeed genuine.»
- (9) Those who drink this nectar «will awaken from the slumber of doubting whether Śrī Kṛṣṇa, the son of Nanda Mahārāja, is the same as Śrī Gaura, the son of Mother Śacī» (pp. 55–62).

## ${GC} — Śrī Kṛṣṇa in Vraja

- **His birth** (Pūrva-campū 3, verses 27–37): «on the eighth lunar day of the waning moon in Bhādra month, on Wednesday, when the moon rose in faultless Rohiṇī constellation… the perfect Lord, the moon of Kṛṣṇa, appeared in order to increase the affection of Yaśodā, Nanda's wife.» «Kṛṣṇa had already appeared with two arms within Yaśodā along with Yogamāyā» (3.102). «The body of the child was more resplendent than a shining sapphire… When she saw this beautiful child, Yaśodā became stunned like a painted picture» (verse 36).
- **In Goloka** (Pūrva-campū 1, verse 68): «Nanda and Yaśodā, like the sun and moon, followed by their affectionate associates, like the constellations, revolve in the zodiac of Kṛṣṇa's beauty, pulled by the strong rope of prema.»
- **With His friends** (Uttara-campū 1, verse 15): «Kṛṣṇa in relation to his friends like Śrīdāma was like the chief life air in relation to the other bodily airs.» «He was the essence of the heart to the cowherds… He was the life air shining in the heart of his parents. He was the ātmā of the gopīs» (2, verse 4).
- **Who He is** (Uttara-campū 31, verse 46): «Holder of Govardhana! Your father and mother are Nanda and Yaśodā. Rādhikā is your beloved. Śrīdāma and Subala are your friends. Balarāma is your elder brother. The flute is your music. The peacock feather is your» ornament.
- **His wedding with Rādhā** (Uttara-campū 35, verse 36): «Vṛṣabhānu, with tears in his eyes, with his trembling, damp hand took Rādhā's trembling hand and offered it to Kṛṣṇa's trembling hand.»

## Sources

${UNK}, pp. 2–5, 42, and the Svapna-vilāsāmṛtāṣṭakam (pp. 53–62); ${GC}, Pūrva 1.68, 3.27–37, 3.102; Uttara 1.15, 2.4, 31.46, 35.36.
`,
  },
];
fs.writeFileSync(new URL("./vraja5.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length + " fichas");
