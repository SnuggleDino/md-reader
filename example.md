# MD-Reader Projekt-Dokumentation

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
