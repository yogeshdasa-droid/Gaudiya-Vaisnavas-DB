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

/** What to hand to the system to open a link («www.x.org» → «https://www.x.org», «file:///E:/…» → «E:/…»). */
export function linkOpenTarget(target: string): string {
  if (linkKind(target) === "web") return /^[a-z]+:/i.test(target) ? target : `https://${target}`;
  return target.startsWith("file:///") ? decodeURI(target.slice(8)) : target;
}

/** A YouTube page as its player for other sites (the page itself refuses to be shown inside the app);
 *  any other address as it is. */
export function embedUrl(url: string): string {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return url;
  }
  const host = u.hostname.replace(/^(www\.|m\.|music\.)/, "");
  const start = (u.searchParams.get("t") ?? u.searchParams.get("start") ?? "").replace(/s$/, "");
  const at = /^\d+$/.test(start) ? `?start=${start}` : "";
  if (host === "youtu.be") {
    const id = u.pathname.slice(1).split("/")[0];
    if (id) return `https://www.youtube.com/embed/${id}${at}`;
  }
  if (host === "youtube.com") {
    const list = u.searchParams.get("list");
    const v = u.searchParams.get("v");
    if (u.pathname === "/watch" && v) return `https://www.youtube.com/embed/${v}${at}`;
    const m = u.pathname.match(/^\/(?:shorts|live|embed)\/([\w-]+)/);
    if (m) return `https://www.youtube.com/embed/${m[1]}${at}`;
    if (u.pathname === "/playlist" && list) return `https://www.youtube.com/embed/videoseries?list=${list}`;
  }
  // a SoundCloud page (a person, a track, a set) in SoundCloud's player for other sites
  if (host === "soundcloud.com" && u.pathname.length > 1)
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(`https://soundcloud.com${u.pathname}`)}&visual=true&show_artwork=true`;
  return url;
}

/** A YouTube channel page (/@name, /c/name, /user/name, /channel/UC…): shown as the player of its uploads, whose
 *  address the app has to look up (api.youtubeChannelEmbed). */
export function isYoutubeChannel(url: string): boolean {
  try {
    const u = new URL(url);
    return /(^|\.)youtube\.com$/.test(u.hostname) && /^\/(@[^/]+|c\/[^/]+|user\/[^/]+|channel\/UC[\w-]+)/.test(u.pathname);
  } catch {
    return false;
  }
}

/** The name shown for a link without one: the page's host, or the file's or folder's name. */
export function linkLabel(l: NoteLink): string {
  if (l.label) return l.label;
  if (linkKind(l.target) === "web") return l.target.replace(/^(https?:\/\/)?(www\.)?/i, "").replace(/\/.*$/, "");
  return l.target.replace(/[\\/]+$/, "").split(/[\\/]/).pop() || l.target;
}
