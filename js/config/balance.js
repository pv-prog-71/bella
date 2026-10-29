/* Gameplay tuning: edit numbers here to rebalance the game (mana, damage, alternate-world timers, hitbox, transition) */
const ORB_MAX = [80, 180, 320, 520]; // Addendum 3.4: 2 x combined cost of the spells available
const ORB_VALUE = [8, 14, 22, 36];
const BARK_ON_JUMP = 0.04; // chance (0..1) that Bella barks when she jumps
const DOG_TURN_DELAY = 1.0; // seconds the dog keeps running the same way after Bella jumps over it
// Enemy damage is multiplied by the level number's value: the first level bites harder than before (it was too easy),
// the last one a little less (it was too hard), so difficulty grows in an even line. [forest, swamp, mountain, village, alternate world]
const ENEMY_DMG_SCALE = [1.3, 1.1, 1.0, 0.85, 1];
const DMG = { snake: 10, puzzleSnake: 15, spider: 20, wasp: 20, boar: 40, eagle: 50, croc: 60 }; // GDD enemy table (% of health)

/* Alternate World parameters per origin level (shadow speed/damage, countdown in seconds, portal layout). Addendum 3.x */
const ALT_PARAMS = [
  { shadows: ['S1'], patrol: 38, chase: 95, detect: 200, dmg: 12, time: 80, layout: 0, hint: 1.0 },
  {
    shadows: ['S1', 'S2', 'S4'],
    patrol: 46,
    chase: 115,
    detect: 215,
    dmg: 20,
    time: 76,
    layout: 1,
    hint: 0.75
  },
  {
    shadows: ['S1', 'S2', 'S4', 'S5', 'S7'],
    patrol: 54,
    chase: 135,
    detect: 235,
    dmg: 30,
    time: 72,
    layout: 2,
    hint: 0.5
  },
  {
    shadows: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'],
    patrol: 62,
    chase: 155,
    detect: 255,
    dmg: 42,
    time: 68,
    layout: 3,
    hint: 0.3
  }
];

/* Player hitbox half-width / height in pixels (sprite is drawn independently) */
const HW = 15,
  HH = 36;

/* Seizure transition length in seconds (slow fade, never flashing - Addendum 3.2) */
const SZ_DUR = 8.5;
