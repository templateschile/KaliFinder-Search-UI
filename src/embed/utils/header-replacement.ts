/**
 * Header Search Hijack
 * Intercepts search elements inside <header> so they open our widget
 * instead of the theme's native search.
 *
 * Key idea: we do NOT replace or hide the original elements.
 * The theme's search bar stays in the DOM with its original styles,
 * fonts, colors, and responsive behaviour fully intact.
 * We only intercept user interactions (click / focus / submit) and
 * redirect them to `openWidget()`.
 */

import { log, warn } from './logger';
import { SEARCH_SELECTORS } from './search-selectors';

export type OpenWidgetFn = (query?: string) => void;

// ── Guard: prevents re-opening when the user closes the widget and the
//    input is still focused underneath.
let _lastOpenTs = 0;
const OPEN_COOLDOWN_MS = 400;

function openOnce(openWidget: OpenWidgetFn, query?: string): void {
  const now = Date.now();
  if (now - _lastOpenTs < OPEN_COOLDOWN_MS) return;
  _lastOpenTs = now;
  openWidget(query ?? '');
}

// ── Helpers ──

function isInHeader(element: Element): boolean {
  return element.closest('header') !== null;
}

/**
 * Hijack a single <input> element so any interaction opens our widget.
 */
function hijackInput(input: HTMLInputElement, openWidget: OpenWidgetFn): void {
  if (input.hasAttribute('data-kalifinder-hijacked')) return;
  input.setAttribute('data-kalifinder-hijacked', 'true');

  // Click → open widget
  input.addEventListener(
    'click',
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      log('Hijacked input clicked, opening widget');
      openOnce(openWidget);
    },
    { capture: true }
  );

  // Focus → blur immediately + open widget (prevents keyboard on mobile)
  input.addEventListener(
    'focus',
    () => {
      requestAnimationFrame(() => input.blur());
      log('Hijacked input focused, opening widget');
      openOnce(openWidget);
    },
    { capture: true }
  );

  // Show pointer cursor so the user knows it's clickable
  input.style.cursor = 'pointer';
  // Prevent the caret / mobile keyboard from appearing
  input.style.caretColor = 'transparent';
}

/**
 * Hijack a single search element (form, input, button, link, details…).
 * Returns `true` if it was newly hijacked, `false` if skipped.
 */
function hijackElement(element: Element, openWidget: OpenWidgetFn): boolean {
  if (element.hasAttribute('data-kalifinder-hijacked')) return false;
  if (!isInHeader(element)) return false;

  element.setAttribute('data-kalifinder-hijacked', 'true');

  const intercept = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    log('Hijacked element activated:', element.tagName, element.className || element.id);
    openOnce(openWidget);
  };

  try {
    // ── Forms: intercept submit + hijack child inputs ──
    if (element instanceof HTMLFormElement) {
      element.addEventListener('submit', intercept, { capture: true });

      // Also hijack every search-like input inside the form
      const inputs = element.querySelectorAll<HTMLInputElement>(
        'input[type="search"], input[name="q"], input[name="s"], input[placeholder]'
      );
      inputs.forEach((input) => hijackInput(input, openWidget));

      log('Hijacked search form in header:', element.className || element.id);
      return true;
    }

    // ── Inputs (standalone) ──
    if (element instanceof HTMLInputElement) {
      hijackInput(element, openWidget);
      log('Hijacked standalone input in header:', element.name || element.id);
      return true;
    }

    // ── Buttons / links ──
    if (element instanceof HTMLButtonElement || element instanceof HTMLAnchorElement) {
      element.addEventListener('click', intercept, { capture: true });
      log('Hijacked button/link in header:', element.tagName, element.className || element.id);
      return true;
    }

    // ── Details / Summary (Shopify pattern) ──
    if (
      element instanceof HTMLDetailsElement ||
      element.tagName.toLowerCase() === 'summary'
    ) {
      element.addEventListener('click', intercept, { capture: true });
      log('Hijacked details/summary in header:', element.className || element.id);
      return true;
    }

    // Generic fallback: listen for click
    element.addEventListener('click', intercept, { capture: true });
    log('Hijacked generic element in header:', element.tagName);
    return true;
  } catch (err) {
    warn('Failed to hijack element:', err);
    return false;
  }
}

/**
 * Find all search elements in headers.
 */
function findHeaderSearchElements(): Set<Element> {
  const found = new Set<Element>();

  SEARCH_SELECTORS.forEach((sel) => {
    try {
      document.querySelectorAll(sel).forEach((el) => {
        if (isInHeader(el)) {
          found.add(el);
        }
      });
    } catch (e) {
      warn(`Invalid selector: ${sel}`, e);
    }
  });

  return found;
}

/**
 * Hijack all search elements in headers so they open our widget.
 * Returns `true` if any elements were hijacked.
 */
export function replaceHeaderSearchElements(openWidget: OpenWidgetFn): boolean {
  const elements = findHeaderSearchElements();
  log(`Found ${elements.size} search elements in headers to hijack`);

  if (elements.size === 0) return false;

  let hijacked = 0;
  elements.forEach((el) => {
    if (hijackElement(el, openWidget)) {
      hijacked++;
    }
  });

  log(`Hijacked ${hijacked} search elements in headers`);
  return hijacked > 0;
}

/**
 * Setup MutationObserver to detect dynamically added search elements in headers
 */
export function setupHeaderReplacementObserver(openWidget: OpenWidgetFn): MutationObserver {
  const observer = new MutationObserver((mutations) => {
    let shouldScan = false;

    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        for (const node of mutation.addedNodes) {
          if (node instanceof Element) {
            if (node.closest('header') && node.matches('form, input, button, a, details')) {
              shouldScan = true;
              break;
            }
          }
        }
      }
      if (shouldScan) break;
    }

    if (shouldScan) {
      log('Detected new DOM changes in header, scanning for search elements');
      replaceHeaderSearchElements(openWidget);
    }
  });

  setTimeout(() => {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    log('Header hijack observer started watching for dynamic search elements');
  }, 1000);

  return observer;
}
