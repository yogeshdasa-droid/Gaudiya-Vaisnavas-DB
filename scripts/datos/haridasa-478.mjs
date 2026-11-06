// node haridasa-478.mjs <puerto>   (06-11-2026) — doc 478 of Haridāsa Śiromaṇi (474): after his own entry, the same entry again
// with a piece of an English Vaiṣṇava dictionary glued on (Haridāsa Bābājī … Hussain Khān), all of it also in the book
// «2 - Vaiṣṇava Biographies A-Z» (Haridāsa Ṭhākura's entry, with sentences found nowhere else, went first to 475 with
// haridasa-478-split.json). Only his own first entry stays. The earlier version is kept. Twice = nothing new.
const port = process.argv[2] || "9333";
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const docId = 478, head = "## HARIDĀSA ŚIROMAṆI";
  const d = await inv("get_doc", { id: docId });
  const t = (await inv("get_sections", { docId, from: 0, to: d.doc.sections - 1 })).map((s) => s.text).join("");
  if (t.includes("Haridāsa ṭhākur śrī haridās ṭhākur appeared")) return { error: "move Haridāsa Ṭhākura's entry first (haridasa-478-split.json)" };
  const first = t.indexOf(head), second = t.indexOf(head, first + 1);
  if (second < 0) return ["only his own entry left (" + t.length + " characters)"];
  const kept = t.slice(0, second).replace(/\\s+$/, "") + "\\n";
  if (!/Premavilāsa 19/.test(kept)) return { error: "first entry not as expected", kept };
  for (let n = d.doc.sections - 1; n >= 1; n--) await inv("save_section", { docId, ordinal: n, text: "" });
  await inv("save_section", { docId, ordinal: 0, text: kept });
  return ["doc 478: " + t.length + " → " + kept.length + " characters"];
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const r = JSON.parse(m.data).result; console.log(JSON.stringify(r?.result?.value ?? r?.exceptionDetails?.exception?.description ?? r)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
