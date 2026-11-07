// node nombres2.mjs [puerto]   (07-11-2026)
// Names left in capitals by the import («TILAKARĀMA Dāsa», «KṚṢṆABHĀRATĪ»): written normally; the record keeps its
// earlier version.
// Checked by the old name; twice = nothing.
const port = process.argv[2] ?? "9333";
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
// [id, old name, new name, other forms for aka]
const plan = [
  [121, "BHAKTARĀMA Dās", "Bhaktarāma Dāsa", []],
  [242, "DVĀRAKĀNANDA", "Dvārakānanda", []],
  [268, "Ekacakravasi VṚDDHA Brahman", "Old brāhmaṇa of Ekacakrā", ["Ekacakrā-vāsī vṛddha brāhmaṇa"]],
  [623, "JÑĀNAVALLABHA Dāsa", "Jñānavallabha Dāsa", []],
  [745, "KṚṢṆABHĀRATĪ", "Kṛṣṇa Bhāratī", ["Kṛṣṇabhāratī"]],
  [1420, "ŚIVABHAKTA Brāhmaṇa", "Śiva-bhakta brāhmaṇa", []],
  [1550, "ṬHĀKURAPRASĀDA Dāsa", "Ṭhākuraprasāda Dāsa", []],
  [1551, "TILAKARĀMA Dāsa", "Tilakarāma Dāsa", []],
];
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const plan = ${JSON.stringify(plan)};
  const keys = ["name", "aka", "appearance", "disappearance", "place", "guru", "disciples", "works", "notes", "tags"];
  const log = [], wrong = [];
  for (const [id, old, neu] of plan) {
    const p = await inv("get_person", { id }).catch(() => null);
    if (!p || (p.name !== old && p.name !== neu)) wrong.push(id + " " + old + " ≠ " + (p ? p.name : "(none)"));
  }
  if (wrong.length) return { error: "check", wrong };
  for (const [id, old, neu, forms] of plan) {
    const p = await inv("get_person", { id });
    const now = Object.fromEntries(keys.map((k) => [k, p[k] ?? ""]));
    const aka = [...new Set([...now.aka.split(",").map((s) => s.trim()), ...forms].filter(Boolean))].join(", ");
    if (now.name === neu && now.aka === aka) continue;
    await inv("update_person", { id, fields: { ...now, name: neu, aka } });
    log.push(id + ": «" + now.name + "» → «" + neu + "»");
  }
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const d = JSON.parse(m.data); console.log(JSON.stringify(d.result?.result?.value ?? d.result?.exceptionDetails ?? d, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
