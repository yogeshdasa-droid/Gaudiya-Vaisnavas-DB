// node arreglos1.mjs [puerto]   (07-11-2026)
// 1. Hussain Khan #509: its text (doc 514) had eight «Haridāsa» entries of the dictionary glued after its own
//    paragraph. All of them have their own record (468, 1922, 469, 1983, 471, 1947, 473) except Haridāsa Laghu, who
//    gets one; the text keeps only Hussain (its earlier version is kept by save_section).
// 2. Yadunandana #1772 (Hemalatā's disciple, author of the Karṇānanda): the first part of doc 3061 is another
//    Yadunandana (Caitanya's branch, CC Ādi 10.119): his own record under Mahāprabhu.
// Names and texts checked first; twice = nothing new.
const port = process.argv[2] ?? "9333";
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const D = "07-11-2026";
const data = {
  laghu: { name: "Haridāsa Laghu", notes: `Haridāsa Laghu went with Rūpa Gosvāmī to the temple of Viṭhṭhaleśvara for the darśana of Gopāla (Caitanya-caritāmṛta Madhya 18.52). B. B. Majumdar says it is not known whether he had the darśana of Lord Caitanya. Taken out of the text of «Hussain Khan Saiyyad» #509, where it had been glued by mistake (${D}).` },
  dvijaLine: `The dictionary also says (B. B. Majumdar): Haridāsa Dvija belonged to the line of Lord Caitanya; his name is in the list of the devotees of Orissa (Vaiṣṇava-vandanā). (Taken out of the text of Hussain Khan #509, ${D}.)`,
  yadu: { name: "Yadunandana (Caitanya's branch, CC Ādi 10.119)", notes: `He belonged to the branch of Lord Caitanya (Caitanya-caritāmṛta Ādi 10.119). According to some scholars he married Vidyunmālā, the daughter of Kamalākara Pippalāi (Vaiṣṇava-ācāra-darpaṇa; see also «Vīrabhadra Gosvāmī»). Taken out of the record of Yadunandana dāsa #1772, Hemalatā's disciple (${D}).` },
  yadu1772: { name: "Yadunandana Dāsa (disciple of Hemalatā, author of the Karṇānanda)", guru: "Hemalatā Devī (daughter of Śrīnivāsa Ācārya)", place: "Mālihāṭī (Meleti), north of Kāṭoyā",
    works: "Karṇānanda; Bengali verse of the Vidagdha-mādhava, Govinda-līlāmṛta and Kṛṣṇa-karṇāmṛta; Kuñja-rasa-stava",
    notes: `A vaidya, the favourite disciple of Hemalatā, the daughter of Śrīnivāsa Ācārya; born in 1459 Śaka at Khālihāṭī. He wrote the Karṇānanda, a life of Śrīnivāsa Ācārya (Hemalatā gave it its name), and translated into Bengali verse the Vidagdha-mādhava, the Govinda-līlāmṛta and the Kṛṣṇa-karṇāmṛta.\n\nThe first part of his text was about another Yadunandana, of Lord Caitanya's branch (CC Ādi 10.119): now his own record (${D}).` },
};
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const data = ${JSON.stringify(data)};
  const keys = ["name", "aka", "appearance", "disappearance", "place", "guru", "disciples", "works", "notes", "tags"];
  const blank = Object.fromEntries(keys.map((k) => [k, ""]));
  const log = [];
  const text = async (docId) => {
    const d = await inv("get_doc", { id: docId });
    return inv("get_sections", { docId, from: 0, to: d.doc.sections - 1 });
  };
  const person = async (name, fields) => {
    const rows = await inv("list_persons");
    const hit = rows.filter((p) => p.name === name);
    if (hit.length > 1) throw new Error("several records named " + name);
    if (hit.length) return hit[0].id;
    const id = await inv("new_person", { fields: { ...blank, ...fields, name } });
    log.push("NEW " + id + " " + name);
    return id;
  };
  const update = async (id, f) => {
    const p = await inv("get_person", { id });
    const now = Object.fromEntries(keys.map((k) => [k, p[k] ?? ""]));
    const want = { ...now, ...f };
    const ch = keys.filter((k) => now[k] !== want[k]);
    if (ch.length) { await inv("update_person", { id, fields: want }); log.push(id + " " + want.name + ": " + ch.join(", ")); }
  };
  const place = async (id, parent, kind) => {
    const r = (await inv("list_persons")).find((p) => p.id === id);
    if (r.tree) return;
    await inv("move_person", { id, place: { parent, before: null } });
    await inv("set_tree_kind", { id, kind });
    log.push("placed " + id + " under " + parent + " (" + kind + ")");
  };
  // checks
  const h = await inv("get_person", { id: 509 }), y = await inv("get_person", { id: 1772 }), dv = await inv("get_person", { id: 1983 });
  if (h.name !== "Hussain Khan Saiyyad") return { error: "509 is " + h.name };
  if (y.name !== "Yadunandana" && y.name !== data.yadu1772.name) return { error: "1772 is " + y.name };
  if (!dv.name.startsWith("Haridāsa Ācārya")) return { error: "1983 is " + dv.name };
  // 1. Hussain
  const hs = await text(514);
  const t = hs.map((s) => s.text).join("\\n");
  const cut = t.indexOf("](<");
  if (cut > 0) {
    await person(data.laghu.name, { notes: data.laghu.notes });
    if (!(dv.notes || "").includes("Haridāsa Dvija belonged")) await update(1983, { notes: ((dv.notes || "").trim() + "\\n\\n" + data.dvijaLine).trim() });
    for (let n = hs.length - 1; n >= 1; n--) await inv("save_section", { docId: 514, ordinal: n, text: "" });
    await inv("save_section", { docId: 514, ordinal: 0, text: t.slice(0, cut).trim() + "\\n" });
    log.push("doc 514: only Hussain's paragraph left (" + (t.length - cut) + " letters of other entries taken out)");
  } else log.push("doc 514 already clean");
  // 2. Yadunandana
  const ys = await text(3061);
  if (ys[0] && ys[0].text.includes("1.10.119") && !ys[0].text.includes("Hemalat")) {
    const nid = await person(data.yadu.name, { notes: data.yadu.notes });
    await place(nid, 164, "associate");
    await inv("save_section", { docId: 3061, ordinal: 0, text: "" });
    log.push("doc 3061: first part (CC Ādi 10.119) taken out");
  } else log.push("doc 3061 already clean");
  await update(1772, data.yadu1772);
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { console.log(JSON.stringify(JSON.parse(m.data).result?.result?.value, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
