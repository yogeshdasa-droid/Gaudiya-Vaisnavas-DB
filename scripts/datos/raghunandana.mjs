// node raghunandana.mjs [puerto]   (07-11-2026, asked by Whisper)
// Sakhā of Raghunandana Ṭhākura #1200 (Śrīkhaṇḍa), who had nobody under him.
// 1. Mixed records split (notes only, no texts): 710 Kavirañjana / Kaviratna Miśra, 1451 Śrīman Sen (two),
//    900 Mālinī (Śrīvāsa's wife / Mahānanda's wife). New records found by name, never made twice.
// 2. Placed under 1200 (or 980 Narahari Sarakāra for Kaviratna Miśra) if still outside the tree.
const port = process.argv[2] ?? "9333";
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const plan = {
  // existing records whose notes are cut down to their own person (checked by name)
  fix: [
    { id: 710, name: "Kaviranjana", fields: { name: "Kavirañjana",
      notes: "A famous Vaiṣṇava poet who belonged to the sakhā of Raghunandana Ṭhākura of Śrīkhaṇḍa.\n\nThe record also held Kaviratna Miśra (of Narahari Sarakāra's sakhā), who now has his own record (07-11-2026)." } },
    { id: 1451, name: "Śrīman Sen", fields: {
      notes: "He belonged to the sakhā of Lord Caitanya (Caitanya-caritāmṛta Ādi 10.52).\n\nAnother Śrīman Sen, of the sakhā of Raghunandana of Śrīkhaṇḍa, now has his own record (07-11-2026)." } },
    { id: 900, name: "Mālinī Thakurni", fields: { name: "Mālinī Ṭhākurāṇī",
      notes: "She was the wife of Śrīvāsa Paṇḍita, a brāhmaṇa woman who lived in Navadvīpa and treated Nityānanda Prabhu as her son (Caitanya Bhāgavata 2.11.8-10, 2.11.32-44). In Kṛṣṇa-līlā: Ambikā, Kṛṣṇa's nurse in Vraja (Gaura-gaṇoddeśa-dīpikā 42).\n\nAnother Mālinī, wife of Mahānanda Caudhurī, of Raghunandana's branch, now has her own record (07-11-2026)." } },
  ],
  // new records
  add: [
    { name: "Kaviratna Miśra", parent: 980, kind: "disciple", fields: { place: "Edna village",
      notes: "He belonged to the sakhā of Narahari Sarakāra and lived in Edna village (Nāmāmṛta-samudra 220). Taken out of the record «Kavirañjana» #710 (07-11-2026)." } },
    { name: "Śrīman Sen (of Raghunandana's sakhā)", parent: 1200, kind: "disciple", fields: { place: "Śrīkhaṇḍa",
      notes: "He belonged to the sakhā of Raghunandana of Śrīkhaṇḍa. Not the Śrīman Sen of Lord Caitanya's sakhā (#1451), from whose record he was taken out (07-11-2026)." } },
    { name: "Mālinī (wife of Mahānanda Caudhurī)", parent: 1200, kind: "disciple", fields: { place: "Śrīkhaṇḍa",
      notes: "She belonged to the branch of Śrīla Raghunandana of Śrīkhaṇḍa and was the wife of Śrī Mahānanda Caudhurī (#889). Taken out of the record of Mālinī Ṭhākurāṇī #900, wife of Śrīvāsa (07-11-2026)." } },
  ],
  // placed under 1200: id, name (to check), kind
  place: [
    [711, "Kavisekhara (Rajasekhara)", "diksa"],
    [889, "Mahananda Caudhuri", "diksa"],
    [1026, "Nayanānanda Kavirāja", "diksa"],
    [586, "Janananda Caudhuri", "disciple"],
    [1091, "Pitamvara Dāsa", "disciple"],
    [710, "Kaviranjana", "disciple"],
  ],
};
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const plan = ${JSON.stringify(plan)};
  const keys = ["name", "aka", "appearance", "disappearance", "place", "guru", "disciples", "works", "notes", "tags"];
  const log = [];
  const get = (id) => inv("get_person", { id }).catch(() => null);
  for (const f of plan.fix) {
    const p = await get(f.id);
    if (!p || (p.name !== f.name && p.name !== f.fields.name)) return { error: "name does not match", id: f.id, name: p && p.name };
  }
  for (const [id, name] of plan.place) {
    const p = await get(id);
    if (!p || (p.name !== name && !plan.fix.some((f) => f.id === id && p.name === f.fields.name))) return { error: "name does not match", id, name: p && p.name };
  }
  for (const f of plan.fix) {
    const p = await get(f.id);
    const want = { ...Object.fromEntries(keys.map((k) => [k, p[k] ?? ""])), ...f.fields };
    const changed = keys.filter((k) => (p[k] ?? "") !== want[k]);
    if (changed.length) { await inv("update_person", { id: f.id, fields: want }); log.push(f.id + " " + want.name + ": " + changed.join(", ")); }
  }
  let rows = await inv("list_persons");
  const place = [...plan.place.map(([id, , kind]) => ({ id, parent: 1200, kind }))];
  for (const a of plan.add) {
    const hit = rows.filter((p) => p.name === a.name);
    if (hit.length > 1) return { error: "several records named " + a.name, log };
    let id = hit[0]?.id;
    if (!id) {
      id = await inv("new_person", { fields: { ...Object.fromEntries(keys.map((k) => [k, ""])), ...a.fields, name: a.name } });
      log.push("NEW " + id + " " + a.name);
    }
    place.push({ id, parent: a.parent, kind: a.kind });
  }
  rows = await inv("list_persons");
  const row = (id) => rows.find((p) => p.id === id);
  for (const x of place) {
    const r = row(x.id), g = row(x.parent);
    if (r.tree) continue;
    if (!g || !g.tree) { log.push(x.id + ": guru " + x.parent + " not in the tree"); continue; }
    await inv("move_person", { id: x.id, place: { parent: x.parent, before: null } });
    await inv("set_tree_kind", { id: x.id, kind: x.kind });
    log.push("placed " + x.id + " " + r.name + " under " + x.parent + " (" + x.kind + ")");
  }
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { console.log(JSON.stringify(JSON.parse(m.data).result?.result?.value, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
