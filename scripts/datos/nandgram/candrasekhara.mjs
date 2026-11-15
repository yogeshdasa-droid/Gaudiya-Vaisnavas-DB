// node candrasekhara.mjs <carpeta Nandgram Dham> [puerto]     (15-11-2026)
// The Nandgram Dham life «Srila Chandrashekhara Acharya» is Candraśekhara VAIDYA, the physician of Kāśī who hosted the
// Lord for two months (Caitanya-caritāmṛta Madhya 19–20), not Candraśekhara Ācāryaratna of Navadvīpa (#166), where
// casar.mjs had put it. This script, with the app open with --remote-debugging-port (default 9334):
// 1. creates the record «Candraśekhara Vaidya» (if no record has that name yet);
// 2. moves the text «Nandgram Dham — Srila Chandrashekhara Acharya» from #166 to it;
// 3. adds the 5 pictures of that life to its gallery with their captions, and removes them from #166
//    (only those whose caption is exactly the Nandgram one).
// A second run does nothing.
// Needs the command rename_person_image (v0.17.14).
import fs from "node:fs";
import path from "node:path";
const [dir, port = "9334"] = process.argv.slice(2);
const slug = "chandrashekhara-acharya";
const caps = JSON.parse(fs.readFileSync(path.join(dir, "imagenes", "imagenes.json"), "utf8"))[slug];
const files = caps.map((c) => path.join(dir, "imagenes", slug, c.file).replace(/\\/g, "/"));
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const fields = {
  name: "Candraśekhara Vaidya",
  aka: "Candraśekhara Ācārya (of Kāśī), Chandrasekhara Vaidya",
  appearance: "",
  disappearance: "",
  place: "Vārāṇasī (Kāśī)",
  guru: "",
  disciples: "",
  works: "",
  notes:
    "The physician (vaidya) of Vārāṇasī, one of the Lord's three devotees there with Tapana Miśra and his son Raghunātha Bhaṭṭa: «Candraśekhara Vaidya and Tapana Miśra… the Lord lived two months in Candraśekhara's house and took His meals at Tapana Miśra's» (Caitanya-caritāmṛta Ādi 10.152–153). He also worked as a scribe, copying scripture for the paṇḍitas of Kāśī. Sanātana Gosvāmī, escaped from prison and dressed as a Muslim beggar, found the Lord at his door (Madhya 20). His guru, birth and death are not recorded (Nandgram Dham).\n\nNot Candraśekhara Ācāryaratna of Navadvīpa, the Lord's uncle (#166): the Nandgram Dham life «Srila Chandrashekhara Acharya» is about this physician of Kāśī, and its text and pictures were moved here from #166 (15-11-2026).",
  tags: "",
};
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const log = [];
  const all = await inv("list_persons");
  let id = (all.find((p) => p.name === ${JSON.stringify(fields.name)}) || {}).id;
  if (!id) { id = await inv("new_person", { fields: ${JSON.stringify(fields)} }); log.push("ficha nueva #" + id); }
  else log.push("ya existe #" + id);
  const from = await inv("get_person", { id: 166 });
  for (const d of from.docs) {
    if (!/^Nandgram Dham — Srila Chandrashekhara/.test(d.title)) continue;
    const full = await inv("get_doc", { id: d.id });
    const m = full.doc;
    await inv("update_doc", { docId: d.id, meta: { title: m.title, date: m.date || "", collection: m.collection || "", personId: id } });
    log.push("texto movido: " + d.title);
  }
  const caps = ${JSON.stringify(caps.map((c) => c.caption))};
  const files = ${JSON.stringify(files)};
  const to = await inv("get_person", { id });
  for (let i = 0; i < caps.length; i++) {
    const j = from.imageNames.indexOf(caps[i]);
    if (j < 0) continue;
    if (!to.imageNames.includes(caps[i])) {
      await inv("add_person_images", { id, paths: [files[i]] });
      const now = await inv("get_person", { id });
      const newId = Math.max(...now.images);
      await inv("rename_person_image", { imageId: newId, name: caps[i] });
    }
    await inv("remove_person_image", { imageId: from.images[j] });
    log.push("imagen " + (i + 1) + " movida");
  }
  return log;
} catch (e) { return "ERROR " + e; } })()`;
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  if (d.id === 1) {
    console.log(JSON.stringify(d.result?.result?.value ?? d.result, null, 1));
    ws.close();
  }
};
