// node chk.mjs <fichasN.mjs>   (16-11-2026) — cada «cita» seguida de (… YYYY-MM-DD …) debe estar tal cual (sin contar
// mayúsculas, signos ni diacríticos; «…» separa trozos) en alguna charla de esa fecha.
import fs from "node:fs";
import { lectures, norm } from "./lib.mjs";
const src = fs.readFileSync(process.argv[2], "utf8");
const L = lectures();
let ok = 0, bad = 0;
const rx = /«([^«»]+)»([^«]*?)\(([^)]*?)(\d{4}-\d\d(?:-\d\d)?)[^)]*\)/g;
let m;
while ((m = rx.exec(src))) {
  const [, q, , , date] = m;
  const pool = L.filter((l) => l.date.startsWith(date) || date.startsWith(l.date)).map((l) => norm(l.text)).join(" ");
  const frags = q.split(/…|\[[^\]]*\]/).map(norm).filter((f) => f.length > 3);
  // el original tiene palabras pegadas («ofSrila»): si no está, se compara también sin espacios
  const flat = pool.replace(/ /g, "");
  const miss = frags.filter((f) => !pool.includes(f) && !flat.includes(f.replace(/ /g, "")));
  if (!pool) { bad++; console.log(`✗ sin charla de ${date}: ${q.slice(0, 80)}`); }
  else if (miss.length) { bad++; console.log(`✗ ${date}: ${miss.join(" | ").slice(0, 220)}`); }
  else ok++;
}
console.log("bien:", ok, " mal:", bad);
