// node familia.mjs [puerto]   (07-11-2026)
// Family lines for the relatives outside the tree (found by familia-plan.mjs, checked one by one): set_family(id,
// [[relative, how]]), «relative» the one the record is son / wife / brother… of. Left out: misread phrases,
// relations upwards (grandfather, uncle: the line goes from the elder), and unsure namesakes (the two Kaṁsāri Miśras,
// Kānāi Ṭhākura…). A record that already has relatives keeps them. Twice = nothing.
const port = process.argv[2] ?? "9333";
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
// [id, relative, how]
const plan = [
  [95, 1503, "wife"], [153, 1159, "brother"], [346, 96, "brother"], [542, 559, "elder brother"], [554, 1654, "younger brother"],
  [578, 1381, "son"], [590, 1575, "son"], [599, 1728, "wife"], [633, 1575, "wife"], [672, 1575, "son"], [800, 301, "daughter"],
  [817, 15, "brother"], [827, 1769, "wife"], [828, 1995, "brother"], [831, 1513, "brother"], [854, 173, "son"], [863, 635, "son"],
  [897, 1427, "wife"], [917, 1654, "younger brother"], [932, 1654, "brother"], [941, 2008, "wife"], [1073, 1575, "son"],
  [1131, 682, "son"], [1135, 514, "eldest son"], [1154, 1908, "youngest son"], [1218, 1700, "brother"], [1222, 1623, "grandson"],
  [1291, 1523, "younger brother"], [1298, 534, "daughter"], [1307, 271, "son"], [1310, 1032, "youngest son"], [1313, 864, "wife"],
  [1314, 1119, "daughter"], [1321, 1474, "daughter"], [1345, 15, "brother"], [1376, 1189, "son"], [1382, 1032, "youngest daughter"],
  [1384, 525, "brother"], [1385, 1575, "son"], [1387, 1381, "daughter"], [1394, 1851, "youngest brother"], [1399, 62, "sister"],
  [1416, 1065, "wife"], [1417, 15, "wife"], [1498, 1123, "younger brother"], [1509, 1381, "grandson"], [1554, 1575, "younger son"],
  [1647, 426, "son"], [1669, 635, "wife"], [1750, 1466, "eldest son"], [1780, 1466, "daughter"], [1787, 1032, "eldest son"],
  [1934, 1580, "wife"], [1936, 89, "daughter"], [1949, 1427, "second son"], [1998, 1575, "third son"], [2000, 15, "younger wife"],
  [2041, 1445, "wife"], [2069, 1466, "son"], [2073, 1567, "wife"], [2088, 1723, "elder brother"], [2089, 1768, "daughter"],
  [2101, 1575, "son"],
];
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const plan = ${JSON.stringify(plan)};
  const rows = await inv("list_persons");
  const row = (id) => rows.find((p) => p.id === id);
  const missing = plan.flatMap(([a, b]) => [a, b]).filter((id) => !row(id));
  if (missing.length) return { error: "no record", missing: [...new Set(missing)] };
  let n = 0;
  for (const [id, rel, how] of plan) {
    const fam = (row(id).links || []).filter((l) => l.kind === "family").map((l) => [l.guru, l.note]);
    if (fam.some(([g]) => g === rel)) continue;
    await inv("set_family", { id, relatives: [...fam, [rel, how]] });
    n++;
  }
  return { linked: n, of: plan.length };
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const d = JSON.parse(m.data); console.log(JSON.stringify(d.result?.result?.value ?? d.result?.exceptionDetails ?? d, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
