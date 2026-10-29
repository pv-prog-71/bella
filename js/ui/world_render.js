/* World rendering: Bella, entities, atmosphere, seizure darkness */
/* ---------- Bella in the world ---------- */
function drawBellaWorld(c) {
  const b = G.bella;
  let alpha = 1;
  if (G.fx.invis > 0) alpha = 0.3 + 0.04 * Math.sin(G.t * 3);
  else if (b.inv > 0 && !G.sub) alpha = 0.6;
  const alt = G.alt,
    run = b.onGround && Math.abs(b.vx) > 25;
  if (b.onGround) {
    c.fillStyle = 'rgba(0,0,0,0.22)';
    ell(c, b.x, b.y + 1, 18, 4);
    c.fill();
  }
  if (alt) {
    const hg = c.createRadialGradient(b.x, b.y - 28, 6, b.x, b.y - 28, 80);
    hg.addColorStop(0, 'rgba(170,200,255,0.18)');
    hg.addColorStop(1, 'rgba(170,200,255,0)');
    c.fillStyle = hg;
    c.fillRect(b.x - 80, b.y - 108, 160, 160);
  }
  bellaDraw(c, b.x, b.y, {
    scale: 0.54,
    face: b.face,
    run,
    phase: b.phase,
    air: b.air,
    t: G.t,
    alpha,
    squash: b.squash,
    tremble: G.sub === 'seizure',
    glow: alt ? [190, 215, 255, 0.9] : [255, 255, 255, 0.4],
    rim: alt ? 6 : 4
  });
  if (G.fx.resist > 0) {
    const g = c.createRadialGradient(b.x, b.y - 28, 10, b.x, b.y - 28, 56);
    g.addColorStop(0, 'rgba(255,200,140,0.04)');
    g.addColorStop(1, 'rgba(255,190,120,0.4)');
    c.fillStyle = g;
    ell(c, b.x, b.y - 18, 34, 32);
    c.fill();
    c.strokeStyle = 'rgba(255,215,160,0.8)';
    c.lineWidth = 2;
    ell(c, b.x, b.y - 18, 34, 32);
    c.stroke();
  }
  if (G.fx.jump > 0) {
    c.fillStyle = 'rgba(143,224,90,0.55)';
    for (let i = 0; i < 5; i++) {
      const u = (G.t * 1.4 + i * 0.2) % 1;
      ell(c, b.x + Math.sin(i * 3 + G.t) * 22, b.y - u * 40, 3, 3);
      c.fill();
    }
  }
  if (G.held && G.held.state === 'held')
    drawItem(
      c,
      G.held.type,
      b.x + b.face * 36,
      b.y - 26 + (run ? Math.sin(b.phase * 2) * 1.5 : 0),
      0.7
    );
}

/* ---------- world ---------- */
function drawWorld(c) {
  const L = G.L,
    camx = Math.round(G.cam.x),
    camy = Math.round(G.cam.y),
    t = G.t;
  drawSky(c, L.biome, t, camx);
  drawLayers(c, L.biome, camx, t);
  c.save();
  c.translate(-camx, -camy);
  c.drawImage(L.back, camx, camy + L.top, W, H, camx, camy, W, H);
  if (L.drawBack) L.drawBack(c, t);
  if (L.gate) drawGate(c, L, t);
  if (L.portals)
    L.portals.forEach(p => drawPortal(c, p.x, p.y, { t, hint: p.exit ? L.P.hint : 0 }));
  L.items.forEach(it => {
    if (it.state === 'ground') drawItem(c, it.type, it.x, it.y, 1);
  });
  L.orbs.forEach(o => {
    if (!o.got && o.x > camx - 30 && o.x < camx + W + 30) drawOrb(c, o.x, o.y, t, o.ph);
  });
  if (L.drawEntities) L.drawEntities(c, t);
  L.enemies.forEach(e => {
    if (e.draw && e.x > camx - 320 && e.x < camx + W + 320) e.draw(c, t);
  });
  if (G.end && L.isLast) drawEndingProps(c);
  drawBellaWorld(c);
  if (G.wave) {
    const w = G.wave,
      r = w.t * 3000,
      a = clamp(1 - w.t / 1.8, 0, 1);
    c.save();
    c.shadowColor = 'rgba(140,210,255,0.9)';
    c.shadowBlur = 18;
    c.strokeStyle = `rgba(190,235,255,${0.85 * a})`;
    c.lineWidth = 7;
    ell(c, w.x, w.y, r, r * 0.8);
    c.stroke();
    c.strokeStyle = `rgba(120,190,255,${0.5 * a})`;
    c.lineWidth = 3;
    for (let k = 0; k < 14; k++) {
      const an = (k / 14) * TAU + 0.2;
      c.beginPath();
      c.moveTo(w.x + Math.cos(an) * (r - 24), w.y + Math.sin(an) * (r - 24) * 0.8);
      c.lineTo(w.x + Math.cos(an + 0.04) * (r + 6), w.y + Math.sin(an + 0.04) * (r + 6) * 0.8);
      c.stroke();
    }
    c.restore();
  }
  c.drawImage(L.front, camx, camy + L.top, W, H, camx, camy, W, H);
  // hint arrow
  if (!G.dialog && !G.sub && !G.alt && G.hintT > 10 && L.hint) {
    const h = L.hint();
    if (h && !h.noArrow) {
      const y = h.y + Math.sin(t * 4) * 6;
      c.fillStyle = 'rgba(255,240,160,0.95)';
      c.strokeStyle = 'rgba(80,60,0,0.6)';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(h.x, y);
      c.lineTo(h.x + 13, y - 20);
      c.lineTo(h.x + 5, y - 20);
      c.lineTo(h.x + 5, y - 34);
      c.lineTo(h.x - 5, y - 34);
      c.lineTo(h.x - 5, y - 20);
      c.lineTo(h.x - 13, y - 20);
      c.closePath();
      c.fill();
      c.stroke();
    }
  }
  G.sparks.forEach(s => {
    c.globalAlpha = clamp(1 - s.t / s.dur, 0, 1);
    c.fillStyle = s.col;
    ell(c, s.x, s.y, 2.4, 2.4);
    c.fill();
  });
  c.globalAlpha = 1;
  G.bubbles.forEach(bu => {
    c.globalAlpha = clamp(Math.min(bu.t * 5, (bu.dur - bu.t) * 3), 0, 1);
    c.font = `600 17px ${FONT}`;
    const w = c.measureText(bu.text).width + 26;
    pill(c, bu.x - w / 2, bu.y - 30, w, 34, 'rgba(255,255,255,0.96)', 14);
    c.beginPath();
    c.moveTo(bu.x - 6, bu.y + 3);
    c.lineTo(bu.x, bu.y + 12);
    c.lineTo(bu.x + 6, bu.y + 3);
    c.fillStyle = 'rgba(255,255,255,0.96)';
    c.fill();
    T(c, bu.text, bu.x, bu.y - 7, 17, '#2a2a30', 'center', 600);
  });
  c.globalAlpha = 1;
  c.restore();
  L.enemies.forEach(e => {
    if (e.drawWarn) e.drawWarn(c, camx);
  });
  drawAtmos(c, L);
  drawExitCompass(c, L, camx, camy);
}
// Alternate world: from high up (on a tower) Bella can see where the way out is. The glow is weaker in the later levels (ALT_PARAMS.hint).
function drawExitCompass(c, L, camx, camy) {
  if (!G.alt || G.sub || G.dialog || G.bella.y > ALT_VANTAGE_Y) return;
  const exit = L.portals.find(p => p.exit);
  if (!exit) return;
  const strength = 0.3 + 0.7 * L.P.hint,
    pulse = 0.75 + 0.25 * Math.sin(G.t * 3),
    ex = exit.x - camx,
    ey = exit.y - 50 - camy;
  c.save();
  c.globalAlpha = strength * pulse;
  c.shadowColor = 'rgba(255,214,140,0.9)';
  c.shadowBlur = 16;
  c.fillStyle = 'rgba(255,224,160,1)';
  c.beginPath();
  if (ex >= 30 && ex <= 930) {
    // the exit is in view: a golden arrow above it
    const y = clamp(ey - 70, 40, 480) + Math.sin(G.t * 4) * 5;
    c.moveTo(ex, y + 26);
    c.lineTo(ex + 15, y);
    c.lineTo(ex - 15, y);
  } else {
    // out of view: an arrow at the edge of the screen pointing towards it
    const dir = ex < 30 ? -1 : 1,
      x = dir < 0 ? 22 : 938,
      y = clamp(ey, 90, 440);
    c.moveTo(x + dir * 14, y);
    c.lineTo(x - dir * 10, y - 17);
    c.lineTo(x - dir * 10, y + 17);
  }
  c.closePath();
  c.fill();
  c.restore();
}
function drawEndingProps(c) {
  const e = G.end;
  if (e.st < 2) return;
  const bx = 4540,
    u = clamp(e.t / 1.1, 0, 1);
  const g = c.createLinearGradient(0, GY - 100, 0, GY);
  g.addColorStop(0, '#3a2818');
  g.addColorStop(1, '#ffcf86');
  c.fillStyle = g;
  c.fillRect(bx + 95, GY - 100, 110, 100);
  c.fillStyle = '#4a2a18';
  c.fillRect(bx + 95, GY - 100, 55 * (1 - u), 100);
  c.fillRect(bx + 205 - 55 * (1 - u), GY - 100, 55 * (1 - u), 100);
  if (e.t > 1) {
    drawBoy(c, bx + 150, GY, G.t, 1.1);
    if (e.t > 1.4 && e.t < 7) {
      const s = tr('ending.mom');
      c.font = `600 19px ${FONT}`;
      const w = c.measureText(s).width + 30;
      pill(c, bx + 150 - w / 2, GY - 150, w, 38, 'rgba(255,255,255,0.97)', 16);
      c.beginPath();
      c.moveTo(bx + 144, GY - 112);
      c.lineTo(bx + 150, GY - 100);
      c.lineTo(bx + 158, GY - 112);
      c.fillStyle = 'rgba(255,255,255,0.97)';
      c.fill();
      T(c, s, bx + 150, GY - 125, 19, '#2a2a30', 'center', 600);
    }
  }
}
function fogBand(c, x, y, r, col) {
  c.save();
  c.translate(x, y);
  c.scale(1, 0.22);
  const gr = c.createRadialGradient(0, 0, 0, 0, 0, r);
  gr.addColorStop(0, col);
  gr.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = gr;
  c.fillRect(-r, -r, r * 2, r * 2);
  c.restore();
}
function drawAtmos(c, L) {
  const b = L.biome,
    t = G.t;
  if (b === 'forest' || b === 'swamp' || b === 'night') {
    G.parts.forEach(p => {
      c.globalAlpha = 0.35 + 0.35 * Math.sin(t * 1.3 + p.ph);
      c.drawImage(GLOW, p.x - 8 * p.sz, p.y - 8 * p.sz, 16 * p.sz, 16 * p.sz);
    });
    c.globalAlpha = 1;
  } else if (b === 'mountain') {
    c.fillStyle = 'rgba(255,255,255,0.85)';
    G.parts.forEach(p => {
      ell(c, p.x, p.y, p.sz, p.sz);
      c.fill();
    });
  } else if (b === 'village') {
    G.parts.forEach(p => {
      if (p.sz < 2) return;
      c.fillStyle = 'rgba(255,200,230,0.8)';
      ell(c, p.x, p.y, 2.6, 1.5, p.ph);
      c.fill();
    });
  } else if (b === 'alt') {
    c.fillStyle = 'rgba(150,155,170,0.4)';
    G.parts.forEach(p => {
      ell(c, p.x, p.y, p.sz * 0.9, p.sz * 0.9);
      c.fill();
    });
  }
  if (b === 'swamp') {
    for (let i = 0; i < 3; i++)
      fogBand(
        c,
        ((t * 14 + i * 400) % 1500) - 300 + 350,
        390 + i * 30,
        380,
        'rgba(180,235,220,0.2)'
      );
  }
  if (b === 'alt') {
    // soft lantern light around Bella, deep darkness elsewhere
    const bx = G.bella.x - G.cam.x,
      by = G.bella.y - G.cam.y - 30,
      g = c.createRadialGradient(bx, by, 70, bx, by, 560);
    g.addColorStop(0, 'rgba(0,0,8,0)');
    g.addColorStop(0.55, 'rgba(0,0,8,0.38)');
    g.addColorStop(1, 'rgba(0,0,8,0.8)');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    for (let i = 0; i < 2; i++)
      fogBand(c, ((t * 10 + i * 500) % 1500) - 300 + 400, 410, 420, 'rgba(130,135,158,0.2)');
  } else c.drawImage(vignette(), 0, 0);
  if (G.hurtFx > 0) {
    const g = c.createRadialGradient(W / 2, H / 2, 280, W / 2, H / 2, 640);
    g.addColorStop(0, 'rgba(160,0,20,0)');
    g.addColorStop(1, `rgba(160,0,20,${0.5 * G.hurtFx})`);
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
  } // slow fade, no flashing
  if (G.tele) {
    c.fillStyle = `rgba(6,4,20,${0.85 * Math.sin(Math.PI * clamp(G.tele.t / 1, 0, 1))})`;
    c.fillRect(0, 0, W, H);
  }
}

/* ---------- seizure transition: slow darkness closing in around Bella ---------- */
function drawSeizure(c) {
  const sz = G.sz,
    u = clamp(sz.t / SZ_DUR, 0, 1),
    b = G.bella,
    bx = b.x - G.cam.x,
    by = b.y - G.cam.y - 30;
  c.fillStyle = `rgba(14,18,36,${0.5 * ease(clamp(u * 1.3, 0, 1))})`;
  c.fillRect(0, 0, W, H);
  const d = DARK.x,
    k = DARK.w / W;
  d.clearRect(0, 0, DARK.w, DARK.h);
  const ru = clamp((u - 0.2) / 0.8, 0, 1),
    r = lerp(1000, 0, ease(ru));
  if (r > 1) {
    d.globalCompositeOperation = 'source-over';
    d.fillStyle = 'rgba(2,3,8,0.985)';
    d.fillRect(0, 0, DARK.w, DARK.h);
    d.globalCompositeOperation = 'destination-out';
    const rr = r * k,
      cxp = bx * k,
      cyp = by * k;
    const gr = d.createRadialGradient(cxp, cyp, rr * 0.45, cxp, cyp, rr * 1.12);
    gr.addColorStop(0, 'rgba(0,0,0,1)');
    gr.addColorStop(0.65, 'rgba(0,0,0,1)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    d.fillStyle = gr;
    d.beginPath();
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * TAU,
        w =
          1 +
          0.08 * Math.sin(3 * a + G.t * 0.7) +
          0.05 * Math.sin(5 * a - G.t * 0.5) +
          0.03 * Math.sin(9 * a + G.t * 0.3);
      const px = cxp + Math.cos(a) * rr * 1.12 * w,
        py = cyp + Math.sin(a) * rr * 1.12 * w;
      i ? d.lineTo(px, py) : d.moveTo(px, py);
    }
    d.closePath();
    d.fill();
  } else {
    d.globalCompositeOperation = 'source-over';
    d.fillStyle = 'rgba(2,3,8,0.985)';
    d.fillRect(0, 0, DARK.w, DARK.h);
  }
  d.globalCompositeOperation = 'source-over';
  // first: a small patch of darkness appears and spreads
  const pu = clamp(u / 0.3, 0, 1),
    pr = ease(pu) * 200 * (1 - clamp((u - 0.25) / 0.2, 0, 1) * 0.0);
  if (pr > 1) {
    const px = (bx + (sz.bx > 200 ? -300 : 300)) * k,
      py = (by - 90) * k,
      g = d.createRadialGradient(px, py, pr * 0.2 * k, px, py, pr * k);
    g.addColorStop(0, 'rgba(2,3,8,0.95)');
    g.addColorStop(1, 'rgba(2,3,8,0)');
    d.fillStyle = g;
    d.fillRect(0, 0, DARK.w, DARK.h);
  }
  c.imageSmoothingEnabled = true;
  c.drawImage(DARK.c, 0, 0, W, H);
}
