// Builds navadvipa3-real.json from navadvipa3.json for Whisper's DB, where Whisper had already split «Ramai»
// (05-11-2026): 1268 = the servant in Purī, 1961 = Śrīvāsa's brother; both named «Rāmāi», their old text in the notes.
import fs from "node:fs";
const g = JSON.parse(fs.readFileSync("navadvipa3.json", "utf8"));
const old1268 =
  "He was an attendant of Lord Caitanya. Caitanya Caritāmṛta 1.10.143-144 states that Ramai and Nandai, the twentieth and twenty-first amongst the devotees in Jagannātha Purī, always assisted Govinda in rendering service to the Lord day and night. Everyday Ramai filled twenty-two big water pots. He was Payoda in his past incarnation (Gaura- gaṇoddeśa- dīpikā 139). In Kṛṣṇadāsa Kavirāja's Śrī Caitanyagaṇoddeśadīpikā (ms. preserved in Orissa State Museum Catalogue no. L 470 {B}) Ramai's name is mentioned along with other followers like Singha Bhaṭṭa, Kamal Bhaṭṭa, Nandai.";
const old1961 =
  "He was the younger brother of Śrīvāsa Paṇḍit (Caitanya Caritāmṛta 1.10.8-11). In his past incarnation he was Parvat Muni, a favorite friend of Nārada Muni (Gaura- gaṇoddeśa- dīpikā 90). Ramai (alias Śrī Rāma Paṇḍit) accompanied Lord Gaurāṅga while singing kīrtana (Caitanya Bagavata 2.18.11-53). When Lord Caitanya revealed Himself to the devotees, Ramai was sent to carry the message to Advaita Ācārya in Śāntipura (Caitanya Bagavata 2.6.9-71). He participated in a drama, along with Śrīvāsa, in the house of Candrasekhar (Caitanya Bagavata 2.18.52).";
const out = g.map((r) => {
  if (r.name === "Śrīrāma Paṇḍita") {
    const { new: _n, move: _m, ...rest } = r;
    return { ...rest, id: 1961, name: "Rāmāi", fields: { name: "Śrīrāma Paṇḍita", ...r.fields, notes: r.fields.notes + "\n\n" + old1961 } };
  }
  if (r.id === 1268) return { ...r, name: "Rāmāi", fields: { ...r.fields, notes: r.fields.notes + "\n\n" + old1268 } };
  return r;
});
fs.writeFileSync("navadvipa3-real.json", JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(out.map((r) => (r.id ?? "new") + " " + r.name + " → " + (r.fields.name || r.name)).join("\n"));
