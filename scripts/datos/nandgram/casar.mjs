// node casar.mjs — matches each life of the website (datos.json) with a record (fichas.json). Writes casar.json
// [{slug, title, id, name, score, others}] and prints the table to check by eye.
import fs from "node:fs";
const dir = new URL(".", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const datos = JSON.parse(fs.readFileSync(dir + "datos.json", "utf8"));
const fichas = JSON.parse(fs.readFileSync(dir + "fichas.json", "utf8"));

const TITLES = new Set("sri srila srimati sriman lord thakura thakur goswami gosvami goswamini prabhu pandita pandit acarya acharya devi mata maharaja maharaj babaji dasa das dvija vipra brahmana the of and".split(" "));
// «Kṛṣṇa» and «Krishna» to the same key: no diacritics, no h, simple vowels, ś/ṣ/s alike, c/ch alike, v/b alike
const key = (w) =>
  w
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/sh/g, "s")
    .replace(/ch/g, "c")
    .replace(/h/g, "")
    .replace(/w/g, "v")
    .replace(/b/g, "v")
    .replace(/([aeiou])\1+/g, "$1")
    .replace(/[^a-z]/g, "");
const words = (s) =>
  s
    .replace(/\([^)]*\)/g, " ")
    .split(/[\s,;/.-]+/)
    .map(key)
    .filter((w) => w.length >= 2 && !TITLES.has(w));
const joined = (s) => words(s).join("");

const out = [];
for (const [slug, d] of Object.entries(datos)) {
  const names = [d.title, ...(d.facts["Also known as"] ?? "").split(/[,;]/)].map((x) => x.trim()).filter(Boolean);
  const nameKeys = names.map(joined).filter((k) => k.length >= 4);
  const scored = [];
  for (const f of fichas) {
    const mine = [f.name, ...f.aka.split(",")].map((x) => x.trim()).filter(Boolean);
    const myKeys = mine.map(joined).filter((k) => k.length >= 4);
    let s = 0;
    // the record's name or other names = the website's (whole)
    if (myKeys.some((k) => nameKeys.includes(k))) s = 100;
    else if (myKeys[0] && nameKeys[0] && (myKeys[0].includes(nameKeys[0]) || nameKeys[0].includes(myKeys[0]))) s = 60;
    if (!s) continue;
    if (f.tree) s += 10; // the website is about the paramparā and the associates
    if (/\(/.test(f.name)) s -= 30; // a namesake «(disciple of …)»
    s += Math.min(f.docs, 8);
    scored.push({ id: f.id, name: f.name, s });
  }
  scored.sort((a, b) => b.s - a.s);
  out.push({ slug, title: d.title, id: scored[0]?.id ?? null, name: scored[0]?.name ?? "", score: scored[0]?.s ?? 0, others: scored.slice(1, 4).map((x) => `${x.id} ${x.name} (${x.s})`) });
}
fs.writeFileSync(dir + "casar.json", JSON.stringify(out, null, 1));
for (const o of out) console.log(`${o.score >= 100 ? "  " : "??"} ${o.slug.padEnd(34)} → ${o.id ?? "—"} ${o.name}${o.others.length ? "   | otras: " + o.others.join("; ") : ""}`);
console.log("sin ficha:", out.filter((o) => !o.id).length, "| dudosas:", out.filter((o) => o.id && o.score < 100).length);
