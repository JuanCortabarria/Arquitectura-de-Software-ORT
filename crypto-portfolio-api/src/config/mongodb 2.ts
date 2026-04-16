import mongoose from 'mongoose';

// Conexión a MongoDB mediante Mongoose.
//
// MongoDB se usa exclusivamente para el sistema de auditoría (AuditLog).
// Los logs pueden crecer exponencialmente y no requieren una estructura
// rígida, por lo que MongoDB es ideal para esta tarea.

export async function connectMongo(): Promise<void> {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto_portfolio';
  await mongoose.connect(uri);
}
