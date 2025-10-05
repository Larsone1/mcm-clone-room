type VadStateChangeCallback = (isActive: boolean) => void;

export class SimpleVAD {
  private audioContext: AudioContext;
  private stream: MediaStream;
  private source: MediaStreamAudioSourceNode;
  private analyser: AnalyserNode;
  private dataArray: Uint8Array;
  private rafId: number = 0;
  private onVadStateChange: VadStateChangeCallback;
  private energyThreshold: number;
  private speechDuration: number;
  private silenceDuration: number;

  private isSpeaking: boolean = false;
  private speechStartTime: number = 0;
  private silenceStartTime: number = 0;

  constructor(stream: MediaStream, onVadStateChange: VadStateChangeCallback, options?: any) {
    this.audioContext = new AudioContext();
    this.stream = stream;
    this.onVadStateChange = onVadStateChange;
    this.energyThreshold = options?.energyThreshold || 55; // 0-255
    this.speechDuration = options?.speechDuration || 200; // ms
    this.silenceDuration = options?.silenceDuration || 300; // ms

    this.source = this.audioContext.createMediaStreamSource(stream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 512;
    this.source.connect(this.analyser);
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
  }

  private monitor = () => {
    this.analyser.getByteFrequencyData(this.dataArray);
    const energy = this.dataArray.reduce((sum, val) => sum + val, 0) / this.dataArray.length;

    if (energy > this.energyThreshold) {
      this.silenceStartTime = 0;
      if (this.speechStartTime === 0) {
        this.speechStartTime = Date.now();
      }
      if (!this.isSpeaking && Date.now() - this.speechStartTime > this.speechDuration) {
        this.isSpeaking = true;
        this.onVadStateChange(true);
      }
    } else {
      this.speechStartTime = 0;
      if (this.silenceStartTime === 0) {
        this.silenceStartTime = Date.now();
      }
      if (this.isSpeaking && Date.now() - this.silenceStartTime > this.silenceDuration) {
        this.isSpeaking = false;
        this.onVadStateChange(false);
      }
    }

    this.rafId = requestAnimationFrame(this.monitor);
  };

  start() {
    if (this.rafId === 0) {
      this.monitor();
    }
  }

  stop() {
    if (this.rafId !== 0) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
      if (this.isSpeaking) {
        this.isSpeaking = false;
        this.onVadStateChange(false);
      }
      this.source.disconnect();
      this.audioContext.close();
    }
  }
}
