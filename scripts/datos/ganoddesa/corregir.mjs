// node corregir.mjs <plan.json> [puerto] [--dry]   (15-11-2026) — fixes inside a record's Gaṇoddeśa text, already written.
// ⚠️ A `new` that contains its `old` is applied again on a second run: make such fixes one-off (or check first).
// Plan: [{ id, name, all?, replace: [[old, new], ..] }]. With `all: true` it looks in ALL the record's texts (16-11-2026). Looks in each section of the record's text of collection «Gaṇoddeśa»;
// each `old` found is replaced (save_section keeps the old version in its history). A second run finds nothing.
import fs from "node:fs";
const args = process.argv.slice(2);
const dry = args.includes("--dry");
const [file, port = "9334"] = args.filter((a) => a !== "--dry");
const plan = JSON.parse(fs.readFileSync(file, "utf8"));
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const plan = ${JSON.stringify(plan)};
  const log = [];
  for (const g of plan) {
    const p = await inv("get_person", { id: g.id });
    if (p.name !== g.name) { log.push(g.id + ": se llama «" + p.name + "» — saltada"); continue; }
    const docs = g.all ? p.docs : p.docs.filter((d) => d.collection === "Gaṇoddeśa");
    if (!docs.length) { log.push(g.id + ": sin texto Gaṇoddeśa"); continue; }
    const all = [];
    for (const d of docs) for (const s of await inv("get_sections", { docId: d.id, from: 0, to: 100000 })) all.push({ d, s });
    const out = [];
    for (const [a, b] of g.replace) {
      if (b.includes(a) && all.some((x) => x.s.text.includes(b))) { out.push("ya hecha"); continue; } // 16-11-2026: no repetir
      const hits = all.filter((x) => x.s.text.includes(a));
      if (!hits.length) { out.push("no está: " + a.slice(0, 40)); continue; }
      for (const { d, s } of hits) {
        s.text = s.text.split(a).join(b);
        if (!${dry}) await inv("save_section", { docId: d.id, ordinal: s.ordinal, text: s.text });
        out.push("cambiada (" + (d.title || "").slice(0, 30) + ")");
      }
    }
    log.push(g.id + " " + g.name + ": " + out.join(", "));
  }
  return JSON.stringify(log, null, 1);
} catch (e) { return "ERROR " + e; } })()`;
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id === 1) { console.log(m.result.result.value); ws.close(); }
};
