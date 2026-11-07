// node separar.mjs <plan.json> [puerto]   (07-11-2026, asked by Whisper: «las mezcladas se separan»)
// Records that mix several persons («1. … 2. …», or several «## NAME» texts) become one record each.
// Plan: [{ id, name,                       ← the record kept (name checked: old or new)
//          fields: {...},                  ← its fields after the split (only those written)
//          place: [parent, kind],          ← under that guru, if it is still outside the tree
//          poet: true,                     ← label «Poetas» (only outside the tree)
//          docs: [{ doc, pieces: [{ to, start, end, title }] }],  ← pieces of its texts that go to a new record
//                                                                  (or «toId»: to a record that already exists)
//          new: [{ key, name, fields, place, poet }] }]           ← the other persons (found by name, never made twice)
// Each piece is found by the text it starts with (and the one after it); the text keeps its earlier version.
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
  const blank = Object.fromEntries(keys.map((k) => [k, ""]));
  const log = [], wrong = [];
  let rows = await inv("list_persons");
  const row = (id) => rows.find((p) => p.id === id);
  // 1. check everything first
  for (const g of plan) {
    const p = row(g.id);
    if (!p || (p.name !== g.name && p.name !== g.fields?.name)) wrong.push(g.id + " " + g.name + " ≠ " + (p ? p.name : "(none)"));
    for (const n of g.new || []) if (rows.filter((p) => p.name === n.name).length > 1) wrong.push("several records named " + n.name);
    for (const pl of [g.place, ...(g.new || []).map((n) => n.place)].filter(Boolean))
      if (!row(pl[0])?.tree) wrong.push(g.id + ": guru " + pl[0] + " not in the tree");
  }
  if (wrong.length) return { error: "check", wrong };
  const poets = [];
  for (const g of plan) {
    const ids = {};
    // 2. the new records
    for (const n of g.new || []) {
      let id = rows.find((p) => p.name === n.name)?.id;
      if (!id) {
        id = await inv("new_person", { fields: { ...blank, ...n.fields, name: n.name } });
        log.push("NEW " + id + " " + n.name + " (from " + g.id + ")");
      }
      ids[n.key] = id;
    }
    // 3. the pieces of its texts
    for (const d of g.docs || []) {
      const full = async () => {
        const x = await inv("get_doc", { id: d.doc });
        const secs = await inv("get_sections", { docId: d.doc, from: 0, to: x.doc.sections - 1 });
        return secs.map((s) => (s.text.endsWith("\\n") ? s.text : s.text + "\\n")).join("");
      };
      for (const pc of d.pieces) {
        const t = await full();
        const a = t.indexOf(pc.start);
        if (a < 0) { log.push(g.id + ": piece «" + pc.start.slice(0, 30) + "…» already moved"); continue; }
        if (t.indexOf(pc.start, a + 1) >= 0) return { error: "piece start found twice", id: g.id, start: pc.start, log };
        const b = pc.end ? t.indexOf(pc.end, a + pc.start.length) : t.length;
        if (b < 0) return { error: "piece end not found", id: g.id, end: pc.end, log };
        const to = pc.toId ?? ids[pc.to];
        if (!to) return { error: "piece without a record", id: g.id, to: pc.to, log };
        if (pc.cut) {
          // inside one paragraph (move_text moves whole paragraphs): a new text for its person, and the
          // paragraph without it (only texts of one part; save_section keeps the earlier version)
          const x = await inv("get_doc", { id: d.doc });
          if (x.doc.sections !== 1) return { error: "cut only in a text of one part", doc: d.doc, log };
          const nd = await inv("create_doc", { personId: to, title: pc.title, collection: x.doc.collection ?? "Fichas" });
          await inv("save_section", { docId: nd, ordinal: 0, text: t.slice(a, b).trim() + "\\n" });
          await inv("save_section", { docId: d.doc, ordinal: 0, text: (t.slice(0, a).trimEnd() + "\\n\\n" + t.slice(b).trimStart()).trim() + "\\n" });
          log.push(g.id + ": cut «" + pc.start.slice(0, 30) + "…» → new text " + nd + " of " + to);
          continue;
        }
        await inv("move_text", { docId: d.doc, fragment: t.slice(a, b), toPerson: to, title: pc.title });
        log.push(g.id + ": piece «" + pc.start.slice(0, 30).replace(/\\n/g, " ") + "…» → " + to);
      }
    }
    // 4. the fields of the record kept
    if (g.fields) {
      const p = await inv("get_person", { id: g.id });
      const now = Object.fromEntries(keys.map((k) => [k, p[k] ?? ""]));
      const want = { ...now, ...g.fields };
      const changed = keys.filter((k) => now[k] !== want[k]);
      if (changed.length) { await inv("update_person", { id: g.id, fields: want }); log.push(g.id + " " + want.name + ": " + changed.join(", ")); }
    }
    // 5. the tree and the label
    rows = await inv("list_persons");
    const put = async (id, pl, what) => {
      if (!pl || row(id).tree) return;
      await inv("move_person", { id, place: { parent: pl[0], before: null } });
      await inv("set_tree_kind", { id, kind: pl[1] });
      log.push("placed " + id + " " + what + " under " + pl[0] + " (" + pl[1] + ")");
    };
    await put(g.id, g.place, g.fields?.name || g.name);
    for (const n of g.new || []) await put(ids[n.key], n.place, n.name);
    if (g.poet) poets.push(g.id);
    for (const n of g.new || []) if (n.poet) poets.push(ids[n.key]);
  }
  rows = await inv("list_persons");
  const isPoet = (p) => p.tags.split(",").some((x) => x.trim().toLowerCase() === "poetas");
  const todo = poets.filter((id) => !row(id).tree && !isPoet(row(id)));
  if (todo.length) { await inv("set_tag", { ids: todo, tag: "Poetas", on: true }); log.push("Poetas: " + todo.join(", ")); }
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { console.log(JSON.stringify(JSON.parse(m.data).result?.result?.value, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
