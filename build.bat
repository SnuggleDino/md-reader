@echo off
echo Building MD-Reader...
echo.

echo [1/2] Standard build (EXE only)
wails build
if %errorlevel% neq 0 (
    echo Build failed.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/2] NSIS installer build
wails build --nsis
if %errorlevel% neq 0 (
    echo NSIS build failed. Make sure NSIS is installed: https://nsis.sourceforge.io/
    pause
    exit /b %errorlevel%
)

echo.
echo Done! Output is in build\bin\
pause
