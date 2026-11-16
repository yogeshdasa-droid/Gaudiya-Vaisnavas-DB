// node fix-dup.mjs <plan.json> → <plan>-dup.json : para cada [old, new] en que new acaba en old, quita la repetición W+W → W.
import fs from "node:fs";
const f = process.argv[2];
const plan = JSON.parse(fs.readFileSync(f, "utf8"));
const out = plan.map((g) => ({ ...g, replace: g.replace.filter(([a, b]) => b.endsWith(a)).map(([a, b]) => { const w = b.slice(0, b.length - a.length); return [w + w, w]; }) }));
fs.writeFileSync(f.replace(/\.json$/, "-dup.json"), JSON.stringify(out));
console.log(out.map((g) => g.id + ": " + g.replace.length).join(", "));
