import { logger } from '../config/logger';

// Pipeline Runner genérico — Patrón Pipes & Filters.
//
// ¿Qué hace? Recibe una lista de filtros y ejecuta cada uno en orden
// sobre los datos de entrada. El resultado de un filtro es la entrada
// del siguiente, como una cadena de montaje.
//
// Si un filtro lanza un error, el pipeline se detiene inmediatamente
// (fail-fast) y loguea cuál filtro falló. Si todos pasan, loguea OK
// en cada paso.
//
// ¿Por qué funciones y no clases? Porque cada filtro es una sola
// operación (validar, normalizar, etc.) que no necesita estado interno.
// Una función con nombre es más simple de leer y testear.

// Un filtro es cualquier función que recibe datos y devuelve datos
// procesados. Puede ser sync o async.
export type Filter<T> = (data: T) => T | Promise<T>;

export async function runPipeline<T>(
  name: string,
  data: T,
  filters: Filter<T>[],
): Promise<T> {
  let result = data;

  for (const filter of filters) {
    // filter.name obtiene el nombre de la función (ej: "normalizationFilter").
    const filterName = filter.name || 'AnonymousFilter';

    try {
      result = await filter(result);
      logger.info(`[${name}] ${filterName}: OK`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error(`[${name}] ${filterName}: FALLÓ — ${message}`);
      throw err; // Fail-fast: no ejecuta los filtros siguientes.
    }
  }

  return result;
}
