type SpeakOpts = {
  muted?: boolean;
  lang?: string;
  onViseme?: (v: number) => void;
  onEnd?: () => void;
};

let speaking = false;
let jitterTimer: any = null;

export function speakWithFallback(text: string, opts: SpeakOpts = {}) {
  cancelSpeech();
  speaking = true;

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = opts.lang ?? 'pl-PL';
  utter.volume = opts.muted ? 0 : 1;

  // proste mapowanie na „otwarcie ust” według znaków
  const vowels = 'aeiouyąęóAEIOUYĄĘÓ';
  let firstBoundary = true;

  utter.onboundary = (e: any) => {
    const ch = text.slice(e.charIndex, e.charIndex + (e.charLength || 1));
    const amp = vowels.includes(ch) ? 0.85 : 0.35;
    opts.onViseme?.(amp);
    if (firstBoundary) { firstBoundary = false; }
  };

  utter.onend = () => {
    speaking = false;
    clearInterval(jitterTimer);
    opts.onViseme?.(0);
    opts.onEnd?.();
  };

  // lekki jitter, żeby uniknąć „martwych” momentów
  clearInterval(jitterTimer);
  jitterTimer = setInterval(() => {
    if (!speaking) return;
    opts.onViseme?.(Math.random() * 0.12);
  }, 90);

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

export function cancelSpeech() {
  if (speaking) {
    speaking = false;
    try { window.speechSynthesis.cancel(); } catch {}
  }
  clearInterval(jitterTimer);
  jitterTimer = null;
}