// node borrar-vacias.mjs [puerto]   (11-11-2026, Whisper: «sí, bórralas»). Deletes the 7 records that were empty since
// the import (only a name): 119, 412, 1301, 1556, 1558, 1616, 1957. (1956 Rādhikāvilāsa is NOT here: guru of #1860.)
// Each one is checked again first: no fields, no texts, not in the tree. Twice = nothing.
const [, , port = "9333"] = process.argv;
const ids = [119, 412, 1301, 1556, 1558, 1616, 1957];
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const log = [];
  const rows = await inv("list_persons");
  for (const id of ${JSON.stringify(ids)}) {
    const r = rows.find((p) => p.id === id);
    if (!r) continue;
    const p = await inv("get_person", { id });
    const f = p.fields || p;
    const filled = ["aka","appearance","disappearance","place","guru","disciples","works","notes","tags"].filter((k) => String(f[k] ?? "").trim());
    const docs = (p.docs || []).length;
    if (filled.length || docs || r.tree) { log.push(id + " NOT empty, kept: " + JSON.stringify({ filled, docs, tree: !!r.tree })); continue; }
    await inv("delete_person", { id });
    log.push(id + " deleted (" + r.name + ")");
  }
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const d = JSON.parse(m.data); console.log(JSON.stringify(d.result?.result?.value ?? d.result?.exceptionDetails ?? d, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
