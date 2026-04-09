import { Router } from 'express';
import { marketController } from '../controllers/marketController';
import { marketRateLimiter } from '../middlewares/rateLimiter';

// Rutas del recurso "market".
// El rate limiter se aplica SOLO a esta ruta, no a las de /assets.
// El prefijo "/market" se monta en app.ts.

const router = Router();

router.get('/:id', marketRateLimiter, marketController.getPrice);

export default router;
