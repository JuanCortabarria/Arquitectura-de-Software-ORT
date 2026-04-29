import { z } from 'zod';

export const updatePreferencesSchema = z.object({
  displayCurrency: z.string().min(1, 'displayCurrency no puede estar vacío').optional(),
  alertLimit: z.number().positive('alertLimit debe ser mayor a 0').optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'Debe enviar al menos una preferencia',
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
