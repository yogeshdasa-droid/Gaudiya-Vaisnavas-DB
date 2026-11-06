// node poetas.mjs <poetas.json> <puerto>   (06-11-2026, asked by Whisper)
// Gives the label «Poetas» to the poets of the plan (made by poetas-plan.mjs and checked by hand) that are still
// outside the Guru Paramparā: in the side list they leave the Vaiṣṇava-maṇḍala for the group «Poetas».
// Twice = nothing new.
import fs from "node:fs";
const [, , file, port = "9333"] = process.argv;
const plan = JSON.parse(fs.readFileSync(file, "utf8"));
const ids = (Array.isArray(plan) ? plan : plan.poets).map((x) => x.id);
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const ids = ${JSON.stringify(ids)};
  const rows = await inv("list_persons");
  const poet = (p) => p.tags.split(",").some((x) => x.trim().toLowerCase() === "poetas");
  const todo = ids.filter((id) => { const r = rows.find((p) => p.id === id); return r && !r.tree && !poet(r); });
  if (todo.length) await inv("set_tag", { ids: todo, tag: "Poetas", on: true });
  return { tagged: todo.length, skipped: ids.length - todo.length };
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (msg) => { console.log(JSON.stringify(JSON.parse(msg.data).result?.result?.value, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
