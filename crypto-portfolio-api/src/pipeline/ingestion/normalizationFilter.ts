import type { CreateAssetInput } from '../../schemas/asset.schema';
import { logger } from '../../config/logger';

// NormalizationFilter — segundo filtro del Ingestion Pipeline.
//
// Transforma el símbolo a mayúsculas y elimina espacios extra del
// nombre y del símbolo. Así " btc " se convierte en "BTC" y
// "  Bitcoin " en "Bitcoin".
//
// Antes esta lógica estaba dentro de assetService.create(). Ahora
// es un paso independiente y testeable del pipeline.

export function normalizationFilter(data: CreateAssetInput): CreateAssetInput {
  const normalized = {
    ...data,
    symbol: data.symbol.trim().toUpperCase(),
    name: data.name.trim(),
  };

  logger.info(`[NormalizationFilter] Symbol ${normalized.symbol} normalized`);
  return normalized;
}
