// node lines3.mjs <out> from to → copy those lines of the Abhidhāna Part3 (with numbers)
import fs from "node:fs";
const [, , out, from, to] = process.argv;
const lines = fs.readFileSync("C:/Users/Yoges/Desktop/BIOGRAPHYS/Abhidhana_Part3_Biographies_Bengali.txt", "utf8").split(/\r?\n/);
let r = "";
for (let i = Number(from) - 1; i < Number(to) && i < lines.length; i++) if (lines[i].trim()) r += `${i + 1}: ${lines[i]}\n`;
fs.writeFileSync(out, r, "utf8");
console.log(r.length);
