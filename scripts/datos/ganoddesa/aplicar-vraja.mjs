// node aplicar-vraja.mjs <plan.json> [puerto] [--dry]     (15-11-2026, «Vraja-Nitya-līlā»)
// With the app open with --remote-debugging-port (default 9334). Plan: [{ id, name, text, remove?: [..], replace?: [[old, new], ..] }]
// For each record (its name is checked first):
// - if it has no text of the collection «Vraja-Nitya-līlā» yet, one is created with `text` (Markdown; the reader splits it by
//   its headings); a second run leaves it alone;
// - in its notes, each `remove` sentence is taken out (with the space or line after it) and each `replace` done —
//   only those found; the others are reported («no está»). The record keeps its earlier version (history).
// The books of Desktop\BIOGRAPHYS\Info take precedence (Whisper): the text says what they say.
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
  const dry = ${dry};
  const log = [];
  for (const g of plan) {
    const p = await inv("get_person", { id: g.id });
    if (p.name !== g.name) { log.push(g.id + ": se llama «" + p.name + "», no «" + g.name + "» — saltada"); continue; }
    const out = [];
    if (g.text && !p.docs.some((d) => d.collection === "Vraja-Nitya-līlā")) {
      if (!dry) {
        const doc = await inv("create_doc", { personId: g.id, title: "Vraja-Nitya-līlā — " + g.name, collection: "Vraja-Nitya-līlā" });
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
      if (!notes.includes(a)) { out.push("no está: " + a.slice(0, 50)); continue; }
      notes = notes.replace(a, b);
      out.push("cambiada");
    }
    notes = notes.replace(/\\n{3,}/g, "\\n\\n").replace(/^\\s+/, "");
    if (notes !== p.notes && !dry) {
      const f = { name: p.name, aka: p.aka, appearance: p.appearance, disappearance: p.disappearance, place: p.place,
        guru: p.guru, disciples: p.disciples, works: p.works, notes, tags: p.tags };
      await inv("update_person", { id: g.id, fields: f });
    }
    if (out.length) log.push(g.id + " " + g.name + ": " + out.join(", "));
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
