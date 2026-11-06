// node grupo2-arbol.mjs <puerto>   (06-11-2026, Abhidhāna group 2: Gadādhara Paṇḍita's branch)
// 1) Jayarāma Tarkālaṅkāra (609) out of the Guru Paramparā: his teacher was the logician Gadādhara, not Gadādhara Paṇḍita.
// 2) Ananta Ācārya (44) under Gadādhara as dīkṣā (it was śikṣā).
// 3) Kavivallabha dāsa (722) was under Uddhava dāsa of Gadādhara's branch (1568): his guru was another Uddhava dāsa,
//    a disciple of Narahari Sarakāra (980) — that record (made by textoprincipal.mjs grupo2.json) goes under 980,
//    and 722 under him.
// 4) The records of Gadādhara's branch that were outside the tree go under him (274): «diksa» when the texts say
//    «disciple of Gadādhara», «disciple» (of his branch) otherwise; those of the sub-branch (upaśākhā) with a note.
// Twice = nothing new.
const port = process.argv[2] || "9333";
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const SUB = "of the sub-branch (upaśākhā) of Gadādhara (Śākhā-nirṇayāmṛta); his own guru is not known";
const plan = {
  out: [609],
  kinds: [[44, "diksa"]],
  newUddhava: "Uddhava dāsa (disciple of Narahari Sarakāra)",
  under274: [
    [106, "diksa"], [349, "diksa"], [832, "diksa"],
    [33, "disciple"], [297, "disciple"], [361, "disciple"], [450, "disciple"], [495, "disciple"], [507, "disciple"],
    [674, "disciple"], [708, "disciple"], [1069, "disciple"], [1142, "disciple"], [1436, "disciple"], [1458, "disciple"],
    [1595, "disciple"], [1641, "disciple"], [1672, "disciple"], [1766, "disciple"], [1922, "disciple"], [1925, "disciple"],
    [1990, "disciple"],
    [139, "disciple", SUB], [999, "disciple", SUB], [1372, "disciple", SUB], [1763, "disciple", SUB], [1774, "disciple", SUB],
  ],
};
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const plan = ${JSON.stringify(plan)};
  const log = [];
  let rows = await inv("list_persons");
  const row = (id) => rows.find((p) => p.id === id);
  for (const id of plan.out) {
    const r = row(id);
    if (!r || !r.tree) { log.push(id + ": not in the tree"); continue; }
    await inv("move_person", { id, place: null });
    log.push(id + " " + r.name + ": out of the tree");
  }
  for (const [id, kind] of plan.kinds) {
    const r = row(id);
    if (r && r.tree && r.tree.kind !== kind) { await inv("set_tree_kind", { id, kind }); log.push(id + " " + r.name + ": " + r.tree.kind + " → " + kind); }
    else log.push(id + ": kind already " + kind);
  }
  const ud = rows.filter((p) => p.name === plan.newUddhava);
  if (ud.length !== 1) return { error: ud.length + " records named " + plan.newUddhava + " (run textoprincipal.mjs grupo2.json first)", log };
  const u = ud[0];
  if (!u.tree) { await inv("move_person", { id: u.id, place: { parent: 980, before: null } }); await inv("set_tree_kind", { id: u.id, kind: "diksa" }); log.push(u.id + " " + u.name + ": under 980 (dīkṣā)"); }
  const k = row(722);
  if (k && (!k.tree || k.tree.parent !== u.id)) { await inv("move_person", { id: 722, place: { parent: u.id, before: null } }); await inv("set_tree_kind", { id: 722, kind: "diksa" }); log.push("722 " + k.name + ": under " + u.id + " (dīkṣā)"); }
  for (const [id, kind, note] of plan.under274) {
    const r = row(id);
    if (!r) { log.push(id + ": no record"); continue; }
    if (r.tree) { log.push(id + " " + r.name + ": already in the tree (under " + r.tree.parent + ")"); continue; }
    await inv("move_person", { id, place: { parent: 274, before: null } });
    await inv("set_tree_kind", { id, kind });
    if (note) await inv("set_line_info", { id, guru: null, note, disputed: false });
    log.push(id + " " + r.name + ": under 274 (" + kind + (note ? ", note" : "") + ")");
  }
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (msg) => { console.log(JSON.stringify(JSON.parse(msg.data).result?.result?.value, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
