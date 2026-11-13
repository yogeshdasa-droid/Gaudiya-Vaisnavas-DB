// Builds fotos-lila6-nuevos.json (fotos-poner.mjs, new places by name) and fotos-lila6-mas.json (fotos-mas.mjs,
// places that exist). Each picture is copied to fv6/<caption>.jpg: the gallery keeps that name as its caption.
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1"));
const OLD = "C:/Users/Yoges/AppData/Local/Temp/claude/86cea103b7d11c05/c7a18df9-47bb-4c4e-944b-d93b98c1dee8/scratchpad/img-vraja/";
const CREDIT =
  "Photos: Śrī Vraja-maṇḍala Parikramā (Gaudiya Vedanta Publications, 2007; photographs courtesy of Hemant Kumar, Kāliya-damana dāsa, Śāradā dāsī, Rūpa-Raghunātha dāsa Brahmacārī, Bhakta Charles and others), for private use.";
const NEW = {
  "Añjanauka": [["447_5", "Añjanī-śilā"], ["447_2", "Kiśorī-kuṇḍa"]],
  "Caraṇa-pahāḍī (Choṭī-baiṭhana)": [["462_3", "Caraṇa-pahāḍī"], ["462_2", "Footprints at Caraṇa-pahāḍī"], ["463_2", "Imprints in the rock"], ["463_3", "Imprints in the rock (2)"], ["464_2", "Caraṇa-gaṅgā"]],
  "Khelanvana (Śergaḍh)": [["469_2", "In the area of Khelanvana"]],
  "Vihāravana": [["475_2", "Vihāra-kuṇḍa"], ["476_3", "Kuñjas in Vihāravana"], ["476_2", "A dancing peacock in Vihāravana"]],
  "Muñjāṭavī": [["480_2", "Muñja grass"]],
  "Bandī-Ānandī": [["528_2", "Bandī and Ānandī"]],
  "Garuḍa-Govinda": [["139_2", "Govindajī with Śrīdāma as Garuḍa"]],
};
const MORE = {
  220: [["483_2", "The deity of Kātyāyanī-devī"]],
  209: [["526_2", "The deities at Durvāsā-āśrama"]],
  63: [["82_2", "Mathurā - Pippaleśvara Mahādeva"]],
};
const db = new DatabaseSync(process.argv[2], { readOnly: true });
const dir = path.join(HERE, "fv6");
fs.mkdirSync(dir, { recursive: true });
const copy = ([k, label]) => {
  const src = fs.existsSync(OLD + `vr-${k}.jpg`) ? OLD + `vr-${k}.jpg` : OLD + `vr-${k}.png`;
  const dst = path.join(dir, label.replace(/[\\/:*?"<>|]/g, "") + path.extname(src));
  fs.copyFileSync(src, dst);
  return dst;
};
const nuevos = Object.entries(NEW).map(([name, list]) => {
  const files = list.map(copy);
  return { id: null, name, photo: files[0], images: files.slice(1), credit: CREDIT };
});
const mas = Object.entries(MORE).map(([id, list]) => {
  const r = db
    .prepare("select name, (select count(*) from place_images i where i.place_id=p.id) as n, (select count(*) from place_photos f where f.place_id=p.id) as ph from places p where id=?")
    .get(+id);
  const files = list.map(copy);
  return { id: +id, name: r.name, imgs: r.n, hasPhoto: r.ph > 0, photo: files[0], images: files.slice(1), credit: CREDIT };
});
fs.writeFileSync(path.join(HERE, "fotos-lila6-nuevos.json"), JSON.stringify(nuevos, null, 1));
fs.writeFileSync(path.join(HERE, "fotos-lila6-mas.json"), JSON.stringify(mas, null, 1));
console.log(nuevos.length, "new places,", mas.length, "places with more,", fs.readdirSync(dir).length, "pictures");
