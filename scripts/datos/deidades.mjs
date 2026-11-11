// node deidades.mjs [puerto]   (11-11-2026, Whisper: a panel «Deidades» between Tīrthas and Library)
// Gives the label «Deidades» to the records that are a Deity, not a person. Twice = nothing.
//  - 1305 Rasikarāya Jīu: the Deity of Candrā Śarmā of Jaipur served by Gaṅgāmātā (her texts tell the same story).
const [, , port = "9333"] = process.argv;
const ids = [1305];
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const rows = await inv("list_persons");
  const has = (p) => p.tags.split(",").some((x) => x.trim().toLowerCase() === "deidades");
  const todo = ${JSON.stringify(ids)}.filter((id) => { const r = rows.find((p) => p.id === id); return r && !has(r); });
  if (todo.length) await inv("set_tag", { ids: todo, tag: "Deidades", on: true });
  return todo.length ? ["Deidades: " + todo.join(", ")] : [];
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const d = JSON.parse(m.data); console.log(JSON.stringify(d.result?.result?.value ?? d.result?.exceptionDetails ?? d, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
