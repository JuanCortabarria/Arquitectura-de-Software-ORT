import type { AuditLog } from '../models/auditLog';
import { AuditLogModel } from '../models/auditLog.mongoose';

// Repositorio de logs de auditoría — ahora respaldado por MongoDB via Mongoose.
//
// Es "append-only": solo se agregan registros, nunca se borran ni se
// modifican. Esto es lo que hace que la auditoría sea INMUTABLE y
// confiable como historial.
//
// MongoDB es ideal para este caso porque los logs pueden crecer
// exponencialmente y no necesitan una estructura relacional rígida.

export const auditRepository = {
  async append(log: AuditLog): Promise<void> {
    await AuditLogModel.create(log);
  },

  // Devuelve los logs de un activo ordenados cronológicamente
  // (del más viejo al más nuevo).
  // .lean() devuelve objetos planos de JS en vez de documentos Mongoose.
  async findByAssetId(assetId: string): Promise<AuditLog[]> {
    const docs = await AuditLogModel.find({ assetId })
      .sort({ timestamp: 1 })
      .lean();

    return docs.map(doc => ({
      id: doc.id,
      assetId: doc.assetId,
      action: doc.action,
      timestamp: doc.timestamp,
    }));
  },

  // Solo para tests.
  async _reset(): Promise<void> {
    await AuditLogModel.deleteMany({});
  },
};
