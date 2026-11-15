/** A faint ornament (mandala / rosette of arabesques) behind the «Gaṇoddeśa» texts (15-11-2026).
 *  Drawn here, by code — our own, not taken from any book. Only lines in `currentColor`: the CSS gives the colour and
 *  the faintness, so it works in light and dark. */

const P = (r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return `${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`;
};

/** a pointed petal at angle `a`, from radius r1 to its tip at r2, `w` degrees wide */
const petal = (a: number, r1: number, r2: number, w: number) => {
  const m = r1 + (r2 - r1) * 0.45;
  return `M${P(r1, a)} Q${P(m, a - w)} ${P(r2, a)} Q${P(m, a + w)} ${P(r1, a)}Z`;
};

/** a curl (arabesque) leaving the petal's middle line and rolling up to one side (s = 1 or -1) */
const curl = (a: number, r1: number, r2: number, w: number, s: number) => {
  const d = r2 - r1;
  return (
    `M${P(r1, a)} C${P(r1 + d * 0.35, a + s * w * 0.2)} ${P(r1 + d * 0.55, a + s * w * 0.95)} ${P(r1 + d * 0.72, a + s * w * 0.7)}` +
    ` C${P(r1 + d * 0.82, a + s * w * 0.5)} ${P(r1 + d * 0.74, a + s * w * 0.25)} ${P(r1 + d * 0.64, a + s * w * 0.38)}`
  );
};

const ring = (n: number, f: (a: number, i: number) => string, off = 0) =>
  Array.from({ length: n }, (_, i) => f(off + (360 / n) * i, i)).join(" ");

const PATHS = [
  // outer lace: 48 small petals with a scalloped edge
  ring(48, (a) => petal(a, 452, 498, 2.6)),
  ring(48, (a) => `M${P(452, a)} Q${P(470, a + 3.75)} ${P(452, a + 7.5)}`),
  // 24 big lotus petals, each with two curls and a vein
  ring(24, (a) => petal(a, 300, 440, 7)),
  ring(24, (a) => petal(a, 318, 410, 4)),
  ring(24, (a) => curl(a, 300, 440, 7, 1) + " " + curl(a, 300, 440, 7, -1)),
  // between them, a second row seen behind
  ring(24, (a) => petal(a, 300, 395, 5.5), 7.5),
  // a band of arches
  ring(64, (a) => `M${P(282, a)} A12 12 0 0 1 ${P(282, a + 5.625)}`),
  // 12 heart-shaped arabesques
  ring(12, (a) => {
    const w = 13;
    return (
      `M${P(160, a)} C${P(200, a - w)} ${P(275, a - w * 1.4)} ${P(262, a - w * 0.45)}` +
      ` C${P(252, a - w * 0.05)} ${P(232, a)} ${P(238, a)}` +
      ` C${P(232, a)} ${P(252, a + w * 0.05)} ${P(262, a + w * 0.45)}` +
      ` C${P(275, a + w * 1.4)} ${P(200, a + w)} ${P(160, a)}Z`
    );
  }),
  ring(12, (a) => curl(a, 170, 250, 9, 1) + " " + curl(a, 170, 250, 9, -1)),
  ring(12, (a) => petal(a, 175, 262, 4), 15),
  // inner row of small petals around the empty centre
  ring(32, (a) => petal(a, 128, 158, 4.5)),
];

const CIRCLES = [498, 452, 444, 300, 292, 270, 160, 150, 128, 118];
const DOTS = Array.from({ length: 72 }, (_, i) => P(448, 2.5 + 5 * i).split(" ").map(Number));
const BEADS = Array.from({ length: 40 }, (_, i) => P(155, 4.5 + 9 * i).split(" ").map(Number));

export function Mandala({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="-510 -510 1020 1020" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {CIRCLES.map((r) => (
          <circle key={r} r={r} />
        ))}
        {PATHS.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <g fill="currentColor">
        {DOTS.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={2.4} />
        ))}
        {BEADS.map(([x, y], i) => (
          <circle key={`b${i}`} cx={x} cy={y} r={1.8} />
        ))}
      </g>
    </svg>
  );
}
