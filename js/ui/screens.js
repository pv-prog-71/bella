/* Title, pause, credits, bye and end-card screens */
/* ---------- title / menus ---------- */
function drawNightBackdrop(c, camx, dim) {
  ensureNight();
  drawSky(c, 'night', G.t, camx);
  drawLayers(c, 'night', camx, G.t);
  const g = c.createLinearGradient(0, 440, 0, 540);
  g.addColorStop(0, '#2c5a3a');
  g.addColorStop(0.12, '#1a3a28');
  g.addColorStop(1, '#0a1610');
  c.fillStyle = g;
  c.fillRect(0, 440, W, 100);
  c.strokeStyle = '#3f7a4a';
  c.lineWidth = 2;
  for (let i = 0; i < 120; i++) {
    const x = (i * 8.1 + 3) % W,
      hh = 6 + ((i * 7) % 9);
    c.beginPath();
    c.moveTo(x, 442);
    c.quadraticCurveTo(x + 2, 442 - hh * 0.6, x + (i % 2 ? 4 : -4), 442 - hh);
    c.stroke();
  }
  for (let i = 0; i < 26; i++) {
    const x = ((i * 97 + G.t * 8 * (1 + (i % 3) * 0.3)) % (W + 40)) - 20,
      y = 120 + ((i * 53) % 300) + Math.sin(G.t * 0.7 + i) * 12,
      a = 0.35 + 0.35 * Math.sin(G.t * 1.2 + i);
    c.globalAlpha = a;
    c.drawImage(GLOW, x - 9, y - 9, 18, 18);
    c.globalAlpha = 1;
  }
  if (dim) {
    c.fillStyle = `rgba(0,0,6,${dim})`;
    c.fillRect(0, 0, W, H);
  }
}
function drawTitle(c) {
  drawNightBackdrop(c, G.t * 22, 0.1);
  const bx = 170 + Math.sin(G.t * 0.5) * 3;
  c.fillStyle = 'rgba(0,0,0,0.3)';
  ell(c, bx, 478, 90, 12);
  c.fill();
  bellaDraw(c, bx, 476, { face: 1, t: G.t, scale: 1.8, glow: [200, 235, 255, 0.5], rim: 3 });
  c.save();
  c.shadowColor = 'rgba(143,216,192,0.6)';
  c.shadowBlur = 24;
  T(c, tr('game.title'), 640, 112, 62, '#f2fbf6', 'center', 600);
  c.restore();
  T(c, tr('game.subtitle'), 640, 148, 22, '#9fd8c8', 'center', 400);
  const items = [];
  if (hasSave()) {
    items.push([tr('menu.continue'), continueGame]);
    items.push([
      tr('menu.new'),
      () => {
        ui.confirmNew = true;
      }
    ]);
  } else items.push([tr('menu.start'), startNewGame]);
  items.push([
    tr('menu.music', { state: tr(SND.musicOn ? 'menu.on' : 'menu.off') }),
    () => {
      SND.setMusicOn(!SND.musicOn);
    }
  ]);
  items.push([
    tr('menu.credits'),
    () => {
      G.state = 'credits';
      ui.focus = 0;
    }
  ]);
  items.push([
    tr('menu.quit'),
    () => {
      G.state = 'bye';
      ui.focus = 0;
    }
  ]);
  if (ui.confirmNew) {
    rrect(c, 440, 186, 400, 200, 18);
    c.fillStyle = 'rgba(8,14,18,0.9)';
    c.fill();
    T(c, tr('menu.confirmTitle'), 640, 232, 24, '#fff', 'center', 600);
    T(c, tr('menu.confirmBody'), 640, 262, 17, '#b8cdc6', 'center', 400);
    menuBtn(
      c,
      tr('menu.confirmYes'),
      470,
      290,
      160,
      46,
      () => {
        ui.confirmNew = false;
        startNewGame();
      },
      { size: 19 }
    );
    menuBtn(
      c,
      tr('menu.cancel'),
      650,
      290,
      160,
      46,
      () => {
        ui.confirmNew = false;
        ui.focus = 0;
      },
      { size: 19 }
    );
  } else items.forEach((it, i) => menuBtn(c, it[0], 480, 178 + i * 56, 320, 46, it[1]));
  T(c, tr('title.noFlash'), 640, 512, 14, 'rgba(200,225,215,0.55)', 'center', 400);
  T(c, tr(COARSE || touch.seen ? 'title.controlsTouch' : 'title.controls'), 640, 530, 14, 'rgba(200,225,215,0.55)', 'center', 400);
}
function drawPanelMenu(c, title, items) {
  c.fillStyle = 'rgba(0,0,6,0.55)';
  c.fillRect(0, 0, W, H);
  rrect(c, 310, 120, 340, 60 + items.length * 56 + 20, 20);
  c.fillStyle = 'rgba(10,18,22,0.92)';
  c.fill();
  c.lineWidth = 2;
  c.strokeStyle = 'rgba(200,230,220,0.3)';
  c.stroke();
  T(c, title, 480, 166, 30, '#fff', 'center', 600);
  items.forEach((it, i) => menuBtn(c, it[0], 340, 190 + i * 56, 280, 46, it[1]));
}
function drawPause(c) {
  drawPanelMenu(c, tr('menu.paused'), [
    [
      tr('menu.continue'),
      () => {
        G.paused = false;
      }
    ],
    [
      tr('menu.music', { state: tr(SND.musicOn ? 'menu.on' : 'menu.off') }),
      () => SND.setMusicOn(!SND.musicOn)
    ],
    [
      tr('menu.quit'),
      () => {
        writeSave();
        G.paused = false;
        G.state = 'title';
        G.sub = null;
        ui.focus = 0;
        SND.music('title', 2);
      }
    ]
  ]);
  if (!(COARSE || touch.seen)) {
    // keyboard shortcuts, shown under the pause menu (desktop only)
    ['menu.k1', 'menu.k2', 'menu.k3', 'menu.k4'].forEach((k, i) => T(c, tr(k), 480, 400 + i * 24, 16, 'rgba(225,240,235,0.85)', 'center', 500));
  }
}
function drawCredits(c) {
  drawNightBackdrop(c, G.t * 14, 0.45);
  T(c, tr('credits.title'), 480, 80, 44, '#fff', 'center', 600);
  T(c, tr('credits.header'), 480, 138, 22, '#9fd8c8', 'center', 500);
  T(c, tr('credits.dedication1'), 480, 178, 19, '#ffe9a0', 'center', 500);
  T(c, tr('credits.dedication2'), 480, 210, 19, '#ffe9a0', 'center', 500);
  // how to play: keyboard keys on desktop, touch gestures on phones and tablets
  T(c, tr('credits.controls'), 480, 262, 20, '#9fd8c8', 'center', 600);
  const keys = COARSE || touch.seen ? ['credits.t1', 'credits.t2', 'credits.t3', 'credits.t4', 'credits.t5'] : ['menu.k1', 'menu.k2', 'menu.k3', 'menu.k4', 'menu.k5'];
  keys.forEach((k, i) => T(c, tr(k), 480, 294 + i * 25, 16, '#e8f2ee', 'center', 500));
  T(c, tr('credits.noFlash'), 480, 440, 15, '#b8cdc6', 'center', 500);
  menuBtn(c, tr('menu.back'), 380, 468, 200, 46, () => {
    G.state = 'title';
    ui.focus = 0;
  });
}
function drawBye(c) {
  drawNightBackdrop(c, G.t * 10, 0.6);
  T(c, tr('bye.title'), 480, 220, 46, '#fff', 'center', 600);
  T(c, tr('bye.body'), 480, 262, 20, '#b8cdc6', 'center', 400);
  menuBtn(c, tr('menu.backToTitle'), 360, 310, 240, 48, () => {
    G.state = 'title';
    ui.focus = 0;
  });
}
function drawEndCard(c) {
  drawNightBackdrop(c, 600 + G.t * 6, 0.15);
  bellaDraw(c, 480, 470, { face: 1, t: G.t, scale: 1.5, glow: [255, 235, 190, 0.55], rim: 3 });
  c.save();
  c.shadowColor = 'rgba(255,220,160,0.6)';
  c.shadowBlur = 24;
  T(c, tr('end.title'), 480, 170, 62, '#fff6df', 'center', 600);
  c.restore();
  T(c, tr('end.line1'), 480, 215, 22, '#ffe9a0', 'center', 400);
  T(c, tr('end.line2'), 480, 250, 20, '#d6e6e0', 'center', 400);
  menuBtn(c, tr('menu.backToTitle'), 360, 290, 240, 48, () => {
    G.state = 'title';
    ui.focus = 0;
    SND.music('title', 2);
  });
}
