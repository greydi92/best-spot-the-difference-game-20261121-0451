[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/greydi92/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/greydi92/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

# Twin Glance — Spot the Difference

An original spot-the-difference game for the [make.fun bounty](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451): **Make the best spot the difference game**. Two near-identical pictures side by side, one hiding the changes — find them all before the clock runs out.

## How to play

Open `game/index.html` from any static server (or run `node serve.ts` and open http://localhost:8080). No build step, no network, no libraries — everything is drawn from canvas primitives with synthesized WebAudio sounds.

- **Click** a difference in either picture to mark it with a green ring (+100 points, streak bonus on consecutive finds)
- **Wrong click** costs 5 seconds
- **H** spends a hint (3 per level): a yellow pulse marks a difference still hiding
- **P** pauses, **R** restarts the level, **1–3** jump to a level, **M** mutes
- Finishing a level banks a time bonus (+10 per second left) and a bonus for every unused hint (+25 each)
- Best score is saved in `localStorage`

## The three scenes

| Level | Scene | Differences | Time |
|-------|-------|-------------|------|
| 1 | Sunny Garden — a cottage, an apple tree and a flower bed | 7 | 3:00 |
| 2 | Harbour at Dusk — a lighthouse, a sailboat and the last light | 8 | 2:30 |
| 3 | The Book Nook — tea, lamplight and a sleepy cat | 9 | 2:00 |

24 differences in all. Later scenes hide more and give less time.

## Layout

- `game/index.html` — page shell, loads the game
- `game/style.css` — page chrome around the canvas
- `game/src/config.js` — constants, level definitions, scoring
- `game/src/scenes.js` — the three scenes, drawn twice (reference and changed)
- `game/src/game.js` — rules and state: clicks, hints, timer, score
- `game/src/render.js` — HUD, panels, markers, and every screen
- `game/src/input.js` — mouse and keyboard input
- `game/src/audio.js` — synthesized WebAudio sounds, no audio files
- `game/src/main.js` — boot and frame loop
- `main.ts` — hands the game in (copies `game/` + `screenshots/`, writes `dossier.json` via the kit's `buildDossier`)
- `serve.ts` — tiny static server for local play-testing

## Screenshots

The cover shows Sunny Garden mid-hunt: three differences found and ringed, four still hiding, counter reading 3 / 7.
