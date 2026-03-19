> settings panel, tab bar, bug fixes & rendering improvements

## Overview
Major update introducing a full settings system, browser-style tab bar,
and several critical bug fixes including an epilepsy-risk flickering issue.

---

## Bug Fixes

### Critical: Image flicker / epilepsy risk on scroll (#1)
Three interacting root causes were identified and fixed:

- `onScroll` fired `setTabs()` on every pixel → React re-rendered the entire
  viewer at up to 60 renders/sec. Fixed with a 150ms debounce and a 2px
  delta threshold — `setTabs` is now only called after the user stops scrolling.

- `MarkdownViewer`'s `components` object was recreated on every render.
  `react-markdown` treats a new object reference as "everything changed" and
  unmounts/remounts all children including `<img>` → browser reloads image →
  `onError` fires → state update → re-render loop. Fixed by wrapping
  `components` in `useMemo`, keyed only to values that actually change it.

- `SafeImage` reset its `broken` state on every parent re-render via
  `useEffect([src])`. Fixed by tracking broken URLs in a `Set<string>` —
  once marked broken, always placeholder, no reset possible mid-render.

### example.md loaded instead of homescreen on startup
`GetExampleMarkdown()` was called unconditionally when no startup file was
provided. Removed — empty state now correctly shows the homescreen.

### Back / Forward navigation (stale closure)
`goBack` / `goForward` read `historyIndex` from a stale closure, always
navigating to the wrong file. Fixed by syncing all critical values to refs
(`navHistRef`, `navIdxRef`, `tabsRef`, `activeTabRef`) that are updated
synchronously — navigation functions now exclusively read from refs.

### Settings: content width had no effect
`MarkdownViewer` used the hardcoded Tailwind class `max-w-4xl` which
overrides CSS variables. Replaced with an inline `style={{ maxWidth }}`
that reads directly from `settings.contentMaxWidth`.

### Settings: code background had no effect
`SyntaxHighlighter`'s `customStyle.background` was hardcoded to `'#0d1117'`.
Now reads `settings.codeBackground` from context.

### Settings: search highlight color had no effect
`HighlightText` applied `background: 'rgba(99,102,241,.35)'` as an inline
style, bypassing the CSS variable. Removed inline style — `<mark>` now
inherits `background: var(--highlight-bg)` from `index.css`, which
`SettingsContext` updates live via `document.documentElement.style.setProperty`.

### Broken images shown as broken browser icon
Added `SafeImage` component with `onError` handler. Relative/local paths
that cannot be resolved in the Wails WebView now show a clean placeholder
with `ImageOff` icon and the alt text or filename.

---

## New Features

### Settings system (SettingsContext + SettingsPanel)
- `SettingsContext.tsx` — React context + provider that persists all settings to `localStorage` and injects them as CSS custom properties on `document.documentElement` in real time. No rebuild required.
- Settings include: accent color (10 presets + custom picker), accent glow toggle + strength, search highlight color (7 presets), code block background (6 presets + custom), content max-width, sidebar width slider, font family, line height slider, paragraph spacing, and display toggles
  for word count, reading time, progress bar, and animations.
- All settings have live previews inside the panel.

### Settings as a proper Tab (not a modal)
- Settings open as a full-content-area view, toggled via a pinned **Settings tab** at the right end of the tab bar — visually identical to file tabs (same height, active state, hover effect, border trick).
- `Escape` closes settings. Opening any file also closes settings.
- No size constraints — fills all available space on any monitor.

### Browser-style Tab Bar
- `TabBar` is now always rendered (previously hidden when no files were open).
- File tabs are scrollable on the left; Settings tab is pinned on the right.
- Tabs show filename + file icon; active tab is "raised" with the classic browser tab border trick (`borderBottom` matches surface background).
- Closing a tab correctly remaps nav history indices.
- Multiple files can be opened simultaneously (including via drag & drop).

### Homescreen with Recent Files
- Shown when no file is open (replaces the old `example.md` auto-load).
- Displays last 8 opened files with filename + directory path.
- "Clear history" button. Clicking a recent file reopens it directly.

### Reading Progress Bar
- 2px gradient bar at the very top of the window.
- Tracks scroll position of the active document in real time.
- Uses `--glow-accent` CSS variable for the accent glow effect.
- Hidden on the Settings tab and when no file is open.
- Can be toggled off in Settings → Display.

### Word Count & Reading Time
- Displayed in the header when a file is open.
- Word count strips code blocks, headings markers, and MD syntax before counting.
- Reading time assumes 200 words/minute, minimum 1 minute.
- Both can be toggled independently in Settings → Display.

### Zoom / Font Size
- `Ctrl++` / `Ctrl+-` / `Ctrl+0` to increase, decrease, and reset font size.
- Range: 12px – 24px. Current size shown in the zoom control in the header.
- Persisted to `localStorage`.

### Search Highlight (working)
- `Ctrl+F` focuses the search bar; `Escape` clears and unfocuses.
- Matches highlighted in all paragraphs, headings, lists, and table cells.
- On new search term, viewport auto-scrolls to the first match.
- Highlight color is configurable in Settings → Appearance.

---

## Refactoring & Optimisations

- `MarkdownViewer` components wrapped in `useMemo` — only rebuilt when `searchTerm`, `codeBg`, or `onLinkClick` actually change.
- `CopyButton`, `SafeImage`, `HighlightText`, `TabBar`, `Homescreen` wrapped in `React.memo` to prevent unnecessary re-renders.
- `handleLinkClick` stabilised with `useCallback`.
- `saveScrollForActive` debounced — eliminates the scroll render storm.
- Removed `Theme` switcher state and UI (always dark mode).
- All code comments in English, minimal, using the `// ── Section ──` style.
- `main.tsx` wraps `<App>` in `<SettingsProvider>` so settings are available globally without prop drilling.

---

## Files Changed
- `frontend/src/App.tsx`
- `frontend/src/main.tsx`
- `frontend/src/components/MarkdownViewer.tsx`
- `frontend/src/components/SettingsPanel.tsx`  ← new
- `frontend/src/context/SettingsContext.tsx`    ← new
- `frontend/src/styles/index.css`
