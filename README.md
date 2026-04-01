# Design-Critic Skill for Claude Code

Adversarial UX-Reviewer that automatically reviews web apps via Playwright, reports findings, auto-fixes them, and loops until PASS.

## What it does

```
/design-critic
    │
    ▼
Opens your app in Playwright (headless:false)
    │
    ▼
Runs 23 visual design rules + automated JS checks
    │
    ▼
Reports findings with screenshots
    │
    ▼
Auto-fixes ALL findings (no user input needed)
    │
    ▼
Loops: New blind critic → more findings? → fix → repeat
    │
    ▼
PASS = 0 findings of any severity
```

## Features

- **23 Design Rules** covering Accessibility, Layout Integrity, Interaction States, Design Craft, and Reference Comparison
- **Automated Overlap Detection** via Playwright `page.evaluate()` - finds buttons on text, overlapping elements, z-index issues
- **Sticky/Fixed Collision Detection** - finds headers/footers covering content
- **Hover State Verification** - checks every button/link for visual hover feedback
- **Design Token Compliance** - checks spacing grid, hardcoded colors, font scale consistency
- **Squint Test** - evaluates visual hierarchy and focal points
- **Self-Improvement Loop** - when the user reports a missed finding, the critic learns and adds it to its checklist
- **Stitch Integration** - recommends `/stitch-design` when placeholder graphics are detected

## Installation

### Windows
```bat
git clone https://github.com/Mediainvita/claude-skill-design-critic.git
cd claude-skill-design-critic
install.bat
```

### macOS / Linux
```bash
git clone https://github.com/Mediainvita/claude-skill-design-critic.git
cd claude-skill-design-critic
chmod +x install.sh
./install.sh
```

### One-liner (Windows)
```bat
powershell -c "git clone https://github.com/Mediainvita/claude-skill-design-critic.git %TEMP%\dc && %TEMP%\dc\install.bat"
```

## Required Skills

The design-critic references these companion skills during reviews:

| Skill | Required? | What it provides |
|-------|-----------|-----------------|
| `interface-design` | **Yes** | Craft evaluation, surface elevation, token architecture, squint test |
| `accessibility` | **Yes** | WCAG 2.1 audit checklists |
| `frontend-design` | Recommended | Design quality reference |
| `core-web-vitals` | Recommended | LCP, INP, CLS checks |

Install companion skills from [github.com/anthropics/skills](https://github.com/anthropics/skills) or [skillsmp.com](https://skillsmp.com/).

## Usage

In Claude Code:
```
/design-critic
```

The skill will ask for:
1. **URL** (default: `http://localhost:4200`)
2. **Reference screenshot** (optional - for visual comparison)
3. **Design system path** (optional - e.g., `_variables.scss`)

Then the auto-loop starts. No further input needed until PASS or 5 rounds.

## Self-Improvement

When the critic misses something and the user complains, the main agent automatically:

1. Logs the miss via `helpers/critic-learn.js`
2. Generates `critic-learnings.md` (read by the critic on every run)
3. If 3+ misses in the same category: escalates by extending helper scripts

```
User: "The footer overlaps the table!"
    → Agent runs: node critic-learn.js "Footer overlaps table" "check getBoundingClientRect" "HIGH" "Layout"
    → Next critic run reads critic-learnings.md
    → Checks for that specific issue with HIGHEST priority
```

## Helper Scripts

| Script | Purpose |
|--------|---------|
| `helpers/detect-overlaps.js` | Element overlap, text overflow, phantom scrollbars, viewport overflow, spacing grid, typography, color consistency, touch targets, border quality |
| `helpers/check-hover-states.js` | Hover state detection via before/after screenshot comparison |
| `helpers/check-sticky-collisions.js` | Sticky/fixed element collisions during scrolling |
| `helpers/critic-learn.js` | Self-improvement: logs missed findings, generates checklist |
| `helpers/.stylelintrc.design-critic.json` | Stylelint config for design token enforcement |

## File Structure

```
~/.claude/skills/design-critic/
├── SKILL.md                          # Main skill definition
├── critic-learnings.jsonl            # Auto-generated: missed findings log
├── critic-learnings.md               # Auto-generated: checklist for critic
└── helpers/
    ├── detect-overlaps.js            # Playwright overlap detection
    ├── check-hover-states.js         # Hover state verification
    ├── check-sticky-collisions.js    # Sticky element collision check
    ├── critic-learn.js               # Self-improvement script
    └── .stylelintrc.design-critic.json  # Stylelint design token config
```

## License

MIT
