import { assetService } from '../src/services/assetService';
import { assetRepository } from '../src/repositories/assetRepository';
import { auditRepository } from '../src/repositories/auditRepository';

// Tests unitarios del AssetService.
//
// El service trabaja sobre los repositorios reales (en memoria), por
// lo que entre cada test los reseteamos para que no se "contaminen"
// entre sí.

describe('assetService', () => {
  beforeEach(() => {
    assetRepository._reset();
    auditRepository._reset();
  });

  it('crea un activo con un id UUID válido', () => {
    const asset = assetService.create({
      symbol: 'btc',
      name: 'Bitcoin',
      quantity: 1,
      purchasePrice: 50000,
    });

    // El id debe ser un UUID v4 (36 caracteres con guiones).
    expect(asset.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    // El símbolo se normaliza a mayúsculas.
    expect(asset.symbol).toBe('BTC');
  });

  it('al crear un activo, registra automáticamente un log CREATE', () => {
    const asset = assetService.create({
      symbol: 'ETH',
      name: 'Ethereum',
      quantity: 2,
      purchasePrice: 3000,
    });

    const history = assetService.getHistory(asset.id);
    expect(history).toHaveLength(1);
    expect(history[0]!.action).toBe('CREATE');
    expect(history[0]!.assetId).toBe(asset.id);
  });

  it('no permite crear dos activos con el mismo symbol', () => {
    assetService.create({
      symbol: 'BTC',
      name: 'Bitcoin',
      quantity: 1,
      purchasePrice: 50000,
    });

    expect(() =>
      assetService.create({
        symbol: 'btc', // mismo símbolo, distinto case
        name: 'Bitcoin',
        quantity: 5,
        purchasePrice: 60000,
      }),
    ).toThrow(/CONFLICT/);
  });

  it('update con quantity <= 0 lanza error de validación (no saldos negativos)', () => {
    const asset = assetService.create({
      symbol: 'BTC',
      name: 'Bitcoin',
      quantity: 1,
      purchasePrice: 50000,
    });

    expect(() =>
      assetService.update(asset.id, { quantity: -5 }),
    ).toThrow(/VALIDATION/);

    expect(() =>
      assetService.update(asset.id, { quantity: 0 }),
    ).toThrow(/VALIDATION/);
  });

  it('update existente registra un log UPDATE', () => {
    const asset = assetService.create({
      symbol: 'BTC',
      name: 'Bitcoin',
      quantity: 1,
      purchasePrice: 50000,
    });

    assetService.update(asset.id, { quantity: 2 });

    const history = assetService.getHistory(asset.id);
    expect(history.map(h => h.action)).toEqual(['CREATE', 'UPDATE']);
  });

  it('delete registra un log DELETE y conserva el historial', () => {
    const asset = assetService.create({
      symbol: 'BTC',
      name: 'Bitcoin',
      quantity: 1,
      purchasePrice: 50000,
    });

    assetService.delete(asset.id);

    // El activo ya no existe...
    expect(() => assetService.getById(asset.id)).toThrow(/NOT_FOUND/);

    // ...pero el historial sigue disponible (auditoría inmutable).
    const history = assetService.getHistory(asset.id);
    expect(history.map(h => h.action)).toEqual(['CREATE', 'DELETE']);
  });

  it('getHistory devuelve los eventos en orden cronológico', () => {
    const asset = assetService.create({
      symbol: 'BTC',
      name: 'Bitcoin',
      quantity: 1,
      purchasePrice: 50000,
    });
    assetService.update(asset.id, { quantity: 2 });
    assetService.update(asset.id, { quantity: 3 });

    const history = assetService.getHistory(asset.id);
    expect(history).toHaveLength(3);
    for (let i = 1; i < history.length; i++) {
      expect(history[i]!.timestamp.getTime())
        .toBeGreaterThanOrEqual(history[i - 1]!.timestamp.getTime());
    }
  });
});
