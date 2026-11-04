// node look.mjs <out.txt> <lines after> term1 term2 …  → the entries of the places book that start with each term
import fs from "node:fs";
const [, , out, after, ...terms] = process.argv;
const file = "C:/Users/Yoges/Desktop/BIOGRAPHYS/Abhidhana_Part4_Tirthas_Bengali.txt";
const fold = (s) => s.normalize("NFD").replace(/\u09bc/g, "").replace(/\u09c0/g, "\u09bf").replace(/\u09c2/g, "\u09c1").replace(/\u0981/g, "").replace(/[\u200c\u200d]/g, "");
const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
const folded = lines.map(fold);
let res = "";
for (const term of terms) {
  const t = fold(term);
  res += `\n######## ${term}\n`;
  let n = 0;
  folded.forEach((l, i) => {
    const s = l.replace(/^[\s।৷|'‘’:;!.,]+/, "");
    if (s.startsWith(t) && /^[^\s]*\s*[\s(]?.{0,25}?[_—–-]/.test(s.slice(0, 40))) {
      if (++n > 4) return;
      res += `--- line ${i + 1}\n` + lines.slice(i, i + Number(after)).join("\n") + "\n";
    }
  });
  if (!n) {
    // anywhere in a line
    const hits = [];
    folded.forEach((l, i) => l.includes(t) && hits.push(i + 1));
    res += `(no entry head; mentions at lines ${hits.slice(0, 15).join(", ")})\n`;
  }
}
fs.writeFileSync(out, res, "utf8");
console.log("written", res.length);
