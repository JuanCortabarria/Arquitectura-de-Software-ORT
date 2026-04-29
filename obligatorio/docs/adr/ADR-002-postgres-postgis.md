# ADR-002 — PostgreSQL + PostGIS como única base de datos

**Estado:** Aceptada
**Fecha:** 2026-04-28
**Drivers:** Dominio relacional, queries geoespaciales (FR-9, FR-15), serie temporal moderada (FR-14), tamaño del equipo.

## Contexto

El dominio de MOVE es fuertemente relacional: usuarios, reservas con bienes, pagos, vehículos, conductores y traslados se relacionan entre sí. Adicionalmente se requieren queries geoespaciales (point-in-polygon sobre zonas, FR-15) y persistencia de una serie temporal moderada de posiciones GPS (FR-14, ~5 msg/s baseline).

## Decisión

**PostgreSQL 16 con extensión PostGIS** como instancia única compartida por todos los servicios. La columna `poligono` de `zones` usa `geometry(Polygon, 4326)`. La tabla `gps_positions` se diseña con índice `(device_id, recorded_at DESC)` y partición mensual recomendada para producción.

## Alternativas consideradas

- **MongoDB**: el dominio tiene joins frecuentes (reserva ↔ bienes ↔ categoría ↔ regla, transfer ↔ alertas) y exige consistencia transaccional al asignar vehículo+conductor. Emularlos en MongoDB agrega complejidad sin ganancia.
- **DB separada por servicio**: mejora aislamiento de fallos pero multiplica la operación de infraestructura para un equipo de 3 personas. Se descarta priorizando la velocidad de entrega académica.

## Consecuencias

- ✅ Consistencia transaccional fuerte donde se necesita (asignación de vehículo, FR-12).
- ✅ Point-in-polygon nativo con índice GIST.
- ✅ Una sola DB a operar, monitorear y respaldar.
- ⚠️ Si la DB cae, todos los servicios fallan. Riesgo asumido y documentado en NFR-A3. La mitigación de producción sería replicación; en el contexto académico (single-host Docker Compose) se documenta como gap conocido.
