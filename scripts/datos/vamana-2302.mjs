// node vamana-2302.mjs <puerto>   (06-11-2026, Whisper: «sí, quita las copias»)
// Doc 2302 (Mis textos, Vāmana Mahārāja) has Nārāyaṇa Mahārāja's appearance-day lecture twice with small spelling
// differences (sindup could not see them). The second copy, from the 2nd «Vyāsa is the personality» to the end,
// goes; the biography, the first copy and the list of lectures stay. The earlier version is kept. Twice = nothing.
const port = process.argv[2] || "9333";
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const docId = 2302, key = "Vyāsa is the personality";
  const d = await inv("get_doc", { id: docId });
  const t = (await inv("get_sections", { docId, from: 0, to: d.doc.sections - 1 })).map((s) => s.text).join("");
  const first = t.indexOf(key), second = t.indexOf(key, first + 1);
  if (first < 0 || second < 0) return ["only one copy left"];
  const kept = t.slice(0, second).replace(/\\s+$/, "") + "\\n";
  for (let n = d.doc.sections - 1; n >= 1; n--) await inv("save_section", { docId, ordinal: n, text: "" });
  await inv("save_section", { docId, ordinal: 0, text: kept });
  return ["doc 2302: " + t.length + " → " + kept.length + " characters"];
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { console.log(JSON.stringify(JSON.parse(m.data).result?.result?.value)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
