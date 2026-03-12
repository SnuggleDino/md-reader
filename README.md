# MD-Reader

> A fast, clean desktop Markdown viewer built with **Go + Wails v2 + React**.  
> Designed for developers and writers who want a distraction-free reading experience for `.md` files.

---

## Table of Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Requirements](#requirements)
- [Installation & Build](#installation--build)
- [Usage](#usage)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Contributing](#contributing)

---

## Features

### Core
- **Open files** via file dialog button, drag & drop, or double-click directly from Windows Explorer
- **Markdown rendering** with full [GFM](https://github.github.com/gfm/) support (tables, strikethrough, task lists, etc.)
- **Syntax highlighting** for code blocks (100+ languages via Prism)
- **Inline code** rendered cleanly without visual artifacts
- **Copy button** on every code block

### Navigation
- **Browser-like history** — navigate back and forward between opened files
- **Scroll position memory** — returning to a file restores your exact scroll position
- **Relative `.md` links** — clicking a link to another `.md` file loads it directly in the app
- **External link protection** — a confirmation modal opens before leaving the app to a browser URL

### UI & Customization
- **Dynamic Table of Contents** — auto-generated sidebar from your document headings, with active section tracking via IntersectionObserver
- **Sector blocks** — headings containing "Sektor:" are rendered as visually distinct section cards
- **File pill** in the header showing the currently open filename, with a one-click close button
- **Dark mode** (default) and system-preference mode
- **Language switcher** — full DE / EN interface localization (all UI strings translated)
- **Search bar** — Ctrl+F focuses the search input instantly

---

## Screenshots



---

## Requirements

| Tool | Version |
| :--- | :--- |
| [Go](https://go.dev/dl/) | 1.21+ |
| [Node.js](https://nodejs.org/) | 18+ |
| [Wails CLI](https://wails.io/docs/gettingstarted/installation) | v2.x |
| Windows | 10 / 11 (primary target) |

> macOS and Linux are supported by Wails but have not been tested with this project.

---

## Installation & Build

### 1. Clone the repository

```bash
git clone https://github.com/SnuggleDino/md-reader.git
cd md-reader
```

### 2. Install Go dependencies

```bash
go mod tidy
```

### 3. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

### 4. Run in development mode

```bash
wails dev
```

This opens the app with hot-reload for the React frontend. Go backend changes require a restart.

### 5. Build a production executable

```bash
wails build
```

The compiled binary will be placed in `build/bin/MD-Reader.exe`.

> **Tip:** To also generate a Windows installer (NSIS), run `build.bat` if present, or use `wails build --nsis`.

---

## Usage

### Opening a file

| Method | How |
| :--- | :--- |
| File dialog | Click **"Open file"** in the header |
| Drag & Drop | Drag any `.md` file onto the app window |
| CLI / Explorer | Double-click a `.md` file associated with MD-Reader |

### Navigating between files

- Click any `.md` link inside a document — it loads directly without leaving the app
- Use the **← →** buttons in the header to navigate your file history
- Click the **✕** on the file pill to close the current document

### Sidebar

Click the **☰** button to toggle the Table of Contents. It lists all headings from the current document and highlights the section currently in view. Click any entry to scroll to it.

### Language

Switch between **DE** and **EN** using the language buttons in the top-right corner. The setting is saved and restored on next launch.

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + F` | Focus the search bar |
| `Escape` | Clear search and unfocus |

---

## Project Structure

```
md-reader/
├── app.go                  # Go backend — file loading, dialog, external links
├── main.go                 # Wails app entry point (window size, options)
├── wails.json              # Wails project config
├── go.mod / go.sum         # Go module files
├── example.md              # Sample Markdown file for testing
├── build/
│   └── windows/            # Windows icon and manifest
└── frontend/
    ├── src/
    │   ├── App.tsx          # Main React component — layout, state, i18n
    │   ├── components/
    │   │   ├── MarkdownViewer.tsx    # Markdown renderer with syntax highlighting
    │   │   └── TableOfContents.tsx  # Auto-generated sidebar TOC
    │   └── styles/
    │       └── index.css    # CSS design tokens (dark mode, typography, layout)
    ├── tailwind.config.js
    └── vite.config.ts
```

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Desktop shell | [Wails v2](https://wails.io) |
| Backend | Go 1.21 |
| Frontend | React 18 + TypeScript |
| Styling | Tailwind CSS + CSS custom properties |
| Markdown | [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm) |
| Syntax highlighting | [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter) (Prism, One Dark theme) |
| Icons | [lucide-react](https://lucide.dev) |
| Fonts | IBM Plex Sans / Mono / Serif (Google Fonts) |
| Build tool | Vite |

---

## Contributing

Contributions, issues and feature requests are welcome.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

This project is currently unlicensed. Add a `LICENSE` file if you plan to distribute it publicly.

---

<p align="center">
  Built with ❤️ using Go + Wails + React
</p>