'use client';

import { useEffect, useRef, useState } from 'react';

type Props = { viseme: number; debug?: boolean };

export default function CloneCanvas2D({ viseme, debug }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const [fps, setFps] = useState(0);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    let raf = 0;
    let last = performance.now();
    let frames = 0, acc = 0;

    const W = () => (canvas.width = canvas.clientWidth * devicePixelRatio);
    const H = () => (canvas.height = canvas.clientHeight * devicePixelRatio);
    const resize = () => { W(); H(); };
    resize();
    window.addEventListener('resize', resize);

    // prosta głowa „drutowana”
    const draw = () => {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(w / 2, h / 2 + h * 0.06);
      ctx.scale(devicePixelRatio, devicePixelRatio);

      // kontur
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const rX = (w / devicePixelRatio) * 0.22;
      const rY = (h / devicePixelRatio) * 0.32;
      for (let a = 0; a <= Math.PI * 2; a += 0.05) {
        const x = Math.cos(a) * rX * (1 - 0.1 * Math.abs(Math.sin(a)));
        const y = Math.sin(a) * rY;
        if (a === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      // „siatka” – kilka linii
      ctx.globalAlpha = 0.5;
      for (let i = -4; i <= 4; i++) {
        ctx.beginPath();
        ctx.ellipse(0, 0, rX, rY * Math.cos((i / 8) * Math.PI), 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (let i = -4; i <= 4; i++) {
        ctx.beginPath();
        ctx.moveTo(-rX + (i / 4) * rX * 2, -rY);
        ctx.lineTo(-rX + (i / 4) * rX * 2, rY);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // oczy
      ctx.beginPath();
      ctx.ellipse(-rX * 0.45, -rY * 0.2, rX * 0.15, rY * 0.07, 0, 0, Math.PI * 2);
      ctx.moveTo(rX * 0.45 + rX * 0.15, -rY * 0.2);
      ctx.ellipse(rX * 0.45, -rY * 0.2, rX * 0.15, rY * 0.07, 0, 0, Math.PI * 2);
      ctx.stroke();

      // usta – otwarcie zależne od viseme 0..1
      const open = 2 + 18 * Math.max(0, Math.min(1, viseme));
      ctx.beginPath();
      ctx.moveTo(-rX * 0.35, rY * 0.25);
      ctx.bezierCurveTo(-rX * 0.15, rY * 0.25 + open, rX * 0.15, rY * 0.25 + open, rX * 0.35, rY * 0.25);
      ctx.moveTo(-rX * 0.35, rY * 0.25);
      ctx.bezierCurveTo(-rX * 0.15, rY * 0.25 - open * 0.3, rX * 0.15, rY * 0.25 - open * 0.3, rX * 0.35, rY * 0.25);
      ctx.stroke();

      ctx.restore();

      // FPS
      const now = performance.now();
      const dt = now - last;
      last = now; frames++; acc += dt;
      if (acc > 1000) { setFps(frames); frames = 0; acc = 0; }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [viseme]);

  return (
    <div className="w-full max-w-[720px] aspect-[3/4] bg-black/40 rounded-2xl border border-white/10 p-2">
      <canvas ref={ref} className="w-full h-full rounded-xl" />
      {debug && (
        <div className="absolute mt-2 ml-2 text-xs opacity-60 bg-black/50 px-2 py-1 rounded">
          FPS: {fps}
        </div>
      )}
    </div>
  );
}
