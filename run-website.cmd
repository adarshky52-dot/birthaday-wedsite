@echo off
title Romantic Birthday Web Application Manager
echo ============================================================
echo   Starting Premium Romantic Birthday Website fullstack...
echo   Using local SQLite database (database.sqlite)
echo ============================================================
echo.
echo Starting Backend Express server on port 5000...
start cmd /k "cd backend && title Romantic API Backend && npm run dev"

echo.
echo Starting Frontend Next.js server on port 3000...
start cmd /k "cd frontend && title Romantic Frontend NextJS && npm run dev"

echo.
echo ============================================================
echo   Both services are now starting in separate console windows!
echo   - Backend Server: http://localhost:5000
echo   - Frontend Website: http://localhost:3000
echo ============================================================
echo.
echo Launching website in your default browser...
ping 127.0.0.1 -n 7 >nul
start http://localhost:3000

