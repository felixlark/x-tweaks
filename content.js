// X Tweaks — reading-layout content script.
//
// CSS lives in content.css and hangs off html[data-xr="wide"], so it survives
// SPA navigation for free. This script only owns the persisted on/off boolean
// and the floating toggle button. Runs in normal tabs AND installed-PWA windows.
(function () {
  "use strict";

  const STORAGE_KEY = "x-reader:right-collapsed";
  const ATTR = "data-xr";
  const CHAT_ATTR = "data-xr-chat";
  const BTN_ID = "x-reader-toggle";

  // Default = collapsed (wide). Only an explicit "false" reopens the right column.
  const isCollapsed = () => localStorage.getItem(STORAGE_KEY) !== "false";
  const setCollapsed = (v) => localStorage.setItem(STORAGE_KEY, v ? "true" : "false");

  // Chat currently uses /i/chat; keep /messages for older X deployments. The open
  // conversation lives in sidebarColumn, so wide mode must yield to the two panes.
  const isChatRoute = () => /^\/(?:i\/chat|messages)(\/|$)/.test(location.pathname);

  // X also inserts an in-flow "Show N posts" row when new Home posts arrive.
  // Mark only that exact row so CSS can hide its whole 49px footprint in wide
  // mode. X may reuse the node, so remove our mark if its purpose changes.
  function syncNewPostsRow() {
    document.querySelectorAll("[data-xr-new-posts-row]").forEach((row) => {
      const button = row.querySelector('[data-keep-composer-open="true"] > button[role="button"]');
      if (!button || !/^Show \d+ posts?$/.test(button.textContent.trim())) {
        row.removeAttribute("data-xr-new-posts-row");
      }
    });
    if (location.pathname !== "/home") return;
    document.querySelectorAll('[data-testid="primaryColumn"] [data-keep-composer-open="true"] > button[role="button"]').forEach((button) => {
      if (!/^Show \d+ posts?$/.test(button.textContent.trim())) return;
      const row = button.parentElement?.parentElement;
      if (row) row.setAttribute("data-xr-new-posts-row", "");
    });
  }

  function syncSinglePhotos() {
    document.querySelectorAll("[data-xr-photo-frame]").forEach((frame) => {
      if (!frame.isConnected || !frame.querySelector('[data-testid="tweetPhoto"]')) {
        frame.removeAttribute("data-xr-photo-frame");
        frame.style.removeProperty("--xr-photo-ratio");
      }
    });
    if (isChatRoute()) return;
    document.querySelectorAll('[data-testid="primaryColumn"] [data-testid="tweet"] [data-testid="tweetPhoto"]').forEach((photo) => {
      const tweet = photo.closest('[data-testid="tweet"]');
      if (tweet.querySelectorAll('[data-testid="tweetPhoto"]').length !== 1) return;
      if (photo.querySelector('[data-testid="previewInterstitial"], video')) return;
      const img = photo.querySelector("img");
      if (!img?.naturalWidth || !img.naturalHeight) return;
      const frame = photo.closest('[style*="max-width"]');
      if (!frame) return;
      const ratio = String(img.naturalWidth / img.naturalHeight);
      if (frame.style.getPropertyValue("--xr-photo-ratio") !== ratio) {
        frame.style.setProperty("--xr-photo-ratio", ratio);
      }
      frame.setAttribute("data-xr-photo-frame", "");
    });
  }

  // Measure the native inner navigation so the Grok-aligned frame follows X's
  // expanded/compact navigation without imposing our own breakpoint.
  let navWrapper = null;
  const navResizeObserver = new ResizeObserver(() => syncNavigationWidth());
  function syncNavigationWidth() {
    const header = document.querySelector('header:has(nav)');
    const wrapper = header?.firstElementChild;
    if (wrapper !== navWrapper) {
      navResizeObserver.disconnect();
      navWrapper = wrapper || null;
      if (navWrapper) navResizeObserver.observe(navWrapper);
    }
    if (!wrapper) return;
    const width = wrapper.getBoundingClientRect().width;
    if (width > 0) header.style.setProperty("--xr-nav-width", `${width}px`);
  }

  let contentSyncQueued = false;
  function scheduleContentSync() {
    if (contentSyncQueued) return;
    contentSyncQueued = true;
    requestAnimationFrame(() => {
      contentSyncQueued = false;
      syncNewPostsRow();
      syncSinglePhotos();
      syncNavigationWidth();
    });
  }

  function apply(collapsed) {
    const chat = isChatRoute();
    const effective = collapsed && !chat;
    document.documentElement.setAttribute(ATTR, effective ? "wide" : "normal");
    document.documentElement.toggleAttribute(CHAT_ATTR, chat);
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

  // Re-check the route on SPA navigation. Content scripts can't see the page's
  // pushState calls (isolated world), but X rewrites <title> on every route
  // change, so observing it is a cheap, reliable navigation signal.
  function watchRoute() {
    let last = location.pathname;
    const check = () => {
      if (location.pathname === last) return;
      last = location.pathname;
      apply(isCollapsed());
      scheduleContentSync();
    };
    window.addEventListener("popstate", check);
    if (document.head) {
      // Watching <head> (not the <title> element) survives X swapping the element out.
      new MutationObserver(check).observe(document.head, { childList: true, subtree: true });
    }
  }

  function init() {
    buildButton();
    watchRoute();
    syncNewPostsRow();
    syncSinglePhotos();
    syncNavigationWidth();
    new MutationObserver(scheduleContentSync).observe(document.body, { childList: true, subtree: true });
    document.addEventListener("load", (event) => {
      if (event.target.matches?.('[data-testid="tweetPhoto"] img')) scheduleContentSync();
    }, true);
    window.addEventListener("resize", scheduleContentSync);
  }

  // Apply the switch as early as possible to avoid a flash of the old layout.
  apply(isCollapsed());

  if (document.body) {
    init();
  } else {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  }
})();
