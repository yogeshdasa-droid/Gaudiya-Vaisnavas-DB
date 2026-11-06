// node bv3-prabhupada.mjs <puerto>   (06-11-2026) — Whisper: Prabhupāda (125) got harināma and dīkṣā from
// Bhaktisiddhānta Sarasvatī (124) and only sannyāsa from Keśava (1798): his line under 124 is dīkṣā, not śikṣā.
// The sannyāsa line to 1798 is already there. Twice = nothing new.
const port = process.argv[2] || "9333";
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const r = (await inv("list_persons")).find((p) => p.id === 125);
  if (!r || !r.tree || r.tree.parent !== 124) return { error: "125 is not under 124", tree: r && r.tree };
  if (r.tree.kind === "diksa") return ["125 already dīkṣā under 124"];
  await inv("set_tree_kind", { id: 125, kind: "diksa" });
  return ["125: " + r.tree.kind + " → diksa under 124; links: " + JSON.stringify(r.links)];
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { console.log(JSON.stringify(JSON.parse(m.data).result?.result?.value)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
