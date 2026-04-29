import { v4 as uuidv4 } from 'uuid';
import { reportQueue } from '../queues/reportQueue';
import { redisClient, safeRedisOperation } from '../config/redis';

const COMPLETED_REPORTS_COUNTER_KEY = 'reports:completed:total';
const REPORT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 1000,
  },
  removeOnComplete: 100,
  removeOnFail: 50,
};

export interface EnqueuedReport {
  message: string;
  jobId: string | number;
  reportId: string;
  status: 'queued';
}

export const reportService = {
  async enqueueReport(): Promise<EnqueuedReport> {
    const reportId = uuidv4();
    const job = await reportQueue.add('generate-report', {
      reportId,
      requestedAt: new Date().toISOString(),
    }, REPORT_JOB_OPTIONS);

    return {
      message: 'Reporte encolado correctamente',
      jobId: job.id,
      reportId,
      status: 'queued',
    };
  },

  async getStats(): Promise<{ completedReports: number }> {
    const value = await safeRedisOperation(
      () => redisClient.get(COMPLETED_REPORTS_COUNTER_KEY),
      '0',
      'leer contador de reportes completados',
    );

    return {
      completedReports: Number.parseInt(value ?? '0', 10) || 0,
    };
  },

  async incrementCompletedReports(): Promise<void> {
    await safeRedisOperation(
      () => redisClient.incr(COMPLETED_REPORTS_COUNTER_KEY),
      0,
      'incrementar contador de reportes completados',
    );
  },
};
