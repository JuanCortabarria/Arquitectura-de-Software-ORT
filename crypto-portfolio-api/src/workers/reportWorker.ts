import 'dotenv/config';
import { sequelize } from '../config/database';
import { connectMongo, disconnectMongo } from '../config/mongodb';
import { connectRedis, disconnectRedis } from '../config/redis';
import { logger } from '../config/logger';
import { closeReportQueue, reportQueue } from '../queues/reportQueue';
import { generateReport } from '../services/reportGeneratorService';

async function bootstrapWorker(): Promise<void> {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await connectMongo();
    await connectRedis();

    reportQueue.process('generate-report', async job => {
      logger.info(`Procesando reporte: job=${job.id}, reportId=${job.data.reportId}`);
      return generateReport(job.data);
    });

    logger.info('Worker de reportes escuchando report-queue');

    const shutdown = async (signal: string) => {
      logger.info(`Señal ${signal} recibida en worker, cerrando...`);

      try {
        await closeReportQueue();
        await disconnectRedis();
        await disconnectMongo();
        await sequelize.close();
        logger.info('Worker cerrado correctamente');
        process.exit(0);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`Error al cerrar worker: ${message}`);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Error al iniciar worker de reportes: ${message}`);
    process.exit(1);
  }
}

bootstrapWorker();
