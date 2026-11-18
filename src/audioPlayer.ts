// The player of «Audios» (Whisper, 18-11-2026): one sound for the whole window, so that a lecture goes on while moving
// around the app; the page and the bar at the bottom show the same controls. It remembers where each recording was left.
import { useEffect, useState } from "react";

export interface Track {
  /** path inside the Audios folder */
  rel: string;
  url: string;
  title: string;
  /** date · place, under the title */
  sub: string;
}

interface State {
  list: Track[];
  index: number;
  playing: boolean;
  time: number;
  duration: number;
  rate: number;
  error: boolean;
}

const POS_KEY = "bio.audioPos";
const RATE_KEY = "bio.audioRate";
function readPos(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(POS_KEY) || "{}");
  } catch {
    return {};
  }
}
function savePos(rel: string, t: number, d: number) {
  try {
    const p = readPos();
    // near the end: listened, start again next time
    if (t < 15 || (d && t > d - 20)) delete p[rel];
    else p[rel] = Math.round(t);
    localStorage.setItem(POS_KEY, JSON.stringify(p));
  } catch {
    /* no storage: nothing remembered */
  }
}
/** where a recording was left (seconds), if anywhere */
export function savedPosition(rel: string): number {
  return readPos()[rel] ?? 0;
}
function readRate(): number {
  try {
    return +(localStorage.getItem(RATE_KEY) || 1) || 1;
  } catch {
    return 1;
  }
}

let el: HTMLAudioElement | null = null;
let st: State = { list: [], index: 0, playing: false, time: 0, duration: 0, rate: readRate(), error: false };
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());
const set = (p: Partial<State>) => {
  st = { ...st, ...p };
  emit();
};
let lastSaved = 0;

function audio(): HTMLAudioElement {
  if (el) return el;
  el = new Audio();
  el.preload = "metadata";
  el.addEventListener("play", () => set({ playing: true }));
  el.addEventListener("pause", () => set({ playing: false }));
  el.addEventListener("loadedmetadata", () => set({ duration: el!.duration || 0 }));
  el.addEventListener("error", () => set({ error: true, playing: false }));
  el.addEventListener("timeupdate", () => {
    set({ time: el!.currentTime });
    const tr = st.list[st.index];
    if (tr && Math.abs(el!.currentTime - lastSaved) > 5) {
      lastSaved = el!.currentTime;
      savePos(tr.rel, el!.currentTime, el!.duration);
    }
  });
  el.addEventListener("ended", () => {
    const tr = st.list[st.index];
    if (tr) savePos(tr.rel, 0, 0);
    if (st.index + 1 < st.list.length) load(st.index + 1, true);
    else set({ playing: false });
  });
  return el;
}

function load(index: number, play: boolean) {
  const a = audio();
  const tr = st.list[index];
  if (!tr) return;
  set({ index, time: 0, duration: 0, error: false });
  a.src = tr.url;
  a.playbackRate = st.rate;
  const from = savedPosition(tr.rel);
  lastSaved = from;
  if (from) a.addEventListener("loadedmetadata", () => (a.currentTime = from), { once: true });
  if (play) void a.play().catch(() => set({ playing: false }));
}

/** Other players of the window (a record's library) stop this one, and this one them. */
let onStart: (() => void) | null = null;
export function setOnStart(f: (() => void) | null) {
  onStart = f;
}

export const player = {
  /** plays `list` from `index` (the same recording again: goes on / pauses) */
  play(list: Track[], index: number) {
    const cur = st.list[st.index];
    if (cur && cur.rel === list[index]?.rel && el?.src) {
      st = { ...st, list };
      if (el.paused) void el.play().catch(() => {});
      else el.pause();
      emit();
      return;
    }
    onStart?.();
    st = { ...st, list };
    load(index, true);
  },
  toggle() {
    if (!el?.src) return;
    if (el.paused) {
      onStart?.();
      void el.play().catch(() => {});
    } else el.pause();
  },
  seek(t: number) {
    if (el) el.currentTime = Math.max(0, Math.min(t, el.duration || t));
  },
  skip(d: number) {
    if (el) this.seek(el.currentTime + d);
  },
  next() {
    if (st.index + 1 < st.list.length) load(st.index + 1, true);
  },
  prev() {
    if (el && el.currentTime > 5) this.seek(0);
    else if (st.index > 0) load(st.index - 1, true);
  },
  rate(r: number) {
    set({ rate: r });
    if (el) el.playbackRate = r;
    try {
      localStorage.setItem(RATE_KEY, String(r));
    } catch {
      /* not remembered */
    }
  },
  pause() {
    el?.pause();
  },
  close() {
    const tr = st.list[st.index];
    if (el) {
      if (tr) savePos(tr.rel, el.currentTime, el.duration);
      el.pause();
      el.removeAttribute("src");
      el.load();
    }
    set({ list: [], index: 0, playing: false, time: 0, duration: 0, error: false });
  },
};

export function usePlayer() {
  const [s, setS] = useState(st);
  useEffect(() => {
    const f = () => setS(st);
    subs.add(f);
    f();
    return () => void subs.delete(f);
  }, []);
  return { ...s, track: s.list[s.index] as Track | undefined };
}

export function clock(s: number): string {
  if (!isFinite(s) || s < 0) s = 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return (h ? `${h}:${String(m).padStart(2, "0")}` : `${m}`) + `:${String(sec).padStart(2, "0")}`;
}
