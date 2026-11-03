import { getState, update, reset } from '../core/store.js';
import { t, lang, formatNumber } from '../core/i18n.js';
import { loadIndex } from '../core/content.js';
import { voicesFor, pickVoice, supported as ttsSupported, primeAudioSession } from '../core/tts.js';
import { el, icon, segmented, screenHead, openSheet, optionList } from './components.js';
import { languagePicker, rankList, timeTiles } from './onboarding.js';

const RATES = [0.8, 1, 1.2, 1.5];

export async function renderSettings(root) {
  const index = await loadIndex();

  const draw = async () => {
    const state = getState();
    const l = lang();
    const activeCats = state.categories.filter((c) => c.enabled !== false).length;

    let voiceRow;
    const row = (iconName, label, value, onclick) =>
      el('button.c-setrow', { type: 'button', onclick },
        el('span.c-setrow__icon', { 'aria-hidden': 'true' }, icon(iconName)),
        el('span.c-setrow__label', { text: label }),
        el('span.c-setrow__value', { text: value }),
        el('span.c-setrow__chev', { 'aria-hidden': 'true' }, icon('chevronRight'))
      );

    const list = el('div.c-group.glass', {},
      row('grid', t('settings.topics'), String(activeCats), () => sheet(t('settings.topics'), rankList(index))),
      el('div.c-group__sep.c-group__sep--short'),
      row('timer', t('settings.length'), t('common.min', { n: state.preferredLength }), () => sheet(t('settings.length'), timeTiles(redraw))),
      el('div.c-group__sep.c-group__sep--short'),
      voiceRow = row('voice', t('settings.voice'), '…', () => openVoiceSheet()),
      el('div.c-group__sep.c-group__sep--short'),
      row('globe', t('settings.language'), l === 'de' ? 'Deutsch' : 'English', () => {
        const s = sheet(t('settings.language'), languagePicker(() => { s.close(); window.dispatchEvent(new HashChangeEvent('hashchange')); }));
      })
    );

    const appearance = el('div.c-panel.glass', {},
      el('span.c-panel__title', { text: t('settings.appearance') }),
      segmented({
        label: t('settings.appearance'),
        small: true,
        value: state.theme,
        options: [
          { value: 'auto', label: t('settings.auto') },
          { value: 'light', label: t('settings.light') },
          { value: 'dark', label: t('settings.dark') }
        ],
        onChange: (v) => update((s) => (s.theme = v))
      })
    );

    const danger = el('div.c-group.glass', {},
      el('button.c-setrow.c-setrow--danger', { type: 'button', text: t('settings.reset'), onclick: () => confirmReset() })
    );

    root.replaceChildren(el('div.screen', {},
      el('div', { style: { height: '24px' } }),
      screenHead(null, t('settings.title')),
      list,
      appearance,
      danger,
      el('p.note', { text: t('settings.privacy') }),
      el('p.note', { style: { marginTop: '-12px' }, text: t('settings.version', { v: index.updatedAt }) })
    ));
    // Stimme nachträglich eintragen (Stimmen laden auf manchen Geräten verzögert)
    const voice = ttsSupported ? await pickVoice(l, state.tts.voiceURI[l]) : null;
    voiceRow.querySelector('.c-setrow__value').textContent = voice ? shortName(voice.name) : '–';
  };

  const redraw = () => draw();
  const sheet = (title, content) => openSheet({ title, content, onClose: redraw });

  async function openVoiceSheet() {
    const state = getState();
    const l = lang();
    const voices = await voicesFor(l);
    const current = await pickVoice(l, state.tts.voiceURI[l]);
    const content = el('div', { style: { display: 'flex', flexDirection: 'column', gap: '18px' } },
      el('div.c-panel', { style: { padding: '0' } },
        el('span.c-panel__title', { text: t('settings.rate') }),
        segmented({
          label: t('settings.rate'),
          value: state.tts.rate,
          options: RATES.map((r) => ({ value: r, label: `${formatNumber(r)}×` })),
          onChange: (r) => update((s) => (s.tts.rate = r))
        })
      ),
      voices.length
        ? optionList({
            label: t('settings.voice'),
            value: current?.voiceURI,
            options: voices.map((v) => ({ value: v.voiceURI, label: shortName(v.name) })),
            onChange: (uri) => {
              update((s) => (s.tts.voiceURI[l] = uri));
              preview(voices.find((v) => v.voiceURI === uri));
            }
          })
        : el('p.c-sheet__text', { text: t(ttsSupported ? 'player.noVoice' : 'player.unsupported') }),
      voices.length || ttsSupported
        ? el('button.c-button.c-button--tinted', {
            type: 'button',
            text: t('settings.voiceTest'),
            onclick: async () => preview(await pickVoice(l, getState().tts.voiceURI[l]))
          })
        : null,
      el('p.c-sheet__text', { text: t('settings.voiceHint') })
    );
    sheet(t('settings.voice'), content);
  }

  function preview(voice) {
    if (!ttsSupported) return;
    primeAudioSession();
    if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t('settings.voiceSample'));
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang;
    } else {
      u.lang = lang() === 'de' ? 'de-DE' : 'en-GB';
    }
    u.rate = getState().tts.rate;
    speechSynthesis.speak(u);
  }

  function confirmReset() {
    const content = el('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
      el('p.c-sheet__text', { text: t('settings.resetText') }),
      el('button.c-button', {
        type: 'button',
        text: t('settings.resetConfirm'),
        onclick: () => {
          reset();
          location.hash = '#/onboarding/1';
          location.reload();
        }
      })
    );
    openSheet({ title: t('settings.reset'), content });
  }

  draw();
}

function shortName(name) {
  return name.replace(/^(Microsoft|Google)\s+/i, '').replace(/\s*\(.*\)\s*$/, '').replace(/\s+Online.*$/i, '').split(' - ')[0];
}
