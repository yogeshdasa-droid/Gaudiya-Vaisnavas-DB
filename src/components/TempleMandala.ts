// The lotus of a temple floor (Whisper, 18-11-2026: a photo of a marble inlay — white petals drawn in black, a ring of
// red petals, an orange ring in the middle, a red circle, a golden square with a lotus bud in each corner), drawn here
// by code as a faint picture behind the written lectures of «Audios». Returns a data: URL to use as a CSS background.

const P = (r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return `${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`;
};
/** a pointed petal at angle `a`, from radius r1 to its tip at r2, `w` degrees wide at its widest */
const petal = (a: number, r1: number, r2: number, w: number, belly = 0.45) => {
  const m = r1 + (r2 - r1) * belly;
  return `M${P(r1, a)} C${P(m, a - w)} ${P(r2 - (r2 - r1) * 0.12, a - w * 0.35)} ${P(r2, a)} C${P(r2 - (r2 - r1) * 0.12, a + w * 0.35)} ${P(m, a + w)} ${P(r1, a)}Z`;
};
const ring = (n: number, f: (a: number) => string, off = 0) => Array.from({ length: n }, (_, i) => f(off + (360 / n) * i)).join(" ");

/** a lotus bud on the diagonal, its tip pointing to the corner */
function bud(cornerDeg: number): string {
  const tip = 640;
  const base = 560;
  const leaf = (s: number) => `M${P(base - 6, cornerDeg)} C${P(base + 10, cornerDeg + s * 9)} ${P(base + 50, cornerDeg + s * 9)} ${P(base + 66, cornerDeg + s * 5.5)} C${P(base + 40, cornerDeg + s * 4)} ${P(base + 20, cornerDeg + s * 2.5)} ${P(base - 6, cornerDeg)}Z`;
  return (
    `<path d="${leaf(1)} ${leaf(-1)}" fill="#24302a" stroke="#24302a" stroke-width="2"/>` +
    `<path d="${petal(cornerDeg, base, tip, 4.2, 0.5)}" fill="#c4553a" stroke="#7c2c1c" stroke-width="2.5"/>` +
    `<path d="${petal(cornerDeg, base + 8, tip - 18, 1.8, 0.5)}" fill="#e08a52" stroke="none"/>` +
    // the stem from the red circle
    `<path d="M${P(460, cornerDeg)} L${P(base - 4, cornerDeg)}" stroke="#c98a2e" stroke-width="7" stroke-linecap="round"/>`
  );
}

/** The small lotus behind the photos of the side tree (Whisper, 18-11-2026): white petals in two rows, a red ring,
 *  the photo over the middle. A data: URL for CSS. */
let mini = "";
export function lotusMiniUrl(): string {
  if (mini) return mini;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-12 -12 24 24" width="48" height="48">` +
    `<circle r="11.3" fill="none" stroke="#c98a2e" stroke-width="0.9"/>` +
    `<path d="${ring(8, (a) => petal(a, 4, 11, 16), 22.5)}" fill="#f7f3ea" stroke="#3a3530" stroke-width="0.6"/>` +
    `<path d="${ring(8, (a) => petal(a, 4, 11.6, 15))}" fill="#fbf8f2" stroke="#2a2622" stroke-width="0.6"/>` +
    `<circle r="8.6" fill="#b5392c"/>` +
    `</svg>`;
  mini = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
  return mini;
}

let cached: Record<string, string> = {};
export function templeMandalaUrl(opacity: number): string {
  const k = String(opacity);
  if (cached[k]) return cached[k];
  const ink = "#23262a";
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-700 -700 1400 1400" width="1400" height="1400">` +
    `<g opacity="${opacity}" stroke-linejoin="round">` +
    // the golden square
    `<rect x="-660" y="-660" width="1320" height="1320" fill="none" stroke="#c98a2e" stroke-width="16"/>` +
    [45, 135, 225, 315].map(bud).join("") +
    // the red circle
    `<circle r="455" fill="none" stroke="#a8322a" stroke-width="9"/>` +
    // the big white petals, two rows (the back one between)
    `<path d="${ring(12, (a) => petal(a, 150, 420, 13), 15)}" fill="#fbfaf6" stroke="${ink}" stroke-width="13"/>` +
    `<path d="${ring(12, (a) => petal(a, 150, 445, 12))}" fill="#fbfaf6" stroke="${ink}" stroke-width="13"/>` +
    // the red petals around the centre
    `<path d="${ring(16, (a) => petal(a, 120, 250, 11, 0.5), 11.25)}" fill="#c4553a" stroke="#7c2c1c" stroke-width="5"/>` +
    `<path d="${ring(16, (a) => petal(a, 120, 225, 10, 0.5))}" fill="#d0683f" stroke="#7c2c1c" stroke-width="5"/>` +
    // the small white petals inside
    `<path d="${ring(24, (a) => petal(a, 92, 165, 6.5, 0.5))}" fill="#fbfaf6" stroke="#b9b2a6" stroke-width="3"/>` +
    // the orange ring and its white middle
    `<circle r="88" fill="#d98a2a"/><circle r="50" fill="#fbfaf6"/>` +
    `</g></svg>`;
  cached[k] = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
  return cached[k];
}
