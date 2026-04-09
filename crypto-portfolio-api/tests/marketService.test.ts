import { marketService } from '../src/services/marketService';
import { assetService } from '../src/services/assetService';
import { assetRepository } from '../src/repositories/assetRepository';
import { auditRepository } from '../src/repositories/auditRepository';
import type { Asset } from '../src/models/asset';

// Tests del MarketService.
//
// Acá NO queremos llamar a CryptoCompare de verdad: depender de
// internet hace los tests lentos y frágiles. Por eso reemplazamos la
// función "fetcher" del marketService por un mock que devuelve lo que
// queramos.

describe('marketService', () => {
  beforeEach(() => {
    assetRepository._reset();
    auditRepository._reset();
    process.env.CRYPTO_API_URL = 'https://api.fake/price';
  });

  describe('calculateGainOrLoss (lógica pura)', () => {
    it('calcula correctamente la ganancia', () => {
      const asset: Asset = {
        id: 'x',
        symbol: 'BTC',
        name: 'Bitcoin',
        quantity: 2,
        purchasePrice: 50000,
      };
      // (60000 - 50000) * 2 = 20000
      expect(marketService.calculateGainOrLoss(asset, 60000)).toBe(20000);
    });

    it('calcula correctamente la pérdida', () => {
      const asset: Asset = {
        id: 'x',
        symbol: 'BTC',
        name: 'Bitcoin',
        quantity: 1,
        purchasePrice: 50000,
      };
      // (45000 - 50000) * 1 = -5000
      expect(marketService.calculateGainOrLoss(asset, 45000)).toBe(-5000);
    });
  });

  describe('getPriceForAsset (con fetch mockeado)', () => {
    it('devuelve el precio actual y la ganancia calculada', async () => {
      const asset = assetService.create({
        symbol: 'BTC',
        name: 'Bitcoin',
        quantity: 2,
        purchasePrice: 50000,
      });

      // Mockeamos el fetcher para que devuelva una respuesta "fake".
      marketService.fetcher = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ USD: 60000 }),
      } as Response);

      const result = await marketService.getPriceForAsset(asset.id);

      expect(result.symbol).toBe('BTC');
      expect(result.currentPrice).toBe(60000);
      expect(result.gainOrLoss).toBe(20000);
      expect(result.currency).toBe('USD');
    });

    it('lanza NOT_FOUND si el activo no existe', async () => {
      await expect(
        marketService.getPriceForAsset('id-inexistente'),
      ).rejects.toThrow(/NOT_FOUND/);
    });

    it('lanza UPSTREAM si la API externa responde con error', async () => {
      const asset = assetService.create({
        symbol: 'BTC',
        name: 'Bitcoin',
        quantity: 1,
        purchasePrice: 50000,
      });

      marketService.fetcher = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({}),
      } as Response);

      await expect(
        marketService.getPriceForAsset(asset.id),
      ).rejects.toThrow(/UPSTREAM/);
    });
  });
});
