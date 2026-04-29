# ADR-004 — Redis Streams como bus de mensajes interno

**Estado:** Aceptada (sujeta a revisión post-SPK-2)
**Fecha:** 2026-04-28
**Drivers:** Desacoplamiento clasificación/ingesta GPS/notificaciones, baseline de volumen bajo (~5 msg/s GPS), simplicidad operacional.

## Contexto

Tres flujos asíncronos requieren un bus de mensajes:

1. **Clasificación** — Reservation Module publica en `classify:pending` y consume `classify:results`.
2. **Ingesta GPS** — GPS Ingestion publica en `stream:gps`; Monitoring Engine consume.
3. **Notificaciones a operadores** — Reservation Module publica en `notify:operators`; Notification Module consume.

Baseline: ~5 msg/s GPS, 100 reservas/min. Burst objetivo (NFR-8.4): hasta 50× → ~250 msg/s GPS pico. Redis ya está en el stack como cache.

## Decisión

Usar **Redis 7 Streams** con consumer groups (`XADD`, `XREADGROUP`, `XACK`). Un único Redis cubre cache + colas; cero overhead operacional adicional. Los consumers usan `BLOCK 1000` para latencia sub-segundo y `XACK` solo tras procesamiento exitoso.

## Alternativas consideradas

- **Kafka**: correcto si el volumen sostenido supera 200 msg/s. En baseline es overkill — agrega ZooKeeper/KRaft, curva de aprendizaje y ~1 sprint de setup. Se reserva como plan B (ver SPK-2).
- **RabbitMQ**: válido funcionalmente, pero Redis Streams cubre el caso y evita un componente adicional.

## Consecuencias

- ✅ Latencia sub-milisegundo, menos complejidad operacional.
- ✅ Persistencia ante reinicio del consumer (los mensajes pendientes se re-procesan).
- ⚠️ Redis no está optimizado para retención larga (>24 h) ni para volúmenes muy altos sostenidos.
- 🚨 **Riesgo R-CR / RT-2**: si SPK-2 muestra que con 2500 devices simultáneos la latencia supera 20 s, este ADR se reabre y se migra a Kafka. Impacto estimado: +1 sprint.
