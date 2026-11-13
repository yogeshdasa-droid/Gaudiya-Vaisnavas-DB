//! Holy places (format 7): where each village or town is, what there is
//! there, and the records tied to it (their śrīpāṭa, samādhi, birth…).

use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};

type Res<T> = Result<T, String>;

fn e(x: impl std::fmt::Display) -> String {
    x.to_string()
}

/// How a record is tied to a place.
pub const ROLES: &[&str] = &["sripata", "samadhi", "birth", "lived", "other"];

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct PlacePerson {
    pub person_id: i64,
    pub role: String,
}

#[derive(Serialize, Deserialize, Clone, Debug, Default, PartialEq)]
#[serde(rename_all = "camelCase", default)]
pub struct PlaceFields {
    pub name: String,
    pub aka: String,
    pub region: String,
    pub location: String,
    pub about: String,
    pub source: String,
    pub lat: Option<f64>,
    pub lon: Option<f64>,
    pub people: Vec<PlacePerson>,
    /// texts written for the place (format 10), in their order. None = leave
    /// them as they are (older callers and versions that do not know them)
    pub texts: Option<Vec<PlaceText>>,
}

/// A text written for a place: «History», «What there is to see»… (Markdown)
#[derive(Serialize, Deserialize, Clone, Debug, Default, PartialEq)]
#[serde(rename_all = "camelCase", default)]
pub struct PlaceText {
    pub title: String,
    pub body: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Place {
    pub id: i64,
    #[serde(flatten)]
    pub fields: PlaceFields,
    pub modified: String,
    /** a picture chosen for it (format 8), served at /placephoto/<id> */
    pub has_photo: bool,
    /** more pictures (format 10), served at /placeimage/<image id> */
    pub images: Vec<PlaceImage>,
}

/// A gallery picture: its number and what it shows (its caption; at first
/// the name of the file it came from).
#[derive(Serialize)]
pub struct PlaceImage {
    pub id: i64,
    pub name: String,
}

fn texts_of(conn: &Connection, id: i64) -> rusqlite::Result<Vec<PlaceText>> {
    let mut st = conn.prepare("SELECT title, body FROM place_texts WHERE place_id = ?1 ORDER BY pos, id")?;
    let rows = st.query_map([id], |r| Ok(PlaceText { title: r.get(0)?, body: r.get(1)? }))?;
    rows.collect()
}

fn images_of(conn: &Connection, id: i64) -> rusqlite::Result<Vec<PlaceImage>> {
    let mut st = conn.prepare("SELECT id, name FROM place_images WHERE place_id = ?1 ORDER BY id")?;
    let rows = st.query_map([id], |r| Ok(PlaceImage { id: r.get(0)?, name: r.get(1)? }))?;
    rows.collect()
}

fn people_of(conn: &Connection, id: i64) -> rusqlite::Result<Vec<PlacePerson>> {
    let mut st = conn.prepare(
        "SELECT person_id, role FROM place_persons WHERE place_id = ?1
         ORDER BY CASE role WHEN 'sripata' THEN 0 WHEN 'samadhi' THEN 1 WHEN 'birth' THEN 2 WHEN 'lived' THEN 3 ELSE 4 END, rowid",
    )?;
    let rows = st.query_map([id], |r| Ok(PlacePerson { person_id: r.get(0)?, role: r.get(1)? }))?;
    rows.collect()
}

fn fields_of(conn: &Connection, id: i64) -> rusqlite::Result<PlaceFields> {
    let mut f = conn.query_row(
        "SELECT name, aka, region, location, about, source, lat, lon FROM places WHERE id = ?1",
        [id],
        |r| {
            Ok(PlaceFields {
                name: r.get(0)?,
                aka: r.get(1)?,
                region: r.get(2)?,
                location: r.get(3)?,
                about: r.get(4)?,
                source: r.get(5)?,
                lat: r.get(6)?,
                lon: r.get(7)?,
                people: Vec::new(),
                texts: None,
            })
        },
    )?;
    f.people = people_of(conn, id)?;
    f.texts = Some(texts_of(conn, id)?);
    Ok(f)
}

/// All the places, by name.
pub fn list(conn: &Connection) -> Res<Vec<Place>> {
    let ids: Vec<(i64, String)> = conn
        .prepare("SELECT id, modified FROM places ORDER BY name COLLATE NOCASE")
        .map_err(e)?
        .query_map([], |r| Ok((r.get(0)?, r.get(1)?)))
        .map_err(e)?
        .collect::<Result<_, _>>()
        .map_err(e)?;
    ids.into_iter()
        .map(|(id, modified)| {
            let has_photo = conn.query_row("SELECT 1 FROM place_photos WHERE place_id = ?1", [id], |_| Ok(())).optional().map_err(e)?.is_some();
            Ok(Place { id, fields: fields_of(conn, id).map_err(e)?, modified, has_photo, images: images_of(conn, id).map_err(e)? })
        })
        .collect()
}

fn keep_place_version(tx: &Connection, id: i64) -> rusqlite::Result<()> {
    let Some(f) = fields_of(tx, id).optional()? else { return Ok(()) };
    let data = serde_json::to_string(&f).unwrap_or_default();
    crate::store::keep_version(tx, "place", id, &f.name, &data, true)
}

fn write(tx: &Connection, id: i64, f: &PlaceFields) -> Res<()> {
    let name = f.name.trim();
    if name.is_empty() {
        return Err("El lugar necesita un nombre".into());
    }
    let ok = |x: Option<f64>, max: f64| x.filter(|v| v.is_finite() && v.abs() <= max);
    tx.execute(
        "UPDATE places SET name = ?2, aka = ?3, region = ?4, location = ?5, about = ?6, source = ?7, lat = ?8, lon = ?9,
         modified = datetime('now', 'localtime') WHERE id = ?1",
        params![id, name, f.aka.trim(), f.region.trim(), f.location.trim(), f.about.trim(), f.source.trim(), ok(f.lat, 90.0), ok(f.lon, 180.0)],
    )
    .map_err(e)?;
    tx.execute("DELETE FROM place_persons WHERE place_id = ?1", [id]).map_err(e)?;
    for p in &f.people {
        let role = if ROLES.contains(&p.role.as_str()) { p.role.as_str() } else { "other" };
        // only records that exist
        tx.execute(
            "INSERT OR IGNORE INTO place_persons(place_id, person_id, role) SELECT ?1, id, ?3 FROM persons WHERE id = ?2",
            params![id, p.person_id, role],
        )
        .map_err(e)?;
    }
    if let Some(texts) = &f.texts {
        tx.execute("DELETE FROM place_texts WHERE place_id = ?1", [id]).map_err(e)?;
        let kept = texts.iter().filter(|t| !t.title.trim().is_empty() || !t.body.trim().is_empty());
        for (pos, t) in kept.enumerate() {
            tx.execute(
                "INSERT INTO place_texts(place_id, pos, title, body) VALUES(?1, ?2, ?3, ?4)",
                params![id, pos as i64, t.title.trim(), t.body.trim()],
            )
            .map_err(e)?;
        }
    }
    Ok(())
}

/// Saves a place: a new one when `id` is None. What there was is kept as a version.
pub fn save(conn: &mut Connection, id: Option<i64>, f: &PlaceFields) -> Res<i64> {
    let tx = conn.transaction().map_err(e)?;
    let id = match id {
        Some(id) => {
            if fields_of(&tx, id).optional().map_err(e)?.is_none() {
                return Err("Ese lugar ya no existe".into());
            }
            keep_place_version(&tx, id).map_err(e)?;
            id
        }
        None => {
            tx.execute("INSERT INTO places(name) VALUES(?1)", [f.name.trim()]).map_err(e)?;
            tx.last_insert_rowid()
        }
    };
    write(&tx, id, f)?;
    tx.commit().map_err(e)?;
    Ok(id)
}

/// Deletes a place. Its last state stays in the versions, so it can come back.
pub fn delete(conn: &mut Connection, id: i64) -> Res<()> {
    let tx = conn.transaction().map_err(e)?;
    keep_place_version(&tx, id).map_err(e)?;
    tx.execute("DELETE FROM place_persons WHERE place_id = ?1", [id]).map_err(e)?;
    tx.execute("DELETE FROM places WHERE id = ?1", [id]).map_err(e)?;
    tx.commit().map_err(e)
}

/// Puts back an earlier version of a place (it is created again with its
/// number if it was deleted). Called by `store::restore_version`.
pub fn restore(tx: &Connection, id: i64, data: &str) -> Res<()> {
    let f: PlaceFields = serde_json::from_str(data).map_err(e)?;
    if fields_of(tx, id).optional().map_err(e)?.is_some() {
        keep_place_version(tx, id).map_err(e)?;
    } else {
        tx.execute("INSERT INTO places(id, name) VALUES(?1, ?2)", params![id, f.name]).map_err(e)?;
    }
    write(tx, id, &f)
}

// ---- the picture of a place (format 8)

pub fn set_photo(conn: &Connection, id: i64, path: &std::path::Path) -> Res<()> {
    let (_, mime, data) = crate::store::read_image(path)?;
    conn.execute("INSERT OR REPLACE INTO place_photos(place_id, mime, data) VALUES (?1, ?2, ?3)", params![id, mime, data]).map_err(e)?;
    conn.execute("UPDATE places SET modified = datetime('now', 'localtime') WHERE id = ?1", [id]).map_err(e)?;
    Ok(())
}

pub fn remove_photo(conn: &Connection, id: i64) -> Res<()> {
    conn.execute("DELETE FROM place_photos WHERE place_id = ?1", [id]).map_err(e)?;
    conn.execute("UPDATE places SET modified = datetime('now', 'localtime') WHERE id = ?1", [id]).map_err(e)?;
    Ok(())
}

pub fn get_photo(conn: &Connection, id: i64) -> rusqlite::Result<Option<(String, Vec<u8>)>> {
    conn.query_row("SELECT mime, data FROM place_photos WHERE place_id = ?1", [id], |r| Ok((r.get(0)?, r.get(1)?))).optional()
}

// ---- more pictures of a place (format 10)

/// Adds pictures to a place's gallery. Returns how many were added.
pub fn add_images(conn: &mut Connection, id: i64, paths: &[String]) -> Res<usize> {
    let tx = conn.transaction().map_err(e)?;
    for p in paths {
        let (name, mime, data) = crate::store::read_image(std::path::Path::new(p))?;
        tx.execute("INSERT INTO place_images(place_id, name, mime, data) VALUES(?1, ?2, ?3, ?4)", params![id, name, mime, data])
            .map_err(e)?;
    }
    tx.execute("UPDATE places SET modified = datetime('now', 'localtime') WHERE id = ?1", [id]).map_err(e)?;
    tx.commit().map_err(e)?;
    Ok(paths.len())
}

pub fn remove_image(conn: &Connection, image_id: i64) -> Res<()> {
    conn.execute("DELETE FROM place_images WHERE id = ?1", [image_id]).map_err(e)?;
    let _ = conn.execute_batch("PRAGMA incremental_vacuum;");
    Ok(())
}

/// Makes a gallery picture the place's main one (the old main one goes to the gallery).
pub fn image_as_photo(conn: &mut Connection, image_id: i64) -> Res<()> {
    let tx = conn.transaction().map_err(e)?;
    let (pid, mime, data): (i64, String, Vec<u8>) = tx
        .query_row("SELECT place_id, mime, data FROM place_images WHERE id = ?1", [image_id], |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)))
        .map_err(e)?;
    tx.execute(
        "INSERT INTO place_images(place_id, name, mime, data) SELECT place_id, 'anterior', mime, data FROM place_photos WHERE place_id = ?1",
        [pid],
    )
    .map_err(e)?;
    tx.execute("INSERT OR REPLACE INTO place_photos(place_id, mime, data) VALUES(?1, ?2, ?3)", params![pid, mime, data]).map_err(e)?;
    tx.execute("DELETE FROM place_images WHERE id = ?1", [image_id]).map_err(e)?;
    tx.execute("UPDATE places SET modified = datetime('now', 'localtime') WHERE id = ?1", [pid]).map_err(e)?;
    tx.commit().map_err(e)
}

/// Changes the caption of a gallery picture.
pub fn rename_image(conn: &Connection, image_id: i64, name: &str) -> Res<()> {
    conn.execute("UPDATE place_images SET name = ?2 WHERE id = ?1", params![image_id, name.trim()]).map_err(e)?;
    Ok(())
}

/// A gallery picture of a place (served at /placeimage/<id>).
pub fn get_image(conn: &Connection, image_id: i64) -> rusqlite::Result<Option<(String, Vec<u8>)>> {
    conn.query_row("SELECT mime, data FROM place_images WHERE id = ?1", [image_id], |r| Ok((r.get(0)?, r.get(1)?))).optional()
}

// ---- what happens to the links when records are merged or deleted

/// The links of a record: (place, role).
pub fn links_of(tx: &Connection, person: i64) -> rusqlite::Result<Vec<(i64, String)>> {
    let mut st = tx.prepare("SELECT place_id, role FROM place_persons WHERE person_id = ?1")?;
    let rows = st.query_map([person], |r| Ok((r.get(0)?, r.get(1)?)))?;
    rows.collect()
}

/// A merged record's places pass to the one that stays.
pub fn merge(tx: &Connection, into: i64, other: i64) -> rusqlite::Result<()> {
    tx.execute("UPDATE OR IGNORE place_persons SET person_id = ?1 WHERE person_id = ?2", params![into, other])?;
    tx.execute("DELETE FROM place_persons WHERE person_id = ?1", [other])?;
    Ok(())
}

/// Undoing a merge: each record gets back exactly the places it had.
pub fn restore_links(tx: &Connection, person: i64, links: &[(i64, String)]) -> rusqlite::Result<()> {
    tx.execute("DELETE FROM place_persons WHERE person_id = ?1", [person])?;
    for (place, role) in links {
        tx.execute(
            "INSERT OR IGNORE INTO place_persons(place_id, person_id, role) SELECT id, ?2, ?3 FROM places WHERE id = ?1",
            params![place, person, role],
        )?;
    }
    Ok(())
}

pub fn forget_person(tx: &Connection, person: i64) -> rusqlite::Result<()> {
    tx.execute("DELETE FROM place_persons WHERE person_id = ?1", [person])?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn conn() -> Connection {
        let c = Connection::open_in_memory().unwrap();
        crate::db::init(&c).unwrap();
        c.execute_batch("INSERT INTO persons(id, name, key) VALUES(1, 'Śrīnivāsa Ācārya', 'srinivas acary'), (2, 'Dvija Haridāsa', 'dvij haridas');")
            .unwrap();
        c
    }

    fn jaji() -> PlaceFields {
        PlaceFields {
            name: "Jājigrāma".into(),
            aka: "Jajigram".into(),
            region: "Bardhamān".into(),
            location: "2 miles from Kāṭwā station".into(),
            lat: Some(23.6),
            lon: Some(88.1),
            people: vec![PlacePerson { person_id: 1, role: "sripata".into() }, PlacePerson { person_id: 99, role: "birth".into() }],
            ..Default::default()
        }
    }

    #[test]
    fn texts_and_gallery() {
        let mut c = conn();
        let mut f = jaji();
        f.texts = Some(vec![
            PlaceText { title: "History".into(), body: "Śrīnivāsa lived here.".into() },
            PlaceText { title: " ".into(), body: "".into() },
            PlaceText { title: "".into(), body: "Second text.".into() },
        ]);
        let id = save(&mut c, None, &f).unwrap();
        let texts = |c: &Connection| list(c).unwrap()[0].fields.texts.clone().unwrap();
        // the empty one is left out, the order is kept
        assert_eq!(texts(&c).iter().map(|t| t.body.as_str()).collect::<Vec<_>>(), ["Śrīnivāsa lived here.", "Second text."]);
        // a caller that does not know the texts (None) leaves them
        save(&mut c, Some(id), &jaji()).unwrap();
        assert_eq!(texts(&c).len(), 2);
        // a version brings them back
        let mut g = jaji();
        g.texts = Some(vec![]);
        save(&mut c, Some(id), &g).unwrap();
        assert!(texts(&c).is_empty());
        let data: String = c.query_row("SELECT data FROM history WHERE kind = 'place' ORDER BY id DESC LIMIT 1", [], |r| r.get(0)).unwrap();
        let tx = c.transaction().unwrap();
        restore(&tx, id, &data).unwrap();
        tx.commit().unwrap();
        assert_eq!(texts(&c).len(), 2);

        // gallery: add, make main, remove
        let dir = std::env::temp_dir().join(format!("place-img-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        let img = dir.join("a.png");
        std::fs::write(&img, b"\x89PNG\r\n\x1a\nfake").unwrap();
        let p = img.to_string_lossy().to_string();
        assert_eq!(add_images(&mut c, id, &[p.clone(), p]).unwrap(), 2);
        let imgs: Vec<i64> = list(&c).unwrap()[0].images.iter().map(|x| x.id).collect();
        assert_eq!(list(&c).unwrap()[0].images[0].name, "a.png");
        rename_image(&c, imgs[1], " Kaṅkālī-devī ").unwrap();
        assert_eq!(imgs.len(), 2);
        image_as_photo(&mut c, imgs[0]).unwrap();
        let now = &list(&c).unwrap()[0];
        assert!(now.has_photo);
        assert_eq!(now.images.len(), 1); // no main photo before: nothing went to the gallery
        assert_eq!(now.images[0].name, "Kaṅkālī-devī");
        remove_image(&c, now.images[0].id).unwrap();
        assert!(list(&c).unwrap()[0].images.is_empty());
        let _ = std::fs::remove_dir_all(dir);
    }

    #[test]
    fn save_edit_delete_restore() {
        let mut c = conn();
        let id = save(&mut c, None, &jaji()).unwrap();
        let all = list(&c).unwrap();
        assert_eq!(all.len(), 1);
        // the record that does not exist is left out
        assert_eq!(all[0].fields.people, vec![PlacePerson { person_id: 1, role: "sripata".into() }]);

        let mut f = jaji();
        f.about = "Śrīpāṭa of Śrīnivāsa Ācārya.".into();
        f.lat = Some(f64::NAN);
        save(&mut c, Some(id), &f).unwrap();
        let now = &list(&c).unwrap()[0].fields;
        assert_eq!(now.about, "Śrīpāṭa of Śrīnivāsa Ācārya.");
        assert_eq!(now.lat, None);

        delete(&mut c, id).unwrap();
        assert!(list(&c).unwrap().is_empty());
        // the last version brings it back, with its number and its people
        let v = crate::store::list_versions(&c, "place", id).unwrap();
        crate::store::restore_version(&mut c, v[0].id).unwrap();
        let back = list(&c).unwrap();
        assert_eq!(back[0].id, id);
        assert_eq!(back[0].fields.about, "Śrīpāṭa of Śrīnivāsa Ācārya.");
        assert_eq!(back[0].fields.people.len(), 1);
    }

    #[test]
    fn merge_and_undo_keep_the_places() {
        let mut c = conn();
        let mut f = jaji();
        f.people = vec![PlacePerson { person_id: 2, role: "samadhi".into() }];
        let id = save(&mut c, None, &f).unwrap();
        crate::store::merge_persons(&mut c, 1, &[2]).unwrap();
        assert_eq!(links_of(&c, 1).unwrap(), vec![(id, "samadhi".to_string())]);
        let m = crate::store::list_merges(&c, 1).unwrap();
        crate::store::undo_merge(&mut c, m[0].id).unwrap();
        assert_eq!(links_of(&c, 1).unwrap(), vec![]);
        assert_eq!(links_of(&c, 2).unwrap(), vec![(id, "samadhi".to_string())]);
        crate::store::delete_person(&mut c, 2).unwrap();
        assert!(list(&c).unwrap()[0].fields.people.is_empty());
    }
}
