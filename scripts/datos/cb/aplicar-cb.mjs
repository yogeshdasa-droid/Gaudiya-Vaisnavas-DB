// node aplicar-cb.mjs <plan.json> [puerto] [--dry]     (16-11-2026, «Caitanya-bhāgavata»)
// With the app open with --remote-debugging-port (default 9334). Plan: [{ id, name, text, create?, fields?, remove?, replace? }]
// For each record (its name is checked first):
// - `create: true` and no `id`: the record `name` is created (only if no record has that exact name) with `fields`;
// - if it has no text of the collection «Caitanya-bhāgavata» yet, one is created with `text` (Markdown, split by its
//   headings), titled «In the Caitanya-bhāgavata — <name>»; a second run leaves it alone;
// - in its notes, each `remove` sentence is taken out and each `replace` done — only those found («no está» otherwise).
// The record keeps its earlier version (history). A second run must report nothing new.
import fs from "node:fs";
const args = process.argv.slice(2);
const dry = args.includes("--dry");
const [file, port = "9334"] = args.filter((a) => a !== "--dry");
const plan = JSON.parse(fs.readFileSync(file, "utf8"));
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const COLL = "Caitanya-bhāgavata";
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const plan = ${JSON.stringify(plan)};
  const dry = ${dry};
  const COLL = ${JSON.stringify(COLL)};
  const log = [];
  const all = await inv("list_persons");
  for (const g of plan) {
    let id = g.id;
    if (!id && g.create) {
      const same = all.find((p) => p.name === g.name);
      if (same) id = same.id;
      else {
        if (dry) { log.push("nueva ficha: " + g.name); continue; }
        const keys = ["name", "aka", "appearance", "disappearance", "place", "guru", "disciples", "works", "notes", "tags"];
        const f = Object.fromEntries(keys.map((k) => [k, (g.fields || {})[k] ?? ""]));
        f.name = g.name;
        id = await inv("new_person", { fields: f });
        log.push("nueva ficha #" + id + " " + g.name);
      }
    }
    const p = await inv("get_person", { id });
    if (p.name !== g.name) { log.push(id + ": se llama «" + p.name + "», no «" + g.name + "» — saltada"); continue; }
    const out = [];
    if (g.text && !p.docs.some((d) => d.collection === COLL)) {
      if (!dry) {
        const doc = await inv("create_doc", { personId: id, title: "In the Caitanya-bhāgavata — " + g.name, collection: COLL });
        await inv("save_section", { docId: doc, ordinal: 0, text: g.text });
      }
      out.push("texto");
    }
    let notes = p.notes;
    for (const s of g.remove || []) {
      const i = notes.indexOf(s);
      if (i < 0) { out.push("no está: " + s.slice(0, 50)); continue; }
      let end = i + s.length;
      if (notes[end] === " " || notes[end] === "\\n") end++;
      notes = notes.slice(0, i) + notes.slice(end);
      out.push("quitada");
    }
    for (const [a, b] of g.replace || []) {
      if (b.includes(a) && notes.includes(b)) continue; // ya hecho (el nuevo contiene al viejo)
      if (!notes.includes(a)) { out.push("no está: " + a.slice(0, 50)); continue; }
      notes = notes.replace(a, b);
      out.push("cambiada");
    }
    notes = notes.replace(/\\n{3,}/g, "\\n\\n").replace(/^\\s+/, "");
    if (notes !== p.notes && !dry) {
      const f = { name: p.name, aka: p.aka, appearance: p.appearance, disappearance: p.disappearance, place: p.place,
        guru: p.guru, disciples: p.disciples, works: p.works, notes, tags: p.tags };
      await inv("update_person", { id, fields: f });
    }
    if (out.length) log.push(id + " " + g.name + ": " + out.join(", "));
  }
  return log;
} catch (e) { return "ERROR " + e; } })()`;
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  if (d.id === 1) {
    console.log(JSON.stringify(d.result?.result?.value ?? d.result, null, 1));
    ws.close();
  }
};
