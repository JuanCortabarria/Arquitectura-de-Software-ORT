import type { AnalyzedAsset } from './analyzedAsset';
import { logger } from '../../config/logger';

// ScrubbingFilter — primer filtro del Analytics Pipeline.
//
// "Scrubbing" = limpieza de datos. Filtra (elimina) los activos que
// tienen montos en cero o negativos, porque no tiene sentido
// analizarlos. Funciona como un filtro de calidad de datos.

export function scrubbingFilter(assets: AnalyzedAsset[]): AnalyzedAsset[] {
  const original = assets.length;
  const cleaned = assets.filter(a => a.quantity > 0 && a.purchasePrice > 0);
  const removed = original - cleaned.length;

  logger.info(
    `[ScrubbingFilter] ${removed} activo(s) filtrado(s) de ${original}`,
  );

  return cleaned;
}
