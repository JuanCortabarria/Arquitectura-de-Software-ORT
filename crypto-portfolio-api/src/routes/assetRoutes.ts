import { Router } from 'express';
import { assetController } from '../controllers/assetController';
import { validate } from '../middlewares/validate';
import { createAssetSchema, updateAssetSchema } from '../schemas/asset.schema';

// Rutas del recurso "assets".
// El prefijo "/assets" se monta en app.ts.

const router = Router();

router.get('/', assetController.getAll);
router.get('/:id', assetController.getById);
router.post('/', validate(createAssetSchema), assetController.create);
router.put('/:id', validate(updateAssetSchema), assetController.update);
router.delete('/:id', assetController.delete);

// Endpoint nuevo de la Parte 2: historial de auditoría de un activo.
router.get('/:id/history', assetController.getHistory);

export default router;
