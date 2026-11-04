// node shot.mjs <port> <out.png> "<js to run first>" [waitMs] [scale] → runs the JS in the page, waits, takes a screenshot
import fs from "node:fs";
const [, , port, out, js0 = "", wait = "1500", scale = "0.6"] = process.argv;
const js = js0.startsWith("@") ? fs.readFileSync(js0.slice(1), "utf8") : js0;
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let n = 0;
const call = (method, params) =>
  new Promise((res) => {
    const id = ++n;
    const h = (m) => {
      const d = JSON.parse(m.data);
      if (d.id === id) {
        ws.removeEventListener("message", h);
        res(d.result);
      }
    };
    ws.addEventListener("message", h);
    ws.send(JSON.stringify({ id, method, params }));
  });
if (js) {
  const r = await call("Runtime.evaluate", { expression: js, awaitPromise: true, returnByValue: true });
  console.log("js:", JSON.stringify(r?.result?.value ?? r?.exceptionDetails?.text ?? null));
}
await new Promise((r) => setTimeout(r, Number(wait)));
const m = await call("Runtime.evaluate", { expression: "JSON.stringify([innerWidth, innerHeight])", returnByValue: true });
const [w, h] = JSON.parse(m.result.value);
const shot = await call("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: w, height: h, scale: Number(scale) } });
fs.writeFileSync(out, Buffer.from(shot.data, "base64"));
console.log("saved", out, w, h);
ws.close();
