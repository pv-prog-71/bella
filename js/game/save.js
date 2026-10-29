/* Save / load (localStorage with an in-memory fallback) */
/* ---------- save / load ---------- */
let memSave = null;
function loadSave() {
  try {
    const s = localStorage.getItem(SAVE_KEY);
    if (s) {
      memSave = JSON.parse(s);
      return memSave;
    }
  } catch (e) {}
  return memSave;
}
function writeSave() {
  const s = {
    v: 1,
    lvl: G.lvl,
    puz: G.puz.slice(),
    spells: G.spells.slice(),
    mana: Math.floor(G.mana),
    pp: G.puzPos.slice()
  };
  memSave = s;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(s));
  } catch (e) {}
}
function deleteSave() {
  memSave = null;
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) {}
}
function hasSave() {
  return !!(memSave || loadSave());
}
