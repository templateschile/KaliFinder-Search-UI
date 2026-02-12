/**
 * Fallback Trigger
 * Creates a floating search bar (desktop) or icon button (mobile)
 * when no native search elements are found on the host page.
 */

import { log } from './logger';
import { getSearchIconMarkup, injectSearchBarStyles } from './search-bar-styles';

export type OpenWidgetFn = (query?: string) => void;

/**
 * Create the fallback trigger.
 * Returns a wrapper element containing both the desktop bar and the mobile
 * icon button (visibility is toggled via CSS media queries).
 */
export function createFallbackTrigger(openWidget: OpenWidgetFn): HTMLDivElement {
  log('No native search elements found, creating fallback trigger');

  // Ensure responsive styles are injected
  injectSearchBarStyles();

  const wrapper = document.createElement('div');
  wrapper.setAttribute('data-kalifinder-fallback', 'true');

  // ── Desktop: pill-shaped floating search bar ──
  const bar = document.createElement('button');
  bar.className = 'kf-fallback-bar';
  bar.setAttribute('aria-label', 'Open search');
  bar.setAttribute('type', 'button');
  bar.innerHTML = [
    getSearchIconMarkup(20),
    `<span class="kf-bar-text">Search products…</span>`,
  ].join('');

  bar.onclick = () => openWidget('');

  // ── Mobile: compact floating icon button ──
  const icon = document.createElement('button');
  icon.className = 'kf-fallback-icon';
  icon.setAttribute('aria-label', 'Open search');
  icon.setAttribute('type', 'button');
  icon.innerHTML = getSearchIconMarkup(24);

  icon.onclick = () => openWidget('');

  wrapper.appendChild(bar);
  wrapper.appendChild(icon);
  document.body.appendChild(wrapper);
  return wrapper;
}

/**
 * Remove fallback trigger from DOM
 */
export function removeFallbackTrigger(trigger: HTMLElement | null): void {
  if (trigger && document.body.contains(trigger)) {
    document.body.removeChild(trigger);
    log('Removed fallback trigger');
  }
}
