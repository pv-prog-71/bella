/* Text helpers and menu buttons */
/* ---------- text helpers ---------- */
function T(c, s, x, y, size, col, align, weight, stroke) {
  c.font = `${weight || 500} ${size}px ${FONT}`;
  c.textAlign = align || 'left';
  c.textBaseline = 'alphabetic';
  if (stroke) {
    c.lineWidth = stroke.w;
    c.strokeStyle = stroke.c;
    c.lineJoin = 'round';
    c.strokeText(s, x, y);
  }
  c.fillStyle = col;
  c.fillText(s, x, y);
}
function wrapLines(c, s, maxW, size, weight) {
  c.font = `${weight || 500} ${size}px ${FONT}`;
  const words = s.split(' '),
    lines = [];
  let cur = '';
  words.forEach(w => {
    const t = cur ? cur + ' ' + w : w;
    if (c.measureText(t).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else cur = t;
  });
  if (cur) lines.push(cur);
  return lines;
}
function pill(c, x, y, w, h, fill, r) {
  rrect(c, x, y, w, h, r == null ? h / 2 : r);
  c.fillStyle = fill;
  c.fill();
}

/* ---------- buttons ---------- */
function addBtn(x, y, w, h, fn, menu) {
  const b = { x, y, w, h, fn, menu: !!menu };
  ui.btns.push(b);
  if (menu) ui.menu.push(b);
  return b;
}
function menuBtn(c, label, x, y, w, h, fn, opts) {
  opts = opts || {};
  const b = addBtn(x, y, w, h, fn, true),
    idx = ui.menu.length - 1;
  const hover = mouse.x >= x && mouse.x <= x + w && mouse.y >= y && mouse.y <= y + h;
  if (hover && ui.hoverIdx !== idx && mouse.moved) {
    ui.focus = idx;
  }
  const foc = ui.focus === idx;
  c.save();
  c.shadowColor = foc ? 'rgba(143,216,192,0.5)' : 'rgba(0,0,0,0)';
  c.shadowBlur = foc ? 16 : 0;
  rrect(c, x, y, w, h, 14);
  c.fillStyle = foc ? 'rgba(24,44,46,0.92)' : 'rgba(10,18,22,0.78)';
  c.fill();
  c.restore();
  rrect(c, x, y, w, h, 14);
  c.lineWidth = foc ? 3 : 1.5;
  c.strokeStyle = foc ? '#8fd8c0' : 'rgba(200,230,220,0.35)';
  c.stroke();
  T(
    c,
    label,
    x + w / 2,
    y + h / 2 + 8,
    opts.size || 22,
    foc ? '#ffffff' : '#d6e6e0',
    'center',
    500
  );
}
