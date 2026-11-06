// node otras-lineas-arbol.mjs <puerto>   (06-11-2026) — Whisper: in the tree nothing at the first level, everyone
// under someone, so that the tree goes up to Lord Kṛṣṇa (1889).
// 1) Those outside the tree whose guru IS in the tree go under him (checked in their records and texts):
//    disciples of Bhaktisiddhānta (124); Harirāma Ācārya under Rāmacandra Kavirāja; associates of Caitanya (164) and
//    Nityānanda (1851); Uddhava dāsa of Gadādhara's branch (CC Ādi 12.83); Kṛṣṇadāsa Bābājī of Govardhana took
//    lessons from Vaiṣṇava caraṇa dāsa, the compiler of the Padakalpataru (1592, his text 759) and his line follows.
// 2) The branch «Other Vaiṣṇava lines (guru not in the Paramparā)» (made by otras-lineas.json) under Lord Kṛṣṇa,
//    with the gurus whose own guru is not in the tree, and their disciples under them.
// Run otras-lineas.json (textoprincipal.mjs) first. Twice = nothing new.
const port = process.argv[2] || "9333";
const BRANCH = "Other Vaiṣṇava lines (guru not in the Paramparā)";
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.url.includes("localhost:1421") || p.url.includes("tauri.localhost"));
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
// [id, start of its name (to check), parent ("B" = the branch), kind]
const place = [
  [1839, "Akiñcana", 124, "diksa"],
  [123, "Bhakti Prasāda Purī", 124, "diksa"],
  [2004, "Harirāma Ācārya", 1244, "diksa"],
  [374, "Gopikanta", 2004, "diksa"],
  // Whisper: of the family of Harirāma Ācārya (son of Rāmanidhi), so under him; dīkṣā guru of Narahari and Ghanaśyāma
  [1051, "Nṛsiṁha Cakravartī", 2004, "disciple"],
  [977, "Narahari Cakravartī", 1051, "diksa"],
  [328, "Ghanaśyāma Cakravartī", 1051, "diksa"],
  [1309, "Ratnagarbha", 164, "associate"], // taught the Bhāgavatam to Jagannātha Miśra
  [1767, "Yadu Kavicandra", 1309, "diksa"],
  [1815, "Gadādhara dāsa Ṭhākura", 1851, "associate"],
  [1670, "Vidyananda", 1815, "diksa"],
  [1568, "Uddhava Dāsa", 274, "diksa"],
  [722, "Kesivallabha", 1568, "diksa"],
  [293, "Gaṅgadhara Bhaṭṭācārya", 164, "associate"], // the Lord named him Caitanya dāsa
  [233, "Durgā Dāsa Rāya", 293, "siksa"],
  [1354, "Sanātana Miśra", 164, "associate"], // the Lord's father-in-law
  [753, "Kṛṣṇadāsa Bābājī Mahārāj", 1592, "siksa"],
  [78, "Balarāma Dās", 753, "diksa"],
  [1852, "Pisima", 78, "diksa"],
  [97, "Bhagavān Dās Bābājī", 753, "diksa"],
  [1106, "Pranakrsna", 97, "diksa"],
  [1849, "Manohara dāsa Bābājī", 1106, "vesa"],
  // the new branch
  [1045, "Nityānanda Dāsa Bābājī", "B", "disciple"],
  [796, "Kṛṣṇaprasāda", 1045, "diksa"],
  [1861, "Rāmakṛṣṇa dāsa", 1045, "diksa"],
  [1848, "Madhusūdana dāsa Bābājī", "B", "disciple"], // mantra from an unknown mahānta of Gaṅgā-mātā's line
  [1168, "Radharamanacarana", "B", "disciple"], // his guru: one met on the bank of the Sarayu
  [1971, "Govinda dāsa Bābājī", 1168, "diksa"],
  [332, "Giridhārī", 1971, "vesa"],
  [1820, "Gauracharana", "B", "disciple"], // guru Siddha Caitanya dāsa Bābājī: no record
  [907, "Manohara dāsa (of Śrīnivāsa", "B", "disciple"], // guru Rāmaśaraṇa Caṭṭarāja: no record
  [1117, "Priyadasaji", 907, "diksa"],
  [1289, "Rāmānujācārya", "B", "disciple"], // the Śrī-sampradāya
  [1284, "Rāmānanda Svāmī", 1289, "vani"], // 21 generations after Rāmānuja (his record)
];
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const place = ${JSON.stringify(place)};
  const log = [];
  let rows = await inv("list_persons");
  const branch = rows.filter((p) => p.name === ${JSON.stringify(BRANCH)});
  if (branch.length !== 1) return { error: branch.length + " records named the branch (run otras-lineas.json first)" };
  const B = branch[0].id;
  const wrong = place.filter(([id, name]) => !(rows.find((p) => p.id === id)?.name ?? "").startsWith(name)).map(([id, name]) => id + " ≠ " + name);
  if (wrong.length) return { error: "names do not match", wrong };
  if (!branch[0].tree) {
    await inv("move_person", { id: B, place: { parent: 1889, before: null } });
    await inv("set_tree_kind", { id: B, kind: "associate" });
    log.push(B + " the branch: put under Lord Kṛṣṇa");
  } else log.push(B + " the branch: already in the tree");
  for (const [id, , p0, kind] of place) {
    const parent = p0 === "B" ? B : p0;
    rows = await inv("list_persons");
    const r = rows.find((p) => p.id === id);
    if (r.tree) { log.push(id + " " + r.name + ": already in the tree (under " + r.tree.parent + ")"); continue; }
    if (!rows.find((p) => p.id === parent)?.tree) { log.push(id + " " + r.name + ": its guru " + parent + " is not in the tree"); continue; }
    await inv("move_person", { id, place: { parent, before: null } });
    await inv("set_tree_kind", { id, kind });
    log.push(id + " " + r.name + ": under " + parent + " (" + kind + ")");
  }
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { console.log(JSON.stringify(JSON.parse(m.data).result?.result?.value, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
