/* ==========================================================================
   Bella's Journey - English texts (default language)
   --------------------------------------------------------------------------
   Every string the player can read lives in this file.
   * To change a text: edit the value on the right.
   * To translate: copy this file to lang/<code>.js (e.g. lang/it.js), translate
     the values only (keep the keys and the {placeholders}), then point the
     <script src="lang/en.js"> line in index.html to the new file.
   * {name}, {cost}, {state}: placeholders filled in by the game - keep them.
   * Fonts: the bundled font (Fredoka) covers Latin letters only. For other
     scripts add a font to assets/fonts and extend the @font-face in style.css.
   ========================================================================== */
const STRINGS = {
  /* ---- Game & menus ---- */
  "game.title": "Bella's Journey",
  "game.subtitle": "Nightmares on the way home",
  "menu.start": "Start Adventure",
  "menu.continue": "Continue Adventure",
  "menu.new": "New Adventure",
  "menu.music": "Music: {state}",
  "menu.on": "On",
  "menu.off": "Off",
  "menu.credits": "About",
  "menu.quit": "Quit Game",
  "menu.paused": "Paused",
  "menu.k1": "Move: ← → or A D",
  "menu.k2": "Jump: Space (or ↑ / W)",
  "menu.k3": "Use item: E (or ↓ / Enter)",
  "menu.k4": "Spells: 1  2  3  4",
  "menu.k5": "Pause: Esc",
  "menu.confirmTitle": "Start a new adventure?",
  "menu.confirmBody": "This deletes your saved game.",
  "menu.confirmYes": "Yes, start over",
  "menu.cancel": "Cancel",
  "menu.back": "Back",
  "menu.backToTitle": "Back to title",
  "title.noFlash": "No flashing or strobe effects in this game.",
  "title.controlsTouch": "Hold left / right to walk   swipe up to jump   tap Bella to use item",
  "title.controls": "← → / A D move   Space jump   E use item   1-4 spells   Esc pause",
  "ui.ok": "OK",
  "ui.loading": "Loading...",
  "ui.loadError": "Could not load the game files. Check your connection and reload the page.",
  "ui.item": "item",

  /* ---- Credits, thank-you and ending screens ---- */
  "credits.title": "About",
  "credits.header": "Bella's Journey: Nightmares on the way home",
  "credits.controls": "Controls",
  "credits.t1": "Walk: hold the left or right side of the screen",
  "credits.t2": "Jump: swipe up",
  "credits.t3": "Use item: tap Bella (or the item box)",
  "credits.t4": "Spells: tap their icons in the other world",
  "credits.t5": "Pause: tap the menu button",
  "credits.dedication1": "Made for everyone who lives with seizures and fears.",
  "credits.dedication2": "You can live and succeed, and there will be friends to help.",
  "credits.noFlash": "This game contains no flashing or strobe effects.",
  "bye.title": "Thanks for playing!",
  "bye.body": "You can close this tab whenever you like.",
  "end.title": "Bella is home.",
  "end.line1": "She was never alone on the way back.",
  "end.line2": "Thank you for playing.",
  "ending.mom": "Mom! Look! It's Bella... She's home!",

  /* ---- Opening story (cut-scene) ---- */
  "intro.skip": "Skip ›",
  "intro.continue": "Click or press Space to continue",
  "intro.1": "– Mom, Mom!",
  "intro.2": "– What is it, sweetheart? It's very late!",
  "intro.3": "– I can't sleep.",
  "intro.4": "– Okay, I'll tell you a little story.",
  "intro.5": "– One day, a nice little dog named Bella got lost, the mother continues, and no longer knew how to get back home.",
  "intro.6": "She was a very cute and cheerful puppy. However, she was also, let's say... a little special.",
  "intro.7": "From time to time she would stop, start trembling, and everything would become very strange.",
  "intro.8": "– Like me?",
  "intro.9": "– Yes, just like you!",

  /* ---- Level names ---- */
  "level.forest": "Forest",
  "level.swamp": "Swamps",
  "level.mountain": "Mountain",
  "level.village": "Village",
  "level.alt": "Alternate World",

  /* ---- Spells ---- */
  "spell.invis": "Invisibility",
  "spell.jump": "Super Jump",
  "spell.resist": "Resistance",
  "spell.elec": "Electricity",

  /* ---- Speaker names (dialog boxes) ---- */
  "who.Chameleon": "Chameleon",
  "who.Frog": "Frog",
  "who.Bear": "Bear",
  "who.Stingray": "Stingray",

  /* ---- Dialogs (animal asks for help / thanks) ---- */
  "dlg.chameleon.ask": "Help! That snake wants to eat me! Maybe something heavy, dropped from high above, would scare it away.",
  "dlg.chameleon.thanks": "Thank you, Bella! You are so brave. Take my Invisibility spell!",
  "dlg.frog.ask": "I want to cross the swamp, but the crocodiles are hungry, and the bridge is missing a plank! Can you help me, Bella?",
  "dlg.frog.thanks": "You did it, Bella! Ribbit! Take my Super Jump spell!",
  "dlg.bear.ask": "I need something to eat as soon as possible, but I can't move, I'm hurt!",
  "dlg.bear.thanks": "Mmm, delicious honey! Thank you, Bella. Take my Resistance spell!",
  "dlg.ray.ask": "I'm stuck in this fishing net! I can't swim! Please, set me free!",
  "dlg.ray.thanks": "I'm free! Thank you, Bella! Take my Electricity spell!",

  /* ---- Toasts and screen messages ---- */
  "death.alt": "The shadows caught Bella...",
  "death.normal": "Bella is too tired to go on...",
  "toast.spellLearned": "New spell learned: {name}",
  "toast.controls": "← → / A D move   Space jump   E (or click the item box) use item   1-4 spells   Esc pause",
  "toast.touch": "Hold left / right to walk   swipe up to jump   tap Bella to use item",
  "toast.retry": "Bella wakes up and tries again...",
  "toast.noMana": "Not enough mana ({cost} needed)",
  "alt.title": "Find the way back before the time runs out",
  "toast.back": "Bella is back in the normal world",
  "toast.manaFull": "Mana is full",
  "toast.timeout": "Time ran out...",

  /* ---- Speech bubbles ---- */
  "bubble.splash": "Splash!",
  "bubble.helpFirst": "I should help my friend first!",
  "bubble.woof": "Woof! Woof!",
  "bubble.hsss": "Hsss!",
  "bubble.tweet": "Tweet! Yum!",
  "bubble.heavy": "Oof... so heavy!",
  "bubble.bridgeFixed": "The bridge is fixed!",
  "bubble.bzzz": "Bzzzz!",
  "bubble.honey": "Sweet honey!",
  "bubble.guard": "Bzz! The bees guard the honey!",
  "bubble.nom": "Nom nom nom!",
  "bubble.tooClose": "Too close to the hive...",
  "bubble.tooFar": "Too far from the bees...",
  "bubble.omnom": "om nom",
  "bubble.snip": "Snip!",

  /* ---- Hints (appear after a while if the player is stuck) ---- */
  "hint.forest.drop": "Climb to the high ledge and drop the rock above the snake. (E or click the item)",
  "hint.forest.climb": "From the high ledge above the snake you could do something. Climb up!",
  "hint.forest.rock": "From up here you could drop something on the snake. Something heavy would scare it away.",
  "hint.swamp.seed": "The bird likes seeds. Use the item near its tree. (E or click the item)",
  "hint.swamp.podsFar": "The bird likes seeds. The seed plant grows on top of the first big tree, back to the left.",
  "hint.swamp.pods": "The bird seems to like the seeds of this plant. It needs a few!",
  "hint.swamp.branch": "Use the branch at the missing plank. (E or click the item)",
  "hint.swamp.branchFound": "The branch broke! It could repair the bridge.",
  "hint.mtn.bear": "Bring the honey to the bear. (E or click the item)",
  "hint.mtn.drop": "Drop the flower at a spot some way from the hive to lure the bees. (E or click the item)",
  "hint.mtn.climb": "The bees followed the flower! Climb up to the hive.",
  "hint.mtn.honey": "The bear is hungry. Bees make honey: look at the hive up there.",
  "hint.mtn.flower": "Bees love flowers. Maybe one could lure them away.",
  "hint.vil.knife": "Use the knife near the net. (E or click the item)",
  "hint.vil.bone": "Throw the bone to distract the dog. (E or click the item)",
  "hint.vil.busy": "The dog is busy. Quick, get the knife!",
  "hint.vil.guard": "A dog guards the knife. Dogs love bones!",
  "hint.vil.knifeFirst": "The net must be cut. A knife lies next to the fisherman.",
  "hint.vil.knifeGet": "Get the knife next to the sleeping fisherman."
};
