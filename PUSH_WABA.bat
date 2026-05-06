@echo off
echo Mise a jour de WABA sur GitHub...
git add .
git commit -m "Fix: robust autoplay and track transition"
echo Tentative de PUSH sur le compte lwaba1937...
git push origin master
git push origin master:gh-pages
echo.
echo Si vous voyez une erreur 403, connectez-vous a votre compte GitHub lwaba1937 sur ce PC.
pause
