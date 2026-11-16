// node vraja-familia.mjs [puerto] [--dry]   (16-11-2026, Whisper: «me gusta el punto 1 y 2»)
// Fichas nuevas de la familia de Vraja (si no existen ya con ese nombre), unidas por líneas de FAMILIA (person_links kind
// 'family', set_family: relative = padre/madre), sin tocar la Guru Paramparā. Lord Kṛṣṇa (#1889) queda como hijo de Nanda y
// Yaśodā. Un texto «The family of Vraja» (árbol dibujado) en #1889. 2.ª pasada = nada nuevo.
// Fuentes: Rādhā-Kṛṣṇa-gaṇoddeśa-dīpikā (RKGD, ed. Nārāyaṇa Mahārāja: B = Bṛhad-bhāga, L = Laghu-bhāga) y Gopāla-campū.
const args = process.argv.slice(2);
const dry = args.includes("--dry");
const port = args.find((a) => a !== "--dry") || "9334";

const G = (id, who) => `In Gaura-līlā: ${who} (#${id}), whose «Vraja-Nitya-līlā» tells more.`;
const SEE = "See the text «The family of Vraja» in the record Lord Kṛṣṇa (#1889).";
// [nombre, notas, lugar, padres (nombres o ids), nota de la línea]
const P = [
  ["Devamīḍha", `A king of the Yadu dynasty in Mathurā, Kṛṣṇa's great-grandfather on both sides of the family. He had two wives, one of a kṣatriya family and one of a vaiśya (ābhīra) family: the first bore Śūra, father of Vasudeva; the second, Parjanya, father of Nanda (Gopāla-campū, Pūrva 3.19; Uttara 37.8). «Vṛṣabhānu's grandfather's sister's husband gave his daughter to Devamīḍa, best of the Yadus» (Gopāla-campū, Uttara 32.84). ${SEE}`, "Mathurā", [], ""],
  ["Śūra (father of Vasudeva)", `Son of Devamīḍha by his kṣatriya wife; father of Vasudeva (Gopāla-campū, Pūrva 3.19; Uttara 37.8). Brother of Parjanya. ${SEE}`, "Mathurā", [["Devamīḍha", "son (by his kṣatriya wife)"]], ""],
  ["Vasudeva (father of Balarāma and Kṛṣṇa)", `Son of Śūra and grandson of Devamīḍha; husband of Rohiṇī and Devakī, father of Balarāma and of Kṛṣṇa in Mathurā; Nanda's cousin and dearest friend (RKGD B 25–27: «Ānaka-dundubhi», a partial manifestation of the Vasu Droṇa; Vṛṣabhānu is also his dear friend). ${G(439, "Hāḍāi Paṇḍita, father of Nityānanda")} ${SEE}`, "Mathurā", [["Śūra (father of Vasudeva)", "son"]], ""],
  ["Parjanya", `Kṛṣṇa's paternal grandfather, son of Devamīḍha by his vaiśya (ābhīra) wife; a cowherd «who showers torrents of auspicious nectar», complexion like molten gold, white hair and clothes. At Nandīśvara, on Nārada's advice, he worshipped Nārāyaṇa for excellent sons and heard a voice from the sky: «five sons will be born to you… the middle one will be famous by the name Nanda. The son of this Nanda will be victorious». Fearing Keśī he moved with his family to Mahāvana (Gokula) (RKGD B 15–20); later he went to Vṛndāvana to worship Govinda (Gopāla-campū, Pūrva 3.43). Wife: Varīyasī. Sons: Upananda, Abhinanda, Nanda, Sananda, Nandana; daughters Sānandā and Nandinī. ${G(1575, "Upendra Miśra, the Lord's paternal grandfather")} ${SEE}`, "Nandīśvara; then Mahāvana (Gokula)", [["Devamīḍha", "son (by his vaiśya wife)"]], ""],
  ["Varīyasī", `Kṛṣṇa's paternal grandmother, Parjanya's wife, «most revered throughout Vraja-maṇḍala»: complexion like the safflower, green garments, short, hair white as milk (RKGD B 21). ${G(633, "Kalāvatī")} ${SEE}`, "Gokula", [], ""],
  ["Upananda", `The eldest son of Parjanya and Varīyasī, Nanda's elder brother and adviser in his assembly (Gopāla-campū, Pūrva 3.33, 3.44): pinkish complexion, long beard, green clothes; wife Tuṅgī; sons Kaṇḍava and Daṇḍava, friends of Subala, and Subhadra (RKGD B 33–34, 40b–41a, L). ${SEE}`, "Gokula", [["Parjanya", "son"], ["Varīyasī", "son"]], ""],
  ["Abhinanda", `The second son of Parjanya and Varīyasī, Nanda's elder brother: fair like a conch, long beard, black clothes; wife Pīvarī (RKGD B 33, 35). ${SEE}`, "Gokula", [["Parjanya", "son"], ["Varīyasī", "son"]], ""],
  ["Nanda Mahārāja", `The king of the cowherds of Vraja, the middle and best of Parjanya's five sons, as the voice from the sky promised; husband of Yaśodā and father of Kṛṣṇa; younger brother of Upananda and Abhinanda, elder of Sananda and Nandana; Vasudeva's cousin and dearest friend. «He has a big belly, his complexion is like sandalwood paste, his dress like the bandhujīva flower… his beard like sesame mixed with rice» (RKGD B 23b–25). ${G(559, "Jagannātha Miśra")} ${SEE}`, "Gokula (Mahāvana); Nandīśvara (Nandagrāma)", [["Parjanya", "son"], ["Varīyasī", "son"]], ""],
  ["Sananda (Sunanda)", `Parjanya's fourth son, Nanda's younger brother, also called Sunanda: pale complexion, black clothes, «extremely dear to Keśava»; wife Kuvalayā (RKGD B 33, 36–37a). ${SEE}`, "Gokula", [["Parjanya", "son"], ["Varīyasī", "son"]], ""],
  ["Nandana (brother of Nanda)", `Parjanya's youngest son, Nanda's younger brother, who lives with his father and has gentle love for Śrī Hari; complexion like a peacock's throat; wife Atulyā (RKGD B 33, 37b–38). ${SEE}`, "Gokula", [["Parjanya", "son"], ["Varīyasī", "son"]], ""],
  ["Sumukha (Kṛṣṇa's maternal grandfather)", `Kṛṣṇa's maternal grandfather, father of Yaśodā: energetic, long white beard, complexion like a ripe jāmun; wife Pāṭalā; younger brother Cārumukha (RKGD B 42, 45a). ${G(1032, "Nīlāmbara Cakravartī, the Lord's maternal grandfather")} ${SEE}`, "Vraja", [], ""],
  ["Pāṭalā", `Kṛṣṇa's maternal grandmother, Sumukha's wife and Yaśodā's mother, «well-known as the Queen of Vraja»; her friend Mukharā sometimes nursed the baby Yaśodā; her brother is Gola (Vṛka-gopa), husband of Jaṭilā (RKGD B 43–47a). ${SEE}`, "Vraja", [], ""],
  ["Yaśodā", `The queen of Vraja, daughter of Sumukha and Pāṭalā, wife of Nanda and mother of Kṛṣṇa; «the very personification of parental love», blackish-blue complexion, rainbow-coloured dress; her dearest friends Aindavī and Kīrtidā; also called Devakī, and so a special friend of Vasudeva's wife Devakī (RKGD B 28–31). Her sisters: Yaśodevī and Yaśasvinī (B 49b–50). ${G(1336, "Śrī Śacī Devī")} ${SEE}`, "Gokula; Nandīśvara", [["Sumukha (Kṛṣṇa's maternal grandfather)", "daughter"], ["Pāṭalā", "daughter"]], ""],
  ["Rohiṇī", `Vasudeva's wife and the mother of Balarāma, «the elder mother of Śrī Kṛṣṇa», who lives in Nanda's house with Yaśodā and loves Kṛṣṇa millions of times more than Balarāma (RKGD B 32; L 69–70). ${G(1066, "Padmāvatī Devī, mother of Nityānanda")} ${SEE}`, "Gokula", [], ""],
  ["Lord Balarāma", `Kṛṣṇa's elder brother, son of Vasudeva and Rohiṇī, white like crystal or camphor, «radiant in His youth of sixteen years» (RKGD L 66–71). ${G(1851, "Śrī Nityānanda Prabhu")} ${SEE}`, "Gokula; Vṛndāvana", [["Vasudeva (father of Balarāma and Kṛṣṇa)", "son"], ["Rohiṇī", "son"]], ""],
  ["Subhadra (son of Upananda)", `Kṛṣṇa's paternal cousin, son of Upananda and Tulā, «in his illustrious prime youth»; wife Kundalatā (RKGD Laghu-bhāga, «Subhadra»; L 28). ${SEE}`, "Gokula", [["Upananda", "son"]], ""],
  ["Mahībhānu", `Śrī Rādhā's paternal grandfather, father of Vṛṣabhānu; wife Sukhadā (RKGD L 169b–170a). ${SEE}`, "Vraja", [], ""],
  ["Sukhadā", `Śrī Rādhā's paternal grandmother, wife of Mahībhānu and mother of Vṛṣabhānu (RKGD L 169b–170a). ${SEE}`, "Vraja", [], ""],
  ["Vṛṣabhānu", `Śrī Rādhā's father, «as radiant as the sun» (*vṛṣa-bhānu*, the sun in Taurus), «a great cowherd… of good family and great wealth» (Gopāla-campū, Pūrva 15.16); son of Mahībhānu and Sukhadā; wife Kīrtidā; brothers Ratnabhānu, Subhānu and Bhānu; sister Bhānumudrā (husband Kāśa); children Śrīdāmā, Rādhā and Anaṅga-mañjarī; dear friend of Vasudeva (RKGD L 168b–173a; B 27). Also called Arkamitra, Ravimitra, Sūryamitra. ${G(1119, "Śrīla Puṇḍarīka Vidyānidhi")} ${SEE}`, "Vraja", [["Mahībhānu", "son"], ["Sukhadā", "son"]], ""],
  ["Indu (Śrī Rādhā's maternal grandfather)", `Śrī Rādhā's maternal grandfather, father of Kīrtidā; wife Mukharā (RKGD L 169b–170a). ${SEE}`, "Vraja", [], ""],
  ["Mukharā", `An elderly gopī, Śrī Rādhā's maternal grandmother (wife of Indu, mother of Kīrtidā) (RKGD L 170a) — and the dear friend of Pāṭalā who sometimes nursed the baby Yaśodā (RKGD B 44). ${SEE}`, "Vraja", [], ""],
  ["Kīrtidā", `Śrī Rādhā's mother, wife of Vṛṣabhānu, «famous throughout the world as Ratnagarbhā»; daughter of Indu and Mukharā; her sister Kīrtimatī (husband Kuśa); her brothers Bhadrakīrti, Mahākīrti and Kīrticandra; one of Yaśodā's dearest friends (RKGD L 169a, 171–172; B 29). ${G(1313, "Ratnāvatī Devī, wife of Puṇḍarīka Vidyānidhi")} ${SEE}`, "Vraja", [["Indu (Śrī Rādhā's maternal grandfather)", "daughter"], ["Mukharā", "daughter"]], ""],
  ["Śrī Rādhā", `The daughter of Vṛṣabhānu and Kīrtidā, born one year after Kṛṣṇa when the moon was in Anurādhā (Gopāla-campū, Pūrva 15.18), «the most beloved of all Śrī Kṛṣṇa's gopīs»; elder brother Śrīdāmā, younger sister Anaṅga-mañjarī; Yaśodā loves her more than «unlimited mothers» (RKGD L 163–174). ${G(274, "Śrī Gadādhara Paṇḍita Gosvāmī")} ${SEE}`, "Vraja", [["Vṛṣabhānu", "daughter"], ["Kīrtidā", "daughter"]], ""],
  ["Śrīdāmā (Śrī Rādhā's brother)", `Śrī Rādhā's elder brother, son of Vṛṣabhānu and Kīrtidā, the first of Kṛṣṇa's cowherd friends (*priya-narma-sakhās*), of Kṛṣṇa's age, blackish-blue complexion (RKGD Laghu-bhāga, «Śrīdāmā»; L 173a). ${G(6, "Abhirāma Ṭhākura")} ${SEE}`, "Vraja", [["Vṛṣabhānu", "son"], ["Kīrtidā", "son"]], ""],
  ["Anaṅga-mañjarī", `Śrī Rādhā's younger sister, daughter of Vṛṣabhānu and Kīrtidā (RKGD L 173a). In Gaura-līlā: some say Śrī Gopāla Bhaṭṭa Gosvāmī (#343), others Jāhnavā (#574) or Vasudhā (#1660) — see their «Vraja-Nitya-līlā». ${SEE}`, "Vraja", [["Vṛṣabhānu", "daughter"], ["Kīrtidā", "daughter"]], ""],
];
const KRSNA = [1889, "Lord Kṛṣṇa", [["Nanda Mahārāja", "son"], ["Yaśodā", "son"]]];

const TEXT = `## The family of Vraja

Kṛṣṇa's family in Vraja according to the **Gopāla-campū** of Jīva Gosvāmī (Pūrva 3; 15; Uttara 18; 32; 37) and the **Rādhā-Kṛṣṇa-gaṇoddeśa-dīpikā** of Rūpa Gosvāmī (Bṛhad-bhāga 15–54; Laghu-bhāga 25–38, 66–71, 163–174). The records named here are joined by family lines (green dots) in the «Linaje» view.

## Kṛṣṇa's family

\`\`\`
                         Devamīḍha (Yadu king of Mathurā)
                 ┌──────────────┴──────────────┐
          (kṣatriya wife)               (vaiśya / ābhīra wife)
               Śūra                        Parjanya ═ Varīyasī
                 │            ┌──────────┬───────┼─────────┬──────────┐
             Vasudeva      Upananda   Abhinanda   NANDA   Sananda    Nandana
          ═ Rohiṇī          ═ Tuṅgī    ═ Pīvarī    ═ YAŚODĀ ═ Kuvalayā ═ Atulyā
          ═ Devakī             │                     │
                 │        Kaṇḍava, Daṇḍava,          │
             BALARĀMA     Subhadra                  KṚṢṆA
                                              (Sumukha ═ Pāṭalā → Yaśodā)
\`\`\`

- «Devamīḍha… had two wives. One was of kṣatriya family and the other was of vaiśya family. They bore two children named Śūra and Parjanya. Śūra produced Vasudeva and others. Parjanya, because of his mixed parentage became a vaiśya and worked with cows. He lived in Mahāvana» (Gopāla-campū, Pūrva 3.19).
- Parjanya worshipped Nārāyaṇa at Nandīśvara and heard: «five sons will be born to you… the middle one will be famous by the name Nanda. The son of this Nanda will be victorious in the entire world» (RKGD B 17–19).
- Nanda's sisters: Sānandā (husband Mahānīla) and Nandinī (husband Sunīla); his paternal uncles Ūrjanya and Rājanya, whose sons Cāṭu and Vāṭuka married Yaśodā's sisters Dadhisārā and Haviḥsārā (Yaśodevī and Yaśasvinī) (B 22, 39–41b, 49b–51).
- Yaśodā's parents Sumukha and Pāṭalā; Sumukha's brother Cārumukha (son Sucāru); Pāṭalā's brother Gola, husband of Jaṭilā; Yaśodā's brothers Yaśodhara, Yaśodeva, Sudeva (B 42–50).

## Śrī Rādhā's family

\`\`\`
      Mahībhānu ═ Sukhadā                 Indu ═ Mukharā
              │                                  │
   Ratnabhānu, Subhānu, Bhānu,          Bhadrakīrti, Mahākīrti, Kīrticandra,
   VṚṢABHĀNU, Bhānumudrā (═ Kāśa)        Kīrtimatī (═ Kuśa), KĪRTIDĀ
              └──────────────── ═ ───────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
           ŚRĪDĀMĀ            ŚRĪ RĀDHĀ        ANAṄGA-MAÑJARĪ
\`\`\`

(RKGD L 168b–173a.) Rādhā's «in-laws» in the play of Vraja: Vṛka-gopa (= Gola), Jaṭilā, Abhimanyu, Durmada and Kuṭilā (L 173b–174).

## The two families meet

«Vṛṣabhānu's grandfather's sister's husband gave his daughter to Devamīḍa, best of the Yadus» (Gopāla-campū, Uttara 32.84) — so Parjanya's mother came from the family of Vṛṣabhānu's great-aunt. Kīrtidā is one of Yaśodā's dearest friends (RKGD B 29), and Vṛṣabhānu is Vasudeva's dear friend (B 27). Rādhā «accepted birth in the ocean of a great cowherd named Vṛṣabhānu», «one year after the birth of Kṛṣṇa» (Gopāla-campū, Pūrva 15.16–18).

## In Gaura-līlā

Nanda — Jagannātha Miśra; Yaśodā — Śacī; Parjanya — Upendra Miśra; Varīyasī — Kalāvatī; Sumukha — Nīlāmbara Cakravartī; Vasudeva — Hāḍāi Paṇḍita; Rohiṇī — Padmāvatī; Balarāma — Nityānanda; Vṛṣabhānu — Puṇḍarīka Vidyānidhi (or Mādhava Miśra); Kīrtidā — Ratnāvatī; Rādhā — Gadādhara Paṇḍita; Śrīdāmā — Abhirāma Ṭhākura; Anaṅga-mañjarī — Gopāla Bhaṭṭa Gosvāmī (others: Jāhnavā, Vasudhā). Each of those records has its «Vraja-Nitya-līlā».

## Sources

Śrī Gopāla-campū (Pūrva and Uttara, English ed.), and Śrī Rādhā-Kṛṣṇa-gaṇoddeśa-dīpikā (ed. Śrī Śrīmad Bhaktivedānta Nārāyaṇa Gosvāmī), both in «Libros» / Desktop\\BIOGRAPHYS\\Info.`;

const plan = { P, KRSNA, TEXT };
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const { P, KRSNA, TEXT } = ${JSON.stringify(plan)};
  const dry = ${dry};
  const log = [];
  const keys = ["name", "aka", "appearance", "disappearance", "place", "guru", "disciples", "works", "notes", "tags"];
  let all = await inv("list_persons");
  const byName = new Map(all.map((p) => [p.name, p.id]));
  for (const [name, notes, place] of P) {
    if (byName.has(name)) continue;
    if (dry) { log.push("nueva: " + name); byName.set(name, -1); continue; }
    const f = Object.fromEntries(keys.map((k) => [k, ""]));
    Object.assign(f, { name, notes, place });
    const id = await inv("new_person", { fields: f });
    byName.set(name, id); log.push("NUEVA #" + id + " " + name);
  }
  if (!dry) all = await inv("list_persons");
  const famOf = new Map(all.map((p) => [p.id, (p.links || []).filter((l) => l.kind === "family").map((l) => [l.guru, l.note])]));
  const rows = P.map(([name, , , parents]) => [byName.get(name), name, parents]).concat([KRSNA]);
  for (const [id, name, parents] of rows) {
    if (!parents.length || id === -1) { if (id === -1 && parents.length) log.push("familia (tras crear): " + name); continue; }
    const have = famOf.get(id) || [];
    const want = parents.map(([pn, note]) => [typeof pn === "number" ? pn : byName.get(pn), note]);
    const add = want.filter(([rid]) => !have.some(([h]) => h === rid));
    if (!add.length) continue;
    if (!dry) await inv("set_family", { id, relatives: [...have, ...add] });
    log.push("familia " + name + ": +" + add.length);
  }
  const k = await inv("get_person", { id: KRSNA[0] });
  if (k.name !== KRSNA[1]) log.push("#1889 no es Lord Kṛṣṇa: " + k.name);
  else if (!k.docs.some((d) => d.title === "The family of Vraja")) {
    if (!dry) { const doc = await inv("create_doc", { personId: KRSNA[0], title: "The family of Vraja", collection: "Vraja" }); await inv("save_section", { docId: doc, ordinal: 0, text: TEXT }); }
    log.push("texto «The family of Vraja» en #1889");
  }
  return log;
} catch (e) { return "ERROR " + e; } })()`;
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id === 1) { console.log(JSON.stringify(d.result?.result?.value ?? d.result, null, 1)); ws.close(); } };
