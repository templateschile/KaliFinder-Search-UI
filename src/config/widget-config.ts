/**
 * Widget Configuration
 * Central configuration management for the search widget
 * Supports environment-based overrides and runtime configuration
 */

export interface WidgetConfig {
  /** Widget unique identifier for multi-instance scenarios */
  instanceId: string;

  /** API Configuration */
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };

  /** Widget behavior */
  behavior: {
    debounceDelay: number;
    minCharsForSearch: number;
    maxResults: number;
    autocompleteSuggestions: number;
    enableVirtualScrolling: boolean;
  };

  /** UI/UX Configuration */
  ui: {
    theme: 'light' | 'dark';
    responsive: boolean;
    mobileBreakpoint: number;
    animationsEnabled: boolean;
    language: string;
    fallbackLanguage: string;
  };

  /** Analytics Configuration */
  analytics: {
    enabled: boolean;
    vendorId?: string;
    apiUrl?: string;
    sampleRate: number; // 0-1, percentage of events to track
  };

  /** Caching Configuration */
  cache: {
    enabled: boolean;
    ttl: {
      search: number; // milliseconds
      autocomplete: number;
      facets: number;
    };
    maxSize: number; // number of entries
  };

  /** Feature Flags */
  features: {
    enableFilters: boolean;
    enableAutocomplete: boolean;
    enableRecommendations: boolean;
    enableCart: boolean;
    enableShareProducts: boolean;
  };

  /** Callbacks and Hooks */
  callbacks: {
    onProductClick?: (productId: string, position: number) => void;
    onSearch?: (query: string, resultCount: number) => void;
    onError?: (error: Error, context: string) => void;
    onFilterChange?: (filters: Record<string, unknown>) => void;
  };
}

/**
 * Default widget configuration
 * These values can be overridden at initialization time
 */
export const DEFAULT_WIDGET_CONFIG: WidgetConfig = {
  instanceId: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,

  api: {
    baseUrl: import.meta.env.VITE_BACKEND_URL || 'https://api.kalifinder.com',
    timeout: 10000, // 10 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },

  behavior: {
    debounceDelay: 300, // milliseconds
    minCharsForSearch: 1, // Allow single character searches
    maxResults: 50,
    autocompleteSuggestions: 8,
    enableVirtualScrolling: true,
  },

  ui: {
    theme: 'light',
    responsive: true,
    mobileBreakpoint: 768, // pixels
    animationsEnabled: true,
    language: 'en',
    fallbackLanguage: 'en',
  },

  analytics: {
    enabled: true,
    sampleRate: 1.0, // Track 100% of events
  },

  cache: {
    enabled: true,
    ttl: {
      search: 5 * 60 * 1000, // 5 minutes
      autocomplete: 10 * 60 * 1000, // 10 minutes
      facets: 30 * 60 * 1000, // 30 minutes
    },
    maxSize: 100,
  },

  features: {
    enableFilters: true,
    enableAutocomplete: true,
    enableRecommendations: true,
    enableCart: false,
    enableShareProducts: false,
  },

  callbacks: {},
};

/**
 * Merge user config with defaults
 * Performs deep merge for nested objects
 */
export function mergeWidgetConfig(
  userConfig: Partial<WidgetConfig>,
  defaults: WidgetConfig = DEFAULT_WIDGET_CONFIG
): WidgetConfig {
  return {
    ...defaults,
    ...userConfig,
    api: { ...defaults.api, ...(userConfig.api || {}) },
    behavior: { ...defaults.behavior, ...(userConfig.behavior || {}) },
    ui: { ...defaults.ui, ...(userConfig.ui || {}) },
    analytics: { ...defaults.analytics, ...(userConfig.analytics || {}) },
    cache: {
      ...defaults.cache,
      ...(userConfig.cache || {}),
      ttl: { ...defaults.cache.ttl, ...(userConfig.cache?.ttl || {}) },
    },
    features: { ...defaults.features, ...(userConfig.features || {}) },
    callbacks: { ...defaults.callbacks, ...(userConfig.callbacks || {}) },
  };
}

/**
 * Validate widget configuration
 * Ensures all required fields are present and valid
 */
export function validateWidgetConfig(config: WidgetConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.instanceId) errors.push('instanceId is required');
  if (!config.api?.baseUrl) errors.push('api.baseUrl is required');
  if (config.api.timeout < 100) errors.push('api.timeout must be at least 100ms');
  if (config.behavior.debounceDelay < 100)
    errors.push('behavior.debounceDelay should be at least 100ms');
  if (config.behavior.minCharsForSearch < 1)
    errors.push('behavior.minCharsForSearch must be at least 1');
  if (config.cache.maxSize < 10) errors.push('cache.maxSize should be at least 10');

  return {
    valid: errors.length === 0,
    errors,
  };
}
