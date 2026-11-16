// node chk-citas.mjs <fichasN.mjs> sb.json  (16-11-2026) — cada «cita» (ref) de una tanda debe estar tal cual en sb.json
import fs from "node:fs";
const [file, sbp] = process.argv.slice(2);
const sb = JSON.parse(fs.readFileSync(sbp, "utf8"));
const src = fs.readFileSync(file, "utf8");
// mayúsculas y aclaraciones entre corchetes no cuentan
const norm = (s) => s.replace(/\[[^\]]*\]/g, " ").replace(/\s+/g, " ").replace(/ ([,.;:])/g, "$1").trim().toLowerCase();
let bad = 0, ok = 0;
// «quote» … (c.ch.v[–w]) — the ref is the first parenthesis after the quote
const rx = /«([^«»]+)»([^«]*?)\((\d+)\.(\d+)\.(\d+)(?:[–-](\d+))?\)/g;
let m;
while ((m = rx.exec(src))) {
  const [, q, , c, ch, a, b = a] = m;
  if (/^In the |^Vaṁśa|^Libros/.test(q)) continue;
  const vs = sb.filter((v) => v.canto == c && v.chapter == ch && (() => { const [x, y = x] = v.ref.split(".")[2].split("-").map(Number); return y >= +a - 1 && x <= +b + 1; })());
  const txt = norm(vs.map((v) => v.tr).join(" "));
  // a bracket in the quote stands for words of the verse: split there too
  const frags = q.split(/…|\[[^\]]*\]/).map(norm).filter((f) => f.length > 3);
  const miss = frags.filter((f) => !txt.includes(f));
  if (miss.length) { bad++; console.log(`✗ ${c}.${ch}.${a}${b !== a ? "-" + b : ""}: ${miss.join(" | ").slice(0, 200)}`); } else ok++;
}
console.log("bien:", ok, " mal:", bad);
