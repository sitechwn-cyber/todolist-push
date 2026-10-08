@echo off
chcp 65001 >nul
cd /d "%~dp0cloudflare"
echo.
echo   TODOLIST-WECKER bei Cloudflare einrichten
echo   ------------------------------------------
echo   Schritt 1: Anmeldung bei Cloudflare (Browser oeffnet sich, "Allow" klicken)
echo.
call npx --yes wrangler@3 login
if errorlevel 1 goto fehler
echo.
echo   Schritt 2: Wecker hochladen
call npx --yes wrangler@3 deploy
if errorlevel 1 goto fehler
echo.
echo   Schritt 3: GitHub-Schluessel eingeben
echo   (Den Schluessel aus GitHub einfuegen: Rechtsklick, dann Enter.
echo    Er wird beim Einfuegen nicht angezeigt - das ist normal.)
echo.
call npx --yes wrangler@3 secret put GITHUB_TOKEN
if errorlevel 1 goto fehler
echo.
echo   FERTIG. Der Wecker startet jetzt jede Minute den Versand.
echo   Pruefen: GitHub - todolist-push - Actions - neue Laeufe "workflow_dispatch".
pause
exit /b 0
:fehler
echo.
echo   FEHLER - bitte das Fenster so lassen und Claude Bescheid geben.
pause
exit /b 1
