import { getState, update } from '../core/store.js';
import { t, lang, loadLanguage } from '../core/i18n.js';
import { loadIndex, LENGTHS } from '../core/content.js';
import { shares } from '../core/feed.js';
import { navigate } from '../core/router.js';
import { el, icon, svg, optionList } from './components.js';

const LOGO = '<svg width="88" height="88" viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="22.5" fill="#0F4C55"/><g transform="translate(20 20) scale(0.6)"><rect x="18" y="8" width="15" height="84" rx="7.5" fill="#FFFFFF"/><circle cx="57" cy="62" r="23.5" fill="none" stroke="#FFFFFF" stroke-width="15"/><circle cx="57" cy="62" r="8" fill="#FF8A75"/></g></svg>';

export async function renderOnboarding(root, { params }) {
  const step = Math.min(3, Math.max(1, Number(params.step) || 1));
  document.body.dataset.glow = step === 1 ? 'left' : step === 2 ? 'right' : 'low';
  const index = await loadIndex();

  const top = el('div.onb__top', {},
    el('div.onb__dots', { 'aria-hidden': 'true' },
      ...[1, 2, 3].map((i) => el('span.onb__dot', { class: i === step ? 'is-active' : undefined }))
    ),
    step > 1 ? el('button.onb__back', { type: 'button', text: t('common.back'), onclick: () => navigate(`onboarding/${step - 1}`, { replace: true }) }) : null
  );
  const screen = el('div.onb', {}, top, el('span.visually-hidden', { text: t('onb.step', { n: step }) }));

  if (step === 1) {
    screen.append(
      el('div.onb__center', {},
        svg(LOGO),
        el('h1.onb__title.onb__title--hero', { text: t('onb.welcome') }),
        el('p.onb__lead', { text: t('onb.welcomeLead') })
      ),
      el('span.section-label', { style: { margin: '0 4px 10px' }, text: t('settings.language') }),
      languagePicker(),
      el('div', { style: { height: '28px' } }),
      el('button.c-button', { type: 'button', text: t('common.next'), onclick: () => navigate('onboarding/2', { replace: true }) })
    );
  }

  if (step === 2) {
    screen.append(
      el('h1.onb__title', { text: t('onb.topicsTitle') }),
      el('p.onb__lead', { text: t('onb.topicsLead') }),
      el('div', { style: { height: '32px' } }),
      rankList(index),
      el('p.note', { style: { marginTop: '14px', padding: '0 4px' }, text: t('onb.moreCategories') }),
      el('div.onb__spacer'),
      el('button.c-button', { type: 'button', text: t('common.next'), onclick: () => navigate('onboarding/3', { replace: true }) })
    );
  }

  if (step === 3) {
    screen.append(
      el('h1.onb__title', { text: t('onb.timeTitle') }),
      el('p.onb__lead', { text: t('onb.timeLead') }),
      el('div', { style: { height: '32px' } }),
      timeTiles(),
      el('div.onb__spacer'),
      el('button.c-button', {
        type: 'button',
        text: t('onb.start'),
        onclick: () => {
          update((s) => (s.onboarded = true));
          navigate('feed', { replace: true });
        }
      })
    );
  }

  root.append(screen);
}

export function languagePicker(onChange) {
  return optionList({
    label: t('settings.language'),
    value: getState().lang,
    options: [{ value: 'de', label: 'Deutsch' }, { value: 'en', label: 'English' }],
    onChange: async (value) => {
      update((s) => (s.lang = value));
      await loadLanguage(value);
      // Texte in der neuen Sprache neu zeichnen
      if (onChange) onChange(value);
      else window.dispatchEvent(new HashChangeEvent('hashchange'));
    }
  });
}

// Kategorien sortieren (ohne Ziehen) und an/aus schalten
export function rankList(index) {
  const wrap = el('div');
  const draw = () => {
    const l = lang();
    const cats = [...getState().categories].sort((a, b) => a.rank - b.rank);
    const share = shares(cats);
    const g = el('div.c-group.glass');
    cats.forEach((c, i) => {
      const name = index.categories.find((x) => x.id === c.id)?.name[l] ?? c.id;
      const on = c.enabled !== false;
      const activeCount = cats.filter((x) => x.enabled !== false).length;
      if (i) g.append(el('div.c-group__sep', { style: { marginLeft: '46px' } }));
      g.append(el('div.c-rank', { class: on ? undefined : 'is-off' },
        el('span.c-rank__num', { text: String(i + 1) }),
        el('span.c-rank__body', {},
          el('span.c-rank__name', { text: name }),
          el('span.c-rank__share', { text: on ? t('onb.share', { n: share[c.id] }) : t('onb.off') })
        ),
        el('button.c-rank__btn', { type: 'button', 'aria-label': t('onb.up', { name }), disabled: i === 0 ? true : undefined, onclick: () => move(c.id, -1) }, svg(icons.up)),
        el('button.c-rank__btn', { type: 'button', 'aria-label': t('onb.down', { name }), disabled: i === cats.length - 1 ? true : undefined, onclick: () => move(c.id, 1) }, icon('chevronDown', 18, 2.2)),
        el('button.c-toggle', {
          type: 'button',
          role: 'switch',
          'aria-checked': String(on),
          'aria-label': name,
          disabled: on && activeCount === 1 ? true : undefined,
          style: { marginRight: '10px' },
          onclick: () => {
            update((s) => {
              const cat = s.categories.find((x) => x.id === c.id);
              cat.enabled = !(cat.enabled !== false);
            });
            draw();
          }
        })
      ));
    });
    wrap.replaceChildren(g);
  };
  const move = (id, dir) => {
    update((s) => {
      const sorted = [...s.categories].sort((a, b) => a.rank - b.rank);
      const i = sorted.findIndex((c) => c.id === id);
      const j = i + dir;
      if (j < 0 || j >= sorted.length) return;
      [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
      sorted.forEach((c, k) => (c.rank = k + 1));
    });
    draw();
  };
  draw();
  return wrap;
}

const icons = {
  up: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>'
};

export function timeTiles(onChange) {
  const g = el('div.c-tiles', { role: 'radiogroup', 'aria-label': t('settings.length') });
  const value = getState().preferredLength;
  const tiles = LENGTHS.map((n) => {
    const b = el('button.c-tile.glass', {
      type: 'button',
      role: 'radio',
      'aria-checked': String(n === value),
      onclick: () => {
        tiles.forEach((x) => x.setAttribute('aria-checked', String(x === b)));
        update((s) => (s.preferredLength = n));
        onChange?.(n);
      }
    }, el('span.c-tile__num', { text: String(n) }), el('span.c-tile__unit', { text: t('common.minutes') }));
    return b;
  });
  g.append(...tiles);
  return g;
}
