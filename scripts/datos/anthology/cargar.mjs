// node cargar.mjs <carpeta con vNN.json> [puerto] [--solo=87,1] [--dry]   (17-11-2026)
// The Bhakta Bandhav Anthology into the app: each volume (made by extraer/volume.mjs from its PDF) becomes one book in
// «Anthology», one chapter per lecture — heading «title · place · 6 May 1996», which the Anthology page reads — with its
// cover. Only the text: the PDF stays in its folder (the reader's «Open the original PDF»). The same PDF again replaces
// that book (put_book), so a second run changes nothing.
import fs from "node:fs";
import path from "node:path";
const args = process.argv.slice(2);
const dir = args[0];
const port = args.find((a) => /^\d+$/.test(a)) || "9334";
const dry = args.includes("--dry");
const only = (args.find((a) => a.startsWith("--solo=")) || "").slice(7).split(",").filter(Boolean).map(Number);
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const long = (iso) => `${+iso.slice(8, 10)} ${MONTHS[+iso.slice(5, 7) - 1]} ${iso.slice(0, 4)}`;

// letters the PDF fonts give wrongly (checked against each book's own contents page, 17-11-2026)
const FIX = [
  [/\bI[Cc]rsna/g, "Krsna"], [/\bI[Cc]uruksetra/g, "Kuruksetra"], [/\b([Bb])haicti/g, "$1hakti"], [/Radhiica/g, "Radhika"],
  [/\bArc Not\b/g, "Are Not"], [/\bAdvice lo\b/g, "Advice to"], [/Svanri/g, "Svami"], [/Nandolsava/g, "Nandotsava"],
  [/Snmali/g, "Srimati"], [/Devolion/g, "Devotion"], [/WhobAm/g, "Who Am"], [/an Ideae\b/g, "an Ideal"],
  [/^TEACHINGS OF SRILA bhaktisiddhAnta prabhupAda$/, "Teachings of Srila Bhaktisiddhanta Prabhupada"],
];
const fix = (s) => FIX.reduce((a, [re, to]) => a.replace(re, to), s);

const files = fs.readdirSync(dir).filter((f) => /^v\d+\.json$/.test(f)).sort();
if (dry) { for (const f of files) { const v = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); console.log(`Vol ${v.vol}: ${v.lectures.length} lectures, cover ${fs.existsSync(v.cover)}`); } process.exit(0); }
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket((list.find((p) => p.type === "page" && /tauri.localhost|localhost:1421/.test(p.url)) ?? list.find((p) => p.type === "page")).webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let n = 0;
const call = (expr) =>
  new Promise((resolve) => {
    const id = ++n;
    const h = (m) => {
      const d = JSON.parse(m.data);
      if (d.id !== id) return;
      ws.removeEventListener("message", h);
      resolve(d.result?.result?.value ?? d.result);
    };
    ws.addEventListener("message", h);
    ws.send(JSON.stringify({ id, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
  });
for (const f of files) {
  const v = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  if (only.length && !only.includes(v.vol)) continue;
  if (!v.lectures.length) { console.log(`Vol ${v.vol}: no lectures — skipped`); continue; }
  const sections = [];
  if (v.intro) sections.push({ heading: "Introduction", text: `## Introduction\n\n${v.intro}` });
  for (const c0 of v.lectures) {
    // the book's last pages (centres, contacts, websites) stay out of its last lecture
    const body = c0.text.split("\n\n");
    const end = body.findIndex((p) => /^BHAKTA BANDHAV S\S+ ?\S* GURUDEVA (CONTACTS|CENTERS)/i.test(p));
    const c = { ...c0, title: fix(c0.title), text: fix((end > 0 ? body.slice(0, end) : body).join("\n\n")) };
    sections.push({ heading: `${c.title} · ${c.place} · ${long(c.date)}`, text: `## ${c.title}\n\n*${c.place} · ${long(c.date)}*\n\n${c.text}` });
  }
  const book = {
    collection: "Anthology",
    dir: "Anthology",
    title: v.title.replace(/^(Anthology Vol-\d+)\s+/, "$1 · "),
    date: v.lectures[0].date,
    source: v.pdf,
    sections,
    cover: fs.existsSync(v.cover) ? v.cover : null,
  };
  if (dry) { console.log(`Vol ${v.vol}: ${book.title} — ${sections.length} chapters (dry)`); continue; }
  const r = await call(`(async () => { try { return await window.__TAURI_INTERNALS__.invoke("put_book", ${JSON.stringify(book)}); } catch (e) { return "ERROR " + e; } })()`);
  console.log(`Vol ${v.vol}: ${book.title} — ${sections.length} chapters → ${typeof r === "number" ? "#" + r : JSON.stringify(r)}`);
}
ws.close();
