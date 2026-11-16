// node q.mjs <regex> [máx=20] [--title] [--ctx=N]   (16-11-2026) — busca en las charlas de SNM (lib.mjs). Con --title busca
// solo en los títulos y lista las charlas; si no, imprime cada pasaje con su fecha · título y N caracteres de contexto.
import { lectures } from "./lib.mjs";
const args = process.argv.slice(2);
const re = new RegExp(args[0], "i");
const max = +(args.find((a) => /^\d+$/.test(a)) ?? 20);
const onlyTitle = args.includes("--title");
const ctx = +(args.find((a) => a.startsWith("--ctx="))?.slice(6) ?? 300);
let n = 0;
for (const l of lectures()) {
  if (onlyTitle) { if (re.test(l.title)) { console.log(`${l.date} · ${l.title} | ${l.place} | ${l.text.length} chars`); if (++n >= max) break; } continue; }
  const t = l.text.replace(/\s+/g, " ");
  const g = new RegExp(args[0], "gi");
  let m;
  while ((m = g.exec(t))) {
    console.log(`\n[${l.date} · ${l.title}] …${t.slice(Math.max(0, m.index - ctx), m.index + ctx)}…`);
    if (++n >= max) process.exit(0);
  }
}
