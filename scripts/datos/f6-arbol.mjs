// node f6-arbol.mjs [puerto]   (07-11-2026, records outside the tree, batch 6). Only records still outside. Twice = nothing.
//  - 1685 Vijayakṛṣṇa Gosvāmī: guru Brahmānanda Paramahaṁsa of Gayā (no record, not in the Paramparā), with disciples
//    → branch «Other Vaiṣṇava lines» #2027.
//  - 1334 Saccidānanda Vrajabālā: dīkṣā and sannyāsa from Vijayakṛṣṇa → under 1685 (diksa).
//  - 891 Mahānidhi Svāmī: disciple of Śrīla Prabhupāda #125 → under 125 (diksa).
const [, , port = "9333"] = process.argv;
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const plan = [
  [1685, 2027, "disciple", "His guru, Brahmānanda Paramahaṁsa of Gayā, is not in the Guru Paramparā (no record)."],
  [1334, 1685, "diksa", ""],
  [891, 125, "diksa", "Later bābājī-veśa (2014) from Paṇḍita Kṛṣṇadāsa Bābājī of the Advaita Parivāra."],
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
