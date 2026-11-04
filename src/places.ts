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
