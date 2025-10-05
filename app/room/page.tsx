'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CloneCanvas2D from '@/components/CloneCanvas2D';
import { speakWithFallback, cancelSpeech } from '@/lib/audio/clientWebrtc';

export default function RoomPage() {
  const sp = useSearchParams();
  const debug = sp.get('debug') === 'true' || sp.get('debug') === '1';
  const [text, setText] = useState('Cześć Maciek, tu Twój klon.');
  const [viseme, setViseme] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [ttfp, setTtfp] = useState<number | null>(null);
  const tStart = useRef<number | null>(null);
  const firstPh = useRef(false);

  const onSpeak = () => {
    if (!text.trim()) return;
    setTtfp(null);
    tStart.current = performance.now();
    firstPh.current = false;
    setSpeaking(true);
    speakWithFallback(text, {
      muted,
      lang: 'pl-PL',
      onViseme: (v) => {
        // pierwszy „fonem” → policz TTFP
        if (!firstPh.current) {
          firstPh.current = true;
          if (tStart.current != null) setTtfp(performance.now() - tStart.current);
        }
        setViseme(v);
      },
      onEnd: () => {
        setSpeaking(false);
        setViseme(0);
      },
    });
  };

  useEffect(() => () => cancelSpeech(), []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
        <div className="font-semibold tracking-wide">MeCloneMe</div>
        <div className="opacity-60 text-sm">Clone Room · 2D</div>
        {debug && (
          <div className="ml-auto text-xs opacity-70">
            TTFP: {ttfp == null ? '—' : `${Math.round(ttfp)} ms`} · Speaking: {speaking ? 'yes' : 'no'}
          </div>
        )}
      </header>

      <main className="flex-1 grid place-items-center p-4">
        <CloneCanvas2D viseme={viseme} debug={debug} />
      </main>

      <footer className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 outline-none"
            placeholder="Napisz coś do wypowiedzenia… (Enter = wyślij)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onSpeak(); }} 
          />
          <button
            onClick={() => setMuted((m) => !m)}
            className={`px-3 py-2 rounded-xl border ${muted ? 'border-red-400 text-red-300' : 'border-white/10'}`}
            title="Mute TTS"
          >
            {muted ? 'Muted' : 'Unmute'}
          </button>
          <button
            onClick={onSpeak}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10"
          >
            {speaking ? 'Mówię…' : 'Powiedz'}
          </button>
          <button
            onClick={() => { cancelSpeech(); setSpeaking(false); setViseme(0); }} 
            className="px-4 py-2 rounded-xl border border-white/10"
          >
            Stop
          </button>
        </div>
        <div className="mt-2 text-xs opacity-60">
          Debug: dopisz <code>?debug=true</code> do URL. Fallback TTS (Web Speech) – nie wymaga backendu.
        </div>
      </footer>
    </div>
  );
}
