// node parampara-grupos.mjs <gaudiya_sampradaya.json> [port] → from Whisper's file (04-11-2026), with the
// format 9 of the app (0.12.0): the groups of the tree, the family lines and the words / «disputed» on the
// lines. Run after parampara-json.mjs. Names are checked first; twice = nothing new.
import fs from "node:fs";
const [, , file, port = "9333"] = process.argv;
const J = JSON.parse(fs.readFileSync(file, "utf8"));
// JSON key → record (as in parampara-json.mjs)
const MAP = {
  madhva: 1892, padmanabha: 1893, nrhari: 1894, madhava_t: 1895, aksobhya: 1896, jayatirtha: 1897, jnanasindhu: 1898,
  dayanidhi: 1899, vidyanidhi: 1900, rajendra: 1901, jayadharma: 1902, purusottama_t: 1903, brahmanya: 1904, vyasatirtha: 1905,
  laksmipati: 1906, madhavendra: 868, isvara: 516, kesava_bharati: 713, pundarika: 1119, paramananda: 1075, brahmananda: 161,
  ranga: 1295, raghupati: 1216, visnupuri: 1717, krsnananda: "Kṛṣṇānanda Purī", sukhananda: "Sukhānanda Purī", nrsimha_t: 1057,
  caitanya: 164, nityananda: 1851, advaita: 15, gadadhara: 274, srivasa: 1468, jahnava: 574, vasudha: 1660, virabhadra: 1701,
  ramai: 1242, vamsivadana: 1623, abhirama: 6, sundarananda: 1496, dhananjaya: 1814, gauridasa: 325, kamalakara: 657,
  uddharana: 1567, mahesa: 894, purusottama_d: 1129, paramesvari: 1080, kalakrsnadasa: 624, hrdaya: 504, vrndavanadasa: 1740,
  acyutananda: 14, yadunandana: 1769, haridasa: 475, isana: 514, bhugarbha: 150, nayanananda: 1028, narayani: 1006, svarupa: 1513,
  ramananda: 1283, sarvabhauma: 1381, murari: 950, sivananda: 1427, karnapura: 706, mukunda: 931, vasughosa: 1654, narahari: 980,
  vakresvara: 1598, gopalaguru: 344, dhyanacandra: 218, lokanatha: 844, prabodhananda: 1095, rupa: 1325, sanatana: 1353, jiva: 618,
  gopalabhatta: 343, raghunathabhatta: 1202, raghunathadasa: 1206, krsnadasa: 759, srinivasa: 1466, narottama: 1010,
  syamananda: 1535, ramacandrakav: 1244, govindadasa: "Govinda dāsa Kavirāja", virahamvira: 1700, hemalata: 497, gatigovinda: 305,
  radhamohana: 1159, ganganarayana: 301, ramakrsnabh: 1273, krsnacarana: 747, radharamana: 1887, visvanatha: 1723,
  rasikananda: 1908, radhadamodara: 1145, baladeva: 73, jagannatha: 1828, vipina: 1696, bhaktivinoda: 128, bhagavatadasa: 1920,
  gaurakisora: 1819, bss: 124, prabhupada: 125, sridhara: 1802, kesava_bp: 1798, narayana: 1809, dayita: 1794, pramod: 1799,
  bon: 1795, vilasatirtha: 1811,
};
// the file's notes, short and in English (as the records); null = no word on the line
const NOTE = {
  "Sucesión según Baladeva; vínculo con Madhva discutido por historiadores": "according to Baladeva",
  "Según la tradición": "according to tradition",
  "Según la Gauḍīya Maṭha; otras fuentes: Mādhavendra Purī": "Gauḍīya Maṭha; others: Mādhavendra Purī",
  "Gayā, 1508": "Gayā 1508",
  "Katwa, 1510": "Kāṭoyā 1510",
  "hijo adoptivo": "adopted son",
  "Vivió con Advaita; las fuentes antiguas no detallan iniciación formal": "lived with Advaita",
  sobrino: "nephew",
  Prayāga: "Prayāga",
  Benarés: "Vārāṇasī",
  "Único discípulo de Lokanātha": "his only disciple",
  "asociado directo": null,
  "Generaciones intermedias": "generations between",
  "Según la Gauḍīya Maṭha; salto de generaciones": "Gauḍīya Maṭha; generations skipped",
  padre: "father",
  "Uno de los doce gopālas": null,
  1900: "1900",
  1933: "1933",
  1959: "1959",
};
// family: how the second one (hacia) is related to the first (desde)
const FAMILY = {
  "nityananda>jahnava": "wife", "nityananda>vasudha": "wife", "nityananda>virabhadra": "son", "vamsivadana>ramai": "grandson",
  "vamsivadana>vipina": "family line", "srivasa>narayani": "niece", "narayani>vrndavanadasa": "son", "advaita>acyutananda": "son",
  "sivananda>karnapura": "son", "srinivasa>hemalata": "daughter", "srinivasa>gatigovinda": "son", "srinivasa>radhamohana": "descendant",
  "bhaktivinoda>bss": "son",
};
const groupName = Object.fromEntries(J.grupos.map((g) => [g.id, g.nombre]));
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const data = { MAP, NOTE, FAMILY, groupName, personas: J.personas.map((p) => [p.id, p.grupo]), relaciones: J.relaciones };
const expr = `(async () => { try {
  const raw = window.__TAURI_INTERNALS__.invoke;
  // as api.ts: the family lines apart from the other gurus
  const inv = async (cmd, args) => {
    const r = await raw(cmd, args);
    if (cmd !== "list_persons") return r;
    return r.map((p) => ({ ...p, links: p.links.filter((l) => l.kind !== "family"), family: p.links.filter((l) => l.kind === "family").map((l) => ({ relative: l.guru, note: l.note, disputed: l.disputed })) }));
  };
  const D = ${JSON.stringify(data)};
  let ps = await inv("list_persons");
  const byName = new Map(ps.map((p) => [p.name, p.id]));
  const idOf = (k) => { const v = D.MAP[k]; return typeof v === "string" ? byName.get(v) : v; };
  for (const k of Object.keys(D.MAP)) if (!ps.some((p) => p.id === idOf(k))) return { error: "no record for " + k };
  const log = [];
  let m = new Map(ps.map((p) => [p.id, p]));
  // relatives not yet in the tree go in at the first level, so that their family line can be drawn
  for (const key of Object.keys(D.FAMILY)) for (const k of key.split(">")) {
    const id = idOf(k);
    if (!m.get(id).tree) { await inv("move_person", { id, place: { parent: null, before: null } }); log.push("in tree " + id + " " + m.get(id).name); }
  }
  ps = await inv("list_persons"); m = new Map(ps.map((p) => [p.id, p]));
  // groups
  const want = new Map();
  for (const [k, g] of D.personas) { const id = idOf(k); if (m.get(id).tree && g) want.set(id, D.groupName[g]); }
  const byGroup = new Map();
  for (const [id, g] of want) if (m.get(id).tree.group !== g) byGroup.set(g, [...(byGroup.get(g) ?? []), id]);
  for (const [g, ids] of byGroup) { await inv("set_tree_group", { ids, group: g }); log.push("group «" + g + "»: " + ids.length); }
  // family lines (per record: the list of its relatives)
  const fam = new Map();
  for (const [key, how] of Object.entries(D.FAMILY)) {
    const [a, b] = key.split(">").map(idOf);
    // a relative who is also a guru (Bhaktivinoda for Bhaktisiddhānta) keeps the guru line
    if (m.get(b).links.some((l) => l.guru === a)) continue;
    fam.set(b, [...(fam.get(b) ?? []), [a, how]]);
  }
  for (const [id, rel] of fam) {
    const cur = m.get(id).family.map((f) => [f.relative, f.note]).sort();
    if (JSON.stringify(cur) !== JSON.stringify([...rel].sort())) { await inv("set_family", { id, relatives: rel }); log.push("family " + id + " " + m.get(id).name + ": " + JSON.stringify(rel)); }
  }
  ps = await inv("list_persons"); m = new Map(ps.map((p) => [p.id, p]));
  // words and «disputed» on the lines
  for (const r of D.relaciones) {
    if (r.tipo === "familia") continue;
    const note = r.nota == null ? "" : (D.NOTE[r.nota] === undefined ? r.nota : D.NOTE[r.nota] ?? "");
    if (!note && !r.discutida) continue;
    const [g, d] = [idOf(r.desde), idOf(r.hacia)];
    const p = m.get(d);
    const own = p.tree && p.tree.parent === g;
    const cur = own ? p.tree : p.links.find((l) => l.guru === g);
    if (!cur) { log.push("⚠ no line " + r.desde + " → " + r.hacia); continue; }
    if (cur.note !== note || cur.disputed !== !!r.discutida) {
      await inv("set_line_info", { id: d, guru: own ? null : g, note, disputed: !!r.discutida });
      log.push("line " + p.name + " ← " + m.get(g).name + ": «" + note + "»" + (r.discutida ? " (disputed)" : ""));
    }
  }
  return log.length ? log : ["nothing to change"];
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (msg) => { console.log(JSON.stringify(JSON.parse(msg.data).result?.result?.value, null, 1)); ws.close(); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
