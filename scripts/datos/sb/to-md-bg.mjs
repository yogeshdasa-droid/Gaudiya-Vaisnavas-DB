// node to-md-bg.mjs <outdir>   (16-11-2026) — bg.json as one Markdown book for «Libros»: «## Chapter N: title»,
// «### BG ch.v», translation, «*Purport.*»; and libros-bg.json, the plan for libros-importar.mjs.
import fs from "node:fs";
import path from "node:path";
const out = process.argv[2];
fs.mkdirSync(out, { recursive: true });
const bg = JSON.parse(fs.readFileSync(new URL("./bg.json", import.meta.url), "utf8"));
let md = `# Bhagavad-gītā As It Is\n\n> With the translation and purports of His Divine Grace A. C. Bhaktivedanta Svāmī Prabhupāda (the text of the book in Info, without diacritics). Each verse under «BG chapter.verse».\n\n`;
let ch = 0;
for (const v of bg) {
  if (v.chapter !== ch) {
    ch = v.chapter;
    md += `## Chapter ${ch}${v.title ? `: ${v.title}` : ""}\n\n`;
  }
  md += `### BG ${v.ref}\n\n${v.tr}\n\n`;
  if (v.purport) md += `*Purport.* ${v.purport}\n\n`;
}
const file = path.join(out, "Bhagavad-gita As It Is.md");
fs.writeFileSync(file, md);
fs.writeFileSync(new URL("../libros-bg.json", import.meta.url), JSON.stringify([{ path: path.resolve(file), title: "Bhagavad-gītā As It Is (A. C. Bhaktivedanta Svāmī Prabhupāda) — English" }], null, 1));
console.log("ok →", file);
