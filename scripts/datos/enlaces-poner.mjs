// node enlaces-poner.mjs <plan.json> [puerto]   (13-11-2026, Whisper: «add estas… a la librería de Narayana Maharaja»)
// Plan: [{ id, name, links: [{ label, target }], folder? }] — adds the links to the record's «Enlaces» (the block at the
// end of its notes, notesLinks.ts) unless the same address is there already; «folder»: the record's library folder
// (set only if it is not that one already). Each record keeps its earlier version. Twice = nothing.
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
  const MARK = "<!-- links -->";
  const split = (notes) => {
    const at = notes.lastIndexOf(MARK);
    if (at < 0) return { body: notes, links: [] };
    const links = [];
    for (const line of notes.slice(at + MARK.length).split(/\\r?\\n/)) {
      const m = line.match(/^\\s*-\\s*(?:\\[([^\\]]*)\\]\\(<([^>]+)>\\)|<([^>]+)>|(\\S.*))\\s*$/);
      if (!m) continue;
      const target = (m[2] ?? m[3] ?? m[4] ?? "").trim();
      if (target) links.push({ label: (m[1] ?? "").trim(), target });
    }
    return { body: notes.slice(0, at).replace(/\\s+$/, ""), links };
  };
  const join = (body, links) => {
    const text = body.replace(/\\s+$/, "");
    if (!links.length) return text;
    return text + (text ? "\\n\\n" : "") + MARK + "\\n" + links.map((l) => "- [" + l.label + "](<" + l.target + ">)").join("\\n");
  };
  const norm = (u) => u.trim().replace(/\\/+$/, "").toLowerCase();
  const log = [];
  for (const g of plan) {
    const p = await inv("get_person", { id: g.id });
    if (!p || p.name !== g.name) { log.push(g.id + ": not «" + g.name + "»"); continue; }
    if (g.folder) {
      const v = await inv("get_library", { id: g.id });
      if (norm(v.folder ?? "") !== norm(g.folder)) { await inv("set_library_folder", { id: g.id, folder: g.folder }); log.push(g.id + ": folder → " + g.folder); }
    }
    const f = Object.fromEntries(keys.map((k) => [k, Array.isArray(p[k]) ? p[k].join(", ") : (p[k] ?? "")]));
    const s = split(f.notes);
    const have = new Set(s.links.map((l) => norm(l.target)));
    const add = g.links.filter((l) => !have.has(norm(l.target)));
    if (!add.length) continue;
    f.notes = join(s.body, [...s.links, ...add]);
    await inv("update_person", { id: g.id, fields: f });
    log.push(g.id + " " + p.name + ": +" + add.length + " links");
  }
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { console.log(JSON.stringify(JSON.parse(m.data).result?.result?.value, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
