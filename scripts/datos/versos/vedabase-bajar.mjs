// node bajar.mjs   (21-11-2026, Whisper: «el buscador de versos… y la vedabase»)
// Downloads from vedabase.io the verses missing from the books in «Biblioteca\Srila Prabhupada» (those are in text only
// for SB cantos 1–9 and the Gītā): Śrī Caitanya-caritāmṛta (Ādi 17, Madhya 25, Antya 20 chapters) and Śrīmad-Bhāgavatam
// cantos 10, 11 and 12. For each verse: its reference, the verse in IAST in its lines, the Bengali/Devanāgarī lines,
// the synonyms and the translation (not the purport). One JSON per chapter in ./datos/<book>/<part>-<chapter>.json.
// Polite: one request every 10 s (robots.txt «Crawl-delay: 10»), only pages robots.txt allows (the chapter page and
// each verse page — not the «advanced view»). Picks up where it stopped (a chapter already saved is skipped; a chapter
// half done keeps its verses in ./datos/…partial.json). estado.txt says how far it is; «parar.txt» stops it.
import fs from "node:fs";
import path from "node:path";
const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const OUT = path.join(HERE, "datos");
const UA = "Mozilla/5.0 (personal verse index of a devotee's library; 1 request / 10 s)";
const DELAY = 10_000;
const PLAN = [
  // Bhagavad-gītā As It Is first (the PDF of the library mixes its verse lines with the commentary)
  ...Array.from({ length: 18 }, (_, i) => ["bg", String(i + 1), 0]),
  ...[["adi", 17], ["madhya", 25], ["antya", 20]].flatMap(([p, n]) => Array.from({ length: n }, (_, i) => ["cc", p, i + 1])),
  ...[[10, 90], [11, 31], [12, 13]].flatMap(([c, n]) => Array.from({ length: n }, (_, i) => ["sb", String(c), i + 1])),
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let last = 0;
async function get(url) {
  for (let tries = 0; ; tries++) {
    const wait = last + DELAY - Date.now();
    if (wait > 0) await sleep(wait);
    last = Date.now();
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA } });
      if (r.status === 404) return null;
      if (r.ok) return await r.text();
      log(`HTTP ${r.status} ${url}`);
    } catch (e) {
      log(`error ${url}: ${e}`);
    }
    if (tries >= 5) throw new Error("no se pudo: " + url);
    await sleep(60_000 * (tries + 1));
  }
}
const log = (m) => fs.appendFileSync(path.join(HERE, "salida.log"), `${new Date().toLocaleString("es")} ${m}\n`);
const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&#x27;|&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘").replace(/&ldquo;/g, "“").replace(/&rdquo;/g, "”").replace(/&mdash;/g, "—").replace(/&ndash;/g, "–")
    .replace(/&nbsp;/g, " ").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
const text = (html) => decode(html.replace(/<br\s*\/?>/g, "\n").replace(/<[^>]+>/g, "")).split("\n").map((l) => l.trim()).filter(Boolean);
/** the inside of <div class="av-NAME"> … up to the next «av-» block */
function block(html, name) {
  const i = html.indexOf(`class="av-${name}"`);
  if (i < 0) return null;
  const rest = html.slice(i);
  const j = rest.slice(20).search(/class="av-[a-z_]+"/);
  // up to the «<» of the tag that holds the next block (not «<div» left at the end)
  let b = j < 0 ? rest : rest.slice(0, rest.lastIndexOf("<", j + 20));
  b = b.replace(/<h2[\s\S]*?<\/h2>/, "");
  return b.slice(b.indexOf(">") + 1);
}
function verse(html) {
  const v = block(html, "verse_text");
  if (!v) return null;
  const syn = block(html, "synonyms");
  const tr = block(html, "translation");
  const orig = block(html, "bengali") ?? block(html, "devanagari");
  return {
    lines: text(v),
    original: orig ? text(orig) : [],
    synonyms: syn ? text(syn).join(" ").replace(/\s+;/g, ";").replace(/\s+/g, " ").trim() : "",
    translation: tr ? text(tr).join("\n") : "",
  };
}
function status(done, total, now) {
  fs.writeFileSync(path.join(HERE, "estado.txt"), `Versos de vedabase.io — ${new Date().toLocaleString("es")}\nCapítulos hechos: ${done} de ${total}\nAhora: ${now}\n`);
}

fs.mkdirSync(OUT, { recursive: true });
let done = PLAN.filter(([b, p, c]) => fs.existsSync(path.join(OUT, b, c ? `${p}-${c}.json` : `${p}.json`))).length;
log(`empieza (${done}/${PLAN.length} capítulos ya hechos)`);
for (const [book, part, ch] of PLAN) {
  if (fs.existsSync(path.join(HERE, "parar.txt"))) { log("parado (parar.txt)"); status(done, PLAN.length, "parado"); process.exit(0); }
  // the Gītā has no part: bg/<chapter>/<verse>
  const seg = ch ? `${part}/${ch}` : part;
  const file = path.join(OUT, book, ch ? `${part}-${ch}.json` : `${part}.json`);
  if (fs.existsSync(file)) continue;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const base = `https://vedabase.io/en/library/${book}/${seg}/`;
  status(done, PLAN.length, `${book} ${part} ${ch}`);
  const page = await get(base);
  if (!page) { log(`no existe ${base}`); continue; }
  // the verses of the chapter: links «…/<ch>/<n>/» or «…/<ch>/<n>-<m>/»
  const re = new RegExp(`href="/en/library/${book}/${seg}/(\\d+(?:-\\d+)?)/"`, "g");
  const refs = [...new Set([...page.matchAll(re)].map((m) => m[1]))];
  const title = text((page.match(/<h1[^>]*>[\s\S]*?<\/h1>/) || [""])[0]).join(" ");
  const sub = text((page.match(/<h2[^>]*>[\s\S]*?<\/h2>/) || [""])[0]).join(" ");
  const partial = file.replace(/\.json$/, ".partial.json");
  const got = fs.existsSync(partial) ? JSON.parse(fs.readFileSync(partial, "utf8")) : {};
  for (const r of refs) {
    if (got[r]) continue;
    if (fs.existsSync(path.join(HERE, "parar.txt"))) break;
    const html = await get(base + r + "/");
    const v = html && verse(html);
    if (!v) { log(`sin verso ${base}${r}/`); got[r] = { lines: [], original: [], synonyms: "", translation: "", missing: true }; }
    else got[r] = v;
    fs.writeFileSync(partial, JSON.stringify(got));
    status(done, PLAN.length, `${book} ${part} ${ch}.${r} (${Object.keys(got).length}/${refs.length})`);
  }
  if (refs.every((r) => got[r])) {
    fs.writeFileSync(file, JSON.stringify({ book, part, chapter: ch, title, subtitle: sub, source: base, verses: refs.map((r) => ({ ref: r, ...got[r] })) }, null, 1));
    fs.rmSync(partial, { force: true });
    done++;
    log(`hecho ${book} ${part} ${ch}: ${refs.length} versos`);
  }
}
status(done, PLAN.length, "TERMINADO");
log("TERMINADO");
