// node f4-arbol.mjs [puerto]   (07-11-2026) 716 Keśava Kāśmīrī, of the Nimbārka sampradāya → under Nimbārka #1037
// (in the branch «Other sampradāyas»). Only if still outside the tree. Twice = nothing.
const [, , port = "9333"] = process.argv;
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const rows = await inv("list_persons");
  const r = rows.find((p) => p.id === 716), g = rows.find((p) => p.id === 1037);
  if (r.tree) return [];
  if (!g?.tree) return { error: "1037 not in the tree" };
  await inv("move_person", { id: 716, place: { parent: 1037, before: null } });
  await inv("set_tree_kind", { id: 716, kind: "disciple" });
  await inv("set_line_info", { id: 716, guru: null, note: "Of Nimbārka's line, through Gokula Bhaṭṭa (Bhakti-ratnākara 12.2243-2276); his own gurus: Mukunda and Gaṅgala Bhaṭṭa.", disputed: false });
  return ["716 under 1037"];
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const d = JSON.parse(m.data); console.log(JSON.stringify(d.result?.result?.value ?? d.result?.exceptionDetails ?? d)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
