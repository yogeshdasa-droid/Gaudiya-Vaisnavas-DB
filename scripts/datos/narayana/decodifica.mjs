// node decodifica.mjs <vocab.json> <crudo.txt> <salida-sin-extension>   (22-11-2026)
// Una tipografía propia de un PDF sale de pdftotext como símbolos sueltos («K¨§ÃaÕs» = «Kṛṣṇa’s», «N€r€yaŠa» = «Nārāyaṇa»).
// Cada símbolo es siempre la misma letra dentro de un libro: se APRENDE votando contra el vocabulario de los libros bien
// leídos (vocab.mjs): por cada trozo de palabra con símbolos, las palabras conocidas de la misma longitud que coinciden en
// las letras seguras dicen qué letra es cada símbolo. Varias rondas (lo aprendido deja trozos con un solo símbolo).
// Mayúsculas: un símbolo que casi siempre va a principio de trozo (con el resto en minúscula) o dentro de una palabra en
// MAYÚSCULAS es la mayúscula. Escribe <salida>.map.json (mapa + estadística) y <salida>.dec.txt (texto decodificado).
import fs from "node:fs";

export const LEGIT = /[áéíóúñüÁÉÍÓÚÑÜ¿¡°·«»©]|[Ā-őŔ-şŢ-ŷŹ-żḀ-ỿ]|[‐-―•…●]/u;
const IAST_LOWER = "āīūṛṝḷḹṅñṭḍṇśṣṁṃḥ";
const isQuote = (c) => c >= "‘" && c <= "„";
const isWordChar = (c) => /[A-Za-z]/.test(c) || c.codePointAt(0) > 126;

export function decode(vocab, text0, log = () => {}) {
  const text = text0.normalize("NFC"); // marks written apart (a + combining macron) become one letter
  const byLen = new Map();
  for (const [w, k] of Object.entries(vocab)) {
    const L = w.length;
    (byLen.get(L) || byLen.set(L, []).get(L)).push([w, k]);
  }
  // 1. which symbols are suspect (not a letter that is right as it is)
  // English book: every non-ASCII symbol is a candidate (even «é», «ñ», «…» may be a letter of the font; the vote leaves it
  // as it is if it is right). Spanish book: its own accents stay out.
  const spanish = (text.match(/\b(de|la|que|el|los|las|del)\b/gi) || []).length > 2 * (text.match(/\b(the|of|and|to|is)\b/gi) || []).length;
  const TYPO = new Set("“”‘’‚„–—•·°«»©¿¡");
  const freq = new Map();
  for (const c of text) if (c.codePointAt(0) > 126 && !TYPO.has(c) && !(spanish && LEGIT.test(c) && !/[…†‡‰‹›]/.test(c))) freq.set(c, (freq.get(c) || 0) + 1);
  log(spanish ? "libro en español" : "libro en inglés");
  // quote marks only when they sit INSIDE words (a font that has «ī» on the key of ”)
  const quoteIn = new Map(), quoteAll = new Map();
  for (const m of text.matchAll(/(.)(.)(.)/gsu)) {
    const [, a, b, c] = m;
    if (isQuote(b)) {
      quoteAll.set(b, (quoteAll.get(b) || 0) + 1);
      if (/[A-Za-z]/.test(a) && /[A-Za-z]/.test(c)) quoteIn.set(b, (quoteIn.get(b) || 0) + 1);
    }
  }
  const suspect = new Set([...freq.keys()].filter((c) => freq.get(c) >= 3));
  for (const q of quoteAll.keys()) if ((quoteIn.get(q) || 0) >= 20 && quoteIn.get(q) / quoteAll.get(q) >= 0.5 && !/’/.test(q)) suspect.add(q);
  log(`símbolos sospechosos: ${[...suspect].join("")}`);

  // 2. pieces (split at hyphens and at everything that is not a letter/symbol)
  const pieces = new Map(); // piece (original case) → count
  for (const m of text.matchAll(/[A-Za-z\u0080-￿]+/g)) {
    for (const p of m[0].split(/-/)) if (p.length >= 2) pieces.set(p, (pieces.get(p) || 0) + 1);
  }
  const withSusp = [...pieces].filter(([p]) => [...p].some((c) => suspect.has(c)));
  log(`trozos con símbolos: ${withSusp.length}`);

  const map = new Map(); // symbol → lower letter
  const votes = new Map(); // symbol → Map(letter → weight)
  const matchVocab = (p) => {
    const chars = [...p.toLowerCase()];
    const cands = byLen.get(chars.length) || [];
    const hits = [];
    for (const [w, k] of cands) {
      let ok = true;
      for (let i = 0; i < chars.length; i++) {
        const c = chars[i];
        if (suspect.has(p[i]) && !map.has(p[i])) continue;
        const want = map.has(p[i]) ? map.get(p[i]) : c;
        if (want !== w[i]) { ok = false; break; }
      }
      if (ok) hits.push([w, k]);
    }
    return hits;
  };
  for (let round = 0; round < 5; round++) {
    votes.clear();
    for (const [p, n] of withSusp) {
      if (p.length > 24) continue;
      const unknown = [...p].map((c, i) => (suspect.has(c) && !map.has(c) ? i : -1)).filter((i) => i >= 0);
      if (!unknown.length || unknown.length > 3) continue;
      const hits = matchVocab(p);
      if (!hits.length || hits.length > 40) continue;
      const total = hits.reduce((a, [, k]) => a + k, 0);
      for (const [w, k] of hits)
        for (const i of unknown) {
          const c = p[i];
          const v = votes.get(c) || votes.set(c, new Map()).get(c);
          v.set(w[i], (v.get(w[i]) || 0) + (n * k) / total);
        }
    }
    let added = 0;
    for (const [c, v] of votes) {
      if (map.has(c)) continue;
      const tot = [...v.values()].reduce((a, b) => a + b, 0);
      const [best, w] = [...v.entries()].sort((a, b) => b[1] - a[1])[0];
      if (tot >= 6 && w / tot >= 0.6 && IAST_LOWER.includes(best)) (map.set(c, best), added++); // a symbol is never a plain letter
    }
    log(`ronda ${round + 1}: +${added} símbolos (${map.size}/${suspect.size})`);
    if (!added) break;
  }

  // 2a. elimination: if only ONE common letter of the font is still unassigned and only ONE frequent symbol is unmapped,
  // that symbol is that letter (it happens with the letter that has no word of its own in the vote, e.g. a lone «ô»)
  {
    const present = new Set(map.values());
    for (const l of IAST_LOWER) if (text.split(l).length - 1 >= 50) present.add(l);
    const missing = [..."āīūṛṅñṭḍṇśṣṁḥ"].filter((l) => !present.has(l));
    const lone = [...suspect].filter((c) => !map.has(c) && /\p{L}/u.test(c) && (freq.get(c) || 0) >= 200);
    if (missing.length === 1 && lone.length === 1) {
      map.set(lone[0], missing[0]);
      log(`por eliminación: ${lone[0]} → ${missing[0]}`);
    }
  }

  // 2b. punctuation that the font also moves: apostrophe inside words, quotes at their edges
  const punct = new Map();
  for (const c of suspect) {
    if (map.has(c)) continue;
    const isLetter = /\p{L}/u.test(c); // «Õ», «Ò», «Ô» are letters for Unicode but signs in the font
    let start = 0, end = 0, inner = 0, tot = 0, apos = 0;
    for (let i = text.indexOf(c); i >= 0; i = text.indexOf(c, i + 1)) {
      const a = text[i - 1] || " ", b = text[i + 1] || " ";
      const la = /\p{L}/u.test(a), lb = /\p{L}/u.test(b);
      tot++;
      if (la && lb) (inner++, /^(s|t|d|m|ll|re|ve)(?![\p{L}])/u.test(text.slice(i + 1, i + 4)) && apos++);
      else if (!la && lb) start++;
      else if (la && !lb) end++;
    }
    if (tot < 5) continue;
    // a letter is a sign only when it behaves like one: apostrophe before s/t/d…, or always at the edge of a word
    if (isLetter) {
      if (apos / tot >= 0.7) punct.set(c, "’");
      else if (start / tot >= 0.9) punct.set(c, "“");
      else if (end / tot >= 0.9) punct.set(c, "”");
      continue;
    }
    if (inner / tot >= 0.7) punct.set(c, "’");
    else if (start / tot >= 0.7) punct.set(c, "“");
    else if (end / tot >= 0.7) punct.set(c, "”");
  }
  if (punct.size) log(`puntuación: ${[...punct].map(([c, p]) => c + "→" + p).join(" ")}`);

  // 3. capitals: per occurrence
  const upperHint = (word, i) => {
    const c = word[i];
    const others = [...word].filter((x, j) => j !== i && /[A-Za-z]/.test(x));
    const letters = others.filter((x) => /[A-Za-z]/.test(x));
    if (letters.length >= 1 && letters.every((x) => x === x.toUpperCase())) return true; // all caps word
    const start = i === 0 || word[i - 1] === "-";
    return start && letters.length >= 1 && letters[0] === letters[0].toLowerCase();
  };
  const upCount = new Map(), allCount = new Map();
  for (const m of text.matchAll(/[A-Za-z\u0080-￿-]+/g)) {
    const w = m[0];
    for (let i = 0; i < w.length; i++) {
      if (!map.has(w[i])) continue;
      allCount.set(w[i], (allCount.get(w[i]) || 0) + 1);
      if (upperHint(w, i)) upCount.set(w[i], (upCount.get(w[i]) || 0) + 1);
    }
  }
  const capital = new Set([...map.keys()].filter((c) => (upCount.get(c) || 0) / (allCount.get(c) || 1) >= 0.85));
  const mixed = new Set([...map.keys()].filter((c) => !capital.has(c) && (upCount.get(c) || 0) / (allCount.get(c) || 1) >= 0.15));
  const up = (l) => l.toUpperCase();

  // 4. apply
  let replaced = 0, left = 0;
  const out = text.replace(/[A-Za-z\u0080-￿-]+/g, (w) => {
    if (![...w].some((c) => suspect.has(c))) return w;
    return [...w]
      .map((c, i, arr) => {
        if (!suspect.has(c)) return c;
        if (!map.has(c)) return punct.has(c) ? (replaced++, punct.get(c)) : (left++, c);
        replaced++;
        const l = map.get(c);
        const ww = arr.join("");
        return capital.has(c) || (mixed.has(c) && upperHint(ww, i)) ? up(l) : l;
      })
      .join("");
  });

  // 5. quality: pieces of the result with a diacritic that are in the vocabulary
  let good = 0, tot = 0;
  for (const m of out.matchAll(/[a-zA-ZāīūṛṝḷḹṅñṭḍṇśṣṁṃḥĀĪŪṚṜḶḸṄÑṬḌṆŚṢṀṂḤ]+/g)) {
    const w = m[0].toLowerCase();
    if (!/[āīūṛṝḷḹṅñṭḍṇśṣṁṃḥ]/.test(w)) continue;
    tot++;
    if (vocab[w]) good++;
  }
  const rest = [...suspect].filter((c) => !map.has(c) && !punct.has(c)).map((c) => `${c}${freq.get(c) || quoteAll.get(c)}`);
  return {
    text: out,
    stats: { suspect: [...suspect].join(""), punct: Object.fromEntries(punct), mapped: Object.fromEntries([...map].map(([c, l]) => [c, (capital.has(c) ? "↑" : mixed.has(c) ? "↕" : "") + l])), unmapped: rest, replaced, left, diacriticPieces: tot, inVocab: tot ? +(100 * good / tot).toFixed(1) : 0 },
  };
}

if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("decodifica.mjs")) {
  const [, , vocabPath, inPath, outBase] = process.argv;
  const vocab = JSON.parse(fs.readFileSync(vocabPath, "utf8"));
  const text = fs.readFileSync(inPath, "utf8");
  const r = decode(vocab, text, (m) => console.log("  " + m));
  fs.writeFileSync(outBase + ".dec.txt", r.text);
  fs.writeFileSync(outBase + ".map.json", JSON.stringify(r.stats, null, 1));
  console.log(JSON.stringify(r.stats));
}
