import { Product, IProduct } from '../models/Product';
import { logger } from '../utils/logger';

export interface ProductSearchFilters {
  category?: string;
  subCategory?: string;
  crops?: string[];
  season?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  tags?: string[];
  useCases?: string[];
  query?: string;
}

export interface ProductSearchResult {
  products: IProduct[];
  total: number;
  hasMore: boolean;
}

/**
 * Intelligent product search service for AI recommendations
 */
export class ProductSearchService {
  /**
   * Search products with multiple filters and relevance scoring
   */
  static async searchProducts(
    filters: ProductSearchFilters,
    limit: number = 10,
    offset: number = 0
  ): Promise<ProductSearchResult> {
    const query: Record<string, unknown> = {};

    // Stock filter
    if (filters.inStockOnly !== false) {
      query.inStock = true;
      query['inventory.available'] = { $ne: false };
    }

    // Category filters
    if (filters.category) {
      query.category = new RegExp(filters.category, 'i');
    }

    if (filters.subCategory) {
      query.subCategory = new RegExp(filters.subCategory, 'i');
    }

    // Crop-based filtering
    if (filters.crops && filters.crops.length > 0) {
      query['farmerFriendlyInfo.bestForCrops'] = {
        $in: filters.crops.map((crop) => new RegExp(crop, 'i')),
      };
    }

    // Season filtering
    if (filters.season && filters.season.length > 0) {
      query['aiMetadata.season'] = {
        $in: filters.season.map((s) => new RegExp(s, 'i')),
      };
    }

    // Price range
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) {
        (query.price as Record<string, unknown>).$gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        (query.price as Record<string, unknown>).$lte = filters.maxPrice;
      }
    }

    // Tags filtering (AI metadata)
    if (filters.tags && filters.tags.length > 0) {
      query['aiMetadata.tags'] = {
        $in: filters.tags.map((tag) => new RegExp(tag, 'i')),
      };
    }

    // Use cases filtering
    if (filters.useCases && filters.useCases.length > 0) {
      query['aiMetadata.useCases'] = {
        $in: filters.useCases.map((uc) => new RegExp(uc, 'i')),
      };
    }

    // Text search (name, description)
    if (filters.query) {
      query.$text = { $search: filters.query };
    }

    try {
      // Execute query with sorting and pagination
      const [products, total] = await Promise.all([
        Product.find(query)
          .sort(filters.query ? { score: { $meta: 'textScore' } } : { 'ratings.average': -1, price: 1 })
          .skip(offset)
          .limit(limit)
          .select('-reviews -__v')
          .lean(),
        Product.countDocuments(query),
      ]);

      return {
        products: products as IProduct[],
        total,
        hasMore: total > offset + limit,
      };
    } catch (error) {
      logger.error({ err: error, filters }, 'Product search failed');
      return { products: [], total: 0, hasMore: false };
    }
  }

  /**
   * Get product recommendations based on farmer context and query
   */
  static async getRecommendations(params: {
    crops?: string[];
    season?: string;
    problem?: string;
    category?: string;
    limit?: number;
  }): Promise<IProduct[]> {
    const filters: ProductSearchFilters = {
      inStockOnly: true,
    };

    // Map problem to category/tags
    if (params.problem) {
      const problemLower = params.problem.toLowerCase();

      if (problemLower.includes('disease') || problemLower.includes('pest') || problemLower.includes('insect')) {
        filters.category = 'Pesticide';
        filters.tags = ['disease control', 'pest management'];
      } else if (problemLower.includes('fertilizer') || problemLower.includes('nutrition') || problemLower.includes('growth')) {
        filters.category = 'Fertilizer';
        filters.tags = ['nutrition', 'growth'];
      } else if (problemLower.includes('weed') || problemLower.includes('herbicide')) {
        filters.category = 'Herbicide';
        filters.tags = ['weed control'];
      } else if (problemLower.includes('seed')) {
        filters.category = 'Seed';
      }
    }

    // Override with specific category if provided
    if (params.category) {
      filters.category = params.category;
    }

    // Filter by crops
    if (params.crops && params.crops.length > 0) {
      filters.crops = params.crops;
    }

    // Filter by season
    if (params.season) {
      filters.season = [params.season];
    }

    const result = await this.searchProducts(filters, params.limit || 5);
    return result.products;
  }

  /**
   * Get related/complementary products
   */
  static async getRelatedProducts(productId: string, limit: number = 5): Promise<IProduct[]> {
    try {
      const product = await Product.findById(productId).lean();
      if (!product) return [];

      const filters: ProductSearchFilters = {
        category: product.category,
        inStockOnly: true,
      };

      // Use recommended products if available
      if (product.aiMetadata?.recommendedWith && product.aiMetadata.recommendedWith.length > 0) {
        const related = await Product.find({
          _id: { $ne: productId },
          $or: [
            { _id: { $in: product.aiMetadata.recommendedWith } },
            { name: { $in: product.aiMetadata.recommendedWith } },
          ],
          inStock: true,
        })
          .limit(limit)
          .select('-reviews -__v')
          .lean();

        if (related.length > 0) return related as IProduct[];
      }

      // Fallback to same category
      const result = await this.searchProducts(filters, limit);
      return result.products.filter((p) => p._id.toString() !== productId);
    } catch (error) {
      logger.error({ err: error, productId }, 'Related products fetch failed');
      return [];
    }
  }

  /**
   * Get top-rated products by category
   */
  static async getTopRated(category: string, limit: number = 10): Promise<IProduct[]> {
    try {
      const products = await Product.find({
        category: new RegExp(category, 'i'),
        inStock: true,
        'ratings.count': { $gte: 5 }, // At least 5 reviews
      })
        .sort({ 'ratings.average': -1 })
        .limit(limit)
        .select('-reviews -__v')
        .lean();

      return products as IProduct[];
    } catch (error) {
      logger.error({ err: error, category }, 'Top rated products fetch failed');
      return [];
    }
  }
}
