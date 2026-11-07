// node tanda3-poetas.mjs [puerto]   (07-11-2026, asked by Whisper)
// The poets who name a guru (withGuru of poetas-plan.mjs), checked by hand:
// A. under the guru their text names; B. a wrong «guru» field emptied (Rasikānanda / Gopīnātha Ācārya were not
// their gurus); C. the label «Poetas». Names checked first; twice = nothing new.
const port = process.argv[2] ?? "9333";
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const plan = {
  // [id, name, parent, kind]
  place: [
    [466, "Haricarana Dāsa", 14, "diksa"],
    [1046, "Nityānanda Dāsa", 574, "diksa"],
    [1122, "Purandara Dāsa", 1905, "diksa"],
    [942, "Mukunda", 1851, "disciple"],
    [451, "Hari Bhaṭṭa", 164, "associate"],
  ],
  // [id, name, field values]
  fields: [
    [466, "Haricarana Dāsa", { guru: "Acyutānanda (son of Advaita Prabhu)" }],
    [1046, "Nityānanda Dāsa", { guru: "Jāhnavā Mātā (dīkṣā)" }],
    [1122, "Purandara Dāsa", { guru: "Vyāsatīrtha (Vyāsarāya), dīkṣā" }],
    [942, "Mukunda", { guru: "" }],
    [451, "Hari Bhaṭṭa", { guru: "" }],
    [74, "Balai Dās", { guru: "" }],
    [867, "Mādhava", { guru: "" }],
  ],
  poets: [[74, "Balai Dās"], [598, "Jayadeva"], [1232, "Rāma Rāya"], [1162, "Rādhāmukunda Dāsa"]],
};
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const plan = ${JSON.stringify(plan)};
  const keys = ["name", "aka", "appearance", "disappearance", "place", "guru", "disciples", "works", "notes", "tags"];
  let rows = await inv("list_persons");
  const row = (id) => rows.find((p) => p.id === id);
  const wrong = [];
  for (const [id, name] of [...plan.place, ...plan.fields, ...plan.poets]) if (row(id)?.name.trim() !== name.trim()) wrong.push(id + " " + name + " ≠ " + (row(id)?.name ?? "(none)"));
  for (const [, , parent] of plan.place) if (!row(parent)?.tree) wrong.push("guru " + parent + " not in the tree");
  if (wrong.length) return { error: "check", wrong };
  const log = [];
  for (const [id, name, f] of plan.fields) {
    const p = await inv("get_person", { id });
    const now = Object.fromEntries(keys.map((k) => [k, p[k] ?? ""]));
    const want = { ...now, ...f };
    const changed = keys.filter((k) => now[k] !== want[k]);
    if (changed.length) { await inv("update_person", { id, fields: want }); log.push(id + " " + name + ": " + changed.join(", ") + " «" + now.guru + "» → «" + want.guru + "»"); }
  }
  for (const [id, name, parent, kind] of plan.place) {
    if (row(id).tree) continue;
    await inv("move_person", { id, place: { parent, before: null } });
    await inv("set_tree_kind", { id, kind });
    log.push("placed " + id + " " + name + " under " + parent + " (" + kind + ")");
  }
  rows = await inv("list_persons");
  const poet = (p) => p.tags.split(",").some((x) => x.trim().toLowerCase() === "poetas");
  const todo = plan.poets.map(([id]) => id).filter((id) => !row(id).tree && !poet(row(id)));
  if (todo.length) { await inv("set_tag", { ids: todo, tag: "Poetas", on: true }); log.push("Poetas: " + todo.join(", ")); }
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { console.log(JSON.stringify(JSON.parse(m.data).result?.result?.value, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
