@echo off
setlocal
cd /d "%~dp0"
title IUH Full System Testing

set "BASE_URL=http://localhost:5173"
set "HOME_URL=%BASE_URL%/"
set "ADMIN_URL=%BASE_URL%/quan-tri-vien.html"
set "TRAINING_URL=%BASE_URL%/dai-dien-phong-dao-tao.html"
set "DEAN_URL=%BASE_URL%/ban-lanh-dao-khoa.html"
set "HEAD_URL=%BASE_URL%/chu-nhiem-nganh.html"
set "LECTURER_URL=%BASE_URL%/giang-vien-phu-trach.html"
set "STUDENT_URL=%BASE_URL%/sinh-vien.html"

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

echo Starting the testing server at %BASE_URL% ...
start "IUH Testing Server" cmd /k "call node_modules\.bin\vite.cmd --host 127.0.0.1 --port 5173 --strictPort"
timeout /t 3 /nobreak >nul

if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
  start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --new-window "%HOME_URL%" "%ADMIN_URL%" "%TRAINING_URL%" "%DEAN_URL%" "%HEAD_URL%" "%LECTURER_URL%" "%STUDENT_URL%"
  goto :done
)

if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
  start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --new-window "%HOME_URL%" "%ADMIN_URL%" "%TRAINING_URL%" "%DEAN_URL%" "%HEAD_URL%" "%LECTURER_URL%" "%STUDENT_URL%"
  goto :done
)

if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
  start "" "%LocalAppData%\Google\Chrome\Application\chrome.exe" --new-window "%HOME_URL%" "%ADMIN_URL%" "%TRAINING_URL%" "%DEAN_URL%" "%HEAD_URL%" "%LECTURER_URL%" "%STUDENT_URL%"
  goto :done
)

start "" "%HOME_URL%"
start "" "%ADMIN_URL%"
start "" "%TRAINING_URL%"
start "" "%DEAN_URL%"
start "" "%HEAD_URL%"
start "" "%LECTURER_URL%"
start "" "%STUDENT_URL%"

:done
echo Opened the home page and all 6 role pages for testing.
echo Close the IUH Testing Server window to stop the website.
timeout /t 3 /nobreak >nul
exit /b 0
