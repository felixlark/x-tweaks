# Chrome Web Store listing

Everything the Developer Dashboard asks for, written out so submission is copy-paste.
Build the upload archive with `./store/package.sh`.

## Item

- **Name**: `X Tweaks`
- **Category**: Social & Communication
- **Language**: English (add Simplified Chinese as a second listing locale; copy below)
- **Version**: taken from `manifest.json` (currently 1.1.0)
- **Icon**: `icons/icon128.png`
- **Homepage / support URL**: `https://github.com/longbiaochen/x-tweaks`

The 132-character cap applies to `manifest.json`'s `description` too, not just the listing field —
upload is rejected outright if the manifest exceeds it. Both are kept identical to the text below.

## Short description (English, 132 char max)

```text
Collapse X's right column, widen the timeline, enlarge photos and videos, and add ⌘⇧E / ⌘⇧D history shortcuts.
```

## Detailed description (English)

```text
X Tweaks makes x.com easier to read.

The right column — search, trends, who-to-follow — is hidden by default, and the timeline expands into the space it leaves behind. Photos and videos scale up with the column, so an image post is actually worth opening. A button in the bottom-right corner brings the right column back whenever you want it; the choice is remembered.

It also adds two keyboard shortcuts: Cmd+Shift+E goes back and Cmd+Shift+D goes forward (Ctrl instead of Cmd on Windows and Linux). This matters most if you have installed x.com as an app — those windows have no back and forward buttons at all — but the shortcuts work in ordinary tabs too.

The extension is deliberately small: three files injected into x.com, no build step, no background service worker, no network requests, no analytics. It reads and writes nothing except one on/off flag in your browser's local storage. The source is on GitHub.

Known limit: in an ordinary tab, Cmd+Shift+D is Chrome's own "bookmark all tabs" command, and a web page cannot override a browser-level shortcut, so you may get the bookmark dialog instead. Installed app windows do not carry that command, which is the case the shortcut is for.

Not affiliated with, endorsed by, or sponsored by X Corp. "X" is used only to say which site the extension works on.
```

## Short description (简体中文, 132 char max)

```text
折叠 x.com 右栏、加宽时间线、放大图片和视频，并补上 ⌘⇧E / ⌘⇧D 前进后退快捷键。
```

## Detailed description (简体中文)

```text
X Tweaks 让 x.com 更适合阅读。

右栏（搜索、趋势、推荐关注）默认折叠，时间线撑开占掉空出来的宽度。图片和视频跟着一起放大，图文帖终于值得点开看。右下角有个按钮可以随时把右栏切回来，状态会记住。

另外补了两个快捷键：Cmd+Shift+E 后退，Cmd+Shift+D 前进（Windows 和 Linux 上用 Ctrl）。如果你把 x.com 装成了应用，这一条尤其有用——那种窗口根本没有前进后退按钮；普通标签页里同样能用。

扩展刻意做得很小：三个注入 x.com 的文件，不需要构建，没有后台 service worker，不发任何网络请求，没有统计。除了在浏览器本地存储里写一个开关状态，它不读也不写任何东西。源码在 GitHub 上。

已知限制：在普通标签页里，Cmd+Shift+D 是 Chrome 自己的「将所有标签页加入书签」，网页无法覆盖浏览器级快捷键，所以可能会弹出书签对话框。装成应用的窗口没有这条命令，而那正是这个快捷键要解决的场景。

本扩展与 X Corp. 无从属、认可或赞助关系，「X」仅用于说明扩展适用于哪个网站。
```

## Privacy practices tab

- **Single purpose**:

  ```text
  X Tweaks adjusts the reading layout of x.com — it collapses the right column, widens the timeline, enlarges media, and provides keyboard shortcuts for browser history navigation on that site.
  ```

- **Host permission justification** (`https://x.com/*`, `https://twitter.com/*`):

  ```text
  The extension's only function is to restyle x.com, so it injects a stylesheet and two small scripts into that site and no other. twitter.com is included because it still serves the same application for users who have not migrated their bookmarks. No other hosts are requested, and the extension has no background page, no network access, and no other permissions.
  ```

- **Remote code**: No. Everything executed is in the package.
- **Data collection**: answer *no* to every category. The extension stores one boolean
  (`x-reader:right-collapsed`) in the site's `localStorage` and transmits nothing.
- **Privacy policy URL**: not required while all data-collection answers are "no".
- Tick the three certification checkboxes (accurate disclosures, no sale of data, use consistent
  with the stated purpose).

## Screenshots — the one thing that has to be captured live

At least one, up to five, at 1280×800 or 640×400, PNG or JPEG. Store policy requires them to show
the extension actually working, so these have to be real captures, not mockups. Suggested set:

1. A timeline in the wide layout, showing an image post at full width.
2. The same view with the right column toggled back, so the button's purpose is visible.
3. An installed-PWA window, since the keyboard shortcuts are aimed at that case.

## Notes before submitting

- **Name and trademark.** The store rejects listings that imply endorsement by a trademark holder.
  "X Tweaks" describes the target site rather than claiming affiliation, and the icon deliberately
  contains no X logo or wordmark, but the disclaimer line at the end of each description is what
  makes the intent explicit. Keep it. If review pushes back, the usual fallback is a distinct name
  with "for X" in the description rather than in the title.
- The zip must have no top-level folder — `store/package.sh` handles that.
- Review typically takes a few days for a listing this small; a rejection e-mail names the exact
  policy clause, so it is worth reading rather than resubmitting blind.
