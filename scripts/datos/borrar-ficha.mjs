// node borrar-ficha.mjs <id> <part of its name> [puerto]   (11-11-2026) — deletes a record that is not a person (a sect,
// a list…) when Whisper says so: its texts to the bin, then the record. Checks the name and that it is outside the tree.
// Used for #487 «Hariścandī» (a sampradāya of Uttar Pradesh; Whisper: «bórrala»). Twice = nothing.
const [, , idArg, part, port = "9333"] = process.argv;
const id = Number(idArg);
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const r = (await inv("list_persons")).find((p) => p.id === ${id});
  if (!r) return [];
  if (!r.name.toLowerCase().includes(${JSON.stringify(part.toLowerCase())}) || r.tree) return { error: "${id} is not what we expect: " + r.name };
  const p = await inv("get_person", { id: ${id} });
  const log = [];
  for (const d of p.docs || []) { await inv("trash_doc", { docId: d.id }); log.push("doc " + d.id + " to the bin"); }
  await inv("delete_person", { id: ${id} });
  log.push("${id} deleted (" + r.name + ")");
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const d = JSON.parse(m.data); console.log(JSON.stringify(d.result?.result?.value ?? d.result?.exceptionDetails ?? d, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
