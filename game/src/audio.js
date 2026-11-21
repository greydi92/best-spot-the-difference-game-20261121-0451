// Twin Glance — Spot the Difference: synthesized sound.
// One file, one job: every sound the game makes, built from the
// Web Audio API with no audio files. A find is a bright two-note
// chirp that rises with the streak; a miss is a low buzz; clearing
// a level is a little arpeggio.

export function createAudio(game) {
  let context = null;

  function ensureContext() {
    if (context) return context;
    try {
      const AudioContext = window.AudioContext ?? window.webkitAudioContext;
      if (!AudioContext) return null;
      context = new AudioContext();
    } catch {
      context = null;
    }
    return context;
  }

  function tone(freq, startAt, duration, type, volume) {
    const ctx = ensureContext();
    if (!ctx || game.muted) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startAt);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime + startAt);
    gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + startAt + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + startAt);
    osc.stop(ctx.currentTime + startAt + duration + 0.05);
  }

  return {
    // Call from a user gesture so the browser lets audio start.
    unlock() {
      const ctx = ensureContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    },

    playClick() {
      tone(660, 0, 0.07, 'sine', 0.12);
    },

    // The find chirp climbs a little with each streak step.
    playFind(streak) {
      const lift = Math.min(streak, 8) * 24;
      tone(740 + lift, 0, 0.12, 'sine', 0.2);
      tone(1108 + lift, 0.09, 0.16, 'sine', 0.18);
    },

    playWrong() {
      tone(150, 0, 0.22, 'sawtooth', 0.1);
      tone(110, 0.05, 0.22, 'sawtooth', 0.08);
    },

    playHint() {
      tone(520, 0, 0.1, 'triangle', 0.14);
      tone(780, 0.09, 0.14, 'triangle', 0.14);
    },

    playClear() {
      [523, 659, 784, 1047].forEach((freq, i) => tone(freq, i * 0.11, 0.22, 'sine', 0.18));
    },

    playOver() {
      [392, 330, 262].forEach((freq, i) => tone(freq, i * 0.16, 0.26, 'triangle', 0.15));
    },

    playVictory() {
      [523, 659, 784, 1047, 1319].forEach((freq, i) => tone(freq, i * 0.12, 0.3, 'sine', 0.18));
    },
  };
}
