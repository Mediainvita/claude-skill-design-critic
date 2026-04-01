# Critic Learnings - Automatisch generiert

> Diese Datei wird vom Critic-Subagent bei JEDEM Lauf gelesen.
> Jeder Eintrag ist ein Design-Problem das der Critic verpasst hat.
> Der Critic MUSS diese Checks zusaetzlich zu seinen Regeln ausfuehren.

**Gesamt: 5 Learnings** | Letzte Aktualisierung: 2026-04-01

## Schwachstellen-Statistik

| Kategorie | Misses | Trend |
|-----------|--------|-------|
| Craft | 3 | ⚠ SYSTEMATISCH |
| Layout | 2 | ↑ Wiederholt |

## Craft

### #2: Critic fokussiert sich auf Viewport/Footer statt auf sichtbare Layout-Probleme in der Hauptansicht
- **Severity:** MEDIUM
- **Erkennung:** Vor Viewport-Tests IMMER erst die Default-Ansicht bei 1920x1080 pixel-genau pruefen: Alignment aller Zeilen-Elemente, Spacing zwischen Spalten, visuelle Konsistenz der Rows
- **Datum:** 2026-04-01

### #3: Footer-Tab-Bereich visuell komplett kaputt: DEMO-Badges ueberlagern Tabs, Variante-B Formular Layout broken, Inputs nicht aligned, riesige leere Flaeche rechts. 4 Runden lang nicht bemerkt.
- **Severity:** CRITICAL
- **Erkennung:** VISUELLE INSPEKTION des Footer-Tab-Bereichs: Screenshot bei JEDEM Tab-Wechsel. Pruefe: Label-Input-Alignment, Form-Layout, leere Flaechen, Badge-Positionierung, Gesamteindruck. Vor technischen Checks IMMER erst den aktiven Feature-Bereich VISUELL pruefen.
- **Datum:** 2026-04-01

### #5: Critic priorisiert technische Metriken (WCAG Kontrast, Viewport-Hoehe, Token-Compliance) ueber offensichtliche visuelle Probleme die jeder Mensch sofort sieht
- **Severity:** CRITICAL
- **Erkennung:** NEUE PHASE 0 im Critic-Prompt: VOR allen technischen Checks muss der Critic jeden sichtbaren Bereich der App BESCHREIBEN als waere er ein Mensch. Was sieht gut aus? Was sieht billig aus? Was wuerde ein Nicht-Techniker sofort als kaputt bezeichnen? Erst DANACH technische Checks.
- **Datum:** 2026-04-01

## Layout

### #1: Checkboxen visuell kaputt - Grid interferiert mit Font, Spacing fehlt, Layout-Inkonsistenzen im gesamten Cockpit
- **Severity:** HIGH
- **Erkennung:** Visuelle Inspektion der Checkbox-Zeilen: getBoundingClientRect auf checkbox vs label vs amount, pruefe alignment, pruefe ob Grid-System die Elemente verzerrt, pruefe Spacing zwischen allen Row-Elementen
- **Datum:** 2026-04-01

### #4: Buttons ueberlappen Font-Text in Footer-Tabs, Scrollbars innerhalb kleiner Tabs sichtbar, Neue-Phase-Form komplett visuell kaputt mit abgeschnittenen Labels und zu engen Inputs
- **Severity:** CRITICAL
- **Erkennung:** Bei JEDEM Tab-Wechsel: Screenshot machen und VISUELL beschreiben was man sieht. Spezifisch pruefen: Ueberlagern sich Button-Texte mit anderen Elementen? Sind Scrollbars sichtbar die nicht sein sollten? Sind Form-Labels abgeschnitten? Passen Inputs visuell zur Umgebung?
- **Datum:** 2026-04-01

---

## Zusaetzliche Checks fuer den Critic

Diese Checks sind aus verpassten Findings abgeleitet und MUESSEN bei jedem Review ausgefuehrt werden:

1. **[HIGH]** Visuelle Inspektion der Checkbox-Zeilen: getBoundingClientRect auf checkbox vs label vs amount, pruefe alignment, pruefe ob Grid-System die Elemente verzerrt, pruefe Spacing zwischen allen Row-Elementen
   _Kontext: Checkboxen visuell kaputt - Grid interferiert mit Font, Spacing fehlt, Layout-Inkonsistenzen im gesamten Cockpit_

2. **[MEDIUM]** Vor Viewport-Tests IMMER erst die Default-Ansicht bei 1920x1080 pixel-genau pruefen: Alignment aller Zeilen-Elemente, Spacing zwischen Spalten, visuelle Konsistenz der Rows
   _Kontext: Critic fokussiert sich auf Viewport/Footer statt auf sichtbare Layout-Probleme in der Hauptansicht_

3. **[CRITICAL]** VISUELLE INSPEKTION des Footer-Tab-Bereichs: Screenshot bei JEDEM Tab-Wechsel. Pruefe: Label-Input-Alignment, Form-Layout, leere Flaechen, Badge-Positionierung, Gesamteindruck. Vor technischen Checks IMMER erst den aktiven Feature-Bereich VISUELL pruefen.
   _Kontext: Footer-Tab-Bereich visuell komplett kaputt: DEMO-Badges ueberlagern Tabs, Variante-B Formular Layout broken, Inputs nicht aligned, riesige leere Flaeche rechts. 4 Runden lang nicht bemerkt._

4. **[CRITICAL]** Bei JEDEM Tab-Wechsel: Screenshot machen und VISUELL beschreiben was man sieht. Spezifisch pruefen: Ueberlagern sich Button-Texte mit anderen Elementen? Sind Scrollbars sichtbar die nicht sein sollten? Sind Form-Labels abgeschnitten? Passen Inputs visuell zur Umgebung?
   _Kontext: Buttons ueberlappen Font-Text in Footer-Tabs, Scrollbars innerhalb kleiner Tabs sichtbar, Neue-Phase-Form komplett visuell kaputt mit abgeschnittenen Labels und zu engen Inputs_

5. **[CRITICAL]** NEUE PHASE 0 im Critic-Prompt: VOR allen technischen Checks muss der Critic jeden sichtbaren Bereich der App BESCHREIBEN als waere er ein Mensch. Was sieht gut aus? Was sieht billig aus? Was wuerde ein Nicht-Techniker sofort als kaputt bezeichnen? Erst DANACH technische Checks.
   _Kontext: Critic priorisiert technische Metriken (WCAG Kontrast, Viewport-Hoehe, Token-Compliance) ueber offensichtliche visuelle Probleme die jeder Mensch sofort sieht_

