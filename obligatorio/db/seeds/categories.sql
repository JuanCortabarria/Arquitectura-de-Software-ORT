-- ============================================================================
-- Seed: 5 categorías MOVE de demo (rúbrica F8)
-- Cada una incluye al menos una regla de comportamiento.
-- Los ejemplos son corpus mínimo — el CSV completo se carga desde el script
-- de seed del Classification Service en SPK-1.
-- ============================================================================

INSERT INTO categories (id, nombre, descripcion) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Electrónicos', 'Equipos electrónicos, computación, consumo'),
    ('22222222-2222-2222-2222-222222222222', 'Muebles', 'Mobiliario residencial y de oficina'),
    ('33333333-3333-3333-3333-333333333333', 'Documentación', 'Documentos confidenciales y administrativos'),
    ('44444444-4444-4444-4444-444444444444', 'Medicamentos', 'Productos farmacéuticos y sanitarios'),
    ('55555555-5555-5555-5555-555555555555', 'Repuestos', 'Repuestos automotrices e industriales')
ON CONFLICT (nombre) DO NOTHING;

-- Reglas de comportamiento por categoría
INSERT INTO category_rules (category_id, tipo, valor) VALUES
    ('11111111-1111-1111-1111-111111111111', 'RECARGO', '{"porcentaje": 20}'::jsonb),
    ('11111111-1111-1111-1111-111111111111', 'MONITOREO', '{"intervalo_segundos": 10}'::jsonb),
    ('22222222-2222-2222-2222-222222222222', 'VEHICULO_ESPECIAL', '{"tipo_minimo": "VAN"}'::jsonb),
    ('33333333-3333-3333-3333-333333333333', 'ALERTA', '{"zonas_evitar": ["ROJA"]}'::jsonb),
    ('44444444-4444-4444-4444-444444444444', 'RECARGO', '{"porcentaje": 15}'::jsonb),
    ('44444444-4444-4444-4444-444444444444', 'MONITOREO', '{"intervalo_segundos": 5}'::jsonb),
    ('55555555-5555-5555-5555-555555555555', 'RECARGO', '{"porcentaje": 5}'::jsonb)
ON CONFLICT DO NOTHING;

-- Ejemplos de descripciones por categoría (corpus mínimo para TF-IDF baseline)
INSERT INTO category_examples (category_id, texto) VALUES
    ('11111111-1111-1111-1111-111111111111', 'monitor de computadora'),
    ('11111111-1111-1111-1111-111111111111', 'notebook lenovo'),
    ('11111111-1111-1111-1111-111111111111', 'televisor smart 55 pulgadas'),
    ('11111111-1111-1111-1111-111111111111', 'teclado mecánico'),
    ('11111111-1111-1111-1111-111111111111', 'celular samsung'),
    ('22222222-2222-2222-2222-222222222222', 'sillón de tres plazas'),
    ('22222222-2222-2222-2222-222222222222', 'mesa de comedor de madera'),
    ('22222222-2222-2222-2222-222222222222', 'cama king size'),
    ('22222222-2222-2222-2222-222222222222', 'escritorio de oficina'),
    ('33333333-3333-3333-3333-333333333333', 'documentación legal confidencial'),
    ('33333333-3333-3333-3333-333333333333', 'expediente notarial'),
    ('33333333-3333-3333-3333-333333333333', 'archivo de contratos'),
    ('44444444-4444-4444-4444-444444444444', 'medicamentos refrigerados'),
    ('44444444-4444-4444-4444-444444444444', 'vacunas en cadena de frío'),
    ('44444444-4444-4444-4444-444444444444', 'insumos farmacéuticos'),
    ('55555555-5555-5555-5555-555555555555', 'repuesto motor de auto'),
    ('55555555-5555-5555-5555-555555555555', 'kit de filtros'),
    ('55555555-5555-5555-5555-555555555555', 'pastillas de freno')
ON CONFLICT DO NOTHING;
