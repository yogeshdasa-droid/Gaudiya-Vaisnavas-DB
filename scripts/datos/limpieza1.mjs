// node limpieza1.mjs <db> → limpieza1-unir.json (unir.mjs); then node limpieza1.mjs run [puerto]   (07-11-2026)
// Records with nothing (no notes, no texts) and empty texts:
// - repeated: 976 → 977 Narahari Cakravartī; 1955 Śrīnātha Paṇḍita → 1459 Śrīnātha Ācārya; 117 «Bhakta Kālidās» → 636
//   Kālidāsa (the great devotee who ate the Vaiṣṇavas' remnants, CC Antya 16).
// - 1887 Rādhāramaṇa Cakravartī gets a note (what the record of Viśvanātha says of him).
// - texts left empty today after their pieces moved (1275 of #1264, 3377 of #50): to the bin.
import fs from "node:fs";
const D = "07-11-2026";
if (process.argv[2] !== "run") {
  const { DatabaseSync } = await import("node:sqlite");
  const db = new DatabaseSync(process.argv[2], { readOnly: true });
  const get = (id) => db.prepare("select name, aka, notes from persons where id=?").get(id);
  const join = (into, from, aka, line) => {
    const p = get(into);
    const akas = [...new Set([...(p.aka || "").split(",").map((s) => s.trim()), ...aka].filter(Boolean))].join(", ");
    return { into, name: p.name, from: [{ id: from, name: get(from).name }], fields: { aka: akas, notes: ((p.notes || "").trim() + `\n\n${line} The record «${get(from).name}» #${from}, which had nothing but the name, was joined to this one (${D}).`).trim() } };
  };
  const plan = [
    join(977, 976, ["Narahari Cakravartī (Ghanaśyāma)"], ""),
    join(1459, 1955, ["Śrīnātha Paṇḍita"], "Also called Śrīnātha Paṇḍita."),
    join(636, 117, ["Bhakta Kālidāsa"], "Known as «Bhakta Kālidāsa»."),
  ];
  fs.writeFileSync(new URL("./limpieza1-unir.json", import.meta.url), JSON.stringify(plan, null, 1));
  console.log(plan.map((p) => p.into + " ← " + p.from[0].id).join(", "));
  process.exit(0);
}
const port = process.argv[3] ?? "9333";
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const note1887 = `Son and disciple of Kṛṣṇacaraṇa Cakravartī (the adopted son of Gaṅgānārāyaṇa Cakravartī, in Narottama Ṭhākura's line), of Saidābād; also called Śrī Rāma. He was the dīkṣā-guru of Viśvanātha Cakravartī, who names him in the Saṅkalpa-kalpadruma; Narahari Cakravartī gives the line in the Stavāmṛta-laharī: Gaurāṅga → Lokanātha → Narottama → Gaṅgānārāyaṇa → Kṛṣṇacaraṇa → Rādhāramaṇa → Viśvanātha (from the record of Viśvanātha Cakravartī, ${D}).`;
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const keys = ["name", "aka", "appearance", "disappearance", "place", "guru", "disciples", "works", "notes", "tags"];
  const log = [];
  const p = await inv("get_person", { id: 1887 });
  if (p.name !== "Rādhāramaṇa Cakravartī") return { error: "1887 is " + p.name };
  if (!(p.notes || "").trim()) {
    const now = Object.fromEntries(keys.map((k) => [k, p[k] ?? ""]));
    await inv("update_person", { id: 1887, fields: { ...now, notes: ${JSON.stringify(note1887)}, disciples: now.disciples || "Viśvanātha Cakravartī" } });
    log.push("1887: note");
  }
  for (const [docId, person] of [[1275, 1264], [3377, 50]]) {
    const d = await inv("get_doc", { id: docId }).catch(() => null);
    if (!d || d.doc.deleted) { log.push("doc " + docId + " already gone"); continue; }
    if (d.doc.personId !== person) return { error: "doc " + docId + " is not of " + person, log };
    const s = await inv("get_sections", { docId, from: 0, to: Math.max(0, d.doc.sections - 1) });
    if (s.some((x) => x.text.trim())) { log.push("doc " + docId + " not empty: left"); continue; }
    await inv("trash_doc", { docId });
    log.push("doc " + docId + " (empty) to the bin");
  }
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const d = JSON.parse(m.data); console.log(JSON.stringify(d.result?.result?.value ?? d.result?.exceptionDetails ?? d, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
