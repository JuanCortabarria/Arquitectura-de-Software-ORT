import Queue from 'bull';
import { logger } from '../config/logger';

export interface ReportJobData {
  reportId: string;
  requestedAt: string;
}

export interface ReportJobResult {
  reportId: string;
  assetCount: number;
  totalInvested: number;
}

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const reportQueue = new Queue<ReportJobData>('report-queue', redisUrl);

reportQueue.on('completed', (job, result: ReportJobResult) => {
  const reportId = result?.reportId ?? 'unknown';
  logger.info(`Reporte completado: job=${job.id}, reportId=${reportId}`);
});

reportQueue.on('failed', (job, error) => {
  const jobId = job?.id ?? 'unknown';
  logger.error(`Reporte fallido: job=${jobId}, error=${error.message}`);
});

export async function closeReportQueue(): Promise<void> {
  await reportQueue.close();
  logger.info('Cola report-queue cerrada correctamente');
}
