// Prüft content/index.json und alle Themen-Dateien gegen docs/CONTENT_GUIDE.md
// Aufruf: node scripts/validate-content.mjs
import { readFile, access } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const LANGS = ['de', 'en'];
const LENGTHS = ['5', '10', '15', '20'];
const TARGET = { de: { 5: 1000, 10: 2000, 15: 3000, 20: 4000 }, en: { 5: 1150, 10: 2300, 15: 3450, 20: 4600 } };
const SECTIONS = { 5: [3, 3], 10: [4, 5], 15: [5, 6], 20: [6, 8] };
const MONTHS = /\b\d{1,2}\. (Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)/;
const FORBIDDEN = [/\bz\. ?B\./, /\bca\./, /\bbzw\./, /\bu\. ?a\./, /\be\.g\./, /\bi\.e\./, /https?:\/\//, MONTHS];

const errors = [];
const warn = (msg) => errors.push(msg);
const count = (s) => s.split(/\s+/).filter(Boolean).length;
const read = async (path) => JSON.parse(await readFile(new URL(path, root), 'utf8'));

const index = await read('content/index.json');
const categoryIds = new Set(index.categories.map((c) => c.id));
const ids = new Set();

for (const topic of index.topics) {
  const where = `index.json › ${topic.id}`;
  if (ids.has(topic.id)) warn(`${where}: doppelte ID`);
  ids.add(topic.id);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(topic.id)) warn(`${where}: ID nicht im Format kebab-case`);
  if (!categoryIds.has(topic.category)) warn(`${where}: unbekannte Kategorie ${topic.category}`);
  if (!topic.motif) warn(`${where}: motif fehlt`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(topic.publishedAt || '')) warn(`${where}: publishedAt fehlt oder falsch`);

  for (const lang of LANGS) {
    if (!topic.title?.[lang]) warn(`${where}: Titel ${lang} fehlt`);
    if (!topic.teaser?.[lang]) warn(`${where}: Teaser ${lang} fehlt`);
    const file = `content/topics/${topic.id}.${lang}.json`;
    try {
      await access(new URL(file, root));
    } catch {
      warn(`${file}: Datei fehlt`);
      continue;
    }
    const data = await read(file);
    if (data.id !== topic.id || data.lang !== lang) warn(`${file}: id/lang passen nicht`);
    if (!Array.isArray(data.sources) || data.sources.length < 3) warn(`${file}: weniger als 3 Quellen`);
    for (const s of data.sources || []) {
      if (!s.title || !s.publisher || !/^https:\/\//.test(s.url || '') || !s.accessed) warn(`${file}: Quelle unvollständig (${s.title || s.url})`);
    }
    if ((data.sources || []).every((s) => /wikipedia\.org/.test(s.url))) warn(`${file}: nur Wikipedia-Quellen`);
    if (!data.factCheckedAt) warn(`${file}: factCheckedAt fehlt`);

    for (const len of LENGTHS) {
      const v = data.versions?.[len];
      if (!v) {
        warn(`${file}: Länge ${len} fehlt`);
        continue;
      }
      const texts = [
        ...v.sections.flatMap((s) => [s.heading || '', ...s.paragraphs]),
        ...v.keyTakeaways
      ];
      const words = texts.reduce((n, t) => n + count(t), 0);
      const target = TARGET[lang][len];
      if (words < target * 0.9 || words > target * 1.1) warn(`${file} › ${len} Min: ${words} Wörter (Ziel ${target} ±10 %)`);
      if (v.words !== words) warn(`${file} › ${len} Min: words=${v.words}, gezählt ${words}`);
      if (topic.words?.[lang]?.[len] !== words) warn(`${where}: words.${lang}.${len} passt nicht (${topic.words?.[lang]?.[len]} statt ${words})`);
      const headed = v.sections.filter((s) => s.heading).length;
      const [min, max] = SECTIONS[len];
      if (headed < min || headed > max) warn(`${file} › ${len} Min: ${headed} Abschnitte (erlaubt ${min}–${max})`);
      if (v.sections[0]?.heading) warn(`${file} › ${len} Min: Einstieg ohne Überschrift fehlt`);
      if (v.keyTakeaways.length !== 3) warn(`${file} › ${len} Min: genau 3 Kernaussagen nötig`);
      for (const t of texts) {
        for (const re of FORBIDDEN) if (re.test(t)) warn(`${file} › ${len} Min: nicht vorlesetauglich (${re}) in „${t.slice(0, 60)}…“`);
      }
    }
  }
}

for (const id of index.featured?.topics || []) {
  if (!ids.has(id)) warn(`index.json › featured: unbekanntes Thema ${id}`);
}

if (errors.length) {
  console.error(`✗ ${errors.length} Problem(e):\n- ` + errors.join('\n- '));
  process.exit(1);
}
console.log(`✓ Inhalte in Ordnung: ${index.topics.length} Thema/Themen, ${index.topics.length * 8} Fassungen geprüft`);
