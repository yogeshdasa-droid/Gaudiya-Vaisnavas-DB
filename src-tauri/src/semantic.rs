//! Search by meaning: every text is cut into pieces of a paragraph or two and
//! each piece gets a vector from EmbeddingGemma (run by Ollama on this
//! computer). A question gets a vector the same way, and the pieces whose
//! vectors are closest are the results, even without a word in common.
//!
//! The vectors are derived data: they live in their own file next to the
//! database ("biodata-significado.db"), are not part of the backups and can
//! be made again at any time. A piece is known by a hash of what was sent to
//! the model, so after a change only new or changed pieces are sent again.

use crate::search::{self, SearchParams, SearchResult};
use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::time::Duration;

type Res<T> = Result<T, String>;

fn e(x: impl std::fmt::Display) -> String {
    x.to_string()
}

const OLLAMA: &str = "http://127.0.0.1:11434";
pub const MODEL: &str = "embeddinggemma";
/// pieces sent to the model at once
const BATCH: usize = 32;
/// a piece is cut after this many bytes, at the end of a paragraph or sentence…
const PIECE_MIN: usize = 900;
/// …and at the latest here
const PIECE_MAX: usize = 1600;

/// State shared by the indexing thread and the commands.
#[derive(Default)]
pub struct Shared {
    pub busy: AtomicBool,
    pub stop: AtomicBool,
    pub progress: Mutex<(usize, usize)>,
    cache: Mutex<Option<Arc<Index>>>,
}

pub fn vectors_path(db_path: &Path) -> PathBuf {
    let stem = db_path.file_stem().and_then(|s| s.to_str()).unwrap_or("biodata");
    db_path.with_file_name(format!("{stem}-significado.db"))
}

fn open(db_path: &Path) -> Res<Connection> {
    let conn = Connection::open(vectors_path(db_path)).map_err(e)?;
    conn.pragma_update(None, "journal_mode", "WAL").map_err(e)?;
    conn.pragma_update(None, "synchronous", "NORMAL").map_err(e)?;
    conn.busy_timeout(Duration::from_secs(30)).map_err(e)?;
    // a first test version kept section ids, which change when a text is saved
    let old: bool = conn
        .query_row("SELECT COUNT(*) FROM pragma_table_info('chunks') WHERE name = 'section_id'", [], |r| r.get(0))
        .map_err(e)?;
    if old {
        conn.execute_batch("DROP TABLE chunks;").map_err(e)?;
    }
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY, value TEXT NOT NULL);
         CREATE TABLE IF NOT EXISTS vectors(hash TEXT PRIMARY KEY, vec BLOB NOT NULL);
         CREATE TABLE IF NOT EXISTS chunks(
             id INTEGER PRIMARY KEY,
             ordinal INTEGER NOT NULL,    -- section of the text
             doc_id INTEGER NOT NULL,
             start INTEGER NOT NULL,      -- byte range in the section's text
             len INTEGER NOT NULL,
             hash TEXT NOT NULL
         );",
    )
    .map_err(e)?;
    // vectors of another model do not mix
    let model: Option<String> =
        conn.query_row("SELECT value FROM meta WHERE key = 'model'", [], |r| r.get(0)).optional().map_err(e)?;
    if model.as_deref() != Some(MODEL) {
        conn.execute_batch("DELETE FROM vectors; DELETE FROM chunks;").map_err(e)?;
        conn.execute("INSERT OR REPLACE INTO meta(key, value) VALUES('model', ?1)", [MODEL]).map_err(e)?;
    }
    Ok(conn)
}

// ---------------------------------------------------------------- Ollama

fn agent(read_secs: u64) -> ureq::Agent {
    ureq::AgentBuilder::new().timeout_connect(Duration::from_secs(2)).timeout_read(Duration::from_secs(read_secs)).build()
}

#[derive(Deserialize)]
struct Tags {
    models: Vec<TagModel>,
}
#[derive(Deserialize)]
struct TagModel {
    name: String,
}

/// (Ollama answers, the model is downloaded)
pub fn ollama_state() -> (bool, bool) {
    match agent(5).get(&format!("{OLLAMA}/api/tags")).call() {
        Ok(r) => {
            let model = r
                .into_json::<Tags>()
                .map(|t| t.models.iter().any(|m| m.name == MODEL || m.name.starts_with(&format!("{MODEL}:"))))
                .unwrap_or(false);
            (true, model)
        }
        Err(_) => (false, false),
    }
}

#[derive(Deserialize)]
struct Embeddings {
    embeddings: Vec<Vec<f32>>,
}

fn embed(inputs: &[String]) -> Res<Vec<Vec<f32>>> {
    // the first call loads the model, which can take a minute
    let r = agent(600)
        .post(&format!("{OLLAMA}/api/embed"))
        .send_json(json!({ "model": MODEL, "input": inputs, "truncate": true }))
        .map_err(|x| match x {
            ureq::Error::Transport(_) => {
                "No se puede hablar con Ollama: comprueba que está instalado y abierto (icono junto al reloj).".to_string()
            }
            other => format!("Ollama: {other}"),
        })?;
    let mut v = r.into_json::<Embeddings>().map_err(e)?.embeddings;
    if v.len() != inputs.len() {
        return Err("Ollama devolvió una respuesta incompleta".into());
    }
    for x in &mut v {
        let norm = x.iter().map(|a| a * a).sum::<f32>().sqrt();
        if norm > 0.0 {
            x.iter_mut().for_each(|a| *a /= norm);
        }
    }
    Ok(v)
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PullProgress {
    pub status: String,
    pub completed: u64,
    pub total: u64,
}

/// Downloads the model (≈ 620 MB) through Ollama, reporting progress.
pub fn pull(progress: impl Fn(PullProgress)) -> Res<()> {
    let r = agent(3600)
        .post(&format!("{OLLAMA}/api/pull"))
        .send_json(json!({ "model": MODEL, "stream": true }))
        .map_err(|x| format!("Ollama: {x}"))?;
    #[derive(Deserialize)]
    struct Line {
        #[serde(default)]
        status: String,
        #[serde(default)]
        completed: u64,
        #[serde(default)]
        total: u64,
        error: Option<String>,
    }
    use std::io::BufRead;
    for line in std::io::BufReader::new(r.into_reader()).lines() {
        let line = line.map_err(e)?;
        let Ok(l) = serde_json::from_str::<Line>(&line) else { continue };
        if let Some(err) = l.error {
            return Err(format!("Ollama: {err}"));
        }
        progress(PullProgress { status: l.status, completed: l.completed, total: l.total });
    }
    Ok(())
}

// ---------------------------------------------------------------- pieces

/// FNV-1a: a hash that stays the same from one version of the program to the next.
fn hash(s: &str) -> String {
    let mut h: u64 = 0xcbf29ce484222325;
    for b in s.bytes() {
        h ^= b as u64;
        h = h.wrapping_mul(0x100000001b3);
    }
    format!("{h:016x}")
}

/// Byte ranges of the pieces of a text: cut at a blank line, else at the end
/// of a sentence, else at a space.
fn pieces(text: &str) -> Vec<(usize, usize)> {
    let mut out = Vec::new();
    let mut start = 0;
    let b = text.as_bytes();
    while start < text.len() {
        // leading blank space is not part of a piece
        while start < text.len() && b[start].is_ascii_whitespace() {
            start += 1;
        }
        if start >= text.len() {
            break;
        }
        if text.len() - start <= PIECE_MAX {
            out.push((start, text.len()));
            break;
        }
        let window = |from: usize, to: usize| {
            let (mut f, mut t) = (from.min(text.len()), to.min(text.len()));
            while !text.is_char_boundary(f) {
                f += 1;
            }
            while !text.is_char_boundary(t) {
                t -= 1;
            }
            (f, t)
        };
        let (lo, hi) = window(start + PIECE_MIN, start + PIECE_MAX);
        let zone = &text[lo..hi];
        let cut = zone
            .find("\n\n")
            .map(|i| i + 2)
            .or_else(|| zone.rfind(". ").map(|i| i + 2))
            .or_else(|| zone.rfind('\n').map(|i| i + 1))
            .or_else(|| zone.rfind(' ').map(|i| i + 1))
            .map(|i| lo + i)
            .unwrap_or(hi);
        out.push((start, cut));
        start = cut;
    }
    out
}

struct Piece {
    ordinal: i64,
    doc_id: i64,
    start: usize,
    len: usize,
    hash: String,
    input: String,
}

fn all_pieces(main: &Connection) -> Res<Vec<Piece>> {
    let mut st = main
        .prepare(
            "SELECT s.ordinal, s.doc_id, d.title, s.text FROM sections s JOIN docs d ON d.id = s.doc_id
             WHERE d.deleted IS NULL ORDER BY s.doc_id, s.ordinal",
        )
        .map_err(e)?;
    let mut rows = st.query([]).map_err(e)?;
    let mut out = Vec::new();
    while let Some(r) = rows.next().map_err(e)? {
        let (ord, did, title, text): (i64, i64, String, String) =
            (r.get(0).map_err(e)?, r.get(1).map_err(e)?, r.get(2).map_err(e)?, r.get(3).map_err(e)?);
        for (s, end) in pieces(&text) {
            let body = text[s..end].trim();
            if body.chars().filter(|c| c.is_alphabetic()).count() < 20 {
                continue;
            }
            // the document prompt EmbeddingGemma was trained with
            let input = format!("title: {title} | text: {body}");
            out.push(Piece { ordinal: ord, doc_id: did, start: s, len: end - s, hash: hash(&input), input });
        }
    }
    Ok(out)
}

fn to_blob(v: &[f32]) -> Vec<u8> {
    v.iter().flat_map(|x| x.to_le_bytes()).collect()
}

fn from_blob(b: &[u8]) -> impl Iterator<Item = f32> + '_ {
    b.chunks_exact(4).map(|c| f32::from_le_bytes([c[0], c[1], c[2], c[3]]))
}

#[derive(Serialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct IndexDone {
    /// pieces sent to the model this time
    pub added: usize,
    pub pieces: usize,
    pub millis: u128,
    pub stopped: bool,
}

/// Brings the vectors up to date with the texts: only new or changed pieces
/// go to the model. `progress(done, total)` counts those.
pub fn update_index(db_path: &Path, shared: &Shared, progress: impl Fn(usize, usize)) -> Res<IndexDone> {
    let started = std::time::Instant::now();
    let main = crate::db::open(db_path).map_err(e)?;
    let list = all_pieces(&main)?;
    drop(main);
    let mut vdb = open(db_path)?;
    let have: HashSet<String> = vdb
        .prepare("SELECT hash FROM vectors")
        .map_err(e)?
        .query_map([], |r| r.get(0))
        .map_err(e)?
        .collect::<Result<_, _>>()
        .map_err(e)?;
    let mut seen = HashSet::new();
    let todo: Vec<&Piece> = list.iter().filter(|p| !have.contains(&p.hash) && seen.insert(p.hash.as_str())).collect();
    let total = todo.len();
    progress(0, total);
    let mut done = 0;
    for batch in todo.chunks(BATCH) {
        if shared.stop.load(Ordering::SeqCst) {
            break;
        }
        let inputs: Vec<String> = batch.iter().map(|p| p.input.clone()).collect();
        let vecs = embed(&inputs)?;
        let tx = vdb.transaction().map_err(e)?;
        for (p, v) in batch.iter().zip(&vecs) {
            tx.execute("INSERT OR REPLACE INTO vectors(hash, vec) VALUES(?1, ?2)", params![p.hash, to_blob(v)]).map_err(e)?;
        }
        tx.commit().map_err(e)?;
        done += batch.len();
        progress(done, total);
    }
    let stopped = done < total;
    if !stopped {
        // where each piece is now; vectors of pieces that no longer exist go
        let tx = vdb.transaction().map_err(e)?;
        tx.execute("DELETE FROM chunks", []).map_err(e)?;
        {
            let mut ins = tx
                .prepare("INSERT INTO chunks(ordinal, doc_id, start, len, hash) VALUES(?1, ?2, ?3, ?4, ?5)")
                .map_err(e)?;
            for p in &list {
                ins.execute(params![p.ordinal, p.doc_id, p.start as i64, p.len as i64, p.hash]).map_err(e)?;
            }
        }
        tx.execute("DELETE FROM vectors WHERE hash NOT IN (SELECT hash FROM chunks)", []).map_err(e)?;
        tx.execute(
            "INSERT OR REPLACE INTO meta(key, value) VALUES('indexed', datetime('now', 'localtime'))",
            [],
        )
        .map_err(e)?;
        tx.commit().map_err(e)?;
        *shared.cache.lock().unwrap() = None;
    }
    Ok(IndexDone { added: done, pieces: list.len(), millis: started.elapsed().as_millis(), stopped })
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Status {
    pub ollama: bool,
    pub model: bool,
    /// pieces with a vector, ready to be searched
    pub pieces: i64,
    /// when the index was last brought up to date ("" = never)
    pub indexed: String,
    pub busy: bool,
    pub done: usize,
    pub total: usize,
}

pub fn status(db_path: &Path, shared: &Shared) -> Status {
    let (ollama, model) = ollama_state();
    let (pieces, indexed) = if vectors_path(db_path).exists() {
        open(db_path)
            .map(|c| {
                let n = c.query_row("SELECT COUNT(*) FROM chunks", [], |r| r.get(0)).unwrap_or(0);
                let when = c.query_row("SELECT value FROM meta WHERE key = 'indexed'", [], |r| r.get(0)).unwrap_or_default();
                (n, when)
            })
            .unwrap_or((0, String::new()))
    } else {
        (0, String::new())
    };
    let (done, total) = *shared.progress.lock().unwrap();
    Status { ollama, model, pieces, indexed, busy: shared.busy.load(Ordering::SeqCst), done, total }
}

// ---------------------------------------------------------------- search

struct Index {
    /// (section ordinal, doc, start, len) of each piece
    rows: Vec<(i64, i64, usize, usize)>,
    /// their vectors one after another
    vecs: Vec<f32>,
    dims: usize,
}

fn load(db_path: &Path, shared: &Shared) -> Res<Arc<Index>> {
    if let Some(ix) = shared.cache.lock().unwrap().clone() {
        return Ok(ix);
    }
    let conn = open(db_path)?;
    let mut st = conn
        .prepare("SELECT c.ordinal, c.doc_id, c.start, c.len, v.vec FROM chunks c JOIN vectors v ON v.hash = c.hash")
        .map_err(e)?;
    let mut rows = st.query([]).map_err(e)?;
    let mut ix = Index { rows: Vec::new(), vecs: Vec::new(), dims: 0 };
    while let Some(r) = rows.next().map_err(e)? {
        let blob: Vec<u8> = r.get(4).map_err(e)?;
        let dims = blob.len() / 4;
        if ix.dims == 0 {
            ix.dims = dims;
        }
        if dims != ix.dims {
            continue;
        }
        ix.rows.push((r.get(0).map_err(e)?, r.get(1).map_err(e)?, r.get::<_, i64>(2).map_err(e)? as usize, r.get::<_, i64>(3).map_err(e)? as usize));
        ix.vecs.extend(from_blob(&blob));
    }
    let ix = Arc::new(ix);
    *shared.cache.lock().unwrap() = Some(ix.clone());
    Ok(ix)
}

fn escape(s: &str) -> String {
    s.replace('&', "&amp;").replace('<', "&lt;").replace('>', "&gt;").replace('"', "&quot;")
}

/// The texts closest in meaning to `p.query`, one result per text (its
/// closest piece), with the same filters as the normal search.
pub fn search(main: &Connection, db_path: &Path, shared: &Shared, p: &SearchParams) -> Res<SearchResult> {
    let started = std::time::Instant::now();
    let q = p.query.trim();
    let empty = |error: Option<String>| SearchResult { total: 0, hits: vec![], facets: vec![], terms: vec![], millis: 0, error };
    if q.is_empty() {
        return Ok(empty(None));
    }
    let ix = load(db_path, shared)?;
    if ix.rows.is_empty() {
        return Ok(empty(Some(
            "La búsqueda por significado aún no está preparada: Ajustes › Significado › Preparar.".into(),
        )));
    }
    let qv = embed(&[format!("task: search result | query: {q}")])?.remove(0);
    if qv.len() != ix.dims {
        return Ok(empty(Some("El índice es de otro modelo: prepáralo de nuevo en Ajustes › Significado.".into())));
    }
    let allowed = search::allowed_docs(main, p).map_err(e)?;
    // best piece of each text
    let mut best: HashMap<i64, (f32, usize)> = HashMap::new();
    for (i, row) in ix.rows.iter().enumerate() {
        if !allowed.contains(&row.1) {
            continue;
        }
        let v = &ix.vecs[i * ix.dims..(i + 1) * ix.dims];
        let score: f32 = v.iter().zip(&qv).map(|(a, b)| a * b).sum();
        let e = best.entry(row.1).or_insert((f32::MIN, i));
        if score > e.0 {
            *e = (score, i);
        }
    }
    let mut ranked: Vec<(f32, usize)> = best.into_values().collect();
    ranked.sort_by(|a, b| b.0.total_cmp(&a.0));
    // further down the list the texts have little to do with the question
    ranked.truncate(100);
    let total = ranked.len() as i64;
    let limit = p.limit.unwrap_or(50).clamp(1, 500) as usize;
    let mut hits = Vec::new();
    for &(_, i) in ranked.iter().skip(p.offset.max(0) as usize) {
        if hits.len() >= limit {
            break;
        }
        let (ord, doc, start, len) = ix.rows[i];
        // a text changed since the last update may have fewer sections
        let Some((mut h, text)) = search::hit_for_section(main, doc, ord).map_err(e)? else { continue };
        let piece = text.get(start..start + len).unwrap_or(&text);
        let mut snip: String = piece.split_whitespace().collect::<Vec<_>>().join(" ");
        if let Some((cut, _)) = snip.char_indices().nth(360) {
            snip.truncate(cut);
            snip.push('…');
        }
        h.snippet = escape(&snip);
        hits.push(h);
    }
    let mut counts: HashMap<String, i64> = HashMap::new();
    for h in &hits {
        *counts.entry(h.collection.clone()).or_default() += 1;
    }
    let mut facets: Vec<search::Facet> = counts.into_iter().map(|(name, count)| search::Facet { name, count }).collect();
    facets.sort_by(|a, b| b.count.cmp(&a.count));
    Ok(SearchResult { total, hits, facets, terms: vec![], millis: started.elapsed().as_millis(), error: None })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn cuts_pieces() {
        let para = "This is a sentence about Kṛṣṇa. ".repeat(40);
        let text = format!("{para}\n\n{para}\n\n{para}");
        let ps = pieces(&text);
        assert!(ps.len() >= 3);
        for (s, end) in &ps {
            assert!(end - s <= PIECE_MAX);
            assert!(text.is_char_boundary(*s) && text.is_char_boundary(*end));
        }
        assert_eq!(ps.last().unwrap().1, text.len());
        assert_eq!(pieces("short"), vec![(0, 5)]);
    }
}
