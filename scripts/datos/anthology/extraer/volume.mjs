// node volume.mjs <volume folder> <out.json>  — one Bhakta Bandhav Anthology volume → { vol, title, place, year, cover, pdf,
// intro, toc, lectures: [{ title, place, date, text }] } (text in Markdown paragraphs).
// A lecture starts at a short centred line with a date, anywhere on a page:
//   A) title line(s), then «Holland, 25 June 2002» / «Murwillumbah, Australia - 11 January 1998» / «16 July 1999»
//   B) «6 May 1996», then the title line(s) and the place
// The book's own contents page is only read to count its dates, as a check.
import fs from "node:fs";
import path from "node:path";
import { decodePdf } from "./decode.mjs";
const MONTHS = "January|February|March|April|May|June|July|August|September|October|November|December";
const MI = Object.fromEntries(MONTHS.split("|").map((m, i) => [m, String(i + 1).padStart(2, "0")]));
const D1 = new RegExp(`(\\d{1,2})(?:st|nd|rd|th)?\\s*(${MONTHS}),?\\s*(\\d{4})`);
const D2 = new RegExp(`(${MONTHS})\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s*(\\d{4})`);
function dateIn(s) {
  let m = s.match(D1);
  if (m) return { at: m.index, len: m[0].length, iso: `${m[3]}-${MI[m[2]]}-${m[1].padStart(2, "0")}`, year: +m[3] };
  m = s.match(D2);
  if (m) return { at: m.index, len: m[0].length, iso: `${m[3]}-${MI[m[1]]}-${m[2].padStart(2, "0")}`, year: +m[3] };
  return null;
}
const clean = (s) => s.replace(/^[\s,.\-–—]+|[\s,.\-–—]+$/g, "").replace(/\s+/g, " ");

export async function readVolume(dir) {
  const pdf = fs.readdirSync(dir).find((f) => f.toLowerCase().endsWith(".pdf"));
  const opf = fs.readFileSync(path.join(dir, "metadata.opf"), "utf8");
  const title = opf.match(/<dc:title>([^<]+)/)?.[1] ?? path.basename(dir);
  const vol = +(title.match(/Vol-(\d+)/)?.[1] ?? 0);
  const volPlace = (title.match(/Vol-\d+\s+(.*?)\s+\d{4}/)?.[1] ?? "").trim();
  // decoded pages are kept in ./cache (reading a big PDF takes a minute)
  const cacheFile = path.join(import.meta.dirname, "cache", "v" + String(vol).padStart(2, "0") + ".pages.json");
  let pages;
  if (fs.existsSync(cacheFile)) pages = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
  else { pages = await decodePdf(path.join(dir, pdf)); fs.mkdirSync(path.dirname(cacheFile), { recursive: true }); fs.writeFileSync(cacheFile, JSON.stringify(pages)); }

  // contents: the page with «Contents», and its dates (a check of how many lectures there are)
  let tocPage = pages.findIndex((ls) => ls.slice(0, 3).some((l) => /^(table of )?contents$/i.test(l.t)));
  let tocDates = 0;
  if (tocPage >= 0) for (let p = tocPage; p < Math.min(pages.length, tocPage + 4); p++) {
    if (p > tocPage && pages[p].some((l) => /^introduction$/i.test(l.t))) break;
    for (const l of pages[p]) if (dateIn(l.t)) tocDates++;
  }
  // a year the font left unreadable («23 June DEEE»): the volume's year
  const vyear = title.match(/(\d{4})\s*$/)?.[1];
  if (vyear) for (const ls of pages) for (const l of ls) l.t = l.t.replace(new RegExp(`(\\d{1,2}\\s*(?:${MONTHS}))\\s+[A-Z]{4}$`), `$1 ${vyear}`);
  const lectures = [];
  let intro = null, cur = null, para = "", prev = "";
  const flush = () => { if (para.trim() && cur) cur.paras.push(para.trim()); para = ""; };
  const add = (l, margin) => {
    if (!cur) return;
    // a new paragraph: the line is indented and the one before ended a sentence (not the lines beside a big initial)
    if (l.x > margin + 6 && para && !/^[A-Z]$/.test(para) && /[.!?:”"’)\]]$/.test(prev)) flush();
    prev = l.t;
    if (/[-­]$/.test(para) && /^[a-z]/.test(l.t)) para = para.slice(0, -1) + l.t;
    else para += (para && !/^[A-Z]$/.test(para) ? " " : "") + l.t;
  };
  for (let pi = Math.max(0, tocPage + 1); pi < pages.length; pi++) {
    let ls = pages[pi];
    if (!ls.length) continue;
    // running header (short first line in capitals / with «=») and lone page numbers
    // (a lecture title in capitals has no page number: «GOVINDA DAMODARA MADHAVETI» stays; «HOUSTON, 11 JUNE 19963» goes)
    if (ls.length > 1 && ls[0].t.length < 60 && !(ls[1].t.length < 60 && dateIn(ls[1].t)) && (/=/.test(ls[0].t) || (/^[A-Z0-9 ,.’'&-]+$/.test(ls[0].t) && /\d|VOLUME|INTRODUCTION/.test(ls[0].t)))) ls = ls.slice(1);
    ls = ls.filter((l) => !/^[\dIVXLC]{1,6}$/.test(l.t));
    if (!ls.length) continue;
    const long = ls.filter((l) => l.t.length >= 55).map((l) => l.x);
    const margin = long.length ? Math.min(...long) : Math.min(...ls.map((l) => l.x));
    const centred = (l) => l && l.t.length < 80 && l.x > margin + 12;
    if (!cur && /^introduction$/i.test(ls[0].t)) { cur = intro = { title: "Introduction", paras: [] }; ls = ls.slice(1); }
    // the starts on this page: [index of first title line, index after the heading, lecture]
    const starts = [];
    for (let i = 0; i < ls.length; i++) {
      const l = ls[i];
      const d = centred(l) && dateIn(l.t);
      if (!d || d.year < 1990 || d.year > 2010) continue;
      if (l.x > margin * 4 && ls[i - 1] && ls[i - 1].x > margin * 3) continue; // a letter signed on the right
      // inside the introduction only a heading at the top of a page (its letters have dates too)
      if (cur === intro && cur && i > 3) continue;
      const before = clean(l.t.slice(0, d.at)), after0 = clean(l.t.slice(d.at + d.len));
      // a place: «Radlett», «Bath U.K.», «Radlett, UK», «Boven-Leeuwen, Holland» — capitalised words only
      const isPlace = (s) => s.length < 45 && /^[A-Z][\w’'.-]*(?:,?\s+[A-Z][\w’'.-]*){0,3}\.?$/.test(s.trim());
      // C: «15 May 1996, Radlett» / «17 May 1996 Radlett» / «17 May 1996,» + «Radlett» on the next line, then the title
      let cPlace = "", cFrom = i + 1;
      // D: «U.K. 22 May 1996», then the title in bigger letters
      if (before && !after0 && isPlace(before) && ls[i + 1] && ls[i + 1].t.length < 60 && ls[i + 1].z > l.z * 1.3 && /^[A-Z“"‘']/.test(ls[i + 1].t) && !(ls[i - 1] && centred(ls[i - 1]))) cPlace = before;
      else if (!before && after0 && after0.length < 45 && (/^\s*[,.]/.test(l.t.slice(d.at + d.len)) || isPlace(after0))) cPlace = after0;
      else if (!before && !after0 && ls[i + 1] && isPlace(ls[i + 1].t) && /,|^\S+$|U\.?K/.test(ls[i + 1].t.trim()) && ls[i + 2] && ls[i + 2].t.length < 60 && !isPlace(ls[i + 2].t)) { cPlace = clean(ls[i + 1].t); cFrom = i + 2; }
      if (cPlace) {
        let j = cFrom;
        const parts = [];
        while (j < ls.length && j - cFrom < 3 && ls[j].t.length < 60 && !/^(\[|Srila Gurudeva|Devotee|Gurudeva|[A-Z]$)/.test(ls[j].t) && !dateIn(ls[j].t) && !(parts.length && !/[A-Z]/.test(ls[j].t))) parts.push(ls[j++].t);
        const t = clean(parts.join(" "));
        if (t && t.length <= 110 && !/\[|Calcutta-4/.test(t)) { starts.push([i, j, { title: t, place: cPlace, date: d.iso }]); i = j - 1; continue; }
      }
      if (!before) {
        // B: the date first, then the title (maybe begun on the same line) and the place, centred
        const parts = after0 && !/^[\d\s.]*$/.test(after0) ? [after0] : [];
        let j = i + 1, place = "", wide = false;
        while (j < ls.length && j - i <= 4 && (centred(ls[j]) || ls[j].t.length < 60) && !dateIn(ls[j].t)) {
          if (parts.length && isPlace(ls[j].t) && (/,|U\.?K|USA/.test(ls[j].t) || (volPlace && ls[j].t.includes(volPlace.split(" ")[0])))) { place = clean(ls[j].t); j++; break; }
          if (!parts.length && !/^[A-Z“"‘'0-9]/.test(ls[j].t)) break;
          if (parts.length && !/[A-Z]/.test(ls[j].t)) break; // a verse after the title
          if (!centred(ls[j])) wide = true;
          parts.push(ls[j].t);
          j++;
        }
        if (parts.length && (place || (parts.length <= 2 && !wide))) {
          const t = clean(parts.join(" "));
          if (t.length <= 110 && !/\[|Calcutta-4/.test(t)) { starts.push([i, j, { title: t, place: place || volPlace, date: d.iso }]); i = j - 1; continue; }
        }
      }
      const rest = clean(before + " " + after0);
      // A: the title is the centred line(s) just before
      let k = i;
      const caps = (x) => x && x.t.length < 60 && /[A-Z]{3}/.test(x.t) && x.t === x.t.toUpperCase();
      while (k > 0 && i - k < 4 && (centred(ls[k - 1]) || caps(ls[k - 1])) && !dateIn(ls[k - 1].t)) k--;
      if (k === i) continue;
      const t = clean(ls.slice(k, i).map((x) => x.t).join(" "));
      if (t.length > 110 || /\[|Calcutta-4/.test(t)) continue;
      starts.push([k, i + 1, { title: t, place: rest && !/^[\d\s.]*$/.test(rest) ? rest : volPlace, date: d.iso }]);
    }
    let from = 0;
    for (const [a, b, lec] of starts) {
      for (const l of ls.slice(from, a)) add(l, margin);
      flush();
      let tt = lec.title.replace(/^(?:[IVX]{2,}|X)\s+(?=[A-Z])/, "");
      // a title in capitals → «Govinda Damodara Madhaveti»
      const up = (tt.match(/[A-Z]/g) || []).length, lo = (tt.match(/[a-z]/g) || []).length;
      if ((up > lo && /[A-Z]{3}/.test(tt)) || /^[A-Z]{3,}.*[a-z]+[A-Z]|[A-Z]{3}[a-z]/.test(tt))
        tt = tt.toLowerCase().replace(/(^|[\s“"‘(—-])([a-z])/g, (m, a, b) => a + b.toUpperCase()).replace(/\b(Of|And|The|To|In|Is|A|An|For|On|By|With|At|As|From)\b/g, (w, _x, i) => (i === 0 ? w : w.toLowerCase()));
      tt = tt.replace(/(?:Op|Oe)(?= [A-Z])/g, "Of");
      cur = { ...lec, title: tt, paras: [] };
      lectures.push(cur);
      from = b;
    }
    for (const l of ls.slice(from)) add(l, margin);
  }
  flush();
  // a big initial letter joined to its word: «F»+«irst» stays «First», but «I»+«explained» needs its space — whichever
  // word the rest of the volume uses
  const freq = new Map();
  for (const c of [intro, ...lectures].filter(Boolean)) for (const p of c.paras) for (const w of p.match(/[A-Za-z]+/g) || []) freq.set(w, (freq.get(w) || 0) + 1);
  for (const c of [intro, ...lectures].filter(Boolean))
    c.paras = c.paras.map((p) => p.replace(/^([A-Z])([a-z]+)/, (m, a, b) => ((freq.get(m) || 0) <= 1 && (freq.get(b) || 0) >= 2 ? a + " " + b : m)));
  const md = (c) => c.paras.join("\n\n");
  const year = +(title.match(/(\d{4})\s*$/)?.[1] ?? lectures[0]?.date.slice(0, 4) ?? 0);
  return {
    vol, title, place: volPlace, year, cover: path.join(dir, "cover.jpg"), pdf: path.join(dir, pdf),
    tocDates, intro: intro ? md(intro) : "",
    lectures: lectures.map((c) => ({ title: c.title, place: c.place, date: c.date, text: md(c) })),
  };
}
if ((process.argv[1] ?? "").endsWith("volume.mjs")) {
  const v = await readVolume(process.argv[2]);
  fs.writeFileSync(process.argv[3], JSON.stringify(v, null, 1));
  console.log(v.title, "|", v.place, v.year, "| intro", v.intro.length, "| contents dates", v.tocDates, "| found", v.lectures.length);
  for (const c of v.lectures) console.log(` ${c.date} · ${c.title} — ${c.place} (${c.text.length})`);
}
