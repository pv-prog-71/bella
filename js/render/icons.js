/* Spell icons and HUD glyphs */
function drawSpellIcon(c, i, x, y, r, mode, extra) {
  // mode: 'locked' | 'ready' | 'nomana' | 'active'
  c.save();
  c.translate(x, y);
  const col = SPELLS[i].col,
    locked = mode === 'locked';
  if (locked) c.globalAlpha = 0.45; // not learned yet: almost invisible
  if (mode === 'ready') {
    c.shadowColor = col; // usable now: a soft glow
    c.shadowBlur = 14;
  }
  c.fillStyle = locked ? 'rgba(30,34,40,0.8)' : 'rgba(18,24,30,0.9)';
  ell(c, 0, 0, r, r);
  c.fill();
  c.lineWidth = 3.5;
  c.strokeStyle = locked ? 'rgba(120,130,140,0.5)' : mode === 'active' ? '#fff' : mode === 'nomana' ? col + '88' : col;
  ell(c, 0, 0, r - 2, r - 2);
  c.stroke();
  c.shadowBlur = 0;
  c.globalAlpha = locked ? 0.2 : mode === 'nomana' ? 0.5 : 1;
  const glyph = IMG['icons/spell_' + i + (locked ? '_locked' : '')];
  if (glyph) {
    // the glyph PNG is exported at 2x for a button of radius 30
    const info = ASSET_MANIFEST.icons.spell, // { exportScale, dx, dy }
      k = r / 30 / info.exportScale;
    c.drawImage(glyph, info.dx * k, info.dy * k, glyph.width * k, glyph.height * k);
  }
  c.restore();
  if (mode === 'active' && extra != null) {
    c.save();
    c.translate(x, y);
    c.strokeStyle = '#fff';
    c.lineWidth = 4;
    c.beginPath();
    c.arc(0, 0, r + 3, -Math.PI / 2, -Math.PI / 2 + TAU * extra);
    c.stroke();
    c.restore();
  }
}

/* ---------- small HUD glyphs ---------- */
function drawHeart(c, x, y, s, col) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  c.fillStyle = col;
  c.beginPath();
  c.moveTo(0, 8);
  c.bezierCurveTo(-14, -2, -8, -14, 0, -6);
  c.bezierCurveTo(8, -14, 14, -2, 0, 8);
  c.fill();
  c.restore();
}
function drawClock(c, x, y, r, col) {
  c.save();
  c.translate(x, y);
  c.strokeStyle = col;
  c.lineWidth = 2.5;
  ell(c, 0, 0, r, r);
  c.stroke();
  c.beginPath();
  c.moveTo(0, 0);
  c.lineTo(0, -r * 0.6);
  c.moveTo(0, 0);
  c.lineTo(r * 0.45, r * 0.15);
  c.stroke();
  c.restore();
}
function drawBottle(c, x, y, s, fill, col) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  c.fillStyle = 'rgba(255,255,255,0.1)';
  c.beginPath();
  c.moveTo(-5, -16);
  c.lineTo(-5, -8);
  c.quadraticCurveTo(-16, -2, -14, 8);
  c.quadraticCurveTo(-12, 16, 0, 16);
  c.quadraticCurveTo(12, 16, 14, 8);
  c.quadraticCurveTo(16, -2, 5, -8);
  c.lineTo(5, -16);
  c.closePath();
  c.fill();
  c.save();
  c.clip();
  c.fillStyle = col;
  const top = 16 - fill * 28;
  c.fillRect(-20, top, 40, 40);
  c.fillStyle = 'rgba(255,255,255,0.35)';
  ell(c, 0, top, 14, 2.2);
  c.fill();
  c.restore();
  c.strokeStyle = '#e8eef4';
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(-5, -16);
  c.lineTo(-5, -8);
  c.quadraticCurveTo(-16, -2, -14, 8);
  c.quadraticCurveTo(-12, 16, 0, 16);
  c.quadraticCurveTo(12, 16, 14, 8);
  c.quadraticCurveTo(16, -2, 5, -8);
  c.lineTo(5, -16);
  c.stroke();
  c.fillStyle = '#b08a5a';
  rrect(c, -6, -20, 12, 6, 2);
  c.fill();
  c.restore();
}
function drawBurger(c, x, y, col) {
  c.fillStyle = col;
  for (let i = -1; i <= 1; i++) {
    rrect(c, x - 12, y + i * 8 - 2, 24, 4.5, 2);
    c.fill();
  }
}
