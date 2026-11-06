// node unir.mjs <plan.json> [puerto]
// Merges records that are the same person (Whisper asked for these merges on 05-11-2026).
// Plan: [{ "into": 677, "name": "Kanu Ṭhākura", "from": [{ "id": 664, "name": "Kanai …" }],
//          "trash": [1454],            ← docs that repeat another text of the record (checked before)
//          "fields": { "aka": "…" } }]  ← after the merge the fields of «into» are put back as they
//                                         were (the merge glues names, gurus, notes…) and then these
// Checks the names first. Running it twice changes nothing: a record already merged is skipped.
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
    const log = [], wrong = [];
    const get = (id) => inv("get_person", { id }).catch(() => null);
    for (const g of plan) {
      const p = await get(g.into);
      if (!p || (p.name !== g.name && p.name !== g.fields?.name)) wrong.push(g.into + " " + g.name + " ≠ " + (p ? p.name : "(none)"));
      for (const f of g.from) {
        const q = await get(f.id);
        if (q && q.name !== f.name) wrong.push(f.id + " " + f.name + " ≠ " + q.name);
      }
    }
    if (wrong.length) return { error: "names do not match", wrong };
    for (const g of plan) {
      const p = await get(g.into);
      const before = Object.fromEntries(keys.map((k) => [k, p[k] ?? ""]));
      const from = [];
      for (const f of g.from) if (await get(f.id)) from.push(f.id);
      if (from.length) await inv("merge_persons", { into: g.into, from });
      let what = from.length ? "merged " + from.join(", ") : "already merged";
      const now = await get(g.into);
      for (const d of g.trash || []) {
        if (now.docs.some((x) => x.id === d)) { await inv("trash_doc", { docId: d }); what += "; doc " + d + " to the bin"; }
      }
      const f = Object.fromEntries(keys.map((k) => [k, now[k] ?? ""]));
      const want = { ...before, ...(g.fields || {}) };
      const changed = keys.filter((k) => (f[k] ?? "") !== (want[k] ?? ""));
      if (changed.length) await inv("update_person", { id: g.into, fields: want });
      log.push(g.into + " " + want.name + ": " + what + "; fields " + (changed.length ? changed.join(", ") : "same"));
    }
    return log;
  } catch (e) { return { error: String(e) }; }
})()`);
console.log(JSON.stringify(out, null, 1));
ws.close();
