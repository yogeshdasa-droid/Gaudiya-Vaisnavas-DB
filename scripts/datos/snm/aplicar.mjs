// Común a las tandas de las conferencias de SNM (snm/fichasN.mjs): aplicar(F)
// F = [{ id, name (comprobación), text, notes?: «frase que se añade a las notas», set?: { campo: valor nuevo } }]
// Añade a la ficha el texto «In the lectures of Śrīla Bhaktivedānta Nārāyaṇa Gosvāmī Mahārāja — <nombre>» (colección
// «Lectures of Śrīla Nārāyaṇa Gosvāmī Mahārāja»), añade `notes` al final de las notas si aún no están, y cambia los campos
// de `set` (Whisper, 16-11-2026: las conferencias son 100% fiables — «corregirlo directamente»). 2.ª pasada = nada.
export const COLL = "Lectures of Śrīla Nārāyaṇa Gosvāmī Mahārāja";
export const SRC = "Lectures of Śrīla Bhaktivedānta Nārāyaṇa Gosvāmī Mahārāja (Info collection; in «Libros» as «Lectures of Śrīla Bhaktivedānta Nārāyaṇa Gosvāmī Mahārāja — <year>»)";
export async function aplicar(F) {
  const args = process.argv.slice(2);
  const dry = args.includes("--dry");
  const port = args.find((a) => a !== "--dry") || "9334";
  const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  const ws = new WebSocket((list.find((p) => p.type === "page" && /tauri.localhost|localhost:1421/.test(p.url)) ?? list.find((p) => p.type === "page")).webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const F = ${JSON.stringify(F)};
  const dry = ${dry};
  const COLL = ${JSON.stringify(COLL)};
  const keys = ["name", "aka", "appearance", "disappearance", "place", "guru", "disciples", "works", "notes", "tags"];
  const log = [];
  for (const g of F) {
    const p = await inv("get_person", { id: g.id });
    if (!p || p.name !== g.name) { log.push("¡NO coincide! #" + g.id + " es «" + (p && p.name) + "», no «" + g.name + "»"); continue; }
    const title = "In the lectures of Śrīla Bhaktivedānta Nārāyaṇa Gosvāmī Mahārāja — " + g.name;
    if (!p.docs.some((d) => d.title === title)) {
      if (!dry) { const doc = await inv("create_doc", { personId: g.id, title, collection: COLL }); await inv("save_section", { docId: doc, ordinal: 0, text: g.text }); }
      log.push("texto: #" + g.id + " " + g.name);
    }
    const f = Object.fromEntries(keys.map((k) => [k, p[k] ?? ""]));
    const ch = [];
    if (g.notes && !f.notes.includes(g.notes.slice(0, 60))) { f.notes = (f.notes ? f.notes.trim() + " " : "") + g.notes; ch.push("notes+"); }
    for (const [k, v] of Object.entries(g.set || {})) if (f[k] !== v) { ch.push(k + ": «" + String(f[k]).slice(0, 60) + "» → «" + String(v).slice(0, 60) + "»"); f[k] = v; }
    if (ch.length) { if (!dry) await inv("update_person", { id: g.id, fields: f }); log.push("campos #" + g.id + ": " + ch.join("; ")); }
  }
  return log;
} catch (e) { return "ERROR " + e; } })()`;
  ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
  await new Promise((resolve) => { ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id !== 1) return; console.log(JSON.stringify(d.result?.result?.value ?? d.result, null, 1)); ws.close(); resolve(); }; });
}
