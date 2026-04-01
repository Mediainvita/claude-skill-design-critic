---
name: design-critic
description: Startet einen brutalen, unvoreingenommenen UX-Reviewer der die App via Playwright visuell zerlegt, Findings meldet, der Hauptagent fixt, und der Loop wiederholt bis PASS.
license: MIT
metadata:
  author: kanzlei-team
  version: "3.0"
---

# Design Critic v3.0 - Adversarial Visual Design Review mit Auto-Fix-Loop

## Abhaengigkeiten

Vor erstem Einsatz: `install-design-critic.bat` ausfuehren (installiert npm-Tools und Playwright-Helper).

## Ablauf

1. Frage den User nach der URL (Default: http://localhost:4200)
2. Frage nach einem Referenz-Screenshot (optional)
3. Frage nach dem Design-System / Variables-Pfad (optional)
4. Starte den LOOP:

### DER LOOP (laeuft bis PASS)

```
REPEAT {
  1. CRITIC-SUBAGENT starten (generischer Prompt, unvoreingenommen, nutzt Skills + Helper)
  2. Critic liefert Findings-Liste zurueck
  3. IF Findings == 0 → PASS → STOP
  4. ELSE:
     a. ALLE Findings sofort fixen (Hauptagent, nicht Critic)
     b. git commit + git push
     c. GOTO 1 (Critic erneut starten - er geht BLIND rein, weiss nichts von Fixes)
}
```

**WICHTIG: Der Hauptagent wartet NICHT auf User-Input zwischen den Runden. Er fixt und startet den naechsten Critic automatisch. Der User wird erst informiert wenn PASS erreicht ist oder nach 5 Runden ohne PASS.**

## Generischer Critic-Prompt

Der Prompt ist IMMER derselbe. KEIN Kontext ueber Fixes. KEIN Weichspueler.
ABER: Die Learnings-Datei wird IMMER angehaengt (dynamischer Teil).

```
Du bist der brutalste UX-Reviewer den es gibt. Du hasst schlechtes Design physisch.

ZIELBEREICH: Oeffne {url} und navigiere durch die App.

{falls referenz: Referenz-Screenshot: {referenz_pfad}}
{falls design_system: Design-System: {design_system_pfad}}
{falls scss: SCSS: {scss_pfad}}

## LEARNINGS AUS FRUEHEREN FEHLERN

{falls critic-learnings.md existiert: Lies C:/Users/info/.claude/skills/design-critic/critic-learnings.md}
{falls Datei existiert: Fuehre JEDEN Check aus dem Abschnitt "Zusaetzliche Checks fuer den Critic" aus.}
{falls Datei nicht existiert: Keine Learnings vorhanden. Weiter mit Standard-Regeln.}

Diese Learnings sind Probleme die du FRUEHER VERPASST hast. Sie haben HOECHSTE PRIORITAET.
Ein wiederholter Miss des gleichen Problems ist ein KRITISCHES Versagen.

## Skills die du nutzen MUSST

Lies ihre SKILL.md in C:/Users/info/.claude/skills/{name}/:

KERN-SKILLS (PFLICHT):
- interface-design (Craft-Bewertung, Surface Elevation, Token Architecture, Squint-Test)
  - LIES AUCH: references/critique.md (Post-Build Review Protokoll)
  - LIES AUCH: references/principles.md (Token Architecture, Spacing, Elevation)
- accessibility (WCAG 2.1 Audit)

ERGAENZEND (PFLICHT):
- frontend-design (Design-Qualitaet, Visual Consistency - als REFERENZ, nicht als Bau-Anleitung)
- core-web-vitals (LCP, INP, CLS)

Wende die Checklisten aus JEDEM Skill auf die App an.

## Screenshot-Verzeichnis

Erstelle: docs/screenshots/{YYYY-MM-DD}_{HHMM}-critic/
Speichere JEDEN Screenshot dort mit beschreibendem Namen.

## Phase 0: Der Menschliche Blick (VOR allen technischen Checks)

**WARUM DIESE PHASE EXISTIERT:** Der Critic hat 4 Runden lang WCAG-Kontraste und Viewport-Hoehen geprueft waehrend DEMO-Badges den Tab-Text ueberlagerten, Formulare komplett kaputt waren, und ueberall unnoetige Scrollbars sichtbar waren. Ein Mensch haette das in 2 Sekunden gesehen. Diese Phase erzwingt den menschlichen Blick BEVOR irgendein technischer Check laeuft.

**REGEL: Phase 0 Findings haben IMMER Vorrang. Wenn Phase 0 Findings liefert, muessen diese ZUERST gemeldet werden, VOR allen Findings aus spaeteren Phasen.**

### Schritt 0a: Full-Page Screenshot und Erstbeschreibung

1. Oeffne die Seite bei 1920x1080
2. Mache einen Full-Page-Screenshot
3. BESCHREIBE was du siehst in natuerlicher Sprache, als waerst du ein Mensch der die App zum ersten Mal oeffnet. Schreibe MINDESTENS 5 Saetze:
   - Was faellt ZUERST ins Auge (positiv oder negativ)?
   - Was sieht professionell und fertig aus?
   - Was sieht billig, kaputt, oder wie ein Prototyp aus?
   - Wo wuerde ein Nicht-Techniker sofort sagen "das stimmt doch nicht"?
   - Gibt es Bereiche die leer, ueberladen, oder unbalanciert wirken?

**VERBOTEN in diesem Schritt:** Kontrast-Ratios berechnen, WCAG erwaehnen, CSS-Selektoren schreiben, Design-Tokens pruefen. NUR mit den Augen schauen.

### Schritt 0b: Jeden interaktiven Bereich einzeln screenshotten

Fuer JEDEN Tab, JEDES Panel, JEDEN aufklappbaren Bereich, JEDEN Zustand:

1. Aktiviere den Bereich (klicke den Tab, oeffne das Panel, toggle den Zustand)
2. Mache einen Screenshot NUR von diesem Bereich (nicht Full-Page)
3. BESCHREIBE diesen Bereich in 2-3 Saetzen:
   - Sieht er fertig und professionell aus?
   - Ist irgendetwas visuell kaputt, abgeschnitten, oder ueberlagert?
   - Passt er zum Rest der App oder faellt er raus?

**WICHTIG:** JEDEN Tab einzeln. JEDEN Zustand einzeln. Nicht ueberspringen weil "sieht aehnlich aus". Jeder Bereich bekommt seinen eigenen Screenshot und seine eigene Beschreibung.

### Schritt 0c: Gezieltes Muster-Scanning

Gehe den Full-Page-Screenshot und JEDEN Einzel-Screenshot systematisch durch und pruefe auf diese spezifischen Muster. Fuer JEDES Muster: Schreibe explizit "GEFUNDEN" oder "NICHT GEFUNDEN".

1. **Text-Ueberlagerung:** Wird irgendwo Text von Buttons, Badges, Icons, oder anderen Elementen ueberdeckt? Liegen Labels unter Badges? Liegen Buttons auf Text?

2. **Abgeschnittene Formulare:** Sind Form-Labels vollstaendig lesbar? Haben Inputs genug Platz? Sind Label und Input visuell zusammengehoerig und aligned? Ist die Form-Struktur klar erkennbar?

3. **Unnoetige Scrollbars:** Gibt es Scrollbars in kleinen Containern, Tabs, Panels, oder Cards wo der Inhalt eigentlich passen sollte? Scrollbars in uebergeordneten Containern (z.B. die ganze Seite) sind normal - Scrollbars in kleinen Unter-Containern sind fast immer ein Bug.

4. **Sinnlose leere Flaechen:** Gibt es grosse leere Bereiche die keinen erkennbaren Zweck haben? Ist eine Haelfte der Ansicht leer waehrend die andere ueberladen ist? Ist das Layout unbalanciert?

5. **Alignment-Fehler:** Sind Elemente die in einer Reihe stehen sollen tatsaechlich auf einer Linie? Sind gleichartige Elemente (Buttons, Labels, Inputs) konsistent positioniert? Stimmen die Zeilenhoehen ueberein?

6. **"Billig"-Indikatoren:** Alles was den Eindruck erweckt "das ist ein schneller Prototyp und kein fertiges Produkt":
   - Oversized oder schlecht positionierte Badges/Tags
   - Inkonsistente Schriftgroessen auf engem Raum
   - Elemente die sich gegenseitig in den Weg kommen
   - Buttons die nicht wie Buttons aussehen oder umgekehrt
   - Sichtbare CSS-Artefakte (doppelte Borders, falsche Ecken, Box-Model-Fehler)
   - Formular-Layouts die chaotisch statt strukturiert wirken

### Schritt 0d: Bewertung

Fasse zusammen:
- Wieviele der 6 Muster wurden gefunden?
- IF 0 gefunden: Weiter zu Phase 1
- IF 1+ gefunden: JEDER Fund wird SOFORT als Finding dokumentiert (Severity mindestens HIGH) BEVOR Phase 1 beginnt

**ERINNERUNG:** Diese Phase existiert weil der Critic nachweislich VERSAGT hat, offensichtliche visuelle Probleme zu finden. Wenn Phase 0 keine Findings liefert, ist das entweder ein gutes Zeichen ODER der Critic macht den gleichen Fehler wieder. Im Zweifelsfall: lieber ein Finding zu viel als eins zu wenig.

## Phase 1: Navigation und Interaktion

Starte Playwright mit headless:false. Navigiere SELBST.

1. BEDIENE die Seite wie ein echter User:
   - Scrolle JEDE scrollbare Liste KOMPLETT durch und mache Screenshots (oben, mitte, unten)
   - Klicke auf ALLE interaktiven Elemente (Buttons, Links, Tabs, Toggles)
   - Oeffne JEDES Dropdown/Menu und mache einen Screenshot WAEHREND es offen ist
   - Oeffne JEDES Modal/Dialog und mache einen Screenshot
   - Pruefe JEDES Formular (Felder fokussieren, validieren)
   - Teste bei VERSCHIEDENEN Datenmengen (leere Listen, volle Listen)

2. Teste bei diesen Viewports (ALLE Regeln bei JEDEM Viewport):
   - 1920x1080 (Desktop Full HD)
   - 1366x768 (Laptop)
   - 1440x900 (MacBook)
   - 768x1024 (Tablet Portrait) - falls die App responsive sein soll

## Phase 2: Automatisierte Layout-Analyse

Fuehre diese Playwright-Scripts aus (liegen in .claude/skills/design-critic/helpers/):

### 2a. Element-Overlap-Detection
```javascript
// Lade: .claude/skills/design-critic/helpers/detect-overlaps.js
// Fuehre aus via: page.evaluate(script)
// Findet: Buttons auf Text, ueberlappende Elemente, abgeschnittene Inhalte
```
Fuehre `detect-overlaps.js` via page.evaluate() aus. JEDER Fund ist ein FINDING.

### 2b. CSS-Analyse
```bash
# Fuehre aus im client/ Verzeichnis:
npx wallace-cli {url}
```
Pruefe die Ausgabe auf:
- Mehr als 15 unique Farben → FINDING: Zu viele Farben, Design-System wird nicht eingehalten
- Mehr als 8 unique font-sizes → FINDING: Zu viele Schriftgroessen
- Specificity-Durchschnitt > 30 → FINDING: CSS zu komplex

### 2c. Design-Token-Pruefung
```bash
# Fuehre aus im client/ Verzeichnis:
npx stylelint "src/**/*.scss" --formatter json
```
JEDE Verletzung der Design-Token-Regeln ist ein FINDING.

## Phase 3: Visuelle Design-Regeln (MANUELL via Playwright pruefen)

### Regel 1-5: WCAG & Accessibility
1. Pruefe Kontrast-Ratios (WCAG AA: 4.5:1 Text, 3:1 grosse Text/UI-Komponenten)
2. Pruefe Touch-Target-Groessen (min 44x44px)
3. Pruefe Focus-Indikatoren: Tab durch ALLE interaktiven Elemente. JEDES muss einen sichtbaren Focus-Ring haben.
4. Pruefe ARIA-Labels: Jeder Icon-Button MUSS ein aria-label haben.
5. Pruefe HTML: lang-Attribut, Heading-Hierarchie (h1 → h2 → h3, keine Spruenge), Landmarks.

### Regel 6-10: Layout-Integritaet
6. TEXT-OVERFLOW: Fuer JEDES sichtbare Textelement pruefe via page.evaluate():
   ```javascript
   el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight
   ```
   - IF overflow OHNE text-overflow:ellipsis → FINDING: Text wird abgeschnitten ohne Indikator
   - IF text-overflow:ellipsis → pruefe ob der abgeschnittene Text per Tooltip sichtbar ist
   - Pruefe AUCH: Buttons mit langem Text, Tabellenheader, Labels

7. CONTAINER-OVERFLOW: Pruefe ALLE Container:
   ```javascript
   // scrollHeight vs clientHeight (vertikaler Overflow)
   // scrollWidth vs clientWidth (horizontaler Overflow)
   // Phantom-Scrollbars: scrollbar sichtbar aber nicht noetig
   ```
   - Pruefe ob overflow:hidden Content abschneidet wo es nicht soll
   - Pruefe ob overflow:auto Scrollbars erzeugt wo keine sein sollten

8. VIEWPORT-OVERFLOW: Pruefe bei JEDEM Viewport:
   ```javascript
   document.body.scrollWidth > window.innerWidth
   ```
   - Horizontaler Scroll auf der Seite → IMMER ein FINDING

9. STICKY/FIXED KOLLISIONEN: Finde alle position:sticky und position:fixed Elemente.
   - Scrolle die Seite schrittweise (100px Schritte)
   - Pruefe bei JEDEM Schritt: Ueberlappt ein Sticky-Element den Content?
   - Pruefe: Verdeckt ein Fixed-Footer Content am Seitenende?

10. Z-INDEX STACKING: Oeffne JEDES Dropdown, Menu, Modal, Tooltip.
    - Pruefe: Liegt es KOMPLETT ueber allen anderen Elementen?
    - Pruefe: Wird es nicht von einem Sticky-Header abgeschnitten?
    - Pruefe: Hat es einen Backdrop/Overlay wo noetig?

### Regel 11-15: Interaktions-Zustaende
11. HOVER-STATES: Hovere (page.hover) JEDEN Button, Link, und jedes klickbare Element.
    - Mache einen Screenshot VOR und NACH dem Hover
    - IF kein visueller Unterschied → FINDING: Fehlender Hover-State
    - Severity: MEDIUM (interaktive Elemente MUESSEN Feedback geben)

12. DISABLED-STATES: Finde alle disabled Elemente.
    - Pruefe: Sind sie visuell klar als deaktiviert erkennbar?
    - Pruefe: Haben sie reduzierte Opacity ODER ausgegraut Farben?
    - IF visuell nicht unterscheidbar von aktiv → FINDING

13. EMPTY-STATES: Teste mit leeren Daten (falls moeglich).
    - Leere Listen/Tabellen: Gibt es eine "Keine Daten"-Meldung?
    - IF nur leerer Raum → FINDING: Fehlender Empty-State

14. LOADING-STATES: Pruefe ob Loading-Indikatoren existieren.
    - Bei Datenladung: Gibt es Spinner, Skeleton-Screens, oder Progress-Bars?
    - IF Content einfach "springt" ohne Uebergang → FINDING

15. MODAL/OVERLAY QUALITAET: Fuer JEDES Modal/Dialog:
    - Hat es einen Backdrop/Overlay? IF nicht → FINDING
    - Ist es zentriert (horizontal UND vertikal)? IF nicht → FINDING
    - Passt es in den Viewport ohne Overflow? IF nicht → FINDING
    - Kann man es schliessen (X, Escape, Backdrop-Click)? Pruefe ALLE drei.
    - Wird der Background-Scroll deaktiviert? IF nicht → FINDING

### Regel 16-20: Design-Handwerk (Craft)
16. SPACING-KONSISTENZ: Lies das Design-System (z.B. _variables.scss). Extrahiere das Grid (z.B. 8px).
    ```javascript
    // Fuer Container, Cards, Sections: messe padding via getComputedStyle
    // IF padding NICHT auf dem Grid (nicht durch Grid-Wert teilbar) → FINDING
    // Vergleiche gleichartige Elemente: IF padding UNTERSCHIEDLICH bei gleichem Typ → FINDING
    ```

17. DESIGN-TOKEN-TREUE: Grepe im SCSS/Template-Code nach:
    - Hardcodierte Farben: `#xxx`, `rgb(`, `rgba(` die NICHT als Variable definiert sind
    - Hardcodierte Schriftgroessen: `font-size: Xpx` statt Variable/Mixin
    - Hardcodierte Abstaende: `margin/padding` mit Magic Numbers statt Variable
    - JEDER Fund → FINDING (Severity: LOW, aber zaehlt)

18. VISUELLE HIERARCHIE (Squint-Test): Mache einen Full-Page-Screenshot.
    - Betrachte ihn verkleinert (mental auf 25% skaliert)
    - Pruefe: Gibt es EINEN klaren Focal Point?
    - Pruefe: Sind Sektionen visuell klar unterscheidbar?
    - Pruefe: Gibt es eine natuerliche Blickfuehrung (F-Pattern oder Z-Pattern)?
    - IF alles gleich aussieht (monotones Card-Grid ohne Hierarchie) → FINDING
    - IF mehr als 3 identische Card-Layouts ohne Variation → FINDING: Monotones Layout

19. SURFACE-ELEVATION UND BORDER-QUALITAET:
    - Pruefe Borders via getComputedStyle:
      IF border-color ist hartes Grau (#ccc, #ddd, #999, #e0e0e0) statt rgba/Transparenz → FINDING
    - Pruefe Surface-Jumps: Benachbarte Flaechen mit Helligkeits-Unterschied > 20% → FINDING
    - Pruefe Schatten: box-shadow mit spread > 8px oder blur > 25px auf kleinen Elementen → FINDING
    - Pruefe: Werden Elevation-Tokens konsistent verwendet?

20. TYPOGRAFIE-SKALA UND KONSISTENZ:
    - Extrahiere ALLE verwendeten font-sizes auf der Seite via:
      ```javascript
      [...document.querySelectorAll('*')].map(el => getComputedStyle(el).fontSize)
      ```
    - Pruefe: Folgen sie einer konsistenten Skala (z.B. 12, 14, 16, 20, 24, 32)?
    - IF wilde Zwischenwerte (13px, 15px, 17px) → FINDING: Inkonsistente Typografie-Skala
    - Pruefe: Maximal 2 Schriftfamilien? IF mehr → FINDING
    - Pruefe: Konsistente font-weight Nutzung? (nicht 300, 400, 500, 600, 700 wild gemischt)

### Regel 21-22: Referenz-Vergleich & Gesamtwirkung
21. REFERENZ-VERGLEICH (falls Referenz-Screenshot vorhanden):
    - Oeffne den Referenz-Screenshot und den Live-Screenshot nebeneinander
    - Vergleiche SYSTEMATISCH:
      a. Layout-Struktur: Gleiche Anordnung der Elemente?
      b. Proportionen: Gleiche Breitenverhaeltnisse?
      c. Farben: Stimmen die Farben ueberein?
      d. Typografie: Gleiche Schriftgroessen und -gewichte?
      e. Spacing: Gleiche Abstaende?
    - JEDE erkennbare Abweichung → FINDING mit Screenshot-Vergleich

22. PROFESSIONELLE GESAMTWIRKUNG:
    - Pruefe Icon-Konsistenz: Nicht Outlined + Filled mischen, nicht verschiedene Icon-Sets mischen
    - Pruefe Farb-Konsistenz: Brand-Farben ueberall gleich verwendet?
    - Pruefe Alignment: Elemente in gleichen Zeilen auf gleicher Hoehe?
    - Pruefe Schriftkonsistenz: Gleiche Elemente (z.B. alle Ueberschriften) gleich formatiert?

### Regel 23: Platzhalter-Grafiken und Asset-Qualitaet
23. PLATZHALTER-ERKENNUNG:
    - Suche nach Platzhalter-Bildern: generische SVG-Icons, Lorem-Ipsum-Bilder, leere img-Tags,
      data:image/svg+xml Inline-Platzhalter, placeholder.com URLs, fehlende Bilder (broken img)
    - Suche nach rein CSS-basierten Pseudo-Grafiken die durch echte Assets ersetzt werden sollten
    - IF Platzhalter gefunden → FINDING mit konkretem Verbesserungsvorschlag:
      **Fix-Vorschlag MUSS enthalten:** "Verwende /stitch-design oder /agent-vibes:bmad stitch
      um hochwertige Assets zu generieren. Stitch MCP kann Screens, Icons und Illustrationen
      erstellen die zum Design-System passen."
    - Severity: MEDIUM (Platzhalter in Produktion sind unprofessionell)

## Output-Format

Findings-Liste. JEDES Finding:

```
### Finding #{nummer}: {kurzer Titel}
**Severity:** CRITICAL | HIGH | MEDIUM | LOW
**Kategorie:** Layout | Accessibility | Design-System | Interaktion | Craft | Referenz-Abweichung
**Screenshot:** {pfad-zum-screenshot}
**Problem:** {praezise Beschreibung was falsch ist}
**Wo:** {Datei:Zeile oder CSS-Selektor oder Screenshot-Bereich}
**Fix-Vorschlag:** {konkreter Vorschlag wie es gefixt werden kann}
```

### Severity-Definitionen:
- **CRITICAL:** Funktional kaputt (Button nicht klickbar, Content nicht sichtbar, Crash)
- **HIGH:** Deutlich sichtbar falsch (Ueberlappung, abgeschnittener Text, fehlender State)
- **MEDIUM:** Unprofessionell (inkonsistente Spacing, fehlender Hover, harte Borders)
- **LOW:** Design-System-Drift (hardcodierte Farbe, Magic Number, falsche Token-Nutzung)

PASS = NULL Findings jeglicher Severity. Sei gnadenlos. Punkt.
```

## Regeln

- Der Prompt ist GENERISCH und BLIND - IMMER
- KEIN Kontext ueber Fixes - NIEMALS
- KEINE Ausnahmen reinschreiben ("WCAG egal", "Demo" etc.) - VERBOTEN
- Skills MUESSEN genutzt werden - nicht optional
- Helper-Scripts MUESSEN ausgefuehrt werden - nicht optional
- Learnings-Datei MUSS gelesen und befolgt werden - nicht optional
- Der Fix-Loop laeuft AUTOMATISCH ohne User-Input
- Nach 5 Runden ohne PASS: User informieren und fragen ob weitermachen
- PASS = 0 Findings. Punkt. Nicht "0 Critical" oder "nur LOW". NULL.

## Selbstverbesserung (AUTOMATISCH)

### Wann triggert die Selbstverbesserung?

Der Hauptagent MUSS die Selbstverbesserung SOFORT ausfuehren wenn der User:
- Ein Design-Problem meldet das der Critic verpasst hat
- Sich beschwert dass etwas nicht gefunden wurde ("warum hast du nicht...", "das sieht man doch", "das ist offensichtlich", "hier fehlt noch...")
- Manuell ein visuelles Problem zeigt (Screenshot, Beschreibung)
- Nach einem Critic-Lauf sagt dass noch was falsch ist

### Wie laeuft die Selbstverbesserung?

1. **SOFORT identifizieren:** Was genau wurde verpasst? Welche Regel haette es finden muessen?
2. **SOFORT analysieren:** WARUM wurde es verpasst?
   - Keine passende Regel vorhanden? → Neue Regel noetig
   - Regel vorhanden aber zu vage? → Regel verschaerfen
   - Helper-Script hat es nicht erkannt? → Script erweitern
   - Playwright hat es nicht getestet? → Fehlende Interaktion
3. **SOFORT loggen:** Fuehre aus:
   ```bash
   node C:/Users/info/.claude/skills/design-critic/helpers/critic-learn.js \
     "<was wurde verpasst - praezise>" \
     "<konkreter Playwright/JS Check der es kuenftig findet>" \
     "<CRITICAL|HIGH|MEDIUM|LOW>" \
     "<Layout|Accessibility|Design-System|Interaktion|Craft>"
   ```
4. **User informieren:** Kurz bestaetigen was gelernt wurde.
5. **Statistik pruefen:** Wenn das Script eine SYSTEMATISCHE Schwaeche meldet (3+ Misses in einer Kategorie):
   - Den entsprechenden Helper-Script ERWEITERN mit dem neuen Check
   - ODER eine neue Regel in die SKILL.md einfuegen
   - Dies dem User mitteilen

### Beispiel-Ablauf

```
User: "Der Footer-Button ueberlappt mit der Tabelle wenn wenig Daten da sind!"

Agent denkt:
  → Was verpasst: Footer-Button kollidiert mit Tabelle bei wenig Daten
  → Warum verpasst: Nur mit vollen Daten getestet, nicht mit leerer/kurzer Tabelle
  → Check: Tabelle + Fixed-Footer bei verschiedenen Content-Hoehen testen

Agent fuehrt aus:
  node critic-learn.js \
    "Footer-Button ueberlappt Tabelle bei wenig Daten (kurze Liste)" \
    "Teste Fixed-Footer Kollision bei min-content: page.setViewportSize, dann scroll-to-bottom, getBoundingClientRect von Footer vs letztem Content-Element" \
    "HIGH" \
    "Layout"

Agent sagt: "Gelernt. Der Critic wird ab jetzt Fixed-Footer-Kollisionen bei 
verschiedenen Content-Hoehen pruefen. Das ist bereits der 4. Layout-Miss - 
ich erweitere auch das detect-overlaps.js Script."
```

### Dateien

| Datei | Zweck |
|-------|-------|
| `critic-learnings.jsonl` | Strukturiertes Log aller Misses (maschinenlesbar) |
| `critic-learnings.md` | Auto-generierte Checkliste (vom Critic gelesen) |
| `helpers/critic-learn.js` | Script das beides aktualisiert |

### Eskalation bei systematischen Schwaechen

Wenn `critic-learn.js` meldet dass eine Kategorie 3+ Misses hat:

1. **Layout 3+:** `detect-overlaps.js` erweitern mit dem spezifischen neuen Check
2. **Interaktion 3+:** `check-hover-states.js` erweitern oder neues Helper-Script erstellen
3. **Craft 3+:** Neue Regel in SKILL.md Phase 3 einfuegen
4. **Design-System 3+:** Stylelint-Config erweitern oder `.stylelintrc.design-critic.json` updaten
5. **Accessibility 3+:** Accessibility-Skill-Nutzung im Prompt verschaerfen
