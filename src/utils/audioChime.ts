/**
 * Plays a pleasant Windows 11 style melodic notification chime using Web Audio API.
 * Works 100% offline without external audio files or network requests.
 */
export function playWindowsNotificationChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // A two-tone crisp Windows-style notification chime: F5 (698.46Hz) -> A5 (880Hz)
    const tones = [
      { freq: 698.46, start: 0.0, duration: 0.12 },
      { freq: 880.00, start: 0.10, duration: 0.22 },
      { freq: 1046.50, start: 0.20, duration: 0.35 }
    ];

    tones.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + start);

      // Envelope: fast attack, gentle exponential decay
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.2, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + duration);
    });
  } catch {
    // AudioContext blocked or not supported; fail silently
  }
}
