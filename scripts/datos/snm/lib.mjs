// Las charlas de los libros «Lectures SNM md» (to-md.mjs), una por «## <fecha> · <título>»: [{ book, date, title, place, text }]
import fs from "node:fs";
import path from "node:path";
export const DIR = path.join(process.env.USERPROFILE, "Documents", "Gaudiya Vaisnavas DB", "Lectures SNM md");
export const lectures = () => {
  const out = [];
  for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith(".md"))) {
    const raw = fs.readFileSync(path.join(DIR, f), "utf8");
    const book = raw.match(/^# (.*)$/m)?.[1] ?? f;
    const parts = raw.split(/^## /m).slice(1);
    for (const p of parts) {
      const nl = p.indexOf("\n");
      const head = p.slice(0, nl).trim();
      const body = p.slice(nl + 1).trim();
      const m = head.match(/^(\d{4}-\d\d(?:-\d\d)?)\s*·\s*(.*)$/);
      const place = body.match(/^\*([^*\n]+)\*/)?.[1] ?? "";
      out.push({ book, date: m?.[1] ?? "", title: m?.[2] ?? head, place, text: body });
    }
  }
  return out;
};
// texto plano comparable: sin diacríticos, minúsculas, sin signos, espacios simples
export const norm = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[’'`´"“”*_]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
