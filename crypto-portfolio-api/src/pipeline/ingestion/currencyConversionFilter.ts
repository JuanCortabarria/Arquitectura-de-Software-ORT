import type { CreateAssetInput } from '../../schemas/asset.schema';
import { logger } from '../../config/logger';

// CurrencyConversionFilter — tercer filtro del Ingestion Pipeline.
//
// Si el activo viene con una moneda distinta a USD (por ejemplo EUR),
// este filtro convierte el purchasePrice a USD usando una tasa de
// cambio. Si no viene moneda o es USD, no hace nada.
//
// Las tasas están hardcodeadas como ejemplo didáctico. En un proyecto
// real se consultaría una API externa (por eso el filtro es async,
// para que esté preparado para ese caso).

// Tasas de cambio aproximadas contra USD.
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  ARS: 0.001,
  BRL: 0.20,
};

// Extendemos el input para aceptar un campo opcional "currency".
type InputWithCurrency = CreateAssetInput & { currency?: string };

export async function currencyConversionFilter(
  data: InputWithCurrency,
): Promise<CreateAssetInput> {
  const currency = data.currency?.toUpperCase() || 'USD';

  // Si ya es USD, no hay nada que convertir.
  if (currency === 'USD') {
    logger.info('[CurrencyConversionFilter] No conversion needed (USD)');
    // Quitamos el campo currency del resultado (no es parte de Asset).
    const { currency: _, ...rest } = data;
    return rest;
  }

  const rate = EXCHANGE_RATES[currency];
  if (!rate) {
    throw new Error(`VALIDATION: Moneda no soportada: ${currency}`);
  }

  const convertedPrice = parseFloat((data.purchasePrice * rate).toFixed(2));

  logger.info(
    `[CurrencyConversionFilter] ${data.purchasePrice} ${currency} → ${convertedPrice} USD (tasa: ${rate})`,
  );

  const { currency: _, ...rest } = data;
  return {
    ...rest,
    purchasePrice: convertedPrice,
  };
}
