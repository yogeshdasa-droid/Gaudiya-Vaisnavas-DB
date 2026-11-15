// Shared blocks for the «Vraja-Nitya-līlā» tandas, taken from texts already written (so they stay identical).
import fs from "node:fs";
const get = (file, id) => JSON.parse(fs.readFileSync(new URL("./" + file, import.meta.url), "utf8")).find((g) => g.id === id).text;
const between = (t, a, b) => t.slice(t.indexOf(a), t.indexOf(b, t.indexOf(a)));
export const UNK = "Ujjvala-nīlamaṇi-kiraṇa";
export const GC = "Gopāla-campū";
// the five kinds of sakhīs + the maidservants (vraja6, #618)
export const KINDS = between(get("vraja6.json", 618), "## " + UNK + " — the sakhīs who love", "## Sources");
export const SRC_K = `${UNK}, pp. xiii–xiv, 3–4, Dūtī-bheda 4 (pp. 20–22), Sakhī-bheda 5 (pp. 23–25), Rati-bheda (pp. 41–43), Āśraya-nirṇaya 15 (p. 46)`;
// the messengers (vraja4, #1378)
export const DUTI = between(get("vraja4.json", 1378), "## " + UNK + " — the messengers", "## Sources");
export const SRC_DUTI = `${UNK}, Dūtī-bheda 4 (pp. 20–22)`;
// Kṛṣṇa's cowherd friends (vraja3, #96)
export const FRIENDS = between(get("vraja3.json", 96), "## " + GC + " — Kṛṣṇa's cowherd friends", "## Sources");
export const SRC_F = `${GC}, Pūrva 14.10, 16.7, 16.14, 22.3; Uttara 1.15–16, 2.4, 31.46, 35.56; ${UNK}, Āśraya-nirṇaya 15 (pp. 45–46)`;
export const notNamed = (who) => `The Ujjvala-nīlamaṇi-kiraṇa and the Gopāla-campū do not name ${who}. What the Ujjvala-nīlamaṇi says of the sakhīs who love Śrī Rādhā more and of Her maidservants:`;
export const maid = (who, what) => `## In the Vraja-nitya-līlā

**${who}**, ${what}

${notNamed(who)}

${KINDS}## Sources

${SRC_K}.
`;
export const write = (name, plan) => {
  fs.writeFileSync(new URL("./" + name + ".json", import.meta.url), JSON.stringify(plan, null, 1));
  console.log(plan.length + " fichas");
};
// Kṛṣṇa's servants, singers and dancers (vraja8, #172)
export const SERVANTS = between(get("vraja8.json", 172), "## " + GC + " — Kṛṣṇa's servants", "## Sources");
export const SRC_S = `${GC}, Pūrva 2.64, 2.69–91, 3.12, 6.67, 10.23; Uttara 6.49–51, 35.3`;
export const textOf = get;
