// node bv3-arbol.mjs <puerto>   (06-11-2026, Bhaktivinoda 3)
// 1) Disciples of Bhaktisiddhānta Sarasvatī (124) that were not in the Guru Paramparā go under him as dīkṣā.
// 2) Extra lines (sannyāsa / śikṣā / veśa) the texts give, added to the ones each record already has.
// Twice = nothing new.
const port = process.argv[2] || "9333";
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.url.includes("localhost:1421") || p.url.includes("tauri.localhost"));
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const plan = {
  under124: [1667, 810, 1800, 1792, 1796, 1804, 1805, 1807],
  links: [
    [1798, 1802, "sannyasa"], // Keśava: sannyāsa from Śrīdhara Mahārāja at Katwa
    [810, 1667, "sannyasa"], // Kumuda Santa: sannyāsa from Yāyāvara Mahārāja, Remuṇā 1942
    [810, 1795, "siksa"], // … honoured Bon Mahārāja as śikṣā-guru
    [1800, 1377, "sannyasa"], // Prapanna Dāmodara: sannyāsa from Bhakti Sāraṅga Gosvāmī, 1947
    [1795, 17, "vesa"], // Bon Mahārāja: bābājī veśa from Advaita dāsa Bābājī
    [1809, 1552, "siksa"], // Nārāyaṇa Mahārāja: Trivikrama Mahārāja his śikṣā-guru
    [1809, 1795, "siksa"], // … and Bon Mahārāja
  ],
};
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const plan = ${JSON.stringify(plan)};
  const log = [];
  let rows = await inv("list_persons");
  const row = (id) => rows.find((p) => p.id === id);
  for (const id of plan.under124) {
    const r = row(id);
    if (!r) { log.push(id + ": no record"); continue; }
    if (r.tree) { log.push(id + " " + r.name + ": already in the tree (under " + r.tree.parent + ")"); continue; }
    await inv("move_person", { id, place: { parent: 124, before: null } });
    await inv("set_tree_kind", { id, kind: "diksa" });
    log.push(id + " " + r.name + ": put under 124 (dīkṣā)");
  }
  rows = await inv("list_persons");
  const byId = {};
  for (const [id, guru, kind] of plan.links) (byId[id] = byId[id] || []).push([guru, kind]);
  for (const id of Object.keys(byId).map(Number)) {
    const r = row(id);
    if (!r) { log.push(id + ": no record"); continue; }
    const now = (r.links || []).filter((l) => l.kind !== "family").map((l) => [l.guru, l.kind]);
    const add = byId[id].filter(([g, k]) => !now.some(([g2, k2]) => g2 === g && k2 === k) && !(r.tree && r.tree.parent === g));
    if (!add.length) { log.push(id + " " + r.name + ": lines already there"); continue; }
    await inv("set_links", { id, links: [...now, ...add] });
    log.push(id + " " + r.name + ": + " + add.map(([g, k]) => g + "/" + k).join(", "));
  }
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (msg) => { console.log(JSON.stringify(JSON.parse(msg.data).result?.result?.value, null, 1)); ws.close(); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
