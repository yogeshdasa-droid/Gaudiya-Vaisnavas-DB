import { useEffect, useMemo, useState } from "react";
import { Check, ListChecks, ListTree, Search, X } from "lucide-react";
import { api, Proposal } from "../api";
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
  const sourceLabel = (s: string) => (s === "calendar" ? t.fillSourceCalendar : s === "disciples" ? t.fillSourceDisciples : s === "ai" ? t.fillSourceAi : s);

  return (
    <>
      <h3>{t.fillTitle}</h3>
      <p className="muted small">{t.fillHint}</p>
      <div className="btn-row">
        <button className="btn" disabled={busy} onClick={gather}>
          {busy ? <span className="spinner light" /> : <Search size={15} />} {t.fillGather}
        </button>
      </div>

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
