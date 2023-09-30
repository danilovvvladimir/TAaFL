@echo off

cd mealy
node ../../../../dist/conversion.bundle.js
fc.exe output.txt correct-output.txt > nul
if ERRORLEVEL 1 goto err
cd ..

cd moore
node ../../../../dist/conversion.bundle.js
fc.exe output.txt correct-output.txt > nul
if ERRORLEVEL 1 goto err
cd ..

cd mealy-empty-move
node ../../../../dist/conversion.bundle.js
fc.exe output.txt correct-output.txt > nul
if ERRORLEVEL 1 goto err
cd ..

cd moore-empty-move
node ../../../../dist/conversion.bundle.js
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