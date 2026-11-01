import { useEffect, useMemo, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { Check, CheckCircle2, Download, ListChecks, ListTree, Search, Sparkles, Square, X, XCircle } from "lucide-react";
import { AiDone, AiStatus, api, Proposal, PullProgress } from "../api";
import { T } from "../i18n";
import { ask } from "./ui";

const SHOWN = 150;

/** Ajustes › Rellenar fichas: proposals for empty fields, accepted or discarded one by one. */
export function FillPane({ t, onToast, onChanged, onOpenPerson }: { t: T; onToast: (msg: string) => void; onChanged: () => void; onOpenPerson: (id: number) => void }) {
  const [list, setList] = useState<Proposal[] | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const load = () => api.fillList().then(setList, (e) => onToast(String(e)));
  useEffect(() => void load(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const run = (job: () => Promise<void>) => async () => {
    setBusy(true);
    try {
      await job();
    } catch (e) {
      onToast(String(e));
    } finally {
      setBusy(false);
    }
  };
  const gather = run(async () => {
    const n = await api.fillGather();
    onToast(t.fillFound(n));
    await load();
  });
  const decide = (ids: number[], yes: boolean) =>
    run(async () => {
      if (yes) {
        await api.fillAccept(ids);
        onChanged();
      } else await api.fillReject(ids);
      setList((l) => l && l.filter((x) => !ids.includes(x.id)));
    });

  const sources = useMemo(() => {
    const n = new Map<string, number>();
    for (const x of list ?? []) n.set(x.source, (n.get(x.source) ?? 0) + 1);
    return [...n];
  }, [list]);
  const shown = useMemo(() => (list ?? []).filter((x) => !source || x.source === source), [list, source]);
  // by record, keeping the order
  const groups = useMemo(() => {
    const out: { id: number; name: string; items: Proposal[] }[] = [];
    for (const x of shown.slice(0, SHOWN)) {
      const last = out[out.length - 1];
      if (last && last.id === x.personId) last.items.push(x);
      else out.push({ id: x.personId, name: x.person, items: [x] });
    }
    return out;
  }, [shown]);

  const acceptAll = run(async () => {
    if (!(await ask(t.fillAcceptAllConfirm(shown.length)))) return;
    const ids = shown.map((x) => x.id);
    const n = await api.fillAccept(ids);
    onChanged();
    onToast(t.fillAccepted(n));
    setList((l) => l && l.filter((x) => !ids.includes(x.id)));
  });

  const fieldLabel = (f: string) => (t as unknown as Record<string, string>)[f] ?? f;
  const sourceLabel = (s: string) => (s === "calendar" ? t.fillSourceCalendar : s === "disciples" ? t.fillSourceDisciples : s === "ai" ? t.fillSourceAi : s === "chronicle" ? t.fillSourceChronicle : s);

  return (
    <>
      <h3>{t.fillTitle}</h3>
      <p className="muted small">{t.fillHint}</p>
      <div className="btn-row">
        <button className="btn" disabled={busy} onClick={gather}>
          {busy ? <span className="spinner light" /> : <Search size={15} />} {t.fillGather}
        </button>
      </div>
      <AiSection t={t} onToast={onToast} onFound={load} />

      {list && list.length === 0 && <p className="muted">{t.fillNone}</p>}
      {list && list.length > 0 && (
        <>
          <div className="fill-bar">
            <button className={`chip clickable${source === null ? " on" : ""}`} onClick={() => setSource(null)}>
              {t.allTags} ({list.length})
            </button>
            {sources.map(([s, n]) => (
              <button key={s} className={`chip clickable${source === s ? " on" : ""}`} onClick={() => setSource(s)}>
                {sourceLabel(s)} ({n})
              </button>
            ))}
            <span className="grow" />
            <button className="btn ghost" disabled={busy || !shown.length} onClick={acceptAll}>
              <ListChecks size={15} /> {t.fillAcceptAll(shown.length)}
            </button>
          </div>
          <div className="fill-list">
            {groups.map((g) => (
              <div key={g.id} className="fill-person">
                <button className="link-btn fill-name" onClick={() => onOpenPerson(g.id)}>
                  {g.name}
                </button>
                {g.items.map((x) => (
                  <div key={x.id} className="fill-row">
                    <div className="fill-what">
                      <span className="fill-field">{fieldLabel(x.field)}</span>
                      <span className="fill-value">{x.value}</span>
                      <span className="chip">{sourceLabel(x.source)}</span>
                      {x.toTree && (
                        <span className="muted small" title={t.fillToTreeHint}>
                          <ListTree size={12} /> {t.fillToTree}
                        </span>
                      )}
                      {x.evidence && <div className="fill-evidence">{x.evidence}</div>}
                    </div>
                    <button className="icon-btn" title={t.fillAccept} disabled={busy} onClick={decide([x.id], true)}>
                      <Check size={16} />
                    </button>
                    <button className="icon-btn danger" title={t.fillReject} disabled={busy} onClick={decide([x.id], false)}>
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ))}
            {shown.length > SHOWN && <p className="muted small">{t.fillMore(shown.length - SHOWN)}</p>}
          </div>
        </>
      )}
    </>
  );
}

/** The local AI (Ollama) reading the texts of the records. */
function AiSection({ t, onToast, onFound }: { t: T; onToast: (msg: string) => void; onFound: () => void }) {
  const [st, setSt] = useState<AiStatus | null>(null);
  const [pull, setPull] = useState<PullProgress | null>(null);
  const load = () => api.aiStatus().then(setSt, (e) => onToast(String(e)));
  useEffect(() => {
    load();
    const unsubs = [
      listen<[number, number, string]>("ai-progress", (e) =>
        setSt((s) => s && { ...s, busy: true, done: e.payload[0], total: e.payload[1], current: e.payload[2] }),
      ),
      listen<AiDone>("ai-done", (e) => {
        onToast(t.aiDone(e.payload.records, e.payload.proposals, e.payload.failed));
        load();
        onFound();
      }),
      listen<string>("ai-error", (e) => {
        onToast(e.payload);
        load();
        onFound();
      }),
      listen<PullProgress>("ai-pull", (e) => setPull(e.payload)),
      listen<string | null>("ai-pull-done", (e) => {
        setPull(null);
        if (e.payload) onToast(e.payload);
        load();
      }),
    ];
    return () => unsubs.forEach((u) => u.then((f) => f()));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pct = (d: number, n: number) => (n ? Math.round((d / n) * 100) : 0);
  const ok = (yes: boolean, good: string, bad: string) => (
    <span className={yes ? "sem-ok" : "sem-bad"}>
      {yes ? <CheckCircle2 size={15} /> : <XCircle size={15} />} {yes ? good : bad}
    </span>
  );
  const start = async (limit: number | null) => {
    if (limit === null && !(await ask(t.aiAllConfirm))) return;
    api.aiStart(limit).then(load, (e) => onToast(String(e)));
  };
  if (!st) return null;
  return (
    <div className="fill-ai">
      <h4>
        <Sparkles size={15} /> {t.aiTitle}
      </h4>
      <p className="muted small">{t.aiHint}</p>
      <div className="sem-list">
        <div>
          <strong>{t.meaningOllama}</strong>
          {ok(st.ollama, t.meaningOllamaOk, t.meaningOllamaNo)}
          {!st.ollama && (
            <button className="btn ghost" onClick={() => api.openExternal("https://ollama.com/download")}>
              <Download size={15} /> {t.meaningOllamaGet}
            </button>
          )}
        </div>
        <div>
          <strong>{t.aiModel(st.modelName)}</strong>
          {ok(st.model, t.meaningModelOk, t.aiModelNo)}
          {st.ollama && !st.model && !pull && (
            <button className="btn ghost" onClick={() => api.aiPull().then(() => setPull({ status: "", completed: 0, total: 0 }), (e) => onToast(String(e)))}>
              <Download size={15} /> {t.meaningModelGet}
            </button>
          )}
          {pull && (
            <span className="progress">
              <span className="spinner" /> {pull.status} {pull.total ? `${pct(pull.completed, pull.total)}%` : ""}
            </span>
          )}
        </div>
        {st.read > 0 && (
          <div>
            <span className="muted">{t.aiRead(st.read)}</span>
          </div>
        )}
      </div>
      {st.busy ? (
        <>
          <p className="small">
            {t.aiProgress(st.done, st.total, st.current)}
            <span className="bar wide">
              <span style={{ width: `${pct(st.done, st.total)}%` }} />
            </span>
          </p>
          <button className="btn ghost" onClick={() => api.aiStop().catch((e) => onToast(String(e)))}>
            <Square size={15} /> {t.meaningStop}
          </button>
        </>
      ) : (
        <div className="btn-row">
          <button className="btn ghost" disabled={!st.ollama || !st.model} onClick={() => start(10)}>
            <Sparkles size={15} /> {t.aiTry}
          </button>
          <button className="btn" disabled={!st.ollama || !st.model} onClick={() => start(null)}>
            <Sparkles size={15} /> {t.aiAll}
          </button>
        </div>
      )}
    </div>
  );
}
