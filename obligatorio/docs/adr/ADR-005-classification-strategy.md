# ADR-005 — Estrategia de clasificación intercambiable (Strategy Pattern + env var)

**Estado:** Aceptada — pendiente actualización post-SPK-1
**Fecha:** 2026-04-28
**Drivers:** R10 (comparar 3 estrategias), NFR-M3 (intercambiable plugin-like), NFR-1.3 (p95 ≤ 10 s), aislamiento del monolito.

## Contexto

R10 exige **evaluar y comparar** tres estrategias para inferir la categoría MOVE de la descripción libre del bien:

1. TF-IDF + cosine similarity (línea base, determinista, <100 ms).
2. Embeddings semánticos (sentence-transformers + pgvector, <500 ms).
3. IA generativa local (Ollama, 2-8 s).

La arquitectura debe permitir **intercambiar la estrategia activa sin tocar el monolito** y exponer el mismo contrato externo en todos los casos.

## Decisión

`Classification Service` (Python/FastAPI) expone un único endpoint `POST /classify` con contrato fijo:

```json
{ "descriptions": ["..."] } → { "results": [{ "description", "category", "confidence", "strategy_used" }] }
```

Internamente una `ClassifierFactory` elige la implementación según la env var `CLASSIFICATION_STRATEGY` (`tfidf | semantic | ollama`). Las tres clases implementan la interfaz `BaseClassifier`. El monolito siempre llama al mismo HTTP y no conoce qué estrategia se usó.

La comparación R10 se ejecuta con un script `evaluate_classifier.py` que itera las tres estrategias sobre el corpus del CSV de F8 y emite tabla con `accuracy@1`, latencia p50/p95 y complejidad de setup. La estrategia ganadora se documenta en este ADR (sección "Resultado") y se fija como default vía `.env.example`.

## Alternativas consideradas

- **Tres servicios separados** (uno por estrategia): triplica el overhead operacional sin beneficio para R10.
- **Condicionales en el monolito**: viola el aislamiento — un bug en la estrategia tiraría todo el flujo de reservas.

## Consecuencias

- ✅ Comparación reproducible cambiando una env var y corriendo el mismo script.
- ✅ La defensa puede mostrar las tres estrategias en vivo en menos de 1 minuto de cambio de configuración.
- ⚠️ El servicio Python carga las tres dependencias (scikit-learn, sentence-transformers, ollama-client) aunque solo use una en producción. Aceptable en contexto académico.
- 🚨 **Riesgo R-SC / RT-1**: si SPK-1 muestra que ninguna estrategia supera el 70% de accuracy, el flujo de particulares debe rediseñarse hacia ingreso semi-estructurado.

## Resultado (pendiente)

Por completar al cierre de SPK-1 (Sprint 0). Tabla esperada:

| Estrategia | Accuracy@1 | Latencia p50 | Latencia p95 | Setup | Recomendación |
|------------|-----------:|-------------:|-------------:|-------|---------------|
| TF-IDF | TBD | TBD | TBD | Baja | TBD |
| Semántica | TBD | TBD | TBD | Media | TBD |
| Ollama | TBD | TBD | TBD | Alta | TBD |
