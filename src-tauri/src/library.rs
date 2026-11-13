//! A record's own library (13-11-2026, Whisper: «his books, his lectures mp3, videos mp4, images… desde su ficha»):
//! a folder on the PC linked to the record. The files stay in the folder (35 GB of videos do not go in the
//! database); the database keeps only the link (`meta` key `folder:<id>`, no change of format). The window
//! reads them through `bio://…/lib/<id>/<path>` (with byte ranges, so a video can jump), and a search
//! «only in his library» uses an index of the books, written lectures and subtitles kept in
//! `biodata-biblioteca.db` next to the database (derived: rebuilt when missing, not in the copies).

use rusqlite::{params, Connection, OptionalExtension};
use serde::Serialize;
use std::io::{Read, Seek, SeekFrom};
use std::path::{Path, PathBuf};

type Res<T> = Result<T, String>;

fn e(x: impl std::fmt::Display) -> String {
    x.to_string()
}

fn key(id: i64) -> String {
    format!("folder:{id}")
}

/// The folder linked to a record, if any.
pub fn folder_of(conn: &Connection, id: i64) -> Res<Option<String>> {
    crate::db::get_meta(conn, &key(id)).map_err(e)
}

/// Links a folder to a record (None: unlinks it). The files are not touched.
pub fn set_folder(conn: &Connection, id: i64, folder: Option<&str>) -> Res<()> {
    match folder.map(str::trim).filter(|f| !f.is_empty()) {
        Some(f) => {
            if !Path::new(f).is_dir() {
                return Err(format!("No existe la carpeta: {f}"));
            }
            crate::db::set_meta(conn, &key(id), f).map_err(e)
        }
        None => conn.execute("DELETE FROM meta WHERE key = ?1", [key(id)]).map(|_| ()).map_err(e),
    }
}

/// All the records with a library: (record, folder).
pub fn all_folders(conn: &Connection) -> Res<Vec<(i64, String)>> {
    let mut st = conn.prepare("SELECT key, value FROM meta WHERE key LIKE 'folder:%'").map_err(e)?;
    let rows = st
        .query_map([], |r| Ok((r.get::<_, String>(0)?, r.get::<_, String>(1)?)))
        .map_err(e)?
        .filter_map(|r| r.ok())
        .filter_map(|(k, v)| k.strip_prefix("folder:").and_then(|n| n.parse().ok()).map(|n| (n, v)))
        .collect();
    Ok(rows)
}

/// What a file is, for the page: its section and how it opens.
pub fn kind_of(path: &Path) -> &'static str {
    match crate::extract::ext(path).as_str() {
        // («original_epub»: the EPUB Calibre keeps when it converts a book)
        "pdf" | "epub" | "original_epub" | "doc" | "docx" | "txt" => "book",
        // (.md: written lectures — 1.018 of Nārāyaṇa Mahārāja's «Lectures», 13-11-2026)
        "htm" | "html" | "md" => "page",
        "mp3" | "m4a" | "ogg" | "wav" | "flac" | "aac" | "opus" => "audio",
        "mp4" | "webm" | "m4v" | "mov" | "mkv" => "video",
        "jpg" | "jpeg" | "png" | "webp" | "gif" | "bmp" | "avif" => "image",
        "srt" | "vtt" => "subtitle",
        _ => "other",
    }
}

fn mime(path: &Path) -> &'static str {
    match crate::extract::ext(path).as_str() {
        "pdf" => "application/pdf",
        "htm" | "html" => "text/html",
        "txt" | "md" => "text/plain; charset=utf-8",
        "mp3" => "audio/mpeg",
        "m4a" | "aac" => "audio/mp4",
        "ogg" | "opus" => "audio/ogg",
        "wav" => "audio/wav",
        "flac" => "audio/flac",
        "mp4" | "m4v" => "video/mp4",
        "webm" => "video/webm",
        "mov" => "video/quicktime",
        "mkv" => "video/x-matroska",
        "jpg" | "jpeg" => "image/jpeg",
        "png" => "image/png",
        "webp" => "image/webp",
        "gif" => "image/gif",
        "bmp" => "image/bmp",
        "avif" => "image/avif",
        "svg" => "image/svg+xml",
        "css" => "text/css",
        "js" => "text/javascript",
        "srt" | "vtt" => "text/vtt; charset=utf-8",
        _ => "application/octet-stream",
    }
}

/// Folders that only hold the pieces of a saved web page («X_archivos», «X_files») or a player's cache.
fn helper_dir(name: &str) -> bool {
    let n = name.to_lowercase();
    // (+ the pictures of Markdown notes, «_resources» / «attachments»: shown inside the notes, not as files)
    n.ends_with("_archivos") || n.ends_with("_files") || n == "cache" || n.starts_with('.') || n == "_resources" || n == "attachments" || n == "_attachments"
}

/// A picture a Markdown note embeds («![[photo.jpg]]», Obsidian): next to the note or in a «_resources» / «attachments»
/// folder of its folder or of any folder above it (whatever its case: «beautifulGurudeva…» = «beautifulgurudeva…»).
/// The path inside the library, with «/».
pub fn attachment(folder: &str, note_rel: &str, name: &str) -> Option<String> {
    let root = PathBuf::from(folder);
    let want = name.trim().rsplit(['/', '\\']).next()?.to_lowercase();
    if want.is_empty() || want.contains("..") {
        return None;
    }
    let mut dir = note_rel.rsplit_once('/').map(|(d, _)| d.to_string()).unwrap_or_default();
    loop {
        let here = if dir.is_empty() { root.clone() } else { root.join(dir.replace('/', std::path::MAIN_SEPARATOR_STR)) };
        let mut places = vec![(here.clone(), 1usize)];
        for sub in ["_resources", "attachments", "_attachments"] {
            places.push((here.join(sub), 6));
        }
        for (p, depth) in places {
            if !p.is_dir() {
                continue;
            }
            let hit = walkdir::WalkDir::new(&p)
                .max_depth(depth)
                .into_iter()
                .filter_map(|d| d.ok())
                .find(|d| d.file_type().is_file() && d.file_name().to_string_lossy().to_lowercase() == want);
            if let Some(d) = hit {
                return Some(rel_of(&root, d.path()));
            }
        }
        if dir.is_empty() {
            break;
        }
        dir = dir.rsplit_once('/').map(|(d, _)| d.to_string()).unwrap_or_default();
    }
    // an Obsidian vault copied as it is: the picture may be anywhere in it
    walkdir::WalkDir::new(&root)
        .into_iter()
        .filter_map(|d| d.ok())
        .find(|d| d.file_type().is_file() && d.file_name().to_string_lossy().to_lowercase() == want)
        .map(|d| rel_of(&root, d.path()))
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Entry {
    /// path inside the folder, with «/»
    pub rel: String,
    pub name: String,
    /// the sub-folder it is in («» = the folder itself)
    pub dir: String,
    pub kind: &'static str,
    pub size: u64,
    /// a video's subtitles (same name, .srt / .vtt)
    pub subs: Option<String>,
    /// a book's cover: the «cover.jpg» of its own folder (folders copied from a Calibre library)
    pub cover: Option<String>,
    /// a book's title from its folder (Calibre: «Beyond Liberation - 4th (2224)» → «Beyond Liberation - 4th»), or from
    /// the «metadata.opf» next to it
    pub title: Option<String>,
}

/// «Beyond Liberation - 4th (2224)» → «Beyond Liberation - 4th» (Calibre puts its book number at the end).
fn calibre_title(dir_name: &str) -> String {
    let s = dir_name.trim();
    match s.rfind(" (") {
        Some(i) if s.ends_with(')') && s[i + 2..s.len() - 1].chars().all(|c| c.is_ascii_digit()) && i > 0 => s[..i].trim().to_string(),
        _ => s.to_string(),
    }
}

/// The title in a Calibre «metadata.opf» (<dc:title>…</dc:title>).
fn opf_title(path: &Path) -> Option<String> {
    let t = std::fs::read_to_string(path).ok()?;
    let a = t.find("<dc:title")?;
    let a = a + t[a..].find('>')? + 1;
    let b = a + t[a..].find("</dc:title>")?;
    let s = t[a..b].replace("&amp;", "&").replace("&apos;", "'").replace("&quot;", "\"").replace("&lt;", "<").replace("&gt;", ">");
    let s = s.trim();
    (!s.is_empty()).then(|| s.to_string())
}

fn rel_of(root: &Path, p: &Path) -> String {
    p.strip_prefix(root).unwrap_or(p).components().map(|c| c.as_os_str().to_string_lossy()).collect::<Vec<_>>().join("/")
}

/// The files of a library, sub-folders included (not the pieces of saved web pages).
pub fn scan(folder: &str) -> Res<Vec<Entry>> {
    let root = PathBuf::from(folder);
    if !root.is_dir() {
        return Err(format!("No se encuentra la carpeta: {folder}"));
    }
    let mut out: Vec<Entry> = Vec::new();
    let walker = walkdir::WalkDir::new(&root).follow_links(true).into_iter().filter_entry(|d| {
        d.depth() == 0 || !d.file_type().is_dir() || !helper_dir(&d.file_name().to_string_lossy())
    });
    for d in walker.filter_map(|d| d.ok()).filter(|d| d.file_type().is_file()) {
        let p = d.path();
        let name = d.file_name().to_string_lossy().to_string();
        if name.starts_with('.') || name.starts_with("~$") || name.eq_ignore_ascii_case("desktop.ini") || name.eq_ignore_ascii_case("thumbs.db") {
            continue;
        }
        let ext = crate::extract::ext(p);
        // (.opf: a Calibre book's data, read below for its title)
        if ["nojpg", "js", "css", "ini", "db", "lnk", "opf"].contains(&ext.as_str()) {
            continue;
        }
        let rel = rel_of(&root, p);
        let dir = rel.rsplit_once('/').map(|(d, _)| d.to_string()).unwrap_or_default();
        out.push(Entry { rel, name, dir, kind: kind_of(p), size: d.metadata().map(|m| m.len()).unwrap_or(0), subs: None, cover: None, title: None });
    }
    // A folder with a «cover.jpg» and its book (copied from Calibre: «Title (1234)/cover.jpg + Title - Author.pdf»):
    // the picture is the book's cover, not one more image, and the book is listed with the folder around it, so that
    // 170 books are one list and not 170 sub-folders of one book each.
    let book_dirs: std::collections::HashSet<String> = out
        .iter()
        .filter(|x| x.name.eq_ignore_ascii_case("cover.jpg") && !x.dir.is_empty())
        .map(|x| x.dir.clone())
        .filter(|d| out.iter().any(|x| x.kind == "book" && &x.dir == d))
        .collect();
    if !book_dirs.is_empty() {
        out.retain(|x| !(x.name.eq_ignore_ascii_case("cover.jpg") && book_dirs.contains(&x.dir)));
        for x in out.iter_mut().filter(|x| book_dirs.contains(&x.dir)) {
            let own = x.dir.rsplit('/').next().unwrap_or(&x.dir).to_string();
            if x.kind == "book" {
                x.cover = Some(format!("{}/cover.jpg", x.dir));
                let opf = root.join(x.dir.replace('/', std::path::MAIN_SEPARATOR_STR)).join("metadata.opf");
                x.title = opf_title(&opf).or_else(|| Some(calibre_title(&own)));
            }
            x.dir = x.dir.rsplit_once('/').map(|(d, _)| d.to_string()).unwrap_or_default();
        }
    }
    // subtitles go with their video
    let subs: Vec<(String, String)> = out
        .iter()
        .filter(|x| x.kind == "subtitle")
        .map(|x| (x.rel.rsplit_once('.').map(|(s, _)| s.to_lowercase()).unwrap_or_default(), x.rel.clone()))
        .collect();
    for v in out.iter_mut().filter(|x| x.kind == "video") {
        let stem = v.rel.rsplit_once('.').map(|(s, _)| s.to_lowercase()).unwrap_or_default();
        v.subs = subs.iter().find(|(s, _)| *s == stem || s.starts_with(&format!("{stem} ("))).map(|(_, r)| r.clone());
    }
    out.sort_by(|a, b| a.dir.to_lowercase().cmp(&b.dir.to_lowercase()).then(a.name.to_lowercase().cmp(&b.name.to_lowercase())));
    Ok(out)
}

/// The file of a library a `lib/<id>/<path>` address asks for, only if it is inside that folder.
pub fn resolve(folder: &str, rel: &str) -> Option<PathBuf> {
    let root = std::fs::canonicalize(folder).ok()?;
    let p = std::fs::canonicalize(root.join(rel.replace('/', std::path::MAIN_SEPARATOR_STR))).ok()?;
    (p.starts_with(&root) && p.is_file()).then_some(p)
}

/// «%20» etc. back to the letters (UTF-8).
pub fn percent_decode(s: &str) -> String {
    let b = s.as_bytes();
    let mut out = Vec::with_capacity(b.len());
    let mut i = 0;
    while i < b.len() {
        if b[i] == b'%' && i + 2 < b.len() {
            if let Some(v) = std::str::from_utf8(&b[i + 1..i + 3]).ok().and_then(|h| u8::from_str_radix(h, 16).ok()) {
                out.push(v);
                i += 3;
                continue;
            }
        }
        out.push(b[i]);
        i += 1;
    }
    String::from_utf8_lossy(&out).into_owned()
}

/// .srt subtitles as WebVTT (what the window's <track> reads).
fn srt_to_vtt(text: &str) -> String {
    let mut out = String::from("WEBVTT\n\n");
    for line in text.replace('\r', "").lines() {
        if line.contains("-->") {
            out.push_str(&line.replace(',', "."));
        } else {
            out.push_str(line);
        }
        out.push('\n');
    }
    out
}

/// A piece of a file at most this long per answer: a video plays while it comes.
const CHUNK: u64 = 4 * 1024 * 1024;

/// The answer for a library file: whole (small files, pages, subtitles) or the piece the «Range» asks for.
pub fn respond(path: &Path, range: Option<&str>) -> tauri::http::Response<Vec<u8>> {
    let fail = |code: u16| tauri::http::Response::builder().status(code).body(Vec::new()).unwrap();
    let ext = crate::extract::ext(path);
    if ext == "srt" {
        let Ok(bytes) = std::fs::read(path) else { return fail(404) };
        return tauri::http::Response::builder()
            .header("Access-Control-Allow-Origin", "*")
            .header("Content-Type", "text/vtt; charset=utf-8")
            .body(srt_to_vtt(&crate::text::decode(&bytes)).into_bytes())
            .unwrap();
    }
    let Ok(mut f) = std::fs::File::open(path) else { return fail(404) };
    let len = f.metadata().map(|m| m.len()).unwrap_or(0);
    let mime = mime(path);
    let wanted = range.and_then(|r| r.trim().strip_prefix("bytes=")).and_then(|r| {
        let (a, b) = r.split_once('-')?;
        let (a, b) = (a.trim(), b.trim());
        if a.is_empty() {
            // the last N bytes
            let n: u64 = b.parse().ok()?;
            Some((len.saturating_sub(n), len.saturating_sub(1)))
        } else {
            let a: u64 = a.parse().ok()?;
            let b: u64 = if b.is_empty() { len.saturating_sub(1) } else { b.parse().ok()? };
            Some((a, b.min(len.saturating_sub(1))))
        }
    });
    let media = matches!(kind_of(path), "audio" | "video");
    let (start, end) = match wanted {
        Some((a, b)) if a < len && a <= b => (a, b.min(a + CHUNK - 1)),
        Some(_) => {
            return tauri::http::Response::builder()
                .status(416)
                .header("Content-Range", format!("bytes */{len}"))
                .body(Vec::new())
                .unwrap()
        }
        // no range: a big media file starts as a piece too (the player asks for the rest)
        None if media && len > CHUNK => (0, CHUNK - 1),
        None => {
            let mut data = Vec::with_capacity(len as usize);
            if f.read_to_end(&mut data).is_err() {
                return fail(500);
            }
            return tauri::http::Response::builder()
                .header("Access-Control-Allow-Origin", "*")
            .header("Content-Type", mime)
                .header("Accept-Ranges", "bytes")
                .header("Cache-Control", "no-store")
                .body(data)
                .unwrap();
        }
    };
    let mut data = vec![0u8; (end - start + 1) as usize];
    if f.seek(SeekFrom::Start(start)).is_err() || f.read_exact(&mut data).is_err() {
        return fail(500);
    }
    tauri::http::Response::builder()
        .status(206)
        .header("Access-Control-Allow-Origin", "*")
            .header("Content-Type", mime)
        .header("Accept-Ranges", "bytes")
        .header("Content-Range", format!("bytes {start}-{end}/{len}"))
        .header("Cache-Control", "no-store")
        .body(data)
        .unwrap()
}

// ---------------------------------------------------------------- search only in one library

/// The index of the libraries' texts, next to the database (derived: it can always be made again).
pub fn index_path(db_path: &Path) -> PathBuf {
    db_path.with_file_name("biodata-biblioteca.db")
}

fn open_index(db_path: &Path) -> Res<Connection> {
    let c = Connection::open(index_path(db_path)).map_err(e)?;
    c.execute_batch(
        "PRAGMA journal_mode = WAL;
         CREATE TABLE IF NOT EXISTS files(folder TEXT NOT NULL, rel TEXT NOT NULL, size INTEGER, mtime INTEGER,
           PRIMARY KEY(folder, rel));
         CREATE VIRTUAL TABLE IF NOT EXISTS pieces USING fts5(folder UNINDEXED, rel UNINDEXED, at UNINDEXED, text,
           tokenize = 'unicode61 remove_diacritics 2');",
    )
    .map_err(e)?;
    Ok(c)
}

fn mtime(p: &Path) -> i64 {
    std::fs::metadata(p).and_then(|m| m.modified()).ok().and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok()).map_or(0, |d| d.as_secs() as i64)
}

/// The searchable pieces of a file: (where — page number or second —, text).
fn pieces_of(path: &Path) -> Vec<(i64, String)> {
    let ext = crate::extract::ext(path);
    match ext.as_str() {
        "pdf" => {
            let Ok(bytes) = std::fs::read(path) else { return vec![] };
            if bytes.len() > 120 * 1024 * 1024 {
                return vec![];
            }
            let pages = std::panic::catch_unwind(|| pdf_extract::extract_text_from_mem_by_pages(&bytes));
            let Ok(Ok(pages)) = pages else { return vec![] };
            pages
                .into_iter()
                .enumerate()
                .map(|(i, t)| {
                    let t = t.split_whitespace().collect::<Vec<_>>().join(" ");
                    let t = if t.chars().filter(|c| "äåëöòùÄÅËÖÒ".contains(*c)).count() >= 5 { crate::extract::balaram_to_iast(&t) } else { t };
                    (i as i64 + 1, t)
                })
                .filter(|(_, t)| !t.is_empty())
                .collect()
        }
        "htm" | "html" | "txt" | "md" | "docx" | "doc" => {
            let Ok(bytes) = std::fs::read(path) else { return vec![] };
            let text = crate::extract::read_document(path, &bytes).unwrap_or_default();
            // in pieces of some paragraphs, so a hit shows where it is
            let mut out = Vec::new();
            let mut cur = String::new();
            for para in text.split("\n\n") {
                cur.push_str(para.trim());
                cur.push('\n');
                if cur.len() > 2500 {
                    out.push((out.len() as i64 + 1, std::mem::take(&mut cur)));
                }
            }
            if !cur.trim().is_empty() {
                out.push((out.len() as i64 + 1, cur));
            }
            out
        }
        "srt" | "vtt" => {
            // a piece every minute or so, starting at its first subtitle's second
            let Ok(bytes) = std::fs::read(path) else { return vec![] };
            let text = crate::text::decode(&bytes).replace('\r', "");
            let mut out: Vec<(i64, String)> = Vec::new();
            let mut at = 0i64;
            let mut cur = String::new();
            for block in text.split("\n\n") {
                let mut lines = block.lines().filter(|l| !l.trim().is_empty());
                let mut time = None;
                let mut words = Vec::new();
                for l in lines.by_ref() {
                    if l.contains("-->") {
                        let t = l.split("-->").next().unwrap_or("").trim().replace(',', ".");
                        let parts: Vec<f64> = t.split(':').filter_map(|x| x.parse().ok()).collect();
                        time = Some(parts.iter().fold(0.0, |acc, x| acc * 60.0 + x) as i64);
                    } else if time.is_some() {
                        words.push(l.trim().to_string());
                    }
                }
                let Some(t) = time else { continue };
                if cur.is_empty() {
                    at = t;
                }
                cur.push_str(&words.join(" "));
                cur.push(' ');
                if t - at >= 60 {
                    out.push((at, std::mem::take(&mut cur)));
                }
            }
            if !cur.trim().is_empty() {
                out.push((at, cur));
            }
            out
        }
        _ => vec![],
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IndexState {
    pub files: usize,
    pub changed: usize,
}

/// Brings the index of a library up to date (only the files new or changed since the last time).
pub fn update_index(db_path: &Path, folder: &str) -> Res<IndexState> {
    let entries = scan(folder)?;
    let mut c = open_index(db_path)?;
    let known: std::collections::HashMap<String, (i64, i64)> = {
        let mut st = c.prepare("SELECT rel, size, mtime FROM files WHERE folder = ?1").map_err(e)?;
        let rows = st.query_map([folder], |r| Ok((r.get::<_, String>(0)?, (r.get(1)?, r.get(2)?)))).map_err(e)?;
        rows.filter_map(|r| r.ok()).collect()
    };
    let root = PathBuf::from(folder);
    let wanted: Vec<&Entry> = entries.iter().filter(|x| matches!(x.kind, "book" | "page" | "subtitle")).collect();
    let mut changed = 0;
    for x in &wanted {
        let p = root.join(&x.rel);
        let m = mtime(&p);
        if known.get(&x.rel) == Some(&(x.size as i64, m)) {
            continue;
        }
        let pieces = pieces_of(&p);
        let tx = c.transaction().map_err(e)?;
        tx.execute("DELETE FROM pieces WHERE folder = ?1 AND rel = ?2", params![folder, x.rel]).map_err(e)?;
        for (at, text) in pieces {
            tx.execute("INSERT INTO pieces(folder, rel, at, text) VALUES (?1, ?2, ?3, ?4)", params![folder, x.rel, at, text]).map_err(e)?;
        }
        tx.execute("INSERT OR REPLACE INTO files(folder, rel, size, mtime) VALUES (?1, ?2, ?3, ?4)", params![folder, x.rel, x.size as i64, m])
            .map_err(e)?;
        tx.commit().map_err(e)?;
        changed += 1;
    }
    // files that are gone
    let present: std::collections::HashSet<&str> = wanted.iter().map(|x| x.rel.as_str()).collect();
    for rel in known.keys().filter(|r| !present.contains(r.as_str())) {
        c.execute("DELETE FROM pieces WHERE folder = ?1 AND rel = ?2", params![folder, rel]).map_err(e)?;
        c.execute("DELETE FROM files WHERE folder = ?1 AND rel = ?2", params![folder, rel]).map_err(e)?;
    }
    Ok(IndexState { files: wanted.len(), changed })
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Hit {
    pub rel: String,
    /// page of a book, piece of a page, second of a video's subtitles
    pub at: i64,
    pub snippet: String,
}

/// The words looked for, as an FTS query: each word as typed (quoted), all of them.
fn fts_query(q: &str) -> String {
    q.split_whitespace().map(|w| format!("\"{}\"", w.replace('"', ""))).collect::<Vec<_>>().join(" ")
}

/// Search only in one library's texts.
pub fn search(db_path: &Path, folder: &str, q: &str, limit: usize) -> Res<Vec<Hit>> {
    if q.trim().is_empty() {
        return Ok(vec![]);
    }
    let c = open_index(db_path)?;
    let mut st = c
        .prepare(
            "SELECT rel, at, snippet(pieces, 3, '«', '»', ' … ', 24) FROM pieces
             WHERE pieces MATCH ?2 AND folder = ?1 ORDER BY rank LIMIT ?3",
        )
        .map_err(e)?;
    let rows = st
        .query_map(params![folder, fts_query(q), limit as i64], |r| Ok(Hit { rel: r.get(0)?, at: r.get(1)?, snippet: r.get(2)? }))
        .map_err(e)?;
    rows.collect::<Result<_, _>>().map_err(e)
}

/// How many files of a library are in the index (0: never indexed).
pub fn indexed(db_path: &Path, folder: &str) -> usize {
    open_index(db_path)
        .ok()
        .and_then(|c| c.query_row("SELECT count(*) FROM files WHERE folder = ?1", [folder], |r| r.get::<_, i64>(0)).optional().ok().flatten())
        .unwrap_or(0) as usize
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn note_pictures() {
        let dir = std::env::temp_dir().join(format!("lib-notes-{}", std::process::id()));
        let pic = dir.join("Lectures").join("_resources").join("Pic");
        std::fs::create_dir_all(&pic).unwrap();
        std::fs::create_dir_all(dir.join("Lectures").join("2001")).unwrap();
        std::fs::write(dir.join("Lectures").join("2001").join("Jul-19 Ritvik.md"), "![[beautifulGurudevacfbc.jpg]]").unwrap();
        std::fs::write(pic.join("beautifulgurudevacfbc.jpg"), "x").unwrap();
        let f = dir.to_string_lossy().to_string();
        assert_eq!(
            attachment(&f, "Lectures/2001/Jul-19 Ritvik.md", "beautifulGurudevacfbc.jpg").as_deref(),
            Some("Lectures/_resources/Pic/beautifulgurudevacfbc.jpg")
        );
        assert_eq!(attachment(&f, "Lectures/2001/Jul-19 Ritvik.md", "nothere.jpg"), None);
        // the pictures are not files of the library
        let list = scan(&f).unwrap();
        assert!(list.iter().all(|x| !x.rel.contains("_resources")));
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn calibre_folders() {
        let dir = std::env::temp_dir().join(format!("lib-calibre-{}", std::process::id()));
        let a = dir.join("Books").join("Beyond Liberation - 4th (2224)");
        let b = dir.join("Books").join("True Conception (2199)");
        std::fs::create_dir_all(&a).unwrap();
        std::fs::create_dir_all(&b).unwrap();
        std::fs::write(a.join("Beyond Liberation - 4th - Sri Srimad.pdf"), "x").unwrap();
        std::fs::write(a.join("cover.jpg"), "x").unwrap();
        std::fs::write(b.join("True Conception - Sri.pdf"), "x").unwrap();
        std::fs::write(b.join("cover.jpg"), "x").unwrap();
        std::fs::write(b.join("metadata.opf"), "<package><metadata><dc:title>True Conception Of Sri Guru Tattva</dc:title></metadata></package>").unwrap();
        std::fs::write(dir.join("photo.jpg"), "x").unwrap();
        let list = scan(&dir.to_string_lossy()).unwrap();
        let books: Vec<_> = list.iter().filter(|x| x.kind == "book").collect();
        assert_eq!(books.len(), 2);
        assert!(books.iter().all(|x| x.dir == "Books"));
        assert_eq!(books[0].title.as_deref(), Some("Beyond Liberation - 4th"));
        assert_eq!(books[0].cover.as_deref(), Some("Books/Beyond Liberation - 4th (2224)/cover.jpg"));
        assert_eq!(books[1].title.as_deref(), Some("True Conception Of Sri Guru Tattva"));
        // the covers are not images of the library; a picture of its own is
        let imgs: Vec<_> = list.iter().filter(|x| x.kind == "image").map(|x| x.rel.as_str()).collect();
        assert_eq!(imgs, vec!["photo.jpg"]);
        assert!(list.iter().all(|x| !x.name.ends_with(".opf")));
        assert_eq!(calibre_title("Arcana-Dipika_  - 1st ed (2256)"), "Arcana-Dipika_  - 1st ed");
        assert_eq!(calibre_title("Seminar (Puri)"), "Seminar (Puri)");
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn ranges_and_folders() {
        let dir = std::env::temp_dir().join(format!("lib-test-{}", std::process::id()));
        let sub = dir.join("Lectures").join("X_archivos");
        std::fs::create_dir_all(&sub).unwrap();
        std::fs::write(dir.join("Lectures").join("X.htm"), "<html><body><p>Sadhu sanga is everything</p></body></html>").unwrap();
        std::fs::write(sub.join("a.js"), "x").unwrap();
        std::fs::write(dir.join("talk.mp4"), vec![7u8; 1000]).unwrap();
        std::fs::write(dir.join("talk.srt"), "1\n00:00:01,000 --> 00:00:03,000\nHello Kṛṣṇa\n").unwrap();
        let f = dir.to_string_lossy().to_string();
        let list = scan(&f).unwrap();
        assert_eq!(list.iter().filter(|x| x.kind == "page").count(), 1);
        assert!(list.iter().all(|x| !x.rel.contains("_archivos")));
        let v = list.iter().find(|x| x.kind == "video").unwrap();
        assert_eq!(v.subs.as_deref(), Some("talk.srt"));
        // a piece of the video
        let p = resolve(&f, "talk.mp4").unwrap();
        let r = respond(&p, Some("bytes=10-19"));
        assert_eq!(r.status(), 206);
        assert_eq!(r.body().len(), 10);
        assert_eq!(r.headers()["Content-Range"], "bytes 10-19/1000");
        // never outside the folder
        assert!(resolve(&f, "../../Windows/win.ini").is_none());
        // subtitles as WebVTT
        let s = respond(&resolve(&f, "talk.srt").unwrap(), None);
        assert!(String::from_utf8_lossy(s.body()).starts_with("WEBVTT"));
        // search only here, diacritics or not
        let db = dir.join("biodata.db");
        let st = update_index(&db, &f).unwrap();
        assert_eq!((st.files, st.changed), (2, 2));
        assert_eq!(update_index(&db, &f).unwrap().changed, 0);
        assert_eq!(search(&db, &f, "sadhu", 10).unwrap().len(), 1);
        let h = search(&db, &f, "krsna", 10).unwrap();
        assert_eq!((h.len(), h[0].at), (1, 1));
        assert_eq!(percent_decode("Srila%20Gour%20%C5%9Ar%C4%AB"), "Srila Gour Śrī");
        let _ = std::fs::remove_dir_all(dir);
    }
}
