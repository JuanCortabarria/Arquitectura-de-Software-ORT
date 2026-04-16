import mongoose, { Schema } from 'mongoose';
import type { AuditLog } from './auditLog';

// Schema Mongoose para el sistema de auditoría (AuditLog).
//
// MongoDB es ideal para este caso porque los logs de auditoría:
//   - Crecen exponencialmente (append-only).
//   - No requieren una estructura rígida.
//   - No necesitan relaciones complejas con otras entidades.
//
// El campo assetId está indexado porque findByAssetId() es la consulta
// más frecuente sobre esta colección.

const auditLogSchema = new Schema<AuditLog>(
  {
    id: { type: String, required: true, unique: true },
    assetId: { type: String, required: true, index: true },
    action: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE'],
      required: true,
    },
    timestamp: { type: Date, required: true },
  },
  {
    // Desactivamos el _id autogenerado de Mongo; usamos nuestro UUID.
    _id: false,
    // No necesitamos createdAt/updatedAt de Mongoose.
    timestamps: false,
  },
);

export const AuditLogModel = mongoose.model<AuditLog>('AuditLog', auditLogSchema);
