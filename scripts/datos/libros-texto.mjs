// node libros-texto.mjs <plan.json> [puerto] [--dry]   (16-11-2026) — for scanned books imported with libros-importar.mjs:
// the text the app took from the PDF (nothing, or letters in code) is replaced by the OCR text (`ocr`, «=== NNN ===» per
// page → «## p. N»), with `about` at the top. Only if the text is not the OCR one yet: twice = nothing.
import fs from "node:fs";
const args = process.argv.slice(2);
const dry = args.includes("--dry");
const [file, port = "9334"] = args.filter((a) => a !== "--dry");
const plan = JSON.parse(fs.readFileSync(file, "utf8")).map((g) => {
  const raw = fs.readFileSync(new URL(g.ocr, new URL("./", import.meta.url)), "utf8").replace(/\r\n/g, "\n");
  const body = raw
    .replace(/^=== 0*(\d+) ===$/gm, "## p. $1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return { ...g, text: `> ${g.about}\n\n${body}\n` };
});
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const plan = ${JSON.stringify(plan)};
  const dry = ${dry};
  const log = [];
  const books = (await inv("list_docs")).filter((d) => d.dir === "Libros");
  for (const g of plan) {
    let doc = null;
    for (const d of books) { const x = (await inv("get_doc", { id: d.id })).doc; if ((x.source ?? "").toLowerCase() === g.path.toLowerCase()) { doc = d.id; break; } }
    if (doc === null) { log.push("no está importado: " + g.title); continue; }
    const n0 = (await inv("get_doc", { id: doc })).doc.sections;
    const secs = n0 ? await inv("get_sections", { docId: doc, from: 0, to: n0 }) : [];
    const now = secs.map((s) => s.text).join(" ");
    if (now.includes(g.about.slice(0, 60))) { log.push("ya tiene el OCR: " + doc + " " + g.title); continue; }
    log.push((dry ? "pondría" : "pone") + " el OCR en " + doc + " " + g.title + " (antes " + n0 + " partes)");
    if (dry) continue;
    for (let n = n0 - 1; n >= 1; n--) await inv("save_section", { docId: doc, ordinal: n, text: "" });
    await inv("save_section", { docId: doc, ordinal: 0, text: g.text });
    log.push("   ahora " + (await inv("get_doc", { id: doc })).doc.sections + " partes");
  }
  return log;
} catch (e) { return "ERROR " + e; } })()`;
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id === 1) { console.log(JSON.stringify(d.result?.result?.value ?? d.result, null, 1)); ws.close(); } };
