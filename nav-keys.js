// X Tweaks — navigation keys.
//
// Installed-PWA windows have no back/forward buttons and swallow the browser's
// own history shortcuts, so we re-bind them inside the page: ⌘⇧E = back,
// ⌘⇧D = forward. Works in normal tabs too. Uses e.code so the binding tracks
// physical keys, not the shifted characters or the active keyboard layout.
(function () {
  "use strict";

  const BINDINGS = {
    KeyE: () => history.back(),
    KeyD: () => history.forward(),
  };

  // Cmd on macOS, Ctrl elsewhere — and nothing else held down.
  function hasChord(e) {
    const primary = navigator.platform.startsWith("Mac") ? e.metaKey : e.ctrlKey;
    const other = navigator.platform.startsWith("Mac") ? e.ctrlKey : e.metaKey;
    return primary && e.shiftKey && !other && !e.altKey;
  }

  // Capture phase + stopImmediatePropagation so X's own keyboard handlers never
  // see the event (it binds plenty of single-letter shortcuts).
  window.addEventListener(
    "keydown",
    (e) => {
      if (e.repeat || !hasChord(e)) return;
      const run = BINDINGS[e.code];
      if (!run) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      run();
    },
    true
  );
})();
