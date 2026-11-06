// node grupo1-libro.mjs <port>   (06-11-2026, Whisper: «el libro entero lo pasamos con los otros libros»)
// The «# Nityānanda - v.1» of doc 3117 (Nityānanda 1851, ~383 KB: the Caitanya-bhāgavata told in prose, with
// parts of the Prema-vilāsa) is a whole book: it goes out of 3117 into a text of its own in «Libros», with no
// person; the rest of 3117 stays in the record. Run BEFORE sindup on 3117. Twice = nothing new.
const list = await (await fetch("http://127.0.0.1:" + process.argv[2] + "/json")).json();
const page = list.find((p) => p.url.includes("localhost:1421") || p.url.includes("tauri.localhost"));
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const TITLE = "Nityānanda Prabhu — His life (the Caitanya-bhāgavata told in prose, with later accounts)";
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const log = [];
  const DOC = 3117, START = "# Nityānanda - v.1", END = "# Nityānanda - v.2";
  const d = await inv("get_doc", { id: DOC });
  if (d.doc.personId !== 1851) return { error: "doc 3117 is not in record 1851" };
  const t = (await inv("get_sections", { docId: DOC, from: 0, to: d.doc.sections - 1 })).map((s) => s.text).join("");
  const a = t.indexOf(START), b = t.indexOf(END);
  if (a < 0) return ["the book is already out of 3117"];
  if (b < a) return { error: "end of the book not found" };
  const piece = t.slice(a + START.length, b).trim();
  const rest = (t.slice(0, a).trimEnd() + "\\n\\n" + t.slice(b)).trim() + "\\n";
  // the book: a new text (made in the record, then made a book with no person)
  const docId = await inv("create_doc", { personId: 1851, title: ${JSON.stringify(TITLE)}, collection: "Fichas" });
  await inv("save_section", { docId, ordinal: 0, text: "# " + ${JSON.stringify(TITLE)} + "\\n\\n" + piece + "\\n" });
  await inv("update_doc", { docId, meta: { title: ${JSON.stringify(TITLE)}, date: "", collection: "Libros", personId: null } });
  const nb = await inv("get_doc", { id: docId });
  const saved = (await inv("get_sections", { docId, from: 0, to: nb.doc.sections - 1 })).map((s) => s.text).join("");
  const flat = (s) => s.replace(/\\s+/g, "");
  if (!flat(saved).includes(flat(piece))) return { error: "the book was not saved whole in doc " + docId + "; 3117 left as it was" };
  log.push("book → doc " + docId + " («Libros», no person), " + saved.length + " letters, in " + nb.doc.sections + " parts");
  // and 3117 without it
  for (let n = d.doc.sections - 1; n >= 1; n--) await inv("save_section", { docId: DOC, ordinal: n, text: "" });
  await inv("save_section", { docId: DOC, ordinal: 0, text: rest });
  log.push("3117: " + t.length + " → " + rest.length + " letters");
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { console.log(JSON.stringify(JSON.parse(m.data).result?.result?.value, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
