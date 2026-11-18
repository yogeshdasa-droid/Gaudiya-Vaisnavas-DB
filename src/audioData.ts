// What Whisper adds to each recording of «Audios» (18-11-2026): its written lecture, its own title, the lectures that are
// not its own, the star, «listened»… — one JSON in the database (meta `audio_texts`, key: the file name in lower case).
// Kept here once for the whole window, so that the page and the player (which marks a recording «listened» when it
// ends, even with the page closed) never write over each other.
import { useEffect, useState } from "react";
import { api, AudioList, AudioTexts } from "./api";

let data: AudioTexts = {};
let loaded: Promise<void> | null = null;
let saving: Promise<void> = Promise.resolve();
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

function load(): Promise<void> {
  if (!loaded)
    loaded = api.audioTexts().then(
      (d) => {
        data = d;
        emit();
      },
      () => {
        loaded = null;
      },
    );
  return loaded;
}

function save(onError?: (e: unknown) => void) {
  const snapshot = data;
  saving = saving.then(() => api.setAudioTexts(snapshot)).catch((e) => onError?.(e));
}

/** the key of a recording: its file name in lower case */
export const audioKey = (relOrName: string) => (relOrName.split("/").pop() ?? relOrName).toLowerCase();

/** everything at once (a whole new object) */
export function setAudioData(next: AudioTexts, onError?: (e: unknown) => void) {
  data = next;
  emit();
  save(onError);
}

/** changes one recording's entry (an empty entry is removed) */
export async function updateAudio(key: string, f: (e: AudioTexts[string]) => AudioTexts[string], onError?: (e: unknown) => void) {
  await load();
  const e = f({ ...(data[key] ?? {}) });
  const next = { ...data };
  const clean = Object.fromEntries(Object.entries(e).filter(([, v]) => v !== undefined && v !== false && !(Array.isArray(v) && !v.length)));
  if (Object.keys(clean).length) next[key] = clean;
  else delete next[key];
  setAudioData(next, onError);
}

export function useAudioData(): AudioTexts {
  const [d, setD] = useState(data);
  useEffect(() => {
    const f = () => setD(data);
    subs.add(f);
    void load();
    f();
    return () => void subs.delete(f);
  }, []);
  return d;
}

// ------------------------------------------------------------------ own lists (Whisper, 18-11-2026)

let lists: AudioList[] = [];
let listsLoaded: Promise<void> | null = null;
let listsSaving: Promise<void> = Promise.resolve();
const listSubs = new Set<() => void>();

function loadLists(): Promise<void> {
  if (!listsLoaded)
    listsLoaded = api.audioLists().then(
      (d) => {
        lists = Array.isArray(d) ? d : [];
        listSubs.forEach((f) => f());
      },
      () => {
        listsLoaded = null;
      },
    );
  return listsLoaded;
}

/** all the lists at once (a whole new array) */
export async function setAudioLists(next: AudioList[], onError?: (e: unknown) => void) {
  await loadLists();
  lists = next;
  listSubs.forEach((f) => f());
  const snapshot = lists;
  listsSaving = listsSaving.then(() => api.setAudioLists(snapshot)).catch((e) => onError?.(e));
}

/** changes the lists from what they are now */
export async function updateLists(f: (ls: AudioList[]) => AudioList[], onError?: (e: unknown) => void) {
  await loadLists();
  await setAudioLists(f(lists), onError);
}

export function useAudioLists(): AudioList[] {
  const [d, setD] = useState(lists);
  useEffect(() => {
    const f = () => setD(lists);
    listSubs.add(f);
    void loadLists();
    f();
    return () => void listSubs.delete(f);
  }, []);
  return d;
}
