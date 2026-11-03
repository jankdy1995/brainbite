// UI-Texte aus i18n/<lang>.json. Platzhalter: {name}
const dictionaries = {};
let current = 'de';

export async function loadLanguage(lang) {
  if (!dictionaries[lang]) {
    const res = await fetch(`./i18n/${lang}.json`);
    dictionaries[lang] = await res.json();
  }
  current = lang;
  document.documentElement.lang = lang;
}

export function lang() {
  return current;
}

export function t(key, vars = {}) {
  const dict = dictionaries[current] || {};
  let text = dict[key] ?? dictionaries.de?.[key] ?? key;
  for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, String(v));
  return text;
}

// Zahl mit Komma im Deutschen (1,2×)
export function formatNumber(n) {
  return new Intl.NumberFormat(current === 'de' ? 'de-DE' : 'en-GB', { maximumFractionDigits: 1 }).format(n);
}
