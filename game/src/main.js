// Twin Glance — Spot the Difference: entry point and game loop.
// One file, one job: boot the canvas, wire input to the game, run the
// frame loop, and play the right sound when the phase changes.
//
// Screenshot staging: ?shot=title | play | harbour | clear
// A shot parameter stages a real render of the game for screenshots —
// the cover shows level 1 mid-hunt with markers on the differences
// already found and several still hiding.

import { CANVAS_WIDTH, CANVAS_HEIGHT } from './config.js';
import {
  createGame,
  startGame,
  startLevel,
  tick,
  PHASES,
} from './game.js';
import { render } from './render.js';
import { handleClick, handleKey, canvasPoint, buttonAt } from './input.js';
import { createAudio } from './audio.js';
import { sceneByKey } from './scenes.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const game = createGame();
const audio = createAudio(game);

let hoveredButton = null;
let lastPhase = game.phase;
let lastTimestamp = 0;

// Stage a screenshot state straight from the URL. The game itself is
// untouched: these are the same code paths a player drives by clicking.
function stageShot(shot) {
  if (!shot) return;
  if (shot === 'title') {
    game.phase = PHASES.TITLE;
    return;
  }
  if (shot === 'play') {
    startGame(game);
    // Mark three differences found, the way real clicks would.
    const ids = ['sun-glasses', 'flower-colour', 'butterfly'];
    ids.forEach((id) => game.found.add(id));
    game.totalFound = ids.length;
    game.score = 325;
    game.streak = 3;
    game.timeLeft = 132;
    return;
  }
  if (shot === 'harbour') {
    startGame(game);
    startLevel(game, 1);
    const ids = ['sail-colour', 'buoy', 'moon-phase', 'extra-gull'];
    ids.forEach((id) => game.found.add(id));
    game.totalFound = ids.length;
    game.score = 700;
    game.streak = 4;
    game.timeLeft = 96;
    return;
  }
  if (shot === 'clear') {
    startGame(game);
    startLevel(game, 0);
    // Finish level 1 by finding everything, then show the clear card.
    const def = sceneByKey('garden');
    def.differences.forEach((diff) => game.found.add(diff.id));
    game.totalFound = def.differences.length;
    game.timeLeft = 88;
    game.timeBonus = 880;
    game.hintBonus = 75;
    game.levelScore = 700 + game.timeBonus + game.hintBonus;
    game.score = game.levelScore;
    game.phase = PHASES.LEVEL_CLEAR;
  }
}

function playPhaseSound(phase) {
  if (phase === PHASES.LEVEL_CLEAR) audio.playClear();
  else if (phase === PHASES.GAME_OVER) audio.playOver();
  else if (phase === PHASES.VICTORY) audio.playVictory();
}

function frame(timestamp) {
  const delta = lastTimestamp === 0 ? 16 : Math.min(100, timestamp - lastTimestamp);
  lastTimestamp = timestamp;
  tick(game, delta);
  if (game.phase !== lastPhase) {
    playPhaseSound(game.phase);
    lastPhase = game.phase;
  }
  render(ctx, game, hoveredButton);
  window.requestAnimationFrame(frame);
}

canvas.addEventListener('click', (event) => {
  const point = canvasPoint(event, canvas);
  handleClick(game, audio, point.x, point.y);
});

canvas.addEventListener('mousemove', (event) => {
  const point = canvasPoint(event, canvas);
  hoveredButton = buttonAt(point.x, point.y);
  canvas.style.cursor = hoveredButton ? 'pointer' : 'default';
});

window.addEventListener('keydown', (event) => {
  if ([' ', 'ArrowUp', 'ArrowDown'].includes(event.key)) event.preventDefault();
  handleKey(game, audio, event.key);
});

const params = new URLSearchParams(window.location.search);
stageShot(params.get('shot'));

// Expose the live state for play-testing in the browser console.
window.twinGlance = { game, audio };

window.requestAnimationFrame(frame);
