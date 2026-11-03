import { getState, update, getProgress } from '../core/store.js';
import { t, lang } from '../core/i18n.js';
import { loadIndex, listenMinutes, LENGTHS, categoryName } from '../core/content.js';
import { buildFeed } from '../core/feed.js';
import { unlock } from '../core/tts.js';
import { el, icon, illustration, segmented, topicRow, group, openMenu, emptyState } from './components.js';

function greeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return t('feed.greeting.morning');
  if (h >= 11 && h < 18) return t('feed.greeting.day');
  return t('feed.greeting.evening');
}

export async function renderFeed(root) {
  const index = await loadIndex();
  const draw = () => {
    const state = getState();
    const len = state.preferredLength;
    const l = lang();
    // Kategorie-Filter: „Alle“ nutzt die Gewichtung, sonst nur diese eine Kategorie
    const filter = index.categories.some((c) => c.id === state.feedCategory) ? state.feedCategory : 'all';
    const cats = filter === 'all' ? state.categories : [{ id: filter, rank: 1, enabled: true }];
    const feed = buildFeed(index, cats);
    const [hero, ...rest] = feed;
    const filterLabel = filter === 'all' ? t('feed.all') : categoryName(index, filter, l);

    const openFilter = (e) =>
      openMenu({
        anchor: e.currentTarget,
        label: t('feed.category'),
        value: filter,
        options: [{ value: 'all', label: t('feed.all') }, ...index.categories.map((c) => ({ value: c.id, label: c.name[l] }))],
        onChange: (v) => {
          update((st) => (st.feedCategory = v));
          draw();
        }
      });

    const screen = el('div.screen', {},
      el('div.screen-head', {},
        el('div.screen-row', {},
          el('span.screen-head__pre', { text: greeting() }),
          el('button.c-lenbtn.c-filterbtn', {
            type: 'button',
            'aria-label': t('feed.categoryLabel', { name: filterLabel }),
            'aria-haspopup': 'menu',
            'aria-expanded': 'false',
            onclick: openFilter
          }, el('span.c-filterbtn__text', { text: filterLabel }), icon('chevronDown'))
        ),
        el('h1.screen-head__title', { text: t('feed.title') })
      ),
      segmented({
        label: t('feed.length'),
        value: len,
        options: LENGTHS.map((n) => ({ value: n, label: t('common.min', { n }) })),
        onChange: (n) => {
          update((s) => (s.preferredLength = n));
          draw();
        }
      })
    );

    if (!hero && filter !== 'all') {
      screen.append(emptyState({ motif: 'globe', title: t('feed.emptyCatTitle'), text: t('feed.emptyCatText', { name: filterLabel }) }));
    } else if (!hero) {
      screen.append(el('p.note', { text: t('feed.empty') }));
    } else {
      screen.append(heroCard(hero, len, l, state, filter === 'all' ? t('feed.today') : filterLabel));
      const next = rest.slice(0, 4);
      if (next.length) {
        screen.append(el('span.section-label', { text: t('feed.next') }));
        screen.append(group(next.map((topic) => topicRow({
          topic,
          href: `#/article/${topic.id}?len=${len}`,
          title: topic.title[l],
          meta: rowMeta(topic, index, len, l)
        }))));
      } else {
        screen.append(el('p.note', { text: t('feed.moreSoon') }));
      }
    }
    root.replaceChildren(screen);
  };
  draw();
}

function heroCard(topic, len, l, state, label) {
  const words = topic.words[l][len];
  const href = `#/article/${topic.id}?len=${len}`;
  return el('div.c-hero.glass', {},
    el('div.c-hero__art', { 'aria-hidden': 'true' }, illustration(topic.motif, 'hero')),
    el('div.c-hero__foot', {},
      el('a.c-hero__text', { href },
        el('span.c-label', { text: label }),
        el('span.c-hero__title', { text: topic.title[l] }),
        el('span.c-hero__meta', { text: t('meta.readListen', { read: len, listen: listenMinutes(words, state.tts.rate) }) })
      ),
      el('a.c-playbtn', { href: `${href}&play=1`, 'aria-label': t('feed.listen'), onclick: () => unlock(topic.title[l], l) }, icon('play'))
    )
  );
}

function rowMeta(topic, index, len, l) {
  const p = getProgress(topic.id, len);
  const cat = categoryName(index, topic.category, l);
  if (p?.status === 'done') return t('meta.read', { cat });
  if (p?.scroll > 0.05) {
    const left = Math.max(1, Math.round(len * (1 - p.scroll)));
    return t('meta.continue', { n: left });
  }
  return cat;
}
