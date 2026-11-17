// node all.mjs <outdir> : every Anthology volume → <outdir>/vNN.json, and a summary line each (lectures found vs dates in the contents)
import fs from "node:fs";
import path from "node:path";
import { readVolume } from "./volume.mjs";
const ROOT = "O:/Gaudiya Vaisnavas DB/Biblioteca/Sri Srimad Bhaktivedanta Narayana/Anthology";
const out = process.argv[2];
fs.mkdirSync(out, { recursive: true });
for (const d of fs.readdirSync(ROOT).sort()) {
  const t0 = Date.now();
  try {
    const v = await readVolume(path.join(ROOT, d));
    fs.writeFileSync(path.join(out, `v${String(v.vol).padStart(2, "0")}.json`), JSON.stringify(v));
    const chars = v.lectures.reduce((s, c) => s + c.text.length, 0);
    console.log(`${String(v.vol).padStart(2)} | ${v.title} | found ${v.lectures.length} | contents ${v.tocDates} | intro ${v.intro.length} | ${Math.round(chars / 1000)}k | ${Math.round((Date.now() - t0) / 1000)}s`);
  } catch (e) { console.log("ERR", d, String(e).slice(0, 120)); }
}
console.log("DONE");
