// Laden & Cachen von content/index.json und den Themen-Dateien
let indexPromise = null;
const topicCache = new Map();

export const LENGTHS = [5, 10, 15, 20];
const WORDS_PER_MINUTE_LISTEN = 150;

export function loadIndex() {
  if (!indexPromise) {
    indexPromise = fetch('./content/index.json', { cache: 'no-cache' })
      .then((r) => {
        if (!r.ok) throw new Error('index');
        return r.json();
      })
      .catch((err) => {
        indexPromise = null;
        throw err;
      });
  }
  return indexPromise;
}

export async function loadTopic(id, lang) {
  const key = `${id}.${lang}`;
  if (!topicCache.has(key)) {
    const p = fetch(`./content/topics/${encodeURIComponent(id)}.${lang}.json`).then((r) => {
      if (!r.ok) throw new Error('topic');
      return r.json();
    });
    topicCache.set(key, p);
    p.catch(() => topicCache.delete(key));
  }
  return topicCache.get(key);
}

export function listenMinutes(words, rate = 1) {
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE_LISTEN / rate));
}

export function categoryName(index, categoryId, lang) {
  return index.categories.find((c) => c.id === categoryId)?.name[lang] ?? '';
}
