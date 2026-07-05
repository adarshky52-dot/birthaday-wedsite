@echo off
title Romantic Birthday Windows App Compiler
echo ============================================================
echo   Building and Packaging Romantic Birthday Windows App...
echo ============================================================
echo.

:: 1. Build Static Frontend
echo [1/5] Building static Next.js frontend...
cd frontend
set STATIC_EXPORT=true
call npm run build
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Frontend compilation failed!
    pause
    exit /b %ERRORLEVEL%
)
cd ..

:: 2. Copy Static Output to Windows Wrapper
echo [2/5] Cleaning and copying static files to windows-app/out/...
if exist windows-app\out (
    rmdir /s /q windows-app\out
)
mkdir windows-app\out
xcopy /e /y /q frontend\out\* windows-app\out\

:: 3. Install Electron Wrapper Dependencies
echo [3/5] Installing Electron wrapper dependencies...
cd windows-app
call npm install
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Electron dependencies installation failed!
    pause
    exit /b %ERRORLEVEL%
)

:: 4. Build Standalone Portable EXE
echo [4/5] Building standalone portable Windows EXE...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Desktop app packaging failed!
    pause
    exit /b %ERRORLEVEL%
)
cd ..

:: 5. Copy Output to Root Directory
echo [5/5] Deploying Birthday_Scrapbook.exe to root directory...
if exist Birthday_Scrapbook.exe (
    del Birthday_Scrapbook.exe
)

copy /Y "windows-app\dist\Birthday Scrapbook-win32-x64\Birthday Scrapbook.exe" "Birthday_Scrapbook.exe"
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Deployment failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ============================================================
echo   SUCCESSFUL BUILD!
echo   Compiled executable: Birthday_Scrapbook.exe
echo ============================================================
echo.
pause
