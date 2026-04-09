// Modelo de un registro de auditoría.
//
// La consigna pide un sistema de auditoría INMUTABLE: cada vez que se
// crea, actualiza o elimina un activo, queda registrado un log con el
// "qué pasó" y el "cuándo". Estos logs nunca se borran (ni siquiera
// cuando el activo asociado se elimina), así queda la trazabilidad.

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

export interface AuditLog {
  id: string;          // UUID propio del log
  assetId: string;     // ID del activo al que se refiere
  action: AuditAction; // Tipo de operación
  timestamp: Date;     // Cuándo ocurrió
}
