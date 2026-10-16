@echo off
echo ===================================================
echo Pushing isolated practical11 branch to GitHub...
echo ===================================================

cd /d "%~dp0practical11"
if exist .git rmdir /s /q .git
git init
git checkout -b practical11
git add .
git commit -m "Upload Practical 11: Containerization with Docker and Docker Compose"
git remote add origin https://github.com/priyanshibhatt17/Advanced_Web_Development_Frameworks.git
git push -f -u origin practical11
if exist .git rmdir /s /q .git
cd ..

echo.
echo ===================================================
echo Practical 11 branch successfully pushed to GitHub!
echo ===================================================
pause
