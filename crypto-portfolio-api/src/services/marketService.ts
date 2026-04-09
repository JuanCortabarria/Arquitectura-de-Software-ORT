import { assetRepository } from '../repositories/assetRepository';
import { logger } from '../config/logger';
import type { Asset } from '../models/asset';

// MarketService: consulta el precio actual en CryptoCompare y calcula
// la ganancia/pérdida del activo respecto al precio de compra.
//
// Por qué está separado del assetService: la consulta a una API externa
// es lógica diferente al CRUD del portafolio, y además queremos poder
// MOCKEAR el fetch en los tests sin depender de internet.
//
// El fetch se hace a través de la propiedad "fetcher" del propio
// objeto. En los tests podemos sobrescribirla con un jest.fn() para
// simular respuestas.

export interface PriceResult {
  symbol: string;
  name: string;
  purchasePrice: number;
  currentPrice: number;
  gainOrLoss: number;
  currency: 'USD';
}

export const marketService = {
  // Función indirecta de fetch: en los tests se reemplaza por un mock.
  fetcher: (url: string) => fetch(url),

  // Lógica pura: dado un activo y un precio actual, calcula la
  // ganancia o pérdida. Es lo único que tiene sentido testear "puro".
  calculateGainOrLoss(asset: Asset, currentPrice: number): number {
    const gain = (currentPrice - asset.purchasePrice) * asset.quantity;
    return parseFloat(gain.toFixed(2));
  },

  async getPriceForAsset(id: string): Promise<PriceResult> {
    const asset = assetRepository.findById(id);
    if (!asset) throw new Error('NOT_FOUND: Activo no encontrado');

    const apiUrl = process.env.CRYPTO_API_URL;
    const url = `${apiUrl}?fsym=${asset.symbol}&tsyms=USD`;

    const response = await this.fetcher(url);
    if (!response.ok) {
      logger.error(`API externa respondió ${response.status}`);
      throw new Error('UPSTREAM: Error al comunicarse con el proveedor de precios');
    }

    const data = (await response.json()) as { USD?: number };
    const currentPrice = data.USD;
    if (!currentPrice) {
      throw new Error(`VALIDATION: No se encontró precio para ${asset.symbol}`);
    }

    return {
      symbol: asset.symbol,
      name: asset.name,
      purchasePrice: asset.purchasePrice,
      currentPrice,
      gainOrLoss: this.calculateGainOrLoss(asset, currentPrice),
      currency: 'USD',
    };
  },
};
