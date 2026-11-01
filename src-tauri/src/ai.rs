//! «Rellenar fichas con IA»: a language model run by Ollama on this computer
//! reads the texts of each record and says what they tell about the empty
//! fields (dates, place, guru, disciples, works, notes), each with the
//! sentence it was read in. The answers become proposals (source "ai") in
//! Ajustes › Rellenar fichas: nothing is written to a record until the user
//! accepts it.
//!
//! A record is asked once: what was asked (model, text, empty fields) is
//! remembered by a hash in the proposals file, so stopping and starting again
//! goes on where it was, and only records whose text or fields changed are
//! read again.

use crate::calendar::PersonIndex;
use crate::fill;
use crate::fold::fold_text;
use crate::semantic::{self, OLLAMA};
use crate::store;
use rusqlite::{params, Connection, OptionalExtension};
use serde::Serialize;
use serde_json::{json, Map, Value};
use std::collections::HashSet;
use std::path::Path;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Mutex;

type Res<T> = Result<T, String>;

fn e(x: impl std::fmt::Display) -> String {
    x.to_string()
}

/// ≈ 4,7 GB; fits in the 8 GB of the RTX 3050 with room for the texts.
pub const MODEL: &str = "qwen2.5:7b";
/// letters of text sent for one record (≈ 4.000 words)
const MAX_TEXT: usize = 16_000;
/// records with less text than this have nothing to tell
const MIN_TEXT: usize = 250;
/// the window of the model, in tokens: prompt + text + answer
const CONTEXT: u32 = 8192;
/// tokens of the answer at most (a model going round in circles stops here)
const ANSWER: u32 = 900;

/// State shared by the reading thread and the commands.
#[derive(Default)]
pub struct Shared {
    pub busy: AtomicBool,
    pub stop: AtomicBool,
    /// (done, total, record being read)
    pub progress: Mutex<(usize, usize, String)>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Status {
    pub ollama: bool,
    pub model: bool,
    pub model_name: String,
    pub busy: bool,
    pub done: usize,
    pub total: usize,
    pub current: String,
    /// records already read by the model
    pub read: usize,
}

pub fn status(db_path: &Path, shared: &Shared) -> Status {
    let (ollama, model) = semantic::ollama_has(MODEL);
    let (done, total, current) = shared.progress.lock().unwrap().clone();
    let read = fill::open(db_path)
        .and_then(|side| init(&side).map(|_| side))
        .and_then(|side| side.query_row("SELECT COUNT(*) FROM ai_read", [], |r| r.get::<_, i64>(0)).map_err(e))
        .unwrap_or(0) as usize;
    Status { ollama, model, model_name: MODEL.into(), busy: shared.busy.load(Ordering::SeqCst), done, total, current, read }
}

fn init(side: &Connection) -> Res<()> {
    side.execute_batch(
        "CREATE TABLE IF NOT EXISTS ai_read(
             person_id INTEGER PRIMARY KEY,
             hash TEXT NOT NULL      -- of model + text + fields asked
         );",
    )
    .map_err(e)
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Done {
    /// records read this time
    pub records: usize,
    /// new proposals
    pub proposals: usize,
    /// records the model did not answer properly (they are asked again next time)
    pub failed: usize,
    pub stopped: bool,
}

/// What each field means, for the model.
const ASK: &[(&str, &str)] = &[
    ("appearance", "when the person was born (appeared): year or date, with the lunar day and month if the text gives them (e.g. \"Māgha Śukla Pañcamī, 1486\")"),
    ("disappearance", "when the person died (disappeared, passed away, left this world): year or date, with the lunar day and month if given"),
    ("place", "village, town or region where the person was born or lived"),
    ("guru", "name of the person's spiritual master; add (dīkṣā) or (śikṣā) only if the text says so; several separated by \"; \""),
    ("disciples", "names of the person's own disciples, separated by \", \""),
    ("works", "titles of books, songs or poems the person wrote, separated by \", \""),
    ("notes", "at most three short sentences (60 words): parents and family, identity in Kṛṣṇa-līlā, the main events of the life"),
];

const SYSTEM: &str = "You read biographies of Gauḍīya Vaiṣṇavas and pick out facts about ONE person.\n\
Rules:\n\
- Use only what the texts say explicitly about this person. Facts about other people in the texts do not count.\n\
- Never guess and never use your own knowledge. If the texts do not state a fact, leave its value empty.\n\
- Write the values in English, with the names spelled as in the texts (keep the diacritics).\n\
- For every value, \"evidence\" is the shortest passage copied word for word from the texts that states it: at most 25 words, never a whole paragraph. Empty value: empty evidence.\n\
Answer with JSON only.";

struct Record {
    id: i64,
    name: String,
    fields: store::PersonFields,
    text: String,
}

fn slot<'a>(f: &'a store::PersonFields, field: &str) -> &'a str {
    match field {
        "appearance" => &f.appearance,
        "disappearance" => &f.disappearance,
        "place" => &f.place,
        "guru" => &f.guru,
        "disciples" => &f.disciples,
        "works" => &f.works,
        "notes" => &f.notes,
        _ => "",
    }
}

/// The text of a record: its texts one after the other, the shorter first
/// (the notes, which say the most in the least space), up to MAX_TEXT.
fn record_text(conn: &Connection, id: i64) -> Res<String> {
    let docs: Vec<(i64, String)> = conn
        .prepare("SELECT id, title FROM docs WHERE person_id = ?1 AND deleted IS NULL ORDER BY size, id")
        .map_err(e)?
        .query_map([id], |r| Ok((r.get(0)?, r.get(1)?)))
        .map_err(e)?
        .collect::<Result<_, _>>()
        .map_err(e)?;
    let mut out = String::new();
    for (doc, title) in docs {
        let mut st = conn.prepare("SELECT text FROM sections WHERE doc_id = ?1 ORDER BY ordinal").map_err(e)?;
        let parts = st.query_map([doc], |r| r.get::<_, String>(0)).map_err(e)?;
        out.push_str(&format!("\n=== {title} ===\n"));
        for p in parts {
            out.push_str(p.map_err(e)?.trim());
            out.push('\n');
            if out.chars().count() >= MAX_TEXT {
                return Ok(out.chars().take(MAX_TEXT).collect());
            }
        }
    }
    Ok(out)
}

fn records(conn: &Connection) -> Res<Vec<Record>> {
    let ids: Vec<i64> = conn
        .prepare(
            "SELECT p.id FROM persons p
             WHERE EXISTS(SELECT 1 FROM docs d WHERE d.person_id = p.id AND d.deleted IS NULL)
             ORDER BY p.name COLLATE NOCASE",
        )
        .map_err(e)?
        .query_map([], |r| r.get(0))
        .map_err(e)?
        .collect::<Result<_, _>>()
        .map_err(e)?;
    let mut out = Vec::new();
    for id in ids {
        let fields = store::get_fields(conn, id).map_err(e)?;
        if ASK.iter().all(|(f, _)| !slot(&fields, f).trim().is_empty()) {
            continue;
        }
        let text = record_text(conn, id)?;
        if text.trim().chars().count() < MIN_TEXT {
            continue;
        }
        out.push(Record { id, name: fields.name.clone(), fields, text });
    }
    Ok(out)
}

/// Asks the model about the empty fields of one record: (field, value, evidence).
fn ask(r: &Record, empty: &[&str]) -> Res<Vec<(String, String, String)>> {
    let mut props = Map::new();
    let mut wanted = String::new();
    for &(f, what) in ASK.iter().filter(|(f, _)| empty.contains(f)) {
        props.insert(
            f.into(),
            json!({ "type": "object", "properties": { "value": { "type": "string" }, "evidence": { "type": "string" } }, "required": ["value", "evidence"] }),
        );
        wanted.push_str(&format!("- {f}: {what}\n"));
    }
    let schema = json!({ "type": "object", "properties": props, "required": empty });
    let user = format!(
        "Person: {}{}\n\nFields to fill:\n{wanted}\nTexts:\n<<<\n{}\n>>>",
        r.name,
        if r.fields.aka.trim().is_empty() { String::new() } else { format!(" (also called: {})", r.fields.aka.trim()) },
        r.text.trim()
    );
    let body = json!({
        "model": MODEL,
        "stream": false,
        "format": schema,
        "keep_alive": "10m",
        // a cut answer is not valid JSON: the record counts as failed and is asked again next time
        "options": { "temperature": 0, "num_ctx": CONTEXT, "num_predict": ANSWER, "repeat_penalty": 1.1 },
        "messages": [ { "role": "system", "content": SYSTEM }, { "role": "user", "content": user } ],
    });
    // the first call loads the model, which can take a minute or two
    let res = semantic::agent(900).post(&format!("{OLLAMA}/api/chat")).send_json(body).map_err(|x| match x {
        ureq::Error::Transport(_) => "No se puede hablar con Ollama: comprueba que está instalado y abierto (icono junto al reloj).".to_string(),
        other => format!("Ollama: {other}"),
    })?;
    let v: Value = res.into_json().map_err(e)?;
    let content = v["message"]["content"].as_str().unwrap_or_default();
    let answer: Value = serde_json::from_str(content).map_err(|x| format!("respuesta no válida: {x}"))?;
    let mut out = Vec::new();
    for &f in empty {
        let value = answer[f]["value"].as_str().unwrap_or_default().trim().to_string();
        let evidence = answer[f]["evidence"].as_str().unwrap_or_default().trim().to_string();
        out.push((f.to_string(), value, evidence));
    }
    Ok(out)
}

/// Words that mean "the text does not say".
fn is_nothing(value: &str) -> bool {
    let v = value.trim().trim_end_matches('.').to_lowercase();
    v.is_empty()
        || ["unknown", "not mentioned", "not stated", "not specified", "not given", "none", "n/a", "na", "-", "null", "not available"]
            .contains(&v.as_str())
        || v.starts_with("not mentioned")
        || v.starts_with("the text does not")
        || v.starts_with("no information")
}

fn strip_brackets(s: &str) -> String {
    let mut out = String::new();
    let mut depth = 0;
    for c in s.chars() {
        match c {
            '(' => depth += 1,
            ')' => depth = (depth - 1).max(0),
            _ if depth == 0 => out.push(c),
            _ => {}
        }
    }
    out
}

/// Most words of `part` are in the text: the evidence was read there, not made up.
fn found_in(part: &str, words: &HashSet<String>) -> bool {
    let w: Vec<String> = fold_text(part).split(' ').filter(|w| w.len() > 2).map(String::from).collect();
    !w.is_empty() && w.iter().filter(|x| words.contains(*x)).count() * 10 >= w.len() * 8
}

/// Reads the records (all, or the first `limit` still to read) and adds the
/// answers as proposals.
pub fn run(db_path: &Path, shared: &Shared, limit: Option<usize>, progress: impl Fn(usize, usize, &str)) -> Res<Done> {
    let conn = crate::db::open(db_path).map_err(e)?;
    let side = fill::open(db_path)?;
    init(&side)?;
    let index = PersonIndex::load(&conn).map_err(e)?;
    let (ollama, model) = semantic::ollama_has(MODEL);
    if !ollama {
        return Err("No se puede hablar con Ollama: comprueba que está instalado y abierto (icono junto al reloj).".into());
    }
    if !model {
        return Err(format!("Falta el modelo {MODEL}: pulsa «Descargar el modelo»."));
    }

    // what is still to read
    let mut todo = Vec::new();
    for r in records(&conn)? {
        let empty: Vec<&str> = ASK.iter().map(|(f, _)| *f).filter(|f| slot(&r.fields, f).trim().is_empty()).collect();
        let hash = semantic::hash(&format!("{MODEL}\n{}\n{}", empty.join(","), r.text));
        let seen: Option<String> =
            side.query_row("SELECT hash FROM ai_read WHERE person_id = ?1", [r.id], |x| x.get(0)).optional().map_err(e)?;
        if seen.as_deref() != Some(hash.as_str()) {
            todo.push((r, empty, hash));
        }
    }
    if let Some(n) = limit {
        todo.truncate(n);
    }

    let total = todo.len();
    let mut done = Done { records: 0, proposals: 0, failed: 0, stopped: false };
    for (i, (r, empty, hash)) in todo.into_iter().enumerate() {
        if shared.stop.load(Ordering::SeqCst) {
            done.stopped = true;
            break;
        }
        progress(i, total, &r.name);
        // an answer cut short is usually long notes: once more without them
        let short: Vec<&str> = empty.iter().copied().filter(|f| *f != "notes").collect();
        let answers = match ask(&r, &empty) {
            Ok(a) => Ok(a),
            Err(x) if x.starts_with("No se puede hablar") => return Err(x),
            Err(x) if short.is_empty() || short.len() == empty.len() => Err(x),
            Err(_) => ask(&r, &short),
        };
        let answers = match answers {
            Ok(a) => a,
            Err(x) if x.starts_with("No se puede hablar") => return Err(x),
            Err(_) => {
                done.failed += 1;
                continue;
            }
        };
        // the same date for both: the model did not tell birth from death
        let date = |f: &str| answers.iter().find(|a| a.0 == f).map(|a| fold_text(&a.1)).unwrap_or_default();
        let same_dates = !date("appearance").is_empty() && date("appearance") == date("disappearance");
        let words: HashSet<String> = fold_text(&r.text).split(' ').map(String::from).collect();
        for (field, value, evidence) in answers.iter().cloned() {
            if same_dates && (field == "appearance" || field == "disappearance") {
                continue;
            }
            if is_nothing(&value) || !found_in(&evidence, &words) {
                continue;
            }
            // names and titles must be in the text too (dates and notes may be reworded)
            if ["place", "guru", "disciples", "works"].contains(&field.as_str()) && !found_in(&strip_brackets(&value), &words) {
                continue;
            }
            let guru_id = if field == "guru" {
                fill::names_in(&value).first().and_then(|n| index.find(n)).filter(|&g| g != r.id)
            } else {
                None
            };
            let evidence = if evidence.chars().count() > 400 { format!("{}…", evidence.chars().take(400).collect::<String>()) } else { evidence };
            done.proposals += fill::add(&side, r.id, &field, &value, "ai", &evidence, guru_id)? as usize;
        }
        side.execute("INSERT OR REPLACE INTO ai_read(person_id, hash) VALUES(?1, ?2)", params![r.id, hash]).map_err(e)?;
        done.records += 1;
    }
    progress(total, total, "");
    Ok(done)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn nothing_and_evidence() {
        assert!(is_nothing("Not mentioned in the text."));
        assert!(is_nothing(" unknown "));
        assert!(!is_nothing("1486"));
        let words: HashSet<String> =
            fold_text("He was born in the village of Kulina-grama in 1486 Saka, son of Sri Raghava.").split(' ').map(String::from).collect();
        assert!(found_in("He was born in the village of Kulīna-grāma", &words));
        assert!(!found_in("He wrote the Caitanya-bhāgavata in Navadvīpa", &words));
    }

    /// Asks the real model about one real record (needs Ollama + the model):
    /// cargo test ai_real -- --ignored --nocapture   (BIO_DB=<copy>\biodata.db, BIO_ID=<record>)
    #[test]
    #[ignore]
    fn ai_real() {
        let db = std::env::var("BIO_DB").unwrap();
        let conn = crate::db::open(Path::new(&db)).unwrap();
        let Ok(id) = std::env::var("BIO_ID").map(|x| x.parse::<i64>().unwrap()) else {
            // no record given: some to choose from
            let all = records(&conn).unwrap();
            println!("{} records to read", all.len());
            for r in all.iter().step_by(60) {
                println!("{}\t{}\t{} letters", r.id, r.name, r.text.chars().count());
            }
            return;
        };
        let fields = store::get_fields(&conn, id).unwrap();
        let r = Record { id, name: fields.name.clone(), text: record_text(&conn, id).unwrap(), fields };
        let empty: Vec<&str> = ASK.iter().map(|(f, _)| *f).filter(|f| slot(&r.fields, f).trim().is_empty()).collect();
        let t = std::time::Instant::now();
        let words: HashSet<String> = fold_text(&r.text).split(' ').map(String::from).collect();
        for (f, v, ev) in ask(&r, &empty).unwrap() {
            let ok = !is_nothing(&v) && found_in(&ev, &words);
            println!("{f}: {v}\n    [{}] {ev}", if ok { "ok" } else { "--" });
        }
        println!("{} letters, {:?}", r.text.len(), t.elapsed());
    }
}
