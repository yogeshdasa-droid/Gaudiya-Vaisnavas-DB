// node textos-campos.mjs <casadas.json> <carpeta Nandgram Dham> <campos.json> [puerto] [--dry]   (15-11-2026)
// With the app open with --remote-debugging-port (default 9334). For each life matched to a record:
// - a text «Nandgram Dham — <title>» in the record (collection «Nandgram Dham»), with the address of the page on
//   top; skipped if the record already has a text with that title (a second run adds nothing);
// - campos.json { "<id>": { appearance?, disappearance?, place?, guru? } }: written ONLY into empty fields.
import fs from "node:fs";
import path from "node:path";
const args = process.argv.slice(2);
const dry = args.includes("--dry");
const [casPath, dir, camposPath, port = "9334"] = args.filter((a) => a !== "--dry");
const cas = JSON.parse(fs.readFileSync(casPath, "utf8"));
const datos = JSON.parse(fs.readFileSync(path.join(dir, "datos.json"), "utf8"));
const campos = JSON.parse(fs.readFileSync(camposPath, "utf8"));
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let n = 0;
const call = (expr) =>
  new Promise((res) => {
    const id = ++n;
    const h = (m) => { const d = JSON.parse(m.data); if (d.id !== id) return; ws.removeEventListener("message", h); res(d.result?.result?.value ?? d.result?.exceptionDetails ?? d); };
    ws.addEventListener("message", h);
    ws.send(JSON.stringify({ id, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
  });
const keys = ["name", "aka", "appearance", "disappearance", "place", "guru", "disciples", "works", "notes", "tags"];
for (const c of cas) {
  const d = datos[c.slug];
  const md = fs.readFileSync(path.join(dir, "textos", c.slug + ".md"), "utf8").replace(/\r\n/g, "\n");
  const title = "Nandgram Dham — " + d.title;
  const text = `Fuente: [nandgramdham.org — ${d.title}](${d.url}) (Hare Krishna Movement, Kota; copia sin conexión del 15-11-2026 en «Gaudiya Vaisnavas DB\\Nandgram Dham»)\n\n${md.trim()}\n`;
  const fields = campos[String(c.id)] ?? {};
  const r = await call(`(async () => { try {
    const inv = window.__TAURI_INTERNALS__.invoke;
    const p = await inv("get_person", { id: ${c.id} });
    const out = [];
    if (!(p.docs || []).some((x) => x.title === ${JSON.stringify(title)})) {
      if (!${dry}) { const doc = await inv("create_doc", { personId: ${c.id}, title: ${JSON.stringify(title)}, collection: "Nandgram Dham" });
        await inv("save_section", { docId: doc, ordinal: 0, text: ${JSON.stringify(text)} }); }
      out.push("texto");
    }
    const want = ${JSON.stringify(fields)};
    const f = Object.fromEntries(${JSON.stringify(keys)}.map((k) => [k, Array.isArray(p[k]) ? p[k].join(", ") : (p[k] ?? "")]));
    const done = Object.keys(want).filter((k) => !String(f[k]).trim());
    if (done.length) { done.forEach((k) => (f[k] = want[k])); if (!${dry}) await inv("update_person", { id: ${c.id}, fields: f }); out.push(...done); }
    return p.name + ": " + (out.join(", ") || "nada");
  } catch (e) { return "ERROR " + ${c.id} + " " + e; } })()`);
  console.log(c.id, r);
}
ws.close();
process.exit(0);
