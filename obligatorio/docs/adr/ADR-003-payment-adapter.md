# ADR-003 — Adapter Pattern para Payment Gateway + estado PENDING + reconciliación

**Estado:** Aceptada
**Fecha:** 2026-04-28
**Drivers:** FR-6c (proveedor reemplazable), NFR-M2 (≤1 sprint), NFR-A2 (resiliencia ante fallo externo), Rúbrica (caso "pasarela fuera de servicio").

## Contexto

El proveedor de pagos puede cambiar (FR-6c) y puede estar caído en cualquier momento. La rúbrica exige demostrar el flujo "pasarela fuera de servicio". El monolito no puede cancelar reservas por timeouts del gateway — debe degradar de forma controlada.

## Decisión

Definir un **port** `PaymentPort` con dos operaciones: `initiate(reservationId, amount)` y `getStatus(sessionId)`. La implementación concreta es un **adapter** intercambiable (simulado en desarrollo, real en producción) seleccionado por env var. Estados de pago: `PENDING | ACCEPTED | REJECTED`.

Cuando el gateway no responde en 3 s (circuit breaker, librería `opossum`), el sistema marca el pago como `PENDING` y un **job de reconciliación** corre cada 5 minutos consultando `getStatus()` para los pagos `PENDING` con más de 10 minutos.

## Alternativas consideradas

- **SDK del gateway directamente en el módulo de reservas**: acopla código de negocio al vendor, viola NFR-M2.
- **Webhook único sin reconciliación**: si el webhook se pierde, el pago queda inconsistente para siempre.

## Consecuencias

- ✅ Portabilidad de gateway en ≤1 sprint (basta crear un nuevo adapter).
- ✅ Resiliencia ante caída momentánea del gateway: la reserva no se cancela ni se pierde.
- ⚠️ Hay que mantener el job de reconciliación y manejar pagos `PENDING` de larga duración como caso edge.
- ⚠️ El simulador local debe exponer 4 modos (success/reject/pending/timeout) para cubrir la rúbrica.
