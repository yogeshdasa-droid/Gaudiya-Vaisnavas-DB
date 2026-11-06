// node rol.mjs <puerto> <lugar> <ficha> <rol>  → the link of that record to that tīrtha gets this role
// (sripata, samadhi, birth, lived, other). Running it twice changes nothing.
const [, , port, place, person, role] = process.argv;
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.url.includes("localhost:1421") || p.url.includes("tauri.localhost"));
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
ws.onmessage = (m) => {
  const r = JSON.parse(m.data).result;
  console.log(r?.exceptionDetails ? "ERROR " + r.exceptionDetails.exception?.description : JSON.stringify(r?.result?.value));
  ws.close();
};
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { awaitPromise: true, returnByValue: true, expression: `(async () => {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const pl = (await inv("list_places")).find((p) => p.id === ${Number(place)});
  if (!pl) return "no place ${place}";
  const { id, modified, hasPhoto, ...fields } = pl;
  const link = fields.people.find((x) => x.personId === ${Number(person)});
  if (link && link.role === "${role}") return fields.name + ": already ${role}";
  if (link) link.role = "${role}"; else fields.people.push({ personId: ${Number(person)}, role: "${role}" });
  await inv("save_place", { id, fields });
  return fields.name + ": ${person} → ${role}";
})()` } }));
