/**
 * Design-Critic Helper: Sticky/Fixed Element Collision Detection
 *
 * Usage: Run via page.evaluate() at different scroll positions.
 * Call this at scroll=0, scroll=300, scroll=600, etc.
 *
 * Returns findings about sticky/fixed elements that collide with content.
 */

(function checkStickyCollisions() {
  const findings = [];

  function getSelector(el) {
    if (el.id) return '#' + el.id;
    if (el.className && typeof el.className === 'string') {
      const cls = el.className.trim().split(/\s+/).slice(0, 2).join('.');
      if (cls) return el.tagName.toLowerCase() + '.' + cls;
    }
    return el.tagName.toLowerCase();
  }

  // Find all sticky and fixed elements
  const allElements = [...document.querySelectorAll('*')];
  const stickyFixed = allElements.filter(el => {
    const pos = getComputedStyle(el).position;
    return pos === 'sticky' || pos === 'fixed';
  });

  if (stickyFixed.length === 0) return { findings: [], stickyElements: [] };

  const stickyInfo = stickyFixed.map(el => {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return {
      selector: getSelector(el),
      position: style.position,
      zIndex: style.zIndex,
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
      height: rect.height,
      width: rect.width
    };
  });

  // Check for overlaps between sticky/fixed elements and main content
  const mainContent = document.querySelector('main, [role="main"], .main-content, .content, mat-sidenav-content');
  if (mainContent) {
    const contentChildren = [...mainContent.querySelectorAll(':scope > *, :scope > * > *')]
      .filter(el => {
        const style = getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      })
      .slice(0, 50);

    for (const sticky of stickyFixed) {
      const stickyRect = sticky.getBoundingClientRect();
      for (const content of contentChildren) {
        if (sticky.contains(content) || content.contains(sticky)) continue;
        const contentRect = content.getBoundingClientRect();

        // Check if sticky overlaps content
        const overlaps = !(stickyRect.right <= contentRect.left ||
                          stickyRect.left >= contentRect.right ||
                          stickyRect.bottom <= contentRect.top ||
                          stickyRect.top >= contentRect.bottom);

        if (overlaps) {
          const overlapHeight = Math.min(stickyRect.bottom, contentRect.bottom) - Math.max(stickyRect.top, contentRect.top);
          if (overlapHeight > 5) { // Ignore trivial overlaps
            findings.push({
              type: 'STICKY_COLLISION',
              severity: 'HIGH',
              stickyElement: getSelector(sticky),
              contentElement: getSelector(content),
              overlapHeight: Math.round(overlapHeight),
              scrollY: window.scrollY,
              message: `Sticky "${getSelector(sticky)}" overlaps content "${getSelector(content)}" by ${Math.round(overlapHeight)}px at scroll position ${Math.round(window.scrollY)}`
            });
          }
        }
      }
    }
  }

  // Check if fixed footer covers content at bottom
  const fixedBottom = stickyFixed.filter(el => {
    const rect = el.getBoundingClientRect();
    return rect.bottom >= window.innerHeight - 10;
  });

  for (const footer of fixedBottom) {
    const footerRect = footer.getBoundingClientRect();
    const footerHeight = footerRect.height;

    // Check if last content element is fully visible above the footer
    const allContent = [...document.querySelectorAll('p, div, table, ul, section')]
      .filter(el => {
        const r = el.getBoundingClientRect();
        return r.height > 0 && r.bottom > window.innerHeight - footerHeight - 20;
      });

    if (allContent.length > 0) {
      findings.push({
        type: 'FIXED_FOOTER_OVERLAP',
        severity: 'MEDIUM',
        footer: getSelector(footer),
        footerHeight: Math.round(footerHeight),
        affectedElements: allContent.length,
        message: `Fixed footer "${getSelector(footer)}" (${Math.round(footerHeight)}px) may obscure ${allContent.length} content elements at page bottom`
      });
    }
  }

  return {
    findings,
    stickyElements: stickyInfo
  };
})();
