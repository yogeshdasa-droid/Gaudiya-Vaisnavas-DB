//! The Panorama: what each record has (to see what is missing), its years,
//! its lunar days, place and works — read once for all the views.

use crate::calendar::{parse_day, year_of};
use rusqlite::Connection;
use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OverviewPerson {
    pub id: i64,
    pub name: String,
    pub tree: bool,
    pub born: Option<i32>,
    pub died: Option<i32>,
    /// (month 0–12, tithi 1–30) of the appearance / disappearance day
    pub appearance_day: Option<(u8, u8)>,
    pub disappearance_day: Option<(u8, u8)>,
    pub has_appearance: bool,
    pub has_disappearance: bool,
    pub has_guru: bool,
    pub has_disciples: bool,
    pub has_place: bool,
    pub has_works: bool,
    pub has_notes: bool,
    pub has_photo: bool,
    pub docs: i64,
    pub place: String,
    pub works: String,
}

pub fn overview(conn: &Connection) -> rusqlite::Result<Vec<OverviewPerson>> {
    // the user's calendar knows the day of many more records: it wins
    let mut from_calendar: std::collections::HashMap<(i64, &str), (u8, u8)> = std::collections::HashMap::new();
    for pd in crate::calendar::person_days(conn)? {
        let mut parts = pd.date.split('-').map(|x| x.parse::<u32>().unwrap_or(0));
        if let (Some(y), Some(m), Some(d)) = (parts.next(), parts.next(), parts.next()) {
            if let Some(l) = crate::calendar::day(y as i32, m, d).first() {
                from_calendar.entry((pd.person_id, pd.kind)).or_insert((l.month, l.tithi));
            }
        }
    }
    let mut st = conn.prepare(
        "SELECT p.id, p.name, p.appearance, p.disappearance, p.guru, p.disciples, p.place, p.works, p.notes,
                EXISTS(SELECT 1 FROM person_tree t WHERE t.person_id = p.id),
                EXISTS(SELECT 1 FROM person_photos ph WHERE ph.person_id = p.id),
                (SELECT COUNT(*) FROM docs d WHERE d.person_id = p.id AND d.deleted IS NULL)
         FROM persons p ORDER BY p.name COLLATE NOCASE",
    )?;
    let rows = st.query_map([], |r| {
        let s = |i| r.get::<_, String>(i);
        let (app, dis) = (s(2)?, s(3)?);
        let born = year_of(&app);
        // as in the timeline: a passing before the birth is a misreading
        let died = year_of(&dis).filter(|d| born.map_or(true, |b| *d >= b && *d - b <= 130));
        let id: i64 = r.get(0)?;
        let day = |kind: &str, t: &str| from_calendar.get(&(id, kind)).copied().or_else(|| parse_day(t).map(|d| (d.month, d.tithi)));
        Ok(OverviewPerson {
            id,
            name: s(1)?,
            tree: r.get(9)?,
            born,
            died,
            appearance_day: day("appearance", &app),
            disappearance_day: day("disappearance", &dis),
            has_appearance: !app.trim().is_empty(),
            has_disappearance: !dis.trim().is_empty(),
            has_guru: !s(4)?.trim().is_empty(),
            has_disciples: !s(5)?.trim().is_empty(),
            has_place: !s(6)?.trim().is_empty(),
            has_works: !s(7)?.trim().is_empty(),
            has_notes: !s(8)?.trim().is_empty(),
            has_photo: r.get(10)?,
            docs: r.get(11)?,
            place: s(6)?,
            works: s(7)?,
        })
    })?;
    rows.collect()
}
