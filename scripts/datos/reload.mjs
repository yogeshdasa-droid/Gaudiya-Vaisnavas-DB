const port = process.argv[2] || "9334";
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
ws.send(JSON.stringify({ id: 1, method: "Page.reload", params: {} }));
await new Promise((r) => setTimeout(r, 500));
ws.close();
console.log("reloaded", page.url);
