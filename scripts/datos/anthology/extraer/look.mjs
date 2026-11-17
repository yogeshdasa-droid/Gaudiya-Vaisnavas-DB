// node look.mjs NN [max]: date lines of a cached volume, with neighbours
import fs from "node:fs";
const [, , nn, max = "40"] = process.argv;
const pages = JSON.parse(fs.readFileSync(`cache/v${nn.padStart(2, "0")}.pages.json`, "utf8"));
const M = "January|February|March|April|May|June|July|August|September|October|November|December";
const re = new RegExp(`\d{1,2}\s*(?:${M})|(?:${M})\s*\d{1,2}`);
let n = 0;
for (let p = 0; p < pages.length && n < +max; p++) {
  const ls = pages[p];
  for (let i = 0; i < ls.length && n < +max; i++) {
    const l = ls[i];
    if (l.t.length < 95 && re.test(l.t)) {
      n++;
      const nb = (k) => (ls[k] ? `[x${ls[k].x}]${ls[k].t.slice(0, 50)}` : "-");
      console.log(`p${p}.${i} [x${l.x}] ${l.t} ‖ ${nb(i - 2)} ‖ ${nb(i - 1)} ‖▶ ${nb(i + 1)} ‖ ${nb(i + 2)}`);
    }
  }
}
console.log("pages", pages.length, "empty pages", pages.filter((x) => !x.length).length);
