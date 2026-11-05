// node scripts/datos/biblioteca-ordenar.mjs [puerto]   (05-11-2026, Whisper: «que no haya mil cosas repetidas»)
// The Library, tidy: every text that belongs to a record goes to the collection «Fichas» (from «Obsidian
// Biografías», «Calibre»…); the texts without a record go to «Libros». «Texto principal» and «Mis textos»
// are left as they are. Then the texts that are a COPY of another text of the same record (≥ 90 % of their
// paragraphs there) go to the bin (trash_doc: they can be restored), checking again just before each one,
// so that of two copies one always stays. A second run changes nothing.
const port = process.argv[2] ?? "9333";
const KEEP = ["Texto principal", "Mis textos"];
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
    const KEEP = ${JSON.stringify(KEEP)};
    const NL = String.fromCharCode(10);
    const log = { moved: {}, binned: [] };
    const colOf = (d) => d.dir.split("/")[0];
    const docs = await inv("list_docs");
    // 1. collections
    for (const d of docs) {
      if (KEEP.includes(colOf(d))) continue;
      const want = d.personId ? "Fichas" : "Libros";
      if (colOf(d) === want && d.dir === want) continue;
      const info = (await inv("get_doc", { id: d.id })).doc;
      await inv("update_doc", { docId: d.id, meta: { title: info.title, date: info.date ?? "", collection: want, personId: info.personId } });
      const k = colOf(d) + " → " + want;
      log.moved[k] = (log.moved[k] ?? 0) + 1;
    }
    // 2. copies inside the same record
    const norm = (s) => s.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");
    const paras = (t) => t.split(/\\n\\s*\\n|\\n(?=#)/).map((p) => p.trim()).filter((p) => p.length > 80);
    const textOf = async (id) => {
      const info = (await inv("get_doc", { id })).doc;
      return (await inv("get_sections", { docId: id, from: 0, to: info.sections - 1 })).map((s) => s.text).join(NL);
    };
    const byPerson = new Map();
    for (const d of await inv("list_docs")) if (d.personId) byPerson.set(d.personId, [...(byPerson.get(d.personId) ?? []), d]);
    for (const [pid, ds] of byPerson) {
      if (ds.length < 2) continue;
      const texts = new Map();
      for (const d of ds) texts.set(d.id, await textOf(d.id));
      const alive = new Set(ds.map((d) => d.id));
      // the shorter ones first: of two copies, the longer stays
      for (const d of [...ds].sort((a, b) => texts.get(a.id).length - texts.get(b.id).length)) {
        if (colOf(d) === "Texto principal") continue;
        const ps = paras(texts.get(d.id));
        if (!ps.length) continue;
        // (only against the other original texts: a «Texto principal» is written anew, it is not a copy)
        const main = new Set(ds.filter((o) => colOf(o) === "Texto principal").map((o) => o.id));
        const others = [...alive].filter((x) => x !== d.id && !main.has(x)).map((x) => norm(texts.get(x))).join("|");
        if (!others) continue;
        let found = 0;
        for (const p of ps) {
          const n = norm(p);
          const probe = n.length > 160 ? n.slice(Math.floor(n.length / 2) - 60, Math.floor(n.length / 2) + 60) : n;
          if (others.includes(probe)) found++;
        }
        if (found / ps.length >= 0.9) {
          await inv("trash_doc", { docId: d.id });
          alive.delete(d.id);
          log.binned.push(d.id + " «" + d.title + "» (record " + pid + ", " + texts.get(d.id).length + " letters)");
        }
      }
    }
    return log;
  } catch (e) { return { error: String(e) }; }
})()`);
console.log(JSON.stringify(out, null, 1));
ws.close();
