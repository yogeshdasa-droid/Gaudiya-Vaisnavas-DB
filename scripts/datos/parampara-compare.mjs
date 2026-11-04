// node compare.mjs <db> <json> <out.json> → each relation of Whisper's JSON compared with our tree
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
const [, , dbFile, jsonFile, out] = process.argv;
const db = new DatabaseSync(dbFile, { readOnly: true });
const J = JSON.parse(fs.readFileSync(jsonFile, "utf8"));
// JSON key → record id (null: no record found)
const MAP = {
  madhva: 1892, padmanabha: 1893, nrhari: 1894, madhava_t: 1895, aksobhya: 1896, jayatirtha: 1897, jnanasindhu: 1898,
  dayanidhi: 1899, vidyanidhi: 1900, rajendra: 1901, jayadharma: 1902, purusottama_t: 1903, brahmanya: 1904, vyasatirtha: 1905,
  laksmipati: 1906, madhavendra: 868, isvara: 516, kesava_bharati: 713, pundarika: 1119, paramananda: 1075, brahmananda: 161,
  ranga: 1295, raghupati: 1216, visnupuri: 1717, krsnananda: 1958, sukhananda: 1959, nrsimha_t: 1057, caitanya: 164,
  nityananda: 1851, advaita: 15, gadadhara: 274, srivasa: 1468, jahnava: 574, vasudha: null, virabhadra: 1701, ramai: 1242,
  vamsivadana: 1623, abhirama: 6, sundarananda: 1496, dhananjaya: 1814, gauridasa: 325, kamalakara: 657, uddharana: 1567,
  mahesa: 894, purusottama_d: 1129, paramesvari: 1080, kalakrsnadasa: 624, hrdaya: 504, vrndavanadasa: 1740, acyutananda: 14,
  yadunandana: 1769, haridasa: 475, isana: 514, bhugarbha: 150, nayanananda: 1028, narayani: 1006, svarupa: 1513, ramananda: 1283,
  sarvabhauma: 1381, murari: 950, sivananda: 1427, karnapura: 706, mukunda: 931, vasughosa: 1654, narahari: 980, vakresvara: 1598,
  gopalaguru: 344, dhyanacandra: 218, lokanatha: 844, prabodhananda: 1095, rupa: 1325, sanatana: 1353, jiva: 618, gopalabhatta: 343,
  raghunathabhatta: 1202, raghunathadasa: 1206, krsnadasa: 759, srinivasa: 1466, narottama: 1010, syamananda: 1535,
  ramacandrakav: 1244, govindadasa: 1960, virahamvira: 1700, hemalata: 497, gatigovinda: 305, radhamohana: 1159,
  ganganarayana: 301, ramakrsnabh: 1273, krsnacarana: 747, radharamana: 1887, visvanatha: 1723, rasikananda: 1908,
  radhadamodara: 1145, baladeva: 73, jagannatha: 1828, vipina: 1696, bhaktivinoda: 128, bhagavatadasa: 1920, gaurakisora: 1819,
  bss: 124, prabhupada: 125, sridhara: 1802, kesava_bp: 1798, narayana: 1809, dayita: 1794, pramod: 1799, bon: 1795, vilasatirtha: 1811,
};
const name = new Map(db.prepare("select id,name from persons").all().map((r) => [r.id, r.name]));
const tree = new Map(db.prepare("select person_id, parent_id, kind from person_tree").all().map((r) => [r.person_id, r]));
const links = db.prepare("select person_id, guru_id, kind from person_links").all();
const K = { diksa: "diksa", siksa: "siksa", sannyasa: "sannyasa", babaji_vesa: "vesa", asociado: "associate" };
const cls = (k) => (k === "vani" ? "siksa" : k === "disciple" ? "diksa" : k);
const ours = (d) => [
  ...(tree.has(d) && tree.get(d).parent_id != null ? [{ guru: tree.get(d).parent_id, kind: tree.get(d).kind, place: true }] : []),
  ...links.filter((l) => l.person_id === d).map((l) => ({ guru: l.guru_id, kind: l.kind, place: false })),
];
const nom = (k) => J.personas.find((p) => p.id === k)?.nombre ?? k;
const rows = [];
for (const r of J.relaciones) {
  const g = MAP[r.desde], d = MAP[r.hacia];
  const row = { guru: nom(r.desde), disc: nom(r.hacia), tipo: r.tipo, discutida: r.discutida, nota: r.nota, gid: g, did: d };
  if (r.tipo === "familia") row.estado = "familia";
  else if (g == null || d == null) row.estado = "sin-ficha";
  else {
    const o = ours(d);
    const same = o.find((x) => x.guru === g);
    if (same && cls(same.kind) === K[r.tipo]) row.estado = "igual";
    else if (same) { row.estado = "otro-tipo"; row.nuestro = same.kind; }
    else if (!tree.has(d)) row.estado = "no-en-arbol";
    else if (!tree.has(g)) row.estado = "guru-no-en-arbol";
    else {
      row.estado = "falta";
      const rival = o.find((x) => cls(x.kind) === K[r.tipo]);
      if (rival) row.nuestro = `${rival.guru} ${name.get(rival.guru)} (${rival.kind})`;
    }
  }
  rows.push(row);
}
fs.writeFileSync(out, JSON.stringify(rows, null, 1), "utf8");
const by = {};
for (const r of rows) by[r.estado] = (by[r.estado] || 0) + 1;
console.log(JSON.stringify(by));
for (const r of rows.filter((x) => !["igual", "familia"].includes(x.estado)))
  console.log(`${r.estado}\t${r.guru} → ${r.disc} (${r.tipo}${r.discutida ? ", disputed" : ""})${r.nuestro ? "\tours: " + r.nuestro : ""}${r.nota ? "\t«" + r.nota + "»" : ""}`);
