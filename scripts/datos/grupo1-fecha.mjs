// node grupo1-fecha.mjs <port>   (06-11-2026, Whisper: «quito la fecha 8 October 1540 de la partida de Nityānanda»)
// Record 1851: the disappearance «8 October 1540» had no source (not in the Abhidhāna nor in the Gauḍīya
// calendar) → the field is emptied and the note says so. Twice = nothing new.
const list = await (await fetch("http://127.0.0.1:" + process.argv[2] + "/json")).json();
const page = list.find((p) => p.url.includes("localhost:1421") || p.url.includes("tauri.localhost"));
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
const OLD = "Disappearance: the date «8 October 1540» in this record has no source; the Abhidhāna and the Gauḍīya calendar do not give one.";
const NEW = "Disappearance: not given in the Abhidhāna nor in the Gauḍīya calendar; a date «8 October 1540» that this record had without a source was taken out (Whisper, 06-11-2026).";
const expr = `(async () => { try {
  const inv = window.__TAURI_INTERNALS__.invoke;
  const keys = ["name", "aka", "appearance", "disappearance", "place", "guru", "disciples", "works", "notes", "tags"];
  const p = await inv("get_person", { id: 1851 });
  if (p.name !== "Śrī Nityānanda Prabhu") return { error: "1851 is " + p.name };
  const f = Object.fromEntries(keys.map((k) => [k, p[k] ?? ""]));
  const nf = { ...f, disappearance: "", notes: f.notes.replace(${JSON.stringify(OLD)}, ${JSON.stringify(NEW)}) };
  if (!nf.notes.includes(${JSON.stringify(NEW)})) nf.notes = nf.notes.trimEnd() + "\\n\\n" + ${JSON.stringify(NEW)};
  if (JSON.stringify(nf) === JSON.stringify(f)) return ["1851: already done"];
  await inv("update_person", { id: 1851, fields: nf });
  return ["1851: disappearance «" + f.disappearance + "» taken out; note updated"];
} catch (e) { return { error: String(e) }; } })()`;
ws.onmessage = (m) => { console.log(JSON.stringify(JSON.parse(m.data).result?.result?.value)); ws.close(); process.exit(0); };
ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: expr, awaitPromise: true, returnByValue: true } }));
