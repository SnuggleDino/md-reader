; NSIS Installer für MD-Reader
!include "MUI2.nsh"

!define APPNAME "MD-Reader"
!define COMPANYNAME "Meine Projekte"
!define DESCRIPTION "Moderner Markdown Viewer"
!define VERSIONMAJOR 1
!define VERSIONMINOR 0
!define VERSIONBUILD 0

Name "${APPNAME}"
OutFile "MD-Reader-Setup.exe"
InstallDir "$PROGRAMFILES64\${APPNAME}"
InstallDirRegKey HKLM "Software\${APPNAME}" "InstallDir"

; Interface-Einstellungen
!define MUI_ABORTWARNING

; Seiten
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

; Sprachen
!insertmacro MUI_LANGUAGE "German"

Section "Installieren"
    SetOutPath "$INSTDIR"
    
    ; Hauptdatei (Wird nach 'wails build' erstellt)
    File "build\bin\md-reader.exe"
    
    ; Uninstaller erstellen
    WriteUninstaller "$INSTDIR\uninstall.exe"
    
    ; Registry-Einträge für die Software
    WriteRegStr HKLM "Software\${APPNAME}" "InstallDir" "$INSTDIR"
    
    ; --- DATEIASSOZIIATION START ---
    ; Registriere .md Erweiterung
    WriteRegStr HKCR ".md" "" "MDReader.Document"
    WriteRegStr HKCR "MDReader.Document" "" "Markdown Dokument"
    WriteRegStr HKCR "MDReader.Document\shell\open\command" "" '"$INSTDIR\md-reader.exe" "%1"'
    
    ; Windows Explorer Refresh mitteilen
    System::Call 'shell32::SHChangeNotify(i 0x08000000, i 0, i 0, i 0)'
    ; --- DATEIASSOZIIATION ENDE ---

    ; Shortcuts
    CreateDirectory "$SMPROGRAMS\${APPNAME}"
    CreateShortcut "$SMPROGRAMS\${APPNAME}\${APPNAME}.lnk" "$INSTDIR\md-reader.exe"
    CreateShortcut "$DESKTOP\${APPNAME}.lnk" "$INSTDIR\md-reader.exe"

    ; Uninstaller Info für Windows Systemsteuerung
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "DisplayName" "${APPNAME}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "UninstallString" "$INSTDIR\uninstall.exe"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "DisplayIcon" "$INSTDIR\md-reader.exe"
SectionEnd

Section "Uninstall"
    ; Dateiassoziation entfernen
    DeleteRegKey HKCR ".md"
    DeleteRegKey HKCR "MDReader.Document"

    ; Dateien löschen
    Delete "$INSTDIR\md-reader.exe"
    Delete "$INSTDIR\uninstall.exe"
    RMDir "$INSTDIR"

    ; Shortcuts entfernen
    Delete "$SMPROGRAMS\${APPNAME}\${APPNAME}.lnk"
    RMDir "$SMPROGRAMS\${APPNAME}"
    Delete "$DESKTOP\${APPNAME}.lnk"

    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}"
    DeleteRegKey HKLM "Software\${APPNAME}"
    
    ; Windows Explorer Refresh
    System::Call 'shell32::SHChangeNotify(i 0x08000000, i 0, i 0, i 0)'
SectionEnd
