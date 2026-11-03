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

// A volume row: label, a bar and the value. Click (or tap) the bar to set it, left / right of the bar for -/+ 10%, keys Left / Right when focused.
function sliderBtn(c, label, value, x, y, w, h, setFn) {
  const bx = x + 118,
    bw = w - 118 - 62;
  const step = d => setFn(Math.max(0, Math.min(1, Math.round((value + d) * 10) / 10)));
  const b = addBtn(
    x,
    y,
    w,
    h,
    () => {
      if (mouse.x >= bx - 6 && mouse.x <= bx + bw + 6) setFn(Math.max(0, Math.min(1, Math.round(((mouse.x - bx) / bw) * 10) / 10)));
      else if (mouse.x < bx - 6) step(-0.1);
      else step(0.1);
    },
    true
  );
  b.adj = d => step(d * 0.1);
  const idx = ui.menu.length - 1,
    hover = mouse.x >= x && mouse.x <= x + w && mouse.y >= y && mouse.y <= y + h;
  if (hover && ui.hoverIdx !== idx && mouse.moved) ui.focus = idx;
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
  T(c, label, x + 16, y + h / 2 + 7, 19, foc ? '#ffffff' : '#d6e6e0', 'left', 500);
  rrect(c, bx, y + h / 2 - 5, bw, 10, 5);
  c.fillStyle = 'rgba(255,255,255,0.14)';
  c.fill();
  if (value > 0) {
    rrect(c, bx, y + h / 2 - 5, Math.max(10, bw * value), 10, 5);
    c.fillStyle = foc ? '#8fd8c0' : '#6fb8a2';
    c.fill();
  }
  c.beginPath();
  c.arc(bx + bw * value, y + h / 2, 9, 0, Math.PI * 2);
  c.fillStyle = '#f2fbf6';
  c.fill();
  T(c, Math.round(value * 100) + '%', x + w - 14, y + h / 2 + 7, 17, foc ? '#ffffff' : '#d6e6e0', 'right', 500);
}
