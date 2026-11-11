// node syncdry.mjs <port> <out.json> → sync_tree(write=false): what writing the tree into the fields would add.
import fs from "node:fs";
const [, , port, out] = process.argv;
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
ws.onmessage = (m) => {
  const v = JSON.parse(m.data).result?.result?.value;
  fs.writeFileSync(out, JSON.stringify(v, null, 1), "utf8");
  const g = v.reduce((s, c) => s + c.gurus.length, 0), d = v.reduce((s, c) => s + c.disciples.length, 0);
  console.log(v.length + " records would change; gurus added " + g + ", disciples added " + d);
  for (const c of v.slice(0, 12)) console.log(" ", c.id, c.name, "| +guru:", c.gurus.join("; "), "| +disc:", c.disciples.slice(0, 4).join("; ") + (c.disciples.length > 4 ? " …" : ""));
  ws.close(); process.exit(0);
};
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: `window.__TAURI_INTERNALS__.invoke("sync_tree", { write: false })`, awaitPromise: true, returnByValue: true } }));
