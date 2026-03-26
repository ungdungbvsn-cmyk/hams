@echo off
set PATH=%PATH%;C:\Program Files\nodejs
cd c:\HAMS\backend
echo Testing build... > build-output.txt
echo Generating Prisma Client... >> build-output.txt
call npx prisma generate >> build-output.txt 2>&1
echo Running tsc... >> build-output.txt
call npx tsc --noEmit >> build-output.txt 2>&1
if %ERRORLEVEL% EQU 0 (
    echo BUILD SUCCESSFUL >> build-output.txt
) else (
    echo BUILD FAILED with code %ERRORLEVEL% >> build-output.txt
)
