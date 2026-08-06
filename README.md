# X Tweaks

A small, unpacked Chrome extension that makes x.com readable: it collapses the right column,
widens the timeline, enlarges photos and videos, and adds back/forward keyboard shortcuts that
work inside installed-PWA windows.

No build step, no dependencies, no network access, no background service worker — three files
injected into x.com and nothing else.

[中文说明见下 ↓](#x-tweaks-中文说明)

## What it does

**Wide reading layout.** The right column (search, trends, who-to-follow) is hidden by default and
the timeline expands into the space it leaves behind. Images and videos scale up with the column,
so a photo post is actually worth looking at.

**Floating toggle.** A button in the bottom-right FAB stack brings the right column back. The
choice is stored in `localStorage`, so it survives reloads and SPA navigation. The button clones
the computed style of X's own Grok/Chat dock buttons at runtime, which is why it tracks light and
dark themes without a theme setting of its own.

**History shortcuts.** `⌘⇧E` goes back, `⌘⇧D` goes forward (`Ctrl` instead of `⌘` off macOS).
Installed-PWA windows have no back/forward buttons, which is the case this exists for; the
shortcuts work in ordinary tabs too.

## Install

Chrome doesn't allow linking to its own settings pages, so run:

```bash
open -a "Google Chrome" "chrome://extensions"
```

Then turn on **Developer mode**, click **Load unpacked**, and pick this directory. After any change
to the source, hit **Reload** on the extension card and refresh the x.com window (`⌘R`).

## Files

| File | Role |
| --- | --- |
| `manifest.json` | MV3 manifest; content scripts matched against `x.com` and `twitter.com` |
| `content.css` | All layout rules, gated on `html[data-xr="wide"]` |
| `content.js` | Owns the persisted on/off boolean and the floating toggle button |
| `nav-keys.js` | The `⌘⇧E` / `⌘⇧D` history bindings |
| `icons/` | Source SVGs plus the rendered 16/32/48/128 PNGs |
| `store/` | Chrome Web Store listing copy and `package.sh`, which builds the upload zip |

The CSS hangs off a single attribute on `<html>` rather than off DOM structure, which is what makes
it survive X's client-side navigation for free — the script sets the attribute once and never has to
re-apply anything on route changes.

## Known limits

- **`⌘⇧D` in ordinary tabs** is Chrome's own "bookmark all tabs" command. A page can't call
  `preventDefault()` on a browser-level shortcut, so in a normal tab you may get the bookmark dialog
  instead. PWA windows generally don't carry that command, which is where the binding matters.
- The layout selectors follow X's `data-testid` attributes (`sidebarColumn`, `primaryColumn`). Those
  are stable in practice but not a contract — if X reshuffles them, the CSS needs a look.
- Column widths are tuned for roughly a 1512px-wide screen. On a much wider or narrower display the
  `min(899px, …)` clamp in `content.css` is the knob to turn.

---

# X Tweaks (中文说明)

一个很小的 Chrome 扩展（未打包加载），用来让 x.com 更适合阅读：折叠右栏、加宽时间线、放大图片和视频，
并补上一组在「安装为 Web App」的窗口里也能用的前进/后退快捷键。

不需要构建、没有依赖、不联网、没有后台 service worker —— 只有三个注入 x.com 的文件。

## 功能

**宽阅读布局。** 默认隐藏右栏（搜索、趋势、推荐关注），时间线撑开占据腾出来的空间。图片和视频跟着一起放大，
图文帖终于值得点开看。

**悬浮开关。** 右下角 FAB 那一列里多一个按钮，点一下把右栏放回来。状态存在 `localStorage`，刷新和站内跳转都不会丢。
按钮在运行时直接克隆 X 自己 Grok/Chat 按钮的 computed style，所以它不需要自带主题设置就能跟着明暗主题走。

**历史快捷键。** `⌘⇧E` 后退，`⌘⇧D` 前进（非 macOS 上用 `Ctrl`）。装成 PWA 的窗口没有前进后退按钮，
这组绑定就是为那个场景做的；普通标签页里同样能用。

## 安装

Chrome 不允许从链接跳到自己的设置页，所以用命令打开：

```bash
open -a "Google Chrome" "chrome://extensions"
```

打开**开发者模式** → **加载已解压的扩展程序** → 选这个目录。以后改了源码，在扩展卡片上点**重新加载**，
再刷新 x.com 窗口（`⌘R`）。

## 文件结构

| 文件 | 作用 |
| --- | --- |
| `manifest.json` | MV3 manifest，内容脚本匹配 `x.com` 和 `twitter.com` |
| `content.css` | 全部布局规则，挂在 `html[data-xr="wide"]` 上 |
| `content.js` | 负责持久化的开关状态和那个悬浮按钮 |
| `nav-keys.js` | `⌘⇧E` / `⌘⇧D` 历史导航绑定 |
| `icons/` | 图标源 SVG 和渲染出来的 16/32/48/128 PNG |
| `store/` | Chrome Web Store 上架文案，以及打包用的 `package.sh` |

CSS 挂在 `<html>` 的一个属性上，而不是依赖 DOM 结构，这样 X 的前端路由跳转天然不会破坏它 ——
脚本只设置一次属性，之后路由怎么变都不用重新应用。

## 已知限制

- **普通标签页里的 `⌘⇧D`** 是 Chrome 自己的「将所有标签页加入书签」。页面拦不住浏览器级快捷键，
  所以在普通标签页可能会弹出书签对话框。PWA 窗口一般没有这条命令，而那正是这个绑定真正要解决的场景。
- 布局选择器依赖 X 的 `data-testid`（`sidebarColumn`、`primaryColumn`）。实际上挺稳定，但不是什么契约，
  X 一旦改结构，CSS 就得跟着看一眼。
- 列宽是按大约 1512px 宽的屏幕调的。屏幕明显更宽或更窄时，改 `content.css` 里的 `min(899px, …)` 这个夹值。
