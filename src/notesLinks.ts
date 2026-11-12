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
  for (const line of notes.slice(at + MARK.length).split(/\r?\n/)) {
    const m = line.match(/^\s*-\s*(?:\[([^\]]*)\]\(<([^>]+)>\)|<([^>]+)>|(\S.*))\s*$/);
    if (!m) continue;
    const target = (m[2] ?? m[3] ?? m[4] ?? "").trim();
    if (target) links.push({ label: (m[1] ?? "").trim(), target });
  }
  return { body: notes.slice(0, at).replace(/\s+$/, ""), links };
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

/** The name shown for a link without one: the page's host, or the file's or folder's name. */
export function linkLabel(l: NoteLink): string {
  if (l.label) return l.label;
  if (linkKind(l.target) === "web") return l.target.replace(/^(https?:\/\/)?(www\.)?/i, "").replace(/\/.*$/, "");
  return l.target.replace(/[\\/]+$/, "").split(/[\\/]/).pop() || l.target;
}
