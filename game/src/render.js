// Twin Glance — Spot the Difference: everything the player sees.
// One file, one job: given the game state, paint the frame — the HUD,
// both picture panels with their found markers and hint pulse, and the
// title, pause, level-clear, game-over and victory screens.

import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PANEL,
  HUD,
  COLORS,
  LEVELS,
  formatTime,
} from './config.js';
import { PHASES, currentScene, differencesLeft } from './game.js';

export const BUTTONS = {
  hint: { x: 1080, y: 56, w: 84, h: 40, label: 'Hint (H)' },
  pause: { x: 1172, y: 56, w: 84, h: 40, label: 'Pause (P)' },
  mute: { x: 1080, y: 8, w: 176, h: 30, label: 'Sound: On' },
};

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawButton(ctx, button, hovered) {
  ctx.fillStyle = hovered ? COLORS.buttonHover : COLORS.button;
  roundRect(ctx, button.x, button.y, button.w, button.h, 9);
  ctx.fill();
  ctx.strokeStyle = 'rgba(253, 246, 227, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = COLORS.buttonText;
  ctx.font = '600 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(button.label, button.x + button.w / 2, button.y + button.h / 2 + 1);
}

function drawPanelFrame(ctx, x) {
  ctx.fillStyle = COLORS.panelShadow;
  roundRect(ctx, x + 5, PANEL.topY + 6, PANEL.width, PANEL.height, 14);
  ctx.fill();
  ctx.fillStyle = COLORS.panelFrame;
  roundRect(ctx, x, PANEL.topY, PANEL.width, PANEL.height, 14);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, x + 8, PANEL.topY + 8, PANEL.width - 16, PANEL.height - 16, 8);
  ctx.fill();
}

function drawFoundMarker(ctx, panelX, diff, now, foundAt) {
  const age = now - foundAt;
  const pop = age < 220 ? 1 + (1 - age / 220) * 0.35 : 1;
  const cx = panelX + 8 + diff.x;
  const cy = PANEL.topY + 8 + diff.y;
  const r = diff.r * pop;
  ctx.strokeStyle = COLORS.foundRing;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = COLORS.foundFill;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  // A small tick in the middle of the ring.
  ctx.strokeStyle = COLORS.foundRing;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.42, cy);
  ctx.lineTo(cx - r * 0.1, cy + r * 0.36);
  ctx.lineTo(cx + r * 0.48, cy - r * 0.34);
  ctx.stroke();
  ctx.lineCap = 'butt';
}

function drawHintPulse(ctx, panelX, diff, now, until) {
  const remaining = until - now;
  if (remaining <= 0) return;
  const pulse = 0.55 + 0.45 * Math.sin((now / 160) * Math.PI);
  const cx = panelX + 8 + diff.x;
  const cy = PANEL.topY + 8 + diff.y;
  ctx.strokeStyle = `rgba(255, 210, 63, ${pulse.toFixed(2)})`;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, cy, diff.r + 6 + (1 - pulse) * 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = `rgba(255, 210, 63, ${(pulse * 0.18).toFixed(2)})`;
  ctx.beginPath();
  ctx.arc(cx, cy, diff.r + 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawHud(ctx, game, hoveredButton) {
  const level = LEVELS[game.levelIndex];
  const scene = currentScene(game);
  const total = scene.differences.length;
  const found = game.found.size;

  ctx.fillStyle = COLORS.page;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = COLORS.accent;
  ctx.font = '800 34px system-ui, sans-serif';
  ctx.fillText('Twin Glance', 24, 44);
  ctx.fillStyle = COLORS.hudText;
  ctx.font = '600 17px system-ui, sans-serif';
  ctx.fillText('Spot the Difference', 24, 70);

  ctx.fillStyle = COLORS.hudMuted;
  ctx.font = '500 15px system-ui, sans-serif';
  ctx.fillText(`Level ${game.levelIndex + 1} of ${LEVELS.length} — ${level.name}`, 24, 96);
  ctx.fillText(level.subtitle, 340, 96);

  // Found counter, big and impossible to miss.
  ctx.textAlign = 'right';
  ctx.fillStyle = COLORS.hudText;
  ctx.font = '800 30px system-ui, sans-serif';
  ctx.fillText(`Found ${found} / ${total}`, 1030, 46);
  ctx.fillStyle = COLORS.hudMuted;
  ctx.font = '500 15px system-ui, sans-serif';
  ctx.fillText(
    `${differencesLeft(game)} still hiding  •  Score ${game.score}  •  Best ${game.bestScore}`,
    1030,
    72,
  );
  if (game.streak >= 2) {
    ctx.fillStyle = COLORS.accent;
    ctx.font = '700 16px system-ui, sans-serif';
    ctx.fillText(`Streak x${game.streak} — nice eyes!`, 1030, 96);
  }

  // Timer bar.
  const barX = 24;
  const barW = CANVAS_WIDTH - 48;
  const fraction = Math.max(0, game.timeLeft / level.timeLimitSeconds);
  ctx.fillStyle = '#0f1820';
  roundRect(ctx, barX, HUD.barY, barW, HUD.barHeight, 7);
  ctx.fill();
  ctx.fillStyle = fraction < 0.2 ? COLORS.timerLow : COLORS.timerGood;
  if (fraction > 0) {
    roundRect(ctx, barX, HUD.barY, barW * fraction, HUD.barHeight, 7);
    ctx.fill();
  }
  ctx.fillStyle = COLORS.hudText;
  ctx.font = '700 15px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Time ${formatTime(game.timeLeft)}`, barX, HUD.barY + HUD.barHeight + 20);
  ctx.textAlign = 'right';
  ctx.fillText(`Hints left: ${game.hintsLeft}  (press H)`, barX + barW, HUD.barY + HUD.barHeight + 20);

  // Buttons.
  const muteButton = { ...BUTTONS.mute, label: game.muted ? 'Sound: Off' : 'Sound: On' };
  drawButton(ctx, BUTTONS.hint, hoveredButton === 'hint');
  drawButton(ctx, BUTTONS.pause, hoveredButton === 'pause');
  drawButton(ctx, muteButton, hoveredButton === 'mute');
}

function drawPanels(ctx, game) {
  const scene = currentScene(game);
  const panelXs = [PANEL.leftX, PANEL.rightX];

  panelXs.forEach((panelX, variant) => {
    drawPanelFrame(ctx, panelX);
    ctx.save();
    ctx.beginPath();
    ctx.rect(panelX + 8, PANEL.topY + 8, PANEL.width - 16, PANEL.height - 16);
    ctx.clip();
    ctx.translate(panelX + 8, PANEL.topY + 8);
    scene.draw(ctx, variant);
    ctx.restore();

    // Markers sit on top of the picture, on both panels at once.
    for (const diff of scene.differences) {
      if (game.found.has(diff.id)) {
        drawFoundMarker(ctx, panelX, diff, game.now, game.lastFoundAt);
      }
    }
    if (game.hintTarget && game.now < game.hintUntil) {
      drawHintPulse(ctx, panelX, game.hintTarget, game.now, game.hintUntil);
    }
  });

  // Panel captions.
  ctx.fillStyle = COLORS.hudMuted;
  ctx.font = '600 14px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ORIGINAL', PANEL.leftX + PANEL.width / 2, PANEL.topY + PANEL.height + 26);
  ctx.fillText('SPOT THE CHANGES', PANEL.rightX + PANEL.width / 2, PANEL.topY + PANEL.height + 26);

  // Wrong-click flash.
  if (game.now < game.wrongFlashUntil) {
    ctx.fillStyle = COLORS.wrongFlash;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#ff8a8a';
    ctx.font = '800 26px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Not there — minus 5 seconds!', CANVAS_WIDTH / 2, 640);
  }

  // Bottom hint bar.
  ctx.fillStyle = COLORS.hudMuted;
  ctx.font = '500 14px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    'Click a difference in either picture  •  H hint  •  P pause  •  R restart  •  1–3 jump to a level',
    CANVAS_WIDTH / 2,
    668,
  );
}

function dimOverlay(ctx, alpha) {
  ctx.fillStyle = `rgba(10, 16, 22, ${alpha})`;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function overlayCard(ctx, w, h) {
  const x = (CANVAS_WIDTH - w) / 2;
  const y = (CANVAS_HEIGHT - h) / 2;
  ctx.fillStyle = '#22303e';
  roundRect(ctx, x, y, w, h, 18);
  ctx.fill();
  ctx.strokeStyle = 'rgba(253, 246, 227, 0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();
  return { x, y, w, h };
}

function overlayTitle(ctx, text, y, size = 44) {
  ctx.fillStyle = COLORS.hudText;
  ctx.font = `800 ${size}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(text, CANVAS_WIDTH / 2, y);
}

function overlayBody(ctx, text, y, size = 18, color = COLORS.hudMuted) {
  ctx.fillStyle = color;
  ctx.font = `500 ${size}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(text, CANVAS_WIDTH / 2, y);
}

function drawTitle(ctx, game) {
  dimOverlay(ctx, 0.55);
  const card = overlayCard(ctx, 760, 520);
  overlayTitle(ctx, 'Twin Glance', card.y + 84, 56);
  overlayTitle(ctx, 'Spot the Difference', card.y + 132, 26);
  overlayBody(ctx, 'Two pictures. One hides the changes. Your eyes find them.', card.y + 176);
  overlayBody(ctx, '3 scenes  •  24 differences  •  hints, streaks and a ticking clock', card.y + 208);
  ctx.fillStyle = COLORS.accent;
  ctx.font = '700 18px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('1  Sunny Garden — 7 differences — 3:00', CANVAS_WIDTH / 2, card.y + 262);
  ctx.fillText('2  Harbour at Dusk — 8 differences — 2:30', CANVAS_WIDTH / 2, card.y + 292);
  ctx.fillText('3  The Book Nook — 9 differences — 2:00', CANVAS_WIDTH / 2, card.y + 322);
  if (game.bestScore > 0) {
    overlayBody(ctx, `Best score so far: ${game.bestScore}`, card.y + 362, 18, COLORS.accent);
  }
  ctx.fillStyle = '#37d67a';
  roundRect(ctx, CANVAS_WIDTH / 2 - 130, card.y + 398, 260, 56, 12);
  ctx.fill();
  ctx.fillStyle = '#0f2b1a';
  ctx.font = '800 22px system-ui, sans-serif';
  ctx.fillText('▶  Start playing', CANVAS_WIDTH / 2, card.y + 434);
  overlayBody(ctx, 'Click anywhere, or press Enter', card.y + 486, 15);
}

function drawPaused(ctx) {
  dimOverlay(ctx, 0.6);
  const card = overlayCard(ctx, 520, 300);
  overlayTitle(ctx, 'Paused', card.y + 84, 44);
  overlayBody(ctx, 'Take a breath. The clock is waiting, not running.', card.y + 140);
  overlayBody(ctx, 'P or click to keep hunting  •  R to restart the level', card.y + 176, 17);
  overlayBody(ctx, 'Q to quit back to the title screen', card.y + 206, 17);
}

function drawLevelClear(ctx, game) {
  dimOverlay(ctx, 0.55);
  const card = overlayCard(ctx, 620, 420);
  const level = LEVELS[game.levelIndex];
  overlayTitle(ctx, 'Level Clear!', card.y + 80, 44);
  overlayBody(ctx, `${level.name} — every difference found.`, card.y + 126, 19, COLORS.hudText);
  overlayBody(ctx, `Finds this level: +${game.levelScore - game.timeBonus - game.hintBonus}`, card.y + 178);
  overlayBody(
    ctx,
    `Time bonus: +${game.timeBonus}  •  Unused hints: +${game.hintBonus}`,
    card.y + 210,
  );
  overlayBody(ctx, `Score: ${game.score}`, card.y + 246, 22, COLORS.accent);
  ctx.fillStyle = '#37d67a';
  roundRect(ctx, CANVAS_WIDTH / 2 - 150, card.y + 288, 300, 56, 12);
  ctx.fill();
  ctx.fillStyle = '#0f2b1a';
  ctx.font = '800 21px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Next: ${LEVELS[game.levelIndex + 1].name}  ▶`, CANVAS_WIDTH / 2, card.y + 324);
  overlayBody(ctx, 'Click anywhere, or press Enter', card.y + 388, 15);
}

function drawGameOver(ctx, game) {
  dimOverlay(ctx, 0.62);
  const card = overlayCard(ctx, 620, 400);
  overlayTitle(ctx, 'Out of Time', card.y + 84, 44);
  overlayBody(
    ctx,
    `The clock ran out with ${differencesLeft(game)} difference${differencesLeft(game) === 1 ? '' : 's'} still hiding.`,
    card.y + 134,
    18,
    COLORS.hudText,
  );
  overlayBody(ctx, `Score: ${game.score}  •  Best: ${game.bestScore}`, card.y + 178, 20, COLORS.accent);
  ctx.fillStyle = '#37d67a';
  roundRect(ctx, CANVAS_WIDTH / 2 - 130, card.y + 226, 260, 56, 12);
  ctx.fill();
  ctx.fillStyle = '#0f2b1a';
  ctx.font = '800 21px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Try Again  ↻', CANVAS_WIDTH / 2, card.y + 262);
  overlayBody(ctx, 'Click anywhere, or press R — Q quits to the title', card.y + 330, 15);
}

function drawVictory(ctx, game) {
  dimOverlay(ctx, 0.55);
  const card = overlayCard(ctx, 680, 460);
  overlayTitle(ctx, 'You Found Them All!', card.y + 80, 44);
  overlayBody(ctx, 'All 24 differences, across all three scenes. Sharp eyes!', card.y + 126, 19, COLORS.hudText);
  overlayBody(ctx, `Final score: ${game.score}`, card.y + 178, 24, COLORS.accent);
  overlayBody(ctx, `Best streak: ${game.bestStreak} in a row  •  Best score: ${game.bestScore}`, card.y + 214);
  if (game.score >= game.bestScore && game.score > 0) {
    overlayBody(ctx, 'A new best score!', card.y + 248, 19, '#37d67a');
  }
  ctx.fillStyle = '#37d67a';
  roundRect(ctx, CANVAS_WIDTH / 2 - 130, card.y + 296, 260, 56, 12);
  ctx.fill();
  ctx.fillStyle = '#0f2b1a';
  ctx.font = '800 21px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Play Again  ↻', CANVAS_WIDTH / 2, card.y + 332);
  overlayBody(ctx, 'Click anywhere, or press Enter — Q quits to the title', card.y + 404, 15);
}

export function render(ctx, game, hoveredButton) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawHud(ctx, game, hoveredButton);
  drawPanels(ctx, game);

  switch (game.phase) {
    case PHASES.TITLE:
      drawTitle(ctx, game);
      break;
    case PHASES.PAUSED:
      drawPaused(ctx);
      break;
    case PHASES.LEVEL_CLEAR:
      drawLevelClear(ctx, game);
      break;
    case PHASES.GAME_OVER:
      drawGameOver(ctx, game);
      break;
    case PHASES.VICTORY:
      drawVictory(ctx, game);
      break;
    default:
      break;
  }
}
