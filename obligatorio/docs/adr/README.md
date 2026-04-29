# Architectural Decision Records — MOVE

Cada decisión arquitectónica significativa se documenta como un ADR siguiendo el template de la cátedra.

| ADR | Título | Estado |
|-----|--------|--------|
| [ADR-001](./ADR-001-modular-monolith.md) | Modular Monolith + dos servicios satélite | Aceptada |
| [ADR-002](./ADR-002-postgres-postgis.md) | PostgreSQL + PostGIS como única base de datos | Aceptada |
| [ADR-003](./ADR-003-payment-adapter.md) | Adapter Pattern para Payment Gateway + reconciliación | Aceptada |
| [ADR-004](./ADR-004-redis-streams.md) | Redis Streams como bus de mensajes interno | Aceptada |
| [ADR-005](./ADR-005-classification-strategy.md) | Estrategia de clasificación intercambiable (Strategy + env var) | Aceptada — pendiente actualización post-SPK-1 |

## Cuándo crear un ADR

Una decisión amerita ADR cuando es **significativa** (impacta atributos de calidad o estructura), **costosa de revertir** y/o **debatida** (hubo alternativas reales). Todo ADR documenta: contexto, decisión, alternativas consideradas y consecuencias.
