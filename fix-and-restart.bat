@echo off
echo ========================================
echo  Fixing Metro Cache Issue
echo ========================================
echo.

cd /d "c:\IT ELECTIVE 4\FINALS\Inventory"

echo [1/4] Stopping Metro...
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak >nul

echo [2/4] Creating .expo/types directory...
if not exist ".expo\types" mkdir ".expo\types"

echo [3/4] Clearing Metro cache...
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache"

echo [4/4] Starting Metro with clean cache...
echo.
echo ========================================
echo  Metro will now start with clean cache
echo ========================================
echo.

start cmd /k "npx expo start --clear"

echo.
echo Done! Metro is starting in a new window.
echo Close this window and check the Metro window.
pause
