@echo off
REM PC硬件监控工具启动脚本
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -Command "npm start"


