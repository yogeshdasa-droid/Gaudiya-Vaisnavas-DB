// node backup.mjs "<label>"  → one-file copy of the real database in Documents\Gaudiya Vaisnavas DB\Copias de seguridad
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
const src = path.join(process.env.APPDATA, "com.whispers.biodata", "biodata.db");
const dir = path.join(process.env.USERPROFILE, "Documents", "Gaudiya Vaisnavas DB", "Copias de seguridad");
fs.mkdirSync(dir, { recursive: true });
const out = path.join(dir, `Gaudiya Vaisnavas DB antes de ${process.argv[2]} ${new Date().toISOString().slice(0, 10)}.db`);
if (fs.existsSync(out)) throw new Error("already exists: " + out);
const db = new DatabaseSync(src);
db.exec(`VACUUM INTO '${out.replace(/'/g, "''")}'`);
const n = db.prepare("SELECT count(*) AS n FROM persons").get().n;
db.close();
const check = new DatabaseSync(out, { readOnly: true });
const ok = check.prepare("PRAGMA integrity_check").get();
const m = check.prepare("SELECT count(*) AS n FROM persons").get().n;
check.close();
console.log(out, fs.statSync(out).size, "persons", n, m, JSON.stringify(ok));
