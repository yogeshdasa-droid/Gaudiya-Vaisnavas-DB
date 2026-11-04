// The Guru Paramparā drawn from top to bottom (as in a printed sampradāya
// chart): each guru above his disciples, the groups («Pañca-tattva», «Los
// seis Gosvāmīs»…) in a box, and the many disciples of one guru who have no
// disciples of their own in a single list box, so that the drawing stays
// readable. The places are worked out by dagre (a layered layout).
import dagre from "@dagrejs/dagre";
import { PersonListItem, TreeKind } from "../api";

export const TB_W = 176; // box width
export const TB_H = 30; // box height
export const TB_ROW = 17; // one name in a list box
const LIST_MIN = 4; // so many leaf disciples of one guru (or more) go in a list box

export interface TBNode {
  key: string;
  x: number; // top left
  y: number;
  w: number;
  h: number;
  /** a person, or a list of leaf disciples (same guru) */
  p?: PersonListItem;
  items?: { p: PersonListItem; kind: TreeKind | null }[];
  kind: TreeKind | null;
}
export interface TBGroup {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** under: for each record drawn, the guru it goes under and how (see TreeView.arrange);
 *  busy: records with other lines (śikṣā, family…) — they keep a box of their own. */
export function layoutTB(
  under: Map<number, { parent: number | null; kind: TreeKind | null }>,
  byPerson: Map<number, PersonListItem>,
  kids: Map<number | null, PersonListItem[]>,
  busy: Set<number>,
) {
  const g = new dagre.graphlib.Graph({ compound: true, multigraph: false });
  g.setGraph({ rankdir: "TB", nodesep: 18, ranksep: 56, edgesep: 8, marginx: 10, marginy: 24 });
  g.setDefaultEdgeLabel(() => ({}));
  const groupOf = (id: number) => (byPerson.get(id)?.tree?.group ?? "").trim();
  const nodeOf = new Map<number, string>(); // person → the node it is drawn in
  const lists = new Map<string, { p: PersonListItem; kind: TreeKind | null }[]>();
  const chains = new Set<string>();
  const hasKids = (id: number) => (kids.get(id) ?? []).some((c) => under.has(c.id));
  // the list boxes: leaf disciples of one guru, of no group, with no other lines
  for (const [parent, list] of kids) {
    if (parent === null) continue;
    const leaves = list.filter((c) => under.has(c.id) && !hasKids(c.id) && !groupOf(c.id) && !busy.has(c.id));
    if (leaves.length < LIST_MIN) continue;
    const key = `L${parent}`;
    lists.set(key, leaves.map((c) => ({ p: c, kind: under.get(c.id)!.kind })));
    for (const c of leaves) nodeOf.set(c.id, key);
  }
  // the chain boxes: a straight line of one guru – one disciple (Madhva → Padmanābha → …), in one box,
  // as long as they are in the same group and have no other lines
  const only = (id: number) => {
    const c = (kids.get(id) ?? []).filter((x) => under.has(x.id));
    return c.length === 1 ? c[0].id : null;
  };
  const free = (id: number) => !nodeOf.has(id) && !busy.has(id);
  const links = (a: number, b: number) => free(a) && free(b) && groupOf(a) === groupOf(b);
  for (const id of under.keys()) {
    const up = under.get(id)!.parent;
    if (!free(id) || (up !== null && under.has(up) && only(up) === id && links(up, id))) continue; // not the start of a chain
    const chain = [id];
    for (let next = only(id); next !== null && links(chain[chain.length - 1], next); next = only(next)) chain.push(next);
    if (chain.length < LIST_MIN) continue;
    const key = `C${id}`;
    lists.set(key, chain.map((c) => ({ p: byPerson.get(c)!, kind: under.get(c)!.kind })));
    chains.add(key);
    for (const c of chain) nodeOf.set(c, key);
  }
  for (const id of under.keys()) if (!nodeOf.has(id)) nodeOf.set(id, `P${id}`);
  // nodes, in the order of the tree (so that dagre keeps the disciples in order)
  const added = new Set<string>();
  const add = (id: number) => {
    const key = nodeOf.get(id)!;
    if (added.has(key)) return;
    added.add(key);
    const items = lists.get(key);
    g.setNode(key, { width: TB_W, height: items ? items.length * TB_ROW + 12 : TB_H });
    const grp = groupOf(id);
    if (grp && (!items || chains.has(key))) {
      const gk = `G:${grp}`;
      if (!g.hasNode(gk)) g.setNode(gk, { label: grp });
      g.setParent(key, gk);
    }
  };
  const walk = (parent: number | null) => {
    for (const c of kids.get(parent) ?? []) {
      if (!under.has(c.id)) continue;
      add(c.id);
      walk(c.id);
    }
  };
  walk(null);
  for (const id of under.keys()) add(id); // loops in the data still show
  for (const [id, u] of under) {
    if (u.parent === null || !under.has(u.parent)) continue;
    const [a, b] = [nodeOf.get(u.parent)!, nodeOf.get(id)!];
    if (a !== b && !g.hasEdge(a, b)) g.setEdge(a, b, { minlen: 1, weight: lists.has(b) ? 1 : 2 });
  }
  dagre.layout(g);

  const nodes: TBNode[] = [];
  const groups: TBGroup[] = [];
  // each group's box: tight around its members (dagre's own box leaves much empty room)
  for (const key of g.nodes()) {
    if (!key.startsWith("G:")) continue;
    const members = (g.children(key) as unknown as string[]).map((c) => g.node(c) as { x: number; y: number; width: number; height: number });
    if (!members.length) continue;
    const x0 = Math.min(...members.map((n) => n.x - n.width / 2)) - 10;
    const x1 = Math.max(...members.map((n) => n.x + n.width / 2)) + 10;
    const y0 = Math.min(...members.map((n) => n.y - n.height / 2)) - 24;
    const y1 = Math.max(...members.map((n) => n.y + n.height / 2)) + 10;
    groups.push({ name: key.slice(2), x: x0, y: y0, w: x1 - x0, h: y1 - y0 });
  }
  for (const key of g.nodes()) {
    const n = g.node(key) as { x: number; y: number; width: number; height: number; label?: string };
    if (!n || key.startsWith("G:")) continue;
    const box = { key, x: n.x - n.width / 2, y: n.y - n.height / 2, w: n.width, h: n.height };
    const items = lists.get(key);
    if (items) nodes.push({ ...box, items, kind: items[0]?.kind ?? null });
    else {
      const id = Number(key.slice(1));
      nodes.push({ ...box, p: byPerson.get(id)!, kind: under.get(id)?.kind ?? null });
    }
  }
  const all = [...nodes, ...groups];
  const minX = Math.min(...all.map((b) => b.x), 0);
  const minY = Math.min(...all.map((b) => b.y), 0);
  for (const b of all) {
    b.x -= minX;
    b.y -= minY;
  }
  const width = Math.max(...all.map((b) => b.x + b.w), 0) + 20;
  const height = Math.max(...all.map((b) => b.y + b.h), 0) + 20;
  return { nodes, groups, nodeOf, width, height };
}
