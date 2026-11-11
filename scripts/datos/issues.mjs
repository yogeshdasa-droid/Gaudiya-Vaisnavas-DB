// node issues.mjs <port> <out.json>  → the app's «Check the data» list (check_data), saved as JSON; prints counts.
import fs from "node:fs";
const [, , port, out] = process.argv;
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  const v = d.result?.result?.value;
  if (!Array.isArray(v)) { console.log(JSON.stringify(d).slice(0, 500)); process.exit(1); }
  fs.writeFileSync(out, JSON.stringify(v, null, 1), "utf8");
  const by = {};
  for (const i of v) { const k = i.kind + (i.inTree ? " [árbol]" : ""); by[k] = (by[k] ?? 0) + 1; }
  console.log(v.length, by);
  ws.close();
  process.exit(0);
};
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: `window.__TAURI_INTERNALS__.invoke("check_data")`, awaitPromise: true, returnByValue: true } }));
