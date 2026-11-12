// node campos-editar.mjs <plan.json> [puerto]   (12-11-2026, «Comprobar los datos»)
// Plan: [{ id, name, edits: [{ field, from, to }] }] — in that field, the text «from» becomes «to» (only if «from» is
// there; the name is checked first). Each ficha keeps its earlier version. Twice = nothing.
import fs from "node:fs";
const [, , file, port = "9333"] = process.argv;
const plan = JSON.parse(fs.readFileSync(file, "utf8"));
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const plan = ${JSON.stringify(plan)};
  const keys = ["name", "aka", "appearance", "disappearance", "place", "guru", "disciples", "works", "notes", "tags"];
  const log = [];
  for (const g of plan) {
    const p = await inv("get_person", { id: g.id });
    if (!p || p.name !== g.name) { log.push(g.id + ": name is not «" + g.name + "» — skipped"); continue; }
    const f = Object.fromEntries(keys.map((k) => [k, Array.isArray(p[k]) ? p[k].join(", ") : (p[k] ?? "")]));
    const done = [];
    for (const e of g.edits) {
      if (!f[e.field].includes(e.from)) continue;
      if (e.to.includes(e.from) && f[e.field].includes(e.to)) continue; // an addition already made (12-11-2026: it was written twice)
      f[e.field] = f[e.field].replace(e.from, e.to);
      done.push(e.field);
    }
    if (!done.length) continue;
    await inv("update_person", { id: g.id, fields: f });
    log.push(g.id + " " + g.name + ": " + done.join(", "));
  }
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const d = JSON.parse(m.data); console.log(JSON.stringify(d.result?.result?.value ?? d.result?.exceptionDetails ?? d, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
