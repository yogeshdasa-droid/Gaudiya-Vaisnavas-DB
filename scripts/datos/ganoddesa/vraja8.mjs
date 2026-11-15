// node vraja8.mjs → vraja8.json («Vraja-Nitya-līlā», tanda 8: maidservants, singers and servants the books do not name;
// 15-11-2026). Whisper: «lo general, más info mejor». The first line is the Vraja form given in the record's Gaṇoddeśa.
import fs from "node:fs";
import { UNK, GC, KINDS, SRC_K, notNamed, write } from "./comun.mjs";

const gano = {};
for (const f of fs.readdirSync(new URL(".", import.meta.url)).filter((f) => /^(tanda\d+b?|decisiones|prueba1)\.json$/.test(f)))
  for (const g of JSON.parse(fs.readFileSync(new URL("./" + f, import.meta.url), "utf8"))) if (g.text) gano[g.id] = g;
const first = (id) => gano[id].text.match(/## In Kṛṣṇa-līlā\s*\n+([^\n]*)/)[1];
const who = (id) => first(id).match(/\*\*([^*]+)\*\*/)[1];

const SERVANTS = `## ${GC} — Kṛṣṇa's servants, singers and dancers

- **In His going out** (Pūrva-campū 2.64): «When Kṛṣṇa departed with Śrīrāma, Dāma and others, servants followed him with umbrella, cāmara, cloves and a box of betel, rare even for devatās.»
- **His care for them** (Uttara-campū 6.49–51): leaving Vraja, «Seeing his servants—the śūdras, abhīras, and young boys without discriminating power—and Nanda standing silently, Kṛṣṇa with tears in his eyes said, “Since they are all affectionate like my friends or my father and the elders, they will attain service following the elders and be praiseworthy.”» «Honoring his servants suitably, he informed the elders of their services.»
- **His wedding procession** (Uttara-campū 35.3): «Experts in heavenly music played the music. The dancers were skillful in dancing and singing. Priests walked in front… His friends walked on either side. **Servants walked while holding cāmaras.**»
- **His nurses**: «I remember Kṛṣṇa, the good fortune of Vraja, repeating new words like a parrot, pointing to objects and asking about them with his finger, being taught words by his nurses» (Pūrva-campū 6, verse 67); after lunch «the nurse gave him a golden box» of betel (10.23).
- **The singers of His pastimes**: the whole Gopāla-campū is sung in Nanda's assembly by the twin reciters Madhukaṇṭha and Snigdhakaṇṭha, disciples of Nārada (Pūrva-campū 2.69–91, 3.12).
`;
const SRC_S = `${GC}, Pūrva 2.64, 2.69–91, 3.12, 6.67, 10.23; Uttara 6.49–51, 35.3`;

const maidG = (id) => `## In the Vraja-nitya-līlā

${first(id)}

${notNamed(who(id))}

${KINDS}## Sources

${SRC_K}.
`;
const servG = (id, extra = "") => `## In the Vraja-nitya-līlā

${first(id)}

The Gopāla-campū and the Ujjvala-nīlamaṇi-kiraṇa do not name ${who(id)}. What the Gopāla-campū says of the servants, singers and dancers of Kṛṣṇa's house:
${extra}
${SERVANTS}
## Sources

${SRC_S}.
`;

const MAIDS = [244, 450, 495, 970, 567, 593, 616, 659, 674, 708, 832, 861, 869, 897, 974, 1004, 1070, 2166, 1090, 1410, 1442, 2163, 1461, 1491, 1635, 1638, 1950, 2164, 1832, 1654, 1815];
const SERV = [172, 1279, 1398, 2165, 1577, 1978, 967, 1268, 1652, 1362, 1007];

const plan = [
  ...MAIDS.map((id) => ({ id, name: gano[id].name, text: maidG(id) })),
  ...SERV.map((id) => ({ id, name: gano[id].name, text: servG(id) })),
  {
    id: 1949,
    name: gano[1949].name,
    text: servG(1949, `
The Gopāla-campū speaks of the parrots of Vṛndāvana as messengers: «A parrot taught by Vṛndā came and began speaking in front of Kṛṣṇa. “O hero of Vraja! Rādhā and other gopīs, in great pain… are tolerating the heat coming from the moon”» (Pūrva-campū 21.107, verse 54); Kṛṣṇa «began creating sweet sounds on experiencing the sweet messages sent by parrots, which he could understand» (27.13).
`).replace(`${SRC_S}.`, `${GC}, Pūrva 21.107, 27.13; ${SRC_S}.`),
  },
];
write("vraja8", plan);
