jest.mock('../src/services/reportService', () => ({
  reportService: {
    incrementCompletedReports: jest.fn(),
  },
}));

import { assetService } from '../src/services/assetService';
import { assetRepository } from '../src/repositories/assetRepository';
import { auditRepository } from '../src/repositories/auditRepository';
import { generateReport } from '../src/services/reportGeneratorService';
import { reportService } from '../src/services/reportService';

describe('reportGeneratorService', () => {
  beforeEach(async () => {
    await assetRepository._reset();
    await auditRepository._reset();
    jest.clearAllMocks();
  });

  it('genera auditoría REPORT_GENERATED con metadata del portafolio', async () => {
    await assetService.create({
      symbol: 'BTC',
      name: 'Bitcoin',
      quantity: 2,
      purchasePrice: 50000,
    });
    await assetService.create({
      symbol: 'ETH',
      name: 'Ethereum',
      quantity: 3,
      purchasePrice: 3000,
    });

    const result = await generateReport({
      reportId: 'report-1',
      requestedAt: '2026-04-29T00:00:00.000Z',
    });

    const history = await auditRepository.findByAssetId('GLOBAL');
    expect(result).toEqual({
      reportId: 'report-1',
      assetCount: 2,
      totalInvested: 109000,
    });
    expect(history).toHaveLength(1);
    expect(history[0]!.action).toBe('REPORT_GENERATED');
    expect(history[0]!.metadata).toMatchObject({
      reportId: 'report-1',
      assetCount: 2,
      totalInvested: 109000,
    });
    expect(reportService.incrementCompletedReports).toHaveBeenCalledTimes(1);
  });
});
