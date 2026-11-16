// node fichas1.mjs [puerto] [--dry]   (16-11-2026) — fase 4 del Bhāgavatam, tanda 1: fichas para quien tiene historia propia
// (Whisper: «tú decides cómo hacerlo mejor»; aparte de la Guru Paramparā, en el «Bhāgavata-maṇḍala» — etiqueta fija).
// Cada ficha: notas cortas, la etiqueta «Bhāgavata-maṇḍala» y un texto «In the Śrīmad-Bhāgavatam — <nombre>» (colección
// «Śrīmad-Bhāgavatam») con la historia en citas del libro (traducción de Śrīla Prabhupāda) y sus versos. Solo crea lo que
// falta: 2.ª pasada = nada. Al final escribe en src/data/vamsa-records.json qué ficha es qué nombre de «Vaṁśa».
import fs from "node:fs";
const args = process.argv.slice(2);
const dry = args.includes("--dry");
const port = args.find((a) => a !== "--dry") || "9334";
const TAG = "Bhāgavata-maṇḍala";
const COLL = "Śrīmad-Bhāgavatam";
const SRC = "*Śrīmad-Bhāgavatam*, with the translation and purports of His Divine Grace A. C. Bhaktivedanta Svāmī Prabhupāda (the twelve cantos are in «Libros»).";
const SEE = (v) => `See the text «In the Śrīmad-Bhāgavatam» of this record; in «Vaṁśa», ${v}.`;

// [nombre, otros nombres, lugar, notas, texto, claves de Vaṁśa]
const F = [
  [
    "Dhruva Mahārāja",
    "Dhruva",
    "Madhuvana (Vraja); Dhruvaloka, the polestar",
    `Son of King Uttānapāda and Queen Sunīti, grandson of Svāyambhuva Manu. At five years old, insulted by his stepmother Suruci, he went to the forest, received the mantra from Nārada Muni, worshipped the Lord in Madhuvana and saw Him in six months; he received the polestar, Dhruvaloka (SB 4.8–4.12). ${SEE("the tree of Svāyambhuva Manu")}`,
    `## In short

Dhruva Mahārāja, son of King Uttānapāda and Queen Sunīti, grandson of Svāyambhuva Manu. Insulted as a child of five by his stepmother Suruci, he went to the forest, was initiated by Nārada Muni, worshipped the Lord at Madhuvana with the twelve-syllable mantra and saw Him face to face; the Lord gave him the polestar, Dhruvaloka. He ruled the world for 36,000 years and went to the polestar in his own body, stepping on the head of death (SB 4.8–4.12).

## In the book

- **His family** — «King Uttanapada had two queens, named Suniti and Suruci. Suruci was much more dear to the King; Suniti, who had a son named Dhruva, was not his favorite» (4.8.8). «Once upon a time, King Uttanapada was patting the son of Suruci, Uttama, placing him on his lap. Dhruva Maharaja was also trying to get on the Kings lap, but the King did not very much welcome him» (4.8.9).
- **Suruci's words** — «My dear child, you do not deserve to sit on the throne or on the lap of the King. Surely you are also the son of the King, but because you did not take your birth from my womb, you are not qualified to sit on your fathers lap» (4.8.11). His mother Sunīti, weeping, told him to worship the Lord (4.8.18–19).
- **Nārada Muni** — Nārada «approached Dhruva, and touching the boys head with his all virtuous hand» (4.8.25), first tried to dissuade him; Dhruva answered: «My stepmother, Suruci, has pierced my heart with her harsh words. Therefore your valuable instruction does not stand in my heart» (4.8.36). Nārada sent him to «the bank of the Yamuna, where there is a virtuous forest named Madhuvana» (4.8.42) and gave him the mantra: «Om namo bhagavate vasudevaya. This is the twelve syllable mantra for worshiping Lord Krsna» (4.8.54).
- **The austerity** — «Having arrived at Madhuvana, [he] took his bath in the River Yamuna and observed fasting in the night with great care and attention» (4.8.71); month by month he ate less; «by the fifth month, Maharaja Dhruva… was able to stand on only one leg, just as a column stands» (4.8.76), and when he closed his breath «the total universal breathing became choked up, and all the great demigods… felt suffocated» (4.8.80).
- **The Lord appears** — Lord Viṣṇu came on Garuḍa; Dhruva could not find words, and «out of His causeless mercy He touched His conchshell to the forehead of Dhruva Maharaja», who then offered prayers (4.9.1–4). The benediction: «My dear Dhruva, I shall award you the glowing planet known as the polestar, which will continue to exist even after the dissolution at the end of the millennium» (4.9.20–21); «you will rule continuously the entire world for thirty six thousand years» (4.9.22).
- **His regret** — «Because of my state of complete foolishness and paucity of pious activities, although the Lord offered me His personal service, I wanted material name, fame and prosperity» (4.9.35).
- **Wives and sons** — «Dhruva Maharaja married the daughter of Prajapati Sisumara, whose name was Bhrami, and two sons named Kalpa and Vatsara were born of her» (4.10.1); by Ilā, daughter of Vāyu, «he begot a son named Utkala and a very beautiful daughter» (4.10.2).
- **The Yakṣas** — when his brother Uttama was killed by the Yakṣas in the Himalayas, Dhruva attacked their city, Alakāpurī (4.10.4–6). His grandfather Svāyambhuva Manu stopped him: «My dear son, please stop. It is not good to become unnecessarily angry it is the path to hellish life» (4.11.7); «those Yaksas, who are descendants of Kuvera, are not actually the killers of your brother» (4.11.24). Kuvera then appeared and gave him a benediction (4.12.1–9).
- **The end** — «Dhruva Maharaja ruled over this planet for thirty six thousand years» (4.12.13). «When Dhruva Maharaja was attempting to get on the transcendental plane, he saw death personified approach him. Not caring for death, however, he took advantage of the opportunity to put his feet on the head of death» (4.12.30). Remembering his mother Sunīti, he was shown that she was going ahead of him in another plane (4.12.32–33). Nārada sang his glories at the sacrifice of the Pracetās (4.12.40).

## Sources

${SRC} Canto 4, chapters 8–12.`,
    ["V|Svāyambhuva Manu>=Śatarūpā>Uttānapāda>=Sunīti>Dhruva"],
  ],
  [
    "Pṛthu Mahārāja",
    "Pṛthu",
    "Brahmāvarta (between the Sarasvatī and the Dṛṣadvatī)",
    `The first consecrated king, a śaktyāveśa-avatāra of Lord Viṣṇu, born with Queen Arci from the churned arms of the dead King Vena, son of Aṅga; he milked the earth as a cow, performed ninety-nine horse sacrifices, asked the Lord for a million ears to hear His glories, and retired to the forest with Arci (SB 4.15–4.23). ${SEE("the tree of Svāyambhuva Manu (through Dhruva, Aṅga and Vena)")}`,
    `## In short

Mahārāja Pṛthu, «a plenary expansion of the power of Lord Visnu», born with his queen Arci — «a plenary expansion of the goddess of fortune» — from the arms of the dead King Vena, son of Aṅga, in the dynasty of Dhruva. He made the earth give her produce by milking her as a cow, levelled the land, performed ninety-nine horse sacrifices, and asked the Lord not for liberation but for a million ears to hear His glories; at the end he went to the forest with Arci (SB 4.15–4.23).

## In the book

- **His birth** — «The brahmanas and the great sages again churned the two arms of King Venas dead body. As a result a male and female couple came out of his arms» (4.15.1). «The male is a plenary expansion of the power of Lord Visnu, who maintains the entire universe, and the female is a plenary expansion of the goddess of fortune» (4.15.3). «Her name will be Arci. In the future she will accept King Prthu as her husband» (4.15.5).
- **His coronation** — «King Prthu, exquisitely dressed with garments and ornaments, was coronated and placed on the throne. The King and his wife, Arci, who was also exquisitely ornamented, appeared exactly like fire» (4.15.13); the demigods gave him his weapons — Agni a bow, the sun-god arrows (4.15.18).
- **Milking the earth** — when the earth withheld her grains and the citizens were starving, Pṛthu took up his bow; «after hearing him, the planet earth began to tremble» (4.17.28). «He then transformed Svayambhuva Manu into a calf and milked all the herbs and grains from the earth in the form of a cow» (4.18.12); the sages milked Vedic knowledge with Bṛhaspati as the calf (4.18.14). He «leveled all rough places on the surface of the globe by breaking up the hills with the strength of his bow» (4.18.29).
- **The horse sacrifices** — «When Prthu Maharaja was performing the last horse sacrifice, King Indra, invisible to everyone, stole the horse» (4.19.11); Brahmā stopped the quarrel: «Let there be only ninety nine sacrificial performances for Maharaja Prthu» (4.19.32).
- **Lord Viṣṇu appears** — «being very much satisfied by the performance of ninety nine horse sacrifices, the Supreme Personality of Godhead, Lord Visnu, appeared on the scene» (4.20.1) and offered him a benediction (4.20.16). Pṛthu asked: «I therefore do not wish to have the benediction of merging into Your existence… I want the benediction of at least one million ears» (4.20.24).
- **Sanat-kumāra** — as foretold (4.16.25), «the four Kumaras, who were as bright as the sun, arrived» (4.22.1), and he received the instructions of Sanat-kumāra (4.22).
- **The end** — «When Maharaja Prthu saw himself getting old, that great soul… divided whatever opulence he had accumulated amongst all kinds of living entities» (4.23.1–3) and went to the forest for austerities (4.23.4–6). «The Queen, the wife of Prthu Maharaja, whose name was Arci, followed her husband into the forest» (4.23.19); when he left his body, she «circumambulated the fire and, while thinking of the lotus feet of her husband, entered its flames» (4.23.22), and the wives of the demigods offered her prayers (4.23.23).

## Sources

${SRC} Canto 4, chapters 15–23.`,
    ["V|Svāyambhuva Manu>=Śatarūpā>Uttānapāda>=Sunīti>Dhruva>=Śambhū>Śiṣṭi>=Succhāyā>Ripu>=Bṛhatī>Cākṣuṣa>Puṣkariṇī (Vīraṇī)>Cākṣuṣa Manu>=Naḍvalā>Pūru>Kuru>=Ātreyī (Āgneyī)>Aṅga>=Sunīthā>Vena>Pṛthu"],
  ],
  [
    "Prahlāda Mahārāja",
    "Prahlāda",
    "",
    `Son of the demon king Hiraṇyakaśipu and Kayādhu, instructed by Nārada Muni in his mother's womb; a pure devotee from childhood, he survived his father's attempts to kill him, and for him Lord Nṛsiṁhadeva appeared from a pillar. One of the twelve mahājanas (SB 7.4–7.10). ${SEE("the trees of Kaśyapa and Diti (the Daityas) and of Prahlāda")}`,
    `## In short

Prahlāda Mahārāja, son of the demon Hiraṇyakaśipu, heard Nārada Muni's instructions while still in his mother's womb and was a pure devotee from childhood. He taught devotion to his classmates, survived all his father's attempts to kill him, and when Hiraṇyakaśipu asked where his God was, the Lord appeared from a pillar of the assembly hall as Nṛsiṁhadeva and killed the demon. Prahlāda pacified the Lord with prayers, refused every benediction, and obtained the deliverance of his father (SB 7.4–7.10).

## In the book

- **In the womb** — Nārada told Indra: «The child within this womans womb is faultless and sinless. Indeed, he is a great devotee, a powerful servant of the Supreme Personality of Godhead» (7.7.10). Prahlāda later said: «Narada Muni delivered his instructions both to me, who was within the womb, and to my mother» (7.7.15).
- **His teachers** — the sons of Śukrācārya, Ṣaṇḍa and Amarka, could not teach him politics; asked by his father what he had learnt, he answered with the nine processes of devotion: «Hearing and chanting about the transcendental holy name, form, qualities, paraphernalia and pastimes of Lord Visnu, remembering them, serving the lotus feet of the Lord…» (7.5.23–24). Hiraṇyakaśipu tried to kill him — even with snakes and the feet of elephants — but could not (7.5, summary).
- **The pillar** — «O most unfortunate Prahlada, you have always described a supreme being other than me… If He is everywhere, then why is He not present before me in this pillar?» (7.8.12). «Then from within the pillar came a fearful sound, which appeared to crack the covering of the universe» (7.8.15); «to prove that the statement of His servant Prahlada Maharaja was substantial… the Supreme Personality of Godhead, Hari, exhibited a wonderful form» (7.8.17), «which could not be ascertained to be either a man or a lion» (7.8.18).
- **The prayers** — when not even Lakṣmī dared approach the angry Lord, Brahmā sent Prahlāda, who «was not afraid at all» and pacified Him with his prayers (7.9, summary).
- **No benediction** — «one who desires some material benefit in exchange for devotional service cannot be Your pure devotee. Indeed, he is no better than a merchant who wants profit in exchange for service» (7.10.4). The Lord said: «My dear Prahlada… your father has been purified, along with twenty one forefathers in your family» (7.10.18).

## Sources

${SRC} Canto 7, chapters 4–10 (with the chapter summaries).`,
    ["X|Kaśyapa>=Diti>Hiraṇyakaśipu>Prahlāda", "Z|Prahlāda"],
  ],
  [
    "Mahārāja Ambarīṣa",
    "Ambarīṣa",
    "Mathurā (Madhuvana)",
    `Son of Nābhāga, of the dynasty of Vaivasvata Manu; emperor of the seven islands and a pure devotee who engaged every sense in the Lord's service. When Durvāsā Muni tried to harm him for breaking the Dvādaśī fast, the Sudarśana cakra chased the sage until he begged Ambarīṣa's forgiveness (SB 9.4–9.5). ${SEE("the tree of Nābhāga")}`,
    `## In short

Mahārāja Ambarīṣa, son of Nābhāga, emperor of the world and «an exalted devotee», engaged all his senses in the service of Kṛṣṇa. After a year of Ekādaśī and Dvādaśī vows, he broke his fast with a little water while Durvāsā Muni delayed; the angry sage created a demon to kill him, but the Sudarśana cakra burnt it and chased Durvāsā through the universe, until the Lord sent him back to Ambarīṣa — «I am completely under the control of My devotees» (SB 9.4–9.5).

## In the book

- **His birth** — «From Nabhaga, Maharaja Ambarisa took birth. Maharaja Ambarisa was an exalted devotee, celebrated for his great merits. Although he was cursed by an infallible brahmana, the curse could not touch him» (9.4.13).
- **His devotion** — he «achieved the rule of the entire world, consisting of seven islands» (9.4.15–16), but «thought of the entire universe as being as insignificant as a piece of stone» (9.4.17). «Maharaja Ambarisa always engaged his mind in meditating upon the lotus feet of Krsna, his words in describing the glories of the Lord, his hands in cleansing the Lords temple, and his ears in hearing…» (9.4.18–20).
- **The vow** — «To worship Lord Krsna, Maharaja Ambarisa, along with his queen, who was equally qualified, observed the vow of Ekadasi and Dvadasi for one year» (9.4.29); in the month of Kārttika he worshipped the Lord in Madhuvana (9.4.30).
- **Durvāsā Muni** — the sage went to bathe in the Yamunā before eating (9.4.37); to keep the vow, «after he drank some water, King Ambarisa, meditating upon the Supreme Personality of Godhead within his heart, waited» (9.4.41). Angry, Durvāsā created a demon; «His disc, the Sudarsana cakra, immediately burnt to ashes the created demon» (9.4.48) and pursued the sage (9.4.49–51); neither Brahmā nor Śiva could protect him (9.4.52–59).
- **The Lord's words** — «I am completely under the control of My devotees. Indeed, I am not at all independent» (9.4.63).
- **A year of waiting** — «As long as [Durvāsā] had not returned for one complete year the King had fasted, maintaining himself simply by drinking water» (9.5.23); then he fed him and only afterwards ate (9.5.24), and later retired from family life (9.5.26).

## Sources

${SRC} Canto 9, chapters 4–5.`,
    ["B3|Nābhāga>Ambarīṣa"],
  ],
  [
    "Mahārāja Yayāti",
    "Yayāti",
    "",
    `Son of King Nahuṣa, of the lunar dynasty; husband of Devayānī, daughter of Śukrācārya, and of Śarmiṣṭhā, daughter of Vṛṣaparvā; father of Yadu and Turvasu (by Devayānī) and of Druhyu, Anu and Puru (by Śarmiṣṭhā). Cursed with old age by Śukrācārya, he took the youth of his son Puru for a thousand years, and at last, unsatisfied, renounced and gave the world to Puru (SB 9.18–9.19). ${SEE("the trees of Atri (the Moon) and of Purūravas")}`,
    `## In short

Mahārāja Yayāti, son of Nahuṣa, married Devayānī, daughter of Śukrācārya, and Śarmiṣṭhā, daughter of the demon king Vṛṣaparvā. Cursed by Śukrācārya with old age, he exchanged it for the youth of his youngest son Puru and enjoyed for a thousand years without being satisfied; through the story of the he-goat he explained his renunciation to Devayānī, gave back Puru's youth, made Puru emperor and went to the forest. From his sons came the great dynasties: Yadu (the Yādavas), Turvasu, Druhyu, Anu and Puru (the Pauravas and Kurus) (SB 9.18–9.19).

## In the book

- **His family** — Nahuṣa «had six sons, named Yati, Yayati, Samyati, Ayati, Viyati and Krti» (9.18.1); Yati did not accept the throne (9.18.2). «Yayati himself married Devayani, the daughter of Sukracarya, and Sarmistha, the daughter of Vrsaparva» (9.18.4).
- **Devayānī in the well** — Śarmiṣṭhā, angered by Devayānī's words, «took away Devayanis garments and threw Devayani into a well» (9.18.17); «King Yayati, while engaged in a hunting excursion, went to the well to drink water and by chance saw Devayani» (9.18.18), and «caught her hand with his own and lifted her out» (9.18.19). Śarmiṣṭhā became Devayānī's maidservant (9.18.27–28).
- **The sons** — «Devayani gave birth to Yadu and Turvasu, and Sarmistha gave birth to Druhyu, Anu and Puru» (9.18.33).
- **The curse** — Śukrācārya: «You untruthful fool, lusting after women! … I therefore curse you to be attacked and disfigured by old age and invalidity» (9.18.36), but allowed him to exchange it with someone willing (9.18.37). Yadu, Turvasu, Druhyu and Anu refused (9.18.40–41); «the son named Puru was very pleased to accept the old age of his father» (9.18.45). «He engaged his mind and five senses in enjoying material possessions for one thousand years, [but] he was unable to be satisfied» (9.18.51).
- **The he-goat** — he told Devayānī the story of a he-goat who pulled a she-goat out of a well and became her husband, and could never be satisfied (9.19.3–8). «I shall now give up all these desires and meditate upon the Supreme Personality of Godhead» (9.19.19).
- **Renunciation** — «King Yayati, who was now free from all material desires, called his youngest son, Puru, and returned Purus youth» (9.19.21) and «enthroned his youngest son, Puru, as the emperor of the entire world» (9.19.23). Devayānī too understood that worldly relations are «like the association in a hotel full of tourists» (9.19.27–28).

## Sources

${SRC} Canto 9, chapters 18–19.`,
    ["K|Atri>=Anasūyā>Candra>Budha>Purūravas>Āyus>Nahuṣa>Yayāti", "A6|Purūravas>=Urvaśī>Āyus>=Svarbhānu>Nahuṣa>Yayāti"],
  ],
];

const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const F = ${JSON.stringify(F)};
  const dry = ${dry};
  const TAG = ${JSON.stringify(TAG)}, COLL = ${JSON.stringify(COLL)};
  const log = [];
  const ids = {};
  const keys = ["name", "aka", "appearance", "disappearance", "place", "guru", "disciples", "works", "notes", "tags"];
  const all = await inv("list_persons");
  for (const [name, aka, place, notes, text] of F) {
    let id = all.find((p) => p.name === name)?.id;
    if (!id) {
      if (dry) { log.push("nueva: " + name); continue; }
      const f = Object.fromEntries(keys.map((k) => [k, ""]));
      Object.assign(f, { name, aka, place, notes, tags: TAG });
      id = await inv("new_person", { fields: f });
      log.push("NUEVA #" + id + " " + name);
    }
    ids[name] = id;
    const p = await inv("get_person", { id });
    const title = "In the Śrīmad-Bhāgavatam — " + name;
    if (!p.docs.some((d) => d.title === title)) {
      if (!dry) { const doc = await inv("create_doc", { personId: id, title, collection: COLL }); await inv("save_section", { docId: doc, ordinal: 0, text }); }
      log.push("texto: " + name);
    }
  }
  // not the same person as a record of the same name (the red mark of «repeated?»)
  const DISTINCT = [["Dhruva Mahārāja", 215, "Dhruva Gosvāmī"]];
  const done = new Set((await inv("list_distinct")).map(([a, b]) => a + "-" + b));
  for (const [name, other, otherName] of DISTINCT) {
    const id = ids[name];
    const o = all.find((p) => p.id === other);
    if (!id || !o || !o.name.startsWith(otherName)) continue;
    if (done.has(id + "-" + other) || done.has(other + "-" + id)) continue;
    if (!dry) await inv("mark_distinct", { ids: [id, other] });
    log.push("distintas: " + name + " ≠ #" + other + " " + o.name);
  }
  return { log, ids };
} catch (e) { return "ERROR " + e; } })()`;
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  if (d.id !== 1) return;
  const v = d.result?.result?.value ?? d.result;
  console.log(JSON.stringify(v.log ?? v, null, 1));
  if (!dry && v.ids) {
    // which record is which name of «Vaṁśa» (read by Vamsa.tsx)
    const file = new URL("../../../src/data/vamsa-records.json", import.meta.url);
    const map = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
    for (const [name, , , , , vkeys] of F) if (v.ids[name]) for (const k of vkeys) map[k] = v.ids[name];
    fs.writeFileSync(file, JSON.stringify(map, null, 1));
    console.log("vamsa-records.json:", Object.keys(map).length, "nombres");
  }
  ws.close();
};
