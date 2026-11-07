// node fechas2.mjs [puerto]   (07-11-2026)
// Years written in the records' own texts (found by fechas-plan.mjs, checked one by one; those that were the date of
// another person named in the text left out). Only into an empty field; the record keeps its earlier version.
const port = process.argv[2] ?? "9333";
const T = " (the record's text)";
// [id, field, value]
const plan = [
  [3, "appearance", "1757 AD / 1679 Śaka, at Baliagrāma (Cuttack)"], [12, "appearance", "1482 AD (Udaya-kāhānī)"], [80, "appearance", "1478 AD"],
  [87, "appearance", "1655-66 AD"], [93, "appearance", "1760 Śaka (1838 AD)"], [332, "appearance", "Māgha, ninth lunar day, 1301 BS (January-February 1894)"],
  [494, "appearance", "1738 AD, in Calcutta"], [494, "disappearance", "1813 AD (Viśvakoṣa vol. 22)"], [521, "appearance", "1775 AD (November-December)"],
  [533, "appearance", "Jyaiṣṭha, 1508 AD (Advaita-prakāśa 15; Prema-vilāsa 24)"], [538, "appearance", "1841 AD, at Panakunda (Dhaka)"],
  [602, "disappearance", "Caitra śukla dvitīyā, 1844 AD"], [692, "appearance", "1420 Śaka (1498 AD)"], [692, "disappearance", "1486 Śaka (1564 AD), in Vṛndāvana"],
  [760, "appearance", "1418 Śaka (Advaita-prakāśa 11)"], [837, "appearance", "1873 AD"], [859, "appearance", "1857 AD"], [885, "appearance", "1468 AD"],
  [891, "appearance", "6 February 1951"], [967, "appearance", "1870 Saṁvat, in Vṛndāvana"], [988, "appearance", "1287 AD"], [988, "disappearance", "1350 AD"],
  [993, "appearance", "about 1624 AD"], [1122, "appearance", "1484 AD, at Purandaragaḍh near Pune"], [1164, "appearance", "1538 Śaka (1615 AD)"],
  [1231, "disappearance", "1843/44 AD"], [1246, "appearance", "1480 AD"], [1307, "appearance", "1605 AD"], [1330, "appearance", "about 1423-1427 Śaka (Prema-vilāsa)"],
  [1334, "appearance", "1853 AD, at Dhamrai (Dhaka)"], [1334, "disappearance", "1928 AD"], [1478, "appearance", "1953 AD"], [1665, "appearance", "1268 AD, near Kāñcī"],
  [1695, "appearance", "Pauṣa, 1276 BS (1869 AD)"], [1695, "disappearance", "Māgha kṛṣṇa aṣṭamī, 1923 AD (1330 BS)"], [1803, "appearance", "22 November 1971"],
  [1818, "appearance", "between 1813 and 1818 AD"], [1860, "appearance", "1847 AD, at Śrīpāṭa Śāntipura"], [1871, "appearance", "1225 BS (1818 AD), in Śrīhaṭṭa"],
].map(([id, field, value]) => [id, field, value + T]);
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const plan = ${JSON.stringify(plan)};
  const keys = ["name", "aka", "appearance", "disappearance", "place", "guru", "disciples", "works", "notes", "tags"];
  let n = 0, kept = 0;
  const ids = [...new Set(plan.map(([id]) => id))];
  for (const id of ids) {
    const p = await inv("get_person", { id });
    const now = Object.fromEntries(keys.map((k) => [k, p[k] ?? ""]));
    const want = { ...now };
    for (const [, field, value] of plan.filter(([x]) => x === id)) {
      if (now[field].trim()) { kept++; continue; }
      want[field] = value;
    }
    if (keys.some((k) => want[k] !== now[k])) { await inv("update_person", { id, fields: want }); n++; }
  }
  return { records: n, fieldsAlreadyFull: kept, of: plan.length };
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const d = JSON.parse(m.data); console.log(JSON.stringify(d.result?.result?.value ?? d.result?.exceptionDetails ?? d)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
