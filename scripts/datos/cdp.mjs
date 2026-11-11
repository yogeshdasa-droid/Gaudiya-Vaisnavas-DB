// node cdp.mjs <port> <out.png|-> <js expression>   → evaluates in the app page and optionally takes a screenshot
import fs from "node:fs";
const [, , port, out, arg] = process.argv;
const expr = arg?.startsWith("@") ? fs.readFileSync(arg.slice(1), "utf8") : arg;
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.type === "page" && p.url.includes("localhost:1421")) ?? list.find((p) => p.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let n = 0;
const call = (method, params) => new Promise((res) => {
  const id = ++n;
  const h = (m) => { const d = JSON.parse(m.data); if (d.id === id) { ws.removeEventListener("message", h); res(d.result); } };
  ws.addEventListener("message", h);
  ws.send(JSON.stringify({ id, method, params }));
});
if (expr) {
  const r = await call("Runtime.evaluate", { expression: `(async () => { try { ${expr} } catch (e) { return "ERR " + e; } })()`, awaitPromise: true, returnByValue: true });
  console.log(JSON.stringify(r.result?.value ?? r.exceptionDetails ?? r, null, 1));
}
if (out && out !== "-") {
  await new Promise((r) => setTimeout(r, 700));
  const shot = await call("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: 1100, height: 700, scale: 0.6 } });
  fs.writeFileSync(out, Buffer.from(shot.data, "base64"));
  console.log("shot", out);
}
ws.close();
process.exit(0);
