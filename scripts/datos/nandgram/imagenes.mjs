// node imagenes.mjs <raw dir> <out dir> — the pictures of each life (the <figure> with <img> of the article), slowly,
// into <out>/<slug>/NN.<ext>, and <out>/imagenes.json with each one's caption, credit and original address.
import fs from "node:fs";
import path from "node:path";
const [, , rawDir, outDir] = process.argv;
const UA = "Mozilla/5.0 (personal Vaishnava library)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ent = (s) =>
  s.replace(/&#0?39;|&#8217;|&rsquo;/g, "’").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
const plain = (s) => ent(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const listFile = path.join(outDir, "imagenes.json");
const list = fs.existsSync(listFile) ? JSON.parse(fs.readFileSync(listFile, "utf8")) : {};
fs.mkdirSync(outDir, { recursive: true });
let total = 0;
for (const f of fs.readdirSync(rawDir).filter((x) => x.endsWith(".html"))) {
  const slug = f.replace(/\.html$/, "");
  if (list[slug]) continue;
  const html = fs.readFileSync(path.join(rawDir, f), "utf8");
  const a = html.indexOf("ach-article");
  const art = a < 0 ? html : html.slice(a, html.indexOf("</article>", a));
  const figs = [...art.matchAll(/<figure\b[^>]*>[\s\S]*?<\/figure>/g)].map((m) => m[0]).filter((x) => /<img\b/.test(x));
  const seen = new Set();
  const items = [];
  for (const fig of figs) {
    const img = fig.match(/<img\b[^>]*>/)[0];
    let src = (img.match(/\bsrc="([^"]+)"/) ?? img.match(/\bdata-src="([^"]+)"/) ?? [])[1];
    const srcset = (img.match(/\bsrcset="([^"]+)"/) ?? [])[1];
    if (srcset) src = srcset.split(",").map((x) => x.trim().split(/\s+/)[0]).pop() || src; // the largest
    if (!src || src.startsWith("data:")) continue;
    src = new URL(ent(src), "https://nandgramdham.org/").href;
    if (seen.has(src)) continue;
    seen.add(src);
    const cap = plain((fig.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/) ?? [])[1] ?? "");
    const alt = plain((img.match(/\balt="([^"]*)"/) ?? [])[1] ?? "");
    items.push({ src, caption: cap || alt });
  }
  const dir = path.join(outDir, slug);
  fs.mkdirSync(dir, { recursive: true });
  const saved = [];
  for (const [i, it] of items.entries()) {
    await sleep(2000);
    try {
      const r = await fetch(it.src, { headers: { "User-Agent": UA, Referer: "https://nandgramdham.org/" } });
      if (!r.ok) {
        console.log(slug, r.status, it.src);
        continue;
      }
      const ext = ((r.headers.get("content-type") ?? "").split("/")[1] ?? "jpg").replace("jpeg", "jpg").replace(/[^a-z]/g, "").slice(0, 4) || "jpg";
      const file = `${String(i + 1).padStart(2, "0")}.${ext}`;
      fs.writeFileSync(path.join(dir, file), Buffer.from(await r.arrayBuffer()));
      saved.push({ file, caption: it.caption, from: it.src });
      total++;
    } catch (e) {
      console.log(slug, String(e));
    }
  }
  list[slug] = saved;
  fs.writeFileSync(listFile, JSON.stringify(list, null, 1));
  console.log(slug, saved.length, "imágenes");
}
console.log("FIN imágenes nuevas:", total);
