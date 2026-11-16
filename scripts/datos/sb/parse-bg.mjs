// node parse-bg.mjs → bg.json   (16-11-2026) — «Bhagavad gita As It Is.md» of Info, like parse.mjs for the Bhāgavatam:
// «Bg 1.1» line (or «Bg 5.27, Bg 5.28, Bg 5.27 28» = 5.27-28), TEXT, the verse, SYNONYMS, TRANSLATION, then the purport
// after a line ending in «PURPORT» («730707BG.London PURPORT»); «Audio» and «Ref. …» lines left out; chapter titles from
// «Bg 1: Observing the Armies…». Out: [{ ref: "1.1", chapter, verse, tr, purport, title }]
import fs from "node:fs";
const lines = fs.readFileSync("C:/Users/Yoges/Desktop/BIOGRAPHYS/Info/Bhagavad gita As It Is.md", "utf8").replace(/\r\n/g, "\n").split("\n");
const out = [];
const titles = {};
let cur = null;
let part = null;
const push = () => {
  if (cur && cur.tr) out.push({ ...cur, tr: cur.tr.trim(), purport: cur.purport.trim() });
};
for (const l of lines) {
  const m = l.match(/^Bg (\d+)\.(\d+)\s*$/) ?? l.match(/^Bg (\d+)\.\d+(?:, Bg [\d.]+)*, Bg \d+\.(\d+ \d+)\s*$/);
  if (m) {
    push();
    const verse = m[2].replace(" ", "-");
    cur = { ref: `${m[1]}.${verse}`, chapter: +m[1], verse, tr: "", purport: "" };
    part = null;
    continue;
  }
  const t = l.match(/^Bg (\d+): (.+?)\s*$/);
  if (t) {
    titles[t[1]] = t[2];
    continue;
  }
  if (!cur) continue;
  if (/^TRANSLATION\s*$/.test(l)) { part = "tr"; continue; }
  if (/PURPORT\s*$/.test(l)) { part = "purport"; continue; }
  if (/^(TEXTS? [\d\s–-]+|TEXT|SYNONYMS)\s*$/.test(l)) { part = null; continue; }
  if (/^Audio\s*$|^\s*Ref\. |^\d{6}BG\./.test(l)) continue;
  if (part) cur[part] += l + "\n";
}
push();
for (const v of out) v.title = titles[v.chapter] ?? "";
fs.writeFileSync(new URL("./bg.json", import.meta.url), JSON.stringify(out));
const ch = {};
for (const v of out) ch[v.chapter] = (ch[v.chapter] || 0) + 1;
console.log("versos", out.length, JSON.stringify(ch), "títulos", Object.keys(titles).length, "con significado", out.filter((v) => v.purport).length);
