import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

// Middleware genérico de validación con Zod.
//
// Recibe un esquema y devuelve un middleware que:
//   1) intenta parsear el body con ese esquema,
//   2) si falla, responde 400 con los detalles del error,
//   3) si pasa, reemplaza req.body por la versión "limpia" y llama a next().
//
// Se usa así desde una ruta:
//   router.post('/', validate(createAssetSchema), controller.create)

export const validate = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        message: 'Datos inválidos',
        errors: result.error.issues, // detalle de cada campo inválido
      });
      return;
    }

    req.body = result.data;
    next();
  };
