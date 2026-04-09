import { z } from 'zod';

// Esquemas de validación con Zod.
//
// Antes (Parte 1) validábamos manualmente con if/typeof, lo cual era
// repetitivo y propenso a olvidos. Zod permite declarar el "molde" de
// los datos una sola vez y la validación + los mensajes de error vienen
// gratis.

// Esquema para crear un activo (POST /assets):
// todos los campos son obligatorios.
export const createAssetSchema = z.object({
  symbol: z.string().min(1, 'symbol no puede estar vacío'),
  name: z.string().min(1, 'name no puede estar vacío'),
  quantity: z.number().positive('quantity debe ser mayor a 0'),
  purchasePrice: z.number().positive('purchasePrice debe ser mayor a 0'),
});

// Esquema para actualizar un activo (PUT /assets/:id):
// .partial() vuelve opcionales todos los campos del esquema anterior.
// Así el usuario puede mandar solo los que quiera modificar.
export const updateAssetSchema = createAssetSchema.partial();

// Tipos inferidos automáticamente desde los esquemas.
// Sirven para tipar req.body después de que el middleware lo valida.
export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
