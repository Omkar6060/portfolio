@echo off
REM Publishes this folder to GitHub (repo Omkar6060/portfolio) and turns on GitHub Pages.
cd /d "%~dp0"
set "REPO=Omkar6060/portfolio"
where git >nul 2>&1 || (echo Git is not installed. Get it from https://git-scm.com & pause & exit /b 1)
where gh >nul 2>&1
if %errorlevel%==0 (
  gh auth status >nul 2>&1 || gh auth login --web
  gh repo view %REPO% >nul 2>&1 || gh repo create %REPO% --public --description "Omkar Behera - cyber security portfolio"
) else (
  echo GitHub CLI not found.
  echo Create an EMPTY public repo named  portfolio  at github.com/new  ^(no README^), then come back here.
  start https://github.com/new
  pause
)
if not exist .git git init
git add -A
git commit -m "Update portfolio"
git branch -M main
git remote get-url origin >nul 2>&1 || git remote add origin https://github.com/%REPO%.git
git push -u origin main
if errorlevel 1 (echo. & echo Push failed - check the message above. & pause & exit /b 1)
where gh >nul 2>&1 && gh api -X POST repos/%REPO%/pages -f "source[branch]=main" -f "source[path]=/" >nul 2>&1
echo.
echo Done. If the site is not on yet: repo Settings ^> Pages ^> Branch: main, folder: / (root) ^> Save.
echo Your site: https://omkar6060.github.io/portfolio/  (first publish takes 1-2 minutes)
start https://github.com/%REPO%/settings/pages
pause
