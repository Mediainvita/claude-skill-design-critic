#!/usr/bin/env node
/**
 * Design-Critic Self-Improvement Script
 *
 * Wird aufgerufen wenn der User ein verpasstes Design-Problem meldet.
 * Schreibt strukturierte Learnings in critic-learnings.jsonl UND
 * generiert daraus automatisch die lesbare critic-learnings.md.
 *
 * Usage:
 *   node critic-learn.js "<was wurde verpasst>" "<wie haette man es finden koennen>" "<severity>" "<kategorie>"
 *
 * Beispiel:
 *   node critic-learn.js \
 *     "Button-Text ueberlappt mit Badge bei langen Mieter-Namen" \
 *     "getBoundingClientRect() auf Button vs Badge pruefen bei Text > 20 Zeichen" \
 *     "HIGH" \
 *     "Layout"
 */

const fs = require('fs');
const path = require('path');

const SKILL_DIR = path.resolve(__dirname, '..');
const JSONL_FILE = path.join(SKILL_DIR, 'critic-learnings.jsonl');
const MD_FILE = path.join(SKILL_DIR, 'critic-learnings.md');

// --- Parse args ---
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error(`
Design-Critic Learn - Selbstverbesserung

Usage:
  node critic-learn.js "<was verpasst>" "<wie finden>" [severity] [kategorie]

Args:
  was verpasst    - Beschreibung des verpassten Problems
  wie finden      - Konkreter Playwright/JS Check um es kuenftig zu finden
  severity        - CRITICAL | HIGH | MEDIUM | LOW (default: HIGH)
  kategorie       - Layout | Accessibility | Design-System | Interaktion | Craft (default: Layout)

Beispiel:
  node critic-learn.js "Tooltip abgeschnitten am Viewport-Rand" "Element.getBoundingClientRect() + viewport check" HIGH Layout
`);
  process.exit(1);
}

const missed = args[0];
const detection = args[1];
const severity = (args[2] || 'HIGH').toUpperCase();
const category = args[3] || 'Layout';

const validSeverities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
if (!validSeverities.includes(severity)) {
  console.error(`Ungueltige Severity: ${severity}. Erlaubt: ${validSeverities.join(', ')}`);
  process.exit(1);
}

const validCategories = ['Layout', 'Accessibility', 'Design-System', 'Interaktion', 'Craft', 'Referenz-Abweichung'];
if (!validCategories.includes(category)) {
  console.error(`Ungueltige Kategorie: ${category}. Erlaubt: ${validCategories.join(', ')}`);
  process.exit(1);
}

// --- Write JSONL entry ---
const entry = {
  timestamp: new Date().toISOString(),
  missed: missed,
  detection: detection,
  severity: severity,
  category: category,
  version: getNextVersion()
};

fs.appendFileSync(JSONL_FILE, JSON.stringify(entry) + '\n', 'utf8');
console.log(`[LEARN] Neues Learning #${entry.version} gespeichert.`);

// --- Regenerate MD from JSONL ---
regenerateMarkdown();
console.log(`[LEARN] critic-learnings.md aktualisiert.`);

// --- Stats ---
const allEntries = readAllEntries();
const stats = {
  total: allEntries.length,
  bySeverity: {},
  byCategory: {}
};
for (const e of allEntries) {
  stats.bySeverity[e.severity] = (stats.bySeverity[e.severity] || 0) + 1;
  stats.byCategory[e.category] = (stats.byCategory[e.category] || 0) + 1;
}
console.log(`[STATS] ${stats.total} Learnings gesamt.`);
console.log(`  Severity: ${Object.entries(stats.bySeverity).map(([k,v]) => `${k}=${v}`).join(', ')}`);
console.log(`  Kategorie: ${Object.entries(stats.byCategory).map(([k,v]) => `${k}=${v}`).join(', ')}`);

// --- Check for pattern ---
const categoryCount = stats.byCategory[category] || 0;
if (categoryCount >= 3) {
  console.log(`\n[WARNUNG] Bereits ${categoryCount} Misses in Kategorie "${category}".`);
  console.log(`  → Der Critic hat ein systematisches Problem mit ${category}-Erkennung.`);
  console.log(`  → Erwäge: Neue Regel in SKILL.md oder besseres Helper-Script.`);
}

// ============================================================
// Helper Functions
// ============================================================

function getNextVersion() {
  const entries = readAllEntries();
  return entries.length + 1;
}

function readAllEntries() {
  if (!fs.existsSync(JSONL_FILE)) return [];
  return fs.readFileSync(JSONL_FILE, 'utf8')
    .trim()
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      try { return JSON.parse(line); }
      catch { return null; }
    })
    .filter(Boolean);
}

function regenerateMarkdown() {
  const entries = readAllEntries();

  if (entries.length === 0) {
    fs.writeFileSync(MD_FILE, '# Critic Learnings\n\nNoch keine Learnings.\n', 'utf8');
    return;
  }

  // Group by category
  const grouped = {};
  for (const e of entries) {
    if (!grouped[e.category]) grouped[e.category] = [];
    grouped[e.category].push(e);
  }

  let md = `# Critic Learnings - Automatisch generiert\n\n`;
  md += `> Diese Datei wird vom Critic-Subagent bei JEDEM Lauf gelesen.\n`;
  md += `> Jeder Eintrag ist ein Design-Problem das der Critic verpasst hat.\n`;
  md += `> Der Critic MUSS diese Checks zusaetzlich zu seinen Regeln ausfuehren.\n\n`;
  md += `**Gesamt: ${entries.length} Learnings** | Letzte Aktualisierung: ${new Date().toISOString().split('T')[0]}\n\n`;

  // Stats table
  md += `## Schwachstellen-Statistik\n\n`;
  md += `| Kategorie | Misses | Trend |\n`;
  md += `|-----------|--------|-------|\n`;
  for (const [cat, items] of Object.entries(grouped).sort((a, b) => b[1].length - a[1].length)) {
    const trend = items.length >= 3 ? '⚠ SYSTEMATISCH' : items.length >= 2 ? '↑ Wiederholt' : '—';
    md += `| ${cat} | ${items.length} | ${trend} |\n`;
  }
  md += `\n`;

  // Entries by category
  for (const [cat, items] of Object.entries(grouped).sort((a, b) => b[1].length - a[1].length)) {
    md += `## ${cat}\n\n`;
    for (const e of items.sort((a, b) => {
      const sevOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return (sevOrder[a.severity] || 4) - (sevOrder[b.severity] || 4);
    })) {
      md += `### #${e.version}: ${e.missed}\n`;
      md += `- **Severity:** ${e.severity}\n`;
      md += `- **Erkennung:** ${e.detection}\n`;
      md += `- **Datum:** ${e.timestamp.split('T')[0]}\n\n`;
    }
  }

  // Generate concrete check-list for the critic
  md += `---\n\n`;
  md += `## Zusaetzliche Checks fuer den Critic\n\n`;
  md += `Diese Checks sind aus verpassten Findings abgeleitet und MUESSEN bei jedem Review ausgefuehrt werden:\n\n`;

  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    md += `${i + 1}. **[${e.severity}]** ${e.detection}\n`;
    md += `   _Kontext: ${e.missed}_\n\n`;
  }

  fs.writeFileSync(MD_FILE, md, 'utf8');
}
