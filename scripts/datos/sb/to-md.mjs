// node to-md.mjs <outdir>   (16-11-2026) — the 12 cantos of sb.json as Markdown for «Libros»: one file per canto,
// «## Chapter N», «### SB c.ch.v», the translation, and the purport after «*Purport.*». Plus libros-sb.json, the plan
// for libros-importar.mjs (same folder as this script).
import fs from "node:fs";
import path from "node:path";
const out = process.argv[2];
fs.mkdirSync(out, { recursive: true });
const sb = JSON.parse(fs.readFileSync(new URL("./sb.json", import.meta.url), "utf8"));
const summaries = JSON.parse(fs.readFileSync(new URL("./sb-summaries.json", import.meta.url), "utf8"));
const NAMES = {
  1: "Creation", 2: "The Cosmic Manifestation", 3: "The Status Quo", 4: "The Creation of the Fourth Order", 5: "The Creative Impetus",
  6: "Prescribed Duties for Mankind", 7: "The Science of God", 8: "Withdrawal of the Cosmic Creations", 9: "Liberation",
  10: "The Summum Bonum", 11: "General History", 12: "The Age of Deterioration",
};
const plan = [];
for (let c = 1; c <= 12; c++) {
  const vs = sb.filter((v) => v.canto === c);
  let md = `# Śrīmad-Bhāgavatam — Canto ${c}: ${NAMES[c]}\n\n> With the translation and purports of His Divine Grace A. C. Bhaktivedanta Svāmī Prabhupāda (the text of the book in Info, without diacritics). Each verse under «SB ${c}.chapter.verse».\n\n`;
  let ch = 0;
  for (const v of vs) {
    if (v.chapter !== ch) {
      ch = v.chapter;
      md += `## Chapter ${ch}${v.title ? `: ${v.title}` : ""}\n\n`;
      const sum = summaries[`${c}.${ch}`];
      if (sum) md += `*Summary.* ${sum}\n\n`;
    }
    md += `### SB ${v.ref}\n\n${v.tr}\n\n`;
    if (v.purport) md += `*Purport.* ${v.purport}\n\n`;
  }
  const file = path.join(out, `SB Canto ${String(c).padStart(2, "0")}.md`);
  fs.writeFileSync(file, md);
  plan.push({ path: path.resolve(file), title: `Śrīmad-Bhāgavatam — Canto ${c}: ${NAMES[c]} (A. C. Bhaktivedanta Svāmī Prabhupāda) — English` });
}
fs.writeFileSync(new URL("../libros-sb.json", import.meta.url), JSON.stringify(plan, null, 1));
console.log(plan.length, "cantos →", out);
