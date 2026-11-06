// node colocar.mjs <plan.json> <puerto>   (06-11-2026, asked by Whisper)
// Puts each record of the plan (made by colocar-plan.mjs) under its guru in the Guru Paramparā, with its kind,
// if it is still outside the tree and the guru is in the tree. Twice = nothing new.
import fs from "node:fs";
const [, , file, port = "9333"] = process.argv;
const plan = JSON.parse(fs.readFileSync(file, "utf8"));
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const plan = ${JSON.stringify(plan)};
  const rows = await inv("list_persons");
  const row = (id) => rows.find((p) => p.id === id);
  let done = 0; const log = [];
  for (const x of plan) {
    const r = row(x.id), g = row(x.parent);
    if (!r) { log.push(x.id + ": no record"); continue; }
    if (r.tree) continue;
    if (!g || !g.tree) { log.push(x.id + " " + r.name + ": guru " + x.parent + " not in the tree"); continue; }
    await inv("move_person", { id: x.id, place: { parent: x.parent, before: null } });
    await inv("set_tree_kind", { id: x.id, kind: x.kind });
    done++;
  }
  return { placed: done, notes: log };
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (msg) => { console.log(JSON.stringify(JSON.parse(msg.data).result?.result?.value, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
