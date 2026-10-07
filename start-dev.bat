@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >/dev/null 2>nul
if errorlevel 1 (
  echo Node.js not found. Install Node.js 20.19+ from https://nodejs.org and run this file again.
  pause
  exit /b 1
)
node -v
if not exist node_modules (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    pause
    exit /b 1
  )
)
echo Starting dev server...
call npm run dev -- --open
pause
