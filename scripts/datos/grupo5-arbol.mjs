// node grupo5-arbol.mjs <puerto>   (06-11-2026, Abhidhāna group 5: the later ācāryas of Vraja)
// 1) Kṛṣṇadeva Sārvabhauma (776) and Jagannātha Cakravartī (549, father of Narahari Cakravartī), disciples of
//    Viśvanātha Cakravartī (1723), go under him as dīkṣā.
// 2) Rādhādāmodara (1145), disciple of Nayanānanda (2006): «disciple» → dīkṣā.
// 3) Baladeva (73): an extra śikṣā line to Viśvanātha (he read the Bhāgavatam with him).
// 4) Rādhāmohana Ṭhākura (1159), under Śrīnivāsa as «associate»: a note on his line, «of his family».
// Twice = nothing new.
const port = process.argv[2] || "9333";
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const log = [];
  let rows = await inv("list_persons");
  const row = (id) => rows.find((p) => p.id === id);
  for (const id of [776, 549]) {
    const r = row(id);
    if (r.tree) { log.push(id + " " + r.name + ": already in the tree (under " + r.tree.parent + ")"); continue; }
    await inv("move_person", { id, place: { parent: 1723, before: null } });
    await inv("set_tree_kind", { id, kind: "diksa" });
    log.push(id + " " + r.name + ": under 1723 (dīkṣā)");
  }
  const rd = row(1145);
  if (rd.tree && rd.tree.kind !== "diksa") { await inv("set_tree_kind", { id: 1145, kind: "diksa" }); log.push("1145: " + rd.tree.kind + " → diksa"); }
  const b = row(73);
  const now = (b.links || []).filter((l) => l.kind !== "family").map((l) => [l.guru, l.kind]);
  if (!now.some(([g, k]) => g === 1723 && k === "siksa")) {
    await inv("set_links", { id: 73, links: [...now, [1723, "siksa"]] });
    await inv("set_line_info", { id: 73, guru: 1723, note: "read the Bhāgavatam with him", disputed: false });
    log.push("73: + śikṣā line to 1723");
  } else log.push("73: śikṣā line to 1723 already there");
  await inv("set_line_info", { id: 1159, guru: null, note: "of his family (a descendant, born c. 1697)", disputed: false });
  log.push("1159: note on its line");
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (msg) => { console.log(JSON.stringify(JSON.parse(msg.data).result?.result?.value, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
