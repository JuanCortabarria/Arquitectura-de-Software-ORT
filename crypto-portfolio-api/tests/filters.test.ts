import { validationFilter } from '../src/pipeline/ingestion/validationFilter';
import { normalizationFilter } from '../src/pipeline/ingestion/normalizationFilter';
import { currencyConversionFilter } from '../src/pipeline/ingestion/currencyConversionFilter';
import { scrubbingFilter } from '../src/pipeline/analytics/scrubbingFilter';
import { riskAnalysisFilter } from '../src/pipeline/analytics/riskAnalysisFilter';
import { formattingFilter } from '../src/pipeline/analytics/formattingFilter';

// Tests unitarios de cada filtro por separado.
// Cada filtro se testea de forma aislada, sin depender de los demás.

describe('Filtros de Ingesta', () => {
  describe('validationFilter', () => {
    it('pasa con datos válidos', () => {
      const input = {
        symbol: 'BTC',
        name: 'Bitcoin',
        quantity: 1,
        purchasePrice: 50000,
      };
      const result = validationFilter(input);
      expect(result).toEqual(input);
    });

    it('tira error con datos inválidos (quantity negativo)', () => {
      const input = {
        symbol: 'BTC',
        name: 'Bitcoin',
        quantity: -1,
        purchasePrice: 50000,
      };
      expect(() => validationFilter(input)).toThrow();
    });

    it('tira error si falta un campo obligatorio', () => {
      const input = { symbol: 'BTC', name: 'Bitcoin' };
      expect(() => validationFilter(input)).toThrow();
    });
  });

  describe('normalizationFilter', () => {
    it('normaliza symbol a mayúsculas y elimina espacios', () => {
      const input = {
        symbol: '  btc  ',
        name: '  Bitcoin  ',
        quantity: 1,
        purchasePrice: 50000,
      };
      const result = normalizationFilter(input);
      expect(result.symbol).toBe('BTC');
      expect(result.name).toBe('Bitcoin');
    });

    it('no modifica datos que ya están normalizados', () => {
      const input = {
        symbol: 'ETH',
        name: 'Ethereum',
        quantity: 2,
        purchasePrice: 3000,
      };
      const result = normalizationFilter(input);
      expect(result).toEqual(input);
    });
  });

  describe('currencyConversionFilter', () => {
    it('no convierte si la moneda es USD', async () => {
      const input = {
        symbol: 'BTC',
        name: 'Bitcoin',
        quantity: 1,
        purchasePrice: 50000,
        currency: 'USD',
      };
      const result = await currencyConversionFilter(input);
      expect(result.purchasePrice).toBe(50000);
      // El campo currency se elimina del resultado.
      expect((result as any).currency).toBeUndefined();
    });

    it('no convierte si no viene moneda (default USD)', async () => {
      const input = {
        symbol: 'BTC',
        name: 'Bitcoin',
        quantity: 1,
        purchasePrice: 50000,
      };
      const result = await currencyConversionFilter(input);
      expect(result.purchasePrice).toBe(50000);
    });

    it('convierte EUR a USD', async () => {
      const input = {
        symbol: 'BTC',
        name: 'Bitcoin',
        quantity: 1,
        purchasePrice: 1000,
        currency: 'EUR',
      };
      const result = await currencyConversionFilter(input);
      // 1000 * 1.08 = 1080
      expect(result.purchasePrice).toBe(1080);
    });

    it('tira error con moneda no soportada', async () => {
      const input = {
        symbol: 'BTC',
        name: 'Bitcoin',
        quantity: 1,
        purchasePrice: 1000,
        currency: 'XYZ',
      };
      await expect(currencyConversionFilter(input)).rejects.toThrow(/VALIDATION/);
    });
  });
});

describe('Filtros de Análisis', () => {
  describe('scrubbingFilter', () => {
    it('filtra activos con quantity <= 0 o purchasePrice <= 0', () => {
      const assets = [
        { symbol: 'BTC', name: 'Bitcoin', quantity: 1, purchasePrice: 50000 },
        { symbol: 'ETH', name: 'Ethereum', quantity: 0, purchasePrice: 3000 },
        { symbol: 'SOL', name: 'Solana', quantity: 5, purchasePrice: -10 },
        { symbol: 'ADA', name: 'Cardano', quantity: 100, purchasePrice: 0.5 },
      ];
      const result = scrubbingFilter(assets);
      expect(result).toHaveLength(2);
      expect(result.map(a => a.symbol)).toEqual(['BTC', 'ADA']);
    });

    it('no filtra nada si todos son válidos', () => {
      const assets = [
        { symbol: 'BTC', name: 'Bitcoin', quantity: 1, purchasePrice: 50000 },
      ];
      expect(scrubbingFilter(assets)).toHaveLength(1);
    });
  });

  describe('riskAnalysisFilter', () => {
    it('marca como high_risk si monto > 100,000', () => {
      const assets = [
        { symbol: 'BTC', name: 'Bitcoin', quantity: 3, purchasePrice: 50000 },
        { symbol: 'ADA', name: 'Cardano', quantity: 100, purchasePrice: 0.5 },
      ];
      const result = riskAnalysisFilter(assets);
      // BTC: 3 * 50000 = 150000 > 100000 → high_risk
      expect(result[0]!.high_risk).toBe(true);
      // ADA: 100 * 0.5 = 50 < 100000 → no high_risk
      expect(result[1]!.high_risk).toBe(false);
    });
  });

  describe('formattingFilter', () => {
    it('redondea a 2 decimales y agrega analyzedAt', () => {
      const assets = [
        { symbol: 'BTC', name: 'Bitcoin', quantity: 1.12345, purchasePrice: 50000.999 },
      ];
      const result = formattingFilter(assets);
      expect(result[0]!.quantity).toBe(1.12);
      expect(result[0]!.purchasePrice).toBe(50001);
      expect(result[0]!.analyzedAt).toBeDefined();
    });
  });
});
