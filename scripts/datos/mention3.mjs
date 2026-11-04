// node mention3.mjs <out> term… → every line (number + text) containing any term (folded)
import fs from "node:fs";
const [, , out, ...terms] = process.argv;
const fold = (s) => s.normalize("NFD").replace(/\u09bc/g, "").replace(/\u09c0/g, "\u09bf").replace(/\u09c2/g, "\u09c1").replace(/\u0981/g, "").replace(/\s+/g, "");
const lines = fs.readFileSync("C:/Users/Yoges/Desktop/BIOGRAPHYS/Abhidhana_Part3_Biographies_Bengali.txt", "utf8").split(/\r?\n/);
const ts = terms.map(fold);
let r = "";
lines.forEach((l, i) => { if (ts.some((t) => fold(l).includes(t))) r += `${i + 1}: ${l}\n`; });
fs.writeFileSync(out, r, "utf8");
console.log(r.split("\n").length - 1);
