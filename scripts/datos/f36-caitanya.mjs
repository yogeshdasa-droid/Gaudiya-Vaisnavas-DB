// node f36-caitanya.mjs [puerto]   (11-11-2026, batch 36) — a record that was missing: Siddha Caitanya dāsa Bābājī of
// Navadvīpa, named in four records: Jiyaḍa Nṛsiṁha Barāṭ #614 gave him dīkṣā in the Gaura-mantra; Rāmatanu
// Bhāgavata-bhūṣaṇa #1231 was his companion; he gave dīkṣā to Kṛṣṇadāsa Bābājī of Navadvīpa #1871 and to Gaura
// Kiśora Śiromaṇi #1818 (by the Sadguru-saṅga). Made once (found by its name), under 614 (dīkṣā); 1871 moved under
// him from the branch 2027; a dīkṣā line from 1818 (who stays under his veśa-guru). Twice = nothing.
const [, , port = "9333"] = process.argv;
const NAME = "Siddha Caitanya dāsa Bābājī (Navadvīpa)";
const fields = {
  name: NAME, aka: "Caitanya dāsa Bābā, Siddha Caitanyadāsa Bābājī", appearance: "", disappearance: "",
  place: "Navadvīpa (his samādhi)", guru: "Jiyaḍa Nṛsiṁha Barāṭ (dīkṣā in the Gaura-mantra)",
  disciples: "Kṛṣṇadāsa Bābājī of Navadvīpa (#1871); Gaura Kiśora Śiromaṇi (#1818)", works: "",
  notes: "A siddha bābā of Navadvīpa who worshipped Gaura in kānta-bhāva. Jiyaḍa Nṛsiṁha Barāṭ of Burdwan (#614) gave him dīkṣā in the Gaura-mantra; Rāmatanu Mukhopādhyāya Bhāgavata-bhūṣaṇa (#1231) met him by the Gaṅgā at Navadvīpa and they were inseparable, and at Rāmatanu's request he met Jiyaḍa Nṛsiṁha; by their preaching Bengal was flooded with Gaura-prema. He gave dīkṣā to Kṛṣṇadāsa Bābājī of Navadvīpa (#1871, who died in 1919 before his samādhi) and to Gaura Kiśora Śiromaṇi (#1818). Record made on 11-11-2026 from those four records.",
  tags: "",
};
const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(list.find((p) => p.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const log = [];
  let rows = await inv("list_persons");
  const row = (id) => rows.find((p) => p.id === id);
  if (!row(614)?.tree) return { error: "614 is not in the tree yet" };
  let id = rows.find((p) => p.name === ${JSON.stringify(NAME)})?.id;
  if (!id) { id = await inv("new_person", { fields: ${JSON.stringify(fields)} }); log.push("NEW " + id); rows = await inv("list_persons"); }
  if (!row(id).tree) {
    await inv("move_person", { id, place: { parent: 614, before: null } });
    await inv("set_tree_kind", { id, kind: "diksa" });
    await inv("set_line_info", { id, guru: null, note: "Dīkṣā in the Gaura-mantra from Jiyaḍa Nṛsiṁha (record of Jiyaḍa Nṛsiṁha Barāṭ).", disputed: false });
    log.push(id + " under 614 (diksa)");
  }
  rows = await inv("list_persons");
  if (row(1871)?.tree?.parent === 2027) {
    await inv("move_person", { id: 1871, place: { parent: id, before: null } });
    await inv("set_tree_kind", { id: 1871, kind: "diksa" });
    await inv("set_line_info", { id: 1871, guru: null, note: "Dīkṣā at thirty at Navadvīpa; veśa later from Dīnahīna dāsa Bābājī of Śrīhaṭṭa.", disputed: false });
    log.push("1871 moved from 2027 to " + id);
  }
  rows = await inv("list_persons");
  const g = row(1818);
  if (g?.tree && g.tree.parent !== id) {
    const now = (g.links || []).filter((l) => l.kind !== "family").map((l) => [l.guru, l.kind]);
    if (!now.some(([x]) => x === id)) { await inv("set_links", { id: 1818, links: [...now, [id, "diksa"]] }); log.push("1818: line diksa to " + id); }
  }
  return log;
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { const d = JSON.parse(m.data); console.log(JSON.stringify(d.result?.result?.value ?? d.result?.exceptionDetails ?? d, null, 1)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
