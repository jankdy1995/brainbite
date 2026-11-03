// Lokaler Zustand in localStorage. Alle Zugriffe sind abgesichert (privater Modus, voller Speicher).
const KEY = 'brainbite:v1';
const SCHEMA = 1;

function defaults() {
  const lang = (navigator.language || 'de').toLowerCase().startsWith('de') ? 'de' : 'en';
  return {
    schemaVersion: SCHEMA,
    onboarded: false,
    lang,
    theme: 'auto',
    categories: [
      { id: 'science', rank: 1, enabled: true },
      { id: 'tech-economy', rank: 2, enabled: true }
    ],
    preferredLength: 10,
    fontSize: 'M',
    tts: { rate: 1.0, voiceURI: { de: null, en: null } },
    favorites: [],
    progress: {},
    history: []
  };
}

let state = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    return migrate({ ...defaults(), ...JSON.parse(raw) });
  } catch {
    return defaults();
  }
}

function migrate(s) {
  // Platz für spätere Migrationen anhand von s.schemaVersion
  s.schemaVersion = SCHEMA;
  s.categories = (s.categories || []).map((c) => ({ enabled: true, ...c }));
  s.tts = { ...defaults().tts, ...(s.tts || {}) };
  s.history = Array.isArray(s.history) ? s.history : [];
  return s;
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Speichern nicht möglich: App läuft trotzdem weiter
  }
}

export function getState() {
  return state;
}

export function update(fn) {
  fn(state);
  save();
  listeners.forEach((l) => l(state));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function reset() {
  try { localStorage.removeItem(KEY); } catch {}
  state = defaults();
  listeners.forEach((l) => l(state));
}

export function isFavorite(id) {
  return state.favorites.includes(id);
}

export function toggleFavorite(id) {
  update((s) => {
    s.favorites = s.favorites.includes(id) ? s.favorites.filter((f) => f !== id) : [id, ...s.favorites];
  });
  return isFavorite(id);
}

export function getProgress(id, len) {
  return state.progress[id]?.[len] || null;
}

// Fortschritt speichern; bei „done“ einmalig einen Eintrag in den Verlauf schreiben
export function setProgress(id, len, patch, minutes) {
  update((s) => {
    const byTopic = (s.progress[id] = s.progress[id] || {});
    const prev = byTopic[len] || { status: 'started', scroll: 0 };
    const next = { ...prev, ...patch, updatedAt: new Date().toISOString() };
    if (prev.status === 'done') next.status = 'done';
    byTopic[len] = next;
    if (patch.status === 'done' && prev.status !== 'done') {
      s.history.unshift({ id, len: Number(len), at: next.updatedAt, minutes, mode: patch.mode || 'read' });
      s.history = s.history.slice(0, 500);
    }
  });
}

export function topicStatus(id) {
  const p = state.progress[id];
  if (!p) return null;
  const values = Object.values(p);
  if (values.some((v) => v.status === 'done')) return 'done';
  return 'started';
}
