// node f1-arbol.mjs [puerto]   (07-11-2026, records outside the tree, batch 1)
//  - 1818 Gaura Kiśora Śiromaṇi: veśa from Siddha Nityānanda dāsa Bābājī #1045 → under 1045 (vesa).
//  - 461 Haribolānanda Ṭhākura: guru not known, has disciples → in the branch «Other Vaiṣṇava lines» #2027.
//  - 1695 Vipina Bihārī Caṭṭopādhyāya: «the second son of Śyāmācaraṇa», disciple of Haribolānanda → under 461 (diksa).
//  - 332 Giridhārī dāsa (Annadāprasāda): initiated by Śiromaṇi as Advaita dāsa → extra dīkṣā line to 1818.
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
    const r = (await rows()).find((p) => p.id === id), g = (await rows()).find((p) => p.id === parent);
    if (!r) throw new Error(id + " missing");
    if (r.tree) return;
    if (!g?.tree) throw new Error(parent + " not in the tree");
    await inv("move_person", { id, place: { parent, before: null } });
    await inv("set_tree_kind", { id, kind });
    if (note) await inv("set_line_info", { id, guru: null, note, disputed: false });
    log.push(id + " under " + parent + " (" + kind + ")");
  };
  await place(1818, 1045, "vesa");
  await place(461, 2027, "disciple", "His guru is not known: the order to chant Haribol came to him from the goddess at Kālīghāṭ.");
  await place(1695, 461, "diksa");
  // 1695 was in the tree's first level (no guru above): put it under 461 too (moving it again changes nothing)
  await inv("move_person", { id: 1695, place: { parent: 461, before: null } });
  await inv("set_tree_kind", { id: 1695, kind: "diksa" });
  const r332 = (await rows()).find((p) => p.id === 332);
  const links = (r332.links || []).filter((l) => l.kind !== "family").map((l) => [l.guru, l.kind]);
  if (!links.some(([g]) => g === 1818)) {
    await inv("set_links", { id: 332, links: [...links, [1818, "diksa"]] });
    log.push("332: line diksa to 1818");
  }
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const d = JSON.parse(m.data); console.log(JSON.stringify(d.result?.result?.value ?? d.result?.exceptionDetails ?? d, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
