// node multan-arbol.mjs <puerto>   (06-11-2026) — Kṛṣṇadāsa (Rāmadāsa) Punjabi of Multān (750), who built the Madana-mohana
// temple of Sanātana Gosvāmī in Vṛndāvana, as associate under Sanātana (1353) — Whisper: always under someone, so that the tree goes up to Kṛṣṇa — and his disciples Rādhākṛṣṇa Ācārya (2025) and Govinda Adhikārī (403) under him.
// Twice = nothing new.
const port = process.argv[2] || "9333";
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const plan = { place: [[750, 1353, "associate"], [2025, 750, "diksa"], [403, 750, "diksa"]], links: [] };
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const plan = ${JSON.stringify(plan)};
  const log = [];
  let rows = await inv("list_persons");
  for (const [id, parent, kind] of plan.place) {
    const r = rows.find((p) => p.id === id);
    if (!r) { log.push(id + ": no record"); continue; }
    if (r.tree) { log.push(id + " " + r.name + ": already in the tree (under " + r.tree.parent + ")"); continue; }
    await inv("move_person", { id, place: { parent, before: null } });
    await inv("set_tree_kind", { id, kind });
    log.push(id + " " + r.name + ": put under " + parent + " (" + kind + ")");
  }
  rows = await inv("list_persons");
  for (const [id, guru, kind] of plan.links) {
    const r = rows.find((p) => p.id === id);
    const now = (r.links || []).filter((l) => l.kind !== "family").map((l) => [l.guru, l.kind]);
    if (now.some(([g, k]) => g === guru && k === kind)) { log.push(id + ": line to " + guru + " already there"); continue; }
    await inv("set_links", { id, links: [...now, [guru, kind]] });
    log.push(id + " " + r.name + ": + " + guru + "/" + kind);
  }
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { console.log(JSON.stringify(JSON.parse(m.data).result?.result?.value, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
