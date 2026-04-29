import { createClient } from 'redis';
import { logger } from './logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = createClient({
  url: redisUrl,
});

redisClient.on('error', error => {
  const message = error instanceof Error ? error.message : String(error);
  logger.error(`Redis error: ${message}`);
});

export async function connectRedis(): Promise<void> {
  if (redisClient.isOpen) return;

  await redisClient.connect();
  logger.info(`Redis conectado correctamente (${redisUrl})`);
}

export async function disconnectRedis(): Promise<void> {
  if (!redisClient.isOpen) return;

  await redisClient.quit();
  logger.info('Redis desconectado correctamente');
}

export async function safeRedisOperation<T>(
  operation: () => Promise<T>,
  fallback: T,
  context: string,
): Promise<T> {
  try {
    if (!redisClient.isOpen) {
      logger.warn(`Redis no conectado: ${context}`);
      return fallback;
    }

    return await operation();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn(`Operación Redis omitida (${context}): ${message}`);
    return fallback;
  }
}
