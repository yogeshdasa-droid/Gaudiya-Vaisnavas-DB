// node libros-importar.mjs <plan.json> [puerto]   (13-11-2026, Whisper: «impórtalos» — the books of Desktop\BIOGRAPHYS\Info)
// Plan: [{ path, title }] — each PDF goes to Biblioteca › Libros (no record) with that title. A book already there
// (same source file) is not imported again. Twice = nothing.
import fs from "node:fs";
const [, , file, port = "9333"] = process.argv;
const plan = JSON.parse(fs.readFileSync(file, "utf8"));
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const plan = ${JSON.stringify(plan)};
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const log = [];
  const books = async () => (await inv("list_docs")).filter((d) => d.dir === "Libros");
  const sourceOf = async (id) => (await inv("get_doc", { id })).doc.source ?? "";
  const before = await books();
  const have = new Map();
  for (const d of before) have.set((await sourceOf(d.id)).toLowerCase(), d.id);
  const todo = plan.filter((g) => !have.has(g.path.toLowerCase()));
  for (const g of plan) if (have.has(g.path.toLowerCase())) log.push("already there: " + have.get(g.path.toLowerCase()) + " " + g.title);
  if (todo.length) {
    await inv("import_sources", { options: { sources: todo.map((g) => ({ path: g.path, collection: "Libros" })), personPerFile: false, personId: null } });
    // the import runs in the background: wait for the new books
    const old = new Set(before.map((d) => d.id));
    for (let i = 0; i < 180; i++) {
      await wait(2000);
      const fresh = (await books()).filter((d) => !old.has(d.id));
      if (fresh.length >= todo.length) break;
    }
    await wait(3000);
    for (const d of (await books()).filter((d) => !old.has(d.id))) {
      const src = (await sourceOf(d.id)).toLowerCase();
      const g = todo.find((x) => x.path.toLowerCase() === src);
      if (!g) { log.push("new book not in the plan: " + d.id + " " + d.title); continue; }
      const x = (await inv("get_doc", { id: d.id })).doc;
      await inv("update_doc", { docId: d.id, meta: { title: g.title, date: x.date ?? "", collection: "Libros", personId: null } });
      log.push("imported " + d.id + " " + g.title + " (" + x.sections + " parts)");
    }
  }
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { console.log(JSON.stringify(JSON.parse(m.data).result?.result?.value, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
