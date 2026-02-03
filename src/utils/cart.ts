/**
 * Cart Utilities
 * Simplified cart management with AJAX cart integration
 * Uses ajax-cart.ts for platform-specific implementations
 */

import { toast } from 'sonner';
import type { CartProduct, CartResponse, Product } from '../types';
import { createCartInstance, detectPlatform } from './ajax-cart';
import { logger } from './logger';
import { safeLocalStorage, storageHelpers } from './safe-storage';
import { t } from 'i18next';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Update cart data for purchase tracking and analytics
 */
const updateCartDataForTracking = (product: CartProduct, price: number): void => {
  try {
    const cartData = storageHelpers.getJSONWithDefault<{
      totalValue: number;
      itemCount: number;
      productIds: string[];
    }>(safeLocalStorage, 'kalifind_cart_data', {
      totalValue: 0,
      itemCount: 0,
      productIds: [],
    });

    // Add new item to cart data
    cartData.totalValue += price;
    cartData.itemCount += 1;
    if (!cartData.productIds.includes(product.id)) {
      cartData.productIds.push(product.id);
    }

    // Save updated cart data
    storageHelpers.setJSON(safeLocalStorage, 'kalifind_cart_data', cartData);

    // Also update global state for immediate access
    (window as Window & { kalifindCart?: typeof cartData }).kalifindCart = cartData;

    logger.debug('Cart tracking data updated', cartData);
  } catch (error) {
    logger.warn('Failed to update cart tracking data', error);
  }
};

/**
 * Check if product has multiple variants (sizes/colors)
 */
const hasMultipleVariants = (product: Product): boolean => {
  const sizes = product.sizes || [];
  const colors = product.colors || [];
  return sizes.length > 1 || colors.length > 1;
};

/**
 * Get user-friendly error message
 */
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Failed to add to cart. Please try again.';
};

// ============================================================================
// MAIN ADD TO CART FUNCTION
// ============================================================================

/**
 * Add product to cart with automatic platform detection and toast notifications
 */
export const addToCart = async (product: Product, storeUrl: string): Promise<CartResponse> => {
  try {
    // Ensure storeUrl is provided
    if (!storeUrl) {
      throw new Error('Store URL is required for cart operations');
    }

    // Use product's storeUrl if available, fallback to provided storeUrl
    const effectiveStoreUrl = product.storeUrl || storeUrl;

    // Normalize storeUrl (remove trailing slash, ensure protocol)
    const normalizedStoreUrl = effectiveStoreUrl.trim().replace(/\/$/, '');
    const storeUrlWithProtocol = normalizedStoreUrl.startsWith('http')
      ? normalizedStoreUrl
      : `https://${normalizedStoreUrl}`;

    logger.debug('Cart operation initiated', {
      product: product.title,
      productId: product.id,
      storeUrl: storeUrlWithProtocol,
      productType: product.productType,
      storeType: product.storeType,
    });

    // Check if product is external (always redirect to product page)
    if (product.productType === 'external') {
      if (product.productUrl) {
        toast.info('Opening external product page...');
        window.open(product.productUrl, '_blank');
        return {
          success: true,
          message: 'Redirected to external product page',
        };
      } else {
        throw new Error('External product URL not found');
      }
    }

    // Check if product is variable (redirect to product page for variant selection)
    if (product.productType === 'variable') {
      if (product.productUrl) {
        toast.info('Opening product page for variant selection...');
        window.open(product.productUrl, '_blank');
        return {
          success: true,
          message: 'Redirected to product page for variant selection',
        };
      } else {
        throw new Error('Product URL not found');
      }
    }

    // Check if product has multiple variants (sizes/colors)
    if (hasMultipleVariants(product)) {
      if (product.productUrl) {
        toast.info('Please select size/color on product page...');
        window.open(product.productUrl, '_blank');
        return {
          success: true,
          message: 'Redirected to product page for variant selection',
        };
      } else {
        throw new Error('Product URL not found');
      }
    }

    // Detect platform
    const platform = detectPlatform(product);

    console.log('🛒 Adding to cart via AJAX:', {
      product: product.title,
      productType: product.productType,
      platform,
      storeUrl: storeUrlWithProtocol,
      wooProductId: product.wooProductId,
      shopifyVariantId: product.shopifyVariantId,
    });

    // Create platform-specific cart instance
    const cartInstance = createCartInstance(platform, storeUrlWithProtocol);

    // Show loading toast
    const loadingToast = toast.loading(`Adding ${product.title} to cart...`);

    try {
      // Add to cart using AJAX
      const success = await cartInstance.addToCart(product, 1);

      if (!success) {
        throw new Error('Failed to add to cart');
      }

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(`${product.title} added to cart!`, {
        duration: 3000,
      });

      // Track with UBI analytics
      try {
        const { getUBIClient } = await import('../analytics/ubiClient');
        const ubiClient = getUBIClient();
        if (ubiClient) {
          ubiClient.trackAddToCart(product.id, product.title, parseFloat(product.price) || 0, 1);
        }
      } catch (ubiError) {
        console.warn('UBI tracking failed:', ubiError);
      }

      // Store cart data for purchase tracking
      try {
        const cartProduct: CartProduct = {
          ...product,
          storeUrl: storeUrlWithProtocol,
          storeType: platform,
        };
        updateCartDataForTracking(cartProduct, parseFloat(product.price) || 0);
      } catch (trackingError) {
        console.warn('Failed to update cart tracking data:', trackingError);
      }

      return {
        success: true,
        message: `${product.title} added to cart!`,
      };
    } catch (cartError) {
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      throw cartError;
    }
  } catch (error) {
    console.error('❌ Add to cart error:', error);

    const errorMessage = getErrorMessage(error);

    // Show error toast with optional "View Product" action
    toast.error(`Could not add to cart: ${errorMessage}`, {
      duration: 5000,
      action: product.productUrl
        ? {
            label: t('search.viewProduct'),
            onClick: () => window.open(product.productUrl, '_blank'),
          }
        : undefined,
    });

    throw error;
  }
};

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Handle cart errors with user-friendly messages and fallback actions
 */
export const handleCartError = (error: Error | unknown, product: Product): string => {
  console.error('Cart error:', error);

  const errorMessage = getErrorMessage(error);

  // Show error toast with action button
  toast.error(`Could not add to cart: ${errorMessage}`, {
    duration: 5000,
    action: product.productUrl
      ? {
          label: t('search.viewProduct'),
          onClick: () => window.open(product.productUrl, '_blank'),
        }
      : undefined,
  });

  // Trigger custom event for UI integration
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('kalifind:cart:error', {
        detail: {
          product,
          error: errorMessage,
          fallbackUrl: product.productUrl,
        },
      })
    );
  }

  // Fallback: redirect to product page
  if (product.productUrl) {
    setTimeout(() => {
      window.open(product.productUrl, '_blank');
    }, 1000);
  }

  return errorMessage;
};
