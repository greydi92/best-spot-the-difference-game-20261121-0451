// Twin Glance — Spot the Difference: mouse and keyboard input.
// One file, one job: turn a click or a keypress into a game action.
// It knows the geometry of the panels and the buttons; the rules of
// what an action does live in game.js.

import { PANEL, CANVAS_WIDTH, CANVAS_HEIGHT } from './config.js';
import { BUTTONS } from './render.js';
import {
  PHASES,
  clickAt,
  useHint,
  pauseGame,
  resumeGame,
  startGame,
  startLevel,
  advanceLevel,
  quitToTitle,
  toggleMute,
} from './game.js';

function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

export function buttonAt(x, y) {
  if (pointInRect(x, y, BUTTONS.hint)) return 'hint';
  if (pointInRect(x, y, BUTTONS.pause)) return 'pause';
  if (pointInRect(x, y, BUTTONS.mute)) return 'mute';
  return null;
}

// Map a canvas click to panel coordinates, or null when it missed both
// pictures. Either panel counts: a difference can be tapped on either side.
export function panelPoint(x, y) {
  if (y < PANEL.topY + 8 || y > PANEL.topY + PANEL.height - 8) return null;
  const localY = y - PANEL.topY - 8;
  if (x >= PANEL.leftX + 8 && x <= PANEL.leftX + PANEL.width - 8) {
    return { x: x - PANEL.leftX - 8, y: localY };
  }
  if (x >= PANEL.rightX + 8 && x <= PANEL.rightX + PANEL.width - 8) {
    return { x: x - PANEL.rightX - 8, y: localY };
  }
  return null;
}

// The start button on the title screen, and the big action button on
// the end screens, all sit in the same place: a centred card button.
function bigButtonHit(x, y, cardY, buttonTopOffset) {
  const bx = CANVAS_WIDTH / 2 - 150;
  const by = cardY + buttonTopOffset;
  return x >= bx && x <= bx + 300 && y >= by && y <= by + 56;
}

export function handleClick(game, audio, x, y) {
  const button = buttonAt(x, y);
  if (button === 'mute') {
    toggleMute(game);
    return;
  }
  if (button === 'hint') {
    const target = useHint(game);
    if (target) audio.playHint();
    return;
  }
  if (button === 'pause') {
    if (game.phase === PHASES.PLAYING) pauseGame(game);
    else if (game.phase === PHASES.PAUSED) resumeGame(game);
    return;
  }

  switch (game.phase) {
    case PHASES.TITLE: {
      // The title card's start button, or anywhere else on the card.
      if (y > 140 && y < 660) {
        audio.unlock();
        audio.playClick();
        startGame(game);
      }
      break;
    }
    case PHASES.PLAYING: {
      const point = panelPoint(x, y);
      if (!point) return;
      const result = clickAt(game, point.x, point.y);
      if (result === 'found') audio.playFind(game.streak);
      else if (result === 'wrong') audio.playWrong();
      break;
    }
    case PHASES.PAUSED:
      resumeGame(game);
      break;
    case PHASES.LEVEL_CLEAR:
      audio.playClick();
      advanceLevel(game);
      break;
    case PHASES.GAME_OVER:
      audio.playClick();
      startLevel(game, game.levelIndex);
      break;
    case PHASES.VICTORY:
      audio.playClick();
      startGame(game);
      break;
    default:
      break;
  }
}

export function handleKey(game, audio, key) {
  const lower = key.toLowerCase();
  if (lower === 'm') {
    toggleMute(game);
    return;
  }
  if (lower === 'h') {
    const target = useHint(game);
    if (target) audio.playHint();
    return;
  }
  if (lower === 'p' || key === 'Escape') {
    if (game.phase === PHASES.PLAYING) pauseGame(game);
    else if (game.phase === PHASES.PAUSED) resumeGame(game);
    return;
  }
  if (lower === 'r') {
    if (
      game.phase === PHASES.PLAYING ||
      game.phase === PHASES.PAUSED ||
      game.phase === PHASES.GAME_OVER
    ) {
      startLevel(game, game.levelIndex);
    }
    return;
  }
  if (lower === 'q') {
    if (
      game.phase === PHASES.PAUSED ||
      game.phase === PHASES.GAME_OVER ||
      game.phase === PHASES.VICTORY
    ) {
      quitToTitle(game);
    }
    return;
  }
  if (key === 'Enter' || key === ' ') {
    if (game.phase === PHASES.TITLE) {
      audio.unlock();
      audio.playClick();
      startGame(game);
    } else if (game.phase === PHASES.LEVEL_CLEAR) {
      advanceLevel(game);
    } else if (game.phase === PHASES.VICTORY) {
      startGame(game);
    } else if (game.phase === PHASES.GAME_OVER) {
      startLevel(game, game.levelIndex);
    } else if (game.phase === PHASES.PAUSED) {
      resumeGame(game);
    }
    return;
  }
  // 1, 2 and 3 jump straight to a level (and restart the run's score).
  if (key === '1' || key === '2' || key === '3') {
    const index = Number(key) - 1;
    if (game.phase !== PHASES.PLAYING || game.levelIndex !== index) {
      game.score = 0;
      game.totalFound = 0;
      startLevel(game, index);
    }
  }
}

export function canvasPoint(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = CANVAS_WIDTH / rect.width;
  const scaleY = CANVAS_HEIGHT / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}
