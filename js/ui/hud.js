/* HUD and dialog box */
/* ---------- HUD ---------- */
function drawBar(c, x, y, w, h, frac, col1, col2) {
  pill(c, x, y, w, h, 'rgba(10,14,18,0.7)', h / 2);
  const fw = Math.max(0, w * frac);
  if (fw > 1) {
    const g = c.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, col1);
    g.addColorStop(1, col2);
    pill(c, x, y, fw, h, g, h / 2);
    c.fillStyle = 'rgba(255,255,255,0.25)';
    rrect(c, x + 3, y + 2, Math.max(0, fw - 6), h / 3, h / 6);
    c.fill();
  }
  rrect(c, x, y, w, h, h / 2);
  c.lineWidth = 2;
  c.strokeStyle = 'rgba(230,240,235,0.55)';
  c.stroke();
}
function drawHUD(c) {
  const alt = G.alt,
    L = G.L,
    modal = !!G.dialog;
  // health
  drawHeart(c, 34, 30, 1.15, '#ff5a6a');
  const hf = G.hp / 100;
  drawBar(
    c,
    58,
    21,
    210,
    17,
    hf,
    hf > 0.5 ? '#6adf6a' : hf > 0.25 ? '#e8c84a' : '#e85a4a',
    hf > 0.5 ? '#b8f060' : hf > 0.25 ? '#f0e070' : '#f08a5a'
  );
  // menu button
  if (!modal)
    addBtn(
      W - 62,
      8,
      50,
      44,
      () => {
        G.paused = true;
        ui.focus = 0;
      },
      false
    );
  rrect(c, W - 62, 8, 50, 44, 12);
  c.fillStyle = 'rgba(10,14,18,0.55)';
  c.fill();
  drawBurger(c, W - 37, 30, '#e8f0ec');
  // countdown (Alternate World)
  if (alt) {
    const f = L.time / L.timeMax;
    drawClock(c, 420, 30, 14, '#e8eef4');
    drawBar(
      c,
      444,
      21,
      290,
      17,
      f,
      f > 0.3 ? '#9ac8ff' : '#e0907a',
      f > 0.3 ? '#d0e6ff' : '#f0b8a0'
    );
    T(c, Math.ceil(L.time) + 's', 748, 36, 17, '#e8eef4', 'left', 600, {
      w: 3,
      c: 'rgba(0,0,0,0.6)'
    });
  }
  // bottom panel
  const g = c.createLinearGradient(0, 462, 0, 540);
  g.addColorStop(0, 'rgba(10,14,18,0.55)');
  g.addColorStop(1, 'rgba(10,14,18,0.82)');
  c.fillStyle = g;
  c.fillRect(0, 466, W, 74);
  c.fillStyle = 'rgba(255,255,255,0.14)';
  c.fillRect(0, 466, W, 2);
  // item slot
  const slot = { x: 16, y: 472, w: 62, h: 62 };
  if (!modal && !alt) addBtn(slot.x, slot.y, slot.w, slot.h, useItem, false);
  rrect(c, slot.x, slot.y, slot.w, slot.h, 14);
  c.fillStyle = 'rgba(30,38,44,0.85)';
  c.fill();
  c.lineWidth = 3;
  c.strokeStyle = G.held ? '#ffe9a0' : 'rgba(200,215,210,0.4)';
  c.stroke();
  if (G.held) {
    drawItem(c, G.held.type, slot.x + 31, slot.y + 30, 1.35);
    T(c, 'E', slot.x + 52, slot.y + 15, 13, '#ffe9a0', 'center', 600);
  } else T(c, tr('ui.item'), slot.x + 31, slot.y + 36, 13, 'rgba(200,215,210,0.5)', 'center', 500);
  // mana
  const mx = maxMana(),
    mf = G.mana / mx;
  drawBottle(c, 118, 506, 1.2, mf, '#7f9cff');
  T(c, String(Math.floor(G.mana)), 146, 508, 24, '#eaf0ff', 'left', 600, {
    w: 3,
    c: 'rgba(0,0,0,0.55)'
  });
  c.font = `600 24px ${FONT}`;
  const tw = c.measureText(String(Math.floor(G.mana))).width;
  T(c, '/ ' + mx, 146 + tw + 6, 508, 16, 'rgba(220,230,255,0.7)', 'left', 500);
  drawBar(c, 146, 516, 150, 9, mf, '#5b7cff', '#9ab4ff');
  // spells
  for (let i = 0; i < 4; i++) {
    const sx = 604 + i * 86,
      sy = 504,
      S = SPELLS[i],
      have = G.spells[i];
    let mode = !have ? 'locked' : alt ? (G.mana >= S.cost ? 'ready' : 'nomana') : 'ready',
      ex = null;
    if (alt && have) {
      const k = ['invis', 'jump', 'resist'][i];
      if (i < 3 && G.fx[k] > 0) {
        mode = 'active';
        ex = G.fx[k] / S.dur;
      } else if (i === 3 && G.wave) ((mode = 'active'), (ex = 1 - G.wave.t / 1.8));
    }
    if (!modal && alt && have) addBtn(sx - 30, sy - 30, 60, 60, () => castSpell(i), false);
    drawSpellIcon(c, i, sx, sy, 29, mode, ex);
    if (have)
      T(
        c,
        String(S.cost),
        sx,
        sy + 40,
        12,
        mode === 'nomana' ? 'rgba(200,180,180,0.6)' : '#d8e6ff',
        'center',
        600
      );
    T(c, String(i + 1), sx - 20, sy - 14, 11, 'rgba(255,255,255,0.4)', 'center', 600);
  }
  // hint text
  if (!alt && !modal && !G.sub && G.hintT > 22 && L.hint) {
    const h = L.hint();
    if (h && h.text) {
      c.font = `500 17px ${FONT}`;
      const w = Math.min(860, c.measureText(h.text).width + 36);
      pill(c, W / 2 - w / 2, 420, w, 34, 'rgba(10,14,18,0.78)', 14);
      T(c, h.text, W / 2, 443, 17, '#ffe9a0', 'center', 500);
    }
  }
  // toasts
  G.toasts.forEach((t, i) => {
    const a = clamp(Math.min(t.t * 4, (t.dur - t.t) * 2), 0, 1);
    c.globalAlpha = a;
    c.font = `500 18px ${FONT}`;
    const w = Math.min(880, c.measureText(t.text).width + 40);
    pill(c, W / 2 - w / 2, 62 + i * 42, w, 34, 'rgba(10,14,18,0.82)', 15);
    T(c, t.text, W / 2, 85 + i * 42, 18, '#f2f6f4', 'center', 500);
    c.globalAlpha = 1;
  });
  // title card
  if (G.titleCard) {
    const tc = G.titleCard,
      a = clamp(Math.min(tc.t * 2, (3.6 - tc.t) * 1.2), 0, 1);
    c.globalAlpha = a;
    T(
      c,
      tc.text,
      W / 2,
      tc.sub ? 130 : 160,
      tc.sub ? 24 : 54,
      tc.sub ? '#d8e4f4' : '#ffffff',
      'center',
      600,
      { w: 6, c: 'rgba(0,0,0,0.45)' }
    );
    c.globalAlpha = 1;
  }
}
function drawDialog(c) {
  const d = G.dialog;
  c.fillStyle = 'rgba(0,0,0,0.28)';
  c.fillRect(0, 0, W, H);
  const x = 120,
    y = 110,
    w = 720,
    h = 190;
  c.save();
  c.shadowColor = 'rgba(0,0,0,0.4)';
  c.shadowBlur = 24;
  pill(c, x, y, w, h, '#fdfbf3', 20);
  c.restore();
  const idx = { Chameleon: 0, Frog: 1, Bear: 2, Stingray: 3 }[d.who];
  const col = idx != null ? SPELLS[idx].col : '#8fd8c0';
  c.fillStyle = '#1b262c';
  ell(c, x + 64, y + 70, 40, 40);
  c.fill();
  if (idx != null) drawSpellIcon(c, idx, x + 64, y + 70, 36, 'ready');
  c.lineWidth = 4;
  c.strokeStyle = col;
  ell(c, x + 64, y + 70, 41, 41);
  c.stroke();
  T(c, tr('who.' + d.who), x + 64, y + 142, 17, '#3a4a50', 'center', 600);
  const lines = wrapLines(c, d.text.slice(0, Math.floor(d.t * 48)), 560, 23, 500),
    full = wrapLines(c, d.text, 560, 23, 500);
  full.forEach((ln, i) => {
    const shown = lines[i] || '';
    T(c, shown, x + 130, y + 52 + i * 32, 23, '#232a30', 'left', 500);
  });
  const done = d.t * 48 >= d.text.length;
  if (done) {
    const bx = x + w - 112,
      by = y + h - 50;
    addBtn(bx, by, 90, 36, closeDialog, false);
    pill(c, bx, by, 90, 36, '#2f8f78', 12);
    T(c, tr('ui.ok'), bx + 45, by + 25, 20, '#fff', 'center', 600);
  } else
    addBtn(
      0,
      0,
      W,
      H,
      () => {
        d.t = 99;
      },
      false
    );
}
