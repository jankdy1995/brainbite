// Sprachausgabe mit der Gerätestimme: Satz für Satz als Warteschlange.
// Umgeht den Chrome-Abbruch bei langen Texten und erlaubt die Satz-Hervorhebung.
const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;

export const supported = Boolean(synth);

let voicesReady = null;

export function getVoices() {
  if (!synth) return Promise.resolve([]);
  if (!voicesReady) {
    voicesReady = new Promise((resolve) => {
      const list = synth.getVoices();
      if (list.length) return resolve(list);
      const done = () => resolve(synth.getVoices());
      synth.addEventListener('voiceschanged', done, { once: true });
      setTimeout(done, 1500);
    });
  }
  return voicesReady;
}

export async function voicesFor(lang) {
  const all = await getVoices();
  return all.filter((v) => v.lang.toLowerCase().startsWith(lang));
}

// Beste Stimme: gespeicherte → hochwertige lokale → irgendeine der Sprache
export async function pickVoice(lang, voiceURI) {
  const list = await voicesFor(lang);
  if (!list.length) return null;
  const saved = list.find((v) => v.voiceURI === voiceURI);
  if (saved) return saved;
  const score = (v) =>
    (/premium|enhanced|neural|natural/i.test(v.name) ? 4 : 0) +
    (v.localService ? 2 : 0) +
    (v.default ? 1 : 0) +
    (/^(de-de|en-gb|en-us)$/i.test(v.lang.replace('_', '-')) ? 1 : 0);
  return [...list].sort((a, b) => score(b) - score(a))[0];
}

// iPhone: Ein kurzer, stummer Ton schaltet die Audio-Sitzung auf „Wiedergabe“.
// Damit wird die Stimme auch bei aktivem Stummschalter hörbar (muss im Tipp passieren).
let primed = false;
export function primeAudioSession() {
  if (primed) return;
  primed = true;
  try {
    const rate = 8000;
    const samples = rate / 4;
    const bytes = new Uint8Array(44 + samples);
    const view = new DataView(bytes.buffer);
    const text = (o, str) => [...str].forEach((c, i) => (bytes[o + i] = c.charCodeAt(0)));
    text(0, 'RIFF'); view.setUint32(4, 36 + samples, true); text(8, 'WAVE'); text(12, 'fmt ');
    view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
    view.setUint32(24, rate, true); view.setUint32(28, rate, true); view.setUint16(32, 1, true);
    view.setUint16(34, 8, true); text(36, 'data'); view.setUint32(40, samples, true);
    bytes.fill(128, 44);
    const audio = new Audio(URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' })));
    audio.setAttribute('playsinline', '');
    audio.play().catch(() => {});
  } catch {
    // ohne diesen Trick geht es auch, nur ggf. nicht im Stummmodus
  }
}

export class Speaker {
  constructor({ onSentence, onState, onEnd, onFail }) {
    this.sentences = [];
    this.index = 0;
    this.playing = false;
    this.generation = 0;
    this.voice = null;
    this.lang = 'de';
    this.rate = 1;
    this.onSentence = onSentence;
    this.onState = onState;
    this.onEnd = onEnd;
    this.onFail = onFail;
    this.wakeLock = null;
    this.current = null;
    this.watchdog = null;
    this.everStarted = false;
  }

  async setup({ sentences, lang, rate, voiceURI }) {
    this.sentences = sentences;
    this.lang = lang;
    this.rate = rate;
    this.voice = await pickVoice(lang, voiceURI);
  }

  play(from = this.index) {
    if (!synth || !this.sentences.length) return;
    this.index = Math.max(0, Math.min(from, this.sentences.length - 1));
    this.generation++;
    const gen = this.generation;
    const wasPlaying = this.playing;
    // Nur abbrechen, wenn wirklich etwas läuft: Safari verwirft sonst oft das nächste speak()
    if (synth.speaking || synth.pending) synth.cancel();
    if (synth.paused) synth.resume();
    primeAudioSession();
    this.playing = true;
    this.onState?.(true);
    this.keepAwake(true);
    // Erster Start passiert im Tipp (iOS-Vorgabe) → sofort sprechen; Sprünge kurz verzögern
    if (wasPlaying) setTimeout(() => this.speak(gen), 60);
    else this.speak(gen);
  }

  speak(gen, retry = false) {
    if (gen !== this.generation || !this.playing) return;
    const sentence = this.sentences[this.index];
    if (!sentence) {
      this.stop();
      this.onEnd?.();
      return;
    }
    const u = new SpeechSynthesisUtterance(sentence.text);
    u.lang = this.voice?.lang || (this.lang === 'de' ? 'de-DE' : 'en-GB');
    if (this.voice) u.voice = this.voice;
    u.rate = this.rate;
    let started = false;
    u.onstart = () => {
      started = true;
      this.everStarted = true;
      if (gen === this.generation) this.onSentence?.(this.index);
    };
    u.onend = () => {
      started = true;
      if (gen !== this.generation || !this.playing || this.current !== u) return;
      this.index++;
      this.speak(gen);
    };
    u.onerror = (e) => {
      started = true;
      if (gen !== this.generation || this.current !== u) return;
      if (e.error === 'interrupted' || e.error === 'canceled') return;
      if (e.error === 'not-allowed') {
        this.pause();
        this.onFail?.('not-allowed');
        return;
      }
      this.index++;
      this.speak(gen);
    };
    // Referenz halten, sonst feuert onend in manchen Browsern nie (Garbage Collection)
    this.current = u;
    this.onSentence?.(this.index);
    synth.speak(u);

    // Wächter: Startet die Stimme nicht, einmal neu versuchen, danach freundlich abbrechen
    clearTimeout(this.watchdog);
    this.watchdog = setTimeout(() => {
      if (started || gen !== this.generation || !this.playing || this.current !== u) return;
      if (synth.speaking && !synth.paused) return;
      if (!retry) {
        if (synth.speaking || synth.pending) synth.cancel();
        synth.resume?.();
        this.speak(gen, true);
      } else {
        this.pause();
        this.onFail?.('timeout');
      }
    }, retry ? 2500 : 1800);
  }

  pause() {
    this.generation++;
    this.playing = false;
    clearTimeout(this.watchdog);
    this.current = null;
    synth?.cancel();
    this.onState?.(false);
    this.keepAwake(false);
  }

  stop() {
    this.pause();
  }

  toggle() {
    if (this.playing) this.pause();
    else this.play(this.index);
  }

  jump(index) {
    this.index = index;
    if (this.playing) this.play(index);
    else this.onSentence?.(index);
  }

  setRate(rate) {
    this.rate = rate;
    if (this.playing) this.play(this.index);
  }

  // Bildschirm wach halten, damit die Ausgabe nicht beim Sperren endet (wo unterstützt)
  async keepAwake(on) {
    try {
      if (on && 'wakeLock' in navigator && !this.wakeLock) {
        this.wakeLock = await navigator.wakeLock.request('screen');
        this.wakeLock.addEventListener('release', () => (this.wakeLock = null));
      } else if (!on && this.wakeLock) {
        await this.wakeLock.release();
        this.wakeLock = null;
      }
    } catch {
      this.wakeLock = null;
    }
  }
}

// iOS erlaubt Sprachausgabe nur nach einem Tipp. Darum beim Tipp auf „Anhören“ im Feed
// sofort den Titel sprechen; der Artikel liest danach nahtlos weiter.
export function unlock(text, lang) {
  if (!synth || !text) return;
  primeAudioSession();
  if (synth.speaking || synth.pending) synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang === 'de' ? 'de-DE' : 'en-GB';
  unlockUtterance = u;
  synth.speak(u);
}
let unlockUtterance = null;

// Läuft gerade noch der Titel aus dem Feed? Dann wartet der Artikel kurz darauf.
export function isSpeaking() {
  return Boolean(synth && (synth.speaking || synth.pending));
}

// Text in Sätze zerlegen (Artikel enthalten keine Abkürzungen mit Punkt, siehe CONTENT_GUIDE)
export function splitSentences(paragraph) {
  return paragraph
    .split(/(?<=[.!?…])\s+(?=[„"“‚'(A-ZÄÖÜ0-9])/u)
    .map((s) => s.trim())
    .filter(Boolean);
}
