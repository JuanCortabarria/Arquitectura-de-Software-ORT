import type { Asset } from '../models/asset';

// Repositorio de activos.
//
// Esta capa abstrae el "dónde" se guardan los datos. Hoy es un array
// en memoria (igual que en la Parte 1), pero el día de mañana se podría
// reemplazar por una base de datos sin tocar los services ni los
// controllers.
//
// Exportamos un objeto con funciones (en lugar de una clase) porque es
// más simple de leer y de mockear en los tests.

const assets: Asset[] = [];

export const assetRepository = {
  findAll(): Asset[] {
    return assets;
  },

  findById(id: string): Asset | undefined {
    return assets.find(a => a.id === id);
  },

  findBySymbol(symbol: string): Asset | undefined {
    return assets.find(a => a.symbol === symbol);
  },

  create(asset: Asset): Asset {
    assets.push(asset);
    return asset;
  },

  // Aplica los cambios "data" sobre el activo con el id indicado.
  // Devuelve el activo actualizado o undefined si no existe.
  update(id: string, data: Partial<Asset>): Asset | undefined {
    const index = assets.findIndex(a => a.id === id);
    if (index === -1) return undefined;

    // Combinamos el activo viejo con los campos nuevos.
    // Forzamos que id y symbol no cambien aunque vengan en data.
    const updated: Asset = {
      ...assets[index]!,
      ...data,
      id: assets[index]!.id,
      symbol: assets[index]!.symbol,
    };
    assets[index] = updated;
    return updated;
  },

  delete(id: string): boolean {
    const index = assets.findIndex(a => a.id === id);
    if (index === -1) return false;
    assets.splice(index, 1);
    return true;
  },

  // Solo para tests: vacía el array entre cada caso.
  _reset(): void {
    assets.length = 0;
  },
};
