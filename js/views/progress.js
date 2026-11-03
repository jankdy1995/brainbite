import { getState } from '../core/store.js';
import { t, lang } from '../core/i18n.js';
import { loadIndex } from '../core/content.js';
import { el, screenHead, emptyState } from './components.js';

const DAY = 24 * 60 * 60 * 1000;

function dayKey(d) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export async function renderProgress(root) {
  const index = await loadIndex();
  const state = getState();
  const l = lang();
  const locale = l === 'de' ? 'de-DE' : 'en-GB';
  const history = state.history;

  const topicsLearned = new Set(history.map((h) => h.id)).size;
  const totalMinutes = history.reduce((s, h) => s + (h.minutes || 0), 0);

  const screen = el('div.screen', {},
    screenHead(new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date()), t('progress.title')),
    el('div.c-stats', {},
      stat(topicsLearned, t('progress.topics')),
      stat(totalMinutes, t('progress.minutes'))
    )
  );

  // Letzte 7 Tage, heute rechts
  const today = new Date();
  const days = [...Array(7)].map((_, i) => new Date(today.getTime() - (6 - i) * DAY));
  const perDay = days.map((d) => history.filter((h) => dayKey(new Date(h.at)) === dayKey(d)).reduce((s, h) => s + h.minutes, 0));
  const max = Math.max(...perDay);
  const weekSum = perDay.reduce((a, b) => a + b, 0);
  const maxIndex = max > 0 ? perDay.indexOf(max) : -1;
  const dayShort = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  const dayLong = new Intl.DateTimeFormat(locale, { weekday: 'long' });
  const label = days.map((d, i) => `${dayLong.format(d)} ${perDay[i]}`).join(', ');

  screen.append(
    el('section.c-week.glass', {},
      el('div.c-week__head', {},
        el('h2.c-week__title', { text: t('progress.week') }),
        el('span.c-week__sum', { text: t('common.min', { n: weekSum }) })
      ),
      el('div.c-week__bars', { role: 'img', 'aria-label': t('progress.chartLabel', { list: label }) },
        ...days.map((d, i) => el('div.c-week__col', {},
          el('div.c-week__track', {},
            perDay[i] > 0 ? el('div.c-week__bar', { class: i === maxIndex ? 'is-max' : undefined, style: { height: `${Math.max(16, (perDay[i] / max) * 100)}%` } }) : null
          ),
          el('span.c-week__day', { class: i === maxIndex ? 'is-max' : undefined, text: dayShort.format(d).replace('.', '') })
        ))
      ),
      el('p.c-week__note', {
        text: maxIndex >= 0
          ? t('progress.best', { day: maxIndex === 6 ? t('progress.today') : dayLong.format(days[maxIndex]), n: max })
          : t('progress.noneYet')
      })
    )
  );

  if (history.length) {
    screen.append(el('span.section-label', { text: t('progress.recent') }));
    const rel = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    for (const h of history.slice(0, 3)) {
      const topic = index.topics.find((x) => x.id === h.id);
      if (!topic) continue;
      const daysAgo = Math.round((new Date(dayKeyDate(today)) - new Date(dayKeyDate(new Date(h.at)))) / DAY);
      const when = rel.format(-daysAgo, 'day');
      screen.append(
        el('a.c-row.glass', { href: `#/article/${topic.id}?len=${h.len}`, style: { borderRadius: '22px' } },
          el('span.c-row__body', {},
            el('span.c-row__title', { text: topic.title[l] }),
            el('span.c-row__meta', { text: `${when.charAt(0).toUpperCase()}${when.slice(1)} · ${t(h.mode === 'listen' ? 'progress.listened' : 'progress.read')}` })
          ),
          el('span.c-row__end', { text: t('common.min', { n: h.len }) })
        )
      );
    }
  } else {
    screen.append(emptyState({ motif: 'bars', title: t('progress.emptyTitle'), text: t('progress.emptyText') }));
  }

  root.append(screen);
}

function dayKeyDate(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function stat(value, label) {
  return el('div.c-stat.glass', {},
    el('span.c-stat__value', { text: String(value) }),
    el('span.c-stat__label', { text: label })
  );
}
