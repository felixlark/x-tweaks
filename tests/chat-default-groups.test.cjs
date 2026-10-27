const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const { JSDOM } = require("jsdom");

const source = readFileSync(path.join(__dirname, "../content.js"), "utf8");

async function waitFor(check) {
  const deadline = Date.now() + 2000;
  while (!check()) {
    if (Date.now() > deadline) assert.fail("Native filter did not reach the expected state");
    await new Promise((resolve) => setTimeout(resolve, 15));
  }
}

function fixture(t, { pathname = "/i/chat", lateShadow = false, portal = false,
  menuDelay = 0, initiallyOpen = false, selected = "All", label = "Groups" } = {}) {
  const dom = new JSDOM("<!doctype html><html><head><title>Chat</title></head><body></body></html>", {
    url: `https://x.com${pathname}`, runScripts: "outside-only", pretendToBeVisual: true
  });
  const { window } = dom;
  const doc = window.document;
  const observers = [];
  const NativeMutationObserver = window.MutationObserver;
  window.MutationObserver = class extends NativeMutationObserver {
    constructor(callback) {
      super(callback);
      observers.push(this);
    }
  };
  t.after(() => {
    observers.forEach((observer) => observer.disconnect());
    window.close();
  });
  window.ResizeObserver = class { observe() {} disconnect() {} };
  const host = doc.createElement("div");
  host.dataset.testid = "xchatEmbedRoute";
  doc.body.append(host);
  let root;
  let menuRoot;
  let trigger;
  let clicks = 0;
  let groupClicks = 0;
  let current = selected;

  function closeMenu() {
    menuRoot.querySelector('[role="menu"]')?.remove();
    trigger.setAttribute("aria-expanded", "false");
  }

  function openMenu() {
    if (menuRoot.querySelector('[role="menu"]')) return;
    const menu = doc.createElement("div");
    menu.setAttribute("role", "menu");
    for (const [id, text] of [["all", "All"], ["groups", label]]) {
      const item = doc.createElement("div");
      item.dataset.testid = `dm-inbox-dropdown-${id}`;
      item.setAttribute("role", "menuitemradio");
      item.setAttribute("aria-checked", String(current === text));
      const span = doc.createElement("span");
      span.textContent = text;
      item.append(span);
      item.addEventListener("click", () => {
        if (id === "groups") groupClicks += 1;
        current = text;
        trigger.textContent = text;
        item.setAttribute("aria-checked", "true");
        closeMenu();
      });
      menu.append(item);
    }
    menuRoot.append(menu);
  }

  function mountTrigger() {
    trigger?.remove();
    trigger = doc.createElement("button");
    trigger.dataset.testid = "dm-inbox-dropdown-trigger";
    trigger.setAttribute("aria-haspopup", "menu");
    trigger.setAttribute("aria-expanded", String(initiallyOpen));
    trigger.textContent = current;
    trigger.addEventListener("click", () => {
      clicks += 1;
      if (trigger.getAttribute("aria-expanded") === "true") {
        closeMenu();
      } else {
        trigger.setAttribute("aria-expanded", "true");
        if (menuDelay) window.setTimeout(openMenu, menuDelay);
        else openMenu();
      }
    });
    root.append(trigger);
    return trigger;
  }

  function mountShadow() {
    root = host.attachShadow({ mode: "open" });
    menuRoot = root;
    if (portal) {
      const overlay = doc.createElement("div");
      overlay.dataset.testid = "xchatEmbedOverlays";
      doc.body.append(overlay);
      menuRoot = overlay.attachShadow({ mode: "open" });
    }
    // Accessing a conversation's text would fail this fixture.
    const conversation = doc.createElement("div");
    Object.defineProperty(conversation, "textContent", { get() { throw Error("Private text accessed"); } });
    root.append(conversation);
    mountTrigger();
    if (initiallyOpen) openMenu();
  }

  if (!lateShadow) mountShadow();
  window.eval(source);

  return {
    window, doc, host, mountShadow, mountTrigger,
    get trigger() { return trigger; },
    get root() { return root; },
    get menuRoot() { return menuRoot; },
    get clicks() { return clicks; },
    get groupClicks() { return groupClicks; },
    navigate(pathname) {
      window.history.pushState(null, "", pathname);
      doc.title = pathname;
    },
    chooseAll() {
      trigger.click();
      menuRoot.querySelector('[data-testid="dm-inbox-dropdown-all"]').click();
    }
  };
}

test("initial visit selects native Groups once and leaves reading layout native", async (t) => {
  const app = fixture(t);
  await waitFor(() => app.trigger.textContent === "Groups");
  assert.equal(app.groupClicks, 1);
  assert.equal(app.trigger.getAttribute("aria-expanded"), "false");
  assert.equal(app.doc.documentElement.getAttribute("data-xr"), "normal");
  assert.equal(app.doc.documentElement.hasAttribute("data-xr-chat"), true);
});

test("manual All survives mutations and opening a conversation within the same visit", async (t) => {
  const app = fixture(t);
  await waitFor(() => app.trigger.textContent === "Groups");
  app.chooseAll();
  app.root.append(app.doc.createElement("span"));
  app.doc.body.append(app.doc.createElement("div"));
  app.navigate("/i/chat/conversation-fixture");
  await new Promise((resolve) => setTimeout(resolve, 300));
  assert.equal(app.trigger.textContent, "All");
  assert.equal(app.groupClicks, 1);
});

test("leaving Chat then returning reinitializes Groups", async (t) => {
  const app = fixture(t);
  await waitFor(() => app.trigger.textContent === "Groups");
  app.chooseAll();
  app.navigate("/home");
  await waitFor(() => app.doc.documentElement.getAttribute("data-xr") === "wide");
  app.navigate("/i/chat");
  await waitFor(() => app.trigger.textContent === "Groups");
  assert.equal(app.groupClicks, 2);
});

test("fresh page and reopened page initialize independently of a prior manual All", async (t) => {
  const first = fixture(t);
  await waitFor(() => first.trigger.textContent === "Groups");
  first.chooseAll();
  const refreshed = fixture(t);
  const reopened = fixture(t);
  await waitFor(() => refreshed.trigger.textContent === "Groups" && reopened.trigger.textContent === "Groups");
  assert.equal(first.trigger.textContent, "All");
});

test("discovers shadowRoot attached after its host, with delayed menu in an overlay", async (t) => {
  const app = fixture(t, { lateShadow: true, portal: true, menuDelay: 40, label: "Groupes" });
  app.mountShadow();
  await waitFor(() => app.trigger.textContent === "Groupes");
  assert.equal(app.groupClicks, 1);
});

test("discovers late attachShadow without a document mutation", async (t) => {
  const app = fixture(t, { lateShadow: true });
  app.mountShadow();
  await waitFor(() => app.trigger.textContent === "Groups");
  assert.equal(app.groupClicks, 1);
});

test("does not take over an already open native filter menu", async (t) => {
  const app = fixture(t, { initiallyOpen: true });
  await new Promise((resolve) => setTimeout(resolve, 300));
  assert.equal(app.trigger.textContent, "All");
  assert.equal(app.clicks, 0);
  assert.equal(app.groupClicks, 0);
  assert.equal(app.trigger.getAttribute("aria-expanded"), "true");
});

test("manual filter interaction during delayed initialization wins", async (t) => {
  const app = fixture(t, { menuDelay: 60 });
  app.trigger.dispatchEvent(new app.window.MouseEvent("pointerdown", { bubbles: true }));
  await waitFor(() => !!app.menuRoot.querySelector('[role="menu"]'));
  app.menuRoot.querySelector('[data-testid="dm-inbox-dropdown-all"]').click();
  await new Promise((resolve) => setTimeout(resolve, 300));
  assert.equal(app.trigger.textContent, "All");
  assert.equal(app.groupClicks, 0);
});

test("already selected Groups closes only the menu opened by initialization", async (t) => {
  const app = fixture(t, { selected: "Groups" });
  await waitFor(() => app.clicks === 2);
  assert.equal(app.groupClicks, 0);
  assert.equal(app.trigger.getAttribute("aria-expanded"), "false");
});

test("trigger remount while waiting for the menu is supported", async (t) => {
  const app = fixture(t, { menuDelay: 60 });
  app.mountTrigger();
  await waitFor(() => app.trigger.textContent === "Groups");
  assert.equal(app.groupClicks, 1);
});

test("other routes never open a Chat filter even when hosts are present", async (t) => {
  for (const pathname of ["/home", "/messages", "/i/chatty"]) {
    const app = fixture(t, { pathname });
    await new Promise((resolve) => setTimeout(resolve, 30));
    assert.equal(app.clicks, 0);
    assert.equal(app.trigger.textContent, "All");
  }
});
