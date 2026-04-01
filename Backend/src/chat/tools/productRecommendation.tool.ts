import { SchemaType } from '@google/generative-ai';
import { ProductSearchService } from '../../services/productSearch.service';
import { logger } from '../../utils/logger';

export interface ChatToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, { type: string; description: string; items?: { type: string } }>;
    required: string[];
  };
  execute: (input: Record<string, unknown>) => Promise<Record<string, unknown>>;
}

export const productRecommendationTool: ChatToolDefinition = {
  name: 'get_product_recommendations',
  description: `Search and recommend agricultural products (fertilizers, pesticides, seeds, etc.) based on farmer's query, crop, season, or problem. 
  Use this when farmer asks about:
  - "Which fertilizer should I use?"
  - "Product for pest control"
  - "Best seed variety"
  - "What to apply for disease?"
  - Any query related to buying/using agricultural products`,

  parameters: {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        description: 'Product category: Fertilizer, Pesticide, Herbicide, Seed, Equipment, or leave empty for all',
      },
      crops: {
        type: 'array',
        description: 'Crops the farmer is growing (e.g., ["Wheat", "Rice", "Cotton"])',
        items: { type: 'string' },
      },
      problem: {
        type: 'string',
        description: 'Farming problem/need (e.g., "pest control", "disease management", "nutrition", "weed control")',
      },
      season: {
        type: 'string',
        description: 'Current season: Kharif, Rabi, Zaid, or leave empty',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of products to return (default: 5, max: 10)',
      },
    },
    required: [], // All fields optional for flexible searching
  },

  async execute(input: Record<string, unknown>) {
    const category = input.category as string | undefined;
    const crops = input.crops as string[] | undefined;
    const problem = input.problem as string | undefined;
    const season = input.season as string | undefined;
    const limit = Math.min((input.limit as number) || 5, 10);

    try {
      const products = await ProductSearchService.getRecommendations({
        category,
        crops,
        problem,
        season,
        limit,
      });

      if (products.length === 0) {
        return {
          success: true,
          found: false,
          message: 'No products found matching the criteria. Try broadening the search.',
          products: [],
        };
      }

      // Return simplified product data for AI
      const recommendations = products.map((product) => ({
        id: product._id.toString(),
        name: product.name,
        nameHi: product.nameHi || product.name,
        brand: product.brand,
        category: product.category,
        description: (product.description || '').substring(0, 200), // Truncate for token efficiency
        descriptionHi: (product.descriptionHi || '').substring(0, 200),
        price: product.pricing?.price || product.price,
        unit: product.pricing?.unit || product.unit,
        inStock: product.inStock,
        rating: product.ratings?.average || 0,
        reviewCount: product.ratings?.count || 0,
        whyUse: (product.farmerFriendlyInfo?.whyUse || '').substring(0, 150),
        howToUse: (product.farmerFriendlyInfo?.howToUse || '').substring(0, 150),
        bestForCrops: product.farmerFriendlyInfo?.bestForCrops || [],
        resultTime: product.farmerFriendlyInfo?.resultTime,
        seller: product.seller?.name || 'Unknown',
        location: product.seller?.location || '',
      }));

      return {
        success: true,
        found: true,
        count: products.length,
        products: recommendations,
        message: `Found ${products.length} relevant product${products.length > 1 ? 's' : ''} for the farmer.`,
      };
    } catch (error) {
      logger.error({ err: error, input }, 'Product recommendation tool execution failed');

      return {
        success: false,
        found: false,
        error: 'Failed to fetch product recommendations. Please try again.',
        products: [],
      };
    }
  },
};
