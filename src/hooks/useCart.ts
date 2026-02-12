import { useCallback, useState } from 'react';
import type { Product } from '../types';
import { addToCart as addToCartUtil, handleCartError } from '../utils/cart';
import { logger } from '../utils/logger';
import { safeLocalStorage, storageHelpers } from '../utils/safe-storage';

interface UseCartReturn {
  cartMessage: string | null;
  addToCart: (product: Product, storeUrl?: string) => Promise<void>;
}

export function useCart(): UseCartReturn {
  const [cartMessage, setCartMessage] = useState<string | null>(null);

  const addToCart = useCallback(async (product: Product, storeUrl?: string) => {
    setCartMessage(`Adding ${product.title} to cart...`);

    try {
      const success = await addToCartUtil(product, storeUrl || '');

      if (success) {
        setCartMessage(`✓ ${product.title} added to cart!`);

        // Track potential checkout initiation when cart has multiple items
        trackCheckoutInitiation();

        // On success: reload the page
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        throw new Error('Failed to add to cart');
      }
    } catch (error) {
      logger.error('Add to cart error', error);
      const errorMessage = handleCartError(error, product);
      setCartMessage(`✗ ${errorMessage}`);

      // On failure: navigate to product page in same tab
      if (product.productUrl) {
        setTimeout(() => {
          window.location.href = product.productUrl!;
        }, 1000);
      } else {
        setTimeout(() => setCartMessage(null), 5000);
      }
    }
  }, []);

  return {
    cartMessage,
    addToCart,
  };
}

/**
 * Track checkout initiation when cart has sufficient items
 */
const trackCheckoutInitiation = (): void => {
  try {
    const cartData = storageHelpers.getJSON<{
      itemCount: number;
      totalValue: number;
      productIds: string[];
    }>(safeLocalStorage, 'kalifind_cart_data');

    if (cartData) {
      // Track checkout initiation when user has 2+ items or high-value cart
      if (cartData.itemCount >= 2 || cartData.totalValue >= 50) {
        logger.debug('Checkout initiation triggered', {
          itemCount: cartData.itemCount,
          totalValue: cartData.totalValue,
        });

        // Import and use UBI client
        import('../analytics/ubiClient')
          .then(({ getUBIClient }) => {
            const ubiClient = getUBIClient();
            if (ubiClient) {
              ubiClient.trackCheckoutInitiated(
                cartData.totalValue,
                cartData.itemCount,
                cartData.productIds
              );
            }
          })
          .catch((error) => {
            logger.warn('Failed to track checkout initiation', error);
          });
      }
    }
  } catch (error) {
    logger.warn('Failed to track checkout initiation', error);
  }
};
