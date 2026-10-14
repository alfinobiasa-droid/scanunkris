@echo off
REM ScanSurat UNKRIS - PC Bridge Stop Script for Windows

echo.
echo Stopping ScanSurat PC Bridge...
echo.

REM Kill any node process running on port 3001
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001"') do (
    echo Found process on port 3001: %%a
    taskkill /pid %%a /f >nul 2>&1
    if errorlevel 0 (
        echo [OK] Process terminated
    )
)

echo.
echo PC Bridge stopped.
echo.

pause
