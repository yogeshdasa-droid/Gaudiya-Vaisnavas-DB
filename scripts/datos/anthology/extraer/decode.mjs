// decode.mjs — Bhakta Bandhav Anthology PDFs: per page, lines {size, text}; fonts with letters below code 94 are «shifted» (+29)
import { getDocument, OPS } from "pdfjs-dist/legacy/build/pdf.mjs";
import fs from "node:fs";
export const SPECIAL = { 194: "Ā", 195: "ā", 237: "ī", 284: "Ś", 285: "ś", 301: "ū", 408: "ṅ", 410: "ṇ", 412: "ṛ", 414: "ṣ", 415: "Ṭ",
  418: "—", 419: "‘", 420: "’", 422: "“", 423: "”", 428: "…", 602: "ṁ", 606: "ṇ", 608: "ṛ", 610: "ṣ", 612: "ṭ", 376: "Ṛ", 378: "Ṣ", 380: "Ṇ" };
export async function decodePdf(file, { from = 1, to = 1e9 } = {}) {
  const doc = await getDocument({ data: new Uint8Array(fs.readFileSync(file)), verbosity: 0 }).promise;
  const pages = [];
  for (let n = from; n <= Math.min(doc.numPages, to); n++) {
    const page = await doc.getPage(n);
    const ol = await page.getOperatorList();
    // first pass: for each font, which reading gives English — its own letters (g.unicode) or the code shifted by 29
    const asIs = {}, shifted = {};
    let font = "";
    for (let i = 0; i < ol.fnArray.length; i++) {
      if (ol.fnArray[i] === OPS.setFont) font = ol.argsArray[i][0];
      else if (ol.fnArray[i] === OPS.showText) for (const g of ol.argsArray[i][0]) {
        if (!g) continue;
        if (typeof g === "number") { if (g < -200) { asIs[font] = (asIs[font] || "") + " "; shifted[font] = (shifted[font] || "") + " "; } continue; }
        const c = g.originalCharCode;
        asIs[font] = (asIs[font] || "") + (g.unicode ?? "");
        shifted[font] = (shifted[font] || "") + (c === 3 ? " " : c > 3 && c < 94 ? String.fromCharCode(c + 29) : "");
      }
    }
    // which reading looks like words: function words and vowels count, odd symbols count against
    const english = (s) =>
      ((s || "").match(/\b(the|and|of|to|is|in|that|you|we|it|he|this|was|for|not|are|with)\b/gi) || []).length * 5 +
      ((s || "").match(/[aeiouAEIOU]/g) || []).length -
      ((s || "").match(/[%$&\\\/<>\[\]{}|@#=^~0-9]/g) || []).length * 2;
    const low = {}, high = {};
    for (const f of Object.keys(asIs)) if (english(shifted[f]) > english(asIs[f])) low[f] = 1; else high[f] = 1;
    const runs = [];
    let size = 0, y = null, x = 0;
    font = "";
    for (let i = 0; i < ol.fnArray.length; i++) {
      const fn = ol.fnArray[i], a = ol.argsArray[i];
      if (fn === OPS.setFont) { font = a[0]; size = a[1]; }
      else if (fn === OPS.setTextMatrix) { y = a[5]; x = a[4]; }
      else if (fn === OPS.moveText || fn === OPS.setLeadingMoveText) { y = (y ?? 0) + a[1]; x += a[0]; }
      else if (fn === OPS.nextLine) { y = null; }
      else if (fn === OPS.showText) {
        const sh = (low[font] || 0) > (high[font] || 0);
        let s = "", bad = 0, all = 0;
        for (const g of a[0]) {
          if (typeof g === "number") { if (g < -200) s += " "; continue; }
          if (!g) continue;
          const c = g.originalCharCode; all++;
          if (sh) {
            if (c === 3) s += " ";
            else if (c > 3 && c < 94) s += String.fromCharCode(c + 29);
            else if (SPECIAL[c]) s += SPECIAL[c];
            else if (g.unicode && /^[\p{P}\p{L}\p{N} ]$/u.test(g.unicode) && c < 300) s += g.unicode;
            else bad++;
          } else s += g.unicode ?? "";
        }
        if (all && bad / all > 0.3) continue; // Bengali / Devanagari / ornaments
        runs.push({ z: Math.round(size * 10) / 10, y: y === null ? null : Math.round(y), x: Math.round(x), t: s });
      }
    }
    // lines: a new line when y changes
    const lines = [];
    let cur = null;
    for (const r of runs) {
      if (!cur || (r.y !== null && cur.y !== null && Math.abs(r.y - cur.y) > 1)) { cur = { y: r.y, z: r.z, x: r.x, t: "" }; lines.push(cur); }
      cur.t += r.t; cur.z = Math.max(cur.z, r.z);
    }
    pages.push(lines.map((l) => ({ z: l.z, x: l.x, y: l.y, t: l.t.replace(/\s+/g, " ").trim() })).filter((l) => l.t));
    page.cleanup();
  }
  return pages;
}
if ((process.argv[1] ?? "").endsWith("decode.mjs")) {
  const [, , file, from = "1", to = "30"] = process.argv;
  const pages = await decodePdf(file, { from: +from, to: +to });
  pages.forEach((ls, i) => console.log(`=== p${+from + i}\n` + ls.map((l) => `[x${l.x} y${l.y}] ${l.t}`).join("\n").slice(0, 1200)));
}
