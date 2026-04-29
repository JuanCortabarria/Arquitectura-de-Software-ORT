/**
 * move-gps-ingestion — Servicio de ingesta GPS (HIST-6.1).
 *
 * Sprint 0: skeleton con /health, /metrics y stub de /gps/position.
 * Sprint 2: validación de devices contra Redis cache + persistencia en
 * gps_positions + publicación a Redis Stream stream:gps.
 *
 * Requisito de aislamiento (R7/NFR-A3): este proceso debe seguir operativo
 * aunque move-api esté caído. Por eso vive en un contenedor separado y solo
 * depende de PostgreSQL y Redis.
 */
import Fastify from 'fastify';
import { register, collectDefaultMetrics } from 'prom-client';
import { z } from 'zod';

collectDefaultMetrics({ prefix: 'gps_ingestion_' });

const PORT = parseInt(process.env.PORT ?? '3001', 10);

const PositionSchema = z.object({
  deviceId: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  timestamp: z.string().datetime(),
});

async function start() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
    },
  });

  app.get('/health', async () => ({
    status: 'ok',
    service: 'move-gps-ingestion',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  }));

  app.get('/metrics', async (_req, reply) => {
    reply.header('Content-Type', register.contentType);
    return register.metrics();
  });

  app.post('/gps/position', async (request, reply) => {
    const parsed = PositionSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: 'INVALID_POSITION',
        details: parsed.error.flatten(),
      });
    }

    // Sprint 2 — HIST-6.1:
    //   1. Validar deviceId contra cache Redis registered_devices (TTL 60s)
    //   2. Persistir en gps_positions
    //   3. XADD a stream:gps
    request.log.info({ position: parsed.data }, 'gps position received (stub)');
    return reply.code(202).send({ accepted: true, sprint: 2 });
  });

  await app.listen({ host: '0.0.0.0', port: PORT });
  app.log.info(`move-gps-ingestion listening on :${PORT}`);
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
