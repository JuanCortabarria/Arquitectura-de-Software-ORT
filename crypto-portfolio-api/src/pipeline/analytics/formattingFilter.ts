import type { AnalyzedAsset } from './analyzedAsset';
import { logger } from '../../config/logger';

// FormattingFilter — tercer (y último) filtro del Analytics Pipeline.
//
// Redondea los valores numéricos a 2 decimales y agrega un campo
// "analyzedAt" con la fecha/hora del análisis. Esto funciona como
// metadato de auditoría: sabés exactamente cuándo se analizó cada
// activo.

export function formattingFilter(assets: AnalyzedAsset[]): AnalyzedAsset[] {
  const formatted = assets.map(a => ({
    ...a,
    quantity: parseFloat(a.quantity.toFixed(2)),
    purchasePrice: parseFloat(a.purchasePrice.toFixed(2)),
    analyzedAt: new Date().toISOString(),
  }));

  logger.info(`[FormattingFilter] ${formatted.length} activo(s) formateado(s)`);
  return formatted;
}
