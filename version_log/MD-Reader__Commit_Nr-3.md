# MD-Reader — Commit #3

> Settings-Panel Redesign, neue Einstellungen, offene Punkte geschlossen

---

## 🇩🇪 Deutsch

### Übersicht

Großes Update mit vollständiger Neuentwicklung des Settings-Panels (3 → 7 Tabs),
sechs neuen Einstellungen, die alle live auf die Oberfläche wirken, sowie
Behebung aller offenen Dokumentations- und Infrastruktur-Punkte.

---

### Bug Fixes

**Leerer Streifen unter dem Settings-Panel**
`<main>` hatte immer `padding: '0 0 4rem'`, auch wenn das Settings-Panel offen
war. Das erzeugte einen sichtbaren leeren Streifen am unteren Rand.
Behoben: Padding wird nun konditionell gesetzt — `0` wenn Settings offen, `0 0 4rem` sonst.

**Settings schwer auffindbar**
Der Settings-Reiter war nur am rechten Ende der Tab-Leiste zu finden.
Behoben: Gut sichtbarer ⚙-Button in den Header eingefügt (rechts, neben dem Sprach-Switcher).
Aktiver Zustand wird mit Akzentfarbe markiert.

**Leere Tab-Leiste wirkte wie ein Fehler**
Wenn keine Datei offen war, sah die Tab-Leiste komplett leer aus.
Behoben: Hinweistext „Datei öffnen oder hierher ziehen" erscheint in der leeren Fläche (sprachabhängig DE/EN).

---

### Neue Features

**6 neue Einstellungen (alle live wirksam)**

| Einstellung | Beschreibung |
| :--- | :--- |
| `borderRadius` | Eckig / Standard / Rund — wirkt auf alle UI-Elemente via CSS-Variablen |
| `headingFont` | Sans-Serif oder Serif (IBM Plex Serif) für h1–h4 |
| `codeFontSize` | Slider 11px–18px, wirkt auf SyntaxHighlighter und Inline-Code |
| `sektorBlocks` | h3-Überschriften mit „Sektor:" als Karten oder normale h3 |
| `tocOpenByDefault` | Sidebar beim App-Start automatisch einblenden |
| `compactHeader` | Reduziert Header-Höhe von 48px auf 36px (Transition 0.2s) |

**Settings-Panel vollständig neu gestaltet (7 Tabs)**

| Tab | Inhalt |
| :--- | :--- |
| Erscheinungsbild | Akzentfarbe, Glow, Suchmarkierung, Code-BG, Eckenradius |
| Typografie | Schriftart, Überschriften-Schrift, Zeilenhöhe, Absatzabstand, Code-Größe + Live-Preview |
| Layout | Inhaltsbreite mit visueller Breitenanzeige, Sidebar-Breite |
| Lesemodus | Wörter, Lesezeit, Fortschrittsbalken, Sektor-Blöcke, TOC-Standard |
| Oberfläche | Kompakter Header, Animationen |
| Tastenkürzel | Alle Shortcuts als `<kbd>`-Referenz-Tabelle |
| Info | App-Card, Tech-Stack-Badges, MIT-Lizenz, GitHub-Link |

Design-Verbesserungen: Sidebar mit Gradient-Header, Card-basiertes Layout,
neue Hilfskomponenten (`SettingRow`, `SliderRow`, `ColorRow`, `Kbd`, `TechBadge`),
alle Labels zweisprachig (DE/EN).

---

### Infrastruktur / Dokumentation

- **LICENSE** — MIT-Lizenz angelegt; README-Verweis korrigiert
- **build.bat** — Zweistufiges Build-Skript (EXE + NSIS-Installer) mit Fehlerbehandlung
- **README.md** — Dark-Mode-Beschreibung korrigiert, Shortcuts-Tabelle ergänzt, Settings-Features aktualisiert

---

### Geänderte Dateien

- `frontend/src/App.tsx`
- `frontend/src/components/MarkdownViewer.tsx`
- `frontend/src/components/SettingsPanel.tsx` ← vollständig neu geschrieben
- `frontend/src/context/SettingsContext.tsx`
- `frontend/src/styles/index.css`
- `README.md`
- `LICENSE` ← neu
- `build.bat` ← neu
- `version_log/MD-Reader__Commit_Nr-3.md` ← neu

---
---

## 🇬🇧 English

### Overview

Major update with a complete rewrite of the settings panel (3 → 7 tabs),
six new settings that all apply to the UI in real time, and resolution
of all open documentation and infrastructure issues.

---

### Bug Fixes

**Empty strip below the Settings panel**
`<main>` always had `padding: '0 0 4rem'`, even when the settings panel was open,
creating a visible blank strip at the bottom.
Fixed: Padding is now set conditionally — `0` when settings are open, `0 0 4rem` otherwise.

**Settings hard to find**
The settings entry was only accessible at the far right end of the tab bar.
Fixed: A clearly visible ⚙ button has been added to the header (right side, next to the language switcher).
The active state is highlighted with the accent color.

**Empty tab bar looked like an error**
When no file was open, the tab bar appeared completely blank.
Fixed: A hint text "Open a file or drag it here" now appears in the empty area (language-aware DE/EN).

---

### New Features

**6 new settings (all applied live)**

| Setting | Description |
| :--- | :--- |
| `borderRadius` | Sharp / Default / Rounded — affects all UI elements via CSS variables |
| `headingFont` | Sans-serif or Serif (IBM Plex Serif) for h1–h4 |
| `codeFontSize` | Slider 11px–18px, affects SyntaxHighlighter and inline code |
| `sektorBlocks` | Render h3 headings with "Sektor:" as cards or as plain h3 |
| `tocOpenByDefault` | Automatically open the sidebar on app start |
| `compactHeader` | Reduces header height from 48px to 36px (0.2s transition) |

**Settings panel completely redesigned (7 tabs)**

| Tab | Contents |
| :--- | :--- |
| Appearance | Accent color, glow, search highlight, code background, border radius |
| Typography | Font family, heading font, line height, paragraph spacing, code size + live preview |
| Layout | Content width with visual width indicator, sidebar width |
| Reading | Word count, reading time, progress bar, sector blocks, default TOC state |
| Interface | Compact header, animations |
| Shortcuts | All keyboard shortcuts as a `<kbd>` reference table |
| Info | App card, tech-stack badges, MIT license, GitHub link |

Design improvements: sidebar with gradient header, card-based layout,
new helper components (`SettingRow`, `SliderRow`, `ColorRow`, `Kbd`, `TechBadge`),
all labels bilingual (DE/EN).

---

### Infrastructure / Documentation

- **LICENSE** — MIT license added; README reference corrected
- **build.bat** — Two-stage build script (EXE + NSIS installer) with error handling
- **README.md** — Dark mode description corrected, shortcuts table extended, settings features updated

---

### Changed Files

- `frontend/src/App.tsx`
- `frontend/src/components/MarkdownViewer.tsx`
- `frontend/src/components/SettingsPanel.tsx` ← completely rewritten
- `frontend/src/context/SettingsContext.tsx`
- `frontend/src/styles/index.css`
- `README.md`
- `LICENSE` ← new
- `build.bat` ← new
- `version_log/MD-Reader__Commit_Nr-3.md` ← new
