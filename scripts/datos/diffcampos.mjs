// node diffcampos.mjs <before.db> <after.db> → fields guru/disciples changed; entries written twice
import { DatabaseSync } from "node:sqlite";
const [, , a, b] = process.argv;
const A = new DatabaseSync(a, { readOnly: true }), B = new DatabaseSync(b, { readOnly: true });
const get = (db) => new Map(db.prepare("select id,name,guru,disciples from persons").all().map((r) => [r.id, r]));
const pa = get(A), pb = get(B);
const entries = (s) => (s ?? "").split(/[;,\n]/).map((x) => x.trim()).filter(Boolean);
let changed = 0, dups = 0;
const out = [];
for (const [id, r] of pb) {
  const o = pa.get(id);
  if (!o) continue;
  for (const f of ["guru", "disciples"]) {
    if ((o[f] ?? "") === (r[f] ?? "")) continue;
    changed++;
    const old = new Set(entries(o[f]));
    const added = entries(r[f]).filter((x) => !old.has(x));
    const seen = new Map();
    for (const x of entries(r[f])) seen.set(x, (seen.get(x) ?? 0) + 1);
    const twice = [...seen].filter(([, n]) => n > 1).map(([x]) => x);
    if (twice.length) dups++;
    out.push(`${id} ${r.name} [${f}] +${added.join(" | ")}${twice.length ? "  ‼ TWICE: " + twice.join(" | ") : ""}`);
  }
}
console.log("fields changed:", changed, "| fields with an entry twice:", dups);
console.log(out.filter((l) => l.includes("TWICE")).join("\n"));
