# X Tweaks

A small, unpacked Chrome extension that makes x.com readable: it collapses the right column,
widens the timeline, enlarges photos and videos, and adds back/forward keyboard shortcuts that
work inside installed-PWA windows.

No build step, no dependencies, no network access, no background service worker — three files
injected into x.com and nothing else.

[中文说明见下 ↓](#x-tweaks-中文说明)

## What it does

**Wide reading layout.** The right column (search, trends, who-to-follow) is hidden by default.
The left navigation and the timeline's left edge stay exactly where X puts them, on every page;
the timeline only grows to the right into the space the right column vacated, stopping 340px
short of the viewport's right edge so it never sits under the Make X Great Again panel. Home,
profiles, posts, search and lists therefore share one column geometry, and pages that have no
right column (Grok, Settings) keep X's own layout. Images and videos scale with the reading column and keep their aspect
ratio, without sitting under the companion extension's popup.

On Home in wide mode, the floating "new posts" pill and in-flow "Show N posts" row are hidden.
Other status messages remain visible; refresh the page manually when you want new posts.

**Floating toggle.** A button in the bottom-right FAB stack brings the right column back. The
choice is stored in `localStorage`, so it survives reloads and SPA navigation. The button clones
the computed style of X's own Grok/Chat dock buttons at runtime, which is why it tracks light and
dark themes without a theme setting of its own.

**History shortcuts.** `⌘⇧E` goes back, `⌘⇧D` goes forward (`Ctrl` instead of `⌘` off macOS).
Installed-PWA windows have no back/forward buttons, which is the case this exists for; the
shortcuts work in ordinary tabs too.

**Persistent navigation labels.** If X switches a page to its compact icon-only navigation, the
extension restores visible labels at X's own expanded geometry, so the navigation looks and
sits the same as on Home. This keeps the left navigation readable on Chat and on any other route where X applies the compact variant.

**Chat stays native.** On `/i/chat` (and the legacy `/messages` route) the open conversation is rendered inside the same
`sidebarColumn` that wide mode hides, so the extension forces X's normal two-pane layout there
and hides the toggle. Your wide/normal choice is untouched and comes back as soon as you leave
the chat page.

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
| `tests/compact-nav.html` | Local regression fixture for X's compact icon-only navigation |
| `store/` | Chrome Web Store listing copy and `package.sh`, which builds the upload zip |

The CSS hangs off attributes on `<html>` rather than generated X class names, which is what makes
it survive X's client-side navigation. Chat routes (`/i/chat` and legacy `/messages`) make wide mode
yield to the chat panes; the script detects SPA navigation by observing `<title>`,
since content scripts can't see the page's `pushState` calls from the isolated world.

## Known limits

- **`⌘⇧D` in ordinary tabs** is Chrome's own "bookmark all tabs" command. A page can't call
  `preventDefault()` on a browser-level shortcut, so in a normal tab you may get the bookmark dialog
  instead. PWA windows generally don't carry that command, which is where the binding matters.
- The layout selectors follow X's `data-testid` attributes (`sidebarColumn`, `primaryColumn`). Those
  are stable in practice but not a contract — if X reshuffles them, the CSS needs a look.
- Desktop layout is checked at 1280, 1512, and 1920px. The reading column is 650px at 1280px,
  766px at 1512px and 970px at 1920px, never wider than X's own two-column row. Narrow
  mobile layouts are not a target.

---

# X Tweaks (中文说明)

一个很小的 Chrome 扩展（未打包加载），用来让 x.com 更适合阅读：折叠右栏、加宽时间线、放大图片和视频，
并补上一组在「安装为 Web App」的窗口里也能用的前进/后退快捷键。

不需要构建、没有依赖、不联网、没有后台 service worker —— 只有三个注入 x.com 的文件。

## 功能

**宽阅读布局。** 默认隐藏右栏（搜索、趋势、推荐关注），左侧导航和时间线左边缘在所有页面都保持 X 原生位置，时间线只向右扩展到右栏腾出的空间，并在距视口右边缘 340px 处停下，不会被 Make X Great Again 面板遮挡。首页、个人主页、帖子详情、搜索、列表因此使用同一套版心；本来就没有右栏的页面（Grok、设置）保持 X 原样。单张图片按原比例在帖子中居中，竖图高度最多 720px；横屏图片和视频随阅读栏放大，不会被浮窗盖住。

首页宽阅读模式隐藏“有新帖子”悬浮条和“显示 N 条帖子”提示行；其他状态消息仍显示，需要更新时可手动刷新。

**悬浮开关。** 右下角 FAB 那一列里多一个按钮，点一下把右栏放回来。状态存在 `localStorage`，刷新和站内跳转都不会丢。
按钮在运行时直接克隆 X 自己 Grok/Chat 按钮的 computed style，所以它不需要自带主题设置就能跟着明暗主题走。

**历史快捷键。** `⌘⇧E` 后退，`⌘⇧D` 前进（非 macOS 上用 `Ctrl`）。装成 PWA 的窗口没有前进后退按钮，
这组绑定就是为那个场景做的；普通标签页里同样能用。

**导航文字始终可见。** X 如果在某个页面切换成只显示图标的紧凑导航，扩展会按 X 原生展开导航的尺寸恢复可见文字，位置和首页一致。聊天页以及以后被 X 套用紧凑导航的其他页面，都不会再丢掉左侧导航文字。

**聊天页保持原生布局。** `/i/chat`（以及旧版 `/messages`）里打开的会话正是渲染在宽屏模式要隐藏的那个
`sidebarColumn` 里，所以扩展在聊天页强制恢复 X 原生的双栏布局，并隐藏悬浮开关。
宽/窄的选择不受影响，离开聊天页后立即恢复。

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
| `tests/compact-nav.html` | X 紧凑型纯图标导航的本地回归夹具 |
| `store/` | Chrome Web Store 上架文案，以及打包用的 `package.sh` |

CSS 挂在 `<html>` 的状态属性上，而不是依赖 X 生成的 class 名，这样前端路由跳转不容易破坏它。
聊天路由（`/i/chat` 和旧版 `/messages`）会让宽屏模式给聊天双栏让路；由于内容脚本在
isolated world 里看不到页面的 `pushState`，它靠监听 `<title>` 变化来感知站内跳转。

## 已知限制

- **普通标签页里的 `⌘⇧D`** 是 Chrome 自己的「将所有标签页加入书签」。页面拦不住浏览器级快捷键，
  所以在普通标签页可能会弹出书签对话框。PWA 窗口一般没有这条命令，而那正是这个绑定真正要解决的场景。
- 布局选择器依赖 X 的 `data-testid`（`sidebarColumn`、`primaryColumn`）。实际上挺稳定，但不是什么契约，
  X 一旦改结构，CSS 就得跟着看一眼。
- 桌面布局按 1280、1512、1920px 检查；阅读列在这三种宽度下分别约为 650、766、970px，不会超过 X 原生双栏的宽度。暂不针对手机窄屏布局。
