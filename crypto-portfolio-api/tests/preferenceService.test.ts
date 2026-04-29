const mockPreferenceStore = new Map<string, Record<string, string>>();

jest.mock('../src/config/redis', () => ({
  redisClient: {
    hSet: jest.fn(async (key: string, values: Record<string, string>) => {
      mockPreferenceStore.set(key, {
        ...(mockPreferenceStore.get(key) ?? {}),
        ...values,
      });
      return Object.keys(values).length;
    }),
    hGetAll: jest.fn(async (key: string) => mockPreferenceStore.get(key) ?? {}),
  },
  safeRedisOperation: jest.fn(async (operation: () => Promise<unknown>) => operation()),
}));

import { preferenceService } from '../src/services/preferenceService';
import { redisClient } from '../src/config/redis';

describe('preferenceService', () => {
  beforeEach(() => {
    mockPreferenceStore.clear();
    jest.clearAllMocks();
  });

  it('guarda preferencias de usuario con hSet', async () => {
    const preferences = await preferenceService.update('user-1', {
      displayCurrency: 'USD',
      alertLimit: 1000,
    });

    expect(redisClient.hSet).toHaveBeenCalledWith('user:user-1:preferences', {
      displayCurrency: 'USD',
      alertLimit: '1000',
    });
    expect(preferences).toEqual({
      displayCurrency: 'USD',
      alertLimit: 1000,
    });
  });

  it('lee preferencias de usuario con hGetAll', async () => {
    mockPreferenceStore.set('user:user-2:preferences', {
      displayCurrency: 'EUR',
      alertLimit: '250',
    });

    const preferences = await preferenceService.get('user-2');

    expect(redisClient.hGetAll).toHaveBeenCalledWith('user:user-2:preferences');
    expect(preferences).toEqual({
      displayCurrency: 'EUR',
      alertLimit: 250,
    });
  });
});
