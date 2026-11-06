// node jagannatha-1828.mjs <puerto>   (06-11-2026) — Whisper: Madhusūdana dāsa Bābājī (1848) gave Jagannātha dāsa
// Bābājī (1828) only the bābājī veśa (he gave no mantra dīkṣā); his dīkṣā guru was Jagadānanda Gosvāmī of Śṛṅgāra-vaṭa,
// Vṛndāvana (Gauḍīya-vaiṣṇava-jīvana). 1828 stays where he is in the tree (under Baladeva, vāṇī: the whole line of
// Gaura Kiśora and Bhaktisiddhānta hangs from him); he gets the lines veśa → 1848 and dīkṣā → Jagadānanda, a new
// record put in the branch «Other Vaiṣṇava lines» (his own guru is not known). Run otras-lineas-arbol.mjs first.
// Twice = nothing new.
const port = process.argv[2] || "9333";
const BRANCH = "Other Vaiṣṇava lines (guru not in the Paramparā)";
const NEW = "Jagadānanda Gosvāmī (Śṛṅgāra-vaṭa, Vṛndāvana)";
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.url.includes("localhost:1421") || p.url.includes("tauri.localhost"));
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const plan = {
  newFields: {
    name: NEW,
    place: "Śṛṅgāra-vaṭa, Vṛndāvana",
    disciples: "Śrī Jagannātha dās Bābājī (dīkṣā)",
    notes: "Of Śṛṅgāra-vaṭa in Vṛndāvana; the dīkṣā guru of Jagannātha dāsa Bābājī (Gauḍīya-vaiṣṇava-jīvana).",
  },
  guru1828: "Jagadānanda Gosvāmī of Śṛṅgāra-vaṭa, Vṛndāvana (dīkṣā, Gauḍīya-vaiṣṇava-jīvana); Madhusūdana dāsa Bābājī of Sūrya-kuṇḍa (bābājī veśa)",
  notesOld: "disciple of Madhusūdana dāsa Bābājī of Sūrya-kuṇḍa, in the line of Baladeva Vidyābhūṣaṇa through Uddhava dāsa (another text: disciple of Jagadānanda Gosvāmī of Śṛṅgāravaṭa, bābājī dress from Siddha Kṛṣṇadāsa of Govardhana).",
  notesNew: "dīkṣā from Jagadānanda Gosvāmī of Śṛṅgāra-vaṭa (Gauḍīya-vaiṣṇava-jīvana) and bābājī veśa from Madhusūdana dāsa Bābājī of Sūrya-kuṇḍa, who gave no mantra dīkṣā; in the tree he stays in the line of Baladeva Vidyābhūṣaṇa through Uddhava dāsa (another text: bābājī dress from Siddha Kṛṣṇadāsa of Govardhana).",
  disc1848: "Śrī Jagannātha dās Bābājī (bābājī veśa)",
};
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const plan = ${JSON.stringify(plan)};
  const keys = ["name", "aka", "appearance", "disappearance", "place", "guru", "disciples", "works", "notes", "tags"];
  const fieldsOf = (p) => Object.fromEntries(keys.map((k) => [k, p[k] ?? ""]));
  const log = [];
  let rows = await inv("list_persons");
  const branch = rows.filter((p) => p.name === ${JSON.stringify(BRANCH)});
  if (branch.length !== 1 || !branch[0].tree) return { error: "the branch is not there (run otras-lineas-arbol.mjs first)" };
  const p1828 = await inv("get_person", { id: 1828 });
  const p1848 = await inv("get_person", { id: 1848 });
  if (!p1828.name.startsWith("Śrī Jagannātha dās") || !p1848.name.startsWith("Madhusūdana dāsa")) return { error: "names do not match" };
  // the new record, in the branch
  let j = rows.filter((p) => p.name === ${JSON.stringify(NEW)});
  if (j.length > 1) return { error: "two records named " + ${JSON.stringify(NEW)} };
  let J = j[0]?.id;
  if (!J) { J = await inv("new_person", { fields: { ...Object.fromEntries(keys.map((k) => [k, ""])), ...plan.newFields } }); log.push("NEW " + J); }
  else log.push(J + " already there");
  rows = await inv("list_persons");
  if (!rows.find((p) => p.id === J).tree) {
    await inv("move_person", { id: J, place: { parent: branch[0].id, before: null } });
    await inv("set_tree_kind", { id: J, kind: "disciple" });
    log.push(J + ": put in the branch");
  }
  // 1828: guru and notes
  const f = fieldsOf(p1828);
  const nf = { ...f, guru: plan.guru1828, notes: f.notes.includes(plan.notesOld) ? f.notes.replace(plan.notesOld, plan.notesNew) : f.notes };
  if (!f.notes.includes(plan.notesOld) && !f.notes.includes(plan.notesNew)) log.push("1828: notes text not found, notes left as they were");
  if (JSON.stringify(nf) !== JSON.stringify(f)) { await inv("update_person", { id: 1828, fields: nf }); log.push("1828: guru/notes updated"); }
  else log.push("1828: fields same");
  const g = fieldsOf(p1848);
  if (g.disciples !== plan.disc1848) { await inv("update_person", { id: 1848, fields: { ...g, disciples: plan.disc1848 } }); log.push("1848: disciples updated"); }
  // 1828: the two extra lines
  rows = await inv("list_persons");
  const r = rows.find((p) => p.id === 1828);
  const now = (r.links || []).filter((l) => l.kind !== "family").map((l) => [l.guru, l.kind]);
  const want = [[1848, "vesa"], [J, "diksa"]].filter(([gg, k]) => !now.some(([a, b]) => a === gg && b === k));
  if (want.length) { await inv("set_links", { id: 1828, links: [...now, ...want] }); log.push("1828: + " + want.map((w) => w.join("/")).join(", ")); }
  else log.push("1828: lines already there");
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { console.log(JSON.stringify(JSON.parse(m.data).result?.result?.value, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
