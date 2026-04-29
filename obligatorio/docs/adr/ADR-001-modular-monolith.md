# ADR-001 — Modular Monolith + dos servicios satélite

**Estado:** Aceptada
**Fecha:** 2026-04-28
**Drivers:** R7 (aislamiento de fallos F2-F6 / F13-F15), R10 (intercambiabilidad IA), tamaño del equipo (3 personas), timeline (2 meses).

## Contexto

El sistema MOVE tiene ~20 funcionalidades y tres SLOs distintos sobre el mismo núcleo (clasificación empresa frecuente <600 ms, empresa no frecuente <1000 ms, particular IA <10 s). El requisito R7 obliga a aislar el grupo F2-F6 (reservas/pagos) y el F13-F15 (GPS) frente a fallos del resto. R10 pide tres estrategias intercambiables de clasificación IA. El equipo de 3 personas debe entregar en 2 meses.

## Decisión

Adoptar **modular monolith** en NestJS para el núcleo de negocio (Reservation, Operations, Admin, Notification, Auth) y extraer dos satélites en contenedores Docker independientes:

- **Classification Service** (Python/FastAPI) — única ruta hacia las tres estrategias R10.
- **GPS Pipeline** (Node/Fastify para ingesta, Node para Monitoring Engine) — debe seguir operando ante caída del monolito (R7).

Internamente cada módulo del monolito sigue **hexagonal/ports-and-adapters**: la lógica de dominio no depende de Express, TypeORM ni proveedor externo. Esto habilita NFR-M2 (Payment reemplazable en ≤1 sprint) y NFR-M3 (estrategia IA intercambiable).

## Alternativas consideradas

- **Microservicios completos (7-8 servicios)**: overhead de contratos distribuidos, consistencia eventual y debugging cross-service inviable para 3 personas en 2 meses.
- **Monolito sin separación**: no cumple R7 (un crash del módulo de reservas tira el GPS) ni habilita la comparación R10 sin hacks.

## Consecuencias

- ✅ Velocidad de desarrollo, un solo CI/CD para el monolito, aislamiento físico donde el requisito lo exige.
- ✅ Las tres rutas paralelas (EP-2/4/5, EP-3, EP-6) pueden avanzar sin bloqueo cruzado.
- ⚠️ Sin escalabilidad granular por módulo del monolito.
- ⚠️ La frontera entre módulos depende de disciplina del equipo (no hay límite de red que la imponga). Se mitiga con paquetización clara y revisiones de PR.
