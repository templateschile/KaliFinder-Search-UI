/**
 * Search Bar Responsive Styles
 * Injects a <style> block (once) into the host document for the
 * floating fallback trigger (used when no native search bar exists).
 *
 * Desktop  → pill-shaped search bar with text
 * Mobile   → compact circular icon button
 *
 * These elements live OUTSIDE the Shadow DOM, in the host page,
 * so we inject a real <style> tag with a unique prefix (`kf-`).
 */

const STYLE_ID = 'kalifinder-search-bar-styles';

const SEARCH_ICON_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;pointer-events:none;flex-shrink:0"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>`;

/**
 * Inject the shared stylesheet once. Subsequent calls are no-ops.
 */
export function injectSearchBarStyles(): void {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
/* ── KaliFinder fallback trigger (floating) ── */

.kf-fallback-bar {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 22px;
  border: none;
  border-radius: 28px;
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  color: #fff;
  cursor: pointer;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 16px rgba(124,58,237,0.35);
  z-index: 2147483646;
  pointer-events: auto;
  transition: box-shadow 0.2s, transform 0.2s;
  outline: none;
}
.kf-fallback-bar:hover {
  box-shadow: 0 6px 24px rgba(124,58,237,0.5);
  transform: translateY(-2px);
}
.kf-fallback-bar:focus-visible {
  box-shadow: 0 0 0 3px rgba(124,58,237,0.4), 0 6px 24px rgba(124,58,237,0.5);
}
.kf-fallback-bar .kf-bar-text { pointer-events: none; }

.kf-fallback-icon {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: none;
  width: 56px;
  height: 56px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  z-index: 2147483646;
  pointer-events: auto;
  color: #fff;
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  box-shadow: 0 4px 12px rgba(124,58,237,0.4);
  transition: box-shadow 0.2s, transform 0.2s;
  outline: none;
}
.kf-fallback-icon:hover {
  box-shadow: 0 6px 20px rgba(124,58,237,0.55);
  transform: translateY(-2px);
}
.kf-fallback-icon:focus-visible {
  box-shadow: 0 0 0 3px rgba(124,58,237,0.4), 0 6px 20px rgba(124,58,237,0.55);
}

/* ── Responsive: mobile breakpoint ── */
@media (max-width: 767px) {
  .kf-fallback-bar  { display: none !important; }
  .kf-fallback-icon { display: flex !important; }
}
  `.trim();

  document.head.appendChild(style);
}

/**
 * Return the standard search-icon SVG markup (shared between bar & icon).
 */
export function getSearchIconMarkup(size = 18): string {
  return SEARCH_ICON_SVG.replace(/width="\d+"/, `width="${size}"`).replace(
    /height="\d+"/,
    `height="${size}"`
  );
}
