// node q.mjs <canto.chapter[-chapter]> <regex> [max=12]   (16-11-2026) — the translations of the Bhāgavatam (sb.json) in
// those chapters that match the regex (case-insensitive), with their ref: to find the verses for the «In the
// Śrīmad-Bhāgavatam» texts. «node q.mjs 4.8-12 "uttanapada|suniti"». A regex «.» lists the whole chapter (first max).
import fs from "node:fs";
const [where, re, max = "12"] = process.argv.slice(2);
const sb = JSON.parse(fs.readFileSync(new URL("./sb.json", import.meta.url), "utf8"));
const [c, chs] = where.split(".");
const [a, b = a] = chs.split("-").map(Number);
const rx = new RegExp(re, "i");
let n = 0;
for (const v of sb) {
  if (v.canto !== +c || v.chapter < a || v.chapter > b || !rx.test(v.tr)) continue;
  console.log(`${v.ref}  ${v.tr.replace(/\s+/g, " ")}`);
  if (++n >= +max) break;
}
