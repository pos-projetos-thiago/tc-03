@echo off
cd /d "C:\Users\Thiago\Desktop\PosTech\fase3\tc-03"

echo [1/2] Clearing node_modules...
rmdir /s /q node_modules
del /q package-lock.json

echo [2/2] Running npm install...
npm install --legacy-peer-deps > scripts\install-log.txt 2>&1
echo EXIT_CODE:%ERRORLEVEL% >> scripts\install-log.txt
echo Done.
