import type { Asset } from '../models/asset';
import { redisClient, safeRedisOperation } from '../config/redis';
import { logger } from '../config/logger';

const DEFAULT_ASSET_CACHE_TTL_SECONDS = 60;

function getAssetCacheKey(id: string): string {
  return `asset:${id}`;
}

function getAssetCacheTtlSeconds(): number {
  const configured = Number(process.env.ASSET_CACHE_TTL_SECONDS);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : DEFAULT_ASSET_CACHE_TTL_SECONDS;
}

async function get(id: string): Promise<Asset | null> {
  const cached = await safeRedisOperation(
    () => redisClient.get(getAssetCacheKey(id)),
    null,
    `leer caché de activo ${id}`,
  );

  if (!cached) return null;

  try {
    return JSON.parse(cached) as Asset;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn(`Caché inválida para activo ${id}: ${message}`);
    await invalidate(id);
    return null;
  }
}

async function set(asset: Asset): Promise<void> {
  await safeRedisOperation(
    () => redisClient.set(
      getAssetCacheKey(asset.id),
      JSON.stringify(asset),
      { EX: getAssetCacheTtlSeconds() },
    ),
    'OK',
    `guardar caché de activo ${asset.id}`,
  );
}

async function invalidate(id: string): Promise<void> {
  await safeRedisOperation(
    () => redisClient.del(getAssetCacheKey(id)),
    0,
    `invalidar caché de activo ${id}`,
  );
}

export const assetCacheService = {
  get,
  set,
  invalidate,
};
