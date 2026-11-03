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

export class Speaker {
  constructor({ onSentence, onState, onEnd }) {
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
    this.wakeLock = null;
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
    const wasBusy = synth.speaking || synth.pending;
    synth.cancel();
    this.playing = true;
    this.onState?.(true);
    this.keepAwake(true);
    // Safari verschluckt manchmal ein speak() direkt nach cancel(); beim ersten Start (Tipp) sofort sprechen
    if (wasBusy) setTimeout(() => this.speak(gen), 80);
    else this.speak(gen);
  }

  speak(gen) {
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
    u.onstart = () => gen === this.generation && this.onSentence?.(this.index);
    u.onend = () => {
      if (gen !== this.generation || !this.playing) return;
      this.index++;
      this.speak(gen);
    };
    u.onerror = (e) => {
      if (gen !== this.generation) return;
      if (e.error === 'interrupted' || e.error === 'canceled') return;
      this.index++;
      this.speak(gen);
    };
    this.onSentence?.(this.index);
    synth.speak(u);
  }

  pause() {
    this.generation++;
    this.playing = false;
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

// iOS erlaubt Sprachausgabe nur nach einem Tipp: einmal leise „entsperren“
export function unlock() {
  if (!synth) return;
  const u = new SpeechSynthesisUtterance(' ');
  u.volume = 0;
  synth.speak(u);
}

// Text in Sätze zerlegen (Artikel enthalten keine Abkürzungen mit Punkt, siehe CONTENT_GUIDE)
export function splitSentences(paragraph) {
  return paragraph
    .split(/(?<=[.!?…])\s+(?=[„"“‚'(A-ZÄÖÜ0-9])/u)
    .map((s) => s.trim())
    .filter(Boolean);
}
