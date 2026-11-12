// Holy places (format 7): finding them in the records' "Place" field.
import type { Place } from "./api";
import { foldName } from "./components/Sidebar";

/** Words without their final "a" (Jājigrāma = Jajigram, Khaṇḍa = Khand). */
const strip = (w: string) => (w.length > 3 && w.endsWith("a") ? w.slice(0, -1) : w);

/** Matching key of a way of writing a place: folded, without final "a"s and
 *  without spaces ("Śrī Khaṇḍa" = "Srikhanda" = "srikhand"). */
export const placeKey = (s: string) => foldName(s).split(" ").filter(Boolean).map(strip).join("");

/** The keys of a place: its name, its other spellings and what is in brackets
 *  or after a slash ("Kālnā (Ambikā)", "Navadvīpa / Māyāpur"). */
export function placeKeys(p: { name: string; aka: string }): string[] {
  const parts = [p.name, ...p.aka.split(","), ...`${p.name},${p.aka}`.split(/[,/()]/)];
  return [...new Set(parts.map(placeKey).filter((k) => k.length >= 3))];
}

/** All the keys a text could hold: each run of one to three words joined. */
export function textKeys(text: string): Set<string> {
  const words = foldName(text).split(" ").filter(Boolean).map(strip);
  const out = new Set<string>();
  for (let i = 0; i < words.length; i++) {
    let k = "";
    for (let j = i; j < Math.min(words.length, i + 3); j++) out.add((k += words[j]));
  }
  return out;
}

export const namesPlace = (keys: Set<string>, place: string[]) => place.some((k) => keys.has(k));

/** The places of a record: those that list it, and those named in its "Place". */
export function placesOfPerson(id: number, placeField: string, places: Place[]) {
  const keys = textKeys(placeField);
  return places
    .map((pl) => ({ place: pl, roles: pl.people.filter((x) => x.personId === id).map((x) => x.role) }))
    .filter(({ place, roles }) => roles.length > 0 || (placeField.trim() && namesPlace(keys, placeKeys(place))));
}

/** The areas the Tīrthas list is grouped in (12-11-2026, Whisper: «organizarlos para que no quede un pedazo de lista»). */
export const ZONES = ["navadvipa", "gauda", "ksetra", "vraja", "other"] as const;
export type Zone = (typeof ZONES)[number];
/** Vraja is large: its places go by the area of the parikramā they belong to. */
export const VRAJA_AREAS = ["vrndavana", "mathura", "govardhana", "varsana", "kamyavana", "gokula", "rest"] as const;
export type VrajaArea = (typeof VRAJA_AREAS)[number];
/** Gauḍa-maṇḍala is large too: by district (Bangladesh together). */
export const GAUDA_AREAS = ["nadia", "bardhaman", "hugli", "parganas", "murshidabad", "birbhum", "medinipur", "bangladesh", "rest"] as const;
export type GaudaArea = (typeof GAUDA_AREAS)[number];
const GAUDA_WORDS: [GaudaArea, RegExp][] = [
  ["bangladesh", /bangladesh|jessore|yasohar|dhaka|chittagong|cattagram|srihatt|sylhet|rajsah|rajshah|khuln|barisal|mymens|faridpur/],
  ["nadia", /nadiy|nadia/],
  ["bardhaman", /bardham|vardham|burdwan/],
  ["hugli", /hugl|hooghl|saptagram/],
  ["parganas", /parga|caubis|kolkat|calcutt/],
  ["murshidabad", /murs|malda|gauda|rajmahal/],
  ["birbhum", /birbhum|virabhum|bankur|bankud/],
  ["medinipur", /medin|midnap|jharkhand|singhbh/],
];
const GAUDA_CENTRES: [GaudaArea, number, number][] = [
  ["nadia", 23.3, 88.5],
  ["bardhaman", 23.45, 87.95],
  ["hugli", 22.9, 88.3],
  ["parganas", 22.6, 88.4],
  ["murshidabad", 24.3, 88.2],
  ["birbhum", 23.6, 87.3],
  ["medinipur", 22.3, 87.3],
];
function gaudaArea(p: { lat: number | null; lon: number | null; region: string; location: string }): GaudaArea {
  const f = foldName(`${p.region} ${p.location}`);
  for (const [a, rx] of GAUDA_WORDS) if (rx.test(f)) return a;
  if (p.lat == null || p.lon == null) return "rest";
  if (p.lon > 88.95 || p.lat > 24.6) return "bangladesh";
  let best: GaudaArea = "rest", d = 0.6;
  for (const [a, la, lo] of GAUDA_CENTRES) {
    const e = Math.hypot(p.lat - la, p.lon - lo);
    if (e < d) [best, d] = [a, e];
  }
  return best;
}
const VRAJA_CENTRES: [VrajaArea, number, number][] = [
  ["vrndavana", 27.58, 77.7],
  ["mathura", 27.49, 77.67],
  ["govardhana", 27.5, 77.47],
  ["varsana", 27.68, 77.38],
  ["kamyavana", 27.65, 77.27],
  ["gokula", 27.44, 77.72],
];

/** The area of a holy place: by its coordinates, or else by the district written in it. */
export function placeZone(p: { lat: number | null; lon: number | null; region: string; location: string; name: string }): { zone: Zone; area?: VrajaArea | GaudaArea } {
  const { lat, lon } = p;
  if (lat != null && lon != null) {
    if (lat >= 27.2 && lat <= 28 && lon >= 77.1 && lon <= 78) {
      // the nearest centre within about 7 km; the forests and villages farther away go together
      let best: VrajaArea = "rest", d = 0.065;
      for (const [a, la, lo] of VRAJA_CENTRES) {
        const e = Math.hypot(lat - la, (lon - lo) * 0.89);
        if (e < d) [best, d] = [a, e];
      }
      return { zone: "vraja", area: best };
    }
    if (lat >= 23.33 && lat <= 23.52 && lon >= 88.26 && lon <= 88.5) return { zone: "navadvipa" };
    if (lat >= 18 && lat < 21.7 && lon >= 83.5 && lon <= 87.6) return { zone: "ksetra" };
    if (lat >= 21.4 && lat <= 27 && lon >= 85.8 && lon <= 92.6) return { zone: "gauda", area: gaudaArea(p) };
    return { zone: "other" };
  }
  const f = foldName(`${p.region} ${p.location} ${p.name}`);
  if (/navadvip/.test(f)) return { zone: "navadvipa" };
  if (/vraja|braj|mathur|vrndavan|govardhan|nandagram|varsan/.test(f)) return { zone: "vraja", area: "rest" };
  if (/orissa|odisha|utkal|puri\b|nilacal/.test(f)) return { zone: "ksetra" };
  if (/nadiy|nadia|bardham|vardham|burdwan|murs[hi]*d|hugl|hooghl|birbhum|virabhum|bankur|bankud|medin|midnap|parga|caubis|bengal|bangladesh|jessore|yasohar|dhaka|chittagong|cattagram|srihatt|sylhet|rajsah|rajshah|malda|khuln|barisal|mymens/.test(f)) return { zone: "gauda", area: gaudaArea(p) };
  return { zone: "other" };
}
