import type { PersonListItem } from "./api";
import { foldWord } from "./fold";
import { foldName } from "./components/Sidebar";

/** Folded names (and other names) of the records → record id. */
export interface NameIndex {
  ids: Map<string, number>;
  maxWords: number;
  /** For the names written in **bold** in the notes (15-11-2026): the name without «Śrī», «Ṭhākura»,
   *  «(son of …)»… (`exact`), or only its first word (`first`). -1 = more than one record: not linked. */
  bold: { full: Map<string, number>; exact: Map<string, number>; first: Map<string, number> };
}

/** The name with its titles but without «Śrī» and «(son of …)»: «Gadādhara Paṇḍita Gosvāmī» is one record even
 *  where «Gadādhara» is several. */
const SRI = new Set(["śrī", "śrīla", "śrīmatī", "śrīmān"].map(foldWord));
const fullKey = (name: string) =>
  foldName(name.replace(/\([^)]*\)/g, " "))
    .split(" ")
    .filter((w) => w && !SRI.has(w))
    .join(" ");

/** Words of respect that a name in the notes often leaves out. */
const TITLES = new Set(
  ["śrī", "śrīla", "śrīmatī", "śrīmān", "ṭhākura", "ṭhākurāṇī", "gosvāmī", "gosāñi", "prabhu", "paṇḍita", "paṇḍit", "mahāśaya", "devī", "mātā", "īśvarī", "ācārya"].map(foldWord),
);
export const boldKey = (name: string) =>
  foldName(name.replace(/\([^)]*\)/g, " "))
    .split(" ")
    .filter((w) => w && !TITLES.has(w))
    .join(" ");

/**
 * Only names of two words or more are linked: single words ("Rupa",
 * "Yamuna", "Agata") are too often something else.
 */
export function buildNameIndex(persons: PersonListItem[]): NameIndex {
  const ids = new Map<string, number>();
  const full = new Map<string, number>();
  const exact = new Map<string, number>();
  const first = new Map<string, number>();
  const put = (m: Map<string, number>, k: string, id: number) => {
    if (!k) return;
    const was = m.get(k);
    m.set(k, was === undefined || was === id ? id : -1);
  };
  let maxWords = 0;
  // when two records share a name, the one with more texts wins
  for (const p of [...persons].sort((a, b) => b.docs - a.docs)) {
    for (const name of [p.name, ...p.aka.split(",")]) {
      const key = foldName(name);
      const n = key.split(" ").length;
      if (!key || n < 2 || ids.has(key)) continue;
      ids.set(key, p.id);
      maxWords = Math.max(maxWords, n);
    }
    for (const name of [p.name, ...p.aka.split(",")]) {
      put(full, fullKey(name), p.id);
      // «Vīrabhadra (disciple of Śyāmānanda)» is a namesake: a bare «Vīrabhadra» is never him
      if (/\(/.test(name)) continue;
      const k = boldKey(name);
      put(exact, k, p.id);
      put(first, k.split(" ")[0], p.id);
    }
  }
  return { ids, maxWords: Math.min(maxWords, 7), bold: { full, exact, first } };
}

/** Names that, alone, are the Lord or a Deity («Jagannātha, Balarāma and Subhadrā»), not a devotee of that name. */
const ALONE_NOT = new Set(
  ["jagannātha", "balarāma", "subhadrā", "gopīnātha", "govinda", "madana-mohana", "madana mohana", "rādhā", "kṛṣṇa", "gaura", "gaurāṅga", "nitāi", "caitanya", "rādhākānta", "rādhā-ramaṇa", "rādhā ramaṇa", "gopāla", "nṛsiṁha", "rāma", "lakṣmī", "gaurahari", "mahāprabhu"].map(
    (w) => foldName(w),
  ),
);

/** The record of a name written in bold, if only one record can be meant. */
export function boldPerson(text: string, index: NameIndex | null): number | null {
  if (!index) return null;
  const fk = fullKey(text);
  const w = fk.includes(" ") ? index.bold.full.get(fk) : undefined;
  if (w !== undefined && w > 0) return w;
  const k = boldKey(text);
  if (!k || ALONE_NOT.has(k)) return null;
  const e = index.bold.exact.get(k);
  if (e !== undefined) return e > 0 ? e : null;
  if (k.includes(" ")) return null;
  const f = index.bold.first.get(k);
  return f !== undefined && f > 0 ? f : null;
}

const WORD = /[\p{L}\p{M}\p{N}'’]+/gu;
const GAP = /^[ \t -]+$/;

/**
 * Turns the names of other records written in the text into links
 * (<a data-person="id">), the first time each one appears.
 */
export function linkNames(root: HTMLElement, index: NameIndex | null, exclude: number | null): void {
  if (!index || !index.ids.size) return;
  const seen = new Set<number>(exclude ? [exclude] : []);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.parentElement?.closest("a, pre, code, .md-code") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);

  for (const node of nodes) {
    const text = node.data;
    const words = Array.from(text.matchAll(WORD), (m) => ({ s: m.index!, e: m.index! + m[0].length, f: foldWord(m[0]) }));
    const found: { s: number; e: number; id: number }[] = [];
    for (let i = 0; i < words.length; i++) {
      for (let n = Math.min(index.maxWords, words.length - i); n >= 2; n--) {
        let ok = true;
        for (let k = i; k < i + n - 1 && ok; k++) ok = GAP.test(text.slice(words[k].e, words[k + 1].s));
        if (!ok) continue;
        const id = index.ids.get(words.slice(i, i + n).map((w) => w.f).join(" "));
        if (id === undefined) continue;
        if (!seen.has(id)) {
          seen.add(id);
          found.push({ s: words[i].s, e: words[i + n - 1].e, id });
        }
        i += n - 1;
        break;
      }
    }
    if (!found.length) continue;
    const frag = document.createDocumentFragment();
    let at = 0;
    for (const f of found) {
      frag.append(text.slice(at, f.s));
      const a = document.createElement("a");
      a.className = "person-link";
      a.dataset.person = String(f.id);
      a.textContent = text.slice(f.s, f.e);
      frag.append(a);
      at = f.e;
    }
    frag.append(text.slice(at));
    node.replaceWith(frag);
  }
}
