// node vraja-familia2.mjs [puerto] [--dry]   (16-11-2026, 2.ª tanda de la familia de Vraja; Whisper: «como tú veas mejor»)
// Más familia de Vraja (RKGD = Rādhā-Kṛṣṇa-gaṇoddeśa-dīpikā, ed. Nārāyaṇa Mahārāja: B = Bṛhad-bhāga, L = Laghu-bhāga),
// solo quienes quedan unidos por líneas de padre/madre → hijo/hija (person_links 'family'): las hermanas de Nanda, los
// hijos de Upananda, los hermanos de Yaśodā, la familia de Jaṭilā, los tíos de Śrī Rādhā. Los que no tienen hijos ni
// padres con ficha (las esposas de Abhinanda, Sananda, Nandana; Ūrjanya, Rājanya, Cāṭu, Vāṭuka; Cārumukha, Balākā,
// Sucāru; Mahānīla, Sunīla, Kāśa, Kuśa; las tías Menakā…) van en las notas. Como vraja-familia.mjs: 2.ª pasada = nada.
const args = process.argv.slice(2);
const dry = args.includes("--dry");
const port = args.find((a) => a !== "--dry") || "9334";

const SEE = "See the text «The family of Vraja» in the record Lord Kṛṣṇa (#1889).";
// [nombre, notas, lugar, padres [nombre o id, nota de la línea]]
const P = [
  // — Nanda's sisters (daughters of Parjanya #2193 and Varīyasī #2194)
  ["Sānandā", `Nanda Mahārāja's sister, daughter of Parjanya and Varīyasī, and so Kṛṣṇa's paternal aunt: she wears many kinds of colourful clothes, has few teeth and a complexion whitish like foam; her husband is Mahānīla (RKGD B 39–40a). ${SEE}`, "Gokula", [[2193, "daughter"], [2194, "daughter"]]],
  ["Nandinī (sister of Nanda)", `Nanda Mahārāja's younger sister, daughter of Parjanya and Varīyasī, Kṛṣṇa's paternal aunt: colourful clothes, few teeth, a complexion whitish like foam; her husband is Sunīla (RKGD B 39–40a). ${SEE}`, "Gokula", [[2193, "daughter"], [2194, "daughter"]]],
  // — Upananda's family (#2195)
  ["Tuṅgī", `The wife of Upananda, Nanda's eldest brother: «both her complexion and the colour of her sari are similar to that of the cātaka bird» (RKGD B 34); mother of Kaṇḍava and Daṇḍava (B 40b–41a). The wives of Nanda's other brothers: Pīvarī (Abhinanda's wife: blue clothes, pinkish complexion, B 35), Kuvalayā (Sananda's, B 37a) and Atulyā (Nandana's: complexion like lightning, clothes like rain clouds, B 38). ${SEE}`, "Gokula", []],
  ["Kaṇḍava", `Son of Upananda, Kṛṣṇa's eldest paternal uncle, and so Kṛṣṇa's cousin; with his brother Daṇḍava he «gladly stays in Subala's company», and their faces are «as beautiful as lotus flowers» (RKGD B 40b–41a). ${SEE}`, "Gokula", [[2195, "son"], ["Tuṅgī", "son"]]],
  ["Daṇḍava", `Son of Upananda, Kṛṣṇa's eldest paternal uncle, and so Kṛṣṇa's cousin; with his brother Kaṇḍava he «gladly stays in Subala's company» (RKGD B 40b–41a). ${SEE}`, "Gokula", [[2195, "son"], ["Tuṅgī", "son"]]],
  // — Yaśodā's brothers and sisters (children of Sumukha #2200 and Pāṭalā #2201)
  ["Yaśodhara", `One of Kṛṣṇa's maternal uncles (*mātula*), Yaśodā's brother, son of Sumukha and Pāṭalā; with Yaśodeva and Sudeva he has a complexion like a blue linseed (atasī) flower and wears white clothes tinged with pale yellow. Their wives, Remā, Romā and Suremā, are cousins of Pāvana, Śrī Viśākhā's father (RKGD B 47b–49a). ${SEE}`, "Vraja", [[2200, "son"], [2201, "son"]]],
  ["Yaśodeva", `One of Kṛṣṇa's maternal uncles, Yaśodā's brother, son of Sumukha and Pāṭalā; complexion like a blue linseed flower, white clothes tinged with pale yellow (RKGD B 47b–49a). ${SEE}`, "Vraja", [[2200, "son"], [2201, "son"]]],
  ["Sudeva (Kṛṣṇa's maternal uncle)", `One of Kṛṣṇa's maternal uncles, Yaśodā's brother, son of Sumukha and Pāṭalā; complexion like a blue linseed flower, white clothes tinged with pale yellow (RKGD B 47b–49a). ${SEE}`, "Vraja", [[2200, "son"], [2201, "son"]]],
  ["Yaśodevī (Dadhisārā)", `Yaśodā's elder sister, daughter of Sumukha and Pāṭalā, also called Dadhisārā: a blackish-blue (śyāma) complexion, clothes of white, yellow and red (hiṅgula). She is the wife of Cāṭu, son of Rājanya — Nanda's paternal uncle — and so Nanda's cousin (RKGD B 22, 41b, 49b–51). ${SEE}`, "Vraja", [[2200, "daughter"], [2201, "daughter"]]],
  ["Yaśasvinī (Haviḥsārā)", `Yaśodā's younger sister, daughter of Sumukha and Pāṭalā, also called Haviḥsārā: a complexion like molten gold, clothes of white, yellow and red (hiṅgula). She is the wife of Vāṭuka, son of Rājanya, Nanda's paternal uncle (RKGD B 22, 41b, 49b–51). ${SEE}`, "Vraja", [[2200, "daughter"], [2201, "daughter"]]],
  // — Jaṭilā's family: Śrī Rādhā's «in-laws» in the play of Vraja
  ["Vṛka-gopa (Gola)", `Grandmother Pāṭalā's brother, called Gola in the Bṛhad-bhāga and Vṛka-gopa in the Laghu-bhāga: clothes and complexion greyish purple; «when his brother-in-law Sumukha makes fun of him and laughs, he becomes mad with anger»; he was born in an illustrious family of Vraja by worshipping Durvāsā. His wife is Jaṭilā (RKGD B 45b–47a). In the play of Vraja he is Śrī Rādhā's «father-in-law» (*śvaśura*), father of Abhimanyu, Durmada and Kuṭilā (L 173b–174). ${SEE}`, "Vraja", []],
  ["Jaṭilā", `Gola's (Vṛka-gopa's) wife, «with a big belly and a complexion like a crow» (RKGD B 47a); Śrī Rādhā's «mother-in-law» (*śvaśrū*), mother of Abhimanyu, Durmada and Kuṭilā (L 174). ${SEE}`, "Javaṭ (Yāvaṭa)", []],
  ["Abhimanyu", `Son of Vṛka-gopa and Jaṭilā, who «has the false conception of being Śrī Rādhā's husband» (*pati-manyo 'bhimanyukaḥ*, RKGD L 174). The Gopāla-campū says the same: «Abhimanyu, who mistakenly thought he was your husband» (Uttara 32.62), and «since Abhimanyu and others had married your replicas… the former marriage was illusory» (Uttara 37). Not to be confused with Abhimanyu Samanta Siṅgāra Mahāpātra (#3). ${SEE}`, "Javaṭ (Yāvaṭa)", [["Vṛka-gopa (Gola)", "son"], ["Jaṭilā", "son"]]],
  ["Durmada", `Son of Vṛka-gopa and Jaṭilā, Abhimanyu's younger brother — Śrī Rādhā's «younger brother-in-law» (*devara*) (RKGD L 173b) — «proud and arrogant», the husband of Anaṅga-mañjarī, Śrī Rādhā's younger sister (RKGD B 121–122). ${SEE}`, "Javaṭ (Yāvaṭa)", [["Vṛka-gopa (Gola)", "son"], ["Jaṭilā", "son"]]],
  ["Kuṭilā", `Daughter of Vṛka-gopa and Jaṭilā, Abhimanyu's sister — Śrī Rādhā's «sister-in-law» (*nanandā*), «always looking for faults» (*sadā-cchidra-vidhāyinī*, RKGD L 174). ${SEE}`, "Javaṭ (Yāvaṭa)", [["Vṛka-gopa (Gola)", "daughter"], ["Jaṭilā", "daughter"]]],
  // — Śrī Rādhā's paternal uncles and aunt (children of Mahībhānu #2206 and Sukhadā #2207)
  ["Ratnabhānu", `Vṛṣabhānu Mahārāja's brother and so Śrī Rādhā's paternal uncle, with Subhānu and Bhānu (RKGD L 170b). ${SEE}`, "Vraja", [[2206, "son"], [2207, "son"]]],
  ["Subhānu", `Vṛṣabhānu Mahārāja's brother, Śrī Rādhā's paternal uncle (RKGD L 170b). ${SEE}`, "Vraja", [[2206, "son"], [2207, "son"]]],
  ["Bhānu (brother of Vṛṣabhānu)", `Vṛṣabhānu Mahārāja's brother, Śrī Rādhā's paternal uncle (RKGD L 170b). ${SEE}`, "Vraja", [[2206, "son"], [2207, "son"]]],
  ["Bhānumudrā", `Vṛṣabhānu's sister, Śrī Rādhā's paternal aunt (*pitṛ-svasā*); her husband is Kāśa (RKGD L 172). ${SEE}`, "Vraja", [[2206, "daughter"], [2207, "daughter"]]],
  // — Śrī Rādhā's maternal uncles and aunt (children of Indu #2209 and Mukharā #2210)
  ["Bhadrakīrti", `Kīrtidā's brother and so Śrī Rādhā's maternal uncle (*mātula*), with Mahākīrti and Kīrticandra; Rādhā's maternal aunts (their wives, *mātulī*) are Menakā, Ṣaṣṭhī, Gaurī, Dhātrī and Dhātakī (RKGD L 171). ${SEE}`, "Vraja", [[2209, "son"], [2210, "son"]]],
  ["Mahākīrti", `Kīrtidā's brother, Śrī Rādhā's maternal uncle (RKGD L 171). ${SEE}`, "Vraja", [[2209, "son"], [2210, "son"]]],
  ["Kīrticandra (Śrī Rādhā's maternal uncle)", `Kīrtidā's brother, Śrī Rādhā's maternal uncle (RKGD L 171). Not the son of Advaita Prabhu of the same name (#727). ${SEE}`, "Vraja", [[2209, "son"], [2210, "son"]]],
  ["Kīrtimatī", `Kīrtidā's sister, Śrī Rādhā's maternal aunt (*mātṛ-svasā*); her husband is Kuśa (RKGD L 172). ${SEE}`, "Vraja", [[2209, "daughter"], [2210, "daughter"]]],
];

const plan = { P };
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const { P } = ${JSON.stringify(plan)};
  const dry = ${dry};
  const log = [];
  const keys = ["name", "aka", "appearance", "disappearance", "place", "guru", "disciples", "works", "notes", "tags"];
  let all = await inv("list_persons");
  const byName = new Map(all.map((p) => [p.name, p.id]));
  // the records the lines hang from must be the ones of the 1st batch
  const must = { 2193: "Parjanya", 2194: "Varīyasī", 2195: "Upananda", 2200: "Sumukha", 2201: "Pāṭalā", 2206: "Mahībhānu", 2207: "Sukhadā", 2209: "Indu", 2210: "Mukharā" };
  for (const [id, n] of Object.entries(must)) { const p = all.find((x) => x.id === +id); if (!p || !p.name.startsWith(n)) return "ERROR: #" + id + " no es " + n + " (" + (p && p.name) + ")"; }
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
  for (const [name, , , parents] of P) {
    const id = byName.get(name);
    if (!parents.length) continue;
    if (id === -1) { log.push("familia (tras crear): " + name); continue; }
    const have = famOf.get(id) || [];
    const want = parents.map(([pn, note]) => [typeof pn === "number" ? pn : byName.get(pn), note]);
    const add = want.filter(([rid]) => !have.some(([h]) => h === rid));
    if (!add.length) continue;
    if (!dry) await inv("set_family", { id, relatives: [...have, ...add] });
    log.push("familia " + name + ": +" + add.length);
  }
  return log;
} catch (e) { return "ERROR " + e; } })()`;
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id === 1) { console.log(JSON.stringify(d.result?.result?.value ?? d.result, null, 1)); ws.close(); } };
