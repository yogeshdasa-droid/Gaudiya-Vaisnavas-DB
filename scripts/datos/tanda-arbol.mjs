// node tanda-arbol.mjs <plan.json> [puerto]   (11-11-2026, batches 9-13 of the main texts outside the tree)
// Plan: { "place": [[id, parent, kind, note, disputed?]],   ← under that guru, only if still outside the tree and the guru is in it
//         "move": [[id, from, parent, kind, note]],          ← already in the tree under «from»: moved under «parent»
//         "links": [[id, guru, kind]],            ← extra line (both already in the tree, so no one goes to the top)
//         "trash": [[personId, docId]],           ← texts to the bin (only if that record still has it)
//         "poets": [ids] }                        ← label «Poetas» (only outside the tree)
// Twice = nothing.
import fs from "node:fs";
const [, , file, port = "9333"] = process.argv;
const plan = JSON.parse(fs.readFileSync(file, "utf8"));
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const plan = ${JSON.stringify(plan)};
  const log = [];
  for (const [id, parent, kind, note, disputed] of plan.place || []) {
    const rows = await inv("list_persons");
    const r = rows.find((p) => p.id === id), g = rows.find((p) => p.id === parent);
    if (!r) { log.push(id + " missing"); continue; }
    if (r.tree) continue;
    if (!g?.tree) { log.push(parent + " not in the tree: " + id + " left out"); continue; }
    await inv("move_person", { id, place: { parent, before: null } });
    await inv("set_tree_kind", { id, kind });
    if (note || disputed) await inv("set_line_info", { id, guru: null, note: note || "", disputed: !!disputed });
    log.push(id + " under " + parent + " (" + kind + (disputed ? ", disputed" : "") + ")");
  }
  // records already in the tree under the wrong guru: moved (only if still under «from»)
  for (const [id, from, parent, kind, note] of plan.move || []) {
    const rows = await inv("list_persons");
    const r = rows.find((p) => p.id === id), g = rows.find((p) => p.id === parent);
    if (!r?.tree || r.tree.parent !== from) continue;
    if (!g?.tree) { log.push(parent + " not in the tree: " + id + " not moved"); continue; }
    await inv("move_person", { id, place: { parent, before: null } });
    await inv("set_tree_kind", { id, kind });
    await inv("set_line_info", { id, guru: null, note: note || "", disputed: false });
    log.push(id + " moved from " + from + " to " + parent + " (" + kind + ")");
  }
  for (const [id, guru, kind] of plan.links || []) {
    const rows = await inv("list_persons");
    const r = rows.find((p) => p.id === id), g = rows.find((p) => p.id === guru);
    if (!r?.tree || !g?.tree) { log.push("no line " + id + " → " + guru + ": both must be in the tree"); continue; }
    const now = (r.links || []).filter((l) => l.kind !== "family").map((l) => [l.guru, l.kind]);
    if (now.some(([x]) => x === guru)) continue;
    await inv("set_links", { id, links: [...now, [guru, kind]] });
    log.push(id + ": line " + kind + " to " + guru);
  }
  for (const [pid, doc] of plan.trash || []) {
    const p = await inv("get_person", { id: pid });
    if (!(p.docs || []).some((d) => d.id === doc)) continue;
    await inv("trash_doc", { docId: doc });
    log.push("doc " + doc + " of " + pid + " to the bin");
  }
  if ((plan.poets || []).length) {
    const rows = await inv("list_persons");
    const isPoet = (p) => String(p.tags || "").split(",").some((x) => x.trim().toLowerCase() === "poetas");
    const todo = plan.poets.filter((id) => { const r = rows.find((p) => p.id === id); return r && !r.tree && !isPoet(r); });
    if (todo.length) { await inv("set_tag", { ids: todo, tag: "Poetas", on: true }); log.push("Poetas: " + todo.join(", ")); }
  }
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const d = JSON.parse(m.data); console.log(JSON.stringify(d.result?.result?.value ?? d.result?.exceptionDetails ?? d, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
