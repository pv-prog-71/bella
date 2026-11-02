/* AUDIO: plays the files in assets/audio/ (no synthesis at runtime).
 *   assets/audio/music_normal.mp3   title, all four levels and the ending
 *   assets/audio/music_alt.mp3      the alternate world
 *   assets/audio/sfx/<name>.mp3     sound effects
 * The files were rendered by project/art_tools/export_audio.js; replace them with any MP3 you like (same names).
 * Plain <audio> elements are used (not WebAudio) so it also works when the game is opened straight from a folder. */
const SND = (function () {
  const SFX_GAIN = { snake_hiss: 0.5, shadowalert: 0.7 }, // effects that are louder or more annoying than the rest are tamed
    LOOP_OVERLAP = 2.5, // seconds: the end of a loop fades out while the start of the next one fades in
    SFX_COPIES = 3; // how many copies of each effect can overlap

  // two separate volumes, 0..1, saved in the browser (music was too loud next to the effects)
  let musicVolume = 0.45,
    sfxVolume = 0.7,
    lastMusicVolume = 0.45;
  try {
    const saved = JSON.parse(localStorage.getItem('bella-audio') || 'null');
    if (saved && typeof saved.music === 'number') musicVolume = Math.max(0, Math.min(1, saved.music));
    if (saved && typeof saved.sfx === 'number') sfxVolume = Math.max(0, Math.min(1, saved.sfx));
    if (musicVolume > 0) lastMusicVolume = musicVolume;
  } catch (e) {}
  function saveVolumes() {
    try {
      localStorage.setItem('bella-audio', JSON.stringify({ music: musicVolume, sfx: sfxVolume }));
    } catch (e) {}
  }
  let ready = false,
    requestedTheme = null, // the theme name the game asked for ('forest', 'alt'...)
    tracks = {}, // 'normal' / 'alt' -> track
    sfxPool = {}; // effect name -> list of <audio> elements

  // Which music file a theme uses: only the alternate world has its own music.
  const trackFor = theme => (theme === 'alt' ? 'alt' : 'normal');

  function audioSource(path) {
    // in the single-file build the files are embedded in AUDIO_DATA
    return (typeof AUDIO_DATA !== 'undefined' && AUDIO_DATA[path]) || 'assets/audio/' + path;
  }

  /* ---------- music ---------- */
  // A track plays two <audio> elements of the same file, so the loop can overlap itself without a gap.
  function makeTrack(name) {
    const path = 'music_' + name + '.mp3';
    const elements = [new Audio(audioSource(path)), new Audio(audioSource(path))];
    elements.forEach(el => (el.preload = 'auto'));
    return { name, elements, current: 0, fade: 0, fadeTarget: 0, fadeSpeed: 1, playing: false };
  }

  function setElementVolume(el, volume) {
    el.volume = Math.max(0, Math.min(1, volume));
  }

  // Called every 50 ms: moves the fade of each track, and handles the loop overlap.
  function tick() {
    const dt = 0.05;
    Object.values(tracks).forEach(track => {
      if (!track.playing) return;
      // fade in / out of the whole track
      if (track.fade < track.fadeTarget) track.fade = Math.min(track.fadeTarget, track.fade + dt * track.fadeSpeed);
      else if (track.fade > track.fadeTarget) track.fade = Math.max(track.fadeTarget, track.fade - dt * track.fadeSpeed);

      const playing = track.elements[track.current],
        other = track.elements[1 - track.current];
      let playingLevel = 1,
        otherLevel = 0;
      if (!other.paused) {
        // overlap: `other` started from the beginning while `playing` is about to end
        otherLevel = Math.min(1, other.currentTime / LOOP_OVERLAP);
        playingLevel = 1 - otherLevel;
        if (other.currentTime >= LOOP_OVERLAP || playing.ended || playing.paused) {
          playing.pause();
          track.current = 1 - track.current; // the other copy is now the main one
          playingLevel = 0;
          otherLevel = 1;
        }
      } else if (playing.duration && playing.currentTime > playing.duration - LOOP_OVERLAP) {
        other.currentTime = 0;
        other.play().catch(() => {});
      }
      setElementVolume(playing, track.fade * musicVolume * playingLevel);
      setElementVolume(other, track.fade * musicVolume * otherLevel);

      if (track.fade === 0 && track.fadeTarget === 0) {
        // fully faded out: stop it
        track.elements.forEach(el => el.pause());
        track.playing = false;
      }
    });
  }

  function startTrack(track, fadeSeconds) {
    const first = track.elements[track.current];
    track.fadeSpeed = 1 / Math.max(0.05, fadeSeconds);
    track.fadeTarget = 1;
    if (!track.playing) {
      track.fade = 0;
      track.elements[0].currentTime = 0;
      track.current = 0;
      setElementVolume(first, 0);
      first.play().catch(() => {});
      track.playing = true;
    }
  }

  function stopTrack(track, fadeSeconds) {
    track.fadeSpeed = 1 / Math.max(0.05, fadeSeconds);
    track.fadeTarget = 0;
  }

  // Switch to a theme. Themes that share a file (all normal levels) just keep playing.
  function music(theme, fadeSeconds) {
    requestedTheme = theme;
    if (!ready) return;
    const fade = fadeSeconds == null ? 2.5 : fadeSeconds;
    const wanted = theme && musicVolume > 0 ? tracks[trackFor(theme)] : null;
    Object.values(tracks).forEach(track => {
      if (track !== wanted && track.playing) stopTrack(track, fade);
    });
    if (wanted) startTrack(wanted, fade);
  }

  function setMusicVolume(v) {
    const was = musicVolume;
    musicVolume = Math.max(0, Math.min(1, Math.round(v * 20) / 20));
    if (musicVolume > 0) lastMusicVolume = musicVolume;
    saveVolumes();
    if (ready && (was === 0) !== (musicVolume === 0)) music(requestedTheme, 0.4); // starts / stops the track
  }
  function setSfxVolume(v) {
    sfxVolume = Math.max(0, Math.min(1, Math.round(v * 20) / 20));
    saveVolumes();
  }
  function setMusicOn(on) {
    // M key: mute / unmute the music (back to the last level)
    setMusicVolume(on ? lastMusicVolume || 0.45 : 0);
  }

  /* ---------- sound effects ---------- */
  function sfx(name) {
    const pool = sfxPool[name];
    if (!ready || !pool || sfxVolume <= 0) return;
    const el = pool.find(e => e.paused || e.ended) || pool[0];
    el.currentTime = 0;
    setElementVolume(el, sfxVolume * (SFX_GAIN[name] || 1));
    el.play().catch(() => {});
  }

  /* ---------- start (must happen after the first click / key press) ---------- */
  function init() {
    if (ready) return;
    ready = true;
    AUDIO_MANIFEST.music.forEach(name => (tracks[name] = makeTrack(name)));
    AUDIO_MANIFEST.sfx.forEach(name => {
      sfxPool[name] = [];
      for (let i = 0; i < SFX_COPIES; i++) {
        const el = new Audio(audioSource('sfx/' + name + '.mp3'));
        el.preload = 'auto';
        sfxPool[name].push(el);
      }
    });
    setInterval(tick, 50);
    if (requestedTheme) music(requestedTheme, 1.5); // music asked for before the first click starts now
  }

  return {
    init,
    music,
    sfx,
    setMusicOn,
    setMusicVolume,
    setSfxVolume,
    get musicVolume() {
      return musicVolume;
    },
    get sfxVolume() {
      return sfxVolume;
    },
    get musicOn() {
      return musicVolume > 0;
    },
    get ready() {
      return ready;
    },
    get theme() {
      return requestedTheme;
    }
  };
})();
