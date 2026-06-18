import { z } from 'zod';

/** Dominio permitido para el MVP */
const IPC_DOMAIN = 'ipdcompliance';

export const loginSchema = z.object({
  email: z
    .string({ message: 'El email es requerido.' })
    .email('Formato de email inválido.'),
  password: z
    .string({ message: 'La contraseña es requerida.' })
    .min(1, 'La contraseña no puede estar vacía.'),
});

export const registerSchema = z.object({
  name: z
    .string({ message: 'El nombre es requerido.' })
    .min(2, 'El nombre debe tener al menos 2 caracteres.')
    .max(100, 'El nombre no puede exceder 100 caracteres.'),
  email: z
    .string({ message: 'El email es requerido.' })
    .email('Formato de email inválido.'),
  password: z
    .string({ message: 'La contraseña es requerida.' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
    .regex(/[a-zA-Z]/, 'La contraseña debe contener al menos una letra.')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número.')
    .max(128, 'La contraseña no puede exceder 128 caracteres.'),
  role: z
    .enum(['ADMIN', 'EDITOR', 'STUDENT'])
    .optional()
    .default('STUDENT'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
