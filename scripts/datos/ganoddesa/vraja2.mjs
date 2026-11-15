// node vraja2.mjs → vraja2.json («Vraja-Nitya-līlā», tanda 2: the eight principal sakhīs, 15-11-2026).
// Ujjvala-nīlamaṇi-kiraṇa (Nāyikā-svabhāva text 3, Sakhī-bheda text 5, Āśraya-nirṇaya text 15) + Gopāla-campū.
// Whisper: longer is better; what the books say of the eight sakhīs in general goes to each one.
// Differences with the Rādhā-Kṛṣṇa-gaṇoddeśa-dīpikā (in their Gaṇoddeśa text) are noted, not «corrected»: only the
// colours of Citrā's dress (crystal there, blue in the Ujjvala) and Tuṅgavidyā's (light yellow there, white).
import fs from "node:fs";
const UNK = "Ujjvala-nīlamaṇi-kiraṇa";
const GC = "Gopāla-campū";

// What both books say of the eight sakhīs together
const EIGHT = `## ${UNK} — the eight dearest sakhīs

> tatra mukhyā yā sā parama-preṣṭha-sakhī |
> lalitā ca viśākhā ca citrā campaka-vallikā
> raṅgadevī sudevī ca tuṅgavidyendu-rekhikā
> yady apy etāḥ sama-snehās tathāpi śrī-rādhāyāṁ pakṣa-pātaṁ kurvanti (Sakhī-bheda, text 5)

«Among all of these sakhīs, the most prominent are the parama-preṣṭha-sakhīs. They are Lalitā, Viśākhā, Citrā, Campakalatā, Raṅgadevī, Sudevī, Tuṅgavidyā and Indulekhā. Even though these gopīs are equally affectionate (sama-sneha) to both Śrī Rādhā and Śrī Kṛṣṇa, still, they are partial toward Śrīmatī Rādhikā.»

- «All – Lalitā, Viśākhā, Indulekhā, Campakalatā, Citrā, Tuṅgavidyā, Raṅgadevī and Sudevī – who are in Śrīmatī Rādhikā's personal party (sva-pakṣa), are known as Her aṣṭa-sakhīs. Even though they are group leaders in their own right, when they are near Śrīmatī Rādhikā, they abandon this conception and serve the Divine Couple, Śrī Śrī Rādhā-Kṛṣṇa. They are also called parama-preṣṭha-sakhīs» (Nāyikā-svabhāva, p. 20).
- The five kinds of sakhīs (Sakhī-bheda): *sakhī* (more affection for Kṛṣṇa: Vṛndā, Kundalatā, Dhaniṣṭhā…), *nitya-sakhī* (more affection for Rādhā: Kastūrī, Maṇi-mañjarī…), *prāṇa-sakhī* (the chief nitya-sakhīs: Tulasī, Śaśimukhī, Madhumatī, Ratnāvalī…, «equal in beauty to Vṛndāvaneśvarī Śrīmatī Rādhikā»), *priya-sakhī* (Mālatī, Candralatikā, Guṇacūḍā, Varāṅgadā…, «ten million in number») and, above all, these eight *parama-preṣṭha-sakhīs* (pp. 23–25).
- **Their love**: «The highest point of samarthā-rati in the vraja-gopīs… extends to the stage of mahābhāva. Adhirūḍha-mahābhāva is seen only in Śrīmatī Rādhikā's group» (Āśraya-nirṇaya, text 15, p. 46). Rādhā «and Her sva-pakṣa sakhīs possess madhu-sneha, which is permeated with madīyatā-bhāva, the feeling that ‘Śrī Kṛṣṇa is mine'» (Rati-bheda, p. 38).

## ${GC} — Rādhā's sakhīs

- **Her expansions** (Pūrva-campū 2.15): Rohiṇī says to Yaśodā, of the cooking in Nanda's house: «Let all other women… follow after Rādhā. **Lalitā and others are her expansions.** We do not need to supply any other assistance.»
- **How they became Her sakhīs** (Pūrva-campū 15, verse 53): after Paurṇamāsī consoled the young gopīs and led them secretly towards Kṛṣṇa, «From that day, Viśākhā, Lalitā and others became the sakhīs of Rādhā. Padmā, Śaibya and others became the sakhīs of Candrāvalī.»
- **In the rāsa** (Uttara-campū 37, verse 130): «Lalitā and others are situated on the petals of the lotus of the rāsa arena and Rādhā is in the center. That is the usual arrangement.»
- **Rādhā's prayer for them** (Uttara-campū 36, verse 59): «Dear Kṛṣṇa, you must, with intimate pastimes, satisfy Lalitā and Viśākhā and many others of my group who endeavor for my happiness and never care for their own happiness.»
`;

const SOURCES_EIGHT = `${UNK}, Nāyikā-svabhāva 3 (pp. 17–20), Sakhī-bheda 5 (pp. 23–25), Rati-bheda (p. 38), Āśraya-nirṇaya 15 (pp. 45–46); ${GC}, Pūrva 2.15, 15.53; Uttara 36.59, 37.130`;

const nature = (mula, tr, extra = "") => `## ${UNK} — her nature

> ${mula} (Nāyikā-svabhāva, text 3)

${tr}
${extra}`;

const DEF = {
  vama: "- *Vāmā* (left-wing): «always eager to accept honour and are angered when there is any laxity in this regard. It is difficult for their nāyaka to control them» (p. 19).",
  daksina: "- *Dakṣiṇā* (right-wing): «behave with the hero in a straightforward manner. They are not very resolute when exhibiting a sulky mood (māna). Their speech is shrewd and logical, and they become controlled by the hero's praises» (p. 19).",
  prakhara: "- *Prakharā*: «These heroines use very harsh language out of arrogance. None can refute their harsh statements» (p. 18).",
  madhya: "- *Madhyā*: «These heroines are neither excessively harsh nor extremely soft» (p. 18).",
  mrdvi: "- *Mṛdvī*: «These heroines use very gentle language» (p. 18).",
};

const TUNGA = `## In the Vraja-nitya-līlā

**Śrī Tuṅgavidyā**, one of Śrī Rādhā's eight dearest sakhīs (*parama-preṣṭha-sakhīs*), right-wing and outspoken, dressed in white.

${nature("tuṅgavidyā dakṣiṇā prakharā śukla-vastrā ca", "«Tuṅgavidyā is dakṣiṇā and prakharā and wears white.»", [DEF.daksina, DEF.prakhara].join("\n"))}
${EIGHT}
## Compared with the Gaṇoddeśa

The Rādhā-Kṛṣṇa-gaṇoddeśa-dīpikā says «her clothes are light yellow»; the Ujjvala-nīlamaṇi-kiraṇa says she **wears white**. Whisper's rule: the Ujjvala-nīlamaṇi-kiraṇa and the Gopāla-campū take precedence. The Gopāla-campū does not name her.

## Sources

${SOURCES_EIGHT}.
`;

const plan = [
  {
    id: 216,
    name: "Dhruvānanda Brahmacārī",
    text: `## In the Vraja-nitya-līlā

**Śrī Lalitā** (also called **Anurādhā**), the most prominent of Śrī Rādhā's sakhīs, outspoken, dressed like a peacock's tail; one of the eight principal heroines of Vraja, in whom mohana-mahābhāva is present.

${nature("śrī-rādhāyāḥ sva-pakṣāḥ lalitā-viśākhādiḥ … lalitā prakharā śikhi-piñcha-vasanā", "«In relation to Śrīmatī Rādhikā, Lalitā and Viśākhā are sva-pakṣa, meaning they are in Her group.» «Śrī Lalitā is prakharā (harsh) and is the most prominent of Śrīmatī Rādhikā's sakhīs, or girlfriends. She wears a dress as stunning as the tail feathers of a peacock.» «All of these nāyikās possess golden complexions.»", DEF.prakhara)}
## ${UNK} — her love

> tatrāpi mohanaḥ śrī-rādhāyām eva; lalitā-viśākhayor api | mādanas tu rādhāyām eva (Āśraya-nirṇaya, text 15)

«Mohana-mahābhāva is present in Śrīmatī Rādhikā, Lalitā and Viśākhā, but mādana-mahābhāva is only ever present in Śrī Rādhā.»

${EIGHT}
## ${GC} — Lalitā

- **Anurādhā** (Pūrva-campū 17.42): «There were Rādhā's sakhīs like Viśākhā and Lalitā (also called Anurādhā) and Candrāvalī's sakhīs like Śaibya and Padmā.»
- **Bringing Rādhā to Kṛṣṇa** (Pūrva-campū 2, verses 47–49): when Rādhā hid from Kṛṣṇa and acted «as if she had never seen Kṛṣṇa before», «Firmly taking her two arms, Lalitā and Viśākhā led her [Rādhā] into the room… Kṛṣṇa then pulled her close.»
- **In the rāsa** (Pūrva-campū 25, verse 34): «One gopī bountifully drank the lotus face of Kṛṣṇa with her unblinking eyes, which resembled a pair of the best of bees. She relished his form.» — «This was Lalitā.»
- **Her songs and her sharp tongue**: at dawn «Lalitā began to sing a song in lalita-rāga of early morning» (Pūrva-campū 29.40); «Lalitā then spoke, using contradictory words» (30.60); «Lalitā spoke in anger, “Rādhā and her friends surpass Lakṣmī who surpasses all padminī girls”» (30.64).
- Kṛṣṇa, to reach Rādhā at night, «With the help of Lalitā he put on Viśākhā's clothing, or with Viśākhā's help would put on Lalitā's clothing» (Pūrva-campū 29, verse 5).
- The messengers' riddle named «Lalitā (desired object)» (Pūrva-campū 31, verse 32).
- **One of the eight heroines** of Vraja — Rādhā, Candrāvalī, Lalitā, Viśākhā, Bhadrā, Śyāmā, Padmā and Śaibyā (Uttara-campū 31.51). When Kṛṣṇa was far: «Famous Candrāvalī is stunned. Viśākhā is perspiring. **Lalitā has become pale.** Rādhā has fainted. The eight gopīs are afflicted by eight sāttvika-bhāvas» (Uttara-campū 36, verse 8).
- **Her mood** (Uttara-campū 36.60, verse 24): «Lalitā and Viśākhā, among the eight principal heroines, take pleasure in being in his inner circle of devotees… “Let some women worship Kṛṣṇa for their own happiness. Let others worship him for his happiness. We do not know such worship. We think happiness is seeing Rādhā worship Kṛṣṇa who worships the gopīs' sweetness.”»
- After the marriage of Rādhā and Kṛṣṇa, when Kṛṣṇa came dressed as Rādhā, «To make Viśākhā give up her shyness, Lalitā began disrespecting her. She brought Viśākhā close to Kṛṣṇa dressed as Rādhā» (Uttara-campū 36.92).
- **In Dvārakā** (Uttara-campū 17, verse 53): «Lalitā was Jāmbavatī.»

## Compared with the Gaṇoddeśa

The Rādhā-Kṛṣṇa-gaṇoddeśa-dīpikā also calls her Anurādhā, *vāmā* and *prakharā*, with a dress the colour of a peacock's tail: the two books agree.

## Sources

${UNK}, Nāyikā-svabhāva 3 (pp. 17–20), Sakhī-bheda 5 (pp. 23–25), Rati-bheda (p. 38), Āśraya-nirṇaya 15 (pp. 45–46); ${GC}, Pūrva 2.15, 2.49, 15.53, 17.42, 25.34, 29.5, 29.40, 30.60–64, 31.32; Uttara 17.53, 31.51, 36.8, 36.24, 36.59, 36.92, 37.130.
`,
  },
  {
    id: 44,
    name: "Ananta Ācārya",
    text: `## In the Vraja-nitya-līlā

**Śrī Sudevī**, one of Śrī Rādhā's eight dearest sakhīs (*parama-preṣṭha-sakhīs*), twin of Raṅgadevī: left-wing and outspoken, golden, dressed in scarlet.

${nature("raṅgadevi-sudevyau vāme prakhare rakta-vastre ca | sarvā eva gaura-varṇāḥ", "«Both Raṅgadevī and Sudevī are also vāmā and prakharā nāyikās, and they wear scarlet. All of these nāyikās possess golden complexions.»", [DEF.vama, DEF.prakhara].join("\n"))}
${EIGHT}
## Compared with the Gaṇoddeśa

The Rādhā-Kṛṣṇa-gaṇoddeśa-dīpikā gives her a dress of red colour like her twin Raṅgadevī's: the two books agree. The Gopāla-campū does not name her.

## Sources

${SOURCES_EIGHT}.
`,
  },
  {
    id: 271,
    name: "Gadādhara Bhaṭṭa",
    text: `## In the Vraja-nitya-līlā

**Śrī Raṅgadevī**, one of Śrī Rādhā's eight dearest sakhīs (*parama-preṣṭha-sakhīs*), twin of Sudevī: left-wing and outspoken, golden, dressed in scarlet.

${nature("raṅgadevi-sudevyau vāme prakhare rakta-vastre ca | sarvā eva gaura-varṇāḥ", "«Both Raṅgadevī and Sudevī are also vāmā and prakharā nāyikās, and they wear scarlet. All of these nāyikās possess golden complexions.»", [DEF.vama, DEF.prakhara].join("\n"))}
${EIGHT}
## Compared with the Gaṇoddeśa

The Rādhā-Kṛṣṇa-gaṇoddeśa-dīpikā gives her clothes «the colour of the somewhat reddish javā flower»: the two books agree. The Gopāla-campū does not name her.

## Sources

${SOURCES_EIGHT}.
`,
  },
  { id: 344, name: "Śrī Gopāla Guru Gosvāmī", text: TUNGA },
  { id: 1095, name: "Śrīpad Prabodhānanda Sarasvatī", text: TUNGA },
  { id: 1675, name: "Vidyāvācaspati", text: TUNGA },
  {
    id: 755,
    name: "Kṛṣṇadāsa Brahmacārī",
    text: `## In the Vraja-nitya-līlā

**Śrī Indulekhā**, one of Śrī Rādhā's eight dearest sakhīs (*parama-preṣṭha-sakhīs*): left-wing and outspoken, golden, dressed in the colour of sunrise.

${nature("indurekhā vāmā prakharā aruṇa-vastrā | … sarvā eva gaura-varṇāḥ", "«Indulekhā dresses in sunrise-coloured cloth. She is vāmā (left wing) and prakharā.» «All of these nāyikās possess golden complexions.»", [DEF.vama, DEF.prakhara].join("\n"))}
${EIGHT}
## Compared with the Gaṇoddeśa

The Rādhā-Kṛṣṇa-gaṇoddeśa-dīpikā also calls her *vāmā* and *prakharā*, with attire «like the colour of the [bright red] flowers of the pomegranate tree» — the reddish colour of sunrise: the two books agree. The Gopāla-campū does not name her.

## Sources

${SOURCES_EIGHT}.
`,
  },
  {
    id: 1186,
    name: "Rāghava Gosvāmī",
    text: `## In the Vraja-nitya-līlā

**Śrī Campakalatā**, one of Śrī Rādhā's eight dearest sakhīs (*parama-preṣṭha-sakhīs*): left-wing, neither harsh nor soft, dressed in blue.

${nature("campakalatā vāmā madhyā nīla-vastrā", "«Campakalatā is vāmā and madhyā and dresses in blue.»", [DEF.vama, DEF.madhya].join("\n"))}
${EIGHT}
## Compared with the Gaṇoddeśa

The Rādhā-Kṛṣṇa-gaṇoddeśa-dīpikā gives her clothes «like the colour of the blue jay bird» and says she is «almost like Viśākhā by her qualities» — and the Ujjvala-nīlamaṇi-kiraṇa makes both *vāmā* and *madhyā*: the two books agree. The Gopāla-campū does not name her.

## Sources

${SOURCES_EIGHT}.
`,
  },
  {
    id: 1627,
    name: "Vanamālī dāsa (Kavirāja)",
    text: `## In the Vraja-nitya-līlā

**Śrī Citrā**, one of Śrī Rādhā's eight dearest sakhīs (*parama-preṣṭha-sakhīs*): right-wing and soft-spoken, dressed in blue.

${nature("citrā dakṣiṇā mṛdvī nīla-vasanā", "«Citrā is dakṣiṇā and mṛdvī (soft) and also wears blue.»", [DEF.daksina, DEF.mrdvi].join("\n"))}
${EIGHT}
## Compared with the Gaṇoddeśa

The Rādhā-Kṛṣṇa-gaṇoddeśa-dīpikā says «her attire resembles the colour of crystal»; the Ujjvala-nīlamaṇi-kiraṇa says she **wears blue**. The Gopāla-campū does not name her. Whisper's rule: the Ujjvala-nīlamaṇi-kiraṇa and the Gopāla-campū take precedence.

## Sources

${SOURCES_EIGHT}.
`,
  },
];
fs.writeFileSync(new URL("./vraja2.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length + " fichas");
