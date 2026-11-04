// node parampara-json.mjs [port] → the Guru Paramparā as in Whisper's file «gaudiya_sampradaya.json» (04-11-2026).
// Whisper: A, C, D do it; B as the file says; the twelve gopālas as associates. Family links are not done
// (the app has no such kind yet). Each record's name is checked first; running it twice changes nothing.
const port = process.argv[2] || "9333";
// P: place in the tree [id, name, guru, kind]; L: one more guru [id, guru, kind]; N: new record
const P = [
  // Madhva's line one after another (disputed: according to Baladeva)
  [1894, "Nṛhari Tīrtha", 1893, "diksa"], [1895, "Śrī Mādhava Tīrtha", 1894, "diksa"], [1896, "Śrī Akṣobhya Tīrtha", 1895, "diksa"],
  // disciples of Mādhavendra Purī
  [1295, "Rangapuri", 868, "diksa"], [1216, "Raghupati Upadhyaya", 868, "diksa"], [161, "Brahmananda Purī", 868, "diksa"],
  [1057, "Nṛsiṁha Tīrtha", 868, "diksa"],
  // Pañca-tattva and branches
  [1851, "Śrī Nityānanda", 1906, "diksa"],
  [1701, "Vīrabhadra Gosvāmī", 574, "diksa"],
  [1769, "Yadunandana Ācārya", 15, "diksa"], [514, "Isana Nāgara", 15, "diksa"],
  [1206, "Śrīla Raghunātha Dāsa Gosvāmī", 1769, "diksa"],
  [343, "Śrī Gopāla Bhaṭṭa Gosvāmī", 1095, "diksa"],
  [504, "Hridayacaitanya (Hiranyaka)", 325, "diksa"], [1535, "Śyāmānanda Paṇḍita", 504, "diksa"],
  [218, "Dhyanacandra Gosvāmī", 344, "diksa"],
  // associates of Mahāprabhu
  [1513, "Śrī Svarūpa Dāmodara Gosvāmī", 164, "associate"], [844, "Śrī Lokanātha Gosvāmī", 164, "associate"],
  [1381, "Sārvabhauma Bhaṭṭācārya", 164, "associate"], [950, "Murāri Gupta Ṭhākura", 164, "associate"],
  [931, "Mukunda Datta", 164, "associate"], [980, "Narahari Sarakāra Ṭhākura", 164, "associate"],
  // the twelve gopālas: associates of Nityānanda
  [6, "Abhirāma Ṭhākura", 1851, "associate"], [325, "Gaurī Dāsa Paṇḍit", 1851, "associate"], [657, "Kamalakara Pippalai", 1851, "associate"],
  [1567, "Uddhāraṇa Datta Ṭhākura", 1851, "associate"], [1129, "Puruṣottama Dāsa", 1851, "associate"],
  [1080, "Parameśvara Dāsa Ṭhākura", 1851, "associate"], [1814, "Dhananjaya", 1851, "associate"], [894, "Maheśa Paṇḍita", 1851, "associate"],
  [624, "Kāla-Kṛṣṇa", 1851, "associate"], [1496, "Sundarānanda Ṭhākura", 1851, "associate"],
  // the three ācāryas and after
  [497, "Hemalatā Devī", 1466, "diksa"], [1273, "Rāmakṛṣṇa Ācārya", 1010, "diksa"],
  [1723, "Śrīla Viśvanātha Cakravartī Ṭhākura", 1887, "diksa"],
  [1145, "Rādhādāmodara", 1908, "diksa"], [73, "Śrī Baladeva Vidyābhūṣaṇa", 1145, "diksa"],
  [1920, "Śrīla Bhagavat dāsa Bābājī", 1828, "diksa"],
  [125, "Śrīla Bhaktivedānta Svāmī Prabhupāda", 124, "diksa"],
];
const L = [
  [1851, 1370, "diksa"], // the tree had Saṅkarṣaṇa Purī as his dīkṣā guru: kept as another guru
  [475, 15, "associate"], [1202, 164, "siksa"], [343, 164, "siksa"],
  [1206, 1325, "siksa"], [1206, 1513, "siksa"], [759, 1325, "siksa"], [1466, 618, "siksa"],
  [1535, 618, "siksa"], [1723, 1010, "siksa"], [73, 1723, "siksa"], [1814, 164, "associate"],
  [1819, 1920, "vesa"], [128, 1696, "diksa"],
];
const N = [
  { name: "Kṛṣṇānanda Purī", guru: 868, kind: "diksa", notes: "Disciple of Śrī Mādhavendra Purī." },
  { name: "Sukhānanda Purī", guru: 868, kind: "diksa", notes: "Disciple of Śrī Mādhavendra Purī." },
  { name: "Govinda dāsa Kavirāja", guru: 1466, kind: "diksa", notes: "Poet; disciple of Śrīnivāsa Ācārya. (The record «Govinda» mixes several Govindas, this one among them.)" },
];
// notes for the disputed links and a few others [id, text]
const D = "Paramparā (Gauḍīya Sampradāya chart, 04-11-2026): ";
const BAL = "succession according to Baladeva; the link with Madhva is disputed by historians.";
const NOTE = [
  ...[1893, 1894, 1895, 1896, 1897, 1898, 1899, 1900, 1901, 1902, 1903, 1904, 1905, 1906, 868].map((id) => [id, D + "dīkṣā line from Madhva — " + BAL]),
  [713, D + "dīkṣā from Mādhavendra Purī, according to tradition."],
  [1851, D + "dīkṣā from Lakṣmīpati Tīrtha according to the Gauḍīya Maṭha (disputed); other sources: Mādhavendra Purī. The tree had Saṅkarṣaṇa Purī (dīkṣā) and Lakṣmīpati Tīrtha (sannyāsa)."],
  [475, D + "associate of Advaita Ācārya (disputed): he lived with Advaita; the old sources give no formal initiation."],
  [1145, D + "disciple in the line of Rasikānanda (disputed: there are intermediate generations — his guru was Nayanānanda, Rasikānanda's grandson)."],
  [1828, D + "śikṣā line from Baladeva Vidyābhūṣaṇa according to the Gauḍīya Maṭha (disputed: generations are skipped)."],
  [1701, D + "son of Śrī Nityānanda; dīkṣā from Jāhnavā Devī."],
  [1496, D + "placed as one of the twelve gopālas of Nityānanda. NOTE: this record mixes two people — the gopāla Sundarānanda and Sundarānanda Ṭhākura, son and disciple of Gatigovinda (guru field)."],
];
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const P = ${JSON.stringify(P)}, L = ${JSON.stringify(L)}, N = ${JSON.stringify(N)}, NOTE = ${JSON.stringify(NOTE)};
  const keys = ["name","aka","appearance","disappearance","place","guru","disciples","works","notes","tags"];
  const all = (p) => Object.fromEntries(keys.map((k) => [k, p[k] ?? ""]));
  let ps = await inv("list_persons");
  const byId = () => new Map(ps.map((p) => [p.id, p]));
  let m = byId();
  const wrong = P.filter(([id, name]) => m.get(id)?.name !== name).map(([id, name]) => id + " " + name + " ≠ " + m.get(id)?.name);
  if (wrong.length) return { error: "names", wrong };
  const log = [];
  // new records (only if no record has that name yet)
  for (const n of N) {
    let p = ps.find((x) => x.name === n.name);
    if (!p) {
      const id = await inv("new_person", { fields: { name: n.name, aka: "", appearance: "", disappearance: "", place: "", guru: "", disciples: "", works: "", notes: n.notes, tags: "" } });
      log.push("new " + id + " " + n.name);
      P.push([id, n.name, n.guru, n.kind]);
    } else P.push([p.id, n.name, n.guru, n.kind]);
  }
  ps = await inv("list_persons"); m = byId();
  // places in the tree
  for (const [id, name, guru, kind] of P) {
    const t = m.get(id).tree;
    if (!t || t.parent !== guru) { await inv("move_person", { id, place: { parent: guru, before: null } }); log.push("place " + id + " " + name + " → " + guru); }
    if (!t || t.parent !== guru || t.kind !== kind) { await inv("set_tree_kind", { id, kind }); if (t && t.parent === guru) log.push("kind " + id + " " + name + ": " + t.kind + " → " + kind); }
  }
  ps = await inv("list_persons"); m = byId();
  // more gurus (kept: the ones it had)
  const want = new Map();
  for (const [id, guru, kind] of L) { if (!want.has(id)) want.set(id, []); want.get(id).push([guru, kind]); }
  for (const [id, adds] of want) {
    const p = m.get(id);
    const cur = p.links.map((l) => [l.guru, l.kind]);
    const next = [...cur];
    for (const [g, k] of adds) { const i = next.findIndex((x) => x[0] === g); if (i >= 0) next[i] = [g, k]; else next.push([g, k]); }
    const clean = next.filter(([g]) => g !== p.tree?.parent);
    const same = JSON.stringify([...clean].sort()) === JSON.stringify([...cur].filter(([g]) => g !== p.tree?.parent).sort());
    if (!same) { await inv("set_links", { id, links: clean }); log.push("links " + id + " " + p.name + ": " + JSON.stringify(clean)); }
  }
  // notes
  for (const [id, text] of NOTE) {
    const p = await inv("get_person", { id });
    if (!(p.notes || "").includes(text)) { await inv("update_person", { id, fields: { ...all(p), notes: ((p.notes || "").trim() ? p.notes.trim() + "\\n\\n" : "") + text } }); log.push("note " + id + " " + p.name); }
  }
  // Rāmakṛṣṇa Ācārya: «Narottama» was his guru, not his disciple
  const rk = await inv("get_person", { id: 1273 });
  if (rk.disciples === "Narottama Ṭhākura") { await inv("update_person", { id: 1273, fields: { ...all(rk), disciples: "", guru: rk.guru || "Narottama dāsa Ṭhākura (dīkṣā)" } }); log.push("1273 guru/disciples fixed"); }
  return log.length ? log : ["nothing to change"];
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (msg) => { console.log(JSON.stringify(JSON.parse(msg.data).result?.result?.value, null, 1)); ws.close(); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
