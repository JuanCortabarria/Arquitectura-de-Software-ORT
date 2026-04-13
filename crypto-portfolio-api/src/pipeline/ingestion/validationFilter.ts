import { createAssetSchema, type CreateAssetInput } from '../../schemas/asset.schema';
import { logger } from '../../config/logger';

// ValidationFilter — primer filtro del Ingestion Pipeline.
//
// Verifica que los datos de entrada tengan la estructura correcta
// usando el esquema Zod que ya teníamos en la Parte 2. Si los datos
// no cumplen el esquema, Zod tira un ZodError con el detalle de
// cada campo inválido.
//
// Antes esto lo hacía un middleware en la ruta. Ahora vive dentro del
// pipeline para que la cadena de filtros sea completa y autocontenida.

export function validationFilter(data: unknown): CreateAssetInput {
  // .passthrough() permite que campos extra (como "currency") pasen
  // al siguiente filtro sin ser eliminados por Zod. Los campos
  // obligatorios se siguen validando igual.
  const result = createAssetSchema.passthrough().parse(data);
  logger.info('[ValidationFilter] Datos validados correctamente');
  return result as CreateAssetInput;
}
