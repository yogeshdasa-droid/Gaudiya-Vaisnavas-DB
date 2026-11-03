// node cdp.mjs <out.png|-> "<js expression>"  → evaluates in the app page, optional screenshot
import fs from "node:fs";
let [, , out, expr, wait = "600"] = process.argv; if (expr && expr.startsWith("@")) expr = fs.readFileSync(expr.slice(1), "utf8");
const list = await (await fetch("http://127.0.0.1:9334/json")).json();
const page = list.find((p) => p.url.includes("tauri.localhost"));
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  if (pending.has(d.id)) pending.get(d.id)(d), pending.delete(d.id);
};
const call = (method, params = {}) => new Promise((r) => (ws.send(JSON.stringify({ id: ++id, method, params })), pending.set(id, r)));
if (expr) {
  const r = await call("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
  console.log(JSON.stringify(r.result?.result?.value ?? r.result, null, 1)?.slice(0, 4000));
}
await new Promise((r) => setTimeout(r, Number(wait)));
if (out !== "-") {
  const r = await call("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(out, Buffer.from(r.result.data, "base64"));
}
ws.close();
