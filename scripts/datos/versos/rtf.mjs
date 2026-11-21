// rtf.mjs — the text of an old RTF of Śrīla Prabhupāda's books (21-11-2026): paragraphs as lines, the Balaram font
// letters as IAST (ä = ā, ç = ś, à = ṁ…, as extract.rs), hidden text (\v) and field instructions left out.
import fs from "node:fs";

// the same table as src-tauri/src/extract.rs
const BALARAM = {
  ä: "ā", Ä: "Ā", é: "ī", É: "Ī", ü: "ū", Ü: "Ū", å: "ṛ", Å: "Ṛ", ì: "ṅ", Ì: "Ṅ", ï: "ñ", Ï: "Ñ", ö: "ṭ", Ö: "Ṭ",
  ò: "ḍ", Ò: "Ḍ", ë: "ṇ", Ë: "Ṇ", ç: "ś", Ç: "Ś", ñ: "ṣ", Ñ: "Ṣ", à: "ṁ", À: "Ṁ", ù: "ḥ", Ù: "Ḥ", è: "ṝ", ÿ: "ḷ",
};
export const balaram = (s) => s.replace(/[äÄéÉüÜåÅìÌïÏöÖòÒëËçÇñÑàÀùÙèÿ]/g, (c) => BALARAM[c]);

/** RTF → plain text, one paragraph per line (cp1252 bytes for \'xx) */
export function rtfText(file) {
  const s = fs.readFileSync(file, "latin1");
  let out = "";
  const stack = [];
  let hidden = false, skip = 0; // skip: depth of a destination group ({\*\…}, fonttbl, stylesheet…)
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "{") { stack.push(hidden); depth++; continue; }
    if (c === "}") { hidden = stack.pop() ?? false; if (skip && depth <= skip) skip = 0; depth--; continue; }
    if (c === "\\") {
      const n = s[i + 1];
      if (n === "'") { if (!skip && !hidden) out += Buffer.from([parseInt(s.slice(i + 2, i + 4), 16)]).toString("latin1"); i += 3; continue; }
      if (n === "\\" || n === "{" || n === "}") { if (!skip && !hidden) out += n; i++; continue; }
      if (n === "*") { if (!skip) skip = depth; i++; continue; }
      if (n === "~") { if (!skip && !hidden) out += " "; i++; continue; }
      if (n === "-" || n === "_") { if (!skip && !hidden) out += n === "_" ? "-" : ""; i++; continue; }
      const m = /^\\([a-z]+)(-?\d+)? ?/.exec(s.slice(i, i + 40));
      if (!m) { i++; continue; }
      const w = m[1], arg = m[2];
      i += m[0].length - 1;
      if (["fonttbl", "colortbl", "stylesheet", "info", "pict", "listtable", "listoverridetable", "rsidtbl", "latentstyles", "datastore", "themedata", "colorschememapping", "xmlnstbl", "generator", "fldinst", "header", "footer"].includes(w)) { if (!skip) skip = depth; continue; }
      if (w === "v") hidden = arg !== "0";
      else if (w === "plain") hidden = false;
      else if (w === "par" || w === "line") { if (!skip && !hidden) out += "\n"; }
      else if (w === "tab") { if (!skip && !hidden) out += " "; }
      else if (w === "emdash") { if (!skip && !hidden) out += "—"; }
      else if (w === "endash") { if (!skip && !hidden) out += "–"; }
      else if (w === "lquote" || w === "rquote") { if (!skip && !hidden) out += "’"; }
      else if (w === "ldblquote" || w === "rdblquote") { if (!skip && !hidden) out += "\""; }
      else if (w === "u") { if (!skip && !hidden) out += String.fromCharCode(((+arg) + 65536) % 65536); if (s[i + 1] === "?") i++; }
      continue;
    }
    if (c === "\r" || c === "\n") continue;
    if (!skip && !hidden) out += c;
  }
  return balaram(out).split("\n").map((l) => l.replace(/\s+/g, " ").trim()).join("\n");
}

if (/[\/]rtf.mjs$/.test(process.argv[1] ?? "")) {
  const t = rtfText(process.argv[2]);
  const i = t.indexOf(process.argv[3] ?? "TEXT 1");
  console.log(t.slice(Math.max(0, i - 300), i + 1500));
}
