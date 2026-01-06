@echo off
REM Run PowerShell as Administrator and build
echo ====================================
echo  Running as Administrator...
echo ====================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Running as Administrator
    echo.
    cd /d "%~dp0"
    powershell.exe -ExecutionPolicy Bypass -File "build-portable.ps1"
) else (
    echo [!] Need Administrator privileges
    echo [!] Requesting Administrator access...
    echo.
    powershell -Command "Start-Process cmd -ArgumentList '/c cd /d %~dp0 && powershell.exe -ExecutionPolicy Bypass -File build-portable.ps1 && pause' -Verb RunAs"
)

