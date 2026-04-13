import type { AnalyzedAsset } from './analyzedAsset';
import { logger } from '../../config/logger';

// RiskAnalysisFilter — segundo filtro del Analytics Pipeline.
//
// Marca activos como "high_risk" si el monto total (quantity * price)
// supera un umbral. Esto se conoce como "Whale Alert" en el mundo
// crypto: cuando alguien mueve una cantidad enorme de dinero, es una
// señal de riesgo potencial.

const WHALE_THRESHOLD = 100_000; // USD

export function riskAnalysisFilter(assets: AnalyzedAsset[]): AnalyzedAsset[] {
  const result = assets.map(a => {
    const totalValue = a.quantity * a.purchasePrice;
    const isHighRisk = totalValue > WHALE_THRESHOLD;

    if (isHighRisk) {
      logger.info(
        `[RiskAnalysisFilter] ${a.symbol} marcado como HIGH RISK (total: $${totalValue})`,
      );
    }

    return { ...a, high_risk: isHighRisk };
  });

  return result;
}
