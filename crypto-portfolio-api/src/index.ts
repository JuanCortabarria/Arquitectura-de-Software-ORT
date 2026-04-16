import 'dotenv/config';
import app from './app';
import { logger } from './config/logger';
import { sequelize } from './config/database';
import { connectMongo, disconnectMongo } from './config/mongodb';

// Punto de entrada del servidor.
//
// A partir de la Parte 4, el arranque es async: primero conectamos a
// MySQL y MongoDB, y solo si ambas conexiones son exitosas levantamos
// el servidor HTTP.
//
// sequelize.sync() crea las tablas automáticamente si no existen
// (equivale a ejecutar las migraciones definidas en src/migrations/).
//
// NUEVO: Se implementó graceful shutdown para cerrar las conexiones
// de forma limpia ante SIGTERM/SIGINT (señales de parada).

const PORT = process.env.PORT || 3000;
const CRYPTO_API_URL = process.env.CRYPTO_API_URL;

async function bootstrap(): Promise<void> {
  try {
    // 1. Conectar a MySQL
    await sequelize.authenticate();
    logger.info('MySQL conectado correctamente');

    // 2. Sincronizar modelos (crea tablas si no existen)
    await sequelize.sync();
    logger.info('Modelos de Sequelize sincronizados');

    // 3. Conectar a MongoDB
    await connectMongo();

    // 4. Levantar el servidor HTTP
    const server = app.listen(PORT, () => {
      logger.info(`Servidor corriendo en http://localhost:${PORT}`);
      logger.info(`API externa: ${CRYPTO_API_URL}`);
    });

    // 5. Graceful shutdown: detectar SIGTERM e SIGINT
    const shutdown = async (signal: string) => {
      logger.info(`Señal ${signal} recibida, iniciando graceful shutdown...`);

      server.close(async () => {
        logger.info('Servidor HTTP cerrado');

        try {
          // Cerrar conexión a MongoDB
          await disconnectMongo();

          // Cerrar conexión a MySQL
          await sequelize.close();
          logger.info('Conexiones a bases de datos cerradas');

          logger.info('Graceful shutdown completado');
          process.exit(0);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          logger.error(`Error durante graceful shutdown: ${message}`);
          process.exit(1);
        }
      });
    };

    // Registrar handlers para SIGTERM (Docker stop) y SIGINT (Ctrl+C)
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

bootstrap();
