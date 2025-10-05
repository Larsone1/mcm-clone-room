'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

export default function MetricsToast() {
  const { metrics, connectionState } = useAppStore();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const debug = searchParams.get('debug') === 'true';

  const [showOverlay, setShowOverlay] = useState(debug);

  useEffect(() => {
    setShowOverlay(debug);
  }, [debug]);

  useEffect(() => {
    if (metrics.ttfp !== null && metrics.ttfp > 600) {
      toast({
        title: "Performance Warning",
        description: `Time to First Phoneme (TTFP) is high: ${Math.round(metrics.ttfp)} ms`,
        variant: "destructive",
      });
    }
    if (metrics.fps !== null && metrics.fps < 45) {
      toast({
        title: "Performance Warning",
        description: `Low FPS detected: ${Math.round(metrics.fps)} fps`,
        variant: "destructive",
      });
    }
  }, [metrics.ttfp, metrics.fps, toast]);

  if (!showOverlay) return null;

  return (
    <div className="fixed top-4 right-4 bg-black/70 text-white text-xs p-2 rounded-md z-50">
      <p>Connection: {connectionState}</p>
      <p>TTFP: {metrics.ttfp === null ? '--' : `${Math.round(metrics.ttfp)} ms`}</p>
      <p>FPS: {metrics.fps === null ? '--' : `${Math.round(metrics.fps)}`}</p>
      <p>RTT: {metrics.rtt === null ? '--' : `${Math.round(metrics.rtt)} ms`}</p>
    </div>
  );
}
