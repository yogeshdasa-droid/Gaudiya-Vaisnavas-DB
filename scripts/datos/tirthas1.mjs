// node tirthas1.mjs [puerto]   (07-11-2026)
// Holy places named in the records' «Place» field by two or more records that had no tīrtha page (the regions and
// loose words left out). Each gets its page with the spellings the records use (the app then lists by itself the
// records that name it), where it is, and what the records say; the source is «the records» (not the Abhidhāna's
// Tīrthas, like the others). Coordinates only where they are sure. And other spellings for three that exist.
// Found by name, never made twice.
const port = process.argv[2] ?? "9333";
const SRC = "The records (07-11-2026)";
const akaFor = {
  "Gopīvallabhapura": ["Gopīballabhpur", "Gopiballavapura", "Gopiballavapur"],
  "Belpukur": ["Belpukhuriyā", "Belpukhuriya", "Belpukuria"],
  "Kāñcrāpāḍā": ["Kāñcanapāḍā", "Kancanapada", "Kanchanapara"],
};
const add = [
  { name: "Śrīhaṭṭa", aka: "Sylhet, Srihatta, Śrīhaṭa, Sreehatta", region: "Sylhet, Bangladesh", lat: 24.9, lon: 91.87,
    about: "The land of the forefathers of Śrī Caitanya Mahāprabhu (Upendra Miśra and Jagannātha Miśra; Nīlāmbara Cakravartī) and the home of many of His associates: Advaita Ācārya (Lāuḍ, Navagrāma), Śrīvāsa Paṇḍita and his brothers, Murāri Gupta, Candraśekhara Ācārya." },
  { name: "Lāuḍ", aka: "Laud, Lauḍa, Lāuḍa", region: "Śrīhaṭṭa (Sylhet), Bangladesh",
    about: "The birthplace of Advaita Ācārya; the capital of King Divyasiṁha, whose minister was Kuvera Paṇḍita, Advaita's father." },
  { name: "Śāligrāma", aka: "Saligrama, Saligram, Śāligrām", region: "Nadīyā, West Bengal",
    about: "The home of the sons of Kaṁsāri Miśra: Sūryadāsa Sarakhela, Gaurīdāsa Paṇḍita, Kṛṣṇadāsa Sarakhela and their brothers; Jāhnavā and Vasudhā, Nityānanda's wives, were born here." },
  { name: "Naihāṭī", aka: "Naihati, Naihāṭi", region: "North 24 Parganas, West Bengal", lat: 22.89, lon: 88.42,
    about: "On the Gaṅgā: Padmanābha, the forefather of Rūpa and Sanātana Gosvāmī, settled here." },
  { name: "Dhāreṇḍā", aka: "Dharenda, Dharend, Dhārendā, Dharendra, Dhāreṇḍā-Bāhādurpur", region: "Paścima Medinīpura, West Bengal",
    about: "The birthplace of Śyāmānanda Prabhu (Dhāreṇḍā-Bāhādurpur); the village of the zamindar Bhīma and of the family of Rasamaya dāsa and Gopījanavallabha, the author of the Rasikamaṅgala." },
  { name: "Kāṇḍaḍā", aka: "Kandada, Kāṇḍaḍa", region: "Bardhamān, West Bengal",
    about: "The Śrīpāṭa of the Maṅgala Ṭhākura family (Jayagopāla dāsa, Balarāma dāsa)." },
  { name: "Tālakhaḍi", aka: "Talakhadi, Talkhari, Tālakhaḍī", region: "Jessore, Bangladesh",
    about: "The home of Padmanābha Cakravartī and Sītā Devī, the parents of Lokanātha Gosvāmī, who was born here." },
  { name: "Cakraśālā", aka: "Cakrasala, Chakrasala, Cakraśāla", region: "Chittagong, Bangladesh",
    about: "The home of Puṇḍarīka Vidyānidhi, and of Mukunda Datta and Vāsudeva Datta." },
  { name: "Bāklā-Candradvīpa", aka: "Bakla, Bāklā, Candradvīpa, Candradvipa, Bakla-Candradvipa", region: "Barisal, Bangladesh",
    about: "Where Kumāradeva, the father of Sanātana, Rūpa and Anupama, lived; Anupama (Vallabha) was born here." },
  { name: "Saidābād", aka: "Saidabad, Saidavad, Saiyadavada, Saidāvād", region: "Murshidabad, West Bengal", lat: 24.17, lon: 88.27,
    about: "The home of Kṛṣṇacaraṇa Cakravartī and of his son Rādhāramaṇa Cakravartī, in Narottama Ṭhākura's line; Viśvanātha Cakravartī studied and took dīkṣā here." },
  { name: "Galtā", aka: "Galta, Galtaji, Galtā-jī", region: "Jaipur, Rajasthan", lat: 26.92, lon: 75.86,
    about: "The seat near Jaipur where in 1718, at the assembly of the Vaiṣṇavas, Baladeva Vidyābhūṣaṇa established the Gauḍīya position." },
  { name: "Kasiāḍi", aka: "Kasiadi, Kāśiyāḍī, Kasiyadi", region: "Medinīpura, West Bengal",
    about: "The Śrīpāṭa of disciples of Śyāmānanda Prabhu (Kiśora, Uddhava)." },
  { name: "Kāndrā", aka: "Kandra", region: "Bardhamān, West Bengal (near Kāṭoyā)",
    about: "The birthplace of the padakartā Jñānadāsa." },
  { name: "Garbetā", aka: "Garbeta", region: "Paścima Medinīpura, West Bengal", lat: 22.86, lon: 87.36,
    about: "A Śrīpāṭa of the line of Kānu Ṭhākura." },
  { name: "Bhiṭādiyā", aka: "Bhitadiya, Bhiṭādiya", region: "Bengal",
    about: "The family home of Svarūpa Dāmodara Gosvāmī." },
  { name: "Borākulī", aka: "Borakuli, Borākuli", region: "Bengal",
    about: "The Śrīpāṭa of the family of Govinda Cakravartī (Rādhāvinoda, Rājavallabha, Kiśorī)." },
];
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const akaFor = ${JSON.stringify(akaFor)}, add = ${JSON.stringify(add)}, SRC = ${JSON.stringify(SRC)};
  const places = await inv("list_places");
  const log = [];
  for (const [name, more] of Object.entries(akaFor)) {
    const p = places.find((x) => x.name === name);
    if (!p) { log.push("no place " + name); continue; }
    const aka = [...new Set([...p.aka.split(",").map((s) => s.trim()), ...more].filter(Boolean))].join(", ");
    if (aka === p.aka) continue;
    const { id, modified, hasPhoto, images, ...fields } = p;
    await inv("save_place", { id, fields: { ...fields, aka } });
    log.push(name + ": aka + " + more.join(", "));
  }
  for (const a of add) {
    if (places.some((x) => x.name === a.name)) continue;
    const id = await inv("save_place", { id: null, fields: { name: a.name, aka: a.aka, region: a.region, location: "", about: a.about, source: SRC, lat: a.lat ?? null, lon: a.lon ?? null, people: [] } });
    log.push("NEW " + id + " " + a.name);
  }
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const d = JSON.parse(m.data); console.log(JSON.stringify(d.result?.result?.value ?? d.result?.exceptionDetails ?? d, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
