// node quitar-repetidos-campos.mjs [puerto]   (11-11-2026) — in the «Guru» and «Disciples» fields, a name written twice
// exactly the same (entries without a comma inside) keeps only its first time; the later copies (with the «, » or «; »
// before them) are taken out. Each ficha keeps its earlier version. Twice = nothing.
// (The repeats came from completar-campos.mjs run twice: the app's check strips the brackets of «Govinda (disciple of
// Śyāmānanda)», did not see the name and wrote it again.)
const [, , port = "9333"] = process.argv;
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const keys = ["name", "aka", "appearance", "disappearance", "place", "guru", "disciples", "works", "notes", "tags"];
  const entries = (s) => (s || "").split(/[;,\\n]/).map((x) => x.trim()).filter(Boolean);
  const dedupe = (field) => {
    let f = field || "";
    const counts = new Map();
    for (const e of entries(f)) counts.set(e, (counts.get(e) || 0) + 1);
    for (const [e, n] of counts) {
      for (let k = 1; k < n; k++) {
        // the last time it is written, with the separator before it
        const at = Math.max(f.lastIndexOf("; " + e), f.lastIndexOf(", " + e), f.lastIndexOf(";" + e), f.lastIndexOf("," + e));
        if (at <= 0) break;
        const sepLen = f[at + 1] === " " ? 2 : 1;
        const end = at + sepLen + e.length;
        if (end < f.length && !/[;,\\n]/.test(f[end])) break; // not a whole entry
        f = f.slice(0, at) + f.slice(end);
      }
    }
    return f;
  };
  const rows = await inv("list_persons");
  const log = [];
  for (const r of rows) {
    const p = await inv("get_person", { id: r.id });
    const g2 = dedupe(p.guru), d2 = dedupe(p.disciples);
    if (g2 === (p.guru || "") && d2 === (p.disciples || "")) continue;
    const f = Object.fromEntries(keys.map((k) => [k, Array.isArray(p[k]) ? p[k].join(", ") : (p[k] ?? "")]));
    f.guru = g2; f.disciples = d2;
    await inv("update_person", { id: r.id, fields: f });
    log.push(r.id + " " + r.name);
  }
  return { fixed: log.length, records: log };
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const d = JSON.parse(m.data); const v = d.result?.result?.value; console.log(v?.error ? v : "fixed " + v.fixed + ": " + v.records.join(" · ")); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
