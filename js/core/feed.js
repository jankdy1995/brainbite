// Gewichteter Feed per Smooth Weighted Round Robin (deterministisch, gleichmäßig verteilt)
import { topicStatus } from './store.js';

const STATUS_ORDER = { null: 0, started: 1, done: 2 };

export function buildFeed(index, categories) {
  const active = categories.filter((c) => c.enabled !== false).sort((a, b) => a.rank - b.rank);
  const n = active.length;
  if (!n) return [];

  // Pro Kategorie eine Warteschlange: ungelesen (neueste zuerst), begonnen, gelesen
  const queues = active.map((c, i) => ({
    weight: n - i,
    current: 0,
    items: index.topics
      .filter((t) => t.category === c.id)
      .sort((a, b) => {
        const s = STATUS_ORDER[topicStatus(a.id)] - STATUS_ORDER[topicStatus(b.id)];
        return s || b.publishedAt.localeCompare(a.publishedAt);
      })
  }));

  const total = queues.reduce((sum, q) => sum + q.items.length, 0);
  const result = [];
  while (result.length < total) {
    const open = queues.filter((q) => q.items.length);
    const weightSum = open.reduce((s, q) => s + q.weight, 0);
    open.forEach((q) => (q.current += q.weight));
    const best = open.reduce((a, b) => (b.current > a.current ? b : a));
    best.current -= weightSum;
    result.push(best.items.shift());
  }
  return result;
}

// Anteil je Kategorie im Feed (für Onboarding/Einstellungen), in Prozent
export function shares(categories) {
  const active = categories.filter((c) => c.enabled !== false).sort((a, b) => a.rank - b.rank);
  const n = active.length;
  const sum = (n * (n + 1)) / 2;
  return Object.fromEntries(active.map((c, i) => [c.id, Math.round(((n - i) / sum) * 100)]));
}
