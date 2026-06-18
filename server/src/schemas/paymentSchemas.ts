import { z } from 'zod';

export const updatePaymentStatusSchema = z.object({
  status: z.enum(['PENDIENTE', 'APROBADO', 'RECHAZADO'], {
    message: 'Estado inválido o requerido. Use PENDIENTE, APROBADO o RECHAZADO.',
  }),
  notes: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres.')
    .optional(),
});

export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;
