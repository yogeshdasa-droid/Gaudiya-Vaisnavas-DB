//! Write-side operations on the database: documents, their text, persons
//! (biographical records), the recycle bin and the search tables.

use crate::fold::fold_text;
use crate::text::{self, Section};
use rusqlite::{params, Connection, OptionalExtension};
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

type Res<T> = Result<T, String>;

fn e(x: impl std::fmt::Display) -> String {
    x.to_string()
}

// ---------------------------------------------------------------- person keys

/// Honorifics that come and go in front of a name.
const HONORIFICS: &[&str] = &["sri", "srila", "srimati", "srimad", "sripad", "sripada", "om", "visnupada", "jagad", "guru"];

/// Matching key of a name: folded, without leading honorifics, and with the
/// final "a" dropped from each word (Thakur = Thakura, das = dasa).
pub fn person_key(name: &str) -> String {
    let folded = fold_text(name);
    let mut words: Vec<&str> = folded.split(' ').filter(|w| !w.is_empty()).collect();
    // folded like the name ("srimad" → "srmad")
    while words.len() > 1 && HONORIFICS.iter().any(|h| *h == words[0] || crate::fold::fold_word(h) == words[0]) {
        words.remove(0);
    }
    words
        .iter()
        .map(|w| if w.len() > 3 { w.strip_suffix('a').unwrap_or(w) } else { w })
        .collect::<Vec<_>>()
        .join(" ")
}

// ---------------------------------------------------------------- search tables

fn doc_fts_text(tx: &Connection, id: i64) -> rusqlite::Result<Option<String>> {
    tx.query_row(
        "SELECT d.title, d.dir, COALESCE(p.name, ''), COALESCE(p.aka, '')
         FROM docs d LEFT JOIN persons p ON p.id = d.person_id WHERE d.id = ?1 AND d.deleted IS NULL",
        [id],
        |r| {
            let (t, dir, p, aka): (String, String, String, String) = (r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?);
            Ok(fold_text(&format!("{t} {} {p} {aka}", dir.replace('/', " "))))
        },
    )
    .optional()
}

/// Re-writes the title entry of a document (title, folder and person names).
pub fn fts_doc(tx: &Connection, id: i64) -> rusqlite::Result<()> {
    tx.execute("DELETE FROM docs_fts WHERE rowid = ?1", [id])?;
    if let Some(s) = doc_fts_text(tx, id)? {
        tx.prepare_cached("INSERT INTO docs_fts(rowid, title) VALUES(?1, ?2)")?.execute(params![id, s])?;
    }
    Ok(())
}

fn section_fold(title_fold: &str, ordinal: i64, heading: Option<&str>, text: &str) -> (String, String) {
    let mut h = heading.map(fold_text).unwrap_or_default();
    if ordinal == 0 {
        h = format!("{title_fold} {h}");
    }
    (h, fold_text(text))
}

fn fts_sections_remove(tx: &Connection, doc_id: i64) -> rusqlite::Result<()> {
    let ids: Vec<i64> = tx
        .prepare_cached("SELECT id FROM sections WHERE doc_id = ?1")?
        .query_map([doc_id], |r| r.get(0))?
        .collect::<Result<_, _>>()?;
    let mut del = tx.prepare_cached("DELETE FROM sections_fts WHERE rowid = ?1")?;
    for id in ids {
        del.execute([id])?;
    }
    Ok(())
}

fn fts_sections_add(tx: &Connection, doc_id: i64) -> rusqlite::Result<()> {
    let title: String = tx.query_row("SELECT title FROM docs WHERE id = ?1", [doc_id], |r| r.get(0))?;
    let title_fold = fold_text(&title);
    let rows: Vec<(i64, i64, Option<String>, String)> = tx
        .prepare_cached("SELECT id, ordinal, heading, text FROM sections WHERE doc_id = ?1")?
        .query_map([doc_id], |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?)))?
        .collect::<Result<_, _>>()?;
    let mut ins = tx.prepare_cached("INSERT INTO sections_fts(rowid, heading, body) VALUES(?1, ?2, ?3)")?;
    for (id, ord, heading, body) in rows {
        let (h, b) = section_fold(&title_fold, ord, heading.as_deref(), &body);
        ins.execute(params![id, h, b])?;
    }
    Ok(())
}

pub fn fts_person(tx: &Connection, id: i64) -> rusqlite::Result<()> {
    tx.execute("DELETE FROM persons_fts WHERE rowid = ?1", [id])?;
    let row: Option<(String, String)> = tx
        .query_row(
            "SELECT name || ' ' || aka, appearance || ' ' || disappearance || ' ' || place || ' ' || guru || ' ' ||
                    disciples || ' ' || works || ' ' || notes || ' ' ||
                    COALESCE((SELECT group_concat(tag, ' ') FROM person_tags WHERE person_id = ?1), '')
             FROM persons WHERE id = ?1",
            [id],
            |r| Ok((r.get(0)?, r.get(1)?)),
        )
        .optional()?;
    if let Some((name, fields)) = row {
        tx.prepare_cached("INSERT INTO persons_fts(rowid, name, fields) VALUES(?1, ?2, ?3)")?
            .execute(params![id, fold_text(&name), fold_text(&fields)])?;
    }
    Ok(())
}

/// Fills the search tables again from the stored data.
pub fn rebuild_fts(conn: &mut Connection, progress: impl Fn(usize, usize)) -> Res<()> {
    let tx = conn.transaction().map_err(e)?;
    tx.execute_batch(
        "INSERT INTO sections_fts(sections_fts) VALUES('delete-all');
         INSERT INTO docs_fts(docs_fts) VALUES('delete-all');
         INSERT INTO persons_fts(persons_fts) VALUES('delete-all');",
    )
    .map_err(e)?;
    let ids: Vec<i64> = tx
        .prepare("SELECT id FROM docs WHERE deleted IS NULL")
        .map_err(e)?
        .query_map([], |r| r.get(0))
        .map_err(e)?
        .collect::<Result<_, _>>()
        .map_err(e)?;
    let total = ids.len();
    for (i, id) in ids.iter().enumerate() {
        fts_doc(&tx, *id).map_err(e)?;
        fts_sections_add(&tx, *id).map_err(e)?;
        if i % 200 == 0 {
            progress(i, total);
        }
    }
    let pids: Vec<i64> = tx
        .prepare("SELECT id FROM persons")
        .map_err(e)?
        .query_map([], |r| r.get(0))
        .map_err(e)?
        .collect::<Result<_, _>>()
        .map_err(e)?;
    for id in pids {
        fts_person(&tx, id).map_err(e)?;
    }
    crate::db::set_meta(&tx, "fts", crate::db::FTS_VERSION).map_err(e)?;
    tx.commit().map_err(e)?;
    let _ = conn.execute_batch(
        "INSERT INTO sections_fts(sections_fts) VALUES('optimize');
         INSERT INTO docs_fts(docs_fts) VALUES('optimize');",
    );
    progress(total, total);
    Ok(())
}

// ---------------------------------------------------------------- documents

pub struct NewDoc {
    pub person_id: Option<i64>,
    pub collection: String,
    pub dir: String,
    pub title: String,
    pub date: Option<String>,
    pub tags: String,
    pub kind: String,
    pub source: String,
    pub hash: String,
    pub sections: Vec<Section>,
    /// (role, name, mime, bytes)
    pub files: Vec<(String, String, String, Vec<u8>)>,
}

fn write_sections(tx: &Connection, doc_id: i64, sections: &[Section]) -> rusqlite::Result<()> {
    fts_sections_remove(tx, doc_id)?;
    tx.execute("DELETE FROM sections WHERE doc_id = ?1", [doc_id])?;
    let mut ins = tx.prepare_cached("INSERT INTO sections(doc_id, ordinal, heading, text) VALUES(?1, ?2, ?3, ?4)")?;
    let mut size = 0;
    for (i, s) in sections.iter().enumerate() {
        ins.execute(params![doc_id, i as i64, s.heading, s.text])?;
        size += s.text.len();
    }
    tx.execute(
        "UPDATE docs SET sections = ?1, size = ?2 WHERE id = ?3",
        params![sections.len() as i64, size as i64, doc_id],
    )?;
    fts_sections_add(tx, doc_id)
}

pub fn insert_doc(tx: &Connection, d: &NewDoc) -> rusqlite::Result<i64> {
    tx.prepare_cached(
        "INSERT INTO docs(person_id, collection, dir, title, stem, date, tags, kind, source, hash)
         VALUES(?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
    )?
    .execute(params![
        d.person_id, d.collection, d.dir, d.title, d.title.to_lowercase(), d.date, d.tags, d.kind, d.source, d.hash
    ])?;
    let id = tx.last_insert_rowid();
    let mut ins = tx.prepare_cached("INSERT INTO files(doc_id, role, name, mime, data) VALUES(?1, ?2, ?3, ?4, ?5)")?;
    for (role, name, mime, data) in &d.files {
        ins.execute(params![id, role, name, mime, data])?;
    }
    write_sections(tx, id, &d.sections)?;
    fts_doc(tx, id)?;
    Ok(id)
}

/// A new, empty document (optionally the biography of `person_id`).
pub fn create_doc(conn: &mut Connection, person_id: Option<i64>, title: &str, collection: &str) -> Res<i64> {
    let title = title.trim();
    if title.is_empty() {
        return Err("El título no puede estar vacío".into());
    }
    let collection = collection.trim();
    let collection = if collection.is_empty() { "Mis textos" } else { collection };
    let tx = conn.transaction().map_err(e)?;
    let id = insert_doc(
        &tx,
        &NewDoc {
            person_id,
            collection: collection.into(),
            dir: collection.into(),
            title: title.into(),
            date: None,
            tags: String::new(),
            kind: "new".into(),
            source: String::new(),
            hash: String::new(),
            sections: vec![Section { heading: None, text: String::new() }],
            files: vec![],
        },
    )
    .map_err(e)?;
    tx.commit().map_err(e)?;
    Ok(id)
}

/// Replaces the text of one section. Large new text is split again so the
/// reader and the results keep pointing at small pieces.
pub fn save_section(conn: &mut Connection, doc_id: i64, ordinal: i64, new_text: &str) -> Res<()> {
    let new_t = new_text.replace("\r\n", "\n");
    let tx = conn.transaction().map_err(e)?;
    keep_doc_version(&tx, doc_id, false).map_err(e)?;
    let mut all: Vec<Section> = tx
        .prepare("SELECT heading, text FROM sections WHERE doc_id = ?1 ORDER BY ordinal")
        .map_err(e)?
        .query_map([doc_id], |r| Ok(Section { heading: r.get(0)?, text: r.get(1)? }))
        .map_err(e)?
        .collect::<Result<_, _>>()
        .map_err(e)?;
    let i = ordinal as usize;
    if i >= all.len() {
        return Err("Sección no encontrada".into());
    }
    if all.len() == 1 {
        all = text::split_sections(&new_t);
    } else if new_t.trim().is_empty() {
        // a part left empty (an entry deleted from it) goes away
        all.remove(i);
    } else {
        let mut pieces = text::split_sections(&new_t);
        if pieces.len() == 1 {
            // keep the heading the contents list shows for this section
            pieces[0].heading = all[i].heading.take();
        }
        all.splice(i..=i, pieces);
    }
    write_sections(&tx, doc_id, &all).map_err(e)?;
    tx.execute("UPDATE docs SET modified = datetime('now', 'localtime') WHERE id = ?1", [doc_id]).map_err(e)?;
    tx.commit().map_err(e)
}

/// Where `fragment` (text selected on screen, so without the Markdown marks)
/// is in `full`: from the start of the line of its first word to the end of
/// the line of its last one. Long pieces are found by their first and last
/// words, so that a link or a mark inside does not matter.
fn find_fragment(full: &str, fragment: &str) -> Option<(usize, usize)> {
    let words = |s: &str| -> Vec<(usize, usize, String)> {
        let mut out = Vec::new();
        let mut start = None;
        for (i, c) in s.char_indices().chain(std::iter::once((s.len(), ' '))) {
            match (c.is_alphanumeric(), start) {
                (true, None) => start = Some(i),
                (false, Some(st)) => {
                    out.push((st, i, fold_text(&s[st..i])));
                    start = None;
                }
                _ => {}
            }
        }
        out
    };
    let src = words(full);
    let sel: Vec<String> = words(fragment).into_iter().map(|w| w.2).collect();
    if sel.is_empty() {
        return None;
    }
    let same = |i: usize, part: &[String]| i + part.len() <= src.len() && src[i..i + part.len()].iter().map(|w| &w.2).eq(part.iter());
    // the whole piece, word by word: entries that begin alike ("GOVINDA He was a disciple
    // of…") are not mistaken for one another
    let (first, last) = if let Some(i) = (0..src.len()).find(|&i| same(i, &sel)) {
        (i, i + sel.len() - 1)
    } else {
        // not word for word (a link or a mark inside): by its first and last words, the
        // stretch whose length is closest to the piece's
        let (kh, kt) = (sel.len().min(6), sel.len().min(3));
        let (head, tail) = (&sel[..kh], &sel[sel.len() - kt..]);
        let mut best: Option<(usize, usize, usize)> = None;
        for i in (0..src.len()).filter(|&i| same(i, head)) {
            let from = i + (sel.len() / 2).max(kh).saturating_sub(kt);
            let Some(j) = (from..src.len()).find(|&j| same(j, tail)) else { continue };
            let off = (j + kt - i).abs_diff(sel.len());
            if best.map_or(true, |b| off < b.2) {
                best = Some((i, j + kt - 1, off));
            }
        }
        let (i, j, _) = best?;
        (i, j)
    };
    let start = full[..src[first].0].rfind('\n').map_or(0, |i| i + 1);
    let end = full[src[last].1..].find('\n').map_or(full.len(), |i| src[last].1 + i + 1);
    Some((start, end))
}

/// Takes a piece out of a text and makes it a text of its own for the record
/// `to_person` (a text that tells of several people of the same name). The
/// text keeps its earlier version. Returns the id of the new text.
pub fn move_text(conn: &mut Connection, doc_id: i64, fragment: &str, to_person: i64, title: &str) -> Res<i64> {
    let tx = conn.transaction().map_err(e)?;
    let (collection, dir): (String, String) =
        tx.query_row("SELECT collection, dir FROM docs WHERE id = ?1", [doc_id], |r| Ok((r.get(0)?, r.get(1)?))).map_err(e)?;
    let piece = take_fragment(&tx, doc_id, fragment)?;
    let title = title.trim();
    let id = insert_doc(
        &tx,
        &NewDoc {
            person_id: Some(to_person),
            collection,
            dir,
            title: if title.is_empty() { "Texto".into() } else { title.into() },
            date: None,
            tags: String::new(),
            kind: "new".into(),
            source: String::new(),
            hash: String::new(),
            sections: text::split_sections(&piece),
            files: vec![],
        },
    )
    .map_err(e)?;
    tx.commit().map_err(e)?;
    Ok(id)
}

/// Takes a piece out of a text (its whole lines; the text keeps its earlier
/// version) and gives it back as written: «Crear ficha con este texto», where
/// the piece goes to the notes of a new record.
pub fn cut_text(conn: &mut Connection, doc_id: i64, fragment: &str) -> Res<String> {
    let tx = conn.transaction().map_err(e)?;
    let piece = take_fragment(&tx, doc_id, fragment)?;
    tx.commit().map_err(e)?;
    Ok(piece)
}

fn take_fragment(tx: &rusqlite::Transaction, doc_id: i64, fragment: &str) -> Res<String> {
    let full: String = tx
        .prepare("SELECT text FROM sections WHERE doc_id = ?1 ORDER BY ordinal")
        .map_err(e)?
        .query_map([doc_id], |r| r.get::<_, String>(0))
        .map_err(e)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(e)?
        .iter()
        .map(|t| if t.ends_with('\n') { t.clone() } else { format!("{t}\n") })
        .collect();
    let (a, b) = find_fragment(&full, fragment).ok_or("No se encuentra el trozo seleccionado en el texto")?;
    let piece = full[a..b].trim().to_string();
    let rest = format!("{}{}", &full[..a], &full[b..]);
    if piece.is_empty() {
        return Err("El trozo seleccionado está vacío".into());
    }
    keep_doc_version(tx, doc_id, true).map_err(e)?;
    write_sections(tx, doc_id, &text::split_sections(rest.trim())).map_err(e)?;
    tx.execute("UPDATE docs SET modified = datetime('now', 'localtime') WHERE id = ?1", [doc_id]).map_err(e)?;
    Ok(piece)
}

fn valid_date(d: &str) -> bool {
    let parts: Vec<&str> = d.split('-').collect();
    let num = |s: &str, len: usize| s.len() == len && s.chars().all(|c| c.is_ascii_digit());
    match parts.as_slice() {
        [y] => num(y, 4),
        [y, m] => num(y, 4) && num(m, 2),
        [y, m, dd] => num(y, 4) && num(m, 2) && num(dd, 2),
        _ => false,
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DocMeta {
    pub title: String,
    pub date: String,
    pub collection: String,
    pub person_id: Option<i64>,
}

pub fn update_doc(conn: &mut Connection, doc_id: i64, m: &DocMeta) -> Res<()> {
    let title = m.title.trim();
    let date = m.date.trim();
    if title.is_empty() {
        return Err("El título no puede estar vacío".into());
    }
    if !date.is_empty() && !valid_date(date) {
        return Err("Fecha no válida: usa AAAA, AAAA-MM o AAAA-MM-DD".into());
    }
    let tx = conn.transaction().map_err(e)?;
    let (old_col, old_dir): (String, String) = tx
        .query_row("SELECT collection, dir FROM docs WHERE id = ?1", [doc_id], |r| Ok((r.get(0)?, r.get(1)?)))
        .map_err(e)?;
    let col = m.collection.trim();
    let (col, dir) = if col.is_empty() || col == old_col {
        (old_col, old_dir)
    } else {
        (col.to_string(), col.to_string())
    };
    tx.execute(
        "UPDATE docs SET title = ?1, stem = ?2, date = ?3, person_id = ?4, collection = ?5, dir = ?6,
                modified = datetime('now', 'localtime') WHERE id = ?7",
        params![title, title.to_lowercase(), (!date.is_empty()).then_some(date), m.person_id, col, dir, doc_id],
    )
    .map_err(e)?;
    fts_doc(&tx, doc_id).map_err(e)?;
    // the first section is found by the title too
    fts_sections_remove(&tx, doc_id).map_err(e)?;
    fts_sections_add(&tx, doc_id).map_err(e)?;
    tx.commit().map_err(e)
}

/// Renames a collection (or a folder inside it) for all its documents.
pub fn rename_folder(conn: &mut Connection, dir: &str, new_name: &str) -> Res<()> {
    let new_name = new_name.trim().replace('/', "-");
    if new_name.is_empty() {
        return Err("El nombre no puede estar vacío".into());
    }
    let new_dir = match dir.rsplit_once('/') {
        Some((parent, _)) => format!("{parent}/{new_name}"),
        None => new_name.clone(),
    };
    let tx = conn.transaction().map_err(e)?;
    let rows: Vec<(i64, String)> = tx
        .prepare("SELECT id, dir FROM docs WHERE dir = ?1 OR substr(dir, 1, length(?1) + 1) = ?1 || '/'")
        .map_err(e)?
        .query_map([dir], |r| Ok((r.get(0)?, r.get(1)?)))
        .map_err(e)?
        .collect::<Result<_, _>>()
        .map_err(e)?;
    for (id, d) in rows {
        let nd = format!("{new_dir}{}", &d[dir.len()..]);
        let col = nd.split('/').next().unwrap_or(&nd).to_string();
        tx.execute("UPDATE docs SET dir = ?1, collection = ?2 WHERE id = ?3", params![nd, col, id]).map_err(e)?;
        fts_doc(&tx, id).map_err(e)?;
    }
    tx.commit().map_err(e)
}

// ---------------------------------------------------------------- recycle bin

/// Sends every text of a collection (or of a folder inside it) to the
/// recycle bin; returns how many.
pub fn trash_folder(conn: &mut Connection, dir: &str) -> Res<usize> {
    if dir.is_empty() {
        return Err("Carpeta vacía".into());
    }
    let ids: Vec<i64> = conn
        .prepare("SELECT id FROM docs WHERE deleted IS NULL AND (dir = ?1 OR substr(dir, 1, length(?1) + 1) = ?1 || '/')")
        .map_err(e)?
        .query_map([dir], |r| r.get(0))
        .map_err(e)?
        .collect::<Result<_, _>>()
        .map_err(e)?;
    let tx = conn.transaction().map_err(e)?;
    for id in &ids {
        fts_sections_remove(&tx, *id).map_err(e)?;
        tx.execute("DELETE FROM docs_fts WHERE rowid = ?1", [id]).map_err(e)?;
        tx.execute("UPDATE docs SET deleted = datetime('now', 'localtime') WHERE id = ?1", [id]).map_err(e)?;
    }
    tx.commit().map_err(e)?;
    Ok(ids.len())
}

pub fn trash_doc(conn: &mut Connection, doc_id: i64) -> Res<()> {
    let tx = conn.transaction().map_err(e)?;
    fts_sections_remove(&tx, doc_id).map_err(e)?;
    tx.execute("DELETE FROM docs_fts WHERE rowid = ?1", [doc_id]).map_err(e)?;
    tx.execute("UPDATE docs SET deleted = datetime('now', 'localtime') WHERE id = ?1", [doc_id]).map_err(e)?;
    tx.commit().map_err(e)
}

pub fn restore_doc(conn: &mut Connection, doc_id: i64) -> Res<()> {
    let tx = conn.transaction().map_err(e)?;
    tx.execute("UPDATE docs SET deleted = NULL WHERE id = ?1", [doc_id]).map_err(e)?;
    // its person may have been deleted meanwhile
    tx.execute(
        "UPDATE docs SET person_id = NULL WHERE id = ?1 AND person_id NOT IN (SELECT id FROM persons)",
        [doc_id],
    )
    .map_err(e)?;
    fts_doc(&tx, doc_id).map_err(e)?;
    fts_sections_add(&tx, doc_id).map_err(e)?;
    tx.commit().map_err(e)
}

/// Deletes for good (only from the recycle bin).
pub fn purge_docs(conn: &mut Connection, ids: &[i64]) -> Res<()> {
    let tx = conn.transaction().map_err(e)?;
    for id in ids {
        for t in [
            "sections WHERE doc_id",
            "files WHERE doc_id",
            "bookmarks WHERE doc_id",
            "history WHERE kind = 'doc' AND target",
            "docs WHERE id",
        ] {
            tx.execute(&format!("DELETE FROM {t} = ?1 AND (SELECT deleted FROM docs WHERE id = ?1) IS NOT NULL"), [id])
                .map_err(e)?;
        }
    }
    tx.commit().map_err(e)?;
    let _ = conn.execute_batch("PRAGMA incremental_vacuum;");
    Ok(())
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Trashed {
    pub id: i64,
    pub title: String,
    pub collection: String,
    pub person: Option<String>,
    pub deleted: String,
}

pub fn list_trash(conn: &Connection) -> Res<Vec<Trashed>> {
    let mut st = conn
        .prepare(
            "SELECT d.id, d.title, d.collection, p.name, d.deleted FROM docs d
             LEFT JOIN persons p ON p.id = d.person_id WHERE d.deleted IS NOT NULL ORDER BY d.deleted DESC",
        )
        .map_err(e)?;
    let rows = st
        .query_map([], |r| {
            Ok(Trashed { id: r.get(0)?, title: r.get(1)?, collection: r.get(2)?, person: r.get(3)?, deleted: r.get(4)? })
        })
        .map_err(e)?;
    rows.collect::<Result<_, _>>().map_err(e)
}

// ---------------------------------------------------------------- tidying up

/// Titles of old Word files with a stray first byte or in a Balaram font
/// ("ÃTHE ACCEPTANCE…", "Çréla Raghunätha…") are put right (once; new
/// imports are tidied while importing). Returns how many changed.
pub fn tidy_doc_titles(conn: &mut Connection) -> Res<usize> {
    let tx = conn.transaction().map_err(e)?;
    let rows: Vec<(i64, String)> = tx
        .prepare("SELECT id, title FROM docs WHERE kind = 'doc'")
        .map_err(e)?
        .query_map([], |r| Ok((r.get(0)?, r.get(1)?)))
        .map_err(e)?
        .collect::<Result<_, _>>()
        .map_err(e)?;
    let mut changed = 0;
    for (id, title) in rows {
        let new = text::tidy_doc_title(&title);
        if new.is_empty() || new == title {
            continue;
        }
        tx.execute("UPDATE docs SET title = ?1, stem = ?2 WHERE id = ?3", params![new, new.to_lowercase(), id]).map_err(e)?;
        let live: bool = tx.query_row("SELECT deleted IS NULL FROM docs WHERE id = ?1", [id], |r| r.get(0)).map_err(e)?;
        if live {
            fts_doc(&tx, id).map_err(e)?;
            fts_sections_remove(&tx, id).map_err(e)?;
            fts_sections_add(&tx, id).map_err(e)?;
        }
        changed += 1;
    }
    tx.commit().map_err(e)?;
    Ok(changed)
}

/// Works the matching keys of all records out again (after a change in `person_key`).
pub fn refresh_person_keys(conn: &mut Connection) -> Res<()> {
    let tx = conn.transaction().map_err(e)?;
    let rows: Vec<(i64, String)> = tx
        .prepare("SELECT id, name FROM persons")
        .map_err(e)?
        .query_map([], |r| Ok((r.get(0)?, r.get(1)?)))
        .map_err(e)?
        .collect::<Result<_, _>>()
        .map_err(e)?;
    for (id, name) in rows {
        tx.execute("UPDATE persons SET key = ?1 WHERE id = ?2", params![person_key(&name), id]).map_err(e)?;
    }
    tx.commit().map_err(e)
}

/// Says that these records (similar names) are different people: the
/// assistant for repeated records stops proposing them together.
pub fn mark_distinct(conn: &mut Connection, ids: &[i64]) -> Res<()> {
    let tx = conn.transaction().map_err(e)?;
    for (i, &a) in ids.iter().enumerate() {
        for &b in &ids[i + 1..] {
            tx.execute("INSERT OR IGNORE INTO person_distinct(a, b) VALUES(?1, ?2)", params![a.min(b), a.max(b)]).map_err(e)?;
        }
    }
    tx.commit().map_err(e)
}

/// Forgets that two records were called different people (a mistake): they
/// can be proposed as the same person again.
pub fn unmark_distinct(conn: &Connection, a: i64, b: i64) -> Res<()> {
    conn.execute("DELETE FROM person_distinct WHERE a = ?1 AND b = ?2", params![a.min(b), a.max(b)]).map_err(e)?;
    Ok(())
}

pub fn list_distinct(conn: &Connection) -> Res<Vec<(i64, i64)>> {
    let mut st = conn.prepare("SELECT a, b FROM person_distinct").map_err(e)?;
    let rows = st.query_map([], |r| Ok((r.get(0)?, r.get(1)?))).map_err(e)?;
    rows.collect::<Result<_, _>>().map_err(e)
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReviewDoc {
    pub id: i64,
    pub title: String,
    pub collection: String,
    pub kind: String,
    pub size: i64,
    pub person: Option<String>,
    pub has_original: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Review {
    /// texts with (almost) nothing in them
    pub empty: Vec<ReviewDoc>,
    /// titles that are an old file name ("HNC02") or start oddly
    pub odd_titles: Vec<ReviewDoc>,
}

/// What may need a look by hand.
pub fn review(conn: &Connection) -> Res<Review> {
    let mut st = conn
        .prepare(
            "SELECT d.id, d.title, d.collection, d.kind, d.size, p.name,
                    EXISTS(SELECT 1 FROM files f WHERE f.doc_id = d.id AND f.role = 'original')
             FROM docs d LEFT JOIN persons p ON p.id = d.person_id
             WHERE d.deleted IS NULL ORDER BY d.title COLLATE NOCASE",
        )
        .map_err(e)?;
    let all: Vec<ReviewDoc> = st
        .query_map([], |r| {
            Ok(ReviewDoc {
                id: r.get(0)?,
                title: r.get(1)?,
                collection: r.get(2)?,
                kind: r.get(3)?,
                size: r.get(4)?,
                person: r.get(5)?,
                has_original: r.get(6)?,
            })
        })
        .map_err(e)?
        .collect::<Result<_, _>>()
        .map_err(e)?;
    let odd = |t: &str| {
        let dos = t.chars().count() <= 12 && !t.chars().any(|c| c.is_lowercase()) && t.chars().any(|c| c.is_ascii_digit() || c == '~');
        let first = t.chars().next().unwrap_or(' ');
        dos || t.to_lowercase().starts_with("by ") || !(first.is_alphanumeric() || "\"'(¿¡[“«".contains(first))
    };
    let (mut empty, mut odd_titles) = (Vec::new(), Vec::new());
    for d in all {
        if d.size < 50 && d.kind != "new" {
            empty.push(d);
        } else if odd(&d.title) {
            odd_titles.push(d);
        }
    }
    Ok(Review { empty, odd_titles })
}

// ---------------------------------------------------------------- earlier versions

/// A new version is kept only when the last one is older than this (minutes):
/// several saves in one sitting leave one version, the state before them.
const VERSION_GAP_MIN: f64 = 10.0;
/// Versions kept per text / record (the oldest go first).
const VERSIONS_KEPT: i64 = 30;

#[derive(Serialize, Deserialize)]
struct VersionSection {
    heading: Option<String>,
    text: String,
}

/// Keeps the current state of a text or record as a version, before it changes.
pub(crate) fn keep_version(tx: &Connection, kind: &str, target: i64, label: &str, data: &str, always: bool) -> rusqlite::Result<()> {
    let last: Option<(String, f64)> = tx
        .query_row(
            "SELECT data, (julianday('now', 'localtime') - julianday(saved)) * 1440 FROM history
             WHERE kind = ?1 AND target = ?2 ORDER BY id DESC LIMIT 1",
            params![kind, target],
            |r| Ok((r.get(0)?, r.get(1)?)),
        )
        .optional()?;
    if let Some((d, minutes)) = last {
        if d == data || (!always && minutes < VERSION_GAP_MIN) {
            return Ok(());
        }
    }
    tx.execute("INSERT INTO history(kind, target, label, data) VALUES(?1, ?2, ?3, ?4)", params![kind, target, label, data])?;
    tx.execute(
        "DELETE FROM history WHERE kind = ?1 AND target = ?2 AND id NOT IN
           (SELECT id FROM history WHERE kind = ?1 AND target = ?2 ORDER BY id DESC LIMIT ?3)",
        params![kind, target, VERSIONS_KEPT],
    )?;
    Ok(())
}

fn keep_doc_version(tx: &Connection, doc_id: i64, always: bool) -> rusqlite::Result<()> {
    let Some(title) = tx.query_row("SELECT title FROM docs WHERE id = ?1", [doc_id], |r| r.get::<_, String>(0)).optional()? else {
        return Ok(());
    };
    let secs: Vec<VersionSection> = tx
        .prepare_cached("SELECT heading, text FROM sections WHERE doc_id = ?1 ORDER BY ordinal")?
        .query_map([doc_id], |r| Ok(VersionSection { heading: r.get(0)?, text: r.get(1)? }))?
        .collect::<Result<_, _>>()?;
    let data = serde_json::to_string(&secs).unwrap_or_default();
    keep_version(tx, "doc", doc_id, &title, &data, always)
}

fn keep_person_version(tx: &Connection, id: i64, always: bool) -> rusqlite::Result<()> {
    let Some(f) = get_fields(tx, id).optional()? else { return Ok(()) };
    let data = serde_json::to_string(&f).unwrap_or_default();
    keep_version(tx, "person", id, &f.name, &data, always)
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Version {
    pub id: i64,
    pub label: String,
    pub saved: String,
    /// doc: JSON list of {heading, text}; person: JSON of the record's fields
    pub data: String,
}

/// Earlier versions of a text (`kind` = "doc") or a record ("person"), newest first.
pub fn list_versions(conn: &Connection, kind: &str, target: i64) -> Res<Vec<Version>> {
    let mut st = conn
        .prepare("SELECT id, label, saved, data FROM history WHERE kind = ?1 AND target = ?2 ORDER BY id DESC")
        .map_err(e)?;
    let rows = st
        .query_map(params![kind, target], |r| Ok(Version { id: r.get(0)?, label: r.get(1)?, saved: r.get(2)?, data: r.get(3)? }))
        .map_err(e)?;
    rows.collect::<Result<_, _>>().map_err(e)
}

/// Puts an earlier version back. What there is now is kept as a version
/// first, so going back can be undone too.
pub fn restore_version(conn: &mut Connection, id: i64) -> Res<()> {
    let tx = conn.transaction().map_err(e)?;
    let (kind, target, data): (String, i64, String) = tx
        .query_row("SELECT kind, target, data FROM history WHERE id = ?1", [id], |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)))
        .optional()
        .map_err(e)?
        .ok_or("Esa versión ya no existe")?;
    match kind.as_str() {
        "doc" => {
            let secs: Vec<VersionSection> = serde_json::from_str(&data).map_err(e)?;
            let live: Option<bool> =
                tx.query_row("SELECT deleted IS NULL FROM docs WHERE id = ?1", [target], |r| r.get(0)).optional().map_err(e)?;
            match live {
                None => return Err("El texto ya no existe".into()),
                Some(false) => return Err("El texto está en la papelera: recupéralo primero".into()),
                Some(true) => {}
            }
            keep_doc_version(&tx, target, true).map_err(e)?;
            let sections: Vec<Section> = secs.into_iter().map(|s| Section { heading: s.heading, text: s.text }).collect();
            write_sections(&tx, target, &sections).map_err(e)?;
            tx.execute("UPDATE docs SET modified = datetime('now', 'localtime') WHERE id = ?1", [target]).map_err(e)?;
        }
        "place" => crate::places::restore(&tx, target, &data)?,
        "person" => {
            let f: PersonFields = serde_json::from_str(&data).map_err(e)?;
            if get_fields(&tx, target).optional().map_err(e)?.is_none() {
                return Err("La ficha ya no existe".into());
            }
            keep_person_version(&tx, target, true).map_err(e)?;
            write_person(&tx, target, &f)?;
        }
        _ => return Err("Esa versión no se puede recuperar desde aquí".into()),
    }
    tx.commit().map_err(e)
}

/// How many earlier versions there are and how much they take (bytes).
pub fn versions_size(conn: &Connection) -> Res<(i64, i64)> {
    conn.query_row("SELECT count(*), COALESCE(sum(length(data) + length(label)), 0) FROM history", [], |r| {
        Ok((r.get(0)?, r.get(1)?))
    })
    .map_err(e)
}

/// Deletes all the earlier versions of texts and records, and gives the
/// space back to the disk. Returns how many were deleted.
pub fn clear_versions(conn: &mut Connection) -> Res<usize> {
    let n = conn.execute("DELETE FROM history", []).map_err(e)?;
    conn.execute_batch("PRAGMA wal_checkpoint(TRUNCATE); VACUUM; PRAGMA wal_checkpoint(TRUNCATE);").map_err(e)?;
    Ok(n)
}

// ---------------------------------------------------------------- persons

#[derive(Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct PersonFields {
    pub name: String,
    pub aka: String,
    pub appearance: String,
    pub disappearance: String,
    pub place: String,
    pub guru: String,
    pub disciples: String,
    pub works: String,
    pub notes: String,
    /// labels, comma separated (kept in person_tags)
    #[serde(default)]
    pub tags: String,
}

/// Labels written as "a, b, c": trimmed, without repeats.
fn split_tags(s: &str) -> Vec<String> {
    let mut out: Vec<String> = Vec::new();
    for t in s.split(',').map(|t| t.trim()).filter(|t| !t.is_empty()) {
        if !out.iter().any(|x| x.to_lowercase() == t.to_lowercase()) {
            out.push(t.to_string());
        }
    }
    out
}

pub fn create_person(tx: &Connection, name: &str) -> rusqlite::Result<i64> {
    tx.prepare_cached("INSERT INTO persons(name, key) VALUES(?1, ?2)")?
        .execute(params![name, person_key(name)])?;
    let id = tx.last_insert_rowid();
    fts_person(tx, id)?;
    Ok(id)
}

pub fn new_person(conn: &mut Connection, f: &PersonFields) -> Res<i64> {
    let tx = conn.transaction().map_err(e)?;
    let id = create_person(&tx, f.name.trim()).map_err(e)?;
    write_person(&tx, id, f)?;
    tx.commit().map_err(e)?;
    Ok(id)
}

fn write_person(tx: &Connection, id: i64, f: &PersonFields) -> Res<()> {
    let name = f.name.trim();
    if name.is_empty() {
        return Err("El nombre no puede estar vacío".into());
    }
    tx.execute(
        "UPDATE persons SET name = ?1, key = ?2, aka = ?3, appearance = ?4, disappearance = ?5, place = ?6,
                guru = ?7, disciples = ?8, works = ?9, notes = ?10, modified = datetime('now', 'localtime')
         WHERE id = ?11",
        params![
            name, person_key(name), f.aka.trim(), f.appearance.trim(), f.disappearance.trim(), f.place.trim(),
            f.guru.trim(), f.disciples.trim(), f.works.trim(), f.notes.trim(), id
        ],
    )
    .map_err(e)?;
    tx.execute("DELETE FROM person_tags WHERE person_id = ?1", [id]).map_err(e)?;
    for tag in split_tags(&f.tags) {
        tx.execute("INSERT INTO person_tags(person_id, tag) VALUES(?1, ?2)", params![id, tag]).map_err(e)?;
    }
    fts_person(tx, id).map_err(e)?;
    // names are part of the documents' title entries
    let docs: Vec<i64> = tx
        .prepare("SELECT id FROM docs WHERE person_id = ?1")
        .map_err(e)?
        .query_map([id], |r| r.get(0))
        .map_err(e)?
        .collect::<Result<_, _>>()
        .map_err(e)?;
    for d in docs {
        fts_doc(tx, d).map_err(e)?;
    }
    Ok(())
}

pub fn update_person(conn: &mut Connection, id: i64, f: &PersonFields) -> Res<()> {
    let tx = conn.transaction().map_err(e)?;
    keep_person_version(&tx, id, false).map_err(e)?;
    write_person(&tx, id, f)?;
    tx.commit().map_err(e)
}

/// Deletes a record. Its documents stay, without a person.
pub fn delete_person(conn: &mut Connection, id: i64) -> Res<()> {
    let tx = conn.transaction().map_err(e)?;
    let docs: Vec<i64> = tx
        .prepare("SELECT id FROM docs WHERE person_id = ?1")
        .map_err(e)?
        .query_map([id], |r| r.get(0))
        .map_err(e)?
        .collect::<Result<_, _>>()
        .map_err(e)?;
    tx.execute("UPDATE docs SET person_id = NULL WHERE person_id = ?1", [id]).map_err(e)?;
    tx.execute("DELETE FROM person_photos WHERE person_id = ?1", [id]).map_err(e)?;
    tree_remove(&tx, id).map_err(e)?;
    tx.execute("DELETE FROM history WHERE kind = 'person' AND target = ?1", [id]).map_err(e)?;
    tx.execute("DELETE FROM person_tags WHERE person_id = ?1", [id]).map_err(e)?;
    tx.execute("DELETE FROM person_images WHERE person_id = ?1", [id]).map_err(e)?;
    tx.execute("DELETE FROM person_distinct WHERE a = ?1 OR b = ?1", [id]).map_err(e)?;
    tx.execute("DELETE FROM person_links WHERE person_id = ?1 OR guru_id = ?1", [id]).map_err(e)?;
    crate::places::forget_person(&tx, id).map_err(e)?;
    tx.execute("DELETE FROM persons WHERE id = ?1", [id]).map_err(e)?;
    tx.execute("DELETE FROM persons_fts WHERE rowid = ?1", [id]).map_err(e)?;
    for d in docs {
        fts_doc(&tx, d).map_err(e)?;
    }
    tx.commit().map_err(e)
}

pub fn get_fields(tx: &Connection, id: i64) -> rusqlite::Result<PersonFields> {
    tx.query_row(
        "SELECT name, aka, appearance, disappearance, place, guru, disciples, works, notes,
                COALESCE((SELECT group_concat(tag, ', ') FROM person_tags WHERE person_id = ?1), '')
         FROM persons WHERE id = ?1",
        [id],
        |r| {
            Ok(PersonFields {
                name: r.get(0)?,
                aka: r.get(1)?,
                appearance: r.get(2)?,
                disappearance: r.get(3)?,
                place: r.get(4)?,
                guru: r.get(5)?,
                disciples: r.get(6)?,
                works: r.get(7)?,
                notes: r.get(8)?,
                tags: r.get(9)?,
            })
        },
    )
}

/// Gives a label to some records, or takes it away (the "Namesakes" group is
/// a label: records with the same name as others who are other people).
pub fn set_tag(conn: &mut Connection, ids: &[i64], tag: &str, on: bool) -> Res<()> {
    let tag = tag.trim();
    if tag.is_empty() {
        return Ok(());
    }
    let tx = conn.transaction().map_err(e)?;
    for &id in ids {
        tx.execute("DELETE FROM person_tags WHERE person_id = ?1 AND tag = ?2 COLLATE NOCASE", params![id, tag]).map_err(e)?;
        if on {
            tx.execute("INSERT INTO person_tags(person_id, tag) VALUES(?1, ?2)", params![id, tag]).map_err(e)?;
        }
        fts_person(&tx, id).map_err(e)?;
    }
    tx.commit().map_err(e)
}

/// Labels in use, with how many records have each.
pub fn list_tags(conn: &Connection) -> Res<Vec<(String, i64)>> {
    let mut st = conn
        .prepare("SELECT tag, COUNT(*) FROM person_tags GROUP BY tag ORDER BY tag COLLATE NOCASE")
        .map_err(e)?;
    let rows = st.query_map([], |r| Ok((r.get(0)?, r.get(1)?))).map_err(e)?;
    rows.collect::<Result<_, _>>().map_err(e)
}

fn join_list(a: &str, b: &str) -> String {
    let mut items: Vec<String> = a.split(',').map(|s| s.trim().to_string()).filter(|s| !s.is_empty()).collect();
    for s in b.split(',').map(str::trim).filter(|s| !s.is_empty()) {
        if !items.iter().any(|x| x.eq_ignore_ascii_case(s)) {
            items.push(s.to_string());
        }
    }
    items.join(", ")
}

fn join_text(a: &str, b: &str) -> String {
    match (a.trim().is_empty(), b.trim().is_empty()) {
        (_, true) => a.to_string(),
        (true, false) => b.to_string(),
        _ if a.contains(b.trim()) => a.to_string(),
        _ => format!("{a}\n\n{b}"),
    }
}

/// Joins `from` into `into`: documents move over, empty fields are filled
/// and the other name is kept as an alternative name.
/// Removes the Obsidian callout marks ("> [!example] NAME", "> ") from the
/// imported notes (once; new imports are cleaned while importing).
/// Returns how many texts changed.
pub fn clean_callouts(conn: &mut Connection) -> Res<usize> {
    let tx = conn.transaction().map_err(e)?;
    let ids: Vec<i64> = tx
        .prepare("SELECT id FROM docs WHERE kind = 'md'")
        .map_err(e)?
        .query_map([], |r| r.get(0))
        .map_err(e)?
        .collect::<Result<_, _>>()
        .map_err(e)?;
    let mut changed = 0;
    for id in ids {
        let old: Vec<Section> = tx
            .prepare_cached("SELECT heading, text FROM sections WHERE doc_id = ?1 ORDER BY ordinal")
            .map_err(e)?
            .query_map([id], |r| Ok(Section { heading: r.get(0)?, text: r.get(1)? }))
            .map_err(e)?
            .collect::<Result<_, _>>()
            .map_err(e)?;
        if !old.iter().any(|s| s.text.contains('>')) {
            continue;
        }
        let new: Vec<Section> =
            old.iter().map(|s| Section { heading: s.heading.clone(), text: text::strip_callouts(&s.text) }).collect();
        if new.iter().zip(&old).all(|(n, o)| n.text == o.text) {
            continue;
        }
        write_sections(&tx, id, &new).map_err(e)?;
        changed += 1;
    }
    tx.commit().map_err(e)?;
    Ok(changed)
}

#[derive(Serialize, Default, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Replaced {
    pub total: usize,
    pub texts: usize,
    pub titles: usize,
    pub persons: usize,
    /// the copy of the database made first
    pub backup: String,
}

/// `text` after the replacement; `n` counts the changes.
fn replaced(r: &crate::replace::Replacer, text: &str, n: &mut usize) -> String {
    match r.apply(text) {
        Some((t, k)) => {
            *n += k;
            t
        }
        None => text.to_string(),
    }
}

/// Find and replace over the library (see `replace.rs`). The state before is
/// kept as a version of each text and record changed, so each one can also
/// be undone on its own.
pub fn replace_all(
    conn: &mut Connection,
    r: &crate::replace::Replacer,
    scope: crate::replace::Scope,
    progress: impl Fn(usize, usize),
) -> Res<Replaced> {
    let tx = conn.transaction().map_err(e)?;
    let mut done = Replaced::default();
    let ids: Vec<i64> = tx
        .prepare("SELECT id FROM docs WHERE deleted IS NULL ORDER BY id")
        .map_err(e)?
        .query_map([], |r| r.get(0))
        .map_err(e)?
        .collect::<Result<_, _>>()
        .map_err(e)?;
    let pids: Vec<i64> = if scope.persons {
        tx.prepare("SELECT id FROM persons").map_err(e)?.query_map([], |r| r.get(0)).map_err(e)?.collect::<Result<_, _>>().map_err(e)?
    } else {
        vec![]
    };
    let total = ids.len() + pids.len();
    for (i, &id) in ids.iter().enumerate() {
        if i % 50 == 0 {
            progress(i, total);
        }
        if scope.titles {
            let title: String = tx.query_row("SELECT title FROM docs WHERE id = ?1", [id], |r| r.get(0)).map_err(e)?;
            if let Some((t, n)) = r.apply(&title).filter(|(t, _)| !t.trim().is_empty()) {
                keep_doc_version(&tx, id, true).map_err(e)?;
                tx.execute("UPDATE docs SET title = ?1, stem = ?2 WHERE id = ?3", params![t, t.to_lowercase(), id])
                    .map_err(e)?;
                fts_doc(&tx, id).map_err(e)?;
                fts_sections_remove(&tx, id).map_err(e)?;
                fts_sections_add(&tx, id).map_err(e)?;
                done.titles += 1;
                done.total += n;
            }
        }
        if scope.texts {
            let old: Vec<Section> = tx
                .prepare_cached("SELECT heading, text FROM sections WHERE doc_id = ?1 ORDER BY ordinal")
                .map_err(e)?
                .query_map([id], |r| Ok(Section { heading: r.get(0)?, text: r.get(1)? }))
                .map_err(e)?
                .collect::<Result<_, _>>()
                .map_err(e)?;
            let mut n = 0;
            let new: Vec<Section> = old
                .iter()
                .map(|s| Section {
                    heading: s.heading.as_ref().map(|h| replaced(r, h, &mut n)),
                    text: replaced(r, &s.text, &mut n),
                })
                .collect();
            if n > 0 {
                keep_doc_version(&tx, id, true).map_err(e)?;
                write_sections(&tx, id, &new).map_err(e)?;
                tx.execute("UPDATE docs SET modified = datetime('now', 'localtime') WHERE id = ?1", [id]).map_err(e)?;
                done.texts += 1;
                done.total += n;
            }
        }
    }
    for (i, &id) in pids.iter().enumerate() {
        if i % 50 == 0 {
            progress(ids.len() + i, total);
        }
        let f = get_fields(&tx, id).map_err(e)?;
        let mut n = 0;
        let mut ch = |s: &String| replaced(r, s, &mut n);
        let new = PersonFields {
            name: ch(&f.name),
            aka: ch(&f.aka),
            appearance: ch(&f.appearance),
            disappearance: ch(&f.disappearance),
            place: ch(&f.place),
            guru: ch(&f.guru),
            disciples: ch(&f.disciples),
            works: ch(&f.works),
            notes: ch(&f.notes),
            tags: f.tags.clone(),
        };
        if n > 0 && !new.name.trim().is_empty() {
            keep_person_version(&tx, id, true).map_err(e)?;
            write_person(&tx, id, &new)?;
            done.persons += 1;
            done.total += n;
        }
    }
    tx.commit().map_err(e)?;
    progress(total, total);
    Ok(done)
}

/// What "take less space" does (Ajustes › Copias de seguridad).
#[derive(Deserialize, Clone, Copy)]
#[serde(rename_all = "camelCase")]
pub struct Slim {
    /// cover images made small
    pub covers: bool,
    /// the text of the PDFs as plain notes (Markdown)
    pub pdf_text: bool,
    /// the original PDFs taken out (not those without text: scanned)
    pub originals: bool,
}

#[derive(Serialize, Default, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Slimmed {
    pub covers: usize,
    pub converted: usize,
    pub originals: usize,
    /// size of the database before and after, bytes
    pub before: u64,
    pub after: u64,
    pub backup: String,
}

/// Largest side of a cover after `slim_library`.
const COVER_SIDE: u32 = 480;

fn small_cover(data: &[u8]) -> Option<Vec<u8>> {
    let img = image::load_from_memory(data).ok()?;
    let small = img.thumbnail(COVER_SIDE, COVER_SIDE).to_rgb8();
    let mut out = Vec::new();
    image::codecs::jpeg::JpegEncoder::new_with_quality(&mut out, 82).encode_image(&small).ok()?;
    (out.len() < data.len()).then_some(out)
}

/// Makes the library take less space. The PDF texts keep their earlier
/// version (undo); covers and originals are only in the backup made before.
pub fn slim_library(conn: &mut Connection, what: Slim, progress: impl Fn(usize, usize)) -> Res<Slimmed> {
    let mut done = Slimmed::default();
    let tx = conn.transaction().map_err(e)?;
    if what.covers {
        let ids: Vec<i64> = tx
            .prepare("SELECT id FROM files WHERE role = 'cover'")
            .map_err(e)?
            .query_map([], |r| r.get(0))
            .map_err(e)?
            .collect::<Result<_, _>>()
            .map_err(e)?;
        for (i, id) in ids.iter().enumerate() {
            if i % 20 == 0 {
                progress(i, ids.len());
            }
            let data: Vec<u8> = tx.query_row("SELECT data FROM files WHERE id = ?1", [id], |r| r.get(0)).map_err(e)?;
            if let Some(small) = small_cover(&data) {
                tx.execute("UPDATE files SET data = ?1, mime = 'image/jpeg', name = 'cover.jpg' WHERE id = ?2", params![small, id])
                    .map_err(e)?;
                done.covers += 1;
            }
        }
    }
    // texts of PDFs that have one (the scanned ones keep everything)
    let pdfs: Vec<i64> = tx
        .prepare("SELECT id FROM docs WHERE kind = 'pdf' AND deleted IS NULL AND size >= 200")
        .map_err(e)?
        .query_map([], |r| r.get(0))
        .map_err(e)?
        .collect::<Result<_, _>>()
        .map_err(e)?;
    if what.pdf_text {
        for (i, &id) in pdfs.iter().enumerate() {
            if i % 20 == 0 {
                progress(i, pdfs.len());
            }
            let text: String = tx
                .query_row("SELECT group_concat(text, char(10) || char(10)) FROM (SELECT text FROM sections WHERE doc_id = ?1 ORDER BY ordinal)", [id], |r| {
                    r.get::<_, Option<String>>(0)
                })
                .map_err(e)?
                .unwrap_or_default();
            let md = crate::extract::pdf_markdown(&text);
            if md.trim().is_empty() {
                continue;
            }
            keep_doc_version(&tx, id, true).map_err(e)?;
            write_sections(&tx, id, &text::split_sections(&md)).map_err(e)?;
            tx.execute("UPDATE docs SET kind = 'md', modified = datetime('now', 'localtime') WHERE id = ?1", [id]).map_err(e)?;
            done.converted += 1;
        }
    }
    if what.originals {
        // texts in the recycle bin keep theirs, as do PDFs without text
        done.originals = tx
            .execute(
                "DELETE FROM files WHERE role = 'original' AND lower(name) LIKE '%.pdf'
                   AND doc_id IN (SELECT id FROM docs WHERE deleted IS NULL AND size >= 200)",
                [],
            )
            .map_err(e)?;
    }
    tx.commit().map_err(e)?;
    // give the freed pages back to the disk
    conn.execute_batch("PRAGMA wal_checkpoint(TRUNCATE); VACUUM; PRAGMA wal_checkpoint(TRUNCATE);").map_err(e)?;
    Ok(done)
}

#[derive(Serialize, Default, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Joined {
    /// records that now have one text
    pub persons: usize,
    /// texts joined (now in the recycle bin)
    pub docs: usize,
    /// texts left out because another one already says the same
    pub repeated: usize,
    pub backup: String,
}

/// Collection of the texts made by `join_person_texts`.
pub const JOINED_COLLECTION: &str = "Fichas";

/// Words only, for telling whether two texts say the same.
fn bare(text: &str) -> String {
    crate::fold::fold_text(text)
}

/// One text per record: the texts of each record with two or more (all
/// records, or only `only`) become one Markdown text named after the record,
/// each former text a part with its title as heading (the contents list goes
/// from one to the next). PDFs become plain text; a text whose words are
/// already in another part is left out. The former texts go to the recycle
/// bin (they can be restored); their bookmarks follow; a cover becomes the
/// record's picture if it has none.
pub fn join_person_texts(conn: &mut Connection, only: Option<i64>, progress: impl Fn(usize, usize)) -> Res<Joined> {
    let mut done = Joined::default();
    let tx = conn.transaction().map_err(e)?;
    let persons: Vec<(i64, String)> = tx
        .prepare(
            "SELECT p.id, p.name FROM persons p
             WHERE (?1 IS NULL OR p.id = ?1)
               AND (SELECT COUNT(*) FROM docs d WHERE d.person_id = p.id AND d.deleted IS NULL) >= 2",
        )
        .map_err(e)?
        .query_map([only], |r| Ok((r.get(0)?, r.get(1)?)))
        .map_err(e)?
        .collect::<Result<_, _>>()
        .map_err(e)?;
    for (i, (pid, name)) in persons.iter().enumerate() {
        if i % 10 == 0 {
            progress(i, persons.len());
        }
        // the notes first (they were written as biographies), then Goswami
        // Grantha, then the books
        let docs: Vec<(i64, String, String, String, bool)> = tx
            .prepare(
                "SELECT id, title, kind, tags, collection = ?2 FROM docs WHERE person_id = ?1 AND deleted IS NULL
                 ORDER BY collection = ?2 DESC,
                          CASE WHEN kind IN ('md', 'new', 'txt') AND collection <> 'Calibre' THEN 0
                               WHEN kind IN ('doc', 'docx') THEN 1 ELSE 2 END,
                          title COLLATE NOCASE",
            )
            .map_err(e)?
            .query_map(params![pid, JOINED_COLLECTION], |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?, r.get(4)?)))
            .map_err(e)?
            .collect::<Result<_, _>>()
            .map_err(e)?;
        let mut sections: Vec<Section> = Vec::new();
        let mut kept: Vec<String> = Vec::new();
        // (former text, ordinal where its part starts)
        let mut starts: Vec<(i64, i64)> = Vec::new();
        let mut tags: Vec<String> = Vec::new();
        for (did, title, kind, dtags, joined) in &docs {
            let text: String = tx
                .query_row(
                    "SELECT group_concat(text, char(10) || char(10)) FROM (SELECT text FROM sections WHERE doc_id = ?1 ORDER BY ordinal)",
                    [did],
                    |r| r.get::<_, Option<String>>(0),
                )
                .map_err(e)?
                .unwrap_or_default();
            let text = if kind == "pdf" { crate::extract::pdf_markdown(&text) } else { text.trim().to_string() };
            let words = bare(&text);
            if words.is_empty() || kept.iter().any(|k| k.contains(&words)) {
                done.repeated += 1;
                starts.push((*did, sections.len().saturating_sub(1) as i64));
                continue;
            }
            kept.push(words);
            for t in dtags.split(',').map(str::trim).filter(|t| !t.is_empty()) {
                if !tags.iter().any(|x| x.eq_ignore_ascii_case(t)) {
                    tags.push(t.to_string());
                }
            }
            starts.push((*did, sections.len() as i64));
            if *joined {
                // joined before: its parts stay as they are
                let old: Vec<Section> = tx
                    .prepare("SELECT heading, text FROM sections WHERE doc_id = ?1 ORDER BY ordinal")
                    .map_err(e)?
                    .query_map([did], |r| Ok(Section { heading: r.get(0)?, text: r.get(1)? }))
                    .map_err(e)?
                    .collect::<Result<_, _>>()
                    .map_err(e)?;
                sections.extend(old);
                continue;
            }
            let mut part = text::split_sections(&format!("# {title}\n\n{text}"));
            // the contents list names each piece after its part ("v.1 · 2"),
            // unless the piece starts with a heading of its own
            for (k, s) in part.iter_mut().enumerate() {
                let own = s.text.trim_start().starts_with('#');
                if k == 0 || !own {
                    s.heading = Some(if k == 0 { title.clone() } else { format!("{title} · {}", k + 1) });
                }
            }
            sections.extend(part);
        }
        if sections.is_empty() {
            continue;
        }
        let new_id = insert_doc(
            &tx,
            &NewDoc {
                person_id: Some(*pid),
                collection: JOINED_COLLECTION.into(),
                dir: JOINED_COLLECTION.into(),
                title: name.clone(),
                date: None,
                tags: tags.join(","),
                kind: "md".into(),
                source: String::new(),
                hash: String::new(),
                sections,
                files: vec![],
            },
        )
        .map_err(e)?;
        // the record keeps a picture: the first cover, if it has none
        let has_photo: bool =
            tx.query_row("SELECT EXISTS(SELECT 1 FROM person_photos WHERE person_id = ?1)", [pid], |r| r.get(0)).map_err(e)?;
        if !has_photo {
            tx.execute(
                "INSERT OR IGNORE INTO person_photos(person_id, mime, data)
                 SELECT ?1, f.mime, f.data FROM files f JOIN docs d ON d.id = f.doc_id
                 WHERE d.person_id = ?1 AND d.deleted IS NULL AND f.role = 'cover' ORDER BY d.title LIMIT 1",
                [pid],
            )
            .map_err(e)?;
        }
        for (did, start) in starts {
            tx.execute("UPDATE bookmarks SET doc_id = ?1, ordinal = ?2 WHERE doc_id = ?3", params![new_id, start, did])
                .map_err(e)?;
            fts_sections_remove(&tx, did).map_err(e)?;
            tx.execute("DELETE FROM docs_fts WHERE rowid = ?1", [did]).map_err(e)?;
            tx.execute("UPDATE docs SET deleted = datetime('now', 'localtime') WHERE id = ?1", [did]).map_err(e)?;
            done.docs += 1;
        }
        done.persons += 1;
    }
    tx.commit().map_err(e)?;
    progress(persons.len(), persons.len());
    Ok(done)
}

/// An image file: (file name, mime type, bytes).
pub(crate) fn read_image(path: &std::path::Path) -> Res<(String, &'static str, Vec<u8>)> {
    let ext = path.extension().and_then(|x| x.to_str()).unwrap_or("").to_lowercase();
    let mime = match ext.as_str() {
        "jpg" | "jpeg" => "image/jpeg",
        "png" => "image/png",
        "webp" => "image/webp",
        "gif" => "image/gif",
        "bmp" => "image/bmp",
        "avif" => "image/avif",
        _ => return Err(format!("Formato de imagen no admitido: .{ext}")),
    };
    let data = std::fs::read(path).map_err(e)?;
    if data.len() > 25 * 1024 * 1024 {
        return Err("La imagen es demasiado grande (máx. 25 MB).".into());
    }
    let name = path.file_name().map(|n| n.to_string_lossy().to_string()).unwrap_or_default();
    Ok((name, mime, data))
}

/// Adds pictures to a record's gallery. Returns how many were added.
pub fn add_person_images(conn: &mut Connection, id: i64, paths: &[String]) -> Res<usize> {
    let tx = conn.transaction().map_err(e)?;
    for p in paths {
        let (name, mime, data) = read_image(std::path::Path::new(p))?;
        tx.execute(
            "INSERT INTO person_images(person_id, name, mime, data) VALUES(?1, ?2, ?3, ?4)",
            params![id, name, mime, data],
        )
        .map_err(e)?;
    }
    tx.execute("UPDATE persons SET modified = datetime('now', 'localtime') WHERE id = ?1", [id]).map_err(e)?;
    tx.commit().map_err(e)?;
    Ok(paths.len())
}

pub fn remove_person_image(conn: &Connection, image_id: i64) -> Res<()> {
    conn.execute("DELETE FROM person_images WHERE id = ?1", [image_id]).map_err(e)?;
    let _ = conn.execute_batch("PRAGMA incremental_vacuum;");
    Ok(())
}

/// Makes a gallery picture the record's main one (the old main one goes to the gallery).
pub fn image_as_photo(conn: &mut Connection, image_id: i64) -> Res<()> {
    let tx = conn.transaction().map_err(e)?;
    let (pid, mime, data): (i64, String, Vec<u8>) = tx
        .query_row("SELECT person_id, mime, data FROM person_images WHERE id = ?1", [image_id], |r| {
            Ok((r.get(0)?, r.get(1)?, r.get(2)?))
        })
        .map_err(e)?;
    tx.execute(
        "INSERT INTO person_images(person_id, name, mime, data)
         SELECT person_id, 'anterior', mime, data FROM person_photos WHERE person_id = ?1",
        [pid],
    )
    .map_err(e)?;
    tx.execute("INSERT OR REPLACE INTO person_photos(person_id, mime, data) VALUES(?1, ?2, ?3)", params![pid, mime, data])
        .map_err(e)?;
    tx.execute("DELETE FROM person_images WHERE id = ?1", [image_id]).map_err(e)?;
    tx.execute("UPDATE persons SET modified = datetime('now', 'localtime') WHERE id = ?1", [pid]).map_err(e)?;
    tx.commit().map_err(e)
}

/// Picture of a record, read from an image file and kept in the database.
pub fn set_person_photo(conn: &Connection, id: i64, path: &std::path::Path) -> Res<()> {
    let (_, mime, data) = read_image(path)?;
    conn.execute(
        "INSERT OR REPLACE INTO person_photos(person_id, mime, data) VALUES (?1, ?2, ?3)",
        params![id, mime, data],
    )
    .map_err(e)?;
    conn.execute("UPDATE persons SET modified = datetime('now', 'localtime') WHERE id = ?1", [id]).map_err(e)?;
    Ok(())
}

pub fn remove_person_photo(conn: &Connection, id: i64) -> Res<()> {
    conn.execute("DELETE FROM person_photos WHERE person_id = ?1", [id]).map_err(e)?;
    conn.execute("UPDATE persons SET modified = datetime('now', 'localtime') WHERE id = ?1", [id]).map_err(e)?;
    let _ = conn.execute_batch("PRAGMA incremental_vacuum;");
    Ok(())
}

/// What a merge changes, kept before it (history kind "merge", target = the
/// record that stays) so that it can be undone: the records that go away
/// with everything of theirs, and the tree and links around them.
#[derive(Serialize, Deserialize)]
struct MergeUndo {
    into: i64,
    into_fields: PersonFields,
    into_photo: bool,
    removed: Vec<MergedAway>,
    /// person_tree rows around the records: (person, parent, pos, kind)
    tree: Vec<(i64, Option<i64>, i64, String)>,
    /// person_links rows of the records: (person, guru, kind)
    links: Vec<(i64, i64, String)>,
    /// the places of each record (format 7): (person, place, role)
    #[serde(default)]
    places: Vec<(i64, i64, String)>,
}

#[derive(Serialize, Deserialize)]
struct MergedAway {
    id: i64,
    fields: PersonFields,
    docs: Vec<i64>,
    images: Vec<i64>,
    /// its picture (mime, bytes as hex): kept by the other one or deleted
    photo: Option<(String, String)>,
    distinct: Vec<i64>,
}

fn hex(b: &[u8]) -> String {
    b.iter().map(|x| format!("{x:02x}")).collect()
}

fn unhex(s: &str) -> Vec<u8> {
    (0..s.len() / 2).filter_map(|i| u8::from_str_radix(&s[2 * i..2 * i + 2], 16).ok()).collect()
}

fn ids_of(tx: &Connection, sql: &str, id: i64) -> rusqlite::Result<Vec<i64>> {
    let mut st = tx.prepare(sql)?;
    let rows = st.query_map([id], |r| r.get(0))?;
    rows.collect()
}

fn merge_snapshot(tx: &Connection, into: i64, from: &[i64]) -> Res<MergeUndo> {
    let all: Vec<i64> = std::iter::once(into).chain(from.iter().copied().filter(|&o| o != into)).collect();
    let mut removed = Vec::new();
    for &id in &all[1..] {
        let photo: Option<(String, Vec<u8>)> = tx
            .query_row("SELECT mime, data FROM person_photos WHERE person_id = ?1", [id], |r| Ok((r.get(0)?, r.get(1)?)))
            .optional()
            .map_err(e)?;
        removed.push(MergedAway {
            id,
            fields: get_fields(tx, id).map_err(e)?,
            docs: ids_of(tx, "SELECT id FROM docs WHERE person_id = ?1", id).map_err(e)?,
            images: ids_of(tx, "SELECT id FROM person_images WHERE person_id = ?1", id).map_err(e)?,
            photo: photo.map(|(m, d)| (m, hex(&d))),
            distinct: ids_of(tx, "SELECT CASE WHEN a = ?1 THEN b ELSE a END FROM person_distinct WHERE a = ?1 OR b = ?1", id)
                .map_err(e)?,
        });
    }
    // the tree rows of the records, of their disciples and of those beside them
    let mut tree = Vec::new();
    let mut seen = std::collections::HashSet::new();
    for &id in &all {
        let parent = tree_parent(tx, id).map_err(e)?;
        let mut st = tx
            .prepare(
                "SELECT person_id, parent_id, pos, kind FROM person_tree
                 WHERE person_id = ?1 OR parent_id = ?1 OR (?2 AND parent_id IS ?3)",
            )
            .map_err(e)?;
        let rows = st
            .query_map(params![id, parent.is_some(), parent.flatten()], |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?)))
            .map_err(e)?;
        for row in rows {
            let row: (i64, Option<i64>, i64, String) = row.map_err(e)?;
            if seen.insert(row.0) {
                tree.push(row);
            }
        }
    }
    let mut links = Vec::new();
    for &id in &all {
        let mut st = tx.prepare("SELECT person_id, guru_id, kind FROM person_links WHERE person_id = ?1 OR guru_id = ?1").map_err(e)?;
        let rows = st.query_map([id], |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?))).map_err(e)?;
        for row in rows {
            let row: (i64, i64, String) = row.map_err(e)?;
            if !links.contains(&row) {
                links.push(row);
            }
        }
    }
    let mut places = Vec::new();
    for &id in &all {
        for (place, role) in crate::places::links_of(tx, id).map_err(e)? {
            places.push((id, place, role));
        }
    }
    let into_photo = tx.query_row("SELECT 1 FROM person_photos WHERE person_id = ?1", [into], |_| Ok(())).optional().map_err(e)?.is_some();
    Ok(MergeUndo { into, into_fields: get_fields(tx, into).map_err(e)?, into_photo, removed, tree, links, places })
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MergeInfo {
    pub id: i64,
    pub saved: String,
    /// the names of the records that went away
    pub names: Vec<String>,
}

/// The merges into a record that can still be undone, newest first.
pub fn list_merges(conn: &Connection, person: i64) -> Res<Vec<MergeInfo>> {
    let mut st = conn
        .prepare("SELECT id, saved, data FROM history WHERE kind = 'merge' AND target = ?1 ORDER BY id DESC")
        .map_err(e)?;
    let rows = st.query_map([person], |r| Ok((r.get::<_, i64>(0)?, r.get::<_, String>(1)?, r.get::<_, String>(2)?))).map_err(e)?;
    let mut out = Vec::new();
    for row in rows {
        let (id, saved, data) = row.map_err(e)?;
        if let Ok(m) = serde_json::from_str::<MergeUndo>(&data) {
            out.push(MergeInfo { id, saved, names: m.removed.iter().map(|r| r.fields.name.clone()).collect() });
        }
    }
    Ok(out)
}

/// Undoes a merge: the records that went away come back with their ids,
/// texts, pictures, place in the tree and links; the one that stayed goes
/// back to what it was (what it is now is kept as a version).
pub fn undo_merge(conn: &mut Connection, history_id: i64) -> Res<()> {
    let tx = conn.transaction().map_err(e)?;
    let data: String = tx
        .query_row("SELECT data FROM history WHERE id = ?1 AND kind = 'merge'", [history_id], |r| r.get(0))
        .optional()
        .map_err(e)?
        .ok_or("Esa unión ya no se puede deshacer")?;
    let m: MergeUndo = serde_json::from_str(&data).map_err(e)?;
    if get_fields(&tx, m.into).optional().map_err(e)?.is_none() {
        return Err("La ficha que se quedó ya no existe".into());
    }
    for r in &m.removed {
        let taken: bool = tx.query_row("SELECT 1 FROM persons WHERE id = ?1", [r.id], |_| Ok(())).optional().map_err(e)?.is_some();
        if taken {
            return Err(format!("Ya hay otra ficha con el número {}: no se puede deshacer", r.id));
        }
    }
    keep_person_version(&tx, m.into, true).map_err(e)?;
    for r in &m.removed {
        tx.execute("INSERT INTO persons(id, name, key) VALUES(?1, ?2, ?3)", params![r.id, r.fields.name, person_key(&r.fields.name)])
            .map_err(e)?;
        for &d in &r.docs {
            tx.execute("UPDATE docs SET person_id = ?1 WHERE id = ?2 AND person_id = ?3", params![r.id, d, m.into]).map_err(e)?;
        }
        for &i in &r.images {
            tx.execute("UPDATE person_images SET person_id = ?1 WHERE id = ?2", params![r.id, i]).map_err(e)?;
        }
        if let Some((mime, data)) = &r.photo {
            tx.execute("INSERT OR REPLACE INTO person_photos(person_id, mime, data) VALUES(?1, ?2, ?3)", params![r.id, mime, unhex(data)])
                .map_err(e)?;
        }
        for &o in &r.distinct {
            tx.execute("INSERT OR IGNORE INTO person_distinct(a, b) VALUES(?1, ?2)", params![r.id.min(o), r.id.max(o)]).map_err(e)?;
        }
        write_person(&tx, r.id, &r.fields)?;
    }
    // the picture the record that stayed took from another one goes back
    if !m.into_photo && m.removed.iter().any(|r| r.photo.is_some()) {
        tx.execute("DELETE FROM person_photos WHERE person_id = ?1", [m.into]).map_err(e)?;
    }
    // the tree and the links around them, as they were
    let mut ids: Vec<i64> = m.removed.iter().map(|r| r.id).collect();
    ids.push(m.into);
    for &id in &ids {
        if !m.tree.iter().any(|t| t.0 == id) {
            tx.execute("DELETE FROM person_tree WHERE person_id = ?1", [id]).map_err(e)?;
        }
        tx.execute("DELETE FROM person_links WHERE person_id = ?1 OR guru_id = ?1", [id]).map_err(e)?;
    }
    for (person, parent, pos, kind) in &m.tree {
        tx.execute(
            "INSERT INTO person_tree(person_id, parent_id, pos, kind) VALUES(?1, ?2, ?3, ?4)
             ON CONFLICT(person_id) DO UPDATE SET parent_id = excluded.parent_id, pos = excluded.pos, kind = excluded.kind",
            params![person, parent, pos, kind],
        )
        .map_err(e)?;
    }
    for (person, guru, kind) in &m.links {
        tx.execute("INSERT OR IGNORE INTO person_links(person_id, guru_id, kind) VALUES(?1, ?2, ?3)", params![person, guru, kind])
            .map_err(e)?;
    }
    // and the places of each one (a merge saved before format 7 has none: left as they are)
    if !m.places.is_empty() {
        for &id in &ids {
            let mine: Vec<(i64, String)> = m.places.iter().filter(|p| p.0 == id).map(|p| (p.1, p.2.clone())).collect();
            crate::places::restore_links(&tx, id, &mine).map_err(e)?;
        }
    }
    write_person(&tx, m.into, &m.into_fields)?;
    tx.execute("DELETE FROM history WHERE id = ?1", [history_id]).map_err(e)?;
    tx.commit().map_err(e)
}

pub fn merge_persons(conn: &mut Connection, into: i64, from: &[i64]) -> Res<()> {
    let tx = conn.transaction().map_err(e)?;
    keep_person_version(&tx, into, true).map_err(e)?;
    // everything needed to undo it
    let undo = merge_snapshot(&tx, into, from)?;
    let names: Vec<&str> = undo.removed.iter().map(|r| r.fields.name.as_str()).collect();
    tx.execute(
        "INSERT INTO history(kind, target, label, data) VALUES('merge', ?1, ?2, ?3)",
        params![into, names.join(", "), serde_json::to_string(&undo).map_err(e)?],
    )
    .map_err(e)?;
    let mut f = get_fields(&tx, into).map_err(e)?;
    for &other in from.iter().filter(|&&o| o != into) {
        let o = get_fields(&tx, other).map_err(e)?;
        if person_key(&o.name) != person_key(&f.name) {
            f.aka = join_list(&f.aka, &o.name);
        }
        f.aka = join_list(&f.aka, &o.aka);
        f.guru = join_list(&f.guru, &o.guru);
        f.disciples = join_list(&f.disciples, &o.disciples);
        f.works = join_list(&f.works, &o.works);
        f.tags = join_list(&f.tags, &o.tags);
        for (mine, theirs) in [
            (&mut f.appearance, &o.appearance),
            (&mut f.disappearance, &o.disappearance),
            (&mut f.place, &o.place),
        ] {
            if mine.trim().is_empty() {
                *mine = theirs.clone();
            }
        }
        f.notes = join_text(&f.notes, &o.notes);
        tx.execute("UPDATE docs SET person_id = ?1 WHERE person_id = ?2", params![into, other]).map_err(e)?;
        // the picture of a merged record is kept only if this one has none
        tx.execute("UPDATE OR IGNORE person_photos SET person_id = ?1 WHERE person_id = ?2", params![into, other])
            .map_err(e)?;
        tx.execute("DELETE FROM person_photos WHERE person_id = ?1", [other]).map_err(e)?;
        // in the Guru Paramparā the record that stays takes the place of the
        // merged one if it has none; otherwise the merged one just leaves it
        if tree_parent(&tx, into).map_err(e)?.is_none() {
            tx.execute("UPDATE person_tree SET person_id = ?1 WHERE person_id = ?2", params![into, other]).map_err(e)?;
            tx.execute("UPDATE person_tree SET parent_id = ?1 WHERE parent_id = ?2", params![into, other]).map_err(e)?;
        } else {
            tree_remove(&tx, other).map_err(e)?;
        }
        tx.execute("UPDATE person_images SET person_id = ?1 WHERE person_id = ?2", params![into, other]).map_err(e)?;
        tx.execute("DELETE FROM person_tags WHERE person_id = ?1", [other]).map_err(e)?;
        tx.execute("DELETE FROM person_distinct WHERE a = ?1 OR b = ?1", [other]).map_err(e)?;
        // the other gurus of the merged record (and its disciples' links to it) pass to this one
        tx.execute("UPDATE OR IGNORE person_links SET person_id = ?1 WHERE person_id = ?2", params![into, other]).map_err(e)?;
        tx.execute("UPDATE OR IGNORE person_links SET guru_id = ?1 WHERE guru_id = ?2", params![into, other]).map_err(e)?;
        tx.execute("DELETE FROM person_links WHERE person_id = ?1 OR guru_id = ?1 OR person_id = guru_id", [other]).map_err(e)?;
        crate::places::merge(&tx, into, other).map_err(e)?;
        tx.execute("DELETE FROM history WHERE kind = 'person' AND target = ?1", [other]).map_err(e)?;
        tx.execute("DELETE FROM persons WHERE id = ?1", [other]).map_err(e)?;
        tx.execute("DELETE FROM persons_fts WHERE rowid = ?1", [other]).map_err(e)?;
    }
    write_person(&tx, into, &f)?;
    tx.commit().map_err(e)
}

// ---------------------------------------------------------------- guru paramparā

/// Where a record goes in the Guru Paramparā: under `parent` (None = first
/// level), before the disciple `before` (None = last).
#[derive(Deserialize, Debug, Clone, Copy)]
pub struct TreePlace {
    pub parent: Option<i64>,
    pub before: Option<i64>,
}

/// How a record in the Guru Paramparā is related to the guru above it.
/// `vani`: śikṣā por vāṇī, from an ācārya never met in life (his words,
/// his books, a vision);
/// `sannyasa` / `vesa`: the renounced order or the bābājī cloth received from him.
/// They are only values of `kind`: no change of DATA_VERSION.
/// `disciple`: the source says «disciple» without saying whether dīkṣā or śikṣā.
pub const TREE_KINDS: &[&str] = &["diksa", "siksa", "disciple", "vani", "sannyasa", "vesa", "associate"];
/// The kinds of the other lines (person_links): the same, and `family`
/// (format 9): `guru_id` is then the relative (father, uncle…) and the note
/// says how («son», «niece»). A family line never writes guru / disciples;
/// it is kept with `set_family`, apart from the gurus of `set_links`.
pub const LINK_KINDS: &[&str] = &["diksa", "siksa", "disciple", "vani", "sannyasa", "vesa", "associate", "family"];

/// The relatives of a record drawn in the tree (format 9): (relative, how:
/// «son», «niece»…). The list replaces the one there was; its other gurus
/// are not touched.
pub fn set_family(conn: &mut Connection, id: i64, relatives: &[(i64, String)]) -> Res<()> {
    let tx = conn.transaction().map_err(e)?;
    let kept: std::collections::HashMap<i64, bool> = {
        let mut st = tx.prepare("SELECT guru_id, disputed FROM person_links WHERE person_id = ?1 AND kind = 'family'").map_err(e)?;
        let rows = st.query_map([id], |r| Ok((r.get(0)?, r.get(1)?))).map_err(e)?;
        rows.collect::<rusqlite::Result<_>>().map_err(e)?
    };
    tx.execute("DELETE FROM person_links WHERE person_id = ?1 AND kind = 'family'", [id]).map_err(e)?;
    for (rel, note) in relatives {
        if *rel == id {
            continue;
        }
        // a relative who is also a guru stays a guru: that line is drawn already
        tx.execute(
            "INSERT OR IGNORE INTO person_links(person_id, guru_id, kind, note, disputed) VALUES(?1, ?2, 'family', ?3, ?4)",
            params![id, rel, note.trim(), kept.get(rel).copied().unwrap_or(false)],
        )
        .map_err(e)?;
    }
    tx.commit().map_err(e)
}

/// The group a record is drawn in (format 9): «Pañca-tattva», «Los seis
/// Gosvāmīs»… ("" = none). Only records in the tree have one.
pub fn set_tree_group(conn: &Connection, ids: &[i64], group: &str) -> Res<usize> {
    let mut n = 0;
    for id in ids {
        n += conn.execute("UPDATE person_tree SET grp = ?2 WHERE person_id = ?1", params![id, group.trim()]).map_err(e)?;
    }
    Ok(n)
}

/// A word on a line and whether the sources disagree (format 9): the line
/// of `id` to its guru in the tree (`guru` None), or to one of its other
/// gurus / relatives (`guru` Some).
pub fn set_line_info(conn: &Connection, id: i64, guru: Option<i64>, note: &str, disputed: bool) -> Res<usize> {
    let n = match guru {
        None => conn.execute("UPDATE person_tree SET note = ?2, disputed = ?3 WHERE person_id = ?1", params![id, note.trim(), disputed]),
        Some(g) => conn.execute(
            "UPDATE person_links SET note = ?3, disputed = ?4 WHERE person_id = ?1 AND guru_id = ?2",
            params![id, g, note.trim(), disputed],
        ),
    }
    .map_err(e)?;
    Ok(n)
}

/// Sets whether a record is the dīkṣā or śikṣā disciple of the guru above
/// it in the tree, or an associate (pārṣada) placed beside him.
pub fn set_tree_kind(conn: &Connection, id: i64, kind: &str) -> Res<()> {
    if !TREE_KINDS.contains(&kind) {
        return Err(format!("Tipo de relación desconocido: {kind}"));
    }
    conn.execute("UPDATE person_tree SET kind = ?2 WHERE person_id = ?1", params![id, kind]).map_err(e)?;
    Ok(())
}

/// The other gurus of a record besides its place in the tree (its śikṣā
/// gurus): the list replaces the one there was. Its own guru in the tree is
/// left out (that line is already drawn).
pub fn set_links(conn: &mut Connection, id: i64, links: &[(i64, String)]) -> Res<()> {
    let tx = conn.transaction().map_err(e)?;
    let parent = tree_parent(&tx, id).map_err(e)?.flatten();
    // the note and «disputed» of a line that stays are kept (format 9)
    let kept: std::collections::HashMap<i64, (String, bool)> = {
        let mut st = tx.prepare("SELECT guru_id, note, disputed FROM person_links WHERE person_id = ?1 AND kind <> 'family'").map_err(e)?;
        let rows = st.query_map([id], |r| Ok((r.get(0)?, (r.get(1)?, r.get(2)?)))).map_err(e)?;
        rows.collect::<rusqlite::Result<_>>().map_err(e)?
    };
    // its relatives (set_family) stay
    tx.execute("DELETE FROM person_links WHERE person_id = ?1 AND kind <> 'family'", [id]).map_err(e)?;
    for (guru, kind) in links {
        if !TREE_KINDS.contains(&kind.as_str()) {
            return Err(format!("Tipo de relación desconocido: {kind}"));
        }
        if *guru == id || Some(*guru) == parent {
            continue;
        }
        let (note, disputed) = kept.get(guru).cloned().unwrap_or_default();
        tx.execute(
            "INSERT OR REPLACE INTO person_links(person_id, guru_id, kind, note, disputed) VALUES(?1, ?2, ?3, ?4, ?5)",
            params![id, guru, kind, note, disputed],
        )
        .map_err(e)?;
    }
    tx.commit().map_err(e)?;
    // a guru not in the tree (Bipin Bihārī for Bhaktivinoda) goes in at the
    // first level, so that his line can be drawn
    for (guru, _) in links {
        if *guru != id && tree_parent(conn, *guru).map_err(e)?.is_none() {
            move_person(conn, *guru, Some(TreePlace { parent: None, before: None }))?;
        }
    }
    Ok(())
}

fn tree_parent(tx: &Connection, id: i64) -> rusqlite::Result<Option<Option<i64>>> {
    tx.query_row("SELECT parent_id FROM person_tree WHERE person_id = ?1", [id], |r| r.get(0))
        .optional()
}

fn tree_children(tx: &Connection, parent: Option<i64>) -> rusqlite::Result<Vec<i64>> {
    let mut st = tx.prepare_cached("SELECT person_id FROM person_tree WHERE parent_id IS ?1 ORDER BY pos, person_id")?;
    let rows = st.query_map([parent], |r| r.get(0))?;
    rows.collect()
}

fn tree_write(tx: &Connection, parent: Option<i64>, ids: &[i64]) -> rusqlite::Result<()> {
    for (pos, id) in ids.iter().enumerate() {
        tx.execute(
            "INSERT INTO person_tree(person_id, parent_id, pos) VALUES(?1, ?2, ?3)
             ON CONFLICT(person_id) DO UPDATE SET parent_id = excluded.parent_id, pos = excluded.pos",
            params![id, parent, pos as i64],
        )?;
    }
    Ok(())
}

/// Takes a record out of the tree; its disciples take its place under its guru.
fn tree_remove(tx: &Connection, id: i64) -> rusqlite::Result<()> {
    let Some(parent) = tree_parent(tx, id)? else { return Ok(()) };
    let kids = tree_children(tx, Some(id))?;
    let siblings: Vec<i64> = tree_children(tx, parent)?
        .into_iter()
        .flat_map(|s| if s == id { kids.clone() } else { vec![s] })
        .collect();
    tx.execute("DELETE FROM person_tree WHERE person_id = ?1", [id])?;
    tree_write(tx, parent, &siblings)
}

/// Puts a record (with its disciples) in the Guru Paramparā at `place`, or
/// takes it out (`None`: it goes back to "Other Vaiṣṇavas").
pub fn move_person(conn: &mut Connection, id: i64, place: Option<TreePlace>) -> Res<()> {
    let tx = conn.transaction().map_err(e)?;
    match place {
        None => tree_remove(&tx, id).map_err(e)?,
        Some(TreePlace { parent, before }) => {
            // a guru cannot become the disciple of his own disciple
            let mut up = parent;
            while let Some(p) = up {
                if p == id {
                    return Err("No se puede poner una ficha dentro de sus propios discípulos.".into());
                }
                up = tree_parent(&tx, p).map_err(e)?.flatten();
            }
            if let Some(p) = parent {
                if tree_parent(&tx, p).map_err(e)?.is_none() {
                    return Err("El guru no está en la Guru Paramparā.".into());
                }
            }
            let old = tree_parent(&tx, id).map_err(e)?;
            let mut siblings: Vec<i64> = tree_children(&tx, parent).map_err(e)?.into_iter().filter(|&s| s != id).collect();
            let at = before.and_then(|b| siblings.iter().position(|&s| s == b)).unwrap_or(siblings.len());
            siblings.insert(at, id);
            tree_write(&tx, parent, &siblings).map_err(e)?;
            // under another guru: the word on the old line does not belong to the new one
            if old.is_some() && old != Some(parent) {
                tx.execute("UPDATE person_tree SET note = '', disputed = 0 WHERE person_id = ?1", [id]).map_err(e)?;
            }
        }
    }
    tx.commit().map_err(e)
}

// ---------------------------------------------------------------- guru ↔ disciple in the records

/// The entries of a «guru» / «disciples» field: "A (dīkṣā); B, C".
pub(crate) fn list_entries(field: &str) -> Vec<&str> {
    field.split([';', ',', '\n']).map(str::trim).filter(|s| !s.is_empty()).collect()
}

/// An entry of a list without the relation written after it: "Rūpa
/// Gosvāmī (śikṣā)" → "Rūpa Gosvāmī"; "Govinda (disciple of Śyāmānanda)"
/// stays as it is (those brackets are part of the record's name).
pub(crate) fn without_kind(entry: &str) -> &str {
    let e = entry.trim();
    if let Some((head, last)) = e.strip_suffix(')').and_then(|s| s.rsplit_once('(')) {
        let l = fold_text(last);
        let kinds = ["siksa", "diksa", "vani", "sannyasa", "vesa", "associate", "disciple", "mantra", "instruction"];
        if l.split(' ').count() <= 4 && kinds.iter().any(|k| l.split(' ').any(|w| w == *k)) && !l.contains(" of ") {
            return head.trim();
        }
    }
    e
}

/// An entry names this record: the whole name (brackets and all) when only
/// that record has it, the same name (notes in brackets apart), or the name
/// the calendar would take for it.
fn names_record(entry: &str, id: i64, name: &str, index: &crate::calendar::PersonIndex) -> bool {
    let whole = without_kind(entry);
    if fold_text(whole) == fold_text(name) || fold_text(whole) == fold_text(&in_list(name)) || index.find_whole(whole) == Some(id) {
        return true;
    }
    // another record has exactly this whole name: then it is not this one
    if index.find_whole(whole).is_some() {
        return false;
    }
    let plain: String = entry.split('(').next().unwrap_or(entry).trim().to_string();
    fold_text(&plain) == fold_text(name) || fold_text(&plain) == fold_text(&in_list(name)) || index.find(&plain) == Some(id)
}

/// A name as written in a list field, where a comma would cut it in two:
/// "Nityānanda Prabhu, Śrīla" → "Śrīla Nityānanda Prabhu". A comma inside
/// brackets becomes «·»: "Nābhājī (Nābhādāsa, Nārāyaṇadāsa)" → "Nābhājī
/// (Nābhādāsa · Nārāyaṇadāsa)" (it used to come out turned round).
fn in_list(name: &str) -> String {
    if let Some(open) = name.find('(') {
        if name[open..].contains(',') {
            let (a, b) = name.split_at(open);
            return format!("{a}{}", b.replace(',', " ·").replace(';', " ·")).split_whitespace().collect::<Vec<_>>().join(" ");
        }
    }
    match name.rsplit_once(',') {
        Some((a, b)) => format!("{} {}", b.trim(), a.trim()).replace([',', ';'], " ").split_whitespace().collect::<Vec<_>>().join(" "),
        None => name.to_string(),
    }
}

/// Adds a name to a list field (nothing if it is there already).
fn add_entry(field: &str, entry: &str, id: i64, name: &str, index: &crate::calendar::PersonIndex) -> String {
    if list_entries(field).iter().any(|x| names_record(x, id, name, index)) {
        return field.to_string();
    }
    let field = field.trim().trim_end_matches([',', ';']).trim_end();
    if field.is_empty() {
        entry.to_string()
    } else if field.contains(';') {
        format!("{field}; {entry}")
    } else {
        format!("{field}, {entry}")
    }
}

/// Takes a name out of a list field.
fn remove_entry(field: &str, id: i64, name: &str, index: &crate::calendar::PersonIndex) -> String {
    let sep = if field.contains(';') { "; " } else { ", " };
    let kept: Vec<&str> = list_entries(field).into_iter().filter(|x| !names_record(x, id, name, index)).collect();
    if kept.len() == list_entries(field).len() {
        return field.to_string();
    }
    kept.join(sep)
}

/// Records whose guru / disciples fields are being changed: each one is read
/// once, changed in memory and written at the end (if it changed).
struct Pending {
    index: crate::calendar::PersonIndex,
    now: HashMap<i64, PersonFields>,
    was: HashMap<i64, (String, String)>,
}

impl Pending {
    fn new(conn: &Connection) -> Res<Self> {
        Ok(Pending { index: crate::calendar::PersonIndex::load(conn).map_err(e)?, now: HashMap::new(), was: HashMap::new() })
    }
    fn take(&mut self, conn: &Connection, id: i64) -> Res<PersonFields> {
        if let Some(f) = self.now.remove(&id) {
            return Ok(f);
        }
        let f = get_fields(conn, id).map_err(e)?;
        self.was.insert(id, (f.guru.clone(), f.disciples.clone()));
        Ok(f)
    }
    fn put(&mut self, id: i64, f: PersonFields) {
        self.now.insert(id, f);
    }
    /// The records that changed, by id.
    fn changed(&self) -> Vec<i64> {
        let mut ids: Vec<i64> = self.now.iter().filter(|(id, f)| self.was[id] != (f.guru.clone(), f.disciples.clone())).map(|(&id, _)| id).collect();
        ids.sort();
        ids
    }
    fn write(&self, conn: &mut Connection) -> Res<usize> {
        let ids = self.changed();
        for id in &ids {
            update_person(conn, *id, &self.now[id])?;
        }
        Ok(ids.len())
    }

    /// `disciple` is the `kind` disciple of `guru` (see `relate`).
    fn relate(&mut self, conn: &Connection, disciple: i64, guru: i64, kind: &str, old_guru: Option<i64>) -> Res<()> {
        if !LINK_KINDS.contains(&kind) {
            return Err(format!("Tipo de relación desconocido: {kind}"));
        }
        if let Some(o) = old_guru.filter(|&o| o != guru && o != disciple) {
            self.unrelate(conn, disciple, o)?;
        }
        if kind == "associate" || kind == "family" || disciple == guru {
            return Ok(());
        }
        let mut d = self.take(conn, disciple)?;
        let mut g = self.take(conn, guru)?;
        let tag = match kind {
            "siksa" => " (śikṣā)",
            "vani" => " (śikṣā through vāṇī)",
            "sannyasa" => " (sannyāsa)",
            "vesa" => " (bābājī veśa)",
            _ => "",
        };
        let label = match kind {
            "diksa" if !d.guru.trim().is_empty() => " (dīkṣā)",
            _ => tag,
        };
        d.guru = add_entry(&d.guru, &format!("{}{label}", in_list(&g.name)), guru, &g.name, &self.index);
        g.disciples = add_entry(&g.disciples, &format!("{}{tag}", in_list(&d.name)), disciple, &d.name, &self.index);
        self.put(disciple, d);
        self.put(guru, g);
        Ok(())
    }

    /// Takes `disciple` out of the disciples of `guru`, and `guru` out of
    /// the gurus of `disciple`.
    fn unrelate(&mut self, conn: &Connection, disciple: i64, guru: i64) -> Res<()> {
        if disciple == guru {
            return Ok(());
        }
        let mut d = self.take(conn, disciple)?;
        let mut g = self.take(conn, guru)?;
        g.disciples = remove_entry(&g.disciples, disciple, &d.name, &self.index);
        d.guru = remove_entry(&d.guru, guru, &g.name, &self.index);
        self.put(disciple, d);
        self.put(guru, g);
        Ok(())
    }
}

/// Writes in both records that `disciple` is the dīkṣā / śikṣā… disciple of
/// `guru` (an associate is not written as disciple), and, with `old_guru`,
/// takes away the earlier guru from both sides. Only the names change; each
/// record keeps its earlier version. Returns how many records changed.
pub fn relate(conn: &mut Connection, disciple: i64, guru: i64, kind: &str, old_guru: Option<i64>) -> Res<usize> {
    let mut p = Pending::new(conn)?;
    p.relate(conn, disciple, guru, kind, old_guru)?;
    p.write(conn)
}

/// Takes the relation between `disciple` and `guru` out of both records
/// (when a record leaves its guru in the tree). Returns how many changed.
pub fn unrelate(conn: &mut Connection, disciple: i64, guru: i64) -> Res<usize> {
    let mut p = Pending::new(conn)?;
    p.unrelate(conn, disciple, guru)?;
    p.write(conn)
}

/// A record that `sync_tree` changes, with the names it adds.
#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SyncChange {
    pub id: i64,
    pub name: String,
    pub gurus: Vec<String>,
    pub disciples: Vec<String>,
}

/// Writes in the records every relation of the Guru Paramparā (the place in
/// the tree and the other gurus) that is not there yet. Nothing is taken
/// away. With `write` false only tells what would change.
pub fn sync_tree(conn: &mut Connection, write: bool) -> Res<Vec<SyncChange>> {
    let mut pairs: Vec<(i64, i64, String)> = Vec::new();
    {
        let mut st = conn
            .prepare(
                "SELECT person_id, parent_id, kind FROM person_tree WHERE parent_id IS NOT NULL
                 UNION ALL SELECT person_id, guru_id, kind FROM person_links
                 ORDER BY 2, 1",
            )
            .map_err(e)?;
        let rows = st.query_map([], |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?))).map_err(e)?;
        for row in rows {
            pairs.push(row.map_err(e)?);
        }
    }
    let mut p = Pending::new(conn)?;
    for (d, g, kind) in &pairs {
        p.relate(conn, *d, *g, kind, None)?;
    }
    let added = |before: &str, after: &str| -> Vec<String> {
        let old = list_entries(before);
        list_entries(after).into_iter().filter(|x| !old.contains(x)).map(String::from).collect()
    };
    let out = p
        .changed()
        .into_iter()
        .map(|id| {
            let f = &p.now[&id];
            let (g0, d0) = &p.was[&id];
            SyncChange { id, name: f.name.clone(), gurus: added(g0, &f.guru), disciples: added(d0, &f.disciples) }
        })
        .collect();
    if write {
        p.write(conn)?;
    }
    Ok(out)
}

/// The kind label written after a name in a list ("Rūpa Gosvāmī (śikṣā)"),
/// to be written the same way on the other side.
fn kind_label(entry: &str) -> &'static str {
    let l = fold_text(entry.split_once('(').map_or("", |(_, r)| r));
    if l.contains("vani") {
        " (śikṣā through vāṇī)"
    } else if l.contains("siksa") {
        " (śikṣā)"
    } else if l.contains("sannyasa") {
        " (sannyāsa)"
    } else if l.contains("vesa") {
        " (bābājī veśa)"
    } else {
        ""
    }
}

/// What one record says and the other does not ("Guru: Narottama" in
/// Viśvanātha's record, but Narottama does not list him), written in the
/// other one too: the guru gets the disciple, the disciple the guru. One
/// pair at a time (`id` the record that says it, `other` the one that does
/// not): the fields were often written by hand or by the AI and are not
/// always right, so Whisper decides each one. Only the name is added; the
/// record keeps its earlier version.
pub fn complete_back(conn: &mut Connection, id: i64, other: i64) -> Res<Vec<SyncChange>> {
    let issues = crate::check::check(conn).map_err(e)?;
    let mut p = Pending::new(conn)?;
    for i in issues
        .iter()
        .filter(|i| (i.kind == "notBackGuru" || i.kind == "notBackDisciple") && i.id == id && i.other == Some(other) && id != other)
    {
        let me = p.take(conn, i.id)?;
        let mut o = p.take(conn, other)?;
        if i.kind == "notBackGuru" {
            // my record names `other` as guru: `other` gets me as disciple
            let entry = list_entries(&me.guru).into_iter().find(|x| names_record(x, other, &o.name, &p.index)).unwrap_or("");
            o.disciples = add_entry(&o.disciples, &format!("{}{}", in_list(&me.name), kind_label(entry)), i.id, &me.name, &p.index);
        } else {
            let entry = list_entries(&me.disciples).into_iter().find(|x| names_record(x, other, &o.name, &p.index)).unwrap_or("");
            o.guru = add_entry(&o.guru, &format!("{}{}", in_list(&me.name), kind_label(entry)), i.id, &me.name, &p.index);
        }
        p.put(i.id, me);
        p.put(other, o);
    }
    let added = |before: &str, after: &str| -> Vec<String> {
        let old = list_entries(before);
        list_entries(after).into_iter().filter(|x| !old.contains(x)).map(String::from).collect()
    };
    let out = p
        .changed()
        .into_iter()
        .map(|id| {
            let f = &p.now[&id];
            let (g0, d0) = &p.was[&id];
            SyncChange { id, name: f.name.clone(), gurus: added(g0, &f.guru), disciples: added(d0, &f.disciples) }
        })
        .collect();
    p.write(conn)?;
    Ok(out)
}

/// The usual line of the Gauḍīya Guru Paramparā, starting from Śrī Caitanya
/// Mahāprabhu: (name, guru). Each name lists the spellings used in the
/// records; the first one found is taken. Names not found are skipped.
const PARAMPARA: &[(&[&str], &str)] = &[
    (&["Caitanya Mahaprabhu", "Lord Caitanya (Krsna Caitanya)"], ""),
    (&["Nityananda", "Lord Nityananda", "Nityananda Prabhu,Srila"], "Caitanya Mahaprabhu"),
    (&["Jahnava Mata", "Jahnava Devi"], "Nityananda"),
    (&["Virabhadra Gosvami", "Virabhadra"], "Nityananda"),
    (&["Advaita Acarya Prabhu", "Advaita Acarya, Sri"], "Caitanya Mahaprabhu"),
    (&["Gadadhara Pandit Gosvami"], "Caitanya Mahaprabhu"),
    (&["Srivasa Pandita"], "Caitanya Mahaprabhu"),
    (&["Svarupa Damodara", "Swarupa Damodara Goswami"], "Caitanya Mahaprabhu"),
    (&["Ramananda Raya", "Ramananda Rai"], "Caitanya Mahaprabhu"),
    (&["Haridasa Thakur"], "Caitanya Mahaprabhu"),
    (&["Rupa Gosvami", "Rupa Goswami,Srila", "Rupa"], "Caitanya Mahaprabhu"),
    (&["Sanatana Gosvami", "Sanatana"], "Caitanya Mahaprabhu"),
    (&["Raghunatha Bhatta Gosvami"], "Caitanya Mahaprabhu"),
    (&["Raghunatha Dasa Gosvami", "Raghunatha Dasa"], "Rupa Gosvami"),
    (&["Jiva Gosvami"], "Rupa Gosvami"),
    (&["Lokanatha Gosvami"], "Caitanya Mahaprabhu"),
    (&["Krsnadasa Kaviraj Gosvami"], "Raghunatha Dasa Gosvami"),
    (&["Srinivasa Acarya", "Srinivasa Acarya Thakur"], "Jiva Gosvami"),
    (&["Syamananda Prabhu"], "Jiva Gosvami"),
    (&["Narottama Dasa", "Narottama Thakur", "Narottama Dasa Adhikari"], "Krsnadasa Kaviraj Gosvami"),
    (&["Visvanatha Cakravarti", "Visvanatha Cakravarti Thakura"], "Narottama Dasa"),
    (&["Baladeva Vidyabhusana"], "Visvanatha Cakravarti"),
    (&["Jagannatha dasa babaji", "Jagannatha Dasa Babaji Maharaja"], "Baladeva Vidyabhusana"),
    (&["Bhaktivinoda Thakura", "Bhakti Vinod Thakur", "Kedarnath Datta (Bhaktivinoda Thakur)"], "Jagannatha dasa babaji"),
    (&["Gaura Kishora dasa babaji", "Gaurakisora Dasa Babaji", "Gaura Kishora babaji"], "Bhaktivinoda Thakura"),
    (&["Srila Bhakti Siddhanta Sarasvati Gosvami"], "Gaura Kishora dasa babaji"),
    (&["A.C. Bhaktivedanta Swami Prabhupada"], "Srila Bhakti Siddhanta Sarasvati Gosvami"),
    (&["Bhakti Rakshak Shridhar", "Rakshaka Sridhara Maharaja"], "Srila Bhakti Siddhanta Sarasvati Gosvami"),
    (&["Bhakti Pragyana Keshava", "Prajnana Kesava Maharaja"], "Srila Bhakti Siddhanta Sarasvati Gosvami"),
    (&["Bhakti Vedanta Narayana", "Narayana Gosvami Maharaja,Srila Bhaktivedanta"], "Bhakti Pragyana Keshava"),
    (&["Bhakti Vedanta Vamana"], "Bhakti Pragyana Keshava"),
    (&["Bhakti Pramod Puri"], "Srila Bhakti Siddhanta Sarasvati Gosvami"),
    (&["Bhakti Dayita Madhava"], "Srila Bhakti Siddhanta Sarasvati Gosvami"),
    (&["Bhakti Hridoy Bon"], "Srila Bhakti Siddhanta Sarasvati Gosvami"),
];

/// Fills the Guru Paramparā once with the usual line (only if it is empty).
pub fn seed_parampara(conn: &mut Connection) -> Res<usize> {
    let tx = conn.transaction().map_err(e)?;
    let used: i64 = tx.query_row("SELECT COUNT(*) FROM person_tree", [], |r| r.get(0)).map_err(e)?;
    if used > 0 {
        return Ok(0);
    }
    let mut found: Vec<(&str, i64)> = Vec::new();
    for (names, guru) in PARAMPARA {
        let id = names.iter().find_map(|n| {
            tx.query_row("SELECT id FROM persons WHERE name = ?1 COLLATE NOCASE ORDER BY id LIMIT 1", [n], |r| r.get::<_, i64>(0))
                .ok()
        });
        let Some(id) = id else { continue };
        if found.iter().any(|&(_, f)| f == id) {
            continue;
        }
        // the guru may be missing: then the line goes on from his own guru
        let mut g = *guru;
        let parent = loop {
            if g.is_empty() {
                break None;
            }
            if let Some(&(_, pid)) = found.iter().find(|(n, _)| *n == g) {
                break Some(pid);
            }
            g = PARAMPARA.iter().find(|(ns, _)| ns[0] == g).map(|(_, up)| *up).unwrap_or("");
        };
        let mut kids = tree_children(&tx, parent).map_err(e)?;
        kids.push(id);
        tree_write(&tx, parent, &kids).map_err(e)?;
        found.push((names[0], id));
    }
    tx.commit().map_err(e)?;
    Ok(found.len())
}

/// Finds the person whose name (or alternative name) has the same key.
pub fn find_person(tx: &Connection, key: &str) -> rusqlite::Result<Option<i64>> {
    if key.is_empty() {
        return Ok(None);
    }
    if let Some(id) = tx
        .prepare_cached("SELECT id FROM persons WHERE key = ?1 ORDER BY id LIMIT 1")?
        .query_row([key], |r| r.get(0))
        .optional()?
    {
        return Ok(Some(id));
    }
    // alternative names
    let mut st = tx.prepare_cached("SELECT id, aka FROM persons WHERE aka <> ''")?;
    let rows = st.query_map([], |r| Ok((r.get::<_, i64>(0)?, r.get::<_, String>(1)?)))?;
    for row in rows {
        let (id, aka) = row?;
        if aka.split(',').any(|a| person_key(a) == key) {
            return Ok(Some(id));
        }
    }
    Ok(None)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn a_piece_is_found_whole_not_by_its_start() {
        // two entries that begin alike: the second one is taken, and only it
        let full = "## GOVINDA\n\nHe was a disciple of Śyāmānanda Prabhu. (Premavilāsa 20)\n\n## GOVINDA\n\nHe was a disciple of Śrīnivāsa Ācārya Prabhu. (Karṇānanda 1)\n\n## GOVINDA\n\nHe was a disciple of Rasikānanda Prabhu.\n";
        let (a, b) = find_fragment(full, "## GOVINDA\n\nHe was a disciple of Śrīnivāsa Ācārya Prabhu. (Karṇānanda 1)").unwrap();
        assert_eq!(full[a..b].trim(), "## GOVINDA\n\nHe was a disciple of Śrīnivāsa Ācārya Prabhu. (Karṇānanda 1)");
        // as selected on screen (no marks): the same
        let (a, b) = find_fragment(full, "He was a disciple of Śrīnivāsa Ācārya Prabhu. (Karṇānanda 1)").unwrap();
        assert_eq!(full[a..b].trim(), "He was a disciple of Śrīnivāsa Ācārya Prabhu. (Karṇānanda 1)");
        // with a link inside: by its first and last words, still the right one
        let linked = full.replace("Śrīnivāsa Ācārya", "[[Śrīnivāsa Ācārya#ficha-5|Śrīnivāsa]]");
        let (a, b) = find_fragment(&linked, "He was a disciple of Śrīnivāsa Prabhu. (Karṇānanda 1)").unwrap();
        assert!(linked[a..b].contains("Karṇānanda") && !linked[a..b].contains("Śyāmānanda"));
    }

    #[test]
    fn a_merge_can_be_undone() {
        let mut conn = Connection::open_in_memory().unwrap();
        crate::db::init(&conn).unwrap();
        let p = |c: &mut Connection, name: &str, notes: &str| {
            new_person(c, &PersonFields { name: name.into(), notes: notes.into(), ..Default::default() }).unwrap()
        };
        let guru = p(&mut conn, "Śrī Nityānanda", "");
        let stays = p(&mut conn, "Nārāyaṇa", "1. Brother of Dāmodara.");
        let goes = p(&mut conn, "Nārāyaṇa Paṇḍit", "Of the branch of Śrī Caitanya.");
        let disciple = p(&mut conn, "Gopāla", "");
        // the one that goes is in the tree, with a disciple, a picture and a "not the same" pair
        move_person(&mut conn, guru, Some(TreePlace { parent: None, before: None })).unwrap();
        move_person(&mut conn, goes, Some(TreePlace { parent: Some(guru), before: None })).unwrap();
        move_person(&mut conn, disciple, Some(TreePlace { parent: Some(goes), before: None })).unwrap();
        conn.execute("INSERT INTO person_photos(person_id, mime, data) VALUES(?1, 'image/png', x'0102ff')", [goes]).unwrap();
        mark_distinct(&mut conn, &[goes, disciple]).unwrap();

        merge_persons(&mut conn, stays, &[goes]).unwrap();
        assert!(get_fields(&conn, goes).is_err(), "it went away");
        assert_eq!(tree_parent(&conn, disciple).unwrap(), Some(Some(stays)), "its disciple went to the one that stays");
        let merges = list_merges(&conn, stays).unwrap();
        assert_eq!(merges[0].names, vec!["Nārāyaṇa Paṇḍit".to_string()]);

        undo_merge(&mut conn, merges[0].id).unwrap();
        assert_eq!(get_fields(&conn, goes).unwrap().notes, "Of the branch of Śrī Caitanya.");
        assert_eq!(get_fields(&conn, stays).unwrap().notes, "1. Brother of Dāmodara.");
        assert_eq!(get_fields(&conn, stays).unwrap().aka, "");
        assert_eq!(tree_parent(&conn, goes).unwrap(), Some(Some(guru)));
        assert_eq!(tree_parent(&conn, disciple).unwrap(), Some(Some(goes)));
        assert_eq!(tree_parent(&conn, stays).unwrap(), None, "the one that stays was not in the tree");
        let photo: Vec<u8> = conn.query_row("SELECT data FROM person_photos WHERE person_id = ?1", [goes], |r| r.get(0)).unwrap();
        assert_eq!(photo, vec![1, 2, 255]);
        assert!(conn.query_row("SELECT 1 FROM person_photos WHERE person_id = ?1", [stays], |_| Ok(())).optional().unwrap().is_none());
        assert_eq!(list_distinct(&conn).unwrap(), vec![(goes.min(disciple), goes.max(disciple))]);
        assert!(list_merges(&conn, stays).unwrap().is_empty(), "undone only once");
    }

    #[test]
    fn relate_writes_both_records() {
        let mut conn = Connection::open_in_memory().unwrap();
        crate::db::init(&conn).unwrap();
        let p = |c: &mut Connection, name: &str, guru: &str, disciples: &str| {
            new_person(c, &PersonFields { name: name.into(), guru: guru.into(), disciples: disciples.into(), ..Default::default() }).unwrap()
        };
        let cai = p(&mut conn, "Śrī Caitanya Mahāprabhu", "", "Nityānanda, Śrī Jīva Gosvāmī");
        let rupa = p(&mut conn, "Śrī Rūpa Gosvāmī", "", "Raghunātha Dāsa Gosvāmī");
        let jiva = p(&mut conn, "Śrī Jīva Gosvāmī", "Sri Caitanya Mahaprabhu", "");
        let f = |c: &Connection, id: i64| get_fields(c, id).unwrap();

        // Jīva under Rūpa (dīkṣā), out of Mahāprabhu's list
        assert_eq!(relate(&mut conn, jiva, rupa, "diksa", Some(cai)).unwrap(), 3);
        assert_eq!(f(&conn, jiva).guru, "Śrī Rūpa Gosvāmī");
        assert_eq!(f(&conn, rupa).disciples, "Raghunātha Dāsa Gosvāmī, Śrī Jīva Gosvāmī");
        assert_eq!(f(&conn, cai).disciples, "Nityānanda");
        assert_eq!(relate(&mut conn, jiva, rupa, "diksa", None).unwrap(), 0, "not twice");

        // a second, śikṣā guru is added with its label
        relate(&mut conn, jiva, cai, "siksa", None).unwrap();
        assert_eq!(f(&conn, jiva).guru, "Śrī Rūpa Gosvāmī, Śrī Caitanya Mahāprabhu (śikṣā)");
        assert_eq!(f(&conn, cai).disciples, "Nityānanda, Śrī Jīva Gosvāmī (śikṣā)");
        // an associate is not written as disciple
        let srivasa = p(&mut conn, "Śrīvāsa Paṇḍita", "", "");
        assert_eq!(relate(&mut conn, srivasa, cai, "associate", None).unwrap(), 0);
        // sannyāsa, veśa and śikṣā por vāṇī, with their labels
        let kesava = p(&mut conn, "Keśava Bhāratī", "", "");
        relate(&mut conn, cai, kesava, "sannyasa", None).unwrap();
        assert_eq!(f(&conn, cai).guru, "Keśava Bhāratī (sannyāsa)");
        assert_eq!(f(&conn, kesava).disciples, "Śrī Caitanya Mahāprabhu (sannyāsa)");
        let visva = p(&mut conn, "Viśvanātha Cakravartī", "Rādhā-ramaṇa Cakravartī", "");
        relate(&mut conn, visva, rupa, "vani", None).unwrap();
        assert_eq!(f(&conn, visva).guru, "Rādhā-ramaṇa Cakravartī, Śrī Rūpa Gosvāmī (śikṣā through vāṇī)");
        relate(&mut conn, srivasa, rupa, "vesa", None).unwrap();
        assert_eq!(f(&conn, srivasa).guru, "Śrī Rūpa Gosvāmī (bābājī veśa)");
        assert!(set_tree_kind(&conn, rupa, "vani").is_ok() && set_tree_kind(&conn, rupa, "otro").is_err());
        // taken out again from both records
        assert_eq!(unrelate(&mut conn, cai, kesava).unwrap(), 2);
        assert_eq!(f(&conn, cai).guru, "");
        assert_eq!(f(&conn, kesava).disciples, "");
    }

    #[test]
    fn move_text_takes_a_piece_to_another_record() {
        let mut conn = Connection::open_in_memory().unwrap();
        crate::db::init(&conn).unwrap();
        let p = |c: &mut Connection, name: &str| new_person(c, &PersonFields { name: name.into(), ..Default::default() }).unwrap();
        let hari = p(&mut conn, "Haridāsa");
        let other = p(&mut conn, "Haridāsa Ācārya");
        let doc = create_doc(&mut conn, Some(hari), "Haridāsa", "Biografías").unwrap();
        let text = "## HARIDĀSA
He was a disciple of Śyāmānanda Prabhu.

## HARIDĀSA
He was the son of **Nṛsiṁha**, the chief of [Brāhmaṇa-kūla](x).
He passed away on the eleventh lunar day.

## HARIDĀSA
A resident of Orissa.
";
        save_section(&mut conn, doc, 0, text).unwrap();
        // as selected on screen: no Markdown marks
        let sel = "HARIDĀSA He was the son of Nṛsiṁha, the chief of Brāhmaṇa-kūla. He passed away on the eleventh lunar day.";
        let new = move_text(&mut conn, doc, sel, other, "Haridāsa Ācārya").unwrap();
        let body = |id: i64| -> String {
            conn.query_row("SELECT group_concat(text, '') FROM sections WHERE doc_id = ?1", [id], |r| r.get(0)).unwrap()
        };
        assert_eq!(body(new), "## HARIDĀSA
He was the son of **Nṛsiṁha**, the chief of [Brāhmaṇa-kūla](x).
He passed away on the eleventh lunar day.");
        assert!(body(doc).contains("Śyāmānanda") && body(doc).contains("Orissa") && !body(doc).contains("Nṛsiṁha"));
        let owner: i64 = conn.query_row("SELECT person_id FROM docs WHERE id = ?1", [new], |r| r.get(0)).unwrap();
        assert_eq!(owner, other);
        assert!(move_text(&mut conn, doc, "words that are not there", other, "x").is_err());
        // a short piece (7 to 11 words): its first and last six words overlap
        let new = move_text(&mut conn, doc, "HARIDĀSA He was a disciple of Śyāmānanda Prabhu.", other, "x").unwrap();
        let short: String = conn.query_row("SELECT group_concat(text, '') FROM sections WHERE doc_id = ?1", [new], |r| r.get(0)).unwrap();
        assert_eq!(short, "## HARIDĀSA\nHe was a disciple of Śyāmānanda Prabhu.");
    }

    #[test]
    fn sync_tree_writes_the_tree_in_the_records() {
        let mut conn = Connection::open_in_memory().unwrap();
        crate::db::init(&conn).unwrap();
        let p = |c: &mut Connection, name: &str, disciples: &str| new_person(c, &PersonFields { name: name.into(), disciples: disciples.into(), ..Default::default() }).unwrap();
        let bs = p(&mut conn, "Bhaktisiddhānta Sarasvatī", "Bhakti Rakṣaka Śrīdhara");
        let sridhara = p(&mut conn, "Bhakti Rakṣaka Śrīdhara", "");
        let kesava = p(&mut conn, "Bhakti Prajñāna Keśava", "");
        let bv = p(&mut conn, "Bhaktivinoda Ṭhākura", "");
        move_person(&mut conn, bs, Some(TreePlace { parent: None, before: None })).unwrap();
        move_person(&mut conn, bv, Some(TreePlace { parent: None, before: None })).unwrap();
        move_person(&mut conn, sridhara, Some(TreePlace { parent: Some(bs), before: None })).unwrap();
        move_person(&mut conn, kesava, Some(TreePlace { parent: Some(bs), before: None })).unwrap();
        set_links(&mut conn, bs, &[(bv, "siksa".into())]).unwrap();

        // first only what would change: nothing is written
        let plan = sync_tree(&mut conn, false).unwrap();
        let of = |id: i64| plan.iter().find(|c| c.id == id).unwrap();
        assert_eq!(of(bs).disciples, ["Bhakti Prajñāna Keśava"], "Śrīdhara was there already");
        assert_eq!(of(bs).gurus, ["Bhaktivinoda Ṭhākura (śikṣā)"]);
        assert_eq!(of(kesava).gurus, ["Bhaktisiddhānta Sarasvatī"]);
        assert_eq!(get_fields(&conn, kesava).unwrap().guru, "");
        // then written, and a second time there is nothing left to do
        assert_eq!(sync_tree(&mut conn, true).unwrap().len(), 4);
        assert_eq!(get_fields(&conn, bs).unwrap().disciples, "Bhakti Rakṣaka Śrīdhara, Bhakti Prajñāna Keśava");
        assert_eq!(get_fields(&conn, bv).unwrap().disciples, "Bhaktisiddhānta Sarasvatī (śikṣā)");
        assert!(sync_tree(&mut conn, true).unwrap().is_empty());

        // a name with a comma is turned round, so that the list keeps it whole
        let nit = p(&mut conn, "Nityānanda Prabhu, Śrīla", "");
        relate(&mut conn, nit, bs, "diksa", None).unwrap();
        assert!(get_fields(&conn, bs).unwrap().disciples.ends_with(", Śrīla Nityānanda Prabhu"));
        assert_eq!(relate(&mut conn, nit, bs, "diksa", None).unwrap(), 0, "found again by its name");
    }

    #[test]
    fn parampara() {
        let mut conn = Connection::open_in_memory().unwrap();
        crate::db::init(&conn).unwrap();
        let tx = conn.transaction().unwrap();
        let [cai, rupa, jiva, sanatana, x] = ["Caitanya Mahaprabhu", "Rupa", "Jiva Gosvami", "Sanatana Gosvami", "Zz Prueba"]
            .map(|n| create_person(&tx, n).unwrap());
        tx.commit().unwrap();
        assert_eq!(seed_parampara(&mut conn).unwrap(), 4);
        assert_eq!(seed_parampara(&mut conn).unwrap(), 0, "only once");
        let kids = |c: &Connection, p: Option<i64>| tree_children(c, p).unwrap();
        assert_eq!(kids(&conn, None), vec![cai]);
        assert_eq!(kids(&conn, Some(cai)), vec![rupa, sanatana]);
        assert_eq!(kids(&conn, Some(rupa)), vec![jiva]);
        let list = crate::search::list_persons(&conn).unwrap();
        assert_eq!(list.iter().filter(|p| p.tree.is_some()).count(), 4);
        assert_eq!(list.iter().find(|p| p.id == jiva).unwrap().tree.as_ref().unwrap().parent, Some(rupa));
        // reorder, add, and refuse a guru under his own disciple
        move_person(&mut conn, sanatana, Some(TreePlace { parent: Some(cai), before: Some(rupa) })).unwrap();
        assert_eq!(kids(&conn, Some(cai)), vec![sanatana, rupa]);
        // kind of relation: dīkṣā by default, kept when the record moves
        let kind = |c: &Connection, id: i64| crate::search::list_persons(c).unwrap().into_iter().find(|p| p.id == id).unwrap().tree.unwrap().kind;
        assert_eq!(kind(&conn, rupa), "diksa");
        set_tree_kind(&conn, rupa, "associate").unwrap();
        assert!(set_tree_kind(&conn, rupa, "otro").is_err());
        move_person(&mut conn, rupa, Some(TreePlace { parent: Some(cai), before: None })).unwrap();
        assert_eq!(kind(&conn, rupa), "associate");
        set_tree_kind(&conn, rupa, "diksa").unwrap();
        move_person(&mut conn, x, Some(TreePlace { parent: Some(jiva), before: None })).unwrap();
        assert!(move_person(&mut conn, rupa, Some(TreePlace { parent: Some(x), before: None })).is_err());
        // taking Rupa out: his disciples take his place
        move_person(&mut conn, rupa, None).unwrap();
        assert_eq!(kids(&conn, Some(cai)), vec![sanatana, jiva]);
        assert_eq!(kids(&conn, Some(jiva)), vec![x]);
        // merging Jiva (in the tree) into Rupa (not in it): Rupa takes his place
        merge_persons(&mut conn, rupa, &[jiva]).unwrap();
        assert_eq!(kids(&conn, Some(cai)), vec![sanatana, rupa]);
        assert_eq!(kids(&conn, Some(rupa)), vec![x]);
        // merging a guru into his disciple: no loops
        merge_persons(&mut conn, x, &[rupa]).unwrap();
        assert_eq!(kids(&conn, Some(cai)), vec![sanatana, x]);
        delete_person(&mut conn, cai).unwrap();
        assert_eq!(kids(&conn, None), vec![sanatana, x]);
    }

    #[test]
    fn more_gurus() {
        let mut conn = Connection::open_in_memory().unwrap();
        crate::db::init(&conn).unwrap();
        let tx = conn.transaction().unwrap();
        let [kesava, prabhupada, vamana, narayana, twin] =
            ["Kesava Maharaja", "Prabhupada", "Vamana Maharaja", "Narayana Maharaja", "Svami Prabhupada"].map(|n| create_person(&tx, n).unwrap());
        tx.commit().unwrap();
        for id in [kesava, prabhupada] {
            move_person(&mut conn, id, Some(TreePlace { parent: None, before: None })).unwrap();
        }
        move_person(&mut conn, narayana, Some(TreePlace { parent: Some(kesava), before: None })).unwrap();
        let links = |c: &Connection, id: i64| -> Vec<(i64, String)> {
            let list = crate::search::list_persons(c).unwrap();
            list.into_iter().find(|p| p.id == id).unwrap().links.into_iter().map(|l| (l.guru, l.kind)).collect()
        };
        // his guru in the tree is not repeated; the list replaces the one there was
        let s = |k: &str| k.to_string();
        set_links(&mut conn, narayana, &[(kesava, s("siksa")), (twin, s("siksa")), (vamana, s("associate"))]).unwrap();
        assert_eq!(links(&conn, narayana), vec![(twin, s("siksa")), (vamana, s("associate"))]);
        assert!(set_links(&mut conn, narayana, &[(twin, s("otro"))]).is_err());
        // merging the twin into Prabhupada: the link passes to Prabhupada
        merge_persons(&mut conn, prabhupada, &[twin]).unwrap();
        assert_eq!(links(&conn, narayana), vec![(prabhupada, s("siksa")), (vamana, s("associate"))]);
        // a deleted guru leaves no line behind
        delete_person(&mut conn, vamana).unwrap();
        assert_eq!(links(&conn, narayana), vec![(prabhupada, s("siksa"))]);
    }

    #[test]
    fn group_note_disputed_family() {
        let mut conn = Connection::open_in_memory().unwrap();
        crate::db::init(&conn).unwrap();
        let tx = conn.transaction().unwrap();
        let [isvara, cai, nitai, virabhadra, madhava] =
            ["Īśvara Purī", "Caitanya", "Nityānanda", "Vīrabhadra", "Mādhava"].map(|n| create_person(&tx, n).unwrap());
        tx.commit().unwrap();
        move_person(&mut conn, isvara, Some(TreePlace { parent: None, before: None })).unwrap();
        move_person(&mut conn, madhava, Some(TreePlace { parent: None, before: None })).unwrap();
        move_person(&mut conn, cai, Some(TreePlace { parent: Some(isvara), before: None })).unwrap();
        move_person(&mut conn, nitai, Some(TreePlace { parent: Some(madhava), before: None })).unwrap();
        move_person(&mut conn, virabhadra, Some(TreePlace { parent: Some(nitai), before: None })).unwrap();
        let get = |c: &Connection, id: i64| crate::search::list_persons(c).unwrap().into_iter().find(|p| p.id == id).unwrap();
        let s = |k: &str| k.to_string();
        // the group and the word on the line to its guru
        assert_eq!(set_tree_group(&conn, &[cai, nitai], "Pañca-tattva").unwrap(), 2);
        set_line_info(&conn, cai, None, "Gayā 1508", false).unwrap();
        set_line_info(&conn, nitai, None, "according to the Gauḍīya Maṭha", true).unwrap();
        let t = get(&conn, cai).tree.unwrap();
        assert_eq!((t.group.as_str(), t.note.as_str(), t.disputed), ("Pañca-tattva", "Gayā 1508", false));
        // family lines: apart from the gurus, never written as guru
        set_links(&mut conn, virabhadra, &[(cai, "siksa".into())]).unwrap();
        set_line_info(&conn, virabhadra, Some(cai), "", true).unwrap();
        set_family(&mut conn, virabhadra, &[(madhava, "grandson".into())]).unwrap();
        assert!(set_tree_kind(&conn, virabhadra, "family").is_err());
        assert!(set_links(&mut conn, virabhadra, &[(madhava, "family".into())]).is_err());
        let lines = |c: &Connection| {
            let mut v = get(c, virabhadra).links.iter().map(|x| (x.guru, x.kind.clone(), x.note.clone(), x.disputed)).collect::<Vec<_>>();
            v.sort();
            v
        };
        assert_eq!(lines(&conn), vec![(cai, s("siksa"), s(""), true), (madhava, s("family"), s("grandson"), false)]);
        // the gurus written again (from its record): the relatives and the words stay
        set_links(&mut conn, virabhadra, &[(cai, "siksa".into())]).unwrap();
        assert_eq!(lines(&conn), vec![(cai, s("siksa"), s(""), true), (madhava, s("family"), s("grandson"), false)]);
        set_family(&mut conn, virabhadra, &[]).unwrap();
        assert_eq!(lines(&conn), vec![(cai, s("siksa"), s(""), true)]);
        assert_eq!(relate(&mut conn, virabhadra, madhava, "family", None).unwrap(), 0);
        // moved under another guru: the word of the old line goes; the group stays
        move_person(&mut conn, nitai, Some(TreePlace { parent: Some(isvara), before: None })).unwrap();
        let t = get(&conn, nitai).tree.unwrap();
        assert_eq!((t.group.as_str(), t.note.as_str(), t.disputed), ("Pañca-tattva", "", false));
        // reordered under the same guru: the word stays
        move_person(&mut conn, cai, Some(TreePlace { parent: Some(isvara), before: Some(nitai) })).unwrap();
        assert_eq!(get(&conn, cai).tree.unwrap().note, "Gayā 1508");
    }

    #[test]
    fn versions() {
        let mut conn = Connection::open_in_memory().unwrap();
        crate::db::init(&conn).unwrap();
        let p = new_person(&mut conn, &PersonFields { name: "Jiva Gosvami".into(), ..Default::default() }).unwrap();
        let d = create_doc(&mut conn, Some(p), "Jiva", "c").unwrap();
        save_section(&mut conn, d, 0, "first text").unwrap();
        // a second save right after keeps no new version (same sitting)
        save_section(&mut conn, d, 0, "second text").unwrap();
        let v = list_versions(&conn, "doc", d).unwrap();
        assert_eq!(v.len(), 1, "only the state before the sitting");
        assert!(v[0].data.contains("\"text\":\"\""), "the empty new text");
        // older than the gap: the next save keeps a version again
        conn.execute("UPDATE history SET saved = datetime('now', 'localtime', '-1 hour')", []).unwrap();
        save_section(&mut conn, d, 0, "third text").unwrap();
        let v = list_versions(&conn, "doc", d).unwrap();
        assert_eq!(v.len(), 2);
        assert!(v[0].data.contains("second text"));
        restore_version(&mut conn, v[0].id).unwrap();
        let body = crate::search::full_text(&conn, d).unwrap();
        assert!(body.contains("second text"), "{body}");
        // going back is itself undoable
        assert!(list_versions(&conn, "doc", d).unwrap()[0].data.contains("third text"));

        let mut f = get_fields(&conn, p).unwrap();
        f.guru = "Rupa Gosvami".into();
        update_person(&mut conn, p, &f).unwrap();
        let v = list_versions(&conn, "person", p).unwrap();
        assert_eq!(v.len(), 1);
        restore_version(&mut conn, v[0].id).unwrap();
        assert_eq!(get_fields(&conn, p).unwrap().guru, "");

        trash_doc(&mut conn, d).unwrap();
        let last = list_versions(&conn, "doc", d).unwrap()[0].id;
        assert!(restore_version(&mut conn, last).is_err(), "in the bin");
        purge_docs(&mut conn, &[d]).unwrap();
        assert!(list_versions(&conn, "doc", d).unwrap().is_empty(), "deleted for good with the text");
        delete_person(&mut conn, p).unwrap();
        assert!(list_versions(&conn, "person", p).unwrap().is_empty());

        // emptying them all
        let d2 = create_doc(&mut conn, None, "Otro", "c").unwrap();
        save_section(&mut conn, d2, 0, "uno").unwrap();
        assert!(versions_size(&conn).unwrap().0 > 0);
        clear_versions(&mut conn).unwrap();
        assert_eq!(versions_size(&conn).unwrap(), (0, 0));
        assert!(crate::search::full_text(&conn, d2).unwrap().contains("uno"), "the text stays");
    }

    #[test]
    fn trash_a_folder() {
        let mut conn = Connection::open_in_memory().unwrap();
        crate::db::init(&conn).unwrap();
        let a = create_doc(&mut conn, None, "A", "Bhajans").unwrap();
        let b = create_doc(&mut conn, None, "B", "Bhajans").unwrap();
        let c = create_doc(&mut conn, None, "C", "Bhajans 2").unwrap();
        conn.execute("UPDATE docs SET dir = 'Bhajans/Sub' WHERE id = ?1", [b]).unwrap();
        assert_eq!(trash_folder(&mut conn, "Bhajans").unwrap(), 2);
        let live: Vec<i64> = crate::search::list_docs(&conn).unwrap().into_iter().map(|d| d.id).collect();
        assert_eq!(live, vec![c], "only the other collection stays (not a mere prefix)");
        restore_doc(&mut conn, a).unwrap();
        assert_eq!(crate::search::list_docs(&conn).unwrap().len(), 2, "back from the bin");
    }

    #[test]
    fn keys() {
        assert_eq!(person_key("Abhirama Thakura"), person_key("Abhirama Thakur"));
        assert_eq!(person_key("Sri Jiva Goswami"), person_key("Jiva Gosvami"));
        assert_eq!(person_key("Lochana dasa"), person_key("Locana Das"));
        assert_ne!(person_key("Rupa Gosvami"), person_key("Rupa"));
    }

    #[test]
    fn photos() {
        let mut conn = Connection::open_in_memory().unwrap();
        crate::db::init(&conn).unwrap();
        let tx = conn.transaction().unwrap();
        let a = create_person(&tx, "Rupa Gosvami").unwrap();
        let b = create_person(&tx, "Sri Rupa").unwrap();
        tx.commit().unwrap();
        let dir = std::env::temp_dir().join(format!("bio-photo-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        let img = dir.join("rupa.PNG");
        std::fs::write(&img, b"\x89PNG fake").unwrap();
        assert!(set_person_photo(&conn, a, &dir.join("rupa.txt")).is_err(), "not an image");
        set_person_photo(&conn, b, &img).unwrap();
        assert_eq!(crate::search::get_photo(&conn, b).unwrap().unwrap().0, "image/png");
        // merging moves the picture to a record that has none
        merge_persons(&mut conn, a, &[b]).unwrap();
        assert!(crate::search::get_photo(&conn, a).unwrap().is_some());
        assert!(crate::search::get_person(&conn, a).unwrap().has_photo);
        remove_person_photo(&conn, a).unwrap();
        assert!(crate::search::get_photo(&conn, a).unwrap().is_none());
        set_person_photo(&conn, a, &img).unwrap();
        // gallery: a picture becomes the main one, the old main one goes to the gallery
        add_person_images(&mut conn, a, &[img.to_string_lossy().to_string()]).unwrap();
        let person = crate::search::get_person(&conn, a).unwrap();
        assert_eq!(person.images.len(), 1);
        image_as_photo(&mut conn, person.images[0]).unwrap();
        assert_eq!(crate::search::get_person(&conn, a).unwrap().images.len(), 1, "the previous one");
        // labels
        let mut f = get_fields(&conn, a).unwrap();
        f.tags = "Vrndavana, Gosvami, vrndavana".into();
        update_person(&mut conn, a, &f).unwrap();
        assert_eq!(get_fields(&conn, a).unwrap().tags, "Gosvami, Vrndavana", "no repeats, in order");
        assert_eq!(list_tags(&conn).unwrap().len(), 2);
        assert_eq!(crate::search::search_persons(&conn, "gosvami").unwrap(), vec![a], "labels are searched");
        delete_person(&mut conn, a).unwrap();
        for t in ["person_photos", "person_images", "person_tags"] {
            let n: i64 = conn.query_row(&format!("SELECT COUNT(*) FROM {t}"), [], |r| r.get(0)).unwrap();
            assert_eq!(n, 0, "{t} deleted with the record");
        }
        let _ = std::fs::remove_dir_all(dir);
    }

    #[test]
    fn edit_and_merge() {
        let mut conn = Connection::open_in_memory().unwrap();
        crate::db::init(&conn).unwrap();
        let tx = conn.transaction().unwrap();
        let a = create_person(&tx, "Jiva Gosvami").unwrap();
        let b = create_person(&tx, "Sri Jiva").unwrap();
        tx.commit().unwrap();
        let d = create_doc(&mut conn, Some(b), "Jiva - v.1", "Calibre").unwrap();
        save_section(&mut conn, d, 0, "Śrī Jīva Gosvāmī wrote the Ṣaṭ-sandarbha.").unwrap();
        let n: i64 = conn
            .query_row("SELECT COUNT(*) FROM sections_fts WHERE sections_fts MATCH 'sandarbha'", [], |r| r.get(0))
            .unwrap();
        assert_eq!(n, 1);

        merge_persons(&mut conn, a, &[b]).unwrap();
        let (pid, aka): (i64, String) = conn
            .query_row("SELECT d.person_id, p.aka FROM docs d JOIN persons p ON p.id = d.person_id", [], |r| {
                Ok((r.get(0)?, r.get(1)?))
            })
            .unwrap();
        assert_eq!((pid, aka.as_str()), (a, "Sri Jiva"));
        assert_eq!(find_person(&conn, &person_key("Jiva")).unwrap(), Some(a), "found by alternative name");

        trash_doc(&mut conn, d).unwrap();
        let n: i64 = conn.query_row("SELECT COUNT(*) FROM docs_fts WHERE docs_fts MATCH 'jiva'", [], |r| r.get(0)).unwrap();
        assert_eq!(n, 0);
        restore_doc(&mut conn, d).unwrap();
        trash_doc(&mut conn, d).unwrap();
        purge_docs(&mut conn, &[d]).unwrap();
        let n: i64 = conn.query_row("SELECT COUNT(*) FROM sections", [], |r| r.get(0)).unwrap();
        assert_eq!(n, 0);
    }
}



