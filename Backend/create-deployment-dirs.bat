@echo off
REM AnaajAI Deployment Directory Setup Script for Windows
REM This script creates the necessary directory structure for deployment scripts

echo ====================================================
echo   Creating AnaajAI Deployment Directory Structure
echo ====================================================
echo.

cd /d "%~dp0"

echo Creating deployment directory...
mkdir deployment 2>nul
if exist deployment (
    echo [OK] deployment\ directory created
) else (
    echo [ERROR] Failed to create deployment directory
    pause
    exit /b 1
)

echo Creating nginx subdirectory...
mkdir deployment\nginx 2>nul
if exist deployment\nginx (
    echo [OK] deployment\nginx\ directory created
) else (
    echo [ERROR] Failed to create nginx directory
    pause
    exit /b 1
)

echo.
echo ====================================================
echo   Directory Structure Created Successfully!
echo ====================================================
echo.
echo The following directories have been created:
echo   - deployment\
echo   - deployment\nginx\
echo.
echo You can now run the script again to create all deployment files.
echo.
pause
