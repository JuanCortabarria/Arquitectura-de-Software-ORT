import { v4 as uuidv4 } from 'uuid';
import type { Asset } from '../models/asset';
import type { AuditLog } from '../models/auditLog';
import { assetRepository } from '../repositories/assetRepository';
import { auditRepository } from '../repositories/auditRepository';
import type { CreateAssetInput, UpdateAssetInput } from '../schemas/asset.schema';

// AssetService: el corazón de la lógica de negocio.
//
// Coordina el repositorio de activos con el de auditoría: ante CADA
// operación de escritura (create / update / delete) genera de forma
// automática un registro en el log de auditoría. El controller no se
// entera de esto, solo llama al service.
//
// Los errores se tiran como Error con un prefijo ('CONFLICT:',
// 'NOT_FOUND:', 'VALIDATION:'), y el controller se encarga de
// traducirlos al código HTTP correspondiente. Es una forma simple de
// manejar errores sin armar una jerarquía de clases de error.

function buildAuditLog(assetId: string, action: AuditLog['action']): AuditLog {
  return {
    id: uuidv4(),
    assetId,
    action,
    timestamp: new Date(),
  };
}

export const assetService = {
  getAll(): Asset[] {
    return assetRepository.findAll();
  },

  getById(id: string): Asset {
    const asset = assetRepository.findById(id);
    if (!asset) throw new Error('NOT_FOUND: Activo no encontrado');
    return asset;
  },

  create(data: CreateAssetInput): Asset {
    // Normalizamos el símbolo a mayúsculas para que "btc" y "BTC" sean
    // el mismo activo.
    const symbol = data.symbol.toUpperCase();

    // Regla de negocio: no permitir dos activos con el mismo symbol.
    if (assetRepository.findBySymbol(symbol)) {
      throw new Error('CONFLICT: Ya existe un activo con ese símbolo');
    }

    const asset: Asset = {
      id: uuidv4(),
      symbol,
      name: data.name,
      quantity: data.quantity,
      purchasePrice: data.purchasePrice,
    };

    assetRepository.create(asset);
    auditRepository.append(buildAuditLog(asset.id, 'CREATE'));

    return asset;
  },

  update(id: string, data: UpdateAssetInput): Asset {
    // Verificamos primero que el activo exista.
    const existing = assetRepository.findById(id);
    if (!existing) throw new Error('NOT_FOUND: Activo no encontrado');

    // Regla de negocio: no permitir saldos negativos.
    // Zod ya valida que, si vienen, sean > 0. Esto es una segunda barrera
    // por si el service se llama desde otro lugar sin pasar por el
    // middleware de validación.
    if (data.quantity !== undefined && data.quantity <= 0) {
      throw new Error('VALIDATION: quantity debe ser mayor a 0');
    }
    if (data.purchasePrice !== undefined && data.purchasePrice <= 0) {
      throw new Error('VALIDATION: purchasePrice debe ser mayor a 0');
    }

    const updated = assetRepository.update(id, data)!;
    auditRepository.append(buildAuditLog(id, 'UPDATE'));

    return updated;
  },

  delete(id: string): void {
    const ok = assetRepository.delete(id);
    if (!ok) throw new Error('NOT_FOUND: Activo no encontrado');

    // Importante: el log se crea DESPUÉS de borrar, pero como el
    // auditRepository es independiente, el historial sigue disponible
    // aunque el activo ya no exista.
    auditRepository.append(buildAuditLog(id, 'DELETE'));
  },

  getHistory(id: string): AuditLog[] {
    return auditRepository.findByAssetId(id);
  },
};
