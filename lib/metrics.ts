import { useAppStore } from '@/lib/store';

let frameCount = 0;
let lastTime = performance.now();
let rafId: number;

const track = () => {
  frameCount++;
  const now = performance.now();
  if (now - lastTime >= 1000) {
    useAppStore.getState().actions.updateMetrics({ fps: frameCount });
    frameCount = 0;
    lastTime = now;
  }
  rafId = requestAnimationFrame(track);
};

export const startFpsTracker = () => {
  if (rafId) return;
  lastTime = performance.now();
  frameCount = 0;
  rafId = requestAnimationFrame(track);
};

export const stopFpsTracker = () => {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }
};

let ttfpStart = 0;
export const recordTtfpStart = () => {
  ttfpStart = performance.now();
};

export const recordTtfpEnd = () => {
  if (ttfpStart > 0) {
    const ttfp = performance.now() - ttfpStart;
    useAppStore.getState().actions.updateMetrics({ ttfp });
    ttfpStart = 0;
  }
};
