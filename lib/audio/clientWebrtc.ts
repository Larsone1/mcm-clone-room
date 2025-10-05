import { useAppStore } from '@/lib/store';

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBRTC_URL || 'ws://localhost:8443/realtime';

export class WebRTCClient {
  private ws: WebSocket | null = null;

  connect(onFallback: () => void) {
    return new Promise<void>((resolve, reject) => {
      this.ws = new WebSocket(WEBSOCKET_URL);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        useAppStore.getState().actions.setConnectionState('connected');
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.visemes) {
            useAppStore.getState().actions.setVisemes(data.visemes);
          }
          if (data.text) {
            useAppStore.getState().actions.setLastSpokenText(data.text);
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        onFallback();
        reject(error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        if (useAppStore.getState().isCallActive) {
            onFallback();
        }
      };
    });
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    }
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
  }
}
