// node tirthas-plan.mjs <plan.json> [puerto]   (12-11-2026, tīrthas from the book «Śrī Navadvīpa-dhāma», Part 3)
// Plan: { create: [{ name, aka, region, location, about, source, lat, lon, people: [{ personId, role }] }],
//         update: [{ id, name, addAka?, lat?, lon?, people?: [{ personId, role }] }] }
// A new place is not made again if one of that name exists; an update only adds (aka, missing coordinates, people
// not yet listed) and keeps the place's texts and pictures. Roles: sripata, samadhi, birth, lived, other. Twice = nothing.
import fs from "node:fs";
const [, , file, port = "9333"] = process.argv;
const plan = JSON.parse(fs.readFileSync(file, "utf8"));
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const plan = ${JSON.stringify(plan)};
  const all = await inv("list_places");
  const log = [];
  const fieldsOf = (p) => ({ name: p.name, aka: p.aka, region: p.region, location: p.location, about: p.about, source: p.source, lat: p.lat, lon: p.lon, people: p.people });
  const addPeople = (have, add) => {
    const out = [...have];
    for (const x of add ?? []) if (!out.some((y) => y.personId === x.personId && y.role === x.role)) out.push(x);
    return out;
  };
  for (const u of plan.update ?? []) {
    const p = all.find((x) => x.id === u.id);
    if (!p || p.name !== u.name) { log.push(u.id + ": not «" + u.name + "»"); continue; }
    const f = fieldsOf(p);
    const before = JSON.stringify(f);
    if (u.addAka && !f.aka.includes(u.addAka.split(",")[0].trim())) f.aka = f.aka ? f.aka + ", " + u.addAka : u.addAka;
    if (u.lat != null && f.lat == null) { f.lat = u.lat; f.lon = u.lon; }
    f.people = addPeople(f.people, u.people);
    if (JSON.stringify(f) === before) continue;
    await inv("save_place", { id: u.id, fields: f });
    log.push("updated " + u.name);
  }
  for (const c of plan.create ?? []) {
    if (all.some((x) => x.name === c.name)) continue;
    const id = await inv("save_place", { id: null, fields: { location: "", source: "", lat: null, lon: null, people: [], ...c } });
    log.push("new " + c.name + " #" + id + " (" + (c.people ?? []).length + " people)");
  }
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const d = JSON.parse(m.data); console.log(JSON.stringify(d.result?.result?.value ?? d.result?.exceptionDetails ?? d, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
