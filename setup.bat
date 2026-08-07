@echo off
echo ================================================
echo Wiki Race - Windows Setup Script
echo ================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Choose the LTS version and restart this script after installation.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js found: 
node --version
npm --version
echo.

echo Step 1: Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

echo Step 2: Setting up environment files...
if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env"
    echo [OK] Created backend\.env
    echo [ACTION REQUIRED] Edit backend\.env and add your DATABASE_URL
) else (
    echo [OK] backend\.env already exists
)

if not exist "frontend\.env.local" (
    copy "frontend\.env.example" "frontend\.env.local"
    echo [OK] Created frontend\.env.local
) else (
    echo [OK] frontend\.env.local already exists
)
echo.

echo Step 3: Database setup
echo [INFO] Make sure you have a DATABASE_URL set in backend\.env
echo.
set /p continue="Do you want to initialize the database now? (y/n): "
if /i "%continue%"=="y" (
    cd backend
    call npm run db:push
    cd ..
    if %ERRORLEVEL% EQU 0 (
        echo [OK] Database initialized
    ) else (
        echo [ERROR] Database initialization failed
        echo Make sure DATABASE_URL is set correctly in backend\.env
    )
)
echo.

echo ================================================
echo Setup Complete!
echo ================================================
echo.
echo Next steps:
echo 1. Make sure DATABASE_URL is set in backend\.env
echo 2. Run: npm run dev
echo 3. Visit: http://localhost:3000
echo.
echo For more help, see SETUP.md or QUICKSTART.md
echo.
pause
