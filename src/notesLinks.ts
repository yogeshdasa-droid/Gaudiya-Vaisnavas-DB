// The «Links» of a record (12-11-2026, Whisper: «una sección donde se añadan los links a files, folders o web,
// mejor que dentro de notas»). They are kept at the end of the record's notes, in a block of their own:
//
//   …the notes…
//   <!-- links -->
//   - [Name](<E:\Books\life.pdf>)
//   - [Site](<https://…>)
//
// so that they go with the record everywhere the notes go (earlier versions, copies, search, export) without a
// new table; the record shows them as a section of their own, and the editor as a list.

export interface NoteLink {
  label: string;
  target: string;
}

const MARK = "<!-- links -->";

/** The notes without their links block, and the links. */
export function splitNotes(notes: string): { body: string; links: NoteLink[] } {
  const at = notes.lastIndexOf(MARK);
  if (at < 0) return { body: notes, links: [] };
  const links: NoteLink[] = [];
  // text that ended up after the block (18-11-2026: a script added a paragraph on the last link's line) goes back to
  // the notes instead of becoming part of a link
  const extra: string[] = [];
  for (const line of notes.slice(at + MARK.length).split(/\r?\n/)) {
    const m = line.match(/^\s*-\s*(?:\[([^\]]*)\]\(<([^>]+)>\)|<([^>]+)>)\s*(.*)$/);
    if (m) {
      const target = (m[2] ?? m[3] ?? "").trim();
      if (target) links.push({ label: (m[1] ?? "").trim(), target });
      if (m[4].trim()) extra.push(m[4].trim());
      continue;
    }
    const bare = line.match(/^\s*-\s*((?:https?:|www\.|file:|[A-Za-z]:[\\/]|\\\\)\S.*?)\s*$/);
    if (bare) links.push({ label: "", target: bare[1] });
    else if (line.trim()) extra.push(line.trim());
  }
  const body = [notes.slice(0, at).replace(/\s+$/, ""), ...extra].filter(Boolean).join("\n\n");
  return { body, links };
}

/** The notes with their links block (none when there are no links). */
export function joinNotes(body: string, links: NoteLink[]): string {
  const kept = links.map((l) => ({ label: l.label.replace(/[[\]\n]/g, " ").trim(), target: l.target.replace(/[<>\n]/g, "").trim() })).filter((l) => l.target);
  const text = body.replace(/\s+$/, "");
  if (!kept.length) return text;
  return `${text}${text ? "\n\n" : ""}${MARK}\n${kept.map((l) => `- [${l.label}](<${l.target}>)`).join("\n")}`;
}

/** What a link opens: a web page, a folder or a file. */
export function linkKind(target: string): "web" | "folder" | "file" {
  if (/^(https?:|mailto:|www\.)/i.test(target)) return "web";
  const last = target.replace(/[\\/]+$/, "").split(/[\\/]/).pop() ?? "";
  return /[\\/]$/.test(target) || !/\.[A-Za-z0-9]{1,6}$/.test(last) ? "folder" : "file";
}

/** What to hand to the system to open a link («www.x.org» → «https://www.x.org», «file:///E:/…» → «E:/…»). */
export function linkOpenTarget(target: string): string {
  if (linkKind(target) === "web") return /^[a-z]+:/i.test(target) ? target : `https://${target}`;
  return target.startsWith("file:///") ? decodeURI(target.slice(8)) : target;
}

/** The name shown for a link without one: the page's host, or the file's or folder's name. */
export function linkLabel(l: NoteLink): string {
  if (l.label) return l.label;
  if (linkKind(l.target) === "web") return l.target.replace(/^(https?:\/\/)?(www\.)?/i, "").replace(/\/.*$/, "");
  return l.target.replace(/[\\/]+$/, "").split(/[\\/]/).pop() || l.target;
}
