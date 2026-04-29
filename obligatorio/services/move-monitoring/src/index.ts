/**
 * move-monitoring — Monitoring Engine (HIST-6.2 / 6.3 / 6.4).
 *
 * Sprint 0: skeleton con /health, /metrics y placeholders de los componentes
 *   (cache de zonas, consumer del stream:gps, WebSocket al Operador).
 * Sprint 3-4: implementación completa.
 *
 * NFR-3 — alertas p95 < 5 s end-to-end. La estrategia es mantener el cache
 * de zonas en RAM y suscribirse a Redis Pub/Sub `zones:updated` para
 * invalidación. PostGIS solo se consulta al inicio.
 */
import Fastify from 'fastify';
import { register, collectDefaultMetrics } from 'prom-client';

collectDefaultMetrics({ prefix: 'monitoring_' });

const PORT = parseInt(process.env.PORT ?? '3002', 10);

async function start() {
  const app = Fastify({
    logger: { level: process.env.LOG_LEVEL ?? 'info' },
  });

  app.get('/health', async () => ({
    status: 'ok',
    service: 'move-monitoring',
    version: '0.1.0',
    zonesLoaded: 0, // placeholder hasta HIST-6.2
    timestamp: new Date().toISOString(),
  }));

  app.get('/metrics', async (_req, reply) => {
    reply.header('Content-Type', register.contentType);
    return register.metrics();
  });

  await app.listen({ host: '0.0.0.0', port: PORT });
  app.log.info(`move-monitoring listening on :${PORT}`);

  // Sprint 3 — HIST-6.2:
  //   const zonesCache = await loadZonesFromPostgres();
  //   subscribeRedis('zones:updated', () => reloadZones(zonesCache));
  //   const consumer = createGpsStreamConsumer({ zonesCache });
  //   consumer.on('alert', emitToOperators);
  //   const wss = new WebSocketServer({ port: 3002 + 100, ... });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
