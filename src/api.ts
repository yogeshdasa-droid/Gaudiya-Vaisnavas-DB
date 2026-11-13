import { invoke } from "@tauri-apps/api/core";
import type { Term } from "./fold";

export type Sort = "relevance" | "title" | "person";

export interface SearchParams {
  query: string;
  titlesOnly: boolean;
  prefix: boolean;
  sort: Sort;
  collections: string[];
  dir: string | null;
  docId: number | null;
  personId: number | null;
  paramparaOnly?: boolean;
  kinds?: string[];
  offset: number;
  limit: number;
}

export interface Hit {
  sectionId: number;
  docId: number;
  ordinal: number;
  sections: number;
  heading: string | null;
  title: string;
  collection: string;
  dir: string;
  personId: number | null;
  person: string | null;
  /** its record is in the Guru Paramparā */
  tree: boolean;
  snippet: string;
  hits: number;
}

export interface SearchResult {
  total: number;
  hits: Hit[];
  /** records that say it in their notes, dates, works… (first page only) */
  persons: { id: number; name: string; snippet: string; tree: boolean }[];
  facets: { name: string; count: number }[];
  terms: Term[];
  millis: number;
  error: string | null;
}

export interface Status {
  docs: number;
  sections: number;
  persons: number;
  trash: number;
  filesMb: number;
  busy: boolean;
  dbPath: string;
  dbSize: number;
}

export interface DocListItem {
  id: number;
  dir: string;
  title: string;
  personId: number | null;
}

export interface DocInfo {
  id: number;
  dir: string;
  collection: string;
  title: string;
  date: string | null;
  tags: string[];
  size: number;
  sections: number;
  kind: string;
  source: string;
  personId: number | null;
  person: string | null;
  /** file name of the original PDF / Word kept in the database */
  original: string | null;
  hasCover: boolean;
  created: string;
  modified: string;
}

export interface TocEntry {
  ordinal: number;
  heading: string | null;
}

export interface SectionText {
  id: number;
  ordinal: number;
  heading: string | null;
  text: string;
}

export interface PersonFields {
  name: string;
  aka: string;
  appearance: string;
  disappearance: string;
  place: string;
  guru: string;
  disciples: string;
  works: string;
  notes: string;
  /** labels, comma separated */
  tags: string;
}

/** The collection of a record's main text: all its versions written as one
 *  (the record shows it, and the others under «Otras versiones»). */
export const MAIN_TEXT = "Texto principal";

export const EMPTY_PERSON: PersonFields = {
  name: "",
  aka: "",
  appearance: "",
  disappearance: "",
  place: "",
  guru: "",
  disciples: "",
  works: "",
  notes: "",
  tags: "",
};

/** relation with the guru above in the Guru Paramparā */
export type TreeKind = "diksa" | "siksa" | "disciple" | "vani" | "sannyasa" | "vesa" | "associate";
/** All of them, in the order offered in the lists. */
/** «disciple»: the source says disciple without saying whether dīkṣā or śikṣā. */
export const TREE_KINDS: TreeKind[] = ["diksa", "siksa", "disciple", "vani", "sannyasa", "vesa", "associate"];
/** The line view a relation belongs to: śikṣā por vāṇī goes in the śikṣā
 *  line; sannyāsa, veśa and associates in neither (only in the whole tree). */
export const lineOfKind = (k: TreeKind): "diksa" | "siksa" | null => (k === "diksa" ? "diksa" : k === "siksa" || k === "vani" ? "siksa" : null);
/** Colours given to records with a double click in the tree. */
export type MarkColor = "yellow" | "green" | "blue";
export type Marks = Record<number, MarkColor>;
/** A double click goes yellow → green → blue → none. */
export const nextMark = (m: MarkColor | undefined): MarkColor | undefined =>
  m === undefined ? "yellow" : m === "yellow" ? "green" : m === "green" ? "blue" : undefined;

/** A record that writing the Guru Paramparā in the records changes, with the names it adds. */
export interface SyncChange {
  id: number;
  name: string;
  gurus: string[];
  disciples: string[];
}

/** Something that does not fit in a record (see check.rs); the text comes from `t.checkItem[kind]`. */
export type IssueKind =
  | "treeGuru"
  | "missingGuru"
  | "missingDisciple"
  | "notBackGuru"
  | "notBackDisciple"
  | "selfGuru"
  | "unknownGuru"
  | "noOverlap"
  | "diedBefore"
  | "tooLong"
  | "sameDates"
  | "oddName"
  | "oddGuru";
export interface Issue {
  kind: IssueKind;
  id: number;
  name: string;
  inTree: boolean;
  a: string;
  b: string;
  other: number | null;
}

export interface PersonListItem {
  id: number;
  name: string;
  aka: string;
  docs: number;
  coverDoc: number | null;
  hasPhoto: boolean;
  /** place in the Guru Paramparā; null = "Other Vaiṣṇavas".
   *  group: the box it is drawn in («Pañca-tattva»); note / disputed: on the line to its guru. */
  tree: { parent: number | null; pos: number; kind: TreeKind; group: string; note: string; disputed: boolean } | null;
  /** labels, comma separated */
  tags: string;
  /** more gurus besides its place in the tree (its śikṣā gurus) */
  links: TreeLinkItem[];
  /** its relatives drawn in the tree: relative = the elder (father, uncle…), note = how («son») */
  family: { relative: number; note: string; disputed: boolean }[];
}
export interface TreeLinkItem {
  guru: number;
  kind: TreeKind;
  note: string;
  disputed: boolean;
}
/** As the backend sends a record of the list: the family lines among the links. */
type RawPersonListItem = Omit<PersonListItem, "links" | "family"> & { links: (Omit<TreeLinkItem, "kind"> & { kind: TreeKind | "family" })[] };

/** The label of the "Namesakes" group: records with the same name as others
 *  who are other people (from other times). Never marked as repeated. */
export const NAMESAKES = "Homónimos";

export function isNamesake(p: PersonListItem): boolean {
  return p.tags.split(",").some((x) => x.trim().toLowerCase() === NAMESAKES.toLowerCase());
}

/** The label of the favourite records (13-11-2026, Whisper: «fichas favoritas… que salgan en la pantalla principal»):
 *  the star by a record's name; the home page shows them under «Of the day». */
export const FAVORITES = "Favoritas";

export function isFavorite(p: PersonListItem): boolean {
  return p.tags.split(",").some((x) => x.trim().toLowerCase() === FAVORITES.toLowerCase());
}

/** The label of the "Poets" group:Vaiṣṇava poets (padakartās) with no clear guru.
 *  Outside the tree they are shown in their own group, not in the Vaiṣṇava-maṇḍala. */
export const POETS = "Poetas";

export function isPoet(p: PersonListItem): boolean {
  return p.tags.split(",").some((x) => x.trim().toLowerCase() === POETS.toLowerCase());
}

/** The label of the "Deities" panel (Whisper, 11-11-2026): records that are a Deity (Śrī Rasikarāya…), not a
 *  person. They have their own panel in the sidebar, between Tīrthas and Library, and are not in the
 *  Vaiṣṇava-maṇḍala. */
export const DEITIES = "Deidades";

/** label of a text that always opens on its original PDF (its text is only for searching) */
export const ALWAYS_ORIGINAL = "original";

export function isDeity(p: PersonListItem): boolean {
  return p.tags.split(",").some((x) => x.trim().toLowerCase() === DEITIES.toLowerCase());
}

/** How a record is tied to a holy place (format 7). */
export const PLACE_ROLES = ["sripata", "samadhi", "birth", "lived", "other"] as const;
export type PlaceRole = (typeof PLACE_ROLES)[number];

export interface PlaceFields {
  name: string;
  /** other spellings, comma separated: found in the records' "Place" */
  aka: string;
  /** district, state */
  region: string;
  /** where exactly ("2 miles from Kāṭwā station") */
  location: string;
  /** what there is there (Markdown) */
  about: string;
  source: string;
  lat: number | null;
  lon: number | null;
  people: { personId: number; role: PlaceRole }[];
  /** texts written for the place (format 10); left out = keep them as they are */
  texts?: PlaceText[] | null;
}

/** A text written for a place (Markdown). */
export interface PlaceText {
  title: string;
  body: string;
}

/** A gallery picture of a place; `name` is its caption (at first, the file name). */
export interface PlaceImage {
  id: number;
  name: string;
}

/** What to show under a gallery picture: the name without «.jpg», nothing for
 *  camera names («IMG_1234») or the old main picture («anterior»). */
export function imageCaption(name: string): string {
  const s = name.replace(/\.(jpe?g|png|webp|gif|bmp|avif)$/i, "").trim();
  if (!s || s === "anterior" || /^(img|dsc|dscn|pxl|photo|image|screenshot|wa)[\s_-]*\d/i.test(s) || /^\d+$/.test(s)) return "";
  return s;
}

export interface Place extends PlaceFields {
  id: number;
  modified: string;
  /** a picture chosen for it (served at /placephoto/<id>) */
  hasPhoto: boolean;
  /** more pictures (served at /placeimage/<image id>), with their caption */
  images: PlaceImage[];
}

export const EMPTY_PLACE: PlaceFields = { name: "", aka: "", region: "", location: "", about: "", source: "", lat: null, lon: null, people: [] };

/** Where a record goes in the Guru Paramparā (null = take it out). */
export type TreePlace = { parent: number | null; before: number | null } | null;

export interface PersonDoc {
  id: number;
  title: string;
  collection: string;
  kind: string;
  size: number;
  hasCover: boolean;
}

export interface Person extends PersonFields {
  id: number;
  created: string;
  modified: string;
  hasPhoto: boolean;
  /** gallery pictures (served at /image/<id>) */
  images: number[];
  /** lunar days read from the appearance / disappearance fields */
  appearanceDay: string | null;
  disappearanceDay: string | null;
  docs: PersonDoc[];
}

export interface CalDay {
  /** YYYY-MM-DD */
  date: string;
  labels: string[];
  events: CalEvent[];
}

export interface CalEvent {
  personId: number | null;
  /** the record's name, or the event as the calendar says it */
  name: string;
  kind: "appearance" | "disappearance" | "ekadasi" | "parana" | "festival";
  hasPhoto: boolean;
  /** the calendar's note ("Fast till noon…") */
  note: string;
  /** worked out by the program (not in the imported calendar) */
  computed: boolean;
}

/** What a record has, for the Panorama. */
export interface OverviewPerson {
  id: number;
  name: string;
  tree: boolean;
  born: number | null;
  died: number | null;
  /** [month 0–12, tithi 1–30] */
  appearanceDay: [number, number] | null;
  disappearanceDay: [number, number] | null;
  hasAppearance: boolean;
  hasDisappearance: boolean;
  hasGuru: boolean;
  hasDisciples: boolean;
  hasPlace: boolean;
  hasWorks: boolean;
  hasNotes: boolean;
  hasPhoto: boolean;
  docs: number;
  place: string;
  works: string;
}

export interface LifeSpan {
  id: number;
  name: string;
  born: number | null;
  died: number | null;
  parampara: boolean;
  hasPhoto: boolean;
}

/** a dated event of a chronology of the library (Digdarśanī) */
export interface ChronicleEntry {
  year: number;
  saka: number | null;
  lunar: string;
  text: string;
  kind: "birth" | "death" | "other";
  personId: number | null;
  person: string | null;
  docId: number;
  ordinal: number;
}

export interface CalendarInfo {
  count: number;
  from: string | null;
  to: string | null;
  /** people named in the calendar that no record matches */
  unmatched: string[];
}

export interface DocMeta {
  title: string;
  date: string;
  collection: string;
  personId: number | null;
}

export type LinkTarget = { kind: "doc"; id: number } | { kind: "person"; id: number } | { kind: "none" };

export interface Bookmark {
  id: number;
  docId: number | null;
  ordinal: number;
  title: string;
  heading: string | null;
  note: string;
  created: string;
}

export interface Trashed {
  id: number;
  title: string;
  collection: string;
  person: string | null;
  deleted: string;
}

export interface ImportSource {
  path: string;
  collection: string;
}

export interface DefaultSource extends ImportSource {
  exists: boolean;
}

export interface ImportOptions {
  sources: ImportSource[];
  personPerFile: boolean;
  /** only the text, as a Markdown note (no original file, no cover) */
  textOnly?: boolean;
  personId: number | null;
}

export interface ImportProgress {
  phase: "scan" | "import" | "fts" | "export" | "backup" | "replace" | "slim" | "join" | "done";
  done: number;
  total: number;
}

export interface ImportSummary {
  added: number;
  duplicates: number;
  persons: number;
  failed: string[];
  millis: number;
}

export interface BackupSettings {
  /** 0 = never */
  days: number;
  keep: number;
  /** seconds since 1970 of the last automatic copy (0 = none) */
  last: number;
}

export interface BackupCopy {
  path: string;
  name: string;
  size: number;
  /** seconds since 1970 */
  modified: number;
  auto: boolean;
}

/** An earlier state of a text or a record. */
export interface Version {
  id: number;
  label: string;
  saved: string;
  /** doc: JSON list of {heading, text}; person: JSON of PersonFields */
  data: string;
}

export interface ReviewDoc {
  id: number;
  title: string;
  collection: string;
  kind: string;
  size: number;
  person: string | null;
  hasOriginal: boolean;
}

export const api = {
  status: () => invoke<Status>("get_status"),
  importSources: (options: ImportOptions) => invoke<void>("import_sources", { options }),
  rebuildSearch: () => invoke<void>("rebuild_search"),
  defaultSources: () => invoke<DefaultSource[]>("default_sources"),
  pathKinds: (paths: string[]) => invoke<("dir" | "text" | "other")[]>("path_kinds", { paths }),

  search: (params: SearchParams) => invoke<SearchResult>("search", { params }),
  listDocs: () => invoke<DocListItem[]>("list_docs"),
  getDoc: (id: number) => invoke<{ doc: DocInfo; toc: TocEntry[] }>("get_doc", { id }),
  getSections: (docId: number, from: number, to: number) => invoke<SectionText[]>("get_sections", { docId, from, to }),
  resolveLink: (target: string) => invoke<LinkTarget>("resolve_link", { target }),

  listPersons: () =>
    invoke<RawPersonListItem[]>("list_persons").then((ps) =>
      ps.map((p) => ({
        ...p,
        links: p.links.filter((l): l is TreeLinkItem => l.kind !== "family"),
        family: p.links.filter((l) => l.kind === "family").map((l) => ({ relative: l.guru, note: l.note, disputed: l.disputed })),
      })),
    ),
  getPerson: (id: number) => invoke<Person>("get_person", { id }),
  searchPersons: (query: string) => invoke<number[]>("search_persons", { query }),
  newPerson: (fields: PersonFields) => invoke<number>("new_person", { fields }),
  updatePerson: (id: number, fields: PersonFields) => invoke<void>("update_person", { id, fields }),
  deletePerson: (id: number) => invoke<void>("delete_person", { id }),
  mergePersons: (into: number, from: number[]) => invoke<void>("merge_persons", { into, from }),
  movePerson: (id: number, place: TreePlace) => invoke<void>("move_person", { id, place }),
  setTreeKind: (id: number, kind: TreeKind) => invoke<void>("set_tree_kind", { id, kind }),
  /** writes guru and disciple in both records; returns how many changed */
  setLinks: (id: number, links: [number, TreeKind][]) => invoke<void>("set_links", { id, links }),
  /** the drawn tree as an SVG file */
  saveTreeSvg: (path: string, svg: string) => invoke<void>("save_tree_svg", { path, svg }),
  /** the group records are drawn in, in the tree ("" = none) */
  setTreeGroup: (ids: number[], group: string) => invoke<number>("set_tree_group", { ids, group }),
  /** a word on a line and «disputed»: to its guru in the tree (guru null) or to another guru / relative */
  setLineInfo: (id: number, guru: number | null, note: string, disputed: boolean) => invoke<number>("set_line_info", { id, guru, note, disputed }),
  /** its relatives drawn in the tree: [relative, «son»…] (replaces the list) */
  setFamily: (id: number, relatives: [number, string][]) => invoke<void>("set_family", { id, relatives }),
  treeMarks: () => invoke<string>("tree_marks").then((s) => JSON.parse(s) as Marks),
  setTreeMarks: (marks: Marks) => invoke<void>("set_tree_marks", { marks: JSON.stringify(marks) }),
  relate: (disciple: number, guru: number, kind: TreeKind, oldGuru: number | null) => invoke<number>("relate", { disciple, guru, kind, oldGuru }),
  unrelate: (disciple: number, guru: number) => invoke<number>("unrelate", { disciple, guru }),
  syncTree: (write: boolean) => invoke<SyncChange[]>("sync_tree", { write }),
  /** what record `id` says about `other`, written in `other` too */
  completeBack: (id: number, other: number) => invoke<SyncChange[]>("complete_back", { id, other }),
  checkData: () => invoke<Issue[]>("check_data"),
  setPersonPhoto: (id: number, path: string) => invoke<void>("set_person_photo", { id, path }),
  removePersonPhoto: (id: number) => invoke<void>("remove_person_photo", { id }),

  createDoc: (personId: number | null, title: string, collection: string) =>
    invoke<number>("create_doc", { personId, title, collection }),
  saveSection: (docId: number, ordinal: number, text: string) => invoke<void>("save_section", { docId, ordinal, text }),
  moveText: (docId: number, fragment: string, toPerson: number, title: string) => invoke<number>("move_text", { docId, fragment, toPerson, title }),
  /** takes the piece out of its text (whole lines; earlier version kept) and gives it back as written */
  cutText: (docId: number, fragment: string) => invoke<string>("cut_text", { docId, fragment }),
  updateDoc: (docId: number, meta: DocMeta) => invoke<void>("update_doc", { docId, meta }),
  setDocTag: (docId: number, tag: string, on: boolean) => invoke<void>("set_doc_tag", { docId, tag, on }),
  /** a web page in the window's browser view (web.rs), at that place (CSS pixels) */
  webOpen: (url: string, r: { x: number; y: number; w: number; h: number }) => invoke<void>("web_open", { url, ...r }),
  webBounds: (r: { x: number; y: number; w: number; h: number }) => invoke<void>("web_bounds", r),
  webHide: () => invoke<void>("web_hide"),
  webShow: () => invoke<void>("web_show"),
  webGo: (dir: "back" | "fwd" | "reload") => invoke<void>("web_go", { dir }),
  webCurrent: () => invoke<string | null>("web_current"),
  renameFolder: (dir: string, name: string) => invoke<void>("rename_folder", { dir, name }),
  trashFolder: (dir: string) => invoke<number>("trash_folder", { dir }),
  trashDoc: (docId: number) => invoke<void>("trash_doc", { docId }),
  restoreDoc: (docId: number) => invoke<void>("restore_doc", { docId }),
  listTrash: () => invoke<Trashed[]>("list_trash"),
  purgeDocs: (ids: number[]) => invoke<void>("purge_docs", { ids }),

  listBookmarks: () => invoke<Bookmark[]>("list_bookmarks"),
  addBookmark: (docId: number, ordinal: number, note: string) => invoke<number>("add_bookmark", { docId, ordinal, note }),
  updateBookmark: (id: number, note: string) => invoke<void>("update_bookmark", { id, note }),
  deleteBookmark: (id: number) => invoke<void>("delete_bookmark", { id }),

  saveOriginal: (docId: number, path: string) => invoke<void>("save_original", { docId, path }),
  openOriginal: (docId: number) => invoke<void>("open_original", { docId }),
  exportDoc: (docId: number, path: string) => invoke<void>("export_doc", { docId, path }),
  backup: (path: string) => invoke<void>("backup", { path }),
  backupSettings: () => invoke<BackupSettings>("backup_settings"),
  setBackupSettings: (days: number, keep: number) => invoke<void>("set_backup_settings", { days, keep }),
  listCopies: () => invoke<{ dir: string; copies: BackupCopy[] }>("list_copies"),
  backupNow: () => invoke<string>("backup_now"),
  deleteCopy: (path: string) => invoke<void>("delete_copy", { path }),
  /** returns the copy kept of what there was before */
  restoreCopy: (path: string) => invoke<string>("restore_copy", { path }),
  listVersions: (kind: "doc" | "person" | "place", target: number) => invoke<Version[]>("list_versions", { kind, target }),
  restoreVersion: (id: number) => invoke<void>("restore_version", { id }),
  versionsSize: () => invoke<[number, number]>("versions_size"),
  clearVersions: () => invoke<void>("clear_versions"),
  fillGather: () => invoke<number>("fill_gather"),
  fillList: () => invoke<Proposal[]>("fill_list"),
  fillAccept: (ids: number[]) => invoke<number>("fill_accept", { ids }),
  fillReject: (ids: number[]) => invoke<void>("fill_reject", { ids }),
  aiStatus: () => invoke<AiStatus>("ai_status"),
  aiStart: (limit: number | null) => invoke<void>("ai_start", { limit }),
  aiStop: () => invoke<void>("ai_stop"),
  aiPull: () => invoke<void>("ai_pull"),
  aiSetModel: (name: string) => invoke<void>("ai_set_model", { name }),
  upcoming: (date: Date, count: number) =>
    invoke<CalDay[]>("upcoming", { y: date.getFullYear(), m: date.getMonth() + 1, d: date.getDate(), count }),
  lunarLabel: (text: string) => invoke<string | null>("lunar_label", { text }),
  importCalendar: (path: string) => invoke<number>("import_calendar", { path }),
  calendarInfo: () => invoke<CalendarInfo>("calendar_info"),
  clearCalendar: () => invoke<void>("clear_calendar"),
  timeline: () => invoke<LifeSpan[]>("timeline"),
  overview: () => invoke<OverviewPerson[]>("overview"),
  chronicle: () => invoke<ChronicleEntry[]>("chronicle"),
  exportMarkdown: (dir: string) => invoke<void>("export_markdown", { dir }),
  exportPerson: (id: number, path: string) => invoke<void>("export_person", { id, path }),
  addPersonImages: (id: number, paths: string[]) => invoke<number>("add_person_images", { id, paths }),
  removePersonImage: (imageId: number) => invoke<void>("remove_person_image", { imageId }),
  imageAsPhoto: (imageId: number) => invoke<void>("image_as_photo", { imageId }),
  reviewDocs: () => invoke<{ empty: ReviewDoc[]; oddTitles: ReviewDoc[] }>("review_docs"),
  markDistinct: (ids: number[]) => invoke<void>("mark_distinct", { ids }),
  listDistinct: () => invoke<[number, number][]>("list_distinct"),
  listPlaces: () => invoke<Place[]>("list_places"),
  savePlace: (id: number | null, fields: PlaceFields) => invoke<number>("save_place", { id, fields }),
  deletePlace: (id: number) => invoke<void>("delete_place", { id }),
  setPlacePhoto: (id: number, path: string) => invoke<void>("set_place_photo", { id, path }),
  removePlacePhoto: (id: number) => invoke<void>("remove_place_photo", { id }),
  addPlaceImages: (id: number, paths: string[]) => invoke<number>("add_place_images", { id, paths }),
  removePlaceImage: (imageId: number) => invoke<void>("remove_place_image", { imageId }),
  placeImageAsPhoto: (imageId: number) => invoke<void>("place_image_as_photo", { imageId }),
  renamePlaceImage: (imageId: number, name: string) => invoke<void>("rename_place_image", { imageId, name }),
  getLibrary: (id: number) => invoke<LibraryView>("get_library", { id }),
  setLibraryFolder: (id: number, folder: string | null) => invoke<void>("set_library_folder", { id, folder }),
  libraryIds: () => invoke<number[]>("library_ids"),
  libraryIndex: (id: number) => invoke<{ files: number; changed: number }>("library_index", { id }),
  librarySearch: (id: number, query: string) => invoke<LibHit[]>("library_search", { id, query }),
  libraryOpen: (id: number, rel: string) => invoke<void>("library_open", { id, rel }),
  unmarkDistinct: (a: number, b: number) => invoke<void>("unmark_distinct", { a, b }),
  /** merges into a record that can be undone (newest first): the names that went away */
  listMerges: (person: number) => invoke<{ id: number; saved: string; names: string[] }[]>("list_merges", { person }),
  undoMerge: (id: number) => invoke<void>("undo_merge", { id }),
  setTag: (ids: number[], tag: string, on: boolean) => invoke<void>("set_tag", { ids, tag, on }),
  openExternal: (target: string) => invoke<void>("open_external", { target }),
  replacePreview: (spec: ReplaceSpec) => invoke<ReplacePreview>("replace_preview", { spec }),
  replaceApply: (spec: ReplaceSpec) => invoke<void>("replace_apply", { spec }),
  slimLibrary: (what: Slim) => invoke<void>("slim_library", { what }),
  /** one text per record: all records (null) or one */
  joinTexts: (personId: number | null) => invoke<void>("join_texts", { personId }),
  diacriticSuggestions: () => invoke<DiacriticSuggestion[]>("diacritic_suggestions"),
  semanticStatus: () => invoke<SemanticStatus>("semantic_status"),
  semanticIndex: () => invoke<void>("semantic_index"),
  semanticStop: () => invoke<void>("semantic_stop"),
  semanticPull: () => invoke<void>("semantic_pull"),
  semanticSearch: (params: SearchParams) => invoke<SearchResult>("semantic_search", { params }),
};

// ---- find and replace / diacritics

export interface ReplaceScope {
  texts: boolean;
  titles: boolean;
  persons: boolean;
}

export interface ReplaceSpec {
  find: string;
  replace: string;
  regex: boolean;
  caseSensitive: boolean;
  wholeWord: boolean;
  /** whole words instead of find/replace: [plain, with diacritics] */
  words: [string, string][];
  scope: ReplaceScope;
}

export interface ReplaceSample {
  docId: number | null;
  personId: number | null;
  ordinal: number;
  label: string;
  before: string;
  old: string;
  new: string;
  after: string;
}

export interface ReplacePreview {
  total: number;
  texts: number;
  titles: number;
  persons: number;
  samples: ReplaceSample[];
}

export interface Replaced {
  total: number;
  texts: number;
  titles: number;
  persons: number;
  backup: string;
}

export interface DiacriticSuggestion {
  word: string;
  proposed: string;
  count: number;
  texts: number;
  source: "dict" | "library";
  others: string[];
  doubtful: boolean;
  example: string;
}

// ---- take less space

export interface Slim {
  covers: boolean;
  pdfText: boolean;
  originals: boolean;
}

export interface Slimmed {
  covers: number;
  converted: number;
  originals: number;
  before: number;
  after: number;
  backup: string;
}

export interface Proposal {
  id: number;
  personId: number;
  person: string;
  field: string;
  value: string;
  source: string;
  evidence: string;
  toTree: boolean;
}

export interface VersionsCleared {
  count: number;
  before: number;
  after: number;
  backup: string;
}

export interface Joined {
  persons: number;
  docs: number;
  repeated: number;
  backup: string;
}

// ---- search by meaning

export interface SemanticStatus {
  ollama: boolean;
  model: boolean;
  pieces: number;
  indexed: string;
  busy: boolean;
  done: number;
  total: number;
}

export interface SemanticDone {
  added: number;
  pieces: number;
  millis: number;
  stopped: boolean;
}

/** filling in records with the local AI */
export interface AiStatus {
  ollama: boolean;
  model: boolean;
  modelName: string;
  /** downloaded language models */
  installed: string[];
  /** suggested models: [name, size] */
  suggested: [string, string][];
  busy: boolean;
  done: number;
  total: number;
  current: string;
  /** records already read */
  read: number;
}

export interface AiDone {
  records: number;
  proposals: number;
  failed: number;
  stopped: boolean;
}

export interface PullProgress {
  status: string;
  completed: number;
  total: number;
}

/** URL of a file stored in the database (cover image, original PDF, or a record's picture by person id). */
/** A file of a record's library (a folder on the PC linked to it). */
export interface LibEntry {
  /** path inside the folder, with «/» */
  rel: string;
  name: string;
  /** its sub-folder («» = the folder itself) */
  dir: string;
  kind: "book" | "page" | "audio" | "video" | "image" | "subtitle" | "other";
  size: number;
  /** a video's subtitles */
  subs: string | null;
  /** a book's cover («cover.jpg» of its own folder, as Calibre keeps them) */
  cover: string | null;
  /** a book's title from its Calibre folder or «metadata.opf» */
  title: string | null;
}
export interface LibraryView {
  folder: string | null;
  entries: LibEntry[];
  indexed: number;
  missing: boolean;
}
export interface LibHit {
  rel: string;
  /** page of a book, piece of a written lecture, second of a video's subtitles */
  at: number;
  snippet: string;
}
/** The address the window reads a library file at (with byte ranges: a video can jump). */
export function libUrl(id: number, rel: string): string {
  const path = rel.split("/").map(encodeURIComponent).join("/");
  return navigator.userAgent.includes("Windows") ? `http://bio.localhost/lib/${id}/${path}` : `bio://localhost/lib/${id}/${path}`;
}

export function fileUrl(role: "cover" | "original" | "photo" | "image" | "placephoto" | "placeimage", docId: number): string {
  return navigator.userAgent.includes("Windows") ? `http://bio.localhost/${role}/${docId}` : `bio://localhost/${role}/${docId}`;
}

/** The disciples of each guru in the order shown in the trees: first those
 *  without disciples, then those whose line goes on; each group in the order
 *  given by dragging. `kids` has an entry only for records with disciples. */
export function sortDisciples(kids: Map<number | null, PersonListItem[]>) {
  for (const list of kids.values()) list.sort((a, b) => Number(kids.has(a.id)) - Number(kids.has(b.id)) || a.tree!.pos - b.tree!.pos);
}

/** Stable pastel hue per collection name. */
export function hueOf(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return (h * 137) % 360;
}
