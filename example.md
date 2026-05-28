# MD-Reader — Feature Showcase

Welcome to the MD-Reader example file. This document is designed to test every
feature of the application: table of contents navigation, sector blocks, code
highlighting, tables, images, and more.

---

## Getting Started

### Sector: What is MD-Reader?
MD-Reader is a fast, distraction-free desktop Markdown viewer built with
**Go**, **Wails v2**, **React 18**, and **TypeScript**. It renders Markdown
files with a clean dark interface and browser-like tab navigation.

- Open any `.md` file via the button, drag & drop, or double-click from Explorer
- Use the sidebar (☰) to navigate sections
- Search with **Ctrl+F**
- Zoom with **Ctrl+Plus** / **Ctrl+Minus**

### Sector: Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl+F` | Focus search bar |
| `Ctrl+,` | Open / close settings |
| `Ctrl++` / `Ctrl+-` | Zoom in / out |
| `Ctrl+0` | Reset zoom |
| `F11` | Toggle focus mode |
| `Alt+Home` | Go to home screen |
| `Alt+↑` | Scroll to top |
| `Esc` | Close panel / clear search |

---

## Markdown Features

### Sector: Text Formatting

You can use **bold**, *italic*, ~~strikethrough~~, and `inline code` freely.

> Blockquotes appear with a left accent border. Great for notes, warnings, or
> quotations from documentation.

Paragraph spacing, line height, and font family are all configurable in
**Settings → Typography**.

### Sector: Code Blocks

MD-Reader supports syntax highlighting for all major languages.

```typescript
interface Tab {
  path: string;
  content: string;
  scrollY: number;
}

function getFileName(path: string): string {
  return path.split(/[/\\]/).pop() ?? path;
}
```

```json
{
  "app": "MD-Reader",
  "version": "4.0",
  "features": ["tabs", "toc", "search", "zoom", "focus-mode"]
}
```

```bash
# Build the application
wails build -platform windows/amd64
```

The code font size, background color, and border radius are all adjustable
in **Settings → Appearance** and **Settings → Typography**.

### Sector: Tables

Tables render with full GFM support and hover highlighting.

| Feature | Status | Since |
| :--- | :---: | ---: |
| Tab bar | ✅ | Commit #1 |
| Table of contents | ✅ | Commit #1 |
| Search & highlight | ✅ | Commit #2 |
| Settings panel (7 tabs) | ✅ | Commit #3 |
| Focus mode | ✅ | Commit #4 |
| Image lightbox | ✅ | Commit #4 |
| Auto-reload | ✅ | Commit #4 |

---

## Navigation & Layout

### Sector: Table of Contents
The sidebar TOC is generated from all **h2** and **h3** headings in the file.
It tracks your scroll position in real time and highlights the active section.

- Click any entry to smooth-scroll to that heading
- The `#` / `##` / `###` prefix shows the heading level
- Child sections show a connecting border line on the left
- The active entry glows in the accent color

Tip: toggle the TOC open by default under **Settings → Reading**.

### Sector: Focus Mode
Press **F11** to enter focus mode. Header and tab bar disappear — only the
content remains. An exit button appears in the top-right corner.

Press **Esc** or **F11** again to exit.

### Sector: Recent Files
The home screen shows your last 8 opened files. Click any entry to reopen it
instantly. Use the trash icon to clear the history.

---

## Settings

### Sector: Appearance
Customize accent color, glow effects, search highlight color, code background,
and border radius under **Settings → Appearance**.

Ten accent color presets are included. A color picker allows any custom hex
value. Changes apply instantly with no restart required.

### Sector: Auto-Reload
When enabled (**Settings → Interface → Auto-reload**), MD-Reader polls the
current file every 3 seconds and reloads it automatically if the content has
changed. Useful when editing and viewing side by side.

---

## Short Section Test

This section intentionally has very little content to verify that the TOC
correctly highlights it when you scroll to the bottom of the document.

### Sector: End of Document
If you can see this section highlighted in the sidebar, the near-bottom
detection is working correctly.
