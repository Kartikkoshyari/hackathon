// Zero-dependency native Web Audio API cyber synthesizer for tactile feedback

class SoundFXEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Crisp mechanical tactile click (like a high-end key switch)
  public click() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.035);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.035);
    } catch {
      // Audio safety fallback
    }
  }

  // Soft cyber scan sweep
  public scan() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {}
  }

  // Crystalline shatter harmonic resonance
  public shatter() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const freqs = [1046.5, 1318.5, 1567.98, 2093.0];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.03);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx!.currentTime + 0.35 + idx * 0.03);

        gain.gain.setValueAtTime(0.04, this.ctx!.currentTime + idx * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + 0.4 + idx * 0.03);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(this.ctx!.currentTime + idx * 0.03);
        osc.stop(this.ctx!.currentTime + 0.45 + idx * 0.03);
      });
    } catch {}
  }

  // Success / Clean verdict chime
  public success() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
      osc2.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.08); // E5

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc1.stop(this.ctx.currentTime + 0.2);
      osc2.start(this.ctx.currentTime + 0.08);
      osc2.stop(this.ctx.currentTime + 0.25);
    } catch {}
  }

  // Warning / Critical threat alert tone
  public threatAlert() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.setValueAtTime(180, this.ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch {}
  }

  // Dramatic Red Burst for SCAM / Threat Verdict
  // Sub-bass impact + descending threat sirens + glass fracture burst
  public scamThreatBurst() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // 1. Sub-bass breach impact thump
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(140, now);
      subOsc.frequency.exponentialRampToValueAtTime(38, now + 0.45);
      subGain.gain.setValueAtTime(0.12, now);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.45);

      // 2. Dissonant threat alarm buzz (tritone intervals for menace)
      const tones = [311.13, 440.0, 622.25]; // Eb4, A4, Eb5
      tones.forEach((f, idx) => {
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now + idx * 0.04);
        osc.frequency.exponentialRampToValueAtTime(f * 0.75, now + 0.35 + idx * 0.04);
        g.gain.setValueAtTime(0.035, now + idx * 0.04);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.4 + idx * 0.04);
        osc.connect(g);
        g.connect(this.ctx!.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + 0.45 + idx * 0.04);
      });

      // 3. High-frequency crimson crystal shard burst
      const shardPings = [1864.66, 2489.02, 3322.44, 4186.01];
      shardPings.forEach((freq, idx) => {
        const pingOsc = this.ctx!.createOscillator();
        const pingGain = this.ctx!.createGain();
        pingOsc.type = 'square';
        pingOsc.frequency.setValueAtTime(freq, now + 0.05 + idx * 0.035);
        pingOsc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + 0.28 + idx * 0.035);
        pingGain.gain.setValueAtTime(0.025, now + 0.05 + idx * 0.035);
        pingGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3 + idx * 0.035);
        pingOsc.connect(pingGain);
        pingGain.connect(this.ctx!.destination);
        pingOsc.start(now + 0.05 + idx * 0.035);
        pingOsc.stop(now + 0.32 + idx * 0.035);
      });
    } catch {}
  }

  // Radiant Green Burst for LEGIT / Verified Safe Verdict
  // Harmonious ascending crystalline major triad with protective shield bloom
  public legitShieldBurst() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // 1. Warm harmonic bass root
      const rootOsc = this.ctx.createOscillator();
      const rootGain = this.ctx.createGain();
      rootOsc.type = 'sine';
      rootOsc.frequency.setValueAtTime(261.63, now); // C4
      rootGain.gain.setValueAtTime(0.06, now);
      rootGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      rootOsc.connect(rootGain);
      rootGain.connect(this.ctx.destination);
      rootOsc.start(now);
      rootOsc.stop(now + 0.6);

      // 2. Ascending pure crystal chord: C5 -> E5 -> G5 -> C6
      const chord = [523.25, 659.25, 783.99, 1046.5];
      chord.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.055);

        g.gain.setValueAtTime(0.045, now + idx * 0.055);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.55 + idx * 0.055);

        osc.connect(g);
        g.connect(this.ctx!.destination);

        osc.start(now + idx * 0.055);
        osc.stop(now + 0.65 + idx * 0.055);
      });

      // 3. Shimmering high protective resonance
      const shimmer = this.ctx.createOscillator();
      const shimmerGain = this.ctx.createGain();
      shimmer.type = 'triangle';
      shimmer.frequency.setValueAtTime(2093.0, now + 0.18); // C7
      shimmerGain.gain.setValueAtTime(0.03, now + 0.18);
      shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
      shimmer.connect(shimmerGain);
      shimmerGain.connect(this.ctx.destination);
      shimmer.start(now + 0.18);
      shimmer.stop(now + 0.7);
    } catch {}
  }

  // Amber Caution Pulse for Suspicious / Inconclusive Results
  public warningBurst() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const pings = [440, 554.37]; // A4, C#5
      pings.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        g.gain.setValueAtTime(0.04, now + idx * 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.35 + idx * 0.1);
        osc.connect(g);
        g.connect(this.ctx!.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + 0.35 + idx * 0.1);
      });
    } catch {}
  }

  // Rising charging tone when scanning begins
  public shieldCharge() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.32);

      gain.gain.setValueAtTime(0.015, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }
}

export const soundFX = new SoundFXEngine();
