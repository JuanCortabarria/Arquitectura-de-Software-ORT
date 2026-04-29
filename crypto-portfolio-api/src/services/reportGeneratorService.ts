import { v4 as uuidv4 } from 'uuid';
import { assetRepository } from '../repositories/assetRepository';
import { auditRepository } from '../repositories/auditRepository';
import type { ReportJobData, ReportJobResult } from '../queues/reportQueue';
import { reportService } from './reportService';

const DEFAULT_REPORT_GENERATION_DELAY_MS = 1500;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

function getReportGenerationDelayMs(): number {
  const configured = Number(process.env.REPORT_GENERATION_DELAY_MS);
  return Number.isFinite(configured) && configured >= 0
    ? configured
    : DEFAULT_REPORT_GENERATION_DELAY_MS;
}

export async function generateReport(data: ReportJobData): Promise<ReportJobResult> {
  const assets = await assetRepository.findAll();
  await sleep(getReportGenerationDelayMs());

  let totalInvested = 0;
  let largestPosition: { symbol: string; invested: number } | null = null;

  for (const asset of assets) {
    const invested = asset.quantity * asset.purchasePrice;
    totalInvested += invested;

    if (!largestPosition || invested > largestPosition.invested) {
      largestPosition = {
        symbol: asset.symbol,
        invested,
      };
    }
  }

  await auditRepository.append({
    id: uuidv4(),
    assetId: 'GLOBAL',
    action: 'REPORT_GENERATED',
    timestamp: new Date(),
    metadata: {
      reportId: data.reportId,
      requestedAt: data.requestedAt,
      assetCount: assets.length,
      totalInvested,
      largestPosition,
    },
  });

  await reportService.incrementCompletedReports();

  return {
    reportId: data.reportId,
    assetCount: assets.length,
    totalInvested,
  };
}
