// node f7-arbol.mjs [puerto]   (07-11-2026, records outside the tree, batch 7). Only records still outside. Twice = nothing.
//  - 1115 Premānanda Gosvāmī of Śṛṅgāra-vaṭa (guru: his brother Nṛsiṁhānanda, no record) → branch #2027.
//  - 859 Mādhava dāsa Bābājī: veśa and dīkṣā from Premānanda → under 1115 (diksa).
//  - 1185 Rādhikānātha Gosvāmī (of Advaita's family; his own guru not named) → branch #2027.
//  - 469 Haridāsa dāsa: veśa from Giridhārī Haribol Sādhu #2145 → under 2145 (vesa).
//  Extra lines (after the places, so that no one falls into the first level): 859 → 1185 śikṣā; 1334 → 1185 śikṣā;
//  469 → 1849 śikṣā (Manohara dāsa's order).
const [, , port = "9333"] = process.argv;
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const plan = [
  [1115, 2027, "disciple", "His guru, his elder brother Nṛsiṁhānanda Prabhu of Śṛṅgāra-vaṭa (Nityānanda's family), has no record."],
  [859, 1115, "diksa", "Veśa and, later, a second dīkṣā from Premānanda Gosvāmī."],
  [1185, 2027, "disciple", "Of Advaita's family; he studied the Bhāgavatam with Madana-gopāla Gosvāmī; his dīkṣā-guru is not named."],
  [469, 2145, "vesa", "Dīkṣā from Harimohana Śiromaṇi Prabhu (no record)."],
];
const links = [[859, 1185, "siksa"], [1334, 1185, "siksa"], [469, 1849, "siksa"]];
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
  for (const [id, guru, kind] of ${JSON.stringify(links)}) {
    const rows = await inv("list_persons");
    const r = rows.find((p) => p.id === id), g = rows.find((p) => p.id === guru);
    if (!g?.tree) { log.push(guru + " not in the tree: no line from " + id); continue; }
    const now = (r.links || []).filter((l) => l.kind !== "family").map((l) => [l.guru, l.kind]);
    if (now.some(([x]) => x === guru)) continue;
    await inv("set_links", { id, links: [...now, [guru, kind]] });
    log.push(id + ": line " + kind + " to " + guru);
  }
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const d = JSON.parse(m.data); console.log(JSON.stringify(d.result?.result?.value ?? d.result?.exceptionDetails ?? d, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
