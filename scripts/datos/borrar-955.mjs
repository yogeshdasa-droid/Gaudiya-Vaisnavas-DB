// node borrar-955.mjs [puerto]   (11-11-2026, Whisper: «sí, borra #955»)
// #955 «Mussalman Vaiṣṇava Poets» was a list of Muslim Vaiṣṇava poets, not a person: its text (doc 964) to the bin,
// then the record deleted. Twice = nothing.
const [, , port = "9333"] = process.argv;
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const r = (await inv("list_persons")).find((p) => p.id === 955);
  if (!r) return [];
  if (!/Mussalman/i.test(r.name) || r.tree) return { error: "955 is not what we expect: " + r.name };
  const p = await inv("get_person", { id: 955 });
  const log = [];
  for (const d of p.docs || []) { await inv("trash_doc", { docId: d.id }); log.push("doc " + d.id + " to the bin"); }
  await inv("delete_person", { id: 955 });
  log.push("955 deleted (" + r.name + ")");
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const d = JSON.parse(m.data); console.log(JSON.stringify(d.result?.result?.value ?? d.result?.exceptionDetails ?? d, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
