import { v4 as uuidv4 } from 'uuid';
import type { Asset } from '../models/asset';
import type { AuditLog } from '../models/auditLog';
import { assetRepository } from '../repositories/assetRepository';
import { auditRepository } from '../repositories/auditRepository';
import type { CreateAssetInput, UpdateAssetInput } from '../schemas/asset.schema';
import { runPipeline } from '../pipeline/pipeline';
import { validationFilter } from '../pipeline/ingestion/validationFilter';
import { normalizationFilter } from '../pipeline/ingestion/normalizationFilter';
import { currencyConversionFilter } from '../pipeline/ingestion/currencyConversionFilter';

// AssetService: el corazón de la lógica de negocio.
//
// Coordina el repositorio de activos con el de auditoría: ante CADA
// operación de escritura (create / update / delete) genera de forma
// automática un registro en el log de auditoría. El controller no se
// entera de esto, solo llama al service.
//
// A partir de la Parte 3, el método create() utiliza el Ingestion
// Pipeline (patrón Pipes & Filters) para validar, normalizar y
// convertir moneda antes de guardar.
//
// A partir de la Parte 4, los repositorios son async (MySQL + MongoDB),
// por lo que todos los métodos del service también pasan a ser async.
// La lógica de negocio NO cambia: solo se agrega async/await.
//
// Los errores se tiran como Error con un prefijo ('CONFLICT:',
// 'NOT_FOUND:', 'VALIDATION:'), y el controller se encarga de
// traducirlos al código HTTP correspondiente.

function buildAuditLog(assetId: string, action: AuditLog['action']): AuditLog {
  return {
    id: uuidv4(),
    assetId,
    action,
    timestamp: new Date(),
  };
}

export const assetService = {
  async getAll(): Promise<Asset[]> {
    return assetRepository.findAll();
  },

  async getById(id: string): Promise<Asset> {
    const asset = await assetRepository.findById(id);
    if (!asset) throw new Error('NOT_FOUND: Activo no encontrado');
    return asset;
  },

  async create(data: unknown): Promise<Asset> {
    // El Ingestion Pipeline ejecuta en orden:
    //   1. validationFilter  → verifica estructura con Zod
    //   2. normalizationFilter → symbol a mayúsculas, trim espacios
    //   3. currencyConversionFilter → convierte a USD si es otra moneda
    //
    // Si algún filtro falla, el pipeline se detiene (fail-fast).
    const validated = await runPipeline<any>('IngestionPipeline', data, [
      validationFilter,
      normalizationFilter,
      currencyConversionFilter,
    ]);

    // Regla de negocio fuera del pipeline: no permitir duplicados.
    const result = validated as CreateAssetInput;
    if (await assetRepository.findBySymbol(result.symbol)) {
      throw new Error('CONFLICT: Ya existe un activo con ese símbolo');
    }

    const asset: Asset = {
      id: uuidv4(),
      symbol: result.symbol,
      name: result.name,
      quantity: result.quantity,
      purchasePrice: result.purchasePrice,
    };

    await assetRepository.create(asset);
    await auditRepository.append(buildAuditLog(asset.id, 'CREATE'));

    return asset;
  },

  async update(id: string, data: UpdateAssetInput): Promise<Asset> {
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

    // Una sola consulta a la DB: si no existe, update devuelve null.
    // Esto elimina el doble lookup (findById + update) que existía antes,
    // y también elimina la aserción ! que era potencialmente peligrosa
    // ante race conditions entre las dos consultas.
    const updated = await assetRepository.update(id, data);
    if (!updated) throw new Error('NOT_FOUND: Activo no encontrado');

    await auditRepository.append(buildAuditLog(id, 'UPDATE'));
    return updated;
  },

  async delete(id: string): Promise<void> {
    const ok = await assetRepository.delete(id);
    if (!ok) throw new Error('NOT_FOUND: Activo no encontrado');

    // Importante: el log se crea DESPUÉS de borrar, pero como el
    // auditRepository es independiente, el historial sigue disponible
    // aunque el activo ya no exista.
    await auditRepository.append(buildAuditLog(id, 'DELETE'));
  },

  async getHistory(id: string): Promise<AuditLog[]> {
    return auditRepository.findByAssetId(id);
  },
};
