import { redisClient, safeRedisOperation } from '../config/redis';
import type { UpdatePreferencesInput } from '../schemas/preference.schema';

export interface UserPreferences {
  displayCurrency?: string;
  alertLimit?: number;
}

function getPreferenceKey(userId: string): string {
  return `user:${userId}:preferences`;
}

function serializePreferences(preferences: UpdatePreferencesInput): Record<string, string> {
  const serialized: Record<string, string> = {};

  if (preferences.displayCurrency !== undefined) {
    serialized.displayCurrency = preferences.displayCurrency;
  }
  if (preferences.alertLimit !== undefined) {
    serialized.alertLimit = String(preferences.alertLimit);
  }

  return serialized;
}

function deserializePreferences(values: Record<string, string>): UserPreferences {
  const preferences: UserPreferences = {};

  if (values.displayCurrency) {
    preferences.displayCurrency = values.displayCurrency;
  }
  if (values.alertLimit) {
    preferences.alertLimit = Number(values.alertLimit);
  }

  return preferences;
}

async function get(userId: string): Promise<UserPreferences> {
  const values = await safeRedisOperation(
    () => redisClient.hGetAll(getPreferenceKey(userId)),
    {},
    `leer preferencias de usuario ${userId}`,
  );

  return deserializePreferences(values);
}

async function update(
  userId: string,
  preferences: UpdatePreferencesInput,
): Promise<UserPreferences> {
  await safeRedisOperation(
    () => redisClient.hSet(getPreferenceKey(userId), serializePreferences(preferences)),
    0,
    `guardar preferencias de usuario ${userId}`,
  );

  return get(userId);
}

export const preferenceService = {
  update,
  get,
};
