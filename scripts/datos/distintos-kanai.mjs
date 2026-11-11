// node distintos-kanai.mjs [puerto]   (11-11-2026, Whisper: «son distintos los Kānus… sí, Jagadīśa separados en 2»)
//  - Kānāi Ṭhākura #665 ≠ Kānu Ṭhākura #677: «not the same person» mark, a line in each record's notes, and the
//    «Rellenar» proposal 1776 (which gave #665 a fact of #677) rejected.
//  - Jagadīśa Paṇḍita of Yaśoḍā #534 ≠ Jagadīśa Paṇḍita of Navadvīpa #2138: «not the same person» mark.
// Twice = nothing.
const [, , port = "9333"] = process.argv;
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const log = [];
  const keys = ["name", "aka", "appearance", "disappearance", "place", "guru", "disciples", "works", "notes", "tags"];
  const pairs = [[665, 677], [534, 2138]];
  const have = await inv("list_distinct");
  for (const [a, b] of pairs) {
    if (have.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) continue;
    await inv("mark_distinct", { ids: [a, b] });
    log.push("distinct " + a + " / " + b);
  }
  const notes = { 665: "Not Kānu Ṭhākura #677: a different person (Whisper, 11-11-2026).", 677: "Not Kānāi Ṭhākura #665: a different person (Whisper, 11-11-2026)." };
  for (const [id, line] of Object.entries(notes)) {
    const p = await inv("get_person", { id: Number(id) });
    if ((p.notes || "").includes(line)) continue;
    const f = Object.fromEntries(keys.map((k) => [k, Array.isArray(p[k]) ? p[k].join(", ") : (p[k] ?? "")]));
    f.notes = (f.notes ? f.notes.trimEnd() + "\\n\\n" : "") + line;
    await inv("update_person", { id: Number(id), fields: f });
    log.push(id + ": note");
  }
  const all = await inv("fill_list");
  const pr = all.find((x) => x.id === 1776);
  if (pr) { log.push("proposal 1776: " + JSON.stringify(pr).slice(0, 300)); await inv("fill_reject", { ids: [1776] }); log.push("proposal 1776 rejected"); }
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const d = JSON.parse(m.data); console.log(JSON.stringify(d.result?.result?.value ?? d.result?.exceptionDetails ?? d, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
