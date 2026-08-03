@echo off
setlocal
cd /d "%~dp0"
title IUH Talent Admissions Portal

set "APP_URL=http://localhost:5173/"

where node >nul 2>&1
if errorlevel 1 (
  echo.
  echo [ERROR] Node.js is not installed.
  echo Please install Node.js from https://nodejs.org and run this file again.
  echo.
  pause
  exit /b 1
)

if not exist "package.json" (
  echo.
  echo [ERROR] package.json was not found.
  echo Keep this file inside the project root folder.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\.bin\vite.cmd" (
  echo Installing project dependencies for the first run...
  echo.

  where pnpm >nul 2>&1
  if not errorlevel 1 (
    call pnpm install
  ) else (
    where corepack >nul 2>&1
    if not errorlevel 1 (
      call corepack pnpm install
    ) else (
      where npm >nul 2>&1
      if errorlevel 1 (
        echo.
        echo [ERROR] No supported package manager was found.
        echo Please reinstall Node.js and run this file again.
        echo.
        pause
        exit /b 1
      )
      call npm install
    )
  )

  if errorlevel 1 (
    echo.
    echo [ERROR] Dependency installation failed.
    echo Check your internet connection and try again.
    echo.
    pause
    exit /b 1
  )
)

echo Starting the website at %APP_URL% ...
start "IUH Website Server" cmd /k "call node_modules\.bin\vite.cmd --host 127.0.0.1 --port 5173 --strictPort"
timeout /t 2 /nobreak >nul

if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
  start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" "%APP_URL%"
  goto :done
)

if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
  start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" "%APP_URL%"
  goto :done
)

if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
  start "" "%LocalAppData%\Google\Chrome\Application\chrome.exe" "%APP_URL%"
  goto :done
)

start "" "%APP_URL%"

:done
echo Website opened. Close the server window to stop the website.
timeout /t 2 /nobreak >nul
exit /b 0
