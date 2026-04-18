@echo off
REM ==========================================================
REM  Build-Skript fuer TW Baustellen-App (Mitarbeiter-App)
REM  Konkateniert alle JSX-Dateien in der korrekten Reihenfolge
REM  in eine fertige index.html.
REM
REM  Voraussetzung: index-template.html mit Marker
REM    <!-- BABEL_BLOCK_INSERT_HERE -->
REM  an der Stelle, wo der Babel-Block landen soll.
REM ==========================================================

echo.
echo ===============================================
echo  TW Baustellen-App  -  Build
echo ===============================================
echo.

REM 1. Sicherstellen, dass alle Quelldateien da sind
set MISSING=0
for %%F in (
    jsx\tw-ma-shared-components.jsx
    jsx\tw-ma-onboarding.jsx
    jsx\tw-ma-startseite.jsx
    jsx\tw-ma-baustellen.jsx
    jsx\tw-ma-kalender.jsx
    jsx\tw-ma-fotos.jsx
    jsx\tw-ma-stunden.jsx
    jsx\tw-ma-nachrichten.jsx
    jsx\tw-ma-app.jsx
    index-template.html
) do (
    if not exist "%%F" (
        echo FEHLT: %%F
        set MISSING=1
    )
)

if "%MISSING%"=="1" (
    echo.
    echo Build abgebrochen - es fehlen Dateien.
    pause
    exit /b 1
)

REM 2. Template kopieren
echo Schritt 1/4: Template kopieren ...
copy /Y index-template.html index.html >nul

REM 3. Babel-Block oeffnen
echo Schritt 2/4: Babel-Block oeffnen ...
echo.>> index.html
echo ^<script type="text/babel"^>>> index.html

REM 4. JSX-Dateien in der korrekten Reihenfolge anhaengen
echo Schritt 3/4: JSX-Module anhaengen ...
type jsx\tw-ma-shared-components.jsx >> index.html
echo.>> index.html
type jsx\tw-ma-onboarding.jsx >> index.html
echo.>> index.html
type jsx\tw-ma-startseite.jsx >> index.html
echo.>> index.html
type jsx\tw-ma-baustellen.jsx >> index.html
echo.>> index.html
type jsx\tw-ma-kalender.jsx >> index.html
echo.>> index.html
type jsx\tw-ma-fotos.jsx >> index.html
echo.>> index.html
type jsx\tw-ma-stunden.jsx >> index.html
echo.>> index.html
type jsx\tw-ma-nachrichten.jsx >> index.html
echo.>> index.html
type jsx\tw-ma-app.jsx >> index.html
echo.>> index.html

REM 5. Babel-Block schliessen + Render-Aufruf
echo Schritt 4/4: Render-Aufruf anhaengen ...
echo ReactDOM.createRoot(document.getElementById('root')).render(^<MAApp /^>);>> index.html
echo ^</script^>>> index.html
echo ^</body^>>> index.html
echo ^</html^>>> index.html

echo.
echo ===============================================
echo  Fertig: index.html ist gebaut.
echo ===============================================
echo.
pause
