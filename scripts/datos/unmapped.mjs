// Read-only: which records' «Place» the map does not recognise, and the words that come up most.
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
const db = new DatabaseSync(process.argv[2], { readOnly: true });
const fold = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
const strip = (w) => (w.length > 3 && w.endsWith("a") ? w.slice(0, -1) : w);
// the fixed PLACES of the map (their spellings)
const src = fs.readFileSync("G:/Whispers/Bio-DataBase/src/components/Panorama.tsx", "utf8");
const fixed = [...src.matchAll(/\["([^"]+)", [\d.]+, [\d.]+, \[([^\]]*)\]\]/g)].map((m) => [m[1], [...m[2].matchAll(/"([^"]+)"/g)].map((x) => fold(x[1]))]);
const places = db.prepare("SELECT name, aka FROM places WHERE lat IS NOT NULL").all();
const placeKeys = places.map((p) => [p.name, [p.name, ...p.aka.split(","), ...`${p.name},${p.aka}`.split(/[,/()]/)].map((s) => fold(s).split(" ").filter(Boolean).map(strip).join("")).filter((k) => k.length >= 3)]);
const textKeys = (t) => {
  const w = fold(t).split(" ").filter(Boolean).map(strip);
  const out = new Set();
  for (let i = 0; i < w.length; i++) { let k = ""; for (let j = i; j < Math.min(w.length, i + 3); j++) out.add((k += w[j])); }
  return out;
};
const rows = db.prepare("SELECT id, name, place FROM persons WHERE trim(place) <> ''").all();
const un = [];
for (const r of rows) {
  const f = ` ${fold(r.place)} `;
  const keys = textKeys(r.place);
  const hit = fixed.some(([, ks]) => ks.some((k) => f.includes(k))) || placeKeys.some(([, ks]) => ks.some((k) => keys.has(k)));
  if (!hit) un.push(r);
}
// the words that come up most in the places not recognised
const stop = new Set("born at in the of and later lived near district village sripata his her he she was where on to from with a an at by sri srila west east north south bengal india present day modern today town nadia bardhaman district near".split(" "));
const count = new Map();
for (const r of un) for (const w of new Set(fold(r.place).split(" "))) if (w.length > 3 && !stop.has(w)) count.set(w, (count.get(w) ?? 0) + 1);
const top = [...count].sort((a, b) => b[1] - a[1]).slice(0, 70);
fs.writeFileSync(process.argv[3], `with place: ${rows.length}; not recognised: ${un.length}\n\nTOP WORDS\n${top.map(([w, n]) => `${n}\t${w}`).join("\n")}\n\nALL\n${un.map((r) => `${r.id}\t${r.name}\t${r.place.replace(/\s+/g, " ").slice(0, 110)}`).join("\n")}`, "utf8");
console.log(rows.length, un.length);
