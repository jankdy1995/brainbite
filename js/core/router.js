// Hash-Router: #/feed, #/article/<id>?len=10, #/saved, #/progress, #/settings, #/onboarding/1
const routes = [];
let onChange = null;

export function route(pattern, handler) {
  // pattern z. B. 'article/:id'
  const keys = [];
  const regex = new RegExp(
    '^' + pattern.replace(/:([a-z]+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '$'
  );
  routes.push({ regex, keys, handler });
}

export function parse(hash = location.hash) {
  const raw = hash.replace(/^#\/?/, '') || 'feed';
  const [path, query = ''] = raw.split('?');
  return { path, query: Object.fromEntries(new URLSearchParams(query)) };
}

export function navigate(to, { replace = false } = {}) {
  const hash = '#/' + to.replace(/^#?\/?/, '');
  if (replace) {
    history.replaceState(null, '', hash);
    resolve();
  } else if (location.hash === hash) {
    resolve();
  } else {
    location.hash = hash; // löst hashchange aus
  }
}

export function resolve() {
  const { path, query } = parse();
  for (const r of routes) {
    const m = path.match(r.regex);
    if (m) {
      const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
      onChange?.(path);
      return r.handler({ params, query, path });
    }
  }
  navigate('feed', { replace: true });
}

export function start(callback) {
  onChange = callback;
  window.addEventListener('hashchange', resolve);
  resolve();
}
