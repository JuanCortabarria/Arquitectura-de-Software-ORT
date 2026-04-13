import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import { assetService } from '../services/assetService';
import { logger } from '../config/logger';

// Controller de activos.
//
// Es una capa "delgada": no tiene lógica de negocio, solo:
//   1) extrae datos del request,
//   2) llama al service,
//   3) responde con el código HTTP adecuado.
//
// El manejo de errores detecta prefijos del service ('NOT_FOUND',
// 'CONFLICT', 'VALIDATION') y ZodError del pipeline de validación.

function handleError(err: unknown, res: Response): void {
  // Si el pipeline de validación tira un ZodError, devolvemos 400
  // con el detalle de cada campo inválido.
  if (err instanceof ZodError) {
    res.status(400).json({ message: 'Datos inválidos', errors: err.issues });
    return;
  }

  const message = err instanceof Error ? err.message : 'Error desconocido';

  if (message.startsWith('NOT_FOUND')) {
    res.status(404).json({ message: message.replace('NOT_FOUND: ', '') });
    return;
  }
  if (message.startsWith('CONFLICT')) {
    res.status(409).json({ message: message.replace('CONFLICT: ', '') });
    return;
  }
  if (message.startsWith('VALIDATION')) {
    res.status(400).json({ message: message.replace('VALIDATION: ', '') });
    return;
  }

  logger.error(`Error inesperado: ${message}`);
  res.status(500).json({ message: 'Error interno del servidor' });
}

export const assetController = {
  getAll(_req: Request, res: Response): void {
    res.status(200).json(assetService.getAll());
  },

  getById(req: Request, res: Response): void {
    try {
      const id = String(req.params.id);
      const asset = assetService.getById(id);
      res.status(200).json(asset);
    } catch (err) {
      handleError(err, res);
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      // create() ahora es async porque usa el Ingestion Pipeline.
      const asset = await assetService.create(req.body);
      logger.info(`Activo creado: ${asset.id} (${asset.symbol})`);
      res.status(201).json(asset);
    } catch (err) {
      handleError(err, res);
    }
  },

  update(req: Request, res: Response): void {
    try {
      const id = String(req.params.id);
      const asset = assetService.update(id, req.body);
      logger.info(`Activo actualizado: ${asset.id}`);
      res.status(200).json(asset);
    } catch (err) {
      handleError(err, res);
    }
  },

  delete(req: Request, res: Response): void {
    try {
      const id = String(req.params.id);
      assetService.delete(id);
      logger.info(`Activo eliminado: ${id}`);
      res.status(204).send();
    } catch (err) {
      handleError(err, res);
    }
  },

  getHistory(req: Request, res: Response): void {
    const id = String(req.params.id);
    const history = assetService.getHistory(id);
    res.status(200).json(history);
  },
};
