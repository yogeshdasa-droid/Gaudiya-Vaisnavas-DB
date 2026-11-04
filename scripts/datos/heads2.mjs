// Entry heads (and where) for the Navadvīpa names in the places book
import fs from "node:fs";
const file = "C:/Users/Yoges/Desktop/BIOGRAPHYS/Abhidhana_Part4_Tirthas_Bengali.txt";
const fold = (s) => s.normalize("NFD").replace(/\u09bc/g, "").replace(/\u09c0/g, "\u09bf").replace(/\u09c2/g, "\u09c1").replace(/\u0981/g, "");
const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
const terms = process.argv.slice(3);
let out = "";
for (const term of terms) {
  const t = fold(term);
  const heads = [];
  lines.forEach((l, i) => {
    const s = fold(l).replace(/^[\s।৷|'‘’:;!.,]+/, "");
    if (s.startsWith(t) && /[_—–-]/.test(s.slice(t.length, t.length + 30))) heads.push(i + 1);
  });
  const count = lines.filter((l) => fold(l).includes(t)).length;
  out += `${term}\theads: ${heads.slice(0, 12).join(", ")}\tmentions: ${count}\n`;
}
fs.writeFileSync(process.argv[2], out, "utf8");
console.log("ok");
