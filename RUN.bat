@echo off
setlocal EnableDelayedExpansion

rem Luon dam bao chuyen ve thu muc chua file batch nay, ho tro moi o dia va khoang trang
set "PROJECT_DIR=%~dp0"
cd /d "%PROJECT_DIR%"

title IUH Talent Admissions Portal - Local Server

set "HOST=127.0.0.1"
set "PORT=5173"
set "APP_URL=http://localhost:%PORT%/"

echo ======================================================================
echo     CONG THONG TIN XET TUYEN CU NHAN VA KY SU TAI NANG - IUH
echo ======================================================================
echo.

rem 1. Kiem tra Node.js
where node >nul 2>&1
if errorlevel 1 (
  echo [LOI] Khong tim thay Node.js tren may tinh!
  echo Vui long cai dat Node.js tu https://nodejs.org/ - phien ban LTS.
  echo Sau khi cai dat xong, hay mo lai file nay.
  echo.
  pause
  exit /b 1
)

rem 2. Kiem tra package.json
if not exist "%PROJECT_DIR%package.json" (
  echo [LOI] Khong tim thay file package.json trong thu muc du an!
  echo Hay dam bao file RUN.bat nam o thu muc goc cua du an.
  echo.
  pause
  exit /b 1
)

rem 3. Kiem tra va tu dong cai dat thu vien neu chua co
if not exist "%PROJECT_DIR%node_modules\vite" (
  echo [1/3] Dang cai dat thu vien cho lan chay dau tien...
  echo       Vui long doi trong giay lat...
  echo.

  set "INSTALL_SUCCESS=0"

  where pnpm >nul 2>&1
  if not errorlevel 1 (
    echo [*] Tim thay pnpm, dang cai dat bang pnpm...
    call pnpm install --config.confirmModulesPurge=false
    if exist "%PROJECT_DIR%node_modules\vite" set "INSTALL_SUCCESS=1"
  )

  if "!INSTALL_SUCCESS!"=="0" (
    where npm >nul 2>&1
    if not errorlevel 1 (
      echo [*] Dang cai dat bang npm...
      call npm install
      if exist "%PROJECT_DIR%node_modules\vite" set "INSTALL_SUCCESS=1"
    )
  )

  if "!INSTALL_SUCCESS!"=="0" (
    echo.
    echo [LOI] Cai dat thu vien that bai!
    echo Vui long kiem tra ket noi mang va thu chay thu cong: npm install
    echo.
    pause
    exit /b 1
  )

  echo.
  echo [OK] Cai dat thu vien thanh cong!
  echo.
)

rem 4. Kiem tra xem server da dang hoat dong chua
set "ALREADY_RUNNING=0"
where curl.exe >nul 2>&1
if not errorlevel 1 (
  curl.exe -s -f -m 1 -o nul "http://%HOST%:%PORT%/" >nul 2>&1
  if not errorlevel 1 set "ALREADY_RUNNING=1"
)

if "%ALREADY_RUNNING%"=="1" (
  echo [INFO] Server IUH da dang hoat dong san tai %APP_URL%
  goto :open_browser
)

rem 5. Khoi dong Vite dev server trong cua so rieng
echo [2/3] Dang khoi dong may chu tai %APP_URL% ...
start "IUH Website Server" /d "%PROJECT_DIR%" cmd /k "title IUH Website Server - %APP_URL% & node node_modules\vite\bin\vite.js --host %HOST% --port %PORT%"

rem 6. Cho may chu san sang ket noi
echo [3/3] Dang cho may chu san sang ket noi...
set "SERVER_READY=0"

where curl.exe >nul 2>&1
if not errorlevel 1 (
  for /l %%i in (1,1,20) do (
    if "!SERVER_READY!"=="0" (
      curl.exe -s -f -m 1 -o nul "http://%HOST%:%PORT%/" >nul 2>&1
      if not errorlevel 1 (
        set "SERVER_READY=1"
      ) else (
        ping -n 2 127.0.0.1 >nul 2>&1
      )
    )
  )
) else (
  ping -n 4 127.0.0.1 >nul 2>&1
  set "SERVER_READY=1"
)

:open_browser
echo [OK] May chu da san sang! Dang mo trinh duyet...

rem 7. Mo trinh duyet theo thu tu Chrome, Edge, roi trinh duyet mac dinh
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
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
  start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" "%APP_URL%"
  goto :done
)
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
  start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" "%APP_URL%"
  goto :done
)
if exist "%LocalAppData%\Microsoft\Edge\Application\msedge.exe" (
  start "" "%LocalAppData%\Microsoft\Edge\Application\msedge.exe" "%APP_URL%"
  goto :done
)

start "" "%APP_URL%"

:done
echo.
echo ======================================================================
echo  [HOAN TAT] Website da duoc mo tai: %APP_URL%
echo  Luu y: Giu nguyen cua so "IUH Website Server" trong khi su dung.
echo         Dong cua so do khi muon dung website.
echo ======================================================================
echo.
ping -n 4 127.0.0.1 >nul 2>&1
exit /b 0
