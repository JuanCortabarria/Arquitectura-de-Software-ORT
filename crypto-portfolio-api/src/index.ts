import 'dotenv/config';
import app from './app';
import { logger } from './config/logger';
import { sequelize } from './config/database';
import { connectMongo } from './config/mongodb';

// Punto de entrada del servidor.
//
// A partir de la Parte 4, el arranque es async: primero conectamos a
// MySQL y MongoDB, y solo si ambas conexiones son exitosas levantamos
// el servidor HTTP.
//
// sequelize.sync() crea las tablas automáticamente si no existen
// (equivale a ejecutar las migraciones definidas en src/migrations/).

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
    logger.info('MongoDB conectado correctamente');

    // 4. Levantar el servidor HTTP
    app.listen(PORT, () => {
      logger.info(`Servidor corriendo en http://localhost:${PORT}`);
      logger.info(`API externa: ${CRYPTO_API_URL}`);
    });
  } catch (error) {
    logger.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

bootstrap();
