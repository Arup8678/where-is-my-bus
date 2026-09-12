@echo off
echo Staging and committing deployment changes...
git config user.name "Alpharup"
git config user.email "cosxisinx369@gmail.com"
git add .
git commit -m "Configure 100% Vercel single deployment setup"

echo.
echo Pushing updated code to GitHub...
git push origin main

if %errorlevel% neq 0 (
    echo.
    echo Push failed! See error above.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo   SUCCESS! Updated code pushed to GitHub:
echo   https://github.com/Arup8678/where-is-my-bus
echo ============================================================
