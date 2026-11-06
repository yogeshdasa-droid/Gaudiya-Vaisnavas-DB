// node trashsmall.mjs <port> → doc 3331 (empty after dedupe) and doc 1989 (contained in 3329) to the bin, after checking
const list = await (await fetch("http://127.0.0.1:" + process.argv[2] + "/json")).json();
const page = list.find((p) => p.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const text = async (id) => { const d = await inv("get_doc", { id }); if (d.doc.deleted) return null; return (await inv("get_sections", { docId: id, from: 0, to: d.doc.sections - 1 })).map((s) => s.text).join(""); };
  const n = (s) => s.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().replace(/[^a-z]+/g, "");
  const log = [];
  const a = await text(3331);
  if (a === null) log.push("3331 already in the bin"); else if (n(a).length < 60) { await inv("trash_doc", { docId: 3331 }); log.push("3331 (" + JSON.stringify(a) + ") to the bin"); } else log.push("3331 not empty: " + a.slice(0, 80));
  const b = await text(1989), c = await text(3329);
  if (b === null) log.push("1989 already in the bin");
  else {
    const sents = b.split(/(?<=[.!?])\\s+|\\n+/).map(n).filter((x) => x.length > 25);
    const missing = sents.filter((s) => !n(c).includes(s));
    if (!missing.length) { await inv("trash_doc", { docId: 1989 }); log.push("1989 contained in 3329: to the bin"); } else log.push("1989 has " + missing.length + " sentences not in 3329: kept");
  }
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { console.log(JSON.stringify(JSON.parse(m.data).result?.result?.value)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
