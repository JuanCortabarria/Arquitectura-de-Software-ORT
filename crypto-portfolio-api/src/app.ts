import express from 'express';
import assetRoutes from './routes/assetRoutes';
import marketRoutes from './routes/marketRoutes';

// Construcción del Express app.
//
// Importante: este archivo NO llama a app.listen(). Solo arma el app
// y lo exporta. Eso lo hace index.ts. ¿Por qué la separación? Porque
// los tests pueden importar este "app" sin levantar un servidor real.

const app = express();

app.use(express.json());

app.use('/assets', assetRoutes);
app.use('/market', marketRoutes);

export default app;
