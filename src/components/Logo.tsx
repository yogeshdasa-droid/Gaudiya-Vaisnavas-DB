// The mark of Vaiṣṇava-kośa: an open book with the Gauḍīya tilaka and its tulasī leaf above.
// Same drawing as src-tauri/icons/source.svg (the program's icon).
export function LogoMark() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <rect width="100" height="100" rx="22" fill="#7a2431" />
      <path d="M16 36 Q33 28 49 36 V80 Q33 72 16 80Z" fill="#fff8ec" />
      <path d="M84 36 Q67 28 51 36 V80 Q67 72 84 80Z" fill="#fff8ec" />
      <path d="M44 12 V24 Q44 31 50 32 Q56 31 56 24 V12" fill="none" stroke="#c9962b" strokeWidth="4" strokeLinecap="round" />
      <path d="M50 33 Q47 36 50 40 Q53 36 50 33Z" fill="#9fd08f" />
    </svg>
  );
}

export const APP_NAME = "Vaiṣṇava-kośa";

/** The records whose text cover (a printed page) must not stand in for their photo (15-11-2026, Whisper: «Śaṅkarācārya
 *  trae la foto de una página de libro»): the ✕ on it in the record. Kept in this computer (localStorage). */
export const coverHidden = {
  read(): Set<number> {
    try {
      return new Set<number>(JSON.parse(localStorage.getItem("bio.coverHidden") ?? "[]"));
    } catch {
      return new Set<number>();
    }
  },
  write(s: Set<number>) {
    try {
      localStorage.setItem("bio.coverHidden", JSON.stringify([...s]));
    } catch {
      /* storage unavailable */
    }
  },
  has(id: number) {
    return this.read().has(id);
  },
  add(id: number) {
    const s = this.read();
    s.add(id);
    this.write(s);
  },
  remove(id: number) {
    const s = this.read();
    if (s.delete(id)) this.write(s);
  },
};

/** One petal pointing up from the centre (50,50), `len` long and `w` wide, turned `deg` degrees. */
const petal = (len: number, w: number, deg: number, fill: string, key: string) => (
  <path
    key={key}
    d={`M50 50 C${50 - w} ${50 - len * 0.35}, ${50 - w * 0.8} ${50 - len * 0.8}, 50 ${50 - len} C${50 + w * 0.8} ${50 - len * 0.8}, ${50 + w} ${50 - len * 0.35}, 50 50Z`}
    fill={fill}
    transform={`rotate(${deg} 50 50)`}
  />
);

/** The lotus of the decorations (15-11-2026, Whisper: «decorar la app con floripondios», after a picture of
 *  Mahāprabhu before a pink lotus): three rings of petals, a golden heart and soft rays. */
export function LotusMandala({ rays = true }: { rays?: boolean }) {
  const ring = (n: number, len: number, w: number, fill: string, off: number) =>
    Array.from({ length: n }, (_, i) => petal(len, w, (360 / n) * i + off, fill, `${n}-${len}-${i}`));
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <radialGradient id="lotus-heart" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff3c4" />
          <stop offset="60%" stopColor="#f2c95c" />
          <stop offset="100%" stopColor="#d9a845" />
        </radialGradient>
      </defs>
      {rays && Array.from({ length: 36 }, (_, i) => <line key={i} x1="50" y1="50" x2="50" y2="0" stroke="#f2c95c" strokeWidth="0.35" opacity="0.5" transform={`rotate(${i * 10} 50 50)`} />)}
      {ring(16, 46, 7.5, "#f8c7d0", 11.25)}
      {ring(12, 36, 8, "#f3a9b9", 0)}
      {ring(8, 25, 8, "#ec8fa5", 22.5)}
      <circle cx="50" cy="50" r="9" fill="url(#lotus-heart)" />
    </svg>
  );
}

/** A small lotus to separate the sections of the home page. */
export function LotusDivider() {
  return (
    <div className="lotus-divider" aria-hidden="true">
      <span />
      <svg viewBox="0 0 40 24">
        <path d="M20 22 C14 18 13 9 20 2 C27 9 26 18 20 22Z" fill="#ec8fa5" />
        <path d="M20 22 C12 21 6 15 4 8 C12 9 18 14 20 22Z" fill="#f3a9b9" />
        <path d="M20 22 C28 21 34 15 36 8 C28 9 22 14 20 22Z" fill="#f3a9b9" />
        <circle cx="20" cy="20" r="2.2" fill="#f2c95c" />
      </svg>
      <span />
    </div>
  );
}

/** Words of respect left out of the initials: «Śrī Narahari Sarakāra Ṭhākura» → «NS». */
const NOT_INITIAL = /^(śrī|śrīla|śrīmatī|śrīmān|sri|srila|ṭhākura|ṭhākurāṇī|gosvāmī|gosāñi|prabhu|paṇḍita|paṇḍit|mahārāja|svāmī|devī|mātā|dāsa|dāsī|ācārya|bhakti|of|the|and)$/i;

export function initialsOf(name: string): string {
  const words = name
    .replace(/\([^)]*\)/g, " ")
    .split(/[\s,.;:/-]+/)
    .filter((w) => w && /^\p{L}/u.test(w) && !NOT_INITIAL.test(w));
  return words
    .slice(0, 2)
    .map((w) => [...w.normalize("NFC")][0].toLocaleUpperCase())
    .join("");
}

/** The picture of a record that has no photo yet (15-11-2026, Whisper: «algo estándar en vez de vacío»): the
 *  gold tilaka of the logo on a soft maroon ground, with the initials of the name. */
export function NoPhoto({ name, small }: { name: string; small?: boolean }) {
  const ini = initialsOf(name);
  return (
    <span className={`no-photo${small ? " small" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <path d="M40 14 V36 Q40 47 50 48 Q60 47 60 36 V14" fill="none" stroke="#d9a845" strokeWidth="5" strokeLinecap="round" />
        <path d="M50 50 Q45.5 55 50 61 Q54.5 55 50 50Z" fill="#a8d898" />
        {!small && ini && (
          <text x="50" y="88" textAnchor="middle" fontSize="20" fontWeight="600" fill="#f3e3c8" letterSpacing="2">
            {ini}
          </text>
        )}
      </svg>
    </span>
  );
}
