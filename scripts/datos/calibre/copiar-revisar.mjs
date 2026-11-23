// Copia (sin quitar nada de Calibre) los PDF que no se importaron a «O:\CHECK PDFS\rotos» y «\escaneados»,
// a partir de ultimo-informe.json (lo escribe cargar.mjs). Archivos «Autor - Título [id].pdf» + lista.txt.
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const CAL = "E:/Gaudiya/Data Bases/Calibre/Whisper Library";
const OUT = "O:/CHECK PDFS";
const rep = JSON.parse(fs.readFileSync(path.join(AQUI, "ultimo-informe.json"), "utf8"));
const cal = new DatabaseSync(CAL + "/metadata.db", { readOnly: true });
const books = cal.prepare(`select b.id, b.title, b.path,
  (select a.name from authors a join books_authors_link l on l.author=a.id where l.book=b.id order by l.id limit 1) as autor from books b`).all();
const byTitle = new Map();
for (const b of books) { (byTitle.get(b.title.trim()) || byTitle.set(b.title.trim(), []).get(b.title.trim())).push(b); }
const clean = (s) => s.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_").replace(/\s+/g, " ").trim().slice(0, 120);

function find(entry) {
  const id = (entry.match(/\[(\d+)\]/) || [])[1];
  const title = entry.replace(/\s*\[\d+\]/, "").replace(/\s*\((?:\d+ pp\.|[^()]*raros|solo EPUB|sin PDF|autor sin).*$/, "").trim();
  if (id) return books.find((b) => String(b.id) === id);
  const sufijo = title.match(/^(.*) · (\d+)$/);
  if (sufijo) return books.find((b) => String(b.id) === sufijo[2]);
  const c = byTitle.get(title) || [];
  return c.length === 1 ? c[0] : c;
}

const lista = [];
for (const [carpeta, items] of [["rotos", rep.rotos], ["escaneados", rep.sinTexto]]) {
  fs.mkdirSync(path.join(OUT, carpeta), { recursive: true });
  for (const e of items) {
    let b = find(e);
    const cands = Array.isArray(b) ? b : b ? [b] : [];
    if (!cands.length) { lista.push(`${carpeta}\t?\tNO ENCONTRADO\t${e}`); continue; }
    for (const x of cands) {
      const dir = path.join(CAL, x.path);
      const pdf = fs.readdirSync(dir).find((f) => /\.pdf$/i.test(f));
      if (!pdf) { lista.push(`${carpeta}\t${x.id}\tSIN PDF\t${x.title}`); continue; }
      const dest = path.join(OUT, carpeta, `${clean(x.autor || "sin autor")} - ${clean(x.title)} [${x.id}].pdf`);
      if (!fs.existsSync(dest)) fs.copyFileSync(path.join(dir, pdf), dest);
      lista.push(`${carpeta}\t${x.id}\t${x.autor}\t${x.title}\t${e.match(/\(([^)]*)\)\s*$/)?.[1] || ""}`);
    }
  }
}
fs.writeFileSync(path.join(OUT, "lista.txt"), lista.join("\n") + "\n");
console.log(lista.filter((l) => l.includes("NO ENCONTRADO") || l.includes("SIN PDF")).join("\n") || "todo encontrado");
console.log("copiados:", lista.length);
