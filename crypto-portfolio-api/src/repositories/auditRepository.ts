import type { AuditLog } from '../models/auditLog';

// Repositorio de logs de auditoría.
//
// Es "append-only": solo se agregan registros, nunca se borran ni se
// modifican. Esto es lo que hace que la auditoría sea INMUTABLE y
// confiable como historial.
//
// Está separado del assetRepository (no comparten el array) porque la
// consigna lo pide explícitamente y porque conceptualmente son dos
// "tablas" distintas.

const logs: AuditLog[] = [];

export const auditRepository = {
  append(log: AuditLog): void {
    logs.push(log);
  },

  // Devuelve los logs de un activo ordenados cronológicamente
  // (del más viejo al más nuevo).
  findByAssetId(assetId: string): AuditLog[] {
    return logs
      .filter(l => l.assetId === assetId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  },

  // Solo para tests.
  _reset(): void {
    logs.length = 0;
  },
};
