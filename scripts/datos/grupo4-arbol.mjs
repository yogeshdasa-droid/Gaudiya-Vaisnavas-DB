// node grupo4-arbol.mjs <puerto>   (06-11-2026, Abhidhāna group 4)
// 1) Rādhākṛṣṇa Dāsa Gosvāmī (1152), author of the Daśa-ślokī-bhāṣya, disciple of Haridāsa Paṇḍita (1947), was
//    under Haridāsa Ṭhākura (475) by the confusion of the two Haridāsas: under 1947 as dīkṣā.
// 2) Doc 3332 of Haridāsa Ṭhākura (a lowercase copy of doc 2972, every sentence also there) to the bin, after checking.
// Twice = nothing new.
const port = process.argv[2] || "9333";
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const log = [];
  const rows = await inv("list_persons");
  const r = rows.find((p) => p.id === 1152);
  if (r.tree && r.tree.parent === 1947) log.push("1152 already under 1947");
  else { await inv("move_person", { id: 1152, place: { parent: 1947, before: null } }); await inv("set_tree_kind", { id: 1152, kind: "diksa" }); log.push("1152 " + r.name + ": under 1947 (dīkṣā)"); }
  const text = async (id) => { const d = await inv("get_doc", { id }); if (d.doc.deleted) return null; return (await inv("get_sections", { docId: id, from: 0, to: d.doc.sections - 1 })).map((s) => s.text).join(" "); };
  const n = (s) => s.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().replace(/[^a-z]+/g, "");
  const a = await text(3332), b = await text(2972);
  if (a === null) log.push("3332 already in the bin");
  else {
    const sents = a.split(/(?<=[.!?\\]])\\s+/).map(n).filter((s) => s.length > 30);
    const nb = n(b);
    const missing = sents.filter((s) => !nb.includes(s));
    if (missing.length) log.push("3332: " + missing.length + " of " + sents.length + " sentences not in 2972 — not moved");
    else { await inv("trash_doc", { docId: 3332 }); log.push("3332 to the bin (all " + sents.length + " sentences are in 2972)"); }
  }
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (msg) => { console.log(JSON.stringify(JSON.parse(msg.data).result?.result?.value, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
