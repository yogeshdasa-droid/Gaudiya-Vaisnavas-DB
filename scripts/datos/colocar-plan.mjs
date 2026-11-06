// node colocar-plan.mjs <db> <out.json>   (06-11-2026)
// Records outside the Guru Paramparā whose «Guru» field names first exactly one record that is in the tree
// (its name or one of its other names) → plan [{id, name, parent, parentName, kind}] for colocar.mjs.
// Kind: «Lord Caitanya» → associate (pārṣada); the word in brackets (dīkṣā, śikṣā…); else dīkṣā when the notes
// say «disciple», else «disciple» (unspecified). Checked by hand: the ones in SKIP are left out (another guru of
// the same name, a teacher rather than a guru, or a record mixing persons); OVER fixes a guru matched wrongly.
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
const [, , file, out] = process.argv;
const SKIP = new Set([
  81, 390, // «Hṛdayānanda» of Gaurīdāsa's line, not Hṛdayānanda of Gadādhara's branch (507); 81 mixes several Balarāmas
  1537, // mixes Śyāmapriyā disciple of Śrīnivāsa and the wife of Śyāmānanda
  1675, // «Viṣṇudāsa» was his own name, not a guru
  521, // a Kṛṣṇadāsa Bābājī of Vṛndāvana in 1853, not Akiñcana Kṛṣṇadāsa Bābājī (1839)
  192, 578, 1212, 1509, // Sārvabhauma's family, students or a devotee he introduced: not his disciples
  451, // Hari Bhaṭṭa: guru not checked
  595, 414, 170, // repeated records, merged (grupo4-unir.json)
]);
const OVER = { 1055: 1466 }; // «Śrīnivāsa» = Śrīnivāsa Ācārya, not Śrīvāsa
const KIND_OVER = { 1213: [1851, "disciple"] }; // of Nityānanda's branch (Caitanya-caritāmṛta Ādi 11.26)
const f = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/^(sri|srila|srimad)\s+/g, "").replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
const db = new DatabaseSync(file, { readOnly: true });
const tree = new Set(db.prepare("select person_id from person_tree").all().map((r) => r.person_id));
const P = db.prepare("select id,name,aka,guru,notes from persons").all();
const byId = new Map(P.map((p) => [p.id, p]));
const names = new Map();
for (const p of P.filter((p) => tree.has(p.id))) for (const n of [p.name, ...(p.aka || "").split(",")]) { const k = f(n); if (k.length > 3) names.set(k, [...new Set([...(names.get(k) || []), p.id])]); }
const plan = [];
for (const p of P) {
  if (tree.has(p.id) || !p.guru?.trim() || SKIP.has(p.id)) continue;
  const firstPart = p.guru.split(/[;,\n]/)[0];
  const hit = names.get(f(firstPart.split("(")[0])) || [];
  if (hit.length !== 1 && !OVER[p.id]) continue;
  let parent = OVER[p.id] ?? hit[0];
  const said = (firstPart.match(/\(([^)]*)\)/)?.[1] ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  let kind = parent === 164 ? "associate"
    : /vani/.test(said) ? "vani" : /siksa/.test(said) ? "siksa" : /diksa|initiat/.test(said) ? "diksa" : /sannyasa/.test(said) ? "sannyasa" : /vesa|babaji/.test(said) ? "vesa"
    : /disciple|dikṣa|diksa|initiat/i.test(p.notes || "") ? "diksa" : "disciple";
  if (KIND_OVER[p.id]) [parent, kind] = KIND_OVER[p.id];
  plan.push({ id: p.id, name: p.name, parent, parentName: byId.get(parent).name, kind, guru: p.guru });
}
fs.writeFileSync(out, JSON.stringify(plan, null, 1), "utf8");
const count = {};
for (const x of plan) count[x.parentName + " / " + x.kind] = (count[x.parentName + " / " + x.kind] || 0) + 1;
console.log(plan.length, "records");
for (const [k, n] of Object.entries(count).sort((a, b) => b[1] - a[1])) console.log(n, k);
