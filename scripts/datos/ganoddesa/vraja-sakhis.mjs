// node vraja-sakhis.mjs [puerto] [--dry]   (16-11-2026, Whisper: «sakhīs + padres»)
// Las ocho sakhīs principales (variṣṭha) de Śrī Rādhā y sus padres, según el Rādhā-Kṛṣṇa-gaṇoddeśa-dīpikā (RKGD,
// Bṛhad-bhāga 79–96; los otros libros de Info no nombran a los padres): 8 + 16 fichas nuevas, unidas por líneas de
// familia (padre/madre → hija). Los esposos (Bhairava, Vāhika, Caṇḍākṣa, Pīṭhara, Bāliśa, Durvala, Vakrekṣaṇa y su
// hermano) solo en las notas. Cada sakhī dice en qué devoto apareció en la Gaura-līlā (lo que ya dicen los textos
// «Gaṇoddeśa» de esas fichas). Como vraja-familia2.mjs: solo crea lo que falta; 2.ª pasada = nada.
const args = process.argv.slice(2);
const dry = args.includes("--dry");
const port = args.find((a) => a !== "--dry") || "9334";

const SRC = "(Rādhā-Kṛṣṇa-gaṇoddeśa-dīpikā of Śrīla Rūpa Gosvāmī, Bṛhad-bhāga";
const EIGHT = "one of Śrī Rādhā's eight principal sakhīs (*variṣṭha-sakhīs*: Lalitā, Viśākhā, Citrā, Campakalatā, Tuṅgavidyā, Indulekhā, Raṅgadevī, Sudevī), who «are most renowned among the gopīs and are always skilfully assisting Śrī Rādhā and Śrī Kṛṣṇa in Their intimate pastimes; no one can equal them or exceed them in their love for the Divine Couple» (RKGD B 77–79)";
const G = (who) => `In Gaura-līlā: ${who} — see «Gaṇoddeśa» and «Vraja-Nitya-līlā» in that record.`;
const parent = (rel, of, v) => `${rel} of ${of}, one of Śrī Rādhā's eight principal sakhīs ${SRC} ${v}). See the record ${of}.`;

// [nombre, notas, lugar, padres [nombre, nota de la línea]]
const P = [
  // — 1. Lalitā
  ["Viśoka (father of Lalitā)", parent("The father", "Lalitā-devī", "82"), "Vraja", []],
  ["Sāradī (mother of Lalitā)", parent("The mother", "Lalitā-devī", "82") + " Not Śāradī, the mother of Kṛṣṇa's friend Vasanta (RKGD L 54).", "Vraja", []],
  ["Lalitā-devī", `**Śrī Lalitā**, the foremost of the eight — ${EIGHT}. «Śrī Lalitā-devī is the foremost amongst these eight *variṣṭha* sakhīs. She is twenty-seven days older than her dear friend Śrī Rādhā» (B 80). «Śrī Lalitā is renowned by the name Anurādhā. She is decorated by the qualities of both a *vāmā* nāyikā and *prakharā* nāyikā (heroine). Lalitā's bodily complexion resembles bright yellow gorocanā and her attire has the colour of a peacock's tail» (B 81). «Śrī Lalitā's mother's name is Sāradī and her father's is Viśoka. Her husband, whose name is Bhairava, is a friend of Govardhana Gopa» (B 82). ${G("Dhruvānanda Brahmacārī (#216); she also entered Gadādhara Paṇḍita (#274); some say Rāmānanda Rāya (#1283)")}`, "Vraja", [["Viśoka (father of Lalitā)", "daughter"], ["Sāradī (mother of Lalitā)", "daughter"]]],
  // — 2. Viśākhā
  ["Pāvana (father of Viśākhā)", parent("The father", "Viśākhā", "84–85") + " He is «Mukharā's sister's son» (B 84) — Mukharā being Śrī Rādhā's maternal grandmother (#2210) — and Remā, Romā and Suremā, the wives of Kṛṣṇa's maternal uncles, are his paternal cousins (B 49a).", "Vraja", []],
  ["Dakṣiṇā (mother of Viśākhā)", parent("The mother", "Viśākhā", "84–85") + " She is «a daughter of Jaṭilā's sister» (B 85; Jaṭilā is #2226).", "Vraja", []],
  ["Viśākhā", `**Śrī Viśākhā**, the second of the eight — ${EIGHT}. «Viśākhā… is like Śrī Rādhā in her conduct, good qualities and determination [in serving Śrī Kṛṣṇa]. Viśākhā was born at exactly the same moment as Śrī Rādhikā» (B 83). «Viśākhā's attire resembles the sky embedded by stars – it is blue with white embroideries of flowers and leaves. Her complexion resembles lightning. Her father, whose name is Pāvana, is Mukharā's sister's son. Viśākhā's mother is Dakṣiṇā, a daughter of Jaṭilā's sister. Viśākhā's husband is Vāhika Gopa» (B 84–85). ${G("Śrī Svarūpa Dāmodara Gosvāmī (#1513)")}`, "Vraja", [["Pāvana (father of Viśākhā)", "daughter"], ["Dakṣiṇā (mother of Viśākhā)", "daughter"]]],
  // — 3. Campakalatā
  ["Ārāma (father of Campakalatā)", parent("The father", "Campakalatā", "87"), "Vraja", []],
  ["Vāṭikā (mother of Campakalatā)", parent("The mother", "Campakalatā", "87"), "Vraja", []],
  ["Campakalatā", `**Śrī Campakalatā**, the third of the eight — ${EIGHT}. «Her bodily lustre resembles that of a blooming campaka flower. She is one day younger than Śrī Rādhikā. Her clothes are like the colour of the blue jay bird (*cāṣa*)» (B 86). «Campakalatā's father is Ārāma and her mother is Vāṭikā. Her husband's name is Caṇḍākṣa. She is almost like Viśākhā by her qualities» (B 87). ${G("Rāghava Gosvāmī (#1186)")}`, "Vraja", [["Ārāma (father of Campakalatā)", "daughter"], ["Vāṭikā (mother of Campakalatā)", "daughter"]]],
  // — 4. Citrā
  ["Catura (father of Citrā)", parent("The father", "Citrā (Sucitrā)", "89") + " He is «the paternal uncle of Sūryamitra (Vṛṣabhānu Mahārāja)» (B 89) — so a brother of Mahībhānu (#2206), and Citrā is Vṛṣabhānu's cousin.", "Vraja", []],
  ["Carcikā (mother of Citrā)", parent("The mother", "Citrā (Sucitrā)", "89"), "Vraja", []],
  ["Citrā (Sucitrā)", `**Śrī Citrā** (Sucitrā), the fourth of the eight — ${EIGHT}. «Her complexion is golden like saffron and her attire resembles the colour of crystal. She is twenty-six days younger than Śrī Rādhikā. She always rejoices in the happiness of Śrī Kṛṣṇa» (B 88). «The name of Citrā's father is Catura, who is the paternal uncle of Sūryamitra (Vṛṣabhānu Mahārāja). Citrā's mother is named Carcikā and her husband is Pīṭhara» (B 89). ${G("Vanamālī dāsa (Kavirāja) (#1627)")}`, "Vraja", [["Catura (father of Citrā)", "daughter"], ["Carcikā (mother of Citrā)", "daughter"]]],
  // — 5. Tuṅgavidyā
  ["Puṣkara (father of Tuṅgavidyā)", parent("The father", "Tuṅgavidyā", "91") + " Perhaps the same Puṣkara who, with Medhā, is the father of Kṛṣṇa's friend Kokila (RKGD L 58).", "Vraja", []],
  ["Medhā (mother of Tuṅgavidyā)", parent("The mother", "Tuṅgavidyā", "91") + " Perhaps the same Medhā who, with Puṣkara, is the «celebrated mother» of Kṛṣṇa's friend Kokila (RKGD L 58).", "Vraja", []],
  ["Tuṅgavidyā", `**Śrī Tuṅgavidyā**, the fifth of the eight — ${EIGHT}. «She is five days older than Śrī Rādhikā. Her body emanates a fragrance of sandalwood mixed with camphor (*candra-candana*), and her complexion resembles kuṅkuma» (B 90). «Tuṅgavidyā's clothes are light yellow. She is decorated by the qualities of *dakṣiṇā* nāyikā and *prakharā* nāyikā. Her mother's name is Medhā, her father's is Puṣkara and her husband's is Bāliśa» (B 91). ${G("Śrīpad Prabodhānanda Sarasvatī (#1095) and Vidyāvācaspati (#1675); according to some, Gopāla Guru Gosvāmī (#344)")}`, "Vraja", [["Puṣkara (father of Tuṅgavidyā)", "daughter"], ["Medhā (mother of Tuṅgavidyā)", "daughter"]]],
  // — 6. Indulekhā
  ["Sāgara (father of Indulekhā)", parent("The father", "Indulekhā", "93"), "Vraja", []],
  ["Belā (mother of Indulekhā)", parent("The mother", "Indulekhā", "93"), "Vraja", []],
  ["Indulekhā", `**Śrī Indulekhā**, the sixth of the eight — ${EIGHT}. «Her complexion is bright yellow. Her attire is like the colour of the [bright red] flowers of the pomegranate tree. She is three days younger than Śrī Rādhikā» (B 92). «Indulekhā's mother is Belā and her father is Sāgara. The qualities of a *vāmā* nāyikā and *prakharā* nāyikā decorate Indulekhā. Her husband's name is Durvala» (B 93). ${G("Kṛṣṇadāsa Brahmacārī (#755)")}`, "Vraja", [["Sāgara (father of Indulekhā)", "daughter"], ["Belā (mother of Indulekhā)", "daughter"]]],
  // — 7. and 8. Raṅgadevī and Sudevī, twins
  ["Raṅgasāra (father of Raṅgadevī and Sudevī)", "The father of the twin sisters Raṅgadevī and Sudevī, two of Śrī Rādhā's eight principal sakhīs " + SRC + " 95b–96). See the records Raṅgadevī and Sudevī.", "Vraja", []],
  ["Karuṇā (mother of Raṅgadevī and Sudevī)", "The mother of the twin sisters Raṅgadevī and Sudevī, two of Śrī Rādhā's eight principal sakhīs " + SRC + " 95b–96). See the records Raṅgadevī and Sudevī.", "Vraja", []],
  ["Raṅgadevī", `**Śrī Raṅgadevī**, the seventh of the eight — ${EIGHT}. «Her complexion resembles the colour of lotus-pollen, and her clothes have the colour of the somewhat reddish javā flower. She is seven days younger than Śrī Rādhā and her qualities resemble those of Campakalatā's» (B 94–95a). «Śrī Raṅgadevī's father is Raṅgasāra and her mother is Karuṇā. Her husband, whose name is Vakrekṣaṇa, is the younger brother of Bhairava» (Lalitā's husband) (B 95b). Her twin sister is Sudevī (B 96). ${G("Gadādhara Bhaṭṭa (#271)")}`, "Vraja", [["Raṅgasāra (father of Raṅgadevī and Sudevī)", "daughter"], ["Karuṇā (mother of Raṅgadevī and Sudevī)", "daughter"]]],
  ["Sudevī", `**Śrī Sudevī**, the eighth of the eight — ${EIGHT}. «Sudevī is the eighth of the *variṣṭha* sakhīs. She is the twin sister of Raṅgadevī and is of a gentle (*mṛdu*) nature. She resembles her sister by beauty, good qualities, nature and so forth, and is therefore sometimes mistaken to be Raṅgadevī. Sudevī is married to the younger brother of Vakrekṣaṇa, the husband of Raṅgadevī» (B 96). Her parents, as Raṅgadevī's twin, are Raṅgasāra and Karuṇā (B 95b). ${G("Ananta Ācārya (#44)")}`, "Vraja", [["Raṅgasāra (father of Raṅgadevī and Sudevī)", "daughter"], ["Karuṇā (mother of Raṅgadevī and Sudevī)", "daughter"]]],
];

const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const P = ${JSON.stringify(P)};
  const dry = ${dry};
  const log = [];
  const keys = ["name", "aka", "appearance", "disappearance", "place", "guru", "disciples", "works", "notes", "tags"];
  let all = await inv("list_persons");
  const byName = new Map(all.map((p) => [p.name, p.id]));
  // the records named in the notes must be the ones meant
  const must = { 216: "Dhruvānanda", 274: "Śrī Gadādhara", 1283: "Rāmānanda", 1513: "Śrī Svarūpa", 1186: "Rāghava", 1627: "Vanamālī", 1095: "Śrīpad Prabodhānanda", 1675: "Vidyāvācaspati", 344: "Śrī Gopāla Guru", 755: "Kṛṣṇadāsa Brahmacārī", 271: "Gadādhara Bhaṭṭa", 44: "Ananta Ācārya", 2206: "Mahībhānu", 2210: "Mukharā", 2226: "Jaṭilā" };
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
    const want = parents.map(([pn, note]) => [byName.get(pn), note]);
    const add = want.filter(([rid]) => !have.some(([h]) => h === rid));
    if (!add.length) continue;
    if (!dry) await inv("set_family", { id, relatives: [...have, ...add] });
    log.push("familia " + name + ": +" + add.length);
  }
  return log;
} catch (e) { return "ERROR " + e; } })()`;
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id === 1) { console.log(JSON.stringify(d.result?.result?.value ?? d.result, null, 1)); ws.close(); } };
