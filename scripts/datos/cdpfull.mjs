// node cdpfull.mjs <out.json> @script.js → evaluates in the app page and writes the whole result
import fs from "node:fs";
let [, , out, expr] = process.argv;
if (expr.startsWith("@")) expr = fs.readFileSync(expr.slice(1), "utf8");
const list = await (await fetch("http://127.0.0.1:9333/json")).json();
const page = list.find((p) => p.url.includes("localhost:1421"));
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  if (d.id === 1) {
    fs.writeFileSync(out, JSON.stringify(d.result?.result?.value ?? d.result, null, 1), "utf8");
    ws.close();
  }
};
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
