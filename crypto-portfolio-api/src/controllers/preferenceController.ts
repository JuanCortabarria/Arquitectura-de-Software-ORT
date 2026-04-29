import type { Request, Response } from 'express';
import { preferenceService } from '../services/preferenceService';
import { logger } from '../config/logger';

function handleError(err: unknown, res: Response): void {
  const message = err instanceof Error ? err.message : 'Error desconocido';
  logger.error(`Error en preferencias: ${message}`);
  res.status(500).json({ message: 'Error interno del servidor' });
}

export const preferenceController = {
  async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = String(req.params.userId);
      const preferences = await preferenceService.update(userId, req.body);
      res.status(200).json(preferences);
    } catch (err) {
      handleError(err, res);
    }
  },

  async get(req: Request, res: Response): Promise<void> {
    try {
      const userId = String(req.params.userId);
      const preferences = await preferenceService.get(userId);
      res.status(200).json(preferences);
    } catch (err) {
      handleError(err, res);
    }
  },
};
