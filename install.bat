@echo off
setlocal enabledelayedexpansion

echo ============================================================
echo  Design-Critic Skill - Installer
echo  https://github.com/Mediainvita/claude-skill-design-critic
echo ============================================================
echo.

:: ----------------------------------------------------------
:: 0. Determine skill target directory
:: ----------------------------------------------------------
set "SKILL_DIR=%USERPROFILE%\.claude\skills\design-critic"

if exist "!SKILL_DIR!\SKILL.md" (
    echo [INFO] Design-Critic Skill bereits installiert in: !SKILL_DIR!
    echo        Aktualisiere auf neueste Version...
    echo.
)

:: ----------------------------------------------------------
:: 1. Check prerequisites
:: ----------------------------------------------------------
echo [1/5] Pruefe Voraussetzungen...

where node >nul 2>nul
if errorlevel 1 (
    echo FEHLER: Node.js nicht gefunden. Bitte installieren: https://nodejs.org
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do echo   Node.js %%v

where git >nul 2>nul
if errorlevel 1 (
    echo FEHLER: Git nicht gefunden.
    exit /b 1
)
echo   Git gefunden.

:: ----------------------------------------------------------
:: 2. Clone or update skill from GitHub
:: ----------------------------------------------------------
echo.
echo [2/5] Installiere Skill von GitHub...

set "TEMP_DIR=%TEMP%\design-critic-install"
if exist "!TEMP_DIR!" rmdir /s /q "!TEMP_DIR!"

git clone --depth 1 https://github.com/Mediainvita/claude-skill-design-critic.git "!TEMP_DIR!" >nul 2>nul
if errorlevel 1 (
    echo FEHLER: Konnte Repository nicht klonen.
    echo Pruefe deine Internetverbindung und ob das Repo existiert:
    echo https://github.com/Mediainvita/claude-skill-design-critic
    exit /b 1
)

:: Create skill directory
if not exist "!SKILL_DIR!\helpers" mkdir "!SKILL_DIR!\helpers"

:: Copy skill files
copy /y "!TEMP_DIR!\SKILL.md" "!SKILL_DIR!\SKILL.md" >nul
copy /y "!TEMP_DIR!\helpers\detect-overlaps.js" "!SKILL_DIR!\helpers\" >nul
copy /y "!TEMP_DIR!\helpers\check-hover-states.js" "!SKILL_DIR!\helpers\" >nul
copy /y "!TEMP_DIR!\helpers\check-sticky-collisions.js" "!SKILL_DIR!\helpers\" >nul
copy /y "!TEMP_DIR!\helpers\critic-learn.js" "!SKILL_DIR!\helpers\" >nul
copy /y "!TEMP_DIR!\helpers\.stylelintrc.design-critic.json" "!SKILL_DIR!\helpers\" >nul

:: Cleanup temp
rmdir /s /q "!TEMP_DIR!" 2>nul

echo   Skill installiert nach: !SKILL_DIR!

:: ----------------------------------------------------------
:: 3. Install global tools
:: ----------------------------------------------------------
echo.
echo [3/5] Installiere CSS-Analyse-Tools...

call npm list -g wallace-cli >nul 2>nul
if errorlevel 1 (
    echo   Installiere wallace-cli...
    call npm install -g wallace-cli 2>nul
    if errorlevel 1 (
        echo   WARNUNG: wallace-cli konnte nicht global installiert werden.
        echo   Verwende npx wallace-cli stattdessen.
    ) else (
        echo   wallace-cli installiert.
    )
) else (
    echo   wallace-cli bereits vorhanden.
)

:: ----------------------------------------------------------
:: 4. Install project-local tools (optional)
:: ----------------------------------------------------------
echo.
echo [4/5] Pruefe Projekt-Abhaengigkeiten...

:: Try to find a client/package.json in current directory
if exist "%CD%\client\package.json" (
    echo   Angular-Projekt gefunden. Installiere Stylelint...
    pushd "%CD%\client"

    call npm list stylelint >nul 2>nul
    if errorlevel 1 (
        call npm install --save-dev stylelint stylelint-declaration-strict-value 2>nul
        echo   Stylelint + Plugin installiert.
    ) else (
        echo   Stylelint bereits vorhanden.
    )

    if not exist ".stylelintrc.json" (
        copy /y "!SKILL_DIR!\helpers\.stylelintrc.design-critic.json" ".stylelintrc.json" >nul
        echo   Stylelint-Config kopiert.
    )

    popd
) else (
    echo   Kein client/package.json gefunden - Projekt-spezifische Tools uebersprungen.
    echo   Fuehre das Script spaeter im Projekt-Root aus um Stylelint zu installieren.
)

:: ----------------------------------------------------------
:: 5. Verify required skills
:: ----------------------------------------------------------
echo.
echo [5/5] Pruefe benoetigte Begleit-Skills...

set "SKILLS_BASE=%USERPROFILE%\.claude\skills"
set "ALL_OK=1"

echo.
echo   Pflicht-Skills:
for %%s in (interface-design accessibility) do (
    if exist "!SKILLS_BASE!\%%s\SKILL.md" (
        echo   [OK]    %%s
    ) else (
        echo   [FEHLT] %%s - bitte separat installieren
        set "ALL_OK=0"
    )
)

echo.
echo   Ergaenzende Skills:
for %%s in (frontend-design core-web-vitals) do (
    if exist "!SKILLS_BASE!\%%s\SKILL.md" (
        echo   [OK]    %%s
    ) else (
        echo   [--]    %%s (optional, nicht installiert)
    )
)

echo.
echo   Helper-Scripts:
for %%f in (detect-overlaps.js check-hover-states.js check-sticky-collisions.js critic-learn.js) do (
    if exist "!SKILL_DIR!\helpers\%%f" (
        echo   [OK]    %%f
    ) else (
        echo   [FEHLT] %%f
        set "ALL_OK=0"
    )
)

:: ----------------------------------------------------------
:: Summary
:: ----------------------------------------------------------
echo.
echo ============================================================
if "!ALL_OK!"=="1" (
    echo  INSTALLATION ERFOLGREICH
    echo.
    echo  Design-Critic v3.0 ist einsatzbereit.
    echo  Installiert in: !SKILL_DIR!
    echo.
    echo  Starte mit: /design-critic
    echo.
    echo  Selbstverbesserung: Wenn der Critic was verpasst,
    echo  lernt er automatisch dazu (critic-learnings.md)
) else (
    echo  INSTALLATION TEILWEISE ERFOLGREICH
    echo.
    echo  Der Skill ist installiert, aber einige Begleit-Skills fehlen.
    echo  Installiere fehlende Skills von:
    echo    https://github.com/anthropics/skills
    echo    https://skillsmp.com/
)
echo ============================================================
echo.

:: Cleanup
rmdir /s /q "!TEMP_DIR!" 2>nul

endlocal
