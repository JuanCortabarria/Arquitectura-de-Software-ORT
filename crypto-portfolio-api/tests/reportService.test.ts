const mockReportQueueAdd = jest.fn();
const mockRedisGet = jest.fn();
const mockRedisIncr = jest.fn();

jest.mock('../src/queues/reportQueue', () => ({
  reportQueue: {
    add: mockReportQueueAdd,
    on: jest.fn(),
    close: jest.fn(),
  },
}));

jest.mock('../src/config/redis', () => ({
  redisClient: {
    get: mockRedisGet,
    incr: mockRedisIncr,
  },
  safeRedisOperation: jest.fn(async (operation: () => Promise<unknown>) => operation()),
}));

import { reportService } from '../src/services/reportService';

describe('reportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('enqueueReport agrega un job a report-queue y devuelve estado queued', async () => {
    mockReportQueueAdd.mockResolvedValueOnce({ id: 'job-1' });

    const result = await reportService.enqueueReport();

    expect(mockReportQueueAdd).toHaveBeenCalledWith(
      'generate-report',
      expect.objectContaining({
        reportId: result.reportId,
        requestedAt: expect.any(String),
      }),
      expect.objectContaining({
        attempts: 3,
      }),
    );
    expect(result).toEqual({
      message: 'Reporte encolado correctamente',
      jobId: 'job-1',
      reportId: expect.any(String),
      status: 'queued',
    });
  });

  it('getStats lee el contador de reportes completados', async () => {
    mockRedisGet.mockResolvedValueOnce('7');

    await expect(reportService.getStats()).resolves.toEqual({
      completedReports: 7,
    });
  });

  it('incrementCompletedReports usa INCR para atomicidad', async () => {
    mockRedisIncr.mockResolvedValueOnce(8);

    await reportService.incrementCompletedReports();

    expect(mockRedisIncr).toHaveBeenCalledWith('reports:completed:total');
  });
});
