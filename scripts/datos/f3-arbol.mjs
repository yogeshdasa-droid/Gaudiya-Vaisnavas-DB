// node f3-arbol.mjs [puerto]   (07-11-2026, records outside the tree, batch 3)
//  - 539 Jagadbandhu Sundara: guru not given, many disciples → branch «Other Vaiṣṇava lines» #2027.
//  - 63 Atula Candra Campati → under 539 (disciple).
//  - 473 Haridāsa Sādhu (a yogī of the «Kuver» sect) → branch «Other sampradāyas» #2151.
//  - 1858 Rāmadāsa Bābājī (Rādhikā Gupta), Jagadbandhu's chief helper as a boy → extra line śikṣā to 539.
// Only records still outside the tree are placed. Twice = nothing.
const [, , port = "9333"] = process.argv;
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const log = [];
  const rows = async () => await inv("list_persons");
  const place = async (id, parent, kind, note) => {
    const all = await rows();
    const r = all.find((p) => p.id === id), g = all.find((p) => p.id === parent);
    if (!r) throw new Error(id + " missing");
    if (r.tree) return;
    if (!g?.tree) throw new Error(parent + " not in the tree");
    await inv("move_person", { id, place: { parent, before: null } });
    await inv("set_tree_kind", { id, kind });
    if (note) await inv("set_line_info", { id, guru: null, note, disputed: false });
    log.push(id + " under " + parent + " (" + kind + ")");
  };
  await place(539, 2027, "disciple", "His guru is not given in his texts.");
  await place(63, 539, "disciple");
  await place(473, 2151, "disciple");
  const r = (await rows()).find((p) => p.id === 1858);
  const links = (r.links || []).filter((l) => l.kind !== "family").map((l) => [l.guru, l.kind]);
  if (!links.some(([g]) => g === 539)) { await inv("set_links", { id: 1858, links: [...links, [539, "siksa"]] }); log.push("1858: line siksa to 539"); }
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const d = JSON.parse(m.data); console.log(JSON.stringify(d.result?.result?.value ?? d.result?.exceptionDetails ?? d, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
