// node grupo3-arbol.mjs <puerto>   (06-11-2026, Abhidhāna group 3: Mādhavendra Purī and the sannyāsīs)
// 1) Kāśīśvara Paṇḍita (1832) was under Mādhavendra Purī without a source: he goes under Lord Caitanya (164) as associate.
// 2) Kāśīśvara Brahmacārī (699) and Govinda (1965), disciples of Īśvara Purī, go under him (516) as dīkṣā.
// 3) Prakāśānanda Sarasvatī (1102) was under Keśava Bhāratī (a misreading): under Lord Caitanya as śikṣā, with a note.
// 4) Viṣṇu Purī (1717): under Jayadharma (1902), his guru according to the Abhidhāna; an extra «disputed» line to
//    Mādhavendra Purī (868), «some say».
// 5) Rāmacandra Purī (1247): a note on his line, «rejected by his guru».
// Twice = nothing new.
const port = process.argv[2] || "9333";
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const plan = {
  moves: [
    [1832, 164, "associate", ""],
    [699, 516, "diksa", ""],
    [1965, 516, "diksa", ""],
    [1102, 164, "siksa", "took shelter of Lord Caitanya at Kāśī (Caitanya-caritāmṛta Madhya 25); his own sannyāsa guru is not known"],
    [1717, 1902, "diksa", "Jayadharma, according to the Gauḍīya Vaiṣṇava Abhidhāna"],
  ],
  links: [[1717, 868, "diksa", "some say a disciple of Mādhavendra Purī (Abhidhāna)", true]],
  notes: [[1247, "rejected by his guru (Caitanya-caritāmṛta Antya 8)"]],
};
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const plan = ${JSON.stringify(plan)};
  const log = [];
  let rows = await inv("list_persons");
  const row = (id) => rows.find((p) => p.id === id);
  for (const [id, parent, kind, note] of plan.moves) {
    const r = row(id);
    if (!r) { log.push(id + ": no record"); continue; }
    if (r.tree && r.tree.parent === parent && r.tree.kind === kind) { log.push(id + " " + r.name + ": already under " + parent); continue; }
    await inv("move_person", { id, place: { parent, before: null } });
    await inv("set_tree_kind", { id, kind });
    if (note) await inv("set_line_info", { id, guru: null, note, disputed: false });
    log.push(id + " " + r.name + ": under " + parent + " (" + kind + ")" + (r.tree ? ", was under " + r.tree.parent : ""));
  }
  rows = await inv("list_persons");
  for (const [id, guru, kind, note, disputed] of plan.links) {
    const r = row(id);
    const now = (r.links || []).filter((l) => l.kind !== "family").map((l) => [l.guru, l.kind]);
    if (now.some(([g, k]) => g === guru && k === kind)) { log.push(id + ": line to " + guru + " already there"); continue; }
    await inv("set_links", { id, links: [...now, [guru, kind]] });
    await inv("set_line_info", { id, guru, note, disputed });
    log.push(id + " " + r.name + ": + line " + guru + "/" + kind + (disputed ? " (disputed)" : ""));
  }
  for (const [id, note] of plan.notes) {
    await inv("set_line_info", { id, guru: null, note, disputed: false });
    log.push(id + ": note on its line");
  }
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (msg) => { console.log(JSON.stringify(JSON.parse(msg.data).result?.result?.value, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
