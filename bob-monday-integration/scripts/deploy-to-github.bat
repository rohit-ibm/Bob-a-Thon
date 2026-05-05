@echo off
REM Deploy to GitHub using GitHub CLI
REM Usage: scripts\deploy-to-github.bat

echo ==========================================
echo Bob Monday Integration - GitHub Deployment
echo ==========================================
echo.

REM Check if gh is installed
where gh >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ GitHub CLI (gh) is not installed!
    echo Please install it first:
    echo   winget install --id GitHub.cli
    echo.
    pause
    exit /b 1
)

echo ✅ GitHub CLI found

REM Check if authenticated
gh auth status >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 🔐 Not authenticated with GitHub. Starting authentication...
    gh auth login
) else (
    echo ✅ Already authenticated with GitHub
)

REM Initialize git if not already
if not exist .git (
    echo 📦 Initializing Git repository...
    git init
    git add .
    git commit -m "Initial commit: Bob Monday Integration v2.0"
) else (
    echo ✅ Git repository already initialized
)

REM Check if remote exists
git remote get-url origin >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Remote 'origin' already configured
    for /f "tokens=*" %%i in ('git remote get-url origin') do set REPO_URL=%%i
    echo    Repository: %REPO_URL%
) else (
    echo 🔗 Configuring remote repository...
    
    set /p ORG="Enter GitHub organization/username (default: ibm-sevone-npm): "
    if "%ORG%"=="" set ORG=ibm-sevone-npm
    
    set /p REPO="Enter repository name (default: COE-Vector-Bobathon): "
    if "%REPO%"=="" set REPO=COE-Vector-Bobathon
    
    REM Check if repository exists
    gh repo view %ORG%/%REPO% >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Repository %ORG%/%REPO% exists
        git remote add origin https://github.com/%ORG%/%REPO%.git
    ) else (
        echo 📝 Repository doesn't exist. Creating...
        set /p PUBLIC="Make repository public? (y/n, default: y): "
        if "%PUBLIC%"=="" set PUBLIC=y
        
        if /i "%PUBLIC%"=="y" (
            gh repo create %ORG%/%REPO% --public --source=. --remote=origin
        ) else (
            gh repo create %ORG%/%REPO% --private --source=. --remote=origin
        )
    )
)

REM Push to GitHub
echo 🚀 Pushing to GitHub...
git branch -M main

git push -u origin main
if %ERRORLEVEL% EQU 0 (
    echo ✅ Successfully pushed to GitHub!
) else (
    echo ⚠️  Push failed. Trying force push...
    set /p FORCE="Force push? This will overwrite remote. (y/n): "
    if /i "%FORCE%"=="y" (
        git push -u origin main --force
        echo ✅ Force push successful!
    ) else (
        echo ❌ Push cancelled
        pause
        exit /b 1
    )
)

REM Open repository in browser
echo.
echo ==========================================
echo ✅ Deployment Complete!
echo ==========================================
echo.

for /f "tokens=*" %%i in ('git remote get-url origin') do set REPO_URL=%%i
echo 📦 Repository: %REPO_URL%
echo 🌐 Opening in browser...
gh repo view --web

echo.
echo Next steps:
echo 1. Configure GitHub Actions secrets (if needed)
echo 2. Deploy to Fyre machine (see FYRE_DEPLOYMENT.md)
echo 3. Monitor CI/CD pipeline in Actions tab
echo.
pause

@REM Made with Bob
