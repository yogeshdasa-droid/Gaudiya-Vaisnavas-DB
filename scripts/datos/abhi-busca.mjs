// node abhi-busca.mjs <db> <ids...>   (12-11-2026, «los lugares» por el Abhidhāna)
// For each record: its name in Bengali letters (from IAST) and the Abhidhāna entries that begin with it (the head is
// the name followed by «_», «-», «—»), with the lines after, where «শ্রীপাট» (śrīpāṭa) or «বাস» tell where they lived.
// The OCR mixes two columns and misreads letters: read every entry by hand.
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
const [, , file, ...ids] = process.argv;
const ABHI = path.join(process.env.USERPROFILE, "Desktop", "BIOGRAPHYS", "Abhidhana_Part3_Biographies_Bengali.txt");
const lines = fs.readFileSync(ABHI, "utf8").split(/\r?\n/);

const V = { a: "", ā: "া", i: "ি", ī: "ী", u: "ু", ū: "ূ", ṛ: "ৃ", e: "ে", ai: "ৈ", o: "ো", au: "ৌ" };
const IV = { a: "অ", ā: "আ", i: "ই", ī: "ঈ", u: "উ", ū: "ঊ", ṛ: "ঋ", e: "এ", ai: "ঐ", o: "ও", au: "ঔ" };
const C = { kh: "খ", gh: "ঘ", ch: "ছ", jh: "ঝ", ṭh: "ঠ", ḍh: "ঢ", th: "থ", dh: "ধ", ph: "ফ", bh: "ভ",
  k: "ক", g: "গ", ṅ: "ঙ", c: "চ", j: "জ", ñ: "ঞ", ṭ: "ট", ḍ: "ড", ṇ: "ণ", t: "ত", d: "দ", n: "ন", p: "প", b: "ব",
  m: "ম", y: "য", r: "র", l: "ল", v: "ব", w: "ব", ś: "শ", ṣ: "ষ", s: "স", h: "হ" };
/** IAST → Bengali letters (a plain word; the OCR's «শ্রী» is often «ত্রী»/«গ্রী», so «Śrī» is left out). */
export function beng(word) {
  const w = word.normalize("NFC").toLowerCase();
  let out = "", i = 0, prevCons = false;
  const take = (tbl) => { for (const k of Object.keys(tbl).sort((a, b) => b.length - a.length)) if (w.startsWith(k, i)) return k; return null; };
  while (i < w.length) {
    const c = take(C);
    if (c) { if (prevCons) out += "্"; out += c === "y" && !prevCons && i > 0 ? "য়" : C[c]; i += c.length; prevCons = true; continue; }
    const v = take(V);
    if (v) { out += prevCons ? V[v] : IV[v]; i += v.length; prevCons = false; continue; }
    if (w[i] === "ṁ" || w[i] === "ṃ") { out += "ং"; prevCons = false; i++; continue; }
    if (w[i] === "ḥ") { out += "ঃ"; prevCons = false; i++; continue; }
    out += w[i]; prevCons = false; i++;
  }
  return out;
}

const db = new DatabaseSync(file, { readOnly: true });
for (const id of ids.map(Number)) {
  const p = db.prepare("select name, aka, guru from persons where id=?").get(id);
  const core = p.name.replace(/\(.*?\)/g, "").replace(/\bŚrī(la|mat|matī)?\b|\bṬhākura\b|\bPrabhu\b/g, "").trim();
  const words = core.split(/\s+/).filter(Boolean);
  const head = words.map(beng).join(" ");
  const first = beng(words[0]);
  console.log(`\n######## ${id} ${p.name}  [guru: ${p.guru ?? ""}]  → ${head}`);
  let n = 0;
  for (let k = 0; k < lines.length && n < 4; k++) {
    const L = lines[k];
    // an entry head: the (first) name, then «_», «-», «—» close after
    const probe = [...first].slice(1).join(""); // the OCR often spoils the first letter
    let at = L.indexOf(first);
    if (at < 0) { const b = L.indexOf(probe); at = b >= 1 && b <= 4 ? b - 1 : -1; }
    if (at < 0 || at > 3) continue;
    const rest = L.slice(at + first.length, at + first.length + 25);
    if (!/^[^\s।]{0,12}\s?(\S+\s)?[_\-—–]/.test(rest)) continue;
    n++;
    const ctx = lines.slice(k, k + 14).filter((x) => x.trim()).join(" ¦ ");
    console.log(`  @${k}: ${ctx.slice(0, 700)}`);
  }
  if (!n) console.log("  (no head found)");
}
