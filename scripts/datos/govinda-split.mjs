// node govinda-split.mjs [puerto]   (05-11-2026)
// The record 420 «Govinda» mixed a dozen Govindas (doc 3113, ~149 000 letters). Each piece of its
// text goes to its own record (new ones are made by name; existing: 1960 Govinda dāsa Kavirāja,
// 405 Govinda Bhakata), and 420 stays as the Govinda disciple of Śyāmānanda (its place in the tree).
// The pieces are found by the text they start with and the text that follows them. A second run
// changes nothing. Each move keeps the earlier version of the text.
import fs from "node:fs";
// Any other mixed record: node govinda-split.mjs <plan.json> [puerto] (same plan format).
const args = process.argv.slice(2);
const planFile = args.find((a) => a.endsWith(".json")) ?? new URL("./govinda-split.json", import.meta.url);
const port = args.find((a) => /^\d+$/.test(a)) ?? "9333";
const plan = JSON.parse(fs.readFileSync(planFile, "utf8"));
// «extra»: other records whose fields change too (found by name, never made)
plan.records = [...plan.records, ...(plan.extra ?? [])];
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
    // the records: existing ones checked by name (old or new), new ones found or made
    const all = await inv("list_persons");
    const ids = {};
    for (const r of plan.records) {
      const names = [r.name, r.fields.name].filter(Boolean);
      if (r.id) {
        const p = await inv("get_person", { id: r.id }).catch(() => null);
        if (!p || !names.includes(p.name)) return { error: "name does not match", id: r.id, name: p && p.name };
        ids[r.key] = r.id;
      } else {
        const hit = all.filter((p) => names.includes(p.name));
        if (hit.length > 1) return { error: "several records named " + r.name };
        ids[r.key] = hit.length ? hit[0].id : null;
      }
    }
    for (const r of plan.records.filter((r) => !ids[r.key])) {
      ids[r.key] = await inv("new_person", { fields: { ...blank, ...r.fields, name: r.fields.name || r.name } });
      log.push("NEW " + ids[r.key] + " " + (r.fields.name || r.name));
    }
    // the text, joined as the program joins it
    const full = async () => {
      const d = await inv("get_doc", { id: plan.doc });
      const secs = await inv("get_sections", { docId: plan.doc, from: 0, to: d.doc.sections - 1 });
      return secs.map((s) => (s.text.endsWith("\\n") ? s.text : s.text + "\\n")).join("");
    };
    for (const pc of plan.pieces) {
      const t = await full();
      const a = t.indexOf(pc.start);
      if (a < 0) { log.push("piece «" + pc.start.slice(0, 40) + "…»: already moved"); continue; }
      if (t.indexOf(pc.start, a + 1) >= 0) return { error: "piece start found twice", start: pc.start, log };
      const b = pc.end ? t.indexOf(pc.end, a + pc.start.length) : t.length;
      if (b < 0) return { error: "piece end not found", start: pc.start, end: pc.end, log };
      await inv("move_text", { docId: plan.doc, fragment: t.slice(a, b), toPerson: ids[pc.to], title: pc.title });
      log.push("piece «" + pc.start.slice(0, 40).replace(/\\n/g, " ") + "…» (" + (b - a) + " letters) → " + ids[pc.to]);
    }
    // what stays in the text: only the piece of 420, without the empty headings left behind
    if (plan.rest) {
      const t = await full();
      const flat = (s) => s.replace(/\\s+/g, "");
      const leftover = t.replace(/^#{1,2} .*$/gm, "");
      if (flat(t) !== flat(plan.rest) && flat(leftover) === flat(plan.rest.replace(/^#{1,2} .*$/gm, ""))) {
        const d = await inv("get_doc", { id: plan.doc });
        for (let n = d.doc.sections - 1; n >= 1; n--) await inv("save_section", { docId: plan.doc, ordinal: n, text: "" });
        await inv("save_section", { docId: plan.doc, ordinal: 0, text: plan.rest });
        log.push("doc " + plan.doc + ": empty headings taken out");
      } else if (flat(t) !== flat(plan.rest)) log.push("doc " + plan.doc + ": the text left is not the expected one, not touched");
    }
    // the fields (only those written in the plan)
    for (const r of plan.records) {
      const p = await inv("get_person", { id: ids[r.key] });
      const f = Object.fromEntries(keys.map((k) => [k, p[k] ?? ""]));
      const changed = Object.keys(r.fields).filter((k) => (f[k] ?? "") !== r.fields[k]);
      if (changed.length) await inv("update_person", { id: ids[r.key], fields: { ...f, ...r.fields } });
      log.push(ids[r.key] + " " + (r.fields.name || r.name) + ": fields " + (changed.length ? changed.join(", ") : "same"));
    }
    return log;
  } catch (e) { return { error: String(e) }; }
})()`);
console.log(JSON.stringify(out, null, 1));
ws.close();
