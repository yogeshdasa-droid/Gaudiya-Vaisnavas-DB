// node fotos-mas.mjs <plan.json> [puerto]   (12-11-2026, more pictures of the tīrthas from a book)
// Plan: [{ id, name, imgs, hasPhoto, photo, images: [paths], credit }] — like fotos-poner.mjs, but also for places that
// already have pictures of that book: «imgs» / «hasPhoto» = what the place had when the plan was made; if it has
// something else now, the place is skipped (so a second run adds nothing). The main picture only if it has none;
// the credit is added to «source» only if it is not there yet.
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
  for (const g of plan) {
    const p = all.find((x) => x.id === g.id);
    if (!p || p.name !== g.name) { log.push(g.id + ": not «" + g.name + "»"); continue; }
    if (p.images.length !== g.imgs || p.hasPhoto !== g.hasPhoto) { log.push(g.name + ": skipped (already done?)"); continue; }
    let n = 0;
    const images = [...g.images];
    if (!p.hasPhoto) { await inv("set_place_photo", { id: g.id, path: g.photo }); n++; }
    else images.unshift(g.photo);
    if (images.length) n += await inv("add_place_images", { id: g.id, paths: images });
    if (!(p.source ?? "").includes(g.credit.slice(0, 40))) {
      const f = { name: p.name, aka: p.aka, region: p.region, location: p.location, about: p.about, lat: p.lat, lon: p.lon, people: p.people,
        source: p.source ? p.source.replace(/[.\\s]*$/, ".") + " " + g.credit : g.credit };
      await inv("save_place", { id: g.id, fields: f });
    }
    log.push(g.name + ": " + n);
  }
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const d = JSON.parse(m.data); console.log(JSON.stringify(d.result?.result?.value ?? d.result?.exceptionDetails ?? d, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
