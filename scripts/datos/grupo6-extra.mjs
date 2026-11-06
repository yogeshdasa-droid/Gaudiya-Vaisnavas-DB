// node grupo6-extra.mjs <puerto>   (06-11-2026, Whisper)
// 1) Lakṣmīpriyā Mātā (1841), Lord Caitanya's first wife, outside the tree → under Lord Caitanya (164) as associate (pārṣada).
// 2) Giridhārī dāsa Bābājī (332) took veśa (bheka) from Siddha Kṛṣṇadāsa Bābājī of Govardhana (753), as his text says:
//    from under Govinda dāsa Bābājī (1971) to under 753, kind veśa; his «Guru» field and notes say so.
// Twice = nothing new.
const port = process.argv[2] || "9333";
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const log = [];
  const rows = await inv("list_persons");
  const row = (id) => rows.find((p) => p.id === id);
  const put = async (id, parent, kind) => {
    const r = row(id);
    if (r.tree && r.tree.parent === parent && r.tree.kind === kind) { log.push(id + " " + r.name + ": already under " + parent); return; }
    await inv("move_person", { id, place: { parent, before: null } });
    await inv("set_tree_kind", { id, kind });
    log.push(id + " " + r.name + ": under " + parent + " (" + kind + ")" + (r.tree ? ", was under " + r.tree.parent : ""));
  };
  await put(1841, 164, "associate");
  await put(332, 753, "vesa");
  const p = await inv("get_person", { id: 332 });
  const guru = "Vipina Candra Caṭṭopādhyāya (dīkṣā); Siddha Kṛṣṇadāsa Bābājī of Govardhana (veśa / bheka, 1890)";
  const add = "Took veśa (bheka, the renunciant's dress) from Siddha Kṛṣṇadāsa Bābājī of Govardhana in 1890, as his text says (Whisper, 06-11-2026); the record had «Govinda dāsa bābājī».";
  if (p.guru !== guru || !(p.notes || "").includes(add)) {
    const keys = ["name", "aka", "appearance", "disappearance", "place", "guru", "disciples", "works", "notes", "tags"];
    const fields = Object.fromEntries(keys.map((k) => [k, p[k] ?? ""]));
    fields.guru = guru;
    if (!(p.notes || "").includes(add)) fields.notes = ((p.notes || "").trim() + "\\n\\n" + add).trim();
    await inv("update_person", { id: 332, fields });
    log.push("332: guru and notes");
  } else log.push("332: fields already right");
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (msg) => { console.log(JSON.stringify(JSON.parse(msg.data).result?.result?.value, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
