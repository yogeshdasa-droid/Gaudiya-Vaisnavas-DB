// node textoprincipal.mjs <grupo.json> <carpeta-de-los-md> [puerto]
// For each record of the group: saves (or replaces) its «Texto principal» from <carpeta>/<main>
// and changes the listed fields. Checks first that every id still has the expected name.
// Running it twice changes nothing the second time. Each change keeps its earlier version.
// Optional, per record:
//   "new": true          → no id: found by its exact name (or fields.name), created if missing
//   fields.name          → renames it (a second run accepts the new name)
//   "main" left out      → only the fields
//   "move": {"doc": 1279, "from": "## RAMAI", "find": "He was the younger brother"}
//                        → before anything else, the piece of that doc that starts at the last
//                          «from» before «find» (to the end of the doc) goes to this record
import fs from "node:fs";
const [, , file, dir, port = "9333"] = process.argv;
const group = JSON.parse(fs.readFileSync(file, "utf8")).map((g) => ({
  ...g,
  text: g.main ? fs.readFileSync(`${dir}/${g.main}`, "utf8").replace(/\r\n/g, "\n").trim() + "\n" : null,
}));
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.url.includes("localhost:1421") || p.url.includes("tauri.localhost"));
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const run = (expr) =>
  new Promise((res) => {
    ws.onmessage = (m) => res(JSON.parse(m.data).result?.result?.value);
    ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
  });
const out = await run(`(async () => {
  try {
    const inv = window.__TAURI_INTERNALS__.invoke;
    const group = ${JSON.stringify(group)};
    const keys = ["name", "aka", "appearance", "disappearance", "place", "guru", "disciples", "works", "notes", "tags"];
    const blank = Object.fromEntries(keys.map((k) => [k, ""]));
    const log = [];
    const wrong = [];
    // new records: found by name (old or new), else created
    const all = await inv("list_persons");
    for (const g of group.filter((g) => g.new)) {
      const names = [g.name, g.fields.name].filter(Boolean);
      const hit = all.filter((p) => names.includes(p.name));
      if (hit.length > 1) wrong.push(g.name + ": " + hit.length + " records with this name");
      else if (hit.length) g.id = hit[0].id;
    }
    for (const g of group.filter((g) => !g.new)) {
      const p = await inv("get_person", { id: g.id }).catch(() => null);
      if (!p || (p.name !== g.name && p.name !== g.fields.name)) wrong.push(g.id + " " + g.name + " ≠ " + (p ? p.name : "(none)"));
    }
    if (wrong.length) return { error: "names do not match", wrong };
    for (const g of group.filter((g) => g.new && !g.id)) {
      g.id = await inv("new_person", { fields: { ...blank, name: g.name, ...g.fields } });
      log.push("NEW " + g.id + " " + (g.fields.name || g.name));
    }
    // pieces of text that belong to another record
    for (const g of group.filter((g) => g.move)) {
      const d = await inv("get_doc", { id: g.move.doc });
      const t = (await inv("get_sections", { docId: g.move.doc, from: 0, to: d.doc.sections - 1 })).map((s) => s.text).join("");
      const i = t.indexOf(g.move.find);
      if (i < 0) { log.push(g.name + ": piece already moved"); continue; }
      const start = t.lastIndexOf(g.move.from, i);
      await inv("move_text", { docId: g.move.doc, fragment: t.slice(start < 0 ? i : start), toPerson: g.id, title: g.move.title || g.name });
      log.push(g.name + ": piece moved from doc " + g.move.doc);
    }
    for (const g of group) {
      const p = await inv("get_person", { id: g.id });
      let what = "no text";
      if (g.text) {
        const doc = p.docs.find((d) => d.collection === "Texto principal");
        let docId = doc ? doc.id : null;
        let same = false;
        // a long text is kept in several parts (over ~24 KB): compare all of it, without spaces
        const flat = (t) => t.replace(/\\s+/g, "");
        if (docId) {
          const d = await inv("get_doc", { id: docId });
          const secs = await inv("get_sections", { docId, from: 0, to: d.doc.sections - 1 });
          same = flat(secs.map((s) => s.text).join("")) === flat(g.text);
          if (!same)
            // replacing: first the old parts go (an emptied part is removed), then the new text
            for (let n = d.doc.sections - 1; n >= 1; n--) await inv("save_section", { docId, ordinal: n, text: "" });
        } else docId = await inv("create_doc", { personId: g.id, title: g.fields.name || g.name, collection: "Texto principal" });
        if (!same) await inv("save_section", { docId, ordinal: 0, text: g.text });
        what = "text " + (same ? "same" : doc ? "updated" : "new");
      }
      const f = Object.fromEntries(keys.map((k) => [k, p[k] ?? ""]));
      const changed = Object.keys(g.fields).filter((k) => (f[k] ?? "") !== g.fields[k]);
      if (changed.length) await inv("update_person", { id: g.id, fields: { ...f, ...g.fields } });
      log.push(g.id + " " + (g.fields.name || g.name) + ": " + what + "; fields " + (changed.length ? changed.join(", ") : "same"));
    }
    return log;
  } catch (e) { return { error: String(e) }; }
})()`);
console.log(JSON.stringify(out, null, 1));
ws.close();
