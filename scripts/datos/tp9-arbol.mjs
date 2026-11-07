// node tp9-arbol.mjs [puerto]   (07-11-2026, Textos principales, bābājīs)
// Tree fixes read in the records' own texts. Twice = nothing.
//  - 1858 Rāmadāsa Bābājī: «Śrī Rādhāramaṇa initiated him» is Rādhāramaṇa-caraṇa dāsa Deva #1168, not Rādhāramaṇa
//    Gosvāmī #1167 (Gopāla Bhaṭṭa's disciple, 16th c.) → under 1168 (dīkṣā).
//  - lines that the texts do not support: kept, marked disputed with a note (522, 308, 160, 1956).
//  - 522 Jagadānanda: he took bheka (veśa), not dīkṣā → kind vesa.
//  - 1860 Ramahari: veśa from Siddha Jagannātha dāsa Bābājī #1828 (extra line).
//  - the new Giridhārī (Haribol Kuṭīra): dīkṣā from Vipina Bihārī Caṭṭopādhyāya #1695 (extra line).
//  - family: 554 without the line to Vāsudeva Ghoṣa (it was the other Jagannātha's); Jagannātha Ghoṣa → 1654;
//    the new Gaṅgādāsa → his brothers 969 and 2001.
const [, , port = "9333"] = process.argv;
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  let rows = await inv("list_persons");
  const row = (id) => rows.find((p) => p.id === id);
  const byName = (n) => { const h = rows.filter((p) => p.name === n); if (h.length !== 1) throw new Error(h.length + " records named " + n); return h[0]; };
  const log = [];
  // 1858 → 1168
  const r = row(1858);
  if (r.name !== "Rāmadāsa Bābājī (Navadvīpa)") return { error: "1858 is " + r.name };
  if (!row(1168)?.tree) return { error: "1168 not in the tree" };
  const p1858 = await inv("get_person", { id: 1858 });
  if (p1858.tree?.parent !== 1168) {
    await inv("move_person", { id: 1858, place: { parent: 1168, before: null } });
    await inv("set_tree_kind", { id: 1858, kind: "diksa" });
    log.push("1858 under 1168 (diksa)");
  }
  await inv("set_tree_kind", { id: 522, kind: "vesa" });
  const notes = {
    522: "His bheka was from Bhagavān dāsa Bābājī, the mahānta of an ākhaḍā at Samādiā (Faridpur): perhaps not Siddha Bhagavān dāsa Bābājī of Kālnā.",
    308: "His guru is not given; about 1873 he did bhajana in Sanātana Gosvāmī's bhajana-kuṭīra at Nandagrāma (that is why he was put here).",
    160: "His text names no guru line to Siddha Kṛṣṇadāsa; he learned kīrtana from Golokadāsa Bābājī and was of the family of Nandakiśora.",
    1956: "Rādhikāvilāsa Ṭhākura of Śrīkhaṇḍa lived in the 19th century at Siddha Jagannātha dāsa Bābājī's Bhajana-kuṭīra in Navadvīpa (record of Ramahari dāsa); not a direct disciple of Mahāprabhu.",
  };
  for (const [id, note] of Object.entries(notes)) { await inv("set_line_info", { id: +id, guru: null, note, disputed: true }); }
  log.push("disputed lines: " + Object.keys(notes).join(", "));
  // extra lines (set_links keeps the family lines)
  const links = (p) => (p.links || []).filter((l) => l.kind !== "family").map((l) => [l.guru, l.kind]);
  const addLink = async (p, guru, kind) => {
    const now = links(p);
    if (now.some(([g]) => g === guru)) return;
    await inv("set_links", { id: p.id, links: [...now, [guru, kind]] });
    log.push(p.id + ": line " + kind + " to " + guru);
  };
  rows = await inv("list_persons");
  await addLink(row(1860), 1828, "vesa");
  await addLink(byName("Giridhārī dāsa Bābājī (Haribol Kuṭīra, Navadvīpa)"), 1695, "diksa");
  // family
  const fam = async (p, relatives) => {
    const now = (p.links || []).filter((l) => l.kind === "family").map((l) => [l.guru, l.note]);
    if (JSON.stringify(now) === JSON.stringify(relatives)) return;
    await inv("set_family", { id: p.id, relatives });
    log.push(p.id + " family " + JSON.stringify(relatives));
  };
  await fam(row(554), []);
  await fam(byName("Jagannātha Ghoṣa (brother of Vāsudeva Ghoṣa)"), [[1654, "brother"]]);
  await fam(byName("Gaṅgādāsa (brother of Viṣṇudāsa and Nandana)"), [[969, "brother"], [2001, "brother"]]);
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const d = JSON.parse(m.data); console.log(JSON.stringify(d.result?.result?.value ?? d.result?.exceptionDetails ?? d, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
