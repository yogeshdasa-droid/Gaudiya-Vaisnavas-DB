// node ctx.mjs <out.txt> <before> <after> line1 line2 …  → the places book around those lines
import fs from "node:fs";
const [, , out, before, after, ...nums] = process.argv;
const lines = fs.readFileSync("C:/Users/Yoges/Desktop/BIOGRAPHYS/Abhidhana_Part4_Tirthas_Bengali.txt", "utf8").split(/\r?\n/);
let res = "";
for (const n of nums.map(Number)) {
  res += `\n######## line ${n}\n` + lines.slice(Math.max(0, n - 1 - Number(before)), n - 1 + Number(after)).filter((l) => l.trim()).join("\n") + "\n";
}
fs.writeFileSync(out, res, "utf8");
console.log("written", res.length);
