// node tp10-arbol.mjs [puerto]   (07-11-2026, Whisper: «míralo tú»)
// #332 Giridhārī dāsa (Annadāprasāda Rāya) took bheka in 1890 from «Kṛṣṇadāsa Bābājī of Govardhana». Siddha Kṛṣṇadāsa
// #753 learnt from Vaiṣṇava-caraṇa dāsa, the compiler of the Padakalpataru (18th c.), and the record of Brahmānanda
// Gosvāmī #160 speaks of a «second Siddha Kṛṣṇadāsa», disciple of Siddha Bābā Kṛṣṇadāsa of Govardhana: the bheka of
// 1890 fits him better. He has no record, so the line stays, marked as disputed with a note. Twice = the same.
const [, , port = "9333"] = process.argv;
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const note = "His text: bheka in 1890 from «Kṛṣṇadāsa Bābājī of Govardhana». Siddha Kṛṣṇadāsa learnt from the compiler of the Padakalpataru (18th c.); Brahmānanda Gosvāmī's record names a second Siddha Kṛṣṇadāsa, his disciple, who fits 1890 better (no record of his own).";
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const p = await inv("get_person", { id: 332 });
  if (!p.name.startsWith("Giridhārī dāsa Bābājī")) return { error: "332 is " + p.name };
  return await inv("set_line_info", { id: 332, guru: null, note: ${JSON.stringify(note)}, disputed: true });
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const d = JSON.parse(m.data); console.log(JSON.stringify(d.result?.result?.value ?? d.result?.exceptionDetails ?? d)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
