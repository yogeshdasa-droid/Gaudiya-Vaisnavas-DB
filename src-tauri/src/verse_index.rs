//! Verse index (Whisper, 22-11-2026): every Sanskrit verse found in the library, once, with the texts where it appears.
//!
//! DERIVED data (like the full-text index): tables `verse_index` and `verse_index_places` are dropped and rebuilt by
//! `build` — nothing here is ever the only copy of anything. The verses of the collection «Versos» (Vedabase) are
//! seeds with their reference; every other verse is detected in the running text (a run of Sanskrit words in a
//! paragraph), and spellings of the same verse (typos, trailing numbers, cut-off lines) are grouped by long shared
//! pieces of their folded letters. Prototype and numbers: scripts/datos/versos/indice-prueba.mjs.

use regex::Regex;
use rusqlite::{params, Connection};
use serde::Serialize;
use std::collections::{HashMap, HashSet};
use unicode_normalization::{char::is_combining_mark, UnicodeNormalization};

const ENGLISH: &str = "the of and to in a is that for it as with was his her he she they them this are by on be at or from not have had has but which who whom what when where there their its we you your one all were been so if then than also can will would may shall should do does did no yes my me him us i an any these those into upon unto only more most such very because through about over again said say says like how why while without within between each other another both many much some own same too just now here out up down off after before however therefore thus even still must let make made take taken give given see seen know known come came go went gone get got called named lord sri srila chapter verse text purport translation";

fn is_iast(c: char) -> bool {
    matches!(
        c.to_lowercase().next().unwrap_or(c),
        'ā' | 'ī' | 'ū' | 'ṛ' | 'ṝ' | 'ḷ' | 'ḹ' | 'ṅ' | 'ñ' | 'ṭ' | 'ḍ' | 'ṇ' | 'ś' | 'ṣ' | 'ṁ' | 'ṃ' | 'ḥ'
    )
}

fn is_capital(c: char) -> bool {
    c.is_ascii_uppercase() || matches!(c, 'Ā' | 'Ī' | 'Ū' | 'Ṛ' | 'Ṃ' | 'Ś' | 'Ṣ' | 'Ṇ' | 'Ṭ' | 'Ḍ')
}

/// letters a–z only, without marks, lowercase («Kṛṣṇa» → «krsna»)
pub fn letters(s: &str) -> String {
    s.nfd().filter(|c| !is_combining_mark(*c)).flat_map(|c| c.to_lowercase()).filter(|c| c.is_ascii_lowercase()).collect()
}

#[derive(Clone, Copy, PartialEq)]
enum Sk {
    Null,
    Yes,
    Maybe,
    No,
}

struct Detector {
    english: HashSet<&'static str>,
    not_sanskrit: Regex,
    dots: Regex,
    synonyms: Regex,
    synonyms2: Regex,
    numbered1: Regex,
    numbered2: Regex,
}

impl Detector {
    fn new() -> Self {
        Detector {
            english: ENGLISH.split(' ').collect(),
            not_sanskrit: Regex::new(r"[aeiou]{3}|th|ing$|tion|ly$|ed$|s$").unwrap(),
            dots: Regex::new(r"\.{4,}|…{2}").unwrap(),
            synonyms: Regex::new(r"\S--\S").unwrap(),
            synonyms2: Regex::new(r"\S\s[–—]\s\S+;").unwrap(),
            numbered1: Regex::new(r"sakh[īi]s?\b.*\(\d\)").unwrap(),
            numbered2: Regex::new(r"\(\d\)\s.*\(\d\)\s.*\(\d\)").unwrap(),
        }
    }

    fn kind(&self, w: &str) -> Sk {
        let b: String = w.chars().filter(|c| c.is_alphabetic() || *c == '-').collect();
        if b.is_empty() {
            return Sk::Null;
        }
        if b.chars().any(is_iast) {
            return Sk::Yes;
        }
        let low = b.to_lowercase();
        if self.english.contains(low.as_str()) {
            return Sk::No;
        }
        let n = b.chars().count();
        if b.chars().next().map_or(false, |c| c.is_ascii_uppercase()) && n > 3 && !b.contains('-') {
            return Sk::No;
        }
        if b.contains('-') || n <= 3 {
            return Sk::Maybe;
        }
        if b.chars().all(|c| c.is_ascii_lowercase()) && !self.not_sanskrit.is_match(&b) {
            Sk::Maybe
        } else {
            Sk::No
        }
    }

    /// runs of Sanskrit words (≥ 8 words, ≥ half of them with diacritics) in the paragraphs of a text
    fn runs(&self, text: &str) -> Vec<String> {
        let mut out = vec![];
        for para in text.split('\n') {
            let toks: Vec<&str> = para.split_whitespace().collect();
            let kinds: Vec<Sk> = toks.iter().map(|t| self.kind(t)).collect();
            let mut i = 0;
            while i < toks.len() {
                if kinds[i] != Sk::Yes {
                    i += 1;
                    continue;
                }
                let (mut j, mut last) = (i, i);
                while j < toks.len() {
                    match kinds[j] {
                        Sk::No => break,
                        Sk::Yes => last = j,
                        _ => {}
                    }
                    j += 1;
                }
                let n = last + 1 - i;
                let dia = kinds[i..=last].iter().filter(|k| **k == Sk::Yes).count();
                if n >= 8 && dia * 2 >= n {
                    out.push(toks[i..=last].join(" "));
                }
                i = last + 1;
            }
        }
        out
    }

    /// clean one run: no index dots, no word-by-word synonyms, no titles/numbers at the edges
    fn refine(&self, run: &str) -> Option<String> {
        if self.dots.is_match(run) || self.synonyms.is_match(run) || self.synonyms2.is_match(run) || run.matches(';').count() >= 3 {
            return None;
        }
        if self.numbered1.is_match(run) || self.numbered2.is_match(run) {
            return None;
        }
        let mut t: Vec<&str> = run.split_whitespace().collect();
        let starts_bad = |w: &str| w.chars().next().map_or(false, |c| is_capital(c) || c.is_ascii_digit() || c == '(');
        while t.first().map_or(false, |w| starts_bad(w)) {
            t.remove(0);
        }
        // a label before the verse («dāsa: …», «Śikṣāṣṭaka: …») and a citation after it («… (Gītā 18.66)», «— Śrī …»)
        if let Some(p) = t.iter().take(4).position(|w| w.ends_with(':')) {
            t.drain(..=p);
        }
        if let Some(p) = t.iter().position(|w| (w.starts_with('(') && w.chars().nth(1).map_or(false, is_capital)) || *w == "—" || *w == "–") {
            t.truncate(p);
        }
        for w in t.iter_mut() {
            *w = w.trim_start_matches(['“', '"', '«', '‘']);
        }
        let ends_bad = |w: &str| {
            !w.contains('|')
                && !w.contains('।')
                && (w.chars().all(|c| c.is_ascii_digit() || "()-–.,;:".contains(c)) || w.chars().next().map_or(false, is_capital))
        };
        while t.last().map_or(false, |w| ends_bad(w)) {
            t.pop();
        }
        if t.len() < 8 || t.len() > 90 {
            return None;
        }
        let upper = t.iter().filter(|w| w.chars().next().map_or(false, is_capital)).count();
        if upper * 5 > t.len() {
            return None;
        }
        let dia = t.iter().filter(|w| w.chars().any(is_iast)).count();
        if dia * 10 < t.len() * 4 {
            return None;
        }
        Some(t.join(" "))
    }
}

struct Entry {
    best: String,
    reference: Option<String>,
    places: HashSet<(i64, i64)>,
}

fn dia_count(s: &str) -> usize {
    s.chars().filter(|c| is_iast(*c)).count()
}

#[derive(Serialize)]
pub struct BuildInfo {
    pub verses: usize,
    pub in_several_texts: usize,
}

const WINDOW: usize = 36;

/// Rebuild the whole index. Returns how many distinct verses there are.
pub fn build(conn: &mut Connection) -> rusqlite::Result<BuildInfo> {
    let det = Detector::new();
    let mut by_f: HashMap<String, Entry> = HashMap::new();

    // 1. the verses of «Versos» (Vedabase): seeds, with their reference
    {
        let mut st = conn.prepare(
            "SELECT s.doc_id, s.ordinal, s.text FROM sections s JOIN docs d ON d.id = s.doc_id WHERE d.deleted IS NULL AND d.dir LIKE 'Versos%'",
        )?;
        let mut rows = st.query([])?;
        let block = Regex::new(r"^::: verse ([^\n]+)\n([\s\S]*?)\n:::").unwrap();
        while let Some(r) = rows.next()? {
            let (doc, ord, text): (i64, i64, String) = (r.get(0)?, r.get(1)?, r.get(2)?);
            let Some(m) = block.captures(&text) else { continue };
            let lines: Vec<&str> = m[2].lines().map(str::trim).filter(|l| !l.is_empty()).collect();
            let f = letters(&lines.join(" "));
            if f.len() < 30 {
                continue;
            }
            let e = by_f.entry(f).or_insert_with(|| Entry { best: lines.join("\n"), reference: Some(m[1].trim().to_string()), places: HashSet::new() });
            e.places.insert((doc, ord));
        }
    }

    // 2. verses found in the running text of everything else
    {
        let mut st = conn.prepare(
            "SELECT s.doc_id, s.ordinal, s.text FROM sections s JOIN docs d ON d.id = s.doc_id WHERE d.deleted IS NULL AND d.dir NOT LIKE 'Versos%'",
        )?;
        let mut rows = st.query([])?;
        while let Some(r) = rows.next()? {
            let (doc, ord, text): (i64, i64, String) = (r.get(0)?, r.get(1)?, r.get(2)?);
            let text: String = text.nfc().collect();
            for run in det.runs(&text) {
                let Some(v) = det.refine(&run) else { continue };
                let f = letters(&v);
                if f.len() < 30 {
                    continue;
                }
                let e = by_f.entry(f).or_insert_with(|| Entry { best: v.clone(), reference: None, places: HashSet::new() });
                if e.reference.is_none() && dia_count(&v) > dia_count(&e.best) {
                    e.best = v;
                }
                e.places.insert((doc, ord));
            }
        }
    }

    // 3. group the spellings of the same verse (long shared pieces of folded letters; refrains do not join)
    let items: Vec<(String, Entry)> = by_f.into_iter().filter(|(_, e)| !e.best.contains(" · ")).collect();
    let mut parent: Vec<usize> = (0..items.len()).collect();
    fn find(p: &mut Vec<usize>, mut i: usize) -> usize {
        while p[i] != i {
            p[i] = p[p[i]];
            i = p[i];
        }
        i
    }
    let mut freq: HashMap<&str, u32> = HashMap::new();
    for (f, _) in &items {
        let mut seen: HashSet<&str> = HashSet::new();
        for p in 0..f.len().saturating_sub(WINDOW - 1) {
            seen.insert(&f[p..p + WINDOW]);
        }
        for w in seen {
            *freq.entry(w).or_default() += 1;
        }
    }
    let mut first: HashMap<&str, usize> = HashMap::new();
    for (i, (f, _)) in items.iter().enumerate() {
        for p in 0..f.len().saturating_sub(WINDOW - 1) {
            let w = &f[p..p + WINDOW];
            if freq.get(w).copied().unwrap_or(0) > 40 {
                continue;
            }
            match first.get(w) {
                None => {
                    first.insert(w, i);
                }
                Some(&j) => {
                    let (a, b) = (find(&mut parent, i), find(&mut parent, j));
                    parent[a] = b;
                }
            }
        }
    }
    let mut groups: HashMap<usize, Vec<usize>> = HashMap::new();
    for i in 0..items.len() {
        let r = find(&mut parent, i);
        groups.entry(r).or_default().push(i);
    }

    struct Out {
        best: String,
        reference: Option<String>,
        keys: String,
        variants: usize,
        places: Vec<(i64, i64)>,
        docs: usize,
    }
    let mut outs: Vec<Out> = vec![];
    for (_, members) in groups {
        let mut places: HashSet<(i64, i64)> = HashSet::new();
        for &m in &members {
            places.extend(items[m].1.places.iter().copied());
        }
        let docs = places.iter().map(|p| p.0).collect::<HashSet<_>>().len();
        let mut refs: Vec<&String> = members.iter().filter_map(|&m| items[m].1.reference.as_ref()).collect();
        refs.sort();
        let (best, reference) = if let Some(rf) = refs.first() {
            let m = members.iter().find(|&&m| items[m].1.reference.as_ref() == Some(*rf)).unwrap();
            (items[*m].1.best.clone(), Some((*rf).clone()))
        } else {
            let mut lens: Vec<usize> = members.iter().map(|&m| items[m].1.best.chars().count()).collect();
            lens.sort();
            let med = lens[lens.len() / 2] as f64;
            let mut cands: Vec<usize> =
                members.iter().copied().filter(|&m| (items[m].1.best.chars().count() as f64) >= med * 0.8 && (items[m].1.best.chars().count() as f64) <= med * 1.25).collect();
            if cands.is_empty() {
                cands = members.clone();
            }
            let ratio = |m: usize| dia_count(&items[m].1.best) as f64 / items[m].1.best.chars().count().max(1) as f64;
            cands.sort_by(|a, b| ratio(*b).partial_cmp(&ratio(*a)).unwrap_or(std::cmp::Ordering::Equal).then(items[*a].1.best.cmp(&items[*b].1.best)));
            (items[cands[0]].1.best.clone(), None)
        };
        let keys = members.iter().map(|&m| items[m].0.as_str()).collect::<Vec<_>>().join("|");
        let mut pl: Vec<(i64, i64)> = places.into_iter().collect();
        pl.sort();
        pl.truncate(300);
        outs.push(Out { best, reference, keys, variants: members.len(), places: pl, docs });
    }
    outs.sort_by(|a, b| b.docs.cmp(&a.docs).then(a.best.cmp(&b.best)));

    // 4. write (derived tables: dropped and made again)
    let several = outs.iter().filter(|o| o.docs >= 2).count();
    let tx = conn.transaction()?;
    tx.execute_batch(
        "DROP TABLE IF EXISTS verse_index_places; DROP TABLE IF EXISTS verse_index;
         CREATE TABLE verse_index(id INTEGER PRIMARY KEY, best TEXT NOT NULL, reference TEXT, keys TEXT NOT NULL, docs INTEGER NOT NULL, variants INTEGER NOT NULL);
         CREATE TABLE verse_index_places(verse_id INTEGER NOT NULL, doc_id INTEGER NOT NULL, ordinal INTEGER NOT NULL);
         CREATE INDEX verse_index_places_v ON verse_index_places(verse_id);",
    )?;
    {
        let mut iv = tx.prepare("INSERT INTO verse_index(id, best, reference, keys, docs, variants) VALUES (?1, ?2, ?3, ?4, ?5, ?6)")?;
        let mut ip = tx.prepare("INSERT INTO verse_index_places(verse_id, doc_id, ordinal) VALUES (?1, ?2, ?3)")?;
        for (i, o) in outs.iter().enumerate() {
            let id = i as i64 + 1;
            iv.execute(params![id, o.best, o.reference, o.keys, o.docs as i64, o.variants as i64])?;
            for (d, ord) in &o.places {
                ip.execute(params![id, d, ord])?;
            }
        }
    }
    crate::db::set_meta(&tx, "verse_index", &format!("{}", outs.len()))?;
    tx.commit()?;
    Ok(BuildInfo { verses: outs.len(), in_several_texts: several })
}

#[derive(Serialize)]
pub struct VersePlace {
    pub doc_id: i64,
    pub ordinal: i64,
    pub title: String,
    pub dir: String,
    pub heading: Option<String>,
}

#[derive(Serialize)]
pub struct VerseHit {
    pub id: i64,
    pub best: String,
    pub reference: Option<String>,
    pub docs: i64,
    pub variants: i64,
    pub places: Vec<VersePlace>,
}

/// has the index been built?
pub fn status(conn: &Connection) -> i64 {
    crate::db::get_meta(conn, "verse_index").ok().flatten().and_then(|v| v.parse().ok()).unwrap_or(0)
}

/// verses that contain these words (with or without diacritics, a piece of a verse is enough), most widespread first
pub fn search(conn: &Connection, query: &str, limit: usize) -> rusqlite::Result<Vec<VerseHit>> {
    let q = letters(query);
    if q.len() < 6 || status(conn) == 0 {
        return Ok(vec![]);
    }
    let mut st = conn.prepare("SELECT id, best, reference, docs, variants FROM verse_index WHERE keys LIKE ?1 ORDER BY docs DESC, id LIMIT ?2")?;
    let rows: Vec<(i64, String, Option<String>, i64, i64)> =
        st.query_map(params![format!("%{q}%"), limit as i64], |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?, r.get(4)?)))?.collect::<Result<_, _>>()?;
    let mut pst = conn.prepare(
        "SELECT p.doc_id, p.ordinal, d.title, d.dir, s.heading FROM verse_index_places p
         JOIN docs d ON d.id = p.doc_id LEFT JOIN sections s ON s.doc_id = p.doc_id AND s.ordinal = p.ordinal
         WHERE p.verse_id = ?1 AND d.deleted IS NULL ORDER BY d.dir, d.title, p.ordinal LIMIT 80",
    )?;
    let mut out = vec![];
    for (id, best, reference, docs, variants) in rows {
        let places = pst
            .query_map([id], |r| Ok(VersePlace { doc_id: r.get(0)?, ordinal: r.get(1)?, title: r.get(2)?, dir: r.get(3)?, heading: r.get(4)? }))?
            .collect::<Result<_, _>>()?;
        out.push(VerseHit { id, best, reference, docs, variants, places });
    }
    Ok(out)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn folds_to_letters() {
        assert_eq!(letters("Kṛṣṇa, bhaktyā-vihīnā!"), "krsnabhaktyavihina");
    }

    #[test]
    fn finds_a_verse_and_cuts_label_and_citation() {
        let d = Detector::new();
        let text = "Intro in English about the praise of Tulasī. dāsa: bhaktyā vihīnā aparādha-lakṣaiḥ kṣiptāś ca kāmādi-taraṅga-madhye kṛpāmayi tvāṁ śaraṇaṁ prapannā vṛnde (Vṛndāṣṭaka 8) Devoid of devotion, I am tossed about.";
        let runs = d.runs(text);
        assert_eq!(runs.len(), 1);
        let v = d.refine(&runs[0]).expect("a verse");
        assert!(v.starts_with("bhaktyā vihīnā") && v.ends_with("vṛnde"), "{v}");
    }

    #[test]
    fn ignores_indexes_and_synonyms() {
        let d = Detector::new();
        assert!(d.refine("bhaktyā vihīnā aparādha-lakṣaiḥ........................ 219 bhāla nā khāibe āra paribe").is_none());
        assert!(d.refine("uṭhe--arises; hātī--an elephant; mātā--mad; upāḍe--uproots; vā--or; chiṇḍe--breaks").is_none());
    }

    #[test]
    fn builds_and_searches_in_a_small_database() {
        let mut conn = Connection::open_in_memory().unwrap();
        crate::db::init(&conn).unwrap();
        conn.execute("INSERT INTO docs(id, collection, dir, title, stem, kind) VALUES (1, 'Libros', 'Libros', 'Libro', 'libro', 'md')", []).unwrap();
        conn.execute(
            "INSERT INTO sections(doc_id, ordinal, heading, text) VALUES (1, 0, 'p. 1', 'Texto. bhaktyā vihīnā aparādha-lakṣaiḥ kṣiptāś ca kāmādi-taraṅga-madhye kṛpāmayi tvāṁ śaraṇaṁ prapannā vṛnde Fin.')",
            [],
        )
        .unwrap();
        let info = build(&mut conn).unwrap();
        assert_eq!(info.verses, 1);
        let hits = search(&conn, "bhaktya vihina aparadha", 10).unwrap();
        assert_eq!(hits.len(), 1);
        assert_eq!(hits[0].places[0].title, "Libro");
        assert!(search(&conn, "xyz", 10).unwrap().is_empty());
    }
}
