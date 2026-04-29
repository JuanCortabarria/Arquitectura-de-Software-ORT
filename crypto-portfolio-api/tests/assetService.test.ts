import { assetService } from '../src/services/assetService';
import { assetRepository } from '../src/repositories/assetRepository';
import { auditRepository } from '../src/repositories/auditRepository';
import { assetCacheService } from '../src/services/assetCacheService';

// Tests unitarios del AssetService.
//
// A partir de la Parte 4, todos los métodos del service son async
// (porque interactúan con MySQL y MongoDB). Por eso todos los tests
// usan async/await, y los expect de errores usan rejects.toThrow().

describe('assetService', () => {
  beforeEach(async () => {
    await assetRepository._reset();
    await auditRepository._reset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('crea un activo con un id UUID válido', async () => {
    const asset = await assetService.create({
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

  it('al crear un activo, registra automáticamente un log CREATE', async () => {
    const asset = await assetService.create({
      symbol: 'ETH',
      name: 'Ethereum',
      quantity: 2,
      purchasePrice: 3000,
    });

    const history = await assetService.getHistory(asset.id);
    expect(history).toHaveLength(1);
    expect(history[0]!.action).toBe('CREATE');
    expect(history[0]!.assetId).toBe(asset.id);
  });

  it('no permite crear dos activos con el mismo symbol', async () => {
    await assetService.create({
      symbol: 'BTC',
      name: 'Bitcoin',
      quantity: 1,
      purchasePrice: 50000,
    });

    await expect(
      assetService.create({
        symbol: 'btc', // mismo símbolo, distinto case
        name: 'Bitcoin',
        quantity: 5,
        purchasePrice: 60000,
      }),
    ).rejects.toThrow(/CONFLICT/);
  });

  it('update con quantity <= 0 lanza error de validación (no saldos negativos)', async () => {
    const asset = await assetService.create({
      symbol: 'BTC',
      name: 'Bitcoin',
      quantity: 1,
      purchasePrice: 50000,
    });

    await expect(
      assetService.update(asset.id, { quantity: -5 }),
    ).rejects.toThrow(/VALIDATION/);

    await expect(
      assetService.update(asset.id, { quantity: 0 }),
    ).rejects.toThrow(/VALIDATION/);
  });

  it('update existente registra un log UPDATE', async () => {
    const asset = await assetService.create({
      symbol: 'BTC',
      name: 'Bitcoin',
      quantity: 1,
      purchasePrice: 50000,
    });

    await assetService.update(asset.id, { quantity: 2 });

    const history = await assetService.getHistory(asset.id);
    expect(history.map(h => h.action)).toEqual(['CREATE', 'UPDATE']);
  });

  it('delete registra un log DELETE y conserva el historial', async () => {
    const asset = await assetService.create({
      symbol: 'BTC',
      name: 'Bitcoin',
      quantity: 1,
      purchasePrice: 50000,
    });

    await assetService.delete(asset.id);

    // El activo ya no existe...
    await expect(assetService.getById(asset.id)).rejects.toThrow(/NOT_FOUND/);

    // ...pero el historial sigue disponible (auditoría inmutable).
    const history = await assetService.getHistory(asset.id);
    expect(history.map(h => h.action)).toEqual(['CREATE', 'DELETE']);
  });

  it('getHistory devuelve los eventos en orden cronológico', async () => {
    const asset = await assetService.create({
      symbol: 'BTC',
      name: 'Bitcoin',
      quantity: 1,
      purchasePrice: 50000,
    });
    await assetService.update(asset.id, { quantity: 2 });
    await assetService.update(asset.id, { quantity: 3 });

    const history = await assetService.getHistory(asset.id);
    expect(history).toHaveLength(3);
    for (let i = 1; i < history.length; i++) {
      expect(new Date(history[i]!.timestamp).getTime())
        .toBeGreaterThanOrEqual(new Date(history[i - 1]!.timestamp).getTime());
    }
  });

  it('getById guarda en caché cuando consulta desde MySQL', async () => {
    const asset = await assetService.create({
      symbol: 'BTC',
      name: 'Bitcoin',
      quantity: 1,
      purchasePrice: 50000,
    });

    const cacheGetSpy = jest.spyOn(assetCacheService, 'get').mockResolvedValueOnce(null);
    const cacheSetSpy = jest.spyOn(assetCacheService, 'set').mockResolvedValueOnce();
    const repositorySpy = jest.spyOn(assetRepository, 'findById');

    const found = await assetService.getById(asset.id);

    expect(found.id).toBe(asset.id);
    expect(cacheGetSpy).toHaveBeenCalledWith(asset.id);
    expect(repositorySpy).toHaveBeenCalledWith(asset.id);
    expect(cacheSetSpy).toHaveBeenCalledWith(found);
  });

  it('getById devuelve el activo desde caché sin consultar MySQL', async () => {
    const cachedAsset = {
      id: 'cached-id',
      symbol: 'BTC',
      name: 'Bitcoin',
      quantity: 1,
      purchasePrice: 50000,
    };

    jest.spyOn(assetCacheService, 'get').mockResolvedValueOnce(cachedAsset);
    const repositorySpy = jest.spyOn(assetRepository, 'findById');

    const found = await assetService.getById(cachedAsset.id);

    expect(found).toEqual(cachedAsset);
    expect(repositorySpy).not.toHaveBeenCalled();
  });

  it('update y delete invalidan la caché del activo', async () => {
    const asset = await assetService.create({
      symbol: 'BTC',
      name: 'Bitcoin',
      quantity: 1,
      purchasePrice: 50000,
    });
    const invalidateSpy = jest.spyOn(assetCacheService, 'invalidate').mockResolvedValue();

    await assetService.update(asset.id, { quantity: 2 });
    await assetService.delete(asset.id);

    expect(invalidateSpy).toHaveBeenCalledTimes(2);
    expect(invalidateSpy).toHaveBeenNthCalledWith(1, asset.id);
    expect(invalidateSpy).toHaveBeenNthCalledWith(2, asset.id);
  });
});
