//! Find and replace over the whole library (texts, titles, records), and the
//! helper that gives Sanskrit words back their diacritics ("Krishna" →
//! "Kṛṣṇa", "Sri" → "Śrī"). The changes themselves are written by
//! `store::replace_all`, which keeps a version of everything it changes.

use crate::fold::{fold_word, is_word_char, word_spans};
use crate::sanskrit;
use regex::{Regex, RegexBuilder};
use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::sync::OnceLock;

type Res<T> = Result<T, String>;

fn e(x: impl std::fmt::Display) -> String {
    x.to_string()
}

/// Where to replace.
#[derive(Deserialize, Clone, Copy)]
#[serde(rename_all = "camelCase")]
pub struct Scope {
    pub texts: bool,
    pub titles: bool,
    pub persons: bool,
}

#[derive(Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Spec {
    #[serde(default)]
    pub find: String,
    #[serde(default)]
    pub replace: String,
    /// `find` is a regular expression; `replace` may use $1, ${name}
    #[serde(default)]
    pub regex: bool,
    /// without it, "sri" also finds "Sri" / "SRI" and the replacement takes
    /// the same capitals ("Śrī" / "ŚRĪ")
    #[serde(default)]
    pub case_sensitive: bool,
    #[serde(default)]
    pub whole_word: bool,
    /// whole words to change instead of `find` (the diacritics helper):
    /// [plain, with marks]; capitals follow each word found
    #[serde(default)]
    pub words: Vec<(String, String)>,
    pub scope: Scope,
}

pub enum Replacer {
    Pattern { re: Regex, with: String, expand: bool, keep_case: bool, whole_word: bool },
    Words(HashMap<String, String>),
}

/// The replacement written with the capitals of the text it replaces:
/// "SRI" → "ŚRĪ", "Sri" → "Śrī", "sri" → "śrī".
pub fn match_case(found: &str, repl: &str) -> String {
    let letters: Vec<char> = found.chars().filter(|c| c.is_alphabetic()).collect();
    let Some(first) = letters.first() else { return repl.to_string() };
    if letters.len() > 1 && letters.iter().all(|c| !c.is_lowercase()) {
        return repl.to_uppercase();
    }
    let mut cs = repl.chars();
    match cs.next() {
        None => String::new(),
        Some(c) if first.is_uppercase() => c.to_uppercase().chain(cs).collect(),
        Some(c) => c.to_lowercase().chain(cs).collect(),
    }
}

fn at_word_edges(text: &str, s: usize, e: usize) -> bool {
    !text[..s].chars().next_back().is_some_and(is_word_char) && !text[e..].chars().next().is_some_and(is_word_char)
}

/// Web addresses: their words are left alone by the diacritics helper.
fn url_spans(text: &str) -> Vec<(usize, usize)> {
    static RE: OnceLock<Regex> = OnceLock::new();
    let re = RE.get_or_init(|| Regex::new(r"(?i)\b(?:https?://|www\.)\S+").unwrap());
    re.find_iter(text).map(|m| (m.start(), m.end())).collect()
}

impl Replacer {
    pub fn new(spec: &Spec) -> Res<Self> {
        if !spec.words.is_empty() {
            let map = spec
                .words
                .iter()
                .map(|(a, b)| (a.trim().to_lowercase(), b.trim().to_string()))
                .filter(|(a, b)| !a.is_empty() && !b.is_empty() && a != b)
                .collect();
            return Ok(Replacer::Words(map));
        }
        if spec.find.is_empty() {
            return Err("Escribe qué buscar".into());
        }
        let pat = if spec.regex { spec.find.clone() } else { regex::escape(&spec.find) };
        let re = RegexBuilder::new(&pat)
            .case_insensitive(!spec.case_sensitive)
            .build()
            .map_err(|x| format!("La expresión no es válida: {x}"))?;
        Ok(Replacer::Pattern {
            re,
            with: spec.replace.clone(),
            expand: spec.regex,
            keep_case: !spec.case_sensitive,
            whole_word: spec.whole_word,
        })
    }

    /// Calls `f(start, end, replacement)` for each change in `text`, in order.
    fn each(&self, text: &str, mut f: impl FnMut(usize, usize, String)) {
        match self {
            Replacer::Pattern { re, with, expand, keep_case, whole_word } => {
                for caps in re.captures_iter(text) {
                    let m = caps.get(0).unwrap();
                    if m.as_str().is_empty() || (*whole_word && !at_word_edges(text, m.start(), m.end())) {
                        continue;
                    }
                    let mut r = String::new();
                    if *expand {
                        caps.expand(with, &mut r);
                    } else {
                        r.push_str(with);
                    }
                    if *keep_case {
                        r = match_case(m.as_str(), &r);
                    }
                    if r != m.as_str() {
                        f(m.start(), m.end(), r);
                    }
                }
            }
            Replacer::Words(map) => {
                if map.is_empty() {
                    return;
                }
                let urls = url_spans(text);
                for (s, end) in word_spans(text) {
                    let w = &text[s..end];
                    let Some(r) = map.get(&w.to_lowercase()) else { continue };
                    if urls.iter().any(|&(a, b)| s >= a && end <= b) {
                        continue;
                    }
                    let r = match_case(w, r);
                    if r != w {
                        f(s, end, r);
                    }
                }
            }
        }
    }

    /// The text with the changes made and how many there were (None = none).
    pub fn apply(&self, text: &str) -> Option<(String, usize)> {
        let mut out = String::new();
        let (mut last, mut n) = (0, 0);
        self.each(text, |s, end, r| {
            out.push_str(&text[last..s]);
            out.push_str(&r);
            last = end;
            n += 1;
        });
        if n == 0 {
            return None;
        }
        out.push_str(&text[last..]);
        Some((out, n))
    }
}

// ---------------------------------------------------------------- preview

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Sample {
    pub doc_id: Option<i64>,
    pub person_id: Option<i64>,
    pub ordinal: i64,
    /// title of the text / name of the record (and the field)
    pub label: String,
    pub before: String,
    pub old: String,
    pub new: String,
    pub after: String,
}

#[derive(Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Preview {
    pub total: usize,
    pub texts: usize,
    pub titles: usize,
    pub persons: usize,
    pub samples: Vec<Sample>,
}

const SAMPLES: usize = 300;
const CONTEXT: usize = 60;

fn context_before(text: &str, s: usize) -> String {
    let head = &text[..s];
    let start = head.char_indices().rev().nth(CONTEXT - 1).map(|(i, _)| i).unwrap_or(0);
    format!("{}{}", if start > 0 { "…" } else { "" }, head[start..].replace('\n', " "))
}

fn context_after(text: &str, e: usize) -> String {
    let tail = &text[e..];
    let end = tail.char_indices().nth(CONTEXT).map(|(i, _)| i).unwrap_or(tail.len());
    format!("{}{}", tail[..end].replace('\n', " "), if end < tail.len() { "…" } else { "" })
}

struct Collect<'a> {
    r: &'a Replacer,
    p: Preview,
}

impl Collect<'_> {
    /// Counts the changes in `text`; returns how many.
    fn scan(&mut self, text: &str, doc_id: Option<i64>, person_id: Option<i64>, ordinal: i64, label: &str) -> usize {
        let mut n = 0;
        let samples = &mut self.p.samples;
        self.r.each(text, |s, end, new| {
            n += 1;
            if samples.len() < SAMPLES {
                samples.push(Sample {
                    doc_id,
                    person_id,
                    ordinal,
                    label: label.to_string(),
                    before: context_before(text, s),
                    old: text[s..end].to_string(),
                    new,
                    after: context_after(text, end),
                });
            }
        });
        self.p.total += n;
        n
    }
}

/// What the replacement would change, without changing anything.
pub fn preview(conn: &Connection, r: &Replacer, scope: Scope) -> Res<Preview> {
    let mut c = Collect { r, p: Preview::default() };
    if scope.texts {
        let mut st = conn
            .prepare(
                "SELECT s.doc_id, s.ordinal, d.title, s.heading, s.text FROM sections s JOIN docs d ON d.id = s.doc_id
                 WHERE d.deleted IS NULL ORDER BY d.title COLLATE NOCASE, d.id, s.ordinal",
            )
            .map_err(e)?;
        let mut rows = st.query([]).map_err(e)?;
        let mut docs = HashSet::new();
        while let Some(row) = rows.next().map_err(e)? {
            let (doc, ord, title): (i64, i64, String) = (row.get(0).map_err(e)?, row.get(1).map_err(e)?, row.get(2).map_err(e)?);
            let heading: Option<String> = row.get(3).map_err(e)?;
            let text: String = row.get(4).map_err(e)?;
            let mut n = heading.as_deref().map_or(0, |h| c.scan(h, Some(doc), None, ord, &title));
            n += c.scan(&text, Some(doc), None, ord, &title);
            if n > 0 {
                docs.insert(doc);
            }
        }
        c.p.texts = docs.len();
    }
    if scope.titles {
        let mut st = conn.prepare("SELECT id, title FROM docs WHERE deleted IS NULL").map_err(e)?;
        let rows: Vec<(i64, String)> =
            st.query_map([], |r| Ok((r.get(0)?, r.get(1)?))).map_err(e)?.collect::<Result<_, _>>().map_err(e)?;
        for (id, title) in rows {
            if c.scan(&title, Some(id), None, 0, &title) > 0 {
                c.p.titles += 1;
            }
        }
    }
    if scope.persons {
        let mut st = conn
            .prepare("SELECT id, name, aka, appearance, disappearance, place, guru, disciples, works, notes FROM persons")
            .map_err(e)?;
        let rows: Vec<(i64, Vec<String>)> = st
            .query_map([], |r| Ok((r.get(0)?, (1..10).map(|i| r.get(i)).collect::<Result<Vec<String>, _>>()?)))
            .map_err(e)?
            .collect::<Result<_, _>>()
            .map_err(e)?;
        for (id, fields) in rows {
            let name = fields[0].clone();
            let n: usize = fields.iter().map(|f| c.scan(f, None, Some(id), 0, &name)).sum();
            if n > 0 {
                c.p.persons += 1;
            }
        }
    }
    Ok(c.p)
}

// ---------------------------------------------------------------- diacritics

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Suggestion {
    /// the word as it is written most often ("Krishna")
    pub word: String,
    /// with its diacritics, same capitals ("Kṛṣṇa")
    pub proposed: String,
    /// times it appears and in how many texts
    pub count: usize,
    pub texts: usize,
    /// "dict" (the built-in list) or "library" (learnt from the texts that
    /// already have marks: less sure)
    pub source: &'static str,
    /// other ways of writing it with marks found in the library
    pub others: Vec<String>,
    /// unsure: not ticked at first
    pub doubtful: bool,
    pub example: String,
}

/// Letters of IAST (and of the usual Bengali spellings) that a plain
/// spelling loses. A word with other non-ASCII letters (â, å, ä… left by old
/// fonts) does not teach anything.
fn iast_marked(w: &str) -> bool {
    !w.is_ascii()
        && w.chars().all(|c| c.is_ascii_alphabetic() || "āīūṛṝḷḹṅñṭḍṇśṣṁṃḥĀĪŪṚṜḶḸṄÑṬḌṆŚṢṀṂḤ".contains(c))
}

struct Dict {
    /// folded → form (None when two forms fold the same way)
    forms: HashMap<String, Option<&'static str>>,
    plain: HashSet<&'static str>,
}

fn dict() -> &'static Dict {
    static D: OnceLock<Dict> = OnceLock::new();
    D.get_or_init(|| {
        let mut forms: HashMap<String, Option<&'static str>> = HashMap::new();
        for w in sanskrit::WORDS {
            let k = fold_word(w);
            match forms.get(&k) {
                Some(Some(prev)) if prev != w => {
                    forms.insert(k, None);
                }
                Some(_) => {}
                None => {
                    forms.insert(k, Some(w));
                }
            }
        }
        Dict { forms, plain: sanskrit::PLAIN.iter().copied().collect() }
    })
}

/// The built-in form of a plain word: the same word, the word without its
/// final "a" (Thakur → Ṭhākur), an English plural (gopis → gopīs) or two or
/// three words written together (Krsnadasa → Kṛṣṇadāsa).
fn dict_form(lower: &str) -> Option<String> {
    let d = dict();
    let k = fold_word(lower);
    let exact = |k: &str| d.forms.get(k).copied().flatten().map(str::to_string);
    if let Some(f) = exact(&k) {
        return Some(f);
    }
    // a final "a" dropped, as in Bengali names
    if k.len() >= 5 && !k.ends_with('a') {
        if let Some(f) = exact(&format!("{k}a")).and_then(|f| f.strip_suffix('a').map(str::to_string)) {
            return Some(f);
        }
    }
    if let Some(stem) = k.strip_suffix('s').filter(|s| s.len() >= 4) {
        if let Some(f) = exact(stem) {
            return Some(format!("{f}s"));
        }
    }
    if k.len() >= 7 {
        return joined(&k, 3);
    }
    None
}

fn joined(k: &str, parts: usize) -> Option<String> {
    let d = dict();
    if parts == 0 {
        return None;
    }
    // the longest first word first
    for cut in (3..=k.len().saturating_sub(3)).rev() {
        if !k.is_char_boundary(cut) {
            continue;
        }
        let Some(Some(head)) = d.forms.get(&k[..cut]) else { continue };
        let rest = &k[cut..];
        let tail = d
            .forms
            .get(rest)
            .copied()
            .flatten()
            .map(str::to_string)
            .or_else(|| {
                // the last word may drop its final "a": Gopinath
                (rest.len() >= 4 && !rest.ends_with('a'))
                    .then(|| d.forms.get(&format!("{rest}a")).copied().flatten())
                    .flatten()
                    .and_then(|f| f.strip_suffix('a').map(str::to_string))
            })
            .or_else(|| joined(rest, parts - 1));
        if let Some(t) = tail {
            return Some(format!("{head}{t}"));
        }
    }
    None
}

#[derive(Default)]
struct PlainWord {
    count: usize,
    texts: usize,
    last_doc: i64,
    spellings: HashMap<String, usize>,
    example: String,
}

/// Plain words of the library that have a known form with diacritics, most
/// frequent first.
pub fn suggestions(conn: &Connection) -> Res<Vec<Suggestion>> {
    let d = dict();
    let mut marked: HashMap<String, HashMap<String, usize>> = HashMap::new();
    let mut plain: HashMap<String, PlainWord> = HashMap::new();
    let mut st = conn
        .prepare("SELECT s.doc_id, s.text FROM sections s JOIN docs d ON d.id = s.doc_id WHERE d.deleted IS NULL ORDER BY s.doc_id")
        .map_err(e)?;
    let rows: Vec<(i64, String)> =
        st.query_map([], |r| Ok((r.get(0)?, r.get(1)?))).map_err(e)?.collect::<Result<_, _>>().map_err(e)?;
    // one text at a time (how many texts have each word)
    let mut i = 0;
    while i < rows.len() {
        let doc = rows[i].0;
        let mut j = i;
        while j < rows.len() && rows[j].0 == doc {
            j += 1;
        }
        let words: Vec<(&str, &str)> = rows[i..j]
            .iter()
            .flat_map(|(_, t)| word_spans(t).into_iter().map(move |(s, end)| (t.as_str(), &t[s..end])))
            .collect();
        for (text, w) in &words {
            if iast_marked(w) {
                let k = fold_word(w);
                *marked.entry(k).or_default().entry(w.to_lowercase()).or_default() += 1;
            } else if w.len() >= 3 && w.bytes().all(|b| b.is_ascii_alphabetic()) {
                let p = plain.entry(w.to_ascii_lowercase()).or_default();
                p.count += 1;
                if p.last_doc != doc {
                    p.last_doc = doc;
                    p.texts += 1;
                }
                *p.spellings.entry(w.to_string()).or_default() += 1;
                if p.example.is_empty() {
                    // the word's place in its text, for the example line
                    let s = w.as_ptr() as usize - text.as_ptr() as usize;
                    p.example = format!("{}{}{}", context_before(text, s), w, context_after(text, s + w.len()));
                }
            }
        }
        i = j;
    }

    let mut out = Vec::new();
    for (lower, p) in plain {
        if d.plain.contains(lower.as_str()) {
            continue;
        }
        let word = p.spellings.iter().max_by_key(|(s, n)| (**n, std::cmp::Reverse((*s).clone()))).map(|(s, _)| s.clone()).unwrap();
        let k = fold_word(&lower);
        let mut found: Vec<(String, usize)> = marked.get(&k).map(|m| m.iter().map(|(f, n)| (f.clone(), *n)).collect()).unwrap_or_default();
        found.sort_by(|a, b| b.1.cmp(&a.1).then(a.0.cmp(&b.0)));
        let seen: usize = found.iter().map(|f| f.1).sum();
        // what is learnt from the library is never ticked at first: those
        // texts are few and some words have two meanings (rasa / rāsa)
        let (proposed, source, doubtful) = if let Some(f) = dict_form(&lower) {
            (f, "dict", false)
        } else if let Some((best, _)) = found.first() {
            if seen < 3 {
                continue;
            }
            (best.clone(), "library", true)
        } else {
            continue;
        };
        let proposed = match_case(&word, &proposed);
        if proposed == word {
            continue;
        }
        let others = found.iter().map(|f| match_case(&word, &f.0)).filter(|f| *f != proposed).take(3).collect();
        out.push(Suggestion { word, proposed, count: p.count, texts: p.texts, source, others, doubtful, example: p.example });
    }
    out.sort_by(|a, b| b.count.cmp(&a.count).then(a.word.cmp(&b.word)));
    Ok(out)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn keeps_capitals() {
        assert_eq!(match_case("Sri", "śrī"), "Śrī");
        assert_eq!(match_case("SRI", "śrī"), "ŚRĪ");
        assert_eq!(match_case("sri", "Śrī"), "śrī");
    }

    #[test]
    fn dictionary_forms() {
        assert_eq!(dict_form("krishna").as_deref(), Some("kṛṣṇa"));
        assert_eq!(dict_form("krsna").as_deref(), Some("kṛṣṇa"));
        assert_eq!(dict_form("goswami").as_deref(), Some("gosvāmī"));
        assert_eq!(dict_form("thakur").as_deref(), Some("ṭhākur"));
        assert_eq!(dict_form("vrindavan").as_deref(), Some("vṛndāvan"));
        assert_eq!(dict_form("gopis").as_deref(), Some("gopīs"));
        assert_eq!(dict_form("krsnadasa").as_deref(), Some("kṛṣṇadāsa"));
        assert_eq!(dict_form("gopinath").as_deref(), Some("gopīnāth"));
        assert_eq!(dict_form("chaitanya").as_deref(), Some("caitanya"));
    }

    #[test]
    fn replaces() {
        let spec = |find: &str, with: &str, regex: bool, whole: bool| Spec {
            find: find.into(),
            replace: with.into(),
            regex,
            case_sensitive: false,
            whole_word: whole,
            words: vec![],
            scope: Scope { texts: true, titles: false, persons: false },
        };
        let r = Replacer::new(&spec("sri", "Śrī", false, true)).unwrap();
        assert_eq!(r.apply("Sri Krsna, SRI and srila").unwrap(), ("Śrī Krsna, ŚRĪ and srila".into(), 2));
        let r = Replacer::new(&spec(r"(\w+) dasa", "$1 dāsa", true, false)).unwrap();
        assert_eq!(r.apply("Krsna dasa").unwrap().0, "Krsna dāsa");
        let words = Spec { words: vec![("krishna".into(), "kṛṣṇa".into())], ..spec("", "", false, false) };
        let r = Replacer::new(&words).unwrap();
        assert_eq!(r.apply("Krishna's www.krishna.com KRISHNA").unwrap().0, "Kṛṣṇa's www.krishna.com KṚṢṆA");
    }
}

