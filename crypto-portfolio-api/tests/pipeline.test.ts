import { runPipeline } from '../src/pipeline/pipeline';
import { validationFilter } from '../src/pipeline/ingestion/validationFilter';
import { normalizationFilter } from '../src/pipeline/ingestion/normalizationFilter';
import { currencyConversionFilter } from '../src/pipeline/ingestion/currencyConversionFilter';
import { scrubbingFilter } from '../src/pipeline/analytics/scrubbingFilter';
import { riskAnalysisFilter } from '../src/pipeline/analytics/riskAnalysisFilter';
import { formattingFilter } from '../src/pipeline/analytics/formattingFilter';

// Tests del Pipeline completo.
// Verifica que los filtros se ejecutan en el orden correcto y que
// el fail-fast funciona cuando un filtro falla.

describe('Ingestion Pipeline (completo)', () => {
  it('valida, normaliza y devuelve datos listos para guardar', async () => {
    const input = {
      symbol: '  btc  ',
      name: ' Bitcoin ',
      quantity: 2,
      purchasePrice: 50000,
    };

    const result = await runPipeline('IngestionPipeline', input, [
      validationFilter,
      normalizationFilter,
      currencyConversionFilter,
    ] as any[]);

    expect(result.symbol).toBe('BTC');
    expect(result.name).toBe('Bitcoin');
    expect(result.quantity).toBe(2);
    expect(result.purchasePrice).toBe(50000);
  });

  it('falla en el primer filtro (fail-fast) si los datos son inválidos', async () => {
    const input = {
      symbol: 'BTC',
      name: 'Bitcoin',
      quantity: -1, // inválido
      purchasePrice: 50000,
    };

    await expect(
      runPipeline('IngestionPipeline', input, [
        validationFilter,
        normalizationFilter,
        currencyConversionFilter,
      ] as any[]),
    ).rejects.toThrow();
  });

  it('convierte moneda dentro del pipeline', async () => {
    const input = {
      symbol: 'ETH',
      name: 'Ethereum',
      quantity: 5,
      purchasePrice: 1000,
      currency: 'EUR',
    };

    const result = await runPipeline('IngestionPipeline', input, [
      validationFilter,
      normalizationFilter,
      currencyConversionFilter,
    ] as any[]);

    // 1000 * 1.08 = 1080
    expect(result.purchasePrice).toBe(1080);
    expect(result.symbol).toBe('ETH');
  });
});

describe('Analytics Pipeline (completo)', () => {
  it('filtra, analiza riesgo y formatea en orden correcto', async () => {
    const input = [
      { symbol: 'BTC', name: 'Bitcoin', quantity: 3, purchasePrice: 50000 },
      { symbol: 'BAD', name: 'Bad Asset', quantity: 0, purchasePrice: 100 },
      { symbol: 'ADA', name: 'Cardano', quantity: 100, purchasePrice: 0.5 },
    ];

    const result = await runPipeline('AnalyticsPipeline', input, [
      scrubbingFilter,
      riskAnalysisFilter,
      formattingFilter,
    ]);

    // ScrubbingFilter elimina BAD (quantity=0) → quedan 2.
    expect(result).toHaveLength(2);

    // RiskAnalysisFilter marca BTC como high_risk (150k > 100k).
    expect(result[0]!.high_risk).toBe(true);
    expect(result[0]!.symbol).toBe('BTC');

    // ADA no es high_risk (50 < 100k).
    expect(result[1]!.high_risk).toBe(false);

    // FormattingFilter agrega analyzedAt a todos.
    expect(result[0]!.analyzedAt).toBeDefined();
    expect(result[1]!.analyzedAt).toBeDefined();
  });

  it('devuelve array vacío si todos los activos se filtran', async () => {
    const input = [
      { symbol: 'BAD', name: 'Bad', quantity: -1, purchasePrice: 100 },
    ];

    const result = await runPipeline('AnalyticsPipeline', input, [
      scrubbingFilter,
      riskAnalysisFilter,
      formattingFilter,
    ]);

    expect(result).toHaveLength(0);
  });
});
