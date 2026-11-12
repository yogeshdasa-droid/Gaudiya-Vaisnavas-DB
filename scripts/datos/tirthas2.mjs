// node tirthas2.mjs [puerto]   (12-11-2026, «los lugares», tanda 2): tīrthas for the map.
// Kuliyā also written «Kuliā»; Kāndrā's coordinates (Wikipedia, «Kandra, Bardhaman»); four new tīrthas whose
// place is well known: Ghāṭaśilā, Thāneśvara, Siddhavaṭa, Madurai (Dakṣiṇa-mathurā). A place keeps its people and
// texts. Twice = nothing (a new one is not made again if a place of that name exists).
const port = process.argv[2] ?? "9333";
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const plan = {
  update: [
    { id: 31, name: "Kuliyā", addAka: "Kuliā, Kulia" },
    { id: 99, name: "Kāndrā", lat: 23.7314, lon: 87.9695 },
  ],
  create: [
    { name: "Ghāṭaśilā", aka: "Ghatasila, Ghatshila", region: "Pūrba Siṅghbhūm, Jharkhand", about: "Home of Govinda dāsa, disciple of Rasikānanda.", source: "", lat: 22.585, lon: 86.48 },
    { name: "Thāneśvara", aka: "Thanesvara, Thanesar, Sthāṇvīśvara", region: "Kurukṣetra, Haryana", about: "", source: "", lat: 29.97, lon: 76.83 },
    { name: "Siddhavaṭa", aka: "Siddhavata, Siddhavatam, Sidhout", region: "Kaḍapa, Andhra Pradesh", about: "Lord Caitanya saw Rāma here on His journey to the South and met the brāhmaṇa who chanted only Rāma's name (Caitanya-caritāmṛta, Madhya 9).", source: "Caitanya-caritāmṛta, Madhya 9", lat: 14.47, lon: 78.97 },
    { name: "Dakṣiṇa-mathurā (Madurai)", aka: "Madurai, Madura, Dakṣiṇa-mathurā, South Mathurā", region: "Tamil Nadu", about: "Lord Caitanya ate here at the house of a brāhmaṇa devoted to Rāma (Caitanya-caritāmṛta, Madhya 9). Yāmunācārya was born here.", source: "Caitanya-caritāmṛta, Madhya 9", lat: 9.925, lon: 78.12 },
  ],
};
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const plan = ${JSON.stringify(plan)};
  const all = await inv("list_places");
  const log = [];
  const fieldsOf = (p) => ({ name: p.name, aka: p.aka, region: p.region, location: p.location, about: p.about, source: p.source, lat: p.lat, lon: p.lon, people: p.people });
  for (const u of plan.update) {
    const p = all.find((x) => x.id === u.id);
    if (!p || p.name !== u.name) { log.push(u.id + ": not «" + u.name + "»"); continue; }
    const f = fieldsOf(p);
    let changed = false;
    if (u.addAka && !f.aka.includes(u.addAka.split(",")[0])) { f.aka = f.aka ? f.aka + ", " + u.addAka : u.addAka; changed = true; }
    if (u.lat != null && f.lat == null) { f.lat = u.lat; f.lon = u.lon; changed = true; }
    if (!changed) continue;
    await inv("save_place", { id: u.id, fields: f });
    log.push("updated " + u.name);
  }
  for (const c of plan.create) {
    if (all.some((x) => x.name === c.name)) continue;
    const id = await inv("save_place", { id: null, fields: { ...c, location: "", people: [] } });
    log.push("new " + c.name + " #" + id);
  }
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const d = JSON.parse(m.data); console.log(JSON.stringify(d.result?.result?.value ?? d.result?.exceptionDetails ?? d, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
