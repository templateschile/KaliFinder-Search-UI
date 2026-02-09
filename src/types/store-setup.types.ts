/**
 * Store Setup Data Types
 * Response structure for wp-content/uploads/kalifinder/store-setup-data.json
 */

export interface StoreSetupData {
  /** Store language code (e.g., "en", "es", "fr") */
  language: string;

  /** Store currency code (e.g., "USD", "EUR", "GBP") */
  currency?: string;

  /** Store currency symbol (e.g., "$", "€", "£") */
  currency_symbol?: string;

  /** Store currency thousand separator (e.g., ".", ",") */
  currency_thousand_separator?: string;

  /** Store name for display */
  store_name?: string;

  /** Store locale for formatting (e.g., "en-US", "es-ES") */
  locale?: string;

  /** Store timezone for date/time formatting */
  timezone?: string;

  /** Additional store-specific configuration */
  [key: string]: any;
}
