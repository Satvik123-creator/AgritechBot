@echo off
REM ═══════════════════════════════════════════════════════════
REM AnaajAI Backend - Deployment Folder Setup (Windows)
REM ═══════════════════════════════════════════════════════════
REM This script creates the deployment directory structure
REM Run this before deploying to VPS

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   Creating Deployment Directory Structure
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

cd /d "%~dp0"

echo Creating deployment directories...
mkdir deployment 2>nul
mkdir deployment\nginx 2>nul

echo.
echo ✅ Directory structure created successfully!
echo.
echo Created:
echo   Backend\
echo   ├── deployment\
echo   │   └── nginx\
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo NEXT STEPS:
echo.
echo 1. The deployment scripts need to be created in the deployment\ folder
echo 2. These scripts are designed for Linux/Ubuntu (bash scripts)
echo 3. You'll copy these to your VPS during deployment
echo.
echo Files to create (will be done on VPS or you can create now):
echo   - deployment\install-docker.sh
echo   - deployment\deploy-backend.sh
echo   - deployment\update-backend.sh
echo   - deployment\backup.sh
echo   - deployment\restore.sh
echo   - deployment\firewall-setup.sh
echo   - deployment\health-check.sh
echo   - deployment\nginx\nginx.conf
echo   - deployment\nginx\anaaj-ai.conf
echo.
echo 📚 Refer to PRODUCTION_READY.md for complete deployment guide
echo.
echo Press any key to exit...
pause >nul
