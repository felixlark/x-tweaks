// X Reader Layout — content script.
//
// CSS lives in content.css and hangs off html[data-xr="wide"], so it survives
// SPA navigation for free. This script only owns the persisted on/off boolean
// and the floating toggle button. Runs in normal tabs AND installed-PWA windows.
(function () {
  "use strict";

  const STORAGE_KEY = "x-reader:right-collapsed";
  const ATTR = "data-xr";
  const BTN_ID = "x-reader-toggle";

  // Default = collapsed (wide). Only an explicit "false" reopens the right column.
  const isCollapsed = () => localStorage.getItem(STORAGE_KEY) !== "false";
  const setCollapsed = (v) => localStorage.setItem(STORAGE_KEY, v ? "true" : "false");

  function apply(collapsed) {
    document.documentElement.setAttribute(ATTR, collapsed ? "wide" : "normal");
    const btn = document.getElementById(BTN_ID);
    if (btn) {
      btn.setAttribute("aria-pressed", collapsed ? "false" : "true");
      btn.title = collapsed ? "显示右栏" : "折叠右栏";
      btn.dataset.collapsed = String(collapsed);
    }
  }

  function toggle() {
    const next = !isCollapsed();
    setCollapsed(next);
    apply(next);
  }

  // "panel-right" glyph: a rounded frame whose right pane fills in while collapsed.
  const ICON = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="3" y="4.5" width="18" height="15" rx="2.2"></rect>
      <rect class="xr-pane" x="14.5" y="4.5" width="6.5" height="15" stroke="none"></rect>
      <line x1="14.5" y1="4.5" x2="14.5" y2="19.5"></line>
    </svg>`;

  // Find X's native bottom-right dock buttons (Grok / Chat), top-to-bottom.
  function dockButtons(btn) {
    return [...document.querySelectorAll('button, a[role="button"], [role="button"]')]
      .filter((el) => el !== btn && !btn.contains(el))
      .map((el) => ({ el, r: el.getBoundingClientRect() }))
      .filter(
        (o) =>
          o.r.width > 0 &&
          o.r.width <= 72 &&
          o.r.right > window.innerWidth - 100 &&
          o.r.bottom > window.innerHeight - 320
      )
      .sort((a, b) => a.r.top - b.r.top);
  }

  // Clone the real dock button's computed chrome (bg / border / radius / shadow /
  // size) so our button matches X's Grok-Chat dock in any theme. Falls back to a
  // light squircle (already set in CSS) until the dock mounts.
  function restyle(btn) {
    const ref = dockButtons(btn)[0];
    if (!ref) return;
    const s = getComputedStyle(ref.el);
    btn.style.backgroundColor = s.backgroundColor;
    btn.style.border = s.border;
    btn.style.borderRadius = s.borderRadius;
    btn.style.boxShadow = s.boxShadow;
    btn.style.color = s.color;
    btn.style.width = s.width;
    btn.style.height = s.height;
    btn.style.backdropFilter = "blur(4px)";
  }

  // Stack the button just above X's native bottom-right FABs, and clone their look.
  function refresh(btn) {
    if (!btn || !btn.isConnected) return;
    try {
      const fabs = dockButtons(btn);
      if (fabs.length) {
        const topMost = fabs[0].r.top;
        const gap = fabs.length > 1 ? Math.max(8, Math.round(fabs[1].r.top - fabs[0].r.bottom)) : 12;
        btn.style.bottom = Math.round(window.innerHeight - topMost + gap) + "px";
      }
      restyle(btn);
    } catch (_e) {
      /* CSS fallback (offset + squircle look) still holds */
    }
  }

  function buildButton() {
    if (document.getElementById(BTN_ID) || !document.body) return;
    const btn = document.createElement("button");
    btn.id = BTN_ID;
    btn.type = "button";
    btn.setAttribute("aria-label", "切换右栏显示");
    btn.innerHTML = ICON;
    btn.addEventListener("click", toggle);
    document.body.appendChild(btn);
    refresh(btn);
    apply(isCollapsed());
    // The dock mounts late; re-stack + re-clone its style a few times, then on resize.
    [300, 800, 1500, 2500].forEach((t) => setTimeout(() => refresh(btn), t));
    window.addEventListener("resize", () => refresh(btn));
  }

  // Apply the switch as early as possible to avoid a flash of the old layout.
  apply(isCollapsed());

  if (document.body) {
    buildButton();
  } else {
    document.addEventListener("DOMContentLoaded", buildButton, { once: true });
  }
})();
