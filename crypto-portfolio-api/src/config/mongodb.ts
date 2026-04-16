import mongoose from 'mongoose';
import { logger } from './logger';

// Conexión a MongoDB mediante Mongoose.
//
// MongoDB se usa exclusivamente para el sistema de auditoría (AuditLog).
// Los logs pueden crecer exponencialmente y no requieren una estructura
// rígida, por lo que MongoDB es ideal para esta tarea.
//
// A partir de la Parte 4, agregamos:
//   - Opciones de timeout y retries para resiliencia
//   - Manejo de errores con logging
//   - Desconexión limpia

export async function connectMongo(): Promise<void> {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto_portfolio';

  try {
    await mongoose.connect(uri, {
      // Timeouts y retries para conexiones lentas o transitorias
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      // Sincronizar automáticamente schémas con MongoDB
      autoCreate: true,
      autoIndex: true,
    });

    logger.info('MongoDB conectado correctamente');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Error al conectar a MongoDB: ${message}`);
    throw error;
  }
}

// Desconexión limpia para graceful shutdown
export async function disconnectMongo(): Promise<void> {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB desconectado correctamente');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Error al desconectar de MongoDB: ${message}`);
  }
}
