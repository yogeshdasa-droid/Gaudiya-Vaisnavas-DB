// Común a las tandas de fichas del Bhāgavatam (fichas2.mjs en adelante; fichas1.mjs lleva su propia copia).
// aplicar(F, DISTINCT): F = [[nombre, otros nombres, lugar, notas, texto, claves de Vaṁśa], …];
// DISTINCT = [[nombre, id de otra ficha, comienzo de su nombre], …] («no son la misma persona»).
// Crea solo lo que falta (2.ª pasada = nada) y escribe en src/data/vamsa-records.json qué ficha es qué nombre de «Vaṁśa».
// Uso desde la tanda: node fichasN.mjs [puerto] [--dry]
import fs from "node:fs";

export const TAG = "Bhāgavata-maṇḍala";
export const COLL = "Śrīmad-Bhāgavatam";
export const SRC = "*Śrīmad-Bhāgavatam*, with the translation and purports of His Divine Grace A. C. Bhaktivedanta Svāmī Prabhupāda (the twelve cantos are in «Libros»).";
export const SEE = (v) =>
  v ? `See the text «In the Śrīmad-Bhāgavatam» of this record; in «Vaṁśa», ${v}.` : "See the text «In the Śrīmad-Bhāgavatam» of this record.";

export async function aplicar(F, DISTINCT = []) {
  const args = process.argv.slice(2);
  const dry = args.includes("--dry");
  const port = args.find((a) => a !== "--dry") || "9334";
  const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const F = ${JSON.stringify(F)};
  const DISTINCT = ${JSON.stringify(DISTINCT)};
  const dry = ${dry};
  const TAG = ${JSON.stringify(TAG)}, COLL = ${JSON.stringify(COLL)};
  const log = [];
  const ids = {};
  const keys = ["name", "aka", "appearance", "disappearance", "place", "guru", "disciples", "works", "notes", "tags"];
  const all = await inv("list_persons");
  for (const [name, aka, place, notes, text] of F) {
    let id = all.find((p) => p.name === name)?.id;
    if (!id) {
      if (dry) { log.push("nueva: " + name); continue; }
      const f = Object.fromEntries(keys.map((k) => [k, ""]));
      Object.assign(f, { name, aka, place, notes, tags: TAG });
      id = await inv("new_person", { fields: f });
      log.push("NUEVA #" + id + " " + name);
    }
    ids[name] = id;
    const p = await inv("get_person", { id });
    const title = "In the Śrīmad-Bhāgavatam — " + name;
    if (!p.docs.some((d) => d.title === title)) {
      if (!dry) { const doc = await inv("create_doc", { personId: id, title, collection: COLL }); await inv("save_section", { docId: doc, ordinal: 0, text }); }
      log.push("texto: " + name);
    }
  }
  const done = new Set((await inv("list_distinct")).map(([a, b]) => a + "-" + b));
  for (const [name, other, otherName] of DISTINCT) {
    const id = ids[name];
    const o = all.find((p) => p.id === other);
    if (!id || !o || !o.name.startsWith(otherName)) { if (!dry || !o) log.push("¿distintas? no encontrada: " + name + " / #" + other); continue; }
    if (done.has(id + "-" + other) || done.has(other + "-" + id)) continue;
    if (!dry) await inv("mark_distinct", { ids: [id, other] });
    log.push("distintas: " + name + " ≠ #" + other + " " + o.name);
  }
  return { log, ids };
} catch (e) { return "ERROR " + e; } })()`;
  ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
  await new Promise((resolve) => {
    ws.onmessage = (m) => {
      const d = JSON.parse(m.data);
      if (d.id !== 1) return;
      const v = d.result?.result?.value ?? d.result;
      console.log(JSON.stringify(v.log ?? v, null, 1));
      if (!dry && v.ids) {
        const file = new URL("../../../src/data/vamsa-records.json", import.meta.url);
        const map = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
        for (const [name, , , , , vkeys] of F) if (v.ids[name]) for (const k of vkeys) map[k] = v.ids[name];
        fs.writeFileSync(file, JSON.stringify(map, null, 1));
        console.log("vamsa-records.json:", Object.keys(map).length, "nombres");
      }
      ws.close();
      resolve();
    };
  });
}
