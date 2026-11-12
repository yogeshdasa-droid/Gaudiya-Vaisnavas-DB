// node backplan.mjs <port> <out.json> → the notBackGuru / notBackDisciple pairs that the tree confirms (place or line),
// split into: safe (to complete with complete_back) and «comma» (a name with a comma inside brackets: by hand).
import fs from "node:fs";
const [, , port, out] = process.argv;
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const issues = await inv("check_data");
  const rows = await inv("list_persons");
  const by = new Map(rows.map((p) => [p.id, p]));
  // a line marked «disputed» confirms nothing (12-11-2026: Jagadānanda dāsa's Bhagavān dāsa)
  const tied = (d, g) => { const p = by.get(d); return !!p && ((p.tree && p.tree.parent === g && !p.tree.disputed) || p.links.some((l) => l.guru === g && l.kind !== "family" && !l.disputed)); };
  const out = { safe: [], comma: [], unconfirmed: [] };
  for (const i of issues) {
    if (i.kind !== "notBackGuru" && i.kind !== "notBackDisciple") continue;
    const [d, g] = i.kind === "notBackGuru" ? [i.id, i.other] : [i.other, i.id];
    const writer = by.get(i.id)?.name ?? "";
    const item = { kind: i.kind, id: i.id, other: i.other, name: i.name, otherName: by.get(i.other)?.name };
    if (!tied(d, g)) out.unconfirmed.push(item);
    else if (/\\(.*,/.test(writer)) out.comma.push(item);
    else out.safe.push(item);
  }
  return out;
})()`;
ws.onmessage = (m) => {
  const v = JSON.parse(m.data).result?.result?.value;
  fs.writeFileSync(out, JSON.stringify(v, null, 1), "utf8");
  console.log("safe", v.safe.length, "| comma", v.comma.length, "| not confirmed by the tree", v.unconfirmed.length);
  for (const x of v.comma) console.log("  comma:", x.kind, x.id, x.name, "→", x.other, x.otherName);
  ws.close(); process.exit(0);
};
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
