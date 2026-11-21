import { useEffect, useRef, useState } from "react";
import { FileText, Folder, ListTree, SearchX, UserRound, X } from "lucide-react";
import { Hit, hueOf, SearchResult } from "../api";
import { highlightParts, Term } from "../fold";
import { Lang, T } from "../i18n";
import { AnimatedNumber, CollectionChip, collectionLabel } from "./ui";

export interface Filters {
  collections: string[];
  scope: { dir: string; label: string } | null;
  doc: { id: number; title: string } | null;
  person: { id: number; name: string } | null;
  /** only texts of records in the Guru Paramparā */
  paramparaOnly: boolean;
  /** only these kinds: "md" (notes), "pdf", "doc" (Word) */
  kinds: string[];
}

export const EMPTY_FILTERS: Filters = { collections: [], scope: null, doc: null, person: null, paramparaOnly: false, kinds: [] };

export const hasFilter = (f: Filters) =>
  f.collections.length > 0 || !!f.scope || !!f.doc || !!f.person || f.paramparaOnly || f.kinds.length > 0;

interface Props {
  t: T;
  lang: Lang;
  result: SearchResult | null;
  hits: Hit[];
  loading: boolean;
  selected: number;
  onSelect: (i: number) => void;
  onPerson: (id: number) => void;
  onLoadMore: () => void;
  filters: Filters;
  onFilters: (f: Filters) => void;
  hasQuery: boolean;
  generation: number;
  /** above the records and texts: the Tīrthas and Hari-kathā that say it too */
  extra?: React.ReactNode;
}

/** a collection and its folders («Lectures Gurudeva», «Lectures Gurudeva/2003»…) as one */
interface FacetGroup {
  name: string;
  count: number;
  parts: { name: string; count: number }[];
}
function groupFacets(facets: { name: string; count: number }[]): FacetGroup[] {
  const by = new Map<string, FacetGroup>();
  for (const f of facets) {
    const top = f.name.split("/")[0];
    const g = by.get(top) ?? { name: top, count: 0, parts: [] };
    g.count += f.count;
    g.parts.push(f);
    by.set(top, g);
  }
  // the parts by name (the years in order), the groups by how much they have
  for (const g of by.values()) g.parts.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  return [...by.values()].sort((a, b) => b.count - a.count);
}

function Highlighted({ text, terms }: { text: string; terms: Term[] }) {
  return (
    <>
      {highlightParts(text, terms).map((p, i) => (p.hit ? <mark key={i}>{p.s}</mark> : <span key={i}>{p.s}</span>))}
    </>
  );
}

function Skeleton() {
  return (
    <div className="hit skeleton">
      <div className="sk sk-title" />
      <div className="sk sk-meta" />
      <div className="sk sk-line" />
      <div className="sk sk-line short" />
    </div>
  );
}

function ScopeChip({ icon, label, onClear }: { icon: React.ReactNode; label: string; onClear: () => void }) {
  return (
    <span className="scope" title={label}>
      {icon} <span>{label}</span>
      <button onClick={onClear}>
        <X size={12} />
      </button>
    </span>
  );
}

export function Results(p: Props) {
  const { t, lang, result, hits, loading, selected, onSelect, filters, onFilters, hasQuery } = p;
  const listRef = useRef<HTMLDivElement>(null);
  const terms = result?.terms ?? [];

  useEffect(() => {
    listRef.current?.querySelector(`[data-i="${selected}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selected]);
  // the records that say it: the first five, the rest on request
  const [allPersons, setAllPersons] = useState(false);
  useEffect(() => {
    listRef.current?.scrollTo({ top: 0 });
    setAllPersons(false);
  }, [p.generation]);

  const toggleCollection = (name: string) => {
    const has = filters.collections.includes(name);
    onFilters({ ...filters, collections: has ? filters.collections.filter((c) => c !== name) : [...filters.collections, name] });
  };
  // the collections in folders («Lectures Gurudeva/2003»…) as one chip with the total (21-11-2026: 30 chips were too
  // many); chosen, its parts appear in a row below to narrow it
  const groups = groupFacets(result?.facets ?? []);
  const groupOn = (g: FacetGroup) => g.parts.every((x) => filters.collections.includes(x.name));
  const groupSome = (g: FacetGroup) => g.parts.some((x) => filters.collections.includes(x.name));
  const toggleGroup = (g: FacetGroup) => {
    const names = g.parts.map((x) => x.name);
    const rest = filters.collections.filter((c) => !names.includes(c));
    onFilters({ ...filters, collections: groupSome(g) ? rest : [...rest, ...names] });
  };
  // a part of a group: only that one (the first click), then several
  const togglePart = (g: FacetGroup, name: string) => {
    const names = g.parts.map((x) => x.name);
    const mine = filters.collections.filter((c) => names.includes(c));
    const rest = filters.collections.filter((c) => !names.includes(c));
    if (mine.length === names.length) return onFilters({ ...filters, collections: [...rest, name] });
    const next = mine.includes(name) ? mine.filter((c) => c !== name) : [...mine, name];
    onFilters({ ...filters, collections: [...rest, ...(next.length ? next : names)] });
  };
  const label = collectionLabel;
  const open = groups.find((g) => g.parts.length > 1 && groupSome(g));
  const scoped = !!filters.scope || !!filters.doc || !!filters.person;

  return (
    <div className="results">
      <div className="filters">
        <div className="facets">
          <button className={`facet ${filters.collections.length === 0 ? "on" : ""}`} onClick={() => onFilters({ ...filters, collections: [] })}>
            {t.allCollections}
          </button>
          {groups.map((g) =>
            g.parts.length === 1 && g.parts[0].name === g.name ? (
              <button
                key={g.name}
                className={`facet ${filters.collections.includes(g.name) ? "on" : ""}`}
                style={{ "--h": hueOf(g.name) } as React.CSSProperties}
                onClick={() => toggleCollection(g.name)}
              >
                <i className="dot" />
                {label(g.name)}
                <span className="n">{g.count.toLocaleString(lang)}</span>
              </button>
            ) : (
              <button
                key={g.name}
                className={`facet group ${groupOn(g) ? "on" : groupSome(g) ? "some" : ""}`}
                style={{ "--h": hueOf(g.name) } as React.CSSProperties}
                onClick={() => toggleGroup(g)}
                title={t.facetGroupHint(g.parts.length)}
              >
                <i className="dot" />
                {label(g.name)}
                <span className="n">{g.count.toLocaleString(lang)}</span>
              </button>
            ),
          )}
        </div>
        {open && (
          <div className="facets parts">
            <span className="parts-name">{label(open.name)}:</span>
            {open.parts.map((x) => (
              <button
                key={x.name}
                className={`facet small ${filters.collections.includes(x.name) && !groupOn(open) ? "on" : ""}`}
                onClick={() => togglePart(open, x.name)}
              >
                {x.name.slice(open.name.length + 1) || label(open.name)}
                <span className="n">{x.count.toLocaleString(lang)}</span>
              </button>
            ))}
          </div>
        )}
        <div className="facets kinds">
          <button
            className={`facet ${filters.paramparaOnly ? "on" : ""}`}
            title={t.onlyParamparaHint}
            onClick={() => onFilters({ ...filters, paramparaOnly: !filters.paramparaOnly })}
          >
            <ListTree size={12} /> {t.parampara}
          </button>
          {(
            [
              ["md", t.kindNotes],
              ["pdf", "PDF"],
              ["doc", "Word"],
            ] as [string, string][]
          ).map(([k, label]) => (
            <button
              key={k}
              className={`facet ${filters.kinds.includes(k) ? "on" : ""}`}
              onClick={() =>
                onFilters({ ...filters, kinds: filters.kinds.includes(k) ? filters.kinds.filter((x) => x !== k) : [...filters.kinds, k] })
              }
            >
              {label}
            </button>
          ))}
        </div>
        {scoped && (
          <div className="filter-row">
            {filters.person && (
              <ScopeChip icon={<UserRound size={13} />} label={filters.person.name} onClear={() => onFilters({ ...filters, person: null })} />
            )}
            {filters.scope && <ScopeChip icon={<Folder size={13} />} label={filters.scope.label} onClear={() => onFilters({ ...filters, scope: null })} />}
            {filters.doc && <ScopeChip icon={<FileText size={13} />} label={filters.doc.title} onClear={() => onFilters({ ...filters, doc: null })} />}
            <button className="link-btn" onClick={() => onFilters(EMPTY_FILTERS)}>
              {t.clearFilters}
            </button>
          </div>
        )}
        <div className="result-count">
          {result && !result.error && (
            <>
              <strong>
                <AnimatedNumber value={result.total} format={(n) => (hasQuery ? t.results(Math.round(n)) : t.documents(Math.round(n)))} />
              </strong>
              <span className="pill">{t.inMs(result.millis)}</span>
            </>
          )}
          <span className={`loading-bar ${loading ? "on" : ""}`} />
        </div>
      </div>

      <div className="result-list" ref={listRef}>
        {result?.error && <div className="error-box">{result.error}</div>}
        {hasQuery && p.extra}
        {!result && [0, 1, 2, 3, 4].map((i) => <Skeleton key={i} />)}
        {result && !result.error && hits.length === 0 && result.persons.length === 0 && !loading && (
          <div className="empty-state small">
            <SearchX size={34} />
            <p>{t.noResults}</p>
            <p className="muted small">{t.noResultsHint}</p>
          </div>
        )}
        {hasQuery && result && result.persons.length > 0 && (
          <div className="person-hits">
            <div className="person-hits-title">
              {t.personHits} <span className="n">{result.persons.length >= 100 ? "100+" : result.persons.length}</span>
            </div>
            {(allPersons ? result.persons : result.persons.slice(0, 5)).map((ph) => (
              <button key={ph.id} className="person-hit" onClick={() => p.onPerson(ph.id)}>
                <span className="person-hit-name">
                  <UserRound size={12} /> <Highlighted text={ph.name} terms={terms} />
                  {ph.tree && <span className="parampara-dot" title={t.parampara} />}
                </span>
                {ph.snippet && <span className="snippet" dangerouslySetInnerHTML={{ __html: ph.snippet }} />}
              </button>
            ))}
            {result.persons.length > 5 && (
              <button className="link-btn" onClick={() => setAllPersons((x) => !x)}>
                {allPersons ? t.personHitsLess : t.personHitsAll(result.persons.length)}
              </button>
            )}
          </div>
        )}
        {hits.map((h, i) => (
          <article
            key={`${p.generation}:${h.sectionId}:${i}`}
            data-i={i}
            data-ctx="hit"
            className={`hit ${i === selected ? "selected" : ""}`}
            style={{ "--h": hueOf(h.collection), animationDelay: `${Math.min(i % 50, 12) * 22}ms` } as React.CSSProperties}
            onClick={() => onSelect(i)}
          >
            <div className="hit-title">
              <Highlighted text={h.title} terms={terms} />
            </div>
            {h.sections > 1 && h.heading && h.heading.toLowerCase() !== h.title.toLowerCase() && (
              <div className="hit-heading">
                § <Highlighted text={h.heading} terms={terms} />
              </div>
            )}
            <div className="hit-meta">
              <CollectionChip name={h.collection} />
              {h.person && h.personId && h.person.toLowerCase() !== h.title.toLowerCase() && (
                <button
                  className="person-chip"
                  title={t.openPerson}
                  onClick={(e) => {
                    e.stopPropagation();
                    p.onPerson(h.personId!);
                  }}
                >
                  <UserRound size={11} /> {h.person}
                  {h.tree && <span className="parampara-dot" title={t.parampara} />}
                </button>
              )}
              {hasQuery && h.hits > 0 && <span className="badge">{t.hitsInSection(h.hits)}</span>}
            </div>
            {h.snippet && <p className="snippet" dangerouslySetInnerHTML={{ __html: h.snippet }} />}
          </article>
        ))}
        {result && hits.length < result.total && (
          <button className="load-more" onClick={p.onLoadMore} disabled={loading}>
            {t.loadMore} · {hits.length.toLocaleString(lang)} / {result.total.toLocaleString(lang)}
          </button>
        )}
      </div>
    </div>
  );
}
