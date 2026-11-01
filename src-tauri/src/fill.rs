//! «Rellenar fichas»: proposals for the empty fields of the records, which
//! the user accepts or discards one by one. They come from the imported
//! calendar (appearance / disappearance days), from the disciples written in
//! the records of the Guru Paramparā (their guru), and later from other
//! sources. They live in their own file next to the database
//! ("biodata-propuestas.db"): a discarded proposal is remembered there and
//! never comes back. Nothing is written to a record until it is accepted, and
//! then only into an empty field.

use crate::calendar::{self, PersonIndex};
use crate::store::{self, TreePlace};
use rusqlite::{params, Connection, OptionalExtension};
use serde::Serialize;
use std::path::{Path, PathBuf};
use std::time::Duration;

type Res<T> = Result<T, String>;

fn e(x: impl std::fmt::Display) -> String {
    x.to_string()
}

/// The fields a proposal can fill.
pub const FIELDS: &[&str] = &["appearance", "disappearance", "place", "guru", "disciples", "works", "notes"];

pub fn proposals_path(db_path: &Path) -> PathBuf {
    let stem = db_path.file_stem().and_then(|s| s.to_str()).unwrap_or("biodata");
    db_path.with_file_name(format!("{stem}-propuestas.db"))
}

pub fn open(db_path: &Path) -> Res<Connection> {
    let conn = Connection::open(proposals_path(db_path)).map_err(e)?;
    conn.busy_timeout(Duration::from_secs(30)).map_err(e)?;
    init(&conn)?;
    Ok(conn)
}

fn init(conn: &Connection) -> Res<()> {
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS proposals(
             id INTEGER PRIMARY KEY,
             person_id INTEGER NOT NULL,
             field TEXT NOT NULL,
             value TEXT NOT NULL,
             source TEXT NOT NULL,            -- calendar | disciples | ai
             evidence TEXT NOT NULL DEFAULT '', -- where it was read
             guru_id INTEGER,                 -- field guru: the record of the guru
             status TEXT NOT NULL DEFAULT 'new', -- new | accepted | rejected
             UNIQUE(person_id, field, value)
         );",
    )
    .map_err(e)
}

/// Adds a proposal (nothing if the same one was already made, accepted or
/// discarded). Returns whether it is new.
pub fn add(side: &Connection, person_id: i64, field: &str, value: &str, source: &str, evidence: &str, guru_id: Option<i64>) -> Res<bool> {
    let value = value.trim();
    if value.is_empty() || !FIELDS.contains(&field) {
        return Ok(false);
    }
    let n = side
        .execute(
            "INSERT OR IGNORE INTO proposals(person_id, field, value, source, evidence, guru_id) VALUES(?1, ?2, ?3, ?4, ?5, ?6)",
            params![person_id, field, value, source, evidence, guru_id],
        )
        .map_err(e)?;
    Ok(n > 0)
}

fn field_of<'a>(f: &'a mut store::PersonFields, field: &str) -> Option<&'a mut String> {
    Some(match field {
        "appearance" => &mut f.appearance,
        "disappearance" => &mut f.disappearance,
        "place" => &mut f.place,
        "guru" => &mut f.guru,
        "disciples" => &mut f.disciples,
        "works" => &mut f.works,
        "notes" => &mut f.notes,
        _ => return None,
    })
}

fn in_tree(conn: &Connection, id: i64) -> rusqlite::Result<bool> {
    conn.query_row("SELECT EXISTS(SELECT 1 FROM person_tree WHERE person_id = ?1)", [id], |r| r.get(0))
}

/// Names written in a field: "A (his son); B, C and D" → A, B, C, D.
pub(crate) fn names_in(text: &str) -> Vec<String> {
    let mut plain = String::new();
    let mut depth = 0;
    for c in text.chars() {
        match c {
            '(' | '[' => depth += 1,
            ')' | ']' => depth = (depth - 1).max(0),
            _ if depth == 0 => plain.push(c),
            _ => {}
        }
    }
    plain
        .split([';', ',', '\n'])
        .flat_map(|p| p.split(" and "))
        .map(|p| p.trim().trim_end_matches('.').trim().to_string())
        .filter(|p| p.chars().any(char::is_alphabetic) && p.split_whitespace().count() <= 7)
        .collect()
}

/// Looks for proposals in the calendar and in the disciples of the Guru
/// Paramparā. Returns how many new ones there are.
pub fn gather(conn: &Connection, side: &Connection) -> Res<usize> {
    let mut added = 0;
    // appearance / disappearance days from the imported calendar
    for d in calendar::person_days(conn).map_err(e)? {
        let Some(f) = store::get_fields(conn, d.person_id).optional().map_err(e)? else { continue };
        let current = if d.kind == "appearance" { &f.appearance } else { &f.disappearance };
        if !current.trim().is_empty() {
            continue;
        }
        let value = format!("{} (Gauḍīya calendar)", d.lunar);
        let evidence = format!("{} — {}", d.summary, d.date);
        added += add(side, d.person_id, d.kind, &value, "calendar", &evidence, None)? as usize;
    }
    // the guru of the disciples written in the records of the Paramparā
    let index = PersonIndex::load(conn).map_err(e)?;
    let gurus: Vec<(i64, String, String)> = conn
        .prepare("SELECT p.id, p.name, p.disciples FROM persons p JOIN person_tree t ON t.person_id = p.id WHERE p.disciples <> ''")
        .map_err(e)?
        .query_map([], |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)))
        .map_err(e)?
        .collect::<Result<_, _>>()
        .map_err(e)?;
    for (guru_id, guru, disciples) in gurus {
        for name in names_in(&disciples) {
            let Some(id) = index.find(&name) else { continue };
            if id == guru_id || in_tree(conn, id).map_err(e)? {
                continue;
            }
            let Some(f) = store::get_fields(conn, id).optional().map_err(e)? else { continue };
            if !f.guru.trim().is_empty() {
                continue;
            }
            let evidence = format!("{guru} — Disciples: {disciples}");
            added += add(side, id, "guru", &guru, "disciples", &evidence, Some(guru_id))? as usize;
        }
    }
    Ok(added)
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Proposal {
    pub id: i64,
    pub person_id: i64,
    pub person: String,
    pub field: String,
    pub value: String,
    pub source: String,
    pub evidence: String,
    /// field guru: the guru is in the Guru Paramparā, so the record can be put under him
    pub to_tree: bool,
}

/// The proposals still to decide, for fields that are still empty, by record.
pub fn list(conn: &Connection, side: &Connection) -> Res<Vec<Proposal>> {
    let rows: Vec<(i64, i64, String, String, String, String, Option<i64>)> = side
        .prepare("SELECT id, person_id, field, value, source, evidence, guru_id FROM proposals WHERE status = 'new' ORDER BY person_id, id")
        .map_err(e)?
        .query_map([], |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?, r.get(4)?, r.get(5)?, r.get(6)?)))
        .map_err(e)?
        .collect::<Result<_, _>>()
        .map_err(e)?;
    let mut out = Vec::new();
    for (id, person_id, field, value, source, evidence, guru_id) in rows {
        let Some(mut f) = store::get_fields(conn, person_id).optional().map_err(e)? else { continue };
        let person = f.name.clone();
        // filled meanwhile (by hand or by another proposal): nothing to do
        if field_of(&mut f, &field).map_or(true, |v| !v.trim().is_empty()) {
            continue;
        }
        let to_tree = match guru_id {
            Some(g) => in_tree(conn, g).map_err(e)? && !in_tree(conn, person_id).map_err(e)?,
            None => false,
        };
        out.push(Proposal { id, person_id, person, field, value, source, evidence, to_tree });
    }
    out.sort_by(|a, b| a.person.to_lowercase().cmp(&b.person.to_lowercase()).then(a.id.cmp(&b.id)));
    Ok(out)
}

/// Writes accepted proposals into their records (only into empty fields;
/// the record keeps its earlier version) and, for a guru in the Guru
/// Paramparā, puts the record under him. Returns how many were written.
pub fn accept(conn: &mut Connection, side: &Connection, ids: &[i64]) -> Res<usize> {
    let mut done = 0;
    for &id in ids {
        let row: Option<(i64, String, String, Option<i64>)> = side
            .query_row("SELECT person_id, field, value, guru_id FROM proposals WHERE id = ?1 AND status = 'new'", [id], |r| {
                Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?))
            })
            .optional()
            .map_err(e)?;
        let Some((person_id, field, value, guru_id)) = row else { continue };
        let Some(mut f) = store::get_fields(conn, person_id).optional().map_err(e)? else { continue };
        let Some(slot) = field_of(&mut f, &field) else { continue };
        if slot.trim().is_empty() {
            *slot = value;
            store::update_person(conn, person_id, &f)?;
            done += 1;
            if let Some(g) = guru_id {
                if in_tree(conn, g).map_err(e)? && !in_tree(conn, person_id).map_err(e)? {
                    store::move_person(conn, person_id, Some(TreePlace { parent: Some(g), before: None }))?;
                }
            }
        }
        side.execute("UPDATE proposals SET status = 'accepted' WHERE id = ?1", [id]).map_err(e)?;
    }
    Ok(done)
}

/// Discards proposals for good.
pub fn reject(side: &Connection, ids: &[i64]) -> Res<()> {
    for id in ids {
        side.execute("UPDATE proposals SET status = 'rejected' WHERE id = ?1", [id]).map_err(e)?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::store::{new_person, PersonFields};

    #[test]
    fn names() {
        assert_eq!(
            names_in("Baladeva Vidyābhūṣaṇa (close follower), Krsnadeva Sārvabhauma, Vipra Jagannātha (father of Narahari)"),
            vec!["Baladeva Vidyābhūṣaṇa", "Krsnadeva Sārvabhauma", "Vipra Jagannātha"]
        );
        assert_eq!(names_in("Narottama Dāsa Ṭhākura (his only disciple)"), vec!["Narottama Dāsa Ṭhākura"]);
        assert_eq!(names_in("Rupa and Sanatana; Jiva."), vec!["Rupa", "Sanatana", "Jiva"]);
    }

    #[test]
    fn calendar_days_read_back() {
        // what is written in the field is understood by the calendar again
        let d = calendar::day(2026, 3, 16)[0];
        let text = calendar::label(d).replace(" · ", " ");
        assert_eq!(calendar::parse_day(&format!("{text} (Gauḍīya calendar)")), Some(d), "{text}");
    }

    #[test]
    fn gather_and_decide() {
        let mut conn = Connection::open_in_memory().unwrap();
        crate::db::init(&conn).unwrap();
        let side = Connection::open_in_memory().unwrap();
        init(&side).unwrap();
        let p = |conn: &mut Connection, name: &str, disciples: &str| {
            new_person(conn, &PersonFields { name: name.into(), disciples: disciples.into(), ..Default::default() }).unwrap()
        };
        let guru = p(&mut conn, "Lokanatha Gosvami", "Narottama Dasa Thakura (his only disciple)");
        let disciple = p(&mut conn, "Narottama Dasa Thakura", "");
        let other = p(&mut conn, "Srinivasa Acarya", "");
        store::move_person(&mut conn, guru, Some(TreePlace { parent: None, before: None })).unwrap();
        conn.execute(
            "INSERT INTO calendar_events(uid, date, summary) VALUES('a', '2026-03-16', 'Tirobhāva of Śrī Śrīnivāsa Ācārya')",
            [],
        )
        .unwrap();

        assert_eq!(gather(&conn, &side).unwrap(), 2);
        assert_eq!(gather(&conn, &side).unwrap(), 0, "not twice");
        let list1 = list(&conn, &side).unwrap();
        assert_eq!(list1.len(), 2);
        let g = list1.iter().find(|x| x.field == "guru").unwrap();
        assert_eq!((g.person_id, g.value.as_str(), g.to_tree), (disciple, "Lokanatha Gosvami", true));
        let c = list1.iter().find(|x| x.field == "disappearance").unwrap();
        assert_eq!(c.person_id, other);

        assert_eq!(accept(&mut conn, &side, &[g.id]).unwrap(), 1);
        assert_eq!(store::get_fields(&conn, disciple).unwrap().guru, "Lokanatha Gosvami");
        assert!(in_tree(&conn, disciple).unwrap(), "put under his guru");
        reject(&side, &[c.id]).unwrap();
        assert!(list(&conn, &side).unwrap().is_empty());
        assert_eq!(gather(&conn, &side).unwrap(), 0, "a discarded proposal does not come back");
    }
}
