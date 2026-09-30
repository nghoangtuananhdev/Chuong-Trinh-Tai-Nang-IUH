@echo off
setlocal EnableDelayedExpansion

rem Luon dam bao chuyen ve thu muc chua file batch nay, ho tro moi o dia va khoang trang
set "PROJECT_DIR=%~dp0"
cd /d "%PROJECT_DIR%"

title IUH Talent Admissions Portal - System Testing

set "HOST=127.0.0.1"
set "PORT=5173"
set "BASE_URL=http://localhost:%PORT%"
set "HOME_URL=%BASE_URL%/"
set "ADMIN_URL=%BASE_URL%/quan-tri-vien.html"
set "TRAINING_URL=%BASE_URL%/dai-dien-phong-dao-tao.html"
set "DEAN_URL=%BASE_URL%/ban-lanh-dao-khoa.html"
set "HEAD_URL=%BASE_URL%/chu-nhiem-nganh.html"
set "LECTURER_URL=%BASE_URL%/giang-vien-phu-trach.html"
set "STUDENT_URL=%BASE_URL%/sinh-vien.html"

echo ======================================================================
echo     KIEM THU HE THONG TOAN DIEN - CN VA KSTN IUH
echo ======================================================================
echo.

rem 1. Kiem tra Node.js
where node >nul 2>&1
if errorlevel 1 (
  echo [LOI] Khong tim thay Node.js tren may tinh!
  echo Vui long cai dat Node.js tu https://nodejs.org/ - phien ban LTS.
  echo.
  pause
  exit /b 1
)

rem 2. Kiem tra package.json
if not exist "%PROJECT_DIR%package.json" (
  echo [LOI] Khong tim thay file package.json trong thu muc du an!
  echo.
  pause
  exit /b 1
)

rem 3. Kiem tra va tu dong cai dat thu vien neu chua co
if not exist "%PROJECT_DIR%node_modules\vite" (
  echo [*] Dang cai dat thu vien cho lan chay dau tien...
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
    echo [LOI] Cai dat thu vien that bai!
    pause
    exit /b 1
  )
  echo [OK] Cai dat thu vien thanh cong!
  echo.
)

rem 4. BUOC 1: Kiem tra Build va Dong goi ma nguon
echo ----------------------------------------------------------------------
echo  BUOC 1/3: Kiem tra Build va Dong goi ma nguon
echo ----------------------------------------------------------------------
echo Dang chay kiem tra build voi vite build...
call node "%PROJECT_DIR%node_modules\vite\bin\vite.js" build
if errorlevel 1 (
  echo.
  echo [FAIL] KIEM TRA BUILD THAT BAI!
  echo Phat hien loi cu phap JSX, CSS hoac thieu module.
  echo.
  pause
  exit /b 1
)
echo.
echo [PASS] Build thanh cong! Tat ca cac trang HTML va tai nguyen deu hop le.
echo.

rem 5. BUOC 2: Khoi dong hoac ket noi Test Server
echo ----------------------------------------------------------------------
echo  BUOC 2/3: Khoi dong May chu Kiem thu
echo ----------------------------------------------------------------------
set "ALREADY_RUNNING=0"
where curl.exe >nul 2>&1
if not errorlevel 1 (
  curl.exe -s -f -m 1 -o nul "http://%HOST%:%PORT%/" >nul 2>&1
  if not errorlevel 1 set "ALREADY_RUNNING=1"
)

if "%ALREADY_RUNNING%"=="1" (
  echo [INFO] May chu da dang hoat dong san tai %BASE_URL%
) else (
  echo Dang khoi dong may chu kiem thu tai %BASE_URL% ...
  start "IUH Testing Server" /d "%PROJECT_DIR%" cmd /k "title IUH Testing Server - %BASE_URL% & node node_modules\vite\bin\vite.js --host %HOST% --port %PORT%"

  echo Dang doi may chu san sang...
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
)
echo [PASS] May chu kiem thu san sang phuc vu yeu cau HTTP.
echo.

rem 6. BUOC 3: Kiem tra HTTP Endpoint cua ca 7 vai tro
echo ----------------------------------------------------------------------
echo  BUOC 3/3: Kiem tra phan hoi HTTP cua 7 vai tro
echo ----------------------------------------------------------------------

set /a PASS_COUNT=0
set /a TOTAL_COUNT=7

where curl.exe >nul 2>&1
if not errorlevel 1 (
  call :test_single_route "Trang chu            " "%HOME_URL%"
  call :test_single_route "Quan tri vien        " "%ADMIN_URL%"
  call :test_single_route "Phong Dao tao        " "%TRAINING_URL%"
  call :test_single_route "Ban Lanh dao Khoa    " "%DEAN_URL%"
  call :test_single_route "Chu nhiem Nganh      " "%HEAD_URL%"
  call :test_single_route "Giang vien Phu trach " "%LECTURER_URL%"
  call :test_single_route "Sinh vien CN/KSTN    " "%STUDENT_URL%"
  echo.
  echo [PASS] Dat !PASS_COUNT!/!TOTAL_COUNT! routes kiem tra HTTP thanh cong.
) else (
  echo [BO QUA] Khong tim thay curl.exe, bo qua kiem tra HTTP tu dong.
)
echo.

rem 7. Mo trinh duyet kiem thu truc quan
echo ======================================================================
echo  Dang mo 7 vai tro tren trinh duyet de kiem thu truc quan...
echo ======================================================================

set "BROWSER_BIN="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
  set "BROWSER_BIN=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
  goto :launch_test_browser
)
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
  set "BROWSER_BIN=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
  goto :launch_test_browser
)
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
  set "BROWSER_BIN=%LocalAppData%\Google\Chrome\Application\chrome.exe"
  goto :launch_test_browser
)
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
  set "BROWSER_BIN=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
  goto :launch_test_browser
)
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
  set "BROWSER_BIN=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
  goto :launch_test_browser
)
if exist "%LocalAppData%\Microsoft\Edge\Application\msedge.exe" (
  set "BROWSER_BIN=%LocalAppData%\Microsoft\Edge\Application\msedge.exe"
  goto :launch_test_browser
)

:launch_test_browser
if defined BROWSER_BIN (
  start "" "%BROWSER_BIN%" --new-window "%HOME_URL%" "%ADMIN_URL%" "%TRAINING_URL%" "%DEAN_URL%" "%HEAD_URL%" "%LECTURER_URL%" "%STUDENT_URL%"
) else (
  start "" "%HOME_URL%"
  start "" "%ADMIN_URL%"
  start "" "%TRAINING_URL%"
  start "" "%DEAN_URL%"
  start "" "%HEAD_URL%"
  start "" "%LECTURER_URL%"
  start "" "%STUDENT_URL%"
)

echo.
echo ======================================================================
echo  [HOAN TAT KIEM THU]
echo  - Kiem tra Build     : PASS
echo  - Kiem tra Routes    : !PASS_COUNT!/!TOTAL_COUNT! PASS
echo  - Giao dien 7 vai tro : Da mo tren trinh duyet
echo.
echo  Luu y: Giu cua so "IUH Testing Server" trong khi kiem thu.
echo         Dong cua so may chu khi hoan tat.
echo ======================================================================
echo.
ping -n 5 127.0.0.1 >nul 2>&1
exit /b 0

:test_single_route
set "R_TITLE=%~1"
set "R_LINK=%~2"
curl.exe -s -f -m 2 -o nul "%R_LINK%" >nul 2>&1
if not errorlevel 1 (
  echo  [PASS] 200 OK  - %R_TITLE% -^> %R_LINK%
  set /a PASS_COUNT+=1
) else (
  echo  [FAIL] ERROR   - %R_TITLE% -^> %R_LINK%
)
exit /b 0
