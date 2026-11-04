// node jayadeva-ravi.mjs [port]  (04-11-2026, asked by Whisper)
// 598 Jayadeva (the poet of the Gīta-govinda, 12th c.): no guru, out of the Guru Paramparā
//   (he was under Śrīnivāsa Ācārya: impossible in time; the link came from the Jayadeva-caritra
//   written by Vanamālī dāsa, a disciple of Śrīnivāsa).
// 1317 Ravi Rāya: guru Narottama (source of the record), and in the notes the other version
//   (Abhidhāna: disciple of Śrīnivāsa).
// 597 Jayadeva Gosvāmī: guru «Lakṣmaṇ Sen» removed (the king at whose court he lived). Running it twice changes nothing the second time.
const port = process.argv[2] ?? "9333";
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.url.includes("localhost:1421") || p.url.includes("tauri.localhost"));
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const log = [];
  const fields = (p) => ({ name: p.name, aka: p.aka, appearance: p.appearance, disappearance: p.disappearance, place: p.place, guru: p.guru, disciples: p.disciples, works: p.works, notes: p.notes, tags: p.tags });
  const ps = await inv("list_persons");
  // ---- 598 Jayadeva
  let jd = await inv("get_person", { id: 598 });
  if (!jd.name.startsWith("Jayadeva")) return { error: "598 is " + jd.name };
  const node = ps.find((p) => p.id === 598)?.tree;
  if (node) {
    await inv("move_person", { id: 598, place: null });
    log.push("598 out of the Guru Paramparā (was under " + node.parent + ")");
    if (node.parent === 1466) log.push("unrelate 1466: " + (await inv("unrelate", { disciple: 598, guru: 1466 })));
  }
  jd = await inv("get_person", { id: 598 });
  if (jd.guru.trim()) {
    await inv("update_person", { id: 598, fields: { ...fields(jd), guru: "" } });
    log.push("598 guru cleared (was: " + jd.guru + ")");
  }
  // 597 Jayadeva Gosvāmī (also the poet): Lakṣmaṇa Sena was his king, not his guru
  const jg = await inv("get_person", { id: 597 });
  if (!jg.name.startsWith("Jayadeva")) return { error: "597 is " + jg.name };
  if (/lak.ma/i.test(jg.guru.normalize("NFD").replace(/[\\u0300-\\u036f]/g, ""))) {
    await inv("update_person", { id: 597, fields: { ...fields(jg), guru: "" } });
    log.push("597 guru cleared (was: " + jg.guru + ")");
  }
  const sri = await inv("get_person", { id: 1466 });
  if (/jayadeva/i.test(sri.disciples)) log.push("WARNING: Śrīnivāsa's disciples still name Jayadeva");
  // ---- 1317 Ravi Rāya
  const nar = ps.filter((p) => /^(Śrī |Śrīla )?Narottama/.test(p.name)).map((p) => p.id + " " + p.name);
  const narName = ps.find((p) => p.tree && /^(Śrī |Śrīla )?Narottama/.test(p.name))?.name;
  if (!narName) return { error: "Narottama?", nar };
  const ravi = await inv("get_person", { id: 1317 });
  if (ravi.name !== "Ravi Rāya") return { error: "1317 is " + ravi.name };
  const variant = "Guru: according to the source of this record (Prema-vilāsa), a disciple of Narottama Ṭhākura; the Gauḍīya Vaiṣṇava Abhidhāna (Tīrthas, «Budhurī») calls him a disciple of Śrīnivāsa Ācārya.";
  const f = fields(ravi);
  let changed = false;
  if (!f.guru.trim()) { f.guru = narName; changed = true; }
  if (!f.notes.includes("Gauḍīya Vaiṣṇava Abhidhāna (Tīrthas")) { f.notes = (f.notes.trim() ? f.notes.trim() + "\\n\\n" : "") + variant; changed = true; }
  if (changed) { await inv("update_person", { id: 1317, fields: f }); log.push("1317 guru = " + f.guru + "; variant in notes"); }
  return { log, nar };
})()`;
ws.onmessage = (m) => {
  console.log(JSON.stringify(JSON.parse(m.data).result?.result?.value, null, 1));
  ws.close();
};
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
