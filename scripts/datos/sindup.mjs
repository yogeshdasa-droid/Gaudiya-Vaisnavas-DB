// node sindup.mjs <puerto> [--dry <carpeta>] docId…
// Takes out of each text the pieces that repeat what the same text already said (the same import pasted
// twice, or a «v.1» copy after the original). Unit: the sentence (or line); a sentence counts as repeated
// when, without accents, spaces or punctuation, it was already seen earlier in the text (> 30 letters).
// Only runs of 3 or more repeated sentences go (short lines inside a run go with it), so a quotation
// said twice stays. The first time is always kept. Each part of the text is saved apart (its earlier
// version is kept); a part left empty is removed. Headings left with nothing under them go too.
// --dry: writes <carpeta>/<doc>.txt (new text) and changes nothing. Twice = nothing new.
// --ficha (06-11-2026): a sentence also counts as said before when another text of the same record has it
// (for a chapter just moved from a book into a record that already tells part of it).
import fs from "node:fs";
const args = process.argv.slice(2);
const port = args.shift();
let dry = null, ficha = false;
if (args[0] === "--ficha") { args.shift(); ficha = true; }
if (args[0] === "--dry") { args.shift(); dry = args.shift(); fs.mkdirSync(dry, { recursive: true }); }
if (args[0] === "--ficha") { args.shift(); ficha = true; }
const docs = args.map(Number);
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = list.find((p) => p.url.includes("localhost:1421") || p.url.includes("tauri.localhost"));
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const run = (expr) =>
  new Promise((res) => {
    ws.onmessage = (m) => { const r = JSON.parse(m.data).result; res(r?.exceptionDetails ? { error: r.exceptionDetails.exception?.description } : r?.result?.value); };
    ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
  });
for (const doc of docs) {
  const out = await run(`(async () => {
    const inv = window.__TAURI_INTERNALS__.invoke;
    const d = await inv("get_doc", { id: ${doc} });
    if (d.doc.deleted) return { error: "doc in the bin" };
    const secs = (await inv("get_sections", { docId: ${doc}, from: 0, to: d.doc.sections - 1 })).map((s) => s.text);
    const norm = (s) => s.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");
    // tokens: sentence or line, with what follows it
    const toks = [];
    secs.forEach((t, si) => { for (const m of t.matchAll(/[^\\n.!?]*(?:[.!?]+["'’”)\\]]*|\\n|$)[ \\t]*\\n*/g)) if (m[0]) toks.push({ si, t: m[0], n: norm(m[0]) }); });
    const seen = new Set();
    if (${ficha ? "true" : "false"} && d.doc.personId != null) {
      const p = await inv("get_person", { id: d.doc.personId });
      for (const o of p.docs) {
        if (o.id === ${doc}) continue;
        const od = await inv("get_doc", { id: o.id });
        const os = await inv("get_sections", { docId: o.id, from: 0, to: od.doc.sections - 1 });
        for (const s of os) for (const m of s.text.matchAll(/[^\\n.!?]*(?:[.!?]+["'’”)\\]]*|\\n|$)[ \\t]*\\n*/g)) { const x = norm(m[0]); if (x) seen.add(x); }
      }
    }
    for (const k of toks) { k.long = k.n.length > 30; k.was = !!k.n && seen.has(k.n); k.dup = k.long && k.was; if (k.n) seen.add(k.n); }
    // runs of repeated sentences (short tokens between them belong to the run)
    let i = 0, cut = 0;
    while (i < toks.length) {
      if (!toks[i].dup) { i++; continue; }
      let j = i, longs = 0, last = i;
      while (j < toks.length && (toks[j].dup || !toks[j].long)) { if (toks[j].dup) { longs++; last = j; } j++; }
      // a short piece just after the run that was also said before goes with it («In 1885 AD»)
      while (longs >= 3 && last + 1 < toks.length && !toks[last + 1].long && (toks[last + 1].was || !toks[last + 1].n)) last++;
      if (longs >= 3) { for (let k = i; k <= last; k++) { toks[k].drop = true; cut += toks[k].t.length; } }
      i = last + 1;
    }
    if (!cut) return { doc: ${doc}, title: d.doc.title, cut: 0 };
    const nw = secs.map(() => "");
    for (const k of toks) if (!k.drop) nw[k.si] += k.t;
    // a short heading with nothing under it (up to a heading of its level or higher, or the end) goes
    const tidy = (t) => {
      const ls = t.split("\\n");
      const lev = (l) => { const m = /^(#{1,6}) /.exec(l); return m && l.length < 200 ? m[1].length : 0; };
      const keep = ls.map((l, i) => {
        const h = lev(l);
        if (!h) return true;
        for (let j = i + 1; j < ls.length; j++) {
          if (!ls[j].trim()) continue;
          const h2 = lev(ls[j]);
          return !(h2 && h2 <= h);
        }
        return false;
      });
      return ls.filter((_, i) => keep[i]).join("\\n").replace(/\\n{3,}/g, "\\n\\n");
    };
    const fin = nw.map(tidy);
    const before = secs.join("").length, after = fin.join("").length;
    if (${dry ? "true" : "false"}) return { doc: ${doc}, title: d.doc.title, before, after, text: fin.join("\\n<<PART>>\\n") };
    for (let n = fin.length - 1; n >= 0; n--) if (fin[n] !== secs[n]) await inv("save_section", { docId: ${doc}, ordinal: n, text: fin[n].trim() ? fin[n] : "" });
    return { doc: ${doc}, title: d.doc.title, before, after };
  })()`);
  if (out?.text !== undefined) { fs.writeFileSync(`${dry}/${doc}.txt`, out.text, "utf8"); delete out.text; }
  console.log(JSON.stringify(out));
}
ws.close();
