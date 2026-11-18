//! How long each recording of «Audios» lasts (Whisper, 18-11-2026: the duration in the list, and the list sorted by
//! it). Read once from the start of each file — MP3 (Xing / Info / VBRI header, or the bitrate of a constant one),
//! WAV (its «data» size and byte rate), WMA / WMV (the ASF «file properties») — and kept in «biodata-duraciones.json»
//! next to the database: derived, it can be deleted and is made again; a file changed (size or date) is read again.

use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::File;
use std::io::{Read, Seek, SeekFrom};
use std::path::{Path, PathBuf};

pub fn cache_path(db_path: &Path) -> PathBuf {
    db_path.with_file_name("biodata-duraciones.json")
}

#[derive(Serialize, Deserialize, Default)]
struct Cache {
    folder: String,
    /// rel → (size, mtime, seconds; 0 = not known)
    files: HashMap<String, (u64, i64, f64)>,
}

fn mtime(m: &std::fs::Metadata) -> i64 {
    m.modified().ok().and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok()).map_or(0, |d| d.as_secs() as i64)
}

/// The seconds of each media file of `folder` (`rels`: its paths with «/»), from the kept list where it is still right.
pub fn durations(db_path: &Path, folder: &str, rels: &[String]) -> HashMap<String, f64> {
    let cp = cache_path(db_path);
    let mut cache: Cache = std::fs::read(&cp).ok().and_then(|b| serde_json::from_slice(&b).ok()).unwrap_or_default();
    if cache.folder != folder {
        cache = Cache { folder: folder.to_string(), files: HashMap::new() };
    }
    let root = PathBuf::from(folder);
    let fresh: Vec<(String, u64, i64, f64)> = rels
        .par_iter()
        .filter_map(|rel| {
            let p = root.join(rel.replace('/', std::path::MAIN_SEPARATOR_STR));
            let m = std::fs::metadata(&p).ok()?;
            let (size, mt) = (m.len(), mtime(&m));
            if let Some(&(s, t, secs)) = cache.files.get(rel) {
                if s == size && t == mt {
                    return Some((rel.clone(), s, t, secs));
                }
            }
            Some((rel.clone(), size, mt, seconds(&p, size).unwrap_or(0.0)))
        })
        .collect();
    let changed = fresh.len() != cache.files.len() || fresh.iter().any(|(r, s, t, _)| cache.files.get(r).map_or(true, |&(a, b, _)| a != *s || b != *t));
    cache.files = fresh.into_iter().map(|(r, s, t, d)| (r, (s, t, d))).collect();
    if changed {
        if let Ok(b) = serde_json::to_vec(&cache) {
            let _ = std::fs::write(&cp, b);
        }
    }
    cache.files.into_iter().map(|(r, (_, _, d))| (r, d)).collect()
}

/// The length of one file, in seconds.
pub fn seconds(p: &Path, size: u64) -> Option<f64> {
    let ext = p.extension().map(|e| e.to_string_lossy().to_lowercase()).unwrap_or_default();
    let mut f = File::open(p).ok()?;
    match ext.as_str() {
        "mp3" => mp3(&mut f, size),
        "wav" => wav(&mut f, size),
        "wma" | "wmv" | "asf" => asf(&mut f),
        _ => None,
    }
}

fn read_at(f: &mut File, at: u64, n: usize) -> Option<Vec<u8>> {
    f.seek(SeekFrom::Start(at)).ok()?;
    let mut b = vec![0u8; n];
    let got = f.take(n as u64).read(&mut b).ok()?;
    b.truncate(got);
    Some(b)
}
fn u32be(b: &[u8], i: usize) -> Option<u32> {
    Some(u32::from_be_bytes(b.get(i..i + 4)?.try_into().ok()?))
}
fn u32le(b: &[u8], i: usize) -> Option<u32> {
    Some(u32::from_le_bytes(b.get(i..i + 4)?.try_into().ok()?))
}
fn u64le(b: &[u8], i: usize) -> Option<u64> {
    Some(u64::from_le_bytes(b.get(i..i + 8)?.try_into().ok()?))
}

// ---------------------------------------------------------------- MP3

struct Frame {
    /// 1 = MPEG-1, 2 = MPEG-2, 25 = MPEG-2.5
    version: u8,
    layer: u8,
    bitrate: u32,
    rate: u32,
    mono: bool,
    len: usize,
}

fn frame(h: u32) -> Option<Frame> {
    if h & 0xFFE0_0000 != 0xFFE0_0000 {
        return None;
    }
    let version = match (h >> 19) & 3 {
        0 => 25,
        2 => 2,
        3 => 1,
        _ => return None,
    };
    let layer = match (h >> 17) & 3 {
        1 => 3,
        2 => 2,
        3 => 1,
        _ => return None,
    };
    let bi = ((h >> 12) & 0xF) as usize;
    let ri = ((h >> 10) & 3) as usize;
    if bi == 0 || bi == 15 || ri == 3 {
        return None;
    }
    const V1: [[u32; 15]; 3] = [
        [0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448],
        [0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384],
        [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
    ];
    const V2: [[u32; 15]; 2] = [
        [0, 32, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 224, 256],
        [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
    ];
    let bitrate = 1000 * if version == 1 { V1[layer as usize - 1][bi] } else { V2[if layer == 1 { 0 } else { 1 }][bi] };
    let rate = [44100, 48000, 32000][ri] / if version == 1 { 1 } else if version == 2 { 2 } else { 4 };
    let pad = ((h >> 9) & 1) as usize;
    let len = if layer == 1 {
        (12 * bitrate as usize / rate as usize + pad) * 4
    } else if layer == 3 && version != 1 {
        72 * bitrate as usize / rate as usize + pad
    } else {
        144 * bitrate as usize / rate as usize + pad
    };
    Some(Frame { version, layer, bitrate, rate, mono: (h >> 6) & 3 == 3, len })
}

fn samples_per_frame(fr: &Frame) -> u32 {
    match fr.layer {
        1 => 384,
        2 => 1152,
        _ if fr.version == 1 => 1152,
        _ => 576,
    }
}

fn mp3(f: &mut File, size: u64) -> Option<f64> {
    // the ID3v2 tag in front (its size is «syncsafe»: 7 bits a byte)
    let head = read_at(f, 0, 10)?;
    let mut start = 0u64;
    if head.len() == 10 && &head[0..3] == b"ID3" {
        let s = head[6..10].iter().fold(0u64, |a, &x| (a << 7) | (x & 0x7F) as u64);
        start = 10 + s + if head[5] & 0x10 != 0 { 10 } else { 0 };
    }
    // the first frame: its header, and the next frame where it says (so a stray 0xFFE is not taken for one)
    let buf = read_at(f, start, 256 * 1024)?;
    let mut i = 0;
    let (at, fr) = loop {
        if i + 4 > buf.len() {
            return None;
        }
        if buf[i] == 0xFF && buf[i + 1] & 0xE0 == 0xE0 {
            if let Some(fr) = frame(u32be(&buf, i)?) {
                let next = i + fr.len;
                let ok = fr.len > 0 && (next + 4 > buf.len() || u32be(&buf, next).and_then(frame).is_some());
                if ok {
                    break (i, fr);
                }
            }
        }
        i += 1;
    };
    let b = &buf[at..];
    // Xing / Info: after the side information
    let side = match (fr.version == 1, fr.mono) {
        (true, false) => 32,
        (true, true) => 17,
        (false, false) => 17,
        (false, true) => 9,
    };
    let x = 4 + side;
    if b.len() > x + 12 && (&b[x..x + 4] == b"Xing" || &b[x..x + 4] == b"Info") {
        let flags = u32be(b, x + 4)?;
        if flags & 1 != 0 {
            let frames = u32be(b, x + 8)?;
            if frames > 0 {
                return Some(frames as f64 * samples_per_frame(&fr) as f64 / fr.rate as f64);
            }
        }
    }
    // VBRI (Fraunhofer): 32 bytes after the header
    if b.len() > 36 + 18 && &b[36..40] == b"VBRI" {
        let frames = u32be(b, 36 + 14)?;
        if frames > 0 {
            return Some(frames as f64 * samples_per_frame(&fr) as f64 / fr.rate as f64);
        }
    }
    // constant bitrate: the bytes of sound over the bytes a second (without an ID3v1 tag at the end)
    let tail = read_at(f, size.saturating_sub(128), 3).unwrap_or_default();
    let end = if tail == b"TAG" { size - 128 } else { size };
    let bytes = end.saturating_sub(start + at as u64);
    (fr.bitrate > 0).then(|| bytes as f64 * 8.0 / fr.bitrate as f64)
}

// ---------------------------------------------------------------- WAV

fn wav(f: &mut File, size: u64) -> Option<f64> {
    let h = read_at(f, 0, 12)?;
    if h.len() < 12 || &h[0..4] != b"RIFF" || &h[8..12] != b"WAVE" {
        return None;
    }
    let mut at = 12u64;
    let mut byte_rate = 0u32;
    while at + 8 <= size {
        let c = read_at(f, at, 8)?;
        if c.len() < 8 {
            break;
        }
        let len = u32le(&c, 4)? as u64;
        match &c[0..4] {
            b"fmt " => byte_rate = u32le(&read_at(f, at + 8, 16)?, 8)?,
            b"data" if byte_rate > 0 => {
                // a recorder that did not close the file writes 0 or 0xFFFFFFFF: the rest of the file
                let data = if len == 0 || len == 0xFFFF_FFFF || at + 8 + len > size { size - at - 8 } else { len };
                return Some(data as f64 / byte_rate as f64);
            }
            _ => {}
        }
        at += 8 + len + (len & 1);
    }
    None
}

// ---------------------------------------------------------------- WMA / WMV (ASF)

fn asf(f: &mut File) -> Option<f64> {
    const HEADER: [u8; 16] = [0x30, 0x26, 0xB2, 0x75, 0x8E, 0x66, 0xCF, 0x11, 0xA6, 0xD9, 0x00, 0xAA, 0x00, 0x62, 0xCE, 0x6C];
    const PROPS: [u8; 16] = [0xA1, 0xDC, 0xAB, 0x8C, 0x47, 0xA9, 0xCF, 0x11, 0x8E, 0xE4, 0x00, 0xC0, 0x0C, 0x20, 0x53, 0x65];
    let b = read_at(f, 0, 64 * 1024)?;
    if b.len() < 30 || b[0..16] != HEADER {
        return None;
    }
    let mut at = 30usize;
    while at + 24 <= b.len() {
        let len = u64le(&b, at + 16)? as usize;
        if b[at..at + 16] == PROPS {
            // play duration (100 ns) at +64, preroll (ms) at +80
            let play = u64le(&b, at + 64)? as f64 / 1e7;
            let pre = u64le(&b, at + 80)? as f64 / 1000.0;
            return Some((play - pre).max(0.0));
        }
        if len < 24 {
            break;
        }
        at += len;
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    /// The real folder of Whisper's recordings, when it is there: how many get a length, and a few of them.
    #[test]
    #[ignore]
    fn audios_folder() {
        let folder = r"O:\Gaudiya Vaisnavas DB\Biblioteca\Srila Gurudeva mp3";
        let (mut n, mut ok, mut none) = (0, 0, vec![]);
        for d in walkdir::WalkDir::new(folder).into_iter().filter_map(|d| d.ok()).filter(|d| d.file_type().is_file()) {
            let p = d.path();
            let ext = p.extension().map(|e| e.to_string_lossy().to_lowercase()).unwrap_or_default();
            if !["mp3", "wav", "wma", "wmv"].contains(&ext.as_str()) {
                continue;
            }
            n += 1;
            match seconds(p, d.metadata().unwrap().len()) {
                Some(s) if s > 0.5 => {
                    ok += 1;
                    if ok % 900 == 1 {
                        println!("{:>8.0} s  {}", s, p.display());
                    }
                }
                _ => none.push(p.display().to_string()),
            }
        }
        println!("{ok} / {n} with a length; without: {:?}", &none[..none.len().min(20)]);
    }
}
