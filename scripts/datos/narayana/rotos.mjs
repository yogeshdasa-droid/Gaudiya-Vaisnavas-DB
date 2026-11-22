// node rotos.mjs <puerto> <carpeta de salida>   (22-11-2026)  SOLO LECTURA: no importa nada.
// Pasa cada PDF de «Sri Srimad Bhaktivedanta Narayana\Books» por `convert_pdf` (el de la app) y mide las letras «raras»
// (tipografías propias que no se leen bien). Guarda rotos.json (resumen) y, de cada libro roto, su texto en <salida>/<id>.txt.
import fs from "node:fs";
import path from "node:path";
const ROOT = "O:/Gaudiya Vaisnavas DB/Biblioteca/Sri Srimad Bhaktivedanta Narayana/Books";
const port = process.argv[2] || "9337", out = process.argv[3];
fs.mkdirSync(out, { recursive: true });
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.type === "page" && /tauri.localhost|localhost:1421/.test(p.url));
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let n = 0; const pending = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
const inv = (cmd, a) => new Promise((resolve) => { const id = ++n; pending.set(id, (d) => resolve(d.result?.result?.value)); ws.send(JSON.stringify({ id, method: "Runtime.evaluate", params: { awaitPromise: true, returnByValue: true, expression: `(async()=>{try{return await window.__TAURI_INTERNALS__.invoke(${JSON.stringify(cmd)},${JSON.stringify(a)})}catch(e){return {__err:String(e)}}})()` } })); });
const LEGIT = /[áéíóúñüÁÉÍÓÚÑÜ¿¡°·«»©]|[Ā-őŔ-şŢ-ŷŹ-żḀ-ỿ]|[‐-―‘-„•…●]/u;
const res = [];
for (const f of fs.readdirSync(ROOT, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()) {
  const dir = path.join(ROOT, f).split("\\").join("/");
  const pdf = fs.readdirSync(dir).find((x) => /\.pdf$/i.test(x));
  const id = (f.match(/\((\d+)\)\s*$/) || [])[1] || f;
  if (!pdf) { res.push({ id, folder: f, estado: "sin pdf" }); continue; }
  const r = await inv("convert_pdf", { path: `${dir}/${pdf}`, applyBalaram: true });
  if (!r || r.__err) { res.push({ id, folder: f, estado: "error", err: r?.__err }); continue; }
  const letters = (r.text.match(/\p{L}/gu) || []).length;
  if (letters < 400 * Math.max(1, Math.min(r.pages, 5))) { res.push({ id, folder: f, estado: "escaneado", pages: r.pages }); continue; }
  const bad = [...r.text].filter((c) => c.codePointAt(0) > 126 && !LEGIT.test(c));
  const ratio = bad.length / letters;
  const freq = new Map(); for (const c of bad) freq.set(c, (freq.get(c) || 0) + 1);
  const top = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14).map(([c, k]) => `${c}${k}`).join(" ");
  const roto = ratio > 0.004;
  res.push({ id, folder: f, pdf: `${dir}/${pdf}`, estado: roto ? "roto" : "ok", pages: r.pages, ratio: +(ratio * 100).toFixed(2), top });
  if (roto) fs.writeFileSync(path.join(out, `${id}.txt`), r.text);
  console.log(roto ? "✗" : "✓", id, f.slice(0, 50), (ratio * 100).toFixed(2) + "%", roto ? top : "");
}
fs.writeFileSync(path.join(out, "rotos.json"), JSON.stringify(res, null, 1));
console.log("rotos:", res.filter((x) => x.estado === "roto").length, "ok:", res.filter((x) => x.estado === "ok").length, "escaneados:", res.filter((x) => x.estado === "escaneado").length);
ws.close();
