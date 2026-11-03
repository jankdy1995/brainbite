// Wiederverwendbare UI-Bausteine. Inhaltstexte immer über textContent.
import { t } from '../core/i18n.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

// el('div.c-row', { attrs }, children)
export function el(tag, props = {}, ...children) {
  const [name, ...classes] = tag.split('.');
  const node = document.createElement(name || 'div');
  if (classes.length) node.className = classes.join(' ');
  for (const [k, v] of Object.entries(props || {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'text') node.textContent = v;
    else if (k === 'class') node.className += ' ' + v;
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else node.setAttribute(k, v === true ? '' : v);
  }
  append(node, children);
  return node;
}

function append(node, children) {
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
}

// Statisches SVG-Markup (nur eigene, feste Strings – nie Inhaltsdaten)
export function svg(markup) {
  const tpl = document.createElement('template');
  tpl.innerHTML = markup.trim();
  return tpl.content.firstElementChild;
}

export const icons = {
  discover: (active) =>
    active
      ? '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5" fill="currentColor"/><path d="M15.5 8.5 13.4 13.4 8.5 15.5 10.6 10.6Z" fill="var(--bg)" stroke="var(--bg)" stroke-width="1.2" stroke-linejoin="round"/></svg>'
      : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5 13.4 13.4 8.5 15.5 10.6 10.6Z"/></svg>',
  saved: (active) =>
    `<svg width="24" height="24" viewBox="0 0 24 24" fill="${active ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" aria-hidden="true"><path d="M7 3.5h10a1.5 1.5 0 0 1 1.5 1.5v15.2a.6.6 0 0 1-.95.5L12 17l-5.55 3.7a.6.6 0 0 1-.95-.5V5A1.5 1.5 0 0 1 7 3.5z"/></svg>`,
  progress: (active) =>
    `<svg width="24" height="24" viewBox="0 0 24 24" fill="${active ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><rect x="3.5" y="12" width="4" height="8.5" rx="1.5"/><rect x="10" y="7" width="4" height="13.5" rx="1.5"/><rect x="16.5" y="3.5" width="4" height="17" rx="1.5"/></svg>`,
  settings: (active) =>
    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/><circle cx="9" cy="7" r="2.3" fill="${active ? 'currentColor' : 'var(--tabbar-fill)'}"/><circle cx="15.5" cy="12" r="2.3" fill="${active ? 'currentColor' : 'var(--tabbar-fill)'}"/><circle cx="7" cy="17" r="2.3" fill="${active ? 'currentColor' : 'var(--tabbar-fill)'}"/></svg>`,
  play: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
  pause: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4.5" width="4" height="15" rx="1.3"/><rect x="14" y="4.5" width="4" height="15" rx="1.3"/></svg>',
  prev: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 7.2v9.6a.8.8 0 0 1-1.25.66L13 12.9v3.9a.8.8 0 0 1-1.25.66l-7.2-4.8a.8.8 0 0 1 0-1.32l7.2-4.8A.8.8 0 0 1 13 7.2v3.9l6.75-4.56A.8.8 0 0 1 21 7.2z"/></svg>',
  back: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  chevronDown: (size = 11, w = 3) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>`,
  chevronUp: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>',
  chevronRight: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
  check: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  grid: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/></svg>',
  timer: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M10 2h4"/></svg>',
  voice: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><line x1="5" y1="10" x2="5" y2="14"/><line x1="9" y1="6" x2="9" y2="18"/><line x1="13" y1="8" x2="13" y2="16"/><line x1="17" y1="4" x2="17" y2="20"/><line x1="21" y1="10" x2="21" y2="14"/></svg>',
  globe: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/></svg>'
};

export function icon(name, ...args) {
  const def = icons[name];
  return svg(typeof def === 'function' ? def(...args) : def);
}

// ===== Illustrationen: abstrakt, nur Petrol-Töne =====
const C = { mid: '#14606A', line: '#1D6B75', light: '#8CCFD6', void: '#071417', petrol: '#0F4C55', text: '#ECF4F4' };

const tiles = {
  ring: `<circle cx="32" cy="32" r="15" fill="${C.mid}"/><ellipse cx="32" cy="32" rx="26" ry="5" fill="none" stroke="${C.light}" stroke-width="1.8" opacity="0.85"/><circle cx="32" cy="32" r="7" fill="${C.void}"/>`,
  moon: `<circle cx="30" cy="34" r="14" fill="${C.light}"/><circle cx="37" cy="28" r="12" fill="${C.petrol}"/>`,
  network: `<g stroke="${C.line}" stroke-width="2"><line x1="18" y1="22" x2="32" y2="32"/><line x1="46" y1="22" x2="32" y2="32"/><line x1="32" y1="46" x2="32" y2="32"/></g><circle cx="18" cy="22" r="3.5" fill="${C.light}"/><circle cx="46" cy="22" r="3.5" fill="${C.light}"/><circle cx="32" cy="46" r="3.5" fill="${C.light}"/><circle cx="32" cy="32" r="4.5" fill="${C.text}"/>`,
  bars: `<rect x="16" y="34" width="8" height="14" rx="4" fill="${C.line}"/><rect x="28" y="24" width="8" height="24" rx="4" fill="${C.mid}"/><rect x="40" y="16" width="8" height="32" rx="4" fill="${C.light}"/>`,
  waves: `<g fill="none" stroke-width="2.4" stroke-linecap="round"><path d="M12 26c5-5 10-5 15 0s10 5 15 0 7-4 10-2" stroke="${C.light}"/><path d="M12 36c5-5 10-5 15 0s10 5 15 0 7-4 10-2" stroke="${C.line}"/></g>`,
  chip: `<rect x="20" y="20" width="24" height="24" rx="5" fill="${C.mid}"/><rect x="27" y="27" width="10" height="10" rx="2" fill="${C.light}"/><g stroke="${C.line}" stroke-width="2" stroke-linecap="round"><path d="M26 14v4M32 14v4M38 14v4M26 46v4M32 46v4M38 46v4M14 26h4M14 32h4M14 38h4M46 26h4M46 32h4M46 38h4"/></g>`,
  globe: `<circle cx="32" cy="32" r="16" fill="${C.mid}"/><g fill="none" stroke="${C.light}" stroke-width="1.6" opacity="0.9"><ellipse cx="32" cy="32" rx="7" ry="16"/><path d="M16 32h32M18.5 24h27M18.5 40h27"/></g>`
};

function ringWide(w, h, variant) {
  const hero = variant === 'hero';
  const cx = hero ? w * 0.567 : w * 0.56;
  const cy = hero ? h * 0.523 : h * 0.4375;
  const r = hero ? 70 : 104;
  const rx = hero ? 132 : 190;
  const ry = hero ? 20 : 28;
  const core = hero ? 30 : 44;
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.mid}"/><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="${C.light}" stroke-width="${hero ? 2.5 : 3}" opacity="0.8"/><circle cx="${cx}" cy="${cy}" r="${core}" fill="${C.void}"/><circle cx="${w * 0.14}" cy="${h * 0.21}" r="2" fill="${C.light}"/><circle cx="${w * 0.89}" cy="${h * 0.8}" r="2" fill="${C.light}"/>`;
}

export function illustration(motif = 'ring', variant = 'tile') {
  if (variant === 'tile') {
    return svg(`<svg viewBox="0 0 64 64" aria-hidden="true">${tiles[motif] || tiles.ring}</svg>`);
  }
  const w = variant === 'hero' ? 335 : 375;
  const h = variant === 'hero' ? 176 : 320;
  if (motif === 'ring') {
    return svg(`<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${ringWide(w, h, variant)}</svg>`);
  }
  // Andere Motive: Kachel-Motiv vergrößert und mittig
  const scale = variant === 'hero' ? 3.4 : 5;
  const tx = w * 0.56 - 32 * scale;
  const ty = h * (variant === 'hero' ? 0.52 : 0.44) - 32 * scale;
  return svg(`<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g transform="translate(${tx} ${ty}) scale(${scale})">${tiles[motif] || tiles.ring}</g></svg>`);
}

// ===== Bausteine =====
export function segmented({ options, value, onChange, label, small = false }) {
  const group = el('div.c-segmented', { role: 'group', 'aria-label': label, class: small ? 'c-segmented--small' : undefined });
  const buttons = options.map((o) => {
    const b = el('button.c-segmented__btn', {
      type: 'button',
      'aria-pressed': String(o.value === value),
      text: o.label,
      onclick: () => {
        buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        onChange(o.value);
      }
    });
    return b;
  });
  group.append(...buttons);
  return group;
}

export function topicRow({ topic, href, title, meta, end, tag = 'a' }) {
  const row = el(`${tag}.c-row`, { href },
    el('span.c-row__tile', { 'aria-hidden': 'true' }, illustration(topic.motif, 'tile')),
    el('span.c-row__body', {},
      el('span.c-row__title', { text: title }),
      meta ? el('span.c-row__meta', { text: meta }) : null
    ),
    end ? el('span.c-row__end', { text: end }) : null
  );
  return row;
}

export function group(rows, sepClass = '') {
  const g = el('div.c-group.glass');
  rows.forEach((r, i) => {
    if (i) g.append(el('div.c-group__sep', { class: sepClass || undefined }));
    g.append(r);
  });
  return g;
}

export function screenHead(pre, title) {
  return el('div.screen-head', {},
    pre ? el('span.screen-head__pre', { text: pre }) : null,
    el('h1.screen-head__title', { text: title })
  );
}

// Bottom-Sheet; gibt { panel, close } zurück
export function openSheet({ title, content, onClose }) {
  const root = document.getElementById('overlay-root');
  const previous = document.activeElement;
  const close = () => {
    sheet.remove();
    document.removeEventListener('keydown', onKey);
    previous?.focus?.();
    onClose?.();
  };
  const onKey = (e) => e.key === 'Escape' && close();
  const panel = el('div.c-sheet__panel', { role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
    el('div.c-sheet__grabber', { 'aria-hidden': 'true' }),
    el('div.c-sheet__head', {},
      el('h2.c-sheet__title', { text: title }),
      el('button.c-sheet__close', { type: 'button', text: t('common.done'), onclick: () => close() })
    ),
    content
  );
  const sheet = el('div.c-sheet', {}, el('div.c-sheet__backdrop', { onclick: () => close() }), panel);
  root.append(sheet);
  document.addEventListener('keydown', onKey);
  panel.querySelector('.c-sheet__close').focus();
  return { panel, close };
}

// Ausklappmenü unter einem Button (wie die Pull-down-Menüs in iOS)
export function openMenu({ anchor, label, options, value, onChange }) {
  const root = document.getElementById('overlay-root');
  const rect = anchor.getBoundingClientRect();
  const close = () => {
    wrap.remove();
    document.removeEventListener('keydown', onKey);
    anchor.setAttribute('aria-expanded', 'false');
    anchor.focus();
  };
  const onKey = (e) => e.key === 'Escape' && close();
  const items = options.map((o) =>
    el('button.c-menu__item', {
      type: 'button',
      role: 'menuitemradio',
      'aria-checked': String(o.value === value),
      onclick: () => {
        close();
        if (o.value !== value) onChange(o.value);
      }
    }, el('span.c-menu__check', { 'aria-hidden': 'true' }, icon('check')), el('span', { text: o.label }))
  );
  const menu = el('div.c-menu', {
    role: 'menu',
    'aria-label': label,
    style: { top: `${rect.bottom + 8}px`, right: `${Math.max(12, window.innerWidth - rect.right)}px` }
  }, ...items);
  const wrap = el('div.c-menu-layer', {}, el('div.c-menu-backdrop', { onclick: close }), menu);
  root.append(wrap);
  anchor.setAttribute('aria-expanded', 'true');
  document.addEventListener('keydown', onKey);
  (items.find((b) => b.getAttribute('aria-checked') === 'true') || items[0]).focus();
}

let toastTimer = null;
export function toast(message, action) {
  const root = document.getElementById('overlay-root');
  root.querySelector('.c-toast')?.remove();
  clearTimeout(toastTimer);
  const node = el('div.c-toast', { role: 'status' },
    el('span', { text: message }),
    action ? el('button.c-toast__action', { type: 'button', text: action.label, onclick: () => { action.run(); node.remove(); } }) : null
  );
  root.append(node);
  toastTimer = setTimeout(() => node.remove(), 4500);
}

export function emptyState({ motif, title, text }) {
  return el('div.c-empty.glass', {},
    el('div.c-empty__art', { 'aria-hidden': 'true' }, illustration(motif, 'tile')),
    el('p.c-empty__title', { text: title }),
    el('p.c-empty__text', { text })
  );
}

export function optionList({ options, value, onChange, label }) {
  const g = el('div.c-group.glass', { role: 'radiogroup', 'aria-label': label });
  const items = options.map((o) => {
    const b = el('button.c-option', {
      type: 'button',
      role: 'radio',
      'aria-checked': String(o.value === value),
      onclick: () => {
        items.forEach((x) => x.setAttribute('aria-checked', String(x === b)));
        onChange(o.value);
      }
    }, el('span.c-option__label', { text: o.label }), el('span.c-option__check', {}, icon('check')));
    return b;
  });
  items.forEach((b, i) => {
    if (i) g.append(el('div.c-group__sep.c-group__sep--min'));
    g.append(b);
  });
  return g;
}
