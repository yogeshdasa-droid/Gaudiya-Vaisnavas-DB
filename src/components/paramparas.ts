// The paramparās that «Linaje» and the Paramparā Tree can show (13-11-2026, Whisper: «varias opciones de paramparā…
// Gauḍīya only, ISKCON only, other ways»): a chain of ācāryas, step by step, and then the disciples of the last one as
// the data has them (the tree, the other gurus and, for the families, the family lines). A step can have companions
// named with it in the lists («Rūpa (Svarūpa, Sanātana)»). The chain is the one the lists give: where the data has
// no line between two steps, the chain draws one anyway (śikṣā, «in the list»), as the books do.
import type { PersonListItem, TreeKind } from "../api";

export type RelKind = TreeKind | "family";

export interface Step {
  id: number;
  /** named with this step in the list, on the same row */
  with?: number[];
}

export interface Parampara {
  id: string;
  group: "gaudiya" | "iskcon" | "matha" | "family";
  title: { es: string; en: string };
  about: { es: string; en: string };
  source: string;
  steps: Step[];
  /** generations of disciples of the last step shown at first */
  down: number;
  /** also follow the family lines (son, wife, descendant…) below the last step */
  family?: boolean;
}

// Kṛṣṇa → … → Bhaktisiddhānta, as Bhaktivinoda Ṭhākura gave it and as it is printed in the Bhagavad-gītā As It Is
const GAUDIYA: Step[] = [
  { id: 1889 }, // Lord Kṛṣṇa
  { id: 1890 }, // Brahmā
  { id: 975 }, // Nārada
  { id: 1891 }, // Vyāsa
  { id: 1892 }, // Madhva
  { id: 1893 }, // Padmanābha
  { id: 1894 }, // Nṛhari
  { id: 1895 }, // Mādhava
  { id: 1896 }, // Akṣobhya
  { id: 1897 }, // Jayatīrtha
  { id: 1898 }, // Jñānasindhu
  { id: 1899 }, // Dayānidhi
  { id: 1900 }, // Vidyānidhi
  { id: 1901 }, // Rājendra
  { id: 1902 }, // Jayadharma
  { id: 1903 }, // Puruṣottama
  { id: 1904 }, // Brahmaṇya Tīrtha
  { id: 1905 }, // Vyāsatīrtha
  { id: 1906 }, // Lakṣmīpati
  { id: 868 }, // Mādhavendra Purī
  { id: 516, with: [1851, 15] }, // Īśvara Purī (Nityānanda, Advaita)
  { id: 164 }, // Śrī Caitanya Mahāprabhu
  { id: 1325, with: [1513, 1353] }, // Rūpa (Svarūpa, Sanātana)
  { id: 1206, with: [618] }, // Raghunātha, Jīva
  { id: 759 }, // Kṛṣṇadāsa Kavirāja
  { id: 1010 }, // Narottama
  { id: 1723 }, // Viśvanātha Cakravartī
  { id: 1828, with: [73] }, // (Baladeva) Jagannātha
  { id: 128 }, // Bhaktivinoda
  { id: 1819 }, // Gaura Kiśora
  { id: 124 }, // Bhaktisiddhānta Sarasvatī
];

const LIST = "Bhaktivinoda Ṭhākura; Bhagavad-gītā As It Is, Introduction (the disciplic succession)";

export const PARAMPARAS: Parampara[] = [
  {
    id: "gaudiya",
    group: "gaudiya",
    title: { es: "Gauḍīya (la oficial)", en: "Gauḍīya (the official one)" },
    about: {
      es: "La Guru-paramparā que dio Bhaktivinoda Ṭhākura: de Kṛṣṇa a Bhaktisiddhānta Sarasvatī, por la línea de Madhva y Mādhavendra Purī. Muchos pasos son de śikṣā (instrucción), no de dīkṣā.",
      en: "The Guru-paramparā given by Bhaktivinoda Ṭhākura: from Kṛṣṇa to Bhaktisiddhānta Sarasvatī, through Madhva and Mādhavendra Purī. Many steps are of śikṣā (instruction), not dīkṣā.",
    },
    source: LIST,
    steps: GAUDIYA,
    down: 0,
  },
  {
    id: "iskcon",
    group: "iskcon",
    title: { es: "ISKCON (Śrīla Prabhupāda)", en: "ISKCON (Śrīla Prabhupāda)" },
    about: {
      es: "La misma sucesión, tal como sale en el Bhagavad-gītā tal como es (32 ācāryas), hasta Śrīla A. C. Bhaktivedānta Svāmī Prabhupāda, y sus discípulos que están en la base de datos.",
      en: "The same succession as printed in the Bhagavad-gītā As It Is (32 ācāryas), down to Śrīla A. C. Bhaktivedānta Svāmī Prabhupāda, and his disciples who are in the database.",
    },
    source: LIST,
    steps: [...GAUDIYA, { id: 125 }],
    down: 1,
  },
  {
    id: "matha",
    group: "matha",
    title: { es: "Gauḍīya Maṭha (Sārasvata)", en: "Gauḍīya Maṭha (Sārasvata)" },
    about: {
      es: "La familia Sārasvata: de Bhaktivinoda Ṭhākura y Gaura Kiśora a Bhaktisiddhānta Sarasvatī, y de él a sus discípulos sannyāsīs (Śrīdhara Mahārāja, Keśava Mahārāja…) y los discípulos de estos.",
      en: "The Sārasvata family: from Bhaktivinoda Ṭhākura and Gaura Kiśora to Bhaktisiddhānta Sarasvatī, and from him to his sannyāsī disciples (Śrīdhara Mahārāja, Keśava Mahārāja…) and their disciples.",
    },
    source: "Gauḍīya Maṭha",
    steps: [{ id: 1828 }, { id: 128 }, { id: 1819 }, { id: 124 }],
    down: 2,
  },
  {
    id: "nityananda",
    group: "family",
    title: { es: "Nityānanda: familia y parivāra", en: "Nityānanda: family and parivāra" },
    about: {
      es: "Nityānanda Prabhu, su familia (Jāhnavā, Vasudhā, Vīrabhadra…) y sus discípulos, como están en el árbol.",
      en: "Nityānanda Prabhu, his family (Jāhnavā, Vasudhā, Vīrabhadra…) and his disciples, as they are in the tree.",
    },
    source: "",
    steps: [{ id: 1906 }, { id: 1851 }],
    down: 3,
    family: true,
  },
  {
    id: "advaita",
    group: "family",
    title: { es: "Advaita: familia y parivāra", en: "Advaita: family and parivāra" },
    about: {
      es: "Advaita Ācārya, su familia (Sītā, Acyutānanda…) y sus discípulos, como están en el árbol.",
      en: "Advaita Ācārya, his family (Sītā, Acyutānanda…) and his disciples, as they are in the tree.",
    },
    source: "",
    steps: [{ id: 868 }, { id: 15 }],
    down: 3,
    family: true,
  },
  {
    id: "narottama",
    group: "family",
    title: { es: "Parivāra de Narottama", en: "Narottama's parivāra" },
    about: {
      es: "De Mahāprabhu a Lokanātha Gosvāmī y Narottama dāsa Ṭhākura, y los discípulos de Narottama.",
      en: "From Mahāprabhu to Lokanātha Gosvāmī and Narottama dāsa Ṭhākura, and Narottama's disciples.",
    },
    source: "",
    steps: [{ id: 164 }, { id: 844 }, { id: 1010 }],
    down: 3,
    family: true,
  },
  {
    id: "srinivasa",
    group: "family",
    title: { es: "Parivāra de Śrīnivāsa Ācārya", en: "Śrīnivāsa Ācārya's parivāra" },
    about: {
      es: "De Mahāprabhu a Gopāla Bhaṭṭa Gosvāmī y Śrīnivāsa Ācārya, su familia y sus discípulos.",
      en: "From Mahāprabhu to Gopāla Bhaṭṭa Gosvāmī and Śrīnivāsa Ācārya, his family and his disciples.",
    },
    source: "",
    steps: [{ id: 164 }, { id: 343 }, { id: 1466 }],
    down: 3,
    family: true,
  },
  {
    id: "syamananda",
    group: "family",
    title: { es: "Parivāra de Śyāmānanda", en: "Śyāmānanda's parivāra" },
    about: {
      es: "De Nityānanda a Gaurīdāsa Paṇḍita, Hṛdaya Caitanya y Śyāmānanda Prabhu, y los discípulos de Śyāmānanda (Rasikānanda…).",
      en: "From Nityānanda to Gaurīdāsa Paṇḍita, Hṛdaya Caitanya and Śyāmānanda Prabhu, and Śyāmānanda's disciples (Rasikānanda…).",
    },
    source: "",
    steps: [{ id: 1851 }, { id: 325 }, { id: 504 }, { id: 1535 }],
    down: 3,
    family: true,
  },
];

export const paramparaById = (id: string | null) => PARAMPARAS.find((p) => p.id === id) ?? null;

/** A guru → disciple line, from the data (place in the tree, other gurus, family) or from the list. */
export interface PRel {
  from: number;
  to: number;
  kind: RelKind;
  note: string;
  disputed: boolean;
  /** drawn because the list says so: the data has no line there */
  list?: boolean;
}

/** All the lines of the data: place in the tree, other gurus and (if asked) family. */
export function dataRelations(persons: PersonListItem[], family: boolean): PRel[] {
  const ids = new Set(persons.map((p) => p.id));
  const out: PRel[] = [];
  for (const p of persons) {
    if (p.tree && p.tree.parent !== null && ids.has(p.tree.parent))
      out.push({ from: p.tree.parent, to: p.id, kind: p.tree.kind, note: p.tree.note, disputed: p.tree.disputed });
    for (const l of p.links)
      if (ids.has(l.guru) && !(p.tree && p.tree.parent === l.guru)) out.push({ from: l.guru, to: p.id, kind: l.kind, note: l.note, disputed: l.disputed });
    if (family) for (const f of p.family) if (ids.has(f.relative)) out.push({ from: f.relative, to: p.id, kind: "family", note: f.note, disputed: f.disputed });
  }
  return out;
}

/** Who a paramparā shows: each person with its generation (the chain: 1, 2, 3…; companions on their step's row;
 *  then the disciples of the last step), and the lines between them. */
export function paramparaMembers(pp: Parampara, persons: PersonListItem[], down: number, keep: (r: PRel) => boolean = () => true, max = 450) {
  const byId = new Map(persons.map((p) => [p.id, p]));
  const rels = dataRelations(persons, !!pp.family).filter(keep);
  const gen = new Map<number, number>();
  const steps = pp.steps.filter((s) => byId.has(s.id));
  steps.forEach((s, i) => {
    gen.set(s.id, i + 1);
    for (const w of s.with ?? []) if (byId.has(w) && !gen.has(w)) gen.set(w, i + 1);
  });
  const chain: PRel[] = [];
  const found = (a: number, b: number) => rels.find((r) => r.from === a && r.to === b);
  steps.forEach((s, i) => {
    if (i === 0) return;
    const prev = steps[i - 1].id;
    for (const to of [s.id, ...(s.with ?? []).filter((w) => byId.has(w))]) {
      if (to === s.id || found(prev, to)) chain.push(found(prev, to) ?? { from: prev, to, kind: "siksa", note: "", disputed: false, list: true });
      else chain.push({ from: prev, to, kind: "associate", note: "", disputed: false, list: true });
    }
  });
  // the disciples (and family) of the last step, generation by generation, in the tree's order
  const last = steps[steps.length - 1]?.id;
  const base = steps.length;
  let cut = false;
  if (last !== undefined) {
    const discOf = new Map<number, PRel[]>();
    for (const r of rels) discOf.set(r.from, [...(discOf.get(r.from) ?? []), r]);
    let frontier = [last];
    for (let g = 1; g <= down && frontier.length && !cut; g++) {
      const next: number[] = [];
      for (const id of frontier) {
        const ds = [...(discOf.get(id) ?? [])].sort((a, b) => (byId.get(a.to)?.tree?.pos ?? 0) - (byId.get(b.to)?.tree?.pos ?? 0));
        for (const r of ds) {
          if (gen.has(r.to)) continue;
          if (gen.size >= max) {
            cut = true;
            break;
          }
          gen.set(r.to, base + g);
          next.push(r.to);
        }
        if (cut) break;
      }
      frontier = next;
    }
  }
  // the lines between the people shown: the chain's own, and the data's among the rest
  const inChain = new Set(chain.map((r) => `${r.from}-${r.to}`));
  const chainIds = new Set(steps.flatMap((s) => [s.id, ...(s.with ?? [])]));
  const edges = [
    ...chain,
    ...rels.filter((r) => gen.has(r.from) && gen.has(r.to) && r.from !== r.to && !inChain.has(`${r.from}-${r.to}`) && !(chainIds.has(r.from) && chainIds.has(r.to))),
  ];
  return { gen, edges, steps: steps.length, cut, last };
}
