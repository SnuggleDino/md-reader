package main

import (
	"context"
	_ "embed"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/sqweek/dialog"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// example.md wird ins Binary eingebettet
//go:embed example.md
var exampleMarkdown string

type App struct {
	ctx context.Context
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) OpenExternalLink(url string) {
	runtime.BrowserOpenURL(a.ctx, url)
}

func (a *App) DownloadAndLoadMd(url string) (string, error) {

	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	resp, err := client.Get(url)
	if err != nil {
		return "", err
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("download failed: %s", resp.Status)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	return string(body), nil
}

func (a *App) LoadRelativeMdFile(currentPath string, relativePath string) (map[string]string, error) {

	dir := filepath.Dir(currentPath)

	fullPath := filepath.Join(dir, relativePath)

	absPath, err := filepath.Abs(fullPath)
	if err != nil {
		return nil, err
	}

	if filepath.Ext(strings.ToLower(absPath)) != ".md" {
		return nil, fmt.Errorf("only .md files allowed")
	}

	content, err := os.ReadFile(absPath)
	if err != nil {
		return nil, err
	}

	return map[string]string{
		"content": string(content),
		"path":    absPath,
	}, nil
}

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

func (a *App) LoadMarkdownFile(path string) (string, error) {

	if path == "" {
		return "", fmt.Errorf("no path provided")
	}

	if filepath.Ext(strings.ToLower(path)) != ".md" {
		return "", fmt.Errorf("only markdown files allowed")
	}

	content, err := os.ReadFile(path)
	if err != nil {
		return "", fmt.Errorf("failed to read file: %w", err)
	}

	return string(content), nil
}

func (a *App) GetStartupFile() string {

	if len(os.Args) > 1 {

		path := os.Args[1]

		if filepath.Ext(strings.ToLower(path)) == ".md" {
			return path
		}
	}

	return ""
}

func (a *App) GetExampleMarkdown() string {

	if exampleMarkdown != "" {
		return exampleMarkdown
	}

	return `
# MD Reader

---

## Sector: EN

### Welcome to MD Reader

Drag a .md file here or use the button above.

#### Features

- Sector Maps
- Dark Mode
- Table of Contents
- Relative Links ([Example](./example.md))

---

## Sektor: DE

### Willkommen beim MD Reader

Ziehe eine .md Datei hierher oder nutze den Button oben.

#### Funktionen

- Sektoren-Karten
- Dark Mode
- Inhaltsverzeichnis
- Relative Links ([Beispiel](./example.md))
`
}