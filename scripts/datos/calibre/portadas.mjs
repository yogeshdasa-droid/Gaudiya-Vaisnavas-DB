// node portadas.mjs [<biodata.db>] [--aplicar]   (23-11-2026, Whisper: «más portadas desde Calibre»)
// Pone a documentos de la app que NO tienen portada la cover.jpg del mismo libro en Calibre (lista revisada a mano, abajo).
// Sin --aplicar solo comprueba. Con --aplicar escribe en `files` (role 'cover', igual que put_book): la app debe estar CERRADA
// y con copia de seguridad hecha antes (backup.mjs).
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const CAL = "E:/Gaudiya/Data Bases/Calibre/Whisper Library";
const args = process.argv.slice(2);
const dbPath = args.find((a) => a.endsWith(".db")) || process.env.APPDATA + "/com.whispers.biodata/biodata.db";
const apply = args.includes("--aplicar");

// documento de la app → libro de Calibre
const MAPA = {
  3809: 2759, 3810: 1526, 3811: 3112, 3812: 1361, 4330: 2297, 4331: 2298, 4332: 2198, 4333: 2302, 4464: 2818,
  4478: 310, 5773: 310, 5774: 347, 5775: 345, 5776: 346, 5778: 365, 5779: 358,
  5791: 597, 5795: 2148, 5796: 2174, 5797: 2155, 5798: 1514, 5799: 531, 5800: 2120,
  5923: 2154, 5925: 2804, 5926: 2251, 5928: 2237, 5929: 2204, 5930: 2186, 5931: 2199, 5932: 2242,
};
const cal = new DatabaseSync(CAL + "/metadata.db", { readOnly: true });
const db = new DatabaseSync(dbPath);
db.exec("PRAGMA busy_timeout=30000");
let ok = 0, ya = 0, falta = 0;
for (const [docId, calId] of Object.entries(MAPA)) {
  const d = db.prepare("SELECT id, title FROM docs WHERE id = ? AND deleted IS NULL").get(Number(docId));
  const b = cal.prepare("SELECT title, path FROM books WHERE id = ?").get(calId);
  const f = b && path.join(CAL, b.path, "cover.jpg");
  if (!d || !b || !fs.existsSync(f)) { falta++; console.log(`✗ #${docId} → calibre ${calId}: falta (${!d ? "documento" : "portada"})`); continue; }
  if (db.prepare("SELECT 1 FROM files WHERE doc_id = ? AND role = 'cover'").get(d.id)) { ya++; continue; }
  const data = fs.readFileSync(f);
  console.log(`${apply ? "+" : "·"} #${d.id} ${d.title.slice(0, 46).padEnd(46)} ← ${b.title.slice(0, 40)} (${(data.length / 1024).toFixed(0)} KB)`);
  if (apply) db.prepare("INSERT INTO files(doc_id, role, name, mime, data) VALUES(?, 'cover', 'cover.jpg', 'image/jpeg', ?)").run(d.id, data);
  ok++;
}
console.log(`\n${apply ? "Puestas" : "Se pondrían"}: ${ok}; ya tenían: ${ya}; fallos: ${falta}`);
db.close();
