// node deshacer-753.mjs <puerto>   (06-11-2026) — the merge 753 ← 1837 + 1838 of unir3.json was wrong for 1838:
// Kṛṣṇadāsa Bābājī of Rāṇabāḍī (Kṛṣṇaprasāda Caṭṭopādhyāya of Bankura) is another person; his text was only found
// inside 753's compiled text. The merge is undone (both come back); 1837 is merged again with kṛṣṇadasa-unir.json.
// Twice = nothing new.
const port = process.argv[2] || "9333";
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const back = await inv("get_person", { id: 1838 }).catch(() => null);
  if (back) return ["1838 is there already (" + back.name + "): nothing to undo"];
  const ms = await inv("list_merges", { person: 753 });
  const m = ms.find((x) => x.names.some((n) => /Ranabadi/.test(n)));
  if (!m) return { error: "merge not found", ms };
  await inv("undo_merge", { id: m.id });
  return ["undone merge " + m.id + " (" + m.names.join(" + ") + ")"];
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { console.log(JSON.stringify(JSON.parse(m.data).result?.result?.value)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
