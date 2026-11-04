// node grepnear.mjs <out> <from> <to> <before> <after> term… → lines in [from,to] with any term, with context
import fs from "node:fs";
const [, , out, from, to, before, after, ...terms] = process.argv;
const fold = (s) => s.normalize("NFD").replace(/\u09bc/g, "").replace(/\u09c0/g, "\u09bf").replace(/\u09c2/g, "\u09c1").replace(/\u0981/g, "");
const lines = fs.readFileSync("C:/Users/Yoges/Desktop/BIOGRAPHYS/Abhidhana_Part4_Tirthas_Bengali.txt", "utf8").split(/\r?\n/);
const ts = terms.map(fold);
let res = "";
let last = -1;
for (let i = Number(from) - 1; i < Number(to); i++) {
  if (!ts.some((t) => fold(lines[i]).includes(t))) continue;
  const a = Math.max(i - Number(before), last + 1);
  const b = i + Number(after);
  if (a > last + 1) res += "--- " + (a + 1) + "\n";
  for (let k = a; k <= b; k++) if (lines[k].trim()) res += lines[k] + "\n";
  last = b;
}
fs.writeFileSync(out, res, "utf8");
console.log(res.length);
