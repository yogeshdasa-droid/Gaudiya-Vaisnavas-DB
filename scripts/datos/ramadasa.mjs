// node ramadasa.mjs [port]  (04-11-2026, decided by Whisper)
// 1264 «Rāmadāsa» mixed ten dictionary entries of different Rāmadāsas. It keeps the disciple of
// Bhūgarbha Gosvāmī (where it is in the Guru Paramparā); the others get records of their own,
// each with its piece of text:
//   - Rāmadāsa (disciple of Śrīnivāsa, Viṣṇupura)  ← Karṇānanda 1 + son of Ballabhi Kavipati
//   - Rāmadāsa (son of Śivānanda Sen)
//   - Rāmadāsa (Kuraṅgākṣī)
//   - Rāmadāsa (disciple of Rasikānanda, Janhagram) ← with the three Rasika-maṅgala entries
//   - «belonged to the sakhā of Lord Caitanya, see Abhirāma» → Abhirāma Ṭhākura (6), aka Rāmadāsa
// Also 1740 Vṛndāvana dāsa Ṭhākura: place Māmagāchi + the Abhidhāna's Nati in the notes.
// Running it twice changes nothing the second time.
const port = process.argv[2] ?? "9333";
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.url.includes("localhost:1421") || p.url.includes("tauri.localhost"));
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = String.raw`(async () => {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const NL = String.fromCharCode(10);
  const out = [];
  const F = (p) => ({ name: p.name, aka: p.aka, appearance: p.appearance, disappearance: p.disappearance, place: p.place, guru: p.guru, disciples: p.disciples, works: p.works, notes: p.notes, tags: p.tags });
  const blank = { name: "", aka: "", appearance: "", disappearance: "", place: "", guru: "", disciples: "", works: "", notes: "", tags: "" };
  const upd = async (id, fn) => {
    const p = await inv("get_person", { id });
    const f = F(p);
    const b = JSON.stringify(f);
    fn(f);
    if (JSON.stringify(f) !== b) { await inv("update_person", { id, fields: f }); out.push("OK " + id + " " + f.name); }
  };
  const addNote = (f, line) => { if (!f.notes.includes(line)) f.notes = (f.notes.trim() ? f.notes.trim() + NL + NL : "") + line; };
  const byName = async (name) => (await inv("list_persons")).find((p) => p.name === name)?.id ?? null;
  const mk = async (name, o) => {
    const old = await byName(name);
    if (old) return old;
    const id = await inv("new_person", { fields: { ...blank, ...o, name } });
    out.push("NEW " + id + " " + name);
    return id;
  };
  const full = async (d) => (await inv("get_sections", { docId: d, from: 0, to: 100000 })).map((s) => (s.text.endsWith(NL) ? s.text : s.text + NL)).join("");

  const me = await inv("get_person", { id: 1264 });
  if (me.name !== "Rāmadāsa") return { error: "1264 is " + me.name };
  const doc = me.docs.find((d) => d.title === "Rāmadāsa");
  // the entries of the text: each from its heading to the next one
  const pieces = async () => {
    if (!doc) return [];
    const t = await full(doc.id);
    const at = [];
    let i = -1;
    while ((i = t.indexOf("## RĀMADĀSA", i + 1)) >= 0) at.push(i);
    return at.map((s, k) => t.slice(s, k + 1 < at.length ? at[k + 1] : t.length));
  };
  const move = async (test, to, title) => {
    for (const piece of (await pieces()).filter(test)) {
      await inv("move_text", { docId: doc.id, fragment: piece, toPerson: to, title });
      out.push("TEXT → " + to + ": " + piece.replace(/\s+/g, " ").slice(13, 70));
    }
  };
  const SR = "Śrīnivāsa Ācārya";
  const RK = "Rasikānanda Prabhu";

  const sri = await mk("Rāmadāsa (disciple of Śrīnivāsa, Viṣṇupura)", {
    guru: SR,
    place: "Vanaviṣṇupura",
    notes: "He was a disciple of Śrīnivāsa Ācārya (Karṇānanda 1), the son of Ballabhi Kavipati, and a resident of Vanaviṣṇupura." + NL + NL + "Father: Ballabhi Kavipati. The Gauḍīya Vaiṣṇava Abhidhāna (Tīrthas, «Viṣṇupura») lists his śrīpāṭa at Viṣṇupura, with his father's (Vallavī Kavipati).",
  });
  await move((p) => /disciple of Śrīnivāsa Ācārya/.test(p), sri, "Rāmadāsa");

  const siv = await mk("Rāmadāsa (son of Śivānanda Sen)", {
    notes: "He was the second son of Śivānanda Sen. In his past incarnation he was Vicakṣaṇa Śuka. (Gaura-gaṇoddeśa-dīpikā 145)" + NL + NL + "Father: Śivānanda Sen.",
  });
  await move((p) => /son of Śivānanda Sen/.test(p), siv, "Rāmadāsa");

  const kur = await mk("Rāmadāsa (Kuraṅgākṣī)", {
    notes: "In Vraja-līlā he was Kuraṅgākṣī. (Gaura-gaṇoddeśa-dīpikā 197, 207)",
  });
  await move((p) => /Kurangaksi/.test(p), kur, "Rāmadāsa");

  const ras = await mk("Rāmadāsa (disciple of Rasikānanda, Janhagram)", {
    guru: RK,
    place: "Janhagram",
    notes: "He was a disciple of Rasikānanda Prabhu and a resident of Janhagram. Wife: Draupadī. Son: Dīnaśyāma dāsa." + NL + NL + "The Rasika-maṅgala also names a Rāmadāsa, disciple of Rasikānanda, at Paścima 14.142, 14.159 and 14.160 (separate entries in the source): perhaps the same person, perhaps others.",
  });
  await move((p) => /disciple of Rasikānanda/.test(p), ras, "Rāmadāsa");

  // the old name of Abhirāma Ṭhākura
  const ab = await inv("get_person", { id: 6 });
  if (ab.name !== "Abhirāma Ṭhākura") return { error: "6 is " + ab.name, out };
  await move((p) => /sakhā of Lord Caitanya/.test(p) && /Abhirāma/.test(p), 6, "Rāmadāsa (Abhirāma)");
  await upd(6, (f) => { if (!/(^|,\s*)Rāmadāsa(\s*,|$)/.test(f.aka)) f.aka = (f.aka.trim() ? f.aka.trim() + ", " : "") + "Rāmadāsa"; });

  // what stays in 1264: the disciple of Bhūgarbha
  await upd(1264, (f) => {
    if (/Vanavisnupur|Janhagram/.test(f.place)) f.place = "";
    addNote(f, "He was a disciple of Bhūgarbha Gosvāmī. (Prema-vilāsa 17)");
  });

  // 1740 Vṛndāvana dāsa Ṭhākura: the usual place first, the Abhidhāna's in the notes
  const vd = await inv("get_person", { id: 1740 });
  if (vd.name !== "Śrīla Vṛndāvana dāsa Ṭhākura") return { error: "1740 is " + vd.name, out };
  await upd(1740, (f) => {
    if (!f.place.trim()) f.place = "Māmagāchi (Modadrumadvīpa, Navadvīpa)";
    addNote(f, "According to the Gauḍīya Vaiṣṇava Abhidhāna (Tīrthas, «Hālisahara»), he was born at Nati, south of Hālisahara.");
  });

  const left = (await pieces()).map((p) => p.replace(/\s+/g, " ").slice(13, 80));
  return { out, left };
})()`;
ws.onmessage = (m) => {
  console.log(JSON.stringify(JSON.parse(m.data).result?.result?.value ?? JSON.parse(m.data), null, 1));
  ws.close();
};
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
