@echo off
cd /d "C:\Users\Thiago\Desktop\PosTech\fase3\tc-03"
npx tsc --noEmit > scripts\tsc-log.txt 2>&1
echo EXIT_CODE:%ERRORLEVEL% >> scripts\tsc-log.txt
