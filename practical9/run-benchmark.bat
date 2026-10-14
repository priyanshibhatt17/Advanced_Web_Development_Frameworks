@echo off
title Practical 9 All-in-One Benchmark Runner
color 0A
echo ====================================================================
echo               PRACTICAL 9: CACHING BENCHMARK SUITE
echo ====================================================================
echo.

:: 1. Check if backend is running on port 5001; if not, start it!
netstat -ano | findstr :5001 >nul
if %errorlevel% neq 0 (
    echo [INFO] Backend is not running. Starting server on port 5001...
    cd /d "c:\Users\asd\Documents\Advanced Web Development Frameworks\practical9\backend"
    start /min "Practical 9 Backend" node server.js
    echo [INFO] Waiting 3 seconds for server to initialize...
    timeout /t 3 /nobreak >nul
    cd /d "c:\Users\asd\Documents\Advanced Web Development Frameworks\practical9"
) else (
    echo [INFO] Backend is already running on port 5001.
)

echo.
echo [INFO] Running automated benchmarks (uncached vs cached comparison)...
echo ====================================================================
echo.

:: 2. Run the benchmark test
node test-cache.js

echo.
echo ====================================================================
echo       Benchmark Complete! You can take your screenshot now!
echo ====================================================================
echo.
pause
