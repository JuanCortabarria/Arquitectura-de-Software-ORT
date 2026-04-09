import rateLimit from 'express-rate-limit';
import { logger } from '../config/logger';

// Rate limiter para el endpoint de consulta de mercado.
//
// La consigna pide: máximo 5 peticiones por minuto por IP en /market/:id.
// Cuando se supera el límite, devuelve 429 con un mensaje JSON
// personalizado y registra una advertencia en el logger.

export const marketRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5,              // 5 peticiones por IP por ventana
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(
      `Rate limit excedido en ${req.originalUrl} para IP ${req.ip}`,
    );
    res.status(429).json({
      message: 'Demasiadas peticiones. Máximo 5 por minuto.',
    });
  },
});
