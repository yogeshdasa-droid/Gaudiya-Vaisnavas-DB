// node fix-g2.mjs <port> → Kumāradeva name, Lokanātha under Mahāprabhu (dīkṣā), Sanātana's disciples without him. Twice = nothing new.
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
  const k = await inv("get_person", { id: 808 });
  if (k.name === "Kumaradeva") { await inv("update_person", { id: 808, fields: { ...all(k), name: "Kumāradeva" } }); log.push("808 renamed"); }
  else log.push("808 name: " + k.name);
  const m = await inv("get_person", { id: 164 });
  const l = await inv("get_person", { id: 844 });
  if (m.name !== "Śrī Caitanya Mahāprabhu" || l.name !== "Lokanātha Gosvāmī") return { error: "names", m: m.name, l: l.name };
  await inv("move_person", { id: 844, place: { parent: 164, before: null } });
  await inv("set_tree_kind", { id: 844, kind: "diksa" });
  log.push("844 moved under 164 (diksa)");
  const s = await inv("get_person", { id: 1353 });
  const d = s.disciples.split(/,\\s*/).filter((x) => x !== "Lokanātha Gosvāmī").join(", ");
  if (d !== s.disciples) { await inv("update_person", { id: 1353, fields: { ...all(s), disciples: d } }); log.push("1353 disciples: " + d); }
  else log.push("1353 same");
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (msg) => { console.log(JSON.stringify(JSON.parse(msg.data).result?.result?.value, null, 1)); ws.close(); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
