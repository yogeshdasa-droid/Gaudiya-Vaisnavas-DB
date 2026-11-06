// node libro-sanatkumara.mjs <puerto>   (06-11-2026, Whisper: «la ficha Śrī Sanatkumāra-saṁhitā parece un libro»)
// Its only text (doc 1369, Kuśakratha dāsa's translation) becomes a book of the Library («Libros», no person),
// and the record 1356 is taken away (as was done with «Lives of the Saints»). Twice = nothing new.
const port = process.argv[2] || "9333";
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const log = [];
  const title = "Śrī Sanatkumāra-saṁhitā (translated by Kuśakratha dāsa)";
  const d = (await inv("get_doc", { id: 1369 })).doc;
  if ((d.personId ?? null) !== null || d.collection !== "Libros" || d.title !== title) {
    if (d.personId != null && d.personId !== 1356) return { error: "doc 1369 belongs to " + d.personId };
    await inv("update_doc", { docId: 1369, meta: { title, date: d.date ?? "", collection: "Libros", personId: null } });
    log.push("doc 1369 → «Libros», no person: " + title);
  } else log.push("doc 1369 already a book");
  const p = await inv("get_person", { id: 1356 }).catch(() => null);
  if (!p) log.push("1356 already taken away");
  else if (p.name !== "ŚRĪ SANATKUMARA-SAṀHITĀ") log.push("1356 is «" + p.name + "», not touched");
  else if (p.docs.length) log.push("1356 still has texts, not taken away");
  else { await inv("delete_person", { id: 1356 }); log.push("record 1356 taken away"); }
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { console.log(JSON.stringify(JSON.parse(m.data).result?.result?.value, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
