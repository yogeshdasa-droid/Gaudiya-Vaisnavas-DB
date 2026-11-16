// node match.mjs → match-out.json + a summary   (16-11-2026) — each name of «Vaṁśa» (src/data/vamsa.json) in the
// Śrīmad-Bhāgavatam (sb.json): the verses whose TRANSLATION names it AND, in the same verse or up to 3 verses around in
// the same chapter, one of its relatives of the tree (father, mother, son, daughter, wife, husband). Names without
// diacritics on both sides (the book has none). Key of a name: «<chart>|<names from the root, «=» for a wife/husband>»,
// the same key Vamsa.tsx builds.
import fs from "node:fs";
const raw = JSON.parse(fs.readFileSync(new URL("../../../src/data/vamsa.json", import.meta.url), "utf8"));
const sb = JSON.parse(fs.readFileSync(new URL("./sb.json", import.meta.url), "utf8"));

const fold = (s) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const cleanCode = (c) => (c ? c.replace(/-/g, "") : undefined);

// the trees, as Vamsa.tsx builds them
const charts = [];
const node = (r, parent, spouse = false) => {
  const v = { name: (spouse ? r.spouse : r.name) ?? "?", spouse, children: [], parent };
  for (const c of [...(r.children ?? []), ...(r.daughters ?? [])]) v.children.push(node(c, v));
  for (const m of r.marriages ?? []) v.children.push(node(m, v, true));
  return v;
};
const add = (key, root) => charts.push({ key, root: node(root) });
for (const c of raw.charts) {
  if (c.root) add(c.id ?? c.name, c.root);
  (c.charts ?? []).forEach((s, i) => s.root && add(cleanCode(s.code) ?? `${c.id}-${i + 1}`, s.root));
  for (const [k, v] of Object.entries(c)) if (k.startsWith("parallel_line") && v && typeof v === "object") add(`${c.id}-${k}`, v);
}
export const keyOf = (chart, v) => {
  const names = [];
  for (let p = v; p; p = p.parent) names.unshift((p.spouse ? "=" : "") + p.name);
  return chart + "|" + names.join(">");
};

// the forms of a name to look for: «Kakutstha (Purañjaya)» → kakutstha, puranjaya; «1. Dhātā» → dhata
const forms = (name) => {
  const out = new Set();
  const base = name.replace(/^\d+\.\s*/, "");
  const main = fold(base.replace(/\([^)]*\)/g, " "));
  if (main) out.add(main);
  for (const m of base.matchAll(/\(([^)]*)\)/g)) for (const p of m[1].split(/[,/;]| or /)) { const f = fold(p); if (f && !/\b(sons?|daughters?|given|below|code|line|of|the)\b/.test(f)) out.add(f); }
  // groups and notes are not names
  return [...out].filter((f) => f.length >= 3 && !/\b(sons|daughters|others|wives|children|prominent)\b/.test(f));
};
const words = sb.map((v) => " " + fold(v.tr) + " ");
const has = (i, f) => words[i].includes(" " + f + " ");
// a form in many verses (Kṛṣṇa, Brahmā, dharma, soma…) only counts with the relative in the same verse
const freq = new Map();
const common = (f) => {
  if (!freq.has(f)) { let n = 0; for (let i = 0; i < words.length && n <= 120; i++) if (has(i, f)) n++; freq.set(f, n); }
  return freq.get(f) > 120;
};
const near = (i, fs, own) => {
  if (fs.some((f) => has(i, f))) return true;
  if (own.some(common)) return false;
  fs = fs.filter((f) => !common(f));
  for (let j = Math.max(0, i - 3); j <= Math.min(sb.length - 1, i + 3); j++)
    if (sb[j].canto === sb[i].canto && sb[j].chapter === sb[i].chapter && fs.some((f) => has(j, f))) return true;
  return false;
};

const result = {};
let names = 0, found = 0;
for (const c of charts) {
  const walk = (v) => {
    const own = forms(v.name);
    // its relatives: parent (through a marriage node, the person above it too), children, the spouse nodes
    const rel = [];
    if (v.parent) {
      rel.push(...forms(v.parent.name));
      if (v.parent.spouse && v.parent.parent) rel.push(...forms(v.parent.parent.name));
    }
    for (const ch of v.children) {
      rel.push(...forms(ch.name));
      if (ch.spouse) for (const g of ch.children) rel.push(...forms(g.name));
    }
    const relF = rel.filter((f) => !own.includes(f));
    if (own.length) {
      names++;
      const hits = [];
      for (let i = 0; i < sb.length; i++) if (own.some((f) => has(i, f)) && relF.length && near(i, relF, own)) hits.push(sb[i].ref);
      if (hits.length) {
        found++;
        result[keyOf(c.key, v)] = hits;
      }
    }
    v.children.forEach(walk);
  };
  walk(c.root);
}
fs.writeFileSync(new URL("./match-out.json", import.meta.url), JSON.stringify(result, null, 1));
const counts = Object.values(result).map((h) => h.length);
console.log("nombres", names, "con versos", found, "versos por nombre: mediana", counts.sort((a, b) => a - b)[Math.floor(counts.length / 2)], "máx", counts[counts.length - 1]);
const cantos = {};
for (const h of Object.values(result)) for (const r of h) cantos[r.split(".")[0]] = (cantos[r.split(".")[0]] || 0) + 1;
console.log("por canto", JSON.stringify(cantos));
for (const k of Object.keys(result).filter((k) => /Dhruva|Prahl|Ambar|Pṛthu$|>Bharata$|Ikṣvāku$|Yayāti$/.test(k)).slice(0, 12)) console.log(k.split(">").slice(-2).join(">"), result[k].slice(0, 8).join(" "), result[k].length);
