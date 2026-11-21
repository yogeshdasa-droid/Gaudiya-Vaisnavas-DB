// node bg-pdf.mjs <pdf> <salida.json>   (21-11-2026)
// The verses of Śrīmad Bhagavad-gītā from Śrīla Nārāyaṇa Gosvāmī Mahārāja's edition (PDF, Balaram fonts): after each
// «Verse N» (or «Verses N–M»), the Devanāgarī lines (an old font: left out), the IAST lines, the synonyms (« – ») and
// the translation (up to the commentary «Sārārtha-varṣiṇī…» or the next verse). The chapter goes up when the verses
// start again at 1. → [{ ref: "2.13", lines: […], synonyms, translation }]
import fs from "node:fs";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { balaram } from "./rtf.mjs";
const require = createRequire(new URL("../anthology/extraer/package.json", import.meta.url));
const { getDocument } = await import(pathToFileURL(require.resolve("pdfjs-dist/legacy/build/pdf.mjs")).href);

const [file, outFile] = process.argv.slice(2);
const doc = await getDocument({ data: new Uint8Array(fs.readFileSync(file)), verbosity: 0 }).promise;
const L = [];
const CH = []; // the chapter of each line, from the running header «Chapter N» (it stays until the next one)
let curCh = 0;
for (let n = 1; n <= doc.numPages; n++) {
  const page = await doc.getPage(n);
  const tc = await page.getTextContent();
  let line = "", lastY = null;
  const lines = [];
  for (const it of tc.items) {
    const y = Math.round(it.transform[5]);
    if (lastY !== null && Math.abs(y - lastY) > 2) (lines.push(line), (line = ""));
    line += it.str;
    lastY = y;
  }
  lines.push(line);
  // the page number and the running header are the first two lines; the header of the even pages says «Chapter N»
  const head = lines.slice(0, 3).join(" ");
  const hm = /Chapter (\d+)/.exec(head);
  if (hm) curCh = +hm[1];
  for (const l of lines.slice(2).map((x) => x.trim()).filter(Boolean)) (L.push(l), CH.push(curCh));
}
// a line of the verse in IAST (Balaram letters): only letters, spaces, hyphens and apostrophes, 3 words or more
const BAL = "äÄéÉüÜåÅìÌïÏöÖòÒëËçÇñÑàÀùÙèÿ";
// (no English words, starts in lower case, at least one Balaram letter: not a line of the commentary)
const EN = /\b(the|and|of|to|is|in|that|he|his|was|with|for|this|by|as|be|are|from|who|which|when|it|not|or|an|a)\b/i;
const BAL_RE = new RegExp(`[${BAL}]`);
const isVerseLine = (l) =>
  new RegExp(`^[a-zA-Z${BAL}' ’\\-]+$`).test(l) && l.split(/\s+/).length >= 3 && !EN.test(l) && /^[a-z]/.test(l) && BAL_RE.test(l);
const out = [];
let ch = 0, prev = 0;
for (let i = 0; i < L.length; i++) {
  const m = /^Verses? (\d+)(?:\s*[–-]\s*(\d+))?$/.exec(L[i]);
  if (!m) continue;
  // «Verses 17–20» at the end of a group is a heading of the commentary, not a verse: a verse has IAST lines next
  let j = i + 1;
  while (j < L.length && j < i + 6 && !isVerseLine(L[j])) j++;
  if (j >= L.length || !isVerseLine(L[j])) continue;
  const a = +m[1], b = m[2] ? +m[2] : a;
  // a new chapter when the numbers start again; a «Verse N» of the commentary repeating one already read is left
  if (a < prev && a <= 2) ch++;
  if (out.some((v) => v.ref === `${ch}.${a === b ? a : `${a}-${b}`}`)) continue;
  prev = a;
  const lines = [];
  while (j < L.length && isVerseLine(L[j])) lines.push(balaram(L[j++]));
  // synonyms: up to a line that ends a sentence followed by the translation (lines with « – »)
  const syn = [];
  while (j < L.length && (/ – /.test(L[j]) || (syn.length && !/[.]$/.test(syn[syn.length - 1])))) syn.push(L[j++]);
  const tr = [];
  while (j < L.length && !/^Verses? \d/.test(L[j]) && !/^Särärtha|^SärärTha|^Bhävä       |^Prakäçikä/i.test(L[j]) && tr.join(" ").length < 1500) {
    tr.push(L[j++]);
    if (/[.”’"]$/.test(tr[tr.length - 1]) && /^[A-Z]/.test(L[j] ?? "") === false && /^Särär/.test(L[j] ?? "")) break;
  }
  out.push({
    ref: `${ch}.${a === b ? a : `${a}-${b}`}`,
    lines,
    synonyms: balaram(syn.join(" ").replace(/- /g, "-").replace(/\s+/g, " ").trim()),
    translation: balaram(tr.join(" ").replace(/\s+/g, " ").trim()),
  });
}
const chapters = new Set(out.map((v) => v.ref.split(".")[0])).size;
console.log(`${chapters} capítulos, ${out.length} versos`);
fs.writeFileSync(outFile, JSON.stringify(out, null, 1));
