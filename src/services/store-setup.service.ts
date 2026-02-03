import type { StoreSetupData } from '../types/store-setup.types';
import { logger } from '../utils/logger';

/**
 * Store Setup Service
 * Fetches store configuration data from the same site where widget is running
 * Used to determine store-specific settings like language and currency
 */
export class StoreSetupService {
  private storeUrl: string;
  private cacheKey = 'kalifinder-store-setup';
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes cache

  constructor(storeUrl: string) {
    this.storeUrl = this.normalizeStoreUrl(storeUrl);
  }

  /**
   * Normalize store URL to extract the base domain
   */
  private normalizeStoreUrl(url: string): string {
    try {
      // Remove trailing slash and ensure proper protocol
      const cleanUrl = url.replace(/\/$/, '');

      // If no protocol, add https
      if (!cleanUrl.startsWith('http')) {
        return `https://${cleanUrl}`;
      }

      return cleanUrl;
    } catch (error) {
      logger.warn('Failed to normalize store URL:', error);
      return url;
    }
  }

  /**
   * Get the base domain for constructing the JSON file URL
   */
  private getBaseUrl(): string {
    try {
      const url = new URL(this.storeUrl);
      return `${url.protocol}//${url.hostname}`;
    } catch (error) {
      logger.warn('Failed to parse store URL for base URL:', error);
      return this.storeUrl;
    }
  }

  /**
   * Check if cached data is still valid
   */
  private isCacheValid(): boolean {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (!cached) return false;

      const { timestamp } = JSON.parse(cached);
      return Date.now() - timestamp < this.cacheTimeout;
    } catch {
      return false;
    }
  }

  /**
   * Get cached store setup data
   */
  private getCachedData(): StoreSetupData | null {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (!cached) return null;

      const { timestamp, data } = JSON.parse(cached);
      return Date.now() - timestamp < this.cacheTimeout ? data : null;
    } catch (error) {
      logger.warn('Failed to parse cached store setup data:', error);
      return null;
    }
  }

  /**
   * Cache store setup data
   */
  private setCachedData(data: StoreSetupData): void {
    try {
      localStorage.setItem(
        this.cacheKey,
        JSON.stringify({
          timestamp: Date.now(),
          data,
        })
      );
    } catch (error) {
      logger.warn('Failed to cache store setup data:', error);
    }
  }

  /**
   * Fetch store setup data from wp-content/uploads/kalifinder/store-setup-data.json
   */
  async fetchStoreSetupData(): Promise<StoreSetupData> {
    // Return cached data if valid
    if (this.isCacheValid()) {
      const cachedData = this.getCachedData();
      if (cachedData) {
        logger.debug('Using cached store setup data');
        return cachedData;
      }
    }

    try {
      const baseUrl = this.getBaseUrl();
      const setupUrl = `${baseUrl}/wp-json/kalifinder/v1/store-setup`;

      logger.info(`Fetching store setup data from: ${setupUrl}`);

      const response = await fetch(setupUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Cache-Control': 'no-cache',
        },
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: StoreSetupData = await response.json();

      // Validate required fields
      if (!data.language) {
        throw new Error('Language field is required in store setup data');
      }

      // Cache the valid data
      this.setCachedData(data);

      logger.info('Successfully fetched and cached store setup data:', data);
      return data;
    } catch (error) {
      logger.error('Failed to fetch store setup data:', error);

      // Return fallback data for graceful degradation
      return {
        language: 'en', // Default fallback language
        currency: undefined,
        storeName: undefined,
        locale: undefined,
        timezone: undefined,
      };
    }
  }

  /**
   * Get just the language from store setup data
   */
  async getStoreLanguage(): Promise<string> {
    try {
      const setupData = await this.fetchStoreSetupData();
      const lang = setupData.language;
      if (!lang) return 'en';

      // If language is in form "en_US", return the part before "_"
      const parts = lang.split('_');
      return parts[0] || 'en';
    } catch (error) {
      logger.error('Failed to get store language:', error);
      return 'en'; // Fallback to English
    }
  }

  /**
   * Get currency from store setup data
   */
  async getStoreCurrency(): Promise<string | undefined> {
    try {
      const setupData = await this.fetchStoreSetupData();
      return setupData.currency;
    } catch (error) {
      logger.error('Failed to get store currency:', error);
      return undefined;
    }
  }
}

/**
 * Create a singleton instance for the current store
 */
let storeSetupServiceInstance: StoreSetupService | null = null;

export function getStoreSetupService(storeUrl: string): StoreSetupService {
  if (!storeSetupServiceInstance || storeSetupServiceInstance['storeUrl'] !== storeUrl) {
    storeSetupServiceInstance = new StoreSetupService(storeUrl);
  }
  return storeSetupServiceInstance;
}
