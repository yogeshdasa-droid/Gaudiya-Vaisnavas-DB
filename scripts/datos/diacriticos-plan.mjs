// node diacriticos-plan.mjs <db> <out.json>   (07-11-2026, asked by Whisper)
// Names written without diacritics («Kaviranjana», «Sinhesvara Odra»): each plain word is looked up in the
// way the database itself writes it with diacritics (names and «aka» of all records, the record's own notes and
// texts), counting the forms; the commonest one wins if it is clearly ahead. Words left as they are: those
// already with diacritics, English words, and those with no written form found (listed apart for a hand check).
// → [{ id, old, name, words: [[plain, written, count]], unsure: [plain words not found] }]
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
const [, , file, out] = process.argv;
const db = new DatabaseSync(file, { readOnly: true });
const fold = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const hasDia = (w) => w !== w.normalize("NFD").replace(/[̀-ͯ]/g, "") || /[ṁṅñ]/.test(w);
const people = db.prepare("select id, name, aka, notes from persons").all();
const textOf = (id) => db.prepare("select id from docs where person_id=? and deleted is null").all(id)
  .map((d) => db.prepare("select text from sections where doc_id=? order by ordinal").all(d.id).map((r) => r.text).join(" ")).join(" ");
const WORD = /[A-Za-zĀāĪīŪūṚṛṜṝḶḷṄṅÑñṬṭḌḍṆṇŚśṢṣḤḥṀṁ']+/g;
// all the written forms in the names and akas (weight 3) and in every text (weight 1)
const forms = new Map(); // folded → Map(written → count)
const addForms = (s, w) => {
  for (const m of (s || "").matchAll(WORD)) {
    const x = m[0];
    if (x.length < 3) continue;
    const k = fold(x);
    if (!forms.has(k)) forms.set(k, new Map());
    const f = forms.get(k);
    // the same capitals as the start of a name word
    const c = x[0].toUpperCase() + x.slice(1);
    f.set(c, (f.get(c) ?? 0) + w);
  }
};
// only the careful sources: the names and «aka» of the records in the tree (they were checked one by one),
// all notes, and the «Texto principal» texts (written for the records); not the raw imported texts, which
// mostly have no diacritics. The plain form counts too: a word wins its diacritics only if they are clearly
// the usual way of writing it.
const tree = new Set(db.prepare("select person_id from person_tree").all().map((r) => r.person_id));
for (const p of people) { addForms(p.aka, 2); addForms(p.notes, 1); }
for (const d of db.prepare("select s.text from sections s join docs d on d.id = s.doc_id where d.collection = 'Texto principal' and d.deleted is null").all()) addForms(d.text, 1);
const KEEP = new Set(["of", "the", "and", "or", "son", "wife", "father", "mother", "brother", "daughter", "disciple", "poet", "author", "others", "from", "in", "at", "translator", "king", "queen", "old", "branch", "line", "on", "with", "who", "went", "south", "mahanta", "calcutta", "orissa", "bengal", "punjab", "jaipur", "delhi"]);
const plan = [];
for (const p of people) {
  const words = [], unsure = [];
  let name = p.name;
  for (const m of p.name.matchAll(WORD)) {
    const w = m[0];
    if (w.length < 3 || hasDia(w) || KEEP.has(w.toLowerCase())) continue;
    const f = forms.get(fold(w));
    if (!f) { unsure.push(w); continue; }
    const best = [...f].sort((a, b) => b[1] - a[1]);
    // the plain form is the usual one: the word is right as it is
    if (!hasDia(best[0][0])) continue;
    // clearly ahead: at least 3 times the next form, and seen at least 3 times
    if (best[0][1] < 3 || (best.length > 1 && best[0][1] < 3 * best[1][1])) { unsure.push(w + " ? " + best.slice(0, 3).map(([x, n]) => x + "×" + n).join(" / ")); continue; }
    const written = w[0] === w[0].toLowerCase() ? best[0][0][0].toLowerCase() + best[0][0].slice(1) : best[0][0];
    words.push([w, written, best[0][1]]);
    name = name.replace(new RegExp(`(^|[^A-Za-z])${w}(?=$|[^A-Za-z])`), `$1${written}`);
  }
  if (words.length || unsure.length) plan.push({ id: p.id, old: p.name, name, words, unsure });
}
fs.writeFileSync(out, JSON.stringify(plan, null, 1));
const auto = plan.filter((x) => x.words.length && !x.unsure.length).length;
console.log(plan.length, "names with plain words:", auto, "all found,", plan.filter((x) => x.words.length && x.unsure.length).length, "partly,", plan.filter((x) => !x.words.length).length, "none found");
