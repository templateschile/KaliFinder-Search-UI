import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '../types';
import { ProductCard } from './products/ProductCard';
import { useTranslation } from 'react-i18next';

interface RecommendationsProps {
  recommendations: Product[];
  handleProductClick: (product: Product) => void;
  calculateDiscountPercentage: (regularPrice: string, salePrice: string) => number | null;
  handleAddToCart: (product: Product) => void;
  formatPrice: (value?: string | null) => string;
}

const Recommendations: React.FC<RecommendationsProps> = ({
  recommendations,
  handleProductClick,
  calculateDiscountPercentage,
  handleAddToCart,
  formatPrice,
}) => {
  const { t } = useTranslation();

  if (recommendations.length === 0) {
    return (
      <div className="mb-12">
        <div className="mb-6 flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(4)].map((_, idx) => (
            <div
              key={idx}
              className="flex w-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white"
            >
              <Skeleton className="aspect-square w-full" />
              <div className="p-3 sm:p-4">
                <Skeleton className="mb-2 h-5 w-full" />
                <Skeleton className="mb-4 h-4 w-3/4" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-purple-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.364 1.118l1.518 4.674c.3.921-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.977 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        </span>
        <h3 className="text-xl font-bold text-gray-900">{t('search.recommendedForYou')}</h3>
      </div>
      <div className="grid w-full grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
        {recommendations.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onProductClick={handleProductClick}
            onAddToCart={handleAddToCart}
            calculateDiscountPercentage={calculateDiscountPercentage}
            formatPrice={formatPrice}
          />
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
