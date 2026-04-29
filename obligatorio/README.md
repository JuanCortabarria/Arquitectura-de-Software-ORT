# MOVE — Plataforma de Traslados Urbanos

Solución para el Obligatorio de Arquitectura de Software (ORT, 2026).

## Arquitectura

Modular monolith (NestJS) + dos servicios satélite (Classification en Python/FastAPI, GPS pipeline en Node/Fastify) + Monitoring Engine. PostgreSQL+PostGIS como base única, Redis 7 como cache + bus de mensajes (Streams).

Ver `docs/adr/` para el detalle de cada decisión arquitectónica.

## Servicios

| Contenedor | Stack | Puerto | Responsabilidad |
|---|---|---|---|
| `move-api` | NestJS | 3000 | Monolito: Reservation + Operations + Admin + Notification + Auth |
| `move-classification` | FastAPI | 8001 | Clasificación IA (3 estrategias intercambiables vía env var) |
| `move-gps-ingestion` | Fastify | 3001 | Ingesta GPS, validación de devices, publicación a Redis Stream |
| `move-monitoring` | Node | 3002 | Evaluación de zonas, detección de alertas, WebSocket al Operador |
| `move-geo-ui` | Nginx + Leaflet | 8080 | Frontend geográfico (panel de zonas + dashboard de traslados) |
| `postgres` | postgres:16 + PostGIS | 5432 | Base de datos única |
| `redis` | redis:7-alpine | 6379 | Cache + Streams |
| `prometheus` | prometheus | 9090 | Métricas |
| `grafana` | grafana | 3003 | Dashboards |

## Setup local

Requisitos: Docker Desktop, Node 20+, Python 3.11+ (opcional para desarrollo).

```bash
# 1. Copiar variables de entorno
cp .env.example .env

# 2. Levantar todos los servicios
docker compose up -d

# 3. Verificar healthchecks
docker compose ps

# 4. Aplicar seed de categorías (cuando los servicios estén healthy)
docker compose exec move-api npm run seed

# 5. Probar los endpoints de salud
curl http://localhost:3000/health     # move-api
curl http://localhost:8001/health     # classification
curl http://localhost:3001/health     # gps-ingestion
curl http://localhost:3002/health     # monitoring
```

## Estructura del repo

```
obligatorio/
├── docker-compose.yml          # Orquestación de los 10 servicios
├── .env.example                # Variables de entorno documentadas
├── docs/adr/                   # Architectural Decision Records
├── db/
│   ├── migrations/             # Schema versionado
│   └── seeds/                  # Datos iniciales (categorías MOVE)
├── infra/
│   ├── postgres/               # init.sql con PostGIS
│   ├── prometheus/
│   └── grafana/
├── services/
│   ├── move-api/               # Monolito NestJS
│   ├── move-classification/    # FastAPI + TF-IDF/semantic/ollama
│   ├── move-gps-ingestion/     # Fastify
│   └── move-monitoring/        # Node + WebSocket
├── frontend/move-geo-ui/       # Nginx + Leaflet
└── scripts/
    └── gps-simulator/          # Simulador de devices GPS
```

## Estado actual (Sprint 0)

- [x] HIST-1.1 — Docker Compose + estructura de servicios
- [x] HIST-1.2 — Schema inicial DB + seed de categorías (parcial)
- [x] HIST-1.3 — Pipeline CI básico
- [ ] SPK-1, SPK-2, SPK-3, SPK-4 — pendientes

## Defensa funcional

La colección Postman se generará en `/postman/` durante el Sprint 4. El video demo se entrega antes del 02/07/2026.

## Licencia

Trabajo académico — Universidad ORT Uruguay, 2026.
