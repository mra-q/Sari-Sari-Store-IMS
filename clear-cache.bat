@echo off
echo Clearing Metro bundler cache...
cd /d "c:\IT ELECTIVE 4\FINALS\Inventory"

echo.
echo Step 1: Stopping any running Metro processes...
taskkill /F /IM node.exe 2>nul

echo.
echo Step 2: Clearing Metro cache...
if exist .expo\types rmdir /s /q .expo\types
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo Step 3: Clearing Expo cache...
npx expo start --clear

echo.
echo Cache cleared! Metro will restart with a clean cache.
pause
