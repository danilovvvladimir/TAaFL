@echo off

cd mealy
node ../../../../dist/Minimization.bundle.js
fc.exe output.txt correct-output.txt > nul
if ERRORLEVEL 1 goto err
cd ..

cd moore
node ../../../../dist/Minimization.bundle.js
fc.exe output.txt correct-output.txt > nul
if ERRORLEVEL 1 goto err
cd ..

echo Program testing succeeded
pause
exit 0

:err
echo Program testing failed
pause
exit 1