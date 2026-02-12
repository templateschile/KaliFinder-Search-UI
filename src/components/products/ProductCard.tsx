import { ShoppingCart } from '@/components/icons';
import {
  calculateDiscountPercentage as calcDiscount,
  getPrimaryPrice,
  getSecondaryPrice,
  hasValidDiscount,
  isValidPrice,
} from '@/utils/price';
import { memo, useCallback, useMemo, useState } from 'react';
import type { Product } from '../../types';
import { useTranslation } from 'react-i18next';

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  calculateDiscountPercentage?: (regularPrice: string, salePrice: string) => number | null;
  formatPrice: (value?: string | null) => string;
}

const ProductCardComponent: React.FC<ProductCardProps> = ({
  product,
  onProductClick,
  onAddToCart,
  calculateDiscountPercentage,
  formatPrice,
}) => {
  const { t } = useTranslation();
  // Local cart-loading state: only THIS card re-renders when its button is clicked
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  // Memoize expensive calculations
  const hasDiscount = useMemo(
    () => hasValidDiscount(product.regularPrice ?? product.price, product.salePrice),
    [product.regularPrice, product.price, product.salePrice]
  );

  const discountPercentage = useMemo(() => {
    if (!hasDiscount || !product.regularPrice || !product.salePrice) return null;

    return calculateDiscountPercentage
      ? calculateDiscountPercentage(product.regularPrice, product.salePrice)
      : calcDiscount(product.regularPrice, product.salePrice);
  }, [hasDiscount, product.regularPrice, product.salePrice, calculateDiscountPercentage]);

  const prices = useMemo(() => {
    const primary = getPrimaryPrice(product);
    const secondary = getSecondaryPrice(product);
    const hasPrimaryPrice = isValidPrice(primary);

    return {
      primary: hasPrimaryPrice ? formatPrice(primary) || primary : 'No Price',
      secondary: secondary ? formatPrice(secondary) || secondary : null,
      isValid: hasPrimaryPrice,
    };
  }, [product, formatPrice]);

  // Stock status
  const stockStatus = useMemo(() => {
    const status = product.stockStatus?.toLowerCase();
    return {
      isOutOfStock: status === 'outofstock',
      isOnBackorder: status === 'onbackorder',
    };
  }, [product.stockStatus]);

  // Check if product requires variant selection
  // WordPress: variable products need variant selection
  // Shopify: bundle products cannot be added directly
  const requiresSelection = useMemo(() => {
    const type = product.productType?.toLowerCase();
    return (
      type === 'variable' || // WordPress variable products
      type === 'bundle' || // Shopify bundle products
      type === 'grouped' || // WordPress grouped products
      type === 'external' // External/affiliate products
    );
  }, [product.productType]);

  // Memoize event handlers to prevent recreating on every render
  const handleProductClick = useCallback(() => {
    onProductClick(product);
  }, [onProductClick, product]);

  const handleAddToCart = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click
      setIsAddingToCart(true);
      try {
        await onAddToCart(product);
      } finally {
        setIsAddingToCart(false);
      }
    },
    [onAddToCart, product]
  );

  return (
    <div
      className="group flex w-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:border-purple-300 hover:shadow-xl"
      role="article"
      aria-label={`Product: ${product.title}`}
    >
      {/* Product Image */}
      <div
        className="relative aspect-square cursor-pointer touch-manipulation overflow-hidden bg-[oklch(82.7%_0.119_306.383)]"
        onClick={handleProductClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleProductClick();
          }
        }}
        aria-label={`View ${product.title} details`}
      >
        <img
          src={product.imageUrl || product.image}
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          decoding="async"
        />

        {/* Badges Container - Top with flex-wrap */}
        <div className="absolute top-2 right-2 left-2 flex flex-wrap gap-1" aria-live="polite">
          {/* Featured Badge */}
          {product.featured && (
            <div className="rounded-full border border-white/30 bg-[rgba(124,58,237,0.95)] px-2 py-0.5 text-xs font-bold tracking-wide text-white uppercase shadow-md backdrop-blur-sm sm:text-sm">
              ⭐ t('product.featured', 'Featured')
            </div>
          )}

          {/* Discount Badge */}
          {hasDiscount && discountPercentage && discountPercentage > 0 && (
            <div
              className="rounded-full border border-white/30 bg-[rgba(124,58,237,0.95)] px-2 py-0.5 text-xs font-bold tracking-wide text-white uppercase shadow-md backdrop-blur-sm sm:text-sm"
              aria-label={`${Math.abs(discountPercentage)}% discount`}
            >
              {Math.abs(discountPercentage)}% {t('price.discount', 'OFF')}
            </div>
          )}

          {/* Out of Stock Badge */}
          {stockStatus.isOutOfStock && (
            <div
              className="rounded-full border border-white/30 bg-[rgba(220,38,38,0.95)] px-2 py-0.5 text-xs font-bold tracking-wide text-white uppercase shadow-md backdrop-blur-sm sm:text-sm"
              aria-label="Out of stock"
            >
              {t('stock.outOfStock', 'Out of Stock')}
            </div>
          )}

          {/* On Backorder Badge */}
          {stockStatus.isOnBackorder && (
            <div
              className="rounded-full border border-white/30 bg-[rgba(251,146,60,0.95)] px-2 py-0.5 text-xs font-bold tracking-wide text-white uppercase shadow-md backdrop-blur-sm sm:text-sm"
              aria-label="On backorder"
            >
              {t('stock.onBackorder', 'On Backorder')}
            </div>
          )}
        </div>

        {/* View Product Overlay - Shown on hover */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 group-hover:opacity-100">
          <span className="text-black-600 rounded-lg bg-white px-4 py-2 text-sm font-semibold shadow-lg transition-all duration-200 hover:bg-purple-600 hover:text-white active:scale-95 sm:px-6 sm:py-2.5 sm:text-base">
            {t('search.viewProduct', 'View Product')}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:gap-2">
        {/* Product Title - Now a clickable link */}
        <button
          onClick={handleProductClick}
          className="line-clamp-2 min-h-[2.5em] w-full cursor-pointer touch-manipulation p-0 text-left text-sm leading-tight font-semibold text-gray-900 transition-colors duration-200 hover:text-purple-600 focus:underline focus:outline-none active:text-purple-700 sm:min-h-[2.75em] sm:text-base sm:leading-snug"
          aria-label={`View ${product.title}`}
        >
          {product.title}
        </button>

        {/* Price and Add to Cart */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Price */}
          <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-1">
            {hasDiscount && prices.primary ? (
              <>
                {prices.secondary && (
                  <span
                    className="text-sm font-bold text-gray-400 line-through sm:text-base"
                    aria-label={`Original price ${prices.secondary}`}
                  >
                    {prices.secondary}
                  </span>
                )}
                <span
                  className="text-sm font-bold text-purple-600 sm:text-base"
                  aria-label={`Sale price ${prices.primary}`}
                >
                  {prices.primary}
                </span>
              </>
            ) : (
              <span
                className="text-sm font-bold text-gray-900 sm:text-base"
                aria-label={`Price ${prices.primary}`}
              >
                {prices.primary}
              </span>
            )}
          </div>

          {/* Add to Cart Button - Industry Standard */}
          <button
            onClick={handleAddToCart}
            disabled={
              isAddingToCart || stockStatus.isOutOfStock || !prices.isValid || requiresSelection
            }
            className="group/cart relative z-10 flex h-10 min-h-[44px] w-10 min-w-[44px] shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-lg bg-purple-600 p-2 text-white shadow-md transition-all duration-200 hover:bg-purple-700 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:opacity-60 disabled:shadow-none sm:h-11 sm:w-11"
            aria-label={`Add ${product.title} to cart`}
            title={
              isAddingToCart
                ? 'Adding to cart...'
                : stockStatus.isOutOfStock
                  ? 'Out of stock'
                  : !prices.isValid
                    ? 'No price available'
                    : requiresSelection
                      ? 'Select options to purchase'
                      : `Add ${product.title} to cart`
            }
          >
            {isAddingToCart ? (
              <div
                className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
                aria-label="Adding to cart"
              />
            ) : (
              <ShoppingCart
                className="h-5 w-5 transition-transform duration-200 group-hover/cart:scale-110"
                aria-hidden="true"
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Export memoized component to prevent unnecessary re-renders
export const ProductCard = memo(ProductCardComponent, (prevProps, nextProps) => {
  // Custom comparison function for better memoization
  // Note: isAddingToCart is local state, so it's not compared here
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.product.price === nextProps.product.price &&
    prevProps.product.salePrice === nextProps.product.salePrice &&
    prevProps.product.stockStatus === nextProps.product.stockStatus &&
    prevProps.onAddToCart === nextProps.onAddToCart &&
    prevProps.onProductClick === nextProps.onProductClick &&
    prevProps.formatPrice === nextProps.formatPrice
  );
});

ProductCard.displayName = 'ProductCard';
