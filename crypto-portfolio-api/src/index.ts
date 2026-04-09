import app from './app';
import { logger } from './config/logger';

// Punto de entrada del servidor.
// Este archivo es intencionalmente cortísimo: la única responsabilidad
// es arrancar el servidor en el puerto configurado. Todo lo demás (rutas,
// middlewares, etc.) está armado en app.ts.

const PORT = process.env.PORT || 3000;
const CRYPTO_API_URL = process.env.CRYPTO_API_URL;

app.listen(PORT, () => {
  logger.info(`Servidor corriendo en http://localhost:${PORT}`);
  logger.info(`API externa: ${CRYPTO_API_URL}`);
});
