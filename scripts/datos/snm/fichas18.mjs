// node fichas18.mjs [puerto] [--dry]   (17-11-2026) — conferencias de SNM, tanda 18:
// · #1809: quitar «other sources: Gaura Pūrṇimā 1952» del campo guru (Whisper, 17-11-2026);
// · ficha NUEVA «Śrīla Nayanānanda Dāsa Bābājī Mahārāja» (Satīśa Candra Brahmacārī), discípulo de dīkṣā de #124, con el
//   texto de la charla de SNM en su partida (21-01-2003). Si ya existe con ese nombre exacto, no se crea otra.
import { aplicar, SRC } from "./aplicar.mjs";

const NAME = "Śrīla Nayanānanda Dāsa Bābājī Mahārāja";
const fields = {
  name: NAME,
  aka: "Satīśa Candra Brahmacārī (his name at initiation), Nayanānanda Bābājī",
  appearance: "",
  disappearance: "January 2003",
  place: "Initiated at Śrīdhāma Māyāpura; in charge of Śrī Campahaṭṭa Gauḍīya Maṭha, Campahāṭi (Navadvīpa)",
  guru: "Śrīla Bhaktisiddhānta Sarasvatī Ṭhākura (dīkṣā, at Māyāpura); bābājī-veśa from Śrīla Bhakti Pramoda Purī Gosvāmī Mahārāja (about 1999)",
  disciples: "",
  works: "",
  notes: "",
  tags: "",
};

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const port = args.find((a) => a !== "--dry") || "9334";
// 1) the record: found by its exact name, or created and placed under Śrīla Bhaktisiddhānta Sarasvatī (#124) as dīkṣā
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket((list.find((p) => p.type === "page" && /tauri.localhost|localhost:1421/.test(p.url)) ?? list.find((p) => p.type === "page")).webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const rows = await inv("list_persons");
  const old = rows.find((p) => p.name === ${JSON.stringify(NAME)});
  if (old) return { id: old.id, made: false };
  if (${dry}) return { id: null, made: false };
  const id = await inv("new_person", { fields: ${JSON.stringify(fields)} });
  await inv("move_person", { id, place: { parent: 124, before: null } });
  await inv("set_tree_kind", { id, kind: "diksa" });
  return { id, made: true };
} catch (e) { return { error: String(e) }; } })()`;
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
const made = await new Promise((resolve) => (ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id === 1) resolve(d.result?.result?.value); }));
ws.close();
console.log("ficha:", JSON.stringify(made));
if (made?.error) process.exit(1);

const F = [
  {
    id: 1809,
    name: "Śrīla Bhaktivedānta Nārāyaṇa Gosvāmī Mahārāja",
    set: { guru: "Śrīla Bhakti Prajñāna Keśava Gosvāmī Mahārāja (harināma and dīkṣā on Gaura Pūrṇimā 1947; sannyāsa in 1954, in his own words)" },
  },
];
if (made?.id)
  F.push({
    id: made.id,
    name: NAME,
    notes:
      "From the lectures of Śrīla Nārāyaṇa Gosvāmī Mahārāja, who knew him from 1946: a disciple of Śrīla Bhaktisiddhānta Sarasvatī, initiated at Māyāpura as Satīśa Candra Brahmacārī; in 1946 he was in charge of the Śrī Campahaṭṭa Gauḍīya Maṭha and often came to pay respects to Śrīla Keśava Gosvāmī, his intimate godbrother, to Śrīla Śrīdhara Mahārāja and to Śrīla Bhakti Vilāsa Tīrtha Mahārāja; about 1999 he handed over the maṭha, received bābājī-veśa from Śrīla Bhakti Pramoda Purī Mahārāja and the name Nayanānanda dāsa Bābājī; he still joined the Vraja-maṇḍala and Gaura-maṇḍala parikramās and the Ratha-yātrā in Purī; he left this world in January 2003 (see the text «In the lectures…»).",
    text: `## In short

On the day of his departure, in January 2003, Śrīla Nārāyaṇa Gosvāmī Mahārāja wrote of the pain of losing «such a pure Vaisnava» as Śrīla Nayanānanda dāsa Bābājī Mahārāja, whom he had known since he joined the Gauḍīya Vedānta Samiti in 1946. A disciple of Śrīla Bhaktisiddhānta Sarasvatī, initiated at Māyāpura as Satīśa Candra Brahmacārī — «a very energetic, qualified and humble devotee» — he was then in charge of the Śrī Campahaṭṭa Gauḍīya Maṭha, and he often came to pay his respects to his intimate godbrother Śrīla Bhakti Prajñāna Keśava Gosvāmī, to Śrīla Bhakti Rakṣaka Śrīdhara Mahārāja and to Śrīla Bhakti Vilāsa Tīrtha Mahārāja. A few years before leaving he handed the maṭha over to others and received bābājī-veśa from Śrīla Bhakti Pramoda Purī Gosvāmī Mahārāja, with the name Nayanānanda dāsa Bābājī; even so, he came on the Vraja-maṇḍala and Gaura-maṇḍala parikramās and to the Ratha-yātrā, and always appreciated the preaching going on all over the world.

## In the lectures

- **A pure Vaiṣṇava** — «Feeling very unhappy in the absence of his physical presence, I want to express that wehave lost the association of such a pure Vaisnava as Sri Srila Nayanananda Babaji Maharaja» (2003-01-21).
- **His initiation** — «He received initiation in Sridhama Mayapura and was given the name Satish CandraBrahmachari. He was a very energetic, qualified and humble devotee» (2003-01-21).
- **Campahaṭṭa** — «When I first met himin 1946 he was the matha commander of Sri Campahatta Gaudiya Matha in Champahati» (2003-01-21). «They were intimate god-brothers» (2003-01-21).
- **Bābājī-veśa** — «he received babaji-vesa from nitya-lila pravista om visnupada SriSrila Bhakti Pramoda Puri Gosvami Maharaja and was given the name Nayanananda dasaBabaji Maharaja» (2003-01-21).
- **To the end** — «Even very recently he used to come with us on our Sri Vraja MandalaParikrama, Sri Gaura Mandala Parikrama, and the chariot festival in Sri Ksetra-dhama» (2003-01-21).

## Sources

${SRC}: «The Disappearance of Nayanananda Das Babaji Maharaj» (21 January 2003).`,
  });
await aplicar(F);
