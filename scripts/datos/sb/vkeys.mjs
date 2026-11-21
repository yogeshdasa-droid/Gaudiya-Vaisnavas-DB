// node vkeys.mjs <nombre> [...]   (21-11-2026) — every «Vaṁśa» key («chart|names from the root, =spouse») whose last
// name starts with one of the names given: to fill the last column of a tanda.
import fs from "node:fs";
const V = JSON.parse(fs.readFileSync(new URL("../../../src/data/vamsa.json", import.meta.url), "utf8"));
const want = process.argv.slice(2);
const out = [];
const walk = (code, node, path) => {
  const p = [...path, node.name];
  if (want.some((w) => node.name.startsWith(w))) out.push(code + "|" + p.join(">"));
  for (const c of node.children ?? []) walk(code, c, p);
  for (const m of node.marriages ?? []) {
    const sp = [...p, "=" + m.spouse];
    if (want.some((w) => m.spouse.startsWith(w))) out.push(code + "|" + sp.join(">"));
    for (const c of m.children ?? []) walk(code, c, sp);
  }
};
const charts = V.charts.flatMap((c) => (c.charts ? c.charts : [c]));
for (const c of charts) if (c.root) walk(c.code ?? c.id, c.root, []);
console.log(out.join("\n"));
