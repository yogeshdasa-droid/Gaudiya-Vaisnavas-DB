// node charlas-md.mjs <carpeta de .db> <carpeta destino> [--dry]   (21-11-2026, Whisper: «Lectures & Classes» y
// «Conversations & Walks» de «Vedabase Original» en la Biblioteca de Śrīla Prabhupāda)
// The packs «lectures» and «conversations» (unpacked with unpack.mjs from %LOCALAPPDATA%\com.jaganat.vedabase) →
// one .md per talk in <destino>/<Lectures & Classes | Conversations & Walks>/<sección>/<año>/
// «AAAA-MM-DD Título (Lugar).md»: «# título», a line with date · place · kind, then the text (verses as
// «::: verse» blocks, italics/bold kept, verse links as plain text). A file already there is not touched.
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
const [dir, dest] = process.argv.slice(2);
const dry = process.argv.includes("--dry");
const PACKS = { lectures: "Lectures & Classes", conversations: "Conversations & Walks" };
const PLACE = {
  vrn: "Vṛndāvana", la: "Los Angeles", bom: "Bombay", may: "Māyāpur", lon: "London", hon: "Honolulu", hyd: "Hyderabad",
  nv: "New Vrindaban", tok: "Tokyo", mel: "Melbourne", ny: "New York", sf: "San Francisco", cal: "Calcutta", del: "Delhi",
  chi: "Chicago", par: "Paris", det: "Detroit", mex: "Mexico City", ahm: "Ahmedabad", dal: "Dallas", sto: "Stockholm",
  gen: "Geneva", teh: "Tehran", den: "Denver", nai: "Nairobi", tor: "Toronto", bhu: "Bhubaneswar", per: "Perth",
  rom: "Rome", dur: "Durban", mon: "Montreal", bos: "Boston", sea: "Seattle", ams: "Amsterdam", ber: "Berkeley",
  hk: "Hong Kong", jo: "Johannesburg", man: "Manila", ldn: "London", syd: "Sydney", aus: "Australia", fra: "Frankfurt",
  jai: "Jaipur", gor: "Gorakhpur", all: "Allahabad", sur: "Surat", ind: "Indore", hou: "Houston", atl: "Atlanta",
  phi: "Philadelphia", sd: "San Diego", ath: "Atlanta", ksr: "Kurukshetra", kur: "Kurukshetra", nel: "Nellore",
  mad: "Madras", ban: "Bangalore", cha: "Chandigarh", mau: "Mauritius", fij: "Fiji", ger: "Germany",
};
const KIND = /^(sb|bg|cc|nd|ip|pu|bs|noi|r\d|mw|le|in|gc|mu|ed|ad|ar|dc|iv|wa|ini|lec|con)/;
const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
const inline = (h) =>
  decode(
    h.replace(/<a [^>]*>([\s\S]*?)<\/a>/g, "$1")
      .replace(/<strong>\s*([\s\S]*?)\s*<\/strong>/g, (_, x) => (x.trim() ? `**${x.trim()}**` : ""))
      .replace(/<em>\s*([\s\S]*?)\s*<\/em>/g, (_, x) => (x.trim() ? `*${x.trim()}*` : ""))
      .replace(/<br\s*\/?>/g, "  \n")
      .replace(/<[^>]+>/g, ""),
  ).replace(/\*\*\*\*/g, "").replace(/[ \t]+\n/g, "  \n")
    // the source writes «:» as « = » and «—» as «---»
    .replace(/ = /g, ": ").replace(/---/g, "—").trim();
function toMd(blocks) {
  const out = [];
  for (const b of JSON.parse(blocks || "[]")) {
    let h = b.html || "";
    // the verses: centred italic div with the lines split by <br/>
    h = h.replace(/<div style="text-align:center;font-style:italic[^"]*">([\s\S]*?)<\/div>/g, (_, v) => {
      const lines = v.split(/<br\s*\/?>/).map((l) => decode(l.replace(/<[^>]+>/g, "")).trim()).filter(Boolean);
      return `\u0000::: verse\n${lines.join("\n")}\n:::\u0000`;
    });
    for (const part of h.split("\u0000")) {
      if (part.startsWith("::: verse")) out.push(part);
      else { const t = inline(part); if (t) out.push(b.type === "heading" ? `## ${t}` : t); }
    }
  }
  return out.join("\n\n") + "\n";
}
const safe = (s) => s.replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, " ").trim().slice(0, 120).replace(/[ .]+$/, "");
function place(code) {
  if (code.includes("-")) return code.split("-").filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
  return PLACE[code] || "";
}

let wrote = 0, kept = 0;
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".db"))) {
  const db = new DatabaseSync(path.join(dir, f), { readOnly: true });
  const id = db.prepare("SELECT value FROM meta WHERE key='pack_id'").get()?.value;
  if (!PACKS[id]) { db.close(); continue; }
  const sections = new Map(db.prepare("SELECT key, title_en FROM toc WHERE type='section'").all().map((r) => [r.key, r.title_en]));
  const rows = db.prepare("SELECT t.key, t.parent_key, t.title_en, c.blocks FROM toc t JOIN content c ON c.key = t.key AND c.lang = 'en' WHERE t.type = 'prose'").all();
  const perYear = {};
  for (const r of rows) {
    const slug = r.key.split("/").pop();
    const m = /^(\d\d)(\d\d)(\d\d)(.*)$/.exec(slug);
    const year = m ? (+m[1] < 30 ? 2000 : 1900) + +m[1] : null;
    const date = m ? `${year}-${m[2]}-${m[3]}` : "";
    const rest = m ? m[4].replace(/^-/, "") : "";
    const pl = place(rest.replace(KIND, "").replace(/^-/, ""));
    const title = r.title_en.replace(/\s+—\s+[A-Z][a-z]+ \d+(st|nd|rd|th)? \d{4}$/, "").trim();
    const sec = sections.get(r.parent_key) || "Other";
    const folder = path.join(dest, PACKS[id], safe(sec), year ? String(year) : "Sin fecha");
    // two talks with the same date and title: the second keeps its code
    let name = safe(`${date} ${title}${pl ? ` (${pl})` : ""}`);
    const k = path.join(folder, name);
    perYear[k] = (perYear[k] || 0) + 1;
    if (perYear[k] > 1) name = safe(`${name} [${slug}]`);
    const file = path.join(folder, name + ".md");
    if (fs.existsSync(file)) { kept++; continue; }
    const head = `# ${title}\n\n*${[date, pl, sec].filter(Boolean).join(" · ")} — Śrīla Prabhupāda (Vedabase, ${slug})*\n\n`;
    if (!dry) { fs.mkdirSync(folder, { recursive: true }); fs.writeFileSync(file, head + toMd(r.blocks)); }
    wrote++;
  }
  console.log(`${PACKS[id]}: ${rows.length} charlas`);
  db.close();
}
console.log(`${dry ? "(prueba) " : ""}archivos nuevos ${wrote}, ya estaban ${kept}`);
