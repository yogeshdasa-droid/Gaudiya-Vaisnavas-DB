// node az-anadir.mjs <puerto>   (06-11-2026) — Whisper: from «2 - Vaiṣṇava Biographies A-Z» only what is in NO record yet.
// az-anadir.json (made with az.mjs of the scratchpad, checked by hand): per record, the entries of the book with only
// their sentences that no record had. Each record gets one text «From «Vaiṣṇava Biographies A-Z»…» (Fichas); the book
// stays as it is. Before writing, every sentence is checked again against all the record's texts: a sentence already
// there is not written. Twice = nothing new.
import fs from "node:fs";
const port = process.argv[2] || "9333";
// optional 3rd argument: another plan (az-anadir2.json); a group with "newName" is a record made if missing (found by name)
const plan = JSON.parse(fs.readFileSync(new URL("./" + (process.argv[3] || "az-anadir.json"), import.meta.url), "utf8"));
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const plan = ${JSON.stringify(plan)};
  const TITLE = "From «Vaiṣṇava Biographies A-Z» (only what was not in the record yet)";
  const n = (s) => s.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().replace(/[^a-z]+/g, "");
  const log = [];
  const keys = ["name", "aka", "appearance", "disappearance", "place", "guru", "disciples", "works", "notes", "tags"];
  const all = await inv("list_persons");
  for (const g of plan) {
    if (g.newName) {
      const hit = all.filter((x) => x.name === g.newName);
      if (hit.length > 1) { log.push(g.newName + ": " + hit.length + " records with this name"); continue; }
      if (hit.length) g.toId = hit[0].id;
      else {
        g.toId = await inv("new_person", { fields: { ...Object.fromEntries(keys.map((k) => [k, ""])), ...g.fields, name: g.newName } });
        log.push("NEW record " + g.toId + " " + g.newName);
      }
    }
    const p = await inv("get_person", { id: g.toId }).catch(() => null);
    if (!p) { log.push(g.toId + ": no record"); continue; }
    const mine = p.docs.find((d) => d.title === TITLE);
    let have = "";
    for (const d of p.docs) {
      if (mine && d.id === mine.id) continue;
      const dd = await inv("get_doc", { id: d.id });
      have += n((await inv("get_sections", { docId: d.id, from: 0, to: dd.doc.sections - 1 })).map((s) => s.text).join(" ")) + "|";
    }
    have += n([p.notes, p.place, p.works, p.guru].join(" "));
    const parts = [];
    for (const e of g.entries) {
      const ss = e.text.split(/(?<=[.!?])\\s+/).filter((s) => { const k = n(s); return k.length <= 30 || !have.includes(k); });
      const t = ss.join(" ").trim();
      if (n(t).length > 30) parts.push("## " + e.entry + "\\n\\n" + t);
    }
    if (!parts.length) { log.push(g.toId + " " + p.name + ": nothing new"); continue; }
    let docId = mine ? mine.id : null;
    if (docId) {
      // the record already has this text (another run or the other plan): only the parts it lacks are added at the end
      const dd = await inv("get_doc", { id: docId });
      const now = (await inv("get_sections", { docId, from: 0, to: dd.doc.sections - 1 })).map((s) => s.text).join("");
      const add = parts.filter((x) => !n(now).includes(n(x.split("\\n\\n").slice(1).join(" "))));
      if (!add.length) { log.push(g.toId + " " + p.name + ": same"); continue; }
      const text = now.replace(/\\s+$/, "") + "\\n\\n" + add.join("\\n\\n") + "\\n";
      for (let k = dd.doc.sections - 1; k >= 1; k--) await inv("save_section", { docId, ordinal: k, text: "" });
      await inv("save_section", { docId, ordinal: 0, text });
      log.push(g.toId + " " + p.name + ": added " + add.length + " entries to doc " + docId);
      continue;
    }
    const text = parts.join("\\n\\n") + "\\n";
    docId = await inv("create_doc", { personId: g.toId, title: TITLE, collection: "Fichas" });
    await inv("save_section", { docId, ordinal: 0, text });
    log.push(g.toId + " " + p.name + ": new doc " + docId + " (" + text.length + " ch, " + parts.length + " entries)");
  }
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const r = JSON.parse(m.data).result; console.log(JSON.stringify(r?.result?.value ?? r?.exceptionDetails?.exception?.description ?? r, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
