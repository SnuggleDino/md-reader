## ENG / ENG - MD Reader Project Documentation

Welcome to the extended test document. Here we test the Table of Contents, Dark Mode, and Sector display.

### Sector: Introduction
The **MD Reader** is a high-performance viewer for Markdown files. It is designed to present information in a structured and visually appealing way.

- **Goal:** Maximum readability.
- **Technology:** Go + React + Tailwind.
- **Special Feature:** Sector cards for clear separation.

### Sector: Installation
Installation is done using the Go tooling and NPM for the frontend.

1. Install the Wails CLI
2. Clone the repository
3. Run `go mod tidy`
4. Run `npm install` in the frontend folder

### Sector: Configuration
Here is an example configuration in JSON:

```json
{
  "app": "MD-Reader",
  "version": "1.0.0",
  "features": [
    "Drag & Drop",
    "Dark Mode",
    "TOC"
  ]
}
```

### Sector: Troubleshooting
If the application does not start, check the following points in the table:

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| White screen | Frontend not built | Run `npm run build` |
| File not loading | Invalid path | Try Drag & Drop again |
| Dark Mode missing | Tailwind configuration | Check `darkMode: 'class'` |

> "Reading documentation should feel like an experience, not like work."

### Sector: Outlook
Planned future features:

- PDF export
- Full-text search
- Plugin system

---

Good luck testing!

## DEU / GER - MD-Reader Projekt-Dokumentation

Willkommen in der erweiterten Testdatei. Hier testen wir das Inhaltsverzeichnis, den Dark Mode und die Sektor-Darstellung.

### Sektor: Einleitung
Der **MD-Reader** ist ein hochperformanter Viewer für Markdown-Dateien. Er ist darauf optimiert, Informationen strukturiert und ästhetisch ansprechend darzustellen.

- **Ziel:** Maximale Lesbarkeit.
- **Technik:** Go + React + Tailwind.
- **Spezialität:** Sektor-Karten für klare Abgrenzung.

### Sektor: Installation
Die Installation erfolgt über das Go Tooling und NPM für das Frontend.

1. Wails CLI installieren
2. Repository klonen
3. `go mod tidy` ausführen
4. `npm install` im frontend Ordner

### Sektor: Konfiguration
Hier ist eine Beispiel-Konfiguration in JSON:

```json
{
  "app": "MD-Reader",
  "version": "1.0.0",
  "features": [
    "Drag & Drop",
    "Dark Mode",
    "TOC"
  ]
}
```

### Sektor: Fehlerbehebung
Falls die App nicht startet, prüfe bitte folgende Punkte in der Tabelle:

| Problem | Ursache | Lösung |
| :--- | :--- | :--- |
| Weißer Bildschirm | Frontend nicht gebaut | `npm run build` |
| Datei lädt nicht | Pfad ungültig | Drag & Drop erneut versuchen |
| Dark Mode fehlt | Tailwind Config | `darkMode: 'class'` prüfen |

> "Das Lesen von Dokumentationen sollte sich wie ein Erlebnis anfühlen, nicht wie Arbeit."

### Sektor: Ausblick
In Zukunft planen wir:
- PDF Export
- Volltextsuche
- Plugin-System

---
Viel Erfolg beim Testen!
