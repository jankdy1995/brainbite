// Einstieg: Zustand laden, Sprache laden, Routen registrieren, Router starten
import { getState, subscribe } from './core/store.js';
import { loadLanguage, t } from './core/i18n.js';
import { route, start, navigate, parse } from './core/router.js';
import { el, icon } from './views/components.js';
import { renderFeed } from './views/feed.js';
import { renderArticle } from './views/article.js';
import { renderSaved } from './views/saved.js';
import { renderProgress } from './views/progress.js';
import { renderSettings } from './views/settings.js';
import { renderOnboarding } from './views/onboarding.js';

const app = document.getElementById('app');
const tabbar = document.getElementById('tabbar');

const TABS = [
  { path: 'feed', icon: 'discover', label: 'tab.discover' },
  { path: 'saved', icon: 'saved', label: 'tab.saved' },
  { path: 'progress', icon: 'progress', label: 'tab.progress' },
  { path: 'settings', icon: 'settings', label: 'tab.settings' }
];

let cleanup = null;

function mount(render, opts = {}) {
  return async (ctx) => {
    cleanup?.();
    cleanup = null;
    document.getElementById('overlay-root').replaceChildren();
    document.body.dataset.glow = opts.glow || 'left';
    tabbar.hidden = !opts.tabs;
    if (opts.tabs) renderTabbar(ctx.path);
    const node = el('div');
    try {
      cleanup = (await render(node, ctx)) || null;
    } catch (err) {
      console.error(err);
      node.replaceChildren(el('p.c-error', { text: t('error.generic') }));
    }
    app.replaceChildren(node);
    window.scrollTo(0, 0);
    if (opts.focus !== false) app.focus({ preventScroll: true });
  };
}

function renderTabbar(path) {
  tabbar.setAttribute('aria-label', t('tab.label'));
  tabbar.replaceChildren(
    ...TABS.map((tab) => {
      const active = path === tab.path;
      return el('a.c-tabbar__item', {
        href: `#/${tab.path}`,
        'aria-label': t(tab.label),
        'aria-current': active ? 'page' : undefined
      }, icon(tab.icon, active));
    })
  );
}

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'light' || theme === 'dark') root.dataset.theme = theme;
  else delete root.dataset.theme;
}

async function init() {
  const state = getState();
  applyTheme(state.theme);
  await loadLanguage(state.lang);

  let lastLang = state.lang;
  subscribe(async (s) => {
    applyTheme(s.theme);
    if (s.lang !== lastLang) {
      lastLang = s.lang;
      await loadLanguage(s.lang);
    }
  });

  route('feed', mount(renderFeed, { tabs: true }));
  route('article/:id', mount(renderArticle, { glow: 'none' }));
  route('saved', mount(renderSaved, { tabs: true, glow: 'right' }));
  route('progress', mount(renderProgress, { tabs: true }));
  route('settings', mount(renderSettings, { tabs: true, glow: 'right' }));
  route('onboarding/:step', mount(renderOnboarding, { glow: 'onboarding' }));

  // Erstbesuch: Onboarding, außer ein Artikel-Link wurde direkt geöffnet
  const { path } = parse();
  if (!state.onboarded && !path.startsWith('article/') && !path.startsWith('onboarding/')) {
    history.replaceState(null, '', '#/onboarding/1');
  }

  start();
}

init();

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('./sw.js').then((reg) => {
    reg.addEventListener('updatefound', () => {
      const worker = reg.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          import('./views/components.js').then(({ toast }) =>
            toast(t('update.available'), { label: t('update.reload'), run: () => location.reload() })
          );
        }
      });
    });
  }).catch(() => {});
}

export { navigate };
