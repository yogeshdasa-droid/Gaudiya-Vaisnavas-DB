// node gen-main.mjs <textos.json> <carpeta>   (11-11-2026) — for batches of short records: writes <carpeta>/main-<id>.md
// from a JSON { "<id>": "<markdown>" }, so that textoprincipal.mjs can read them as usual.
import fs from "node:fs";
const [, , file, dir] = process.argv;
const texts = JSON.parse(fs.readFileSync(file, "utf8"));
fs.mkdirSync(dir, { recursive: true });
for (const [id, md] of Object.entries(texts)) fs.writeFileSync(`${dir}/main-${id}.md`, md.trim() + "\n", "utf8");
console.log(Object.keys(texts).length + " texts → " + dir);
