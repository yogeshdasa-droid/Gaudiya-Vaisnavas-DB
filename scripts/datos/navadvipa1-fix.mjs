// node navadvipa1-fix.mjs <port> → «Srinidhi» → «Śrīnidhi» (run AFTER textoprincipal.mjs; then navadvipa1.json uses the new name); Mālinī Ṭhākurāṇī (900) without «Nityānanda» as disciple. Twice = nothing new.
const port = process.argv[2] || "9333";
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const keys = ["name","aka","appearance","disappearance","place","guru","disciples","works","notes","tags"];
  const all = (p) => Object.fromEntries(keys.map((k) => [k, p[k] ?? ""]));
  const log = [];
  const s = await inv("get_person", { id: 1464 });
  if (s.name === "Srinidhi") { await inv("update_person", { id: 1464, fields: { ...all(s), name: "Śrīnidhi" } }); log.push("1464 renamed"); }
  else log.push("1464 name: " + s.name);
  const m = await inv("get_person", { id: 900 });
  if (m.name !== "Mālinī Thakurni") return { error: "900 is " + m.name };
  if (m.disciples) { await inv("update_person", { id: 900, fields: { ...all(m), disciples: "" } }); log.push("900 disciples cleared (was: " + m.disciples + ")"); }
  else log.push("900 same");
  // Whisper (04-11): Śrīvāsa under Śrī Caitanya Mahāprabhu in the tree (was under Mādhavendra Purī)
  const sv = await inv("get_person", { id: 1468 });
  const mp = await inv("get_person", { id: 164 });
  if (sv.name !== "Śrīvāsa Paṇḍita" || mp.name !== "Śrī Caitanya Mahāprabhu") return { error: "names", sv: sv.name, mp: mp.name };
  await inv("move_person", { id: 1468, place: { parent: 164, before: null } });
  await inv("set_tree_kind", { id: 1468, kind: "diksa" });
  log.push("1468 under 164 (diksa)");
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (msg) => { console.log(JSON.stringify(JSON.parse(msg.data).result?.result?.value, null, 1)); ws.close(); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
