// node f5-arbol.mjs [puerto]   (07-11-2026, records outside the tree, batch 5). Only records still outside. Twice = nothing.
//  - 156 Bilvamaṅgala: of Viṣṇusvāmī's line (Vallabha-digvijaya) → under Viṣṇusvāmī #1882 (branch «Other sampradāyas»).
//  - 17 Advaita dāsa Bābājī: studied with Jagadānanda dāsa Paṇḍita #522 → under 522 (śikṣā).
//  - 837 Lalitāsakhī dāsī: devoted to Rādhāramaṇa-caraṇa dāsa Deva #1168 → under 1168 (disciple).
//  - 1846 Locanānanda: taught bhajana by Siddha Kṛṣṇadāsa Bābā of Govardhana #753 → under 753 (śikṣā).
const [, , port = "9333"] = process.argv;
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const plan = [
  [156, 1882, "disciple", "Of Viṣṇusvāmī's line by the Śrī Vallabha-digvijaya; his dīkṣā-guru was Somagiri."],
  [17, 522, "siksa", "He studied the Hari-nāmāmṛta grammar with Jagadānanda dāsa Paṇḍita; his dīkṣā-guru, a descendant of Advaita, is not named."],
  [837, 1168, "disciple", ""],
  [1846, 753, "siksa", "Siddha Kṛṣṇadāsa Bābā taught him and Navakiśora bhajana; his dīkṣā-guru was Navakiśora Gosvāmī."],
];
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const log = [];
  for (const [id, parent, kind, note] of ${JSON.stringify(plan)}) {
    const rows = await inv("list_persons");
    const r = rows.find((p) => p.id === id), g = rows.find((p) => p.id === parent);
    if (!r) { log.push(id + " missing"); continue; }
    if (r.tree) continue;
    if (!g?.tree) { log.push(parent + " not in the tree"); continue; }
    await inv("move_person", { id, place: { parent, before: null } });
    await inv("set_tree_kind", { id, kind });
    if (note) await inv("set_line_info", { id, guru: null, note, disputed: false });
    log.push(id + " under " + parent + " (" + kind + ")");
  }
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const d = JSON.parse(m.data); console.log(JSON.stringify(d.result?.result?.value ?? d.result?.exceptionDetails ?? d, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
