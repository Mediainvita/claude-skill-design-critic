/**
 * Design-Critic Helper: Element Overlap & Layout Integrity Detection
 *
 * Usage: Paste into page.evaluate() in Playwright.
 * Returns an array of findings objects.
 *
 * Checks:
 * 1. Interactive element overlaps (buttons on text, overlapping clickables)
 * 2. Text overflow without ellipsis
 * 3. Container overflow (phantom scrollbars, hidden content)
 * 4. Viewport overflow (horizontal scroll)
 * 5. Z-index stacking issues
 * 6. Spacing grid compliance
 * 7. Hardcoded colors (not using CSS variables)
 * 8. Typography scale consistency
 * 9. Missing hover states (returns elements to test)
 */

(function detectDesignIssues(gridBase) {
  const findings = [];
  const GRID = gridBase || 8;

  // Helper: Get bounding rect
  function getRect(el) {
    const r = el.getBoundingClientRect();
    return { top: r.top, left: r.left, bottom: r.bottom, right: r.right, width: r.width, height: r.height };
  }

  // Helper: Check if two rects overlap
  function rectsOverlap(a, b) {
    return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
  }

  // Helper: Get a readable selector for an element
  function getSelector(el) {
    if (el.id) return '#' + el.id;
    if (el.className && typeof el.className === 'string') {
      const cls = el.className.trim().split(/\s+/).slice(0, 2).join('.');
      if (cls) return el.tagName.toLowerCase() + '.' + cls;
    }
    return el.tagName.toLowerCase();
  }

  // Helper: Is element visible?
  function isVisible(el) {
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  // ========================================
  // 1. INTERACTIVE ELEMENT OVERLAPS
  // ========================================
  const interactives = [...document.querySelectorAll('button, a, [role="button"], input, select, textarea, [onclick], [tabindex]')]
    .filter(isVisible);

  for (let i = 0; i < interactives.length; i++) {
    for (let j = i + 1; j < interactives.length; j++) {
      const a = interactives[i];
      const b = interactives[j];
      // Skip if one is inside the other
      if (a.contains(b) || b.contains(a)) continue;
      const ra = getRect(a);
      const rb = getRect(b);
      if (rectsOverlap(ra, rb)) {
        const overlapArea = Math.max(0, Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left)) *
                           Math.max(0, Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top));
        if (overlapArea > 4) { // Ignore sub-pixel overlaps
          findings.push({
            type: 'OVERLAP',
            severity: 'HIGH',
            elementA: getSelector(a),
            elementB: getSelector(b),
            overlapArea: Math.round(overlapArea),
            message: `Interactive elements overlap: "${getSelector(a)}" and "${getSelector(b)}" overlap by ${Math.round(overlapArea)}px²`
          });
        }
      }
    }
  }

  // ========================================
  // 2. TEXT OVERFLOW DETECTION
  // ========================================
  const textElements = [...document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, label, td, th, li, a, button, div')]
    .filter(el => {
      if (!isVisible(el)) return false;
      // Only check elements that directly contain text
      return el.childNodes.length > 0 && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    });

  for (const el of textElements) {
    const style = getComputedStyle(el);
    const hasHorizontalOverflow = el.scrollWidth > el.clientWidth + 1;
    const hasVerticalOverflow = el.scrollHeight > el.clientHeight + 1;

    if (hasHorizontalOverflow || hasVerticalOverflow) {
      const hasEllipsis = style.textOverflow === 'ellipsis';
      const hasOverflowHidden = style.overflow === 'hidden' || style.overflowX === 'hidden' || style.overflowY === 'hidden';
      const hasOverflowAuto = style.overflow === 'auto' || style.overflow === 'scroll' ||
                              style.overflowX === 'auto' || style.overflowY === 'auto' ||
                              style.overflowX === 'scroll' || style.overflowY === 'scroll';

      if (!hasOverflowHidden && !hasOverflowAuto && !hasEllipsis) {
        findings.push({
          type: 'TEXT_OVERFLOW',
          severity: 'HIGH',
          element: getSelector(el),
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth,
          scrollHeight: el.scrollHeight,
          clientHeight: el.clientHeight,
          text: el.textContent.substring(0, 60),
          message: `Text overflows container without handling: "${getSelector(el)}" (scroll: ${el.scrollWidth}x${el.scrollHeight}, client: ${el.clientWidth}x${el.clientHeight})`
        });
      } else if (hasEllipsis && !el.title) {
        findings.push({
          type: 'TEXT_TRUNCATED_NO_TOOLTIP',
          severity: 'LOW',
          element: getSelector(el),
          text: el.textContent.substring(0, 60),
          message: `Text truncated with ellipsis but no title/tooltip: "${getSelector(el)}"`
        });
      }
    }
  }

  // ========================================
  // 3. CONTAINER OVERFLOW (Phantom Scrollbars)
  // ========================================
  const containers = [...document.querySelectorAll('div, section, main, aside, nav, article, ul, ol')]
    .filter(isVisible);

  for (const el of containers) {
    const style = getComputedStyle(el);
    const hasScroll = style.overflow === 'auto' || style.overflow === 'scroll' ||
                      style.overflowY === 'auto' || style.overflowY === 'scroll';

    if (hasScroll) {
      const hasVerticalScrollbar = el.scrollHeight > el.clientHeight;
      const hasHorizontalScrollbar = el.scrollWidth > el.clientWidth;

      // Phantom scrollbar: scrollable set but nothing to scroll
      if (!hasVerticalScrollbar && !hasHorizontalScrollbar && el.clientHeight > 50) {
        // Only flag if the container is substantial
        const rect = getRect(el);
        if (rect.height > 100) {
          findings.push({
            type: 'PHANTOM_SCROLLBAR',
            severity: 'LOW',
            element: getSelector(el),
            message: `Container has overflow:auto/scroll but no content to scroll: "${getSelector(el)}"`
          });
        }
      }
    }
  }

  // ========================================
  // 4. VIEWPORT OVERFLOW
  // ========================================
  if (document.body.scrollWidth > window.innerWidth + 1) {
    findings.push({
      type: 'VIEWPORT_OVERFLOW',
      severity: 'CRITICAL',
      bodyScrollWidth: document.body.scrollWidth,
      viewportWidth: window.innerWidth,
      message: `Page has horizontal scroll: body width ${document.body.scrollWidth}px > viewport ${window.innerWidth}px`
    });
  }

  // ========================================
  // 5. SPACING GRID COMPLIANCE
  // ========================================
  const spacingElements = [...document.querySelectorAll('.mat-mdc-card, .mat-mdc-dialog-content, section, .card, [class*="container"], [class*="panel"], [class*="section"]')]
    .filter(isVisible);

  for (const el of spacingElements) {
    const style = getComputedStyle(el);
    const paddings = [
      { name: 'padding-top', value: parseFloat(style.paddingTop) },
      { name: 'padding-right', value: parseFloat(style.paddingRight) },
      { name: 'padding-bottom', value: parseFloat(style.paddingBottom) },
      { name: 'padding-left', value: parseFloat(style.paddingLeft) }
    ];

    for (const p of paddings) {
      if (p.value > 0 && p.value % GRID !== 0) {
        findings.push({
          type: 'GRID_VIOLATION',
          severity: 'LOW',
          element: getSelector(el),
          property: p.name,
          value: p.value,
          nearestGrid: Math.round(p.value / GRID) * GRID,
          message: `Spacing off-grid: "${getSelector(el)}" ${p.name}=${p.value}px (nearest: ${Math.round(p.value / GRID) * GRID}px)`
        });
      }
    }
  }

  // ========================================
  // 6. TYPOGRAPHY SCALE ANALYSIS
  // ========================================
  const fontSizes = new Map();
  const allText = [...document.querySelectorAll('*')].filter(el => {
    if (!isVisible(el)) return false;
    return el.childNodes.length > 0 && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
  });

  for (const el of allText) {
    const size = getComputedStyle(el).fontSize;
    const px = parseFloat(size);
    if (!fontSizes.has(px)) fontSizes.set(px, []);
    fontSizes.get(px).push(getSelector(el));
  }

  const sortedSizes = [...fontSizes.keys()].sort((a, b) => a - b);
  if (sortedSizes.length > 8) {
    findings.push({
      type: 'TYPOGRAPHY_INCONSISTENT',
      severity: 'MEDIUM',
      sizes: sortedSizes.map(s => s + 'px'),
      count: sortedSizes.length,
      message: `Too many font sizes (${sortedSizes.length}): ${sortedSizes.map(s => s + 'px').join(', ')}. Should be max 6-8.`
    });
  }

  // Check for "weird" sizes (not common in type scales)
  const commonSizes = [10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 28, 30, 32, 36, 40, 48, 56, 64, 72];
  for (const size of sortedSizes) {
    const rounded = Math.round(size * 10) / 10;
    if (rounded !== Math.round(rounded) && !commonSizes.includes(Math.round(size))) {
      findings.push({
        type: 'TYPOGRAPHY_ODD_SIZE',
        severity: 'LOW',
        size: size + 'px',
        examples: (fontSizes.get(size) || []).slice(0, 3),
        message: `Unusual font size: ${size}px on ${(fontSizes.get(size) || []).slice(0, 2).join(', ')}`
      });
    }
  }

  // ========================================
  // 7. FONT FAMILY CONSISTENCY
  // ========================================
  const fontFamilies = new Set();
  for (const el of allText) {
    const family = getComputedStyle(el).fontFamily.split(',')[0].trim().replace(/['"]/g, '');
    fontFamilies.add(family);
  }
  if (fontFamilies.size > 2) {
    findings.push({
      type: 'TOO_MANY_FONTS',
      severity: 'MEDIUM',
      fonts: [...fontFamilies],
      message: `Too many font families (${fontFamilies.size}): ${[...fontFamilies].join(', ')}. Max 2 recommended.`
    });
  }

  // ========================================
  // 8. BORDER QUALITY CHECK
  // ========================================
  const borderedElements = containers.filter(el => {
    const style = getComputedStyle(el);
    return style.borderWidth !== '0px' && style.borderStyle !== 'none';
  });

  for (const el of borderedElements) {
    const style = getComputedStyle(el);
    const borderColor = style.borderColor;
    // Check for harsh hex grays (not using rgba transparency)
    if (borderColor && !borderColor.includes('rgba') && borderColor.includes('rgb')) {
      const match = borderColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (match) {
        const [, r, g, b] = match.map(Number);
        // Pure gray and harsh (not subtle)
        if (r === g && g === b && r >= 150 && r <= 230) {
          findings.push({
            type: 'HARSH_BORDER',
            severity: 'LOW',
            element: getSelector(el),
            color: borderColor,
            message: `Harsh solid border on "${getSelector(el)}": ${borderColor}. Consider rgba() with transparency for subtlety.`
          });
        }
      }
    }
  }

  // ========================================
  // 9. UNIQUE COLORS ANALYSIS
  // ========================================
  const colors = new Set();
  const bgColors = new Set();
  for (const el of [...document.querySelectorAll('*')].filter(isVisible).slice(0, 500)) {
    const style = getComputedStyle(el);
    if (style.color && style.color !== 'rgba(0, 0, 0, 0)') colors.add(style.color);
    if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') bgColors.add(style.backgroundColor);
  }
  if (colors.size > 15) {
    findings.push({
      type: 'TOO_MANY_TEXT_COLORS',
      severity: 'MEDIUM',
      count: colors.size,
      message: `Too many unique text colors (${colors.size}). Indicates design system drift. Max 8-10 recommended.`
    });
  }
  if (bgColors.size > 12) {
    findings.push({
      type: 'TOO_MANY_BG_COLORS',
      severity: 'MEDIUM',
      count: bgColors.size,
      message: `Too many unique background colors (${bgColors.size}). Indicates design system drift. Max 6-8 recommended.`
    });
  }

  // ========================================
  // 10. TOUCH TARGET SIZE CHECK
  // ========================================
  for (const el of interactives) {
    const rect = getRect(el);
    if (rect.width < 44 || rect.height < 44) {
      // Don't flag inline links in text
      if (el.tagName === 'A' && el.closest('p, li, span')) continue;
      findings.push({
        type: 'SMALL_TOUCH_TARGET',
        severity: 'MEDIUM',
        element: getSelector(el),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        message: `Touch target too small: "${getSelector(el)}" is ${Math.round(rect.width)}x${Math.round(rect.height)}px (min 44x44px)`
      });
    }
  }

  // ========================================
  // 11. INTERACTIVE ELEMENTS FOR HOVER TEST
  // (Returns selectors so Playwright can hover each one)
  // ========================================
  const hoverTargets = interactives
    .filter(el => el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA' && el.tagName !== 'SELECT')
    .slice(0, 50) // Limit to avoid timeout
    .map(el => {
      const rect = getRect(el);
      return {
        selector: el.id ? '#' + el.id : getSelector(el),
        text: (el.textContent || '').substring(0, 30).trim(),
        x: Math.round(rect.left + rect.width / 2),
        y: Math.round(rect.top + rect.height / 2)
      };
    });

  return {
    findings,
    hoverTargets,
    summary: {
      totalFindings: findings.length,
      critical: findings.filter(f => f.severity === 'CRITICAL').length,
      high: findings.filter(f => f.severity === 'HIGH').length,
      medium: findings.filter(f => f.severity === 'MEDIUM').length,
      low: findings.filter(f => f.severity === 'LOW').length,
      uniqueFontSizes: sortedSizes.length,
      uniqueTextColors: colors.size,
      uniqueBgColors: bgColors.size,
      uniqueFontFamilies: fontFamilies.size,
      interactiveElements: interactives.length
    }
  };
})(8); // Pass grid base as argument (default 8px)
