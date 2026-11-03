import { getState, update, isFavorite, toggleFavorite, getProgress, setProgress } from '../core/store.js';
import { t, lang, formatNumber } from '../core/i18n.js';
import { loadIndex, loadTopic, listenMinutes, LENGTHS, categoryName } from '../core/content.js';
import { Speaker, supported as ttsSupported, splitSentences } from '../core/tts.js';
import { navigate } from '../core/router.js';
import { el, icon, illustration, openSheet, optionList, segmented, toast } from './components.js';

const RATES = [0.8, 1, 1.2, 1.5];
const SIZES = ['S', 'M', 'L', 'XL'];

export async function renderArticle(root, { params, query }) {
  const state = getState();
  const l = lang();
  const index = await loadIndex();
  const meta = index.topics.find((x) => x.id === params.id);
  if (!meta) {
    root.append(el('p.c-error', { text: t('article.notFound') }));
    return;
  }
  const len = LENGTHS.includes(Number(query.len)) ? Number(query.len) : state.preferredLength;
  const data = await loadTopic(meta.id, l);
  const version = data.versions[len];
  const rate = () => getState().tts.rate;

  // ===== Text in sprechbare Sätze zerlegen =====
  const items = []; // { text, words, wordsBefore, node, para }
  let wordsSoFar = 0;
  let paraCounter = 0;
  const addItem = (text, para) => {
    const words = text.split(/\s+/).filter(Boolean).length;
    const node = el('span.s', { text, dataset: { i: String(items.length) } });
    items.push({ text, words, wordsBefore: wordsSoFar, node, para });
    wordsSoFar += words;
    return node;
  };

  const body = el('div.reader__body', { lang: l });
  for (const section of version.sections) {
    if (section.heading) body.append(el('h2', {}, addItem(section.heading, paraCounter++)));
    for (const paragraph of section.paragraphs) {
      const para = paraCounter++;
      const p = el('p');
      splitSentences(paragraph).forEach((s, i) => {
        if (i) p.append(' ');
        p.append(addItem(s, para));
      });
      body.append(p);
    }
  }

  const takeaways = el('section.c-takeaways.glass', { 'aria-labelledby': 'takeaways-title' },
    el('h2.c-label', { id: 'takeaways-title' }, addItem(t('article.takeaways'), paraCounter++)),
    el('ul.c-takeaways__list', {}, ...version.keyTakeaways.map((k) => el('li', {}, addItem(k, paraCounter++))))
  );

  const sources = el('section.c-sources', {},
    el('h2.c-sources__title', { text: t('article.sources') }),
    el('ul.c-sources__list', {}, ...data.sources.map((s) =>
      el('li', {},
        el('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer', text: s.title }),
        el('span', { text: s.publisher })
      )
    ))
  );

  const totalWords = wordsSoFar;
  const totalSeconds = () => (totalWords / 150 / rate()) * 60;

  // ===== Kopf =====
  let saved = isFavorite(meta.id);
  const bookmarkBtn = el('button.c-roundbtn__inner', {
    type: 'button',
    'aria-label': t(saved ? 'article.unsave' : 'article.save'),
    'aria-pressed': String(saved),
    onclick: () => {
      saved = toggleFavorite(meta.id);
      bookmarkBtn.setAttribute('aria-pressed', String(saved));
      bookmarkBtn.setAttribute('aria-label', t(saved ? 'article.unsave' : 'article.save'));
      bookmarkBtn.replaceChildren(icon('saved', saved));
      toast(t(saved ? 'article.savedToast' : 'article.removedToast'));
    }
  }, icon('saved', saved));

  const reader = el('article.reader', { dataset: { size: state.fontSize } },
    el('div.reader__art', { 'aria-hidden': 'true' }, illustration(meta.motif, 'reader')),
    el('div.reader__bar', {},
      el('button.c-roundbtn', {
        type: 'button',
        'aria-label': t('common.back'),
        onclick: () => (history.length > 1 ? history.back() : navigate('feed'))
      }, icon('back')),
      el('div.c-roundbtn.c-roundbtn--pill', {},
        el('button.c-roundbtn__inner', { type: 'button', 'aria-label': t('article.display'), text: 'Aa', onclick: () => openDisplaySheet() }),
        bookmarkBtn
      )
    ),
    el('header.reader__head', {},
      el('span.c-label', { text: categoryName(index, meta.category, l) }),
      el('h1.reader__title', { text: data.title }),
      el('div.reader__meta', {},
        el('span.reader__metatext', { text: t('meta.listenSources', { listen: listenMinutes(meta.words[l][len], rate()), n: data.sources.length }) }),
        el('button.c-lenbtn', { type: 'button', 'aria-label': t('article.changeLength'), onclick: () => openLengthSheet() },
          t('common.min', { n: len }), icon('chevronDown'))
      )
    ),
    body,
    takeaways,
    sources,
    el('p.reader__done', { text: t('article.end') })
  );

  // ===== Vorlese-Leiste =====
  const timeText = el('span.c-player__time');
  const fill = el('div.c-player__fill');
  const playBtn = el('button.c-playbtn.c-playbtn--small', { type: 'button', 'aria-label': t('player.play') }, icon('play'));
  const prevBtn = el('button.c-player__btn', { type: 'button', 'aria-label': t('player.prev') }, icon('prev'));
  const player = el('div.c-player', { role: 'region', 'aria-label': t('player.label') },
    el('span.c-player__text', {}, el('span.c-player__title', { text: t('player.title') }), timeText),
    prevBtn,
    playBtn,
    el('div.c-player__track', { 'aria-hidden': 'true' }, fill)
  );

  const fmt = (sec) => {
    const s = Math.max(0, Math.round(sec));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  let current = -1;
  const showSentence = (i) => {
    if (current >= 0) items[current]?.node.classList.remove('is-speaking');
    current = i;
    const item = items[i];
    if (!item) return;
    item.node.classList.add('is-speaking');
    const elapsed = (item.wordsBefore / totalWords) * totalSeconds();
    timeText.textContent = t('player.time', { now: fmt(elapsed), total: fmt(totalSeconds()) });
    fill.style.width = `${(item.wordsBefore / totalWords) * 100}%`;
    if (speaker.playing) {
      const r = item.node.getBoundingClientRect();
      if (r.top < 90 || r.bottom > window.innerHeight - 110) {
        item.node.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      }
    }
    setProgress(meta.id, len, { sentence: i });
  };

  const speaker = new Speaker({
    onSentence: showSentence,
    onState: (playing) => {
      reader.classList.toggle('is-playing', playing);
      playBtn.replaceChildren(icon(playing ? 'pause' : 'play'));
      playBtn.setAttribute('aria-label', t(playing ? 'player.pause' : 'player.play'));
    },
    onEnd: () => {
      setProgress(meta.id, len, { status: 'done', mode: 'listen', scroll: 1, sentence: 0 }, listenMinutes(totalWords, rate()));
      items[current]?.node.classList.remove('is-speaking');
      speaker.index = 0;
      fill.style.width = '100%';
      toast(t('article.doneToast'));
    }
  });

  const progress = getProgress(meta.id, len);
  const startIndex = progress && progress.status !== 'done' ? progress.sentence || 0 : 0;
  speaker.index = startIndex;
  timeText.textContent = t('player.time', {
    now: fmt(((items[startIndex]?.wordsBefore || 0) / totalWords) * totalSeconds()),
    total: fmt(totalSeconds())
  });
  fill.style.width = `${((items[startIndex]?.wordsBefore || 0) / totalWords) * 100}%`;

  if (!ttsSupported) {
    timeText.textContent = t('player.unsupported');
    playBtn.disabled = true;
    prevBtn.disabled = true;
  } else {
    speaker.setup({ sentences: items, lang: l, rate: rate(), voiceURI: state.tts.voiceURI[l] }).then(() => {
      if (!speaker.voice) timeText.textContent = t('player.noVoice');
      if (query.play === '1') speaker.play(speaker.index);
    });
  }

  playBtn.addEventListener('click', () => speaker.toggle());
  prevBtn.addEventListener('click', () => {
    const at = Math.max(0, speaker.index);
    const para = items[at]?.para ?? 0;
    const paraStart = items.findIndex((x) => x.para === para);
    // Mitten im Absatz: an dessen Anfang, sonst zum vorherigen Absatz
    let target = paraStart;
    if (at === paraStart && para > 0) target = items.findIndex((x) => x.para === items[paraStart - 1]?.para);
    speaker.jump(Math.max(0, target));
  });
  body.addEventListener('click', (e) => {
    const s = e.target.closest('.s');
    if (s && speaker.playing) speaker.jump(Number(s.dataset.i));
  });

  // ===== Lese-Fortschritt über das Scrollen =====
  let ticking = false;
  let lastSaved = 0;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const rect = body.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / (rect.height + window.innerHeight * 0.4)));
      const now = Date.now();
      if (ratio >= 0.98 && !speaker.playing) {
        setProgress(meta.id, len, { status: 'done', mode: 'read', scroll: 1 }, len);
      } else if (now - lastSaved > 1500 && ratio > 0.02) {
        lastSaved = now;
        setProgress(meta.id, len, { scroll: Math.round(ratio * 100) / 100 });
      }
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // ===== Sheets =====
  function openLengthSheet() {
    const list = optionList({
      label: t('article.changeLength'),
      value: len,
      options: LENGTHS.map((n) => ({
        value: n,
        label: t('meta.readListen', { read: n, listen: listenMinutes(meta.words[l][n], rate()) })
      })),
      onChange: (n) => {
        sheet.close();
        if (n !== len) navigate(`article/${meta.id}?len=${n}`, { replace: true });
      }
    });
    const sheet = openSheet({ title: t('article.length'), content: list });
  }

  function openDisplaySheet() {
    const content = el('div', { style: { display: 'flex', flexDirection: 'column', gap: '18px' } },
      el('div.c-panel', { style: { padding: '0' } },
        el('span.c-panel__title', { text: t('settings.fontSize') }),
        segmented({
          label: t('settings.fontSize'),
          value: getState().fontSize,
          options: SIZES.map((s) => ({ value: s, label: s })),
          onChange: (s) => {
            update((st) => (st.fontSize = s));
            reader.dataset.size = s;
          }
        })
      ),
      el('div.c-panel', { style: { padding: '0' } },
        el('span.c-panel__title', { text: t('settings.rate') }),
        segmented({
          label: t('settings.rate'),
          value: rate(),
          options: RATES.map((r) => ({ value: r, label: `${formatNumber(r)}×` })),
          onChange: (r) => {
            update((st) => (st.tts.rate = r));
            speaker.setRate(r);
            if (current >= 0) showSentence(current);
          }
        })
      )
    );
    openSheet({ title: t('article.display'), content });
  }

  root.append(reader, player);

  // Begonnene Artikel an der letzten Stelle fortsetzen
  if (progress && progress.status !== 'done' && progress.scroll > 0.05 && query.play !== '1') {
    requestAnimationFrame(() => {
      const target = items[startIndex]?.node;
      if (target && startIndex > 0) {
        target.scrollIntoView({ block: 'center' });
      } else {
        const top = body.getBoundingClientRect().top + window.scrollY;
        const y = top + progress.scroll * (body.offsetHeight + window.innerHeight * 0.4) - window.innerHeight;
        window.scrollTo(0, Math.max(0, y));
      }
    });
  }

  return () => {
    speaker.stop();
    window.removeEventListener('scroll', onScroll);
  };
}
