import type { Asset } from '../models/asset';
import AssetModel from '../models/asset.sequelize';

// Repositorio de activos — ahora respaldado por MySQL via Sequelize.
//
// Esta capa abstrae el "dónde" se guardan los datos. Antes era un array
// en memoria; ahora es una tabla MySQL. El resto de la app (services,
// controllers, pipeline) no se entera del cambio: solo necesita agregar
// async/await a las llamadas.
//
// Todas las consultas usan { raw: true } o .toJSON() para devolver
// objetos planos que cumplen con la interfaz Asset, no instancias
// de Sequelize.

export const assetRepository = {
  async findAll(): Promise<Asset[]> {
    return AssetModel.findAll({ raw: true });
  },

  async findById(id: string): Promise<Asset | null> {
    return AssetModel.findByPk(id, { raw: true });
  },

  async findBySymbol(symbol: string): Promise<Asset | null> {
    return AssetModel.findOne({ where: { symbol }, raw: true });
  },

  async create(asset: Asset): Promise<Asset> {
    const created = await AssetModel.create(asset);
    return created.toJSON();
  },

  // Aplica los cambios "data" sobre el activo con el id indicado.
  // Devuelve el activo actualizado o null si no existe.
  async update(id: string, data: Partial<Asset>): Promise<Asset | null> {
    const existing = await AssetModel.findByPk(id);
    if (!existing) return null;

    // Forzamos que id y symbol no cambien aunque vengan en data.
    const { id: _id, symbol: _symbol, ...safeData } = data;
    await existing.update(safeData);

    return existing.toJSON();
  },

  async delete(id: string): Promise<boolean> {
    const count = await AssetModel.destroy({ where: { id } });
    return count > 0;
  },

  // Solo para tests: vacía la tabla entre cada caso.
  async _reset(): Promise<void> {
    await AssetModel.destroy({ where: {} });
  },
};
