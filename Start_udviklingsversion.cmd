@echo off
setlocal
cd /d "%~dp0"
set "NODE_EXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if exist "%NODE_EXE%" goto start
where node >nul 2>&1
if errorlevel 1 goto no_node
set "NODE_EXE=node"
:start
"%NODE_EXE%" "scripts\start-dev.mjs"
if errorlevel 1 pause
exit /b
:no_node
echo Node.js blev ikke fundet. Start programmet fra Codex, eller installer Node.js.
pause
