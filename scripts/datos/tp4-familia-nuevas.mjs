// node tp4-familia-nuevas.mjs [puerto]   (07-11-2026, Textos principales, tandas 4-8)
// Family lines for records made by separar.mjs tp-separar.json (found by their exact name). Twice = nothing.
const plan = [
  ["Balarāma (son of Kānāi Khuṇṭiyā)", [[663, "son"]]],
  ["Balarāma (brother of Śyāmānanda)", [[1535, "younger brother"]]],
  ["Balarāma (son of Gaurīdāsa Paṇḍita)", [[325, "eldest son"]]],
];
const [, , port = "9333"] = process.argv;
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const plan = ${JSON.stringify(plan)};
  const rows = await inv("list_persons");
  const log = [];
  for (const [name, fam] of plan) {
    const hit = rows.filter((p) => p.name === name);
    if (hit.length !== 1) { log.push(name + ": " + hit.length + " records"); continue; }
    for (const [rel] of fam) if (!rows.find((p) => p.id === rel)) return { error: rel + " missing" };
    const now = (hit[0].links || []).filter((l) => l.kind === "family").map((l) => [l.guru, l.note]);
    if (JSON.stringify(now) === JSON.stringify(fam)) continue;
    await inv("set_family", { id: hit[0].id, relatives: fam });
    log.push(hit[0].id + " " + name + ": " + JSON.stringify(fam));
  }
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const d = JSON.parse(m.data); console.log(JSON.stringify(d.result?.result?.value ?? d.result?.exceptionDetails ?? d, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
