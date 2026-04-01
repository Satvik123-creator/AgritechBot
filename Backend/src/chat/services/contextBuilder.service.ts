import { Types } from 'mongoose';
import { User } from '../../models/User';
import { cache } from '../../services/cache/redisCache';
import { FarmerContextModel } from '../models/FarmerContext.model';

const FARMER_CONTEXT_TTL_SECONDS = 60 * 60;

function getSeasonFromMonth(month: number): 'rabi' | 'kharif' | 'zaid' {
  if ([10, 11, 12, 1, 2, 3].includes(month)) {
    return 'rabi';
  }

  if ([6, 7, 8, 9].includes(month)) {
    return 'kharif';
  }

  return 'zaid';
}

export function detectCurrentSeason(date = new Date()): 'rabi' | 'kharif' | 'zaid' {
  return getSeasonFromMonth(date.getMonth() + 1);
}

function buildContextString(user: {
  name?: string;
  language?: string;
  crops?: string[];
  landSize?: number;
  landUnit?: string;
  location?: {
    district?: string;
    state?: string;
  };
}): string {
  const season = detectCurrentSeason();
  const landSize =
    typeof user.landSize === 'number'
      ? `${user.landSize} ${user.landUnit || 'acres'}`
      : 'Not provided';

  return [
    'FARMER PROFILE (use this to personalize all advice):',
    `Name: ${user.name || 'Farmer'}`,
    `Location: ${user.location?.district || 'Unknown district'}, ${user.location?.state || 'Unknown state'}`,
    `Current Season: ${season}`,
    `Crops Currently Growing: ${(user.crops || []).length ? user.crops!.join(', ') : 'Not provided'}`,
    `Land Size: ${landSize}`,
    `Language Preference: ${user.language || 'Hindi'}`,
    'Platform: Anaaj.ai',
    '',
    'Use this profile to make all advice specific to their location, season, and crops. Do not repeat this profile back to the farmer.',
  ].join('\n');
}

function getContextCacheKey(farmerId: string): string {
  return `chat:context:${farmerId}`;
}

export async function getFarmerContext(farmerId: string | Types.ObjectId): Promise<{
  contextString: string;
  season: string;
  location: string;
  version: number;
}> {
  const farmerIdString = String(farmerId);
  const cacheKey = getContextCacheKey(farmerIdString);
  const cached = await cache.get<{
    contextString: string;
    season: string;
    location: string;
    version: number;
  }>(cacheKey);

  if (cached) {
    return cached;
  }

  const user = await User.findById(farmerId).lean();
  if (!user) {
    throw new Error('Farmer not found');
  }

  const existing = await FarmerContextModel.findOne({ farmerId }).lean();
  const shouldRebuild = !existing || existing.lastBuiltAt < new Date(user.updatedAt);

  const contextString = shouldRebuild ? buildContextString(user) : existing.contextString;
  const season = detectCurrentSeason();
  const location = [user.location?.district, user.location?.state].filter(Boolean).join(', ');
  const version = shouldRebuild ? (existing?.version || 0) + 1 : (existing?.version || 1);

  if (shouldRebuild) {
    await FarmerContextModel.findOneAndUpdate(
      { farmerId },
      {
        $set: {
          contextString,
          lastBuiltAt: new Date(),
          version,
        },
      },
      { upsert: true, new: true }
    );
  }

  const payload = { contextString, season, location, version };
  await cache.set(cacheKey, payload, FARMER_CONTEXT_TTL_SECONDS);
  return payload;
}

export async function invalidateFarmerContextCache(farmerId: string | Types.ObjectId): Promise<void> {
  const farmerIdString = String(farmerId);
  await cache.del(getContextCacheKey(farmerIdString));
  await FarmerContextModel.findOneAndDelete({ farmerId });
}
