import { getState, update, topicStatus } from '../core/store.js';
import { t, lang } from '../core/i18n.js';
import { loadIndex, categoryName } from '../core/content.js';
import { el, topicRow, screenHead, emptyState, toast } from './components.js';

export async function renderSaved(root) {
  const index = await loadIndex();

  const draw = () => {
    const state = getState();
    const l = lang();
    const len = state.preferredLength;
    const topics = state.favorites.map((id) => index.topics.find((x) => x.id === id)).filter(Boolean);
    const minutes = topics.length * len;

    const screen = el('div.screen', {},
      screenHead(topics.length ? t(topics.length === 1 ? 'saved.summaryOne' : 'saved.summary', { n: topics.length, min: minutes }) : null, t('saved.title'))
    );

    if (!topics.length) {
      screen.append(emptyState({ motif: 'ring', title: t('saved.emptyTitle'), text: t('saved.emptyText') }));
      root.replaceChildren(screen);
      return;
    }

    const list = el('div.c-group.glass');
    topics.forEach((topic, i) => {
      if (i) list.append(el('div.c-group__sep'));
      const status = topicStatus(topic.id);
      const cat = categoryName(index, topic.category, l);
      const row = topicRow({
        topic,
        href: `#/article/${topic.id}?len=${len}`,
        title: topic.title[l],
        meta: status === 'started' ? t('meta.started', { cat }) : status === 'done' ? t('meta.read', { cat }) : cat,
        end: t('common.min', { n: len })
      });
      list.append(swipeToRemove(row, () => remove(topic.id)));
    });
    screen.append(list, el('span.note', { text: t('saved.hint') }));
    root.replaceChildren(screen);
  };

  const remove = (id) => {
    const before = [...getState().favorites];
    update((s) => (s.favorites = s.favorites.filter((f) => f !== id)));
    draw();
    toast(t('saved.removed'), {
      label: t('common.undo'),
      run: () => {
        update((s) => (s.favorites = before));
        draw();
      }
    });
  };

  draw();
}

// Nach links wischen zum Entfernen
function swipeToRemove(row, onRemove) {
  const front = el('div.c-swipe__front', {}, row);
  const wrap = el('div.c-swipe', {}, el('div.c-swipe__action', { 'aria-hidden': 'true', text: t('saved.remove') }), front);
  let startX = 0;
  let startY = 0;
  let dx = 0;
  let dragging = false;

  row.setAttribute('draggable', 'false');
  row.addEventListener('dragstart', (e) => e.preventDefault());
  front.addEventListener('pointerdown', (e) => {
    startX = e.clientX;
    startY = e.clientY;
    dx = 0;
    dragging = true;
  });
  front.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const x = e.clientX - startX;
    const y = e.clientY - startY;
    if (Math.abs(y) > Math.abs(x) && Math.abs(dx) < 10) return;
    dx = Math.min(0, x);
    if (dx < -8) {
      if (!front.hasPointerCapture(e.pointerId)) front.setPointerCapture(e.pointerId);
      front.style.transition = 'none';
      front.style.transform = `translateX(${dx}px)`;
    }
  });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    front.style.transition = '';
    if (dx < -110) {
      front.style.transform = 'translateX(-100%)';
      setTimeout(onRemove, 180);
    } else {
      front.style.transform = '';
    }
  };
  front.addEventListener('pointerup', end);
  front.addEventListener('pointercancel', end);
  // Nach einem Wisch keinen Klick auslösen
  front.addEventListener('click', (e) => {
    if (dx < -8) e.preventDefault();
  }, true);
  return wrap;
}
