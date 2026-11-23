// Solo lectura: compara la biblioteca de Calibre (metadata.db) con la BD de la app.
// node analiza.mjs [<biodata.db>] [--salida=informe.md]
// Informe por autor de Calibre: cuántos libros, cuántos ya están en la app (mismo título plegado) y cuáles faltan;
// y si el autor ya tiene ficha (persons).
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";

const CAL = "E:/Gaudiya/Data Bases/Calibre/Whisper Library";
const args = process.argv.slice(2);
const dbPath = args.find((a) => a.endsWith(".db")) || process.env.APPDATA + "/com.whispers.biodata/biodata.db";
const out = (args.find((a) => a.startsWith("--salida=")) || "").slice(9);

const fold = (s) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ").replace(/\b(the|a|an|of|and|sri|srila|srimad|by)\b/g, " ").replace(/\s+/g, " ").trim();

const cal = new DatabaseSync(CAL + "/metadata.db", { readOnly: true });
const app = new DatabaseSync(dbPath, { readOnly: true });

const books = cal.prepare(`
  select b.id, b.title, b.path, b.series_index,
    (select group_concat(a.name, ' & ') from authors a join books_authors_link l on l.author=a.id where l.book=b.id) as authors,
    (select group_concat(s.name) from series s join books_series_link l on l.series=s.id where l.book=b.id) as series,
    (select group_concat(format) from data where book=b.id) as formats
  from books b`).all();

const docs = app.prepare("select id, title, collection, dir from docs where deleted is null").all();
const byTitle = new Map();
for (const d of docs) { const k = fold(d.title); if (k) (byTitle.get(k) || byTitle.set(k, []).get(k)).push(d); }
const persons = app.prepare("select id, name, key, aka from persons").all();
const personKeys = new Map();
for (const p of persons) { for (const n of [p.name, ...(p.aka || "").split(",")]) { const k = fold(n); if (k) personKeys.set(k, p); } }

const authors = new Map();
for (const b of books) {
  const a = b.authors || "(sin autor)";
  const k = fold(b.title);
  b.inApp = byTitle.get(k) || [];
  (authors.get(a) || authors.set(a, []).get(a)).push(b);
}
let md = `# Calibre vs la app — ${new Date().toISOString().slice(0, 10)}\n\n${books.length} libros, ${authors.size} autores.\n`;
let tot = { ya: 0, falta: 0 };
const rows = [...authors.entries()].sort((x, y) => y[1].length - x[1].length);
md += `\n| Autor (Calibre) | Libros | Ya en la app | Faltan | ¿Ficha? |\n|---|---|---|---|---|\n`;
for (const [a, bs] of rows) {
  const ya = bs.filter((b) => b.inApp.length).length;
  tot.ya += ya; tot.falta += bs.length - ya;
  const p = personKeys.get(fold(a));
  md += `| ${a} | ${bs.length} | ${ya} | ${bs.length - ya} | ${p ? "#" + p.id + " " + p.name : "—"} |\n`;
}
md += `\nTotal: ya ${tot.ya}, faltan ${tot.falta}\n\n## Los que faltan\n`;
for (const [a, bs] of rows) {
  const f = bs.filter((b) => !b.inApp.length);
  if (!f.length) continue;
  md += `\n### ${a} (${f.length})\n` + f.map((b) => `- ${b.title}${b.series ? " [" + b.series + "]" : ""} — ${b.formats}`).join("\n") + "\n";
}
if (out) { fs.writeFileSync(out, md); console.log("escrito", out); } else console.log(md.slice(0, 6000));
