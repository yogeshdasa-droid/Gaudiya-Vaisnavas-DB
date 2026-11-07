// node familia2.mjs <plan.json> [puerto]   (07-11-2026)
// Sets the whole family list of each record: plan [{ id, name, family: [[relative, how], …] }] (replaces it; the
// name is checked). Twice = nothing.
import fs from "node:fs";
const [, , file, port = "9333"] = process.argv;
const plan = JSON.parse(fs.readFileSync(file, "utf8"));
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const plan = ${JSON.stringify(plan)};
  const rows = await inv("list_persons");
  const log = [];
  for (const x of plan) {
    const r = rows.find((p) => p.id === x.id);
    if (!r || (r.name !== x.name && r.name !== x.newName)) return { error: x.id + " is " + (r ? r.name : "(none)"), log };
    const now = (r.links || []).filter((l) => l.kind === "family").map((l) => [l.guru, l.note]);
    if (JSON.stringify(now) === JSON.stringify(x.family)) continue;
    await inv("set_family", { id: x.id, relatives: x.family });
    log.push(x.id + ": " + JSON.stringify(now) + " → " + JSON.stringify(x.family));
  }
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const d = JSON.parse(m.data); console.log(JSON.stringify(d.result?.result?.value ?? d.result?.exceptionDetails ?? d, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
