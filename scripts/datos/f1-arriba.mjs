// node f1-arriba.mjs [puerto]   (07-11-2026)
// #554 Jagannātha dāsa Bābājī (Varṣāṇā) ended in the first level of the tree (after its family lines were changed):
// its guru is not known and it has a bheka disciple, so it goes into the branch «Other Vaiṣṇava lines» #2027.
const [, , port = "9333"] = process.argv;
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const p = await inv("get_person", { id: 554 });
  if (p.name !== "Jagannātha Dāsa Bābājī (Varṣāṇā)") return { error: "554 is " + p.name };
  await inv("move_person", { id: 554, place: { parent: 2027, before: null } });
  await inv("set_tree_kind", { id: 554, kind: "disciple" });
  await inv("set_line_info", { id: 554, guru: null, note: "His guru is not given; his bheka disciple was Prāṇakṛṣṇa dāsa.", disputed: false });
  return "554 under 2027";
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const d = JSON.parse(m.data); console.log(JSON.stringify(d.result?.result?.value ?? d.result?.exceptionDetails ?? d)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
