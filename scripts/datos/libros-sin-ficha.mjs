// node libros-sin-ficha.mjs [puerto]   (05-11-2026, Whisper: «la base de datos con fichas; los libros, libros»)
// 1. «Life and Teachings of Śrī Rāmānujācārya»: its text goes to the record Rāmānujācārya (1289) with its
//    data, and its own record (1843) is taken away.
// 2. «Lives of the Saints» (1844) and «Vaiṣṇava Digdarsani» (1877): records taken away; the books stay in
//    the Library (Calibre), without a person.
// 3. «Tukurama, Jnaneshvara and Namadeva» (1875): three records, each with its part of the text; 1875 goes.
// A record is only taken away once its texts have been moved (delete_person keeps the texts anyway).
// A second run changes nothing.
const port = process.argv[2] ?? "9333";
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
  try {
    const inv = window.__TAURI_INTERNALS__.invoke;
    const NL = String.fromCharCode(10);
    const keys = ["name", "aka", "appearance", "disappearance", "place", "guru", "disciples", "works", "notes", "tags"];
    const blank = Object.fromEntries(keys.map((k) => [k, ""]));
    const log = [];
    const person = (id) => inv("get_person", { id }).catch(() => null);
    const docInfo = async (id) => (await inv("get_doc", { id })).doc;
    const full = async (id) => {
      const d = await docInfo(id);
      return (await inv("get_sections", { docId: id, from: 0, to: d.sections - 1 })).map((s) => (s.text.endsWith(NL) ? s.text : s.text + NL)).join("");
    };
    // a doc to another record (or to none), keeping title, date and collection
    const docTo = async (id, personId, title) => {
      const d = await docInfo(id);
      if ((d.personId ?? null) === personId && (!title || d.title === title)) return false;
      await inv("update_doc", { docId: id, meta: { title: title || d.title, date: d.date ?? "", collection: d.collection, personId } });
      return true;
    };
    const setFields = async (id, fields) => {
      const p = await person(id);
      const f = Object.fromEntries(keys.map((k) => [k, p[k] ?? ""]));
      const changed = Object.keys(fields).filter((k) => f[k] !== fields[k]);
      if (changed.length) await inv("update_person", { id, fields: { ...f, ...fields } });
      return changed;
    };
    const drop = async (id, name) => {
      const p = await person(id);
      if (!p) return log.push(id + " " + name + ": already taken away");
      if (p.name !== name) return log.push(id + ": name is «" + p.name + "», not touched");
      if (p.docs.length) return log.push(id + " " + name + ": still has texts, not taken away");
      await inv("delete_person", { id });
      log.push(id + " " + name + ": record taken away");
    };
    const byName = async (name, fields) => {
      const all = await inv("list_persons");
      const hit = all.filter((p) => p.name === name);
      if (hit.length) return hit[0].id;
      const id = await inv("new_person", { fields: { ...blank, ...fields, name } });
      log.push("NEW " + id + " " + name);
      return id;
    };

    // 1. Rāmānuja
    const ram = await person(1289);
    if (!ram || ram.name !== "Rāmānujācārya") return { error: "1289 is not Rāmānujācārya" };
    if (await docTo(1997, 1289)) log.push("doc 1997 (Life and Teachings…) → 1289 Rāmānujācārya");
    const rf = { place: ram.place || "Śrīperumbudūr" };
    const note = "Born in Śrīperumbudūr; educated by Yādavaprakāśa from the age of 8 to 16 (from «Life and Teachings of Śrī Rāmānujācārya»).";
    if (!(ram.notes || "").includes("Yādavaprakāśa")) rf.notes = ((ram.notes || "").trim() ? ram.notes.trim() + NL + NL : "") + note;
    const rc = await setFields(1289, rf);
    log.push("1289 Rāmānujācārya: fields " + (rc.length ? rc.join(", ") : "same"));
    await drop(1843, "Life and Teachings of Śrī Rāmānujācārya");

    // 2. the two books stay books
    if (await docTo(1998, null)) log.push("doc 1998 (Lives of the Saints): no record now, still in the Library");
    if (await docTo(2155, null)) log.push("doc 2155 (Vaiṣṇava Digdarsani): no record now, still in the Library");
    await drop(1844, "Lives of the Saints");
    await drop(1877, "Vaiṣṇava Digdarsani");

    // 3. the three saints of Pandharpur
    const tuk = await byName("Tukārāma", {
      aka: "Tukaram, Tukurama, Saint Tukārām",
      appearance: "17th century",
      place: "Maharashtra (Pandharpur)",
      guru: "Rāghava Caitanya Keśava Caitanya (in a dream)",
      works: "Abhaṅgas (about 4,500 verses)",
      notes: "The most famous of the saints of Maharashtra, a devotee of Lord Viṭhṭhala (Viṭhobā) of Pandharpur; his Abhaṅgas are sung in every village of Maharashtra. In his autobiography he says he was initiated in a dream by «Rāghava Caitanya Keśava Caitanya», whom Gauḍīya Vaiṣṇavas understand to be Śrī Caitanya Mahāprabhu. His saṅkīrtana parties are like those of the Gauḍīya Vaiṣṇavas (Caitanya-caritāmṛta Madhya 9.282, purport).",
    });
    const jna = await byName("Jñāneśvara", {
      aka: "Jnaneshvara, Jñānadeva, Jñāndev",
      appearance: "13th century",
      place: "Maharashtra",
      works: "Jñāneśvarī (the Bhagavad-gītā in Marathi)",
      notes: "A devotee of Lord Viṭhṭhala who lived in the 13th century. At sixteen he put the whole Bhagavad-gītā into simple Marathi (the Jñāneśvarī); he entered samādhi at twenty-one.",
    });
    const nam = await byName("Nāmadeva", {
      aka: "Namadeva, Nāmdev",
      place: "Maharashtra (Pandharpur)",
      notes: "A devotee of Lord Viṭhṭhala. As a boy, left in charge of his father's Deity, he begged the Lord to eat the offering — and Lord Viṭhṭhala took His hands off His hips and ate it.",
    });
    let t = await full(2149);
    const piece = async (start, end, to, title) => {
      t = await full(2149);
      const a = t.indexOf(start);
      if (a < 0) return log.push("«" + title + "»: already moved");
      const b = end ? t.indexOf(end, a) : t.length;
      if (b < 0) throw new Error("end not found for " + title);
      await inv("move_text", { docId: 2149, fragment: t.slice(a, b), toPerson: to, title });
      log.push("«" + title + "» (" + (b - a) + " letters) → " + to);
    };
    await piece("Another exalted spiritual leader among Lord Vitthala's devotees was Jnanesvara", "Also famous is the life of Saint Namadeva", jna, "Jñāneśvara");
    await piece("Also famous is the life of Saint Namadeva", "The Padma Purāṇa and the Skanda Purāṇa", nam, "Nāmadeva");
    if (await docTo(2149, tuk, "Tukārāma (and Lord Viṭhṭhala of Pandharpur)")) log.push("doc 2149 → " + tuk + " Tukārāma");
    await drop(1875, "Tukurama, Jnaneshvara and Namadeva");
    return log;
  } catch (e) { return { error: String(e) }; }
})()`);
console.log(JSON.stringify(out, null, 1));
ws.close();
