// node bajar.mjs — the lives of nandgramdham.org/acharyas: each «complete» page saved as it comes (raw/<slug>.html),
// slowly (one page every 3 s). Pages already saved are not asked again. The conversion is convertir.mjs.
import fs from "node:fs";
const dir = new URL(".", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
fs.mkdirSync(dir + "raw", { recursive: true });
const UA = "Mozilla/5.0 (personal Vaishnava library)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const get = async (u) => {
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(u, { headers: { "User-Agent": UA } });
      if (r.ok) return await r.text();
      console.log(u, r.status);
      if (r.status === 404) return null;
    } catch (e) {
      console.log(u, String(e));
    }
    await sleep(8000 * (i + 1));
  }
  return null;
};
const index = await get("https://nandgramdham.org/acharyas/");
const slugs = [...new Set([...index.matchAll(/href="(?:https:\/\/nandgramdham\.org)?\/acharyas\/([a-z0-9-]+)\/"/g)].map((m) => m[1]))].filter(
  (s) => !["parampara", "timeline", "lineage-map", "hi"].includes(s),
);
fs.writeFileSync(dir + "slugs.json", JSON.stringify(slugs));
console.log("fichas en la web:", slugs.length);
let n = 0;
for (const slug of slugs) {
  if (fs.existsSync(`${dir}raw/${slug}.html`)) continue;
  await sleep(3000);
  // (a short life has no «complete» page: then its main page)
  const html = (await get(`https://nandgramdham.org/acharyas/${slug}/complete/`)) ?? (await sleep(3000), await get(`https://nandgramdham.org/acharyas/${slug}/`));
  if (html) fs.writeFileSync(`${dir}raw/${slug}.html`, html);
  if (++n % 10 === 0) console.log(n, "nuevas");
}
console.log("FIN", fs.readdirSync(dir + "raw").length, "de", slugs.length);
