// node otras-sampradayas.mjs [puerto]   (07-11-2026, Whisper: «une las 8 de otras sampradāyas»)
// A branch of the Guru Paramparā under Lord Kṛṣṇa #1889 for the ācāryas and saints of other sampradāyas who are not
// in the Gauḍīya line (as «Other Vaiṣṇava lines» #2027 is for gurus whose guru is not known): Yāmunācārya,
// Nimbārka, Viṣṇusvāmī, Śrīdhara Svāmī, Jñāneśvara, Nāmadeva, Tukārāma, and Śaṅkarācārya. The branch record is made
// once (found by its name); only records still outside the tree are placed. Twice = nothing.
const NAME = "Other sampradāyas (outside the Gauḍīya line)";
const NOTES = "Not a person: a branch of the Guru Paramparā (Whisper, 07-11-2026) for the ācāryas and saints of other sampradāyas and traditions who are named in the Gauḍīya books but are not of the Gauḍīya line — Yāmunācārya, Nimbārka, Viṣṇusvāmī, Śrīdhara Svāmī, the saints of Pandharpur (Jñāneśvara, Nāmadeva, Tukārāma) and Śaṅkarācārya — so that they stand in the tree under Lord Kṛṣṇa. Rāmānuja is in «Other Vaiṣṇava lines» and Madhva in the Gauḍīya line itself.";
const members = [1781, 1037, 1882, 1995, 1975, 1976, 1974, 1865];
const [, , port = "9333"] = process.argv;
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const keys = ["name", "aka", "appearance", "disappearance", "place", "guru", "disciples", "works", "notes", "tags"];
  const blank = Object.fromEntries(keys.map((k) => [k, ""]));
  const log = [];
  let rows = await inv("list_persons");
  let b = rows.filter((p) => p.name === ${JSON.stringify(NAME)});
  if (b.length > 1) return { error: "several branch records" };
  let id = b[0]?.id;
  if (!id) { id = await inv("new_person", { fields: { ...blank, name: ${JSON.stringify(NAME)}, notes: ${JSON.stringify(NOTES)} } }); log.push("NEW " + id); }
  rows = await inv("list_persons");
  if (!rows.find((p) => p.id === id).tree) {
    await inv("move_person", { id, place: { parent: 1889, before: null } });
    await inv("set_tree_kind", { id, kind: "associate" });
    log.push(id + " under 1889 (associate)");
  }
  for (const m of ${JSON.stringify(members)}) {
    const r = rows.find((p) => p.id === m);
    if (!r) { log.push(m + " missing"); continue; }
    if (r.tree) continue;
    await inv("move_person", { id: m, place: { parent: id, before: null } });
    await inv("set_tree_kind", { id: m, kind: "disciple" });
    log.push(m + " " + r.name + " → branch");
  }
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const d = JSON.parse(m.data); console.log(JSON.stringify(d.result?.result?.value ?? d.result?.exceptionDetails ?? d, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
