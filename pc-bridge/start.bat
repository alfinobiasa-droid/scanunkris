@echo off
REM ScanSurat UNKRIS - PC Bridge Startup Script for Windows
REM Place this file in: C:\Users\{username}\Documents\scansurat-unkris\pc-bridge\

setlocal enabledelayedexpansion

REM Colors (requires Windows 10+)
for /F %%A in ('echo prompt $H ^| cmd') do set "BS=%%A"

title ScanSurat PC Bridge

echo.
echo ============================================
echo   ScanSurat UNKRIS - PC Bridge Launcher
echo ============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js detected:
node --version

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] package.json not found
    echo Please run this script from: pc-bridge directory
    echo.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo [WARNING] .env file not found
    echo Creating .env from .env.example...
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo [OK] Created .env file
        echo.
        echo [IMPORTANT] Edit .env file with your Supabase credentials:
        echo   - SUPABASE_URL
        echo   - SUPABASE_ANON_KEY
        echo   - SUPABASE_SERVICE_ROLE_KEY
        echo.
        pause
        echo Opening .env in Notepad...
        notepad ".env"
    ) else (
        echo [ERROR] .env.example not found
        pause
        exit /b 1
    )
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Start the bridge
echo.
echo [INFO] Starting PC Bridge...
echo [INFO] Bridge will run on: http://localhost:3001
echo.
echo [INFO] Extension should connect automatically
echo [INFO] To stop the bridge, press Ctrl+C
echo.

call npm run dev

pause
