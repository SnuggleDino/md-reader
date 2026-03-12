@echo off
setlocal
echo.
echo ========================================
echo   MD-Reader Build ^& Installer Script
echo ========================================
echo.

:: 1. Wails Build
echo [1/2] Starte Wails Build (Erstellt EXE)...
wails build
if %errorlevel% neq 0 (
    echo.
    echo [FEHLER] Wails Build fehlgeschlagen.
    pause
    exit /b %errorlevel%
)

:: 2. NSIS Installer
echo.
echo [2/2] Erstelle Windows Installer (NSIS)...
makensis installer.nsi
if %errorlevel% neq 0 (
    echo.
    echo [INFO] makensis wurde nicht gefunden oder schlug fehl.
    echo        Stelle sicher, dass NSIS installiert ist und im PATH liegt.
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================
echo   FERTIG! Setup.exe wurde erstellt.
echo ========================================
pause
