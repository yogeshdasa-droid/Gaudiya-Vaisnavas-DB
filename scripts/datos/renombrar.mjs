// node renombrar.mjs <plan.json> [puerto]   (07-11-2026)
// Gives records a new name: plan [{ id, old, name, aka? }] («aka»: other forms added to it). Checked by the old
// name (or the new one: twice = nothing). The record keeps its earlier version; the search folds diacritics, so the
// plain spelling still finds it.
import fs from "node:fs";
const [, , file, port = "9333"] = process.argv;
const plan = JSON.parse(fs.readFileSync(file, "utf8")).filter((x) => x.name && x.name !== x.old);
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const plan = ${JSON.stringify(plan)};
  const keys = ["name", "aka", "appearance", "disappearance", "place", "guru", "disciples", "works", "notes", "tags"];
  const rows = await inv("list_persons");
  const wrong = plan.filter((x) => { const r = rows.find((p) => p.id === x.id); return !r || (r.name !== x.old && r.name !== x.name); })
    .map((x) => x.id + " " + x.old + " ≠ " + (rows.find((p) => p.id === x.id)?.name ?? "(none)"));
  if (wrong.length) return { error: "check", wrong };
  let n = 0;
  for (const x of plan) {
    const p = await inv("get_person", { id: x.id });
    const now = Object.fromEntries(keys.map((k) => [k, p[k] ?? ""]));
    const aka = [...new Set([...now.aka.split(",").map((s) => s.trim()), ...(x.aka || [])].filter(Boolean))].join(", ");
    if (now.name === x.name && now.aka === aka) continue;
    await inv("update_person", { id: x.id, fields: { ...now, name: x.name, aka } });
    n++;
  }
  return { renamed: n, of: plan.length };
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const d = JSON.parse(m.data); console.log(JSON.stringify(d.result?.result?.value ?? d.result?.exceptionDetails ?? d, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
