import { useEffect, useMemo, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { CheckCircle2, Download, Eye, Minimize2, Replace, Sparkles, Square, XCircle } from "lucide-react";
import { api, DiacriticSuggestion, PullProgress, ReplacePreview, ReplaceScope, ReplaceSpec, SemanticStatus, Slim } from "../api";
import { T } from "../i18n";

const ALL: ReplaceScope = { texts: true, titles: true, persons: true };

function ScopeChecks({ t, scope, onChange }: { t: T; scope: ReplaceScope; onChange: (s: ReplaceScope) => void }) {
  const box = (k: keyof ReplaceScope, label: string) => (
    <label className="check">
      <input type="checkbox" checked={scope[k]} onChange={(e) => onChange({ ...scope, [k]: e.target.checked })} />
      {label}
    </label>
  );
  return (
    <div className="rep-opts">
      <span className="muted">{t.replaceWhere}:</span>
      {box("texts", t.replaceInTexts)}
      {box("titles", t.replaceInTitles)}
      {box("persons", t.replaceInPersons)}
    </div>
  );
}

/** Ajustes › Reemplazar: find and replace over the library, and the Sanskrit diacritics helper. */
export function ReplacePane({ t, onToast, onOpenDoc }: { t: T; onToast: (msg: string) => void; onOpenDoc: (id: number) => void }) {
  const [mode, setMode] = useState<"text" | "dia">("text");
  return (
    <>
      <div className="seg small" data-on={mode === "dia" ? 1 : 0}>
        <span className="seg-ink" />
        <button className={mode === "text" ? "on" : ""} onClick={() => setMode("text")}>
          {t.replaceModeText}
        </button>
        <button className={mode === "dia" ? "on" : ""} onClick={() => setMode("dia")}>
          {t.replaceModeDia}
        </button>
      </div>
      {mode === "text" ? <FindReplace t={t} onToast={onToast} onOpenDoc={onOpenDoc} /> : <Diacritics t={t} onToast={onToast} />}
    </>
  );
}

function FindReplace({ t, onToast, onOpenDoc }: { t: T; onToast: (msg: string) => void; onOpenDoc: (id: number) => void }) {
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [regex, setRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(true);
  const [scope, setScope] = useState<ReplaceScope>({ texts: true, titles: true, persons: false });
  const [preview, setPreview] = useState<ReplacePreview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // a preview belongs to what was asked: any change hides it
  useEffect(() => setPreview(null), [find, replace, regex, caseSensitive, wholeWord, scope]);

  const spec: ReplaceSpec = { find, replace, regex, caseSensitive, wholeWord, words: [], scope };
  const run = async (f: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await f();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  };
  const show = () => run(async () => setPreview(await api.replacePreview(spec)));
  const apply = () =>
    run(async () => {
      if (!preview || !window.confirm(t.replaceConfirm(preview.total))) return;
      await api.replaceApply(spec);
      setPreview(null);
      onToast(t.replaceStarted);
    });

  return (
    <>
      <p className="muted small">{t.replaceHint}</p>
      <div className="form-grid">
        <label>
          <span>{t.replaceFind}</span>
          <input value={find} spellCheck={false} onChange={(e) => setFind(e.target.value)} onKeyDown={(e) => e.key === "Enter" && find && show()} />
        </label>
        <label>
          <span>{t.replaceWith}</span>
          <input value={replace} spellCheck={false} onChange={(e) => setReplace(e.target.value)} onKeyDown={(e) => e.key === "Enter" && find && show()} />
        </label>
      </div>
      <div className="rep-opts">
        <label className="check">
          <input type="checkbox" checked={wholeWord} onChange={(e) => setWholeWord(e.target.checked)} />
          {t.replaceWhole}
        </label>
        <label className="check">
          <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} />
          {t.replaceCase}
        </label>
        <label className="check">
          <input type="checkbox" checked={regex} onChange={(e) => setRegex(e.target.checked)} />
          {t.replaceRegex}
        </label>
      </div>
      {regex && <p className="muted small">{t.replaceRegexHint}</p>}
      <ScopeChecks t={t} scope={scope} onChange={setScope} />
      <div className="btn-row">
        <button className="btn ghost" disabled={busy || !find} onClick={show}>
          {busy ? <span className="spinner" /> : <Eye size={15} />} {t.replacePreview}
        </button>
        {preview && preview.total > 0 && (
          <button className="btn" disabled={busy} onClick={apply}>
            <Replace size={15} /> {t.replaceApply(preview.total)}
          </button>
        )}
      </div>
      {error && <div className="error-box">{error}</div>}
      {preview && (
        <>
          <p className="small">
            {preview.total ? t.replaceSummary(preview.total, preview.texts, preview.titles, preview.persons) : t.replaceNone}{" "}
            {preview.samples.length < preview.total && <span className="muted">{t.replaceShown(preview.samples.length)}</span>}
          </p>
          <div className="rep-samples">
            {preview.samples.map((s, i) => (
              <div key={i} className="rep-sample">
                {s.docId !== null ? (
                  <button className="link" onClick={() => onOpenDoc(s.docId!)}>
                    {s.label}
                  </button>
                ) : (
                  <strong>{s.label}</strong>
                )}
                <span>
                  {s.before}
                  <del>{s.old}</del>
                  <ins>{s.new}</ins>
                  {s.after}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

interface Row {
  s: DiacriticSuggestion;
  on: boolean;
  value: string;
}

const PAGE = 200;

function Diacritics({ t, onToast }: { t: T; onToast: (msg: string) => void }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [filter, setFilter] = useState("");
  const [onlyOn, setOnlyOn] = useState(false);
  const [shown, setShown] = useState(PAGE);
  const [scope, setScope] = useState<ReplaceScope>(ALL);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setBusy(true);
    try {
      const list = await api.diacriticSuggestions();
      setRows(list.map((s) => ({ s, on: !s.doubtful, value: s.proposed })));
    } catch (e) {
      onToast(String(e));
    } finally {
      setBusy(false);
    }
  };

  const visible = useMemo(() => {
    if (!rows) return [];
    const f = filter.trim().toLowerCase();
    return rows
      .map((r, i) => [r, i] as const)
      .filter(([r]) => (!onlyOn || r.on) && (!f || r.s.word.toLowerCase().includes(f) || r.value.toLowerCase().includes(f)));
  }, [rows, filter, onlyOn]);
  useEffect(() => setShown(PAGE), [filter, onlyOn]);

  const ticked = rows?.filter((r) => r.on && r.value.trim() && r.value !== r.s.word) ?? [];
  const changes = ticked.reduce((n, r) => n + r.s.count, 0);
  const set = (i: number, patch: Partial<Row>) => setRows((rs) => rs && rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const setAll = (on: boolean) => {
    const ids = new Set(visible.map(([, i]) => i));
    setRows((rs) => rs && rs.map((r, i) => (ids.has(i) ? { ...r, on } : r)));
  };
  const apply = async () => {
    if (!window.confirm(t.diaConfirm(ticked.length, changes))) return;
    setBusy(true);
    try {
      const words: [string, string][] = ticked.map((r) => [r.s.word.toLowerCase(), r.value.trim()]);
      await api.replaceApply({ find: "", replace: "", regex: false, caseSensitive: false, wholeWord: true, words, scope });
      setRows(null);
      onToast(t.replaceStarted);
    } catch (e) {
      onToast(String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <p className="muted small">{t.diaHint}</p>
      {!rows ? (
        <div className="btn-row">
          <button className="btn" disabled={busy} onClick={load}>
            {busy ? <span className="spinner light" /> : <Sparkles size={15} />} {t.diaLoad}
          </button>
        </div>
      ) : (
        <>
          <div className="rep-opts">
            <input className="dia-filter" value={filter} placeholder={t.diaFilter} spellCheck={false} onChange={(e) => setFilter(e.target.value)} />
            <label className="check">
              <input type="checkbox" checked={onlyOn} onChange={(e) => setOnlyOn(e.target.checked)} />
              {t.diaOnlyOn}
            </label>
            <button className="btn ghost" onClick={() => setAll(true)}>
              {t.diaAll}
            </button>
            <button className="btn ghost" onClick={() => setAll(false)}>
              {t.diaNone}
            </button>
          </div>
          <p className="small muted">{t.diaCounts(rows.length, ticked.length, changes)}</p>
          <div className="dia-table">
            <div className="dia-row head">
              <span />
              <span>{t.diaWord}</span>
              <span>{t.diaProposed}</span>
              <span>{t.diaTimes}</span>
              <span>{t.diaSource}</span>
            </div>
            {visible.slice(0, shown).map(([r, i]) => (
              <div key={r.s.word} className={`dia-row ${r.on ? "" : "off"}`} title={r.s.example}>
                <input type="checkbox" checked={r.on} onChange={(e) => set(i, { on: e.target.checked })} />
                <span className="dia-word">{r.s.word}</span>
                <span className="dia-new">
                  <input value={r.value} spellCheck={false} onChange={(e) => set(i, { value: e.target.value, on: true })} />
                  {r.s.others.map((o) => (
                    <button key={o} className="chip" title={o} onClick={() => set(i, { value: o, on: true })}>
                      {o}
                    </button>
                  ))}
                </span>
                <span className="dia-n">{r.s.count.toLocaleString()}</span>
                <span className={`dia-src ${r.s.source}`}>{r.s.source === "dict" ? t.diaDict : t.diaLibrary}</span>
              </div>
            ))}
          </div>
          {visible.length > shown && (
            <button className="btn ghost" onClick={() => setShown((n) => n + PAGE)}>
              {t.diaMore} ({(visible.length - shown).toLocaleString()})
            </button>
          )}
          <ScopeChecks t={t} scope={scope} onChange={setScope} />
          <div className="btn-row">
            <button className="btn" disabled={busy || !ticked.length} onClick={apply}>
              {busy ? <span className="spinner light" /> : <Replace size={15} />} {t.diaApply(ticked.length)}
            </button>
          </div>
        </>
      )}
    </>
  );
}

/** Ajustes › Copias de seguridad › Ocupar menos espacio. */
export function SlimSection({ t, onToast }: { t: T; onToast: (msg: string) => void }) {
  const [what, setWhat] = useState<Slim>({ covers: true, pdfText: true, originals: true });
  const [busy, setBusy] = useState(false);
  const box = (k: keyof Slim, label: string) => (
    <label className="check">
      <input type="checkbox" checked={what[k]} onChange={(e) => setWhat({ ...what, [k]: e.target.checked })} />
      {label}
    </label>
  );
  const run = async () => {
    if (!window.confirm(t.slimConfirm)) return;
    setBusy(true);
    try {
      await api.slimLibrary(what);
      onToast(t.slimming + "…");
    } catch (e) {
      onToast(String(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <h3>{t.slimTitle}</h3>
      <div className="slim-list">
        {box("covers", t.slimCovers)}
        {box("pdfText", t.slimPdfText)}
        {box("originals", t.slimOriginals)}
      </div>
      <p className="muted small">{t.slimHint}</p>
      <button className="btn ghost" disabled={busy || (!what.covers && !what.pdfText && !what.originals)} onClick={run}>
        <Minimize2 size={15} /> {t.slimButton}
      </button>
    </>
  );
}

/** Ajustes › Significado: Ollama, the model and the index of the search by meaning. */
export function MeaningPane({ t, onToast }: { t: T; onToast: (msg: string) => void }) {
  const [st, setSt] = useState<SemanticStatus | null>(null);
  const [pull, setPull] = useState<PullProgress | null>(null);
  const load = () => api.semanticStatus().then(setSt, (e) => onToast(String(e)));
  useEffect(() => {
    load();
    const unsubs = [
      listen<[number, number]>("semantic-progress", (e) => setSt((s) => s && { ...s, busy: true, done: e.payload[0], total: e.payload[1] })),
      listen("semantic-done", () => load()),
      listen("semantic-error", () => load()),
      listen<PullProgress>("semantic-pull", (e) => setPull(e.payload)),
      listen<string | null>("semantic-pull-done", (e) => {
        setPull(null);
        if (e.payload) onToast(e.payload);
        load();
      }),
    ];
    return () => unsubs.forEach((u) => u.then((f) => f()));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const ok = (yes: boolean, good: string, bad: string) => (
    <span className={yes ? "sem-ok" : "sem-bad"}>
      {yes ? <CheckCircle2 size={15} /> : <XCircle size={15} />} {yes ? good : bad}
    </span>
  );
  const pct = (d: number, n: number) => (n ? Math.round((d / n) * 100) : 0);

  return (
    <>
      <h3>{t.meaningTitle}</h3>
      <p className="muted small">{t.meaningHint}</p>
      {st && (
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
            <strong>{t.meaningModel}</strong>
            {ok(st.model, t.meaningModelOk, t.meaningModelNo)}
            {st.ollama && !st.model && !pull && (
              <button className="btn ghost" onClick={() => api.semanticPull().then(() => setPull({ status: "", completed: 0, total: 0 }), (e) => onToast(String(e)))}>
                <Download size={15} /> {t.meaningModelGet}
              </button>
            )}
            {pull && (
              <span className="progress">
                <span className="spinner" /> {pull.status} {pull.total ? `${pct(pull.completed, pull.total)}%` : ""}
              </span>
            )}
          </div>
          <div>
            <strong>{t.meaningIndex}</strong>
            <span>{st.pieces ? t.meaningIndexed(st.pieces, st.indexed) : t.meaningIndexNone}</span>
          </div>
        </div>
      )}
      {st?.busy ? (
        <>
          <p className="small">
            {t.meaningProgress(st.done, st.total)}
            <span className="bar wide">
              <span style={{ width: `${pct(st.done, st.total)}%` }} />
            </span>
          </p>
          <button className="btn ghost" onClick={() => api.semanticStop().catch((e) => onToast(String(e)))}>
            <Square size={15} /> {t.meaningStop}
          </button>
        </>
      ) : (
        st && (
          <div className="btn-row">
            <button className="btn" disabled={!st.ollama || !st.model} onClick={() => api.semanticIndex().then(load, (e) => onToast(String(e)))}>
              <Sparkles size={15} /> {st.pieces ? t.meaningUpdate : t.meaningBuild}
            </button>
            {!st.pieces && <span className="muted small">{t.meaningFirst}</span>}
          </div>
        )
      )}
    </>
  );
}
