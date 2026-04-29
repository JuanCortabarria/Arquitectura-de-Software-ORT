-- ============================================================================
-- Migration 001 — Schema inicial MOVE
-- ============================================================================
-- Crea las 14 tablas del dominio según el modelo del SA (sección 2.5).
-- PostGIS habilitado en init.sql.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- Identity & Access
-- ----------------------------------------------------------------------------

CREATE TYPE user_type AS ENUM ('CLIENTE_PARTICULAR', 'CLIENTE_EMPRESA', 'CONDUCTOR', 'OPERADOR', 'ADMINISTRADOR');
CREATE TYPE user_status AS ENUM ('ACTIVO', 'INACTIVO');

CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       VARCHAR(255) NOT NULL UNIQUE,
    nombre      VARCHAR(255) NOT NULL,
    tipo        user_type NOT NULL DEFAULT 'CLIENTE_PARTICULAR',
    estado      user_status NOT NULL DEFAULT 'ACTIVO',
    external_id VARCHAR(255),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_tipo_estado ON users (tipo, estado);

CREATE TABLE company_profiles (
    user_id     UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    razon_social VARCHAR(255) NOT NULL,
    rut         VARCHAR(50),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE frequent_locations (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nombre      VARCHAR(255) NOT NULL,
    direccion   VARCHAR(500) NOT NULL,
    lat         DOUBLE PRECISION NOT NULL,
    lng         DOUBLE PRECISION NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_frequent_locations_company ON frequent_locations (company_id);

-- ----------------------------------------------------------------------------
-- Catalog & Rules
-- ----------------------------------------------------------------------------

CREATE TABLE categories (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre      VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE rule_type AS ENUM ('RECARGO', 'MONITOREO', 'ALERTA', 'VEHICULO_ESPECIAL');

CREATE TABLE category_rules (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id  UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    tipo         rule_type NOT NULL,
    valor        JSONB NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_category_rules_category ON category_rules (category_id);

CREATE TABLE category_examples (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id  UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    texto        TEXT NOT NULL
);

CREATE INDEX idx_category_examples_category ON category_examples (category_id);

CREATE TABLE company_product_mappings (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    producto_desc   VARCHAR(500) NOT NULL,
    category_id     UUID NOT NULL REFERENCES categories(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (company_id, producto_desc)
);

CREATE INDEX idx_company_product_mappings_company ON company_product_mappings (company_id);

-- ----------------------------------------------------------------------------
-- Fleet & Operations
-- ----------------------------------------------------------------------------

CREATE TABLE vehicles (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    matricula       VARCHAR(50) NOT NULL UNIQUE,
    tipo            VARCHAR(100) NOT NULL,
    capacidad       NUMERIC(10, 2) NOT NULL,
    gps_device_id   VARCHAR(100) UNIQUE,
    disponible      BOOLEAN NOT NULL DEFAULT TRUE,
    caracteristicas JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vehicles_disponible ON vehicles (disponible);

-- ----------------------------------------------------------------------------
-- Reservations
-- ----------------------------------------------------------------------------

CREATE TYPE reservation_status AS ENUM (
    'DRAFT',
    'PENDING_CLASSIFICATION',
    'QUOTED',
    'CONFIRMED',
    'ASSIGNED',
    'IN_TRANSIT',
    'COMPLETED',
    'CANCELLED',
    'REJECTED'
);

CREATE TABLE reservations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id       UUID NOT NULL REFERENCES users(id),
    origen          VARCHAR(500) NOT NULL,
    origen_lat      DOUBLE PRECISION,
    origen_lng      DOUBLE PRECISION,
    destino         VARCHAR(500) NOT NULL,
    destino_lat     DOUBLE PRECISION,
    destino_lng     DOUBLE PRECISION,
    fecha_programada TIMESTAMPTZ NOT NULL,
    estado          reservation_status NOT NULL DEFAULT 'DRAFT',
    costo           NUMERIC(12, 2),
    distancia_km    NUMERIC(10, 2),
    vehiculo_id     UUID REFERENCES vehicles(id),
    conductor_id    UUID REFERENCES users(id),
    metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reservations_client_estado_fecha ON reservations (client_id, estado, fecha_programada DESC);
CREATE INDEX idx_reservations_estado ON reservations (estado);

CREATE TABLE goods (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id  UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    descripcion     TEXT NOT NULL,
    valor_estimado  NUMERIC(12, 2),
    tamano          NUMERIC(10, 2),
    category_id     UUID REFERENCES categories(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_goods_reservation ON goods (reservation_id);

CREATE TYPE payment_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id  UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    monto           NUMERIC(12, 2) NOT NULL,
    estado          payment_status NOT NULL DEFAULT 'PENDING',
    session_id      VARCHAR(255),
    provider        VARCHAR(100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_reservation ON payments (reservation_id);
CREATE INDEX idx_payments_estado_created ON payments (estado, created_at);

-- ----------------------------------------------------------------------------
-- Transfers & Incidents
-- ----------------------------------------------------------------------------

CREATE TYPE transfer_status AS ENUM ('IN_TRANSIT', 'COMPLETED', 'CANCELLED');

CREATE TABLE transfers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id  UUID NOT NULL UNIQUE REFERENCES reservations(id) ON DELETE CASCADE,
    estado          transfer_status NOT NULL DEFAULT 'IN_TRANSIT',
    iniciado_en     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finalizado_en   TIMESTAMPTZ
);

CREATE INDEX idx_transfers_estado ON transfers (estado);

CREATE TABLE incidents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transfer_id     UUID NOT NULL REFERENCES transfers(id) ON DELETE CASCADE,
    conductor_id    UUID NOT NULL REFERENCES users(id),
    descripcion     TEXT NOT NULL,
    reportado_en    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_incidents_transfer ON incidents (transfer_id);

-- ----------------------------------------------------------------------------
-- Geo & Monitoring
-- ----------------------------------------------------------------------------

CREATE TYPE zone_type AS ENUM ('ROJA', 'PREFERENTE');

CREATE TABLE zones (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre      VARCHAR(255) NOT NULL,
    tipo        zone_type NOT NULL,
    poligono    GEOMETRY(Polygon, 4326) NOT NULL,
    activa      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_zones_poligono ON zones USING GIST (poligono);
CREATE INDEX idx_zones_activa ON zones (activa);

-- gps_positions: serie temporal (alta cardinalidad)
-- Particionado mensual sugerido para producción; en local mantenemos tabla simple.
CREATE TABLE gps_positions (
    id              BIGSERIAL PRIMARY KEY,
    device_id       VARCHAR(100) NOT NULL,
    lat             DOUBLE PRECISION NOT NULL,
    lng             DOUBLE PRECISION NOT NULL,
    transfer_id     UUID REFERENCES transfers(id),
    recorded_at     TIMESTAMPTZ NOT NULL,
    received_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gps_positions_device_recorded ON gps_positions (device_id, recorded_at DESC);
CREATE INDEX idx_gps_positions_transfer ON gps_positions (transfer_id) WHERE transfer_id IS NOT NULL;

CREATE TYPE alert_type AS ENUM ('ZONA_ROJA', 'DETENCION_PROLONGADA', 'DESVIO_RUTA');

CREATE TABLE alerts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transfer_id     UUID NOT NULL REFERENCES transfers(id) ON DELETE CASCADE,
    tipo            alert_type NOT NULL,
    descripcion     TEXT,
    metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
    resuelta        BOOLEAN NOT NULL DEFAULT FALSE,
    detectada_en    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alerts_transfer_resuelta ON alerts (transfer_id, resuelta);

-- ----------------------------------------------------------------------------
-- Auditoría de accesos (NFR-S1)
-- ----------------------------------------------------------------------------

CREATE TABLE access_log (
    id          BIGSERIAL PRIMARY KEY,
    event       VARCHAR(50) NOT NULL,
    user_id     UUID,
    role        VARCHAR(50),
    ip          VARCHAR(50),
    method      VARCHAR(10),
    path        VARCHAR(500),
    request_id  VARCHAR(100),
    timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_access_log_timestamp ON access_log (timestamp DESC);
CREATE INDEX idx_access_log_event ON access_log (event);

COMMIT;
