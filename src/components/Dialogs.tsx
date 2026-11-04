import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, MapPin, ListTree, ListX, FilePen, FileText, FolderInput, GitMerge, History, Link2, Scissors, Search, Trash2, Undo2, Upload, UserPlus, UserRound, X } from "lucide-react";
import { api, DocInfo, EMPTY_PERSON, EMPTY_PLACE, Person, PersonFields, PersonListItem, SectionText, TREE_KINDS, TreeKind, Version, Place, PlaceFields, PLACE_ROLES, PlaceRole } from "../api";
import { T } from "../i18n";
import { ask, Modal } from "./ui";
import { foldName } from "./Sidebar";

function useCtrlS(enabled: boolean, save: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        if (enabled) save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
}

function filterPersons(persons: PersonListItem[], q: string, limit = 40): PersonListItem[] {
  const words = foldName(q).split(" ").filter(Boolean);
  if (!words.length) return [];
  return persons.filter((p) => words.every((w) => ` ${foldName(`${p.name} ${p.aka}`)}`.includes(` ${w}`))).slice(0, limit);
}

// ---------------------------------------------------------------- person picker

/** The person a text belongs to: an existing record, a new one, or none. */
export type PersonChoice = { id: number | null; newName?: string };

function PersonPicker({ t, persons, value, onChange }: { t: T; persons: PersonListItem[]; value: PersonChoice; onChange: (v: PersonChoice) => void }) {
  const current = value.id ? persons.find((p) => p.id === value.id)?.name ?? "" : value.newName ?? "";
  const [q, setQ] = useState(current);
  const [open, setOpen] = useState(false);
  const matches = useMemo(() => filterPersons(persons, q, 12), [persons, q]);
  const exact = matches.some((m) => foldName(m.name) === foldName(q));
  return (
    <div className="picker">
      <input
        value={q}
        placeholder={t.personPlaceholder}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
          if (!e.target.value.trim()) onChange({ id: null });
        }}
      />
      {value.id || value.newName ? (
        <button
          className="icon-btn picker-clear"
          title={t.noPerson}
          onClick={() => {
            setQ("");
            onChange({ id: null });
          }}
        >
          <X size={14} />
        </button>
      ) : null}
      {open && q.trim() && (
        <div className="picker-list">
          {matches.map((m) => (
            <button
              key={m.id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setQ(m.name);
                setOpen(false);
                onChange({ id: m.id });
              }}
            >
              <UserRound size={13} /> {m.name}
              {m.aka && <em>{m.aka}</em>}
            </button>
          ))}
          {!exact && (
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setOpen(false);
                onChange({ id: null, newName: q.trim() });
              }}
            >
              <UserPlus size={13} /> {t.personNew(q.trim())}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

async function resolveChoice(c: PersonChoice): Promise<number | null> {
  if (c.id) return c.id;
  if (c.newName) return api.newPerson({ ...EMPTY_PERSON, name: c.newName });
  return null;
}

// ---------------------------------------------------------------- edit text

const NEW_COLLECTION = "__new_collection__";

/** The collections there are, and a new one. */
function CollectionPicker({ t, collections, value, onChange }: { t: T; collections: string[]; value: string; onChange: (v: string) => void }) {
  const list = collections.includes(value) || !value ? collections : [...collections, value];
  return (
    <select
      value={value}
      onChange={(e) => {
        if (e.target.value !== NEW_COLLECTION) return onChange(e.target.value);
        const name = window.prompt(t.newCollectionPrompt, "")?.trim().split("/").join("-");
        if (name) onChange(name);
      }}
    >
      {list.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
      <option value={NEW_COLLECTION}>{t.newCollection}</option>
    </select>
  );
}

export function EditDialog({
  t,
  doc,
  section,
  persons,
  collections,
  onClose,
  onSaved,
}: {
  t: T;
  doc: DocInfo;
  section: SectionText;
  persons: PersonListItem[];
  collections: string[];
  onClose: () => void;
  onSaved: (docId: number, ordinal: number) => void;
}) {
  const [title, setTitle] = useState(doc.title);
  const [collection, setCollection] = useState(doc.collection);
  const [person, setPerson] = useState<PersonChoice>({ id: doc.personId });
  const [text, setText] = useState(section.text);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const metaDirty = title !== doc.title || collection !== doc.collection || person.id !== doc.personId || !!person.newName;
  const dirty = metaDirty || text !== section.text;

  const close = async () => {
    if (!dirty || (await ask(t.unsaved))) onClose();
  };

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      if (text !== section.text) await api.saveSection(doc.id, section.ordinal, text);
      if (metaDirty) {
        const personId = await resolveChoice(person);
        await api.updateDoc(doc.id, { title, date: doc.date ?? "", collection, personId });
      }
      onSaved(doc.id, section.ordinal);
    } catch (e) {
      setError(String(e));
      setBusy(false);
    }
  };
  useCtrlS(dirty && !busy, save);

  return (
    <Modal
      wide
      title={t.editTitle}
      icon={<FilePen size={18} />}
      onClose={close}
      footer={
        <>
          <span className="muted small grow">
            <AlertTriangle size={13} /> {t.editWarning}
          </span>
          <button className="btn ghost" onClick={close}>
            {t.cancel}
          </button>
          <button className="btn" disabled={!dirty || busy} onClick={save}>
            {busy ? <span className="spinner light" /> : null} {t.save} <kbd className="kbd on-accent">Ctrl S</kbd>
          </button>
        </>
      }
    >
      <div className="form-grid three">
        <label>
          <span>{t.titleLabel}</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label>
          <span>{t.personLabel}</span>
          <PersonPicker t={t} persons={persons} value={person} onChange={setPerson} />
        </label>
        <label>
          <span>{t.collectionLabel}</span>
          <CollectionPicker t={t} collections={collections} value={collection} onChange={setCollection} />
        </label>
      </div>
      <label className="text-label">
        <span>
          {t.text}
          {doc.sections > 1 && <em> · {t.editSection(section.ordinal + 1, doc.sections)}</em>}
        </span>
        <textarea className="editor" value={text} spellCheck={false} onChange={(e) => setText(e.target.value)} autoFocus={!doc.size} />
      </label>
      {error && <div className="error-box">{error}</div>}
    </Modal>
  );
}

// ---------------------------------------------------------------- place in the Guru Paramparā

/** Puts a record under its guru in the Guru Paramparā (the guru is added
 *  too, at the end, when he is not there yet). */
export function GuruDialog({
  t,
  person,
  persons,
  onClose,
  onDone,
}: {
  t: T;
  person: Person;
  persons: PersonListItem[];
  onClose: () => void;
  onDone: (msg: string) => void;
}) {
  const me = persons.find((x) => x.id === person.id);
  const byId = (id: number | null | undefined) => (id ? persons.find((x) => x.id === id) : undefined);
  const guruNow = byId(me?.tree?.parent);
  const [guru, setGuru] = useState<PersonChoice>({ id: guruNow?.id ?? null });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // the names written in the record's «guru» field
  const suggested = useMemo(() => {
    const out: PersonListItem[] = [];
    for (const part of person.guru.replace(/\([^)]*\)/g, " ").split(/[;,\n]|\band\b|\by\b/)) {
      const m = filterPersons(persons, part.trim(), 2).filter((x) => x.id !== person.id);
      for (const x of m.slice(0, 1)) if (!out.some((o) => o.id === x.id)) out.push(x);
    }
    return out.slice(0, 5);
  }, [person, persons]);

  const run = (job: () => Promise<string>) => async () => {
    setBusy(true);
    setError(null);
    try {
      onDone(await job());
    } catch (e) {
      setError(String(e));
      setBusy(false);
    }
  };
  const place = run(async () => {
    const id = await resolveChoice(guru);
    if (!id) throw new Error(t.guruPick);
    if (!byId(id)?.tree) await api.movePerson(id, { parent: null, before: null });
    await api.movePerson(person.id, { parent: id, before: null });
    // the names in both records too (only added)
    await api.relate(person.id, id, me?.tree?.kind ?? "diksa", null);
    return t.guruDone(person.name, byId(id)?.name ?? guru.newName ?? "");
  });
  const remove = run(async () => {
    await api.movePerson(person.id, null);
    return t.guruRemoved(person.name);
  });

  return (
    <Modal
      title={t.guruTitle}
      icon={<ListTree size={18} />}
      onClose={onClose}
      footer={
        <>
          {me?.tree && (
            <button className="btn ghost danger" disabled={busy} onClick={remove}>
              <ListX size={15} /> {t.removeFromParampara}
            </button>
          )}
          <span className="grow" />
          <button className="btn ghost" onClick={onClose}>
            {t.cancel}
          </button>
          <button className="btn" disabled={busy || (!guru.id && !guru.newName) || guru.id === guruNow?.id} onClick={place}>
            {busy ? <span className="spinner light" /> : null} {t.guruSet}
          </button>
        </>
      }
    >
      <p>
        <strong>{person.name}</strong>
        <br />
        <span className="muted">{!me?.tree ? t.guruNotInTree : guruNow ? t.guruNowOf(guruNow.name) : t.guruAtTop}</span>
      </p>
      {suggested.length > 0 && (
        <div className="guru-suggest">
          <span className="muted small">{t.guruFromRecord}</span>
          {suggested.map((x) => (
            <button key={x.id} className={`chip clickable${guru.id === x.id ? " on" : ""}`} onClick={() => setGuru({ id: x.id })}>
              {x.name}
            </button>
          ))}
        </div>
      )}
      <label>
        <span>{t.guruPick}</span>
        <PersonPicker key={guru.id ?? guru.newName ?? ""} t={t} persons={persons.filter((x) => x.id !== person.id)} value={guru} onChange={setGuru} />
      </label>
      <p className="muted small">{t.guruHint}</p>
      {error && <div className="error-box">{error}</div>}
    </Modal>
  );
}

// ---------------------------------------------------------------- dropped under another guru

/** A record dragged under another guru in the tree: how they are related,
 *  written in both records (and taken out of the earlier guru's list). */
export function RelateDialog({
  t,
  id,
  place,
  persons,
  onClose,
  onDone,
}: {
  t: T;
  id: number;
  place: { parent: number | null; before: number | null };
  persons: PersonListItem[];
  onClose: () => void;
  onDone: (msg: string) => void;
}) {
  const me = persons.find((x) => x.id === id);
  const guru = persons.find((x) => x.id === place.parent);
  const oldGuru = persons.find((x) => x.id === me?.tree?.parent);
  const [kind, setKind] = useState<TreeKind>(me?.tree?.kind ?? "diksa");
  const [unlink, setUnlink] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!me || !guru) return null;

  const go = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.movePerson(id, place);
      await api.setTreeKind(id, kind);
      const n = await api.relate(id, guru.id, kind, unlink && oldGuru ? oldGuru.id : null);
      onDone(t.relateDone(me.name, guru.name, n));
    } catch (e) {
      setError(String(e));
      setBusy(false);
    }
  };

  return (
    <Modal
      title={t.relateTitle}
      icon={<ListTree size={18} />}
      onClose={onClose}
      footer={
        <>
          <span className="grow" />
          <button className="btn ghost" onClick={onClose}>
            {t.cancel}
          </button>
          <button className="btn" disabled={busy} onClick={go}>
            {busy ? <span className="spinner light" /> : null} {t.save}
          </button>
        </>
      }
    >
      <p>
        <strong>{t.relateAsk(me.name, guru.name)}</strong>
      </p>
      <div className="relate-kinds">
        {TREE_KINDS.map((k) => (
          <label key={k} className="check">
            <input type="radio" name="relate-kind" checked={kind === k} onChange={() => setKind(k)} /> {t.treeKinds[k]}
          </label>
        ))}
      </div>
      {oldGuru && (
        <label className="check">
          <input type="checkbox" checked={unlink} onChange={(e) => setUnlink(e.target.checked)} /> {t.relateUnlink(oldGuru.name)}
        </label>
      )}
      <p className="muted small">{t.relateHint}</p>
      {error && <div className="error-box">{error}</div>}
    </Modal>
  );
}

// ---------------------------------------------------------------- move a piece of text

/** The first line of a piece, without Markdown marks, as the title of its new
 *  text (so the parts of a record do not all get the record's name). */
function firstLine(fragment: string): string {
  const line = fragment
    .split("\n")
    .map((l) => l.replace(/^[\s#>*\-+]+|[*_`]+/g, "").trim())
    .find((l) => l) ?? "";
  if (line.length <= 80) return line.replace(/[.:,;]$/, "");
  const cut = line.slice(0, 80);
  return cut.slice(0, cut.lastIndexOf(" ") > 40 ? cut.lastIndexOf(" ") : 80) + "…";
}

/** A piece of a text that tells of someone else (another Haridāsa…) taken
 *  to that person's record, existing or new. */
export function MoveTextDialog({
  t,
  docId,
  fragment,
  from,
  persons,
  onClose,
  onDone,
}: {
  t: T;
  docId: number;
  fragment: string;
  from: string;
  persons: PersonListItem[];
  onClose: () => void;
  onDone: (personId: number, name: string) => void;
}) {
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [q, setQ] = useState(from);
  const [chosen, setChosen] = useState<PersonListItem | null>(null);
  const [name, setName] = useState(from);
  const [title, setTitle] = useState(() => firstLine(fragment));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const matches = useMemo(() => filterPersons(persons, q, 12), [persons, q]);
  const target = mode === "new" ? name.trim() : chosen?.name ?? "";

  const go = async () => {
    setBusy(true);
    setError(null);
    try {
      const id = mode === "new" ? await api.newPerson({ ...EMPTY_PERSON, name: name.trim() }) : chosen!.id;
      await api.moveText(docId, fragment, id, title.trim() || target);
      onDone(id, target);
    } catch (e) {
      setError(String(e));
      setBusy(false);
    }
  };

  return (
    <Modal
      title={t.moveTextTitle}
      icon={<Scissors size={18} />}
      onClose={onClose}
      footer={
        <>
          <span className="grow" />
          <button className="btn ghost" onClick={onClose}>
            {t.cancel}
          </button>
          <button className="btn" disabled={busy || !target} onClick={go}>
            {busy ? <span className="spinner light" /> : null} {t.moveTextGo}
          </button>
        </>
      }
    >
      <blockquote className="move-preview">{fragment.length > 600 ? fragment.slice(0, 600) + "…" : fragment}</blockquote>
      <div className="relate-kinds">
        <label className="check">
          <input type="radio" name="move-mode" checked={mode === "existing"} onChange={() => setMode("existing")} /> {t.moveTextExisting}
        </label>
        <label className="check">
          <input type="radio" name="move-mode" checked={mode === "new"} onChange={() => setMode("new")} /> {t.moveTextNew}
        </label>
      </div>
      {mode === "existing" ? (
        <div className="picker">
          <input value={q} placeholder={t.moveTextSearch} autoFocus onChange={(e) => (setQ(e.target.value), setChosen(null))} />
          {!chosen && matches.length > 0 && (
            <div className="picker-list static">
              {matches.map((m) => (
                <button key={m.id} onClick={() => (setChosen(m), setQ(m.name))}>
                  <UserRound size={13} /> {m.name}
                  {m.aka && <em>{m.aka}</em>}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <label className="stack">
          <span>{t.moveTextName}</span>
          <input value={name} autoFocus onChange={(e) => setName(e.target.value)} />
        </label>
      )}
      <label className="stack">
        <span>{t.moveTextDocTitle}</span>
        <input value={title} placeholder={target} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <p className="muted small">{t.moveTextHint}</p>
      {error && <div className="error-box">{error}</div>}
    </Modal>
  );
}

// ---------------------------------------------------------------- link a name to a record

/** Where a name chosen in the text is: its part, and the text around it as seen. */
export interface NameSpot {
  docId: number;
  ord: number;
  name: string;
  before: string;
  after: string;
}

/**
 * The place of the chosen name in the part as written (with its Markdown): of
 * all the times the name is there (not already inside a link), the one whose
 * text around it is most like what was seen around the selection. -1: not there.
 */
export function findSpot(md: string, spot: NameSpot): { at: number; len: number } {
  const plain = (s: string) => s.replace(/\[\[[^\]|]*\|([^\]]*)\]\]/g, "$1").replace(/[*_#>`[\]]/g, "").replace(/\s+/g, " ");
  const pattern = new RegExp(spot.name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+"), "g");
  const seenBefore = plain(spot.before);
  const seenAfter = plain(spot.after);
  let best = { at: -1, len: 0, score: -1 };
  for (const m of md.matchAll(pattern)) {
    const at = m.index!;
    const head = md.slice(0, at);
    if (head.lastIndexOf("[[") > head.lastIndexOf("]]")) continue; // already a link
    const b = plain(md.slice(Math.max(0, at - 160), at));
    const a = plain(md.slice(at + m[0].length, at + m[0].length + 160));
    let score = 0;
    while (score < Math.min(b.length, seenBefore.length) && b[b.length - 1 - score] === seenBefore[seenBefore.length - 1 - score]) score++;
    let s2 = 0;
    while (s2 < Math.min(a.length, seenAfter.length) && a[s2] === seenAfter[s2]) s2++;
    if (score + s2 > best.score) best = { at, len: m[0].length, score: score + s2 };
  }
  return { at: best.at, len: best.len };
}

/** «Enlazar con una ficha» / «Crear ficha»: the name chosen in a text becomes
 *  a link to a record, there ([[Name#ficha-12|name]]) and, if asked, in every
 *  text (the name joins the record's other names). */
export function LinkNameDialog({
  t,
  spot,
  persons,
  create,
  onClose,
  onDone,
}: {
  t: T;
  spot: NameSpot;
  persons: PersonListItem[];
  /** begin with «a new record» */
  create: boolean;
  onClose: () => void;
  onDone: (personId: number, msg: string) => void;
}) {
  const [mode, setMode] = useState<"existing" | "new">(create ? "new" : "existing");
  const [q, setQ] = useState(spot.name);
  const [chosen, setChosen] = useState<PersonListItem | null>(null);
  const [name, setName] = useState(spot.name);
  const [everywhere, setEverywhere] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const matches = useMemo(() => filterPersons(persons, q, 12), [persons, q]);
  const target = mode === "new" ? name.trim() : chosen?.name ?? "";

  const go = async () => {
    setBusy(true);
    setError(null);
    try {
      const [part] = await api.getSections(spot.docId, spot.ord, spot.ord);
      const { at, len } = part ? findSpot(part.text, spot) : { at: -1, len: 0 };
      if (at < 0) throw new Error(t.linkNameNotFound(spot.name));
      const id = mode === "new" ? await api.newPerson({ ...EMPTY_PERSON, name: name.trim() }) : chosen!.id;
      const label = part.text.slice(at, at + len);
      const safe = target.replace(/[[\]|#]/g, "");
      await api.saveSection(spot.docId, spot.ord, `${part.text.slice(0, at)}[[${safe}#ficha-${id}|${label}]]${part.text.slice(at + len)}`);
      // everywhere: the name as one of the record's other names
      if (mode === "existing" && everywhere) {
        const p = await api.getPerson(id);
        const aka = p.aka.split(",").map((s) => s.trim()).filter(Boolean);
        const fold = foldName(spot.name);
        if (foldName(p.name) !== fold && !aka.some((a) => foldName(a) === fold)) {
          const fields = Object.fromEntries((Object.keys(EMPTY_PERSON) as (keyof PersonFields)[]).map((k) => [k, (p as unknown as PersonFields)[k] ?? ""])) as unknown as PersonFields;
          await api.updatePerson(id, { ...fields, aka: [...aka, spot.name.trim()].join(", ") });
        }
      }
      onDone(id, mode === "new" ? t.linkNameCreated(target) : everywhere ? t.linkNameEverywhere(spot.name, target) : t.linkNameDone(target));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  };

  return (
    <Modal
      title={t.linkNameTitle}
      icon={<Link2 size={18} />}
      onClose={onClose}
      footer={
        <>
          <span className="grow" />
          <button className="btn ghost" onClick={onClose}>
            {t.cancel}
          </button>
          <button className="btn" disabled={busy || !target} onClick={go}>
            {busy ? <span className="spinner light" /> : null} {mode === "new" ? t.linkNameCreateGo : t.linkNameGo}
          </button>
        </>
      }
    >
      <blockquote className="move-preview">
        …{spot.before.slice(-60)}
        <mark>{spot.name}</mark>
        {spot.after.slice(0, 60)}…
      </blockquote>
      <div className="relate-kinds">
        <label className="check">
          <input type="radio" name="link-mode" checked={mode === "existing"} onChange={() => setMode("existing")} /> {t.moveTextExisting}
        </label>
        <label className="check">
          <input type="radio" name="link-mode" checked={mode === "new"} onChange={() => setMode("new")} /> {t.moveTextNew}
        </label>
      </div>
      {mode === "existing" ? (
        <>
          <div className="picker">
            <input value={q} placeholder={t.moveTextSearch} autoFocus onChange={(e) => (setQ(e.target.value), setChosen(null))} />
            {!chosen && matches.length > 0 && (
              <div className="picker-list static">
                {matches.map((m) => (
                  <button key={m.id} onClick={() => (setChosen(m), setQ(m.name))}>
                    <UserRound size={13} /> {m.name}
                    {m.aka && <em>{m.aka}</em>}
                  </button>
                ))}
              </div>
            )}
          </div>
          <label className="check">
            <input type="checkbox" checked={everywhere} onChange={(e) => setEverywhere(e.target.checked)} /> {t.linkNameAll}
          </label>
          <p className="muted small">{t.linkNameAllHint(spot.name)}</p>
        </>
      ) : (
        <label className="stack">
          <span>{t.moveTextName}</span>
          <input value={name} autoFocus onChange={(e) => setName(e.target.value)} />
        </label>
      )}
      <p className="muted small">{t.linkNameHint}</p>
      {error && <div className="error-box">{error}</div>}
    </Modal>
  );
}

// ---------------------------------------------------------------- recycle bin

export function TrashDialog({ t, doc, onClose, onDone }: { t: T; doc: DocInfo; onClose: () => void; onDone: () => void }) {
  const [error, setError] = useState<string | null>(null);
  return (
    <Modal
      title={t.moveToTrash}
      icon={<Trash2 size={18} />}
      onClose={onClose}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>
            {t.cancel}
          </button>
          <button
            className="btn"
            autoFocus
            onClick={() =>
              api
                .trashDoc(doc.id)
                .then(onDone)
                .catch((e) => setError(String(e)))
            }
          >
            <Trash2 size={15} /> {t.moveToTrash}
          </button>
        </>
      }
    >
      <p>{t.trashQuestion(doc.title)}</p>
      <p className="muted small">{t.trashDesc}</p>
      {error && <div className="error-box">{error}</div>}
    </Modal>
  );
}

// ---------------------------------------------------------------- import

export function ImportDialog({
  t,
  paths,
  person,
  onClose,
  onStarted,
}: {
  t: T;
  paths: string[];
  /** add everything to this record */
  person?: { id: number; name: string };
  onClose: () => void;
  onStarted: () => void;
}) {
  const [kinds, setKinds] = useState<("dir" | "text" | "other")[] | null>(null);
  const [collection, setCollection] = useState("");
  const [perFile, setPerFile] = useState(false);
  const [textOnly, setTextOnly] = useState(true);
  const [toPerson, setToPerson] = useState(!!person);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.pathKinds(paths).then(setKinds).catch((e) => setError(String(e)));
  }, [paths]);

  const counts = useMemo(() => {
    const k = kinds ?? [];
    return { files: k.filter((x) => x === "text").length, dirs: k.filter((x) => x === "dir").length };
  }, [kinds]);
  const usable = paths.filter((_, i) => kinds && kinds[i] !== "other");

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.importSources({
        sources: usable.map((path) => ({ path, collection })),
        personPerFile: perFile && !toPerson,
        textOnly,
        personId: toPerson && person ? person.id : null,
      });
      onStarted();
    } catch (e) {
      setError(String(e));
      setBusy(false);
    }
  };

  const nothing = kinds !== null && usable.length === 0;
  return (
    <Modal
      title={t.importTitle}
      icon={<Upload size={18} />}
      onClose={onClose}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>
            {t.cancel}
          </button>
          <button className="btn" disabled={busy || nothing || kinds === null} onClick={run}>
            {busy && <span className="spinner light" />} {t.importButton}
          </button>
        </>
      }
    >
      <div className="import-summary">
        <FolderInput size={28} />
        <div>
          <strong>{t.importSummary(counts.files, counts.dirs) || "…"}</strong>
          <div className="paths">
            {paths.slice(0, 6).map((p) => (
              <div key={p} title={p}>
                {p}
              </div>
            ))}
            {paths.length > 6 && <div>… +{paths.length - 6}</div>}
          </div>
        </div>
      </div>
      {nothing ? (
        <div className="error-box">{t.nothingToImport}</div>
      ) : (
        <>
          <div className="form-grid">
            <label>
              <span>{t.collectionName}</span>
              <input value={collection} placeholder={t.collectionHint} onChange={(e) => setCollection(e.target.value)} />
            </label>
          </div>
          {person && (
            <label className="check block">
              <input type="checkbox" checked={toPerson} onChange={(e) => setToPerson(e.target.checked)} />
              <span>
                <UserRound size={14} /> {t.importIntoPerson(person.name)}
              </span>
            </label>
          )}
          <label className="check block">
            <input type="checkbox" checked={textOnly} onChange={(e) => setTextOnly(e.target.checked)} />
            <span>
              <FileText size={14} /> {t.textOnly}
              <em className="muted small">{t.textOnlyHint}</em>
            </span>
          </label>
          {!toPerson && (
            <label className="check block">
              <input type="checkbox" checked={perFile} onChange={(e) => setPerFile(e.target.checked)} />
              <span>
                <UserPlus size={14} /> {t.personPerFile}
                <em className="muted small">{t.personPerFileHint}</em>
              </span>
            </label>
          )}
        </>
      )}
      {error && <div className="error-box">{error}</div>}
    </Modal>
  );
}

// ---------------------------------------------------------------- person record

/** The lunar day the program reads in a date field (for the calendar). */
/** A list of names («Rupa Gosvami (diksa); Jiva Gosvami») with the records
 *  as suggestions: the part under the cursor is completed from the list. */
/** Other gurus of a record in the tree besides the one it is under (its
 *  śikṣā gurus): drawn as extra lines in the tree. Only records in the tree. */
function MoreGurus({
  t,
  links,
  onChange,
  persons,
  inTree,
  exclude,
}: {
  t: T;
  links: [number, TreeKind][];
  onChange: (l: [number, TreeKind][]) => void;
  persons: PersonListItem[];
  inTree: boolean;
  exclude: number[];
}) {
  const [q, setQ] = useState("");
  // any record: one not in the tree goes in at its first level on saving
  const matches = useMemo(
    () => filterPersons(persons, q, 12).filter((p) => !exclude.includes(p.id) && !links.some(([g]) => g === p.id)),
    [persons, q, exclude, links],
  );
  const name = (id: number) => persons.find((p) => p.id === id)?.name ?? "?";
  return (
    <div className="more-gurus">
      <span className="more-gurus-title">{t.moreGurus}</span>
      {!inTree ? (
        <em className="lunar-hint">{t.moreGurusNotInTree}</em>
      ) : (
        <>
          {links.map(([g, k], i) => (
            <div key={g} className="more-guru">
              <UserRound size={14} />
              <span className="grow">
                {name(g)}
                {!persons.find((p) => p.id === g)?.tree && <em className="lunar-hint"> · {t.moreGurusOutside}</em>}
              </span>
              <select value={k} onChange={(e) => onChange(links.map((l, j) => (j === i ? [g, e.target.value as TreeKind] : l)))}>
                {[...TREE_KINDS.filter((kk) => kk !== "diksa"), "diksa" as const].map((kk) => (
                  <option key={kk} value={kk}>
                    {t.treeKinds[kk]}
                  </option>
                ))}
              </select>
              <button className="icon-btn" title={t.delete} onClick={() => onChange(links.filter((_, j) => j !== i))}>
                <X size={14} />
              </button>
            </div>
          ))}
          <div className="picker">
            <input value={q} placeholder={t.moreGurusAdd} onChange={(e) => setQ(e.target.value)} />
            {q.trim() && matches.length > 0 && (
              <div className="picker-list">
                {matches.map((m) => (
                  <button
                    key={m.id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onChange([...links, [m.id, "siksa"]]);
                      setQ("");
                    }}
                  >
                    <UserRound size={13} /> {m.name}
                    {m.aka && <em>{m.aka}</em>}
                    {!m.tree && <em>{t.moreGurusOutside}</em>}
                  </button>
                ))}
              </div>
            )}
          </div>
          <em className="lunar-hint">{t.moreGurusHint}</em>
        </>
      )}
    </div>
  );
}

function NamesInput({
  t,
  value,
  onChange,
  persons,
  multi,
  onPick,
}: {
  t: T;
  value: string;
  onChange: (v: string) => void;
  persons: PersonListItem[];
  multi: boolean;
  onPick: (p: PersonListItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const [caret, setCaret] = useState(0);
  // the name being written: between the separators around the cursor
  const start = Math.max(value.lastIndexOf(",", caret - 1), value.lastIndexOf(";", caret - 1), value.lastIndexOf("\n", caret - 1)) + 1;
  const ends = [",", ";", "\n"].map((s) => value.indexOf(s, caret)).filter((i) => i >= 0);
  const end = ends.length ? Math.min(...ends) : value.length;
  const part = value.slice(start, end).replace(/\([^)]*\)?/g, "").trim();
  const sorted = useMemo(() => [...persons].sort((a, b) => foldName(a.name).localeCompare(foldName(b.name))), [persons]);
  const matches = useMemo(() => {
    const already = new Set(splitNames(value).map(foldName));
    const list = part ? filterPersons(sorted, part, 200) : sorted;
    return list.filter((p) => foldName(p.name) === foldName(part) || !already.has(foldName(p.name)));
  }, [sorted, part, value]);
  const track = (e: React.SyntheticEvent<HTMLInputElement>) => setCaret(e.currentTarget.selectionStart ?? 0);
  const pick = (p: PersonListItem) => {
    const before = value.slice(0, start).replace(/\s*$/, start ? " " : "");
    const rest = value.slice(end);
    const next = `${before}${p.name}${multi && !rest.trim() ? ", " : ""}${rest}`;
    onPick(p);
    onChange(next);
    setCaret((before + p.name).length + (multi && !rest.trim() ? 2 : 0));
    if (!multi) setOpen(false);
  };
  return (
    <div className="picker">
      <input
        value={value}
        placeholder={t.namesHint}
        onFocus={(e) => {
          track(e);
          setOpen(true);
        }}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        onClick={track}
        onKeyUp={track}
        onChange={(e) => {
          onChange(e.target.value);
          track(e);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape" && open) {
            e.stopPropagation();
            setOpen(false);
          }
        }}
      />
      {open && matches.length > 0 && (
        <div className="picker-list">
          {matches.map((m) => (
            <button key={m.id} onMouseDown={(e) => e.preventDefault()} onClick={() => pick(m)}>
              {m.tree ? <ListTree size={13} /> : <UserRound size={13} />} {m.name}
              {m.aka && <em>{m.aka}</em>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** The names of a «guru» / «disciples» field, without the notes in brackets. */
function splitNames(field: string): string[] {
  return field
    .replace(/\([^)]*\)/g, " ")
    .split(/[;,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** The records named in a field, in order: the ones chosen from the list,
 *  and names written that are exactly the name of one record. */
function namedIds(field: string, persons: PersonListItem[], picked: Map<string, number>): number[] {
  const out: number[] = [];
  const found: { at: number; id: number }[] = [];
  for (const [name, id] of picked) {
    const at = field.indexOf(name);
    if (at >= 0) found.push({ at, id });
  }
  let from = 0;
  for (const name of splitNames(field)) {
    const at = field.indexOf(name, from);
    from = at + name.length;
    const same = persons.filter((p) => foldName(p.name) === foldName(name));
    if (same.length === 1) found.push({ at, id: same[0].id });
  }
  for (const { id } of found.sort((a, b) => a.at - b.at)) if (!out.includes(id)) out.push(id);
  return out;
}

/** The gurus named in a «Guru» field, each with the kind its brackets say:
 *  «Rūpa Gosvāmī (śikṣā)» → siksa; no brackets → disciple (unspecified). */
function gurusWithKind(field: string, persons: PersonListItem[], picked: Map<string, number>): [number, TreeKind][] {
  const parts: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of field) {
    if (ch === "(") depth++;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if (depth === 0 && /[;,\n]/.test(ch)) {
      parts.push(cur);
      cur = "";
    } else cur += ch;
  }
  parts.push(cur);
  const out: [number, TreeKind][] = [];
  for (const part of parts) {
    const id = namedIds(part, persons, picked)[0];
    if (!id || out.some(([g]) => g === id)) continue;
    const said = (part.match(/\(([^)]*)\)/)?.[1] ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    const kind: TreeKind = /vani/.test(said)
      ? "vani"
      : /siksa|shiksa/.test(said)
        ? "siksa"
        : /diksa|initiat/.test(said)
          ? "diksa"
          : /sannyasa/.test(said)
            ? "sannyasa"
            : /vesa|babaji/.test(said)
              ? "vesa"
              : "disciple";
    out.push([id, kind]);
  }
  return out;
}

function LunarHint({ t, text }: { t: T; text: string }) {
  const [label, setLabel] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    if (!text.trim()) return setLabel(undefined);
    const h = window.setTimeout(() => api.lunarLabel(text).then(setLabel, () => setLabel(undefined)), 250);
    return () => window.clearTimeout(h);
  }, [text]);
  if (label === undefined) return null;
  return <em className={`lunar-hint ${label ? "ok" : ""}`}>{label ? t.lunarRead(label) : t.lunarNone}</em>;
}

export function PersonDialog({
  t,
  person,
  persons,
  prefill,
  from,
  onClose,
  onSaved,
}: {
  t: T;
  /** null = new record */
  person: Person | null;
  persons: PersonListItem[];
  /** a new record begun with these fields (its name, its notes…) */
  prefill?: Partial<PersonFields>;
  /** «Crear ficha con este texto»: the piece of a text it comes from, taken
   *  out of that text on saving (if so chosen) */
  from?: { docId: number; fragment: string; source: string };
  onClose: () => void;
  /** moved = something changed place in the Guru Paramparā (message) */
  onSaved: (id: number, moved: string | null) => void;
}) {
  const [cut, setCut] = useState(true);
  // empty guru / disciples: the ones of the Guru Paramparā, so that they can be changed here
  const [tree] = useState(() => {
    const parent = persons.find((x) => x.id === person?.id)?.tree?.parent;
    const guru = parent ? persons.find((x) => x.id === parent) : undefined;
    const kids = person ? persons.filter((x) => x.tree?.parent === person.id).sort((a, b) => a.tree!.pos - b.tree!.pos) : [];
    return { guru, kids };
  });
  const [initial] = useState<PersonFields>(() => {
    const base = { ...EMPTY_PERSON, ...(person ?? {}), ...(person ? {} : prefill ?? {}) };
    if (!base.guru.trim() && tree.guru) base.guru = tree.guru.name;
    if (!base.disciples.trim() && tree.kids.length) base.disciples = tree.kids.map((k) => k.name).join(", ");
    return base;
  });
  const [f, setF] = useState<PersonFields>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kind, setKind] = useState<TreeKind>(() => persons.find((x) => x.id === person?.id)?.tree?.kind ?? "diksa");
  const [picked] = useState(() => new Map<string, number>([...tree.kids, ...(tree.guru ? [tree.guru] : [])].map((x) => [x.name, x.id])));
  const [, setPicks] = useState(0);
  const keys = Object.keys(EMPTY_PERSON) as (keyof PersonFields)[];
  const kindNow = persons.find((x) => x.id === person?.id)?.tree?.kind ?? "diksa";
  // more gurus besides its place in the tree (its śikṣā gurus)
  const [linksNow] = useState<[number, TreeKind][]>(() => (persons.find((x) => x.id === person?.id)?.links ?? []).map((l) => [l.guru, l.kind]));
  const [links, setLinks] = useState<[number, TreeKind][]>(linksNow);
  const linksChanged = JSON.stringify(links) !== JSON.stringify(linksNow);
  // begun from a text: there is something to save already
  const dirty = !!(from || prefill) || keys.some((k) => f[k] !== (initial[k] ?? "")) || kind !== kindNow || linksChanged;
  const set = (k: keyof PersonFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const others = useMemo(() => persons.filter((x) => x.id !== person?.id), [persons, person]);
  const byId = (id: number | null | undefined) => (id ? persons.find((x) => x.id === id) : undefined);
  const remember = (p: PersonListItem) => {
    picked.set(p.name, p.id);
    setPicks((n) => n + 1);
  };

  // what changes place in the tree on saving: the first guru named (when it
  // is a new one) takes the record as disciple, and so do the new disciples
  const me = byId(person?.id);
  const plan = useMemo(() => {
    const oldGuru = namedIds(initial.guru, others, picked)[0];
    const newGuru = namedIds(f.guru, others, picked)[0];
    const guru = newGuru && newGuru !== oldGuru && newGuru !== me?.tree?.parent ? newGuru : null;
    const oldDisciples = namedIds(initial.disciples, others, picked);
    const disciples = namedIds(f.disciples, others, picked).filter(
      (d) => d !== guru && !oldDisciples.includes(d) && (!person || byId(d)?.tree?.parent !== person.id),
    );
    // taken out of the list but still under this record in the tree
    const named = namedIds(f.disciples, others, picked);
    const removed = tree.kids.filter((k) => !named.includes(k.id));
    return { guru, disciples, removed };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.guru, f.disciples, others, me, picked.size]);

  const close = async () => {
    if (!dirty || (await ask(t.unsaved))) onClose();
  };
  const place = async (id: number, name: string): Promise<string | null> => {
    const lines: string[] = [];
    const inTree = (pid: number) => !!byId(pid)?.tree;
    let meInTree = !!me?.tree;
    if (plan.guru) {
      const g = byId(plan.guru)!;
      try {
        if (!inTree(g.id)) await api.movePerson(g.id, { parent: null, before: null });
        await api.movePerson(id, { parent: g.id, before: null });
        meInTree = true;
        // his name in the guru's Disciples too (only added: the fields written here are left as they are)
        await api.relate(id, g.id, kind, null);
        lines.push(t.guruDone(name, g.name));
      } catch (e) {
        lines.push(String(e));
      }
    }
    for (const d of plan.disciples) {
      const p = byId(d)!;
      try {
        if (!meInTree) await api.movePerson(id, { parent: null, before: null });
        meInTree = true;
        await api.movePerson(d, { parent: id, before: null });
        await api.relate(d, id, p.tree?.kind ?? "diksa", null);
        lines.push(t.guruDone(p.name, name));
      } catch (e) {
        lines.push(`${p.name}: ${String(e)}`);
      }
    }
    return lines.length ? lines.join(" · ") : null;
  };
  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      // without the «, » left after the last name chosen from the list
      const tidy = (s: string) => s.replace(/[\s,;]+$/, "");
      const fields = { ...f, guru: tidy(f.guru), disciples: tidy(f.disciples) };
      const id = person ? person.id : await api.newPerson(fields);
      if (person) await api.updatePerson(person.id, fields);
      const moved = await place(id, f.name.trim());
      // the relation with the guru, once the record is in the tree
      if (kind !== kindNow || (moved && kind !== "diksa")) await api.setTreeKind(id, kind).catch(() => {});
      // the other gurus written in «Guru» that are in the tree get their line there too (Whisper, 04-11),
      // except the ones taken out by hand from «Otros gurus en el árbol»
      const inTreeNow = !!me?.tree || !!moved;
      const parentNow = plan.guru ?? me?.tree?.parent ?? null;
      const removedByHand = new Set(linksNow.map(([g]) => g).filter((g) => !links.some(([x]) => x === g)));
      const more = inTreeNow
        ? gurusWithKind(fields.guru, others, picked).filter(
            ([g]) => g !== parentNow && !!byId(g)?.tree && !links.some(([x]) => x === g) && !removedByHand.has(g),
          )
        : [];
      const linksNext = [...links, ...more];
      if (linksChanged || more.length) await api.setLinks(id, linksNext);
      const added = more.map(([g, k]) => t.treeLinkAdded(byId(g)!.name, t.treeKindShort[k]));
      const movedMsg = [moved, ...added].filter(Boolean).join(" · ") || null;
      // the piece leaves the text it came from (the record is made already: a failure here only warns)
      let cutMsg: string | null = null;
      if (from && cut && !person) {
        try {
          await api.cutText(from.docId, from.fragment);
          cutMsg = t.newFromTextCut(from.source);
        } catch (e) {
          cutMsg = t.newFromTextCutFailed(String(e));
        }
      }
      onSaved(id, [movedMsg, cutMsg].filter(Boolean).join(" · ") || null);
    } catch (e) {
      setError(String(e));
      setBusy(false);
    }
  };
  useCtrlS(dirty && !busy && !!f.name.trim(), save);

  const field = (k: keyof PersonFields, label: string, hint?: string, below?: React.ReactNode) => (
    <label>
      <span>{label}</span>
      <input value={f[k]} placeholder={hint} onChange={set(k)} />
      {below}
    </label>
  );

  return (
    <Modal
      wide
      title={person ? t.editPerson : t.newPerson.replace("…", "")}
      icon={<UserRound size={18} />}
      onClose={close}
      footer={
        <>
          <span className="grow" />
          <button className="btn ghost" onClick={close}>
            {t.cancel}
          </button>
          <button className="btn" disabled={!dirty || busy || !f.name.trim()} onClick={save}>
            {busy ? <span className="spinner light" /> : null} {t.save} <kbd className="kbd on-accent">Ctrl S</kbd>
          </button>
        </>
      }
    >
      {from && !person && (
        <div className="from-text">
          <label className="check">
            <input type="checkbox" checked={cut} onChange={(e) => setCut(e.target.checked)} /> {t.newFromTextCutBox(from.source)}
          </label>
          <p className="muted small">{t.newFromTextHint}</p>
        </div>
      )}
      <div className="form-grid">
        <label>
          <span>{t.name}</span>
          <input value={f.name} onChange={set("name")} autoFocus={!person} />
        </label>
        {field("aka", t.aka, t.akaHint)}
        {field("appearance", t.appearance, undefined, <LunarHint t={t} text={f.appearance} />)}
        {field("disappearance", t.disappearance, undefined, <LunarHint t={t} text={f.disappearance} />)}
        {field("place", t.place)}
        <label>
          <span>{t.guru}</span>
          <NamesInput t={t} value={f.guru} onChange={(v) => setF((x) => ({ ...x, guru: v }))} persons={others} multi={false} onPick={remember} />
          {plan.guru && <em className="lunar-hint ok">{t.treeWillPlace(f.name.trim() || "…", byId(plan.guru)!.name)}</em>}
        </label>
        {(me?.tree?.parent || plan.guru) && (
          <label>
            <span>{t.treeKind}</span>
            <select value={kind} title={t.treeKindsHint} onChange={(e) => setKind(e.target.value as TreeKind)}>
              {TREE_KINDS.map((k) => (
                <option key={k} value={k}>
                  {t.treeKinds[k]}
                </option>
              ))}
            </select>
            <em className="lunar-hint">{t.treeKindsHint}</em>
          </label>
        )}
      </div>
      {person && (
        <MoreGurus
          t={t}
          links={links}
          onChange={setLinks}
          persons={persons}
          inTree={!!me?.tree || !!plan.guru}
          exclude={[person.id, me?.tree?.parent ?? plan.guru ?? -1]}
        />
      )}
      <div className="form-grid one">
        <label>
          <span>{t.disciples}</span>
          <NamesInput t={t} value={f.disciples} onChange={(v) => setF((x) => ({ ...x, disciples: v }))} persons={others} multi onPick={remember} />
          {plan.disciples.length > 0 && (
            <em className="lunar-hint ok">{t.treeWillTake(plan.disciples.map((d) => byId(d)!.name).join(", "))}</em>
          )}
          {plan.removed.length > 0 && <em className="lunar-hint">{t.treeStays(plan.removed.map((d) => d.name).join(", "))}</em>}
        </label>
        {field("works", t.works, t.listHint)}
        {field("tags", t.tags, t.tagsHint)}
        <label>
          <span>{t.notes}</span>
          <textarea className="notes-editor" value={f.notes} placeholder={t.notesHint} onChange={set("notes")} />
        </label>
      </div>
      {error && <div className="error-box">{error}</div>}
    </Modal>
  );
}

// ---------------------------------------------------------------- earlier versions

/** Readable text of a version: the text itself, or the record's fields. */
function versionText(t: T, kind: "doc" | "person" | "place", data: string): string {
  try {
    if (kind === "place") return placeText(t, JSON.parse(data) as PlaceFields);
    if (kind === "doc") return (JSON.parse(data) as { text: string }[]).map((s) => s.text.trimEnd()).join("\n\n");
    const f = JSON.parse(data) as PersonFields;
    const rows: [string, string][] = [
      [t.name, f.name],
      [t.aka, f.aka],
      [t.appearance, f.appearance],
      [t.disappearance, f.disappearance],
      [t.place, f.place],
      [t.guru, f.guru],
      [t.disciples, f.disciples],
      [t.works, f.works],
      [t.tags, f.tags],
      [t.notes, f.notes],
    ];
    return rows
      .filter(([, v]) => v?.trim())
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n\n");
  } catch {
    return data;
  }
}

export function VersionsDialog({
  t,
  kind,
  target,
  label,
  onClose,
  onRestored,
}: {
  t: T;
  kind: "doc" | "person" | "place";
  target: number;
  label: string;
  onClose: () => void;
  onRestored: () => void;
}) {
  const [list, setList] = useState<Version[] | null>(null);
  const [sel, setSel] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    api.listVersions(kind, target).then(setList, (e) => setError(String(e)));
  }, [kind, target]);
  const cur = list?.[sel];
  const text = useMemo(() => (cur ? versionText(t, kind, cur.data) : ""), [cur, kind, t]);

  const restore = async () => {
    if (!cur || !(await ask(t.restoreVersionConfirm))) return;
    setBusy(true);
    try {
      await api.restoreVersion(cur.id);
      onRestored();
    } catch (e) {
      setError(String(e));
      setBusy(false);
    }
  };

  return (
    <Modal
      wide
      title={t.versionsTitle(label)}
      icon={<History size={18} />}
      onClose={onClose}
      footer={
        <>
          <span className="muted small grow">{t.versionsHint}</span>
          <button className="btn ghost" onClick={onClose}>
            {t.close}
          </button>
          <button className="btn" disabled={!cur || busy} onClick={restore}>
            {busy ? <span className="spinner light" /> : <Undo2 size={15} />} {t.restoreVersion}
          </button>
        </>
      }
    >
      {list && list.length === 0 ? (
        <p className="muted">{t.noVersions}</p>
      ) : (
        <div className="versions">
          <div className="version-list">
            {list?.map((v, i) => (
              <button key={v.id} className={i === sel ? "on" : ""} onClick={() => setSel(i)}>
                <strong>{v.saved}</strong>
                {v.label !== label && <em>{v.label}</em>}
              </button>
            ))}
          </div>
          <pre className="version-text">{text}</pre>
        </div>
      )}
      {error && <div className="error-box">{error}</div>}
    </Modal>
  );
}

// ---------------------------------------------------------------- merge

export function MergeDialog({
  t,
  person,
  persons,
  suggested,
  onClose,
  onDone,
}: {
  t: T;
  person: Person;
  persons: PersonListItem[];
  suggested: number[];
  onClose: () => void;
  onDone: () => void;
}) {
  const [q, setQ] = useState("");
  // Suggestions are listed, never ticked: two similar names can be two people.
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const others = persons.filter((p) => p.id !== person.id);
  const shown = useMemo(() => {
    const found = q.trim() ? filterPersons(others, q, 60) : others.filter((p) => suggested.includes(p.id));
    const pickedRows = others.filter((p) => picked.has(p.id) && !found.includes(p));
    return [...pickedRows, ...found];
  }, [q, others, picked, suggested]);
  const toggle = (id: number) =>
    setPicked((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const run = async () => {
    setBusy(true);
    try {
      await api.mergePersons(person.id, Array.from(picked));
      onDone();
    } catch (e) {
      setError(String(e));
      setBusy(false);
    }
  };

  return (
    <Modal
      title={t.mergeTitle(person.name)}
      icon={<GitMerge size={18} />}
      onClose={onClose}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>
            {t.cancel}
          </button>
          <button className="btn" disabled={busy || picked.size === 0} onClick={run}>
            {busy && <span className="spinner light" />} <GitMerge size={15} /> {t.mergeButton(picked.size)}
          </button>
        </>
      }
    >
      <p className="muted small">{t.mergeHint}</p>
      <div className="person-filter boxed">
        <Search size={14} />
        <input autoFocus value={q} placeholder={t.mergeSearch} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="merge-list">
        {shown.map((p) => (
          <label key={p.id} className="check block">
            <input type="checkbox" checked={picked.has(p.id)} onChange={() => toggle(p.id)} />
            <span>
              {p.name} <em className="muted small">{t.documents(p.docs)}</em>
              {p.aka && <em className="muted small">{p.aka}</em>}
            </span>
          </label>
        ))}
      </div>
      {error && <div className="error-box">{error}</div>}
    </Modal>
  );
}

// ---------------------------------------------------------------- holy places

/** Readable text of a place's version. */
function placeText(t: T, f: PlaceFields): string {
  const rows: [string, string][] = [
    [t.placeName, f.name],
    [t.placeAka, f.aka],
    [t.placeRegion, f.region],
    [t.placeLocation, f.location],
    [t.placeAbout, f.about],
    [t.placeSource, f.source],
    [t.placeCoords, f.lat != null && f.lon != null ? `${f.lat}, ${f.lon}` : ""],
  ];
  return rows
    .filter(([, v]) => v?.trim())
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n\n");
}

const coordsText = (f: PlaceFields) => (f.lat != null && f.lon != null ? `${f.lat}, ${f.lon}` : "");

/** "23.62, 88.09" → [23.62, 88.09]; "" → [null, null]; anything else → undefined. */
function parseCoords(s: string): [number | null, number | null] | undefined {
  if (!s.trim()) return [null, null];
  const m = s.trim().match(/^(-?\d+(?:[.,]\d+)?)\s*[,;\s]\s*(-?\d+(?:[.,]\d+)?)$/);
  if (!m) return undefined;
  const la = Number(m[1].replace(",", "."));
  const lo = Number(m[2].replace(",", "."));
  return Math.abs(la) <= 90 && Math.abs(lo) <= 180 ? [la, lo] : undefined;
}

export function PlaceDialog({
  t,
  place,
  persons,
  onClose,
  onSaved,
}: {
  t: T;
  /** null = new place */
  place: Place | null;
  persons: PersonListItem[];
  onClose: () => void;
  onSaved: (id: number) => void;
}) {
  const [initial] = useState<PlaceFields>(() => {
    const { id: _id, modified: _m, ...fields } = place ?? { ...EMPTY_PLACE, id: 0, modified: "" };
    return { ...EMPTY_PLACE, ...fields };
  });
  const [f, setF] = useState<PlaceFields>(initial);
  const [coords, setCoords] = useState(() => coordsText(initial));
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const parsed = parseCoords(coords);
  const dirty = JSON.stringify(f) !== JSON.stringify(initial) || coords !== coordsText(initial);
  const set = (k: keyof PlaceFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const matches = useMemo(() => filterPersons(persons, q, 12), [persons, q]);
  const name = (id: number) => persons.find((p) => p.id === id)?.name ?? "?";

  const close = async () => {
    if (!dirty || (await ask(t.unsaved))) onClose();
  };
  const save = async () => {
    if (!parsed) return setError(t.placeCoordsBad);
    setBusy(true);
    setError(null);
    try {
      const id = await api.savePlace(place?.id ?? null, { ...f, lat: parsed[0], lon: parsed[1] });
      onSaved(id);
    } catch (e) {
      setError(String(e));
      setBusy(false);
    }
  };
  useCtrlS(dirty && !busy && !!f.name.trim() && !!parsed, save);

  const field = (k: keyof PlaceFields, label: string, hint?: string) => (
    <label>
      <span>{label}</span>
      <input value={f[k] as string} onChange={set(k)} spellCheck={false} />
      {hint && <em className="lunar-hint">{hint}</em>}
    </label>
  );

  return (
    <Modal
      wide
      title={place ? t.editPlace : t.newPlace}
      icon={<MapPin size={18} />}
      onClose={close}
      footer={
        <>
          <span className="grow" />
          <button className="btn ghost" onClick={close}>
            {t.cancel}
          </button>
          <button className="btn" disabled={!dirty || busy || !f.name.trim() || !parsed} onClick={save}>
            {busy ? <span className="spinner light" /> : null} {t.save} <kbd className="kbd on-accent">Ctrl S</kbd>
          </button>
        </>
      }
    >
      <div className="form-grid">
        <label>
          <span>{t.placeName}</span>
          <input value={f.name} onChange={set("name")} autoFocus={!place} spellCheck={false} />
        </label>
        {field("aka", t.placeAka, t.placeAkaHint)}
        {field("region", t.placeRegion, t.placeRegionHint)}
        {field("location", t.placeLocation, t.placeLocationHint)}
        <label>
          <span>{t.placeCoords}</span>
          <input value={coords} onChange={(e) => setCoords(e.target.value)} spellCheck={false} />
          <em className={`lunar-hint${parsed ? "" : " bad"}`}>{parsed ? t.placeCoordsHint : t.placeCoordsBad}</em>
        </label>
        {field("source", t.placeSource, t.placeSourceHint)}
      </div>
      <div className="more-gurus">
        <span className="more-gurus-title">{t.placePeople}</span>
        {f.people.map((p, i) => (
          <div key={`${p.personId}-${i}`} className="more-guru">
            <UserRound size={14} />
            <span className="grow">{name(p.personId)}</span>
            <select
              value={p.role}
              title={t.placeRoleHints[p.role]}
              onChange={(e) => setF({ ...f, people: f.people.map((x, j) => (j === i ? { ...x, role: e.target.value as PlaceRole } : x)) })}
            >
              {PLACE_ROLES.map((r) => (
                <option key={r} value={r} title={t.placeRoleHints[r]}>
                  {t.placeRoles[r]}
                </option>
              ))}
            </select>
            <button className="icon-btn" title={t.delete} onClick={() => setF({ ...f, people: f.people.filter((_, j) => j !== i) })}>
              <X size={14} />
            </button>
          </div>
        ))}
        <div className="picker">
          <input value={q} placeholder={t.placeAddPerson} onChange={(e) => setQ(e.target.value)} />
          {q.trim() && matches.length > 0 && (
            <div className="picker-list">
              {matches.map((m) => (
                <button
                  key={m.id}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setF({ ...f, people: [...f.people, { personId: m.id, role: "sripata" }] });
                    setQ("");
                  }}
                >
                  <UserRound size={13} /> {m.name}
                  {m.aka && <em>{m.aka}</em>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="form-grid one">
        <label>
          <span>{t.placeAbout}</span>
          <textarea className="notes-editor" value={f.about} placeholder={t.placeAboutHint} onChange={set("about")} />
        </label>
      </div>
      {error && <div className="error-box">{error}</div>}
    </Modal>
  );
}
