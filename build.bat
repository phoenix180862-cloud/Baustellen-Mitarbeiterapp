@echo off
REM ============================================================
REM  TW Baustellen-App - Build-Skript
REM ============================================================
REM  Konkateniert alle JSX-Dateien in korrekter Reihenfolge
REM  in die index.html. Erzeugt aus index-template.html +
REM  Babel-Block die fertige index.html.
REM ============================================================

echo.
echo ==========================================
echo   TW Baustellen-App - Build
echo ==========================================
echo.

REM 1. Template kopieren (ueberschreibt vorherige index.html)
echo [1/4] Kopiere Template ...
copy /Y index-template.html index.html > nul
if errorlevel 1 (
    echo FEHLER: index-template.html nicht gefunden!
    pause
    exit /b 1
)

REM 2. Babel-Block oeffnen (wird VOR dem </body> in index.html eingefuegt)
REM    Einfach ans Ende anhaengen - Browser ist robust genug.
echo [2/4] Haenge Babel-Block an ...
echo. >> index.html
echo ^<script type="text/babel"^> >> index.html

REM 3. JSX-Dateien in korrekter Reihenfolge anhaengen
echo [3/4] Haenge JSX-Module an ...
type jsx\tw-ma-shared-components.jsx >> index.html
echo. >> index.html
type jsx\tw-ma-auth.jsx >> index.html
echo. >> index.html
type jsx\tw-ma-onboarding.jsx >> index.html
echo. >> index.html
type jsx\tw-ma-startseite.jsx >> index.html
echo. >> index.html
type jsx\tw-ma-baustellen.jsx >> index.html
echo. >> index.html
type jsx\tw-ma-nachrichten.jsx >> index.html
echo. >> index.html
type jsx\tw-ma-app.jsx >> index.html

REM 4. Babel-Block schliessen + Render-Aufruf
echo [4/4] Schreibe Render-Aufruf ...
echo. >> index.html
echo ^</script^> >> index.html
echo. >> index.html
echo ^<script type="text/babel"^> >> index.html
echo   ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(MAApp)); >> index.html
echo ^</script^> >> index.html

echo.
echo ==========================================
echo   Fertig: index.html ist bereit
echo ==========================================
echo.
pause
