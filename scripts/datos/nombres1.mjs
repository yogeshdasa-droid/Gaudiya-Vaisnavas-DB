// node nombres1.mjs [puerto]   (07-11-2026)
// Names that lost their «/» on import and came out glued («Mukunda SarkaraDasa», «Tulasī MisraPadicha»…): a clean
// name, and the other form in «aka» so the search still finds it. The record keeps its earlier version.
// Checked by the old name; twice = nothing.
const port = process.argv[2] ?? "9333";
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
// [id, old name, new name, other forms for aka]
const plan = [
  [862, "Mādhava GunakaraKavindra", "Mādhava Guṇākara (Kavīndra)", ["Mādhava Kavīndra", "Mādhava Guṇākara"]],
  [939, "Mukunda SarkaraDasa", "Mukunda Sarakāra (Mukunda dāsa)", ["Mukunda dāsa", "Mukunda Sarakāra"]],
  [1060, "Nṛsiṁhananda BrahmacariBharati", "Nṛsiṁhānanda Brahmacārī (Bhāratī)", ["Nṛsiṁhānanda Bhāratī", "Nṛsiṁhānanda Brahmacārī"]],
  [1293, "RamiRamamani", "Rāmī (Rāmamaṇi)", ["Rāmamaṇi", "Rāmī"]],
  [1342, "Sadāśiva KavirajaVaidya", "Sadāśiva Kavirāja", ["Sadāśiva Vaidya"]],
  [1459, "Srinatha CakravartiAcarya", "Śrīnātha Cakravartī (Ācārya)", ["Śrīnātha Ācārya", "Śrīnātha Cakravartī"]],
  [1508, "Svapnesvara VipraDvija", "Svapneśvara Vipra (Dvija)", ["Svapneśvara Dvija", "Svapneśvara Vipra"]],
  [1512, "Svarūpa CakravartiSvarupa Gosvāmī", "Svarūpa Cakravartī (Svarūpa Gosvāmī)", ["Svarūpa Gosvāmī", "Svarūpa Cakravartī"]],
  [1563, "Tulasī MisraPadicha", "Tulasī Miśra (Paḍichā)", ["Tulasī Paḍichā", "Tulasī Miśra Paḍichā"]],
  [1627, "Vanamālī DasaKaviraja", "Vanamālī dāsa (Kavirāja)", ["Vanamālī Kavirāja", "Vanamālī dāsa"]],
  [1630, "Vanamālī VipraPandit", "Vanamālī Vipra (Paṇḍita)", ["Vanamālī Paṇḍita", "Vanamālī Vipra"]],
  [1666, "Vetala BhattaVetala Siṁha", "Vetāla Bhaṭṭa (Vetāla Siṁha)", ["Vetāla Siṁha", "Vetāla Bhaṭṭa"]],
  [1728, "Visvesvara AcaryaVisvesvarananda Ācārya", "Viśveśvara Ācārya (Viśveśvarānanda Ācārya)", ["Viśveśvarānanda Ācārya", "Viśveśvara Ācārya"]],
  [1729, "VitthalanathaVitthalesvara", "Viṭhṭhalanātha (Viṭhṭhaleśvara)", ["Viṭhṭhaleśvara", "Viṭhṭhalanātha"]],
  [1773, "YadunandanaYadunandacarya", "Yadunandana (Yadunandanācārya)", ["Yadunandanācārya"]],
  [1782, "YĀMUNĀCĀRYAS StotraRatna", "Yāmunācārya's Stotra-ratna", ["Stotra-ratna"]],
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
