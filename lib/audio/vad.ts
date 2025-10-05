type VadStateChangeCallback = (isActive: boolean) => void;

export class SimpleVAD {
  private audioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: any = null;
  private rafId: number = 0;
  private onVadStateChange: VadStateChangeCallback;
  private energyThreshold: number;
  private speechDuration: number;
  private silenceDuration: number;

  private isSpeaking: boolean = false;
  private speechStartTime: number = 0;
  private silenceStartTime: number = 0;

  constructor(onVadStateChange: VadStateChangeCallback, options?: any) {
    this.onVadStateChange = onVadStateChange;
    this.energyThreshold = options?.energyThreshold || 55; // 0-255
    this.speechDuration = options?.speechDuration || 200; // ms
    this.silenceDuration = options?.silenceDuration || 300; // ms
  }

  async start(stream: MediaStream) {
    this.stream = stream;
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.source = this.audioContext.createMediaStreamSource(stream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 512;
    this.source.connect(this.analyser);
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    if (this.rafId === 0) {
      this.monitor();
    }
  }

  private monitor = () => {
    if (!this.analyser || !this.dataArray) return;

    this.analyser.getByteFrequencyData(this.dataArray);
    const energy = this.dataArray.reduce((sum: number, val: number) => sum + val, 0) / this.dataArray.length;

    if (energy > this.energyThreshold) {
      this.silenceStartTime = 0;
      if (this.speechStartTime === 0) {
        this.speechStartTime = performance.now();
      }
      if (!this.isSpeaking && performance.now() - this.speechStartTime > this.speechDuration) {
        this.isSpeaking = true;
        this.onVadStateChange(true);
      }
    } else {
      this.speechStartTime = 0;
      if (this.silenceStartTime === 0) {
        this.silenceStartTime = performance.now();
      }
      if (this.isSpeaking && performance.now() - this.silenceStartTime > this.silenceDuration) {
        this.isSpeaking = false;
        this.onVadStateChange(false);
      }
    }

    this.rafId = requestAnimationFrame(this.monitor);
  };

  stop() {
    if (this.rafId !== 0) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
      if (this.isSpeaking) {
        this.isSpeaking = false;
        this.onVadStateChange(false);
      }
      this.source?.disconnect();
      this.audioContext?.close();
      this.stream?.getTracks().forEach(track => track.stop());
      this.audioContext = null;
      this.stream = null;
      this.source = null;
      this.analyser = null;
      this.dataArray = null;
    }
  }
}