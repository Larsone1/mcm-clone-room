import { create } from 'zustand';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'fallback';

export interface Metrics {
  ttfp: number | null;
  rtt: number | null;
  fps: number | null;
}

interface AppState {
  isConsented: boolean;
  isCallActive: boolean;
  isMuted: boolean;
  connectionState: ConnectionState;
  visemes: number[];
  metrics: Metrics;
  lastSpokenText: string;
  actions: {
    setConsented: (isConsented: boolean) => void;
    startCall: () => void;
    endCall: () => void;
    toggleMute: () => void;
    setConnectionState: (connectionState: ConnectionState) => void;
    setVisemes: (visemes: number[]) => void;
    updateMetrics: (newMetrics: Partial<Metrics>) => void;
    setLastSpokenText: (text: string) => void;
  };
}

export const useAppStore = create<AppState>((set, get) => ({
  isConsented: false,
  isCallActive: false,
  isMuted: false,
  connectionState: 'disconnected',
  visemes: [],
  metrics: { ttfp: null, rtt: null, fps: null },
  lastSpokenText: '',
  actions: {
    setConsented: (isConsented) => set({ isConsented }),
    startCall: () => set({ isCallActive: true, connectionState: 'connecting' }),
    endCall: () => set({ isCallActive: false, connectionState: 'disconnected', visemes: [], lastSpokenText: '' }),
    toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
    setConnectionState: (connectionState) => set({ connectionState }),
    setVisemes: (visemes) => set({ visemes }),
    updateMetrics: (newMetrics) => set((state) => ({ metrics: { ...state.metrics, ...newMetrics } })),
    setLastSpokenText: (text) => set({ lastSpokenText: text }),
  },
}));
