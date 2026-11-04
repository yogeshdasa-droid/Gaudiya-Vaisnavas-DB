// node lugares.mjs <lugares-N.json> [port]  → saves those places in the open app (CDP, port 9333 by default).
// By name: a place that already exists is updated, a new one is created. The people are
// [id, role] or ["exact name of the record", role]; they are checked first: if one of them
// does not exist, nothing is saved.
// Running it twice changes nothing the second time.
import fs from "node:fs";
const [, , file, port = "9333"] = process.argv;
const places = JSON.parse(fs.readFileSync(file, "utf8"));
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.url.includes("localhost:1421") || p.url.includes("tauri.localhost"));
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const run = (expr) =>
  new Promise((res) => {
    ws.onmessage = (m) => res(JSON.parse(m.data).result?.result?.value);
    ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
  });
const out = await run(`(async () => {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const places = ${JSON.stringify(places)};
  const all = await inv("list_persons");
  const persons = new Set(all.map((p) => p.id));
  for (const pl of places)
    pl.people = pl.people.map(([who, role]) => [typeof who === "string" ? (all.find((p) => p.name === who)?.id ?? who) : who, role]);
  const missing = places.flatMap((pl) => pl.people.filter(([id]) => !persons.has(id)).map(([id]) => pl.name + ": " + id));
  if (missing.length) return { error: "missing records", missing };
  const now = await inv("list_places");
  const log = [];
  for (const pl of places) {
    const fields = { ...pl, people: pl.people.map(([personId, role]) => ({ personId, role })) };
    const old = now.find((x) => x.name === pl.name);
    if (old) {
      const same = ["aka", "region", "location", "about", "source", "lat", "lon"].every((k) => (old[k] ?? null) === (fields[k] ?? null)) &&
        JSON.stringify(old.people.map((x) => x.personId + x.role).sort()) === JSON.stringify(fields.people.map((x) => x.personId + x.role).sort());
      if (same) { log.push("same: " + pl.name); continue; }
      await inv("save_place", { id: old.id, fields });
      log.push("updated: " + pl.name);
    } else {
      await inv("save_place", { id: null, fields });
      log.push("new: " + pl.name);
    }
  }
  return log;
})()`);
console.log(JSON.stringify(out, null, 1));
ws.close();
