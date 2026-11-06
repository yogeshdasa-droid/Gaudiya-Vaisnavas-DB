// node bv1-arbol.mjs <puerto> → Vipina-vihārī Gosvāmī (1696) was drawn as dīkṣā disciple of Bhaktivinoda (128),
// the wrong way round (he was his dīkṣā guru; that link 128→1696 is kept). He goes under Vaṁśīvadana (1623), of whose
// family he was, as associate. Twice = nothing new.
const port = process.argv[2] || "9333";
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.url.includes("localhost:1421") || p.url.includes("tauri.localhost"));
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const v = await inv("get_person", { id: 1696 });
  const g = await inv("get_person", { id: 1623 });
  if (!/Vipina/.test(v.name) || !/Vamsivadana|Vaṁśīvadana/.test(g.name)) return { error: "names", v: v.name, g: g.name };
  const row = (await inv("list_persons")).find((p) => p.id === 1696);
  if (!row || !("tree" in row)) return { error: "no tree info in list_persons", keys: row && Object.keys(row) };
  const parent = row.tree ? row.tree.parent : null;
  if (parent === 1623) return ["1696 already under 1623"];
  await inv("move_person", { id: 1696, place: { parent: 1623, before: null } });
  await inv("set_tree_kind", { id: 1696, kind: "associate" });
  await inv("set_tree_group", { ids: [1696], group: "" });
  await inv("set_line_info", { id: 1696, guru: 1623, note: "of his family", disputed: false });
  return ["1696 moved under 1623 (associate), was under " + parent];
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (msg) => { console.log(JSON.stringify(JSON.parse(msg.data).result?.result?.value, null, 1)); ws.close(); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
