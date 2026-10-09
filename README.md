# X Tweaks

A small, unpacked Chrome extension that makes x.com readable: it collapses the right column,
widens the timeline, enlarges photos and videos, and adds back/forward keyboard shortcuts that
work inside installed-PWA windows.

No build step, no dependencies, no network access, no background service worker — three files
injected into x.com and nothing else.

[中文说明见下 ↓](#x-tweaks-中文说明)

## What it does

**Wide reading layout.** The right column (search, trends, who-to-follow) is hidden by default.
The native navigation and timeline align to the left, removing X's empty centering gutter;
the timeline grows to fill all remaining width beside the navigation. Fixed-width frame wrappers
also shrink on portrait displays, avoiding horizontal overflow. Home,
profiles, posts, search and lists therefore share one column geometry, and pages that have no
right column (Grok, Settings) keep X's own layout. Images and videos scale with the reading column and keep their aspect
ratio. Make X Great Again keeps its floating controls; no blank lane is reserved for its panel.

On Home in wide mode, the floating "new posts" pill and in-flow "Show N posts" row are hidden.
Other status messages remain visible; refresh the page manually when you want new posts.

**Floating toggle.** A button in the bottom-right FAB stack brings the right column back. The
choice is stored in `localStorage`, so it survives reloads and SPA navigation. The button clones
the computed style of X's own Grok/Chat dock buttons at runtime, which is why it tracks light and
dark themes without a theme setting of its own.

**History shortcuts.** `⌘⇧E` goes back, `⌘⇧D` goes forward (`Ctrl` instead of `⌘` off macOS).
Installed-PWA windows have no back/forward buttons, which is the case this exists for; the
shortcuts work in ordinary tabs too.

**Native responsive navigation.** X controls its own expanded or compact navigation. The extension
does not inject labels or force navigation widths, so Chat keeps enough room for the conversation
and composer on portrait displays.

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
| `tests/compact-nav.html` | Local fixture verifying X's compact navigation stays native |
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
- Reading layout is checked at 1152, 1280, 1512, and 1920px, including a portrait display.
  The column fills the actual main area, with no fixed tool lane or 990px frame cap.
  Narrow mobile layouts are not a target.

---

# X Tweaks (中文说明)

一个很小的 Chrome 扩展（未打包加载），用来让 x.com 更适合阅读：折叠右栏、加宽时间线、放大图片和视频，
并补上一组在「安装为 Web App」的窗口里也能用的前进/后退快捷键。

不需要构建、没有依赖、不联网、没有后台 service worker —— 只有三个注入 x.com 的文件。

## 功能

**宽阅读布局。** 默认隐藏右栏（搜索、趋势、推荐关注），原生导航和时间线整体左对齐，消除导航左侧的居中留白。阅读列填满左导航之外的全部剩余宽度，固定宽度的外层容器也随竖屏缩小，避免横向溢出。Make X Great Again 保留悬浮入口，不再预留空白栏。首页、个人主页、帖子详情、搜索、列表因此使用同一套版心；本来就没有右栏的页面（Grok、设置）保持 X 原样。单张图片按原比例在帖子中居中，竖图高度最多 720px；横屏图片和视频随阅读栏放大。

首页宽阅读模式隐藏“有新帖子”悬浮条和“显示 N 条帖子”提示行；其他状态消息仍显示，需要更新时可手动刷新。

**悬浮开关。** 右下角 FAB 那一列里多一个按钮，点一下把右栏放回来。状态存在 `localStorage`，刷新和站内跳转都不会丢。
按钮在运行时直接克隆 X 自己 Grok/Chat 按钮的 computed style，所以它不需要自带主题设置就能跟着明暗主题走。

**历史快捷键。** `⌘⇧E` 后退，`⌘⇧D` 前进（非 macOS 上用 `Ctrl`）。装成 PWA 的窗口没有前进后退按钮，
这组绑定就是为那个场景做的；普通标签页里同样能用。

**导航保持官方响应式布局。** 不再注入导航文字或强制固定宽度，由 X 自己切换展开和紧凑导航，竖屏聊天页为会话和输入框保留完整空间。

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
- 阅读布局按 1152、1280、1512、1920px 检查，包含竖屏；阅读列填满实际主区域，不再预留工具栏，也不受 990px 外层宽度限制。暂不针对手机窄屏布局。
