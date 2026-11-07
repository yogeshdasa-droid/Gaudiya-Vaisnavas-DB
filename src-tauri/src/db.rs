//! The database IS the library: persons (biographical records), documents,
//! their text, cover images and original files all live here. Only the FTS
//! search tables are derived data and can be rebuilt from the rest.

use rusqlite::{Connection, OptionalExtension};
use std::path::Path;

/// Format of the data tables. A newer value means a newer program wrote the
/// file: it is refused instead of risking the user's data.
/// 2: + person_photos (created empty on open; nothing else changes).
/// 3: + person_tree (the Guru Paramparā; created empty on open).
/// 4: + history (earlier versions of texts and records), person_tags,
///    person_images (more pictures of a record), person_distinct,
///    calendar_events (the user's .ics calendar); all created empty on open.
/// 5: + person_tree.kind (dīkṣā / śikṣā disciple or associate; 'diksa' for
///    the records already in the tree).
/// 6: + person_links (more gurus of a record besides its place in the tree,
///    e.g. its śikṣā gurus; created empty on open).
/// 7: + places (holy places: where they are, what there is) and
///    place_persons (who has a śrīpāṭa, samādhi… there); created empty on open.
/// 8: + place_photos (the picture of a place; created empty on open).
/// 9: + person_tree.grp (the group it is drawn in: «Pañca-tattva»…),
///    person_tree.note / .disputed and person_links.note / .disputed (a word
///    on the line: «Gayā 1508»; the sources do not agree); person_links.kind
///    may be 'family' (the note says how: son, wife…). Empty for old files.
/// 10: + place_images (more pictures of a place) and place_texts (texts
///    written for a place, besides its «about»); created empty on open.
pub const DATA_VERSION: u32 = 10;
/// Bump when the folding rules or the FTS layout change: the search tables
/// are rebuilt from `sections` / `docs` / `persons` (no data is lost).
pub const FTS_VERSION: &str = "1";

const DATA_SCHEMA: &str = r#"
CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY, value TEXT NOT NULL);

-- one record per saint / devotee
CREATE TABLE IF NOT EXISTS persons(
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    key TEXT NOT NULL,              -- folded name used to match documents
    aka TEXT NOT NULL DEFAULT '',   -- other names, comma separated
    appearance TEXT NOT NULL DEFAULT '',
    disappearance TEXT NOT NULL DEFAULT '',
    place TEXT NOT NULL DEFAULT '',
    guru TEXT NOT NULL DEFAULT '',
    disciples TEXT NOT NULL DEFAULT '',
    works TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    created TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    modified TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);
CREATE INDEX IF NOT EXISTS persons_key ON persons(key);

CREATE TABLE IF NOT EXISTS docs(
    id INTEGER PRIMARY KEY,
    person_id INTEGER,              -- NULL for compilations
    collection TEXT NOT NULL,       -- where it came from (first folder of `dir`)
    dir TEXT NOT NULL,              -- virtual folder, '/' separated
    title TEXT NOT NULL,
    stem TEXT NOT NULL,             -- lowercase title, for [[wikilinks]]
    date TEXT,
    tags TEXT NOT NULL DEFAULT '',
    kind TEXT NOT NULL,             -- md, txt, pdf, docx, doc, html, new
    source TEXT NOT NULL DEFAULT '',-- original path at import time (information only)
    hash TEXT NOT NULL DEFAULT '',  -- of the original bytes: skips exact duplicates
    sections INTEGER NOT NULL DEFAULT 0,
    size INTEGER NOT NULL DEFAULT 0,-- bytes of text
    deleted TEXT,                   -- set = in the recycle bin
    created TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    modified TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);
CREATE INDEX IF NOT EXISTS docs_person ON docs(person_id);
CREATE INDEX IF NOT EXISTS docs_dir ON docs(dir);
CREATE INDEX IF NOT EXISTS docs_collection ON docs(collection);
CREATE INDEX IF NOT EXISTS docs_stem ON docs(stem);
CREATE INDEX IF NOT EXISTS docs_hash ON docs(hash);

CREATE TABLE IF NOT EXISTS sections(
    id INTEGER PRIMARY KEY,
    doc_id INTEGER NOT NULL,
    ordinal INTEGER NOT NULL,
    heading TEXT,
    text TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS sections_doc ON sections(doc_id, ordinal);

-- original PDFs / Word files and cover images, stored inside the database
CREATE TABLE IF NOT EXISTS files(
    id INTEGER PRIMARY KEY,
    doc_id INTEGER NOT NULL,
    role TEXT NOT NULL,             -- original | cover
    name TEXT NOT NULL,
    mime TEXT NOT NULL,
    data BLOB NOT NULL
);
CREATE INDEX IF NOT EXISTS files_doc ON files(doc_id, role);

CREATE TABLE IF NOT EXISTS bookmarks(
    id INTEGER PRIMARY KEY,
    doc_id INTEGER NOT NULL,
    ordinal INTEGER NOT NULL,
    title TEXT NOT NULL,
    heading TEXT,
    note TEXT NOT NULL DEFAULT '',
    created TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- picture chosen by the user for a record (format 2)
CREATE TABLE IF NOT EXISTS person_photos(
    person_id INTEGER PRIMARY KEY,
    mime TEXT NOT NULL,
    data BLOB NOT NULL
);

-- the Guru Paramparā (format 3): records in it form a tree of guru → disciples;
-- records not in it are listed under "Other Vaiṣṇavas"
CREATE TABLE IF NOT EXISTS person_tree(
    person_id INTEGER PRIMARY KEY,
    parent_id INTEGER,              -- NULL = first level
    pos INTEGER NOT NULL DEFAULT 0, -- order among the disciples of the same guru
    kind TEXT NOT NULL DEFAULT 'diksa', -- diksa | siksa | associate (format 5)
    grp TEXT NOT NULL DEFAULT '',   -- the group it is drawn in (format 9)
    note TEXT NOT NULL DEFAULT '',  -- a word on the line to its guru (format 9)
    disputed INTEGER NOT NULL DEFAULT 0 -- the sources do not agree (format 9)
);
CREATE INDEX IF NOT EXISTS person_tree_parent ON person_tree(parent_id, pos);

-- more gurus of a record (format 6), besides the one it is placed under in
-- person_tree: usually its śikṣā gurus; drawn as extra lines in the tree
CREATE TABLE IF NOT EXISTS person_links(
    person_id INTEGER NOT NULL,     -- the disciple
    guru_id INTEGER NOT NULL,
    kind TEXT NOT NULL DEFAULT 'siksa', -- store::TREE_KINDS (+ 'family', format 9)
    note TEXT NOT NULL DEFAULT '',  -- format 9
    disputed INTEGER NOT NULL DEFAULT 0, -- format 9
    PRIMARY KEY(person_id, guru_id)
);
CREATE INDEX IF NOT EXISTS person_links_guru ON person_links(guru_id);

-- earlier versions (format 4): the state of a text or a record before it was
-- changed, as JSON; kept so a change can be undone
CREATE TABLE IF NOT EXISTS history(
    id INTEGER PRIMARY KEY,
    kind TEXT NOT NULL,             -- doc | person
    target INTEGER NOT NULL,        -- docs.id / persons.id
    label TEXT NOT NULL,            -- title / name at that time
    data TEXT NOT NULL,
    saved TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);
CREATE INDEX IF NOT EXISTS history_target ON history(kind, target, id);

-- labels of a record (format 4): "Vṛndāvana", "Gosvāmī"…
CREATE TABLE IF NOT EXISTS person_tags(
    person_id INTEGER NOT NULL,
    tag TEXT NOT NULL,
    PRIMARY KEY(person_id, tag)
);
CREATE INDEX IF NOT EXISTS person_tags_tag ON person_tags(tag);

-- more pictures of a record (format 4); the main one stays in person_photos
CREATE TABLE IF NOT EXISTS person_images(
    id INTEGER PRIMARY KEY,
    person_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    mime TEXT NOT NULL,
    data BLOB NOT NULL
);
CREATE INDEX IF NOT EXISTS person_images_person ON person_images(person_id);

-- the user's Vaiṣṇava calendar, imported from an .ics file (format 4)
CREATE TABLE IF NOT EXISTS calendar_events(
    uid TEXT PRIMARY KEY,
    date TEXT NOT NULL,             -- YYYY-MM-DD
    summary TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS calendar_events_date ON calendar_events(date);

-- records with similar names the user said are different people (format 4);
-- a < b
CREATE TABLE IF NOT EXISTS person_distinct(
    a INTEGER NOT NULL,
    b INTEGER NOT NULL,
    PRIMARY KEY(a, b)
);

-- holy places (format 7): one entry per village or town, with where it is
-- and what there is there (from the Gauḍīya Vaiṣṇava Abhidhāna and others)
CREATE TABLE IF NOT EXISTS places(
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    aka TEXT NOT NULL DEFAULT '',       -- other spellings, comma separated: found in the records' "Place"
    region TEXT NOT NULL DEFAULT '',    -- district, state: "Bardhamān, West Bengal"
    location TEXT NOT NULL DEFAULT '',  -- where exactly: "2 miles from Kāṭwā station"
    about TEXT NOT NULL DEFAULT '',     -- what there is there (Markdown)
    source TEXT NOT NULL DEFAULT '',    -- where it was read
    lat REAL,                           -- for the map; NULL = not known
    lon REAL,
    created TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    modified TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- the records tied to a place (format 7): their śrīpāṭa, samādhi, birth…
CREATE TABLE IF NOT EXISTS place_persons(
    place_id INTEGER NOT NULL,
    person_id INTEGER NOT NULL,
    role TEXT NOT NULL DEFAULT 'other', -- places::ROLES
    PRIMARY KEY(place_id, person_id, role)
);
CREATE INDEX IF NOT EXISTS place_persons_person ON place_persons(person_id);

-- the picture of a place (format 8), like person_photos
CREATE TABLE IF NOT EXISTS place_photos(
    place_id INTEGER PRIMARY KEY,
    mime TEXT NOT NULL,
    data BLOB NOT NULL
);

-- more pictures of a place (format 10); the main one stays in place_photos
CREATE TABLE IF NOT EXISTS place_images(
    id INTEGER PRIMARY KEY,
    place_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    mime TEXT NOT NULL,
    data BLOB NOT NULL
);
CREATE INDEX IF NOT EXISTS place_images_place ON place_images(place_id);

-- texts written for a place (format 10), in their order
CREATE TABLE IF NOT EXISTS place_texts(
    id INTEGER PRIMARY KEY,
    place_id INTEGER NOT NULL,
    pos INTEGER NOT NULL DEFAULT 0,
    title TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS place_texts_place ON place_texts(place_id);
"#;

const FTS_SCHEMA: &str = r#"
CREATE VIRTUAL TABLE IF NOT EXISTS sections_fts USING fts5(
    heading, body,
    content='', contentless_delete=1,
    tokenize='unicode61 remove_diacritics 0', prefix='2 3'
);
CREATE VIRTUAL TABLE IF NOT EXISTS docs_fts USING fts5(
    title,
    content='', contentless_delete=1,
    tokenize='unicode61 remove_diacritics 0', prefix='2 3'
);
CREATE VIRTUAL TABLE IF NOT EXISTS persons_fts USING fts5(
    name, fields,
    content='', contentless_delete=1,
    tokenize='unicode61 remove_diacritics 0', prefix='2 3'
);
"#;

const FTS_TABLES: &[&str] = &["sections_fts", "docs_fts", "persons_fts"];

pub fn open(path: &Path) -> rusqlite::Result<Connection> {
    let conn = Connection::open(path)?;
    // only takes effect on a new file: lets "empty the recycle bin" shrink it
    conn.pragma_update(None, "auto_vacuum", "INCREMENTAL")?;
    conn.pragma_update(None, "journal_mode", "WAL")?;
    conn.pragma_update(None, "synchronous", "NORMAL")?;
    conn.pragma_update(None, "cache_size", -64000)?;
    conn.pragma_update(None, "temp_store", "MEMORY")?;
    conn.busy_timeout(std::time::Duration::from_secs(30))?;
    Ok(conn)
}

/// Prepares the database. Returns `true` when the search tables are new or
/// outdated and must be filled again with `store::rebuild_fts`.
pub fn init(conn: &Connection) -> Result<bool, String> {
    conn.execute_batch("CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY, value TEXT NOT NULL);")
        .map_err(|e| e.to_string())?;
    let stored: Option<u32> = get_meta(conn, "data").map_err(|e| e.to_string())?.and_then(|v| v.parse().ok());
    if let Some(s) = stored.filter(|s| *s > DATA_VERSION) {
        return Err(format!(
            "Esta base de datos es de una versión más nueva de Gaudiya Vaisnavas DB (formato {s}, este programa usa {DATA_VERSION}).\n\
             Abre la versión más reciente del programa."
        ));
    }
    init_schema(conn).map_err(|e| e.to_string())
}

fn init_schema(conn: &Connection) -> rusqlite::Result<bool> {
    conn.execute_batch(DATA_SCHEMA)?;
    // format 5: the tree of an older file gets the kind of each place
    let has_kind: bool = conn.query_row("SELECT COUNT(*) FROM pragma_table_info('person_tree') WHERE name = 'kind'", [], |r| r.get(0))?;
    if !has_kind {
        conn.execute_batch("ALTER TABLE person_tree ADD COLUMN kind TEXT NOT NULL DEFAULT 'diksa';")?;
    }
    // format 9: group, note and «disputed» on the lines of the tree
    for (table, col, def) in [
        ("person_tree", "grp", "TEXT NOT NULL DEFAULT ''"),
        ("person_tree", "note", "TEXT NOT NULL DEFAULT ''"),
        ("person_tree", "disputed", "INTEGER NOT NULL DEFAULT 0"),
        ("person_links", "note", "TEXT NOT NULL DEFAULT ''"),
        ("person_links", "disputed", "INTEGER NOT NULL DEFAULT 0"),
    ] {
        let has: bool =
            conn.query_row(&format!("SELECT COUNT(*) FROM pragma_table_info('{table}') WHERE name = '{col}'"), [], |r| r.get(0))?;
        if !has {
            conn.execute_batch(&format!("ALTER TABLE {table} ADD COLUMN {col} {def};"))?;
        }
    }
    set_meta(conn, "data", &DATA_VERSION.to_string())?;
    let stale = get_meta(conn, "fts")?.as_deref() != Some(FTS_VERSION);
    if stale {
        for t in FTS_TABLES {
            conn.execute_batch(&format!("DROP TABLE IF EXISTS {t};"))?;
        }
    }
    conn.execute_batch(FTS_SCHEMA)?;
    let empty = conn.query_row("SELECT NOT EXISTS(SELECT 1 FROM docs)", [], |r| r.get::<_, bool>(0))?;
    if stale && empty {
        set_meta(conn, "fts", FTS_VERSION)?;
        return Ok(false);
    }
    Ok(stale)
}

pub fn get_meta(conn: &Connection, key: &str) -> rusqlite::Result<Option<String>> {
    conn.query_row("SELECT value FROM meta WHERE key = ?1", [key], |r| r.get(0))
        .optional()
}

pub fn set_meta(conn: &Connection, key: &str, value: &str) -> rusqlite::Result<()> {
    conn.execute(
        "INSERT INTO meta(key, value) VALUES(?1, ?2)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        [key, value],
    )?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn old_tree_gets_kind() {
        // a format-4 file: person_tree without the kind column
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch(
            "CREATE TABLE person_tree(person_id INTEGER PRIMARY KEY, parent_id INTEGER, pos INTEGER NOT NULL DEFAULT 0);
             INSERT INTO person_tree VALUES(1, NULL, 0), (2, 1, 0);",
        )
        .unwrap();
        init(&conn).unwrap();
        let kinds: Vec<String> =
            conn.prepare("SELECT kind FROM person_tree ORDER BY person_id").unwrap().query_map([], |r| r.get(0)).unwrap().map(|x| x.unwrap()).collect();
        assert_eq!(kinds, ["diksa", "diksa"]);
        init(&conn).unwrap(); // a second open changes nothing
    }

    #[test]
    fn format_5_gets_links() {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch("CREATE TABLE meta(key TEXT PRIMARY KEY, value TEXT NOT NULL); INSERT INTO meta VALUES('data', '5');").unwrap();
        init(&conn).unwrap();
        let n: i64 = conn.query_row("SELECT COUNT(*) FROM person_links", [], |r| r.get(0)).unwrap();
        assert_eq!(n, 0);
        assert_eq!(get_meta(&conn, "data").unwrap().as_deref(), Some(DATA_VERSION.to_string().as_str()));
    }

    #[test]
    fn format_6_gets_places() {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch(
            "CREATE TABLE meta(key TEXT PRIMARY KEY, value TEXT NOT NULL); INSERT INTO meta VALUES('data', '6');
             CREATE TABLE persons(id INTEGER PRIMARY KEY, name TEXT NOT NULL, key TEXT NOT NULL);
             INSERT INTO persons(id, name, key) VALUES(1, 'Rūpa', 'rupa');",
        )
        .unwrap();
        init(&conn).unwrap();
        let n: i64 = conn.query_row("SELECT COUNT(*) FROM places", [], |r| r.get(0)).unwrap();
        assert_eq!(n, 0);
        let kept: String = conn.query_row("SELECT name FROM persons WHERE id = 1", [], |r| r.get(0)).unwrap();
        assert_eq!(kept, "Rūpa");
        assert_eq!(get_meta(&conn, "data").unwrap().as_deref(), Some(DATA_VERSION.to_string().as_str()));
    }

    #[test]
    fn format_7_gets_place_photos() {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch("CREATE TABLE meta(key TEXT PRIMARY KEY, value TEXT NOT NULL); INSERT INTO meta VALUES('data', '7');").unwrap();
        init(&conn).unwrap();
        let n: i64 = conn.query_row("SELECT COUNT(*) FROM place_photos", [], |r| r.get(0)).unwrap();
        assert_eq!(n, 0);
        assert_eq!(get_meta(&conn, "data").unwrap().as_deref(), Some(DATA_VERSION.to_string().as_str()));
    }

    #[test]
    fn format_9_gets_place_images_and_texts() {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch("CREATE TABLE meta(key TEXT PRIMARY KEY, value TEXT NOT NULL); INSERT INTO meta VALUES('data', '9');").unwrap();
        init(&conn).unwrap();
        for t in ["place_images", "place_texts"] {
            let n: i64 = conn.query_row(&format!("SELECT COUNT(*) FROM {t}"), [], |r| r.get(0)).unwrap();
            assert_eq!(n, 0);
        }
        assert_eq!(get_meta(&conn, "data").unwrap().as_deref(), Some("10"));
    }

    #[test]
    fn format_8_tree_gets_group_note_disputed() {
        // a format-8 file: the tree and the links without the new columns
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch(
            "CREATE TABLE meta(key TEXT PRIMARY KEY, value TEXT NOT NULL); INSERT INTO meta VALUES('data', '8');
             CREATE TABLE person_tree(person_id INTEGER PRIMARY KEY, parent_id INTEGER, pos INTEGER NOT NULL DEFAULT 0, kind TEXT NOT NULL DEFAULT 'diksa');
             CREATE TABLE person_links(person_id INTEGER NOT NULL, guru_id INTEGER NOT NULL, kind TEXT NOT NULL DEFAULT 'siksa', PRIMARY KEY(person_id, guru_id));
             INSERT INTO person_tree VALUES(1, NULL, 0, 'diksa'), (2, 1, 0, 'siksa');
             INSERT INTO person_links VALUES(2, 3, 'siksa');",
        )
        .unwrap();
        init(&conn).unwrap();
        let (g, n, d): (String, String, i64) =
            conn.query_row("SELECT grp, note, disputed FROM person_tree WHERE person_id = 2", [], |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?))).unwrap();
        assert_eq!((g.as_str(), n.as_str(), d), ("", "", 0));
        let (k, n, d): (String, String, i64) =
            conn.query_row("SELECT kind, note, disputed FROM person_links", [], |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?))).unwrap();
        assert_eq!((k.as_str(), n.as_str(), d), ("siksa", "", 0));
        assert_eq!(get_meta(&conn, "data").unwrap().as_deref(), Some(DATA_VERSION.to_string().as_str()));
        init(&conn).unwrap(); // a second open changes nothing
    }
}
