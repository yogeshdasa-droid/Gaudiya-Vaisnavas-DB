// node nit3-split.mjs <plan.json> [puerto]   (05-11-2026)
// Pieces of a text that belong to other persons go each to its own record (made if missing,
// found by name) as a new text. A piece starts at «find» (or at the «##» heading just before it,
// with "back": true) and ends where the next piece starts, or at «end», or at the end of the text.
// The piece may get a new heading ("heading") and lose some words at its start ("drop").
// What is left stays in the doc (earlier version kept); if nothing is left the doc goes to the bin.
// A second run changes nothing (a piece already moved is not found any more).
import fs from "node:fs";
const [, , file, port = "9333"] = process.argv;
const plan = JSON.parse(fs.readFileSync(file, "utf8"));
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
    const plan = ${JSON.stringify(plan)};
    const keys = ["name", "aka", "appearance", "disappearance", "place", "guru", "disciples", "works", "notes", "tags"];
    const blank = Object.fromEntries(keys.map((k) => [k, ""]));
    const log = [];
    const all = await inv("list_persons");
    const target = async (pc) => {
      if (pc.toId) return pc.toId;
      const hit = all.filter((p) => p.name === pc.toName);
      if (hit.length > 1) throw new Error(pc.toName + ": " + hit.length + " records");
      if (hit.length) return hit[0].id;
      const id = await inv("new_person", { fields: { ...blank, name: pc.toName, ...(pc.fields || {}) } });
      all.push({ id, name: pc.toName });
      log.push("NEW " + id + " " + pc.toName);
      return id;
    };
    for (const d of plan.docs) {
      const info = await inv("get_doc", { id: d.doc }).catch(() => null);
      if (!info) { log.push("doc " + d.doc + ": not found"); continue; }
      const secs = await inv("get_sections", { docId: d.doc, from: 0, to: info.doc.sections - 1 });
      const t = secs.map((s) => (s.text.endsWith("\\n") ? s.text : s.text + "\\n")).join("");
      // where each piece starts
      const starts = [];
      for (const pc of d.pieces) {
        let a = t.indexOf(pc.find);
        if (a >= 0 && pc.back) { const h = t.lastIndexOf("##", a); if (h >= 0 && a - h < 200) a = h; }
        starts.push(a);
      }
      if (starts.every((a) => a < 0)) { log.push("doc " + d.doc + ": pieces already moved"); continue; }
      if (starts.some((a) => a < 0)) return { error: "doc " + d.doc + ": some pieces found, some not", starts, log };
      const order = starts.map((a, i) => [a, i]).sort((x, y) => x[0] - y[0]);
      const cuts = [];
      for (let k = 0; k < order.length; k++) {
        const [a, i] = order[k];
        const pc = d.pieces[i];
        let b = k + 1 < order.length ? order[k + 1][0] : t.length;
        if (pc.end) {
          let e = t.indexOf(pc.end, a + 1);
          if (e >= 0 && pc.endBack) { const h = t.lastIndexOf("##", e); if (h > a && e - h < 200) e = h; }
          if (e < 0) return { error: "doc " + d.doc + ": end not found: " + pc.end, log };
          if (e < b) b = e;
        }
        cuts.push([a, b, pc]);
      }
      for (const [a, b, pc] of cuts) {
        let piece = t.slice(a, b).trim();
        if (pc.drop && piece.startsWith(pc.drop)) piece = piece.slice(pc.drop.length).trim();
        if (pc.heading) piece = pc.heading + "\\n\\n" + piece;
        const to = await target(pc);
        const docId = await inv("create_doc", { personId: to, title: pc.title || pc.toName, collection: "Fichas" });
        await inv("save_section", { docId, ordinal: 0, text: piece + "\\n" });
        log.push("doc " + d.doc + ": piece «" + pc.find.slice(0, 30) + "…» (" + piece.length + ") → " + to);
      }
      let rest = "";
      let last = 0;
      for (const [a, b] of cuts.sort((x, y) => x[0] - y[0])) { rest += t.slice(last, a); last = b; }
      rest = (rest + t.slice(last)).trim();
      for (let n = info.doc.sections - 1; n >= 1; n--) await inv("save_section", { docId: d.doc, ordinal: n, text: "" });
      if (rest.replace(/^#+ .*$/gm, "").trim()) {
        await inv("save_section", { docId: d.doc, ordinal: 0, text: rest + "\\n" });
        log.push("doc " + d.doc + ": " + rest.length + " letters left");
      } else {
        await inv("save_section", { docId: d.doc, ordinal: 0, text: rest + "\\n" });
        await inv("trash_doc", { docId: d.doc });
        log.push("doc " + d.doc + ": nothing left, to the bin");
      }
    }
    return log;
  } catch (e) { return { error: String(e) }; }
})()`);
console.log(JSON.stringify(out, null, 1));
ws.close();
