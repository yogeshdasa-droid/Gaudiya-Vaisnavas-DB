// node prataparudra.mjs [port]  (04-11-2026): after Whisper merged the Pratāparudras into
// 278 «Gajapati Pratāparudra Deva»: he is the disciple of Kāśī Miśra (and Kāśī Miśra his guru).
// Running it twice changes nothing the second time.
const port = process.argv[2] ?? "9333";
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.url.includes("localhost:1421") || p.url.includes("tauri.localhost"));
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = String.raw`(async () => {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const fold = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const ps = await inv("list_persons");
  const pr = ps.filter((p) => /prataparudr/.test(fold(p.name)));
  if (pr.length !== 1 || pr[0].id !== 278) return { error: "Pratāparudra records: " + pr.map((p) => p.id + " " + p.name).join(", ") };
  const KM = "Kāśī Miśra";
  const km = ps.find((p) => p.name === KM);
  if (!km) return { error: "no Kāśī Miśra" };
  const F = (p) => ({ name: p.name, aka: p.aka, appearance: p.appearance, disappearance: p.disappearance, place: p.place, guru: p.guru, disciples: p.disciples, works: p.works, notes: p.notes, tags: p.tags });
  const out = [];
  const k = F(await inv("get_person", { id: km.id }));
  if (!k.disciples.includes(pr[0].name)) {
    k.disciples = (k.disciples.trim() ? k.disciples.trim() + ", " : "") + pr[0].name;
    await inv("update_person", { id: km.id, fields: k });
    out.push("Kāśī Miśra: disciple " + pr[0].name);
  }
  const g = F(await inv("get_person", { id: 278 }));
  if (!g.guru.includes(KM)) {
    g.guru = (g.guru.trim() ? g.guru.trim() + ", " : "") + KM;
    await inv("update_person", { id: 278, fields: g });
    out.push("278: guru " + KM);
  }
  return out;
})()`;
ws.onmessage = (m) => {
  console.log(JSON.stringify(JSON.parse(m.data).result?.result?.value ?? JSON.parse(m.data), null, 1));
  ws.close();
};
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
