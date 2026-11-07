// node fechas1.mjs [puerto]   (07-11-2026)
// The date proposals of «Rellenar fichas» from the Digdarśanī chronology, checked one by one: the right ones
// accepted (they only fill an empty field), those that pointed at a namesake rejected (they do not come back).
// When two years were offered for one field, the fuller entry is kept.
const port = process.argv[2] ?? "9333";
const accept = [1752, 2453, 1741, 1792, 1820, 2445, 1746, 1806, 2449, 2410, 2425, 1748, 2448, 1775, 2444, 2446, 1807, 1805, 1814,
  1774, 1794, 1757, 1816, 2417, 1747, 1779, 1762, 1811, 1781, 1818, 1739, 1742, 1813, 1810, 1825, 2408, 1753, 1740, 1749, 1764,
  1821, 1773, 1797, 1780, 2420, 1782, 1787, 2452, 2450, 2443, 1788];
const reject = [1765, 1771, 2414, 2415, 2447, 1819, 1785, 1761, 1812, 1826, 1784, 1770, 1790, 1793, 1801, 1803, 1809, 1777, 1750,
  2451, 1783, 1824, 1791, 1769, 1795, 1789, 1822, 2416, 1799, 1766, 1815];
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const all = await inv("fill_list");
  const have = new Set(all.map((p) => p.id));
  const acc = ${JSON.stringify(accept)}.filter((id) => have.has(id)), rej = ${JSON.stringify(reject)}.filter((id) => have.has(id));
  const filled = acc.length ? await inv("fill_accept", { ids: acc }) : 0;
  if (rej.length) await inv("fill_reject", { ids: rej });
  return { accepted: acc.length, filled, rejected: rej.length };
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const d = JSON.parse(m.data); console.log(JSON.stringify(d.result?.result?.value ?? d.result?.exceptionDetails ?? d)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
