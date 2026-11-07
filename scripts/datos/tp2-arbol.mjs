// node tp2-arbol.mjs [puerto]   (07-11-2026, Textos principales, tanda 2)
// After textoprincipal.mjs tp2.json: the new record «Jagadīśa Paṇḍita (of Navadvīpa)» goes under Śrī Caitanya
// Mahāprabhu #164 as an associate (pārṣada), with a family line to his brother Hiraṇya #502. Twice = nothing.
const [, , port = "9333"] = process.argv;
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const rows = await inv("list_persons");
  const hit = rows.filter((p) => p.name === "Jagadīśa Paṇḍita (of Navadvīpa)");
  if (hit.length !== 1) return { error: hit.length + " records named «Jagadīśa Paṇḍita (of Navadvīpa)»" };
  const r = hit[0], log = [];
  if (!rows.find((p) => p.id === 164)?.tree) return { error: "164 not in the tree" };
  if (!r.tree) {
    await inv("move_person", { id: r.id, place: { parent: 164, before: null } });
    await inv("set_tree_kind", { id: r.id, kind: "associate" });
    log.push(r.id + ": under 164 (associate)");
  }
  const fam = [[502, "brother"]];
  const now = (r.links || []).filter((l) => l.kind === "family").map((l) => [l.guru, l.note]);
  if (JSON.stringify(now) !== JSON.stringify(fam)) {
    await inv("set_family", { id: r.id, relatives: fam });
    log.push(r.id + ": family " + JSON.stringify(fam));
  }
  return { id: r.id, log };
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const d = JSON.parse(m.data); console.log(JSON.stringify(d.result?.result?.value ?? d.result?.exceptionDetails ?? d, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
