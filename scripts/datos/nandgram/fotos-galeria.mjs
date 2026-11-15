// node fotos-galeria.mjs <biodata.db> <casadas.json> <carpeta imagenes> [--dry]     (15-11-2026, Nandgram Dham)
// With the app CLOSED. For each life matched to a record (casadas.json: [{slug, id}]):
// - if the record has NO photo, its first picture becomes the photo;
// - all the others (all of them, if it already had a photo) go to the record's gallery (person_images), with the
//   caption from imagenes.json as the picture's name (what the gallery shows as caption).
// A second run adds nothing: a picture whose caption is already in that record's gallery is skipped, and so is the
// first picture when the record has a photo now (it went to the photo in the first run).
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const [dbPath, casPath, imgDir, dry] = process.argv.slice(2);
const cas = JSON.parse(fs.readFileSync(casPath, "utf8"));
const caps = JSON.parse(fs.readFileSync(path.join(imgDir, "imagenes.json"), "utf8"));
const db = new DatabaseSync(dbPath);
const photoOf = db.prepare("SELECT data FROM person_photos WHERE person_id = ?");
const names = db.prepare("SELECT name FROM person_images WHERE person_id = ?");
const setPhoto = db.prepare("INSERT OR REPLACE INTO person_photos(person_id, mime, data) VALUES (?, ?, ?)");
const addImg = db.prepare("INSERT INTO person_images(person_id, name, mime, data) VALUES (?, ?, ?, ?)");
const touch = db.prepare("UPDATE persons SET modified = datetime('now', 'localtime') WHERE id = ?");
const mimeOf = (b) =>
  b[0] === 0xff && b[1] === 0xd8 ? "image/jpeg" : b[0] === 0x89 && b[1] === 0x50 ? "image/png" : b.slice(8, 12).toString() === "WEBP" ? "image/webp" : b.slice(0, 3).toString() === "GIF" ? "image/gif" : null;
// the caption, without the credit line at the end («… · Used with attribution»): kept as the source, shorter
const clean = (c) => (c || "").replace(/\s+/g, " ").trim().slice(0, 400);

let photos = 0, imgs = 0, skipped = 0;
db.exec("BEGIN");
for (const { slug, id } of cas) {
  const list = (caps[slug] ?? []).filter((x) => fs.existsSync(path.join(imgDir, slug, x.file)));
  if (!list.length) continue;
  const have = new Set(names.all(id).map((r) => r.name));
  let first = true, did = false;
  for (const x of list) {
    const data = fs.readFileSync(path.join(imgDir, slug, x.file));
    const mime = mimeOf(data);
    if (!mime) { console.log("not a picture:", slug, x.file); continue; }
    const cap = clean(x.caption) || `${slug} ${x.file}`;
    if (first) {
      first = false;
      const ph = photoOf.get(id);
      if (!ph) { if (!dry) setPhoto.run(id, mime, data); photos++; did = true; continue; }
      if (Buffer.from(ph.data).equals(data)) { skipped++; continue; } // already its photo (an earlier run)
    }
    if (have.has(cap)) { skipped++; continue; }
    if (!dry) addImg.run(id, cap, mime, data);
    have.add(cap); imgs++; did = true;
  }
  if (did && !dry) touch.run(id);
}
db.exec(dry ? "ROLLBACK" : "COMMIT");
console.log({ dry: !!dry, photos, imgs, skipped });
