/**
 * Product card interface for structured product recommendations
 * Used in both backend tools and mobile UI
 */

export type ProductCategory = 'Fertilizer' | 'Pesticide' | 'Herbicide' | 'Seed' | 'Equipment';
export type ProductActionLabel = 'ADD_TO_CART' | 'CHECK_AVAILABILITY' | 'LEARN_MORE';

export interface ProductCardData {
  // Essential product info
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;

  // UI elements
  imageUrl?: string;
  icon?: string;

  // Pricing & ratings
  price: number;
  unit: string; // kg, liter, piece, etc.
  rating: number; // 0-5
  ratingCount?: number;

  // Description & context
  description: string;
  whyUse?: string;
  bestForCrops?: string[];
  resultTime?: string; // e.g., "7-10 days"

  // Call to action
  buyLink?: string;
  actionLabel?: ProductActionLabel;

  // Metadata
  inStock: boolean;
  seller?: {
    name: string;
    verified: boolean;
  };
}

/**
 * Raw product data from MongoDB before transformation
 */
export interface RawProductData {
  _id: string;
  name: string;
  brand: string;
  category: string;
  subCategory?: string;
  description: string;
  price: number;
  unit: string;
  rating?: number;
  ratingCount?: number;
  imageUrls?: string[];
  stockStatus?: 'In Stock' | 'Out of Stock' | 'Limited';
  crops?: string[];
  season?: string[];
  useCase?: string[];
  seller?: {
    name: string;
    verified?: boolean;
  };
  farmerFriendlyInfo?: {
    whyUse: string;
    howToUse: string;
    bestForCrops: string[];
    resultTime: string;
  };
}
