// node heads3.mjs term… → entry heads in the Abhidhāna Part3 (biographies) + mention count
import fs from "node:fs";
const file = "C:/Users/Yoges/Desktop/BIOGRAPHYS/Abhidhana_Part3_Biographies_Bengali.txt";
const fold = (s) => s.normalize("NFD").replace(/\u09bc/g, "").replace(/\u09c0/g, "\u09bf").replace(/\u09c2/g, "\u09c1").replace(/\u0981/g, "");
const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
for (const term of process.argv.slice(2)) {
  const t = fold(term);
  const heads = [];
  lines.forEach((l, i) => {
    const s = fold(l).replace(/^[\s।৷|'‘’:;!.,*]+/, "");
    if (s.startsWith(t) && /[_—–-]/.test(s.slice(t.length, t.length + 30))) heads.push(i + 1);
  });
  const count = lines.filter((l) => fold(l).includes(t)).length;
  console.log(`${term}\theads: ${heads.slice(0, 20).join(", ")}\tmentions: ${count}`);
}
