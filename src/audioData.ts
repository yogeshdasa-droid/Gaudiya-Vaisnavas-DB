// What Whisper adds to each recording of «Audios» (18-11-2026): its written lecture, its own title, the lectures that are
// not its own, the star, «listened»… — one JSON in the database (meta `audio_texts`, key: the file name in lower case).
// Kept here once for the whole window, so that the page and the player (which marks a recording «listened» when it
// ends, even with the page closed) never write over each other.
import { useEffect, useState } from "react";
import { api, AudioTexts } from "./api";

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
