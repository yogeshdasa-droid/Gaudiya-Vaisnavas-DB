//! Satellite pictures of the map (Esri World Imagery tiles), kept on the disk
//! once seen: in "biodata-mapa.db" beside the database. Derived (it can be
//! deleted at any time and fills again while the map is used), not part of the
//! backups. Only the pictures the map shows are kept: nothing is downloaded ahead.

use rusqlite::{params, Connection, OptionalExtension};
use std::io::Read;
use std::path::{Path, PathBuf};
use std::sync::{Mutex, OnceLock};
use std::time::Duration;

const SOURCE: &str = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile";

pub fn cache_path(db_path: &Path) -> PathBuf {
    let stem = db_path.file_stem().and_then(|s| s.to_str()).unwrap_or("biodata");
    db_path.with_file_name(format!("{stem}-mapa.db"))
}

/// One connection for all the requests (they come many at a time); held only
/// to read or write, never while downloading.
static CACHE: Mutex<Option<(PathBuf, Connection)>> = Mutex::new(None);

fn with_cache<T>(db_path: &Path, f: impl FnOnce(&Connection) -> rusqlite::Result<T>) -> Option<T> {
    let mut guard = CACHE.lock().ok()?;
    let path = cache_path(db_path);
    if guard.as_ref().map_or(true, |(p, _)| *p != path) {
        let conn = Connection::open(&path).ok()?;
        conn.pragma_update(None, "journal_mode", "WAL").ok()?;
        conn.pragma_update(None, "synchronous", "NORMAL").ok()?;
        conn.busy_timeout(Duration::from_secs(5)).ok()?;
        conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS tiles(
                 z INTEGER NOT NULL, x INTEGER NOT NULL, y INTEGER NOT NULL,
                 data BLOB NOT NULL,
                 PRIMARY KEY (z, x, y)
             ) WITHOUT ROWID;",
        )
        .ok()?;
        *guard = Some((path, conn));
    }
    f(&guard.as_ref()?.1).ok()
}

fn agent() -> &'static ureq::Agent {
    static AGENT: OnceLock<ureq::Agent> = OnceLock::new();
    AGENT.get_or_init(|| {
        ureq::AgentBuilder::new()
            .timeout_connect(Duration::from_secs(5))
            .timeout_read(Duration::from_secs(20))
            .build()
    })
}

/// The kind of picture, from its first bytes.
pub fn mime_of(data: &[u8]) -> &'static str {
    if data.starts_with(b"\x89PNG") {
        "image/png"
    } else {
        "image/jpeg"
    }
}

/// The picture of tile x, y at zoom z: from the disk, or downloaded and kept.
/// None without internet (and not seen before) or for a tile that does not exist.
pub fn tile(db_path: &Path, z: u32, x: u32, y: u32) -> Option<Vec<u8>> {
    if z > 20 || x >= 1 << z || y >= 1 << z {
        return None;
    }
    let kept = with_cache(db_path, |c| {
        c.query_row("SELECT data FROM tiles WHERE z = ?1 AND x = ?2 AND y = ?3", params![z, x, y], |r| r.get::<_, Vec<u8>>(0))
            .optional()
    })
    .flatten();
    if kept.is_some() {
        return kept;
    }
    let resp = agent().get(&format!("{SOURCE}/{z}/{y}/{x}")).call().ok()?;
    if !resp.content_type().starts_with("image/") {
        return None;
    }
    let mut data = Vec::new();
    resp.into_reader().take(8 << 20).read_to_end(&mut data).ok()?;
    if data.is_empty() {
        return None;
    }
    with_cache(db_path, |c| c.execute("INSERT OR REPLACE INTO tiles(z, x, y, data) VALUES (?1, ?2, ?3, ?4)", params![z, x, y, &data]));
    Some(data)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn kept_tiles_come_from_the_disk() {
        let dir = std::env::temp_dir().join(format!("bio-tiles-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        let db = dir.join("biodata.db");
        assert_eq!(cache_path(&db), dir.join("biodata-mapa.db"));
        let png = b"\x89PNG fake".to_vec();
        with_cache(&db, |c| c.execute("INSERT INTO tiles(z, x, y, data) VALUES (3, 5, 2, ?1)", [&png])).unwrap();
        // no download: it is already there
        assert_eq!(tile(&db, 3, 5, 2), Some(png.clone()));
        assert_eq!(mime_of(&png), "image/png");
        // outside the world: nothing, and no download tried
        assert_eq!(tile(&db, 3, 8, 0), None);
        *CACHE.lock().unwrap() = None;
        let _ = std::fs::remove_dir_all(&dir);
    }
}
