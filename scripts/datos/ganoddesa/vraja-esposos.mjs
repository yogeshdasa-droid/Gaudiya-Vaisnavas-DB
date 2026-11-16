// node vraja-esposos.mjs [puerto] [--dry]   (16-11-2026, Whisper: «líneas de esposo/esposa»)
// Líneas de esposo/esposa en la familia de Vraja: una línea de familia con la palabra «wife» en la ficha de la esposa
// (relative = el esposo; `isSpouse` en api.ts; «Linaje» las dibuja en la misma fila con «═»). Primero las fichas que
// faltan (esposas, esposos y tíos que antes solo estaban en las notas), luego las líneas. Todo del Rādhā-Kṛṣṇa-
// gaṇoddeśa-dīpikā (RKGD, ed. Nārāyaṇa Mahārāja: B = Bṛhad-bhāga, L = Laghu-bhāga). Como vraja-familia2.mjs: solo crea lo
// que falta; 2.ª pasada = nada.
const args = process.argv.slice(2);
const dry = args.includes("--dry");
const port = args.find((a) => a !== "--dry") || "9334";

const SEE = "See the text «The family of Vraja» in the record Lord Kṛṣṇa (#1889).";
const PLAY =
  "The husbands of the gopīs belong to the play of Vraja: «since Abhimanyu and others had married your replicas… the former marriage was illusory» (Gopāla-campū, Uttara 37).";
// new records: [nombre, notas, lugar, padres [nombre, nota]]
const P = [
  ["Ūrjanya", `One of Nanda Mahārāja's two paternal uncles, with Rājanya — «both cowherd men by occupation» (RKGD B 22). ${SEE}`, "Vraja", []],
  ["Rājanya", `One of Nanda Mahārāja's two paternal uncles, with Ūrjanya (RKGD B 22); father of Cāṭu and Vāṭuka, Nanda's cousins, who married Yaśodā's sisters Dadhisārā (Yaśodevī) and Haviḥsārā (Yaśasvinī) (B 41b, 49b–51). ${SEE}`, "Vraja", []],
  ["Cāṭu", `Son of Rājanya and so Nanda Mahārāja's cousin; his wife is Dadhisārā (Yaśodevī), Yaśodā's elder sister (RKGD B 41b, 51). ${SEE}`, "Vraja", [["Rājanya", "son"]]],
  ["Vāṭuka", `Son of Rājanya and so Nanda Mahārāja's cousin; his wife is Haviḥsārā (Yaśasvinī), Yaśodā's younger sister (RKGD B 41b, 51). ${SEE}`, "Vraja", [["Rājanya", "son"]]],
  ["Suverjanā (Naṭī)", `The sister of Parjanya, Kṛṣṇa's paternal grandfather — so Nanda's paternal aunt: «Suverjanā, who is expert in the art of dance and therefore is famous by the name Naṭī (dancer)… Suverjanā's husband is named Guṇavīra, and they reside at Sūrya-kuṇḍa» (RKGD B 22–23a). ${SEE}`, "Sūrya-kuṇḍa", []],
  ["Guṇavīra", `The husband of Suverjanā (Naṭī), Parjanya's sister; they live at Sūrya-kuṇḍa (RKGD B 22–23a). ${SEE}`, "Sūrya-kuṇḍa", []],
  ["Pīvarī", `The wife of Abhinanda, Nanda's second elder brother: «Pīvarī has blue clothing and a pinkish complexion» (RKGD B 35). ${SEE}`, "Gokula", []],
  ["Kuvalayā", `The wife of Sananda (Sunanda), Nanda's younger brother: she «wears clothes of a mixed colour of blue and light red (*kuvalaya*), and her body also bears the same complexion» (RKGD B 37a). ${SEE}`, "Gokula", []],
  ["Atulyā", `The wife of Nandana, Nanda's youngest brother: «her complexion resembles lightning and her clothes are like the blackish blue colour of rain clouds» (RKGD B 38). ${SEE}`, "Gokula", []],
  ["Mahānīla", `The husband of Sānandā, Nanda's sister, and so Kṛṣṇa's uncle (RKGD B 39–40a). ${SEE}`, "Gokula", []],
  ["Sunīla", `The husband of Nandinī, Nanda's sister, and so Kṛṣṇa's uncle (RKGD B 39–40a). ${SEE}`, "Gokula", []],
  ["Cārumukha", `The younger brother of Sumukha, Kṛṣṇa's maternal grandfather: «his bodily complexion is [blackish] like kājala. His wife is a gopī named Balākā» (RKGD B 45a); he «has a handsome son called Sucāru» (B 51). ${SEE}`, "Vraja", []],
  ["Balākā", `The wife of Cārumukha, Sumukha's younger brother: «her complexion can be compared to one kind of deep blue gram or to kājala» (RKGD B 45a). ${SEE}`, "Vraja", []],
  ["Sucāru", `The handsome son of Cārumukha, Sumukha's younger brother; his wife is Tulāvatī, Gola's niece (RKGD B 51–52a). ${SEE}`, "Vraja", [["Cārumukha", "son"]]],
  ["Tulāvatī", `The wife of Sucāru, son of Cārumukha; she is the niece of Gola (Vṛka-gopa), Pāṭalā's brother (RKGD B 52a). ${SEE}`, "Vraja", []],
  ["Remā", `The wife of Yaśodhara, Kṛṣṇa's maternal uncle; with Romā and Suremā she is a paternal cousin of Pāvana, Śrī Viśākhā's father; they «wear clothes of greyish purple colour and their complexion is like the [reddish] colour of the flower of the silk-cotton tree» (RKGD B 48–49a). ${SEE}`, "Vraja", []],
  ["Romā", `The wife of Yaśodeva, Kṛṣṇa's maternal uncle; a paternal cousin of Pāvana, Śrī Viśākhā's father (RKGD B 48–49a). ${SEE}`, "Vraja", []],
  ["Suremā", `The wife of Sudeva, Kṛṣṇa's maternal uncle; a paternal cousin of Pāvana, Śrī Viśākhā's father (RKGD B 48–49a). ${SEE}`, "Vraja", []],
  ["Kāśa", `The husband of Bhānumudrā, Vṛṣabhānu's sister — Śrī Rādhā's paternal aunt (RKGD L 172). ${SEE}`, "Vraja", []],
  ["Kuśa", `The husband of Kīrtimatī, Kīrtidā's sister — Śrī Rādhā's maternal aunt (RKGD L 172). ${SEE}`, "Vraja", []],
  ["Bhairava", `The husband of Śrī Lalitā, «a friend of Govardhana Gopa» (RKGD B 82); his younger brother Vakrekṣaṇa is the husband of Raṅgadevī (B 95b). ${PLAY}`, "Vraja", []],
  ["Vāhika", `Vāhika Gopa, the husband of Śrī Viśākhā (RKGD B 85). ${PLAY}`, "Vraja", []],
  ["Caṇḍākṣa", `The husband of Śrī Campakalatā (RKGD B 87). ${PLAY}`, "Vraja", []],
  ["Pīṭhara", `The husband of Śrī Citrā (RKGD B 89). ${PLAY}`, "Vraja", []],
  ["Bāliśa", `The husband of Śrī Tuṅgavidyā (RKGD B 91). ${PLAY}`, "Vraja", []],
  ["Durvala", `The husband of Śrī Indulekhā (RKGD B 93). ${PLAY}`, "Vraja", []],
  ["Vakrekṣaṇa", `The husband of Śrī Raṅgadevī and the younger brother of Bhairava, Lalitā's husband (RKGD B 95b); his younger brother is the husband of Sudevī, Raṅgadevī's twin (B 96). ${PLAY}`, "Vraja", []],
];
const W = "wife";
const PW = "wife (in the play of Vraja)";
// [esposa, esposo, palabra] — the line is put in the wife's record
const COUPLES = [
  ["Varīyasī", "Parjanya", W],
  ["Rohiṇī", "Vasudeva (father of Balarāma and Kṛṣṇa)", W],
  ["Yaśodā", "Nanda Mahārāja", W],
  ["Tuṅgī", "Upananda", W],
  ["Pīvarī", "Abhinanda", W],
  ["Kuvalayā", "Sananda (Sunanda)", W],
  ["Atulyā", "Nandana (brother of Nanda)", W],
  ["Sānandā", "Mahānīla", W],
  ["Nandinī (sister of Nanda)", "Sunīla", W],
  ["Suverjanā (Naṭī)", "Guṇavīra", W],
  ["Pāṭalā", "Sumukha (Kṛṣṇa's maternal grandfather)", W],
  ["Balākā", "Cārumukha", W],
  ["Tulāvatī", "Sucāru", W],
  ["Remā", "Yaśodhara", W],
  ["Romā", "Yaśodeva", W],
  ["Suremā", "Sudeva (Kṛṣṇa's maternal uncle)", W],
  ["Yaśodevī (Dadhisārā)", "Cāṭu", W],
  ["Yaśasvinī (Haviḥsārā)", "Vāṭuka", W],
  ["Jaṭilā", "Vṛka-gopa (Gola)", W],
  ["Sukhadā", "Mahībhānu", W],
  ["Mukharā", "Indu (Śrī Rādhā's maternal grandfather)", W],
  ["Kīrtidā", "Vṛṣabhānu", W],
  ["Bhānumudrā", "Kāśa", W],
  ["Kīrtimatī", "Kuśa", W],
  ["Sāradī (mother of Lalitā)", "Viśoka (father of Lalitā)", W],
  ["Dakṣiṇā (mother of Viśākhā)", "Pāvana (father of Viśākhā)", W],
  ["Vāṭikā (mother of Campakalatā)", "Ārāma (father of Campakalatā)", W],
  ["Carcikā (mother of Citrā)", "Catura (father of Citrā)", W],
  ["Medhā (mother of Tuṅgavidyā)", "Puṣkara (father of Tuṅgavidyā)", W],
  ["Belā (mother of Indulekhā)", "Sāgara (father of Indulekhā)", W],
  ["Karuṇā (mother of Raṅgadevī and Sudevī)", "Raṅgasāra (father of Raṅgadevī and Sudevī)", W],
  ["Anaṅga-mañjarī", "Durmada", PW],
  ["Lalitā-devī", "Bhairava", PW],
  ["Viśākhā", "Vāhika", PW],
  ["Campakalatā", "Caṇḍākṣa", PW],
  ["Citrā (Sucitrā)", "Pīṭhara", PW],
  ["Tuṅgavidyā", "Bāliśa", PW],
  ["Indulekhā", "Durvala", PW],
  ["Raṅgadevī", "Vakrekṣaṇa", PW],
];

const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const P = ${JSON.stringify(P)};
  const COUPLES = ${JSON.stringify(COUPLES)};
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
  // every name of the couples must be a record (no typos)
  for (const [w, h] of COUPLES) for (const n of [w, h]) if (!byName.has(n)) return "ERROR: no hay ficha «" + n + "»";
  if (!dry) all = await inv("list_persons");
  const famOf = new Map(all.map((p) => [p.id, (p.links || []).filter((l) => l.kind === "family").map((l) => [l.guru, l.note])]));
  const want = new Map(); // record → lines to add
  for (const [name, , , parents] of P) for (const [pn, note] of parents) want.set(name, [...(want.get(name) || []), [pn, note]]);
  for (const [w, h, note] of COUPLES) want.set(w, [...(want.get(w) || []), [h, note]]);
  for (const [name, lines] of want) {
    const id = byName.get(name);
    if (id === -1) { log.push("líneas (tras crear): " + name); continue; }
    const have = famOf.get(id) || [];
    const add = lines.map(([n, note]) => [byName.get(n), note]).filter(([rid]) => rid !== -1 && !have.some(([h]) => h === rid));
    if (lines.some(([n]) => byName.get(n) === -1)) log.push("líneas (tras crear): " + name);
    if (!add.length) continue;
    if (!dry) await inv("set_family", { id, relatives: [...have, ...add] });
    log.push("líneas " + name + ": +" + add.length);
  }
  return log;
} catch (e) { return "ERROR " + e; } })()`;
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id === 1) { console.log(JSON.stringify(d.result?.result?.value ?? d.result, null, 1)); ws.close(); } };
