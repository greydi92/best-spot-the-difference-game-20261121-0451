// Twin Glance — Spot the Difference: the game rules and state.
// One file, one job: what a click does, what a hint costs, how the
// timer and the score move, and when a level ends. It knows nothing
// about drawing or sound; render.js and audio.js own those.

import { LEVELS, SCORE, HINTS_PER_LEVEL, BEST_SCORE_KEY } from './config.js';
import { sceneByKey } from './scenes.js';

export const PHASES = {
  TITLE: 'title',
  PLAYING: 'playing',
  PAUSED: 'paused',
  LEVEL_CLEAR: 'level-clear',
  GAME_OVER: 'game-over',
  VICTORY: 'victory',
};

export function createGame() {
  return {
    phase: PHASES.TITLE,
    levelIndex: 0,
    found: new Set(),
    score: 0,
    streak: 0,
    bestStreak: 0,
    hintsLeft: HINTS_PER_LEVEL,
    hintTarget: null,
    hintUntil: 0,
    timeLeft: LEVELS[0].timeLimitSeconds,
    levelScore: 0,
    timeBonus: 0,
    hintBonus: 0,
    wrongFlashUntil: 0,
    lastFound: null,
    lastFoundAt: 0,
    totalFound: 0,
    totalDifferences: LEVELS.reduce(
      (sum, level) => sum + sceneByKey(level.key).differences.length,
      0,
    ),
    bestScore: readBestScore(),
    muted: readMuted(),
    now: 0,
  };
}

function readBestScore() {
  try {
    return Number(window.localStorage.getItem(BEST_SCORE_KEY)) || 0;
  } catch {
    return 0;
  }
}

function readMuted() {
  try {
    return window.localStorage.getItem('twinGlanceMuted') === '1';
  } catch {
    return false;
  }
}

export function saveBestScore(game) {
  if (game.score <= game.bestScore) return;
  game.bestScore = game.score;
  try {
    window.localStorage.setItem(BEST_SCORE_KEY, String(game.bestScore));
  } catch {
    // Private mode or blocked storage: the score just does not persist.
  }
}

export function toggleMute(game) {
  game.muted = !game.muted;
  try {
    window.localStorage.setItem('twinGlanceMuted', game.muted ? '1' : '0');
  } catch {
    // See saveBestScore.
  }
  return game.muted;
}

export function startLevel(game, levelIndex) {
  const level = LEVELS[levelIndex];
  game.levelIndex = levelIndex;
  game.found = new Set();
  game.streak = 0;
  game.hintsLeft = HINTS_PER_LEVEL;
  game.hintTarget = null;
  game.hintUntil = 0;
  game.timeLeft = level.timeLimitSeconds;
  game.levelScore = 0;
  game.timeBonus = 0;
  game.hintBonus = 0;
  game.lastFound = null;
  game.phase = PHASES.PLAYING;
}

export function startGame(game) {
  game.score = 0;
  game.totalFound = 0;
  game.bestStreak = 0;
  startLevel(game, 0);
}

export function currentScene(game) {
  return sceneByKey(LEVELS[game.levelIndex].key);
}

export function differencesLeft(game) {
  return currentScene(game).differences.length - game.found.size;
}

// A click lands in panel coordinates (x, y) on either panel. Returns
// 'found', 'wrong' or 'none' (a click outside both pictures).
export function clickAt(game, x, y) {
  if (game.phase !== PHASES.PLAYING) return 'none';
  const scene = currentScene(game);
  let hit = null;
  for (const diff of scene.differences) {
    if (game.found.has(diff.id)) continue;
    const dx = x - diff.x;
    const dy = y - diff.y;
    if (dx * dx + dy * dy <= diff.r * diff.r) {
      hit = diff;
      break;
    }
  }
  if (!hit) {
    game.streak = 0;
    game.timeLeft = Math.max(0, game.timeLeft - SCORE.wrongClickPenaltySeconds);
    game.wrongFlashUntil = game.now + 350;
    return 'wrong';
  }
  game.found.add(hit.id);
  game.totalFound += 1;
  game.streak += 1;
  game.bestStreak = Math.max(game.bestStreak, game.streak);
  const points = SCORE.find + SCORE.streakStep * (game.streak - 1);
  game.score += points;
  game.levelScore += points;
  game.lastFound = hit;
  game.lastFoundAt = game.now;
  if (game.found.size === scene.differences.length) {
    finishLevel(game);
  }
  return 'found';
}

export function finishLevel(game) {
  const level = LEVELS[game.levelIndex];
  game.timeBonus = Math.ceil(game.timeLeft) * SCORE.timePerSecond;
  game.hintBonus = game.hintsLeft * SCORE.hintLeft;
  game.score += game.timeBonus + game.hintBonus;
  game.levelScore += game.timeBonus + game.hintBonus;
  if (game.levelIndex >= LEVELS.length - 1) {
    game.phase = PHASES.VICTORY;
  } else {
    game.phase = PHASES.LEVEL_CLEAR;
  }
  saveBestScore(game);
}

// Spend one hint: a yellow pulse marks a difference still unfound.
// Returns the difference it points at, or null when no hint is left.
export function useHint(game) {
  if (game.phase !== PHASES.PLAYING) return null;
  if (game.hintsLeft <= 0) return null;
  const remaining = currentScene(game).differences.filter(
    (diff) => !game.found.has(diff.id),
  );
  if (remaining.length === 0) return null;
  game.hintsLeft -= 1;
  game.hintTarget = remaining[Math.floor(Math.random() * remaining.length)];
  game.hintUntil = game.now + 2200;
  return game.hintTarget;
}

export function advanceLevel(game) {
  if (game.phase !== PHASES.LEVEL_CLEAR) return;
  startLevel(game, game.levelIndex + 1);
}

export function pauseGame(game) {
  if (game.phase === PHASES.PLAYING) game.phase = PHASES.PAUSED;
}

export function resumeGame(game) {
  if (game.phase === PHASES.PAUSED) game.phase = PHASES.PLAYING;
}

export function quitToTitle(game) {
  game.phase = PHASES.TITLE;
  game.found = new Set();
  game.score = 0;
  game.totalFound = 0;
  game.streak = 0;
  game.hintsLeft = HINTS_PER_LEVEL;
  game.hintTarget = null;
}

// One frame of the clock. Only the playing phase drains the timer.
export function tick(game, deltaMs) {
  game.now += deltaMs;
  if (game.phase !== PHASES.PLAYING) return;
  game.timeLeft -= deltaMs / 1000;
  if (game.timeLeft <= 0) {
    game.timeLeft = 0;
    game.phase = PHASES.GAME_OVER;
    saveBestScore(game);
  }
}
