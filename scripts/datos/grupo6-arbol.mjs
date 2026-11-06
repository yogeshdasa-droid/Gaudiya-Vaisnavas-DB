// node grupo6-arbol.mjs <puerto>   (06-11-2026, Abhidhāna group 6: the bābājīs of the 18th–20th centuries)
// 1) Nityānanda dāsa Bābājī (1045), «the second disciple of Siddha Kṛṣṇadāsa Bābājī», goes from the branch «Other
//    Vaiṣṇava lines» (2027) under Kṛṣṇadāsa of Govardhana (753) as dīkṣā (his disciples 796 and 1861 go with him).
// 2) Madhusūdana dāsa Bābājī (1848), whose mantra came from a mahānta of Gaṅgāmātā's line, from 2027 under Gaṅgāmātā
//    (298), kind «disciple», line «disputed» with a note.
// 3) Gaṅgāmātā (298) under Haridāsa Paṇḍita (1947): dīkṣā, line «disputed» (the Abhidhāna: a later Haridāsa Paṇḍita).
// 4) Jayakṛṣṇa dāsa (606) under Gaṅgāmātā: «of her line» (śikṣā → disciple, with a note).
// 5) Pisimā (1852) was under Balarāma dāsa Bābājī of Jhāḍu-maṇḍala (78): her guru was another Balarāma dāsa (c. 1770),
//    whose new record (made by textoprincipal.mjs grupo6.json) goes in «Other Vaiṣṇava lines», and she under him.
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
  const put = async (id, parent, kind, note, disputed) => {
    const r = row(id);
    if (!r) { log.push(id + ": no record"); return; }
    if (!r.tree || r.tree.parent !== parent) { await inv("move_person", { id, place: { parent, before: null } }); log.push(id + " " + r.name + ": under " + parent + (r.tree ? " (was " + r.tree.parent + ")" : "")); }
    if (!r.tree || r.tree.kind !== kind || r.tree.parent !== parent) { await inv("set_tree_kind", { id, kind }); log.push(id + ": kind " + kind); }
    if (note !== undefined) await inv("set_line_info", { id, guru: null, note, disputed: !!disputed });
  };
  await put(1045, 753, "diksa", "his second disciple (the record)", false);
  await put(1848, 298, "disciple", "his mantra came from an unknown mahānta of Gaṅgāmātā's line (the record)", true);
  await put(298, 1947, "diksa", "the Abhidhāna: «an anuśiṣya» — a later Haridāsa Paṇḍita of the same line", true);
  await put(606, 298, "disciple", "of her line, by paramparā (the record)", false);
  const b = rows.filter((p) => p.name === "Balarāma dāsa (Mahānta of Pisimā's Gaura-Nitāi)");
  if (b.length !== 1) return { error: b.length + " records for the new Balarāma dāsa (run textoprincipal.mjs grupo6.json first)", log };
  await put(b[0].id, 2027, "disciple");
  await put(1852, b[0].id, "diksa", "", false);
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (msg) => { console.log(JSON.stringify(JSON.parse(msg.data).result?.result?.value, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
