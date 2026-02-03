/**
 * Bootstrap
 * Main entry point for widget initialization
 * Orchestrates DOM setup, CSS injection, and search element binding
 */

// Import CSS to ensure it's processed by Vite/Tailwind
// The shadowCssPlugin will capture the emitted CSS and inline it
import '../index.css';
// shadowCssPlugin will inject: var __INLINED_WIDGET_CSS__ = "..."

import { logger } from '../utils/logger';
import { uiDebugger } from '../utils/ui-debug';
import { createStyles } from './utils/css-injection';
import { renderWidget, setupDOM } from './utils/dom-setup';
import { createFallbackTrigger, removeFallbackTrigger } from './utils/fallback-trigger';
import {
  replaceHeaderSearchElements,
  setupHeaderReplacementObserver,
} from './utils/header-replacement';
import { log, setDebugMode } from './utils/logger';
import { bindSearchTriggers, setupSearchObserver } from './utils/search-binding';
import { initializeI18n } from '../i18n/config';
import { getStoreSetupService } from '../services/store-setup.service';

export type InitOptions = {
  storeUrl: string;
  debug?: boolean;
  language?: string;
};

export type Controller = {
  open: (query?: string) => void;
  destroy: () => void;
};

/**
 * Open widget with optional search query
 */
function openWidget(query?: string): void {
  const evt = new CustomEvent('kalifinder:open', { detail: { query: query ?? '' } });
  window.dispatchEvent(evt);
}

/**
 * Initialize KaliFinder Search Widget
 * Creates shadow DOM, injects styles, binds to search elements
 */
export function init(options: InitOptions): Controller {
  // Configure debug mode
  setDebugMode(options.debug ?? false);
  log('Initializing widget with options:', options);

  // Fetch store setup data and initialize i18n with store language
  (async () => {
    try {
      const storeSetupService = getStoreSetupService(options.storeUrl);

      // Try to fetch store setup data
      let storeLanguage = options.language; // Start with user-provided language

      try {
        const storeSetupData = await storeSetupService.fetchStoreSetupData();

        // Use store language if no explicit language provided and store has language configured
        if (!options.language && storeSetupData.language) {
          storeLanguage = storeSetupData.language;
          log('Using store language from API:', storeLanguage);
        } else if (options.language) {
          log('Using explicitly provided language:', options.language);
        }

        // Log store configuration for debugging
        logger.debug('Store setup data loaded:', {
          language: storeSetupData.language,
          currency: storeSetupData.currency,
          storeName: storeSetupData.storeName,
        });
      } catch (storeSetupError) {
        logger.warn('Failed to fetch store setup data, using fallback language', storeSetupError);
        storeLanguage = storeLanguage || 'en'; // Fallback to English if all else fails
      }

      // Initialize i18n with determined language
      initializeI18n(storeLanguage);
    } catch (error) {
      logger.error('Failed to initialize store setup, using default language:', error);
      initializeI18n(options.language || 'en');
    }
  })();

  logger.info('KaliFinder Search Widget - Initializing');
  logger.debug('Platform detected', { platform: uiDebugger.getPlatform() });
  logger.debug('Debug mode', { enabled: options.debug });

  // Setup DOM structure
  const { container, shadowRoot, portalContainer, root } = setupDOM();

  // Log initialization with UI scaling debug info
  uiDebugger.logInitialization(shadowRoot);
  uiDebugger.logResponsiveBreakpoint();

  // Track fallback trigger
  let fallbackTrigger: HTMLButtonElement | null = null;
  let headerReplacementObserver: MutationObserver | null = null;

  // Inject styles then render React (CSS is inlined by shadowCssPlugin during build)
  createStyles(shadowRoot)
    .then(() => {
      // Styles injected - render widget
      logger.info('Styles injected successfully');
      renderWidget(root, portalContainer, options.storeUrl);

      // Enable continuous monitoring in debug mode
      if (options.debug) {
        uiDebugger.enableContinuousMonitoring();
      }
    })
    .catch((err) => {
      logger.error('Failed to inject styles, rendering anyway', err);
      // Render anyway - might have partial styling
      renderWidget(root, portalContainer, options.storeUrl);
    });

  // Replace search elements in headers with our icon
  replaceHeaderSearchElements(openWidget);

  // Setup observer for dynamic header search elements
  headerReplacementObserver = setupHeaderReplacementObserver(openWidget);

  // Bind to native search elements (for non-header elements)
  const bound = bindSearchTriggers(openWidget);

  // Handle newly found search elements
  const onSearchElementsBound = () => {
    if (fallbackTrigger) {
      removeFallbackTrigger(fallbackTrigger);
      fallbackTrigger = null;
      log('Native search elements found, removed fallback trigger');
    }
  };

  // Setup observer for dynamic search elements
  const observer = setupSearchObserver(openWidget, onSearchElementsBound);

  // Create fallback trigger if no native search found
  if (!bound) {
    fallbackTrigger = createFallbackTrigger(openWidget);
  } else {
    log('Successfully bound to native search elements');
  }

  return {
    open: openWidget,
    destroy: () => {
      // Cleanup
      observer.disconnect();
      log('MutationObserver disconnected');

      if (headerReplacementObserver) {
        headerReplacementObserver.disconnect();
        log('Header replacement observer disconnected');
      }

      try {
        root.unmount();
      } catch {
        // Root may already be unmounted
      }

      container.remove();
      removeFallbackTrigger(fallbackTrigger);
      fallbackTrigger = null;
    },
  };
}

// Global types
declare global {
  interface Window {
    Kalifinder?: { init: (opts: InitOptions) => Controller };
    KalifinderController?: Controller;
    KALIFIND_VENDOR_ID?: string;
    KALIFIND_STORE_ID?: string;
    KALIFIND_STORE_TYPE?: string;
    KALIFIND_STORE_URL?: string;
  }
}

// UMD global and auto-init from script query
(() => {
  try {
    (window as unknown as Window).Kalifinder = { init };

    // Auto-initialize from script query parameters
    const scripts = document.getElementsByTagName('script');
    let widgetScript: HTMLScriptElement | null = null;

    // Find the script that loads kalifind-search.js (not just the last script)
    for (let i = 0; i < scripts.length; i++) {
      const script = scripts[i];
      if (script && script.src && script.src.includes('kalifind-search')) {
        widgetScript = script;
        break;
      }
    }

    if (widgetScript && widgetScript.src) {
      const url = new URL(widgetScript.src);
      const storeUrl = url.searchParams.get('storeUrl');
      const vendorId = url.searchParams.get('vendorId');
      const storeId = url.searchParams.get('storeId');
      const storeType = url.searchParams.get('storeType');
      const debug = url.searchParams.get('debug') === 'true';

      // Set global variables for analytics and API client
      if (vendorId) {
        (window as Window).KALIFIND_VENDOR_ID = vendorId;
        console.log('[Kalifinder] Vendor ID set:', vendorId);
      }
      if (storeId) {
        (window as Window).KALIFIND_STORE_ID = storeId;
        console.log('[Kalifinder] Store ID set:', storeId);
      }
      if (storeType) {
        (window as Window).KALIFIND_STORE_TYPE = storeType;
        console.log('[Kalifinder] Store Type set:', storeType);
      }
      if (storeUrl) {
        (window as Window).KALIFIND_STORE_URL = storeUrl;
        console.log('[Kalifinder] Store URL set:', storeUrl);

        const controller = init({ storeUrl, debug });
        (window as unknown as Window).KalifinderController = controller;
      } else {
        console.warn('[Kalifinder] No storeUrl found in script parameters');
      }
    }
  } catch (error) {
    console.error('[Kalifinder] Failed to initialize:', error);
  }
})();
