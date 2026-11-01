/* The single game-state object G */
const G = {
  state: 'title',
  sub: null,
  paused: false,
  t: 0,
  bella: {
    x: 120,
    y: GY,
    vx: 0,
    vy: 0,
    face: 1,
    onGround: true,
    coyote: 0,
    buf: 0,
    phase: 0,
    squash: 0,
    inv: 0,
    jumpHeld: false,
    air: 0
  },
  hp: 100,
  mana: 0,
  spells: [false, false, false, false],
  puz: [false, false, false, false],
  held: null,
  lvl: 0,
  L: null,
  normalL: null,
  normalPos: null,
  mode: 'normal',
  cam: { x: 0, y: 0 }, // y is 0 on the ground and negative when the camera has climbed (see L.top)
  fx: { invis: 0, jump: 0, resist: 0 },
  wave: null,
  toasts: [],
  bubbles: [],
  dialog: null,
  parts: [],
  sparks: [],
  fadeA: 0,
  fadeTo: 0,
  fadeSpd: 1,
  hurtFx: 0,
  hintT: 0,
  sinceHurt: 99,
  saveT: 0,
  seizureTimer: -1,
  puzPos: [null, null, null, null],
  sz: null,
  tele: null,
  titleCard: null,
  portalCool: 0,
  fullToastT: 0,
  barkT: 6, // seconds until Bella may bark at a nearby enemy while standing still
  gateToastT: 0,
  end: null,
  lastSafe: null,
  musicName: null
};
Object.defineProperty(G, 'altInvis', {
  get() {
    return G.fx.invis > 0;
  }
});
Object.defineProperty(G, 'alt', {
  get() {
    return G.mode === 'alt';
  }
});
