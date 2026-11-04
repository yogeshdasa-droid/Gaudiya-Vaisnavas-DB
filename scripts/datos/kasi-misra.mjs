// node kasi-misra.mjs [port]  (04-11-2026, asked by Whisper): a record for Kāśī Miśra, from the
// biographies in the library. Pratāparudra (already merged by Whisper) goes in «Disciples» if there is
// exactly one record of him. Running it twice changes nothing the second time.
const port = process.argv[2] ?? "9333";
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.url.includes("localhost:1421") || p.url.includes("tauri.localhost"));
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = String.raw`(async () => {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const NL = String.fromCharCode(10);
  const out = [];
  const ps = await inv("list_persons");
  const fold = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const pr = ps.filter((p) => /prataparudr/.test(fold(p.name)));
  const NAME = "Kāśī Miśra";
  const notes = [
    "The guru of King Pratāparudra (Vaiṣṇava Digdarśanī). His house in Purī, secluded and near the temple of Jagannātha, was chosen by the king and Sārvabhauma Bhaṭṭācārya for Mahāprabhu's residence; Mahāprabhu lived there for the last eighteen years of his life — the Gambhīrā, a solitary room in his house. Paramānanda Purī was also given a room and a servant there.",
    "After Mahāprabhu, Vakreśvara Paṇḍita lived in his house, and Vakreśvara's disciple Gopāla Guru Gosvāmī installed Śrī Śrī Rādhā-kānta there (the Rādhākānta-maṭha).",
    "The Vaiṣṇava Digdarśanī also names a Kāśī Miśra as the matchmaker of Mahāprabhu's marriage with Viṣṇupriyā in Navadvīpa: perhaps another person.",
  ].join(NL + NL);
  let me = ps.find((p) => p.name === NAME);
  if (!me) {
    const id = await inv("new_person", { fields: { name: NAME, aka: "Kasi Misra, Kashi Mishra", appearance: "", disappearance: "", place: "Jagannātha Purī", guru: "", disciples: pr.length === 1 ? pr[0].name : "", works: "", notes, tags: "" } });
    out.push("NEW " + id + " " + NAME);
  } else out.push("exists " + me.id);
  return { out, prataparudra: pr.map((p) => p.id + " " + p.name) };
})()`;
ws.onmessage = (m) => {
  console.log(JSON.stringify(JSON.parse(m.data).result?.result?.value ?? JSON.parse(m.data), null, 1));
  ws.close();
};
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
