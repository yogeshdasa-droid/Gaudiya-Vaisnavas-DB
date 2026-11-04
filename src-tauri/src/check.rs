//! Looks over the records for things that do not fit: gurus and disciples
//! that the two records (or the tree) tell differently, dates that cannot be,
//! and fields that are pieces of a book rather than a name. Only reads.

use crate::calendar::{year_of, PersonIndex};
use rusqlite::Connection;
use serde::Serialize;
use std::collections::{HashMap, HashSet};

/// One thing to look at in a record. `kind` tells which (the text is written
/// by the interface from `a` and `b`); `other` is the other record, if any.
#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Issue {
    pub kind: &'static str,
    pub id: i64,
    pub name: String,
    pub in_tree: bool,
    pub a: String,
    pub b: String,
    pub other: Option<i64>,
}

/// The kinds, in the order they are shown.
pub const KINDS: &[&str] = &[
    "oddName", "oddGuru", "selfGuru", "treeGuru", "missingGuru", "missingDisciple", "noOverlap", "diedBefore", "tooLong",
    "sameDates", "unknownGuru", "notBackGuru", "notBackDisciple",
];

struct Rec {
    name: String,
    appearance: String,
    disappearance: String,
    guru: String,
    in_tree: bool,
    parent: Option<i64>,
    kind: String,
    born: Option<i32>,
    died: Option<i32>,
    gurus: Vec<i64>,
    disciples: Vec<i64>,
}

/// The entries of a guru / disciples field, like `store::list_entries` but
/// without cutting at the commas inside brackets: "A (dīkṣā in 1927 at X,
/// Calcutta); B" → ["A (dīkṣā in 1927 at X, Calcutta)", "B"].
fn list_entries(field: &str) -> Vec<&str> {
    let mut out = Vec::new();
    let (mut depth, mut start) = (0i32, 0);
    for (i, c) in field.char_indices() {
        match c {
            '(' => depth += 1,
            ')' => depth = (depth - 1).max(0),
            ',' | ';' | '\n' if depth == 0 => {
                out.push(&field[start..i]);
                start = i + c.len_utf8();
            }
            _ => {}
        }
    }
    out.push(&field[start..]);
    out.into_iter().map(str::trim).filter(|s| !s.is_empty()).collect()
}

/// The name in a list entry: "Rūpa Gosvāmī (śikṣā)" → "Rūpa Gosvāmī".
fn plain(entry: &str) -> &str {
    let p = entry.split('(').next().unwrap_or(entry).trim();
    p.strip_prefix("and ").or_else(|| p.strip_prefix("y ")).unwrap_or(p).trim()
}

/// A record name or a guru that looks like a piece of text, not a name.
fn odd_name(name: &str) -> bool {
    let n = name.trim();
    let first = n.chars().next().unwrap_or('A');
    n.chars().count() > 70
        || n.ends_with(':')
        || n.ends_with('.') && !n.ends_with(" Jr.") && n.split_whitespace().count() > 2
        || n.ends_with("’s")
        || n.ends_with("'s")
        || first.is_lowercase()
        || ["He ", "She ", "The ", "His ", "In "].iter().any(|w| n.starts_with(w))
}

pub fn check(conn: &Connection) -> rusqlite::Result<Vec<Issue>> {
    let index = PersonIndex::load(conn)?;
    let mut recs: HashMap<i64, Rec> = HashMap::new();
    {
        let mut st = conn.prepare(
            "SELECT p.id, p.name, p.appearance, p.disappearance, p.guru, p.disciples, t.parent_id, t.kind, t.person_id IS NOT NULL
             FROM persons p LEFT JOIN person_tree t ON t.person_id = p.id",
        )?;
        let rows = st.query_map([], |r| {
            Ok((
                r.get::<_, i64>(0)?,
                r.get::<_, String>(1)?,
                r.get::<_, String>(2)?,
                r.get::<_, String>(3)?,
                r.get::<_, String>(4)?,
                r.get::<_, String>(5)?,
                r.get::<_, Option<i64>>(6)?,
                r.get::<_, Option<String>>(7)?,
                r.get::<_, bool>(8)?,
            ))
        })?;
        for row in rows {
            let (id, name, appearance, disappearance, guru, disciples, parent, kind, in_tree) = row?;
            let find = |field: &str| -> Vec<i64> {
                let mut ids: Vec<i64> = list_entries(field).into_iter().filter_map(|x| index.find(plain(x))).collect();
                ids.dedup();
                ids
            };
            let born = year_of(&appearance);
            let died = year_of(&disappearance);
            recs.insert(
                id,
                Rec {
                    gurus: find(&guru),
                    disciples: find(&disciples),
                    name,
                    appearance,
                    disappearance,
                    guru,
                    in_tree,
                    parent,
                    kind: kind.unwrap_or_default(),
                    born,
                    died,
                },
            );
        }
    }
    let mut links: HashMap<i64, Vec<(i64, String)>> = HashMap::new();
    {
        // family lines (format 9) are not guru and disciple
        let mut st = conn.prepare("SELECT person_id, guru_id, kind FROM person_links WHERE kind <> 'family'")?;
        for row in st.query_map([], |r| Ok((r.get::<_, i64>(0)?, r.get::<_, i64>(1)?, r.get::<_, String>(2)?)))? {
            let (p, g, k) = row?;
            links.entry(p).or_default().push((g, k));
        }
    }

    let mut out = Vec::new();
    let mut ids: Vec<i64> = recs.keys().copied().collect();
    ids.sort();
    for &id in &ids {
        let p = &recs[&id];
        let mut push = |kind: &'static str, in_tree: bool, a: String, b: String, other: Option<i64>| {
            out.push(Issue { kind, id, name: p.name.clone(), in_tree, a, b, other });
        };
        let name_of = |x: i64| recs.get(&x).map(|r| r.name.clone()).unwrap_or_default();
        let my_links: Vec<i64> = links.get(&id).map(|l| l.iter().map(|(g, _)| *g).collect()).unwrap_or_default();
        let tied = |g: i64| p.parent == Some(g) || my_links.contains(&g);

        // its own name among its gurus
        if p.gurus.contains(&id) {
            push("selfGuru", p.in_tree, p.guru.clone(), String::new(), None);
        }
        // the tree and the record say different gurus
        if let Some(g) = p.parent {
            if p.kind != "associate" && !p.gurus.is_empty() && !p.gurus.contains(&g) && !p.guru.trim().is_empty() {
                push("treeGuru", true, name_of(g), p.guru.clone(), Some(g));
            }
        }
        if p.in_tree {
            // a guru written in the record, in the tree, but not joined to it there
            for &g in &p.gurus {
                if g != id && recs.get(&g).is_some_and(|r| r.in_tree) && !tied(g) {
                    push("missingGuru", true, name_of(g), String::new(), Some(g));
                }
            }
            // a disciple written in the record, in the tree, but not under it there
            for &d in &p.disciples {
                let joined = recs.get(&d).is_some_and(|r| r.parent == Some(id)) || links.get(&d).is_some_and(|l| l.iter().any(|(g, _)| *g == id));
                if d != id && recs.get(&d).is_some_and(|r| r.in_tree) && !joined {
                    push("missingDisciple", true, name_of(d), String::new(), Some(d));
                }
            }
            // gurus that are no record at all
            for x in list_entries(&p.guru) {
                let n = plain(x);
                let looks_like_name = n.chars().next().is_some_and(char::is_uppercase) && (n.contains(' ') || n.chars().count() >= 8);
                if looks_like_name && n.chars().count() <= 60 && !n.chars().any(|c| c.is_ascii_digit()) && index.find(n).is_none() {
                    push("unknownGuru", true, n.to_string(), String::new(), None);
                }
            }
        }
        // one record says it, the other does not (only where the tree is concerned)
        for &g in &p.gurus {
            if let Some(r) = recs.get(&g) {
                if g != id && (p.in_tree || r.in_tree) && !r.disciples.contains(&id) {
                    push("notBackGuru", true, r.name.clone(), String::new(), Some(g));
                }
            }
        }
        for &d in &p.disciples {
            if let Some(r) = recs.get(&d) {
                if d != id && (p.in_tree || r.in_tree) && !r.gurus.contains(&id) {
                    push("notBackDisciple", true, r.name.clone(), String::new(), Some(d));
                }
            }
        }
        // guru and disciple whose lives do not meet (except śikṣā por vāṇī and associates)
        let relations = p.parent.map(|g| (g, p.kind.clone())).into_iter().chain(links.get(&id).cloned().unwrap_or_default());
        for (g, kind) in relations {
            if kind == "vani" || kind == "associate" {
                continue;
            }
            if let Some(r) = recs.get(&g) {
                let apart = matches!((r.died, p.born), (Some(gd), Some(db)) if gd + 2 < db) || matches!((p.died, r.born), (Some(dd), Some(gb)) if dd + 2 < gb);
                if apart {
                    let years = |x: &Rec| format!("{}–{}", x.born.map_or("?".into(), |y| y.to_string()), x.died.map_or("?".into(), |y| y.to_string()));
                    push("noOverlap", true, r.name.clone(), format!("{} · {}", years(r), years(p)), Some(g));
                }
            }
        }
        // dates
        if let (Some(b), Some(d)) = (p.born, p.died) {
            if d < b {
                push("diedBefore", p.in_tree, p.appearance.clone(), p.disappearance.clone(), None);
            } else if d - b > 120 {
                push("tooLong", p.in_tree, p.appearance.clone(), p.disappearance.clone(), None);
            }
        }
        if !p.appearance.trim().is_empty() && p.appearance.trim() == p.disappearance.trim() {
            push("sameDates", p.in_tree, p.appearance.clone(), String::new(), None);
        }
        // pieces of text instead of names
        if odd_name(&p.name) {
            push("oddName", p.in_tree, p.name.clone(), String::new(), None);
        }
        for x in list_entries(&p.guru) {
            if plain(x).chars().count() > 70 || plain(x).contains(':') {
                push("oddGuru", p.in_tree, x.to_string(), String::new(), None);
            }
        }
    }
    let order = |k: &str| KINDS.iter().position(|x| *x == k).unwrap_or(KINDS.len());
    out.sort_by(|x, y| order(x.kind).cmp(&order(y.kind)).then_with(|| x.name.cmp(&y.name)));
    // the same thing told twice (two entries for one record) once
    let mut seen = HashSet::new();
    out.retain(|i| seen.insert((i.kind, i.id, i.a.clone())));
    Ok(out)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::store::{move_person, new_person, PersonFields, TreePlace};

    #[test]
    fn finds_what_does_not_fit() {
        let mut conn = Connection::open_in_memory().unwrap();
        crate::db::init(&conn).unwrap();
        let p = |c: &mut Connection, name: &str, app: &str, dis: &str, guru: &str, disciples: &str| {
            new_person(
                c,
                &PersonFields {
                    name: name.into(),
                    appearance: app.into(),
                    disappearance: dis.into(),
                    guru: guru.into(),
                    disciples: disciples.into(),
                    ..Default::default()
                },
            )
            .unwrap()
        };
        let narottama = p(&mut conn, "Narottama Dāsa Ṭhākura", "1534", "1611", "Lokanātha Gosvāmī", "");
        let visva = p(&mut conn, "Viśvanātha Cakravartī", "1626", "1708", "Narottama Dāsa Ṭhākura", "");
        let lok = p(&mut conn, "Lokanātha Gosvāmī", "1500", "1500", "", "Narottama Dāsa Ṭhākura");
        let odd = p(&mut conn, "He translated Līlāmṛta-rāsa-pūra.", "1700", "1650", "Bipin Bihārī Gosvāmī", "");
        let root = Some(TreePlace { parent: None, before: None });
        move_person(&mut conn, narottama, root).unwrap();
        move_person(&mut conn, visva, Some(TreePlace { parent: Some(narottama), before: None })).unwrap();
        move_person(&mut conn, lok, root).unwrap();
        move_person(&mut conn, odd, Some(TreePlace { parent: Some(visva), before: None })).unwrap();

        let issues = check(&conn).unwrap();
        let has = |kind: &str, id: i64| issues.iter().any(|i| i.kind == kind && i.id == id);
        assert!(has("missingGuru", narottama), "Lokanātha is his guru but not joined in the tree");
        assert!(has("notBackGuru", visva), "Narottama's record does not list him");
        assert!(has("noOverlap", visva), "Narottama left before he was born (dīkṣā)");
        assert!(has("sameDates", lok));
        assert!(has("diedBefore", odd) && has("oddName", odd) && has("unknownGuru", odd));
        assert!(!has("notBackDisciple", lok), "Lokanātha lists Narottama, who names him back");
        assert_eq!(list_entries("A (dīkṣā in 1927 at X, Calcutta); B, C"), ["A (dīkṣā in 1927 at X, Calcutta)", "B", "C"]);

        // as śikṣā por vāṇī their lives need not meet
        crate::store::set_tree_kind(&conn, visva, "vani").unwrap();
        assert!(!check(&conn).unwrap().iter().any(|i| i.kind == "noOverlap" && i.id == visva));
    }
}
