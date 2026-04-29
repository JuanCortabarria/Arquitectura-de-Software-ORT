-- Inicialización de la instancia PostgreSQL para MOVE
-- Se ejecuta una vez al crear el volumen de datos

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- pgvector se habilita cuando se implemente HIST-3.2 (búsqueda semántica)
-- CREATE EXTENSION IF NOT EXISTS vector;
