@echo off
title Practical 10: Asynchronous Event-Driven Architecture Runner
color 0B
echo ====================================================================
echo    PRACTICAL 10: ASYNCHRONOUS PROCESSING WITH EVENT-DRIVEN ARCHITECTURE
echo ====================================================================
echo.

:: 1. Check if backend is running on port 5001; if not, start it!
netstat -ano | findstr :5001 >nul
if %errorlevel% neq 0 (
    echo [INFO] Backend is not running. Starting Practical 10 server on port 5001...
    cd /d "D:\Advanced Web Development Frameworks\practical10\backend"
    start "Practical 10 Backend" node server.js
    echo [INFO] Waiting 4 seconds for server to initialize...
    timeout /t 4 /nobreak >nul
    cd /d "D:\Advanced Web Development Frameworks\practical10"
) else (
    echo [INFO] Backend is active on port 5001.
)

echo.
echo [INFO] Running automated asynchronous event benchmark suite...
echo ====================================================================
echo.

:: 2. Run the event testing suite
cd /d "D:\Advanced Web Development Frameworks\practical10"
node test-events.js

echo.
echo ====================================================================
echo       Practical 10 Verification Complete! Take your screenshot now!
echo ====================================================================
echo.
pause
