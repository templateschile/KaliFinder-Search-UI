/**
 * ProductQuickView Component
 * Modal for quick product preview without leaving search
 */

import { ShoppingCart, X } from '@/components/icons';
import type { Product } from '@/types';
import { parsePriceToNumber } from '@/utils/price';
import { useEffect } from 'react';
import { t } from 'i18next';

interface ProductQuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onViewFullProduct: (product: Product) => void;
  isAddingToCart?: boolean;
  formatPrice?: (value?: string | null) => string;
  calculateDiscountPercentage?: (regularPrice: string, salePrice: string) => number | null;
}

export const ProductQuickView: React.FC<ProductQuickViewProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onViewFullProduct,
  isAddingToCart = false,
  formatPrice,
  calculateDiscountPercentage,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const regularNumeric = parsePriceToNumber(product.regularPrice ?? product.price);
  const saleNumeric = parsePriceToNumber(product.salePrice);
  const hasDiscount =
    saleNumeric !== undefined && regularNumeric !== undefined && saleNumeric < regularNumeric;

  const discountPercentage =
    hasDiscount && calculateDiscountPercentage && product.regularPrice && product.salePrice
      ? calculateDiscountPercentage(product.regularPrice, product.salePrice)
      : null;

  const formattedSalePrice = formatPrice?.(product.salePrice) || product.salePrice || '';
  const formattedRegularPrice = formatPrice?.(product.regularPrice) || product.regularPrice || '';
  const formattedBasePrice =
    formatPrice?.(product.price) ||
    product.price ||
    formattedSalePrice ||
    formattedRegularPrice ||
    '';

  const primaryPrice =
    (hasDiscount && formattedSalePrice ? formattedSalePrice : formattedBasePrice) ||
    formattedSalePrice ||
    formattedRegularPrice ||
    '—';

  const secondaryPrice =
    hasDiscount && formattedRegularPrice && formattedRegularPrice !== primaryPrice
      ? formattedRegularPrice
      : '';

  const isOutOfStock = product.stockStatus?.toLowerCase() === 'outofstock';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-view-title"
      >
        <div
          className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex h-10 min-h-[44px] w-10 min-w-[44px] cursor-pointer touch-manipulation items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-lg transition-all hover:bg-white hover:text-gray-900 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95"
            aria-label="Close quick view"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Content */}
          <div className="grid max-h-[90vh] overflow-y-auto md:grid-cols-2">
            {/* Left: Image */}
            <div className="bg-muted relative aspect-square md:aspect-auto">
              <img
                src={product.imageUrl || product.image}
                alt={product.title}
                className="h-full w-full object-cover"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.featured && (
                  <div className="rounded-full bg-purple-600/95 px-3 py-1 text-xs font-bold text-white uppercase shadow-md backdrop-blur-sm sm:text-sm">
                    ⭐ {t('product.featured', 'Featured')}
                  </div>
                )}
                {hasDiscount && discountPercentage && (
                  <div className="rounded-full bg-red-600/95 px-3 py-1 text-xs font-bold text-white uppercase shadow-md backdrop-blur-sm sm:text-sm">
                    -{discountPercentage}% {t('price.discount', 'OFF')}
                  </div>
                )}
                {isOutOfStock && (
                  <div className="rounded-full bg-gray-800/95 px-3 py-1 text-xs font-bold text-white uppercase shadow-md backdrop-blur-sm sm:text-sm">
                    {t('stock.outOfStock', 'Out of Stock')}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Details */}
            <div className="flex flex-col p-6 md:p-8">
              {/* Title */}
              <h2
                id="quick-view-title"
                className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl"
              >
                {product.title}
              </h2>

              {/* Price */}
              <div className="mb-6 flex items-baseline gap-3">
                <span className="text-3xl font-bold text-purple-600 md:text-4xl">
                  {primaryPrice}
                </span>
                {secondaryPrice && (
                  <span className="text-lg text-gray-400 line-through">{secondaryPrice}</span>
                )}
              </div>

              {/* Categories */}
              {product.categories && product.categories.length > 0 && (
                <div className="mb-4">
                  <h3 className="mb-2 text-sm font-semibold tracking-wide text-gray-500 uppercase">
                    Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.categories.slice(0, 3).map((category, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Brands */}
              {product.brands && product.brands.length > 0 && (
                <div className="mb-4">
                  <h3 className="mb-2 text-sm font-semibold tracking-wide text-gray-500 uppercase">
                    Brand
                  </h3>
                  <p className="text-gray-900">{product.brands[0]}</p>
                </div>
              )}

              {/* Stock Status */}
              <div className="mb-6">
                <h3 className="mb-2 text-sm font-semibold tracking-wide text-gray-500 uppercase">
                  Availability
                </h3>
                <p
                  className={`text-sm font-medium ${
                    isOutOfStock ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {isOutOfStock ? '❌ Out of Stock' : '✅ In Stock'}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-auto flex flex-col gap-3 pt-6">
                <button
                  onClick={() => onAddToCart(product)}
                  disabled={isAddingToCart || isOutOfStock}
                  className="flex min-h-[48px] cursor-pointer touch-manipulation items-center justify-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all hover:bg-purple-700 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`Add ${product.title} to cart`}
                >
                  {isAddingToCart ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                      Add to Cart
                    </>
                  )}
                </button>

                <button
                  onClick={() => onViewFullProduct(product)}
                  className="min-h-[48px] cursor-pointer touch-manipulation rounded-lg border-2 border-purple-600 bg-white px-6 py-3 text-base font-semibold text-purple-600 transition-all hover:bg-purple-50 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95"
                  aria-label={`View full details for ${product.title}`}
                >
                  View Full Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductQuickView;
