package main

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/sqweek/dialog"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// OpenExternalLink öffnet eine URL im Standardbrowser
func (a *App) OpenExternalLink(url string) {
	runtime.BrowserOpenURL(a.ctx, url)
}

// DownloadAndLoadMd lädt Markdown von einer URL
func (a *App) DownloadAndLoadMd(url string) (string, error) {
	resp, err := http.Get(url)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	return string(body), nil
}

// LoadRelativeMdFile löst relative Pfade auf und lädt die Datei
func (a *App) LoadRelativeMdFile(currentPath string, relativePath string) (map[string]string, error) {
	// 1. Verzeichnis der aktuellen Datei ermitteln
	dir := filepath.Dir(currentPath)
	
	// 2. Absoluten Pfad zur neuen Datei bauen
	fullPath := filepath.Join(dir, relativePath)
	absPath, err := filepath.Abs(fullPath)
	if err != nil {
		return nil, err
	}

	// 3. Prüfung ob .md
	if !strings.HasSuffix(strings.ToLower(absPath), ".md") {
		return nil, fmt.Errorf("nur .md Dateien erlaubt")
	}

	// 4. Datei lesen
	content, err := os.ReadFile(absPath)
	if err != nil {
		return nil, err
	}

	// Resultat als Map für einfaches Handling im Frontend
	result := make(map[string]string)
	result["content"] = string(content)
	result["path"] = absPath

	return result, nil
}

// OpenFileDialog öffnet den nativen Windows-Dateidialog
func (a *App) OpenFileDialog() string {
	filename, err := dialog.File().
		Filter("Markdown Dateien", "md").
		Title("MD-Datei auswählen").
		Load()
	if err != nil {
		return ""
	}
	return filename
}

// LoadMarkdownFile liest den Inhalt einer .md Datei ein
func (a *App) LoadMarkdownFile(path string) (string, error) {
	if path == "" {
		return "", fmt.Errorf("kein Pfad angegeben")
	}

	content, err := os.ReadFile(path)
	if err != nil {
		return "", fmt.Errorf("konnte Datei nicht lesen: %w", err)
	}

	return string(content), nil
}

// GetStartupFile prüft os.Args
func (a *App) GetStartupFile() string {
	if len(os.Args) > 1 {
		return os.Args[1]
	}
	return ""
}

// GetExampleMarkdown gibt einen Standard-String zurück
func (a *App) GetExampleMarkdown() string {
	return "# Willkommen bei MD-Reader\n\n### Sektor: Start\nZiehe eine .md Datei hierher oder nutze den Button oben.\n\n- **Feature 1:** Sektoren-Karten\n- **Feature 2:** Dark Mode\n- **Feature 3:** Inhaltsverzeichnis\n- **Feature 4:** Relative Links ([Beispiel](./example.md))"
}
