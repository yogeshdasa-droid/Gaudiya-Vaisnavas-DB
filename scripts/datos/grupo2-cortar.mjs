// node grupo2-cortar.mjs <puerto>   (06-11-2026, Abhidhāna group 2: Gadādhara's branch)
// Takes out of two texts a piece that belongs to another person whose record already has it:
//  · doc 3049 of Uddhava dāsa of Gadādhara's branch (1568): the life of the padakartā Uddhava dāsa
//    (Kṛṣṇakānta Majumdār, disciple of Rādhāmohana), which is already the text 2153 of his record 1876;
//  · doc 728 of Kavivallabha dāsa (722): the entry «Kāzi Saheb» glued at its end (the Kāzī delivered by
//    Gadādhara dāsa, told in full in the record of Gadādhara dāsa, 1815).
// Before cutting it checks that the other record has the text. The earlier version is kept. Twice = nothing new.
const port = process.argv[2] || "9333";
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const plan = [
  { doc: 3049, from: "Uddhava Dāsa He was a great composer", to: "# Uddhava dāsa", checkPerson: 1876, check: "Krsnakanta Majumdar" },
  { doc: 728, from: "Kāzi Saheb He was a resident of Artadaha", to: null, checkPerson: 1815, check: "Kāzi" },
];
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const plan = ${JSON.stringify(plan)};
  const log = [];
  const textOf = async (docId) => {
    const d = await inv("get_doc", { id: docId });
    return { d, t: (await inv("get_sections", { docId, from: 0, to: d.doc.sections - 1 })).map((s) => s.text).join("") };
  };
  for (const c of plan) {
    const { d, t } = await textOf(c.doc);
    const a = t.indexOf(c.from);
    if (a < 0) { log.push("doc " + c.doc + ": already cut"); continue; }
    // the other record must have it
    const docs = (await inv("list_docs")).filter((x) => x.personId === c.checkPerson);
    let has = false;
    for (const x of docs) if ((await textOf(x.id)).t.includes(c.check)) has = true;
    if (!has) { log.push("doc " + c.doc + ": record " + c.checkPerson + " has not «" + c.check + "»: not cut"); continue; }
    let e = c.to ? t.indexOf(c.to, a) : t.length;
    if (e < 0) return { error: "doc " + c.doc + ": end not found", log };
    const kept = (t.slice(0, a).replace(/\\s+$/, "") + "\\n\\n" + t.slice(e).replace(/^\\s+/, "")).replace(/\\s+$/, "") + "\\n";
    for (let n = d.doc.sections - 1; n >= 1; n--) await inv("save_section", { docId: c.doc, ordinal: n, text: "" });
    await inv("save_section", { docId: c.doc, ordinal: 0, text: kept });
    log.push("doc " + c.doc + ": " + t.length + " → " + kept.length + " characters");
  }
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const r = JSON.parse(m.data).result; console.log(JSON.stringify(r?.result?.value ?? r?.exceptionDetails?.exception?.description ?? r, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
