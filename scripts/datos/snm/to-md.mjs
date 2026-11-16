// node to-md.mjs   (16-11-2026) — las conferencias de Śrīla Nārāyaṇa Gosvāmī Mahārāja (Desktop\BIOGRAPHYS\Info, Whisper:
// «100% fiables») → un Markdown por año en Documentos\Gaudiya Vaisnavas DB\Lectures SNM md, con «## <fecha> · <título>»
// por charla (el lector de la app hace el índice con esos encabezados) y la línea de lugar/fecha de la charla debajo.
// Escribe también ../libros-snm.json (plan para libros-importar.mjs) y snm-index.json (charla → libro, para las fichas).
import fs from "node:fs";
import path from "node:path";

const INFO = path.join(process.env.USERPROFILE, "Desktop", "BIOGRAPHYS", "Info");
const OUT = path.join(process.env.USERPROFILE, "Documents", "Gaudiya Vaisnavas DB", "Lectures SNM md");
fs.mkdirSync(OUT, { recursive: true });

const MON = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
const files = [];
const walk = (d) => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else files.push(p); } };
walk(INFO);

// fecha y título a partir del nombre: «Nov-10 In Honor…», «08 Oct 1977-…», «01 Oct-The …», «Aug-22-24 Janmastami…»
const parseName = (rel) => {
  const base = path.basename(rel).replace(/\.(md|txt)$/i, "").replace(/Md$/, "").trim();
  const parts = rel.split(path.sep);
  let year = parts.map((p) => p.match(/^(19|20)\d\d$/)?.[0]).filter(Boolean).pop() ?? null;
  let m, mon = 0, day = 0, title = base;
  if ((m = base.match(/^(\d{1,2})\s+([A-Za-z]{3})[a-z]*\.?\s*((?:19|20)\d\d)?\s*[-–]?\s*(.*)$/))) { day = +m[1]; mon = MON[m[2].toLowerCase()] ?? 0; if (m[3]) year = m[3]; title = m[4]; }
  else if ((m = base.match(/^([A-Za-z]{3})[a-z]*[- ](\d{1,2})(?:-\d{1,2})?\s*[-–]?\s*(.*)$/))) { mon = MON[m[1].toLowerCase()] ?? 0; day = +m[2]; title = m[3]; }
  else if ((m = base.match(/^([A-Za-z]{3})[a-z]*[- ]\s*(.*)$/)) && MON[m[1].toLowerCase()]) { mon = MON[m[1].toLowerCase()]; title = m[2]; }
  else if ((m = base.match(/^00\s+([A-Za-z]{3})[a-z]*\s*[-–]?\s*(.*)$/))) { mon = MON[m[1].toLowerCase()] ?? 0; title = m[2]; }
  title = title.replace(/^[-–\s]+/, "").replace(/\s+/g, " ").trim() || base;
  const series = parts.length > 2 && !/^(19|20)\d\d$/.test(parts[parts.length - 2]) && !/^\d{4}-\d{4}$/.test(parts[parts.length - 2]) ? parts[parts.length - 2] : "";
  return { year, mon, day, title, series };
};

// la primera línea que parece «Mes Año, Lugar» (p. ej. «April 1996, Kesavji Gaudiya Math, #Mathura, India»)
const placeOf = (txt) => {
  for (const l of txt.split(/\r?\n/).slice(0, 25)) {
    const s = l.replace(/\[\[[^\]|]*\|([^\]]*)\]\]/g, "$1").replace(/[#*_]/g, "").trim();
    if (s.length < 140 && /\b(19|20)\d\d\b/.test(s) && /,/.test(s) && !/^(https?:|-)/.test(s)) return s;
  }
  return "";
};
// el texto de la charla: sin «***», con los encabezados propios convertidos en negrita (para que solo «##» sean charlas)
const bodyOf = (txt) =>
  txt.replace(/\r/g, "").split("\n").filter((l) => l.trim() !== "***")
    .map((l) => (/^\s*#{1,6}\s+/.test(l) ? "**" + l.replace(/^\s*#{1,6}\s+/, "").replace(/\*\*/g, "").trim() + "**" : l))
    .join("\n")
    .replace(/!\[\[[^\]]*\]\]/g, "") // imágenes de Obsidian
    .replace(/\[\[[^\]|]*\|([^\]]*)\]\]/g, "$1") // [[enlace|texto]] → texto
    .replace(/\[\[([^\]]*)\]\]/g, "$1") // [[texto]] → texto
    .replace(/(^|[\s(])#([A-Z][A-Za-z-]+)/g, "$1$2") // #Mathura → Mathura
    .replace(/\n{3,}/g, "\n\n").trim();

const pad = (n) => String(n).padStart(2, "0");
const books = new Map(); // clave → { title, items: [] }
const index = [];
for (const f of files) {
  const rel = path.relative(INFO, f);
  const top = rel.split(path.sep)[0];
  const txt = fs.readFileSync(f, "utf8");
  const n = parseName(rel);
  let key, title;
  if (top === "Daily Quotations") { key = "quotes"; title = "Source of Inspiration — Daily Quotes (Śrīla Bhaktivedānta Nārāyaṇa Gosvāmī Mahārāja)"; }
  else if (/Bhaktisiddhanta/i.test(top)) { key = "bss"; title = "Śrīla Bhaktisiddhānta Sarasvatī Ṭhākura Prabhupāda — Articles (from the Info collection)"; }
  else if (n.year && +n.year < 1990) { key = "1930-1977"; title = "Lectures and conversations 1930–1977 — Śrīla Bhaktisiddhānta Sarasvatī, Śrīla Bhakti Prajñāna Keśava Gosvāmī, Śrīla Prabhupāda and Śrīla Nārāyaṇa Gosvāmī Mahārāja"; }
  else if (n.year && +n.year > 2010) { key = "2011-2020"; title = "Lectures of Śrīla Bhaktivedānta Nārāyaṇa Gosvāmī Mahārāja — published 2011–2020 (dates of publication, purebhakti.com)"; }
  else { key = n.year ?? top; title = `Lectures of Śrīla Bhaktivedānta Nārāyaṇa Gosvāmī Mahārāja — ${key}`; }
  if (!books.has(key)) books.set(key, { title, items: [] });
  books.get(key).items.push({ rel, ...n, place: placeOf(txt), body: bodyOf(txt) });
}

const plan = [];
for (const [key, b] of [...books].sort((a, b) => String(a[0]).localeCompare(String(b[0])))) {
  b.items.sort((x, y) => String(x.year).localeCompare(String(y.year)) || (x.mon - y.mon) || (x.day - y.day) || x.title.localeCompare(y.title));
  const out = [`# ${b.title}`, ""];
  for (const it of b.items) {
    const date = it.year ? `${it.year}-${pad(it.mon)}${it.day ? "-" + pad(it.day) : ""}` : "";
    const head = [date, it.series, it.title].filter(Boolean).join(" · ");
    out.push(`## ${head}`, "");
    if (it.place) out.push(`*${it.place}*`, "");
    out.push(it.body, "");
    index.push({ book: b.title, heading: head, file: it.rel, place: it.place });
  }
  const file = path.join(OUT, `SNM ${key}.md`);
  fs.writeFileSync(file, out.join("\n"));
  plan.push({ path: file, title: b.title });
  console.log(key.padEnd(8), String(b.items.length).padStart(4), "charlas", (fs.statSync(file).size / 1024).toFixed(0) + " KB");
}
fs.writeFileSync(new URL("../libros-snm.json", import.meta.url), JSON.stringify(plan, null, 1));
fs.writeFileSync(new URL("./snm-index.json", import.meta.url), JSON.stringify(index, null, 1));
console.log("libros:", plan.length, " charlas:", index.length);
