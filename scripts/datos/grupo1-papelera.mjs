// node grupo1-papelera.mjs <port>   (06-11-2026, grupo 1: Mahāprabhu y Nityānanda)
// Nityānanda (1851): doc 3084 «Śrī Nityānanda» (488 KB) and doc 1056 «Nityānanda Prabhu,Śrīla» are whole inside
// doc 3117 (every sentence: cmpdocs.mjs 3975/3975 and 38/38) → to the bin, after checking it again here.
// Twice = nothing new.
const list = await (await fetch("http://127.0.0.1:" + process.argv[2] + "/json")).json();
const page = list.find((p) => p.url.includes("localhost:1421") || p.url.includes("tauri.localhost"));
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  // (get_doc does not say whether a text is in the bin: a text in the bin is no longer in its record's list)
  const live = new Set((await inv("get_person", { id: 1851 })).docs.map((x) => x.id));
  const text = async (id) => { if (!live.has(id)) return null; const d = await inv("get_doc", { id }); return { t: (await inv("get_sections", { docId: id, from: 0, to: d.doc.sections - 1 })).map((s) => s.text).join("\\n") }; };
  const n = (s) => s.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");
  const log = [];
  const big = await text(3117);
  if (!big) return { error: "doc 3117 is not there" };
  const all = new Set(big.t.split(/(?<=[.!?])\\s+|\\n+/).map(n));
  for (const id of [3084, 1056]) {
    const d = await text(id);
    if (d === null) { log.push(id + " already in the bin"); continue; }
    const sents = d.t.split(/(?<=[.!?])\\s+|\\n+/).map(n).filter((x) => x.length > 40);
    const missing = sents.filter((s) => !all.has(s));
    if (missing.length) { log.push(id + ": " + missing.length + " sentences not in 3117 — kept"); continue; }
    await inv("trash_doc", { docId: id });
    log.push(id + " (" + sents.length + " sentences, all in 3117) to the bin");
  }
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { console.log(JSON.stringify(JSON.parse(m.data).result?.result?.value, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
