// node completar-campos.mjs <plan.json> [puerto]   (11-11-2026, Whisper: «ayúdame con Comprobar los datos»)
// For each pair of the plan's «safe» list — a ficha says «Guru: X» (or «Disciples: X») and the other ficha does not say
// it back, but the TREE confirms the relation (its place or an extra line) — writes the name in the other ficha with
// the app's own complete_back (only adds; each ficha keeps its earlier version). Pairs no longer pending are skipped.
// Twice = nothing.
import fs from "node:fs";
const [, , file, port = "9333"] = process.argv;
const plan = JSON.parse(fs.readFileSync(file, "utf8")).safe;
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const plan = ${JSON.stringify(plan.map((x) => [x.id, x.other]))};
  const pending = new Set((await inv("check_data")).filter((i) => i.kind === "notBackGuru" || i.kind === "notBackDisciple").map((i) => i.id + "-" + i.other));
  let done = 0, records = 0;
  for (const [id, other] of plan) {
    if (!pending.has(id + "-" + other)) continue;
    const ch = await inv("complete_back", { id, other });
    done++; records += ch.length;
  }
  return { pairs: done, recordsChanged: records };
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const d = JSON.parse(m.data); console.log(JSON.stringify(d.result?.result?.value ?? d.result?.exceptionDetails ?? d, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
