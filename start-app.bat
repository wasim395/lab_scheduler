@echo off
echo ========================================
echo Lab Resource Scheduler - Quick Setup
echo ========================================
echo.

echo Step 1: Setting up Backend...
cd backend
echo Installing backend dependencies...
call npm install
echo.
echo Creating .env file...
if not exist .env (
    copy env.example .env
    echo .env file created from template
    echo Please edit backend/.env with your MongoDB URI
) else (
    echo .env file already exists
)
echo.
echo Starting backend server...
start "Backend Server" cmd /k "npm run dev"
echo.

echo Step 2: Setting up Frontend...
cd ..\frontend
echo Installing frontend dependencies...
call npm install
echo.
echo Starting frontend server...
start "Frontend Server" cmd /k "npm start"
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Demo Accounts:
echo - Admin: admin@example.com / admin123
echo - User: alice@example.com / user123
echo.
echo Press any key to exit...
pause > nul
