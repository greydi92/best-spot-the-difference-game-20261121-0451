// Twin Glance — Spot the Difference: shared constants and level definitions.
// One file, one job: every number the rest of the game agrees on lives here.

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 800;

// The two picture panels. Both are the same size; the left one is the
// reference, the right one hides the differences.
export const PANEL = {
  width: 556,
  height: 470,
  leftX: 24,
  rightX: 700,
  topY: 148,
};

export const HUD = {
  top: 0,
  height: 132,
  barY: 108,
  barHeight: 14,
};

// Scoring values. A find is always worth points; a streak makes each
// next find worth more; finishing a level banks the time that is left
// plus a bonus for every hint still unused.
export const SCORE = {
  find: 100,
  streakStep: 25,
  timePerSecond: 10,
  hintLeft: 25,
  wrongClickPenaltySeconds: 5,
};

export const HINTS_PER_LEVEL = 3;
export const HINT_PULSE_MS = 2200;

// Levels in play order. Later levels hide more differences and give
// less time, so the hunt gets harder as you go.
export const LEVELS = [
  {
    id: 0,
    key: 'garden',
    name: 'Sunny Garden',
    subtitle: 'A quiet morning among the flowers',
    timeLimitSeconds: 180,
    parSeconds: 120,
  },
  {
    id: 1,
    key: 'harbour',
    name: 'Harbour at Dusk',
    subtitle: 'Lanterns, boats and the last light',
    timeLimitSeconds: 150,
    parSeconds: 100,
  },
  {
    id: 2,
    key: 'nook',
    name: 'The Book Nook',
    subtitle: 'Tea, lamplight and a sleepy cat',
    timeLimitSeconds: 120,
    parSeconds: 80,
  },
];

export const BEST_SCORE_KEY = 'twinGlanceBestScore';
export const MUTED_KEY = 'twinGlanceMuted';

// Colours shared by the HUD and the markers so the frame reads as one game.
export const COLORS = {
  page: '#1d2733',
  panelFrame: '#f4ead8',
  panelShadow: 'rgba(0, 0, 0, 0.45)',
  foundRing: '#37d67a',
  foundFill: 'rgba(55, 214, 122, 0.22)',
  hintRing: '#ffd23f',
  wrongFlash: 'rgba(255, 77, 79, 0.35)',
  hudText: '#fdf6e3',
  hudMuted: '#b8c4c9',
  accent: '#ffb454',
  timerGood: '#4ade80',
  timerLow: '#ff5d5d',
  button: '#2e4256',
  buttonHover: '#3d5a74',
  buttonText: '#fdf6e3',
};

export function levelById(id) {
  return LEVELS.find((level) => level.id === id) ?? LEVELS[0];
}

export function formatTime(totalSeconds) {
  const clamped = Math.max(0, Math.ceil(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
