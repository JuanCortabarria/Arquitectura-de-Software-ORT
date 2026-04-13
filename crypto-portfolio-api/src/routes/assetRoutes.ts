import { Router } from 'express';
import { assetController } from '../controllers/assetController';
import { analyticsController } from '../controllers/analyticsController';
import { validate } from '../middlewares/validate';
import { updateAssetSchema } from '../schemas/asset.schema';

// Rutas del recurso "assets".
// El prefijo "/assets" se monta en app.ts.

const router = Router();

router.get('/', assetController.getAll);

// Parte 3: POST /assets/analyze va ANTES de /:id para que Express
// no confunda "analyze" con un id.
router.post('/analyze', analyticsController.analyze);

router.get('/:id', assetController.getById);

// La validación del POST /assets ahora la hace el ValidationFilter
// dentro del Ingestion Pipeline, ya no se usa el middleware validate()
// en esta ruta. Para PUT se sigue usando porque no pasa por pipeline.
router.post('/', assetController.create);
router.put('/:id', validate(updateAssetSchema), assetController.update);
router.delete('/:id', assetController.delete);

// Endpoint de la Parte 2: historial de auditoría de un activo.
router.get('/:id/history', assetController.getHistory);

export default router;
