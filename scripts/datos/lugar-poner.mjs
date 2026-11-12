// node lugar-poner.mjs <plan.json> [puerto]   (12-11-2026, «los lugares»: that the map knows where they lived)
// Plan: [{ id, place }] — writes «place» in the record's field «Lugar» ONLY when that field is empty (what the record's
// own texts say: «resident of…», «his śrīpāṭa was at…»). Each record keeps its earlier version. Twice = nothing.
import fs from "node:fs";
const [, , file, port = "9333"] = process.argv;
const plan = JSON.parse(fs.readFileSync(file, "utf8"));
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const plan = ${JSON.stringify(plan)};
  const keys = ["name", "aka", "appearance", "disappearance", "place", "guru", "disciples", "works", "notes", "tags"];
  const log = { written: [], skipped: [] };
  for (const g of plan) {
    const p = await inv("get_person", { id: g.id });
    if (!p) { log.skipped.push(g.id + ": no record"); continue; }
    if ((p.place ?? "").trim()) { log.skipped.push(g.id + " " + p.name + ": already «" + p.place + "»"); continue; }
    const f = Object.fromEntries(keys.map((k) => [k, Array.isArray(p[k]) ? p[k].join(", ") : (p[k] ?? "")]));
    f.place = g.place;
    await inv("update_person", { id: g.id, fields: f });
    log.written.push(g.id + " " + p.name + " → " + g.place);
  }
  return { written: log.written.length, skipped: log.skipped, sample: log.written.slice(0, 5) };
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const d = JSON.parse(m.data); console.log(JSON.stringify(d.result?.result?.value ?? d.result?.exceptionDetails ?? d, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
