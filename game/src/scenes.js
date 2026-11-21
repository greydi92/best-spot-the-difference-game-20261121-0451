// Twin Glance — Spot the Difference: the three picture scenes.
// One file, one job: every scene knows how to draw itself twice — the
// reference panel (variant 0) and the changed panel (variant 1) — and
// where each of its hidden differences sits for hit-testing.
//
// Every picture is drawn from canvas primitives only: no image files,
// no network, no library. A difference is an element whose drawing
// changes between the two variants; its hit circle is listed in
// `differences` in panel coordinates (panel is 556 x 470).

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h) {
  ctx.fillRect(x, y, w, h);
}

function petalFlower(ctx, x, y, petalColor, centerColor) {
  ctx.fillStyle = petalColor;
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2;
    ellipse(ctx, x + Math.cos(a) * 11, y + Math.sin(a) * 11, 9, 9);
  }
  ctx.fillStyle = centerColor;
  circle(ctx, x, y, 7);
}

function drawCloud(ctx, x, y, scale, color) {
  ctx.fillStyle = color;
  circle(ctx, x, y, 20 * scale);
  circle(ctx, x + 20 * scale, y - 6 * scale, 16 * scale);
  circle(ctx, x + 40 * scale, y, 18 * scale);
  rect(ctx, x - 18 * scale, y, 78 * scale, 16 * scale);
}

function drawButterfly(ctx, x, y, wingColor) {
  ctx.fillStyle = wingColor;
  ellipse(ctx, x - 11, y - 6, 12, 9);
  ellipse(ctx, x + 11, y - 6, 12, 9);
  ellipse(ctx, x - 9, y + 9, 9, 7);
  ellipse(ctx, x + 9, y + 9, 9, 7);
  ctx.fillStyle = '#2b2b2b';
  ellipse(ctx, x, y, 3, 10);
}

// ---------------------------------------------------------------------------
// Scene 1 — Sunny Garden (7 differences)
// ---------------------------------------------------------------------------

function drawGarden(ctx, variant) {
  // Sky and sun.
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#7ec8f2');
  sky.addColorStop(1, '#cdeffd');
  ctx.fillStyle = sky;
  rect(ctx, 0, 0, 556, 300);

  ctx.fillStyle = '#ffd94d';
  circle(ctx, 82, 72, 38);
  ctx.fillStyle = '#ffedb0';
  circle(ctx, 82, 72, 28);
  if (variant === 1) {
    // Difference 1: the sun wears sunglasses on the right.
    ctx.fillStyle = '#22242a';
    ellipse(ctx, 70, 68, 13, 9);
    ellipse(ctx, 94, 68, 13, 9);
    ctx.fillRect(82, 66, 3, 3);
  }

  drawCloud(ctx, 210, 60, 1, '#ffffff');
  drawCloud(ctx, 380, 42, 0.8, '#ffffff');
  if (variant === 1) {
    // Difference 7: an extra little cloud drifts in on the right.
    drawCloud(ctx, 300, 96, 0.55, '#ffffff');
  }

  if (variant === 0) {
    // Difference 4: a butterfly flutters on the left only.
    drawButterfly(ctx, 432, 96, '#ff8fb3');
  }

  // Rolling hills and grass.
  ctx.fillStyle = '#8fce6e';
  ctx.beginPath();
  ctx.moveTo(0, 250);
  ctx.quadraticCurveTo(140, 205, 300, 248);
  ctx.quadraticCurveTo(430, 285, 556, 240);
  ctx.lineTo(556, 470);
  ctx.lineTo(0, 470);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#6db356';
  rect(ctx, 0, 330, 556, 140);

  // The cottage.
  ctx.fillStyle = '#f7e3c0';
  rect(ctx, 96, 210, 130, 110);
  ctx.fillStyle = '#c65b4e';
  ctx.beginPath();
  ctx.moveTo(84, 212);
  ctx.lineTo(161, 158);
  ctx.lineTo(238, 212);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#8a4b2d';
  rect(ctx, 148, 268, 28, 52);
  ctx.fillStyle = '#ffd94d';
  circle(ctx, 182, 292, 3);
  // Window: curtains open (bright) on the left, drawn shut on the right.
  ctx.fillStyle = variant === 0 ? '#bfe8ff' : '#3d5a80';
  rect(ctx, 112, 228, 34, 34);
  ctx.strokeStyle = '#8a4b2d';
  ctx.lineWidth = 3;
  ctx.strokeRect(112, 228, 34, 34);
  if (variant === 0) {
    ctx.fillStyle = '#ff9fb0';
    rect(ctx, 112, 228, 8, 34);
    rect(ctx, 138, 228, 8, 34);
  }

  // The apple tree.
  ctx.fillStyle = '#7a4a21';
  rect(ctx, 452, 210, 20, 110);
  ctx.fillStyle = '#4e9e4a';
  circle(ctx, 432, 178, 46);
  circle(ctx, 492, 178, 46);
  circle(ctx, 462, 140, 50);
  // Difference 2: five apples on the left, three on the right.
  const apples = variant === 0
    ? [[428, 168], [462, 150], [496, 168], [444, 196], [482, 194]]
    : [[428, 168], [496, 168], [462, 196]];
  ctx.fillStyle = '#e23b3b';
  apples.forEach(([ax, ay]) => circle(ctx, ax, ay, 7));

  // The fence along the bottom of the garden.
  ctx.fillStyle = '#a9805a';
  rect(ctx, 0, 352, 556, 8);
  for (let i = 0; i < 9; i += 1) {
    const px = 18 + i * 62;
    // Difference 6: one fence plank is missing on the right.
    if (variant === 1 && i === 5) continue;
    ctx.fillStyle = '#c49a6c';
    rect(ctx, px, 318, 26, 52);
    ctx.fillStyle = '#a9805a';
    circle(ctx, px + 13, 326, 3);
  }

  // Flower bed along the bottom.
  const bed = [
    [60, 408, '#ff6b6b'], [140, 420, '#ffa94d'], [220, 406, '#ff6b6b'],
    [290, 414, '#ff6b6b'], [370, 408, '#ffa94d'], [450, 418, '#ff6b6b'],
    [510, 406, '#ffa94d'],
  ];
  bed.forEach(([fx, fy, color], index) => {
    ctx.strokeStyle = '#3f7d33';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(fx, fy + 8);
    ctx.lineTo(fx, fy + 34);
    ctx.stroke();
    // Difference 3: the middle flower is red on the left, violet on the right.
    const petal = index === 3 && variant === 1 ? '#9b5de5' : color;
    petalFlower(ctx, fx, fy, petal, '#ffd94d');
  });

  // A sleepy snail on the grass, the same in both pictures.
  ctx.fillStyle = '#f2c14e';
  ctx.beginPath();
  ctx.arc(96, 452, 12, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#8a5a2b';
  ellipse(ctx, 112, 452, 14, 5);
}

const GARDEN_DIFFERENCES = [
  { id: 'sun-glasses', x: 82, y: 72, r: 40, label: 'Sunglasses on the sun' },
  { id: 'tree-apples', x: 462, y: 168, r: 38, label: 'Apples on the tree' },
  { id: 'flower-colour', x: 290, y: 414, r: 26, label: 'Colour of the middle flower' },
  { id: 'butterfly', x: 432, y: 96, r: 28, label: 'The butterfly' },
  { id: 'window-curtain', x: 129, y: 245, r: 32, label: 'The cottage window' },
  { id: 'fence-plank', x: 343, y: 344, r: 30, label: 'A fence plank' },
  { id: 'extra-cloud', x: 318, y: 96, r: 32, label: 'The little cloud' },
];

// ---------------------------------------------------------------------------
// Scene 2 — Harbour at Dusk (8 differences)
// ---------------------------------------------------------------------------

function drawGull(ctx, x, y, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 12, y);
  ctx.quadraticCurveTo(x - 4, y - 9, x, y);
  ctx.quadraticCurveTo(x + 4, y - 9, x + 12, y);
  ctx.stroke();
}

function drawHarbour(ctx, variant) {
  // Dusk sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 290);
  sky.addColorStop(0, '#2b3a67');
  sky.addColorStop(0.6, '#e07856');
  sky.addColorStop(1, '#f7b267');
  ctx.fillStyle = sky;
  rect(ctx, 0, 0, 556, 290);

  // Difference 8: a full moon on the left, a crescent on the right.
  ctx.fillStyle = '#fdf3d0';
  circle(ctx, 492, 66, 30);
  if (variant === 1) {
    ctx.fillStyle = '#2b3a67';
    circle(ctx, 504, 58, 26);
  }
  ctx.fillStyle = '#fdf3d0';
  circle(ctx, 90, 46, 2);
  circle(ctx, 160, 78, 2);
  circle(ctx, 250, 40, 2);
  circle(ctx, 350, 88, 2);
  circle(ctx, 420, 44, 2);

  drawGull(ctx, 250, 96, '#2b2b2b');
  drawGull(ctx, 320, 66, '#2b2b2b');
  if (variant === 1) {
    // Difference 3: an extra gull joins the flock on the right.
    drawGull(ctx, 452, 108, '#2b2b2b');
  }

  // The lighthouse, striped red and white.
  ctx.fillStyle = '#f4f1e6';
  ctx.beginPath();
  ctx.moveTo(96, 290);
  ctx.lineTo(110, 130);
  ctx.lineTo(146, 130);
  ctx.lineTo(160, 290);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d64545';
  rect(ctx, 104, 176, 48, 26);
  rect(ctx, 100, 232, 56, 26);
  ctx.fillStyle = '#2b2b2b';
  rect(ctx, 106, 106, 44, 24);
  ctx.fillStyle = variant === 0 ? '#ffe066' : '#3d3d3d';
  rect(ctx, 112, 112, 32, 12);
  if (variant === 0) {
    // Difference 1: the lighthouse beam sweeps out on the left only.
    ctx.fillStyle = 'rgba(255, 224, 102, 0.45)';
    ctx.beginPath();
    ctx.moveTo(150, 118);
    ctx.lineTo(330, 70);
    ctx.lineTo(330, 150);
    ctx.closePath();
    ctx.fill();
  }

  // Harbour building with one window.
  ctx.fillStyle = '#5b4a68';
  rect(ctx, 190, 220, 120, 70);
  ctx.fillStyle = '#3d2f4a';
  ctx.beginPath();
  ctx.moveTo(182, 222);
  ctx.lineTo(250, 186);
  ctx.lineTo(318, 222);
  ctx.closePath();
  ctx.fill();
  // Difference 5: the window glows warm on the left, stays dark on the right.
  ctx.fillStyle = variant === 0 ? '#ffd94d' : '#2b2b3d';
  rect(ctx, 232, 238, 36, 30);
  ctx.strokeStyle = '#2b2b3d';
  ctx.lineWidth = 3;
  ctx.strokeRect(232, 238, 36, 30);

  // The sea.
  const sea = ctx.createLinearGradient(0, 290, 0, 470);
  sea.addColorStop(0, '#3d6e8f');
  sea.addColorStop(1, '#1d3a52');
  ctx.fillStyle = sea;
  rect(ctx, 0, 290, 556, 180);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.moveTo(20 + i * 40, 320 + i * 26);
    ctx.quadraticCurveTo(90 + i * 40, 312 + i * 26, 170 + i * 40, 320 + i * 26);
    ctx.stroke();
  }

  // The sailboat.
  ctx.fillStyle = '#6b3f2a';
  ctx.beginPath();
  ctx.moveTo(300, 300);
  ctx.lineTo(420, 300);
  ctx.lineTo(396, 322);
  ctx.lineTo(322, 322);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#8a5a2b';
  rect(ctx, 356, 210, 6, 92);
  // Difference 2: coral sail on the left, teal sail on the right.
  ctx.fillStyle = variant === 0 ? '#ff7f6b' : '#2ec4b6';
  ctx.beginPath();
  ctx.moveTo(362, 214);
  ctx.lineTo(362, 292);
  ctx.lineTo(420, 292);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fdf6e3';
  ctx.beginPath();
  ctx.moveTo(354, 224);
  ctx.lineTo(354, 292);
  ctx.lineTo(312, 292);
  ctx.closePath();
  ctx.fill();

  if (variant === 0) {
    // Difference 4: a striped buoy bobs on the left only.
    ctx.fillStyle = '#ff5d5d';
    ctx.beginPath();
    ctx.arc(500, 336, 14, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#fdf6e3';
    rect(ctx, 486, 330, 28, 8);
    ctx.fillStyle = '#2b2b2b';
    rect(ctx, 497, 314, 6, 12);
  }

  if (variant === 0) {
    // Difference 6: a fish leaps out of the water on the left only.
    ctx.fillStyle = '#7fc8e8';
    ctx.beginPath();
    ctx.moveTo(252, 372);
    ctx.quadraticCurveTo(272, 344, 292, 368);
    ctx.quadraticCurveTo(272, 380, 252, 372);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#2b2b2b';
    circle(ctx, 286, 362, 2);
  }

  // The wooden dock in the foreground.
  ctx.fillStyle = '#7a5230';
  rect(ctx, 0, 396, 190, 74);
  ctx.fillStyle = '#8a6238';
  for (let i = 0; i < 4; i += 1) rect(ctx, 0, 404 + i * 18, 190, 4);
  ctx.fillStyle = '#5b3a20';
  rect(ctx, 24, 396, 10, 74);
  rect(ctx, 96, 396, 10, 74);
  rect(ctx, 168, 396, 10, 74);
  if (variant === 0) {
    // Difference 7: a crate sits on the dock on the left, an anchor on the right.
    ctx.fillStyle = '#c49a6c';
    rect(ctx, 122, 356, 40, 40);
    ctx.strokeStyle = '#7a5230';
    ctx.lineWidth = 3;
    ctx.strokeRect(122, 356, 40, 40);
    ctx.beginPath();
    ctx.moveTo(122, 356);
    ctx.lineTo(162, 396);
    ctx.moveTo(162, 356);
    ctx.lineTo(122, 396);
    ctx.stroke();
  } else {
    ctx.strokeStyle = '#d8d8d8';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(142, 366, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(142, 376);
    ctx.lineTo(142, 392);
    ctx.moveTo(126, 380);
    ctx.quadraticCurveTo(126, 398, 142, 396);
    ctx.quadraticCurveTo(158, 398, 158, 380);
    ctx.stroke();
  }
}

const HARBOUR_DIFFERENCES = [
  { id: 'lighthouse-beam', x: 240, y: 110, r: 42, label: 'The lighthouse beam' },
  { id: 'sail-colour', x: 388, y: 254, r: 36, label: 'Colour of the big sail' },
  { id: 'extra-gull', x: 452, y: 108, r: 26, label: 'The third gull' },
  { id: 'buoy', x: 500, y: 330, r: 26, label: 'The striped buoy' },
  { id: 'harbour-window', x: 250, y: 253, r: 30, label: 'The lit window' },
  { id: 'leaping-fish', x: 272, y: 362, r: 28, label: 'The leaping fish' },
  { id: 'dock-crate', x: 142, y: 376, r: 32, label: 'Crate or anchor on the dock' },
  { id: 'moon-phase', x: 492, y: 66, r: 36, label: 'The shape of the moon' },
];

// ---------------------------------------------------------------------------
// Scene 3 — The Book Nook (9 differences)
// ---------------------------------------------------------------------------

function drawBookSpine(ctx, x, y, w, h, color, bandColor) {
  ctx.fillStyle = color;
  rect(ctx, x, y, w, h);
  ctx.fillStyle = bandColor;
  rect(ctx, x, y + 10, w, 6);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  rect(ctx, x + 3, y + 3, 2, h - 6);
}

function drawNook(ctx, variant) {
  // Warm wall and floor.
  ctx.fillStyle = '#e8d5b5';
  rect(ctx, 0, 0, 556, 320);
  ctx.fillStyle = '#c9a06c';
  rect(ctx, 0, 320, 556, 150);

  // Framed picture on the wall.
  ctx.fillStyle = '#6b4a2f';
  rect(ctx, 96, 52, 92, 72);
  ctx.fillStyle = '#fdf6e3';
  rect(ctx, 104, 60, 76, 56);
  if (variant === 0) {
    // Difference 8: mountains in the picture on the left, a sun on the right.
    ctx.fillStyle = '#7ec8f2';
    rect(ctx, 104, 60, 76, 56);
    ctx.fillStyle = '#4e9e4a';
    ctx.beginPath();
    ctx.moveTo(104, 116);
    ctx.lineTo(130, 82);
    ctx.lineTo(152, 116);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(140, 116);
    ctx.lineTo(164, 88);
    ctx.lineTo(180, 116);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillStyle = '#ffe9a8';
    rect(ctx, 104, 60, 76, 56);
    ctx.fillStyle = '#ff9f1c';
    circle(ctx, 142, 88, 16);
  }

  // The wall clock.
  ctx.fillStyle = '#fdf6e3';
  circle(ctx, 470, 72, 32);
  ctx.strokeStyle = '#6b4a2f';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(470, 72, 32, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#2b2b2b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(470, 72);
  // Difference 4: three o'clock on the left, half past four on the right.
  if (variant === 0) {
    ctx.lineTo(470, 48);
    ctx.moveTo(470, 72);
    ctx.lineTo(494, 72);
  } else {
    ctx.lineTo(470, 92);
    ctx.moveTo(470, 72);
    ctx.lineTo(486, 84);
  }
  ctx.stroke();
  ctx.fillStyle = '#2b2b2b';
  circle(ctx, 470, 72, 3);

  // The bookshelf and its books.
  ctx.fillStyle = '#8a6238';
  rect(ctx, 60, 150, 240, 150);
  ctx.fillStyle = '#6b4a2f';
  rect(ctx, 68, 196, 224, 8);
  rect(ctx, 68, 248, 224, 8);
  const shelfBooks = [
    [76, 158, 20, 38, '#c0392b', '#e8b4b8'],
    [98, 164, 18, 32, '#2980b9', '#aed6f1'],
    [118, 156, 22, 40, '#27ae60', '#a9dfbf'],
    [142, 162, 16, 34, '#f39c12', '#fdebd0'],
    [160, 158, 20, 38, '#8e44ad', '#d2b4de'],
  ];
  shelfBooks.forEach(([bx, by, bw, bh, color, band], index) => {
    // Difference 1: the third book is green on the left, red on the right.
    const spine = index === 2 && variant === 1 ? '#c0392b' : color;
    const stripe = index === 2 && variant === 1 ? '#e8b4b8' : band;
    drawBookSpine(ctx, bx, by, bw, bh, spine, stripe);
  });
  const lowerBooks = [
    [76, 210, 20, 38, '#16a085', '#a3e4d7'],
    [98, 214, 18, 34, '#d35400', '#f5cba7'],
    [118, 208, 22, 40, '#2c3e50', '#aeb6bf'],
    [140, 212, 16, 36, '#c0392b', '#e8b4b8'],
    [240, 206, 20, 42, '#7d6608', '#f9e79f'],
    [262, 212, 18, 36, '#2980b9', '#aed6f1'],
  ];
  lowerBooks.forEach(([bx, by, bw, bh, color, band]) => {
    drawBookSpine(ctx, bx, by, bw, bh, color, band);
  });
  // Difference 7: a blue bookmark ribbon on the left, yellow on the right.
  ctx.fillStyle = variant === 0 ? '#2980b9' : '#f1c40f';
  rect(ctx, 246, 236, 8, 22);
  // A leaning book on the top shelf, the same in both pictures.
  ctx.save();
  ctx.translate(268, 168);
  ctx.rotate(0.28);
  drawBookSpine(ctx, -10, -20, 20, 40, '#7d3c98', '#d2b4de');
  ctx.restore();

  // The potted plant on the shelf's left end.
  ctx.fillStyle = '#c65b4e';
  ctx.beginPath();
  ctx.moveTo(330, 250);
  ctx.lineTo(370, 250);
  ctx.lineTo(362, 292);
  ctx.lineTo(338, 292);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#3f7d33';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(350, 250);
  ctx.lineTo(350, 210);
  ctx.stroke();
  ctx.fillStyle = '#4e9e4a';
  ellipse(ctx, 336, 214, 14, 8);
  ellipse(ctx, 364, 214, 14, 8);
  ellipse(ctx, 350, 198, 10, 14);
  if (variant === 0) {
    // Difference 5: the plant blooms on the left only.
    petalFlower(ctx, 350, 190, '#ff6b9d', '#ffd94d');
  }

  // The reading lamp on the side table.
  ctx.fillStyle = '#5b4a68';
  rect(ctx, 392, 300, 8, 60);
  ellipse(ctx, 396, 362, 30, 6);
  ctx.fillStyle = '#f39c12';
  ctx.beginPath();
  ctx.moveTo(372, 300);
  ctx.lineTo(420, 300);
  ctx.lineTo(410, 262);
  ctx.lineTo(382, 262);
  ctx.closePath();
  ctx.fill();
  if (variant === 0) {
    // Difference 6: the lamp glows on the left, stays dark on the right.
    ctx.fillStyle = 'rgba(255, 214, 90, 0.35)';
    circle(ctx, 396, 282, 44);
    ctx.fillStyle = '#ffe066';
    circle(ctx, 396, 282, 18);
  }

  // The rug under the table.
  ctx.fillStyle = '#a93226';
  ellipse(ctx, 280, 424, 150, 34);
  ctx.fillStyle = '#e8b4b8';
  ellipse(ctx, 280, 424, 118, 24);
  ctx.fillStyle = '#a93226';
  ellipse(ctx, 280, 424, 84, 16);
  if (variant === 1) {
    // Difference 9: an extra gold stripe rings the rug on the right.
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(280, 424, 100, 20, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // The armchair with the cat.
  ctx.fillStyle = '#7d6608';
  rect(ctx, 420, 330, 110, 70);
  ctx.fillStyle = '#935116';
  rect(ctx, 420, 300, 110, 40);
  ellipse(ctx, 420, 330, 16, 40);
  ellipse(ctx, 530, 330, 16, 40);
  if (variant === 0) {
    // Difference 2: a grey cat naps on the chair on the left only.
    ctx.fillStyle = '#8a8d91';
    ellipse(ctx, 476, 322, 34, 16);
    circle(ctx, 502, 308, 13);
    ctx.beginPath();
    ctx.moveTo(494, 298);
    ctx.lineTo(492, 286);
    ctx.lineTo(500, 296);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(508, 298);
    ctx.lineTo(510, 286);
    ctx.lineTo(514, 297);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#5b5e62';
    ellipse(ctx, 448, 330, 12, 5);
  }

  // The teacup on the table, bottom left.
  ctx.fillStyle = '#7d3c98';
  rect(ctx, 240, 340, 90, 10);
  ctx.fillStyle = '#fdf6e3';
  ctx.beginPath();
  ctx.moveTo(268, 350);
  ctx.lineTo(312, 350);
  ctx.lineTo(306, 386);
  ctx.lineTo(274, 386);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#7d3c98';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(314, 366, 10, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  if (variant === 0) {
    // Difference 3: steam curls off the tea on the left only.
    ctx.strokeStyle = 'rgba(120, 120, 120, 0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(282, 344);
    ctx.quadraticCurveTo(276, 330, 284, 318);
    ctx.moveTo(298, 344);
    ctx.quadraticCurveTo(292, 330, 300, 318);
    ctx.stroke();
  }
}

const NOOK_DIFFERENCES = [
  { id: 'book-spine', x: 129, y: 176, r: 26, label: 'Colour of the third book' },
  { id: 'cat', x: 476, y: 314, r: 38, label: 'The cat on the chair' },
  { id: 'tea-steam', x: 290, y: 330, r: 26, label: 'Steam over the teacup' },
  { id: 'clock-hands', x: 470, y: 72, r: 34, label: 'The time on the clock' },
  { id: 'plant-bloom', x: 350, y: 190, r: 26, label: 'The bloom on the plant' },
  { id: 'lamp-glow', x: 396, y: 282, r: 36, label: 'The lamp glow' },
  { id: 'bookmark', x: 250, y: 247, r: 24, label: 'Colour of the bookmark' },
  { id: 'picture', x: 142, y: 88, r: 32, label: 'The framed picture' },
  { id: 'rug-stripe', x: 380, y: 424, r: 30, label: 'The stripe on the rug' },
];

// ---------------------------------------------------------------------------
// Scene registry
// ---------------------------------------------------------------------------

export const SCENES = [
  { key: 'garden', differences: GARDEN_DIFFERENCES, draw: drawGarden },
  { key: 'harbour', differences: HARBOUR_DIFFERENCES, draw: drawHarbour },
  { key: 'nook', differences: NOOK_DIFFERENCES, draw: drawNook },
];

export function sceneByKey(key) {
  return SCENES.find((scene) => scene.key === key) ?? SCENES[0];
}
