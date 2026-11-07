// node arreglos2.mjs [puerto]   (07-11-2026)
// Abhirāma Ṭhākura #6, doc 6 part 0: a broken link mark «](<» joined two paragraphs about him; it becomes a
// paragraph break (save_section keeps the earlier version). Twice = nothing.
const port = process.argv[2] ?? "9333";
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const s = await inv("get_sections", { docId: 6, from: 0, to: 0 });
  const t = s[0].text;
  if (!t.includes("](<")) return "already clean";
  await inv("save_section", { docId: 6, ordinal: 0, text: t.replace("](<", "\\n\\n") });
  return "doc 6: mark taken out";
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const d = JSON.parse(m.data); console.log(JSON.stringify(d.result?.result?.value ?? d.result?.exceptionDetails ?? d).slice(0, 600)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
