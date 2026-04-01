/**
 * Design-Critic Helper: Hover State Detection
 *
 * Usage in Playwright (NOT page.evaluate - this is a Playwright script snippet):
 *
 * 1. First run detect-overlaps.js to get hoverTargets
 * 2. Then iterate hoverTargets and use this logic for each
 *
 * Example:
 *   const results = await page.evaluate(detectOverlapsScript);
 *   for (const target of results.hoverTargets) {
 *     // Screenshot before hover
 *     const beforeImg = await page.screenshot({ clip: { x: target.x - 30, y: target.y - 30, width: 60, height: 60 } });
 *     // Hover
 *     await page.mouse.move(target.x, target.y);
 *     await page.waitForTimeout(300);
 *     // Screenshot after hover
 *     const afterImg = await page.screenshot({ clip: { x: target.x - 30, y: target.y - 30, width: 60, height: 60 } });
 *     // Compare - if identical, no hover state
 *   }
 *
 * This file documents the approach. The actual execution happens in Playwright context.
 */

// This function runs inside page.evaluate() AFTER hovering to check computed style changes
// Call it with the element's selector
(function checkHoverEffect(selector) {
  const el = document.querySelector(selector);
  if (!el) return { found: false };

  const style = getComputedStyle(el);

  return {
    found: true,
    selector: selector,
    backgroundColor: style.backgroundColor,
    color: style.color,
    borderColor: style.borderColor,
    boxShadow: style.boxShadow,
    transform: style.transform,
    opacity: style.opacity,
    cursor: style.cursor,
    textDecoration: style.textDecoration
  };
})
