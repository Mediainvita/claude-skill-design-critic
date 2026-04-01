#!/bin/bash
set -e

echo "============================================================"
echo " Design-Critic Skill - Installer"
echo " https://github.com/Mediainvita/claude-skill-design-critic"
echo "============================================================"
echo ""

SKILL_DIR="$HOME/.claude/skills/design-critic"

# 1. Prerequisites
echo "[1/4] Pruefe Voraussetzungen..."
command -v node >/dev/null 2>&1 || { echo "FEHLER: Node.js nicht gefunden. Installiere: https://nodejs.org"; exit 1; }
command -v git >/dev/null 2>&1 || { echo "FEHLER: Git nicht gefunden."; exit 1; }
echo "  Node.js $(node -v), Git gefunden."

# 2. Clone and install
echo ""
echo "[2/4] Installiere Skill von GitHub..."
TEMP_DIR=$(mktemp -d)
git clone --depth 1 https://github.com/Mediainvita/claude-skill-design-critic.git "$TEMP_DIR" 2>/dev/null

mkdir -p "$SKILL_DIR/helpers"
cp "$TEMP_DIR/SKILL.md" "$SKILL_DIR/"
cp "$TEMP_DIR/helpers/"* "$SKILL_DIR/helpers/"
rm -rf "$TEMP_DIR"
echo "  Installiert nach: $SKILL_DIR"

# 3. Global tools
echo ""
echo "[3/4] Installiere CSS-Analyse-Tools..."
if ! npm list -g wallace-cli >/dev/null 2>&1; then
    npm install -g wallace-cli 2>/dev/null && echo "  wallace-cli installiert." || echo "  WARNUNG: wallace-cli konnte nicht installiert werden."
else
    echo "  wallace-cli bereits vorhanden."
fi

# 4. Verify
echo ""
echo "[4/4] Pruefe Begleit-Skills..."
SKILLS_BASE="$HOME/.claude/skills"
ALL_OK=1

for skill in interface-design accessibility; do
    if [ -f "$SKILLS_BASE/$skill/SKILL.md" ]; then
        echo "  [OK]    $skill"
    else
        echo "  [FEHLT] $skill"
        ALL_OK=0
    fi
done

for skill in frontend-design core-web-vitals; do
    if [ -f "$SKILLS_BASE/$skill/SKILL.md" ]; then
        echo "  [OK]    $skill (optional)"
    else
        echo "  [--]    $skill (optional, nicht installiert)"
    fi
done

echo ""
echo "============================================================"
if [ "$ALL_OK" -eq 1 ]; then
    echo " INSTALLATION ERFOLGREICH"
    echo " Starte mit: /design-critic"
else
    echo " TEILWEISE ERFOLGREICH - Begleit-Skills fehlen."
fi
echo "============================================================"
