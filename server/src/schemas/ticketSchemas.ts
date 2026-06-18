import { z } from 'zod';

export const createTicketSchema = z.object({
  title: z
    .string({ message: 'El asunto es requerido.' })
    .min(5, 'El asunto debe tener al menos 5 caracteres.')
    .max(200, 'El asunto no puede exceder 200 caracteres.'),
  description: z
    .string({ message: 'El mensaje es requerido.' })
    .min(10, 'El mensaje debe tener al menos 10 caracteres.')
    .max(5000, 'El mensaje no puede exceder 5000 caracteres.'),
  category: z
    .enum(['TECHNICAL', 'PAYMENT', 'COURSE', 'OTHER'])
    .optional()
    .default('OTHER'),
});

export const addTicketMessageSchema = z.object({
  text: z
    .string({ message: 'El mensaje es requerido.' })
    .min(1, 'El mensaje no puede estar vacío.')
    .max(5000, 'El mensaje no puede exceder 5000 caracteres.'),
  sender: z.enum(['Admin', 'Dev']),
  devName: z.string().optional().nullable(),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type AddTicketMessageInput = z.infer<typeof addTicketMessageSchema>;
