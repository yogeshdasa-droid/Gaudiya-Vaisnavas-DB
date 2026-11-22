import { DatabaseSync } from "node:sqlite";
const db = new DatabaseSync(process.env.APPDATA + "/com.whispers.biodata/biodata.db", { readOnly: true });
const IAST = /[āīūṛṝḷḹṅñṭḍṇśṣṁṃḥ]/i;
const EN = new Set("the of and to in a is that for it as with was his her he she they them this are by on be at or from not have had has but which who whom what when where there their its we you your our one all were been so if then than also can will would may shall should do does did no yes my me him us i an any these those into upon unto only more most such very because by through about over again said say says like him how why while without within between each other another both many much some own same too just now here out up down off after before however therefore thus even still must let make made take taken give given see seen know known come came go went gone get got called named lord sri srila śrī śrīla krsna kṛṣṇa chapter verse text purport translation".split(" "));
const isSk = (w) => { const b = w.replace(/[^\p{L}\-]/gu, ""); if (!b) return null; if (IAST.test(b)) return true; const l = b.toLowerCase(); if (EN.has(l)) return false; if (/^[A-Z]/.test(b) && b.length > 3 && !b.includes("-")) return false; return b.includes("-") || b.length <= 3 ? "maybe" : /^[a-z]+$/.test(b) && !/[aeiou]{3}|th|ing$|tion|ly$|ed$|s$/.test(b) ? "maybe" : false; };
export function runs(text) {
  const out = [];
  for (const para of text.split(/\n{1,}/)) {
    const toks = para.split(/\s+/).filter(Boolean);
    let i = 0;
    while (i < toks.length) {
      if (isSk(toks[i]) !== true) { i++; continue; }
      let j = i, last = i;
      while (j < toks.length) { const k = isSk(toks[j]); if (k === false) break; if (k === true) last = j; j++; }
      const run = toks.slice(i, last + 1);
      const dia = run.filter((w) => isSk(w) === true).length;
      if (run.length >= 8 && dia / run.length >= 0.5) out.push(run.join(" "));
      i = last + 1;
    }
  }
  return out;
}
if (process.argv[1].endsWith("indice-runs.mjs")) {
  const rows = db.prepare("SELECT s.text,d.title FROM sections s JOIN docs d ON d.id=s.doc_id WHERE d.deleted IS NULL AND d.dir LIKE 'Libros/Nārāyaṇa Mahārāja' AND d.title LIKE ?").all(process.argv[2] || "%Giti-Guccha%");
  let n = 0; for (const r of rows) for (const v of runs(r.text)) { if (n++ < 25) console.log("•", v.slice(0, 170)); }
  console.log("total runs", n, "sections", rows.length);
}
