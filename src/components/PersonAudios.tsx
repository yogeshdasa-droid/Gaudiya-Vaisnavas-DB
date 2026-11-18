// «Audios» in a record (Whisper, 18-11-2026): Śrīla Gurudeva's recordings that name this person — in their title, or
// in the written lecture of their day («Lectures Gurudeva», the Anthology, or one linked by hand), the lectures that
// name it most first. Looked for only when the section is opened (the folder and the search take a moment).
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Headphones, Pause, Play } from "lucide-react";
import { api, AUDIOS_LIB, DocListItem, libUrl } from "../api";
import { Lang, T } from "../i18n";
import { ANTHOLOGY, formatLecDate } from "./Anthology";
import { langShown, Rec, scanAudios, Written, writtenByDate } from "./Audios";
import { foldName } from "./Sidebar";
import { player, Track, usePlayer } from "../audioPlayer";
import { audioKey, useAudioData } from "../audioData";

const LECTURES = "Lectures Gurudeva";
/** the words in front of a name that the lectures and titles often leave out */
const HONOURS = new Set(["sri", "srila", "srimati", "sriman", "lord", "bhakta", "om", "visnupada", "paramahamsa", "jagad-guru", "jagadguru"].map(foldName));
/** how many of the lectures that name it are shown at first */
const FIRST = 25;

/** the ways a record is named: its name and other names, without «Śrīla…» in front nor «(…)» after */
function namesOf(name: string, aka: string): string[] {
  const out: string[] = [];
  for (const n of [name, ...aka.split(/[,;\n]/)]) {
    const words = n.replace(/\(.*?\)/g, " ").replace(/["«»]/g, " ").trim().split(/\s+/).filter(Boolean);
    while (words.length > 1 && HONOURS.has(foldName(words[0]))) words.shift();
    const v = words.join(" ");
    if (foldName(v).replace(/\s/g, "").length >= 4 && !out.some((x) => foldName(x) === foldName(v))) out.push(v);
  }
  return out.slice(0, 5);
}
/** loose spelling for titles: «Rupa Goswami» = «Rūpa Gosvāmī», «Thakur» = «Ṭhākura» */
const loose = (s: string) => ` ${foldName(s).replace(/w/g, "v").replace(/([a-z]{3,})a\b/g, "$1")} `;

interface Found {
  r: Rec;
  /** named in the written lecture of its day: how many times, and which lecture */
  times?: number;
  lec?: Written;
}

interface Props {
  t: T;
  lang: Lang;
  name: string;
  aka: string;
  docs: DocListItem[];
  onAudio: (rel: string) => void;
  onOpenDoc: (docId: number, ordinal?: number) => void;
}

export function PersonAudios({ t, lang, name, aka, docs, onAudio, onOpenDoc }: Props) {
  const P = t.personAudios;
  const [open, setOpen] = useState(false);
  const [res, setRes] = useState<{ title: Found[]; speech: Found[] } | null>(null);
  const [more, setMore] = useState(false);
  const links = useAudioData();
  const ps = usePlayer();
  const names = useMemo(() => namesOf(name, aka), [name, aka]);

  useEffect(() => {
    setRes(null);
    setMore(false);
  }, [name, aka]);

  useEffect(() => {
    if (!open || res) return;
    let alive = true;
    (async () => {
      const [{ recs }, w] = await Promise.all([scanAudios(), writtenByDate(docs)]);
      const shown = recs.filter((r) => langShown(r.lang));
      // 1. the title names it
      const needles = names.map(loose).filter((n) => n.trim().length >= 4);
      const title = shown.filter((r) => needles.some((n) => loose(`${r.title} ${r.name.replace(/[_.]/g, " ")}`).includes(n)));
      const inTitle = new Set(title.map((r) => r.rel));
      // 2. the written lectures that name it, and how many times
      const times = new Map<string, number>();
      // (a name of one word — «Rūpa», «Gadādhara» — only if there is no longer one: «rūpa» is also «form»)
      const long = names.filter((n) => n.trim().split(/\s+/).length > 1);
      for (const n of long.length ? long : names) {
        const r = await api.search({ query: `"${n.replace(/"/g, "")}"`, titlesOnly: false, prefix: false, sort: "relevance", collections: [LECTURES, ANTHOLOGY], dir: null, docId: null, personId: null, offset: 0, limit: 500 });
        for (const h of r.hits) {
          const k = h.collection === ANTHOLOGY ? `${h.docId}:${h.ordinal}` : `${h.docId}`;
          times.set(k, Math.max(times.get(k) ?? 0, h.hits || 1));
        }
      }
      const lecOf = new Map(w.all.map((x) => [x.ord === undefined ? `${x.doc}` : `${x.doc}:${x.ord}`, x]));
      const byDate = new Map<string, Rec[]>();
      for (const r of shown) if (r.date.length === 10) byDate.set(r.date, [...(byDate.get(r.date) ?? []), r]);
      const speech: Found[] = [];
      const seen = new Set<string>();
      const add = (r: Rec, n: number, lec: Written) => {
        if (inTitle.has(r.rel) || seen.has(r.rel)) return;
        // a lecture taken out of this recording by hand does not count
        const hide = links[audioKey(r.name)]?.hide ?? [];
        if (hide.includes(`${lec.doc}`) || hide.includes(`${lec.doc}:${lec.ord}`)) return;
        seen.add(r.rel);
        speech.push({ r, times: n, lec });
      };
      for (const [k, n] of [...times].sort((a, b) => b[1] - a[1])) {
        const lec = lecOf.get(k);
        if (!lec) continue;
        for (const r of byDate.get(lec.date) ?? []) add(r, n, lec);
        // and the recordings this lecture was linked to by hand
        for (const r of shown) {
          const l = links[audioKey(r.name)];
          if (l?.doc === lec.doc && (lec.ord === undefined || l.ord === lec.ord)) add(r, n, lec);
        }
      }
      title.sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999") || a.name.localeCompare(b.name));
      if (alive) setRes({ title: title.map((r) => ({ r })), speech });
    })().catch(() => alive && setRes({ title: [], speech: [] }));
    return () => {
      alive = false;
    };
  }, [open, res, names, docs, links]);

  const titleOf = (r: Rec) => links[audioKey(r.name)]?.title || r.title || r.name;
  const tracksOf = (fs: Found[]): Track[] =>
    fs.filter((f) => f.r.playable).map(({ r }) => ({ rel: r.rel, url: libUrl(AUDIOS_LIB, r.rel), title: titleOf(r), sub: [r.date && formatLecDate(r.date.length === 7 ? r.date.slice(0, 4) : r.date, lang), r.place].filter(Boolean).join(" · ") }));
  const cur = ps.list[ps.index]?.rel;
  const total = res ? res.title.length + res.speech.length : null;

  const row = (f: Found, group: Found[]) => {
    const { r } = f;
    const on = cur === r.rel;
    return (
      <div key={r.rel} className={`pa-row${on ? " on" : ""}`}>
        {r.playable ? (
          <button
            className="ty-play"
            title={P.play}
            onClick={() => {
              const ts = tracksOf(group);
              player.play(ts, Math.max(0, ts.findIndex((x) => x.rel === r.rel)));
            }}
          >
            {on && ps.playing ? <Pause size={13} /> : <Play size={13} />}
          </button>
        ) : (
          <span className="ty-play off">
            <Headphones size={13} />
          </span>
        )}
        <button className="pa-main" onClick={() => onAudio(r.rel)} title={P.openAudio + "\n" + r.name}>
          <span className="pa-title">{titleOf(r)}</span>
          <span className="muted small">
            {[r.date ? formatLecDate(r.date.length === 7 ? r.date.slice(0, 4) : r.date, lang) : "", r.part, r.place].filter(Boolean).join(" · ")}
          </span>
        </button>
        {f.lec && (
          <button className="pa-lec" onClick={() => onOpenDoc(f.lec!.doc, f.lec!.ord)} title={`${P.openText}\n${f.lec.title}`}>
            <BookOpen size={12} /> {P.times(f.times ?? 1)}
          </button>
        )}
      </div>
    );
  };

  return (
    <details className="ency-sec contemporaries person-audios" open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
      <summary>
        <dt>
          <Headphones size={14} /> {P.title} {total !== null && <span className="count">{total}</span>}
        </dt>
      </summary>
      {!res ? (
        <p className="muted small">{P.looking}</p>
      ) : total === 0 ? (
        <p className="muted small">{P.none(names.join(" · "))}</p>
      ) : (
        <>
          <p className="muted small">{P.hint(names.join(" · "))}</p>
          {res.title.length > 0 && (
            <div className="pa-group">
              <h4>{P.inTitle(res.title.length)}</h4>
              {res.title.map((f) => row(f, res.title))}
            </div>
          )}
          {res.speech.length > 0 && (
            <div className="pa-group">
              <h4>{P.inSpeech(res.speech.length)}</h4>
              {(more ? res.speech : res.speech.slice(0, FIRST)).map((f) => row(f, res.speech))}
              {res.speech.length > FIRST && (
                <button className="link-btn small" onClick={() => setMore(!more)}>
                  {more ? P.fewer : P.more(res.speech.length - FIRST)}
                </button>
              )}
            </div>
          )}
        </>
      )}
    </details>
  );
}
