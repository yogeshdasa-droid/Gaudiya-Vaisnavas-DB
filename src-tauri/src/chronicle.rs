//! Chronologies in the library (the Vaiṣṇava Digdarśanī): texts made of
//! dated entries like "1534 AD / 1456 S' Jaiṣṭha--Gadādhara Paṇḍita Gosvāmī
//! passes away". They are read from the text each time (nothing is copied):
//! a date corrected in the text is corrected everywhere. The entries go to
//! the timeline, and births and passings become proposals for the empty
//! dates of the records (Ajustes › Rellenar fichas).

use crate::calendar::PersonIndex;
use crate::fill;
use crate::fold::fold_text;
use crate::store;
use regex::Regex;
use rusqlite::{Connection, OptionalExtension};
use serde::Serialize;
use std::collections::HashMap;
use std::sync::OnceLock;

type Res<T> = Result<T, String>;

fn e(x: impl std::fmt::Display) -> String {
    x.to_string()
}

/// A text is a chronology when it has at least this many dated entries.
const MIN_ENTRIES: usize = 20;
/// letters of an entry kept for the timeline
const SUMMARY: usize = 180;

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Entry {
    pub year: i32,
    pub saka: Option<i32>,
    /// lunar month / day written before the event ("Jaiṣṭha", "Vaiśākha Pūrṇimā")
    pub lunar: String,
    pub text: String,
    /// birth | death | other
    pub kind: &'static str,
    pub person_id: Option<i64>,
    pub person: Option<String>,
    pub doc_id: i64,
    pub ordinal: i64,
}

fn re(cell: &'static OnceLock<Regex>, pattern: &str) -> &'static Regex {
    cell.get_or_init(|| Regex::new(pattern).unwrap())
}

/// "1534 AD / 1456 S'" (also "1458-1463 AD/ 1380-1385 S'")
fn head_ad() -> &'static Regex {
    static R: OnceLock<Regex> = OnceLock::new();
    re(&R, r"(?:^|[\s*\])])(\d{3,4})(?:\s*[-–]\s*\d{2,4})?\s*AD\s*/\s*(?:(\d{3,4})(?:\s*[-–]\s*\d{2,4})?\s*S\b\s*['’]?)?")
}

/// "1455 S Pansi Sukhla Tritaya (1533 AD)."
fn head_saka() -> &'static Regex {
    static R: OnceLock<Regex> = OnceLock::new();
    re(&R, r"(\d{4})\s*S\b\s*([^()\n]{0,45}?)\s*\(\s*(\d{4})\s*AD\s*\)\.?")
}

fn stop() -> &'static Regex {
    static R: OnceLock<Regex> = OnceLock::new();
    re(&R, r"(?i)\bCHAPTER\b|\bPART\s+(?:ONE|TWO|THREE)\b|\n#+ |\*{5,}")
}

/// The dated entries of a text: (year AD, Śaka year, lunar day, event text).
pub fn entries_of(text: &str) -> Vec<(i32, Option<i32>, String, String)> {
    let mut heads: Vec<(usize, usize, i32, Option<i32>, String)> = Vec::new();
    for c in head_ad().captures_iter(text) {
        let m = c.get(0).unwrap();
        let ad: i32 = c[1].parse().unwrap_or(0);
        let saka = c.get(2).and_then(|s| s.as_str().parse().ok());
        heads.push((m.start(), m.end(), ad, saka, String::new()));
    }
    for c in head_saka().captures_iter(text) {
        let m = c.get(0).unwrap();
        heads.push((m.start(), m.end(), c[3].parse().unwrap_or(0), c[1].parse().ok(), c[2].trim().to_string()));
    }
    heads.sort_by_key(|h| h.0);
    let mut out = Vec::new();
    let mut prev: Option<i32> = None;
    for (i, (_, end, ad, saka, lunar)) in heads.iter().enumerate() {
        let next = heads.get(i + 1).map_or(text.len(), |h| h.0);
        if next <= *end {
            continue;
        }
        let mut body = &text[*end..next];
        if let Some(m) = stop().find(body) {
            body = &body[..m.start()];
        }
        let body = body.split_whitespace().collect::<Vec<_>>().join(" ");
        let body = body.trim_matches(|c: char| c == '-' || c == '.' || c == ',' || c.is_whitespace());
        // "Jaiṣṭha--Gadādhara…" / "Vaisak amāvasyā - birth of…": the lunar day comes first
        let (mut lunar, mut body) = (lunar.clone(), body.to_string());
        if lunar.is_empty() {
            for sep in ["--", " - ", "—"] {
                if let Some(at) = body.find(sep).filter(|&a| a > 0 && a <= 45) {
                    lunar = body[..at].trim().trim_end_matches(',').to_string();
                    body = body[at + sep.len()..].trim().to_string();
                    break;
                }
            }
        }
        if body.chars().filter(|c| c.is_alphabetic()).count() < 6 {
            continue;
        }
        // the book has a few slips in one of the two years ("1574 AD / 1469 S'",
        // "1426 S (1540 AD)"): the one closer to the entries before it wins
        let year = match saka {
            Some(s) if (*ad - (s + 78)).abs() > 2 && *s > 900 => match prev {
                Some(p) if (*ad - p).abs() <= (s + 78 - p).abs() => *ad,
                _ if prev.is_none() => *ad,
                _ => s + 78,
            },
            _ => *ad,
        };
        if !(1000..=2100).contains(&year) {
            continue;
        }
        prev = Some(year);
        out.push((year, *saka, lunar, body));
    }
    out
}

fn birth() -> &'static Regex {
    static R: OnceLock<Regex> = OnceLock::new();
    re(&R, r"(?i)^.{0,45}?\b(?:birth|appearance|[aā]virbh[aā]va?)\s+of\s+(.+)")
}
fn death() -> &'static Regex {
    static R: OnceLock<Regex> = OnceLock::new();
    re(&R, r"(?i)^.{0,45}?\b(?:disappearance|passing(?:\s+away)?|tirobh[aā]va|aprakat\w*)\s+of\s+(.+)")
}
fn death_after() -> &'static Regex {
    static R: OnceLock<Regex> = OnceLock::new();
    re(&R, r"(?i)^(.{1,60}?)\s+(?:passes away|passed away|disappeared|disappears|dies|died)\b")
}
fn born_after() -> &'static Regex {
    static R: OnceLock<Regex> = OnceLock::new();
    re(&R, r"(?i)^(.{1,60}?)\s+(?:is born|was born)\b")
}

/// Words before a name that are not part of it.
const TITLES: &[&str] =
    &["the", "poet", "lyrical", "blind", "padakarta", "devout", "of"];

/// The person an event is about and whether it is a birth or a passing.
fn event_person(text: &str) -> Option<(&'static str, String)> {
    let (kind, rest) = if let Some(c) = birth().captures(text) {
        ("birth", c[1].to_string())
    } else if let Some(c) = death().captures(text) {
        ("death", c[1].to_string())
    } else if let Some(c) = death_after().captures(text) {
        ("death", c[1].to_string())
    } else if let Some(c) = born_after().captures(text) {
        ("birth", c[1].to_string())
    } else {
        return None;
    };
    // the name: up to a comma, a bracket or words that start something else
    let mut name = rest.as_str();
    for cut in [",", ";", ".", "(", " at ", " in ", " who ", " the ", " on ", " while ", " after ", " &", " and ", " his ", " her ", " He ", " She ", " His ", " Her ", " It "] {
        if let Some(at) = name.find(cut).filter(|&a| a > 0) {
            name = &name[..at];
        }
    }
    let words: Vec<&str> = name.split_whitespace().collect();
    let start = words.iter().take_while(|w| TITLES.contains(&fold_text(w).as_str())).count();
    let words = &words[start..words.len().min(start + 6)];
    if words.is_empty() || (kind == "birth" && fold_text(words[0]) == "a") {
        return None;
    }
    Some((kind, words.join(" ")))
}

/// The record of a name that may run on into the next sentence ("Lokanātha
/// Gosvāmī Manjulali mañjarī"): the longest beginning that is a record.
fn find_person(index: &PersonIndex, name: &str) -> Option<i64> {
    let words: Vec<&str> = name.split_whitespace().collect();
    // and else without the first word ("Yavana Haridāsa Ṭhākura" → "Haridāsa Ṭhākura")
    (0..words.len().min(2)).find_map(|from| {
        let w = &words[from..];
        let shortest = if w.len() == 1 && from == 0 { 1 } else { 2 };
        (shortest..=w.len()).rev().find_map(|n| index.find(&w[..n].join(" ")))
    })
}

/// All the entries of the chronologies of the library, in order of time.
pub fn entries(conn: &Connection) -> Res<Vec<Entry>> {
    let rows: Vec<(i64, i64, String)> = conn
        .prepare(
            "SELECT s.doc_id, s.ordinal, s.text FROM sections s JOIN docs d ON d.id = s.doc_id
             WHERE d.deleted IS NULL AND (s.text LIKE '%AD /%' OR s.text LIKE '%AD/%' OR s.text LIKE '%AD)%')
             ORDER BY s.doc_id, s.ordinal",
        )
        .map_err(e)?
        .query_map([], |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)))
        .map_err(e)?
        .collect::<Result<_, _>>()
        .map_err(e)?;
    let mut by_doc: HashMap<i64, Vec<(i64, Vec<(i32, Option<i32>, String, String)>)>> = HashMap::new();
    for (doc, ordinal, text) in rows {
        let found = entries_of(&text);
        if !found.is_empty() {
            by_doc.entry(doc).or_default().push((ordinal, found));
        }
    }
    let index = PersonIndex::load(conn).map_err(e)?;
    let mut names: HashMap<i64, String> = HashMap::new();
    let mut out: Vec<Entry> = Vec::new();
    for (doc, sections) in by_doc {
        if sections.iter().map(|(_, f)| f.len()).sum::<usize>() < MIN_ENTRIES {
            continue;
        }
        for (ordinal, found) in sections {
            for (year, saka, lunar, text) in found {
                let (kind, person_id) = match event_person(&text) {
                    Some((kind, name)) => (kind, find_person(&index, &name)),
                    None => ("other", None),
                };
                let person = match person_id {
                    Some(id) => {
                        if !names.contains_key(&id) {
                            let n: Option<String> =
                                conn.query_row("SELECT name FROM persons WHERE id = ?1", [id], |r| r.get(0)).optional().map_err(e)?;
                            names.insert(id, n.unwrap_or_default());
                        }
                        names.get(&id).cloned()
                    }
                    None => None,
                };
                out.push(Entry { year, saka, lunar, text, kind, person_id, person, doc_id: doc, ordinal });
            }
        }
    }
    // the book gives most events twice (the list and the account): one each
    let key = |x: &Entry| match x.person_id {
        Some(p) if x.kind != "other" => format!("{}|{}|{p}", x.year, x.kind),
        // the same event told twice without a record: year, kind and first words of the name
        _ => match event_person(&x.text) {
            Some((kind, name)) => format!("{}|{kind}|{}", x.year, fold_text(&name).split(' ').take(3).collect::<Vec<_>>().join(" ")),
            None => format!("{}|{}", x.year, fold_text(&x.text).split(' ').take(5).collect::<Vec<_>>().join(" ")),
        },
    };
    let mut best: HashMap<String, usize> = HashMap::new();
    let mut keep: Vec<Entry> = Vec::new();
    for x in out {
        let k = key(&x);
        match best.get(&k) {
            // the longer one tells more; the lunar day is kept from either
            Some(&i) => {
                let lunar = if keep[i].lunar.is_empty() { x.lunar.clone() } else { keep[i].lunar.clone() };
                if x.text.len() > keep[i].text.len() {
                    keep[i] = x;
                }
                keep[i].lunar = lunar;
            }
            None => {
                best.insert(k, keep.len());
                keep.push(x);
            }
        }
    }
    // the list gives "The tola of Nimāi", the account "The tola of Nimāi After completion…": one
    let folded: Vec<String> = keep.iter().map(|x| fold_text(&x.text)).collect();
    let mut drop = vec![false; keep.len()];
    for i in 0..keep.len() {
        for j in 0..keep.len() {
            if i != j && !drop[j] && keep[i].year == keep[j].year && folded[i].len() < folded[j].len() && folded[j].starts_with(&folded[i]) {
                if keep[j].lunar.is_empty() {
                    keep[j].lunar = keep[i].lunar.clone();
                }
                if keep[j].person_id.is_none() {
                    keep[j].person_id = keep[i].person_id;
                    keep[j].person = keep[i].person.clone();
                }
                drop[i] = true;
                break;
            }
        }
    }
    let mut keep: Vec<Entry> = keep.into_iter().zip(drop).filter(|(_, d)| !d).map(|(x, _)| x).collect();
    keep.sort_by(|a, b| a.year.cmp(&b.year).then(a.doc_id.cmp(&b.doc_id)).then(a.ordinal.cmp(&b.ordinal)));
    Ok(keep)
}

/// The entries for the timeline: the text shortened.
pub fn timeline(conn: &Connection) -> Res<Vec<Entry>> {
    let mut list = entries(conn)?;
    for x in &mut list {
        if x.text.chars().count() > SUMMARY {
            let cut: String = x.text.chars().take(SUMMARY).collect();
            x.text = format!("{}…", cut.rsplit_once(' ').map_or(cut.as_str(), |(a, _)| a));
        }
    }
    Ok(list)
}

/// "Jaiṣṭha amāvasyā, 1534 AD / 1456 Śaka (Digdarśanī)"
fn date_value(x: &Entry, title: &str) -> String {
    let date = match x.saka {
        Some(s) => format!("{} AD / {s} Śaka", x.year),
        None => format!("{} AD", x.year),
    };
    let lunar = if x.lunar.is_empty() { String::new() } else { format!("{}, ", x.lunar) };
    format!("{lunar}{date} ({title})")
}

/// Births and passings of records with that date still empty, as proposals.
pub fn gather(conn: &Connection, side: &Connection) -> Res<usize> {
    let mut added = 0;
    let mut titles: HashMap<i64, String> = HashMap::new();
    for x in entries(conn)? {
        let (Some(id), "birth" | "death") = (x.person_id, x.kind) else { continue };
        let field = if x.kind == "birth" { "appearance" } else { "disappearance" };
        let Some(f) = store::get_fields(conn, id).optional().map_err(e)? else { continue };
        if !(if field == "appearance" { &f.appearance } else { &f.disappearance }).trim().is_empty() {
            continue;
        }
        if !titles.contains_key(&x.doc_id) {
            let t: String = conn.query_row("SELECT title FROM docs WHERE id = ?1", [x.doc_id], |r| r.get(0)).map_err(e)?;
            // "Vaiṣṇava Digdarsani" → "Digdarśanī"
            let short = if fold_text(&t).contains("digdarsani") { "Digdarśanī".to_string() } else { t };
            titles.insert(x.doc_id, short);
        }
        let value = date_value(&x, &titles[&x.doc_id]);
        let head = match x.saka {
            Some(s) => format!("{} AD / {s} S' ", x.year),
            None => format!("{} AD ", x.year),
        };
        let lunar = if x.lunar.is_empty() { String::new() } else { format!("{}--", x.lunar) };
        let text: String = x.text.chars().take(300).collect();
        added += fill::add(side, id, field, &value, "chronicle", &format!("{head}{lunar}{text}"), None)? as usize;
    }
    Ok(added)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_entries() {
        let text = "1434 AD / 1355  S' Bright fortnight saptamī  of Māgha, birth of Advaita Ācārya 1440 AD / 1362 S'  Birth of Kabir, the  founder of Kabir panthi sampradāya \
                    1534 AD / 1456 S' Jaistha--Gadadhara Pandita  Goswami passes away\n\n\
                    1574 AD / 1469 S' Jiva Goswami renounces the world and leaves for Vrndavana\n\
                    CHAPTER-5 GAURĀṄGA\n\
                    2. 1455 S Pansi Sukhla Tritaya (1533 AD).\nBirth of Jiva Goswami (Avirbhav).";
        let v = entries_of(text);
        assert_eq!(v.len(), 5, "{v:?}");
        assert_eq!((v[0].0, v[0].1), (1434, Some(1355)));
        assert!(v[0].3.ends_with("birth of Advaita Ācārya"), "{}", v[0].3);
        assert_eq!((v[2].0, v[2].2.as_str(), v[2].3.as_str()), (1534, "Jaistha", "Gadadhara Pandita Goswami passes away"));
        assert_eq!(v[3].0, 1547, "1469 Śaka is 1547, not 1574");
        let w = entries_of("1534 AD / 1456 S' Phalgun--x happened 1426 S Kartiki Krishnastami (1540 AD) Disappearance of Gadadhara dasa");
        assert_eq!(w[1].0, 1540, "here the Śaka year has the slip");
        assert!(!v[3].3.contains("CHAPTER"));
        assert_eq!((v[4].0, v[4].1, v[4].2.as_str()), (1533, Some(1455), "Pansi Sukhla Tritaya"));

        assert_eq!(event_person(&v[0].3), Some(("birth", "Advaita Ācārya".into())));
        assert_eq!(event_person(&v[2].3), Some(("death", "Gadadhara Pandita Goswami".into())));
        assert_eq!(event_person("Birth of Gopāla Uddhāraṇa Datta Ṭhākura He was Subahu"), Some(("birth", "Gopāla Uddhāraṇa Datta Ṭhākura".into())));
        assert_eq!(event_person("Disappearance of Raya Ramananda"), Some(("death", "Raya Ramananda".into())));
        assert_eq!(event_person("Birth of a son to Caityana dasa"), None);
        assert_eq!(event_person("Jiva Goswami renounces the world"), None);
    }
}

#[cfg(test)]
mod real {
    /// What a real library gives: cargo test chronicle_real -- --ignored --nocapture (BIO_DB=<copy>)
    #[test]
    #[ignore]
    fn chronicle_real() {
        let conn = crate::db::open(std::path::Path::new(&std::env::var("BIO_DB").unwrap())).unwrap();
        let t = std::time::Instant::now();
        let v = super::entries(&conn).unwrap();
        let linked = v.iter().filter(|x| x.person_id.is_some()).count();
        let bd = v.iter().filter(|x| x.kind != "other").count();
        println!("{} entries, {bd} births/passings, {linked} with a record, {:?}", v.len(), t.elapsed());
        for x in v.iter().filter(|x| x.kind != "other").step_by(12) {
            println!("{} [{}] {} -> {:?}  | {}", x.year, x.lunar, x.kind, x.person, x.text.chars().take(70).collect::<String>());
        }
        // the proposals they give (in a side file in memory)
        let side = rusqlite::Connection::open_in_memory().unwrap();
        side.execute_batch("CREATE TABLE proposals(id INTEGER PRIMARY KEY, person_id INTEGER NOT NULL, field TEXT NOT NULL, value TEXT NOT NULL, source TEXT NOT NULL, evidence TEXT NOT NULL DEFAULT '', guru_id INTEGER, status TEXT NOT NULL DEFAULT 'new', UNIQUE(person_id, field, value));").unwrap();
        println!("{} proposals", super::gather(&conn, &side).unwrap());
        let mut st = side.prepare("SELECT p.person_id, p.field, p.value FROM proposals p LIMIT 8").unwrap();
        for row in st.query_map([], |r| Ok((r.get::<_, i64>(0)?, r.get::<_, String>(1)?, r.get::<_, String>(2)?))).unwrap() {
            println!("PROPOSAL {:?}", row.unwrap());
        }
        for x in v.iter().filter(|x| x.kind != "other" && x.person_id.is_none()).take(25) {
            println!("NO RECORD: {} {} | {}", x.year, x.kind, x.text.chars().take(80).collect::<String>());
        }
    }
}
