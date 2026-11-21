// node sb-rtf.mjs <carpeta con sb*.rtf> <salida.json>   (21-11-2026)
// The verses of Śrīmad-Bhāgavatam from Śrīla Prabhupāda's RTF files (cantos 1, 2, 4–8; 3 and 9 are .doc): for each
// «TEXT n» / «TEXTS n-m»: the verse lines (IAST), the synonyms, the translation. A new chapter starts where the texts
// start again at 1. → [{ ref: "4.1.1", lines: […], synonyms, translation }]
import fs from "node:fs";
import path from "node:path";
import { rtfText } from "./rtf.mjs";

export function sbVerses(text, canto) {
  const L = text.split("\n");
  const out = [];
  let ch = 0, prevFirst = Infinity;
  for (let i = 0; i < L.length; i++) {
    const m = /^TEXTS? (\d+)(?:\s*[-–]\s*(\d+))?$/.exec(L[i].trim());
    if (!m) continue;
    const a = +m[1], b = m[2] ? +m[2] : a;
    if (a <= 1 && prevFirst >= 1) ch++;
    prevFirst = a;
    // verse lines: up to the first blank line (a «… uvāca» line first is part of it)
    let j = i + 1;
    while (j < L.length && !L[j].trim()) j++;
    const lines = [];
    while (j < L.length && L[j].trim() && !/^(SYNONYMS|TRANSLATION)$/.test(L[j].trim()) && !/—/.test(L[j])) lines.push(L[j++].trim());
    while (j < L.length && !L[j].trim()) j++;
    // synonyms: one paragraph with «—»
    let synonyms = "";
    if (j < L.length && /—/.test(L[j]) && L[j].trim() !== "TRANSLATION") synonyms = L[j++].trim();
    while (j < L.length && L[j].trim() !== "TRANSLATION" && !/^TEXTS? \d/.test(L[j].trim())) j++;
    let translation = "";
    if (L[j]?.trim() === "TRANSLATION") {
      j++;
      const t = [];
      while (j < L.length && L[j].trim() !== "PURPORT" && !/^TEXTS? \d/.test(L[j].trim()) && !(t.length && !L[j].trim())) {
        if (L[j].trim()) t.push(L[j].trim());
        j++;
      }
      translation = t.join("\n");
    }
    if (lines.length) out.push({ ref: `${canto}.${ch}.${a === b ? a : `${a}-${b}`}`, lines, synonyms, translation });
  }
  return out;
}

if ((process.argv[1] ?? "").endsWith("sb-rtf.mjs")) {
  const [dir, outFile] = process.argv.slice(2);
  const all = [];
  for (const f of fs.readdirSync(dir).filter((x) => /\.rtf$/i.test(x)).sort()) {
    const canto = +(f.match(/\d+/) ?? [0])[0];
    const v = sbVerses(rtfText(path.join(dir, f)), canto);
    const chapters = new Set(v.map((x) => x.ref.split(".")[1])).size;
    console.log(`${f}: canto ${canto}, ${chapters} capítulos, ${v.length} versos, sin traducción ${v.filter((x) => !x.translation).length}`);
    all.push(...v);
  }
  fs.writeFileSync(outFile, JSON.stringify(all, null, 1));
}
