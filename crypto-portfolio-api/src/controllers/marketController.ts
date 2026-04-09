import type { Request, Response } from 'express';
import { marketService } from '../services/marketService';
import { logger } from '../config/logger';

// Controller del endpoint de mercado.
// Igual que el assetController: solo traduce HTTP <-> service.

export const marketController = {
  async getPrice(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const result = await marketService.getPriceForAsset(id);
      res.status(200).json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';

      if (message.startsWith('NOT_FOUND')) {
        res.status(404).json({ message: message.replace('NOT_FOUND: ', '') });
        return;
      }
      if (message.startsWith('VALIDATION')) {
        res.status(400).json({ message: message.replace('VALIDATION: ', '') });
        return;
      }
      if (message.startsWith('UPSTREAM')) {
        // 502 Bad Gateway: nuestro servidor no pudo comunicarse con el
        // proveedor externo de precios.
        res.status(502).json({ message: message.replace('UPSTREAM: ', '') });
        return;
      }

      logger.error(`Error inesperado en marketController: ${message}`);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },
};
