const list = await (await fetch("http://127.0.0.1:9334/json")).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: "location.reload()" } }));
setTimeout(() => (ws.close(), console.log("reloaded")), 300);
