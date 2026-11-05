const [, , port, ...dates] = process.argv;
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const run = (expr) => new Promise((res) => {
  ws.onmessage = (m) => res(JSON.parse(m.data).result?.result?.value);
  ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
});
for (const d of dates) {
  const [y, m, dd] = d.split("-").map(Number);
  const r = await run(`window.__TAURI_INTERNALS__.invoke("upcoming",{y:${y},m:${m},d:${dd},count:1}).then(x=>JSON.stringify(x[0]))`);
  console.log(d, r);
}
ws.close();
