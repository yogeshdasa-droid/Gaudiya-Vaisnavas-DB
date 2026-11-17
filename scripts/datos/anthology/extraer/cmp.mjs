// node cmp.mjs NN : the contents lines with a date, and the lectures found
import fs from "node:fs";
const nn = process.argv[2].padStart(2, "0");
const pages = JSON.parse(fs.readFileSync(`cache/v${nn}.pages.json`, "utf8"));
const v = JSON.parse(fs.readFileSync(`${process.argv[3]}/v${nn}.json`, "utf8"));
const tp = pages.findIndex((ls) => ls.slice(0, 3).some((l) => /^(table of )?contents$/i.test(l.t)));
const M = /(January|February|March|April|May|June|July|August|September|October|November|December)/;
console.log("CONTENTS (p" + tp + ")");
for (let p = tp; p < tp + 3 && p < pages.length; p++) pages[p].forEach((l, i, a) => { if (M.test(l.t)) console.log("  ", l.t.replace(/\.{3,}/g, " … "), "‖", (a[i + 1]?.t || "").replace(/\.{3,}/g, " … ").slice(0, 70)); });
console.log("FOUND");
for (const c of v.lectures) console.log("  ", c.date, "·", c.title, "—", c.place, `(${c.text.length})`);
