import { useEffect, useMemo, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { FilePlus2, FileText, History, ImagePlus, Images, Map as MapIcon, MapPin, MoreHorizontal, Pencil, Trash2, UserRound, X } from "lucide-react";
import { api, fileUrl, OverviewPerson, Place, PLACE_ROLES, PersonListItem, PlaceText } from "../api";
import { Lang, T } from "../i18n";
import { namesPlace, placeKeys, textKeys } from "../places";
import { WebLinks } from "./PersonView";
import { ask, Modal } from "./ui";

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** "What there is": the names of the place's people as links to their records. */
function AboutText({ text, people, onPerson, onError }: { text: string; people: PersonListItem[]; onPerson: (id: number) => void; onError: (m: string) => void }) {
  // each name also without its «Śrī / Śrīla / Śrīmatī» (the text says «Kṛṣṇadāsa Kavirāja Gosvāmī»)
  const forms = people
    .flatMap((p) => [p.name, p.name.replace(/^(Śrīla|Śrīmatī|Śrī)\s+/, "")].map((n) => ({ n, p })))
    .filter(({ n }) => n.length >= 4)
    .sort((a, b) => b.n.length - a.n.length);
  if (!forms.length) return <WebLinks text={text} onError={onError} />;
  // capitals do not matter («Raghunātha Dāsa» = «Raghunātha dāsa»)
  const re = new RegExp(`(${[...new Set(forms.map((f) => escape(f.n)))].join("|")})`, "gi");
  return (
    <>
      {text.split(re).map((s, i) => {
        const p = i % 2 ? forms.find((x) => x.n.toLowerCase() === s.toLowerCase())?.p : undefined;
        return p ? (
          <button key={i} className="name-link inline" onClick={() => onPerson(p.id)}>
            {s}
          </button>
        ) : (
          <WebLinks key={i} text={s} onError={onError} />
        );
      })}
    </>
  );
}

/** Writing or changing one text of a place: a title and the text (Markdown). */
function PlaceTextDialog({ t, text, onClose, onSave }: { t: T; text: PlaceText | null; onClose: () => void; onSave: (x: PlaceText) => Promise<void> }) {
  const [title, setTitle] = useState(text?.title ?? "");
  const [body, setBody] = useState(text?.body ?? "");
  const [busy, setBusy] = useState(false);
  const dirty = title !== (text?.title ?? "") || body !== (text?.body ?? "");
  const ok = dirty && !busy && !!(title.trim() || body.trim());
  const close = async () => {
    if (!dirty || (await ask(t.unsaved))) onClose();
  };
  const save = async () => {
    if (!ok) return;
    setBusy(true);
    await onSave({ title, body }).finally(() => setBusy(false));
  };
  return (
    <Modal
      wide
      title={text ? t.placeTextEdit : t.placeTextNew}
      icon={<FileText size={18} />}
      onClose={close}
      footer={
        <>
          <span className="grow" />
          <button className="btn ghost" onClick={close}>
            {t.cancel}
          </button>
          <button className="btn" disabled={!ok} onClick={save}>
            {busy ? <span className="spinner light" /> : null} {t.save} <kbd className="kbd on-accent">Ctrl S</kbd>
          </button>
        </>
      }
    >
      <div
        className="form-grid one place-text-form"
        onKeyDown={(e) => {
          if (e.ctrlKey && e.key.toLowerCase() === "s") {
            e.preventDefault();
            save();
          }
        }}
      >
        <label>
          <span>{t.placeTextTitle}</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus placeholder={t.placeTextTitleHint} spellCheck={false} />
        </label>
        <label>
          <span>{t.placeTextBody}</span>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={16} spellCheck={false} />
        </label>
      </div>
    </Modal>
  );
}

export function PlaceView({
  t,
  lang,
  place,
  persons,
  reload,
  onPerson,
  onEdit,
  onDelete,
  onVersions,
  onMap,
  onToast,
  onChanged,
}: {
  t: T;
  lang: Lang;
  place: Place;
  persons: PersonListItem[];
  reload: number;
  onPerson: (id: number) => void;
  onEdit: (p: Place) => void;
  onDelete: (p: Place) => void;
  onVersions: (p: Place) => void;
  onMap: (p: Place) => void;
  onToast: (msg: string) => void;
  /** its picture changed: the list of places is read again */
  onChanged: () => void;
}) {
  const [menu, setMenu] = useState(false);
  const choosePhoto = async () => {
    try {
      const path = await open({ multiple: false, filters: [{ name: t.imageFiles, extensions: ["jpg", "jpeg", "png", "webp", "gif", "bmp", "avif"] }] });
      if (typeof path !== "string") return;
      await api.setPlacePhoto(place.id, path);
      onChanged();
    } catch (e) {
      onToast(String(e));
    }
  };
  const removePhoto = () => api.removePlacePhoto(place.id).then(onChanged, (e) => onToast(String(e)));
  // its texts (format 10): saved with the place, so each change is kept in its versions
  const texts = place.texts ?? [];
  const [editing, setEditing] = useState<{ i: number | null } | null>(null);
  const saveTexts = async (next: PlaceText[]) => {
    const { id: _id, modified: _m, hasPhoto: _h, images: _i, ...fields } = place;
    await api.savePlace(place.id, { ...fields, texts: next });
    onChanged();
  };
  const saveText = async (x: PlaceText) => {
    try {
      const i = editing?.i ?? null;
      await saveTexts(i === null ? [...texts, x] : texts.map((y, j) => (j === i ? x : y)));
      setEditing(null);
    } catch (e) {
      onToast(String(e));
    }
  };
  const removeText = async (i: number) => {
    if (!(await ask(t.placeTextRemoveConfirm))) return;
    saveTexts(texts.filter((_, j) => j !== i)).catch((e) => onToast(String(e)));
  };
  // more pictures (format 10)
  const [zoom, setZoom] = useState<number | null>(null);
  const addImages = async () => {
    try {
      const picked = await open({ multiple: true, filters: [{ name: t.imageFiles, extensions: ["jpg", "jpeg", "png", "webp", "gif", "bmp", "avif"] }] });
      const paths = Array.isArray(picked) ? picked : typeof picked === "string" ? [picked] : [];
      if (!paths.length) return;
      await api.addPlaceImages(place.id, paths);
      onChanged();
    } catch (e) {
      onToast(String(e));
    }
  };
  const imageAction = (f: () => Promise<unknown>) => () => f().then(onChanged, (e) => onToast(String(e)));
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [menu]);
  // the records' "Place" field, to find those that name it there
  const [all, setAll] = useState<OverviewPerson[]>([]);
  useEffect(() => void api.overview().then(setAll, () => {}), [reload]);

  const byId = useMemo(() => new Map(persons.map((p) => [p.id, p])), [persons]);
  const groups = PLACE_ROLES.map((role) => ({
    role,
    people: place.people.filter((x) => x.role === role).map((x) => byId.get(x.personId)).filter((p): p is PersonListItem => !!p),
  })).filter((g) => g.people.length > 0);
  const listed = new Set(place.people.map((x) => x.personId));
  const keys = useMemo(() => placeKeys(place), [place]);
  const namedIn = all.filter((p) => !listed.has(p.id) && p.place.trim() && namesPlace(textKeys(p.place), keys));
  const where = [place.region, place.location].filter((s) => s.trim());
  const hasMap = place.lat != null && place.lon != null;

  const card = (label: string, body: React.ReactNode, wide = false, hint?: string) => (
    <div className={`fact${wide ? " wide" : ""}`}>
      <dt title={hint} className={hint ? "has-hint" : undefined}>{label}</dt>
      <dd>{body}</dd>
    </div>
  );

  return (
    <div className="reader person-view place-view">
      <div className="reader-scroll">
        <div className="person-inner">
          <header className="person-head">
            <div className="person-cover-wrap">
              <button className="person-cover place-cover" title={t.choosePhoto} onClick={choosePhoto}>
                {place.hasPhoto ? <img src={`${fileUrl("placephoto", place.id)}?v=${encodeURIComponent(place.modified)}`} alt="" /> : <MapPin size={44} />}
                <span className="cover-overlay">
                  <ImagePlus size={20} />
                  {place.hasPhoto ? t.changePhoto : t.choosePhoto}
                </span>
              </button>
              {place.hasPhoto && (
                <button className="icon-btn cover-remove" title={t.removePhoto} onClick={removePhoto}>
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="person-title">
              <span className="parampara-seal place-seal">
                <MapPin size={13} /> {t.tirthas}
              </span>
              <h1>{place.name}</h1>
              {place.aka && <div className="aka">{place.aka}</div>}
              <div className="person-actions">
                <button className="btn" onClick={() => onEdit(place)}>
                  <Pencil size={15} /> {t.editPlace}
                </button>
                <button className="btn ghost" disabled={!hasMap} title={hasMap ? `${place.lat}, ${place.lon}` : t.placeNoMap} onClick={() => onMap(place)}>
                  <MapIcon size={15} /> {hasMap ? t.placeOnMap : t.placeNoMap}
                </button>
                <div className="menu-wrap">
                  <button
                    className={`icon-btn ${menu ? "on" : ""}`}
                    title={t.more}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenu((m) => !m);
                    }}
                  >
                    <MoreHorizontal size={18} />
                  </button>
                  {menu && (
                    <div className="menu" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => (setMenu(false), onVersions(place))}>
                        <History size={15} /> {t.versions}
                      </button>
                      <hr />
                      <button className="danger" onClick={() => (setMenu(false), onDelete(place))}>
                        <Trash2 size={15} /> {t.deletePlace}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <dl className="facts">
            {where.length > 0 && card(t.placeLocation, where.join(" · "))}
            {place.source.trim() && card(t.placeSource, place.source)}
            {groups.map((g) =>
              card(
                t.placeRoles[g.role],
                g.people.map((p) => (
                  <button key={p.id} className="name-link" onClick={() => onPerson(p.id)}>
                    {p.name}
                  </button>
                )),
                false,
                t.placeRoleHints[g.role],
              ),
            )}
            {place.about.trim() && (
              <div className="fact wide">
                <dt>{t.placeAbout}</dt>
                <dd className="notes">
                  <AboutText text={place.about} people={place.people.map((x) => byId.get(x.personId)).filter((p): p is PersonListItem => !!p)} onPerson={onPerson} onError={onToast} />
                </dd>
              </div>
            )}
            {namedIn.length > 0 && (
              <div className="fact wide">
                <dt title={t.placeNamedInHint}>
                  {t.placeNamedIn} <span className="count">{namedIn.length.toLocaleString(lang)}</span>
                </dt>
                <dd>
                  {namedIn.map((p) => (
                    <button key={p.id} className="name-link" title={p.place} onClick={() => onPerson(p.id)}>
                      <UserRound size={12} /> {p.name}
                    </button>
                  ))}
                </dd>
              </div>
            )}
          </dl>
          <section>
            <h2>
              <FileText size={14} /> {t.placeTexts} {texts.length > 0 && <span className="pill">{texts.length}</span>}
            </h2>
            {texts.map((x, i) => (
              <div key={i} className="place-text">
                <div className="place-text-head">
                  <span className="grow">{x.title.trim() || t.placeTextUntitled}</span>
                  <button className="icon-btn" title={t.edit} onClick={() => setEditing({ i })}>
                    <Pencil size={14} />
                  </button>
                  <button className="icon-btn danger" title={t.placeTextRemove} onClick={() => removeText(i)}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="notes">
                  <AboutText text={x.body} people={place.people.map((y) => byId.get(y.personId)).filter((p): p is PersonListItem => !!p)} onPerson={onPerson} onError={onToast} />
                </div>
              </div>
            ))}
            <button className="btn ghost" onClick={() => setEditing({ i: null })}>
              <FilePlus2 size={15} /> {t.placeTextAdd}
            </button>
          </section>

          <section>
            <h2>
              <Images size={14} /> {t.gallery} {place.images.length > 0 && <span className="pill">{place.images.length}</span>}
            </h2>
            <div className="gallery">
              {place.images.map((id) => (
                <figure key={id}>
                  <a href={fileUrl("placeimage", id)} target="_blank" rel="noreferrer" onClick={(e) => (e.preventDefault(), setZoom(id))}>
                    <img src={fileUrl("placeimage", id)} alt="" loading="lazy" />
                  </a>
                  <figcaption>
                    <button className="icon-btn" title={t.useAsMainPlace} onClick={imageAction(() => api.placeImageAsPhoto(id))}>
                      <MapPin size={14} />
                    </button>
                    <button
                      className="icon-btn danger"
                      title={t.removeImage}
                      onClick={async () => (await ask(t.placeImageRemoveConfirm)) && imageAction(() => api.removePlaceImage(id))()}
                    >
                      <Trash2 size={14} />
                    </button>
                  </figcaption>
                </figure>
              ))}
              <button className="gallery-add" onClick={addImages}>
                <ImagePlus size={22} />
                <span>{t.addImages}</span>
              </button>
            </div>
          </section>

          {!where.length && !place.about.trim() && !groups.length && !texts.length && (
            <p className="muted small no-facts" onClick={() => onEdit(place)}>
              {t.noDetails}
            </p>
          )}
        </div>
      </div>
      {editing && <PlaceTextDialog t={t} text={editing.i === null ? null : texts[editing.i]} onClose={() => setEditing(null)} onSave={saveText} />}
      {zoom !== null && (
        <div className="zoom" onClick={() => setZoom(null)}>
          <img src={fileUrl("placeimage", zoom)} alt="" />
        </div>
      )}
    </div>
  );
}
