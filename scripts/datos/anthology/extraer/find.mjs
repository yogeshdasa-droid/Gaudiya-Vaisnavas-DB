// node find.mjs NN "text1" "text2"... : where a title appears (after the contents), with the lines around
import fs from "node:fs";
const [, , nn, ...keys] = process.argv;
const p = JSON.parse(fs.readFileSync(`cache/v${nn.padStart(2, "0")}.pages.json`, "utf8"));
for (const k of keys) p.forEach((ls, pi) => ls.forEach((l, i) => {
  if (pi > 9 && l.t.length < 90 && l.t.toLowerCase().replace(/\s/g, "").includes(k.toLowerCase().replace(/\s/g, ""))) {
    console.log("##", k, "p" + pi + "." + i);
    for (let j = Math.max(0, i - 3); j < i + 4 && j < ls.length; j++) console.log("   [x" + ls[j].x + " y" + ls[j].y + "]", ls[j].t.slice(0, 90));
  }
}));
