// node parse.mjs → sb.json   (16-11-2026, Whisper: «tú decides cómo hacerlo mejor» — the Śrīmad-Bhāgavatam in Info)
// The 12 cantos («Canto N ….md», no diacritics): after a list of the verses, each verse in full: «SB c.ch.v» line,
// TEXT, the verse, SYNONYMS, TRANSLATION, PURPORT. Out: [{ ref: "9.1.8", canto, chapter, verse, tr, purport }]
// (a verse that joins several, «SB 9.1.2-3», keeps its ref as the book gives it).
import fs from "node:fs";
const INFO = "C:/Users/Yoges/Desktop/BIOGRAPHYS/Info/";
const files = fs.readdirSync(INFO).filter((f) => /^Canto \d+ .*\.md$/.test(f));
const out = [];
const titles = {};
const summaries = {};
let sumKey = null;
for (const f of files) {
  const lines = fs.readFileSync(INFO + f, "utf8").replace(/\r\n/g, "\n").split("\n");
  let cur = null;
  let part = null;
  const push = () => {
    if (cur && (cur.tr || cur.purport)) out.push({ ...cur, tr: cur.tr.trim(), purport: cur.purport.trim() });
  };
  for (const l of lines) {
    // one verse «SB 9.1.8», or several joined «SB 9.1.2, SB 9.1.2, SB 9.1.2 3» (= 9.1.2-3)
    const m = l.match(/^SB (\d+)\.(\d+)\.(\d+)\s*$/) ?? l.match(/^SB (\d+)\.(\d+)\.\d+(?:, SB [\d.]+)*, SB \d+\.\d+\.(\d+ \d+)\s*$/);
    if (m) {
      push();
      sumKey = null;
      const verse = m[3].replace(" ", "-");
      cur = { ref: `${m[1]}.${m[2]}.${verse}`, canto: +m[1], chapter: +m[2], verse, tr: "", purport: "" };
      part = null;
      continue;
    }
    // a chapter's title: «SB 1.8: Prayers by Queen Kunti and Pariksit Saved»
    const t = l.match(/^SB (\d+)\.(\d+): (.+?)\s*$/);
    if (t) {
      titles[`${t[1]}.${t[2]}`] = t[3];
      continue;
    }
    // a chapter's summary: «SB 5.3 Summary» and its text, up to the next verse
    const su = l.match(/^SB (\d+)\.(\d+) Summary\s*$/);
    if (su) {
      push();
      cur = null;
      sumKey = `${su[1]}.${su[2]}`;
      summaries[sumKey] = "";
      continue;
    }
    if (!cur) {
      if (sumKey) summaries[sumKey] += l + "\n";
      continue;
    }
    if (/^TRANSLATION\s*$/.test(l)) { part = "tr"; continue; }
    if (/^PURPORT\s*$/.test(l)) { part = "purport"; continue; }
    if (/^(TEXTS? [\d\s–-]+|TEXT|SYNONYMS)\s*$/.test(l)) { part = null; continue; }
    if (part) cur[part] += l + "\n";
  }
  push();
}
out.sort((a, b) => a.canto - b.canto || a.chapter - b.chapter || parseInt(a.verse) - parseInt(b.verse));
for (const v of out) v.title = titles[`${v.canto}.${v.chapter}`] ?? "";
fs.writeFileSync(new URL("./sb-summaries.json", import.meta.url), JSON.stringify(Object.fromEntries(Object.entries(summaries).map(([k, t]) => [k, t.trim()]).filter(([, t]) => t))));
console.log("resúmenes", Object.keys(summaries).length);
fs.writeFileSync(new URL("./sb.json", import.meta.url), JSON.stringify(out));
console.log("títulos", Object.keys(titles).length);
const by = {};
for (const v of out) by[v.canto] = (by[v.canto] || 0) + 1;
console.log("versos", out.length, JSON.stringify(by), "sin traducción", out.filter((v) => !v.tr).length, "con significado", out.filter((v) => v.purport).length);
