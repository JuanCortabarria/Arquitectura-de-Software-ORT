import type { Request, Response } from 'express';
import { runPipeline } from '../pipeline/pipeline';
import { scrubbingFilter } from '../pipeline/analytics/scrubbingFilter';
import { riskAnalysisFilter } from '../pipeline/analytics/riskAnalysisFilter';
import { formattingFilter } from '../pipeline/analytics/formattingFilter';
import { logger } from '../config/logger';

// Controller para el endpoint POST /assets/analyze.
//
// Recibe un array de activos en el body y los pasa por el Analytics
// Pipeline, que limpia datos malos, marca activos de alto riesgo y
// formatea los números.

export const analyticsController = {
  async analyze(req: Request, res: Response): Promise<void> {
    try {
      const assets = req.body;

      // Validación básica: el body debe ser un array.
      if (!Array.isArray(assets)) {
        res.status(400).json({ message: 'El body debe ser un array de activos' });
        return;
      }

      const result = await runPipeline('AnalyticsPipeline', assets, [
        scrubbingFilter,
        riskAnalysisFilter,
        formattingFilter,
      ]);

      res.status(200).json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      logger.error(`Error en AnalyticsPipeline: ${message}`);
      res.status(500).json({ message: 'Error al analizar activos' });
    }
  },
};
